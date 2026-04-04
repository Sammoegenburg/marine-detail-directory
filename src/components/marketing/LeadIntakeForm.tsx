"use client";
// src/components/marketing/LeadIntakeForm.tsx
// Reusable glassmorphic multi-step lead intake form

import { useState, useEffect } from "react";
import { MapPin, Wrench, Anchor, User, CheckCircle2, ChevronLeft, Loader2 } from "lucide-react";
import { BOAT_SIZE_LABELS } from "@/types";

type ServiceOption = { id: string; name: string; slug?: string };

type Props = {
  defaultCity?: string;
  defaultState?: string;
  defaultService?: string;
  services?: ServiceOption[];
};

type FormData = {
  zipCode: string;
  state: string;
  serviceId: string;
  boatSize: string;
  boatType: string;
  boatYear: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
};

const US_STATES = [
  "Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut",
  "Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa",
  "Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan",
  "Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire",
  "New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio",
  "Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota",
  "Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia",
  "Wisconsin","Wyoming",
];

const STEPS = [
  { label: "Location", Icon: MapPin },
  { label: "Service",  Icon: Wrench },
  { label: "Your Boat", Icon: Anchor },
  { label: "Contact",  Icon: User },
];

export function LeadIntakeForm({ defaultCity, defaultState, defaultService, services: servicesProp }: Props) {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<ServiceOption[]>(servicesProp ?? []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const [form, setForm] = useState<FormData>({
    zipCode: "",
    state: defaultState ?? "",
    serviceId: "",
    boatSize: "",
    boatType: "",
    boatYear: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
  });

  // Fetch services if not provided as prop
  useEffect(() => {
    if (!servicesProp || servicesProp.length === 0) {
      fetch("/api/services")
        .then((r) => r.json())
        .then((data: ServiceOption[]) => {
          setServices(data);
          // Pre-select default service by name match
          if (defaultService) {
            const match = data.find(
              (s) => s.name.toLowerCase() === defaultService.toLowerCase() ||
                     s.slug === defaultService
            );
            if (match) setForm((f) => ({ ...f, serviceId: match.id }));
          }
        })
        .catch(() => {});
    } else if (defaultService) {
      const match = servicesProp.find(
        (s) => s.name.toLowerCase() === defaultService.toLowerCase() ||
               s.slug === defaultService
      );
      if (match) setForm((f) => ({ ...f, serviceId: match.id }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function update(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setFieldErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validateStep(s: number): boolean {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (s === 1 && (!/^\d{5}$/.test(form.zipCode))) {
      errs.zipCode = "Enter a valid 5-digit zip code";
    }
    if (s === 2 && !form.serviceId) {
      errs.serviceId = "Please select a service";
    }
    if (s === 3 && !form.boatSize) {
      errs.boatSize = "Please select a boat size";
    }
    if (s === 4) {
      if (!form.customerName || form.customerName.trim().length < 2)
        errs.customerName = "Name is required";
      if (!form.customerEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.customerEmail))
        errs.customerEmail = "Valid email required";
      if (!form.customerPhone || form.customerPhone.replace(/\D/g, "").length < 10)
        errs.customerPhone = "Valid phone number required";
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function nextStep() {
    if (validateStep(step)) setStep((s) => Math.min(s + 1, 4));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 1));
    setError(null);
  }

  async function handleSubmit() {
    if (!validateStep(4)) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName.trim(),
          customerEmail: form.customerEmail.trim(),
          customerPhone: form.customerPhone.trim(),
          boatSize: form.boatSize,
          boatType: form.boatType || undefined,
          boatYear: form.boatYear ? parseInt(form.boatYear) : undefined,
          zipCode: form.zipCode,
          serviceId: form.serviceId,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? "Failed to submit request");
      }
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-10 md:p-14 shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-gray-100 text-center max-w-2xl mx-auto w-full">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
        </div>
        <h3 className="text-3xl font-bold tracking-tighter text-[#1d1d1f] mb-3">You&apos;re all set!</h3>
        <p className="text-gray-500 text-lg font-medium max-w-md mx-auto leading-relaxed">
          Local marine detailing pros will be reaching out to you shortly. Check your email for confirmation.
        </p>
      </div>
    );
  }

  const inputClass =
    "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base font-medium text-[#1d1d1f] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-gray-400 transition-all";

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 md:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.08)] border border-gray-100 max-w-2xl mx-auto w-full">

      {/* Step indicator */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute top-5 left-0 right-0 h-px bg-gray-100 -z-0" />
        {STEPS.map(({ label, Icon }, i) => {
          const n = i + 1;
          const isActive = step === n;
          const isDone = step > n;
          return (
            <div key={n} className="flex flex-col items-center gap-1.5 z-10">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                  isDone
                    ? "bg-black border-black text-white"
                    : isActive
                    ? "bg-black border-black text-white ring-4 ring-black/10"
                    : "bg-white border-gray-200 text-gray-400"
                }`}
              >
                {isDone ? <CheckCircle2 size={16} /> : <Icon size={16} />}
              </div>
              <span
                className={`text-[10px] font-bold tracking-wide uppercase hidden sm:block ${
                  isActive ? "text-black" : "text-gray-400"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step 1: Location */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-2xl font-bold tracking-tighter text-[#1d1d1f] mb-1">Where is your boat?</h3>
            <p className="text-gray-500 text-sm font-medium">
              {defaultCity ? `Serving ${defaultCity} — confirm your zip code.` : "We'll match you with pros serving your area."}
            </p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Zip Code *</label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={5}
                placeholder="e.g. 33101"
                value={form.zipCode}
                onChange={(e) => update("zipCode", e.target.value.replace(/\D/g, ""))}
                className={inputClass}
              />
              {fieldErrors.zipCode && <p className="text-xs text-red-500 mt-1">{fieldErrors.zipCode}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">State</label>
              <select
                value={form.state}
                onChange={(e) => update("state", e.target.value)}
                className={inputClass}
              >
                <option value="">Select state</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Service */}
      {step === 2 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-2xl font-bold tracking-tighter text-[#1d1d1f] mb-1">What service do you need?</h3>
            <p className="text-gray-500 text-sm font-medium">Select the service and we'll find the right specialists.</p>
          </div>
          {services.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-gray-400">
              <Loader2 size={20} className="animate-spin mr-2" /> Loading services...
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => update("serviceId", service.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${
                    form.serviceId === service.id
                      ? "border-black bg-black text-white"
                      : "border-gray-100 bg-gray-50 text-[#1d1d1f] hover:border-gray-300 hover:bg-white"
                  }`}
                >
                  <span className="text-sm font-bold block">{service.name}</span>
                </button>
              ))}
            </div>
          )}
          {fieldErrors.serviceId && <p className="text-xs text-red-500">{fieldErrors.serviceId}</p>}
        </div>
      )}

      {/* Step 3: Boat Details */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-2xl font-bold tracking-tighter text-[#1d1d1f] mb-1">Tell us about your boat</h3>
            <p className="text-gray-500 text-sm font-medium">This helps pros give you accurate quotes.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Boat Size *</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(BOAT_SIZE_LABELS) as [string, string][]).map(([val, label]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => update("boatSize", val)}
                    className={`py-3 px-4 rounded-xl border-2 text-sm font-bold transition-all ${
                      form.boatSize === val
                        ? "border-black bg-black text-white"
                        : "border-gray-100 bg-gray-50 text-[#1d1d1f] hover:border-gray-300 hover:bg-white"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {fieldErrors.boatSize && <p className="text-xs text-red-500 mt-1">{fieldErrors.boatSize}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Boat Type</label>
                <input
                  type="text"
                  placeholder="Sailboat, Yacht..."
                  value={form.boatType}
                  onChange={(e) => update("boatType", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Year</label>
                <input
                  type="number"
                  placeholder="2020"
                  value={form.boatYear}
                  onChange={(e) => update("boatYear", e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Contact */}
      {step === 4 && (
        <div className="space-y-5">
          <div>
            <h3 className="text-2xl font-bold tracking-tighter text-[#1d1d1f] mb-1">How can pros reach you?</h3>
            <p className="text-gray-500 text-sm font-medium">Only shared with pros you connect with. No spam, ever.</p>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Full Name *</label>
              <input
                type="text"
                placeholder="John Smith"
                value={form.customerName}
                onChange={(e) => update("customerName", e.target.value)}
                className={inputClass}
              />
              {fieldErrors.customerName && <p className="text-xs text-red-500 mt-1">{fieldErrors.customerName}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Email *</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={form.customerEmail}
                onChange={(e) => update("customerEmail", e.target.value)}
                className={inputClass}
              />
              {fieldErrors.customerEmail && <p className="text-xs text-red-500 mt-1">{fieldErrors.customerEmail}</p>}
            </div>
            <div>
              <label className="block text-xs font-bold tracking-widest uppercase text-gray-500 mb-2">Phone *</label>
              <input
                type="tel"
                placeholder="(305) 555-0123"
                value={form.customerPhone}
                onChange={(e) => update("customerPhone", e.target.value)}
                className={inputClass}
              />
              {fieldErrors.customerPhone && <p className="text-xs text-red-500 mt-1">{fieldErrors.customerPhone}</p>}
            </div>
          </div>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 bg-red-50 rounded-xl px-4 py-3 mt-4">{error}</p>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <button
            type="button"
            onClick={prevStep}
            className="flex items-center gap-2 px-6 py-3.5 rounded-full border-2 border-gray-200 font-bold text-sm text-gray-600 hover:border-gray-400 transition-all"
          >
            <ChevronLeft size={16} /> Back
          </button>
        )}
        {step < 4 ? (
          <button
            type="button"
            onClick={nextStep}
            className="flex-1 bg-black text-white py-3.5 rounded-full font-bold text-base hover:bg-gray-800 transition-all"
          >
            Continue →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-[#ff385c] text-white py-3.5 rounded-full font-bold text-base hover:bg-[#d90b34] transition-all shadow-lg shadow-red-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? (
              <><Loader2 size={18} className="animate-spin" /> Submitting...</>
            ) : (
              "Get My Free Quotes →"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
