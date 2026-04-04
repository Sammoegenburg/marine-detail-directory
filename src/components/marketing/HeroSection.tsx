// src/components/marketing/HeroSection.tsx

import Link from "next/link";
import { Search, Star, Shield } from "lucide-react";

type Props = {
  heading?: string;
  subheading?: string;
  citySlug?: string;
  stateSlug?: string;
};

export function HeroSection({
  heading = "Find Trusted Boat Detailing Near You",
  subheading = "Connect with licensed, insured marine detailers in your area. Get free quotes in minutes.",
  citySlug,
  stateSlug,
}: Props) {
  const ctaHref =
    stateSlug && citySlug
      ? `/${stateSlug}/${citySlug}/full-detail`
      : stateSlug
      ? `/${stateSlug}`
      : "/florida";

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
      <div className="absolute inset-0 bg-[url('/images/boat-hero.jpg')] bg-cover bg-center opacity-10" />
      <div className="relative container mx-auto px-4 py-20 md:py-28 text-center">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 max-w-3xl mx-auto">
          {heading}
        </h1>
        <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-xl mx-auto">
          {subheading}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-base font-semibold bg-white text-blue-900 hover:bg-blue-50 shadow-lg transition-colors"
          >
            <Search className="h-4 w-4" />
            Get Free Quotes
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg px-6 py-3 text-base font-medium border border-white/30 text-white hover:bg-white/10 transition-colors"
          >
            List Your Business
          </Link>
        </div>

        <div className="flex items-center justify-center gap-8 mt-12 text-sm text-blue-200">
          <span className="flex items-center gap-2">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            Verified Reviews
          </span>
          <span className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Licensed & Insured
          </span>
          <span className="flex items-center gap-2">
            💬 Free Quotes
          </span>
        </div>
      </div>
    </section>
  );
}
