'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient'; // from app/components → ../../lib

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
    <nav className="p-4 border-b flex items-center justify-between">
      <Link href="/" className="font-semibold">MyApp</Link>
      {!isAuthed ? (
        <Link href="/auth" className="underline">Sign in</Link>
      ) : (
        <button onClick={signOut} className="border rounded px-3 py-1">Sign out</button>
      )}
    </nav>
  );
}
