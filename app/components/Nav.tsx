'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function Nav() {
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setIsAuthed(Boolean(data.session)));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setIsAuthed(Boolean(s)));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  return (
    <header className="sticky top-0 z-40">
      <div className="glass mx-auto max-w-5xl mt-4 mb-6 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="gradient-text font-bold text-2xl tracking-tight">
          TaFLo
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
