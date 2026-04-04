// src/app/api/leads/route.ts
// POST: submit a quote request (public endpoint)

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { headers } from "next/headers";
import { sendNewLeadNotification } from "@/lib/brevo";

const leadSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10),
  boatSize: z.enum(["UNDER_20FT", "TWENTY_TO_30FT", "THIRTY_TO_40FT", "OVER_40FT"]),
  boatType: z.string().optional(),
  boatYear: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  boatMake: z.string().optional(),
  zipCode: z.string().length(5).regex(/^\d+$/),
  serviceId: z.string().cuid(),
  notes: z.string().max(500).optional(),
  preferredDate: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid form data", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Look up city by zip code
    const zipRecord = await prisma.zipCode.findUnique({
      where: { code: data.zipCode },
      include: { city: { include: { state: true } } },
    });

    if (!zipRecord) {
      return NextResponse.json(
        { error: "We don't currently serve this zip code." },
        { status: 422 }
      );
    }

    // Verify service exists
    const service = await prisma.service.findUnique({
      where: { id: data.serviceId },
    });

    if (!service) {
      return NextResponse.json({ error: "Invalid service" }, { status: 422 });
    }

    // Determine lead price (city/service page override > service default)
    const servicePage = await prisma.servicePage.findUnique({
      where: {
        cityId_serviceId: {
          cityId: zipRecord.city.id,
          serviceId: service.id,
        },
      },
    });

    const leadPrice = servicePage
      ? Number(servicePage.leadPrice)
      : Number(service.baseLeadPrice);

    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headersList.get("x-real-ip") ??
      null;
    const userAgent = headersList.get("user-agent") ?? null;
    const referer = headersList.get("referer") ?? null;

    const lead = await prisma.lead.create({
      data: {
        cityId: zipRecord.city.id,
        serviceId: service.id,
        status: "NEW",
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerPhone: data.customerPhone,
        boatSize: data.boatSize,
        boatType: data.boatType,
        boatYear: data.boatYear,
        boatMake: data.boatMake,
        zipCode: data.zipCode,
        notes: data.notes,
        preferredDate: data.preferredDate ? new Date(data.preferredDate) : null,
        leadPrice,
        ipAddress,
        userAgent,
        referrerUrl: referer,
        expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000), // 72-hour TTL
      },
    });

    // Broadcast to all ACTIVE companies in the city — fire and forget
    prisma.company
      .findMany({
        where: {
          cityId: zipRecord.city.id,
          status: "ACTIVE",
          email: { not: null },
        },
        select: { name: true, email: true },
      })
      .then((companies) => {
        const recipients = companies
          .filter((c): c is { name: string; email: string } => c.email !== null);

        if (recipients.length > 0) {
          return sendNewLeadNotification(
            {
              leadId: lead.id,
              cityName: zipRecord.city.name,
              stateName: zipRecord.city.state.name,
              serviceName: service.name,
              boatSize: data.boatSize,
              leadPrice,
            },
            recipients
          );
        }
      })
      .catch((err) => {
        console.error("[leads/route] Email broadcast error:", err);
      });

    return NextResponse.json({ success: true, leadId: lead.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to submit request" }, { status: 500 });
  }
}
