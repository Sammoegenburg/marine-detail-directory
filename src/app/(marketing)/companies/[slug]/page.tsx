// src/app/(marketing)/companies/[slug]/page.tsx
// Public company profile page

export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { generateCompanyMetadata } from "@/lib/seo/generateMetadata";
import { LocalBusinessSchema } from "@/components/seo/LocalBusinessSchema";
import { ReviewSchema } from "@/components/seo/ReviewSchema";
import { LeadForm } from "@/components/marketing/LeadForm";
import { ReviewStars } from "@/components/marketing/ReviewStars";
import { FadeUp } from "@/components/marketing/FadeUp";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { Shield, Calendar, MapPin, Building2, ChevronRight } from "lucide-react";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await prisma.company.findUnique({
    where: { slug },
    include: { city: { include: { state: true } } },
  });
  if (!company) return {};
  return generateCompanyMetadata({
    companyName: company.name,
    cityName: company.city.name,
    stateName: company.city.state.name,
    slug: company.slug,
    description: company.description,
    averageRating: company.averageRating ? Number(company.averageRating) : null,
  });
}

export default async function CompanyProfilePage({ params }: Props) {
  const { slug } = await params;

  const company = await prisma.company.findUnique({
    where: { slug },
    include: {
      city: { include: { state: true } },
      services: { include: { service: true }, where: { isActive: true } },
      reviews: {
        where: { isPublished: true },
        orderBy: { publishedAt: "desc" },
        take: 10,
      },
    },
  });

  if (!company) notFound();

  if (company.status === "SUSPENDED") notFound();

  const allServices = await prisma.service.findMany({ orderBy: { name: "asc" } });

  const stateSlug = company.city.state.slug;
  const citySlug = company.city.slug;
  const isUnclaimed = company.status === "UNCLAIMED";

  return (
    <>
      <LocalBusinessSchema
        name={company.name}
        description={company.description}
        url={`${process.env.NEXT_PUBLIC_BASE_URL}/companies/${company.slug}`}
        city={company.city.name}
        state={company.city.state.abbreviation}
        zipCode={company.zipCode}
        ratingValue={company.averageRating ? Number(company.averageRating) : null}
        reviewCount={company.reviewCount}
        logoUrl={company.logoUrl}
        imageUrl={company.coverImageUrl}
      />
      <ReviewSchema
        reviews={company.reviews.map((r) => ({
          authorName: r.authorName,
          rating: r.rating,
          body: r.body,
          title: r.title,
          publishedAt: r.publishedAt,
          serviceUsed: r.serviceUsed,
        }))}
        companyName={company.name}
      />

      <div className="min-h-screen bg-[#F7F7F9] font-sans">
        <div className="max-w-[1200px] mx-auto px-6 py-12">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 font-medium flex-wrap">
            <Link href="/" className="hover:text-black transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/${stateSlug}`} className="hover:text-black transition-colors">{company.city.state.name}</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href={`/${stateSlug}/${citySlug}`} className="hover:text-black transition-colors">{company.city.name}</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-[#1d1d1f]">{company.name}</span>
          </div>

          {/* Claim CTA banner */}
          {isUnclaimed && (
            <div className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-amber-900">Own this business?</p>
                    <p className="text-sm text-amber-700 mt-0.5">
                      Claim your free profile to manage leads, respond to customers, and grow your business.
                    </p>
                  </div>
                </div>
                <Link
                  href={`/register?claim=${company.slug}`}
                  className="shrink-0 inline-flex items-center justify-center rounded-full bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
                >
                  Claim This Profile →
                </Link>
              </div>
            </div>
          )}

          {/* Cover image */}
          <FadeUp>
            <div className="relative h-48 md:h-72 rounded-2xl overflow-hidden bg-gray-100 mb-8 shadow-sm border border-gray-100">
              {company.coverImageUrl ? (
                <Image src={company.coverImageUrl} alt="" fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-6xl">
                  ⚓
                </div>
              )}
            </div>
          </FadeUp>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <FadeUp>
                <div className="flex items-start gap-4">
                  {company.logoUrl && (
                    <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-white shadow shrink-0">
                      <Image src={company.logoUrl} alt="" fill className="object-contain" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-[#1d1d1f]">{company.name}</h1>
                    <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                      <MapPin className="h-4 w-4" />
                      {company.city.name}, {company.city.state.abbreviation}
                      {company.zipCode && ` ${company.zipCode}`}
                    </div>
                    {company.averageRating !== null && (
                      <div className="flex items-center gap-2 mt-2">
                        <ReviewStars rating={Number(company.averageRating)} />
                        <span className="text-sm text-gray-500">
                          {Number(company.averageRating).toFixed(1)} ({company.reviewCount} reviews)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </FadeUp>

              {/* Trust badges */}
              <FadeUp delay={50}>
                <div className="flex flex-wrap gap-3">
                  {company.isInsured && (
                    <Badge className="gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-50 rounded-full px-3 py-1">
                      <Shield className="h-3 w-3" /> Licensed & Insured
                    </Badge>
                  )}
                  {company.yearEstablished && (
                    <Badge variant="outline" className="gap-1 rounded-full px-3 py-1">
                      <Calendar className="h-3 w-3" /> Est. {company.yearEstablished}
                    </Badge>
                  )}
                </div>
              </FadeUp>

              {/* Request a Quote CTA */}
              <FadeUp delay={100}>
                <a
                  href="#quote-form"
                  className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-gray-800 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
                >
                  Request a Quote from {company.name}
                  <ChevronRight className="h-4 w-4" />
                </a>
              </FadeUp>

              {/* Description */}
              {company.description && (
                <FadeUp delay={150}>
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="text-lg font-bold tracking-tight text-[#1d1d1f] mb-3">About</h2>
                    <p className="text-gray-600 leading-relaxed">{company.description}</p>
                  </div>
                </FadeUp>
              )}

              {/* Services */}
              {company.services.length > 0 && (
                <FadeUp delay={200}>
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <h2 className="text-lg font-bold tracking-tight text-[#1d1d1f] mb-4">Services Offered</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {company.services.map((cs) => (
                        <div key={cs.id} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 p-3">
                          <span className="text-sm font-medium text-[#1d1d1f]">{cs.service.name}</span>
                          {cs.customPrice && (
                            <span className="text-sm text-gray-400">{cs.customPrice}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeUp>
              )}

              {/* Reviews */}
              {company.reviews.length > 0 && (
                <FadeUp delay={250}>
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                    <Separator className="mb-6" />
                    <h2 className="text-lg font-bold tracking-tight text-[#1d1d1f] mb-4">
                      Reviews ({company.reviewCount})
                    </h2>
                    <div className="space-y-4">
                      {company.reviews.map((review) => (
                        <div key={review.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium text-[#1d1d1f] text-sm">{review.authorName}</p>
                              {review.publishedAt && (
                                <p className="text-xs text-gray-400">
                                  {new Date(review.publishedAt).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <ReviewStars rating={review.rating} size="sm" />
                          </div>
                          {review.title && (
                            <p className="font-medium text-[#1d1d1f] text-sm mb-1">{review.title}</p>
                          )}
                          <p className="text-gray-600 text-sm">{review.body}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </FadeUp>
              )}
            </div>

            {/* Lead form sidebar */}
            <aside id="quote-form">
              <div className="sticky top-24 rounded-2xl bg-white/80 backdrop-blur-xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-bold text-[#1d1d1f] tracking-tight text-lg mb-1">
                  {isUnclaimed ? "Request a Quote" : `Request a Quote from ${company.name}`}
                </h3>
                <p className="text-sm text-gray-500 mb-4 font-medium">
                  {isUnclaimed
                    ? "Fill out the form and a local detailer will contact you."
                    : `Fill out the form and ${company.name} will contact you directly.`}
                </p>
                <LeadForm services={allServices.map((s) => ({ id: s.id, name: s.name }))} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
