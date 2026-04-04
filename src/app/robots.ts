// src/app/robots.ts
// Robots.txt — Next.js App Router convention

import { MetadataRoute } from "next";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://marine-detail-directory.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/admin/", "/company", "/company/", "/api/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
