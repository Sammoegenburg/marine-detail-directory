// src/components/dashboard/LeadUnlockButton.tsx
// Triggers lead purchase — Stripe charge wired in Phase 2

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Unlock } from "lucide-react";
import { useRouter } from "next/navigation";

type Props = {
  leadId: string;
  price: number;
};

export function LeadUnlockButton({ leadId, price }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleUnlock() {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/leads/${leadId}/unlock`, {
        method: "POST",
      });

      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to unlock lead");
      }

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-1">
      <Button
        onClick={handleUnlock}
        disabled={isLoading}
        className="w-full bg-blue-700 hover:bg-blue-800"
        size="sm"
      >
        {isLoading ? (
          <><Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> Processing...</>
        ) : (
          <><Unlock className="h-3.5 w-3.5 mr-2" /> Unlock Contact — ${price.toFixed(2)}</>
        )}
      </Button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
