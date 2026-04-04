"use client";

// src/app/(auth)/login/page.tsx

import { Suspense } from "react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const registered = searchParams.get("registered") === "true";
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
      } else if (nextPath) {
        router.push(nextPath);
      } else {
        router.push("/company");
      }
    } catch {
      router.push(nextPath ?? "/company");
    }
  }

  return (
    <div className="w-full max-w-sm">
      {/* Logo */}
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 group">
          <img src="/images/logo.png" alt="DetailHub" className="h-8 w-8 group-hover:scale-105 transition-transform" />
          <span className="text-xl font-bold tracking-tight text-[#1d1d1f]">DetailHub</span>
        </Link>
        <h1 className="text-2xl font-bold tracking-tighter text-[#1d1d1f] mt-6">Sign in to your account</h1>
        {registered && (
          <p className="text-green-600 text-sm mt-2 font-medium bg-green-50 rounded-xl px-3 py-2">
            Account created! Sign in to continue setup.
          </p>
        )}
        <p className="text-gray-500 text-sm mt-1 font-medium">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-black font-semibold hover:underline">Register</Link>
        </p>
      </div>

      {/* Glassmorphic card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-[#1d1d1f]">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="rounded-xl border-gray-200 focus:border-gray-900 focus:ring-0 font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-[#1d1d1f]">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="current-password"
              className="rounded-xl border-gray-200 focus:border-gray-900 focus:ring-0 font-medium"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 font-medium">{error}</p>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black hover:bg-gray-800 text-white rounded-full font-semibold py-2.5 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing in...</>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F9] font-sans px-4">
      <Suspense fallback={
        <div className="w-full max-w-sm text-center text-gray-400 font-medium">Loading...</div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
