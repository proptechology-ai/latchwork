import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Pill,
  CheckCircle2,
  Package,
  Clock,
  AlertTriangle,
  RotateCcw,
  Search,
  Check,
  X,
  FileText,
  Boxes,
  Printer,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Prescription, PrescriptionStatus } from '../../types';
import { PrintPrescriptionModal } from '../common/PrintPrescriptionModal';
import { PharmacyLowStockAlerts } from './PharmacyLowStockAlerts';
import { PharmacyQuickPayModal } from './PharmacyQuickPayModal';
import { QrCode, Smartphone } from 'lucide-react';

export const PharmacyView: React.FC = () => {
  const {
    t,
    language,
    prescriptions,
    updatePrescriptionStatus,
    inventory,
    restockItem,
    refillRequests,
    resolveRefill,
    patients,
    doctors,
    lowStockAlerts,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'incoming' | 'ready' | 'dispensed' | 'inventory' | 'low_stock' | 'refills'>('low_stock');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activePrintRx, setActivePrintRx] = useState<Prescription | null>(null);
  const [activeQuickPayRx, setActiveQuickPayRx] = useState<Prescription | null>(null);

  // Status-filtered prescriptions
  const incomingRx = prescriptions.filter(
    (rx) => rx.status === 'pending_dispense' || rx.status === 'verifying'
  );
  const readyRx = prescriptions.filter((rx) => rx.status === 'ready_for_pickup');
  const dispensedRx = prescriptions.filter((rx) => rx.status === 'dispensed');

  // Filtered inventory
  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.brandName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.genericName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.batchNumber.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const categories = ['all', ...Array.from(new Set(inventory.map((i) => i.category)))];

  const lowStockCount = inventory.filter((i) => i.stockCount <= i.reorderLevel).length;
  const pendingRefillCount = refillRequests.filter((r) => r.status === 'pending').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header & Metrics Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">{t('pharmacyTitle')}</h1>
            <p className="text-xs text-slate-500 font-medium">
              Directly connected to Clinic Consultation Suites • Auto Inventory Sync
            </p>
          </div>
        </div>

        {/* Quick Dispensary Metrics */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500 block text-[11px] font-medium">{t('pendingRx')}</span>
            <span className="text-base font-bold text-blue-700">{incomingRx.length}</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500 block text-[11px] font-medium">{t('lowStockAlerts')}</span>
            <span className="text-base font-bold text-amber-600">{lowStockCount}</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500 block text-[11px] font-medium">{t('tabRefills')}</span>
            <span className="text-base font-bold text-blue-600">{pendingRefillCount}</span>
          </div>
        </div>
      </div>

      {/* Pharmacy Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('low_stock')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'low_stock'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>{language === 'ar' ? 'تنبيهات المخزون وإعادة الطلب' : 'Low-Stock & Auto-Reorder'}</span>
          {lowStockAlerts.length > 0 && (
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              activeTab === 'low_stock' ? 'bg-white/20 text-white' : 'bg-red-600 text-white'
            }`}>
              {lowStockAlerts.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('incoming')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'incoming'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{t('tabIncomingRx')}</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'incoming' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {incomingRx.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ready')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'ready'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>{t('tabReady')}</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'ready' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {readyRx.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('dispensed')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'dispensed'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{t('tabDispensed')}</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
            activeTab === 'dispensed' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
          }`}>
            {dispensedRx.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'inventory'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>{t('tabInventory')}</span>
          {lowStockCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
              {lowStockCount} alert
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('refills')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'refills'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t('tabRefills')}</span>
          {pendingRefillCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">
              {pendingRefillCount} new
            </span>
          )}
        </button>
      </div>

      {/* TAB 0: Low-Stock Automated Alert & Replenishment Hub */}
      {activeTab === 'low_stock' && <PharmacyLowStockAlerts />}

      {/* TAB 1: Incoming e-Prescriptions */}
      {activeTab === 'incoming' && (
        <div className="space-y-4">
          {incomingRx.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">Dispensary Queue Clear</h3>
              <p className="text-xs text-slate-500 mt-1">
                No pending electronic prescriptions from clinic consultation rooms.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingRx.map((rx) => {
                const patient = patients.find((p) => p.id === rx.patientId);
                return (
                  <div
                    key={rx.id}
                    className="bg-white border border-slate-200 hover:border-blue-300 rounded-xl p-5 shadow-sm space-y-4 transition-all"
                  >
                    <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-700 text-sm">{rx.code}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200">
                            {rx.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="font-bold text-slate-900 text-base mt-1">{rx.patientName}</h3>
                        <p className="text-xs text-slate-500">
                          {t('prescribedBy')}: <span className="text-slate-800 font-medium">{rx.doctorName}</span> • {rx.createdAt}
                        </p>
                      </div>
                      <button
                        onClick={() => setActivePrintRx(rx)}
                        className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-50 transition-colors"
                        title="Print Rx"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Patient Allergy Check in Pharmacy (Professional Polish Alert Box) */}
                    {patient?.allergies && patient.allergies.length > 0 && (
                      <div className="p-3 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-xs">
                        <p className="text-xs font-bold text-red-700 uppercase">Patient Allergy Warning</p>
                        <p className="text-sm text-slate-800 font-medium mt-0.5">{patient.allergies.join(', ')}</p>
                      </div>
                    )}

                    {/* Prescribed Items Table */}
                    <div className="space-y-2">
                      <span className="text-xs font-semibold text-slate-500 block">
                        Prescription Items ({rx.medications.length}):
                      </span>
                      {rx.medications.map((med, idx) => {
                        const invItem = inventory.find((i) => i.id === med.drugId);
                        const isStockLow = invItem && invItem.stockCount < 10;
                        return (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs flex items-center justify-between"
                          >
                            <div>
                              <div className="font-bold text-slate-900">{med.drugName}</div>
                              <div className="text-[11px] text-slate-500 mt-0.5">
                                {med.dosage} • {language === 'ar' && med.frequencyAr ? med.frequencyAr : med.frequency}
                              </div>
                              <div className="text-[11px] text-blue-700 italic mt-0.5 font-medium">
                                {language === 'ar' && med.instructionsAr ? med.instructionsAr : med.instructions}
                              </div>
                            </div>
                            <div className="text-right rtl:text-left">
                              <span className="font-mono text-[11px] text-slate-700 block font-medium">
                                Duration: {med.duration}
                              </span>
                              {invItem && (
                                <span
                                  className={`text-[10px] font-semibold block ${
                                    isStockLow ? 'text-amber-600 font-bold' : 'text-slate-400'
                                  }`}
                                >
                                  Stock: {invItem.stockCount} left
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => setActiveQuickPayRx(rx)}
                        className="flex items-center gap-1 px-3 py-2.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs border border-orange-200 transition-all cursor-pointer shadow-2xs"
                        title="Generate Quick-Pay QR"
                      >
                        <QrCode className="w-3.5 h-3.5 text-orange-600" />
                        <span>{language === 'ar' ? 'رمز الدفع السريع' : 'Quick-Pay QR'}</span>
                      </button>

                      <button
                        onClick={() => updatePrescriptionStatus(rx.id, 'ready_for_pickup', 'Packaged & verified by pharmacist.')}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>{t('markReady')}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Ready for Pickup */}
      {activeTab === 'ready' && (
        <div className="space-y-4">
          {readyRx.length === 0 ? (
            <div className="p-12 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
              <Package className="w-10 h-10 text-blue-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900">No Packages Waiting</h3>
              <p className="text-xs text-slate-500 mt-1">All prepared medications have been collected by patients.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {readyRx.map((rx) => (
                <div
                  key={rx.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                    <div>
                      <span className="font-mono font-bold text-blue-700 text-sm">{rx.code}</span>
                      <h3 className="font-bold text-slate-900 text-base mt-1">{rx.patientName}</h3>
                      <p className="text-xs text-slate-500">{t('prescribedBy')}: {rx.doctorName}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Ready for Patient
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 space-y-1">
                    <p className="font-semibold text-slate-500">Medications Packaged:</p>
                    {rx.medications.map((m, i) => (
                      <div key={i} className="flex justify-between py-1 border-b border-slate-100 text-xs">
                        <span className="font-medium text-slate-900">{m.drugName}</span>
                        <span className="text-slate-500">{m.dosage}</span>
                      </div>
                    ))}
                    {rx.pharmacyNotes && (
                      <p className="text-[11px] text-blue-700 font-medium pt-1">Note: {rx.pharmacyNotes}</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                    <div>
                      <span className="text-xs text-slate-500 block font-medium">Total Due:</span>
                      <span className="font-mono text-sm font-bold text-slate-900">${rx.totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveQuickPayRx(rx)}
                        className="flex items-center gap-1 px-3 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs border border-orange-200 transition-all cursor-pointer shadow-2xs"
                        title="Generate Quick-Pay QR & Mobile Checkout"
                      >
                        <QrCode className="w-3.5 h-3.5 text-orange-600" />
                        <span>{language === 'ar' ? 'دفع سريع بالجوال' : 'Quick-Pay QR'}</span>
                      </button>

                      <button
                        onClick={() => updatePrescriptionStatus(rx.id, 'dispensed', 'Handed over to patient.')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t('markCompleted')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Dispensed History */}
      {activeTab === 'dispensed' && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-900">Dispensed Prescriptions Archive</h3>
            <span className="text-xs text-slate-500 font-medium">{dispensedRx.length} records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-xs">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">{t('rxCode')}</th>
                  <th className="py-3 px-4">{t('patientName')}</th>
                  <th className="py-3 px-4">{t('prescribedBy')}</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">{t('unitPrice')}</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {dispensedRx.map((rx) => (
                  <tr key={rx.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono font-bold text-blue-700">{rx.code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{rx.patientName}</td>
                    <td className="py-3 px-4 text-slate-600">{rx.doctorName}</td>
                    <td className="py-3 px-4">{rx.medications.length} items</td>
                    <td className="py-3 px-4 font-mono font-semibold">${rx.totalCost.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Dispensed
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setActivePrintRx(rx)}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: Formulary & Inventory Table */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 rtl:left-auto rtl:right-3" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search drug formulary by name, generic, or batch..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-3 rtl:pl-3 rtl:pr-9 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shadow-2xs ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {cat === 'all' ? 'All Categories' : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">{t('brandName')}</th>
                    <th className="py-3 px-4">{t('genericName')}</th>
                    <th className="py-3 px-4">{t('category')}</th>
                    <th className="py-3 px-4">{t('inStock')}</th>
                    <th className="py-3 px-4">{t('batchNo')}</th>
                    <th className="py-3 px-4">{t('expiresOn')}</th>
                    <th className="py-3 px-4">{t('unitPrice')}</th>
                    <th className="py-3 px-4 text-center">Quick Restock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredInventory.map((item) => {
                    const isLow = item.stockCount <= item.reorderLevel;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          <div>{item.brandName}</div>
                          <span className="text-[10px] text-slate-500 font-normal">{item.dosage}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{item.genericName}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-bold font-mono text-sm ${
                                isLow ? 'text-amber-600 font-bold' : 'text-slate-900'
                              }`}
                            >
                              {item.stockCount}
                            </span>
                            {isLow && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                Low
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">{item.batchNumber}</td>
                        <td className="py-3 px-4 text-slate-500">{item.expiryDate}</td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-900">${item.unitPrice.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => restockItem(item.id, 50)}
                            className="px-3 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 text-xs font-semibold transition-all shadow-2xs"
                          >
                            +50 Units
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Refill Requests */}
      {activeTab === 'refills' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-sm text-slate-900">Patient-Initiated Refill Requests</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">{refillRequests.length} total</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {refillRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{req.patientName}</h4>
                      <p className="text-blue-700 font-bold mt-0.5">{req.medicationName}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">Requested: {req.requestedAt}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        req.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : req.status === 'rejected'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>

                  {req.patientNote && (
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 italic text-[11px]">
                      "{req.patientNote}"
                    </div>
                  )}

                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                      <button
                        onClick={() => resolveRefill(req.id, true)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{t('approveRefill')}</span>
                      </button>
                      <button
                        onClick={() => resolveRefill(req.id, false)}
                        className="px-3 py-2 rounded-lg bg-white hover:bg-red-50 text-red-700 border border-red-200 font-bold transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{t('rejectRefill')}</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Print Prescription Modal */}
      {activePrintRx && (
        <PrintPrescriptionModal
          prescription={activePrintRx}
          patient={patients.find((p) => p.id === activePrintRx.patientId)}
          doctor={doctors.find((d) => d.id === activePrintRx.doctorId)}
          onClose={() => setActivePrintRx(null)}
        />
      )}

      {/* Pharmacy Quick-Pay QR Modal */}
      {activeQuickPayRx && (
        <PharmacyQuickPayModal
          prescription={activeQuickPayRx}
          onClose={() => setActiveQuickPayRx(null)}
          onPaymentComplete={(receiptNo) => {
            // Keep open to show success state or automatically update
          }}
        />
      )}
    </div>
  );
};
