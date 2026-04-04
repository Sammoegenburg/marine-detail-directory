// src/components/marketing/CompanyCard.tsx
// Public company listing card — contact info intentionally hidden

import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ReviewStars } from "./ReviewStars";
import { Shield, Calendar, ExternalLink } from "lucide-react";
import type { PublicCompany } from "@/types";

type Props = {
  company: PublicCompany;
};

export function CompanyCard({ company }: Props) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-36 bg-slate-100">
        {company.coverImageUrl ? (
          <Image
            src={company.coverImageUrl}
            alt={company.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
            <span className="text-3xl">⚓</span>
          </div>
        )}
        {company.isFeatured && (
          <Badge className="absolute top-2 left-2 bg-amber-500 hover:bg-amber-500 text-white text-xs">
            Featured
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {company.logoUrl && (
            <div className="relative h-10 w-10 rounded-full overflow-hidden border bg-white shrink-0">
              <Image src={company.logoUrl} alt="" fill className="object-contain" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{company.name}</h3>
            <p className="text-xs text-slate-500">
              {company.city.name}, {company.city.state.name}
            </p>
          </div>
        </div>

        {company.averageRating !== null && (
          <div className="flex items-center gap-2 mt-3">
            <ReviewStars rating={company.averageRating} size="sm" />
            <span className="text-xs text-slate-500">
              {company.averageRating.toFixed(1)} ({company.reviewCount} reviews)
            </span>
          </div>
        )}

        {company.services.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {company.services.slice(0, 3).map((cs) => (
              <Badge key={cs.service.slug} variant="secondary" className="text-xs font-normal">
                {cs.service.name}
              </Badge>
            ))}
            {company.services.length > 3 && (
              <Badge variant="secondary" className="text-xs font-normal">
                +{company.services.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 mt-3 text-xs text-slate-500">
          {company.isInsured && (
            <span className="flex items-center gap-1 text-green-600">
              <Shield className="h-3 w-3" /> Insured
            </span>
          )}
          {company.yearEstablished && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Est. {company.yearEstablished}
            </span>
          )}
        </div>

        <Link
          href={`/companies/${company.slug}`}
          className="mt-4 flex items-center justify-center gap-1 w-full rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 transition-colors"
        >
          View Profile & Get Quote
          <ExternalLink className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}
