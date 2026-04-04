"use client";

// src/components/auth/RegisterForm.tsx
// Registration form — handles both standard sign-up and the claim-a-listing flow

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Building2, Sparkles } from "lucide-react";

type ClaimCompany = {
  name: string;
  cityName: string;
  stateName: string;
} | null;

type Props = {
  claimSlug?: string;
  claimCompany: ClaimCompany;
};

export function RegisterForm({ claimSlug, claimCompany }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
          name: form.get("name"),
          email: form.get("email"),
          password,
          claimSlug: claimSlug ?? undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Registration failed");
      }

      const data = await res.json();

      if (data.redirectUrl) {
        // Claim flow — company already linked, go to dashboard
        router.push(data.redirectUrl);
      } else {
        // Fresh registration — go to onboarding wizard
        router.push("/login?registered=true");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  }

  const isClaiming = !!claimSlug && !!claimCompany;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F7F9] font-sans px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="bg-black text-white p-2 rounded-lg group-hover:scale-105 transition-transform">
              <Sparkles size={18} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#1d1d1f]">DetailHub</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tighter text-[#1d1d1f] mt-6">
            {isClaiming ? "Claim Your Listing" : "List your business"}
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            Already have an account?{" "}
            <Link href="/login" className="text-black font-semibold hover:underline">Sign in</Link>
          </p>
        </div>

        {/* Claim context banner */}
        {isClaiming && claimCompany && (
          <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-900">
                  You&apos;re claiming: {claimCompany.name}
                </p>
                <p className="text-xs text-blue-700 mt-0.5">
                  {claimCompany.cityName}, {claimCompany.stateName}
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  After registering, your claim will be reviewed within 24 hours.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Glassmorphic card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-semibold text-[#1d1d1f]">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Jane Smith"
                required
                className="rounded-xl border-gray-200 focus:border-gray-900 focus:ring-0 font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-[#1d1d1f]">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="jane@mydetailco.com"
                required
                className="rounded-xl border-gray-200 focus:border-gray-900 focus:ring-0 font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-[#1d1d1f]">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                required
                minLength={8}
                className="rounded-xl border-gray-200 focus:border-gray-900 focus:ring-0 font-medium"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-semibold text-[#1d1d1f]">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
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
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating account…</>
              ) : isClaiming ? (
                "Create Account & Submit Claim"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <p className="text-xs text-gray-400 text-center mt-4">
            By registering, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-gray-600">Terms of Service</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
