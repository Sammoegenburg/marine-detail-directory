// src/components/seo/LocalBusinessSchema.tsx
// Schema.org LocalBusiness JSON-LD for E-E-A-T signals

type Props = {
  name: string;
  description?: string | null;
  url: string;
  telephone?: string | null;
  address?: string | null;
  city: string;
  state: string;
  zipCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  ratingValue?: number | null;
  reviewCount?: number;
  logoUrl?: string | null;
  imageUrl?: string | null;
  priceRange?: string;
};

export function LocalBusinessSchema({
  name,
  description,
  url,
  telephone,
  address,
  city,
  state,
  zipCode,
  latitude,
  longitude,
  ratingValue,
  reviewCount,
  logoUrl,
  imageUrl,
  priceRange = "$$",
}: Props) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name,
    description: description ?? undefined,
    url,
    priceRange,
    address: {
      "@type": "PostalAddress",
      streetAddress: address ?? undefined,
      addressLocality: city,
      addressRegion: state,
      postalCode: zipCode ?? undefined,
      addressCountry: "US",
    },
  };

  if (telephone) schema.telephone = telephone;
  if (logoUrl) schema.logo = logoUrl;
  if (imageUrl) schema.image = imageUrl;

  if (latitude && longitude) {
    schema.geo = {
      "@type": "GeoCoordinates",
      latitude,
      longitude,
    };
  }

  if (ratingValue && reviewCount && reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: ratingValue.toFixed(1),
      reviewCount,
      bestRating: "5",
      worstRating: "1",
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
