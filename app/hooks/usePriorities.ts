'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useUser } from './useUser';
import { Priority } from '../../lib/simpleTypes';

export function usePriorities() {
  const user = useUser();
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPriorities = useCallback(async () => {
    if (!user) {
      setPriorities([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('priorities')
        .select('*')
        .eq('user_id', user.id)
        .order('level');

      if (fetchError) {
        console.error('Supabase error:', fetchError);
        throw fetchError;
      }

      setPriorities(data as Priority[] || []);
    } catch (err) {
      console.error('Error loading priorities:', err);
      setError(err instanceof Error ? err.message : 'Failed to load priorities');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addPriority = useCallback(async (name: string, level: number, color: string) => {
    if (!user) {
      console.log('No user found');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('priorities')
        .insert({
          name: name.trim(),
          level,
          color,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      await loadPriorities();
      return data;
    } catch (err) {
      console.error('Error adding priority:', err);
      setError(err instanceof Error ? err.message : 'Failed to add priority');
      return null;
    }
  }, [user, loadPriorities]);

  const updatePriority = useCallback(async (id: number, updates: Partial<Priority>) => {
    try {
      const { error } = await supabase
        .from('priorities')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await loadPriorities();
    } catch (err) {
      console.error('Error updating priority:', err);
      setError(err instanceof Error ? err.message : 'Failed to update priority');
    }
  }, [loadPriorities]);

  const deletePriority = useCallback(async (id: number) => {
    try {
      const { error } = await supabase
        .from('priorities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadPriorities();
    } catch (err) {
      console.error('Error deleting priority:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete priority');
    }
  }, [loadPriorities]);

  useEffect(() => {
    loadPriorities();
  }, [loadPriorities]);

  return {
    priorities,
    loading,
    error,
    addPriority,
    updatePriority,
    deletePriority,
    refresh: loadPriorities,
  };
}