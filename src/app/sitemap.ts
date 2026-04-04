// src/app/sitemap.ts
// Dynamic XML sitemap — Next.js App Router convention

import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://marine-detail-directory.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [states, cities, servicePages] = await Promise.all([
    prisma.state.findMany({
      select: { slug: true },
    }),
    prisma.city.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        state: { select: { slug: true } },
      },
    }),
    prisma.servicePage.findMany({
      where: { isIndexed: true, city: { isActive: true } },
      select: {
        city: { select: { slug: true, state: { select: { slug: true } } } },
        service: { select: { slug: true } },
      },
    }),
  ]);

  return [
    // Homepage
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },

    // State hubs: /florida
    ...states.map((state) => ({
      url: `${BASE_URL}/${state.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),

    // City hubs: /florida/miami
    ...cities.map((city) => ({
      url: `${BASE_URL}/${city.state.slug}/${city.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),

    // Service pages: /florida/miami/hull-cleaning
    ...servicePages.map((page) => ({
      url: `${BASE_URL}/${page.city.state.slug}/${page.city.slug}/${page.service.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    // Note: company profile URLs intentionally excluded (blind marketplace model)
  ];
}
