import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Activity,
  AlertOctagon,
  Sparkles,
  Pill,
  Send,
  Plus,
  Trash2,
  Printer,
  FileCheck,
  CheckCircle2,
  Clock,
  Heart,
  Thermometer,
  Wind,
  Search,
  ChevronRight,
  ShieldAlert,
  Zap,
  Calendar,
  CalendarCheck2,
  Bot,
  LayoutList,
} from 'lucide-react';
import { PrescribedMedication, Prescription } from '../../types';
import { PrintPrescriptionModal } from '../common/PrintPrescriptionModal';
import { DoctorDailyScheduleBriefing } from './DoctorDailyScheduleBriefing';
import { DoctorScheduleCalendar } from './DoctorScheduleCalendar';

export const DoctorView: React.FC = () => {
  const {
    t,
    language,
    patients,
    activePatientId,
    setActivePatientId,
    activePatient,
    activeDoctor,
    appointments,
    updateAppointmentStatus,
    inventory,
    createPrescription,
    prescriptions,
    generateSOAPWithAI,
  } = useApp();

  const [doctorMode, setDoctorMode] = useState<'consultation' | 'calendar'>('consultation');

  // Consultation state
  const [subjective, setSubjective] = useState(
    'Patient presents with mild dizziness in the mornings and blood glucose readings averaging 145-160 mg/dL over past 2 weeks. Complies with current regimen.'
  );
  const [objective, setObjective] = useState(
    'Alert and oriented. BP 134/86 mmHg, HR 74 bpm regular. Heart sounds normal S1/S2 without murmurs. Lungs clear to auscultation bilaterally. No peripheral edema.'
  );
  const [assessment, setAssessment] = useState(
    'Type 2 Diabetes Mellitus with sub-optimal glycemic control; Essential Hypertension (Stage 1).'
  );
  const [icd10, setIcd10] = useState('E11.9 / I10');
  const [plan, setPlan] = useState(
    '1. Adjust Metformin to 1000mg with evening meal.\n2. Continue Lisinopril 10mg.\n3. Request fasting lipid panel and HbA1c.\n4. Follow-up in 4 weeks.'
  );
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiGeneratedToast, setAiGeneratedToast] = useState(false);

  // E-Prescription composer state
  const [rxMeds, setRxMeds] = useState<PrescribedMedication[]>([
    {
      drugId: 'drug-2',
      drugName: 'Metformin HCl 500mg (Glucophage)',
      dosage: '500mg',
      frequency: 'Twice daily with meals',
      frequencyAr: 'مرتين يومياً مع الوجبات',
      duration: '90 days',
      instructions: 'Take with morning and evening meal to reduce GI upset.',
      instructionsAr: 'يؤخذ مع وجبتي الإفطار والعشاء لتجنب اضطراب المعدة.',
      refillsAllowed: 3,
      refillsRemaining: 2,
    },
  ]);

  const [selectedDrugId, setSelectedDrugId] = useState('drug-4');
  const [medDosage, setMedDosage] = useState('10mg');
  const [medFrequency, setMedFrequency] = useState('Once daily in morning');
  const [medFrequencyAr, setMedFrequencyAr] = useState('مرة واحدة يومياً صباحاً');
  const [medDuration, setMedDuration] = useState('90 days');
  const [medInstructions, setMedInstructions] = useState('Take in the morning with water.');
  const [medInstructionsAr, setMedInstructionsAr] = useState('يؤخذ صباحاً مع كوب ماء.');
  const [rxSuccessMessage, setRxSuccessMessage] = useState<string | null>(null);
  const [activePrintRx, setActivePrintRx] = useState<Prescription | null>(null);

  // Allergy collision detection
  const selectedDrugObj = inventory.find((i) => i.id === selectedDrugId);
  const hasAllergyConflict = activePatient?.allergies.some((allergy) => {
    if (!selectedDrugObj) return false;
    const lowerAllergy = allergy.toLowerCase();
    const lowerName = (selectedDrugObj.genericName + ' ' + selectedDrugObj.brandName).toLowerCase();
    if (lowerAllergy.includes('penicillin') && (lowerName.includes('amoxicillin') || lowerName.includes('augmentin'))) {
      return true;
    }
    if (lowerAllergy.includes('nsaid') && (lowerName.includes('ibuprofen') || lowerName.includes('aspirin'))) {
      return true;
    }
    if (lowerAllergy.includes('sulfa') && lowerName.includes('sulfa')) {
      return true;
    }
    return false;
  });

  const handleAddMedication = () => {
    if (!selectedDrugObj) return;
    const newMed: PrescribedMedication = {
      drugId: selectedDrugObj.id,
      drugName: `${selectedDrugObj.brandName} (${selectedDrugObj.genericName})`,
      dosage: medDosage || selectedDrugObj.dosage,
      frequency: medFrequency,
      frequencyAr: medFrequencyAr,
      duration: medDuration,
      instructions: medInstructions,
      instructionsAr: medInstructionsAr,
      refillsAllowed: 2,
      refillsRemaining: 2,
    };
    setRxMeds([...rxMeds, newMed]);
  };

  const handleRemoveMed = (index: number) => {
    setRxMeds(rxMeds.filter((_, idx) => idx !== index));
  };

  const handleSignAndSendRx = () => {
    if (!activePatient || !activeDoctor || rxMeds.length === 0) return;

    const code = createPrescription({
      patientId: activePatient.id,
      patientName: activePatient.name,
      doctorId: activeDoctor.id,
      doctorName: activeDoctor.name,
      diagnosis: assessment,
      diagnosisCode: icd10,
      medications: rxMeds,
      status: 'pending_dispense',
      totalCost: rxMeds.reduce((acc, m) => {
        const item = inventory.find((i) => i.id === m.drugId);
        return acc + (item ? item.unitPrice : 30);
      }, 0),
    });

    setRxSuccessMessage(`${t('rxSentSuccess')} (${code})`);
    setTimeout(() => setRxSuccessMessage(null), 5000);
  };

  const handleGenerateAiSoap = async () => {
    if (!activePatient) return;
    setIsGeneratingAi(true);
    try {
      const result = await generateSOAPWithAI({
        patientInfo: `${activePatient.name}, ${activePatient.age}yo ${activePatient.gender}, Blood: ${activePatient.bloodType}`,
        symptoms: subjective,
        vitals: activePatient.vitals,
        existingConditions: activePatient.chronicConditions.join(', '),
        currentMeds: rxMeds.map((m) => m.drugName).join(', '),
      });

      if (result) {
        if (result.subjective) setSubjective(result.subjective);
        if (result.objective) setObjective(result.objective);
        if (result.assessment) setAssessment(result.assessment);
        if (result.icd10) setIcd10(result.icd10);
        if (result.plan) setPlan(result.plan);
      }

      setAiGeneratedToast(true);
      setTimeout(() => setAiGeneratedToast(false), 4000);
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const patientPrescriptions = prescriptions.filter((p) => p.patientId === activePatient?.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header & Patient Queue Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{t('doctorTitle')}</h1>
            <p className="text-xs text-slate-500 font-medium">
              {activeDoctor?.name} • {language === 'ar' ? activeDoctor?.specialtyAr : activeDoctor?.specialty} ({activeDoctor?.room})
            </p>
          </div>
        </div>

        {/* Patient Queue Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            {t('selectPatient')}:
          </span>
          {patients.map((pat, idx) => {
            const isSelected = pat.id === activePatientId;
            const apt = appointments.find((a) => a.patientId === pat.id);
            return (
              <button
                key={pat.id}
                onClick={() => setActivePatientId(pat.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-2xs ${
                  isSelected
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {idx + 1}
                </span>
                <span className="truncate max-w-[110px]">
                  {language === 'ar' && pat.nameAr ? pat.nameAr : pat.name}
                </span>
                {apt && (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      apt.status === 'in_consultation'
                        ? 'bg-emerald-400 animate-ping'
                        : apt.status === 'waiting'
                        ? 'bg-amber-400'
                        : 'bg-slate-300'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Top AI Daily Morning Briefing */}
      <DoctorDailyScheduleBriefing
        onSelectPatientByName={(name) => {
          const matched = patients.find((p) => p.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(p.name.toLowerCase()));
          if (matched) {
            setActivePatientId(matched.id);
            setDoctorMode('consultation');
          }
        }}
      />

      {/* Navigation Sub-tabs: Active Consultation vs Linked Calendar */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setDoctorMode('consultation')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              doctorMode === 'consultation'
                ? 'bg-orange-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Consultation & SOAP Suite</span>
          </button>

          <button
            onClick={() => setDoctorMode('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer ${
              doctorMode === 'calendar'
                ? 'bg-orange-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
            }`}
          >
            <CalendarCheck2 className="w-4 h-4" />
            <span>Linked Doctor Agenda & Calendar</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
              doctorMode === 'calendar' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
            }`}>
              {appointments.filter((a) => a.doctorId === activeDoctor?.id).length}
            </span>
          </button>
        </div>
      </div>

      {doctorMode === 'calendar' ? (
        <DoctorScheduleCalendar
          onSelectPatient={(id) => {
            setActivePatientId(id);
            setDoctorMode('consultation');
          }}
          onLaunchConsultation={(apt) => {
            if (apt.patientId) setActivePatientId(apt.patientId);
            setDoctorMode('consultation');
          }}
        />
      ) : activePatient ? (
        <>
          {/* Patient Banner with Vitals & Allergy Warnings */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-4">
                <img
                  src={activePatient.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
                  alt={activePatient.name}
                  className="w-14 h-14 rounded-xl object-cover border-2 border-slate-100 shadow-2xs"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg font-bold text-slate-900">
                      {language === 'ar' && activePatient.nameAr ? activePatient.nameAr : activePatient.name}
                    </h2>
                    <span className="text-xs font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      ID: {activePatient.nationalId}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                      Blood: {activePatient.bloodType}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mt-1">
                    <span>{activePatient.age} yrs • {activePatient.gender}</span>
                    <span>•</span>
                    <span>{activePatient.phone}</span>
                  </div>
                </div>
              </div>

              {/* Safety & Allergy Alerts */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-slate-500 font-semibold">{t('allergies')}:</span>
                  {activePatient.allergies.length > 0 ? (
                    activePatient.allergies.map((allergy, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200 animate-pulse"
                      >
                        <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
                        {allergy}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 font-semibold">
                      {t('noAllergies')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Vitals Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 text-xs">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-100 text-rose-600">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">{t('bloodPressure')}</div>
                  <div className="text-sm font-bold text-slate-900">{activePatient.vitals?.bloodPressure}</div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-100 text-red-600">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">{t('heartRate')}</div>
                  <div className="text-sm font-bold text-slate-900">{activePatient.vitals?.heartRate} bpm</div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-100 text-sky-600">
                  <Wind className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">{t('oxygenSat')}</div>
                  <div className="text-sm font-bold text-slate-900">{activePatient.vitals?.oxygenSaturation}%</div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                  <Thermometer className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">{t('temp')}</div>
                  <div className="text-sm font-bold text-slate-900">{activePatient.vitals?.temperature}°C</div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-100 text-orange-600">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 font-medium">{t('bmi')}</div>
                  <div className="text-sm font-bold text-slate-900">{activePatient.vitals?.bmi} kg/m²</div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Encounter Workspace: SOAP Notes (Left) + e-Rx & History (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: SOAP Clinical Documentation (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-orange-600" />
                  <h3 className="font-bold text-sm text-slate-900">{t('soapNotes')}</h3>
                </div>
                <button
                  onClick={handleGenerateAiSoap}
                  disabled={isGeneratingAi}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-2xs transition-all disabled:opacity-50"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isGeneratingAi ? t('generatingSoap') : t('generateAiSoap')}</span>
                </button>
              </div>

              {aiGeneratedToast && (
                <div className="p-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-800 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-600 shrink-0" />
                  <span>Gemini Clinical AI synthesized structured SOAP documentation from patient record.</span>
                </div>
              )}

              {/* Subjective */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('subjective')}
                </label>
                <textarea
                  rows={3}
                  value={subjective}
                  onChange={(e) => setSubjective(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:border-orange-600 focus:bg-white transition-colors"
                />
              </div>

              {/* Objective */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('objective')}
                </label>
                <textarea
                  rows={2}
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:border-orange-600 focus:bg-white transition-colors"
                />
              </div>

              {/* Assessment & ICD-10 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('assessment')}
                  </label>
                  <input
                    type="text"
                    value={assessment}
                    onChange={(e) => setAssessment(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-orange-600 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('icd10Label')}
                  </label>
                  <input
                    type="text"
                    value={icd10}
                    onChange={(e) => setIcd10(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-mono font-bold text-orange-700 focus:outline-none focus:border-orange-600 focus:bg-white"
                  />
                </div>
              </div>

              {/* Plan */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('plan')}
                </label>
                <textarea
                  rows={3}
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-800 focus:outline-none focus:border-orange-600 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Right: Electronic Prescription (e-Rx) Builder (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Pill className="w-4 h-4 text-orange-600" />
                    <h3 className="font-bold text-sm text-slate-900">{t('ePrescribe')}</h3>
                  </div>
                  <span className="text-[11px] text-orange-700 font-semibold bg-orange-50 px-2 py-0.5 rounded border border-orange-200">
                    Direct Pharmacy Sync
                  </span>
                </div>

                {rxSuccessMessage && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in-50">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">{rxSuccessMessage}</span>
                  </div>
                )}

                {/* Drug Selector from Inventory */}
                <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      {t('selectDrug')}
                    </label>
                    <select
                      value={selectedDrugId}
                      onChange={(e) => {
                        setSelectedDrugId(e.target.value);
                        const item = inventory.find((i) => i.id === e.target.value);
                        if (item) setMedDosage(item.dosage);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-orange-600"
                    >
                      {inventory.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.brandName} — {item.genericName} ({item.stockCount} in stock)
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Allergy Alert Warning in Real Time */}
                  {hasAllergyConflict && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">{t('allergyWarning')}</span>
                        <span>{t('allergyDetectedMsg')}</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">{t('dosage')}</label>
                      <input
                        type="text"
                        value={medDosage}
                        onChange={(e) => setMedDosage(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">{t('duration')}</label>
                      <input
                        type="text"
                        value={medDuration}
                        onChange={(e) => setMedDuration(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('frequency')}</label>
                    <input
                      type="text"
                      value={language === 'ar' ? medFrequencyAr : medFrequency}
                      onChange={(e) => {
                        if (language === 'ar') setMedFrequencyAr(e.target.value);
                        else setMedFrequency(e.target.value);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">{t('instructions')}</label>
                    <input
                      type="text"
                      value={language === 'ar' ? medInstructionsAr : medInstructions}
                      onChange={(e) => {
                        if (language === 'ar') setMedInstructionsAr(e.target.value);
                        else setMedInstructions(e.target.value);
                      }}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                    />
                  </div>

                  <button
                    onClick={handleAddMedication}
                    className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5 text-orange-600" />
                    <span>{t('addMedication')}</span>
                  </button>
                </div>

                {/* Active Items in Rx */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-500">
                    Prescribed Items ({rxMeds.length}):
                  </span>
                  {rxMeds.map((med, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{med.drugName}</span>
                        <span className="text-slate-500 text-[11px]">
                          {med.dosage} • {language === 'ar' && med.frequencyAr ? med.frequencyAr : med.frequency} ({med.duration})
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveMed(idx)}
                        className="p-1 text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Sign & Transmit to Pharmacy Button */}
                <button
                  onClick={handleSignAndSendRx}
                  disabled={rxMeds.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-2xs transition-all disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{t('signAndSendRx')}</span>
                </button>
              </div>

              {/* Past Prescriptions for this Patient */}
              {patientPrescriptions.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>Recent e-Prescriptions</span>
                    <span className="text-[11px] text-slate-400 font-normal">{patientPrescriptions.length} total</span>
                  </div>
                  {patientPrescriptions.map((rx) => (
                    <div
                      key={rx.id}
                      className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-bold text-orange-700 block">{rx.code}</span>
                        <span className="text-[11px] text-slate-500">{rx.createdAt} • {rx.medications.length} items</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200">
                          {rx.status.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() => setActivePrintRx(rx)}
                          className="p-1 text-slate-400 hover:text-orange-600 transition-colors"
                          title="Print official Rx"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}

      {/* Print Prescription Modal */}
      {activePrintRx && (
        <PrintPrescriptionModal
          prescription={activePrintRx}
          patient={activePatient}
          doctor={activeDoctor}
          onClose={() => setActivePrintRx(null)}
        />
      )}
    </div>
  );
};
