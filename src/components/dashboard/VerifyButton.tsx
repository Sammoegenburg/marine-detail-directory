"use client";
// src/components/dashboard/VerifyButton.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";

export function VerifyButton({ companyId }: { companyId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleVerify() {
    setLoading(true);
    await fetch(`/api/admin/companies/${companyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify" }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleVerify}
      disabled={loading}
      className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
    >
      {loading ? "…" : "Verify"}
    </button>
  );
}
