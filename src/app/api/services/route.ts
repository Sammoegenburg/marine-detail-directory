// src/app/api/services/route.ts
// Public endpoint: returns all services for lead intake form

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const services = await prisma.service.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(services);
}
