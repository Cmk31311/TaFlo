'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useUser } from './useUser';
import { TaskFilter } from '../../lib/simpleTypes';

type SimpleTask = { 
  id: number; 
  user_id: string; 
  title: string; 
  description?: string;
  is_done: boolean; 
  category_id?: number;
  priority_id?: number;
  due_date?: string;
  estimated_time?: number;
  actual_time?: number;
  tags?: string[];
  position: number;
  created_at: string;
  updated_at?: string;
};

export function useTasksSimple(filter?: TaskFilter) {
  const user = useUser();
  const [tasks, setTasks] = useState<SimpleTask[]>([]);
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
      // For development: always use localStorage for now
      const storedTasks = localStorage.getItem('taflo-tasks');
      const tasks = storedTasks ? JSON.parse(storedTasks) : [];
      console.log('Tasks loaded from localStorage:', tasks);
      setTasks(tasks);
      setLoading(false);
      return;

      // Always load all tasks, filtering will be done client-side
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Supabase error:', fetchError);
        throw fetchError;
      }

      console.log('Tasks loaded:', data);
      setTasks(data as SimpleTask[] || []);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addTask = useCallback(async (taskData: Partial<SimpleTask>) => {
    if (!user) {
      console.log('No user found');
      return null;
    }

    console.log('Adding task:', taskData);

    try {
      // Start with basic fields that definitely exist
      const insertData: any = {
        title: taskData.title?.trim(),
        user_id: user.id,
        is_done: false,
        created_at: new Date().toISOString(),
        position: Date.now(), // Use timestamp for position
      };

      // Only add enhanced fields if they exist and have values
      if (taskData.description?.trim()) {
        insertData.description = taskData.description.trim();
      }
      if (taskData.category_id) {
        insertData.category_id = taskData.category_id;
      }
      if (taskData.priority_id) {
        insertData.priority_id = taskData.priority_id;
      }
      if (taskData.due_date) {
        insertData.due_date = taskData.due_date;
      }
      if (taskData.estimated_time) {
        insertData.estimated_time = taskData.estimated_time;
      }
      if (taskData.actual_time) {
        insertData.actual_time = taskData.actual_time;
      }
      if (taskData.tags && taskData.tags.length > 0) {
        insertData.tags = taskData.tags;
      }
      if (taskData.position !== undefined) {
        insertData.position = taskData.position;
      }

      // For development: always use localStorage for now
      const storedTasks = localStorage.getItem('taflo-tasks');
      const tasks = storedTasks ? JSON.parse(storedTasks) : [];
      const newTask = { ...insertData, id: Date.now() };
      tasks.unshift(newTask);
      localStorage.setItem('taflo-tasks', JSON.stringify(tasks));
      console.log('Task added to localStorage:', newTask);
      await loadTasks();
      return newTask;

      const { data, error } = await supabase
        .from('tasks')
        .insert(insertData)
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
  }, [user, loadTasks]);

  const updateTask = useCallback(async (id: number, updates: Partial<SimpleTask>) => {
    try {
      // For development: always use localStorage for now
      const storedTasks = localStorage.getItem('taflo-tasks');
      const tasks = storedTasks ? JSON.parse(storedTasks) : [];
      const taskIndex = tasks.findIndex((task: SimpleTask) => task.id === id);
      
      if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...updates, updated_at: new Date().toISOString() };
        localStorage.setItem('taflo-tasks', JSON.stringify(tasks));
        console.log('Task updated in localStorage:', tasks[taskIndex]);
        await loadTasks();
      }
      return;

      // Filter out undefined values and only include fields that have values
      const updateData: any = {};
      
      if (updates.title !== undefined) updateData.title = updates.title.trim();
      if (updates.description !== undefined) updateData.description = updates.description?.trim();
      if (updates.category_id !== undefined) updateData.category_id = updates.category_id;
      if (updates.priority_id !== undefined) updateData.priority_id = updates.priority_id;
      if (updates.due_date !== undefined) updateData.due_date = updates.due_date;
      if (updates.estimated_time !== undefined) updateData.estimated_time = updates.estimated_time;
      if (updates.actual_time !== undefined) updateData.actual_time = updates.actual_time;
      if (updates.tags !== undefined) updateData.tags = updates.tags;
      if (updates.position !== undefined) updateData.position = updates.position;
      if (updates.is_done !== undefined) updateData.is_done = updates.is_done;

      const { error } = await supabase
        .from('tasks')
        .update(updateData)
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
      // For development: always use localStorage for now
      const storedTasks = localStorage.getItem('taflo-tasks');
      const tasks = storedTasks ? JSON.parse(storedTasks) : [];
      const filteredTasks = tasks.filter((task: SimpleTask) => task.id !== id);
      localStorage.setItem('taflo-tasks', JSON.stringify(filteredTasks));
      console.log('Task deleted from localStorage:', id);
      await loadTasks();
      return;

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

  // Client-side filtering fallback
  const filteredTasks = useMemo(() => {
    if (!filter) return tasks;

    console.log('Filtering tasks with filter:', filter);
    console.log('Total tasks before filtering:', tasks.length);

    const filtered = tasks.filter(task => {
      // Search filter - works with basic title field
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        const titleMatch = task.title.toLowerCase().includes(searchTerm);
        const descriptionMatch = task.description?.toLowerCase().includes(searchTerm) || false;
        if (!titleMatch && !descriptionMatch) return false;
      }

      // Status filter - always works
      if (filter.is_done !== undefined && task.is_done !== filter.is_done) {
        return false;
      }

      // Category filter - only apply if task has category_id
      if (filter.category_id && task.category_id && task.category_id !== filter.category_id) {
        return false;
      }

      // Priority filter - only apply if task has priority_id
      if (filter.priority_id && task.priority_id && task.priority_id !== filter.priority_id) {
        return false;
      }

      // Due date filters - only apply if task has due_date
      if (filter.due_date_from && task.due_date && new Date(task.due_date) < new Date(filter.due_date_from)) {
        return false;
      }

      if (filter.due_date_to && task.due_date && new Date(task.due_date) > new Date(filter.due_date_to)) {
        return false;
      }

      // Overdue filter - only apply if task has due_date
      if (filter.is_overdue) {
        if (!task.due_date || task.is_done || new Date(task.due_date) >= new Date()) {
          return false;
        }
      }

      // Tags filter - only apply if task has tags
      if (filter.tags && filter.tags.length > 0) {
        if (!task.tags || !filter.tags.some(tag => task.tags?.includes(tag))) {
          return false;
        }
      }

      return true;
    });

    console.log('Tasks after filtering:', filtered.length);
    return filtered;
  }, [tasks, filter]);

  // Computed values
  const stats = useMemo(() => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.is_done).length;
    const pending = total - completed;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;

    return {
      total,
      completed,
      pending,
      completionRate,
      remaining: total - completed,
    };
  }, [filteredTasks]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return {
    tasks: filteredTasks,
    loading,
    error,
    stats,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    refresh: loadTasks,
  };
}
