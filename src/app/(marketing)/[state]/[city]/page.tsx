// src/app/(marketing)/[state]/[city]/page.tsx
// City hub: /florida/fort-lauderdale — lead form landing page

export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateCityMetadata } from "@/lib/seo/generateMetadata";
import { LocalBusinessSchema } from "@/components/seo/LocalBusinessSchema";
import { FadeUp } from "@/components/marketing/FadeUp";
import { LeadIntakeForm } from "@/components/marketing/LeadIntakeForm";
import Link from "next/link";
import { ChevronRight, Star, Users, ShieldCheck, Clock, MapPin } from "lucide-react";
import type { Metadata } from "next";

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
    stateSlug,
    metaTitle: city.metaTitle,
    metaDesc: city.metaDesc,
  });
}

export default async function CityHubPage({ params }: Props) {
  const { state: stateSlug, city: citySlug } = await params;

  const [city, services] = await Promise.all([
    prisma.city.findFirst({
      where: { slug: citySlug, isActive: true, state: { slug: stateSlug } },
      include: {
        state: true,
        pages: { include: { service: true } },
        _count: { select: { companies: { where: { status: "ACTIVE" } } } },
      },
    }),
    prisma.service.findMany({ select: { id: true, name: true, slug: true }, orderBy: { name: "asc" } }),
  ]);

  if (!city) notFound();

  const proCount = city._count.companies;

  const faqs = [
    {
      q: `How does detailing work in ${city.name}?`,
      a: `Submit your vehicle details and location. Our network of verified pros in ${city.name} will review your request and reach out with quotes. You choose the best fit.`,
    },
    {
      q: "How much does detailing cost?",
      a: "Pricing varies by vehicle size, service type, and condition. Pros will provide exact quotes after reviewing your request — no surprises.",
    },
    {
      q: "Are the pros vetted and insured?",
      a: "Yes. Every professional on our network is reviewed and must carry valid insurance before accessing leads.",
    },
    {
      q: "How quickly will I hear back?",
      a: `Most customers in ${city.name} hear from at least one pro within a few hours of submitting their request.`,
    },
  ];

  return (
    <>
      <LocalBusinessSchema
        name={`Detailing Services in ${city.name}`}
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
              Get Detailing Quotes in {city.name}, {city.state.abbreviation}
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-medium tracking-tight max-w-2xl leading-relaxed mb-8">
              Tell us about your vehicle. Local pros compete for your business. Free quotes, no commitment.
            </p>
          </FadeUp>

          {/* Trust signals */}
          <FadeUp delay={100}>
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 bg-white rounded-full px-5 py-2.5 shadow-sm border border-gray-100">
                <Users size={16} className="text-[#ff385c]" />
                <span className="text-sm font-bold text-[#1d1d1f]">{proCount} verified pro{proCount !== 1 ? "s" : ""} serving {city.name}</span>
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

          {/* Service links */}
          {city.pages.length > 0 && (
            <FadeUp delay={150}>
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

        {/* Lead Form */}
        <section className="px-6 pb-16 max-w-[1400px] mx-auto">
          <FadeUp delay={200}>
            <LeadIntakeForm
              defaultCity={city.name}
              defaultState={city.state.name}
              services={services}
            />
          </FadeUp>
        </section>

        {/* Value Props */}
        <section className="py-16 md:py-20 px-6 bg-white rounded-[2rem] md:rounded-[3rem] max-w-[1400px] mx-4 md:mx-auto shadow-sm border border-gray-100 mb-16 md:mb-24">
          <FadeUp>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-center mb-12">
              Why use MarineDirectory for detailing in {city.name}?
            </h2>
          </FadeUp>
          <div className="grid md:grid-cols-3 gap-10 md:gap-16 max-w-[1100px] mx-auto">
            {[
              { icon: <MapPin size={28} />, title: "Local Experts", desc: `Pros who actually service ${city.name} — no out-of-area callbacks.` },
              { icon: <Clock size={28} />, title: "Fast Response", desc: "Most customers hear back from multiple pros within hours of submitting." },
              { icon: <ShieldCheck size={28} />, title: "Zero Risk", desc: "Free to submit. No commitment. You choose when and if you hire." },
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
