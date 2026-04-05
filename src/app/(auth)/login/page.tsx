'use client';

// src/app/(auth)/login/page.tsx
// Combined auth page: login, register, forgot-password — three animated views

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, ArrowRight, Building2, Globe, Phone, ArrowLeft, Loader2,
  Ship, Car, Layers, ChevronRight, MapPin,
} from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';

// ─── Brand styles ─────────────────────────────────────────────────────────────

function TypographyStyle() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
      :root { --font-main: 'Inter', sans-serif; --brand-red: #ff385c; }
      .auth-root { font-family: var(--font-main); -webkit-font-smoothing: antialiased; }
      .uber-shadow { box-shadow: 0 40px 100px -20px rgba(0,0,0,0.12), 0 20px 50px -20px rgba(0,0,0,0.08); }
      .input-focus:focus-within { border-color: #000; box-shadow: 0 0 0 2px rgba(0,0,0,0.05); }
      input::placeholder { color: #CBD5E1; font-weight: 500; }
    `}} />
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type View = 'login' | 'register' | 'forgot';

// ─── Animation preset ─────────────────────────────────────────────────────────

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

// ─── Shared input wrapper ──────────────────────────────────────────────────────

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
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
  return 'w-full px-3 py-3.5 bg-transparent text-sm font-medium text-gray-900 outline-none';
}

// ─── Error banner ──────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <p className="text-[11px] font-black uppercase tracking-widest text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
      {message}
    </p>
  );
}

// ─── Primary button ────────────────────────────────────────────────────────────

function PrimaryButton({ loading, loadingText, children }: { loading: boolean; loadingText: string; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-full py-3.5 text-[11px] font-black uppercase tracking-widest hover:bg-[#ff385c] active:scale-[0.98] transition-all disabled:opacity-60"
    >
      {loading ? <><Loader2 size={14} className="animate-spin" /> {loadingText}</> : <>{children} <ArrowRight size={14} /></>}
    </button>
  );
}

// ─── Login view ────────────────────────────────────────────────────────────────

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
      setError('Invalid credentials — access denied');
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
      <div className="mb-7">
        <h1 className="text-3xl font-black tracking-tighter text-black uppercase mb-2">
          Access Dashboard
        </h1>
        <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest leading-relaxed">
          Secure credentials required for entry
        </p>
      </div>

      {registered && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-100 rounded-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-green-700">
            CREDENTIALS ESTABLISHED — SIGN IN TO CONTINUE
          </p>
        </div>
      )}
      {reset && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-100 rounded-xl">
          <p className="text-[10px] font-black uppercase tracking-widest text-green-700">
            PASSWORD UPDATED — SIGN IN WITH NEW CREDENTIALS
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="EMAIL ADDRESS" icon={<Mail size={15} />}>
          <input
            type="email"
            placeholder="operator@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className={inputClass()}
          />
        </Field>

        <Field label="PASSWORD" icon={<Lock size={15} />}>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className={inputClass()}
          />
        </Field>

        {error && <ErrorBanner message={error} />}

        <PrimaryButton loading={loading} loadingText="AUTHENTICATING...">
          Access Dashboard
        </PrimaryButton>
      </form>

      <div className="mt-5 space-y-3">
        <button
          onClick={() => onSwitch('forgot')}
          className="block w-full text-center text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
        >
          Forgot Password?
        </button>
        <div className="border-t border-gray-100 pt-3 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            New to the network?{' '}
            <button
              onClick={() => onSwitch('register')}
              className="inline-flex items-center gap-0.5 text-black hover:underline"
            >
              Join the Network <ChevronRight size={10} />
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Register view ─────────────────────────────────────────────────────────────

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
      setError('PASSWORDS DO NOT MATCH');
      return;
    }
    if (form.password.length < 8) {
      setError('PASSWORD MUST BE AT LEAST 8 CHARACTERS');
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
        setError((data.error ?? 'REGISTRATION FAILED').toUpperCase());
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
        router.push('/login?registered=true');
        return;
      }

      router.push('/company');
    } catch {
      setError('SYSTEM ERROR — PLEASE TRY AGAIN');
      setLoading(false);
    }
  }

  const specializationOptions: { value: Specialization; label: string; icon: React.ReactNode }[] = [
    { value: 'boats', label: 'Boats', icon: <Ship size={15} /> },
    { value: 'cars', label: 'Cars', icon: <Car size={15} /> },
    { value: 'both', label: 'Both', icon: <Layers size={15} /> },
  ];

  return (
    <motion.div key="register" {...fadeInUp} className="w-full">
      <button
        onClick={() => onSwitch('login')}
        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mb-6 transition-colors"
      >
        <ArrowLeft size={12} /> Back to Sign In
      </button>

      <div className="mb-7">
        <h1 className="text-3xl font-black tracking-tighter text-black uppercase mb-2">
          Access Dashboard
        </h1>
        <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest leading-relaxed">
          Register your professional credentials
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="COMPANY NAME" icon={<Building2 size={15} />}>
            <input
              type="text"
              placeholder="Company LLC"
              value={form.companyName}
              onChange={(e) => update('companyName', e.target.value)}
              required
              className={inputClass()}
            />
          </Field>
          <Field label="WEBSITE URL" icon={<Globe size={15} />}>
            <input
              type="url"
              placeholder="https://site.com"
              value={form.website}
              onChange={(e) => update('website', e.target.value)}
              className={inputClass()}
            />
          </Field>
        </div>

        <Field label="EMAIL ADDRESS" icon={<Mail size={15} />}>
          <input
            type="email"
            placeholder="operator@company.com"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            required
            autoComplete="email"
            className={inputClass()}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="PHONE" icon={<Phone size={15} />}>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={form.phone}
              onChange={(e) => update('phone', e.target.value)}
              className={inputClass()}
            />
          </Field>
          <Field label="HOME BASE" icon={<MapPin size={15} />}>
            <input
              type="text"
              placeholder="Miami, FL"
              value={form.homeBase}
              onChange={(e) => update('homeBase', e.target.value)}
              className={inputClass()}
            />
          </Field>
        </div>

        {/* Specialization */}
        <div className="space-y-2">
          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest pl-1">SPECIALIZATION</p>
          <div className="grid grid-cols-3 gap-2">
            {specializationOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSpecialization(opt.value)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                  specialization === opt.value
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-400'
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Field label="PASSWORD (MIN 8 CHARS)" icon={<Lock size={15} />}>
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            required
            autoComplete="new-password"
            className={inputClass()}
          />
        </Field>

        <Field label="CONFIRM PASSWORD" icon={<Lock size={15} />}>
          <input
            type="password"
            placeholder="••••••••"
            value={form.confirmPassword}
            onChange={(e) => update('confirmPassword', e.target.value)}
            required
            autoComplete="new-password"
            className={inputClass()}
          />
        </Field>

        {error && <ErrorBanner message={error} />}

        <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">
            Account verification requires active liability insurance and a verifiable professional portfolio.
          </p>
        </div>

        <PrimaryButton loading={loading} loadingText="REGISTERING...">
          Access Dashboard
        </PrimaryButton>
      </form>
    </motion.div>
  );
}

// ─── Forgot password view ──────────────────────────────────────────────────────

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
        setError((data.error ?? 'SYSTEM ERROR').toUpperCase());
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError('SYSTEM ERROR — PLEASE TRY AGAIN');
      setLoading(false);
    }
  }

  return (
    <motion.div key="forgot" {...fadeInUp} className="w-full">
      <button
        onClick={() => onSwitch('login')}
        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black mb-6 transition-colors"
      >
        <ArrowLeft size={12} /> Back
      </button>

      <div className="mb-7">
        <h1 className="text-3xl font-black tracking-tighter text-black uppercase mb-2">
          Recovery
        </h1>
        <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest leading-relaxed">
          Password reset protocol
        </p>
      </div>

      {sent ? (
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-50 border border-gray-200 rounded-full text-2xl">
            ✉️
          </div>
          <p className="text-[11px] font-black uppercase tracking-widest text-black">TRANSMISSION SENT</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
            IF AN ACCOUNT EXISTS FOR THIS EMAIL, A RESET LINK HAS BEEN DISPATCHED.
            LINK EXPIRES IN 1 HOUR.
          </p>
          <button
            onClick={() => onSwitch('login')}
            className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
          >
            ← RETURN TO LOGIN
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Provide your registered email address. We will deploy instructions to reset your secure dashboard credentials.
          </p>

          <Field label="REGISTERED EMAIL ADDRESS" icon={<Mail size={15} />}>
            <input
              type="email"
              placeholder="operator@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className={inputClass()}
            />
          </Field>

          {error && <ErrorBanner message={error} />}

          <PrimaryButton loading={loading} loadingText="SENDING...">
            Send Reset Link
          </PrimaryButton>
        </form>
      )}
    </motion.div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

function AuthContent() {
  const searchParams = useSearchParams();
  const initialView: View = searchParams.get('view') === 'register' ? 'register' : 'login';
  const [view, setView] = useState<View>(initialView);

  return (
    <div className="auth-root min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] p-6">
      <TypographyStyle />

      <div className={`w-full transition-all duration-300 ${view === 'register' ? 'max-w-[640px]' : 'max-w-[520px]'}`}>
        {/* Logo */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block">
            <img src="/images/logo.png" alt="DetailHub" className="h-10 mx-auto" />
          </a>
        </div>

        {/* Card */}
        <div className="bg-white rounded-[3rem] p-10 uber-shadow border border-gray-100">
          <AnimatePresence mode="wait" initial={false}>
            {view === 'login' && <LoginView key="login" onSwitch={setView} />}
            {view === 'register' && <RegisterView key="register" onSwitch={setView} />}
            {view === 'forgot' && <ForgotView key="forgot" onSwitch={setView} />}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
          © 2026 DetailHub Network
        </p>
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
