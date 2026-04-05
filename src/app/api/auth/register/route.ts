// src/app/api/auth/register/route.ts
// POST: create a new COMPANY user account, optionally claiming an unclaimed listing

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const registerSchema = z.object({
  companyName: z.string().min(2),
  website: z.string().optional(),
  email: z.string().email(),
  phone: z.string().optional(),
  homeBase: z.string().optional(),
  specialization: z.string().optional(),
  password: z.string().min(8),
  claimSlug: z.string().optional(),
  emailConsent: z.boolean().optional(),
  smsConsent: z.boolean().optional(),
  marketingConsent: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { companyName, website, email, phone, homeBase, specialization, password, claimSlug, emailConsent, smsConsent, marketingConsent } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // If claiming, verify the company is still unclaimed before creating the user
    let claimCompany: { id: string } | null = null;
    if (claimSlug) {
      claimCompany = await prisma.company.findUnique({
        where: { slug: claimSlug },
        select: { id: true, status: true },
      }) as { id: string; status: string } | null;

      if (!claimCompany) {
        return NextResponse.json(
          { error: "Company not found" },
          { status: 404 }
        );
      }

      if ((claimCompany as { id: string; status: string }).status !== "UNCLAIMED") {
        return NextResponse.json(
          { error: "This listing has already been claimed." },
          { status: 409 }
        );
      }
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name: companyName,
        email,
        passwordHash,
        role: "COMPANY",
        companyName,
        website: website ?? null,
        phone: phone ?? null,
        homeBase: homeBase ?? null,
        specialization: specialization ?? null,
        emailConsent: emailConsent ?? true,
        smsConsent: smsConsent ?? false,
        marketingConsent: marketingConsent ?? false,
      },
    });

    // Attach user to the company and set status to PENDING for admin review
    if (claimSlug && claimCompany) {
      await prisma.company.update({
        where: { id: claimCompany.id },
        data: {
          userId: user.id,
          status: "PENDING",
          email: email,
        },
      });

      return NextResponse.json(
        { success: true, redirectUrl: "/company?claimed=true" },
        { status: 201 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
