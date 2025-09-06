'use client';

import { useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Task } from '../../lib/types';

export function useRecurringTasks() {
  const createRecurringTask = useCallback(async (task: Task) => {
    if (!task.is_recurring || !task.recurrence_pattern) {
      return;
    }

    const now = new Date();
    const dueDate = task.due_date ? new Date(task.due_date) : now;
    // Calculate next occurrence based on pattern
    const nextDueDate = new Date(dueDate);
    
    switch (task.recurrence_pattern) {
      case 'daily':
        nextDueDate.setDate(dueDate.getDate() + task.recurrence_interval);
        break;
      case 'weekly':
        nextDueDate.setDate(dueDate.getDate() + (7 * task.recurrence_interval));
        break;
      case 'monthly':
        nextDueDate.setMonth(dueDate.getMonth() + task.recurrence_interval);
        break;
      case 'yearly':
        nextDueDate.setFullYear(dueDate.getFullYear() + task.recurrence_interval);
        break;
    }

    // Create the next occurrence
    const { id, created_at, updated_at, completed_at, ...taskData } = task;
    const nextTask = {
      ...taskData,
      title: task.title,
      is_done: false,
      completed_at: undefined,
      due_date: nextDueDate.toISOString(),
    };

    try {
      const { error } = await supabase
        .from('tasks')
        .insert(nextTask);

      if (error) {
        console.error('Error creating recurring task:', error);
      }
    } catch (err) {
      console.error('Error creating recurring task:', err);
    }
  }, []);

  const processCompletedRecurringTasks = useCallback(async (completedTask: Task) => {
    if (completedTask.is_recurring && completedTask.recurrence_pattern) {
      await createRecurringTask(completedTask);
    }
  }, [createRecurringTask]);

  const getRecurrenceDescription = useCallback((task: Task) => {
    if (!task.is_recurring || !task.recurrence_pattern) {
      return '';
    }

    const interval = task.recurrence_interval || 1;
    const pattern = task.recurrence_pattern;

    switch (pattern) {
      case 'daily':
        return interval === 1 ? 'Daily' : `Every ${interval} days`;
      case 'weekly':
        return interval === 1 ? 'Weekly' : `Every ${interval} weeks`;
      case 'monthly':
        return interval === 1 ? 'Monthly' : `Every ${interval} months`;
      case 'yearly':
        return interval === 1 ? 'Yearly' : `Every ${interval} years`;
      default:
        return 'Recurring';
    }
  }, []);

  return {
    createRecurringTask,
    processCompletedRecurringTasks,
    getRecurrenceDescription,
  };
}


