'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already signed in, go home
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        console.log('Auth page: User already authenticated, redirecting to home');
        window.location.href = '/';
      }
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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="gradient-text text-4xl font-bold tracking-tight mb-2">TaFlo</h1>
          <p className="text-slate-300 text-sm">Your futuristic task companion</p>
        </div>

        {/* Sign in form */}
        <div className="glass-card p-8">
          <h2 className="text-2xl font-semibold mb-2 gradient-text">Sign in</h2>
          <p className="text-sm text-slate-300 mb-6">
            We&apos;ll email you a magic link.
          </p>

          <input
            type="email"
            className="input mb-4"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoFocus
          />

          <button
            onClick={signInWithMagicLink}
            className="btn-neon w-full"
            disabled={!email.trim()}
          >
            Get magic link
          </button>

          {sent && (
            <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-sm text-emerald-400">
                ✉️ Link sent! Check your inbox.
              </p>
            </div>
          )}
          {error && (
            <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
              <p className="text-sm text-rose-400">
                ❌ {error}
              </p>
            </div>
          )}
        </div>

        {/* Back to home link */}
        <div className="text-center mt-6">
          <Link href="/" className="text-slate-400 hover:text-slate-300 text-sm">
            ← Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
