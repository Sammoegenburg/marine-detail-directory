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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import { Shield, Calendar, Globe, MapPin, Building2 } from "lucide-react";
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

  // Only show full profile for ACTIVE or PENDING companies; unclaimed still shows but with claim CTA
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

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6 flex-wrap">
          <Link href="/">Home</Link>
          <span>/</span>
          <Link href={`/${stateSlug}`}>{company.city.state.name}</Link>
          <span>/</span>
          <Link href={`/${stateSlug}/${citySlug}`}>{company.city.name}</Link>
          <span>/</span>
          <span>{company.name}</span>
        </div>

        {/* Claim CTA banner — shown when listing is unclaimed */}
        {isUnclaimed && (
          <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
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
                className="shrink-0 inline-flex items-center justify-center rounded-lg bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
              >
                Claim This Profile →
              </Link>
            </div>
          </div>
        )}

        {/* Cover image */}
        <div className="relative h-48 md:h-64 rounded-xl overflow-hidden bg-slate-100 mb-6">
          {company.coverImageUrl ? (
            <Image src={company.coverImageUrl} alt="" fill className="object-cover" />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center text-6xl">
              ⚓
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="flex items-start gap-4">
              {company.logoUrl && (
                <div className="relative h-16 w-16 rounded-full overflow-hidden border-2 border-white shadow shrink-0">
                  <Image src={company.logoUrl} alt="" fill className="object-contain" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-slate-900">{company.name}</h1>
                <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                  <MapPin className="h-4 w-4" />
                  {company.city.name}, {company.city.state.abbreviation}
                  {company.zipCode && ` ${company.zipCode}`}
                </div>
                {company.averageRating !== null && (
                  <div className="flex items-center gap-2 mt-2">
                    <ReviewStars rating={Number(company.averageRating)} />
                    <span className="text-sm text-slate-500">
                      {Number(company.averageRating).toFixed(1)} ({company.reviewCount} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap gap-3">
              {company.isInsured && (
                <Badge className="gap-1 bg-green-50 text-green-700 border-green-200 hover:bg-green-50">
                  <Shield className="h-3 w-3" /> Licensed & Insured
                </Badge>
              )}
              {company.yearEstablished && (
                <Badge variant="outline" className="gap-1">
                  <Calendar className="h-3 w-3" /> Est. {company.yearEstablished}
                </Badge>
              )}
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer">
                  <Badge variant="outline" className="gap-1 hover:border-blue-400">
                    <Globe className="h-3 w-3" /> Website
                  </Badge>
                </a>
              )}
            </div>

            {/* Description */}
            {company.description && (
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-2">About</h2>
                <p className="text-slate-600 leading-relaxed">{company.description}</p>
              </div>
            )}

            {/* Services */}
            {company.services.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-slate-900 mb-3">Services Offered</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {company.services.map((cs) => (
                    <div key={cs.id} className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm font-medium text-slate-800">{cs.service.name}</span>
                      {cs.customPrice && (
                        <span className="text-sm text-slate-500">{cs.customPrice}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            {company.reviews.length > 0 && (
              <div>
                <Separator className="mb-6" />
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Reviews ({company.reviewCount})
                </h2>
                <div className="space-y-4">
                  {company.reviews.map((review) => (
                    <div key={review.id} className="rounded-lg border p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{review.authorName}</p>
                          {review.publishedAt && (
                            <p className="text-xs text-slate-400">
                              {new Date(review.publishedAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <ReviewStars rating={review.rating} size="sm" />
                      </div>
                      {review.title && (
                        <p className="font-medium text-slate-800 text-sm mb-1">{review.title}</p>
                      )}
                      <p className="text-slate-600 text-sm">{review.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Lead form sidebar */}
          <aside>
            <div className="sticky top-24 rounded-xl border bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-1">
                {isUnclaimed ? "Request a Quote" : `Request a Quote from ${company.name}`}
              </h3>
              <p className="text-sm text-slate-500 mb-4">
                {isUnclaimed
                  ? "Fill out the form and a local detailer will contact you."
                  : `Fill out the form and ${company.name} will contact you directly.`}
              </p>
              <LeadForm services={allServices.map((s) => ({ id: s.id, name: s.name }))} />
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
