'use client';

// src/app/(auth)/login/page.tsx
// Combined auth page: login, register, forgot-password — three animated views

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, ArrowRight, Building2, Globe, Phone, ArrowLeft, Loader2, Ship, Car, Layers
} from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

// ─── Types ───────────────────────────────────────────────────────────────────

type View = 'login' | 'register' | 'forgot';

// ─── Animation preset ────────────────────────────────────────────────────────

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

// ─── Shared input wrapper ────────────────────────────────────────────────────

function Field({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
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

// ─── Error banner ─────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 font-medium">
      {message}
    </p>
  );
}

// ─── Login view ───────────────────────────────────────────────────────────────

function LoginView({ onSwitch }: { onSwitch: (v: View) => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next');
  const registered = searchParams.get('registered') === 'true';
  const reset = searchParams.get('reset') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
      return;
    }

    try {
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();
      if (session?.user?.role === 'ADMIN') {
        router.push('/admin');
      } else {
        router.push(nextPath ?? '/company');
      }
    } catch {
      router.push(nextPath ?? '/company');
    }
  }

  return (
    <motion.div key="login" {...fadeInUp} className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">Sign in to your DetailHub account</p>
      </div>

      {registered && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 font-medium mb-4 text-center">
          Account created! Sign in to continue setup.
        </p>
      )}
      {reset && (
        <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5 font-medium mb-4 text-center">
          Password updated! Sign in with your new password.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <Field icon={<Mail size={16} />}>
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className={inputClass()}
          />
        </Field>

        <Field icon={<Lock size={16} />}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className={inputClass()}
          />
        </Field>

        {error && <ErrorBanner message={error} />}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-full py-3.5 text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Signing in...</> : <>Sign In <ArrowRight size={16} /></>}
        </button>
      </form>

      <div className="mt-4 text-center space-y-2">
        <button
          onClick={() => onSwitch('forgot')}
          className="text-xs text-gray-500 hover:text-gray-900 font-medium transition-colors"
        >
          Forgot password?
        </button>
        <p className="text-xs text-gray-400 font-medium">
          Don&apos;t have an account?{' '}
          <button onClick={() => onSwitch('register')} className="text-gray-900 font-semibold hover:underline">
            Create one
          </button>
        </p>
      </div>
    </motion.div>
  );
}

// ─── Register view ────────────────────────────────────────────────────────────

type Specialization = 'boats' | 'cars' | 'both';

function RegisterView({ onSwitch }: { onSwitch: (v: View) => void }) {
  const router = useRouter();

  const [form, setForm] = useState({
    companyName: '',
    website: '',
    email: '',
    phone: '',
    homeBase: '',
    password: '',
    confirmPassword: '',
  });
  const [specialization, setSpecialization] = useState<Specialization>('boats');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: form.companyName,
          website: form.website || undefined,
          email: form.email,
          phone: form.phone || undefined,
          homeBase: form.homeBase || undefined,
          specialization,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Registration failed. Please try again.');
        setLoading(false);
        return;
      }

      // Auto sign-in after registration
      const signInResult = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Registration succeeded but auto-login failed — redirect to login
        router.push('/login?registered=true');
        return;
      }

      router.push('/company');
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  const specializationOptions: { value: Specialization; label: string; icon: React.ReactNode }[] = [
    { value: 'boats', label: 'Boats', icon: <Ship size={16} /> },
    { value: 'cars', label: 'Cars', icon: <Car size={16} /> },
    { value: 'both', label: 'Both', icon: <Layers size={16} /> },
  ];

  return (
    <motion.div key="register" {...fadeInUp} className="w-full">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Create your account</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">Get your business listed on DetailHub</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Field icon={<Building2 size={16} />}>
          <input
            type="text"
            placeholder="Company Name"
            value={form.companyName}
            onChange={(e) => update('companyName', e.target.value)}
            required
            className={inputClass()}
          />
        </Field>

        <Field icon={<Globe size={16} />}>
          <input
            type="url"
            placeholder="Website URL (optional)"
            value={form.website}
            onChange={(e) => update('website', e.target.value)}
            className={inputClass()}
          />
        </Field>

        <Field icon={<Mail size={16} />}>
          <input
            type="email"
            placeholder="Email Address"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            required
            autoComplete="email"
            className={inputClass()}
          />
        </Field>

        <Field icon={<Phone size={16} />}>
          <input
            type="tel"
            placeholder="Phone Number (optional)"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            className={inputClass()}
          />
        </Field>

        <Field icon={<span className="text-xs font-bold text-gray-400 pl-0.5">📍</span>}>
          <input
            type="text"
            placeholder="Home Base (e.g. Miami, FL)"
            value={form.homeBase}
            onChange={(e) => update('homeBase', e.target.value)}
            className={inputClass()}
          />
        </Field>

        {/* Specialization picker */}
        <div>
          <p className="text-xs font-semibold text-gray-500 mb-2 pl-1">I specialize in:</p>
          <div className="grid grid-cols-3 gap-2">
            {specializationOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSpecialization(opt.value)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-all ${
                  specialization === opt.value
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-400'
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Field icon={<Lock size={16} />}>
          <input
            type="password"
            placeholder="Password (min 8 chars)"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            required
            autoComplete="new-password"
            className={inputClass()}
          />
        </Field>

        <Field icon={<Lock size={16} />}>
          <input
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) => update('confirmPassword', e.target.value)}
            required
            autoComplete="new-password"
            className={inputClass()}
          />
        </Field>

        {error && <ErrorBanner message={error} />}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-full py-3.5 text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" /> Creating account...</> : <>Create Account <ArrowRight size={16} /></>}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-gray-400 font-medium">
        Already have an account?{' '}
        <button onClick={() => onSwitch('login')} className="text-gray-900 font-semibold hover:underline">
          Sign in
        </button>
      </p>
    </motion.div>
  );
}

// ─── Forgot password view ─────────────────────────────────────────────────────

function ForgotView({ onSwitch }: { onSwitch: (v: View) => void }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Something went wrong. Please try again.');
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <motion.div key="forgot" {...fadeInUp} className="w-full">
      <button
        onClick={() => onSwitch('login')}
        className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 font-medium mb-6 transition-colors"
      >
        <ArrowLeft size={14} /> Back to sign in
      </button>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Forgot password?</h1>
        <p className="text-sm text-gray-500 mt-1 font-medium">
          Enter your email and we&apos;ll send a reset link.
        </p>
      </div>

      {sent ? (
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-green-50 border border-green-100 rounded-full text-2xl">
            ✉️
          </div>
          <p className="text-sm font-semibold text-gray-900">Check your inbox</p>
          <p className="text-sm text-gray-500">
            If an account exists for <strong>{email}</strong>, you&apos;ll receive a reset link
            shortly. The link expires in 1 hour.
          </p>
          <button
            onClick={() => onSwitch('login')}
            className="text-xs text-gray-500 hover:text-gray-900 font-medium transition-colors"
          >
            Back to sign in
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Field icon={<Mail size={16} />}>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={inputClass()}
            />
          </Field>

          {error && <ErrorBanner message={error} />}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-full py-3.5 text-sm font-semibold hover:bg-gray-800 active:scale-[0.98] transition-all disabled:opacity-60"
          >
            {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <>Send Reset Link <ArrowRight size={16} /></>}
          </button>
        </form>
      )}
    </motion.div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function AuthContent() {
  const searchParams = useSearchParams();
  const initialView: View = searchParams.get('view') === 'register' ? 'register' : 'login';
  const [view, setView] = useState<View>(initialView);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block">
            <img src="/images/logo.png" alt="DetailHub" className="h-10 mx-auto" />
          </a>
        </div>

        {/* Card */}
        <div
          className="bg-white rounded-2xl border border-gray-100 p-8"
          style={{ boxShadow: '0 40px 100px -20px rgba(0,0,0,0.10), 0 20px 50px -20px rgba(0,0,0,0.06)' }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {view === 'login' && <LoginView key="login" onSwitch={setView} />}
            {view === 'register' && <RegisterView key="register" onSwitch={setView} />}
            {view === 'forgot' && <ForgotView key="forgot" onSwitch={setView} />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]">
        <Loader2 className="animate-spin text-gray-400" size={24} />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
