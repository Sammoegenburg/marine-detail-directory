"use client";

// src/components/auth/RegisterForm.tsx
// Register page wrapper — used by /register route for standard + claim flows.
// Renders the same tactical UI as the login page's register view.

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Loader2, Ship, Car, Layers } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ClaimCompany = {
  name: string;
  cityName: string;
  stateName: string;
} | null;

type Props = {
  claimSlug?: string;
  claimCompany: ClaimCompany;
};

type Specialization = "BOATS" | "CARS" | "BOTH";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
};

function Field({
  label,
  id,
  name,
  type = "text",
  placeholder,
  required,
  minLength,
  autoComplete,
  value,
  onChange,
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
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[8px] font-black uppercase tracking-widest text-black">
        {label}
      </label>
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

export function RegisterForm({ claimSlug, claimCompany }: Props) {
  const router = useRouter();

  const [form, setForm] = useState({
    companyName: claimCompany?.name ?? "",
    website: "",
    email: "",
    phone: "",
    homeBase: claimCompany ? `${claimCompany.cityName}, ${claimCompany.stateName}` : "",
    password: "",
    confirmPassword: "",
  });
  const [specialization, setSpecialization] = useState<Specialization>("BOTH");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirmPassword) {
      setError("PASSWORDS DO NOT MATCH");
      return;
    }
    if (form.password.length < 8) {
      setError("PASSWORD MUST BE AT LEAST 8 CHARACTERS");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName,
          website: form.website || undefined,
          email: form.email,
          phone: form.phone || undefined,
          homeBase: form.homeBase || undefined,
          specialization,
          password: form.password,
          claimSlug: claimSlug ?? undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError((data.error ?? "REGISTRATION FAILED").toUpperCase());
        setLoading(false);
        return;
      }

      // Auto sign-in
      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/login?registered=true");
        return;
      }

      router.push(data.redirectUrl ?? "/company");
    } catch {
      setError("SYSTEM ERROR — PLEASE TRY AGAIN");
      setLoading(false);
    }
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        :root { --font-main: 'Inter', sans-serif; --brand-red: #ff385c; }
        .auth-root { font-family: var(--font-main); -webkit-font-smoothing: antialiased; }
        .uber-shadow { box-shadow: 0 40px 100px -20px rgba(0,0,0,0.12), 0 20px 50px -20px rgba(0,0,0,0.08); }
        .input-focus:focus-within { border-color: #000000; box-shadow: 0 0 0 2px rgba(0,0,0,0.05); }
        .auth-input::placeholder { color: #CBD5E1; font-weight: 500; }
      `}} />
      <div className="auth-root min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <img
                src="/images/logo.png"
                alt="DetailHub"
                className="h-8 w-8 group-hover:scale-105 transition-transform"
              />
              <span className="text-sm font-black uppercase tracking-widest text-black">
                DetailHub
              </span>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white rounded-[3rem] p-10 uber-shadow border border-gray-100">
            <motion.div {...fadeInUp} className="w-full">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-black transition-colors mb-6"
              >
                <ArrowLeft size={12} /> Back to Sign In
              </Link>

              <div className="mb-7">
                <h1 className="text-3xl font-black tracking-tighter text-black uppercase mb-2">
                  Access Dashboard
                </h1>
                <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest leading-relaxed">
                  Register your professional credentials
                </p>
              </div>

              {claimCompany && (
                <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-700 leading-relaxed">
                    Claiming: {claimCompany.name} — {claimCompany.cityName}, {claimCompany.stateName}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Company Name + Website */}
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    id="companyName"
                    name="companyName"
                    label="Company Name"
                    placeholder="My Detail Co."
                    required
                    value={form.companyName}
                    onChange={(v) => update("companyName", v)}
                  />
                  <Field
                    id="website"
                    name="website"
                    label="Website URL"
                    type="url"
                    placeholder="https://..."
                    value={form.website}
                    onChange={(v) => update("website", v)}
                  />
                </div>

                {/* Email */}
                <Field
                  id="email"
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="operator@example.com"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(v) => update("email", v)}
                />

                {/* Phone + Home Base */}
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    id="phone"
                    name="phone"
                    label="Phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={form.phone}
                    onChange={(v) => update("phone", v)}
                  />
                  <Field
                    id="homeBase"
                    name="homeBase"
                    label="Home Base"
                    placeholder="Miami, FL"
                    value={form.homeBase}
                    onChange={(v) => update("homeBase", v)}
                  />
                </div>

                {/* Password + Confirm */}
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    id="password"
                    name="password"
                    label="Password"
                    type="password"
                    placeholder="Min. 8 chars"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(v) => update("password", v)}
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
                    onChange={(v) => update("confirmPassword", v)}
                  />
                </div>

                {/* Specialization */}
                <div className="flex flex-col gap-2">
                  <span className="text-[8px] font-black uppercase tracking-widest text-black">Specialization</span>
                  <div className="grid grid-cols-3 gap-2">
                    {(
                      [
                        { value: "BOATS" as Specialization, label: "Boats", Icon: Ship },
                        { value: "CARS" as Specialization, label: "Cars", Icon: Car },
                        { value: "BOTH" as Specialization, label: "Both", Icon: Layers },
                      ]
                    ).map(({ value, label, Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setSpecialization(value)}
                        className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
                          specialization === value
                            ? "border-black bg-black text-white"
                            : "border-gray-200 bg-white text-gray-500 hover:border-black hover:text-black"
                        }`}
                      >
                        <Icon size={15} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Info box */}
                <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-blue-700 leading-relaxed">
                    Account verification requires active liability insurance and a verifiable professional portfolio.
                  </p>
                </div>

                {error && (
                  <p className="text-[11px] font-black uppercase tracking-widest text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-black text-white rounded-xl py-4 text-[11px] font-black uppercase tracking-widest hover:bg-[var(--brand-red)] active:scale-[0.98] transition-all disabled:opacity-60"
                >
                  {loading
                    ? <><Loader2 size={14} className="animate-spin" /> REGISTERING...</>
                    : <>Access Dashboard <ArrowRight size={14} /></>
                  }
                </button>
              </form>
            </motion.div>
          </div>

          <p className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
            © 2026 DetailHub Network
          </p>
        </div>
      </div>
    </>
  );
}
