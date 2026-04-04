// src/types/index.ts
// Shared TypeScript types for MarineDetailDirectory

export type UserRole = "ADMIN" | "COMPANY";

export type CompanyStatus = "UNCLAIMED" | "PENDING" | "ACTIVE" | "SUSPENDED";

export type LeadStatus =
  | "NEW"
  | "AVAILABLE"
  | "PURCHASED"
  | "EXPIRED"
  | "REFUNDED";

export type BoatSize =
  | "UNDER_20FT"
  | "TWENTY_TO_30FT"
  | "THIRTY_TO_40FT"
  | "OVER_40FT";

export type ServiceCategory =
  | "FULL_DETAIL"
  | "HULL_CLEANING"
  | "INTERIOR_DETAIL"
  | "TEAK_RESTORATION"
  | "WAXING_POLISHING"
  | "BOTTOM_PAINT"
  | "CANVAS_CLEANING"
  | "BRIGHTWORK";

export type ClaimStatus = "PENDING" | "APPROVED" | "REJECTED";

export const BOAT_SIZE_LABELS: Record<BoatSize, string> = {
  UNDER_20FT: "Under 20 ft",
  TWENTY_TO_30FT: "20–30 ft",
  THIRTY_TO_40FT: "30–40 ft",
  OVER_40FT: "Over 40 ft",
};

export const SERVICE_LABELS: Record<ServiceCategory, string> = {
  FULL_DETAIL: "Full Detail",
  HULL_CLEANING: "Hull Cleaning",
  INTERIOR_DETAIL: "Interior Detail",
  TEAK_RESTORATION: "Teak Restoration",
  WAXING_POLISHING: "Waxing & Polishing",
  BOTTOM_PAINT: "Bottom Paint",
  CANVAS_CLEANING: "Canvas Cleaning",
  BRIGHTWORK: "Brightwork",
};

export type PublicCompany = {
  id: string;
  name: string;
  slug: string;
  status: CompanyStatus;
  description: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  photoUrls: string[];
  yearEstablished: number | null;
  isInsured: boolean;
  isFeatured: boolean;
  averageRating: number | null;
  reviewCount: number;
  city: { name: string; slug: string; state: { name: string; slug: string } };
  services: Array<{ service: { name: string; slug: string }; customPrice: string | null }>;
  // phone/email/website intentionally omitted — only unlocked via lead purchase
};

export type LeadFormData = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  boatSize: BoatSize;
  boatType?: string;
  boatYear?: number;
  boatMake?: string;
  zipCode: string;
  serviceId: string;
  notes?: string;
  preferredDate?: string;
};
