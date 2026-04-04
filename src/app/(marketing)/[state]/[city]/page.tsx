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
import { FadeUp } from "@/components/marketing/FadeUp";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
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
        select: {
          id: true,
          name: true,
          slug: true,
          status: true,
          description: true,
          logoUrl: true,
          coverImageUrl: true,
          photoUrls: true,
          yearEstablished: true,
          isInsured: true,
          isFeatured: true,
          averageRating: true,
          reviewCount: true,
          city: {
            select: {
              name: true,
              slug: true,
              state: { select: { name: true, slug: true } },
            },
          },
          services: {
            where: { isActive: true },
            select: {
              customPrice: true,
              service: { select: { name: true, slug: true } },
            },
          },
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

      <div className="min-h-screen bg-[#F7F7F9] font-sans">
        {/* Hero */}
        <section className="pt-16 pb-10 px-6 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 font-medium flex-wrap">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/${stateSlug}`} className="hover:text-black transition-colors">{city.state.name}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#1d1d1f]">{city.name}</span>
          </div>

          <FadeUp>
            <h1 className="text-5xl md:text-[64px] font-bold tracking-tighter text-[#1d1d1f] mb-4 leading-[1.05]">
              Boat Detailing in {city.name}, {city.state.abbreviation}
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-medium tracking-tight max-w-2xl leading-relaxed mb-8">
              {content}
            </p>
          </FadeUp>

          {city.pages.length > 0 && (
            <FadeUp delay={100}>
              <div className="mb-2">
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Services in {city.name}</p>
                <div className="flex flex-wrap gap-2">
                  {city.pages.map((page) => (
                    <Link
                      key={page.id}
                      href={`/${stateSlug}/${citySlug}/${page.service.slug}`}
                      className="rounded-full border border-gray-200 bg-white px-4 py-1.5 text-sm font-semibold text-gray-600 hover:border-gray-900 hover:text-gray-900 transition-all shadow-sm"
                    >
                      {page.service.name}
                    </Link>
                  ))}
                </div>
              </div>
            </FadeUp>
          )}
        </section>

        {/* Two-column layout */}
        <section className="px-6 pb-20 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Company listings */}
            <div className="lg:col-span-2">
              <FadeUp>
                <h2 className="text-2xl font-bold tracking-tighter text-[#1d1d1f] mb-6">
                  Detailers in {city.name} ({publicCompanies.length})
                </h2>
              </FadeUp>

              {publicCompanies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {publicCompanies.map((company, i) => (
                    <FadeUp key={company.id} delay={i * 50}>
                      <CompanyCard company={company} />
                    </FadeUp>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-400">
                  No verified detailers listed yet in {city.name}.
                </div>
              )}
            </div>

            {/* Glassmorphic sticky form */}
            <aside>
              <div className="sticky top-24 rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-bold text-[#1d1d1f] tracking-tight text-lg mb-1">Get a Free Quote</h3>
                <p className="text-sm text-gray-500 mb-4 font-medium">
                  Tell us about your boat and we&apos;ll connect you with local detailers.
                </p>
                <LeadForm services={services.map((s) => ({ id: s.id, name: s.name }))} />
              </div>
            </aside>
          </div>
        </section>
      </div>
    </>
  );
}
