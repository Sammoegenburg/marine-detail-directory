// src/app/api/webhooks/stripe/route.ts
// Stripe webhook handler — verifies signature and processes payment events

import { NextRequest, NextResponse } from "next/server";
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  if (!STRIPE_WEBHOOK_SECRET) {
    console.error("[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    console.error("[Stripe Webhook] Signature verification failed:", msg);
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const pi = event.data.object as Stripe.PaymentIntent;
        const { leadId, companyId } = pi.metadata;

        if (leadId && companyId) {
          // Update paidAt timestamp on the LeadPurchase record
          await prisma.leadPurchase.updateMany({
            where: { stripePaymentIntentId: pi.id },
            data: { paidAt: new Date() },
          });
        }
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        const piId = typeof charge.payment_intent === "string"
          ? charge.payment_intent
          : charge.payment_intent?.id;

        if (piId) {
          await prisma.leadPurchase.updateMany({
            where: { stripePaymentIntentId: piId },
            data: {
              isRefunded: true,
              refundedAt: new Date(),
              refundReason: charge.refunds?.data?.[0]?.reason ?? "refunded",
            },
          });
        }
        break;
      }

      case "setup_intent.succeeded": {
        // Set the new payment method as the customer's default
        const si = event.data.object as Stripe.SetupIntent;
        const customerId = si.customer as string | null;
        const pmId = si.payment_method as string | null;

        if (customerId && pmId) {
          await stripe.customers.update(customerId, {
            invoice_settings: { default_payment_method: pmId },
          });
          console.log(
            `[Stripe Webhook] Default PM set: customer=${customerId} pm=${pmId}`
          );
        }
        break;
      }

      case "payment_method.attached": {
        const pm = event.data.object as Stripe.PaymentMethod;
        console.log(
          `[Stripe Webhook] payment_method.attached: ${pm.id} → customer=${pm.customer}`
        );
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (err) {
    console.error(`[Stripe Webhook] Handler error for ${event.type}:`, err);
    // Return 200 so Stripe doesn't retry — log and handle async failures separately
  }

  return NextResponse.json({ received: true });
}
