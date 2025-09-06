'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useUser } from './useUser';
import { TimeEntry } from '../../lib/types';

export function useTimeTracking(taskId?: number) {
  const user = useUser();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTimeEntries = useCallback(async () => {
    if (!user) {
      setTimeEntries([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('task_time_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });

      if (taskId) {
        query = query.eq('task_id', taskId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setTimeEntries(data || []);
    } catch (err) {
      console.error('Error loading time entries:', err);
      setError(err instanceof Error ? err.message : 'Failed to load time entries');
    } finally {
      setLoading(false);
    }
  }, [user, taskId]);

  const startTimer = useCallback(async (taskId: number, description?: string) => {
    if (!user) return null;

    try {
      // Stop any existing active timer
      if (activeEntry) {
        await stopTimer(activeEntry.id);
      }

      const { data, error } = await supabase
        .from('task_time_entries')
        .insert({
          task_id: taskId,
          user_id: user.id,
          start_time: new Date().toISOString(),
          description,
        })
        .select()
        .single();

      if (error) throw error;

      setActiveEntry(data);
      await loadTimeEntries();
      return data;
    } catch (err) {
      console.error('Error starting timer:', err);
      setError(err instanceof Error ? err.message : 'Failed to start timer');
      return null;
    }
  }, [user, activeEntry, loadTimeEntries]);

  const stopTimer = useCallback(async (entryId: number) => {
    try {
      const entry = timeEntries.find(e => e.id === entryId);
      if (!entry) return;

      const endTime = new Date();
      const startTime = new Date(entry.start_time);
      const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // minutes

      const { error } = await supabase
        .from('task_time_entries')
        .update({
          end_time: endTime.toISOString(),
          duration,
        })
        .eq('id', entryId);

      if (error) throw error;

      // Update task's actual_time
      await supabase.rpc('update_task_actual_time', {
        task_id: entry.task_id,
        additional_time: duration,
      });

      setActiveEntry(null);
      await loadTimeEntries();
    } catch (err) {
      console.error('Error stopping timer:', err);
      setError(err instanceof Error ? err.message : 'Failed to stop timer');
    }
  }, [timeEntries, loadTimeEntries]);

  const deleteTimeEntry = useCallback(async (entryId: number) => {
    try {
      const { error } = await supabase
        .from('task_time_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      await loadTimeEntries();
    } catch (err) {
      console.error('Error deleting time entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete time entry');
    }
  }, [loadTimeEntries]);

  const updateTimeEntry = useCallback(async (entryId: number, updates: Partial<TimeEntry>) => {
    try {
      const { error } = await supabase
        .from('task_time_entries')
        .update(updates)
        .eq('id', entryId);

      if (error) throw error;

      await loadTimeEntries();
    } catch (err) {
      console.error('Error updating time entry:', err);
      setError(err instanceof Error ? err.message : 'Failed to update time entry');
    }
  }, [loadTimeEntries]);

  // Check for active timer on load
  useEffect(() => {
    if (timeEntries.length > 0) {
      const active = timeEntries.find(e => !e.end_time);
      setActiveEntry(active || null);
    }
  }, [timeEntries]);

  useEffect(() => {
    loadTimeEntries();
  }, [loadTimeEntries]);

  return {
    timeEntries,
    activeEntry,
    loading,
    error,
    startTimer,
    stopTimer,
    deleteTimeEntry,
    updateTimeEntry,
    refresh: loadTimeEntries,
  };
}


