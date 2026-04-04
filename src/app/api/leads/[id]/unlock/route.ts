// src/app/api/leads/[id]/unlock/route.ts
// POST: company unlocks a lead (Phase 1 stub — Stripe charge wired in Phase 2)

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  if (lead.status === "EXPIRED" || lead.expiresAt < new Date()) {
    return NextResponse.json({ error: "This lead has expired." }, { status: 410 });
  }

  // Check not already purchased
  const existing = await prisma.leadPurchase.findUnique({
    where: { leadId_companyId: { leadId, companyId: company.id } },
  });

  if (existing) {
    return NextResponse.json(
      { error: "You have already purchased this lead." },
      { status: 409 }
    );
  }

  const leadPrice = Number(lead.leadPrice);

  // Phase 1: deduct from credit balance if available
  if (Number(company.leadCreditBalance) < leadPrice) {
    return NextResponse.json(
      {
        error: "Insufficient credit balance. Please add funds in the Billing section.",
        code: "INSUFFICIENT_CREDITS",
      },
      { status: 402 }
    );
  }

  // Atomic: deduct balance + create purchase record
  await prisma.$transaction([
    prisma.company.update({
      where: { id: company.id },
      data: { leadCreditBalance: { decrement: leadPrice } },
    }),
    prisma.leadPurchase.create({
      data: {
        leadId,
        companyId: company.id,
        amountCharged: leadPrice,
        paidAt: new Date(),
      },
    }),
    prisma.lead.update({
      where: { id: leadId },
      data: { status: "PURCHASED" },
    }),
  ]);

  return NextResponse.json({ success: true });
}
