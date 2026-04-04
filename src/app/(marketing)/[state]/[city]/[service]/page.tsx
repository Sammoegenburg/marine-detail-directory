// src/app/(marketing)/[state]/[city]/[service]/page.tsx
// Service page: /florida/fort-lauderdale/hull-cleaning

export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateServicePageMetadata } from "@/lib/seo/generateMetadata";
import { interpolate, SERVICE_PAGE_TEMPLATE } from "@/lib/seo/templates";
import { CompanyCard } from "@/components/marketing/CompanyCard";
import { LeadForm } from "@/components/marketing/LeadForm";
import { LocalBusinessSchema } from "@/components/seo/LocalBusinessSchema";
import { FadeUp } from "@/components/marketing/FadeUp";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import type { PublicCompany } from "@/types";

type Props = {
  params: Promise<{ state: string; city: string; service: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug, city: citySlug, service: serviceSlug } = await params;
  const data = await getPageData(stateSlug, citySlug, serviceSlug);
  if (!data) return {};
  return generateServicePageMetadata({
    serviceName: data.service.name,
    cityName: data.city.name,
    stateName: data.city.state.name,
    stateAbbr: data.city.state.abbreviation,
    citySlug,
    stateSlug,
    serviceSlug,
    metaTitle: data.page?.metaTitle,
    metaDesc: data.page?.metaDesc,
  });
}

async function getPageData(stateSlug: string, citySlug: string, serviceSlug: string) {
  const [city, service] = await Promise.all([
    prisma.city.findFirst({
      where: { slug: citySlug, isActive: true, state: { slug: stateSlug } },
      include: { state: true },
    }),
    prisma.service.findUnique({ where: { slug: serviceSlug } }),
  ]);

  if (!city || !service) return null;

  const [page, companies] = await Promise.all([
    prisma.servicePage.findUnique({
      where: { cityId_serviceId: { cityId: city.id, serviceId: service.id } },
    }),
    prisma.company.findMany({
      where: {
        cityId: city.id,
        status: "ACTIVE",
        services: { some: { serviceId: service.id, isActive: true } },
      },
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
    }),
  ]);

  return { city, service, page, companies };
}

export default async function ServicePage({ params }: Props) {
  const { state: stateSlug, city: citySlug, service: serviceSlug } = await params;
  const data = await getPageData(stateSlug, citySlug, serviceSlug);

  if (!data) notFound();
  const { city, service, page, companies } = data;

  const allServices = await prisma.service.findMany({ orderBy: { name: "asc" } });

  const content = interpolate(
    page?.contentBlock ?? SERVICE_PAGE_TEMPLATE,
    {
      city: city.name,
      state: city.state.name,
      stateAbbr: city.state.abbreviation,
      service: service.name,
      serviceLower: service.name.toLowerCase(),
      avgPrice: page ? `$${Number(page.leadPrice).toFixed(0)}` : undefined,
    }
  );

  const publicCompanies: PublicCompany[] = companies.map((c) => ({
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
        name={`${service.name} in ${city.name}`}
        url={`${process.env.NEXT_PUBLIC_BASE_URL}/${stateSlug}/${citySlug}/${serviceSlug}`}
        city={city.name}
        state={city.state.abbreviation}
      />

      <div className="min-h-screen bg-[#F7F7F9] font-sans">
        {/* Hero */}
        <section className="pt-16 pb-10 px-6 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 font-medium flex-wrap">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/${stateSlug}`} className="hover:text-black transition-colors">{city.state.name}</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/${stateSlug}/${citySlug}`} className="hover:text-black transition-colors">{city.name}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#1d1d1f]">{service.name}</span>
          </div>

          <FadeUp>
            <h1 className="text-5xl md:text-[64px] font-bold tracking-tighter text-[#1d1d1f] mb-4 leading-[1.05]">
              {page?.h1 ?? `${service.name} in ${city.name}, ${city.state.abbreviation}`}
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-medium tracking-tight max-w-2xl leading-relaxed">
              {content}
            </p>
          </FadeUp>
        </section>

        {/* Two-column layout */}
        <section className="px-6 pb-20 max-w-[1400px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Company listings */}
            <div className="lg:col-span-2">
              <FadeUp>
                <h2 className="text-2xl font-bold tracking-tighter text-[#1d1d1f] mb-6">
                  {service.name} Specialists in {city.name} ({publicCompanies.length})
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
                  No verified {service.name.toLowerCase()} specialists listed yet in {city.name}.
                  <br />
                  <Link href="/register" className="text-black font-semibold hover:underline text-sm mt-2 inline-block">
                    List your business →
                  </Link>
                </div>
              )}
            </div>

            {/* Glassmorphic sticky form */}
            <aside>
              <div className="sticky top-24 rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-bold text-[#1d1d1f] tracking-tight text-lg mb-1">
                  Get a Free {service.name} Quote
                </h3>
                <p className="text-sm text-gray-500 mb-4 font-medium">
                  We&apos;ll connect you with the top {service.name.toLowerCase()} specialists in {city.name}.
                </p>
                <LeadForm
                  defaultServiceId={service.id}
                  services={allServices.map((s) => ({ id: s.id, name: s.name }))}
                />
              </div>
            </aside>
          </div>
        </section>
      </div>
    </>
  );
}
