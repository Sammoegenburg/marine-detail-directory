// src/app/api/companies/claim/route.ts
// POST: authenticated company user claims an unclaimed listing

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const claimSchema = z.object({
  companyId: z.string().cuid(),
  message: z.string().max(1000).optional(),
  proofUrl: z.string().url().optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = claimSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { companyId, message, proofUrl } = parsed.data;

    const company = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    if (company.status !== "UNCLAIMED") {
      return NextResponse.json(
        { error: "This listing has already been claimed." },
        { status: 409 }
      );
    }

    // Check user doesn't already have a listing
    const existingCompany = await prisma.company.findUnique({
      where: { userId: session.user.id },
    });

    if (existingCompany) {
      return NextResponse.json(
        { error: "Your account is already linked to a listing." },
        { status: 409 }
      );
    }

    // Check no pending claim exists
    const existingClaim = await prisma.claimRequest.findUnique({
      where: { companyId },
    });

    if (existingClaim) {
      return NextResponse.json(
        { error: "A claim request for this listing is already pending review." },
        { status: 409 }
      );
    }

    await prisma.$transaction([
      prisma.claimRequest.create({
        data: {
          companyId,
          userId: session.user.id,
          message,
          proofUrl,
          status: "PENDING",
        },
      }),
      prisma.company.update({
        where: { id: companyId },
        data: { status: "PENDING" },
      }),
    ]);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Claim submission failed" }, { status: 500 });
  }
}
