"use client";

// src/components/dashboard/ProfileEditForm.tsx
// Client-side profile editing form with save functionality

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import Link from "next/link";

const ALL_SERVICES = [
  // Car
  { label: "Car Full Detail", value: "CAR_FULL_DETAIL", type: "car" },
  { label: "Car Interior", value: "CAR_INTERIOR", type: "car" },
  { label: "Car Exterior Wash", value: "CAR_EXTERIOR", type: "car" },
  { label: "Paint Correction", value: "PAINT_CORRECTION", type: "car" },
  { label: "Ceramic Coating", value: "CERAMIC_COATING", type: "car" },
  { label: "Window Tint", value: "WINDOW_TINT", type: "car" },
  // Boat
  { label: "Boat Full Detail", value: "FULL_DETAIL", type: "boat" },
  { label: "Hull Cleaning", value: "HULL_CLEANING", type: "boat" },
  { label: "Wax & Polish", value: "WAXING_POLISHING", type: "boat" },
  { label: "Teak Restoration", value: "TEAK_RESTORATION", type: "boat" },
  { label: "Bottom Paint", value: "BOTTOM_PAINT", type: "boat" },
  { label: "Interior Detail", value: "INTERIOR_DETAIL", type: "boat" },
  { label: "Canvas Cleaning", value: "CANVAS_CLEANING", type: "boat" },
  { label: "Brightwork", value: "BRIGHTWORK", type: "boat" },
];

type Props = {
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    description: string;
    city: string;
    state: string;
    zipCode: string;
    status: string;
    slug: string;
    services: string[];
  };
};

const inputCls = "rounded-xl border-gray-200 bg-white focus:border-[#ff385c] focus:ring-0 font-medium text-sm";
const labelCls = "text-sm font-semibold text-[#1d1d1f]";

export function ProfileEditForm({ company }: Props) {
  const [name, setName] = useState(company.name);
  const [address, setAddress] = useState(company.address);
  const [phone, setPhone] = useState(company.phone);
  const [email, setEmail] = useState(company.email);
  const [website, setWebsite] = useState(company.website);
  const [description, setDescription] = useState(company.description);
  const [selectedServices, setSelectedServices] = useState<string[]>(company.services);

  const [isSaving, setIsSaving] = useState(false);
  const [saveResult, setSaveResult] = useState<"success" | "error" | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function toggleService(value: string) {
    setSelectedServices((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    setSaveResult(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/company/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          address: address || undefined,
          phone: phone || undefined,
          email: email || undefined,
          website: website || undefined,
          description: description || undefined,
          services: selectedServices,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Save failed");
      }

      setSaveResult("success");
      setTimeout(() => setSaveResult(null), 3000);
    } catch (err) {
      setSaveResult("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Status bar */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <Badge
            className={
              company.status === "ACTIVE"
                ? "bg-green-100 text-green-700 border-green-200"
                : company.status === "PENDING"
                ? "bg-amber-100 text-amber-700 border-amber-200"
                : "bg-slate-100 text-slate-600"
            }
            variant="outline"
          >
            {company.status}
          </Badge>
          <span className="text-sm text-gray-500">
            {company.city}, {company.state}
          </span>
        </div>
        <Link
          href={`/companies/${company.slug}`}
          target="_blank"
          className="text-xs text-[#ff385c] hover:underline font-semibold flex items-center gap-1"
        >
          View public listing <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {/* Business Details */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
        <h2 className="font-bold text-[#1d1d1f]">Business Details</h2>
        <Separator />

        <div className="space-y-1.5">
          <Label className={labelCls}>Business Name <span className="text-[#ff385c]">*</span></Label>
          <Input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
          />
        </div>

        <div className="space-y-1.5">
          <Label className={labelCls}>Street Address</Label>
          <Input
            className={inputCls}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="123 Marina Blvd"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className={labelCls}>Phone</Label>
            <Input
              className={inputCls}
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(305) 555-0100"
            />
          </div>
          <div className="space-y-1.5">
            <Label className={labelCls}>Business Email</Label>
            <Input
              className={inputCls}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="hello@company.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className={labelCls}>Website</Label>
          <Input
            className={inputCls}
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourcompany.com"
          />
        </div>

        <div className="space-y-1.5">
          <Label className={labelCls}>About Your Business</Label>
          <textarea
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium focus:border-[#ff385c] focus:outline-none resize-none"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell customers about your experience, specialty, and what sets you apart…"
            maxLength={1000}
          />
          <p className="text-xs text-gray-400 text-right">{description.length}/1000</p>
        </div>
      </div>

      {/* Services */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-5">
        <h2 className="font-bold text-[#1d1d1f]">Services Offered</h2>
        <Separator />

        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Car / Truck Services</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_SERVICES.filter((s) => s.type === "car").map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleService(value)}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold text-left transition-all ${
                    selectedServices.includes(value)
                      ? "border-[#ff385c] bg-[#ff385c]/5 text-[#ff385c]"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {selectedServices.includes(value) && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Boat / Marine Services</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_SERVICES.filter((s) => s.type === "boat").map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleService(value)}
                  className={`px-3 py-2 rounded-xl border text-xs font-semibold text-left transition-all ${
                    selectedServices.includes(value)
                      ? "border-[#ff385c] bg-[#ff385c]/5 text-[#ff385c]"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {selectedServices.includes(value) && <CheckCircle2 className="h-3 w-3 inline mr-1" />}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex items-center justify-between">
        {saveResult === "success" && (
          <p className="text-sm text-green-600 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4" /> Changes saved successfully
          </p>
        )}
        {saveResult === "error" && (
          <p className="text-sm text-red-600 font-medium">{errorMsg}</p>
        )}
        {saveResult === null && <div />}

        <Button
          type="submit"
          disabled={isSaving}
          className="bg-[#ff385c] hover:bg-[#e0334f] text-white rounded-xl font-semibold px-8"
        >
          {isSaving ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving…</>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </form>
  );
}
