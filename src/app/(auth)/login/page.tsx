'use client';

// src/app/(auth)/login/page.tsx
// Combined auth page: login, register, forgot-password — three animated views

import React, { useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, ArrowLeft, ChevronRight, Loader2, Ship, Car, Layers,
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
      .input-focus:focus-within { border-color: #000000; box-shadow: 0 0 0 2px rgba(0,0,0,0.05); }
      .auth-input::placeholder { color: #CBD5E1; font-weight: 500; }
    `}} />
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type View = 'login' | 'register' | 'forgot';
type Specialization = 'BOATS' | 'CARS' | 'BOTH';

// ─── Animation preset ─────────────────────────────────────────────────────────

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

// ─── Shared field ─────────────────────────────────────────────────────────────

function Field({
  label,
  id,
  name,
  type = 'text',
  placeholder,
  required,
  minLength,
  autoComplete,
  value,
  onChange,
  rightLabel,
}: {
  label: string;
  id: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  value?: string;
  onChange?: (v: string) => void;
  rightLabel?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-[8px] font-black uppercase tracking-widest text-black">
          {label}
        </label>
        {rightLabel}
      </div>
      <div className="input-focus border border-gray-200 rounded-xl bg-white transition-all">
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          minLength={minLength}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          className="auth-input w-full px-4 py-3.5 bg-transparent text-sm font-medium text-gray-900 outline-none rounded-xl"
        />
      </div>
    </div>
  );
}

// ─── Primary button ────────────────────────────────────────────────────────────

function PrimaryButton({ loading, loadingText, label, disabled }: { loading: boolean; loadingText: string; label: string; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-xl py-4 text-[11px] font-black uppercase tracking-widest hover:bg-[var(--brand-red)] active:scale-[0.98] transition-all disabled:opacity-60"
    >
      {loading
        ? <><Loader2 size={14} className="animate-spin" /> {loadingText}</>
        : <>{label} <ArrowRight size={14} /></>
      }
    </button>
  );
}

// ─── Banners ───────────────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <p className="text-[11px] font-black uppercase tracking-widest text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
      {message}
    </p>
  );
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <p className="text-[11px] font-black uppercase tracking-widest text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-2.5">
      {message}
    </p>
  );
}

// ─── Back button ──────────────────────────────────────────────────────────────

function BackButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors mb-6"
    >
      <ArrowLeft size={12} /> {label}
    </button>
  );
}

// ─── Login view ────────────────────────────────────────────────────────────────

function LoginView({ onSwitch }: { onSwitch: (v: View) => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next');
  const registered = searchParams.get('registered') === 'true';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await signIn('credentials', { email, password, redirect: false });

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

      {registered && <SuccessBanner message="CREDENTIALS ESTABLISHED — SIGN IN TO CONTINUE" />}

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <Field
          id="login-email"
          name="email"
          label="Email Address"
          type="email"
          placeholder="operator@example.com"
          required
          autoComplete="email"
          value={email}
          onChange={setEmail}
        />

        <Field
          id="login-password"
          name="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          rightLabel={
            <button
              type="button"
              onClick={() => onSwitch('forgot')}
              className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
            >
              Forgot Password?
            </button>
          }
        />

        {error && <ErrorBanner message={error} />}

        <PrimaryButton loading={loading} loadingText="AUTHENTICATING..." label="Access Dashboard" />
      </form>

      <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          New to the Network?
        </span>
        <button
          onClick={() => onSwitch('register')}
          className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-black hover:text-[var(--brand-red)] transition-colors"
        >
          Join the Network <ChevronRight size={12} />
        </button>
      </div>
    </motion.div>
  );
}

// ─── Register view ─────────────────────────────────────────────────────────────

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
  const [specialization, setSpecialization] = useState<Specialization>('BOTH');
  const [liabilityConfirmed, setLiabilityConfirmed] = useState(false);
  const [emailConsent, setEmailConsent] = useState(true);
  const [smsConsent, setSmsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
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
          emailConsent,
          smsConsent,
          marketingConsent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError((data.error ?? 'REGISTRATION FAILED').toUpperCase());
        setLoading(false);
        return;
      }

      // Auto sign-in
      const signInResult = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push('/login?registered=true');
        return;
      }

      router.push(data.redirectUrl ?? '/company');
    } catch {
      setError('SYSTEM ERROR — PLEASE TRY AGAIN');
      setLoading(false);
    }
  }

  return (
    <motion.div key="register" {...fadeInUp} className="w-full">
      <BackButton label="Back to Sign In" onClick={() => onSwitch('login')} />

      <div className="mb-7">
        <h1 className="text-3xl font-black tracking-tighter text-black uppercase mb-2">
          Access Dashboard
        </h1>
        <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest leading-relaxed">
          Register your professional credentials
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Company Name + Website side by side */}
        <div className="grid grid-cols-2 gap-3">
          <Field
            id="companyName"
            name="companyName"
            label="Company Name"
            placeholder="My Detail Co."
            required
            value={form.companyName}
            onChange={(v) => update('companyName', v)}
          />
          <Field
            id="website"
            name="website"
            label="Website URL"
            type="url"
            placeholder="https://..."
            value={form.website}
            onChange={(v) => update('website', v)}
          />
        </div>

        {/* Email + Phone side by side */}
        <div className="grid grid-cols-2 gap-3">
          <Field
            id="reg-email"
            name="email"
            label="Email Address"
            type="email"
            placeholder="operator@example.com"
            required
            autoComplete="email"
            value={form.email}
            onChange={(v) => update('email', v)}
          />
          <Field
            id="phone"
            name="phone"
            label="Phone"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={form.phone}
            onChange={(v) => update('phone', v)}
          />
        </div>

        {/* Home Base full width */}
        <Field
          id="homeBase"
          name="homeBase"
          label="Home Base"
          placeholder="Miami, FL"
          value={form.homeBase}
          onChange={(v) => update('homeBase', v)}
        />

        {/* Password + Confirm side by side */}
        <div className="grid grid-cols-2 gap-3">
          <Field
            id="reg-password"
            name="password"
            label="Password"
            type="password"
            placeholder="Min. 8 chars"
            required
            minLength={8}
            autoComplete="new-password"
            value={form.password}
            onChange={(v) => update('password', v)}
          />
          <Field
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            required
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={(v) => update('confirmPassword', v)}
          />
        </div>

        {/* Specialization picker */}
        <div className="flex flex-col gap-2">
          <span className="text-[8px] font-black uppercase tracking-widest text-black">Specialization</span>
          <div className="grid grid-cols-3 gap-2">
            {(
              [
                { value: 'BOATS' as Specialization, label: 'Boats', Icon: Ship },
                { value: 'CARS' as Specialization, label: 'Cars', Icon: Car },
                { value: 'BOTH' as Specialization, label: 'Both', Icon: Layers },
              ]
            ).map(({ value, label, Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSpecialization(value)}
                className={`flex flex-col items-center gap-1 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                  specialization === value
                    ? 'border-black bg-black text-white'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-black hover:text-black'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Consent checkboxes */}
        <div className="border border-gray-100 rounded-2xl p-4 space-y-2">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              required
              checked={liabilityConfirmed}
              onChange={(e) => setLiabilityConfirmed(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-black cursor-pointer"
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 leading-relaxed">
              I confirm my company carries at least $1M in liability coverage
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emailConsent}
              onChange={(e) => setEmailConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-black cursor-pointer"
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 leading-relaxed">
              I agree to receive lead notification emails
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={smsConsent}
              onChange={(e) => setSmsConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-black cursor-pointer"
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 leading-relaxed">
              I agree to receive SMS notifications
            </span>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
              className="mt-0.5 h-4 w-4 shrink-0 accent-black cursor-pointer"
            />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600 leading-relaxed">
              I agree to receive marketing communications
            </span>
          </label>
        </div>

        {error && <ErrorBanner message={error} />}

        <PrimaryButton loading={loading} loadingText="REGISTERING..." label="Access Dashboard" disabled={!liabilityConfirmed} />
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
        const data = await res.json().catch(() => ({}));
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
      <BackButton label="Back" onClick={() => onSwitch('login')} />

      <div className="mb-5">
        <h1 className="text-3xl font-black tracking-tighter text-black uppercase mb-2">
          Recovery
        </h1>
        <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest leading-relaxed">
          Password Reset Protocol
        </p>
      </div>

      {sent ? (
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-50 border border-gray-200 rounded-full text-2xl">
            ✉️
          </div>
          <SuccessBanner message="TRANSMISSION SENT — CHECK YOUR INBOX" />
          <button
            onClick={() => onSwitch('login')}
            className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
          >
            ← Return to Login
          </button>
        </div>
      ) : (
        <>
          <p className="text-gray-500 text-[11px] font-medium leading-relaxed mb-5">
            Provide your registered email address. We will deploy instructions to reset your secure dashboard credentials.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field
              id="forgot-email"
              name="email"
              label="Email Address"
              type="email"
              placeholder="operator@example.com"
              required
              autoComplete="email"
              value={email}
              onChange={setEmail}
            />

            {error && <ErrorBanner message={error} />}

            <PrimaryButton loading={loading} loadingText="TRANSMITTING..." label="Send Reset Link" />
          </form>
        </>
      )}
    </motion.div>
  );
}

// ─── Main auth content ─────────────────────────────────────────────────────────

function AuthContent() {
  const searchParams = useSearchParams();
  const initialView: View = searchParams.get('view') === 'register' ? 'register' : 'login';
  const [view, setView] = useState<View>(initialView);

  return (
    <div className="auth-root min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] px-4 py-12">
      <TypographyStyle />

      <div className={`w-full transition-all duration-300 ${view === 'register' ? 'max-w-[720px]' : 'max-w-md'}`}>
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <a href="/" className="inline-flex items-center gap-2 group">
            <img
              src="/images/logo.png"
              alt="DetailHub"
              className="h-8 w-8 group-hover:scale-105 transition-transform"
            />
            <span className="text-sm font-black uppercase tracking-widest text-black">
              DetailHub
            </span>
          </a>
        </div>

        {/* Card */}
        <div className={`bg-white rounded-[3rem] uber-shadow border border-gray-100 ${view === 'register' ? 'p-8' : 'p-10'}`}>
          <AnimatePresence mode="wait" initial={false}>
            {view === 'login' && <LoginView key="login" onSwitch={setView} />}
            {view === 'register' && <RegisterView key="register" onSwitch={setView} />}
            {view === 'forgot' && <ForgotView key="forgot" onSwitch={setView} />}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
          © 2026 DetailHub Network
        </p>
      </div>
    </div>
  );
}

// ─── Page export ───────────────────────────────────────────────────────────────

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
