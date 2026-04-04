'use client';

// src/app/(auth)/reset-password/page.tsx
// Password reset page — user lands here from the email link

import React, { useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Lock, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

function TypographyStyle() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
      :root { --font-main: 'Inter', sans-serif; --brand-red: #ff385c; }
      .auth-root { font-family: var(--font-main); -webkit-font-smoothing: antialiased; }
      .uber-shadow { box-shadow: 0 40px 100px -20px rgba(0,0,0,0.12), 0 20px 50px -20px rgba(0,0,0,0.08); }
      .input-focus:focus-within { border-color: #000000; box-shadow: 0 0 0 2px rgba(0,0,0,0.05); }
      .auth-input::placeholder { color: #CBD5E1; font-weight: 500; }
    `}} />
  );
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[8px] font-black text-gray-400 uppercase tracking-widest pl-1">{label}</label>
      <div className="relative flex items-center border border-gray-200 rounded-xl bg-white input-focus transition-all">
        <span className="pl-4 text-gray-400 shrink-0">{icon}</span>
        {children}
      </div>
    </div>
  );
}

function inputClass() {
  return 'auth-input w-full px-3 py-3.5 bg-transparent text-sm font-medium text-gray-900 outline-none';
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
      setError('INVALID RESET LINK — REQUEST A NEW ONE');
      return;
    }
    if (password !== confirm) {
      setError('PASSWORDS DO NOT MATCH');
      return;
    }
    if (password.length < 8) {
      setError('PASSWORD MUST BE AT LEAST 8 CHARACTERS');
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
        setError((data.error ?? 'SYSTEM ERROR').toUpperCase());
        setLoading(false);
        return;
      }

      setDone(true);
      setTimeout(() => router.push('/login?reset=true'), 2000);
    } catch {
      setError('SYSTEM ERROR — PLEASE TRY AGAIN');
      setLoading(false);
    }
  }

  return (
    <div className="auth-root min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] px-4 py-12">
      <TypographyStyle />

      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <a href="/" className="inline-block">
            <img src="/images/logo.png" alt="DetailHub" className="h-10 mx-auto" />
          </a>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-8 uber-shadow">
          <motion.div {...fadeInUp} className="w-full">
            {done ? (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-50 border border-gray-200 rounded-full text-2xl">
                  ✅
                </div>
                <p className="text-[11px] font-black uppercase tracking-widest text-black">CREDENTIALS UPDATED</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  REDIRECTING TO LOGIN…
                </p>
              </div>
            ) : (
              <>
                <div className="mb-7">
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    ESTABLISH NEW CREDENTIALS
                  </p>
                  <h1 className="text-3xl font-black tracking-tighter text-black uppercase">
                    RESET PASSWORD
                  </h1>
                </div>

                {!token && (
                  <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 rounded-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-red-600">
                      INVALID TOKEN —{' '}
                      <a href="/login" className="underline">REQUEST NEW LINK</a>
                    </p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Field label="NEW PASSWORD (MIN 8 CHARS)" icon={<Lock size={15} />}>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="new-password"
                      className={inputClass()}
                    />
                  </Field>

                  <Field label="CONFIRM NEW PASSWORD" icon={<Lock size={15} />}>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                      autoComplete="new-password"
                      className={inputClass()}
                    />
                  </Field>

                  {error && (
                    <p className="text-[11px] font-black uppercase tracking-widest text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !token}
                    className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-full py-3.5 text-[11px] font-black uppercase tracking-widest hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-60"
                  >
                    {loading
                      ? <><Loader2 size={14} className="animate-spin" /> UPDATING...</>
                      : <>UPDATE CREDENTIALS <ArrowRight size={14} /></>}
                  </button>
                </form>
              </>
            )}
          </motion.div>
        </div>

        <p className="mt-6 text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
          © 2026 DETAILHUB NETWORK
        </p>
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
