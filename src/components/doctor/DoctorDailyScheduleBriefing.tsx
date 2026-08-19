import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  RefreshCw,
  Volume2,
  ChevronRight,
  User,
  ShieldAlert,
  Zap,
  Bookmark,
} from 'lucide-react';
import { DoctorAIBriefing } from '../../types';

interface DoctorDailyScheduleBriefingProps {
  onSelectPatientByName?: (patientName: string) => void;
}

export const DoctorDailyScheduleBriefing: React.FC<DoctorDailyScheduleBriefingProps> = ({
  onSelectPatientByName,
}) => {
  const { activeDoctor, getDoctorAIBriefing, language, t } = useApp();
  const [briefing, setBriefing] = useState<DoctorAIBriefing | null>(null);
  const [loading, setLoading] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const fetchBriefing = async () => {
    setLoading(true);
    try {
      const data = await getDoctorAIBriefing(activeDoctor?.id);
      setBriefing(data);
    } catch (err) {
      console.error('Failed to load AI briefing', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefing();
  }, [activeDoctor?.id]);

  const handlePlayVoice = () => {
    if (!briefing) return;
    setIsPlayingAudio(true);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const textToRead = `${briefing.greeting}. ${briefing.timelineOverview}. Top reminder: ${briefing.clinicalReminders[0] || ''}`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setIsPlayingAudio(false), 3000);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 text-white rounded-2xl p-5 shadow-sm space-y-4 border border-slate-700/50">
      {/* Header with AI Badge, Doctor Greeting & Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/60 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-orange-200">
                {t('aiDoctorBriefingTitle')}
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-orange-600/30 border border-orange-400/40 text-orange-300 text-[10px] font-mono font-semibold">
                Gemini 3.7 Pro
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Daily schedule intelligence, high-priority case alerts & prep recommendations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePlayVoice}
            disabled={!briefing || isPlayingAudio}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
              isPlayingAudio
                ? 'bg-orange-600 border-orange-500 text-white animate-pulse'
                : 'bg-slate-800/80 border-slate-600 hover:bg-slate-700 text-slate-200'
            }`}
            title="Listen to Audio Morning Briefing"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>{isPlayingAudio ? 'Speaking...' : 'Listen Briefing'}</span>
          </button>

          <button
            onClick={fetchBriefing}
            disabled={loading}
            className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-600 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer"
            title="Refresh AI Schedule Analysis"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Briefing Body */}
      {loading ? (
        <div className="py-6 flex items-center justify-center gap-3 text-xs text-slate-400">
          <RefreshCw className="w-4 h-4 animate-spin text-orange-400" />
          <span>Synthesizing today's appointments and clinical flags with Gemini AI...</span>
        </div>
      ) : briefing ? (
        <div className="space-y-4 text-xs">
          {/* Greeting & Timeline Overview */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-1.5">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-400" />
              <span>{briefing.greeting}</span>
            </h3>
            <p className="text-slate-300 leading-relaxed text-xs">
              {briefing.timelineOverview}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
            {/* High Priority Patients */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2.5">
              <span className="font-bold text-orange-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Priority Patients & Clinical Warnings:</span>
              </span>

              <div className="space-y-2">
                {briefing.highPriorityPatients.map((p, idx) => (
                  <div
                    key={idx}
                    onClick={() => onSelectPatientByName && onSelectPatientByName(p.name)}
                    className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-orange-500/50 transition-all cursor-pointer group flex items-start justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-100 group-hover:text-orange-300">{p.name}</span>
                        <span className="font-mono text-[10px] text-orange-400 bg-orange-950/80 px-1.5 py-0.5 rounded border border-orange-800">
                          {p.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-200 mt-0.5 font-medium">⚠️ {p.flag}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 italic">Prep: {p.prepRecommendation}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all mt-1" />
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Schedule Reminders & Operational Tips */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 space-y-2.5 flex flex-col justify-between">
              <div>
                <span className="font-bold text-orange-300 flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 text-orange-400" />
                  <span>Clinical Schedule Reminders:</span>
                </span>
                <ul className="mt-2 space-y-1.5 text-slate-300">
                  {briefing.clinicalReminders.map((rem, i) => (
                    <li key={i} className="flex items-start gap-2 text-[11px]">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                      <span>{rem}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Efficiency Tip & Pending Rx */}
              <div className="pt-2 border-t border-slate-700/60 mt-2 space-y-1 text-[11px]">
                <div className="text-orange-200/90 font-medium">
                  💡 <span className="font-bold">Efficiency Tip:</span> {briefing.scheduleEfficiencyTip}
                </div>
                <div className="text-slate-400">
                  📋 <span className="font-medium text-slate-300">Pharmacy Linkage:</span> {briefing.pendingRxSummary}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
