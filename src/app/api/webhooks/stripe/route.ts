// src/app/api/webhooks/stripe/route.ts
// Stripe webhook handler — Phase 1 stub, implemented in Phase 2

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Phase 2: verify Stripe signature, handle payment events
  // Events to handle:
  //   payment_intent.succeeded   -> mark LeadPurchase.paidAt, update lead status
  //   payment_intent.failed      -> notify company
  //   customer.subscription.*    -> future subscription billing
  //   charge.refunded            -> update LeadPurchase.isRefunded

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature || !body) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  // Placeholder — Stripe client and event verification implemented in Phase 2
  console.log("[Stripe Webhook] Received event — Phase 2 handler pending");

  return NextResponse.json({ received: true });
}
