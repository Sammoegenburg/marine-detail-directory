// src/app/(marketing)/[state]/[city]/[service]/page.tsx
// Service page: /florida/fort-lauderdale/hull-cleaning — lead form landing page

export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateServicePageMetadata } from "@/lib/seo/generateMetadata";
import { interpolate, SERVICE_PAGE_TEMPLATE } from "@/lib/seo/templates";
import { LocalBusinessSchema } from "@/components/seo/LocalBusinessSchema";
import { LeadIntakeForm } from "@/components/marketing/LeadIntakeForm";
import { FadeUp } from "@/components/marketing/FadeUp";
import Link from "next/link";
import { ChevronRight, Star, Users, ShieldCheck, Clock, MapPin } from "lucide-react";
import type { Metadata } from "next";

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

  const [page, proCount] = await Promise.all([
    prisma.servicePage.findUnique({
      where: { cityId_serviceId: { cityId: city.id, serviceId: service.id } },
    }),
    prisma.company.count({
      where: {
        cityId: city.id,
        status: "ACTIVE",
        services: { some: { serviceId: service.id, isActive: true } },
      },
    }),
  ]);

  return { city, service, page, proCount };
}

export default async function ServicePage({ params }: Props) {
  const { state: stateSlug, city: citySlug, service: serviceSlug } = await params;
  const data = await getPageData(stateSlug, citySlug, serviceSlug);

  if (!data) notFound();
  const { city, service, page, proCount } = data;

  const allServices = await prisma.service.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

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

  const faqs = [
    {
      q: `How does ${service.name.toLowerCase()} work in ${city.name}?`,
      a: `Submit your vehicle details and we'll match you with ${service.name.toLowerCase()} specialists in ${city.name}. They'll review your request and reach out with exact quotes.`,
    },
    {
      q: `How much does ${service.name.toLowerCase()} cost?`,
      a: "Pricing depends on vehicle size, condition, and the specific work needed. Pros give exact quotes after reviewing your request.",
    },
    {
      q: "Are the pros insured and verified?",
      a: "Yes — all pros on our network are vetted and insured before they can access leads.",
    },
    {
      q: "How quickly will I hear back?",
      a: `Most customers in ${city.name} receive their first quote within a few hours.`,
    },
  ];

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
              {page?.h1 ?? `Get ${service.name} Quotes in ${city.name}, ${city.state.abbreviation}`}
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-medium tracking-tight max-w-2xl leading-relaxed mb-8">
              {content}
            </p>
          </FadeUp>

          {/* Trust signals */}
          <FadeUp delay={100}>
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2 bg-white rounded-full px-5 py-2.5 shadow-sm border border-gray-100">
                <Users size={16} className="text-[#ff385c]" />
                <span className="text-sm font-bold text-[#1d1d1f]">
                  {proCount} {service.name.toLowerCase()} specialist{proCount !== 1 ? "s" : ""} in {city.name}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-full px-5 py-2.5 shadow-sm border border-gray-100">
                <Star size={16} className="text-amber-400 fill-amber-400" />
                <span className="text-sm font-bold text-[#1d1d1f]">4.9 average rating</span>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-full px-5 py-2.5 shadow-sm border border-gray-100">
                <ShieldCheck size={16} className="text-green-500" />
                <span className="text-sm font-bold text-[#1d1d1f]">All pros insured & vetted</span>
              </div>
            </div>
          </FadeUp>
        </section>

        {/* Lead Form */}
        <section className="px-6 pb-16 max-w-[1400px] mx-auto">
          <FadeUp delay={150}>
            <LeadIntakeForm
              defaultCity={city.name}
              defaultState={city.state.name}
              defaultService={service.slug}
              services={allServices}
            />
          </FadeUp>
        </section>

        {/* Value Props */}
        <section className="py-16 md:py-20 px-6 bg-white rounded-[2rem] md:rounded-[3rem] max-w-[1400px] mx-4 md:mx-auto shadow-sm border border-gray-100 mb-16 md:mb-24">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-center mb-12">
              Why use MarineDirectory for {service.name.toLowerCase()}?
            </h2>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-10 md:gap-16 max-w-[1100px] mx-auto">
            {[
              { icon: <MapPin size={28} />, title: "Local Specialists", desc: `Pros who specialize in ${service.name.toLowerCase()} and actively serve ${city.name}.` },
              { icon: <Clock size={28} />, title: "Fast Quotes", desc: "Most customers hear back from multiple specialists within hours." },
              { icon: <ShieldCheck size={28} />, title: "Fully Insured", desc: "Every pro is vetted and insured. Zero risk to you." },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 80} className="flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-black mb-5 border border-gray-100">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2">{item.title}</h3>
                <p className="text-gray-500 text-base font-medium leading-relaxed">{item.desc}</p>
              </FadeUp>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 pb-20 max-w-[800px] mx-auto">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-10">
              Frequently asked questions
            </h2>
          </FadeUp>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <FadeUp key={i} delay={i * 60}>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-[#1d1d1f] mb-2 tracking-tight">{faq.q}</h3>
                  <p className="text-gray-500 font-medium leading-relaxed text-sm md:text-base">{faq.a}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
