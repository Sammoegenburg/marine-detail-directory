// src/lib/seo/generateMetadata.ts
// Dynamic metadata generators for pSEO pages

import type { Metadata } from "next";

export function generateStateMetadata(params: {
  stateName: string;
  stateSlug: string;
  metaTitle?: string | null;
  metaDesc?: string | null;
}): Metadata {
  const title =
    params.metaTitle ??
    `Detailing Services in ${params.stateName} — Find Local Detailers`;
  const description =
    params.metaDesc ??
    `Find top-rated detailing companies across ${params.stateName}. Browse by city, compare services, and get free quotes from verified car and marine detailers.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${params.stateSlug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export function generateCityMetadata(params: {
  cityName: string;
  stateName: string;
  citySlug: string;
  stateSlug: string;
  metaTitle?: string | null;
  metaDesc?: string | null;
}): Metadata {
  const title =
    params.metaTitle ??
    `Detailing Services in ${params.cityName}, ${params.stateName} — Top Rated`;
  const description =
    params.metaDesc ??
    `Compare ${params.cityName} detailing companies. Read reviews, view pricing, and request free quotes from licensed car and marine detailers in ${params.cityName}, ${params.stateName}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${params.stateSlug}/${params.citySlug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export function generateServicePageMetadata(params: {
  serviceName: string;
  cityName: string;
  stateName: string;
  stateAbbr: string;
  citySlug: string;
  stateSlug: string;
  serviceSlug: string;
  metaTitle?: string | null;
  metaDesc?: string | null;
}): Metadata {
  const title =
    params.metaTitle ??
    `${params.serviceName} in ${params.cityName}, ${params.stateAbbr} — Get Free Quotes`;
  const description =
    params.metaDesc ??
    `Find the best ${params.serviceName.toLowerCase()} services in ${params.cityName}, ${params.stateName}. Compare local detailers, see reviews, and get instant free quotes.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/${params.stateSlug}/${params.citySlug}/${params.serviceSlug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}

export function generateCompanyMetadata(params: {
  companyName: string;
  cityName: string;
  stateName: string;
  slug: string;
  description?: string | null;
  averageRating?: number | null;
}): Metadata {
  const title = `${params.companyName} — Detailing Services in ${params.cityName}, ${params.stateName}`;
  const description =
    params.description?.slice(0, 160) ??
    `${params.companyName} offers professional detailing services in ${params.cityName}, ${params.stateName}. Request a free quote today.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/companies/${params.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
    },
  };
}
