import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  UserPlus,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Stethoscope,
  ArrowRight,
  Sparkles,
  Phone,
  Trash2,
  UserCheck,
  Filter,
  Flame,
  ShieldAlert,
  Send,
  Volume2,
  CalendarCheck,
} from 'lucide-react';
import { WalkInQueueItem, WalkInUrgency, WalkInStatus } from '../../types';

export const WalkInQueueManager: React.FC = () => {
  const {
    t,
    language,
    walkInQueue,
    addWalkInPatient,
    updateWalkInStatus,
    removeWalkIn,
    convertWalkInToAppointment,
    doctors,
    callQueueTicket,
  } = useApp();

  // Registration modal state
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [age, setAge] = useState<number>(32);
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [chiefComplaintAr, setChiefComplaintAr] = useState('');
  const [urgency, setUrgency] = useState<WalkInUrgency>('priority');
  const [targetDoctorId, setTargetDoctorId] = useState<string>(doctors[0]?.id || 'doc-2');
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState<number>(75);
  const [temp, setTemp] = useState<number>(37.0);
  const [spo2, setSpo2] = useState<number>(99);
  const [notes, setNotes] = useState('');

  // Filtering state
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [filterDoctor, setFilterDoctor] = useState<string>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Admit / Assign Doctor Modal
  const [admitTarget, setAdmitTarget] = useState<WalkInQueueItem | null>(null);
  const [admitDoctorId, setAdmitDoctorId] = useState<string>(doctors[0]?.id || 'doc-1');
  const [admitRoom, setAdmitRoom] = useState<string>(doctors[0]?.room || 'Suite 2A');

  const handleRegisterWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !chiefComplaint) return;

    const doc = doctors.find((d) => d.id === targetDoctorId) || doctors[0];

    const newTicket = addWalkInPatient({
      patientName,
      patientPhone: patientPhone || '+966 50 000 0000',
      age,
      gender,
      chiefComplaint,
      chiefComplaintAr: chiefComplaintAr || chiefComplaint,
      urgency,
      targetDoctorId: doc.id,
      targetDoctorName: doc.name,
      assignedRoom: doc.room,
      estimatedWaitMinutes: urgency === 'emergency' ? 2 : urgency === 'urgent_sameday' ? 10 : 20,
      triageVitals: {
        bp,
        pulse,
        temp,
        spo2,
      },
      notes,
    });

    setShowRegisterModal(false);
    // Reset inputs
    setPatientName('');
    setPatientPhone('');
    setChiefComplaint('');
    setChiefComplaintAr('');
    setNotes('');

    setToastMsg(
      language === 'ar'
        ? `تم إصدار التذكرة #${newTicket.ticketNumber} للمريض ${newTicket.patientName} بنجاح`
        : `Walk-in Ticket #${newTicket.ticketNumber} registered for ${newTicket.patientName}`
    );
    setTimeout(() => setToastMsg(null), 5000);
  };

  const handleConfirmAdmit = () => {
    if (!admitTarget) return;
    convertWalkInToAppointment(admitTarget.id, admitDoctorId, admitRoom);
    setToastMsg(
      language === 'ar'
        ? `تم إدخال المريض ${admitTarget.patientName} بنجاح إلى جدول الطبيب`
        : `Admitted ${admitTarget.patientName} to physician schedule.`
    );
    setAdmitTarget(null);
    setTimeout(() => setToastMsg(null), 5000);
  };

  const filteredQueue = walkInQueue.filter((item) => {
    if (filterUrgency !== 'all' && item.urgency !== filterUrgency) return false;
    if (filterDoctor !== 'all' && item.targetDoctorId !== filterDoctor) return false;
    return true;
  });

  const getUrgencyBadge = (urg: WalkInUrgency) => {
    switch (urg) {
      case 'emergency':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-600 text-white flex items-center gap-1 shadow-2xs">
            <Flame className="w-3 h-3" /> Emergency
          </span>
        );
      case 'urgent_sameday':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-500 text-white flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" /> Urgent Same-Day
          </span>
        );
      case 'priority':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200">
            Priority
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium uppercase bg-slate-100 text-slate-700">
            Routine
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 shadow-2xs animate-in fade-in-50">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{toastMsg}</span>
        </div>
      )}

      {/* Queue Header & Live Metrics */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900">
                {language === 'ar' ? 'نظام إدارة طابور المرضى بدون موعد (Walk-in / Wait-list)' : 'Walk-In & Wait-List Queue Operations Hub'}
              </h2>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? 'تسجيل المرضى الفوري، تصنيف درجة الاستعجال، والربط المباشر مع جدول العيادات اليومي'
                  : 'Manage unscheduled clinic arrivals, rapid triage vitals, and direct schedule injection'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>{language === 'ar' ? 'تسجيل مريض بدون موعد جديد' : '+ Register Walk-In Patient'}</span>
          </button>
        </div>

        {/* Quick Summary Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-semibold block">Total In Waiting Hub</span>
            <span className="text-xl font-bold text-slate-900 font-mono">
              {walkInQueue.filter((w) => w.status === 'waiting' || w.status === 'triaged').length}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-red-50/60 border border-red-200">
            <span className="text-[11px] text-red-600 font-bold block flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> High Priority / Urgent
            </span>
            <span className="text-xl font-bold text-red-700 font-mono">
              {walkInQueue.filter((w) => (w.urgency === 'emergency' || w.urgency === 'urgent_sameday') && w.status !== 'admitted').length}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200">
            <span className="text-[11px] text-blue-700 font-bold block">Admitted to Doctor</span>
            <span className="text-xl font-bold text-blue-800 font-mono">
              {walkInQueue.filter((w) => w.status === 'admitted').length}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <span className="text-[11px] text-emerald-700 font-bold block">Avg Triage Speed</span>
            <span className="text-xl font-bold text-emerald-800 font-mono">4.2 min</span>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs text-xs">
        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="font-semibold text-slate-500 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Urgency:
          </span>
          {['all', 'emergency', 'urgent_sameday', 'priority', 'routine'].map((u) => (
            <button
              key={u}
              onClick={() => setFilterUrgency(u)}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterUrgency === u
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {u === 'all' ? 'All Urgencies' : u.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-500">Physician:</span>
          <select
            value={filterDoctor}
            onChange={(e) => setFilterDoctor(e.target.value)}
            className="p-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-xs font-semibold focus:outline-none focus:border-blue-600"
          >
            <option value="all">All Doctors</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.room})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Walk-in Queue Card Grid */}
      <div className="space-y-3">
        {filteredQueue.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-2xs">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">No Walk-In Patients in Current Filter</h3>
            <p className="text-xs text-slate-500 mt-1">
              Click "+ Register Walk-In Patient" above to check in an unscheduled patient.
            </p>
          </div>
        ) : (
          filteredQueue.map((item) => (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all shadow-2xs space-y-3 ${
                item.status === 'admitted'
                  ? 'bg-emerald-50/40 border-emerald-200'
                  : item.urgency === 'emergency'
                  ? 'bg-red-50/40 border-red-300'
                  : 'bg-white border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-xl bg-blue-600 text-white font-mono font-bold text-xs shadow-2xs">
                    {item.ticketNumber}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{item.patientName}</h3>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>{item.gender}, {item.age} yrs</span>
                      <span>•</span>
                      <span>{item.patientPhone}</span>
                      <span>•</span>
                      <span>Arrived: {item.arrivedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {getUrgencyBadge(item.urgency)}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      item.status === 'admitted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.status === 'triaged'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Complaint & Vitals Section */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                {/* Chief Complaint */}
                <div className="md:col-span-7 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Chief Complaint & Triage Notes</span>
                  <p className="font-semibold text-slate-900">
                    {language === 'ar' && item.chiefComplaintAr ? item.chiefComplaintAr : item.chiefComplaint}
                  </p>
                  {item.notes && <p className="text-[11px] text-slate-500 italic">{item.notes}</p>}
                </div>

                {/* Vitals */}
                <div className="md:col-span-5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                    Initial Triage Vitals
                  </span>
                  <div className="grid grid-cols-4 gap-1.5 text-center font-mono">
                    <div className="bg-white p-1 rounded border border-slate-200">
                      <span className="text-[9px] text-slate-400 block">BP</span>
                      <span className="font-bold text-slate-800 text-[11px]">{item.triageVitals?.bp || '--'}</span>
                    </div>
                    <div className="bg-white p-1 rounded border border-slate-200">
                      <span className="text-[9px] text-slate-400 block">Pulse</span>
                      <span className="font-bold text-slate-800 text-[11px]">{item.triageVitals?.pulse || '--'}</span>
                    </div>
                    <div className="bg-white p-1 rounded border border-slate-200">
                      <span className="text-[9px] text-slate-400 block">Temp</span>
                      <span className="font-bold text-slate-800 text-[11px]">{item.triageVitals?.temp || '--'}°</span>
                    </div>
                    <div className="bg-white p-1 rounded border border-slate-200">
                      <span className="text-[9px] text-slate-400 block">SpO2</span>
                      <span className="font-bold text-slate-800 text-[11px]">{item.triageVitals?.spo2 || '--'}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions & Target Doctor */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                  <Stethoscope className="w-3.5 h-3.5 text-blue-600" />
                  <span>Target: <strong className="text-slate-800">{item.targetDoctorName}</strong> ({item.assignedRoom})</span>
                  <span>•</span>
                  <span className="text-amber-700 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Est. wait: ~{item.estimatedWaitMinutes} min
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {item.status !== 'admitted' ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setAdmitTarget(item);
                          setAdmitDoctorId(item.targetDoctorId || doctors[0].id);
                          setAdmitRoom(item.assignedRoom || doctors[0].room);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Admit to Doctor Schedule</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => updateWalkInStatus(item.id, 'triaged')}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                        title="Mark Triaged"
                      >
                        Vitals Verified
                      </button>

                      <button
                        type="button"
                        onClick={() => removeWalkIn(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <span className="text-emerald-700 font-bold text-xs flex items-center gap-1 bg-emerald-100 px-3 py-1 rounded-xl">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Admitted to Live Consultation
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Register Walk-In Patient Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {language === 'ar' ? 'تسجيل مريض جديد بدون موعد مسبق' : 'Register New Walk-In Patient'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'ar' ? 'إصدار تذكرة دور فورية وإجراء الفرز الأولي' : 'Issue instant queue token and perform rapid triage'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRegisterWalkIn} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Sultan Al-Harbi"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Mobile Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+966 50 123 4567"
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(parseInt(e.target.value) || 30)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Urgency Level</label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold"
                  >
                    <option value="routine">Routine</option>
                    <option value="priority">Priority</option>
                    <option value="urgent_sameday">Urgent Same-Day</option>
                    <option value="emergency">🚨 Emergency</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Chief Complaint (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Acute ear pain and fever for 2 days"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Chief Complaint (Arabic)</label>
                <input
                  type="text"
                  placeholder="ألم حاد في الأذن مع حمى منذ يومين"
                  value={chiefComplaintAr}
                  onChange={(e) => setChiefComplaintAr(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>

              {/* Triage Vitals Grid */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-600" /> Triage Vital Signs Check
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">BP (mmHg)</label>
                    <input
                      type="text"
                      value={bp}
                      onChange={(e) => setBp(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg font-mono text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">Pulse (bpm)</label>
                    <input
                      type="number"
                      value={pulse}
                      onChange={(e) => setPulse(parseInt(e.target.value) || 75)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg font-mono text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">Temp (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temp}
                      onChange={(e) => setTemp(parseFloat(e.target.value) || 37.0)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg font-mono text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-semibold">SpO2 (%)</label>
                    <input
                      type="number"
                      value={spo2}
                      onChange={(e) => setSpo2(parseInt(e.target.value) || 99)}
                      className="w-full p-1.5 bg-white border border-slate-200 rounded-lg font-mono text-center font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Assign To Physician</label>
                <select
                  value={targetDoctorId}
                  onChange={(e) => setTargetDoctorId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.specialty} — {d.room})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Generate Queue Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admit to Doctor Modal */}
      {admitTarget && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Stethoscope className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  {language === 'ar' ? 'إدخال المريض لجدول الطبيب' : 'Admit Walk-in Patient to Schedule'}
                </h3>
                <p className="text-xs text-slate-500">
                  Ticket #{admitTarget.ticketNumber} — {admitTarget.patientName}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold text-slate-700">Chief Complaint:</span>
                <p className="text-slate-900">{admitTarget.chiefComplaint}</p>
                <span className="text-amber-700 font-semibold block pt-1">
                  Urgency: {admitTarget.urgency.toUpperCase()}
                </span>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Attending Physician:</label>
                <select
                  value={admitDoctorId}
                  onChange={(e) => {
                    setAdmitDoctorId(e.target.value);
                    const doc = doctors.find((d) => d.id === e.target.value);
                    if (doc) setAdmitRoom(doc.room);
                  }}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.room})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Consultation Room / Suite:</label>
                <input
                  type="text"
                  value={admitRoom}
                  onChange={(e) => setAdmitRoom(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setAdmitTarget(null)}
                className="px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAdmit}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-2xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm & Send to Doctor</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
