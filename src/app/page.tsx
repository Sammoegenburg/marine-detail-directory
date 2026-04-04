// src/app/page.tsx
import { prisma } from "@/lib/prisma";
import HomePageClient from "@/components/marketing/HomePageClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const services = await prisma.service.findMany({ orderBy: { name: "asc" } });
  const cities = await prisma.city.findMany({
    where: { isActive: true },
    include: { state: true, _count: { select: { companies: true } } },
    take: 50,
    orderBy: { companies: { _count: "desc" } },
  });
  return <HomePageClient services={services} cities={cities} />;
}
