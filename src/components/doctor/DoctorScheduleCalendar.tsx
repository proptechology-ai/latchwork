import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Play,
  Phone,
  ChevronRight,
  Filter,
  CalendarCheck2,
  Building2,
  Printer,
  Sparkles,
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '../../types';

interface DoctorScheduleCalendarProps {
  onSelectPatient: (patientId: string) => void;
  onLaunchConsultation: (appointment: Appointment) => void;
}

export const DoctorScheduleCalendar: React.FC<DoctorScheduleCalendarProps> = ({
  onSelectPatient,
  onLaunchConsultation,
}) => {
  const {
    activeDoctor,
    appointments,
    updateAppointmentStatus,
    patients,
    language,
    t,
  } = useApp();

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Appointments linked to this doctor
  const doctorAppointments = appointments.filter((apt) => {
    const isDocMatch = apt.doctorId === activeDoctor?.id || !apt.doctorId;
    const isDateMatch = !selectedDate || apt.date === selectedDate;
    const isStatusMatch = filterStatus === 'all' || apt.status === filterStatus;
    return isDocMatch && isDateMatch && isStatusMatch;
  });

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'in_consultation':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse';
      case 'waiting':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'completed':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'scheduled':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const handleQuickStatusChange = (aptId: string, newStatus: AppointmentStatus) => {
    updateAppointmentStatus(aptId, newStatus);
  };

  return (
    <div className="space-y-5">
      {/* Calendar Header Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
              <CalendarCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {activeDoctor?.name} — {t('doctorCalendarTitle')}
              </h2>
              <p className="text-xs text-slate-500">
                Linked clinical agenda, room scheduling ({activeDoctor?.room}) & live consultation routing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-slate-800 font-semibold focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 text-xs">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              filterStatus === 'all'
                ? 'bg-orange-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            All Appointments ({doctorAppointments.length})
          </button>
          <button
            onClick={() => setFilterStatus('waiting')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              filterStatus === 'waiting'
                ? 'bg-orange-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Waiting in Lobby
          </button>
          <button
            onClick={() => setFilterStatus('in_consultation')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              filterStatus === 'in_consultation'
                ? 'bg-orange-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Consultation
          </button>
          <button
            onClick={() => setFilterStatus('completed')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              filterStatus === 'completed'
                ? 'bg-orange-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      {/* Linked Appointments Schedule Cards */}
      <div className="space-y-3">
        {doctorAppointments.length === 0 ? (
          <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl">
            <CalendarCheck2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="font-bold text-slate-700 text-sm">No Appointments Scheduled for this Filter</h3>
            <p className="text-xs text-slate-400 mt-0.5">Adjust the date or status filters above to view other days.</p>
          </div>
        ) : (
          doctorAppointments.map((apt) => {
            const patientObj = patients.find((p) => p.id === apt.patientId);
            return (
              <div
                key={apt.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs hover:border-orange-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs group"
              >
                {/* Left: Time, Patient Info & Queue */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-orange-50 border border-orange-100 text-orange-700 min-w-[72px]">
                    <Clock className="w-4 h-4 mb-1" />
                    <span className="font-mono font-bold text-xs">{apt.timeSlot}</span>
                    <span className="text-[10px] text-orange-600 font-semibold mt-0.5">#{apt.queueNumber}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900">
                        {language === 'ar' && apt.patientNameAr ? apt.patientNameAr : apt.patientName}
                      </h4>
                      {apt.isWalkIn && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-blue-600 text-white shadow-2xs">
                          Walk-In Admitted
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusBadge(apt.status)}`}>
                        {apt.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-slate-600 text-xs">
                      <span className="font-semibold text-slate-700">Reason:</span> {apt.reason}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium pt-1">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        Room: {apt.room}
                      </span>
                      {patientObj && (
                        <>
                          <span>•</span>
                          <span>Age: {patientObj.age}y</span>
                          <span>•</span>
                          <span>Blood: {patientObj.bloodType}</span>
                          {patientObj.chronicConditions.length > 0 && (
                            <>
                              <span>•</span>
                              <span className="text-amber-700 font-medium">Dx: {patientObj.chronicConditions[0]}</span>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions & Consultation Trigger */}
                <div className="flex items-center gap-2 self-end md:self-center">
                  {apt.status === 'scheduled' && (
                    <button
                      onClick={() => handleQuickStatusChange(apt.id, 'waiting')}
                      className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold transition-all cursor-pointer"
                    >
                      Check-In Lobby
                    </button>
                  )}

                  {apt.status === 'waiting' && (
                    <button
                      onClick={() => {
                        handleQuickStatusChange(apt.id, 'in_consultation');
                        onLaunchConsultation(apt);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>Call to Room</span>
                    </button>
                  )}

                  {apt.status === 'in_consultation' && (
                    <button
                      onClick={() => onLaunchConsultation(apt)}
                      className="px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Open SOAP Suite</span>
                    </button>
                  )}

                  {apt.status === 'completed' && (
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-500 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Finished</span>
                    </span>
                  )}

                  <button
                    onClick={() => {
                      if (apt.patientId) onSelectPatient(apt.patientId);
                    }}
                    className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-all cursor-pointer"
                    title="View Full Patient Record"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
