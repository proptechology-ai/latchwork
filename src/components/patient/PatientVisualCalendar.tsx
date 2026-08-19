import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  GripVertical,
  User,
  ArrowRight,
  Sparkles,
  MapPin,
  CalendarCheck,
  RotateCcw,
  Check,
  Info,
} from 'lucide-react';
import { Appointment } from '../../types';

interface PatientVisualCalendarProps {
  onBookNew?: () => void;
}

export const PatientVisualCalendar: React.FC<PatientVisualCalendarProps> = ({ onBookNew }) => {
  const {
    t,
    language,
    activePatient,
    appointments,
    doctors,
    rescheduleAppointment,
  } = useApp();

  // Current viewed week state
  const [currentWeekOffset, setCurrentWeekOffset] = useState<number>(0);
  const [draggedAptId, setDraggedAptId] = useState<string | null>(null);
  const [dragOverSlot, setDragOverSlot] = useState<{ date: string; time: string } | null>(null);

  // Reschedule Confirmation Modal State
  const [pendingReschedule, setPendingReschedule] = useState<{
    appointment: Appointment;
    newDate: string;
    newTimeSlot: string;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Standard clinic consultation slots
  const TIME_SLOTS = [
    '09:00 AM',
    '09:45 AM',
    '10:30 AM',
    '11:15 AM',
    '01:30 PM',
    '02:15 PM',
    '03:00 PM',
    '03:45 PM',
    '04:30 PM',
  ];

  // Generate 7 days of the current viewed week
  const weekDays = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    // Align to current week + offset
    const day = startOfWeek.getDay(); // 0 is Sunday
    startOfWeek.setDate(startOfWeek.getDate() - day + currentWeekOffset * 7);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'short' });
      const monthDay = d.toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' });
      const isToday = dateStr === today.toISOString().split('T')[0];
      days.push({
        date: dateStr,
        dayName,
        monthDay,
        isToday,
        dateObj: d,
      });
    }
    return days;
  }, [currentWeekOffset, language]);

  // Patient's active appointments
  const myAppointments = appointments.filter(
    (apt) => apt.patientId === activePatient?.id || apt.patientId === 'pat-1'
  );

  // Map of date+time to appointments
  const appointmentMatrix = useMemo(() => {
    const map = new Map<string, Appointment>();
    myAppointments.forEach((apt) => {
      // Clean timeSlot or extract first part
      const cleanTime = apt.timeSlot.includes('(')
        ? apt.timeSlot.split('(')[0].trim()
        : apt.timeSlot;
      // Default date to today's date if not set
      const dateKey = apt.date || (apt.dateTime ? apt.dateTime.split(' ')[0] : weekDays[1]?.date || '');
      map.set(`${dateKey}___${cleanTime}`, apt);
    });
    return map;
  }, [myAppointments, weekDays]);

  const handleDragStart = (e: React.DragEvent, apt: Appointment) => {
    setDraggedAptId(apt.id);
    e.dataTransfer.setData('text/plain', apt.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, date: string, time: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!dragOverSlot || dragOverSlot.date !== date || dragOverSlot.time !== time) {
      setDragOverSlot({ date, time });
    }
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, date: string, time: string) => {
    e.preventDefault();
    setDragOverSlot(null);
    const aptId = e.dataTransfer.getData('text/plain') || draggedAptId;
    if (!aptId) return;

    const apt = appointments.find((a) => a.id === aptId);
    if (!apt) return;

    // Check if slot is already the same
    const currentAptDate = apt.date || (apt.dateTime ? apt.dateTime.split(' ')[0] : '');
    const currentAptTime = apt.timeSlot.includes('(') ? apt.timeSlot.split('(')[0].trim() : apt.timeSlot;

    if (currentAptDate === date && currentAptTime === time) {
      setDraggedAptId(null);
      return;
    }

    // Open confirmation dialog
    setPendingReschedule({
      appointment: apt,
      newDate: date,
      newTimeSlot: time,
    });
    setDraggedAptId(null);
  };

  const confirmReschedule = () => {
    if (!pendingReschedule) return;
    const { appointment, newDate, newTimeSlot } = pendingReschedule;
    rescheduleAppointment(appointment.id, newDate, newTimeSlot);
    setToastMessage(
      language === 'ar'
        ? `تم تعديل موعدك بنجاح إلى ${newDate} الساعة ${newTimeSlot}`
        : `Appointment rescheduled to ${newDate} at ${newTimeSlot}`
    );
    setPendingReschedule(null);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-sm animate-in fade-in-50">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-semibold">{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Visual Calendar Header & Navigation Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900">
                {language === 'ar' ? 'جدول المواعيد التفاعلي وسحب وإفلات إعادة الجدولة' : 'Interactive Visual Calendar & Drag-and-Drop Rescheduling'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {language === 'ar'
                  ? 'اسحب بطاقة موعدك وأفلتها في أي فترة زمنية متاحة لتعديل موعد الاستشارة فورياً'
                  : 'Drag any appointment card and drop onto an open slot to immediately reschedule with your physician'}
              </p>
            </div>
          </div>

          {/* Week Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentWeekOffset((prev) => prev - 1)}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Previous Week"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentWeekOffset(0)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                currentWeekOffset === 0
                  ? 'bg-orange-600 text-white border-orange-600 shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {language === 'ar' ? 'هذا الأسبوع' : 'Current Week'}
            </button>
            <button
              onClick={() => setCurrentWeekOffset((prev) => prev + 1)}
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Next Week"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Legend / Instruction Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center gap-4 text-[11px] text-slate-600 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-orange-600 inline-block"></span>
              <span>{language === 'ar' ? 'موعدك المؤكد (قابل للسحب)' : 'Your Booked Visit (Draggable)'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-50 border border-emerald-300 inline-block"></span>
              <span>{language === 'ar' ? 'فترة زمنية متاحة' : 'Available Open Slot'}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 inline-block"></span>
              <span>{language === 'ar' ? 'عيادة مغلقة / ممتلئة' : 'Occupied / Break'}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-orange-700 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100 font-semibold">
            <GripVertical className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'يدعم السحب والإفلات بالماوس واللمس' : 'Drag & Drop Enabled'}</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Drag-and-Drop Visual Calendar Grid */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse text-xs">
            {/* Days Header */}
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="py-3.5 px-3 text-left rtl:text-right font-bold text-slate-500 w-24 border-r border-slate-200 bg-slate-100/50">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Time</span>
                  </div>
                </th>
                {weekDays.map((day) => (
                  <th
                    key={day.date}
                    className={`py-3 px-2 text-center border-r last:border-r-0 border-slate-200 ${
                      day.isToday ? 'bg-orange-50/70 text-orange-950 font-bold' : 'text-slate-700'
                    }`}
                  >
                    <div className="font-bold text-xs uppercase tracking-wider">{day.dayName}</div>
                    <div className={`text-[11px] mt-0.5 ${day.isToday ? 'text-orange-700 font-black' : 'text-slate-500 font-medium'}`}>
                      {day.monthDay}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Time Slot Rows with Droppable Cells */}
            <tbody className="divide-y divide-slate-100">
              {TIME_SLOTS.map((time) => (
                <tr key={time} className="hover:bg-slate-50/40 transition-colors">
                  {/* Time label */}
                  <td className="py-3 px-3 font-mono font-bold text-slate-600 text-[11px] border-r border-slate-200 bg-slate-50/50 whitespace-nowrap">
                    {time}
                  </td>

                  {/* Day Cells */}
                  {weekDays.map((day) => {
                    const cellKey = `${day.date}___${time}`;
                    const existingApt = appointmentMatrix.get(cellKey);
                    const isDragOver = dragOverSlot?.date === day.date && dragOverSlot?.time === time;

                    return (
                      <td
                        key={day.date}
                        onDragOver={(e) => handleDragOver(e, day.date, time)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, day.date, time)}
                        className={`p-1.5 border-r last:border-r-0 border-slate-200 transition-all min-h-[64px] align-top ${
                          isDragOver
                            ? 'bg-orange-100 border-2 border-dashed border-orange-500 shadow-inner'
                            : existingApt
                            ? 'bg-orange-50/30'
                            : 'hover:bg-emerald-50/30 cursor-pointer'
                        }`}
                      >
                        {existingApt ? (
                          /* DRAGGABLE APPOINTMENT CARD */
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, existingApt)}
                            className="bg-gradient-to-br from-orange-600 to-orange-700 text-white rounded-xl p-2.5 shadow-sm cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-transform space-y-1 group relative border border-orange-500"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono uppercase bg-white/20 px-1.5 py-0.2 rounded font-bold">
                                Ticket #{existingApt.queueNumber}
                              </span>
                              <GripVertical className="w-3.5 h-3.5 text-white/70 group-hover:text-white" />
                            </div>

                            <div className="font-bold text-[11px] line-clamp-1 leading-tight">
                              {existingApt.doctorName}
                            </div>
                            <div className="text-[10px] text-orange-100 line-clamp-1">
                              {existingApt.room}
                            </div>

                            <div className="pt-1 border-t border-white/20 flex items-center justify-between text-[9px] text-white/80">
                              <span>Drag to move</span>
                              <span className="bg-emerald-500 text-white px-1 rounded text-[8px] font-bold">Confirmed</span>
                            </div>
                          </div>
                        ) : (
                          /* OPEN TIME SLOT DROP TARGET */
                          <div
                            onClick={() => {
                              // Fast reschedule if user has an appointment
                              if (myAppointments.length > 0) {
                                setPendingReschedule({
                                  appointment: myAppointments[0],
                                  newDate: day.date,
                                  newTimeSlot: time,
                                });
                              }
                            }}
                            className={`h-full min-h-[50px] rounded-lg border border-dashed flex flex-col items-center justify-center text-[10px] transition-all p-1 ${
                              isDragOver
                                ? 'border-orange-500 bg-orange-100 text-orange-900 font-bold'
                                : 'border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-slate-400 hover:text-emerald-700'
                            }`}
                          >
                            {isDragOver ? (
                              <span className="text-orange-700 font-bold flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Drop here!
                              </span>
                            ) : (
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                + Available
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* My Scheduled Visits Quick Drag Tray */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
            <User className="w-4 h-4 text-orange-600" />
            <span>{language === 'ar' ? 'مواعيدك المحجوزة الحالية' : 'Your Scheduled Clinic Encounters'}</span>
          </h3>
          <span className="text-xs text-slate-500 font-semibold">{myAppointments.length} Booked</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {myAppointments.map((apt) => (
            <div
              key={apt.id}
              draggable
              onDragStart={(e) => handleDragStart(e, apt)}
              className="p-4 rounded-xl border border-orange-200 bg-orange-50/40 hover:bg-orange-50 shadow-2xs cursor-grab active:cursor-grabbing transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-orange-700 bg-orange-100/70 px-2 py-0.5 rounded">
                    {apt.timeSlot}
                  </span>
                  <h4 className="font-bold text-xs text-slate-900 mt-1">{apt.doctorName}</h4>
                  <p className="text-[11px] text-slate-500">{apt.room}</p>
                </div>
                <div className="p-1 rounded-lg bg-orange-100 text-orange-700">
                  <GripVertical className="w-4 h-4" />
                </div>
              </div>

              <div className="text-[11px] text-slate-600 line-clamp-1 bg-white p-2 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800">Reason: </span>
                {apt.reason}
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px]">
                <span className="text-slate-500 font-mono">Date: {apt.date || 'Today'}</span>
                <span className="text-orange-700 font-bold text-[10px]">⇄ Drag to Calendar</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reschedule Confirmation Modal Dialog */}
      {pendingReschedule && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {language === 'ar' ? 'تأكيد تعديل موعد الاستشارة' : 'Confirm Appointment Reschedule'}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === 'ar'
                    ? 'سيتم تحديث موعدك وإرسال إشعار فوري لجدول الطبيب والصيدلية'
                    : 'Your appointment will be updated and synced directly with the clinic calendar'}
                </p>
              </div>
            </div>

            {/* Old vs New Comparison Box */}
            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Physician & Room</span>
                <div className="font-bold text-slate-900 text-sm">{pendingReschedule.appointment.doctorName}</div>
                <div className="text-slate-500 flex items-center gap-1 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  <span>{pendingReschedule.appointment.room}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-red-50/70 border border-red-200">
                  <span className="text-[10px] font-bold text-red-600 block uppercase">Previous Schedule</span>
                  <div className="font-semibold text-slate-800 mt-1">
                    {pendingReschedule.appointment.date || 'Today'}
                  </div>
                  <div className="font-mono text-red-700 text-xs font-bold">
                    {pendingReschedule.appointment.timeSlot}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] font-bold text-emerald-700 block uppercase">New Schedule</span>
                  <div className="font-semibold text-slate-800 mt-1">
                    {pendingReschedule.newDate}
                  </div>
                  <div className="font-mono text-emerald-700 text-xs font-bold">
                    {pendingReschedule.newTimeSlot}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setPendingReschedule(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={confirmReschedule}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{language === 'ar' ? 'تأكيد وإعادة الجدولة' : 'Confirm Reschedule'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
