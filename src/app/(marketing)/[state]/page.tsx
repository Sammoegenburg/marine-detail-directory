// src/app/(marketing)/[state]/page.tsx
// State hub: /florida

export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateStateMetadata } from "@/lib/seo/generateMetadata";
import { interpolate, STATE_HUB_TEMPLATE } from "@/lib/seo/templates";
import { FadeUp } from "@/components/marketing/FadeUp";
import Link from "next/link";
import { MapPin, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ state: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { state: stateSlug } = await params;
  const state = await prisma.state.findUnique({ where: { slug: stateSlug } });
  if (!state) return {};
  return generateStateMetadata({
    stateName: state.name,
    stateSlug: state.slug,
    metaTitle: state.metaTitle,
    metaDesc: state.metaDesc,
  });
}

export default async function StateHubPage({ params }: Props) {
  const { state: stateSlug } = await params;

  const state = await prisma.state.findUnique({
    where: { slug: stateSlug },
    include: {
      cities: {
        where: { isActive: true },
        orderBy: [{ population: "desc" }, { name: "asc" }],
        include: {
          _count: { select: { companies: true } },
        },
      },
    },
  });

  if (!state) notFound();

  const content = interpolate(
    state.contentBlock ?? STATE_HUB_TEMPLATE,
    { city: "", state: state.name, stateAbbr: state.abbreviation, service: "", serviceLower: "" }
  );

  return (
    <div className="min-h-screen bg-[#F7F7F9] font-sans">
      {/* Hero */}
      <section className="pt-16 pb-12 px-6 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 font-medium">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-[#1d1d1f]">{state.name}</span>
        </div>

        <FadeUp>
          <h1 className="text-5xl md:text-[64px] font-bold tracking-tighter text-[#1d1d1f] mb-4 leading-[1.05]">
            Detailing Services in {state.name}
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-medium tracking-tight max-w-2xl leading-relaxed">
            {content}
          </p>
        </FadeUp>
      </section>

      {/* Cities grid */}
      <section className="pb-20 px-6 max-w-[1200px] mx-auto">
        <FadeUp delay={100}>
          <h2 className="text-2xl font-bold tracking-tighter text-[#1d1d1f] mb-6 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#ff385c]" />
            Cities in {state.name}
          </h2>
        </FadeUp>

        {state.cities.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {state.cities.map((city, i) => (
              <FadeUp key={city.id} delay={i * 40}>
                <Link
                  href={`/${stateSlug}/${city.slug}`}
                  className="group flex items-center justify-between rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-gray-200 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div>
                    <p className="font-bold text-[#1d1d1f] tracking-tight">{city.name}</p>
                    <p className="text-sm text-[#ff385c] font-semibold mt-0.5">
                      Get quotes in {city.name}
                    </p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-0.5 transition-all" />
                </Link>
              </FadeUp>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-400">
            No active cities found for this state yet.
          </div>
        )}
      </section>
    </div>
  );
}
