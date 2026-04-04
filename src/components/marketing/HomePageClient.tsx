"use client";
// src/components/marketing/HomePageClient.tsx

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Handshake,
  Ship,
  Car,
  ChevronDown,
  X,
  Check,
  Loader2,
  Menu,
  ArrowRight,
  MapPin,
  Star,
  Zap,
  Shield,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Service {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  category?: string;
}

interface CityState {
  id: string;
  name: string;
  slug: string;
  abbreviation: string;
}

interface City {
  id: string;
  name: string;
  slug: string;
  state: CityState;
  _count: { companies: number };
}

interface AutoService {
  id: string;
  name: string;
  description: string;
}

type VehicleType = "yachting" | "automotive";
type BoatSize = "UNDER_20FT" | "TWENTY_TO_30FT" | "THIRTY_TO_40FT" | "OVER_40FT";

interface Props {
  services: Service[];
  cities: City[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const ACCENT = "#ff385c";

const MARINE_DESCRIPTIONS: Record<string, string> = {
  "full-detail": "Complete vessel restoration — hull, topsides, interior, and brightwork",
  "hull-cleaning": "Professional hull scrubbing, barnacle removal, and surface prep",
  "interior-detail": "Deep cabin cleaning, upholstery conditioning, and odor elimination",
  "teak-restoration": "Expert teak brightening, sanding, and protective oil treatment",
  "waxing-polishing": "Multi-stage compound polish with UV-protective show-quality finish",
  "bottom-paint": "Full antifouling application with thorough surface preparation",
  "canvas-cleaning": "Professional soft wash, mold treatment, and UV protectant application",
  brightwork: "Stainless, chrome, and aluminum polishing to a mirror finish",
};

const AUTO_SERVICES: AutoService[] = [
  { id: "auto-full-detail", name: "Full Detail", description: "Complete interior and exterior restoration — paint, glass, leather, and trim" },
  { id: "auto-interior", name: "Interior Detail", description: "Deep clean, stain extraction, leather conditioning, and odor elimination" },
  { id: "auto-paint-correction", name: "Paint Correction", description: "Multi-stage machine polish removing swirls, scratches, and oxidation" },
  { id: "auto-ceramic", name: "Ceramic Coating", description: "Long-lasting nano-ceramic protection with hydrophobic self-cleaning properties" },
  { id: "auto-ppf", name: "Paint Protection Film", description: "Invisible urethane film installation protecting against chips and road debris" },
  { id: "auto-window-tint", name: "Window Tint", description: "Premium ceramic tint for UV protection, heat rejection, and added privacy" },
];

const BOAT_MAKES = [
  "Azimut", "Bertram", "Boston Whaler", "Chaparral", "Contender",
  "Fountain", "Grady-White", "Hatteras", "Mako", "Pursuit",
  "Regal", "Riviera", "Robalo", "Sailfish", "Sea Ray",
  "Sunseeker", "Viking", "Yamaha",
];

const AUTO_MAKES = [
  "Aston Martin", "Audi", "Bentley", "BMW", "Ferrari",
  "Jaguar", "Lamborghini", "Lexus", "Maserati", "McLaren",
  "Mercedes-Benz", "Porsche", "Range Rover", "Rolls-Royce", "Tesla",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function lengthToBoatSize(ft: string): BoatSize {
  const n = parseInt(ft, 10);
  if (isNaN(n) || n < 20) return "UNDER_20FT";
  if (n < 30) return "TWENTY_TO_30FT";
  if (n <= 40) return "THIRTY_TO_40FT";
  return "OVER_40FT";
}

// ─── Scroll reveal hook ───────────────────────────────────────────────────────

function useScrollReveal() {
  const [visible, setVisible] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { setVisible(true); obs.unobserve(entry.target); }
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

const FadeUp = ({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) => {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={`transition-all duration-[900ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function HomePageClient({ services, cities }: Props) {
  // Nav
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Booking card
  const [vehicleType, setVehicleType] = useState<VehicleType>("yachting");
  const [cityInput, setCityInput] = useState("");
  const [stateInput, setStateInput] = useState("");
  const [zipInput, setZipInput] = useState("");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState("");
  const [showServiceDropdown, setShowServiceDropdown] = useState(false);
  const [vehicleDetails, setVehicleDetails] = useState("");
  const [showVehicleSuggestions, setShowVehicleSuggestions] = useState(false);
  const [boatLength, setBoatLength] = useState("");
  const [bookingError, setBookingError] = useState("");

  // Contact modal
  const [showModal, setShowModal] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Refs for click-outside
  const cityRef = useRef<HTMLDivElement>(null);
  const serviceRef = useRef<HTMLDivElement>(null);
  const vehicleRef = useRef<HTMLDivElement>(null);

  // Computed
  const marineServices = services;
  const activeServices: (Service | AutoService)[] =
    vehicleType === "yachting" ? marineServices : AUTO_SERVICES;

  const citySuggestions =
    cityInput.length >= 2
      ? cities
          .filter((c) => c.name.toLowerCase().startsWith(cityInput.toLowerCase()))
          .slice(0, 8)
      : [];

  const vehicleSuggestions =
    vehicleDetails.length >= 1
      ? (vehicleType === "yachting" ? BOAT_MAKES : AUTO_MAKES)
          .filter((m) => m.toLowerCase().includes(vehicleDetails.toLowerCase()))
          .slice(0, 6)
      : [];

  const selectedServiceObj = activeServices.find((s) => s.id === selectedServiceId);

  const getServiceDescription = (service: Service | AutoService): string => {
    if ("description" in service && service.description) {
      // For marine services, prefer our premium descriptions
      if ("slug" in service && service.slug && MARINE_DESCRIPTIONS[service.slug]) {
        return MARINE_DESCRIPTIONS[service.slug];
      }
      return service.description;
    }
    return "";
  };

  // ── Effects ────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen || showModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen, showModal]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) setShowCitySuggestions(false);
      if (serviceRef.current && !serviceRef.current.contains(e.target as Node)) setShowServiceDropdown(false);
      if (vehicleRef.current && !vehicleRef.current.contains(e.target as Node)) setShowVehicleSuggestions(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleVehicleToggle = (type: VehicleType) => {
    setVehicleType(type);
    setSelectedServiceId("");
    setVehicleDetails("");
    setBoatLength("");
  };

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setCityInput(city.name);
    setStateInput(city.state.abbreviation);
    setShowCitySuggestions(false);
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError("");
    if (!cityInput.trim()) { setBookingError("Please enter a city."); return; }
    if (!selectedServiceId) { setBookingError("Please select a service."); return; }
    setShowModal(true);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    try {
      // For automotive leads, fall back to the first marine service (Full Detail)
      const fallbackServiceId =
        marineServices.find((s) => s.slug === "full-detail")?.id ??
        marineServices[0]?.id;

      const serviceId =
        vehicleType === "yachting" ? selectedServiceId : fallbackServiceId;

      if (!serviceId) throw new Error("No service available. Please try again.");

      const payload = {
        customerName: contactName,
        customerEmail: contactEmail,
        customerPhone: contactPhone,
        boatSize: vehicleType === "yachting" ? lengthToBoatSize(boatLength) : "UNDER_20FT",
        vehicleType,
        vehicleDetails: vehicleDetails || undefined,
        boatMake: vehicleDetails || undefined,
        cityId: selectedCity?.id,
        zipCode: zipInput.trim() || undefined,
        serviceId,
        notes: vehicleType === "automotive" ? `AUTOMOTIVE${vehicleDetails ? ` | ${vehicleDetails}` : ""}` : undefined,
      };

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Submission failed. Please try again.");
      }

      setSubmitSuccess(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    if (submitSuccess) {
      setSubmitSuccess(false);
      setContactName("");
      setContactEmail("");
      setContactPhone("");
    }
    setSubmitError("");
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-[#1d1d1f] overflow-x-hidden">

      {/* ── Navigation ── */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled || mobileMenuOpen
            ? "bg-white/95 backdrop-blur-xl border-b border-gray-200/60 shadow-sm py-3"
            : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 z-50">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: ACCENT }}
            >
              <Handshake size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-[22px] font-black tracking-tight italic uppercase">
              Detail<span style={{ color: ACCENT }}>Hub</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7 text-[13px] font-semibold tracking-wide">
            <a href="#how-it-works" className="text-gray-600 hover:text-black transition-colors">
              How it works
            </a>
            <a href="#quality" className="text-gray-600 hover:text-black transition-colors">
              Quality Standards
            </a>
            <a href="#professionals" className="text-gray-600 hover:text-black transition-colors">
              For Professionals
            </a>
            <Link href="/login" className="text-gray-600 hover:text-black transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-white px-5 py-2 rounded-full text-[13px] font-bold hover:opacity-90 transition-all shadow-sm"
              style={{ backgroundColor: ACCENT }}
            >
              List Your Company
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden z-50 p-2 -mr-2 text-black"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`fixed inset-0 bg-white z-40 transition-transform duration-300 ease-in-out md:hidden ${
          mobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="pt-24 px-6 flex flex-col gap-7 text-xl font-bold tracking-tight">
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-gray-900 border-b border-gray-100 pb-5">
            How it works
          </a>
          <a href="#quality" onClick={() => setMobileMenuOpen(false)} className="text-gray-900 border-b border-gray-100 pb-5">
            Quality Standards
          </a>
          <a href="#professionals" onClick={() => setMobileMenuOpen(false)} className="text-gray-900 border-b border-gray-100 pb-5">
            For Professionals
          </a>
          <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="text-gray-900 border-b border-gray-100 pb-5">
            Sign In
          </Link>
          <Link
            href="/register"
            onClick={() => setMobileMenuOpen(false)}
            className="text-white w-full py-4 rounded-2xl mt-2 text-lg font-bold text-center shadow-lg"
            style={{ backgroundColor: ACCENT }}
          >
            List Your Company
          </Link>
        </div>
      </div>

      {/* ── Hero ── */}
      <section className="relative pt-28 md:pt-32 pb-16 md:pb-24 px-6">
        <div className="max-w-[1200px] mx-auto grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left: copy */}
          <div>
            <FadeUp>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 border"
                style={{ color: ACCENT, borderColor: `${ACCENT}30`, backgroundColor: `${ACCENT}0d` }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: ACCENT }} />
                Elite Detailing Marketplace
              </div>
            </FadeUp>

            <FadeUp delay={80}>
              <h1 className="text-5xl sm:text-6xl lg:text-[68px] font-black tracking-tighter leading-[1.02] mb-6">
                The standard for{" "}
                <span style={{ color: ACCENT }}>superior</span>
                {" "}results.
              </h1>
            </FadeUp>

            <FadeUp delay={160}>
              <p className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed mb-10 max-w-lg">
                Skip the coordination headache. One request connects you directly with
                elite, vetted detailing specialists in your area — no middlemen, no
                hidden fees.
              </p>
            </FadeUp>

            <FadeUp delay={240}>
              <div className="flex items-center gap-8">
                {[
                  { label: "Elite", sub: "Vetted specialists only" },
                  { label: "Direct", sub: "No middlemen" },
                  { label: "Fixed", sub: "Transparent pricing" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="text-2xl font-black tracking-tight" style={{ color: ACCENT }}>
                      {stat.label}
                    </div>
                    <div className="text-xs font-semibold text-gray-400 tracking-wide mt-0.5">
                      {stat.sub}
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>

          {/* Right: booking card */}
          <FadeUp delay={200} className="w-full">
            <div className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.10)] border border-gray-100 p-7 md:p-8">

              {/* Vehicle type toggle */}
              <div className="flex bg-gray-100 rounded-2xl p-1 mb-6">
                {(["yachting", "automotive"] as VehicleType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleVehicleToggle(type)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      vehicleType === type
                        ? "bg-white shadow-sm text-[#1d1d1f]"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {type === "yachting" ? (
                      <Ship size={16} strokeWidth={2.5} className={vehicleType === type ? "" : "opacity-60"} />
                    ) : (
                      <Car size={16} strokeWidth={2.5} className={vehicleType === type ? "" : "opacity-60"} />
                    )}
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>

              <form onSubmit={handleBookingSubmit} className="space-y-4">

                {/* Location row */}
                <div className="flex gap-3">
                  {/* City autocomplete */}
                  <div ref={cityRef} className="relative flex-1">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={cityInput}
                      onChange={(e) => {
                        setCityInput(e.target.value);
                        setSelectedCity(null);
                        setShowCitySuggestions(true);
                      }}
                      onFocus={() => cityInput.length >= 2 && setShowCitySuggestions(true)}
                      placeholder="Miami"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white transition-colors"
                      style={{ "--tw-ring-color": `${ACCENT}40` } as React.CSSProperties}
                      autoComplete="off"
                    />
                    {showCitySuggestions && citySuggestions.length > 0 && (
                      <div className="absolute z-30 w-full mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
                        {citySuggestions.map((city) => (
                          <button
                            key={city.id}
                            type="button"
                            onMouseDown={() => handleCitySelect(city)}
                            className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 transition-colors text-left"
                          >
                            <span className="font-semibold text-[#1d1d1f]">{city.name}</span>
                            <span className="text-xs text-gray-400 font-medium">
                              {city.state.abbreviation}
                              {city._count.companies > 0 && (
                                <span className="ml-2 text-green-500">
                                  {city._count.companies} specialist{city._count.companies !== 1 ? "s" : ""}
                                </span>
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* State */}
                  <div className="w-20">
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      value={stateInput}
                      onChange={(e) => setStateInput(e.target.value.toUpperCase().slice(0, 2))}
                      placeholder="FL"
                      maxLength={2}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-center focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white transition-colors uppercase"
                      style={{ "--tw-ring-color": `${ACCENT}40` } as React.CSSProperties}
                    />
                  </div>
                </div>

                {/* Zip (optional) */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Zipcode <span className="normal-case font-normal text-gray-300">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={zipInput}
                    onChange={(e) => setZipInput(e.target.value.replace(/\D/g, "").slice(0, 5))}
                    placeholder="33139"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white transition-colors"
                    style={{ "--tw-ring-color": `${ACCENT}40` } as React.CSSProperties}
                  />
                </div>

                {/* Service dropdown */}
                <div ref={serviceRef} className="relative">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    Service
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowServiceDropdown(!showServiceDropdown)}
                    className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium bg-gray-50 hover:bg-white focus:outline-none focus:ring-2 transition-colors text-left"
                    style={{ "--tw-ring-color": `${ACCENT}40` } as React.CSSProperties}
                  >
                    <span className={selectedServiceObj ? "text-[#1d1d1f] font-semibold" : "text-gray-400"}>
                      {selectedServiceObj ? selectedServiceObj.name : "Select a service…"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-gray-400 transition-transform ${showServiceDropdown ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showServiceDropdown && (
                    <div className="absolute z-30 w-full mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
                      {activeServices.map((svc) => {
                        const desc = getServiceDescription(svc);
                        return (
                          <button
                            key={svc.id}
                            type="button"
                            onMouseDown={() => {
                              setSelectedServiceId(svc.id);
                              setShowServiceDropdown(false);
                            }}
                            className={`w-full px-4 py-3.5 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 ${
                              selectedServiceId === svc.id ? "bg-gray-50" : ""
                            }`}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-sm font-bold text-[#1d1d1f]">{svc.name}</span>
                              {selectedServiceId === svc.id && (
                                <Check size={14} style={{ color: ACCENT }} />
                              )}
                            </div>
                            {desc && (
                              <span className="text-xs text-gray-400 font-medium leading-snug">{desc}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Vehicle details */}
                <div ref={vehicleRef} className="relative">
                  <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                    {vehicleType === "yachting" ? "Boat Brand / Model" : "Vehicle Make / Model"}
                    <span className="normal-case font-normal text-gray-300 ml-1">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={vehicleDetails}
                    onChange={(e) => {
                      setVehicleDetails(e.target.value);
                      setShowVehicleSuggestions(true);
                    }}
                    onFocus={() => vehicleDetails.length >= 1 && setShowVehicleSuggestions(true)}
                    placeholder={vehicleType === "yachting" ? "e.g. Sea Ray Sundancer" : "e.g. BMW M4"}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white transition-colors"
                    style={{ "--tw-ring-color": `${ACCENT}40` } as React.CSSProperties}
                    autoComplete="off"
                  />
                  {showVehicleSuggestions && vehicleSuggestions.length > 0 && (
                    <div className="absolute z-30 w-full mt-1.5 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden">
                      {vehicleSuggestions.map((make) => (
                        <button
                          key={make}
                          type="button"
                          onMouseDown={() => {
                            setVehicleDetails(make);
                            setShowVehicleSuggestions(false);
                          }}
                          className="w-full px-4 py-2.5 text-sm font-semibold text-left hover:bg-gray-50 transition-colors"
                        >
                          {make}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Boat length (yachting only) */}
                {vehicleType === "yachting" && (
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Vessel Length (ft)
                      <span className="normal-case font-normal text-gray-300 ml-1">(optional)</span>
                    </label>
                    <input
                      type="number"
                      value={boatLength}
                      onChange={(e) => setBoatLength(e.target.value)}
                      placeholder="e.g. 38"
                      min={10}
                      max={200}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white transition-colors"
                      style={{ "--tw-ring-color": `${ACCENT}40` } as React.CSSProperties}
                    />
                  </div>
                )}

                {/* Dynamic city stats */}
                {selectedCity && selectedCity._count.companies > 0 && (
                  <div
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold"
                    style={{ backgroundColor: `${ACCENT}0d`, color: ACCENT }}
                  >
                    <MapPin size={13} />
                    {selectedCity._count.companies} specialist{selectedCity._count.companies !== 1 ? "s" : ""} serve{selectedCity._count.companies === 1 ? "s" : ""} {selectedCity.name}
                  </div>
                )}

                {bookingError && (
                  <p className="text-xs font-semibold" style={{ color: ACCENT }}>
                    {bookingError}
                  </p>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl text-white text-[15px] font-black tracking-tight hover:opacity-90 active:scale-[0.99] transition-all shadow-lg mt-1"
                  style={{ backgroundColor: ACCENT, boxShadow: `0 4px 24px ${ACCENT}40` }}
                >
                  Find Local Specialists →
                </button>
              </form>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="py-20 md:py-28 px-6 bg-white">
        <div className="max-w-[1100px] mx-auto">
          <FadeUp>
            <div className="text-center mb-14">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-4 border"
                style={{ color: ACCENT, borderColor: `${ACCENT}30`, backgroundColor: `${ACCENT}0d` }}
              >
                The Process
              </div>
              <h2 className="text-4xl md:text-[52px] font-black tracking-tighter leading-tight">
                Simple. Fast. Elite.
              </h2>
            </div>
          </FadeUp>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                icon: <Zap size={28} strokeWidth={2.5} />,
                step: "01",
                title: "One Request",
                desc: "Submit your vehicle details and location once. No need to contact multiple shops or explain yourself repeatedly.",
              },
              {
                icon: <ArrowRight size={28} strokeWidth={2.5} />,
                step: "02",
                title: "Direct Contact",
                desc: "Verified local specialists review your request and reach out to you directly — no middlemen, no markups.",
              },
              {
                icon: <Star size={28} strokeWidth={2.5} />,
                step: "03",
                title: "Elite Service",
                desc: "Every specialist in our network is rigorously vetted, insured, and reviewed. Only the best make the cut.",
              },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 100}>
                <div className="relative">
                  <div className="text-[80px] font-black text-gray-50 leading-none select-none absolute -top-4 -left-2">
                    {item.step}
                  </div>
                  <div className="relative">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 text-white"
                      style={{ backgroundColor: ACCENT }}
                    >
                      {item.icon}
                    </div>
                    <h3 className="text-xl md:text-2xl font-black tracking-tight mb-3">{item.title}</h3>
                    <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quality Standards ── */}
      <section id="quality" className="py-20 md:py-28 px-6 bg-[#fafafa]">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <FadeUp>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-5 border"
                style={{ color: ACCENT, borderColor: `${ACCENT}30`, backgroundColor: `${ACCENT}0d` }}
              >
                Our Standard
              </div>
              <h2 className="text-4xl md:text-[52px] font-black tracking-tighter leading-tight mb-6">
                We don&apos;t compromise on quality.
              </h2>
              <p className="text-lg text-gray-500 font-medium leading-relaxed mb-8">
                Every specialist on DetailHub undergoes a rigorous verification process before
                they ever see a lead. We check credentials, insurance, reviews, and work history.
                Less than 20% of applicants make it into our network.
              </p>
              <div className="space-y-4">
                {[
                  "Background-checked and fully insured",
                  "Minimum 4.7★ average review score",
                  "Equipment and product certification required",
                  "Ongoing performance monitoring",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: ACCENT }}
                    >
                      <Check size={11} className="text-white" strokeWidth={3} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </FadeUp>

            <FadeUp delay={150}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: <Shield size={24} />, label: "Fully Insured", sub: "Every specialist carries liability coverage" },
                  { icon: <Star size={24} />, label: "Top Rated", sub: "Average 4.9★ across all specialists" },
                  { icon: <Check size={24} />, label: "Verified", sub: "License and credential verification" },
                  { icon: <Zap size={24} />, label: "Fast Response", sub: "Specialists respond within 2 hours" },
                ].map((card) => (
                  <div
                    key={card.label}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white"
                      style={{ backgroundColor: ACCENT }}
                    >
                      {card.icon}
                    </div>
                    <div className="font-black text-[#1d1d1f] text-sm tracking-tight mb-1">{card.label}</div>
                    <div className="text-xs text-gray-400 font-medium leading-snug">{card.sub}</div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── For Professionals ── */}
      <section id="professionals" className="bg-[#0f0f0f] text-white py-20 md:py-32 px-6 overflow-hidden">
        <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row items-center justify-between gap-16">
          <div className="lg:w-1/2 text-center lg:text-left">
            <FadeUp>
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-6 border border-white/20 text-white/60"
              >
                For Detailing Professionals
              </div>
              <h2 className="text-4xl sm:text-5xl md:text-[64px] font-black tracking-tighter leading-[1.05] mb-6">
                Stop chasing leads.{" "}
                <br className="hidden md:block" />
                <span style={{ color: ACCENT }}>Let them find you.</span>
              </h2>
              <p className="text-gray-400 text-lg md:text-xl font-medium leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
                Join the fastest-growing network of elite detailing professionals.
                Claim your profile, receive instant job alerts, and only pay for
                leads you actually want.
              </p>
              <Link
                href="/register"
                className="inline-block w-full md:w-auto bg-white text-[#0f0f0f] px-8 py-4 rounded-2xl font-black text-lg hover:bg-gray-100 transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] text-center"
              >
                List Your Company Free →
              </Link>
            </FadeUp>
          </div>

          <div className="lg:w-1/2 w-full">
            <FadeUp delay={200}>
              <div className="bg-[#1a1a1a] rounded-3xl p-7 md:p-10 border border-white/10 shadow-2xl md:-rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: ACCENT }}
                    >
                      <Handshake size={20} className="text-white" strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="text-white font-black tracking-tight">DetailHub Pro</div>
                      <div className="text-xs font-bold text-green-400 flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                        Active &amp; receiving leads
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 relative overflow-hidden">
                  <div
                    className="absolute top-0 left-0 w-1.5 h-full rounded-l-2xl"
                    style={{ backgroundColor: ACCENT }}
                  />
                  <div
                    className="text-[10px] font-black tracking-widest uppercase mb-2"
                    style={{ color: ACCENT }}
                  >
                    New Lead Request
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black mb-1.5 tracking-tight">
                    44ft Azimut Flybridge
                  </h3>
                  <p className="text-base text-gray-400 mb-5 font-semibold">
                    Full Detail — Wax &amp; Compound
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-300 mb-6 bg-black/30 w-fit px-3.5 py-2 rounded-xl border border-white/5">
                    <MapPin size={15} style={{ color: ACCENT }} />
                    <span className="font-semibold">Miami Beach, FL</span>
                  </div>
                  <button
                    className="w-full bg-white text-[#0f0f0f] font-black text-base py-3.5 rounded-xl transition-colors hover:bg-gray-100 flex justify-between items-center px-5"
                    type="button"
                  >
                    <span>Unlock Details</span>
                    <span
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-black text-white"
                      style={{ backgroundColor: ACCENT }}
                    >
                      $24 <ArrowRight size={14} />
                    </span>
                  </button>
                </div>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-14">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: ACCENT }}
                >
                  <Handshake size={18} className="text-white" strokeWidth={2.5} />
                </div>
                <span className="text-xl font-black tracking-tight italic uppercase">
                  Detail<span style={{ color: ACCENT }}>Hub</span>
                </span>
              </div>
              <p className="text-gray-500 font-medium max-w-xs text-sm leading-relaxed">
                The national marketplace connecting boat and vehicle owners with elite,
                vetted detailing professionals.
              </p>
            </div>

            <div>
              <h4 className="font-black text-[#1d1d1f] mb-4 tracking-tight text-sm uppercase">Platform</h4>
              <ul className="space-y-3 text-sm text-gray-500 font-medium">
                <li><a href="#how-it-works" className="hover:text-black transition-colors">How It Works</a></li>
                <li><Link href="/register" className="hover:text-black transition-colors">List Your Company</Link></li>
                <li><Link href="/login" className="hover:text-black transition-colors">Sign In</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-[#1d1d1f] mb-4 tracking-tight text-sm uppercase">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-500 font-medium">
                <li><Link href="/privacy" className="hover:text-black transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-black transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400 font-medium">
            <p>&copy; {new Date().getFullYear()} DetailHub. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-black transition-colors">X (Twitter)</Link>
              <Link href="#" className="hover:text-black transition-colors">Instagram</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Contact Modal ── */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={closeModal} />

          {/* Modal card */}
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 z-10">
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
              aria-label="Close"
            >
              <X size={16} className="text-gray-600" />
            </button>

            {submitSuccess ? (
              /* ── Success state ── */
              <div className="text-center py-4">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ backgroundColor: `${ACCENT}15` }}
                >
                  <Check size={32} style={{ color: ACCENT }} strokeWidth={3} />
                </div>
                <h3 className="text-2xl font-black tracking-tight mb-2">You&apos;re all set!</h3>
                <p className="text-gray-500 font-medium leading-relaxed">
                  Local specialists in{" "}
                  <strong>{selectedCity?.name ?? cityInput}</strong>{" "}
                  will be reaching out shortly.
                </p>
                <button
                  onClick={closeModal}
                  className="mt-7 w-full py-3.5 rounded-2xl text-white font-black tracking-tight hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: ACCENT }}
                >
                  Done
                </button>
              </div>
            ) : (
              /* ── Form state ── */
              <>
                <div className="mb-6">
                  <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Final step.
                  </div>
                  <h3 className="text-2xl font-black tracking-tight">Your contact details</h3>
                  <p className="text-sm text-gray-400 font-medium mt-1.5">
                    We&apos;ll share these with matched specialists in{" "}
                    <span className="text-[#1d1d1f] font-semibold">
                      {(selectedCity?.name ?? cityInput) || "your area"}
                    </span>
                    .
                  </p>
                </div>

                <form onSubmit={handleFinalSubmit} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      required
                      minLength={2}
                      placeholder="John Smith"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white transition-colors"
                      style={{ "--tw-ring-color": `${ACCENT}40` } as React.CSSProperties}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      required
                      placeholder="john@example.com"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white transition-colors"
                      style={{ "--tw-ring-color": `${ACCENT}40` } as React.CSSProperties}
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      required
                      minLength={10}
                      placeholder="(305) 555-0100"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium focus:outline-none focus:ring-2 bg-gray-50 focus:bg-white transition-colors"
                      style={{ "--tw-ring-color": `${ACCENT}40` } as React.CSSProperties}
                    />
                  </div>

                  {submitError && (
                    <p className="text-xs font-semibold py-2.5 px-3.5 rounded-xl bg-red-50 border border-red-100" style={{ color: ACCENT }}>
                      {submitError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 rounded-2xl text-white text-[15px] font-black tracking-tight hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2 mt-2"
                    style={{ backgroundColor: ACCENT, boxShadow: `0 4px 24px ${ACCENT}40` }}
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      "Confirm Request"
                    )}
                  </button>

                  <p className="text-center text-xs text-gray-400 font-medium">
                    Your information is never sold or shared publicly.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
