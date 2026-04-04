// src/app/api/company/profile/route.ts
// PUT: update company profile fields

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2).max(120),
  address: z.string().optional(),
  phone: z.string().min(7).max(20).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional().or(z.literal("")),
  description: z.string().max(1000).optional(),
  services: z.array(z.string()).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
    include: { city: { include: { state: true } }, services: { include: { service: true } } },
  });

  return NextResponse.json({ company });
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const company = await prisma.company.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!company) {
    return NextResponse.json({ error: "No company found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { services, ...companyData } = parsed.data;

  await prisma.company.update({
    where: { id: company.id },
    data: {
      name: companyData.name,
      address: companyData.address ?? null,
      phone: companyData.phone ?? null,
      email: companyData.email ?? null,
      website: companyData.website || null,
      description: companyData.description ?? null,
    },
  });

  // Update services if provided
  if (services !== undefined) {
    const VALID_CATEGORIES = new Set([
      "FULL_DETAIL", "HULL_CLEANING", "INTERIOR_DETAIL", "TEAK_RESTORATION",
      "WAXING_POLISHING", "BOTTOM_PAINT", "CANVAS_CLEANING", "BRIGHTWORK",
      "CAR_FULL_DETAIL", "CAR_INTERIOR", "CAR_EXTERIOR",
      "PAINT_CORRECTION", "CERAMIC_COATING", "WINDOW_TINT",
    ]);

    const validServices = services.filter((s) => VALID_CATEGORIES.has(s));

    if (validServices.length > 0) {
      const serviceRecords = await prisma.service.findMany({
        where: { category: { in: validServices as never[] } },
        select: { id: true },
      });

      // Remove all existing services and replace
      await prisma.companyService.deleteMany({ where: { companyId: company.id } });

      if (serviceRecords.length > 0) {
        await prisma.companyService.createMany({
          data: serviceRecords.map((s) => ({
            companyId: company.id,
            serviceId: s.id,
            isActive: true,
          })),
          skipDuplicates: true,
        });
      }
    }
  }

  return NextResponse.json({ success: true });
}
