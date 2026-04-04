// src/app/(marketing)/[state]/page.tsx
// State hub: /florida

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateStateMetadata } from "@/lib/seo/generateMetadata";
import { interpolate, STATE_HUB_TEMPLATE } from "@/lib/seo/templates";
import Link from "next/link";
import { MapPin, Building2 } from "lucide-react";
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
    <div className="container mx-auto px-4 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
          <Link href="/" className="hover:text-blue-700">Home</Link>
          <span>/</span>
          <span>{state.name}</span>
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-3">
          Boat Detailing in {state.name}
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl">{content}</p>
      </div>

      <h2 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-blue-600" />
        Cities in {state.name}
      </h2>

      {state.cities.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {state.cities.map((city) => (
            <Link
              key={city.id}
              href={`/${stateSlug}/${city.slug}`}
              className="flex items-start gap-3 rounded-lg border bg-white p-4 hover:border-blue-400 hover:shadow-sm transition-all"
            >
              <Building2 className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-900">{city.name}</p>
                <p className="text-xs text-slate-500">
                  {city._count.companies} detailer{city._count.companies !== 1 ? "s" : ""}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-slate-400">No active cities found for this state yet.</p>
      )}
    </div>
  );
}
