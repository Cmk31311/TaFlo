'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useUser } from './useUser';
import { supabase } from '../../lib/supabaseClient';

export type SimpleTask = {
  id: number;
  title: string;
  description?: string;
  is_done: boolean;
  user_id: string;
  created_at: string;
  updated_at?: string;
  category_id?: number;
  priority_id?: number;
  due_date?: string;
  estimated_time?: number;
  actual_time?: number;
  tags?: string[];
  position?: number;
};

export type TaskFilter = {
  search?: string;
  is_done?: boolean;
  category_id?: number;
  priority_id?: number;
  due_date_from?: string;
  due_date_to?: string;
  is_overdue?: boolean;
  tags?: string[];
};

export function useTasksSimple(filter?: TaskFilter) {
  const user = useUser();
  const [tasks, setTasks] = useState<SimpleTask[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Always use localStorage for now - simple and reliable
      const storedTasks = localStorage.getItem('taflo-tasks');
      const tasks = storedTasks ? JSON.parse(storedTasks) : [];
      console.log('Tasks loaded from localStorage:', tasks);
      setTasks(tasks);
    } catch (err) {
      console.error('Error loading tasks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const addTask = useCallback(async (taskData: Partial<SimpleTask>) => {
    if (!taskData.title?.trim()) {
      console.error('Task title is required');
      return null;
    }

    try {
      const newTask: SimpleTask = {
        id: Date.now(),
        title: taskData.title.trim(),
        description: taskData.description?.trim() || '',
        is_done: false,
        user_id: user?.id || 'local-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category_id: taskData.category_id,
        priority_id: taskData.priority_id,
        due_date: taskData.due_date,
        estimated_time: taskData.estimated_time,
        actual_time: taskData.actual_time,
        tags: taskData.tags || [],
        position: taskData.position || Date.now(),
      };

      // Save to localStorage
      const storedTasks = localStorage.getItem('taflo-tasks');
      const tasks = storedTasks ? JSON.parse(storedTasks) : [];
      tasks.unshift(newTask);
      localStorage.setItem('taflo-tasks', JSON.stringify(tasks));
      
      console.log('Task added successfully:', newTask);
      await loadTasks();
      return newTask;
    } catch (err) {
      console.error('Error adding task:', err);
      setError(err instanceof Error ? err.message : 'Failed to add task');
      return null;
    }
  }, [user, loadTasks]);

  const updateTask = useCallback(async (id: number, updates: Partial<SimpleTask>) => {
    try {
      const storedTasks = localStorage.getItem('taflo-tasks');
      const tasks = storedTasks ? JSON.parse(storedTasks) : [];
      const taskIndex = tasks.findIndex((task: SimpleTask) => task.id === id);
      
      if (taskIndex !== -1) {
        tasks[taskIndex] = { 
          ...tasks[taskIndex], 
          ...updates, 
          updated_at: new Date().toISOString() 
        };
        localStorage.setItem('taflo-tasks', JSON.stringify(tasks));
        console.log('Task updated successfully:', tasks[taskIndex]);
        await loadTasks();
      }
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  }, [loadTasks]);

  const deleteTask = useCallback(async (id: number) => {
    try {
      const storedTasks = localStorage.getItem('taflo-tasks');
      const tasks = storedTasks ? JSON.parse(storedTasks) : [];
      const filteredTasks = tasks.filter((task: SimpleTask) => task.id !== id);
      localStorage.setItem('taflo-tasks', JSON.stringify(filteredTasks));
      console.log('Task deleted successfully:', id);
      await loadTasks();
    } catch (err) {
      console.error('Error deleting task:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  }, [loadTasks]);

  const toggleTask = useCallback(async (id: number, current: boolean) => {
    await updateTask(id, { is_done: !current });
  }, [updateTask]);

  // Client-side filtering
  const filteredTasks = useMemo(() => {
    if (!filter) return tasks;

    return tasks.filter(task => {
      // Search filter
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        const titleMatch = task.title.toLowerCase().includes(searchTerm);
        const descriptionMatch = task.description?.toLowerCase().includes(searchTerm) || false;
        if (!titleMatch && !descriptionMatch) return false;
      }

      // Status filter
      if (filter.is_done !== undefined && task.is_done !== filter.is_done) {
        return false;
      }

      // Category filter
      if (filter.category_id && task.category_id && task.category_id !== filter.category_id) {
        return false;
      }

      // Priority filter
      if (filter.priority_id && task.priority_id && task.priority_id !== filter.priority_id) {
        return false;
      }

      // Due date filters
      if (filter.due_date_from && task.due_date && new Date(task.due_date) < new Date(filter.due_date_from)) {
        return false;
      }

      if (filter.due_date_to && task.due_date && new Date(task.due_date) > new Date(filter.due_date_to)) {
        return false;
      }

      // Overdue filter
      if (filter.is_overdue) {
        if (!task.due_date || task.is_done || new Date(task.due_date) >= new Date()) {
          return false;
        }
      }

      // Tags filter
      if (filter.tags && filter.tags.length > 0) {
        if (!task.tags || !filter.tags.some(tag => task.tags?.includes(tag))) {
          return false;
        }
      }

      return true;
    });
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