// src/app/api/stripe/setup/route.ts
// POST: create Stripe SetupIntent for company payment method storage

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe, createStripeCustomer, createSetupIntent } from "@/lib/stripe";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
    include: { user: true },
  });

  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 });
  }

  let stripeCustomerId = company.stripeCustomerId;

  // Create Stripe customer if this company doesn't have one yet
  if (!stripeCustomerId) {
    const customer = await createStripeCustomer({
      email: company.user?.email ?? company.email ?? "",
      name: company.name,
      companyId: company.id,
    });
    stripeCustomerId = customer.id;

    await prisma.company.update({
      where: { id: company.id },
      data: { stripeCustomerId },
    });
  }

  const setupIntent = await createSetupIntent(stripeCustomerId);

  return NextResponse.json({ clientSecret: setupIntent.client_secret });
}

export async function GET() {
  // Return current payment method details for the authenticated company
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
  });

  if (!company?.stripeCustomerId) {
    return NextResponse.json({ paymentMethod: null });
  }

  try {
    const customer = await stripe.customers.retrieve(company.stripeCustomerId) as import("stripe").Stripe.Customer;
    const defaultPmId = customer.invoice_settings?.default_payment_method as string | null;

    if (!defaultPmId) {
      return NextResponse.json({ paymentMethod: null });
    }

    const pm = await stripe.paymentMethods.retrieve(defaultPmId);
    return NextResponse.json({
      paymentMethod: pm.card
        ? {
            brand: pm.card.brand,
            last4: pm.card.last4,
            expMonth: pm.card.exp_month,
            expYear: pm.card.exp_year,
          }
        : null,
    });
  } catch {
    return NextResponse.json({ paymentMethod: null });
  }
}
