import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CalendarCheck2,
  Users,
  Clock,
  DollarSign,
  Plus,
  Search,
  CheckCircle2,
  ChevronRight,
  UserPlus,
  FileText,
  AlertCircle,
  Calendar as CalendarIcon,
  Phone,
  UserCheck,
  Check,
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '../../types';
import { WalkInQueueManager } from './WalkInQueueManager';

export const ReceptionView: React.FC = () => {
  const {
    t,
    language,
    appointments,
    updateAppointmentStatus,
    bookAppointment,
    patients,
    doctors,
    intakeSubmissions,
    walkInQueue,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'walkin' | 'schedule' | 'waiting' | 'intake' | 'billing'>('walkin');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('all');
  const [showBookModal, setShowBookModal] = useState(false);

  // Booking Form State
  const [bookPatientName, setBookPatientName] = useState('Noura Al-Dosari');
  const [bookPatientPhone, setBookPatientPhone] = useState('+966 54 887 6543');
  const [bookDoctorId, setBookDoctorId] = useState(doctors[0]?.id || 'doc-1');
  const [bookDate, setBookDate] = useState(new Date().toISOString().split('T')[0]);
  const [bookTime, setBookTime] = useState('11:00 AM');
  const [bookReason, setBookReason] = useState('Annual health checkup');
  const [bookReasonAr, setBookReasonAr] = useState('فحص دوري شامل');
  const [bookingToast, setBookingToast] = useState<string | null>(null);

  // Filtering
  const filteredAppointments = appointments.filter((apt) => {
    if (selectedDoctorId === 'all') return true;
    return apt.doctorId === selectedDoctorId;
  });

  const waitingPatients = appointments.filter(
    (apt) => apt.status === 'waiting' || apt.status === 'in_consultation'
  );

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const doc = doctors.find((d) => d.id === bookDoctorId);
    if (!doc) return;

    bookAppointment({
      patientId: `pat-${Date.now()}`,
      patientName: bookPatientName,
      patientPhone: bookPatientPhone,
      doctorId: doc.id,
      doctorName: doc.name,
      room: doc.room,
      date: bookDate,
      timeSlot: bookTime,
      status: 'scheduled',
      reason: bookReason,
      reasonAr: bookReasonAr,
    });

    setShowBookModal(false);
    setBookingToast(`Appointment successfully confirmed for ${bookPatientName} with ${doc.name}`);
    setTimeout(() => setBookingToast(null), 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header & Daily Overview Metrics (Professional Polish Style) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <CalendarCheck2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{t('receptionTitle')}</h1>
            <p className="text-xs text-slate-500 font-medium">
              Lobby Triage, Multi-Doctor Scheduling & Digital Intake Submissions
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowBookModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('bookAppointment')}</span>
        </button>
      </div>

      {bookingToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 shadow-sm animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{bookingToast}</span>
        </div>
      )}

      {/* KPI 4-Card Grid matching Professional Polish archetype */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-medium">{t('totalVisitsToday')}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{appointments.length}</p>
          <p className="text-[11px] text-emerald-600 mt-2 font-semibold flex items-center gap-1">
            <span>↑ 14% vs yesterday</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-medium">{t('currentlyWaiting')}</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">{waitingPatients.length}</p>
          <p className="text-[11px] text-amber-600 mt-2 font-semibold">In triage & waiting lobby</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-medium">{t('avgWaitTime')}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">12 min</p>
          <p className="text-[11px] text-slate-500 mt-2">Target &lt; 15 min</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-xs font-medium">{t('dailyRevenue')}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">$3,840</p>
          <p className="text-[11px] text-blue-600 mt-2 font-semibold">Consultations & Dispensary</p>
        </div>
      </div>

      {/* Reception Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('walkin')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'walkin'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{language === 'ar' ? 'طابور بدون موعد (Walk-in)' : 'Walk-In & Wait-List Queue'}</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'walkin' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'
          }`}>
            {walkInQueue.filter((w) => w.status !== 'admitted').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'schedule'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>{t('tabSchedule')}</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'schedule' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {appointments.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('waiting')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'waiting'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t('tabWaitingRoom')}</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'waiting' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {waitingPatients.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('intake')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'intake'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>{t('tabDigitalIntake')}</span>
          {intakeSubmissions.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
              {intakeSubmissions.length} new
            </span>
          )}
        </button>
      </div>

      {/* TAB 0: Walk-In / Wait-List Queue Manager */}
      {activeTab === 'walkin' && <WalkInQueueManager />}

      {/* TAB 1: Doctor Calendar & Booking Schedule */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          {/* Doctor Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter Physician:</span>
            <button
              onClick={() => setSelectedDoctorId('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedDoctorId === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              All Physicians
            </button>
            {doctors.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDoctorId(doc.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedDoctorId === doc.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
                }`}
              >
                {doc.name} ({doc.room})
              </button>
            ))}
          </div>

          {/* Schedule Table */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Time Slot</th>
                    <th className="py-3 px-4">Patient Name</th>
                    <th className="py-3 px-4">Physician & Room</th>
                    <th className="py-3 px-4">Reason for Visit</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-center">Triage Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredAppointments.map((apt) => (
                    <tr key={apt.id} className="hover:bg-slate-50">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">{apt.timeSlot}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        <div>{apt.patientName}</div>
                        <span className="text-[11px] text-slate-400 font-normal">{apt.patientPhone}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-semibold text-slate-800">{apt.doctorName}</span>
                        <span className="text-slate-400 block text-[11px]">{apt.room}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {language === 'ar' && apt.reasonAr ? apt.reasonAr : apt.reason}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            apt.status === 'in_consultation'
                              ? 'bg-blue-100 text-blue-700'
                              : apt.status === 'waiting'
                              ? 'bg-amber-100 text-amber-700'
                              : apt.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {apt.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {apt.status === 'scheduled' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'waiting')}
                            className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 text-xs font-semibold transition-all"
                          >
                            Check In
                          </button>
                        )}
                        {apt.status === 'waiting' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'in_consultation')}
                            className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white border border-emerald-200 text-xs font-semibold transition-all"
                          >
                            Send to Doctor
                          </button>
                        )}
                        {apt.status === 'in_consultation' && (
                          <button
                            onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
                          >
                            Complete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Waiting Room Lobby Queue */}
      {activeTab === 'waiting' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {waitingPatients.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
                <Users className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-900">Lobby Waiting Room Clear</h3>
                <p className="text-xs text-slate-500 mt-1">All arrived patients have been called into consultation.</p>
              </div>
            ) : (
              waitingPatients.map((apt) => (
                <div
                  key={apt.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                          #{apt.queueNumber}
                        </span>
                        <span className="font-mono text-xs font-bold text-slate-900">{apt.timeSlot}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-2">{apt.patientName}</h4>
                      <p className="text-xs text-slate-500">{apt.patientPhone}</p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        apt.status === 'in_consultation'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {apt.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="text-slate-500 font-medium">Assigned Physician:</p>
                    <p className="font-bold text-slate-800">{apt.doctorName} ({apt.room})</p>
                    <p className="text-slate-600 mt-1 italic">
                      "{language === 'ar' && apt.reasonAr ? apt.reasonAr : apt.reason}"
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    {apt.status === 'waiting' && (
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'in_consultation')}
                        className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all"
                      >
                        Call to Room {apt.room}
                      </button>
                    )}
                    {apt.status === 'in_consultation' && (
                      <button
                        onClick={() => updateAppointmentStatus(apt.id, 'completed')}
                        className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
                      >
                        Mark Consultation Finished
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Digital Intake Submissions */}
      {activeTab === 'intake' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Pre-Visit Patient Intake Records</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">{intakeSubmissions.length} submissions</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {intakeSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{sub.patientName}</h4>
                      <p className="text-slate-500 font-mono text-[11px]">ID: {sub.nationalId} • {sub.phone}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {sub.submittedAt}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    <div>
                      <span className="font-semibold text-slate-700">Reason: </span>
                      <span className="text-slate-900">{sub.reasonForVisit}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Symptoms: </span>
                      <span className="text-slate-800">{sub.symptoms.join(', ')}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Allergies: </span>
                      <span className="text-red-700 font-bold">{sub.knownAllergies}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      bookAppointment({
                        patientId: `pat-${Date.now()}`,
                        patientName: sub.patientName,
                        patientPhone: sub.phone,
                        doctorId: doctors[0].id,
                        doctorName: doctors[0].name,
                        room: doctors[0].room,
                        date: new Date().toISOString().split('T')[0],
                        timeSlot: 'Next Available',
                        status: 'waiting',
                        reason: sub.reasonForVisit,
                        reasonAr: sub.reasonForVisit,
                      });
                      setActiveTab('waiting');
                    }}
                    className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-2xs"
                  >
                    Directly Admit to Waiting Queue
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CalendarCheck2 className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-base text-slate-900">{t('bookAppointment')}</h3>
              </div>
              <button
                onClick={() => setShowBookModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient Full Name</label>
                <input
                  type="text"
                  required
                  value={bookPatientName}
                  onChange={(e) => setBookPatientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="text"
                  required
                  value={bookPatientPhone}
                  onChange={(e) => setBookPatientPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Doctor</label>
                  <select
                    value={bookDoctorId}
                    onChange={(e) => setBookDoctorId(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                  >
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.room})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Time Slot</label>
                  <input
                    type="text"
                    value={bookTime}
                    onChange={(e) => setBookTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Visit</label>
                <input
                  type="text"
                  value={bookReason}
                  onChange={(e) => setBookReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-800 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm transition-all text-xs mt-2"
              >
                Confirm & Schedule Slot
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
