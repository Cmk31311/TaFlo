'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useUser } from './useUser';
import { Category } from '../../lib/simpleTypes';

export function useCategories() {
  const user = useUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    if (!user) {
      setCategories([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (fetchError) {
        console.error('Supabase error:', fetchError);
        throw fetchError;
      }

      setCategories(data as Category[] || []);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addCategory = useCallback(async (name: string, color: string = '#3b82f6') => {
    if (!user) {
      console.log('No user found');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .insert({
          name: name.trim(),
          color,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      await loadCategories();
      return data;
    } catch (err) {
      console.error('Error adding category:', err);
      setError(err instanceof Error ? err.message : 'Failed to add category');
      return null;
    }
  }, [user, loadCategories]);

  const updateCategory = useCallback(async (id: number, updates: Partial<Category>) => {
    try {
      const { error } = await supabase
        .from('categories')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await loadCategories();
    } catch (err) {
      console.error('Error updating category:', err);
      setError(err instanceof Error ? err.message : 'Failed to update category');
    }
  }, [loadCategories]);

  const deleteCategory = useCallback(async (id: number) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await loadCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    }
  }, [loadCategories]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    error,
    addCategory,
    updateCategory,
    deleteCategory,
    refresh: loadCategories,
  };
}