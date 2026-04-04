// src/components/seo/ReviewSchema.tsx
// Schema.org Review JSON-LD for individual company reviews

type ReviewItem = {
  authorName: string;
  rating: number;
  body: string;
  title?: string | null;
  publishedAt?: Date | null;
  serviceUsed?: string | null;
};

type Props = {
  reviews: ReviewItem[];
  companyName: string;
};

export function ReviewSchema({ reviews, companyName }: Props) {
  if (reviews.length === 0) return null;

  const schema = reviews.map((review) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "LocalBusiness",
      name: companyName,
    },
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    author: {
      "@type": "Person",
      name: review.authorName,
    },
    reviewBody: review.body,
    name: review.title ?? undefined,
    datePublished: review.publishedAt
      ? review.publishedAt.toISOString().split("T")[0]
      : undefined,
  }));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
