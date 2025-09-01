'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already signed in, go home
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) window.location.href = '/';
    });
  }, []);

  async function signInWithMagicLink() {
    setError(null);
    const e = email.trim();
    if (!e) {
      setError('Please enter your email.');
      return;
    }
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

    const { error } = await supabase.auth.signInWithOtp({
      email: e,
      options: { emailRedirectTo: siteUrl },
    });

    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div className="grid place-items-center px-4">
      <div className="glass w-full max-w-sm p-6 mt-10">
        <h1 className="text-2xl font-semibold mb-2">Sign in</h1>
        <p className="text-sm text-slate-300 mb-4">
          We’ll email you a magic link.
        </p>

        <input
          type="email"
          className="input mb-2"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoFocus
        />

        <button
          onClick={signInWithMagicLink}
          className="btn w-full"
          disabled={!email.trim()}
        >
          Get magic link
        </button>

        {sent && (
          <p className="mt-3 text-sm text-emerald-400">
            Link sent! Check your inbox.
          </p>
        )}
        {error && (
          <p className="mt-3 text-sm text-rose-400">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
