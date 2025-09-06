'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient'; // from app/hooks → ../../lib

export type SupaUser = { id: string; email?: string } | null;

export function useUser(): SupaUser {
  const [user, setUser] = useState<SupaUser>(null);

  useEffect(() => {
    let mounted = true;

    // Check current user
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) {
        setUser(data.user ?? null);
        console.log('useUser: Current user:', data.user ? 'authenticated' : 'not authenticated');
      }
    });

    // Listen for auth state changes
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        console.log('useUser: Auth state changed:', session?.user ? 'authenticated' : 'not authenticated');
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return user;
}
