"use client";

// src/components/auth/AuthClient.tsx
// Unified auth component — Login / Register / Forgot Password views

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Loader2,
  Ship,
  Car,
  Layers,
} from "lucide-react";

// ── Typography / CSS ───────────────────────────────────────────────────────────
function TypographyStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
      :root { --font-main: 'Inter', sans-serif; --brand-red: #ff385c; }
      body { font-family: var(--font-main); }
      .uber-shadow {
        box-shadow: 0 40px 100px -20px rgba(0,0,0,0.12),
                    0 20px 50px -20px rgba(0,0,0,0.08);
      }
      .input-focus:focus-within {
        border-color: #000000;
        box-shadow: 0 0 0 2px rgba(0,0,0,0.05);
      }
      input::placeholder { color: #CBD5E1; font-weight: 500; }

      @keyframes fadeInUp {
        from { opacity: 0; transform: translateY(16px); }
        to   { opacity: 1; transform: translateY(0); }
      }
      .fade-in-up {
        animation: fadeInUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
      }
    `}</style>
  );
}

// ── Shared input wrapper ───────────────────────────────────────────────────────
function Field({
  id,
  name,
  label,
  type = "text",
  placeholder,
  required,
  minLength,
  autoComplete,
  value,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  autoComplete?: string;
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-[8px] font-black uppercase tracking-widest text-black"
      >
        {label}
      </label>
      <div className="input-focus border border-gray-200 rounded-xl transition-all">
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
          className="w-full bg-transparent px-4 py-3 text-sm font-medium text-black outline-none rounded-xl"
        />
      </div>
    </div>
  );
}

// ── Types ──────────────────────────────────────────────────────────────────────
type View = "login" | "register" | "forgot";

type ClaimCompany = {
  name: string;
  cityName: string;
  stateName: string;
} | null;

type Props = {
  initialView?: View;
  claimSlug?: string;
  claimCompany?: ClaimCompany;
};

// ── Main component ─────────────────────────────────────────────────────────────
export function AuthClient({ initialView = "login", claimSlug, claimCompany }: Props) {
  const router = useRouter();
  const [view, setView] = useState<View>(initialView);
  const [animKey, setAnimKey] = useState(0);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Specialization for register
  const [specialization, setSpecialization] = useState<"BOATS" | "CARS" | "BOTH">("BOTH");

  function switchView(next: View) {
    setError(null);
    setSuccess(null);
    setView(next);
    setAnimKey((k) => k + 1);
  }

  // ── Login submit ─────────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
      setIsLoading(false);
      return;
    }

    try {
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const role = session?.user?.role;
      if (role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/company");
      }
    } catch {
      router.push("/company");
    }
  }

  // ── Register submit ──────────────────────────────────────────────────────
  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const password = form.get("password") as string;
    const confirm = form.get("confirmPassword") as string;

    if (password !== confirm) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("companyName"),
          email: form.get("email"),
          password,
          website: form.get("website"),
          phone: form.get("phone"),
          homeBase: form.get("homeBase"),
          specialization,
          claimSlug: claimSlug ?? undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Registration failed");
      }

      const data = await res.json();

      // Auto sign-in
      await signIn("credentials", {
        email: form.get("email"),
        password,
        redirect: false,
      });

      if (data.redirectUrl) {
        router.push(data.redirectUrl);
      } else {
        router.push("/company");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  }

  // ── Forgot password submit ───────────────────────────────────────────────
  async function handleForgot(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.get("email") }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Request failed");
      }

      setSuccess("Reset instructions deployed to your email.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  // ── Shared header logo ───────────────────────────────────────────────────
  function Logo() {
    return (
      <Link href="/" className="inline-flex items-center gap-2 group mb-8">
        <img
          src="/images/logo.png"
          alt="DetailHub"
          className="h-8 w-8 group-hover:scale-105 transition-transform"
        />
        <span className="text-sm font-black uppercase tracking-widest text-black">
          DetailHub
        </span>
      </Link>
    );
  }

  // ── Submit button ────────────────────────────────────────────────────────
  function SubmitButton({ label }: { label: string }) {
    return (
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 bg-black text-white text-[11px] font-black uppercase tracking-widest py-4 rounded-xl transition-colors hover:bg-[var(--brand-red)] disabled:opacity-50"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            {label}
            <ArrowRight className="h-3.5 w-3.5" />
          </>
        )}
      </button>
    );
  }

  // ── Back button ──────────────────────────────────────────────────────────
  function BackButton({ label, to }: { label: string; to: View }) {
    return (
      <button
        type="button"
        onClick={() => switchView(to)}
        className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors mb-6"
      >
        <ArrowLeft className="h-3 w-3" />
        {label}
      </button>
    );
  }

  // ── Feedback messages ────────────────────────────────────────────────────
  function Feedback() {
    if (error)
      return (
        <p className="text-[11px] font-bold text-red-600 bg-red-50 rounded-xl px-3 py-2 uppercase tracking-wide">
          {error}
        </p>
      );
    if (success)
      return (
        <p className="text-[11px] font-bold text-green-700 bg-green-50 rounded-xl px-3 py-2 uppercase tracking-wide">
          {success}
        </p>
      );
    return null;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VIEW: LOGIN
  // ═══════════════════════════════════════════════════════════════════════════
  function LoginView() {
    return (
      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-black uppercase mb-2">
            Access Dashboard
          </h1>
          <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest leading-relaxed">
            Secure credentials required for entry
          </p>
        </div>

        <div className="space-y-4 pt-2">
          <Field
            id="login-email"
            name="email"
            label="Email Address"
            type="email"
            placeholder="operator@example.com"
            required
            autoComplete="email"
          />
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label
                htmlFor="login-password"
                className="text-[8px] font-black uppercase tracking-widest text-black"
              >
                Password
              </label>
              <button
                type="button"
                onClick={() => switchView("forgot")}
                className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors"
              >
                Forgot Password?
              </button>
            </div>
            <div className="input-focus border border-gray-200 rounded-xl transition-all">
              <input
                id="login-password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full bg-transparent px-4 py-3 text-sm font-medium text-black outline-none rounded-xl"
              />
            </div>
          </div>
        </div>

        <Feedback />
        <SubmitButton label="Access Dashboard" />

        <div className="pt-2 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            New to the Network?
          </span>
          <button
            type="button"
            onClick={() => switchView("register")}
            className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-black hover:text-[var(--brand-red)] transition-colors"
          >
            Join the Network
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </form>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VIEW: REGISTER
  // ═══════════════════════════════════════════════════════════════════════════
  function RegisterView() {
    return (
      <form onSubmit={handleRegister} className="space-y-5">
        <BackButton label="Back to Sign In" to="login" />

        <div>
          <h1 className="text-3xl font-black tracking-tighter text-black uppercase mb-2">
            Access Dashboard
          </h1>
          <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest leading-relaxed">
            Register your professional credentials
          </p>
        </div>

        <div className="space-y-4 pt-2">
          {/* Company Name + Website side by side */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              id="companyName"
              name="companyName"
              label="Company Name"
              placeholder="My Detail Co."
              required
            />
            <Field
              id="website"
              name="website"
              label="Website URL"
              type="url"
              placeholder="https://..."
            />
          </div>

          {/* Email */}
          <Field
            id="reg-email"
            name="email"
            label="Email Address"
            type="email"
            placeholder="operator@example.com"
            required
            autoComplete="email"
          />

          {/* Phone + Home Base side by side */}
          <div className="grid grid-cols-2 gap-3">
            <Field
              id="phone"
              name="phone"
              label="Phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
            />
            <Field
              id="homeBase"
              name="homeBase"
              label="Home Base"
              placeholder="Miami, FL"
            />
          </div>

          {/* Password + Confirm */}
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
            />
            <Field
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>

          {/* Specialization picker */}
          <div className="flex flex-col gap-2">
            <span className="text-[8px] font-black uppercase tracking-widest text-black">
              Specialization
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { value: "BOATS", label: "Boats", Icon: Ship },
                  { value: "CARS", label: "Cars", Icon: Car },
                  { value: "BOTH", label: "Both", Icon: Layers },
                ] as const
              ).map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSpecialization(value)}
                  className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                    specialization === value
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Info box */}
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-700 leading-relaxed">
              Account verification requires active liability insurance and a
              verifiable professional portfolio.
            </p>
          </div>
        </div>

        <Feedback />
        <SubmitButton label="Access Dashboard" />
      </form>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // VIEW: FORGOT PASSWORD
  // ═══════════════════════════════════════════════════════════════════════════
  function ForgotView() {
    return (
      <form onSubmit={handleForgot} className="space-y-5">
        <BackButton label="Back" to="login" />

        <div>
          <h1 className="text-3xl font-black tracking-tighter text-black uppercase mb-2">
            Recovery
          </h1>
          <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest leading-relaxed">
            Password Reset Protocol
          </p>
        </div>

        <p className="text-gray-500 text-[11px] font-medium leading-relaxed">
          Provide your registered email address. We will deploy instructions to
          reset your secure dashboard credentials.
        </p>

        <div className="space-y-4 pt-1">
          <Field
            id="forgot-email"
            name="email"
            label="Email Address"
            type="email"
            placeholder="operator@example.com"
            required
            autoComplete="email"
          />
        </div>

        <Feedback />
        <SubmitButton label="Send Reset Link" />
      </form>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <TypographyStyle />
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] px-4 py-12">
        {/* Card */}
        <div className="w-full max-w-md">
          <div key={animKey} className="fade-in-up bg-white rounded-[3rem] p-10 uber-shadow border border-gray-100">
            <Logo />
            {view === "login" && <LoginView />}
            {view === "register" && <RegisterView />}
            {view === "forgot" && <ForgotView />}
          </div>

          {/* Footer */}
          <p className="text-center mt-8 text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
            © 2026 DetailHub Network
          </p>
        </div>
      </div>
    </>
  );
}
