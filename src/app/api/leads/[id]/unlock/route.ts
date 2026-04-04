// src/app/api/leads/[id]/unlock/route.ts
// POST: company unlocks a lead via Stripe off-session PaymentIntent

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, createPaymentIntent } from "@/lib/stripe";
import Stripe from "stripe";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: leadId } = await params;

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
  });

  if (!company || company.status !== "ACTIVE") {
    return NextResponse.json(
      { error: "Your listing must be active to purchase leads." },
      { status: 403 }
    );
  }

  if (!company.stripeCustomerId) {
    return NextResponse.json(
      { error: "Add a payment method first.", code: "NO_PAYMENT_METHOD" },
      { status: 402 }
    );
  }

  // Verify lead exists, is in the company's service area, and is unlockable
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: { service: true },
  });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  if (lead.cityId !== company.cityId) {
    return NextResponse.json(
      { error: "This lead is outside your service area." },
      { status: 403 }
    );
  }

  if (lead.status === "EXPIRED" || lead.expiresAt < new Date()) {
    return NextResponse.json({ error: "This lead has expired." }, { status: 410 });
  }

  if (!["NEW", "AVAILABLE"].includes(lead.status)) {
    return NextResponse.json(
      { error: "This lead is no longer available." },
      { status: 409 }
    );
  }

  // Check not already purchased by this company
  const existing = await prisma.leadPurchase.findUnique({
    where: { leadId_companyId: { leadId, companyId: company.id } },
  });

  if (existing) {
    // Already purchased — return contact info
    return NextResponse.json({
      alreadyPurchased: true,
      customerName: lead.customerName,
      customerEmail: lead.customerEmail,
      customerPhone: lead.customerPhone,
    });
  }

  // 3-tier lead price fallback: ServicePage → Service.baseLeadPrice
  const servicePage = await prisma.servicePage.findUnique({
    where: { cityId_serviceId: { cityId: lead.cityId, serviceId: lead.serviceId } },
  });
  const leadPrice = Number(servicePage?.leadPrice ?? lead.service.baseLeadPrice);
  const amountCents = Math.round(leadPrice * 100);

  // Get customer's default payment method
  const customer = await stripe.customers.retrieve(company.stripeCustomerId) as Stripe.Customer;
  const defaultPmId = customer.invoice_settings?.default_payment_method as string | null;

  if (!defaultPmId) {
    return NextResponse.json(
      { error: "Add a payment method first.", code: "NO_PAYMENT_METHOD" },
      { status: 402 }
    );
  }

  // Charge the company's card
  let paymentIntent: Stripe.PaymentIntent;
  try {
    paymentIntent = await createPaymentIntent({
      amountCents,
      customerId: company.stripeCustomerId,
      paymentMethodId: defaultPmId,
      metadata: {
        leadId,
        companyId: company.id,
        serviceId: lead.serviceId,
      },
    });
  } catch (err) {
    if (err instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: err.message ?? "Payment failed. Please check your payment method." },
        { status: 402 }
      );
    }
    return NextResponse.json(
      { error: "Payment failed. Please check your payment method." },
      { status: 402 }
    );
  }

  if (paymentIntent.status !== "succeeded") {
    return NextResponse.json(
      { error: "Payment did not complete. Please try again." },
      { status: 402 }
    );
  }

  // Atomic: create purchase record + update lead status
  await prisma.$transaction([
    prisma.leadPurchase.create({
      data: {
        leadId,
        companyId: company.id,
        amountCharged: leadPrice,
        stripePaymentIntentId: paymentIntent.id,
        paidAt: new Date(),
      },
    }),
    prisma.lead.update({
      where: { id: leadId },
      data: { status: "PURCHASED" },
    }),
  ]);

  return NextResponse.json({
    success: true,
    customerName: lead.customerName,
    customerEmail: lead.customerEmail,
    customerPhone: lead.customerPhone,
  });
}
