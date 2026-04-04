// src/components/marketing/CompanyCard.tsx
// Public company listing card — blind marketplace: no company identity exposed

import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ReviewStars } from "./ReviewStars";
import { Shield, CheckCircle2, ChevronRight } from "lucide-react";
import type { PublicCompany } from "@/types";

type Props = {
  company: PublicCompany;
  onRequestQuote?: () => void;
};

export function CompanyCard({ company, onRequestQuote }: Props) {
  const shortId = company.id.slice(-4).toUpperCase();
  const label = company.isFeatured
    ? `Top-Rated Detailer in ${company.city.name}`
    : `Verified Marine Pro #${shortId}`;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      {/* Cover image */}
      <div className="relative h-36 bg-gray-50">
        {company.coverImageUrl ? (
          <Image
            src={company.coverImageUrl}
            alt="Marine detailing professional"
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
            <span className="text-3xl">⚓</span>
          </div>
        )}
        {company.isFeatured && (
          <Badge className="absolute top-2 left-2 bg-amber-500 hover:bg-amber-500 text-white text-xs rounded-full px-2.5">
            Featured
          </Badge>
        )}
        <Badge className="absolute top-2 right-2 bg-green-600 hover:bg-green-600 text-white text-xs rounded-full px-2.5 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> Verified
        </Badge>
      </div>

      <div className="p-4">
        {/* Header — no company name, no logo */}
        <div className="mb-3">
          <h3 className="font-bold text-[#1d1d1f] tracking-tight">{label}</h3>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            {company.city.name}, {company.city.state.name}
          </p>
        </div>

        {/* Rating */}
        {company.averageRating !== null && (
          <div className="flex items-center gap-2 mb-3">
            <ReviewStars rating={company.averageRating} size="sm" />
            <span className="text-xs text-gray-400 font-medium">
              {company.averageRating.toFixed(1)} ({company.reviewCount} reviews)
            </span>
          </div>
        )}

        {/* Services */}
        {company.services.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {company.services.slice(0, 3).map((cs) => (
              <Badge key={cs.service.slug} variant="secondary" className="text-xs font-medium rounded-full px-2.5 bg-gray-100 text-gray-600 hover:bg-gray-100">
                {cs.service.name}
              </Badge>
            ))}
            {company.services.length > 3 && (
              <Badge variant="secondary" className="text-xs font-medium rounded-full px-2.5 bg-gray-100 text-gray-500 hover:bg-gray-100">
                +{company.services.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Trust indicators */}
        <div className="flex items-center gap-3 mb-4 text-xs text-gray-400 font-medium">
          {company.isInsured && (
            <span className="flex items-center gap-1 text-green-600">
              <Shield className="h-3 w-3" /> Insured
            </span>
          )}
          {company.yearEstablished && (
            <span className="flex items-center gap-1 text-gray-400">
              Est. {company.yearEstablished}
            </span>
          )}
        </div>

        {/* CTA — scrolls to / triggers quote form */}
        <a
          href="#quote-form"
          onClick={onRequestQuote}
          className="flex items-center justify-between w-full bg-[#ff385c] text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#d90b34] transition-all group/btn shadow-sm shadow-red-500/20"
        >
          <span>Request a Quote</span>
          <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
        </a>
      </div>
    </div>
  );
}
