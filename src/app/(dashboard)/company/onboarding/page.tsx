"use client";

// src/app/(dashboard)/company/onboarding/page.tsx
// Multi-step company onboarding wizard

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ChevronRight, ChevronLeft, Loader2, Building2, Wrench, Bell, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  { label: "Engine Bay Detail", value: "ENGINE_BAY" },
  { label: "Headlight Restoration", value: "HEADLIGHT_RESTORATION" },
  { label: "Odor Removal", value: "ODOR_REMOVAL" },
  { label: "Leather Conditioning", value: "LEATHER_CONDITIONING" },
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
  { label: "Engine Wash", value: "ENGINE_WASH" },
  { label: "Deck Restoration", value: "DECK_RESTORATION" },
];

type FormData = {
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

const STEPS = [
  { label: "Business Info", icon: Building2 },
  { label: "Services", icon: Wrench },
  { label: "Notifications", icon: Bell },
  { label: "Review", icon: ClipboardList },
];

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = i < current;
        const active = i === current;
        return (
          <div key={i} className="flex items-center gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              done ? "bg-[#ff385c]/10 text-[#ff385c]" :
              active ? "bg-[#ff385c] text-white shadow-md" :
              "bg-gray-100 text-gray-400"
            }`}>
              {done ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-4 ${i < current ? "bg-[#ff385c]/40" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function Checkbox({ checked, onChange, label, required }: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group">
      <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
        checked ? "bg-[#ff385c] border-[#ff385c]" : "border-gray-300 group-hover:border-gray-400"
      }`} onClick={() => onChange(!checked)}>
        {checked && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
      </div>
      <span className="text-sm text-gray-700 leading-relaxed">{label}{required && <span className="text-[#ff385c] ml-0.5">*</span>}</span>
    </label>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FormData>({
    companyName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    website: "",
    vehicleTypes: [],
    carServices: [],
    boatServices: [],
    serviceRadius: "25",
    notifyEmail: true,
    notifyCall: false,
    notifySms: false,
    agreeLeads: false,
    agreeToS: false,
  });

  function set<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArr(key: "vehicleTypes" | "carServices" | "boatServices", value: string) {
    setForm((prev) => {
      const arr = prev[key] as string[];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  }

  function canProceed(): boolean {
    if (step === 0) {
      return !!(form.companyName && form.city && form.state && form.zipCode && form.phone && form.email);
    }
    if (step === 1) {
      const hasVehicle = form.vehicleTypes.length > 0;
      const hasCarService = form.vehicleTypes.includes("cars") ? form.carServices.length > 0 : true;
      const hasBoatService = form.vehicleTypes.includes("boats") ? form.boatServices.length > 0 : true;
      return hasVehicle && hasCarService && hasBoatService;
    }
    if (step === 2) {
      return form.agreeLeads && form.agreeToS;
    }
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
      router.push("/company?onboarded=true");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  }

  const inputCls = "rounded-xl border-gray-200 bg-white focus:border-[#ff385c] focus:ring-0 font-medium text-sm";
  const labelCls = "text-sm font-semibold text-[#1d1d1f]";

  return (
    <div className="min-h-screen bg-[#FBFBFD] flex flex-col items-center justify-start pt-12 pb-16 px-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-[#ff385c]/10 text-[#ff385c] rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider mb-4">
            DetailHub Partner Setup
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f]">Welcome aboard!</h1>
          <p className="text-gray-500 mt-2">Let&apos;s set up your business profile so customers can find you.</p>
        </div>

        <StepIndicator current={step} />

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-100 shadow-sm p-8">

          {/* ── Step 1: Business Info ── */}
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-[#1d1d1f]">Business Information</h2>

              <div className="space-y-1.5">
                <Label className={labelCls}>Business Name <span className="text-[#ff385c]">*</span></Label>
                <Input className={inputCls} placeholder="Coastal Detail Co." value={form.companyName} onChange={e => set("companyName", e.target.value)} required />
              </div>

              <div className="space-y-1.5">
                <Label className={labelCls}>Street Address</Label>
                <Input className={inputCls} placeholder="123 Marina Blvd" value={form.address} onChange={e => set("address", e.target.value)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className={labelCls}>City <span className="text-[#ff385c]">*</span></Label>
                  <Input className={inputCls} placeholder="Miami" value={form.city} onChange={e => set("city", e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelCls}>State <span className="text-[#ff385c]">*</span></Label>
                  <select
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium focus:border-[#ff385c] focus:outline-none"
                    value={form.state}
                    onChange={e => set("state", e.target.value)}
                    required
                  >
                    <option value="">Select…</option>
                    {US_STATES.map(s => (
                      <option key={s.abbr} value={s.abbr}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className={labelCls}>Zip Code <span className="text-[#ff385c]">*</span></Label>
                  <Input className={inputCls} placeholder="33101" value={form.zipCode} onChange={e => set("zipCode", e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label className={labelCls}>Phone <span className="text-[#ff385c]">*</span></Label>
                  <Input className={inputCls} type="tel" placeholder="(305) 555-0100" value={form.phone} onChange={e => set("phone", e.target.value)} required />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className={labelCls}>Business Email <span className="text-[#ff385c]">*</span></Label>
                <Input className={inputCls} type="email" placeholder="hello@coastaldetail.com" value={form.email} onChange={e => set("email", e.target.value)} required />
              </div>

              <div className="space-y-1.5">
                <Label className={labelCls}>Website <span className="text-gray-400 font-normal">(optional)</span></Label>
                <Input className={inputCls} type="url" placeholder="https://coastaldetail.com" value={form.website} onChange={e => set("website", e.target.value)} />
              </div>
            </div>
          )}

          {/* ── Step 2: Services ── */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-[#1d1d1f]">Services Offered</h2>

              <div className="space-y-3">
                <Label className={labelCls}>What types of vehicles do you service? <span className="text-[#ff385c]">*</span></Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "cars", label: "🚗 Cars / Trucks / SUVs" },
                    { value: "boats", label: "⛵ Boats / Yachts / Watercraft" },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleArr("vehicleTypes", value)}
                      className={`p-4 rounded-xl border-2 text-sm font-semibold text-left transition-all ${
                        form.vehicleTypes.includes(value)
                          ? "border-[#ff385c] bg-[#ff385c]/5 text-[#ff385c]"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {form.vehicleTypes.includes("cars") && (
                <div className="space-y-3">
                  <Label className={labelCls}>Car / Truck Services</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {CAR_SERVICES.map(({ label, value }) => (
                      <Checkbox
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
                  <Label className={labelCls}>Boat / Marine Services</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {BOAT_SERVICES.map(({ label, value }) => (
                      <Checkbox
                        key={value}
                        checked={form.boatServices.includes(value)}
                        onChange={() => toggleArr("boatServices", value)}
                        label={label}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <Label className={labelCls}>Service area radius</Label>
                <select
                  className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium focus:border-[#ff385c] focus:outline-none"
                  value={form.serviceRadius}
                  onChange={e => set("serviceRadius", e.target.value)}
                >
                  <option value="10">Within 10 miles</option>
                  <option value="25">Within 25 miles</option>
                  <option value="50">Within 50 miles</option>
                  <option value="100">Within 100 miles</option>
                </select>
              </div>
            </div>
          )}

          {/* ── Step 3: Notifications & Consent ── */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-[#1d1d1f]">Notifications & Consent</h2>

              <div className="space-y-3">
                <Label className={labelCls}>How should we notify you about new leads?</Label>
                <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                  <Checkbox
                    checked={form.notifyEmail}
                    onChange={v => set("notifyEmail", v)}
                    label="Email me when new leads are available"
                  />
                  <Checkbox
                    checked={form.notifyCall}
                    onChange={v => set("notifyCall", v)}
                    label="Call me for urgent / high-value leads"
                  />
                  <Checkbox
                    checked={form.notifySms}
                    onChange={v => set("notifySms", v)}
                    label="SMS notifications"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className={labelCls}>Required agreements</Label>
                <div className="space-y-3 p-4 bg-gray-50 rounded-xl">
                  <Checkbox
                    checked={form.agreeLeads}
                    onChange={v => set("agreeLeads", v)}
                    label="I agree to receive lead notifications from DetailHub"
                    required
                  />
                  <Checkbox
                    checked={form.agreeToS}
                    onChange={v => set("agreeToS", v)}
                    label={<>I agree to the <a href="/terms" className="text-[#ff385c] underline" target="_blank">Terms of Service</a> and <a href="/privacy" className="text-[#ff385c] underline" target="_blank">Privacy Policy</a></>}
                    required
                  />
                </div>
              </div>

              <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-700">
                <strong>No monthly fees.</strong> You&apos;re only charged when you unlock a lead contact. Standard lead prices range from $15–$45 depending on service type and location.
              </div>
            </div>
          )}

          {/* ── Step 4: Review ── */}
          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-[#1d1d1f]">Review & Complete Setup</h2>

              <div className="space-y-4 text-sm">
                <div className="rounded-xl border border-gray-100 p-4 space-y-2">
                  <p className="font-semibold text-gray-500 text-xs uppercase tracking-wider">Business</p>
                  <p className="font-bold text-[#1d1d1f] text-base">{form.companyName}</p>
                  {form.address && <p className="text-gray-600">{form.address}</p>}
                  <p className="text-gray-600">{form.city}, {form.state} {form.zipCode}</p>
                  <p className="text-gray-600">{form.phone}</p>
                  <p className="text-gray-600">{form.email}</p>
                  {form.website && <p className="text-gray-600">{form.website}</p>}
                </div>

                <div className="rounded-xl border border-gray-100 p-4 space-y-2">
                  <p className="font-semibold text-gray-500 text-xs uppercase tracking-wider">Services</p>
                  <p className="text-gray-600">
                    <span className="font-medium">Vehicles:</span>{" "}
                    {form.vehicleTypes.map(v => v === "cars" ? "Cars/Trucks/SUVs" : "Boats/Watercraft").join(", ") || "None selected"}
                  </p>
                  {form.vehicleTypes.includes("cars") && form.carServices.length > 0 && (
                    <p className="text-gray-600">
                      <span className="font-medium">Car services:</span>{" "}
                      {CAR_SERVICES.filter(s => form.carServices.includes(s.value)).map(s => s.label).join(", ")}
                    </p>
                  )}
                  {form.vehicleTypes.includes("boats") && form.boatServices.length > 0 && (
                    <p className="text-gray-600">
                      <span className="font-medium">Boat services:</span>{" "}
                      {BOAT_SERVICES.filter(s => form.boatServices.includes(s.value)).map(s => s.label).join(", ")}
                    </p>
                  )}
                  <p className="text-gray-600"><span className="font-medium">Radius:</span> {form.serviceRadius} miles</p>
                </div>

                <div className="rounded-xl border border-gray-100 p-4 space-y-2">
                  <p className="font-semibold text-gray-500 text-xs uppercase tracking-wider">Notifications</p>
                  <div className="flex flex-wrap gap-2">
                    {form.notifyEmail && <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">Email</span>}
                    {form.notifyCall && <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">Phone</span>}
                    {form.notifySms && <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">SMS</span>}
                  </div>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3 font-medium">{error}</p>
              )}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 0 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(s => s - 1)}
                className="rounded-xl font-semibold"
              >
                <ChevronLeft className="h-4 w-4 mr-1" /> Back
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                type="button"
                disabled={!canProceed()}
                onClick={() => setStep(s => s + 1)}
                className="bg-[#ff385c] hover:bg-[#e0334f] text-white rounded-xl font-semibold px-6 disabled:opacity-40"
              >
                Continue <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="bg-[#ff385c] hover:bg-[#e0334f] text-white rounded-xl font-semibold px-8"
              >
                {isSubmitting ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Setting up…</>
                ) : (
                  "Complete Setup"
                )}
              </Button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          You can update all of this later from your dashboard settings.
        </p>
      </div>
    </div>
  );
}
