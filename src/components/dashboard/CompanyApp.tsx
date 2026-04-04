"use client";

// src/components/dashboard/CompanyDashboardApp.tsx
// Premium company dashboard — tactical glass UI
// Single-component SPA: onboarding, dashboard, leads, profile, billing

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Anchor, LayoutDashboard, Inbox, Settings, CreditCard,
  ChevronRight, ChevronLeft, CheckCircle2, X, Phone, Mail,
  Globe, MapPin, Loader2, Building2, Wrench, Bell, ClipboardList,
  Star, DollarSign, TrendingUp, Zap, Shield, Clock, ArrowRight,
  Car, User, Receipt, AlertCircle, Check, Sparkles, Copy,
  RefreshCw, Eye, EyeOff, SlidersHorizontal,
} from "lucide-react";
import { PaymentMethodForm } from "@/components/dashboard/PaymentMethodForm";
import { BOAT_SIZE_LABELS, SERVICE_LABELS } from "@/types";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export type SerializedCompany = {
  id: string;
  name: string;
  slug: string;
  status: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  description: string | null;
  stripeCustomerId: string | null;
  leadCreditBalance: number;
  averageRating: number | null;
  reviewCount: number;
  totalSpend: number;
  cityName: string;
  stateAbbr: string;
  services: Array<{ category: string; serviceName: string }>;
  billingHistory: Array<{
    id: string;
    serviceName: string;
    amountCharged: number;
    createdAt: string;
    isRefunded: boolean;
    stripePaymentIntentId: string | null;
  }>;
};

export type SerializedAvailableLead = {
  id: string;
  vehicleType: string;
  customerName: string;
  serviceName: string;
  serviceCategory: string;
  cityName: string;
  stateAbbr: string;
  leadPrice: number;
  boatSize: string | null;
  boatType: string | null;
  boatMake: string | null;
  boatYear: number | null;
  notes: string | null;
  createdAt: string;
};

export type SerializedPurchasedLead = {
  id: string;
  purchaseId: string;
  vehicleType: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  cityName: string;
  stateAbbr: string;
  leadPrice: number;
  amountCharged: number;
  boatSize: string | null;
  boatType: string | null;
  boatMake: string | null;
  boatYear: number | null;
  notes: string | null;
  createdAt: string;
};

export type PaymentMethodData = {
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
};

type View = "dashboard" | "leads" | "profile" | "billing";

type AppProps = {
  company: SerializedCompany | null;
  availableLeads: SerializedAvailableLead[];
  purchasedLeads: SerializedPurchasedLead[];
  paymentMethod: PaymentMethodData | null;
};

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────

const US_STATES = [
  { name: "Alabama", abbr: "AL" }, { name: "Alaska", abbr: "AK" },
  { name: "Arizona", abbr: "AZ" }, { name: "Arkansas", abbr: "AR" },
  { name: "California", abbr: "CA" }, { name: "Colorado", abbr: "CO" },
  { name: "Connecticut", abbr: "CT" }, { name: "Delaware", abbr: "DE" },
  { name: "Florida", abbr: "FL" }, { name: "Georgia", abbr: "GA" },
  { name: "Hawaii", abbr: "HI" }, { name: "Idaho", abbr: "ID" },
  { name: "Illinois", abbr: "IL" }, { name: "Indiana", abbr: "IN" },
  { name: "Iowa", abbr: "IA" }, { name: "Kansas", abbr: "KS" },
  { name: "Kentucky", abbr: "KY" }, { name: "Louisiana", abbr: "LA" },
  { name: "Maine", abbr: "ME" }, { name: "Maryland", abbr: "MD" },
  { name: "Massachusetts", abbr: "MA" }, { name: "Michigan", abbr: "MI" },
  { name: "Minnesota", abbr: "MN" }, { name: "Mississippi", abbr: "MS" },
  { name: "Missouri", abbr: "MO" }, { name: "Montana", abbr: "MT" },
  { name: "Nebraska", abbr: "NE" }, { name: "Nevada", abbr: "NV" },
  { name: "New Hampshire", abbr: "NH" }, { name: "New Jersey", abbr: "NJ" },
  { name: "New Mexico", abbr: "NM" }, { name: "New York", abbr: "NY" },
  { name: "North Carolina", abbr: "NC" }, { name: "North Dakota", abbr: "ND" },
  { name: "Ohio", abbr: "OH" }, { name: "Oklahoma", abbr: "OK" },
  { name: "Oregon", abbr: "OR" }, { name: "Pennsylvania", abbr: "PA" },
  { name: "Rhode Island", abbr: "RI" }, { name: "South Carolina", abbr: "SC" },
  { name: "South Dakota", abbr: "SD" }, { name: "Tennessee", abbr: "TN" },
  { name: "Texas", abbr: "TX" }, { name: "Utah", abbr: "UT" },
  { name: "Vermont", abbr: "VT" }, { name: "Virginia", abbr: "VA" },
  { name: "Washington", abbr: "WA" }, { name: "West Virginia", abbr: "WV" },
  { name: "Wisconsin", abbr: "WI" }, { name: "Wyoming", abbr: "WY" },
];

const CAR_SERVICES = [
  { label: "Full Detail", value: "CAR_FULL_DETAIL" },
  { label: "Interior Detail", value: "CAR_INTERIOR" },
  { label: "Exterior Wash", value: "CAR_EXTERIOR" },
  { label: "Paint Correction", value: "PAINT_CORRECTION" },
  { label: "Ceramic Coating", value: "CERAMIC_COATING" },
  { label: "Window Tint", value: "WINDOW_TINT" },
];

const BOAT_SERVICES = [
  { label: "Full Detail", value: "FULL_DETAIL" },
  { label: "Hull Cleaning", value: "HULL_CLEANING" },
  { label: "Wax & Polish", value: "WAXING_POLISHING" },
  { label: "Teak Restoration", value: "TEAK_RESTORATION" },
  { label: "Bottom Paint", value: "BOTTOM_PAINT" },
  { label: "Interior Detail", value: "INTERIOR_DETAIL" },
  { label: "Canvas Cleaning", value: "CANVAS_CLEANING" },
  { label: "Brightwork", value: "BRIGHTWORK" },
];

const NAV_ITEMS: { id: View; label: string; icon: React.ReactNode }[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { id: "leads", label: "Lead Inbox", icon: <Inbox className="h-4 w-4" /> },
  { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
  { id: "billing", label: "Billing", icon: <CreditCard className="h-4 w-4" /> },
];

// ─────────────────────────────────────────────
// TYPOGRAPHY + CSS INJECTION
// ─────────────────────────────────────────────

function TypographyStyle() {
  return (
    <style>{`
      .tactical-glass {
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(255,255,255,0.10);
      }
      .tactical-glass:hover {
        border-color: rgba(255,255,255,0.18);
      }
      .tactical-glass-solid {
        background: rgba(13,13,26,0.95);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(255,255,255,0.10);
      }
      .tracking-tight-custom { letter-spacing: -0.025em; }
      .dark-scroll::-webkit-scrollbar { width: 5px; }
      .dark-scroll::-webkit-scrollbar-track { background: transparent; }
      .dark-scroll::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.12);
        border-radius: 4px;
      }
      .dark-scroll::-webkit-scrollbar-thumb:hover {
        background: rgba(255,255,255,0.2);
      }
      @keyframes cda-fade-up {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes cda-slide-right {
        from { opacity: 0; transform: translateX(32px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes cda-slide-left {
        from { opacity: 0; transform: translateX(-32px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes cda-fade-in {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .cda-fade-up   { animation: cda-fade-up   0.35s cubic-bezier(.22,1,.36,1) both; }
      .cda-slide-right { animation: cda-slide-right 0.35s cubic-bezier(.22,1,.36,1) both; }
      .cda-slide-left  { animation: cda-slide-left  0.35s cubic-bezier(.22,1,.36,1) both; }
      .cda-fade-in   { animation: cda-fade-in   0.25s ease both; }

      input[type="range"].accent-slider {
        -webkit-appearance: none;
        appearance: none;
        height: 4px;
        background: rgba(255,255,255,0.15);
        border-radius: 2px;
        outline: none;
      }
      input[type="range"].accent-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 18px; height: 18px;
        border-radius: 50%;
        background: #ff385c;
        cursor: pointer;
        box-shadow: 0 0 0 3px rgba(255,56,92,0.25);
      }
      input[type="range"].accent-slider::-moz-range-thumb {
        width: 18px; height: 18px;
        border-radius: 50%;
        background: #ff385c;
        cursor: pointer;
        border: none;
      }
      .glass-input {
        background: rgba(255,255,255,0.07);
        border: 1px solid rgba(255,255,255,0.12);
        color: white;
        border-radius: 12px;
        padding: 10px 14px;
        font-size: 14px;
        font-weight: 500;
        outline: none;
        width: 100%;
        transition: border-color 0.15s;
      }
      .glass-input::placeholder { color: rgba(255,255,255,0.3); }
      .glass-input:focus { border-color: rgba(255,56,92,0.6); box-shadow: 0 0 0 3px rgba(255,56,92,0.12); }
      .glass-input option { background: #1a1a2e; color: white; }

      .coral-btn {
        background: #ff385c;
        color: white;
        font-weight: 700;
        border-radius: 12px;
        padding: 10px 22px;
        font-size: 14px;
        cursor: pointer;
        border: none;
        transition: background 0.15s, transform 0.1s, box-shadow 0.15s;
        display: inline-flex; align-items: center; gap: 6px;
      }
      .coral-btn:hover { background: #e0334f; box-shadow: 0 4px 20px rgba(255,56,92,0.3); }
      .coral-btn:active { transform: scale(0.97); }
      .coral-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }

      .ghost-btn {
        background: rgba(255,255,255,0.06);
        color: rgba(255,255,255,0.7);
        font-weight: 600;
        border-radius: 12px;
        padding: 10px 22px;
        font-size: 14px;
        cursor: pointer;
        border: 1px solid rgba(255,255,255,0.1);
        transition: background 0.15s, color 0.15s;
        display: inline-flex; align-items: center; gap: 6px;
      }
      .ghost-btn:hover { background: rgba(255,255,255,0.1); color: white; }

      .lead-card-glow {
        box-shadow: 0 0 0 1px rgba(255,56,92,0); transition: box-shadow 0.2s;
      }
      .lead-card-glow:hover {
        box-shadow: 0 0 0 1px rgba(255,56,92,0.4), 0 8px 32px rgba(0,0,0,0.4);
      }
    `}</style>
  );
}

// ─────────────────────────────────────────────
// HELPER COMPONENTS
// ─────────────────────────────────────────────

function SidebarItem({
  item, active, onClick,
}: {
  item: (typeof NAV_ITEMS)[number];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
        active
          ? "bg-[#ff385c]/15 text-[#ff385c] border border-[#ff385c]/25"
          : "text-white/50 hover:text-white hover:bg-white/6 border border-transparent"
      }`}
    >
      {item.icon}
      <span>{item.label}</span>
    </button>
  );
}

function MobileNavItem({
  item, active, onClick,
}: {
  item: (typeof NAV_ITEMS)[number];
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
        active ? "text-[#ff385c]" : "text-white/40 hover:text-white/70"
      }`}
    >
      <span className={`transition-transform ${active ? "scale-110" : ""}`}>{item.icon}</span>
      <span>{item.label}</span>
    </button>
  );
}

function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`tactical-glass rounded-2xl p-5 ${className}`}>
      {children}
    </div>
  );
}

function StatCard({ label, value, sub, icon, accent = false }: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <GlassCard className="cda-fade-up">
      <div className="flex items-center justify-between mb-3">
        <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">{label}</p>
        <div className={`p-2 rounded-lg ${accent ? "bg-[#ff385c]/20 text-[#ff385c]" : "bg-white/8 text-white/40"}`}>
          {icon}
        </div>
      </div>
      <p className={`text-3xl font-bold tracking-tight-custom ${accent ? "text-[#ff385c]" : "text-white"}`}>{value}</p>
      {sub && <p className="text-white/35 text-xs mt-1">{sub}</p>}
    </GlassCard>
  );
}

function GlassCheckbox({ checked, onChange, label, required }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div
        className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all border ${
          checked
            ? "bg-[#ff385c] border-[#ff385c]"
            : "border-white/20 bg-white/5 group-hover:border-white/40"
        }`}
        onClick={() => onChange(!checked)}
      >
        {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </div>
      <span className="text-sm text-white/70 leading-relaxed">
        {label}{required && <span className="text-[#ff385c] ml-0.5">*</span>}
      </span>
    </label>
  );
}

function VehicleTypeBadge({ type }: { type: string }) {
  const isBoat = type === "BOAT";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
      isBoat ? "bg-blue-500/15 text-blue-400 border border-blue-500/20" : "bg-violet-500/15 text-violet-400 border border-violet-500/20"
    }`}>
      {isBoat ? "⛵" : "🚗"} {isBoat ? "Boat" : "Car"}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      onClick={copy}
      className="p-1.5 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/8 transition-all"
      title="Copy"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

// ─────────────────────────────────────────────
// LEAD CARD (available + purchased)
// ─────────────────────────────────────────────

function AvailableLeadCard({
  lead,
  onSelect,
}: {
  lead: SerializedAvailableLead;
  onSelect: (lead: SerializedAvailableLead) => void;
}) {
  const ago = useTimeAgo(lead.createdAt);
  return (
    <div
      className="tactical-glass lead-card-glow rounded-2xl p-5 cursor-pointer transition-all cda-fade-up"
      onClick={() => onSelect(lead)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <VehicleTypeBadge type={lead.vehicleType} />
            <span className="text-white/30 text-xs">{ago}</span>
          </div>
          <h3 className="text-white font-semibold text-sm">{lead.customerName}</h3>
          <p className="text-white/50 text-xs mt-0.5">{lead.serviceName}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[#ff385c] font-bold text-lg">${lead.leadPrice.toFixed(0)}</p>
          <p className="text-white/30 text-xs">to unlock</p>
        </div>
      </div>
      <div className="flex items-center gap-3 text-white/40 text-xs">
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{lead.cityName}, {lead.stateAbbr}</span>
        {lead.boatSize && (
          <span className="flex items-center gap-1">
            <SlidersHorizontal className="h-3 w-3" />
            {BOAT_SIZE_LABELS[lead.boatSize as keyof typeof BOAT_SIZE_LABELS] ?? lead.boatSize}
          </span>
        )}
        {lead.boatType && <span>{lead.boatType}</span>}
      </div>
      <div className="mt-3 pt-3 border-t border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-xs font-medium">New lead</span>
        </div>
        <span className="text-white/40 text-xs flex items-center gap-1">
          View details <ChevronRight className="h-3 w-3" />
        </span>
      </div>
    </div>
  );
}

function PurchasedLeadCard({ lead }: { lead: SerializedPurchasedLead }) {
  const [showContact, setShowContact] = useState(false);
  const ago = useTimeAgo(lead.createdAt);
  return (
    <div className="tactical-glass rounded-2xl p-5 cda-fade-up">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <VehicleTypeBadge type={lead.vehicleType} />
            <span className="text-white/30 text-xs">{ago}</span>
          </div>
          <h3 className="text-white font-semibold text-sm">{lead.customerName}</h3>
          <p className="text-white/50 text-xs mt-0.5">{lead.serviceName}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="inline-flex items-center gap-1 bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full">
            <Check className="h-3 w-3" strokeWidth={3} /> Purchased
          </div>
          <p className="text-white/30 text-xs mt-1">${lead.amountCharged.toFixed(2)}</p>
        </div>
      </div>

      {/* Contact info */}
      <button
        onClick={() => setShowContact((v) => !v)}
        className="w-full flex items-center justify-between py-2 px-3 rounded-xl bg-white/5 border border-white/8 hover:bg-white/8 transition-all text-sm text-white/60 hover:text-white mb-3"
      >
        <span className="flex items-center gap-2">
          <User className="h-3.5 w-3.5" /> Contact Info
        </span>
        {showContact ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>

      {showContact && (
        <div className="space-y-2 mb-3 cda-fade-in">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/4 border border-white/6">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Phone className="h-3.5 w-3.5 text-[#ff385c]" />
              <span>{lead.customerPhone}</span>
            </div>
            <CopyButton text={lead.customerPhone} />
          </div>
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/4 border border-white/6">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <Mail className="h-3.5 w-3.5 text-[#ff385c]" />
              <span>{lead.customerEmail}</span>
            </div>
            <CopyButton text={lead.customerEmail} />
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 text-white/40 text-xs">
        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{lead.cityName}, {lead.stateAbbr}</span>
        {lead.boatSize && (
          <span>{BOAT_SIZE_LABELS[lead.boatSize as keyof typeof BOAT_SIZE_LABELS] ?? lead.boatSize}</span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LEAD DETAIL PANEL (slide-in)
// ─────────────────────────────────────────────

function LeadDetailPanel({
  lead,
  onClose,
  onUnlocked,
  hasPayment,
}: {
  lead: SerializedAvailableLead;
  onClose: () => void;
  onUnlocked: (leadId: string, contact: { name: string; email: string; phone: string }) => void;
  hasPayment: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleUnlock() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/leads/${lead.id}/unlock`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to unlock lead");
      onUnlocked(lead.id, {
        name: data.customerName,
        email: data.customerEmail,
        phone: data.customerPhone,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 cda-fade-in"
        onClick={onClose}
      />
      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-md tactical-glass-solid z-50 flex flex-col cda-slide-right overflow-y-auto dark-scroll">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/8 shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg tracking-tight-custom">Lead Details</h2>
            <p className="text-white/40 text-xs mt-0.5">Review before unlocking</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/40 hover:text-white hover:bg-white/8 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 p-5 space-y-4">
          {/* Price badge */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#ff385c]/20 to-[#ff385c]/5 border border-[#ff385c]/25">
            <div>
              <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Unlock Price</p>
              <p className="text-[#ff385c] font-bold text-3xl tracking-tight-custom mt-1">${lead.leadPrice.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#ff385c]/20 flex items-center justify-center">
              <Zap className="h-5 w-5 text-[#ff385c]" />
            </div>
          </div>

          {/* Service info */}
          <GlassCard>
            <p className="text-white/35 text-xs font-semibold uppercase tracking-wider mb-3">Request Info</p>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Customer</span>
                <span className="text-white font-medium">{lead.customerName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Service</span>
                <span className="text-white font-medium">{lead.serviceName}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Vehicle</span>
                <VehicleTypeBadge type={lead.vehicleType} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-white/50">Location</span>
                <span className="text-white font-medium">{lead.cityName}, {lead.stateAbbr}</span>
              </div>
              {lead.boatSize && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Boat Size</span>
                  <span className="text-white font-medium">
                    {BOAT_SIZE_LABELS[lead.boatSize as keyof typeof BOAT_SIZE_LABELS] ?? lead.boatSize}
                  </span>
                </div>
              )}
              {lead.boatType && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Boat Type</span>
                  <span className="text-white font-medium">{lead.boatType}</span>
                </div>
              )}
              {lead.boatMake && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Make</span>
                  <span className="text-white font-medium">{lead.boatMake}</span>
                </div>
              )}
              {lead.boatYear && (
                <div className="flex justify-between text-sm">
                  <span className="text-white/50">Year</span>
                  <span className="text-white font-medium">{lead.boatYear}</span>
                </div>
              )}
            </div>
          </GlassCard>

          {lead.notes && (
            <GlassCard>
              <p className="text-white/35 text-xs font-semibold uppercase tracking-wider mb-2">Customer Notes</p>
              <p className="text-white/70 text-sm leading-relaxed">{lead.notes}</p>
            </GlassCard>
          )}

          {/* What you get */}
          <GlassCard>
            <p className="text-white/35 text-xs font-semibold uppercase tracking-wider mb-3">After Unlocking</p>
            <div className="space-y-2.5">
              {[
                { icon: <Phone className="h-4 w-4" />, text: "Full phone number" },
                { icon: <Mail className="h-4 w-4" />, text: "Email address" },
                { icon: <User className="h-4 w-4" />, text: "Full customer name" },
              ].map((item) => (
                <div key={item.text} className="flex items-center gap-3 text-sm">
                  <div className="text-[#ff385c]">{item.icon}</div>
                  <span className="text-white/60">{item.text}</span>
                </div>
              ))}
            </div>
          </GlassCard>

          {!hasPayment && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="text-amber-300 text-sm">
                You need a payment method on file to unlock leads.{" "}
                <button className="underline font-semibold">Set up billing →</button>
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/8 shrink-0 space-y-3">
          <button
            className="coral-btn w-full justify-center text-base py-3"
            disabled={!hasPayment || loading}
            onClick={handleUnlock}
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Charging card…</>
            ) : (
              <><Zap className="h-4 w-4" /> Unlock Lead — ${lead.leadPrice.toFixed(2)}</>
            )}
          </button>
          <p className="text-white/25 text-xs text-center">
            Your card will be charged immediately. No refunds except for invalid leads.
          </p>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────
// HOOK: time ago
// ─────────────────────────────────────────────

function useTimeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─────────────────────────────────────────────
// ONBOARDING VIEW
// ─────────────────────────────────────────────

type OnboardingFormData = {
  companyName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  vehicleTypes: string[];
  carServices: string[];
  boatServices: string[];
  serviceRadius: string;
  notifyEmail: boolean;
  notifyCall: boolean;
  notifySms: boolean;
  agreeLeads: boolean;
  agreeToS: boolean;
};

const ONBOARDING_STEPS = [
  { label: "Business Info", icon: Building2 },
  { label: "Services", icon: Wrench },
  { label: "Notifications", icon: Bell },
  { label: "Review", icon: ClipboardList },
];

function OnboardingStepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {ONBOARDING_STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              done ? "bg-[#ff385c]/20 text-[#ff385c] border border-[#ff385c]/30"
              : active ? "bg-[#ff385c] text-white shadow-lg shadow-[#ff385c]/25"
              : "bg-white/8 text-white/30 border border-transparent"
            }`}>
              {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < ONBOARDING_STEPS.length - 1 && (
              <div className={`h-px w-4 ${i < current ? "bg-[#ff385c]/40" : "bg-white/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function OnboardingView({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<OnboardingFormData>({
    companyName: "", address: "", city: "", state: "", zipCode: "",
    phone: "", email: "", website: "",
    vehicleTypes: [], carServices: [], boatServices: [],
    serviceRadius: "25",
    notifyEmail: true, notifyCall: false, notifySms: false,
    agreeLeads: false, agreeToS: false,
  });

  function set<K extends keyof OnboardingFormData>(key: K, value: OnboardingFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArr(key: "vehicleTypes" | "carServices" | "boatServices", value: string) {
    setForm((prev) => {
      const arr = prev[key] as string[];
      return { ...prev, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
    });
  }

  function canProceed(): boolean {
    if (step === 0) return !!(form.companyName && form.city && form.state && form.zipCode && form.phone && form.email);
    if (step === 1) {
      const hasVehicle = form.vehicleTypes.length > 0;
      const hasCarService = form.vehicleTypes.includes("cars") ? form.carServices.length > 0 : true;
      const hasBoatService = form.vehicleTypes.includes("boats") ? form.boatServices.length > 0 : true;
      return hasVehicle && hasCarService && hasBoatService;
    }
    if (step === 2) return form.agreeLeads && form.agreeToS;
    return true;
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/company/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Setup failed. Please try again.");
      }
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] flex flex-col items-center justify-start pt-12 pb-20 px-4">
      <TypographyStyle />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-2.5 mb-10 group">
        <div className="w-9 h-9 rounded-xl bg-[#ff385c]/20 border border-[#ff385c]/30 flex items-center justify-center group-hover:bg-[#ff385c]/30 transition-all">
          <Anchor className="h-5 w-5 text-[#ff385c]" />
        </div>
        <span className="text-white font-bold text-lg tracking-tight-custom">DetailHub</span>
      </Link>

      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#ff385c]/15 text-[#ff385c] border border-[#ff385c]/25 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="h-3 w-3" /> Partner Setup
          </div>
          <h1 className="text-3xl font-bold tracking-tight-custom text-white">Welcome aboard!</h1>
          <p className="text-white/40 mt-2 text-sm">Set up your profile so customers can find you.</p>
        </div>

        <OnboardingStepIndicator current={step} />

        <div className="tactical-glass rounded-2xl p-7 cda-fade-up">

          {/* Step 0: Business Info */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-white font-bold text-lg tracking-tight-custom">Business Information</h2>

              <div className="space-y-1.5">
                <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">Business Name <span className="text-[#ff385c]">*</span></label>
                <input className="glass-input" placeholder="Coastal Detail Co." value={form.companyName} onChange={e => set("companyName", e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">Street Address</label>
                <input className="glass-input" placeholder="123 Marina Blvd" value={form.address} onChange={e => set("address", e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">City <span className="text-[#ff385c]">*</span></label>
                  <input className="glass-input" placeholder="Miami" value={form.city} onChange={e => set("city", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">State <span className="text-[#ff385c]">*</span></label>
                  <select className="glass-input" value={form.state} onChange={e => set("state", e.target.value)}>
                    <option value="">Select…</option>
                    {US_STATES.map(s => <option key={s.abbr} value={s.abbr}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">Zip Code <span className="text-[#ff385c]">*</span></label>
                  <input className="glass-input" placeholder="33101" value={form.zipCode} onChange={e => set("zipCode", e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">Phone <span className="text-[#ff385c]">*</span></label>
                  <input className="glass-input" type="tel" placeholder="(305) 555-0100" value={form.phone} onChange={e => set("phone", e.target.value)} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">Business Email <span className="text-[#ff385c]">*</span></label>
                <input className="glass-input" type="email" placeholder="hello@coastaldetail.com" value={form.email} onChange={e => set("email", e.target.value)} />
              </div>

              <div className="space-y-1.5">
                <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">Website <span className="text-white/25 normal-case font-normal">(optional)</span></label>
                <input className="glass-input" type="url" placeholder="https://coastaldetail.com" value={form.website} onChange={e => set("website", e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 1: Services */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-white font-bold text-lg tracking-tight-custom">Services Offered</h2>

              <div className="space-y-3">
                <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">Vehicle types <span className="text-[#ff385c]">*</span></label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "cars", label: "🚗 Cars / Trucks / SUVs" },
                    { value: "boats", label: "⛵ Boats / Watercraft" },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleArr("vehicleTypes", value)}
                      className={`p-4 rounded-xl border-2 text-sm font-semibold text-left transition-all ${
                        form.vehicleTypes.includes(value)
                          ? "border-[#ff385c] bg-[#ff385c]/10 text-[#ff385c]"
                          : "border-white/10 bg-white/4 text-white/50 hover:border-white/20 hover:text-white/70"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {form.vehicleTypes.includes("cars") && (
                <div className="space-y-3">
                  <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">Car / Truck Services</label>
                  <div className="grid grid-cols-2 gap-2">
                    {CAR_SERVICES.map(({ label, value }) => (
                      <GlassCheckbox
                        key={value}
                        checked={form.carServices.includes(value)}
                        onChange={() => toggleArr("carServices", value)}
                        label={label}
                      />
                    ))}
                  </div>
                </div>
              )}

              {form.vehicleTypes.includes("boats") && (
                <div className="space-y-3">
                  <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">Boat / Marine Services</label>
                  <div className="grid grid-cols-2 gap-2">
                    {BOAT_SERVICES.map(({ label, value }) => (
                      <GlassCheckbox
                        key={value}
                        checked={form.boatServices.includes(value)}
                        onChange={() => toggleArr("boatServices", value)}
                        label={label}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">Service radius</label>
                  <span className="text-white font-bold text-sm">{form.serviceRadius} mi</span>
                </div>
                <input
                  type="range"
                  className="accent-slider w-full"
                  min="10" max="100" step="5"
                  value={form.serviceRadius}
                  onChange={e => set("serviceRadius", e.target.value)}
                />
                <div className="flex justify-between text-white/25 text-xs">
                  <span>10 mi</span><span>50 mi</span><span>100 mi</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Notifications */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-white font-bold text-lg tracking-tight-custom">Notifications & Consent</h2>

              <div className="space-y-3">
                <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">Notify me about new leads via</label>
                <div className="space-y-3 p-4 rounded-xl bg-white/4 border border-white/8">
                  <GlassCheckbox checked={form.notifyEmail} onChange={v => set("notifyEmail", v)} label="Email" />
                  <GlassCheckbox checked={form.notifyCall} onChange={v => set("notifyCall", v)} label="Phone call (urgent / high-value)" />
                  <GlassCheckbox checked={form.notifySms} onChange={v => set("notifySms", v)} label="SMS text message" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-white/60 text-xs font-semibold uppercase tracking-wider">Required agreements</label>
                <div className="space-y-3 p-4 rounded-xl bg-white/4 border border-white/8">
                  <GlassCheckbox
                    checked={form.agreeLeads}
                    onChange={v => set("agreeLeads", v)}
                    label="I agree to receive lead notifications from DetailHub"
                    required
                  />
                  <GlassCheckbox
                    checked={form.agreeToS}
                    onChange={v => set("agreeToS", v)}
                    label={<>I agree to the <a href="/terms" className="text-[#ff385c] underline" target="_blank">Terms of Service</a> and <a href="/privacy" className="text-[#ff385c] underline" target="_blank">Privacy Policy</a></>}
                    required
                  />
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-500/8 border border-blue-500/15">
                <Shield className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-blue-300 text-sm">
                  <strong className="text-blue-200">No monthly fees.</strong> You&apos;re only charged when you unlock a lead. Lead prices range from $15–$45.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-white font-bold text-lg tracking-tight-custom">Review & Complete Setup</h2>

              <div className="space-y-3 text-sm">
                <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-2">
                  <p className="text-white/35 text-xs font-semibold uppercase tracking-wider">Business</p>
                  <p className="font-bold text-white text-base">{form.companyName}</p>
                  {form.address && <p className="text-white/50">{form.address}</p>}
                  <p className="text-white/50">{form.city}, {form.state} {form.zipCode}</p>
                  <p className="text-white/50">{form.phone}</p>
                  <p className="text-white/50">{form.email}</p>
                  {form.website && <p className="text-white/50">{form.website}</p>}
                </div>

                <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-2">
                  <p className="text-white/35 text-xs font-semibold uppercase tracking-wider">Services</p>
                  <p className="text-white/60">
                    <span className="text-white/80 font-medium">Vehicles:</span>{" "}
                    {form.vehicleTypes.map(v => v === "cars" ? "Cars/Trucks/SUVs" : "Boats/Watercraft").join(", ") || "None"}
                  </p>
                  {form.carServices.length > 0 && (
                    <p className="text-white/60">
                      <span className="text-white/80 font-medium">Car:</span>{" "}
                      {CAR_SERVICES.filter(s => form.carServices.includes(s.value)).map(s => s.label).join(", ")}
                    </p>
                  )}
                  {form.boatServices.length > 0 && (
                    <p className="text-white/60">
                      <span className="text-white/80 font-medium">Boat:</span>{" "}
                      {BOAT_SERVICES.filter(s => form.boatServices.includes(s.value)).map(s => s.label).join(", ")}
                    </p>
                  )}
                  <p className="text-white/60"><span className="text-white/80 font-medium">Radius:</span> {form.serviceRadius} miles</p>
                </div>

                <div className="rounded-xl border border-white/8 bg-white/4 p-4 space-y-2">
                  <p className="text-white/35 text-xs font-semibold uppercase tracking-wider">Notifications</p>
                  <div className="flex flex-wrap gap-2">
                    {form.notifyEmail && <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs font-semibold px-2.5 py-1 rounded-full">Email</span>}
                    {form.notifyCall && <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs font-semibold px-2.5 py-1 rounded-full">Phone</span>}
                    {form.notifySms && <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 text-xs font-semibold px-2.5 py-1 rounded-full">SMS</span>}
                  </div>
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/8">
            {step > 0 ? (
              <button className="ghost-btn" onClick={() => setStep(s => s - 1)}>
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <button className="coral-btn" disabled={!canProceed()} onClick={() => setStep(s => s + 1)}>
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button className="coral-btn px-8 py-3 text-base" disabled={isSubmitting} onClick={handleSubmit}>
                {isSubmitting
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Setting up…</>
                  : <><CheckCircle2 className="h-4 w-4" /> Complete Setup</>
                }
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-white/25 mt-6">
          You can update all of this from your dashboard at any time.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// DASHBOARD VIEW
// ─────────────────────────────────────────────

function DashboardView({
  company,
  availableLeads,
  onNavigate,
}: {
  company: SerializedCompany;
  availableLeads: SerializedAvailableLead[];
  onNavigate: (view: View) => void;
}) {
  const hasPayment = !!company.stripeCustomerId;
  const profileFields = [company.name, company.phone, company.email, company.address, company.website];
  const filledFields = profileFields.filter(Boolean).length;
  const profilePct = Math.round((filledFields / profileFields.length) * 100);

  return (
    <div className="space-y-6 cda-fade-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight-custom text-white">{company.name}</h1>
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
              company.status === "ACTIVE" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25" :
              company.status === "PENDING" ? "bg-amber-500/15 text-amber-400 border-amber-500/25" :
              "bg-white/8 text-white/40 border-white/10"
            }`}>
              {company.status}
            </span>
          </div>
          <p className="text-white/40 text-sm mt-1 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {company.cityName}, {company.stateAbbr}
            {company.services.length > 0 && (
              <> · {company.services.length} service{company.services.length !== 1 ? "s" : ""}</>
            )}
          </p>
        </div>
        <button
          onClick={() => onNavigate("leads")}
          className="coral-btn shrink-0"
        >
          <Inbox className="h-4 w-4" /> View Leads
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Available Leads"
          value={String(availableLeads.length)}
          sub="in your area"
          icon={<Inbox className="h-4 w-4" />}
          accent={availableLeads.length > 0}
        />
        <StatCard
          label="Total Spend"
          value={`$${company.totalSpend.toFixed(2)}`}
          sub={`${company.billingHistory.length} leads unlocked`}
          icon={<DollarSign className="h-4 w-4" />}
        />
        <StatCard
          label="Avg. Rating"
          value={company.averageRating ? Number(company.averageRating).toFixed(1) : "—"}
          sub={`${company.reviewCount} review${company.reviewCount !== 1 ? "s" : ""}`}
          icon={<Star className="h-4 w-4" />}
        />
      </div>

      {/* Setup cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Payment */}
        <GlassCard className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${hasPayment ? "bg-emerald-500/20" : "bg-[#ff385c]/15"}`}>
            <CreditCard className={`h-5 w-5 ${hasPayment ? "text-emerald-400" : "text-[#ff385c]"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">Payment Method</p>
            <p className="text-white/40 text-xs mt-0.5 truncate">
              {hasPayment ? "Card on file — ready to unlock" : "Add a card to unlock leads"}
            </p>
          </div>
          <button
            onClick={() => onNavigate("billing")}
            className="text-[#ff385c] text-xs font-semibold hover:underline flex items-center gap-0.5 shrink-0"
          >
            {hasPayment ? "Manage" : "Add"} <ArrowRight className="h-3 w-3" />
          </button>
        </GlassCard>

        {/* Profile */}
        <GlassCard className="flex items-center gap-4">
          <div className={`p-3 rounded-xl ${profilePct === 100 ? "bg-emerald-500/20" : "bg-blue-500/15"}`}>
            <User className={`h-5 w-5 ${profilePct === 100 ? "text-emerald-400" : "text-blue-400"}`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">Business Profile</p>
            <div className="flex items-center gap-2 mt-1.5">
              <div className="flex-1 h-1.5 bg-white/8 rounded-full overflow-hidden">
                <div className="h-full bg-[#ff385c] rounded-full transition-all" style={{ width: `${profilePct}%` }} />
              </div>
              <span className="text-white/40 text-xs font-semibold">{profilePct}%</span>
            </div>
          </div>
          <button
            onClick={() => onNavigate("profile")}
            className="text-[#ff385c] text-xs font-semibold hover:underline flex items-center gap-0.5 shrink-0"
          >
            Edit <ArrowRight className="h-3 w-3" />
          </button>
        </GlassCard>
      </div>

      {/* Lead Inbox Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-white font-bold text-lg tracking-tight-custom">Lead Inbox</h2>
            <p className="text-white/40 text-sm mt-0.5">Customers requesting quotes in your area</p>
          </div>
          <button
            onClick={() => onNavigate("leads")}
            className="text-[#ff385c] text-sm font-semibold hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {availableLeads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableLeads.slice(0, 4).map((lead) => (
              <div key={lead.id} className="tactical-glass rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ff385c]/15 flex items-center justify-center shrink-0">
                  {lead.vehicleType === "BOAT" ? <span className="text-lg">⛵</span> : <Car className="h-5 w-5 text-[#ff385c]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{lead.customerName} · {lead.serviceName}</p>
                  <p className="text-white/40 text-xs truncate">{lead.cityName}, {lead.stateAbbr}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[#ff385c] font-bold text-sm">${lead.leadPrice.toFixed(0)}</p>
                  <button
                    onClick={() => onNavigate("leads")}
                    className="text-white/30 text-xs hover:text-white/60 transition-colors"
                  >
                    Unlock
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <GlassCard className="text-center py-12">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-6 w-6 text-white/20" />
            </div>
            <h3 className="text-white font-semibold mb-2">No leads yet</h3>
            <p className="text-white/40 text-sm max-w-xs mx-auto">
              When a customer in your area requests a quote, you&apos;ll see it here.
            </p>
          </GlassCard>
        )}
      </div>

      {/* No payment CTA */}
      {!hasPayment && (
        <div className="flex items-start gap-4 p-5 rounded-2xl bg-gradient-to-r from-[#ff385c]/15 to-[#ff385c]/5 border border-[#ff385c]/20">
          <Zap className="h-5 w-5 text-[#ff385c] shrink-0 mt-0.5" />
          <div>
            <p className="text-white font-semibold text-sm">Add a payment method to start unlocking leads</p>
            <p className="text-white/50 text-xs mt-0.5">
              You&apos;re only charged when you unlock a contact. No monthly fees.{" "}
              <button onClick={() => onNavigate("billing")} className="text-[#ff385c] underline font-semibold">
                Set up billing →
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// LEADS VIEW
// ─────────────────────────────────────────────

function LeadsView({
  availableLeads: initialAvailable,
  purchasedLeads,
  hasPayment,
}: {
  availableLeads: SerializedAvailableLead[];
  purchasedLeads: SerializedPurchasedLead[];
  hasPayment: boolean;
}) {
  const [tab, setTab] = useState<"available" | "purchased">("available");
  const [selectedLead, setSelectedLead] = useState<SerializedAvailableLead | null>(null);
  const [available, setAvailable] = useState(initialAvailable);
  const [purchased, setPurchased] = useState(purchasedLeads);

  const handleUnlocked = useCallback(
    (leadId: string, contact: { name: string; email: string; phone: string }) => {
      const lead = available.find((l) => l.id === leadId);
      if (!lead) return;

      const newPurchased: SerializedPurchasedLead = {
        id: lead.id,
        purchaseId: `purchase_${leadId}`,
        vehicleType: lead.vehicleType,
        customerName: contact.name,
        customerEmail: contact.email,
        customerPhone: contact.phone,
        serviceName: lead.serviceName,
        cityName: lead.cityName,
        stateAbbr: lead.stateAbbr,
        leadPrice: lead.leadPrice,
        amountCharged: lead.leadPrice,
        boatSize: lead.boatSize,
        boatType: lead.boatType,
        boatMake: lead.boatMake,
        boatYear: lead.boatYear,
        notes: lead.notes,
        createdAt: lead.createdAt,
      };

      setAvailable((prev) => prev.filter((l) => l.id !== leadId));
      setPurchased((prev) => [newPurchased, ...prev]);
      setSelectedLead(null);
      setTab("purchased");
    },
    [available]
  );

  return (
    <div className="space-y-5 cda-fade-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight-custom text-white">Lead Inbox</h1>
        <p className="text-white/40 text-sm mt-0.5">Purchase leads to unlock customer contact information.</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/8 w-fit">
        {(["available", "purchased"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t
                ? "bg-[#ff385c] text-white shadow-lg shadow-[#ff385c]/20"
                : "text-white/40 hover:text-white/70"
            }`}
          >
            {t === "available" ? `Available (${available.length})` : `Purchased (${purchased.length})`}
          </button>
        ))}
      </div>

      {tab === "available" && (
        <>
          {available.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {available.map((lead) => (
                <AvailableLeadCard key={lead.id} lead={lead} onSelect={setSelectedLead} />
              ))}
            </div>
          ) : (
            <GlassCard className="text-center py-14">
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Inbox className="h-6 w-6 text-white/20" />
              </div>
              <h3 className="text-white font-semibold mb-2">No available leads</h3>
              <p className="text-white/35 text-sm">Check back soon — new leads come in daily.</p>
            </GlassCard>
          )}
        </>
      )}

      {tab === "purchased" && (
        <>
          {purchased.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {purchased.map((lead) => (
                <PurchasedLeadCard key={lead.purchaseId} lead={lead} />
              ))}
            </div>
          ) : (
            <GlassCard className="text-center py-14">
              <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Receipt className="h-6 w-6 text-white/20" />
              </div>
              <h3 className="text-white font-semibold mb-2">No purchased leads yet</h3>
              <p className="text-white/35 text-sm">Unlock leads from the Available tab to see them here.</p>
            </GlassCard>
          )}
        </>
      )}

      {/* Lead detail panel */}
      {selectedLead && (
        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUnlocked={handleUnlocked}
          hasPayment={hasPayment}
        />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// PROFILE VIEW
// ─────────────────────────────────────────────

type ProfileFormData = {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  categories: string[];
};

const ALL_SERVICES = [
  { label: "Full Detail (Boat)", value: "FULL_DETAIL", type: "boat" },
  { label: "Hull Cleaning", value: "HULL_CLEANING", type: "boat" },
  { label: "Wax & Polish", value: "WAXING_POLISHING", type: "boat" },
  { label: "Teak Restoration", value: "TEAK_RESTORATION", type: "boat" },
  { label: "Bottom Paint", value: "BOTTOM_PAINT", type: "boat" },
  { label: "Interior Detail (Boat)", value: "INTERIOR_DETAIL", type: "boat" },
  { label: "Canvas Cleaning", value: "CANVAS_CLEANING", type: "boat" },
  { label: "Brightwork", value: "BRIGHTWORK", type: "boat" },
  { label: "Full Detail (Car)", value: "CAR_FULL_DETAIL", type: "car" },
  { label: "Interior Detail (Car)", value: "CAR_INTERIOR", type: "car" },
  { label: "Exterior Wash", value: "CAR_EXTERIOR", type: "car" },
  { label: "Paint Correction", value: "PAINT_CORRECTION", type: "car" },
  { label: "Ceramic Coating", value: "CERAMIC_COATING", type: "car" },
  { label: "Window Tint", value: "WINDOW_TINT", type: "car" },
];

function ProfileView({ company }: { company: SerializedCompany }) {
  const [form, setForm] = useState<ProfileFormData>({
    name: company.name,
    address: company.address ?? "",
    phone: company.phone ?? "",
    email: company.email ?? "",
    website: company.website ?? "",
    description: company.description ?? "",
    categories: company.services.map((s) => s.category),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function setF<K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleCategory(cat: string) {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/company/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to save profile");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl cda-fade-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight-custom text-white">Business Profile</h1>
        <p className="text-white/40 text-sm mt-0.5">
          Changes appear on your public listing.
          {company.slug && (
            <> <Link href={`/companies/${company.slug}`} className="text-[#ff385c] hover:underline" target="_blank">View listing →</Link></>
          )}
        </p>
      </div>

      <GlassCard className="space-y-5">
        <h2 className="text-white font-semibold text-sm uppercase tracking-wider text-white/40">Business Details</h2>

        <div className="space-y-1.5">
          <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Business Name</label>
          <input className="glass-input" value={form.name} onChange={e => setF("name", e.target.value)} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Phone</label>
            <input className="glass-input" type="tel" value={form.phone} onChange={e => setF("phone", e.target.value)} placeholder="(305) 555-0100" />
          </div>
          <div className="space-y-1.5">
            <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Email</label>
            <input className="glass-input" type="email" value={form.email} onChange={e => setF("email", e.target.value)} placeholder="hello@company.com" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Website</label>
          <input className="glass-input" type="url" value={form.website} onChange={e => setF("website", e.target.value)} placeholder="https://yourcompany.com" />
        </div>

        <div className="space-y-1.5">
          <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Street Address</label>
          <input className="glass-input" value={form.address} onChange={e => setF("address", e.target.value)} placeholder="123 Marina Blvd" />
        </div>

        <div className="flex items-center gap-2 py-1 text-white/30 text-xs">
          <MapPin className="h-3.5 w-3.5" />
          <span>{company.cityName}, {company.stateAbbr} · City cannot be changed after setup</span>
        </div>

        <div className="space-y-1.5">
          <label className="text-white/50 text-xs font-semibold uppercase tracking-wider">Description</label>
          <textarea
            className="glass-input min-h-[90px] resize-none"
            value={form.description}
            onChange={e => setF("description", e.target.value)}
            placeholder="Describe your business, experience, and specialties…"
          />
        </div>
      </GlassCard>

      <GlassCard className="space-y-4">
        <h2 className="text-white/40 font-semibold text-xs uppercase tracking-wider">Services Offered</h2>

        <div>
          <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2">⛵ Boat / Marine</p>
          <div className="grid grid-cols-2 gap-2">
            {ALL_SERVICES.filter(s => s.type === "boat").map(({ label, value }) => (
              <GlassCheckbox
                key={value}
                checked={form.categories.includes(value)}
                onChange={() => toggleCategory(value)}
                label={label}
              />
            ))}
          </div>
        </div>

        <div className="pt-3 border-t border-white/8">
          <p className="text-white/50 text-xs font-medium uppercase tracking-wider mb-2">🚗 Car / Truck</p>
          <div className="grid grid-cols-2 gap-2">
            {ALL_SERVICES.filter(s => s.type === "car").map(({ label, value }) => (
              <GlassCheckbox
                key={value}
                checked={form.categories.includes(value)}
                onChange={() => toggleCategory(value)}
                label={label}
              />
            ))}
          </div>
        </div>
      </GlassCard>

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button className="coral-btn py-3 px-8" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : <><Check className="h-4 w-4" /> Save Changes</>}
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-semibold cda-fade-in">
            <CheckCircle2 className="h-4 w-4" /> Saved!
          </span>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// BILLING VIEW
// ─────────────────────────────────────────────

function BillingView({
  company,
  paymentMethod,
}: {
  company: SerializedCompany;
  paymentMethod: PaymentMethodData | null;
}) {
  return (
    <div className="space-y-6 max-w-2xl cda-fade-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight-custom text-white">Billing</h1>
        <p className="text-white/40 text-sm mt-0.5">Manage your payment method and purchase history.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <GlassCard>
          <div className="flex items-center gap-2 text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">
            <DollarSign className="h-3.5 w-3.5" /> Credit Balance
          </div>
          <p className="text-3xl font-bold text-white tracking-tight-custom">
            ${Number(company.leadCreditBalance).toFixed(2)}
          </p>
        </GlassCard>
        <GlassCard>
          <div className="flex items-center gap-2 text-white/40 text-xs font-semibold uppercase tracking-wider mb-2">
            <TrendingUp className="h-3.5 w-3.5" /> Total Spent
          </div>
          <p className="text-3xl font-bold text-white tracking-tight-custom">
            ${company.totalSpend.toFixed(2)}
          </p>
          <p className="text-white/30 text-xs mt-1">{company.billingHistory.length} leads unlocked</p>
        </GlassCard>
      </div>

      {/* Payment Method */}
      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-white/40" />
          <h2 className="text-white/40 font-semibold text-xs uppercase tracking-wider">Payment Method</h2>
        </div>

        {paymentMethod ? (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/8">
            <div className="w-12 h-8 rounded-md bg-white/10 flex items-center justify-center text-white/60 text-xs font-bold uppercase">
              {paymentMethod.brand.slice(0, 4)}
            </div>
            <div>
              <p className="text-white font-semibold text-sm">•••• •••• •••• {paymentMethod.last4}</p>
              <p className="text-white/40 text-xs mt-0.5">
                Expires {String(paymentMethod.expMonth).padStart(2, "0")}/{paymentMethod.expYear}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" /> Active
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-amber-500/8 border border-amber-500/15">
            <p className="text-amber-300 text-sm font-medium">No payment method on file</p>
            <p className="text-amber-300/60 text-xs mt-0.5">Add a card below to start unlocking leads.</p>
          </div>
        )}

        <div className="pt-2">
          <p className="text-white/30 text-xs mb-4">{paymentMethod ? "Update your card:" : "Add a card:"}</p>
          <PaymentMethodForm currentPaymentMethod={paymentMethod} />
        </div>
      </GlassCard>

      {/* Purchase History */}
      <GlassCard className="space-y-4">
        <div className="flex items-center gap-2">
          <Receipt className="h-4 w-4 text-white/40" />
          <h2 className="text-white/40 font-semibold text-xs uppercase tracking-wider">Purchase History</h2>
        </div>

        {company.billingHistory.length > 0 ? (
          <div className="space-y-2">
            {company.billingHistory.map((purchase) => (
              <div
                key={purchase.id}
                className="flex items-center justify-between py-3 border-b border-white/6 last:border-0 text-sm"
              >
                <div>
                  <p className="text-white font-medium">{purchase.serviceName} Lead</p>
                  <p className="text-white/35 text-xs mt-0.5">
                    {new Date(purchase.createdAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                    {purchase.isRefunded && (
                      <span className="ml-2 text-red-400 font-semibold">Refunded</span>
                    )}
                    {purchase.stripePaymentIntentId && (
                      <span className="ml-2 text-white/20">· {purchase.stripePaymentIntentId.slice(-8)}</span>
                    )}
                  </p>
                </div>
                <p className={`font-bold ${purchase.isRefunded ? "line-through text-white/30" : "text-white"}`}>
                  ${purchase.amountCharged.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Receipt className="h-8 w-8 text-white/15 mx-auto mb-3" />
            <p className="text-white/30 text-sm">No purchases yet. Browse your lead inbox to get started.</p>
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────

export default function CompanyApp({
  company: initialCompany,
  availableLeads,
  purchasedLeads,
  paymentMethod,
}: AppProps) {
  const router = useRouter();
  const [view, setView] = useState<View>("dashboard");
  const [company, setCompany] = useState(initialCompany);

  function handleOnboardingComplete() {
    router.refresh();
  }

  // Onboarding: no company yet
  if (!company) {
    return <OnboardingView onComplete={handleOnboardingComplete} />;
  }

  const hasPayment = !!company.stripeCustomerId;

  return (
    <>
      <TypographyStyle />
      <div className="flex min-h-screen bg-[#0a0a12] dark-scroll">
        {/* ── Desktop Sidebar ── */}
        <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-white/8 tactical-glass-solid min-h-screen">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 px-5 py-5 border-b border-white/8 hover:bg-white/4 transition-all">
            <div className="w-8 h-8 rounded-lg bg-[#ff385c]/20 border border-[#ff385c]/25 flex items-center justify-center">
              <Anchor className="h-4 w-4 text-[#ff385c]" />
            </div>
            <span className="text-white font-bold text-sm tracking-tight-custom">DetailHub</span>
          </Link>

          {/* Company info */}
          <div className="px-4 py-4 border-b border-white/8">
            <p className="text-white font-semibold text-sm truncate">{company.name}</p>
            <p className="text-white/35 text-xs mt-0.5">{company.cityName}, {company.stateAbbr}</p>
            <div className="flex items-center gap-1.5 mt-2">
              <div className={`w-1.5 h-1.5 rounded-full ${company.status === "ACTIVE" ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span className="text-white/35 text-xs">{company.status}</span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1">
            {NAV_ITEMS.map((item) => (
              <SidebarItem key={item.id} item={item} active={view === item.id} onClick={() => setView(item.id)} />
            ))}
          </nav>

          {/* Bottom */}
          <div className="p-4 border-t border-white/8">
            {hasPayment ? (
              <div className="flex items-center gap-2 text-emerald-400 text-xs">
                <Shield className="h-3.5 w-3.5" />
                <span className="font-medium">Payment active</span>
              </div>
            ) : (
              <button
                onClick={() => setView("billing")}
                className="w-full flex items-center gap-2 text-xs text-[#ff385c] font-semibold hover:underline"
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Add payment method</span>
              </button>
            )}
          </div>
        </aside>

        {/* ── Main Content ── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile sticky header */}
          <header className="md:hidden sticky top-0 z-30 tactical-glass-solid border-b border-white/8 px-4 py-3 flex items-center justify-between shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <Anchor className="h-5 w-5 text-[#ff385c]" />
              <span className="text-white font-bold text-sm tracking-tight-custom">DetailHub</span>
            </Link>
            <div>
              <p className="text-white font-semibold text-xs">{company.name}</p>
              <p className="text-white/35 text-xs">{company.cityName}, {company.stateAbbr}</p>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto dark-scroll">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-8">
              {view === "dashboard" && (
                <DashboardView
                  company={company}
                  availableLeads={availableLeads}
                  onNavigate={setView}
                />
              )}
              {view === "leads" && (
                <LeadsView
                  availableLeads={availableLeads}
                  purchasedLeads={purchasedLeads}
                  hasPayment={hasPayment}
                />
              )}
              {view === "profile" && <ProfileView company={company} />}
              {view === "billing" && (
                <BillingView company={company} paymentMethod={paymentMethod} />
              )}
            </div>
          </main>
        </div>

        {/* ── Mobile Bottom Nav ── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 tactical-glass-solid border-t border-white/8 px-2 py-2 flex items-center justify-around">
          {NAV_ITEMS.map((item) => (
            <MobileNavItem key={item.id} item={item} active={view === item.id} onClick={() => setView(item.id)} />
          ))}
        </nav>
      </div>
    </>
  );
}
