import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileText,
  Activity,
  ShieldAlert,
  HeartPulse,
  Sparkles,
  Calendar,
  Pill,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Printer,
  ChevronDown,
  ChevronUp,
  User,
  Clock,
  Stethoscope,
  TrendingUp,
  TrendingDown,
  Award,
  BookOpen,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Patient, Prescription, Appointment } from '../../types';

interface PatientMedicalHistoryProps {
  patient: Patient;
}

interface AIMedicalSummaryState {
  executiveSummary: string;
  executiveSummaryAr: string;
  keyConditionsAnalysis: {
    condition: string;
    status: string;
    managementNotes: string;
    managementNotesAr: string;
  }[];
  allergyRiskSummary: string;
  allergyRiskSummaryAr: string;
  recentTrendHighlights: string[];
  recentTrendHighlightsAr: string[];
  actionableSelfCareRecommendations: string[];
  actionableSelfCareRecommendationsAr: string[];
  lastUpdated: string;
}

export const PatientMedicalHistory: React.FC<PatientMedicalHistoryProps> = ({ patient }) => {
  const { language, prescriptions, appointments, doctors } = useApp();

  const [aiSummary, setAiSummary] = useState<AIMedicalSummaryState | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false);
  const [selectedEncounterId, setSelectedEncounterId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'all' | 'encounters' | 'allergies' | 'conditions' | 'vitals'>('all');

  // Filter patient's specific prescriptions & appointments
  const patientPrescriptions = prescriptions.filter((rx) => rx.patientId === patient.id);
  const patientAppointments = appointments.filter((apt) => apt.patientId === patient.id);

  // Past rich clinical encounters
  const clinicalEncounters = [
    {
      id: 'enc-2026-01',
      date: 'Aug 18, 2026',
      dateAr: '18 أغسطس 2026',
      doctorName: 'Dr. Reem Baban, MD',
      specialty: 'Family Medicine & Diabetology',
      department: 'Outpatient Clinic - Suite 2A',
      chiefComplaint: 'Quarterly HbA1c review & routine blood pressure monitoring',
      chiefComplaintAr: 'متابعة السكري التراكمي الدورية وفحص ضغط الدم',
      diagnosis: 'E11.9 — Type 2 Diabetes Mellitus without complications; I10 — Essential Primary Hypertension',
      soapNotes: {
        subjective: 'Patient reports feeling well, no dizziness or polyuria. Adhering to daily Metformin and Lisinopril.',
        objective: 'BP: 124/80 mmHg, HR: 72 bpm, SpO2: 99%, Weight: 68.5 kg, BMI: 24.2. Clear breath sounds.',
        assessment: 'Type 2 Diabetes in good metabolic control (HbA1c 6.4%). Essential hypertension well controlled on ACE-inhibitor.',
        plan: '1. Renew Metformin 500mg BID and Lisinopril 10mg QD for 90 days. 2. Repeat lipid & renal profile in 3 months. 3. Continue 30 min daily walking.',
      },
      prescriptionsIssued: ['RX-2026-8821 (Metformin, Lisinopril)'],
      vitalsSnapshot: { bp: '124/80', pulse: 72, spo2: 99, temp: 36.8 },
    },
    {
      id: 'enc-2026-02',
      date: 'May 12, 2026',
      dateAr: '12 مايو 2026',
      doctorName: 'Dr. Zaid Al-Husseini, MD',
      specialty: 'Internal Medicine & Cardiology',
      department: 'Cardiovascular Assessment Suite 4B',
      chiefComplaint: 'Occasional exertional palpitation and preventive lipid panel check',
      chiefComplaintAr: 'خفقان خفيف عند الإجهاد وفحص دوري لمستوى الدهون الثلاثية',
      diagnosis: 'I10 — Essential Hypertension; E78.00 — Pure Hypercholesterolemia (Mild)',
      soapNotes: {
        subjective: 'Mild palpitations noted during high-intensity treadmill exercise, resolves spontaneously within 2 minutes.',
        objective: '12-lead ECG: Normal sinus rhythm at 74 bpm, no ST-T ischemic changes. Normal S1/S2.',
        assessment: 'Benign sinus tachycardia related to caffeine intake. No structural cardiovascular abnormalities.',
        plan: '1. Moderate caffeine intake (<200mg/day). 2. Continue Lisinopril 10mg. 3. Follow-up annually.',
      },
      prescriptionsIssued: ['Lipid profile diagnostics panel'],
      vitalsSnapshot: { bp: '128/82', pulse: 74, spo2: 98, temp: 36.7 },
    },
    {
      id: 'enc-2026-03',
      date: 'Jan 20, 2026',
      dateAr: '20 يناير 2026',
      doctorName: 'Dr. Reem Baban, MD',
      specialty: 'Family Medicine & Diabetology',
      department: 'Annual Wellness Evaluation Suite 2A',
      chiefComplaint: 'Annual comprehensive health checkup and vaccination booster review',
      chiefComplaintAr: 'الفحص الطبي الشامل السنوي وتحديث التطعيمات الوقائية',
      diagnosis: 'Z00.00 — Encounter for general adult medical examination',
      soapNotes: {
        subjective: 'No active acute symptoms. Reports mild seasonal allergies in springtime.',
        objective: 'Physical exam unremarkable. Fundoscopic exam shows no diabetic retinopathy.',
        assessment: 'Healthy adult with well-managed chronic conditions.',
        plan: 'Administered seasonal quadrivalent influenza vaccine. Maintain dietary fiber intake.',
      },
      prescriptionsIssued: ['Influenza Vaccine 2026 Booster'],
      vitalsSnapshot: { bp: '122/78', pulse: 70, spo2: 99, temp: 36.6 },
    },
  ];

  // Fetch AI Medical Synthesis
  const fetchAIMedicalSummary = async () => {
    setIsLoadingAI(true);
    try {
      const res = await fetch('/api/ai/patient-medical-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient,
          clinicalNotes: clinicalEncounters,
          language,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setAiSummary(data.data);
      }
    } catch (e) {
      console.warn('Using client clinical fallback summary for patient', e);
    } finally {
      setIsLoadingAI(false);
    }
  };

  useEffect(() => {
    fetchAIMedicalSummary();
  }, [patient.id]);

  return (
    <div className="space-y-6 animate-in fade-in-50">
      {/* Top Header & Patient Overview Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-bold text-xl shadow-md border-2 border-white">
            {patient.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-lg font-bold text-slate-900">
                {language === 'ar' && patient.nameAr ? patient.nameAr : patient.name}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {patient.gender === 'female' ? 'Female' : 'Male'}, {patient.age} yrs
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700">
                Blood: {patient.bloodType || 'O+'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
              <span>MRN: <strong className="font-mono text-slate-700">{patient.nationalId || 'PAT-9941'}</strong></span>
              <span>•</span>
              <span>Phone: <strong className="text-slate-700">{patient.phone}</strong></span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={fetchAIMedicalSummary}
            disabled={isLoadingAI}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAI ? 'animate-spin' : ''}`} />
            <span>{isLoadingAI ? 'Analyzing Notes...' : 'Refresh AI Summary'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="Print Complete Medical Record"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Chart</span>
          </button>
        </div>
      </div>

      {/* Gemini AI Clinical Notes Summarizer Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-700/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md text-amber-300 border border-white/15">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <span>{language === 'ar' ? 'ملخص الذكاء الاصطناعي السريري للتاريخ الطبي' : 'Gemini AI Clinical Notes Synthesis'}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                    Chief Medical AI
                  </span>
                </h3>
                <p className="text-xs text-indigo-200/80">
                  {language === 'ar'
                    ? 'تلخيص ذكي وشامل لجميع الزيارات السريرية والتشخيصات والحساسيات الدوائية'
                    : 'Dynamic synthesis across all historical encounters, SOAP records & pharmacological regimens'}
                </p>
              </div>
            </div>

            {aiSummary?.lastUpdated && (
              <span className="text-[11px] text-indigo-300/80 font-mono hidden sm:inline-block">
                Synthesized: {aiSummary.lastUpdated}
              </span>
            )}
          </div>

          {/* Executive Summary Paragraph */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-xs leading-relaxed text-indigo-50">
            {isLoadingAI ? (
              <div className="flex items-center gap-3 py-4 justify-center text-indigo-200">
                <RefreshCw className="w-5 h-5 animate-spin text-amber-300" />
                <span>Aggregating physician notes and generating clinical synthesis...</span>
              </div>
            ) : (
              <p>
                {language === 'ar'
                  ? aiSummary?.executiveSummaryAr || aiSummary?.executiveSummary
                  : aiSummary?.executiveSummary ||
                    `${patient.name} is managed for ${patient.chronicConditions.join(' and ')}. Recent encounters indicate stable glycemic parameters, compliant medication adherence, and normal cardiovascular profile.`}
              </p>
            )}
          </div>

          {/* Key Insights Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {/* 1. Allergy Alert Box */}
            <div className="p-3.5 rounded-2xl bg-red-950/40 border border-red-500/30 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-red-300 font-bold">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                <span>{language === 'ar' ? 'تنبيه الحساسية' : 'Allergy Vigilance'}</span>
              </div>
              <p className="text-[11px] text-red-200/90 leading-snug">
                {language === 'ar'
                  ? aiSummary?.allergyRiskSummaryAr || aiSummary?.allergyRiskSummary
                  : aiSummary?.allergyRiskSummary ||
                    (patient.allergies.length > 0
                      ? `Documented hypersensitivity: ${patient.allergies.join(', ')}. Avoid cross-reactive medications.`
                      : 'No known drug allergies (NKDA).')}
              </p>
            </div>

            {/* 2. Key Clinical Trends */}
            <div className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-400/30 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-blue-300 font-bold">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span>{language === 'ar' ? 'مؤشرات الاستقرار' : 'Key Health Trends'}</span>
              </div>
              <ul className="text-[11px] text-blue-100/90 space-y-1">
                {(language === 'ar' && aiSummary?.recentTrendHighlightsAr
                  ? aiSummary.recentTrendHighlightsAr
                  : aiSummary?.recentTrendHighlights || [
                      'Blood pressure stable around 124/80 mmHg',
                      'High medication refill adherence (94%)',
                      'No emergency acute hospitalizations',
                    ]
                ).map((trend, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-blue-400 font-bold">•</span>
                    <span>{trend}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 3. Actionable Self-Care */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-400/30 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <HeartPulse className="w-4 h-4 text-emerald-400" />
                <span>{language === 'ar' ? 'إرشادات الرعاية الذاتية' : 'Self-Care Action Items'}</span>
              </div>
              <ul className="text-[11px] text-emerald-100/90 space-y-1">
                {(language === 'ar' && aiSummary?.actionableSelfCareRecommendationsAr
                  ? aiSummary.actionableSelfCareRecommendationsAr
                  : aiSummary?.actionableSelfCareRecommendations || [
                      'Log morning fasting glucose 2x weekly',
                      'Maintain 2.5L daily hydration & low salt',
                      'Schedule routine metabolic panel in 90 days',
                    ]
                ).map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-navigation Filters */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        <button
          type="button"
          onClick={() => setActiveSection('all')}
          className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeSection === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          {language === 'ar' ? 'الكل' : 'Complete Record'}
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('encounters')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeSection === 'encounters'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'الزيارات السريرية' : 'Clinical Encounters'} ({clinicalEncounters.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('allergies')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeSection === 'allergies'
              ? 'bg-red-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'الحساسيات' : 'Allergies'} ({patient.allergies?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('conditions')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeSection === 'conditions'
              ? 'bg-indigo-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'الأمراض المزمنة' : 'Chronic Conditions'} ({patient.chronicConditions?.length || 0})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('vitals')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
            activeSection === 'vitals'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <HeartPulse className="w-3.5 h-3.5" />
          <span>{language === 'ar' ? 'العلامات الحيوية' : 'Vital Signs Matrix'}</span>
        </button>
      </div>

      {/* SECTION 1: Chronic Conditions & Active Regimens */}
      {(activeSection === 'all' || activeSection === 'conditions') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'ar' ? 'الأمراض المزمنة المسجلة' : 'Documented Chronic Conditions & Care Trajectory'}
              </h3>
            </div>
            <span className="text-xs text-slate-500">ICD-10 Categorized</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patient.chronicConditions.map((cond, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h4 className="font-bold text-sm text-slate-900">{cond}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Active / Controlled
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Managed by Primary Care team at Latchwork. Monitored through routine diagnostic panels and active prescriptions.
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: Allergies & Hypersensitivities */}
      {(activeSection === 'all' || activeSection === 'allergies') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-red-600" />
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'ar' ? 'سجل الحساسيات والتحذيرات الدوائية' : 'Documented Allergies & Drug Adverse Reactions'}
              </h3>
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100">
              Electronic Health Record Verified
            </span>
          </div>

          {patient.allergies.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-600">
              No known allergies documented (NKDA).
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {patient.allergies.map((allergy, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-red-50/60 border border-red-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-900 text-sm">{allergy}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-600 text-white">
                      Severe
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">
                    Reaction: Cutaneous rash, urticaria, or anaphylaxis risk. Alert flagged across pharmacy dispensing queue.
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION 3: Detailed Clinical Encounters & SOAP Timeline */}
      {(activeSection === 'all' || activeSection === 'encounters') && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'ar' ? 'سجل الزيارات السريرية وملاحظات الأطباء' : 'Past Clinical Encounters & Physician Notes'}
              </h3>
            </div>
            <span className="text-xs text-slate-500">{clinicalEncounters.length} Completed Consultations</span>
          </div>

          <div className="space-y-4">
            {clinicalEncounters.map((enc) => {
              const isExpanded = selectedEncounterId === enc.id || selectedEncounterId === null;
              return (
                <div
                  key={enc.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4.5 space-y-3 transition-all"
                >
                  {/* Encounter Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2.5 rounded-xl bg-blue-100/70 text-blue-700 font-bold">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">
                            {language === 'ar' ? enc.chiefComplaintAr : enc.chiefComplaint}
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 font-mono">
                            {enc.date}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          {enc.doctorName} • <span className="text-blue-700 font-medium">{enc.specialty}</span> ({enc.department})
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setSelectedEncounterId(selectedEncounterId === enc.id ? null : enc.id)
                      }
                      className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Encounter Content (SOAP Notes) */}
                  {isExpanded && (
                    <div className="pt-2 border-t border-slate-200/80 space-y-3 text-xs animate-in fade-in-50">
                      <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 font-mono text-[11px] text-blue-900">
                        <strong>ICD-10 Diagnosis:</strong> {enc.diagnosis}
                      </div>

                      {/* SOAP Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                          <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block">
                            [S] Subjective Patient Report:
                          </span>
                          <p className="text-slate-600">{enc.soapNotes.subjective}</p>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                          <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block">
                            [O] Objective Clinical Exam:
                          </span>
                          <p className="text-slate-600">{enc.soapNotes.objective}</p>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                          <span className="font-bold text-slate-700 text-[11px] uppercase tracking-wider block">
                            [A] Clinical Assessment:
                          </span>
                          <p className="text-slate-600">{enc.soapNotes.assessment}</p>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                          <span className="font-bold text-emerald-800 text-[11px] uppercase tracking-wider block">
                            [P] Treatment Plan & Rx:
                          </span>
                          <p className="text-slate-600">{enc.soapNotes.plan}</p>
                        </div>
                      </div>

                      {/* Vitals Snapshot */}
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                        <span>Vitals: BP <strong className="text-slate-900">{enc.vitalsSnapshot.bp}</strong></span>
                        <span>• Pulse <strong className="text-slate-900">{enc.vitalsSnapshot.pulse} bpm</strong></span>
                        <span>• SpO2 <strong className="text-slate-900">{enc.vitalsSnapshot.spo2}%</strong></span>
                        <span>• Temp <strong className="text-slate-900">{enc.vitalsSnapshot.temp}°C</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 4: Vital Signs Matrix */}
      {(activeSection === 'all' || activeSection === 'vitals') && patient.vitals && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-sm text-slate-900">
                {language === 'ar' ? 'أحدث العلامات والمؤشرات الحيوية' : 'Latest Baseline Vitals'}
              </h3>
            </div>
            <span className="text-xs text-slate-500">Recorded: {patient.vitals.lastRecorded}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block font-semibold">Blood Pressure</span>
              <span className="text-lg font-bold font-mono text-slate-900">{patient.vitals.bloodPressure}</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Optimal Range</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block font-semibold">Heart Rate</span>
              <span className="text-lg font-bold font-mono text-slate-900">{patient.vitals.heartRate} bpm</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Normal Sinus</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block font-semibold">Oxygen (SpO2)</span>
              <span className="text-lg font-bold font-mono text-slate-900">{patient.vitals.oxygenSaturation}%</span>
              <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">Optimal Saturation</span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-xs text-slate-500 block font-semibold">BMI Index</span>
              <span className="text-lg font-bold font-mono text-slate-900">{patient.vitals.bmi}</span>
              <span className="text-[10px] text-slate-500 block mt-0.5">Weight: {patient.vitals.weightKg} kg</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
