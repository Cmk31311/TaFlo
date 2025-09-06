'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Nav() {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setIsAuthed(Boolean(data.session));
        console.log('Nav: Session check result:', data.session ? 'authenticated' : 'not authenticated');
      } catch (err) {
        console.error('Error getting session:', err);
        setIsAuthed(false);
      }
    };

    getSession();
    
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setIsAuthed(Boolean(s));
      console.log('Nav: Auth state changed:', s ? 'authenticated' : 'not authenticated');
    });
    
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (err) {
      console.error('Error signing out:', err);
    }
  }, []);

  return (
    <header className="sticky top-0 z-40">
      <div className="glass mx-auto max-w-5xl mt-4 mb-6 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="gradient-text font-bold text-2xl tracking-tight">
          TaFlo
        </Link>

        <div className="flex items-center gap-4">
          {!isAuthed ? (
            <Link href="/auth" className="btn-neon">Sign In</Link>
          ) : (
            <button onClick={signOut} className="btn-outline">Sign Out</button>
          )}
        </div>
      </div>
    </header>
  );
}
