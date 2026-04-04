"use client";

// src/components/dashboard/LeadUnlockButton.tsx
// Handles the lead unlock flow: charge → reveal contact info inline

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Unlock, Phone, Mail, User } from "lucide-react";

type ContactInfo = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

type Props = {
  leadId: string;
  price: number;
};

export function LeadUnlockButton({ leadId, price }: Props) {
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState<ContactInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleUnlock() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/leads/${leadId}/unlock`, { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        const msg = data.error ?? "Something went wrong. Please try again.";
        if (data.code === "NO_PAYMENT_METHOD") {
          setError("No payment method on file. Add a card in Billing → Payment Method.");
        } else {
          setError(msg);
        }
        toast.error(msg);
        return;
      }

      setContact({
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
      });
      toast.success("Lead unlocked! Contact info is now visible.");
    } catch {
      const msg = "Network error. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (contact) {
    return (
      <div className="mt-3 rounded-lg bg-green-50 border border-green-200 p-3 space-y-1.5">
        <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">
          Contact Unlocked
        </p>
        <div className="flex items-center gap-2 text-sm text-slate-800">
          <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          {contact.customerName}
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-800">
          <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <a href={`tel:${contact.customerPhone}`} className="hover:text-blue-600">
            {contact.customerPhone}
          </a>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-800">
          <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
          <a href={`mailto:${contact.customerEmail}`} className="hover:text-blue-600 break-all">
            {contact.customerEmail}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 space-y-1">
      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded px-2 py-1">{error}</p>
      )}
      <button
        onClick={handleUnlock}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing…
          </>
        ) : (
          <>
            <Unlock className="h-4 w-4" />
            Unlock for ${price.toFixed(2)}
          </>
        )}
      </button>
    </div>
  );
}
