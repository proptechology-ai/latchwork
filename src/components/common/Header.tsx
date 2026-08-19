import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Stethoscope,
  Pill,
  CalendarCheck2,
  UserCheck,
  Sparkles,
  Globe,
  Bell,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  ExternalLink,
  DollarSign,
  TrendingUp,
} from 'lucide-react';
import { Role } from '../../types';
import { LatchworkLogo } from './LatchworkLogo';

export const Header: React.FC = () => {
  const {
    role,
    setRole,
    language,
    setLanguage,
    t,
    notifications,
    markNotificationRead,
    searchQuery,
    setSearchQuery,
    clinicSettings,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const rolesList: { id: Role; labelKey: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'doctor', labelKey: 'roleDoctor', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'pharmacy', labelKey: 'rolePharmacy', icon: <Pill className="w-4 h-4" /> },
    { id: 'reception', labelKey: 'roleReception', icon: <CalendarCheck2 className="w-4 h-4" /> },
    { id: 'patient', labelKey: 'rolePatient', icon: <UserCheck className="w-4 h-4" /> },
    { id: 'financial', labelKey: 'roleFinancial', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'showcase', labelKey: 'roleShowcase', icon: <Sparkles className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs">
      {/* Top Banner with Clinic Info & Quick Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5">
            <LatchworkLogo size="sm" showText={true} />
          </div>
          <span className="text-slate-300 hidden sm:inline">•</span>
          <span className="text-slate-500 hidden md:inline font-medium">
            {language === 'ar' ? clinicSettings.addressAr : clinicSettings.address}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {t('onlineStatus')}
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Global Fast Search */}
          <div className="relative hidden lg:block w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 rtl:left-auto rtl:right-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-8 pr-3 rtl:pl-3 rtl:pr-8 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-orange-600 focus:bg-white transition-all shadow-2xs"
            />
          </div>

          {/* Notifications Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors relative flex items-center gap-1.5 shadow-2xs"
              title={t('notifications')}
            >
              <Bell className="w-4 h-4 text-slate-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-600 text-white font-bold rounded-full text-[10px] flex items-center justify-center shadow-sm">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 rtl:right-auto rtl:left-0 mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in-50 duration-150">
                <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-orange-600" />
                    <span className="font-bold text-sm text-slate-900">{t('notifications')}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono font-medium">
                    {unreadCount} unread
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-5 text-center text-xs text-slate-400">
                      No recent activity
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3.5 text-xs transition-colors hover:bg-slate-50 cursor-pointer flex gap-3 ${
                          !n.read ? 'bg-orange-50/40' : 'opacity-85'
                        }`}
                      >
                        <div className="mt-0.5 p-1 rounded-md bg-slate-100">
                          {n.type === 'rx' && <Pill className="w-3.5 h-3.5 text-orange-600" />}
                          {n.type === 'appointment' && <CalendarCheck2 className="w-3.5 h-3.5 text-sky-600" />}
                          {n.type === 'stock' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                          {n.type === 'intake' && <FileText className="w-3.5 h-3.5 text-emerald-600" />}
                          {n.type === 'financial' && <DollarSign className="w-3.5 h-3.5 text-emerald-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900">
                              {language === 'ar' ? n.titleAr : n.title}
                            </span>
                            <span className="text-[10px] text-slate-400 font-medium">{n.timestamp}</span>
                          </div>
                          <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                            {language === 'ar' ? n.messageAr : n.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bilingual Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 transition-colors shadow-2xs"
          >
            <Globe className="w-3.5 h-3.5 text-orange-600" />
            <span>{t('langToggle')}</span>
          </button>
        </div>
      </div>

      {/* Main Role Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {rolesList.map((r) => {
            const isActive = role === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setRole(r.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 relative ${
                  isActive
                    ? 'bg-orange-50 text-orange-700 border border-orange-200/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                }`}
              >
                <span className={isActive ? 'text-orange-600' : 'text-slate-500'}>
                  {r.icon}
                </span>
                <span>{t(r.labelKey)}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-600 inline-block ml-1 rtl:ml-0 rtl:mr-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
