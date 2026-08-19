import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Stethoscope,
  Pill,
  CalendarCheck2,
  UserCheck,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Sliders,
  Sparkles,
  Building2,
  Globe,
  Database,
  Layers,
  DollarSign,
  ShoppingCart,
  Receipt,
  Cpu,
} from 'lucide-react';
import { Role } from '../../types';
import { LatchworkLogo } from '../common/LatchworkLogo';

export const LandingShowcase: React.FC = () => {
  const { t, language, setRole, clinicSettings, updateClinicSettings } = useApp();

  const [customName, setCustomName] = useState(clinicSettings.name);
  const [customNameAr, setCustomNameAr] = useState(clinicSettings.nameAr);
  const [customAccent, setCustomAccent] = useState(clinicSettings.accentColor);

  const handleApplyCustomizer = (e: React.FormEvent) => {
    e.preventDefault();
    updateClinicSettings({
      name: customName,
      nameAr: customNameAr,
      accentColor: customAccent,
    });
  };

  const featureCards = [
    {
      icon: <Stethoscope className="w-5 h-5 text-orange-600" />,
      title: t('feature1Title'),
      desc: t('feature1Desc'),
      roleTarget: 'doctor' as Role,
    },
    {
      icon: <Pill className="w-5 h-5 text-amber-600" />,
      title: t('feature4Title'),
      desc: t('feature4Desc'),
      roleTarget: 'pharmacy' as Role,
    },
    {
      icon: <DollarSign className="w-5 h-5 text-emerald-600" />,
      title: t('feature3Title'),
      desc: t('feature3Desc'),
      roleTarget: 'financial' as Role,
    },
    {
      icon: <UserCheck className="w-5 h-5 text-sky-600" />,
      title: t('feature2Title'),
      desc: t('feature2Desc'),
      roleTarget: 'patient' as Role,
    },
    {
      icon: <Cpu className="w-5 h-5 text-purple-600" />,
      title: t('feature5Title'),
      desc: t('feature5Desc'),
      roleTarget: 'doctor' as Role,
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-rose-600" />,
      title: 'Double-Booking & Allergy Contraindication Shield',
      desc: 'Real-time slot reservation at database level with automated cross-checking against patient drug allergen records.',
      roleTarget: 'doctor' as Role,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-5 max-w-3xl mx-auto pt-4">
        <div className="flex justify-center mb-2">
          <LatchworkLogo size="lg" showText={true} />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-orange-600 animate-pulse" />
          <span>Clinic, Attached Pharmacy & Financial Operating Engine</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          {t('showcaseTitle')}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          {t('showcaseSub')}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
          <button
            onClick={() => setRole('doctor')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <Stethoscope className="w-4 h-4" />
            <span>Launch Doctor Workspace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setRole('pharmacy')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs shadow-sm transition-all"
          >
            <Pill className="w-4 h-4 text-orange-600" />
            <span>Dispensary Console</span>
          </button>
          <button
            onClick={() => setRole('financial')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs shadow-sm transition-all"
          >
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Financials & POS</span>
          </button>
          <button
            onClick={() => setRole('patient')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs shadow-sm transition-all"
          >
            <UserCheck className="w-4 h-4 text-sky-600" />
            <span>Patient Portal & Booking</span>
          </button>
        </div>
      </div>

      {/* Synchronized Operating Flow Architecture */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h3 className="text-lg font-bold text-slate-900">Live Integrated Clinical & Commerce Pipeline</h3>
          <p className="text-xs text-slate-500">
            How clinical notes, inventory, billing, and patient bookings flow seamlessly across the platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold">
              1
            </div>
            <h4 className="font-bold text-slate-900">Patient Booking & AI Triage</h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Patient checks live physician availability, matches symptoms with Gemini AI, and books with instant slot locking.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 border border-orange-200 flex items-center justify-center font-bold">
              2
            </div>
            <h4 className="font-bold text-slate-900">Clinical SOAP & e-Rx Dispatch</h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Physician generates structured SOAP notes with AI, selects medications with allergy safeguards, and transmits Rx.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 border border-amber-200 flex items-center justify-center font-bold">
              3
            </div>
            <h4 className="font-bold text-slate-900">Attached Dispensary Sync</h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Dispensary console alerts pharmacist. Stock decrements, batch is logged, and patient gets an SMS/portal notification.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 border border-blue-200 flex items-center justify-center font-bold">
              4
            </div>
            <h4 className="font-bold text-slate-900">POS Checkout & AI P&L</h4>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Direct point-of-sale receipt issuance, e-commerce ordering, and Gemini predictive cashflow forecasting.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Comprehensive Operating Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featureCards.map((card, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 hover:border-orange-300 rounded-xl p-5 shadow-2xs space-y-3 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-slate-50 inline-block border border-slate-200">
                  {card.icon}
                </div>
                <h4 className="font-bold text-sm text-slate-900">{card.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
              </div>

              {card.roleTarget !== 'showcase' && (
                <button
                  onClick={() => setRole(card.roleTarget)}
                  className="flex items-center gap-1 text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors pt-2 border-t border-slate-100"
                >
                  <span>Open Module</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Tenant Customizer / Branding Sandbox */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="p-2 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Live Clinic Tenant Configurator</h3>
            <p className="text-xs text-slate-500">
              Customize the clinic branding and bilingual names across the entire application live.
            </p>
          </div>
        </div>

        <form onSubmit={handleApplyCustomizer} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Clinic Name (English)</label>
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-orange-600 focus:bg-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">اسم المجمع الطبي (العربية)</label>
            <input
              type="text"
              value={customNameAr}
              onChange={(e) => setCustomNameAr(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-orange-600 focus:bg-white font-sans"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-2xs transition-colors"
            >
              Apply Live Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
