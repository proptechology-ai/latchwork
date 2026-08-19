import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  CheckCircle2,
  Clock,
  Pill,
  CalendarCheck2,
  Package,
  AlertCircle,
  Sparkles,
  ChevronRight,
  Printer,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { PatientNotification, Prescription, Appointment } from '../../types';

interface PatientNotificationCenterProps {
  onViewPrescription?: (rx: Prescription) => void;
  onViewAppointment?: (apt: Appointment) => void;
}

export const PatientNotificationCenter: React.FC<PatientNotificationCenterProps> = ({
  onViewPrescription,
  onViewAppointment,
}) => {
  const {
    patientNotifications,
    activePatient,
    markPatientNotificationRead,
    addPatientNotification,
    prescriptions,
    appointments,
    language,
    t,
  } = useApp();

  const [filterType, setFilterType] = useState<'all' | 'appointment' | 'prescription' | 'pharmacy_pickup' | 'refill'>('all');
  const [simulationToast, setSimulationToast] = useState<string | null>(null);

  // Notifications for current active patient
  const myNotifications = patientNotifications.filter(
    (n) => n.patientId === activePatient?.id || n.patientId === 'all'
  );

  const filtered = myNotifications.filter((n) => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  const unreadCount = myNotifications.filter((n) => !n.read).length;

  const handleSimulateAlert = (type: 'appointment' | 'prescription' | 'pharmacy_pickup' | 'refill') => {
    if (!activePatient) return;

    if (type === 'pharmacy_pickup') {
      addPatientNotification({
        patientId: activePatient.id,
        title: 'Pharmacy Pickup Ready — Box #14',
        titleAr: 'طلب الصيدلية جاهز للاستلام — صندوق 14',
        message: 'Your prescribed Metformin and Lisinopril have been packaged, safety-verified, and placed in Dispensary Box #14 at Counter 2.',
        messageAr: 'تم تجهيز وفحص أدويتك ووضعها في صندوق رقم 14 في شباك الصيدلية رقم 2.',
        type: 'pharmacy_pickup',
        urgency: 'high',
        actionUrl: 'prescriptions',
        actionLabel: 'View Rx & Pickup QR',
      });
      setSimulationToast('Triggered real-time Pharmacy Pickup Alert!');
    } else if (type === 'appointment') {
      addPatientNotification({
        patientId: activePatient.id,
        title: 'Upcoming Appointment in 20 Mins',
        titleAr: 'موعدك القادم بعد 20 دقيقة',
        message: 'Dr. Reem Baban is currently on schedule in Suite 2A. Please approach Reception Desk for check-in.',
        messageAr: 'د. ريم بابطين في الموعد داخل جناح 2A. يرجى التوجه للاستقبال لتسجيل الحضور.',
        type: 'appointment',
        urgency: 'medium',
        actionUrl: 'appointments',
        actionLabel: 'View Room Details',
      });
      setSimulationToast('Triggered real-time Appointment Reminder!');
    } else if (type === 'refill') {
      addPatientNotification({
        patientId: activePatient.id,
        title: 'Refill Approved by Dr. Zaid',
        titleAr: 'تمت الموافقة على إعادة الصرف من د. زيد',
        message: 'Your 30-day refill for Glucophage 500mg was approved and routed to the automated dispensary.',
        messageAr: 'تمت الموافقة على إعادة صرف جلوكوفاج 500 ملغ وتم تحويلها للصيدلية الآلية.',
        type: 'refill',
        urgency: 'low',
        actionUrl: 'prescriptions',
        actionLabel: 'View Active Rx',
      });
      setSimulationToast('Triggered Refill Status Update!');
    }

    setTimeout(() => setSimulationToast(null), 3500);
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'pharmacy_pickup':
        return <Package className="w-4 h-4 text-orange-600" />;
      case 'prescription':
      case 'refill':
        return <Pill className="w-4 h-4 text-blue-600" />;
      case 'appointment':
        return <CalendarCheck2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Quick Trigger Simulation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-100 relative">
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-orange-600 rounded-full border-2 border-white animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Patient Live Notification Feed</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Real-time alerts for appointment timing, dispensary box assignment, and e-prescriptions.
              </p>
            </div>
          </div>

          <div className="text-right rtl:text-left">
            <span className="text-xs font-bold text-slate-700">
              {unreadCount} Unread {unreadCount === 1 ? 'Alert' : 'Alerts'}
            </span>
            <p className="text-[11px] text-slate-400">Latchwork Real-time Telemetry</p>
          </div>
        </div>

        {/* Simulation Buttons */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Simulate Real-time Events:</span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleSimulateAlert('pharmacy_pickup')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-700 border border-slate-200 hover:border-orange-300 font-semibold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
            >
              <Package className="w-3 h-3 text-orange-600" />
              <span>Rx Box #14 Ready Alert</span>
            </button>
            <button
              onClick={() => handleSimulateAlert('appointment')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 font-semibold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
            >
              <CalendarCheck2 className="w-3 h-3 text-blue-600" />
              <span>Doctor In 20m Reminder</span>
            </button>
            <button
              onClick={() => handleSimulateAlert('refill')}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 font-semibold transition-all shadow-2xs cursor-pointer flex items-center gap-1"
            >
              <Pill className="w-3 h-3 text-emerald-600" />
              <span>Refill Approved Notice</span>
            </button>
          </div>
        </div>

        {simulationToast && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-2xs animate-in fade-in-50">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{simulationToast}</span>
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-orange-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            All Notifications ({myNotifications.length})
          </button>
          <button
            onClick={() => setFilterType('pharmacy_pickup')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              filterType === 'pharmacy_pickup'
                ? 'bg-orange-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Pharmacy Pickup
          </button>
          <button
            onClick={() => setFilterType('appointment')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              filterType === 'appointment'
                ? 'bg-orange-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => setFilterType('prescription')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              filterType === 'prescription'
                ? 'bg-orange-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            e-Prescriptions
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700 text-sm">No Notifications in this Category</h4>
            <p className="text-xs text-slate-400 mt-0.5">You are up to date with all clinical and pharmacy events.</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => markPatientNotificationRead(item.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                !item.read
                  ? 'bg-white border-orange-200 shadow-md ring-1 ring-orange-500/10'
                  : 'bg-white/90 border-slate-200 opacity-90 shadow-2xs hover:opacity-100'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div className={`p-2.5 rounded-xl border mt-0.5 shrink-0 ${
                  !item.read ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200'
                }`}>
                  {getNotificationIcon(item.type)}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h4 className={`text-sm font-bold ${!item.read ? 'text-slate-950 font-black' : 'text-slate-800'}`}>
                        {language === 'ar' && item.titleAr ? item.titleAr : item.title}
                      </h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-orange-600 inline-block" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getUrgencyBadge(item.urgency)}`}>
                        {item.urgency}
                      </span>
                      <span className="text-slate-400 font-mono text-[11px] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.timestamp}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {language === 'ar' && item.messageAr ? item.messageAr : item.message}
                  </p>

                  {item.actionLabel && (
                    <div className="pt-2 flex items-center justify-between">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700">
                        <span>{item.actionLabel}</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {item.read ? 'Viewed' : 'Click to acknowledge'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
