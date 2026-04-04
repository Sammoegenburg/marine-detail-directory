'use client';

// src/app/(auth)/reset-password/page.tsx
// Password reset page — user lands here from the email link

import React, { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="relative flex items-center border border-gray-200 rounded-xl bg-white focus-within:border-black focus-within:ring-2 focus-within:ring-black/5 transition-all">
      <span className="pl-4 text-gray-400 shrink-0">{icon}</span>
      {children}
    </div>
  );
}

function inputClass() {
  return 'w-full px-3 py-3.5 bg-transparent text-sm font-medium text-gray-900 placeholder-gray-300 outline-none';
}

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError('Invalid reset link. Please request a new one.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      setDone(true);
      setTimeout(() => router.push('/login?reset=true'), 2000);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block">
            <img src="/images/logo.png" alt="DetailHub" className="h-10 mx-auto" />
          </a>
        </div>

        <div
          className="bg-white rounded-2xl border border-gray-100 p-8"
          style={{ boxShadow: '0 40px 100px -20px rgba(0,0,0,0.10), 0 20px 50px -20px rgba(0,0,0,0.06)' }}
        >
          <motion.div {...fadeInUp} className="w-full">
            {done ? (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-green-50 border border-green-100 rounded-full text-2xl">
                  ✅
                </div>
                <p className="text-sm font-semibold text-gray-900">Password updated!</p>
                <p className="text-sm text-gray-500">Redirecting you to sign in…</p>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">Set new password</h1>
                  <p className="text-sm text-gray-500 mt-1 font-medium">
                    Choose a strong password for your account.
                  </p>
                </div>

                {!token && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 font-medium mb-4 text-center">
                    Invalid or missing reset token. Please{' '}
                    <a href="/login" className="underline font-semibold">request a new link</a>.
                  </p>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                  <Field icon={<Lock size={16} />}>
                    <input
                      type="password"
                      placeholder="New password (min 8 chars)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className={inputClass()}
                    />
                  </Field>

                  <Field icon={<Lock size={16} />}>
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      autoComplete="new-password"
                      className={inputClass()}
                    />
                  </Field>

                  {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 font-medium">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !token}
                    className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-full py-3.5 text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-60"
                  >
                    {loading
                      ? <><Loader2 size={16} className="animate-spin" /> Updating...</>
                      : <>Update Password <ArrowRight size={16} /></>}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="animate-spin text-gray-400" size={24} />
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
