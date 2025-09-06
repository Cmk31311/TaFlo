'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export type SupaUser = { id: string; email?: string } | null;

export function useUser(): SupaUser {
  const [user, setUser] = useState<SupaUser>(null);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (mounted) {
          setUser(data.user ?? null);
          console.log('User state:', data.user ? 'authenticated' : 'not authenticated');
        }
      } catch (err) {
        console.error('Auth check error:', err);
        if (mounted) {
          setUser(null);
        }
      }
    };

    checkAuth();
    
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (mounted) {
        setUser(session?.user ?? null);
        console.log('Auth state changed:', session?.user ? 'authenticated' : 'not authenticated');
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return user;
}