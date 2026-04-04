"use client";

// src/components/auth/RegisterForm.tsx
// Registration form — handles both standard sign-up and the claim-a-listing flow

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Anchor, Loader2, Building2 } from "lucide-react";

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
        router.push(data.redirectUrl);
      } else {
        router.push("/login?registered=true");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsLoading(false);
    }
  }

  const isClaiming = !!claimSlug && !!claimCompany;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-700 font-bold text-xl">
            <Anchor className="h-5 w-5" />
            MarineDetailDirectory
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 mt-4">
            {isClaiming ? "Claim Your Listing" : "List your business"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-700 hover:underline">Sign in</Link>
          </p>
        </div>

        {/* Claim context banner */}
        {isClaiming && claimCompany && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
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

        <div className="bg-white rounded-xl border shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" placeholder="Jane Smith" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="jane@mydetailco.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                required
                minLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-700 hover:bg-blue-800"
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

          <p className="text-xs text-slate-400 text-center mt-4">
            By registering, you agree to our{" "}
            <Link href="/terms" className="underline">Terms of Service</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
