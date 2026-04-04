// src/components/dashboard/LeadCard.tsx
// Lead preview card — contact info masked until purchased

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LeadUnlockButton } from "./LeadUnlockButton";
import { BOAT_SIZE_LABELS, SERVICE_LABELS } from "@/types";
import type { BoatSize, ServiceCategory, LeadStatus } from "@/types";
import { MapPin, Ship, Calendar, DollarSign } from "lucide-react";

type Lead = {
  id: string;
  status: LeadStatus;
  boatSize: BoatSize;
  boatType: string | null;
  boatMake: string | null;
  boatYear: number | null;
  zipCode: string;
  notes: string | null;
  preferredDate: Date | null;
  leadPrice: number;
  createdAt: Date;
  service: { name: string; category: ServiceCategory };
  city: { name: string; state: { abbreviation: string } };
  // Contact fields — only present after purchase
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
};

type Props = {
  lead: Lead;
  isPurchased?: boolean;
};

const statusColors: Record<LeadStatus, string> = {
  NEW: "bg-blue-100 text-blue-700",
  AVAILABLE: "bg-green-100 text-green-700",
  PURCHASED: "bg-purple-100 text-purple-700",
  EXPIRED: "bg-slate-100 text-slate-500",
  REFUNDED: "bg-red-100 text-red-600",
};

export function LeadCard({ lead, isPurchased = false }: Props) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 flex flex-row items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="font-medium">
              {SERVICE_LABELS[lead.service.category]}
            </Badge>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[lead.status]}`}>
              {lead.status}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Submitted {new Date(lead.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-slate-400">Lead price</p>
          <p className="font-bold text-slate-900 flex items-center gap-0.5">
            <DollarSign className="h-3 w-3" />
            {Number(lead.leadPrice).toFixed(2)}
          </p>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1.5 text-slate-600">
            <Ship className="h-3.5 w-3.5 text-slate-400" />
            {BOAT_SIZE_LABELS[lead.boatSize]}
            {lead.boatType && ` · ${lead.boatType}`}
          </div>
          <div className="flex items-center gap-1.5 text-slate-600">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            {lead.city.name}, {lead.city.state.abbreviation} {lead.zipCode}
          </div>
          {lead.boatMake && (
            <div className="text-slate-600 text-xs">
              {lead.boatMake} {lead.boatYear && `(${lead.boatYear})`}
            </div>
          )}
          {lead.preferredDate && (
            <div className="flex items-center gap-1.5 text-slate-600 text-xs">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              {new Date(lead.preferredDate).toLocaleDateString()}
            </div>
          )}
        </div>

        {lead.notes && (
          <p className="text-xs text-slate-500 bg-slate-50 rounded p-2 italic">
            &ldquo;{lead.notes}&rdquo;
          </p>
        )}

        {isPurchased && lead.customerName ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-3 space-y-1">
            <p className="text-xs font-semibold text-green-700 mb-2">Contact Unlocked</p>
            <p className="text-sm font-medium text-slate-900">{lead.customerName}</p>
            <p className="text-sm text-slate-700">{lead.customerEmail}</p>
            <p className="text-sm text-slate-700">{lead.customerPhone}</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="blur-sm select-none text-sm text-slate-600 bg-slate-50 rounded-md p-3">
              <p>●●●●●● ●●●●●●●●●</p>
              <p>●●●●●@●●●●●.com</p>
              <p>(●●●) ●●●-●●●●</p>
            </div>
            {lead.status !== "EXPIRED" && lead.status !== "REFUNDED" && (
              <LeadUnlockButton leadId={lead.id} price={Number(lead.leadPrice)} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
