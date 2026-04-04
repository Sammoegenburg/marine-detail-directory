// src/app/page.tsx
// Homepage — lead-form-first blind marketplace

import { prisma } from "@/lib/prisma";
import { HomePageClient } from "@/components/marketing/HomePageClient";

export default async function HomePage() {
  const [services, featuredCities] = await Promise.all([
    prisma.service.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.city.findMany({
      where: { isActive: true },
      select: { name: true, slug: true, state: { select: { slug: true } } },
      orderBy: [{ population: "desc" }, { name: "asc" }],
      take: 24,
    }),
  ]);

  return <HomePageClient services={services} featuredCities={featuredCities} />;
}
