"use client";
// src/components/dashboard/FeatureButton.tsx

import { useState } from "react";
import { useRouter } from "next/navigation";

export function FeatureButton({
  companyId,
  isFeatured,
}: {
  companyId: string;
  isFeatured: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleToggle() {
    setLoading(true);
    await fetch(`/api/admin/companies/${companyId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "feature", isFeatured: !isFeatured }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50 ${
        isFeatured
          ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      }`}
    >
      {loading ? "…" : isFeatured ? "★ Featured" : "Feature"}
    </button>
  );
}
