'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient'; // from app/auth → ../../lib

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = '/';
    });
  }, []);

  async function signInWithMagicLink() {
    setError(null);
    if (!email.trim()) return setError('Please enter your email.');
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: 'http://localhost:3000' } // change to your prod URL after deploy
    });
    if (error) setError(error.message); else setSent(true);
  }

  return (
    <div className="max-w-sm mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-2">Sign in</h1>
      <p className="text-sm text-gray-600 mb-4">We’ll email you a magic link.</p>

      <input
        type="email"
        className="border rounded w-full p-2 mb-2"
        placeholder="you@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoFocus
      />

      <button
        onClick={signInWithMagicLink}
        className="bg-black text-white rounded px-4 py-2 w-full disabled:opacity-50"
        disabled={!email.trim()}
      >
        Get magic link
      </button>

      {sent && <p className="mt-3 text-sm text-emerald-700">Link sent! Check your inbox.</p>}
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  );
}
