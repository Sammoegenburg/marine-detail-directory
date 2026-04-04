// src/app/(marketing)/[state]/[city]/page.tsx
// City hub: /florida/fort-lauderdale

export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateCityMetadata } from "@/lib/seo/generateMetadata";
import { interpolate, CITY_HUB_TEMPLATE } from "@/lib/seo/templates";
import { CompanyCard } from "@/components/marketing/CompanyCard";
import { LeadForm } from "@/components/marketing/LeadForm";
import { LocalBusinessSchema } from "@/components/seo/LocalBusinessSchema";
import Link from "next/link";
import type { Metadata } from "next";
import type { PublicCompany } from "@/types";

type Props = {
  params: Promise<{ state: string; city: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug, city: citySlug } = await params;
  const city = await prisma.city.findFirst({
    where: { slug: citySlug, state: { slug: stateSlug } },
    include: { state: true },
  });
  if (!city) return {};
  return generateCityMetadata({
    cityName: city.name,
    stateName: city.state.name,
    citySlug: city.slug,
    stateSlug: stateSlug,
    metaTitle: city.metaTitle,
    metaDesc: city.metaDesc,
  });
}

export default async function CityHubPage({ params }: Props) {
  const { state: stateSlug, city: citySlug } = await params;

  const city = await prisma.city.findFirst({
    where: { slug: citySlug, isActive: true, state: { slug: stateSlug } },
    include: {
      state: true,
      pages: { include: { service: true } },
      companies: {
        where: { status: "ACTIVE" },
        orderBy: [{ isFeatured: "desc" }, { averageRating: "desc" }],
        include: {
          city: { include: { state: true } },
          services: { include: { service: true }, where: { isActive: true } },
        },
      },
    },
  });

  if (!city) notFound();

  const services = await prisma.service.findMany({ orderBy: { name: "asc" } });

  const content = interpolate(
    city.contentBlock ?? CITY_HUB_TEMPLATE,
    { city: city.name, state: city.state.name, stateAbbr: city.state.abbreviation, service: "", serviceLower: "" }
  );

  const publicCompanies: PublicCompany[] = city.companies.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    status: c.status as PublicCompany["status"],
    description: c.description,
    website: c.website,
    logoUrl: c.logoUrl,
    coverImageUrl: c.coverImageUrl,
    photoUrls: c.photoUrls,
    yearEstablished: c.yearEstablished,
    isInsured: c.isInsured,
    isFeatured: c.isFeatured,
    averageRating: c.averageRating ? Number(c.averageRating) : null,
    reviewCount: c.reviewCount,
    city: { name: c.city.name, slug: c.city.slug, state: { name: c.city.state.name, slug: c.city.state.slug } },
    services: c.services.map((cs) => ({ service: { name: cs.service.name, slug: cs.service.slug }, customPrice: cs.customPrice })),
  }));

  return (
    <>
      <LocalBusinessSchema
        name={`Boat Detailing in ${city.name}`}
        url={`${process.env.NEXT_PUBLIC_BASE_URL}/${stateSlug}/${citySlug}`}
        city={city.name}
        state={city.state.abbreviation}
        latitude={city.latitude ? Number(city.latitude) : undefined}
        longitude={city.longitude ? Number(city.longitude) : undefined}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href={`/${stateSlug}`}>{city.state.name}</Link>
          <span>/</span>
          <span>{city.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold text-slate-900 mb-3">
              Boat Detailing in {city.name}, {city.state.abbreviation}
            </h1>
            <p className="text-lg text-slate-600 mb-8">{content}</p>

            {city.pages.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Services in {city.name}</h2>
                <div className="flex flex-wrap gap-2">
                  {city.pages.map((page) => (
                    <Link
                      key={page.id}
                      href={`/${stateSlug}/${citySlug}/${page.service.slug}`}
                      className="rounded-full border px-4 py-1.5 text-sm font-medium text-slate-700 hover:border-blue-400 hover:text-blue-700 transition-colors"
                    >
                      {page.service.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              Detailers in {city.name} ({publicCompanies.length})
            </h2>

            {publicCompanies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {publicCompanies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-slate-400">
                No verified detailers listed yet in {city.name}.
              </div>
            )}
          </div>

          <aside>
            <div className="sticky top-24 rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-1">Get a Free Quote</h3>
              <p className="text-sm text-slate-500 mb-4">
                Tell us about your boat and we'll connect you with local detailers.
              </p>
              <LeadForm services={services.map((s) => ({ id: s.id, name: s.name }))} />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
