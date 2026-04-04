"use client";

import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Inbox,
  UserCircle,
  CreditCard,
  MapPin,
  ChevronRight,
  Star,
  Zap,
  CheckCircle2,
  Ship,
  Car,
  TrendingUp,
  Clock,
  MoreHorizontal,
  Plus,
  Globe,
  Phone,
  Mail,
  Building2,
  AlertCircle,
  ShieldCheck,
  Lock,
  User,
  Navigation,
  Layers,
  Maximize2,
  Calendar,
  Hash,
  ArrowUpRight,
  Info,
  X,
  Search,
  Filter,
  Check,
  Smartphone,
  Receipt,
  CreditCard as CardIcon,
  Download,
  Printer,
  ChevronDown,
  LockKeyhole,
  ArrowLeft,
  Sparkles,
  Loader2,
  Menu
} from 'lucide-react';

// --- Global Stylings ---
function TypographyStyle() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

      :root {
        --font-main: 'Inter', sans-serif;
      }

      body {
        font-family: var(--font-main);
        -webkit-font-smoothing: antialiased;
        background-color: #F8F9FA;
        color: #1d1d1f;
        font-size: 13px;
        overscroll-behavior-y: contain;
      }

      .tactical-glass {
        background: rgba(10, 10, 12, 0.95);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }

      @media (min-width: 768px) {
        .tactical-glass:hover {
          border: 1px solid rgba(255, 56, 92, 0.4);
          box-shadow: 0 15px 35px -10px rgba(255, 56, 92, 0.2);
        }
      }

      input[type='range'] {
        -webkit-appearance: none;
        background: transparent;
      }
      input[type='range']::-webkit-slider-runnable-track {
        width: 100%;
        height: 4px;
        background: #E2E8F0;
        border-radius: 4px;
      }
      input[type='range']::-webkit-slider-thumb {
        height: 16px;
        width: 16px;
        border-radius: 50%;
        background: #ff385c;
        cursor: pointer;
        -webkit-appearance: none;
        margin-top: -7px;
        border: 2px solid white;
        box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      }

      .tracking-tight-custom { letter-spacing: -0.02em; }
      .tracking-tighter-custom { letter-spacing: -0.04em; }

      ::-webkit-scrollbar { width: 4px; }
      ::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 10px; }

      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .animate-spin-custom {
        animation: spin 1s linear infinite;
      }
    `}} />
  );
}

// --- Constants & Data ---
const MARINE_SERVICES = ['Boat Full Detail', 'Hull Cleaning', 'Wax & Polish', 'Teak Restoration', 'Bottom Paint', 'Brightwork', 'Ceramic Coating', 'Gelcoat Repair'];
const AUTO_SERVICES = ['Car Full Detail', 'Car Interior', 'Car Exterior Wash', 'Paint Correction', 'Ceramic Coating', 'Window Tint', 'Engine Bay Detail', 'Headlight Restoration'];

const INITIAL_AVAILABLE: Lead[] = [
  { id: 1, type: 'boat', title: '44ft Azimut Flybridge', service: 'Full Detail', subService: 'Wax & Compound', location: 'Miami Beach, FL', price: 24, specs: '44ft Flybridge' },
  { id: 2, type: 'car', title: 'Porsche 911 GT3', service: 'Paint Correction', subService: 'Ceramic Coating', location: 'St. Petersburg, FL', price: 18, specs: '992 Gen' },
  { id: 3, type: 'boat', title: '32ft Boston Whaler', service: 'Wash', subService: 'Maintenance', location: 'Tampa Bay, FL', price: 12, specs: '32ft CC' },
  { id: 4, type: 'car', title: 'Tesla Model S Plaid', service: 'Full Detail', subService: 'Interior/Exterior', location: 'Clearwater, FL', price: 15, specs: '2024 Model' },
  { id: 5, type: 'boat', title: '60ft Sea Ray L650', service: 'Ceramic', subService: 'Hull & Topside', location: 'Fort Lauderdale, FL', price: 45, specs: '60ft Yacht' },
  { id: 6, type: 'car', title: 'BMW M4 Competition', service: 'Window Tint', subService: 'Ceramic Tint', location: 'Tampa, FL', price: 10, specs: 'G82 Chassis' },
  { id: 7, type: 'boat', title: '24ft Grady-White', service: 'Wax', subService: 'Full Polish', location: 'Anna Maria Island, FL', price: 20, specs: '24ft WA' },
  { id: 8, type: 'car', title: 'Ferrari F8 Tributo', service: 'Ceramic', subService: 'Multi-Stage', location: 'Naples, FL', price: 50, specs: '2025 Model' },
  { id: 9, type: 'boat', title: '38ft Tiara Yachts', service: 'Full Detail', subService: 'Cabin', location: 'Destin, FL', price: 35, specs: '38ft LS' },
];

const INITIAL_PURCHASED: PurchasedLead[] = [
  { id: 101, type: 'boat', title: '55ft Sunseeker Predator', service: 'Full Detail', subService: 'Polish', location: 'Sarasota, FL', price: 32, specs: '55ft Yacht', customerName: 'Robert Vance', phone: '(941) 555-0128', email: 'rvance@marina-villas.com', customerAddress: 'Sarasota, FL', servicesRequested: ['Teak Restoration', 'Ceramic Coating'], purchasedAt: '2h ago' },
  { id: 102, type: 'car', title: 'Range Rover SV', service: 'Full Detail', subService: 'Interior', location: 'Naples, FL', price: 15, specs: '2025 Autobiography', customerName: 'Sarah Miller', phone: '(239) 555-8842', email: 'smiller@icloud.com', customerAddress: 'Naples, FL', servicesRequested: ['Leather Condition', 'Clay Bar', 'Wheel Coating'], purchasedAt: 'Yesterday' }
];

// --- Types ---
interface Lead {
  id: number;
  type: string;
  title: string;
  service: string;
  subService: string;
  location: string;
  price: number;
  specs: string;
}

interface PurchasedLead extends Lead {
  customerName: string;
  phone: string;
  email: string;
  customerAddress: string;
  servicesRequested: string[];
  purchasedAt: string;
}

interface ProfileData {
  name: string;
  address: string;
  serviceArea: string;
  website: string;
  radius: number;
  phone: string;
  email: string;
  specialization: string;
  services: string[];
}

// --- Functional Components ---

function SidebarItem({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition-all duration-300 ${
        active ? 'bg-black text-white shadow-lg' : 'text-gray-500 hover:bg-gray-100 hover:text-black'
      }`}
    >
      <Icon size={15} strokeWidth={active ? 2.5 : 2} />
      <span className={`text-[12px] font-bold ${active ? 'opacity-100' : 'opacity-80'}`}>{label}</span>
      {active && <div className="ml-auto w-1 h-1 rounded-full bg-[#ff385c]" />}
    </button>
  );
}

function MobileNavItem({ icon: Icon, label, active, onClick }: { icon: any; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center flex-1 py-1 gap-1 transition-all ${
        active ? 'text-[#ff385c]' : 'text-gray-400'
      }`}
    >
      <Icon size={18} strokeWidth={active ? 2.5 : 2} />
      <span className="text-[9px] font-bold uppercase tracking-tighter">{label}</span>
    </button>
  );
}

function LeadTile({ lead, purchased = false, onOpen }: { lead: Lead | PurchasedLead; purchased?: boolean; onOpen: (lead: Lead | PurchasedLead) => void }) {
  return (
    <div
      onClick={() => onOpen(lead)}
      className="tactical-glass group relative rounded-2xl p-4 transition-all duration-500 cursor-pointer flex flex-col gap-3 overflow-hidden border border-white/5 shadow-md active:scale-95 md:active:scale-100"
    >
      <div className="absolute -top-4 -right-4 opacity-[0.04] group-hover:opacity-[0.1] transition-opacity text-white pointer-events-none">
        {lead.type === 'boat' ? <Ship size={70} /> : <Car size={70} />}
      </div>
      <div className="flex justify-between items-center relative z-10">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${purchased ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-[#ff385c]/10 border-[#ff385c]/20 text-[#ff385c]'}`}>
          {lead.type === 'boat' ? <Ship size={14} /> : <Car size={14} />}
        </div>
        {!purchased ? (
          <div className="text-[14px] font-black text-white tracking-tighter">${lead.price}</div>
        ) : (
          <div className="text-[7px] font-black uppercase tracking-[0.2em] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">Claimed</div>
        )}
      </div>
      <div className="relative z-10 flex-1">
        <h3 className="text-[13px] font-bold text-white tracking-tight leading-tight group-hover:text-[#ff385c] transition-colors line-clamp-1">{lead.title}</h3>
        <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest block mt-1">{lead.service}</span>
      </div>
      <div className="space-y-1.5 relative z-10">
        <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-medium truncate">
          <MapPin size={9} className="text-[#ff385c]" />
          {lead.location}
        </div>
        <div className="flex items-center justify-between pt-1.5 border-t border-white/5">
          <span className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.1em]">{lead.specs}</span>
          <ChevronRight size={12} className="text-[#ff385c] group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );
}

function LeadDetailPanel({ lead, onClose, purchased, onPurchase }: { lead: Lead | PurchasedLead | null; onClose: () => void; purchased: boolean; onPurchase: (id: number) => void }) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  if (!lead) return null;

  const handlePurchaseLead = async () => {
    setIsPurchasing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    onPurchase(lead.id);
    setIsPurchasing(false);
  };

  const purchasedLead = lead as PurchasedLead;

  return (
    <div className="fixed inset-0 z-[400] flex justify-end">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full md:max-w-lg bg-white h-full shadow-2xl overflow-y-auto border-l border-gray-100 rounded-t-[2.5rem] md:rounded-none mt-12 md:mt-0">
        <div className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 p-4 flex items-center justify-between z-20">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${purchased ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-[#ff385c]/10 border-[#ff385c]/20 text-[#ff385c]'}`}>
              {lead.type === 'boat' ? <Ship size={16} /> : <Car size={16} />}
            </div>
            <div>
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 block leading-none">Dossier #{lead.id}</span>
              <h2 className="text-base font-bold text-black tracking-tight leading-tight">{lead.title}</h2>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400"><X size={18} /></button>
        </div>

        <div className="p-5 space-y-6 pb-24 md:pb-20">
          <div className="bg-[#0D0D0E] rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl border border-white/5">
            <div className="flex justify-between items-start relative z-10">
              <div className="space-y-0.5">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#ff385c]">Service Scope</span>
                <h3 className="text-lg font-bold tracking-tight">{lead.service}</h3>
                <p className="text-zinc-400 text-[11px] font-medium italic">{lead.subService}</p>
              </div>
              {!purchased && <div className="text-xl font-black tracking-tighter">${lead.price}</div>}
            </div>
            <div className="flex flex-wrap gap-2 mt-5 relative z-10">
              <div className="bg-white/5 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-white/10"><Maximize2 size={10} className="text-blue-400" /><span className="text-[10px] font-bold">{lead.specs}</span></div>
              <div className="bg-white/5 px-2.5 py-1 rounded-lg flex items-center gap-1.5 border border-white/10"><MapPin size={10} className="text-[#ff385c]" /><span className="text-[10px] font-bold">{lead.location}</span></div>
            </div>
            {!purchased && (
              <button
                onClick={handlePurchaseLead}
                disabled={isPurchasing}
                className="w-full mt-5 bg-[#ff385c] text-white py-3.5 md:py-3 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-[#e31c5f] transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isPurchasing ? <><Loader2 size={14} className="animate-spin-custom" />Processing...</> : <>Purchase Lead Access</>}
              </button>
            )}
          </div>

          {purchased && (
            <div className="space-y-6">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest px-1"><ShieldCheck size={12} className="text-emerald-500" /><span>Service Checklist</span></div>
                <div className="flex flex-wrap gap-1.5">{purchasedLead.servicesRequested?.map((s: string, i: number) => (<span key={i} className="text-[10px] font-bold bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg border border-gray-200">{s}</span>))}</div>
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-[9px] font-black text-gray-400 uppercase tracking-widest px-1"><User size={12} className="text-blue-500" /><span>Customer Intel</span></div>
                <div className="grid grid-cols-1 gap-1">
                  {[
                    { label: 'Full Name', value: purchasedLead.customerName || 'Pending...', icon: User },
                    { label: 'Phone', value: purchasedLead.phone || 'Pending...', icon: Phone, color: 'text-[#ff385c]' },
                    { label: 'Email', value: purchasedLead.email || 'Pending...', icon: Mail },
                    { label: 'Location', value: purchasedLead.customerAddress || lead.location, icon: MapPin },
                  ].map((field, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2.5"><field.icon size={12} className="text-gray-300" /><span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">{field.label}</span></div>
                      <span className={`text-[11px] font-bold ${field.color || 'text-black'}`}>{String(field.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3"><div className="text-blue-500 mt-0.5"><Info size={16} /></div><div><h4 className="text-[8px] font-black text-blue-600 uppercase tracking-widest mb-1 leading-none">Service Setup</h4><p className="text-[11px] font-medium text-blue-800 leading-relaxed italic">Confirm with the customer if you&apos;re traveling to them or if they&apos;re dropping off at your shop.</p></div></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ReceiptModal({ transaction, onClose }: { transaction: PurchasedLead | null; onClose: () => void }) {
  if (!transaction) return null;
  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
       <div className="fixed inset-0 bg-black/75 backdrop-blur-xl" onClick={onClose} />
       <div className="relative bg-white w-full max-w-[320px] rounded-[2.5rem] shadow-2xl overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
             <div className="flex items-center gap-1.5 text-[#ff385c]"><Zap size={13} fill="currentColor" /><span className="font-black uppercase tracking-tighter text-[10px]">Merchant Receipt</span></div>
             <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-400"><X size={16} /></button>
          </div>
          <div className="p-6 space-y-6 text-center">
             <div><div className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-400 mb-1">Success</div><div className="text-4xl font-black text-black tracking-tighter">${transaction.price}.00</div></div>
             <div className="space-y-2 pt-4 border-t border-dashed border-gray-200 text-left">
                <div className="flex justify-between items-center"><span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Lead</span><span className="text-[10px] font-bold text-black truncate ml-4">{transaction.title}</span></div>
                <div className="flex justify-between items-center"><span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Date</span><span className="text-[10px] font-bold text-black">{transaction.purchasedAt || 'Now'}</span></div>
                <div className="flex justify-between items-center"><span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Method</span><span className="text-[10px] font-bold text-black">Visa ••4242</span></div>
             </div>
             <button className="w-full bg-black text-white py-3.5 rounded-2xl font-black uppercase tracking-[0.2em] text-[9px] flex items-center justify-center gap-2 hover:bg-zinc-800 transition-all">
                <Download size={14} /> Download PDF
             </button>
          </div>
       </div>
    </div>
  );
}

function OnboardingView({ onComplete }: { onComplete: (data: any) => void }) {
  const [step, setStep] = useState(1);
  const [specialization, setSpecialization] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', website: '', phone: '', address: 'St. Petersburg, FL', serviceArea: 'Tampa Bay', radius: 35, services: [] as string[] });
  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);
  const toggleService = (s: string) => setFormData(prev => ({ ...prev, services: prev.services.includes(s) ? prev.services.filter(x => x !== s) : [...prev.services, s] }));

  return (
    <div className="fixed inset-0 z-[600] bg-[#F8F9FA] flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8 md:mb-10 px-4">
          <div className="bg-black w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center mx-auto text-white shadow-2xl mb-4 md:mb-6"><Sparkles size={24} /></div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-black uppercase mb-1 md:mb-2 leading-tight">Welcome to DetailHub</h1>
          <p className="text-gray-400 font-bold text-[11px] md:text-base tracking-tight uppercase">Let&apos;s configure your terminal settings.</p>
        </div>
        <div className="flex gap-1.5 md:gap-2 mb-8 md:mb-10 px-8 md:px-12">
          {[1, 2, 3, 4].map(i => <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= i ? 'bg-[#ff385c]' : 'bg-gray-200'}`} />)}
        </div>
        <div className="bg-white border border-gray-200 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)]">
          {step === 1 && (
            <div className="space-y-6 md:space-y-8 text-center">
              <div><h2 className="text-lg md:text-xl font-black uppercase tracking-tight mb-1">Identify Specialization</h2><p className="text-gray-400 font-medium text-[11px] md:text-sm">Which assets do you primarily service?</p></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <button onClick={() => { setSpecialization('boat'); nextStep(); }} className="group h-32 md:h-48 border-2 border-gray-100 rounded-2xl md:rounded-[2.5rem] flex md:flex-col items-center justify-center gap-4 px-6 md:px-0 hover:border-[#ff385c] hover:bg-[#ff385c]/5 transition-all text-left md:text-center"><Ship size={32} className="text-gray-300 group-hover:text-[#ff385c]" /><span className="font-black uppercase tracking-widest text-[10px] md:text-[11px]">Marine Detailing</span></button>
                <button onClick={() => { setSpecialization('car'); nextStep(); }} className="group h-32 md:h-48 border-2 border-gray-100 rounded-2xl md:rounded-[2.5rem] flex md:flex-col items-center justify-center gap-4 px-6 md:px-0 hover:border-[#ff385c] hover:bg-[#ff385c]/5 transition-all text-left md:text-center"><Car size={32} className="text-gray-300 group-hover:text-[#ff385c]" /><span className="font-black uppercase tracking-widest text-[10px] md:text-[11px]">Automotive Detailing</span></button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6 md:space-y-8">
              <div className="text-center"><h2 className="text-lg md:text-xl font-black uppercase tracking-tight mb-1 md:mb-2">Business Profile</h2><p className="text-gray-400 font-medium text-[11px] md:text-sm italic uppercase tracking-widest opacity-60">Company information for client outreach.</p></div>
              <div className="grid grid-cols-1 gap-4">
                {[
                  { label: 'Company Name', icon: Building2, name: 'name', ph: 'Anchor Detailing Co.' },
                  { label: 'Website', icon: Globe, name: 'website', ph: 'www.anchordetailing.com' },
                  { label: 'Phone', icon: Phone, name: 'phone', ph: '(555) 000-0000' }
                ].map((f, i) => (
                  <div key={i} className="space-y-1"><label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-1">{f.label}</label><div className="relative group"><f.icon size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#ff385c]" /><input type="text" placeholder={f.ph} value={(formData as any)[f.name] || ''} onChange={e => setFormData({...formData, [f.name]: e.target.value})} className="w-full bg-gray-50 border border-transparent rounded-xl py-3.5 pl-11 pr-5 font-bold text-sm outline-none focus:bg-white focus:border-[#ff385c] transition-all" /></div></div>
                ))}
              </div>
              <button onClick={nextStep} className="w-full bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-800 transition-all flex items-center justify-center gap-2">Continue <ChevronRight size={16} /></button>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-6 md:space-y-8">
              <div className="text-center"><h2 className="text-lg md:text-xl font-black uppercase tracking-tight mb-2">Select Your Services</h2><p className="text-gray-400 font-medium text-[11px] md:text-sm italic">Matched leads will use these choices.</p></div>
              <div className="flex flex-wrap justify-center gap-1.5 md:gap-2">
                {(specialization === 'boat' ? MARINE_SERVICES : AUTO_SERVICES).map(s => (
                  <button key={s} onClick={() => toggleService(s)} className={`px-4 py-2.5 md:px-5 md:py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all ${formData.services.includes(s) ? 'bg-[#ff385c] border-[#ff385c] text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-black'}`}>{formData.services.includes(s) && <Check size={12} className="inline mr-1" />}{s}</button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={prevStep} className="px-5 border border-gray-100 rounded-2xl font-black uppercase tracking-widest text-[9px] hover:bg-gray-50 transition-all">Back</button>
                <button onClick={nextStep} className="flex-1 bg-black text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-zinc-800 transition-all">Set Dispatch Radius</button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-6 md:space-y-8">
              <div className="text-center"><h2 className="text-lg md:text-xl font-black uppercase tracking-tight mb-2">Territory Logistics</h2><p className="text-gray-400 font-medium text-[11px] md:text-sm italic">Define your travel radius.</p></div>
              <div className="space-y-6 md:space-y-8">
                 <div className="bg-gray-50 p-6 md:p-8 rounded-2xl md:rounded-[2rem] border border-gray-100 relative overflow-hidden">
                    <div className="flex justify-between items-center mb-6 relative z-10"><span className="text-[9px] font-black uppercase tracking-widest text-gray-400 leading-none">Travel Radius</span><span className="text-2xl font-black text-[#ff385c] tracking-tighter">{formData.radius} mi</span></div>
                    <input type="range" min="5" max="150" step="5" value={formData.radius} onChange={e => setFormData({...formData, radius: parseInt(e.target.value)})} className="w-full mb-2 relative z-10" />
                    <div className="flex justify-between text-[8px] font-black text-gray-300 uppercase tracking-widest leading-none"><span>Local</span><span>Regional</span></div>
                 </div>
                 <div className="grid grid-cols-2 gap-3 md:gap-4">
                   <div className="space-y-1"><label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-1">City</label><input type="text" placeholder="St. Petersburg" className="w-full bg-gray-50 border border-transparent rounded-xl py-3.5 px-5 font-bold text-sm outline-none focus:bg-white" /></div>
                   <div className="space-y-1"><label className="text-[8px] font-black uppercase tracking-widest text-gray-400 ml-1">State</label><input type="text" placeholder="FL" className="w-full bg-gray-50 border border-transparent rounded-xl py-3.5 px-5 font-bold text-sm outline-none focus:bg-white" /></div>
                 </div>
              </div>
              <button onClick={() => onComplete({ ...formData, specialization })} className="w-full bg-[#ff385c] text-white py-4 md:py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-[11px] hover:bg-[#e31c5f] transition-all shadow-2xl active:scale-95">Complete Terminal Setup</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function DashboardView({ leads, purchasedLeads, setActiveTab, onOpenLead }: { leads: Lead[]; purchasedLeads: PurchasedLead[]; setActiveTab: (tab: string) => void; onOpenLead: (lead: Lead | PurchasedLead) => void }) {
  const lifetimeSpent = purchasedLeads.reduce((acc, l) => acc + l.price, 0);
  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { icon: Zap, label: 'Available Leads', value: leads.length, color: 'text-[#ff385c]' },
          { icon: TrendingUp, label: 'Lifetime Spent', value: `$${lifetimeSpent}.00` },
          { icon: CheckCircle2, label: 'Purchased Leads', value: purchasedLeads.length }
        ].map((stat, i) => (
          <div key={i} className="bg-white border border-gray-200 p-5 rounded-[1.75rem] relative overflow-hidden group shadow-sm">
            <div className="flex items-center gap-2 mb-3 relative z-10"><stat.icon size={14} className="text-gray-400" /><span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-400">{stat.label}</span></div>
            <div className={`text-3xl font-black mb-1 tracking-tighter-custom relative z-10 ${stat.color || 'text-black'}`}>{String(stat.value)}</div>
            <div className="absolute -right-4 -bottom-4 text-black opacity-[0.02] group-hover:scale-110 transition-transform duration-700"><stat.icon size={80} /></div>
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-[12px] font-black tracking-tight uppercase text-gray-400">High Priority Opportunities</h2>
          <button onClick={() => setActiveTab('leads')} className="text-[#ff385c] text-[9px] font-black uppercase tracking-widest hover:underline">View All Leads</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {leads.slice(0, 4).map(lead => <LeadTile key={lead.id} lead={lead} onOpen={onOpenLead} />)}
        </div>
      </div>
    </div>
  );
}

function LeadsView({ leads, purchasedLeads, onOpenLead }: { leads: Lead[]; purchasedLeads: PurchasedLead[]; onOpenLead: (lead: Lead | PurchasedLead) => void }) {
  const [subTab, setSubTab] = useState('available');
  const displayLeads = subTab === 'available' ? leads : purchasedLeads;
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex bg-gray-200/50 p-1 rounded-xl w-fit shadow-inner">
          <button onClick={() => setSubTab('available')} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'available' ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}>Available ({leads.length})</button>
          <button onClick={() => setSubTab('purchased')} className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${subTab === 'purchased' ? 'bg-white shadow-sm text-black' : 'text-gray-400 hover:text-gray-600'}`}>Purchased ({purchasedLeads.length})</button>
        </div>
        <div className="relative"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={12} /><input type="text" placeholder="Search leads..." className="bg-white border border-gray-200 rounded-xl py-1.5 pl-8 pr-4 text-[11px] font-medium outline-none focus:border-[#ff385c] transition-all w-48 shadow-sm" /></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 pb-12">
        {displayLeads.length > 0 ? displayLeads.map(lead => <LeadTile key={lead.id} lead={lead} purchased={subTab === 'purchased'} onOpen={onOpenLead} />) : <div className="col-span-full py-32 text-center bg-white border border-dashed border-gray-200 rounded-[2rem]"><Inbox size={32} className="mx-auto text-gray-200 mb-4" /><h4 className="font-bold text-black text-[12px] uppercase">Console Empty</h4><p className="text-[10px] text-gray-400">Waiting for new {subTab} deployments.</p></div>}
      </div>
    </div>
  );
}

function ProfileView({ profile, setProfile, toggleService }: { profile: ProfileData; setProfile: React.Dispatch<React.SetStateAction<ProfileData>>; toggleService: (s: string) => void }) {
  const [customServiceName, setCustomServiceName] = useState('');
  const SERVICES = profile.specialization === 'boat' ? MARINE_SERVICES : AUTO_SERVICES;
  const allAvailableDisplayServices = Array.from(new Set([...SERVICES, ...profile.services]));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: name === 'radius' ? parseInt(value) : value }));
  };

  const handleAddCustomService = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (('key' in e && e.key === 'Enter') || e.type === 'click') {
      if (customServiceName.trim() && !profile.services.includes(customServiceName.trim())) {
        setProfile(prev => ({ ...prev, services: [...prev.services, customServiceName.trim()] }));
        setCustomServiceName('');
      }
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white border border-gray-200 rounded-[2rem] p-7 shadow-sm space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { label: 'Company Name', icon: Building2, name: 'name', value: profile.name },
            { label: 'Website', icon: Globe, name: 'website', value: profile.website },
            { label: 'Home Base', icon: MapPin, name: 'address', value: profile.address },
            { label: 'Service Area', icon: Navigation, name: 'serviceArea', value: profile.serviceArea },
            { label: 'Phone', icon: Phone, name: 'phone', value: profile.phone },
            { label: 'Email', icon: Mail, name: 'email', value: profile.email },
          ].map((field, i) => (
            <div key={i} className="space-y-1.5">
              <label className="text-[8px] font-bold uppercase tracking-[0.15em] text-gray-400 ml-1">{field.label}</label>
              <div className="relative group"><field.icon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#ff385c] transition-colors" /><input type="text" name={field.name} value={String(field.value || '')} onChange={handleInputChange} className="w-full bg-gray-50 border border-transparent rounded-xl py-2.5 pl-10 pr-4 font-bold text-[12px] outline-none focus:bg-white focus:border-[#ff385c] transition-all text-black" /></div>
            </div>
          ))}
          <div className="space-y-1 md:col-span-2 bg-gray-50 p-5 rounded-2xl border border-gray-100 mt-2">
            <div className="flex justify-between items-center mb-3"><label className="text-[8px] font-black uppercase tracking-widest text-gray-400 block">Dispatch Radius</label><div className="text-lg font-black text-[#ff385c] tracking-tighter px-3 py-0.5 bg-white rounded-lg shadow-sm">{profile.radius} mi</div></div>
            <input type="range" min="5" max="150" step="5" name="radius" value={profile.radius || 35} onChange={handleInputChange} className="w-full" />
          </div>
        </div>
        <div className="pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between mb-6"><h3 className="text-[12px] font-black uppercase text-black tracking-wider">Select Your Services</h3><div className="relative"><input type="text" placeholder="Add custom service..." value={customServiceName || ''} onChange={(e) => setCustomServiceName(e.target.value)} onKeyDown={handleAddCustomService} className="bg-gray-100 border border-gray-200 rounded-xl py-2 pl-3 pr-10 text-[10px] font-bold outline-none focus:bg-white focus:border-black transition-all w-48 shadow-sm" /><button onClick={handleAddCustomService} className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 bg-black text-white rounded-lg hover:scale-105 transition-transform shadow-lg"><Plus size={14} /></button></div></div>
          <div className="flex flex-wrap gap-1.5">{allAvailableDisplayServices.map(s => { const isCustom = !SERVICES.includes(s); const isActive = profile.services.includes(s); return (<button key={s} onClick={() => toggleService(s)} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest border transition-all duration-300 flex items-center gap-1.5 ${isActive ? 'bg-[#ff385c] border-[#ff385c] text-white shadow-md' : 'bg-white border-gray-200 text-gray-400 hover:border-black'}`}>{isActive && <Check size={10} />}{s}{isCustom && isActive && <X size={10} className="ml-1 opacity-60" onClick={(e) => { e.stopPropagation(); toggleService(s); }} />}</button>); })}</div>
        </div>
        <div className="pt-6 border-t border-gray-100 flex justify-between items-center"><div className="flex items-center gap-2 text-emerald-500"><CheckCircle2 size={14} /><span className="text-[9px] font-black uppercase tracking-[0.2em]">Active Profile</span></div><button className="bg-[#ff385c] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-[#e31c5f] transition-all shadow-lg shadow-[#ff385c]/20 active:scale-95">Save Changes</button></div>
      </div>
    </div>
  );
}

function BillingView({ purchasedLeads, onOpenReceipt, paymentMethod, setPaymentMethod }: { purchasedLeads: PurchasedLead[]; onOpenReceipt: (lead: PurchasedLead) => void; paymentMethod: { number: string; expiry: string } | null; setPaymentMethod: (pm: { number: string; expiry: string } | null) => void }) {
  const totalSpent = purchasedLeads.reduce((acc, l) => acc + l.price, 0);
  return (
    <div className="space-y-4 md:space-y-6 relative">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-[2rem] relative overflow-hidden group shadow-sm flex flex-col justify-between min-h-[200px]">
          {paymentMethod ? (
             <div className="space-y-5 md:space-y-6 relative z-10">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Payment Link</span>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-6 md:w-12 md:h-8 bg-zinc-900 rounded border border-white/10 flex items-center justify-center italic text-white text-[7px] md:text-[8px] font-black">VISA</div>
                  <div>
                    <div className="text-sm md:text-base font-bold text-black tracking-tight">•••• •••• •••• {paymentMethod.number}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Active • Expires {paymentMethod.expiry}</div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="bg-black text-white px-5 md:px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-zinc-800 transition-all shadow-lg">Change</button>
                  <button onClick={() => setPaymentMethod(null)} className="bg-gray-100 text-gray-600 px-5 md:px-6 py-2 rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-gray-200 transition-all">Remove</button>
                </div>
             </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-full space-y-4 relative z-10 text-center py-4">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-300"><CardIcon size={24} /></div>
                <h4 className="font-bold text-black uppercase text-[10px] tracking-widest">No Card Linked</h4>
                <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-[9px] hover:bg-blue-700 shadow-lg">Add Secure Method</button>
             </div>
          )}
        </div>
        <div className="bg-white border border-gray-200 p-6 md:p-8 rounded-[2rem] relative overflow-hidden group shadow-sm">
          <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Total Investment</span>
          <div className="text-5xl md:text-6xl font-black mb-1 tracking-tighter text-black relative z-10 leading-none mt-4">${totalSpent}.00</div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 leading-none">Lifetime Acquisition Spend</div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-sm">
        <h3 className="text-base md:text-lg font-black tracking-tight text-black uppercase flex items-center gap-2 mb-6 md:mb-8 leading-none"><Receipt size={18} className="text-gray-400" /> Transaction Log</h3>
        <div className="space-y-2">
          {purchasedLeads.length > 0 ? purchasedLeads.map((lead, i) => (
            <div key={i} onClick={() => onOpenReceipt(lead)} className="flex items-center justify-between p-3.5 md:p-4 bg-gray-50/50 hover:bg-white hover:shadow-lg rounded-2xl border border-gray-100 transition-all cursor-pointer group">
               <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
                  <div className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex-shrink-0 flex items-center justify-center border bg-white border-gray-200 text-gray-400 group-hover:text-[#ff385c] transition-colors">{lead.type === 'boat' ? <Ship size={14} /> : <Car size={14} />}</div>
                  <div className="overflow-hidden">
                    <div className="text-[12px] md:text-[12.5px] font-bold text-black group-hover:text-[#ff385c] transition-colors truncate">{lead.title}</div>
                    <div className="text-[9px] text-gray-400 font-bold uppercase mt-0.5 opacity-60 leading-none">{lead.purchasedAt}</div>
                  </div>
               </div>
               <div className="text-right flex-shrink-0 ml-4">
                  <div className="text-[13px] md:text-[14px] font-black text-black">-${lead.price}.00</div>
                  <div className="text-[8px] text-emerald-600 font-black uppercase hidden md:block">••{paymentMethod?.number || '4242'}</div>
               </div>
            </div>
          )) : (
            <div className="text-center py-16 opacity-40 uppercase font-black text-zinc-300 tracking-widest text-[10px]">Log Empty</div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Main App ---

export default function CompanyApp() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<PurchasedLead | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | PurchasedLead | null>(null);

  const [availableLeads, setAvailableLeads] = useState<Lead[]>(INITIAL_AVAILABLE);
  const [purchasedLeads, setPurchasedLeads] = useState<PurchasedLead[]>(INITIAL_PURCHASED);
  const [paymentMethod, setPaymentMethod] = useState<{ number: string; expiry: string } | null>({ number: '4242', expiry: '12/28' });

  const [profile, setProfile] = useState<ProfileData>({
    name: '', address: 'Saint Petersburg, FL', serviceArea: 'Tampa Bay', website: '', radius: 45, phone: '', email: 'admin@anchordetailing.com', specialization: 'boat', services: []
  });

  const filteredAvailableLeads = useMemo(() =>
    availableLeads.filter(l => l.type === profile.specialization),
    [availableLeads, profile.specialization]
  );

  const filteredPurchasedLeads = useMemo(() =>
    purchasedLeads.filter(l => l.type === profile.specialization),
    [purchasedLeads, profile.specialization]
  );

  const handlePurchaseLead = (leadId: number) => {
    const leadToBuy = availableLeads.find(l => l.id === leadId);
    if (!leadToBuy) return;
    const enrichedLead: PurchasedLead = { ...leadToBuy, customerName: 'Marcus V.', phone: '(727) 555-0192', email: 'm.valdez@icloud.com', customerAddress: leadToBuy.location, purchasedAt: 'Just Now', servicesRequested: [leadToBuy.service, leadToBuy.subService] };
    setPurchasedLeads([enrichedLead, ...purchasedLeads]);
    setAvailableLeads(availableLeads.filter(l => l.id !== leadId));
    setSelectedLead(enrichedLead);
    setSelectedReceipt(enrichedLead);
  };

  const handleOnboardingComplete = (data: any) => {
    setProfile(data);
    setIsOnboarded(true);
  };

  const toggleService = (s: string) => setProfile(p => ({ ...p, services: p.services.includes(s) ? p.services.filter(x => x !== s) : [...p.services, s] }));

  if (!isOnboarded) {
    return (
      <>
        <TypographyStyle />
        <OnboardingView onComplete={handleOnboardingComplete} />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8F9FA] pb-20 md:pb-0">
      <TypographyStyle />

      {/* Sidebar - Desktop Only */}
      <aside className="hidden md:flex w-56 bg-white border-r border-gray-200 flex-col p-5 fixed h-full z-30">
        <div className="flex items-center gap-2 mb-10 px-1 group cursor-pointer">
          <div className="bg-[#ff385c] p-1.5 rounded-xl text-white shadow-xl group-hover:scale-110 transition-transform duration-500"><Zap size={18} fill="currentColor" /></div>
          <span className="text-base font-extrabold tracking-tighter uppercase italic text-black leading-none">DetailHub<span className="text-gray-300">Pro</span></span>
        </div>
        <nav className="space-y-1.5 flex-1">
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarItem icon={Inbox} label="Lead Inbox" active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} />
          <SidebarItem icon={UserCircle} label="Business Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
          <SidebarItem icon={CreditCard} label="Billing & Payments" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
        </nav>
        <div className="mt-auto pt-6 border-t border-gray-100">
          <div className="bg-gray-50 rounded-2xl p-3.5 flex items-center gap-3 border border-gray-100 shadow-sm">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center font-black text-black border border-gray-200 text-sm shadow-sm">A</div>
            <div className="flex-1 overflow-hidden">
              <div className="text-[12px] font-black tracking-tight truncate text-black uppercase">{String(profile.name && profile.name.split(' ')[0]) || 'Member'}</div>
              <div className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.2em] leading-none mt-1 flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />Active</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-xl border-t border-gray-200 flex items-center justify-around px-4 z-[350] shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
        <MobileNavItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
        <MobileNavItem icon={Inbox} label="Lead Inbox" active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} />
        <MobileNavItem icon={UserCircle} label="Business Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        <MobileNavItem icon={CreditCard} label="Billing & Payments" active={activeTab === 'billing'} onClick={() => setActiveTab('billing')} />
      </nav>

      {/* Mobile Sticky Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#F8F9FA] z-[30] px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-[#ff385c] p-1 rounded-lg text-white shadow-lg"><Zap size={14} fill="currentColor" /></div>
          <span className="font-extrabold uppercase italic text-black tracking-tighter text-xs">DetailHub</span>
        </div>
        <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-[10px] text-white font-black">A</div>
      </header>

      <main className="flex-1 md:ml-56 p-4 md:p-12 mt-14 md:mt-0">
        <header className="mb-6 md:mb-10">
          <h1 className="text-xl md:text-2xl font-black tracking-tighter-custom text-black mb-0.5 uppercase">
            {activeTab === 'dashboard' && 'Dashboard'}
            {activeTab === 'leads' && 'Lead Inbox'}
            {activeTab === 'profile' && 'Business Profile'}
            {activeTab === 'billing' && 'Billing & Payments'}
          </h1>
          <p className="text-gray-400 font-bold text-[10px] md:text-[12px] tracking-tight max-w-2xl leading-relaxed uppercase opacity-60">
            {activeTab === 'dashboard' && `Matched ${profile.specialization} territory intelligence.`}
            {activeTab === 'leads' && `Active ${profile.specialization} request queue.`}
            {activeTab === 'profile' && 'Configure terminal and dispatch radius.'}
            {activeTab === 'billing' && 'Direct transaction history and payment links.'}
          </p>
        </header>

        <div className="pb-12">
          {activeTab === 'dashboard' && <DashboardView leads={filteredAvailableLeads} purchasedLeads={filteredPurchasedLeads} setActiveTab={setActiveTab} onOpenLead={setSelectedLead} />}
          {activeTab === 'leads' && <LeadsView leads={filteredAvailableLeads} purchasedLeads={filteredPurchasedLeads} onOpenLead={setSelectedLead} />}
          {activeTab === 'profile' && <ProfileView profile={profile} setProfile={setProfile} toggleService={toggleService} />}
          {activeTab === 'billing' && (
            <BillingView
              purchasedLeads={filteredPurchasedLeads}
              onOpenReceipt={setSelectedReceipt}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
            />
          )}
        </div>

        <LeadDetailPanel
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          purchased={purchasedLeads.some(l => l.id === selectedLead?.id)}
          onPurchase={handlePurchaseLead}
        />

        <ReceiptModal transaction={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
      </main>
    </div>
  );
}
