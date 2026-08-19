/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { DoctorView } from './components/doctor/DoctorView';
import { PharmacyView } from './components/pharmacy/PharmacyView';
import { ReceptionView } from './components/reception/ReceptionView';
import { PatientPortal } from './components/patient/PatientPortal';
import { FinancialView } from './components/financial/FinancialView';
import { LandingShowcase } from './components/landing/LandingShowcase';
import { ShieldCheck, Lock, Sparkles } from 'lucide-react';
import { LatchworkLogo } from './components/common/LatchworkLogo';

const MainLayout: React.FC = () => {
  const { role, language, clinicSettings } = useApp();

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-orange-600 selection:text-white">
      {/* Universal Top Navigation Header */}
      <Header />

      {/* Main Role-Based Workspace View */}
      <main className="flex-1 pb-16">
        {role === 'doctor' && <DoctorView />}
        {role === 'pharmacy' && <PharmacyView />}
        {role === 'reception' && <ReceptionView />}
        {role === 'patient' && <PatientPortal />}
        {role === 'financial' && <FinancialView />}
        {role === 'showcase' && <LandingShowcase />}
      </main>

      {/* Global Minimal Footer */}
      <footer className="border-t border-slate-200 bg-white py-5 text-xs text-slate-500 no-print shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LatchworkLogo size="sm" showText={true} />
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">
              {language === 'ar' ? clinicSettings.nameAr : clinicSettings.name}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 text-orange-600 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Gemini AI Clinical & Financial Engine</span>
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Real-Time e-Rx Sync & POS Billing</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
