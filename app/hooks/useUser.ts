'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient'; // from app/hooks → ../../lib

export type SupaUser = { id: string; email?: string } | null;

export function useUser(): SupaUser {
  const [user, setUser] = useState<SupaUser>({ id: 'dev-user', email: 'dev@example.com' });

  useEffect(() => {
    // For development: always use mock user for now
    console.log('useUser useEffect running - mock user already set in initial state');
    
    // TODO: Uncomment when Supabase authentication is properly set up
    /*
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Using mock user for development');
      setUser({ id: 'dev-user', email: 'dev@example.com' });
      return;
    }

    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setUser(data.user ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (mounted) setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
    */
  }, []);

  return user;
}
