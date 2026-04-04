"use client";

// src/components/dashboard/PaymentMethodForm.tsx
// Stripe Elements form for adding/updating a payment method

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type CurrentPaymentMethod = {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
} | null;

// Inner form rendered inside <Elements>
function SetupForm({ onSuccess }: { onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError(null);

    const result = await stripe.confirmSetup({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/company/billing?setup=success`,
      },
      redirect: "if_required",
    });

    if (result.error) {
      setError(result.error.message ?? "Setup failed. Please try again.");
      toast.error(result.error.message ?? "Setup failed.");
      setSubmitting(false);
    } else {
      toast.success("Payment method saved successfully!");
      onSuccess();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>
      )}
      <button
        type="submit"
        disabled={!stripe || submitting}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving…
          </>
        ) : (
          "Save Payment Method"
        )}
      </button>
    </form>
  );
}

export function PaymentMethodForm({
  currentPaymentMethod,
}: {
  currentPaymentMethod: CurrentPaymentMethod;
}) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAddCard() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/setup", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to initialize setup");
      setClientSecret(data.clientSecret);
      setShowForm(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to start setup");
    } finally {
      setLoading(false);
    }
  }

  function handleSuccess() {
    setShowForm(false);
    setClientSecret(null);
    router.refresh();
  }

  const brandLabel = currentPaymentMethod
    ? currentPaymentMethod.brand.charAt(0).toUpperCase() +
      currentPaymentMethod.brand.slice(1)
    : null;

  return (
    <div className="space-y-4">
      {currentPaymentMethod && !showForm && (
        <div className="flex items-center justify-between rounded-lg border bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <CreditCard className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-sm font-medium text-slate-900">
                {brandLabel} ending in {currentPaymentMethod.last4}
              </p>
              <p className="text-xs text-slate-500">
                Expires {currentPaymentMethod.expMonth}/{currentPaymentMethod.expYear}
              </p>
            </div>
          </div>
          <button
            onClick={handleAddCard}
            disabled={loading}
            className="text-sm text-blue-600 hover:underline font-medium"
          >
            {loading ? "Loading…" : "Replace"}
          </button>
        </div>
      )}

      {!currentPaymentMethod && !showForm && (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <CreditCard className="h-8 w-8 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 mb-4">
            No payment method on file. Add a card to start purchasing leads.
          </p>
          <button
            onClick={handleAddCard}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60 transition-colors"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Loading…</>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                Add Payment Method
              </>
            )}
          </button>
        </div>
      )}

      {showForm && clientSecret && (
        <div className="rounded-lg border bg-white p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Enter card details</h3>
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: { theme: "stripe" } }}
          >
            <SetupForm onSuccess={handleSuccess} />
          </Elements>
          <button
            onClick={() => { setShowForm(false); setClientSecret(null); }}
            className="mt-3 text-xs text-slate-400 hover:text-slate-600"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
