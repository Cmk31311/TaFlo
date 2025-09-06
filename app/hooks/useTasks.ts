'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useUser } from './useUser';
import { Task, TaskFilter, TaskSort, Category, Priority } from '../../lib/types';

export function useTasks(filter?: TaskFilter, sort?: TaskSort) {
  const user = useUser();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('tasks')
        .select(`
          *,
          category:categories(*),
          priority:priorities(*),
          subtasks:tasks!parent_task_id(*),
          time_entries:task_time_entries(*),
          comments:task_comments(*)
        `)
        .eq('user_id', user.id)
        .is('parent_task_id', null); // Only get parent tasks, subtasks will be included

      // Apply filters
      if (filter) {
        if (filter.search) {
          query = query.or(`title.ilike.%${filter.search}%,description.ilike.%${filter.search}%`);
        }
        if (filter.category_id) {
          query = query.eq('category_id', filter.category_id);
        }
        if (filter.priority_id) {
          query = query.eq('priority_id', filter.priority_id);
        }
        if (filter.is_done !== undefined) {
          query = query.eq('is_done', filter.is_done);
        }
        if (filter.due_date_from) {
          query = query.gte('due_date', filter.due_date_from);
        }
        if (filter.due_date_to) {
          query = query.lte('due_date', filter.due_date_to);
        }
        if (filter.tags && filter.tags.length > 0) {
          query = query.overlaps('tags', filter.tags);
        }
        if (filter.has_attachments) {
          query = query.not('attachments', 'eq', '[]');
        }
        if (filter.is_overdue) {
          const now = new Date().toISOString();
          query = query.lt('due_date', now).eq('is_done', false);
        }
      }

      // Apply sorting
      if (sort) {
        query = query.order(sort.field, { ascending: sort.direction === 'asc' });
      } else {
        query = query.order('position', { ascending: true }).order('created_at', { ascending: false });
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      setTasks(data as Task[] || []);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [user, filter, sort]);

  const addTask = useCallback(async (taskData: Partial<Task>) => {
    if (!user) {
      console.log('No user found');
      return null;
    }

    console.log('Adding task:', taskData);

    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          user_id: user.id,
          position: tasks.length,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Task added successfully:', data);
      await loadTasks();
      return data;
    } catch (err) {
      console.error('Error adding task:', err);
      setError(err instanceof Error ? err.message : 'Failed to add task');
      return null;
    }
  }, [user, tasks.length, loadTasks]);

  const updateTask = useCallback(async (id: number, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await loadTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  }, [loadTasks]);

  const deleteTask = useCallback(async (id: number) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  }, [loadTasks]);

  const toggleTask = useCallback(async (id: number, current: boolean) => {
    await updateTask(id, { is_done: !current });
  }, [updateTask]);

  const reorderTasks = useCallback(async (taskIds: number[]) => {
    try {
      const updates = taskIds.map((id, index) => ({
        id,
        position: index,
      }));

      for (const update of updates) {
        await supabase
          .from('tasks')
          .update({ position: update.position })
          .eq('id', update.id);
      }

      await loadTasks();
    } catch (err) {
      console.error('Error reordering tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to reorder tasks');
    }
  }, [loadTasks]);

  const duplicateTask = useCallback(async (task: Task) => {
    const { id, created_at, updated_at, completed_at, ...taskData } = task;
    return await addTask({
      ...taskData,
      title: `${task.title} (Copy)`,
      is_done: false,
      completed_at: undefined,
    });
  }, [addTask]);

  // Computed values
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.is_done).length;
    const overdue = tasks.filter(t => 
      t.due_date && 
      new Date(t.due_date) < new Date() && 
      !t.is_done
    ).length;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      overdue,
      completionRate,
      remaining: total - completed,
    };
  }, [tasks]);

  const tasksByCategory = useMemo(() => {
    const grouped: { [key: string]: Task[] } = {};
    tasks.forEach(task => {
      const categoryName = task.category?.name || 'Uncategorized';
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
      }
      grouped[categoryName].push(task);
    });
    return grouped;
  }, [tasks]);

  const tasksByPriority = useMemo(() => {
    const grouped: { [key: string]: Task[] } = {};
    tasks.forEach(task => {
      const priorityName = task.priority?.name || 'No Priority';
      if (!grouped[priorityName]) {
        grouped[priorityName] = [];
      }
      grouped[priorityName].push(task);
    });
    return grouped;
  }, [tasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks,
    loading,
    error,
    stats,
    tasksByCategory,
    tasksByPriority,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    reorderTasks,
    duplicateTask,
    refresh: loadTasks,
  };
}


