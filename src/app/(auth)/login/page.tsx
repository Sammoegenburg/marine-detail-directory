// src/app/(auth)/login/page.tsx

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ship, Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
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
    } else {
      router.push("/company");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F9] font-sans px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="bg-black text-white p-2 rounded-lg group-hover:scale-105 transition-transform">
              <Ship size={18} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1d1d1f]">MarineDirectory.</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tighter text-[#1d1d1f] mt-6">Sign in to your account</h1>
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
    </div>
  );
}
