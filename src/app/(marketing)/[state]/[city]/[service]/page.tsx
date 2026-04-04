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
import Link from "next/link";
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
      include: {
        city: { include: { state: true } },
        services: { include: { service: true }, where: { isActive: true } },
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
        name={`${service.name} in ${city.name}`}
        url={`${process.env.NEXT_PUBLIC_BASE_URL}/${stateSlug}/${citySlug}/${serviceSlug}`}
        city={city.name}
        state={city.state.abbreviation}
      />

      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 flex-wrap">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href={`/${stateSlug}`}>{city.state.name}</Link>
          <span>/</span>
          <Link href={`/${stateSlug}/${citySlug}`}>{city.name}</Link>
          <span>/</span>
          <span>{service.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2">
            <h1 className="text-4xl font-bold text-slate-900 mb-3">
              {page?.h1 ?? `${service.name} in ${city.name}, ${city.state.abbreviation}`}
            </h1>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">{content}</p>

            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              {service.name} Specialists in {city.name} ({publicCompanies.length})
            </h2>

            {publicCompanies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {publicCompanies.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed p-8 text-center text-slate-400">
                No verified {service.name.toLowerCase()} specialists listed yet in {city.name}.
                <br />
                <Link href="/register" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                  List your business →
                </Link>
              </div>
            )}
          </div>

          <aside>
            <div className="sticky top-24 rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-1">
                Get a Free {service.name} Quote
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                We'll connect you with the top {service.name.toLowerCase()} specialists in {city.name}.
              </p>
              <LeadForm
                defaultServiceId={service.id}
                services={allServices.map((s) => ({ id: s.id, name: s.name }))}
              />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
