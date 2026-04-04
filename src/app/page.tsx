// src/app/page.tsx
// Homepage — redirects to the marketing layout

import { HeroSection } from "@/components/marketing/HeroSection";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { MapPin } from "lucide-react";

export default async function HomePage() {
  const states = await prisma.state.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { cities: true } },
    },
  });

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />

        <section className="container mx-auto px-4 py-16">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Browse by State
          </h2>
          <p className="text-slate-500 mb-8">
            Find professional boat detailers in your state.
          </p>

          {states.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {states.map((state) => (
                <Link
                  key={state.id}
                  href={`/${state.slug}`}
                  className="flex flex-col items-center gap-1 rounded-lg border bg-white p-4 text-center hover:border-blue-400 hover:shadow-sm transition-all"
                >
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-slate-900 text-sm">{state.abbreviation}</span>
                  <span className="text-xs text-slate-500">{state.name}</span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 p-12 text-center">
              <p className="text-slate-400">
                State data will appear here after running the database seed.
              </p>
            </div>
          )}
        </section>

        <section className="bg-blue-700 text-white">
          <div className="container mx-auto px-4 py-16 text-center">
            <h2 className="text-3xl font-bold mb-4">Own a Detailing Business?</h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              Get your business listed and start receiving qualified leads from
              boat owners in your area. Pay only for leads you want.
            </p>
            <Link
              href="/register"
              className="inline-block bg-white text-blue-700 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
            >
              List Your Business Free
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
