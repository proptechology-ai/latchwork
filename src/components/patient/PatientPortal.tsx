import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  User,
  Pill,
  CalendarCheck2,
  FileText,
  MessageSquare,
  Smartphone,
  Laptop,
  CheckCircle2,
  Clock,
  Printer,
  RotateCcw,
  Send,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Plus,
  Sparkles,
  Calendar,
  CreditCard,
  Building2,
  Package,
  ArrowRight,
  Zap,
  Bell,
} from 'lucide-react';
import { Prescription, PrescribedMedication, AITriageResult, BillingInvoice } from '../../types';
import { PrintPrescriptionModal } from '../common/PrintPrescriptionModal';
import { PrintInvoiceModal } from '../common/PrintInvoiceModal';
import { PatientNotificationCenter } from './PatientNotificationCenter';
import { PatientVisualCalendar } from './PatientVisualCalendar';

export const PatientPortal: React.FC = () => {
  const {
    t,
    language,
    patients,
    activePatientId,
    setActivePatientId,
    activePatient,
    prescriptions,
    appointments,
    doctors,
    requestRefill,
    submitIntake,
    bookAppointment,
    mobilePreview,
    setMobilePreview,
    triagePatientWithAI,
    ecommerceProducts,
    addToEcomCart,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'prescriptions' | 'notifications' | 'booking' | 'appointments' | 'store' | 'intake' | 'chat'>('appointments');
  const [appointmentViewMode, setAppointmentViewMode] = useState<'calendar' | 'cards'>('calendar');
  const [refillToast, setRefillToast] = useState<string | null>(null);
  const [activePrintRx, setActivePrintRx] = useState<Prescription | null>(null);
  const [activePrintInvoice, setActivePrintInvoice] = useState<BillingInvoice | null>(null);
  const { patientNotifications } = useApp();
  const unreadPatientAlerts = patientNotifications.filter(
    (n) => (n.patientId === activePatient?.id || n.patientId === 'all') && !n.read
  ).length;

  const handlePrintAppointmentInvoice = (apt: any) => {
    const inv: BillingInvoice = {
      id: `inv-apt-${apt.id}`,
      invoiceNumber: `INV-APT-${apt.id.toUpperCase().slice(-6)}`,
      patientId: apt.patientId || activePatient?.id || 'PAT-001',
      patientName: apt.patientName || activePatient?.name || 'Patient',
      patientPhone: apt.patientPhone || activePatient?.phone || '+966 50 123 4567',
      doctorId: apt.doctorId,
      doctorName: apt.doctorName,
      department: 'clinic',
      date: apt.date || new Date().toISOString().split('T')[0],
      items: [
        {
          id: 'item-1',
          description: `Clinical Consultation — ${apt.doctorName} (${apt.room})`,
          code: 'MED-CONS-01',
          quantity: 1,
          unitPrice: apt.fee || 120.0,
          total: apt.fee || 120.0,
        },
      ],
      subtotal: apt.fee || 120.0,
      taxAmount: (apt.fee || 120.0) * 0.05,
      discount: 0,
      totalAmount: (apt.fee || 120.0) * 1.05,
      paymentMethod: 'Credit Card / Health Card',
      paymentStatus: apt.paymentStatus === 'paid' ? 'paid' : 'pending',
      notes: `Consultation appointment at Latchwork Plaza. Queue Ticket #${apt.queueNumber || 'A-101'}.`,
    };
    setActivePrintInvoice(inv);
  };

  // Live Availability Booking State
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(doctors[0]?.id || 'doc-1');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<string>('10:15 AM');
  const [bookingReason, setBookingReason] = useState<string>('Routine checkup and blood pressure review');
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  // AI Triage State
  const [symptomInput, setSymptomInput] = useState<string>('Persistent migraine with light sensitivity and mild nausea for 2 days');
  const [symptomDuration, setSymptomDuration] = useState<string>('2 days');
  const [isTriaging, setIsTriaging] = useState<boolean>(false);
  const [triageResult, setTriageResult] = useState<AITriageResult | null>(null);

  // Digital Intake Form State
  const [intakeReason, setIntakeReason] = useState('Throbbing headache and dizziness for 3 days');
  const [intakeSymptoms, setIntakeSymptoms] = useState('Headache, Light sensitivity, Fatigue');
  const [intakeMeds, setIntakeMeds] = useState('Paracetamol 500mg');
  const [intakeAllergies, setIntakeAllergies] = useState(activePatient?.allergies.join(', ') || 'None');
  const [intakeSuccess, setIntakeSuccess] = useState(false);

  // Chat state
  const [messages, setMessages] = useState<{ sender: 'patient' | 'clinic'; text: string; time: string }[]>([
    {
      sender: 'clinic',
      text: 'Hello Sarah! Your prescription for Metformin and Lisinopril has been received by our attached dispensary.',
      time: '09:45 AM',
    },
    {
      sender: 'patient',
      text: 'Thank you! Is it ready for pickup or can I collect it after my consultation?',
      time: '09:47 AM',
    },
    {
      sender: 'clinic',
      text: 'It is being prepared now in Box #14. You can collect it at Counter 2 right after your visit.',
      time: '09:48 AM',
    },
  ]);
  const [newChatText, setNewChatText] = useState('');

  // Selected doctor
  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId) || doctors[0];

  // Available Time Slots for Selected Doctor
  const availableTimeSlots = [
    { time: '09:00 AM', period: 'Morning', status: 'available' },
    { time: '09:45 AM', period: 'Morning', status: 'booked' },
    { time: '10:30 AM', period: 'Morning', status: 'available' },
    { time: '11:15 AM', period: 'Morning', status: 'available' },
    { time: '01:30 PM', period: 'Afternoon', status: 'available' },
    { time: '02:15 PM', period: 'Afternoon', status: 'booked' },
    { time: '03:00 PM', period: 'Afternoon', status: 'available' },
    { time: '04:30 PM', period: 'Evening', status: 'available' },
    { time: '05:15 PM', period: 'Evening', status: 'available' },
  ];

  // Patient's specific data
  const myPrescriptions = prescriptions.filter((p) => p.patientId === activePatient?.id);
  const myAppointments = appointments.filter((a) => a.patientId === activePatient?.id);

  const handleRequestRefill = (rxId: string, medName: string) => {
    requestRefill(rxId, medName, 'Patient submitted 30-day refill request via mobile portal.');
    setRefillToast(`Refill request for ${medName} transmitted directly to Clinic Dispensary.`);
    setTimeout(() => setRefillToast(null), 4000);
  };

  const handleRunAITriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomInput.trim()) return;
    setIsTriaging(true);
    try {
      const res = await triagePatientWithAI({
        symptoms: symptomInput,
        duration: symptomDuration,
        age: activePatient?.age || 35,
        gender: activePatient?.gender || 'female',
      });
      setTriageResult(res);

      // Auto match doctor if cardiology/internal
      if (res.recommendedSpecialty.toLowerCase().includes('cardio') || res.recommendedSpecialty.toLowerCase().includes('internal')) {
        setSelectedDoctorId('doc-2');
      } else if (res.recommendedSpecialty.toLowerCase().includes('endo') || res.recommendedSpecialty.toLowerCase().includes('metabolic')) {
        setSelectedDoctorId('doc-3');
      } else {
        setSelectedDoctorId('doc-1');
      }
    } finally {
      setIsTriaging(false);
    }
  };

  const handleConfirmLiveBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient || !selectedDoctor) return;

    bookAppointment({
      patientId: activePatient.id,
      patientName: activePatient.name,
      patientNameAr: activePatient.nameAr,
      patientPhone: activePatient.phone,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      doctorNameAr: selectedDoctor.nameAr,
      timeSlot: `${selectedDate} at ${selectedSlot}`,
      date: selectedDate,
      status: 'scheduled',
      reason: bookingReason,
      reasonAr: bookingReason,
      room: selectedDoctor.room,
      fee: selectedDoctor.consultationFee || 120.0,
      paymentStatus: 'paid',
    });

    setBookingSuccessMsg(`Appointment booked with ${selectedDoctor.name} for ${selectedDate} at ${selectedSlot}!`);
    setTimeout(() => setBookingSuccessMsg(null), 5000);
  };

  const handleIntakeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePatient) return;

    submitIntake({
      patientName: activePatient.name,
      phone: activePatient.phone,
      nationalId: activePatient.nationalId,
      dob: '1988-06-14',
      gender: activePatient.gender,
      reasonForVisit: intakeReason,
      symptoms: intakeSymptoms.split(',').map((s) => s.trim()),
      currentMedications: intakeMeds,
      knownAllergies: intakeAllergies,
      emergencyContact: 'Family Member (+966 50 999 8877)',
    });

    setIntakeSuccess(true);
    setTimeout(() => setIntakeSuccess(false), 5000);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;

    const newMsg = {
      sender: 'patient' as const,
      text: newChatText,
      time: 'Just now',
    };

    setMessages([...messages, newMsg]);
    setNewChatText('');

    // Simulated auto-reply from clinic
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'clinic',
          text: 'Thank you for your message. The dispensary and triage team have received your inquiry.',
          time: 'Just now',
        },
      ]);
    }, 1200);
  };

  const portalContent = (
    <div className="space-y-6">
      {/* Patient Header & Quick Switcher */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={activePatient?.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150'}
              alt={activePatient?.name}
              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-2xs"
            />
            <div>
              <span className="text-xs text-orange-600 font-semibold">{t('portalGreeting')}</span>
              <h2 className="text-base font-bold text-slate-900">
                {language === 'ar' && activePatient?.nameAr ? activePatient.nameAr : activePatient?.name}
              </h2>
              <p className="text-xs text-slate-500">
                MRN: <span className="font-mono text-slate-700 font-medium">{activePatient?.nationalId}</span> • Blood: {activePatient?.bloodType}
              </p>
            </div>
          </div>

          {/* Switch patient demo & notification shortcut */}
          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-semibold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
              title="Live Notifications"
            >
              <Bell className="w-4 h-4 text-orange-600" />
              <span className="hidden sm:inline font-bold">Alerts</span>
              {unreadPatientAlerts > 0 && (
                <span className="w-5 h-5 rounded-full bg-orange-600 text-white text-[10px] font-mono font-bold flex items-center justify-center">
                  {unreadPatientAlerts}
                </span>
              )}
            </button>

            <span className="text-slate-500 font-medium whitespace-nowrap hidden sm:inline">Switch Profile:</span>
            {patients.map((pat) => (
              <button
                key={pat.id}
                onClick={() => setActivePatientId(pat.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all shadow-2xs cursor-pointer ${
                  pat.id === activePatientId
                    ? 'bg-orange-600 text-white shadow-2xs'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {pat.name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {refillToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-2xs animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{refillToast}</span>
        </div>
      )}

      {bookingSuccessMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-2xs animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{bookingSuccessMsg}</span>
        </div>
      )}

      {/* Patient Sub-navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('prescriptions')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'prescriptions'
              ? 'bg-orange-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Pill className="w-4 h-4" />
          <span>{t('myActivePrescriptions')}</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'prescriptions' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {myPrescriptions.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'notifications'
              ? 'bg-orange-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Bell className="w-4 h-4 text-amber-300" />
          <span>Live Notifications</span>
          {unreadPatientAlerts > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-orange-600 text-white text-[10px] font-black animate-pulse">
              {unreadPatientAlerts}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('booking')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'booking'
              ? 'bg-orange-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4 text-amber-300" />
          <span>{t('quickBookOnline')}</span>
        </button>

        <button
          onClick={() => setActiveTab('appointments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'appointments'
              ? 'bg-orange-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <CalendarCheck2 className="w-4 h-4" />
          <span>{t('myUpcomingVisits')}</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'appointments' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {myAppointments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('store')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'store'
              ? 'bg-orange-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{t('ecomTitle')}</span>
        </button>

        <button
          onClick={() => setActiveTab('intake')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'intake'
              ? 'bg-orange-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t('preVisitIntake')}</span>
        </button>

        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
            activeTab === 'chat'
              ? 'bg-orange-600 text-white shadow-2xs'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>{t('chatWithClinic')}</span>
        </button>
      </div>

      {/* TAB 1: Prescriptions & Meds */}
      {activeTab === 'prescriptions' && (
        <div className="space-y-4">
          {myPrescriptions.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-xl shadow-2xs text-xs">
              <Pill className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="font-bold text-slate-900 text-sm">No Active Prescriptions</p>
              <p className="text-slate-500 mt-1">Prescriptions issued by your doctor will appear here automatically.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myPrescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 text-xs"
                >
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="font-mono font-bold text-orange-700">{rx.code}</span>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Prescribed by: <span className="text-slate-900 font-medium">{rx.doctorName}</span> • {rx.createdAt}
                      </p>
                    </div>
                    <button
                      onClick={() => setActivePrintRx(rx)}
                      className="p-1.5 text-slate-400 hover:text-orange-600 rounded-lg hover:bg-slate-50 transition-colors"
                      title="Download Official Rx"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Medications list */}
                  <div className="space-y-3">
                    {rx.medications.map((med, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">{med.drugName}</span>
                            <span className="text-orange-700 text-xs font-semibold">
                              {language === 'ar' && med.frequencyAr ? med.frequencyAr : med.frequency}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-white text-slate-700 border border-slate-200">
                            {med.refillsRemaining} refills left
                          </span>
                        </div>

                        <p className="text-slate-700 text-[11px] italic bg-white p-2.5 rounded-lg border border-slate-200">
                          📌 {language === 'ar' && med.instructionsAr ? med.instructionsAr : med.instructions}
                        </p>

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-slate-500 text-[11px] font-medium">Duration: {med.duration}</span>
                          <button
                            onClick={() => handleRequestRefill(rx.id, med.drugName)}
                            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px] shadow-2xs transition-colors"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>{t('requestRefillBtn')}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <span className="text-slate-500 text-[11px] font-medium">Pharmacy Status:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        rx.status === 'ready_for_pickup'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : rx.status === 'dispensed'
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {rx.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Live Doctor Availability Booking & AI Triage */}
      {activeTab === 'booking' && (
        <div className="space-y-6">
          {/* Gemini AI Symptom Triage Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 text-white rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-orange-200">{t('aiTriageMatcher')}</h3>
                  <p className="text-xs text-slate-300">{t('aiTriageDesc')}</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-orange-600/30 border border-orange-400/40 text-orange-300 text-[10px] font-mono font-semibold">
                Gemini 3.7 Flash
              </span>
            </div>

            <form onSubmit={handleRunAITriage} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                <div className="sm:col-span-3">
                  <input
                    type="text"
                    required
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    placeholder="Describe symptoms in plain words..."
                    className="w-full p-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    value={symptomDuration}
                    onChange={(e) => setSymptomDuration(e.target.value)}
                    placeholder="Duration (e.g. 2 days)"
                    className="w-full p-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isTriaging}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white font-bold text-xs shadow transition-colors flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>{isTriaging ? t('analyzingSymptoms') : t('evaluateSymptoms')}</span>
                </button>
              </div>
            </form>

            {triageResult && (
              <div className="p-4 rounded-xl bg-slate-800/90 border border-orange-500/40 space-y-2 text-xs animate-in fade-in-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-orange-300">Recommended Specialty:</span>
                    <span className="px-2 py-0.5 rounded bg-orange-500/20 text-orange-200 font-semibold">{triageResult.recommendedSpecialty}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold uppercase text-[10px]">
                    Triage: {triageResult.urgency}
                  </span>
                </div>
                <p className="text-slate-200 leading-relaxed">{triageResult.triageSummary}</p>
                <div className="text-[11px] text-slate-300 border-t border-slate-700/60 pt-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{triageResult.preVisitInstructions}</span>
                </div>
              </div>
            )}
          </div>

          {/* Booking Form with Live Availability Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Physician Selector & Details (Col 5) */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 text-xs">
              <h3 className="font-bold text-sm text-slate-900">{t('selectDoctor')}</h3>

              <div className="space-y-2.5">
                {doctors.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoctorId(doc.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      doc.id === selectedDoctorId
                        ? 'border-orange-600 bg-orange-50/60 shadow-2xs'
                        : 'border-slate-200 bg-slate-50/50 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img src={doc.avatarUrl} alt={doc.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                      <div>
                        <h4 className="font-bold text-slate-900">{language === 'ar' && doc.nameAr ? doc.nameAr : doc.name}</h4>
                        <p className="text-slate-500 text-[11px]">{doc.specialty}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-black text-slate-900 font-mono block">${doc.consultationFee}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">{doc.availability}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-700">Selected Physician Info</span>
                <p className="text-[11px] text-slate-500">{selectedDoctor.bio}</p>
                <div className="text-[11px] text-orange-700 font-semibold pt-1">
                  Location: {selectedDoctor.room}
                </div>
              </div>
            </div>

            {/* Availability Slots Matrix & Confirmation (Col 7) */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 text-xs flex flex-col justify-between">
              <form onSubmit={handleConfirmLiveBooking} className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span>{t('availableSlots')}</span>
                  </h3>
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-semibold text-xs focus:outline-none focus:border-orange-600"
                  />
                </div>

                {/* Slots Grid */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 block">Select Preferred Time:</span>
                  <div className="grid grid-cols-3 gap-2">
                    {availableTimeSlots.map((slot, idx) => {
                      const isBooked = slot.status === 'booked';
                      const isSelected = selectedSlot === slot.time;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={isBooked}
                          onClick={() => setSelectedSlot(slot.time)}
                          className={`p-2.5 rounded-xl border font-mono text-xs font-bold transition-all ${
                            isBooked
                              ? 'bg-slate-100 border-slate-200 text-slate-400 line-through cursor-not-allowed'
                              : isSelected
                              ? 'bg-orange-600 border-orange-600 text-white shadow-2xs'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-white hover:border-orange-400'
                          }`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">{t('reasonForVisit')}</label>
                  <input
                    type="text"
                    required
                    value={bookingReason}
                    onChange={(e) => setBookingReason(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs focus:outline-none focus:border-orange-600 focus:bg-white"
                  />
                </div>

                {/* Fee & Confirmation box */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-600">Consultation Fee:</span>
                    <span className="font-mono text-slate-900 font-black text-sm">${selectedDoctor.consultationFee?.toFixed(2)}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Includes complete physical evaluation, digital SOAP notes, and electronic e-Rx dispatch to pharmacy.</p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Confirm Live Appointment & Generate Ticket</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Real-Time Notifications Feed */}
      {activeTab === 'notifications' && (
        <PatientNotificationCenter onViewPrescription={(rx) => setActivePrintRx(rx)} />
      )}

      {/* TAB 3: Upcoming Appointments & Drag-and-Drop Visual Calendar */}
      {activeTab === 'appointments' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
                <CalendarCheck2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {language === 'ar' ? 'إدارة المواعيد وإعادة الجدولة التفاعلية' : 'Encounter Hub & Visual Rescheduling'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'ar'
                    ? 'شاهد مواعيدك القادمة أو اسحب بطاقة الموعد لتغيير التاريخ والوقت فورياً'
                    : 'View scheduled appointments or drag and drop onto open slots to reschedule instantly'}
                </p>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setAppointmentViewMode('calendar')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  appointmentViewMode === 'calendar'
                    ? 'bg-white text-orange-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'تقويم السحب والإفلات' : 'Visual Calendar (Drag & Drop)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setAppointmentViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  appointmentViewMode === 'cards'
                    ? 'bg-white text-orange-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>{language === 'ar' ? 'قائمة البطاقات' : 'Card View'}</span>
              </button>
            </div>
          </div>

          {appointmentViewMode === 'calendar' ? (
            <PatientVisualCalendar onBookNew={() => setActiveTab('booking')} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 text-xs"
                >
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="font-mono font-bold text-orange-700">{apt.timeSlot}</span>
                      <h3 className="font-bold text-slate-900 text-base mt-0.5">{apt.doctorName}</h3>
                      <p className="text-slate-500 text-[11px]">{apt.room}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePrintAppointmentInvoice(apt)}
                        className="p-1.5 text-slate-400 hover:text-orange-600 rounded-lg hover:bg-orange-50 transition-colors cursor-pointer"
                        title="Print Tax Receipt & Invoice"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                        {apt.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-500 font-semibold">Reason for Visit:</span>
                    <p className="text-slate-800">
                      {language === 'ar' && apt.reasonAr ? apt.reasonAr : apt.reason}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-600" />
                      <div>
                        <span className="font-semibold text-slate-900 block">Queue Ticket</span>
                        <span className="text-[11px] text-slate-500">Position #{apt.queueNumber}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                        Confirmed
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Pharmacy E-Commerce Store */}
      {activeTab === 'store' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <h3 className="font-bold text-sm text-slate-900">Direct Pharmacy Storefront</h3>
            <p className="text-xs text-slate-500">Order your OTC medications and health essentials directly from Latchwork Dispensary.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ecommerceProducts.map((p) => (
              <div key={p.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex flex-col justify-between hover:border-orange-400 transition-all">
                <div className="h-32 bg-slate-100 overflow-hidden relative">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="p-4 space-y-2">
                  <span className="text-[10px] font-semibold text-slate-500 uppercase">{p.category}</span>
                  <h4 className="font-bold text-xs text-slate-900">{language === 'ar' ? p.nameAr : p.name}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{p.description}</p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-base font-black text-slate-900 font-mono">${p.price.toFixed(2)}</span>
                    <button
                      onClick={() => addToEcomCart(p)}
                      className="px-3 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: Pre-Visit Digital Intake */}
      {activeTab === 'intake' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4 text-xs">
          <div>
            <h3 className="font-bold text-base text-slate-900">{t('preVisitIntake')}</h3>
            <p className="text-slate-500 mt-1 leading-relaxed">{t('fillIntakeDesc')}</p>
          </div>

          {intakeSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 animate-in fade-in-50">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">Intake successfully submitted! Clinic reception and triage have received your form.</span>
            </div>
          )}

          <form onSubmit={handleIntakeSubmit} className="space-y-3.5">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('reasonForVisit')}</label>
              <textarea
                rows={2}
                required
                value={intakeReason}
                onChange={(e) => setIntakeReason(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-orange-600 focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Symptoms</label>
                <input
                  type="text"
                  value={intakeSymptoms}
                  onChange={(e) => setIntakeSymptoms(e.target.value)}
                  placeholder="e.g. Headache, Cough, Fever"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-orange-600 focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Medications</label>
                <input
                  type="text"
                  value={intakeMeds}
                  onChange={(e) => setIntakeMeds(e.target.value)}
                  placeholder="e.g. Metformin 500mg"
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-orange-600 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t('allergies')}</label>
              <input
                type="text"
                value={intakeAllergies}
                onChange={(e) => setIntakeAllergies(e.target.value)}
                placeholder="e.g. Penicillin, Sulfa, None"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-orange-600 focus:bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-2xs transition-all text-xs"
            >
              {t('startIntakeBtn')}
            </button>
          </form>
        </div>
      )}

      {/* TAB 6: Live Chat with Clinic */}
      {activeTab === 'chat' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 text-xs flex flex-col h-[480px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h4 className="font-bold text-slate-900">Clinic Care Team & Triage</h4>
                <p className="text-[11px] text-slate-500">Direct channel with reception and dispensary</p>
              </div>
            </div>
            <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Live Encrypted
            </span>
          </div>

          {/* Messages scroll area */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {messages.map((m, idx) => {
              const isPatient = m.sender === 'patient';
              return (
                <div
                  key={idx}
                  className={`flex flex-col ${isPatient ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                      isPatient
                        ? 'bg-orange-600 text-white rounded-br-none shadow-2xs'
                        : 'bg-slate-100 text-slate-800 rounded-bl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
                </div>
              );
            })}
          </div>

          {/* Input */}
          <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="text"
              value={newChatText}
              onChange={(e) => setNewChatText(e.target.value)}
              placeholder={t('chatPlaceholder')}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-orange-600 focus:bg-white"
            />
            <button
              type="submit"
              className="p-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold transition-colors shadow-2xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Print Prescription Modal */}
      {activePrintRx && (
        <PrintPrescriptionModal
          prescription={activePrintRx}
          patient={activePatient}
          doctor={doctors.find((d) => d.id === activePrintRx.doctorId)}
          onClose={() => setActivePrintRx(null)}
        />
      )}

      {/* Print Invoice Modal */}
      {activePrintInvoice && (
        <PrintInvoiceModal
          invoice={activePrintInvoice}
          onClose={() => setActivePrintInvoice(null)}
        />
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Viewport Framing Controller (Desktop vs Mobile Preview) */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-2xs">
        <div className="flex items-center gap-2 text-xs">
          <Smartphone className="w-4 h-4 text-orange-600" />
          <span className="font-bold text-slate-900">{t('patientPortalTitle')}</span>
          <span className="text-slate-400 hidden sm:inline">• Patient Self-Service, e-Prescriptions & Refills</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobilePreview(!mobilePreview)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mobilePreview
                ? 'bg-orange-600 text-white shadow-2xs'
                : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {mobilePreview ? <Laptop className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span>{mobilePreview ? 'Desktop View' : t('mobileSimulatorToggle')}</span>
          </button>
        </div>
      </div>

      {mobilePreview ? (
        <div className="flex justify-center py-4">
          <div className="w-[390px] min-h-[760px] bg-slate-900 border-[10px] border-slate-800 rounded-[48px] shadow-2xl p-4 overflow-hidden relative flex flex-col">
            {/* Phone Notch */}
            <div className="w-32 h-5 bg-slate-800 rounded-b-2xl mx-auto mb-3 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-900" />
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 bg-[#F8FAFC] p-3 rounded-2xl">
              {portalContent}
            </div>
            {/* Phone Home Bar */}
            <div className="w-28 h-1 bg-slate-600 rounded-full mx-auto mt-3" />
          </div>
        </div>
      ) : (
        portalContent
      )}
    </div>
  );
};
