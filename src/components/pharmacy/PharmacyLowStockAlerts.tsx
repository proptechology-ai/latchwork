import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AlertTriangle,
  Package,
  RefreshCw,
  TrendingDown,
  CheckCircle2,
  Boxes,
  Truck,
  DollarSign,
  ShieldAlert,
  Sliders,
  Sparkles,
  ArrowRight,
  Info,
  Clock,
} from 'lucide-react';
import { LowStockAlert, DrugInventoryItem } from '../../types';

export const PharmacyLowStockAlerts: React.FC = () => {
  const {
    language,
    inventory,
    lowStockAlerts,
    safetyStockThreshold,
    setSafetyStockThreshold,
    reorderLowStockItem,
    bulkReorderAllLowStock,
  } = useApp();

  const [reorderSuccessToast, setReorderSuccessToast] = useState<string | null>(null);
  const [customThreshold, setCustomThreshold] = useState<number>(safetyStockThreshold);
  const [showConfig, setShowConfig] = useState<boolean>(false);
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  const [isBulkReordering, setIsBulkReordering] = useState<boolean>(false);

  const handleSingleReorder = (item: DrugInventoryItem, qty: number) => {
    setReorderingId(item.id);
    setTimeout(() => {
      reorderLowStockItem(item.id, qty);
      setReorderingId(null);
      setReorderSuccessToast(
        language === 'ar'
          ? `تمت إعادة طلب +${qty} عبوة من ${item.brandName} بنجاح`
          : `Successfully reordered +${qty} units of ${item.brandName} (PO created).`
      );
      setTimeout(() => setReorderSuccessToast(null), 4000);
    }, 400);
  };

  const handleBulkReorder = () => {
    setIsBulkReordering(true);
    setTimeout(() => {
      bulkReorderAllLowStock();
      setIsBulkReordering(false);
      setReorderSuccessToast(
        language === 'ar'
          ? 'تمت إعادة طلب جميع الأدوية المنخفضة بنجاح بنقرة واحدة'
          : 'Bulk replenishment complete: All low-stock medications reordered.'
      );
      setTimeout(() => setReorderSuccessToast(null), 5000);
    }, 500);
  };

  const handleSaveThreshold = () => {
    setSafetyStockThreshold(customThreshold);
    setShowConfig(false);
    setReorderSuccessToast(
      language === 'ar'
        ? `تم تحديث حد الأمان إلى ${customThreshold} وحدة`
        : `Safety threshold updated to ${customThreshold} units.`
    );
    setTimeout(() => setReorderSuccessToast(null), 3000);
  };

  // Group alerts by severity
  const outOfStock = lowStockAlerts.filter((a) => a.currentStock === 0);
  const critical = lowStockAlerts.filter((a) => a.currentStock > 0 && a.severity === 'critical');
  const warning = lowStockAlerts.filter((a) => a.severity === 'warning');

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {reorderSuccessToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between shadow-2xs animate-in fade-in-50">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span className="font-bold">{reorderSuccessToast}</span>
          </div>
          <span className="text-[10px] text-emerald-700 font-semibold bg-white/80 px-2.5 py-1 rounded-lg border border-emerald-200">
            Inventory & GL Updated
          </span>
        </div>
      )}

      {/* Main Alert Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl border ${
              lowStockAlerts.length > 0
                ? 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse'
                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-slate-900">
                  {language === 'ar'
                    ? 'نظام التنبيه الآلي للأدوية منخفضة المخزون وإعادة الطلب السريع'
                    : 'Automated Low-Stock Safety Intelligence & Rapid Reordering'}
                </h2>
                {lowStockAlerts.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-600 text-white">
                    {lowStockAlerts.length} Action Needed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'ar'
                  ? `مراقبة مستمرة لمستويات الأمان في الصيدلية (الحد الحالي: ${safetyStockThreshold} وحدة)`
                  : `Real-time automated formulary surveillance. Active safety threshold: ≤ ${safetyStockThreshold} units.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Safety Threshold</span>
            </button>

            {lowStockAlerts.length > 0 && (
              <button
                onClick={handleBulkReorder}
                disabled={isBulkReordering}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isBulkReordering ? 'animate-spin' : ''}`} />
                <span>
                  {language === 'ar'
                    ? 'إعادة طلب الكل بنقرة واحدة'
                    : `1-Click Reorder All (${lowStockAlerts.length} Items)`}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Safety Threshold Config Drawer */}
        {showConfig && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs animate-in fade-in-50">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600" />
                Configure Universal Pharmacy Stock Safety Buffer
              </span>
              <button
                onClick={() => setShowConfig(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-slate-500 text-[11px]">
              Whenever inventory drops to or below this buffer quantity, staff receive automated triage alerts and 1-click replenishment options.
            </p>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="5"
                max="80"
                step="5"
                value={customThreshold}
                onChange={(e) => setCustomThreshold(parseInt(e.target.value))}
                className="w-48 accent-blue-600 cursor-pointer"
              />
              <span className="font-mono font-bold text-sm text-blue-700 bg-white px-3 py-1 rounded-lg border border-slate-200">
                {customThreshold} units
              </span>
              <button
                onClick={handleSaveThreshold}
                className="px-4 py-1.5 rounded-lg bg-blue-600 text-white font-bold text-xs shadow-2xs hover:bg-blue-700 transition-all cursor-pointer"
              >
                Apply Threshold
              </button>
            </div>
          </div>
        )}

        {/* Summary Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[11px] text-slate-500 font-semibold block">Total Monitored SKU Formulary</span>
            <span className="text-xl font-bold text-slate-900 font-mono">{inventory.length}</span>
          </div>

          <div className="p-3 rounded-xl bg-red-50/70 border border-red-200">
            <span className="text-[11px] text-red-600 font-bold block flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Critical Low (&lt;10 Units)
            </span>
            <span className="text-xl font-bold text-red-700 font-mono">
              {critical.length + outOfStock.length}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200">
            <span className="text-[11px] text-amber-700 font-bold block">Warning Low (&le; {safetyStockThreshold} Units)</span>
            <span className="text-xl font-bold text-amber-800 font-mono">{warning.length}</span>
          </div>

          <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-[11px] text-emerald-700 font-bold block">Stock Health Index</span>
            <span className="text-xl font-bold text-emerald-800 font-mono">
              {Math.round(((inventory.length - lowStockAlerts.length) / inventory.length) * 100)}%
            </span>
          </div>
        </div>
      </div>

      {/* Alert Cards Grid */}
      {lowStockAlerts.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-2">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">All Pharmacy Stock Levels Safe</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Every medication in the clinical formulary is currently above the safety threshold of {safetyStockThreshold} units.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Active Depletion Alerts ({lowStockAlerts.length} items requiring replenishment)
            </h3>
            <span className="text-[11px] text-slate-400">Auto-calculated restock quantities</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lowStockAlerts.map((alert) => {
              const item = alert.item;
              const isReordering = reorderingId === item.id;
              const isCritical = alert.severity === 'critical' || alert.currentStock === 0;

              return (
                <div
                  key={alert.id}
                  className={`p-5 rounded-2xl border transition-all shadow-2xs space-y-4 ${
                    isCritical
                      ? 'bg-red-50/40 border-red-300 hover:border-red-400'
                      : 'bg-amber-50/40 border-amber-300 hover:border-amber-400'
                  }`}
                >
                  {/* Top Item Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isCritical
                            ? 'bg-red-600 text-white shadow-2xs'
                            : 'bg-amber-500 text-white shadow-2xs'
                        }`}
                      >
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">{item.brandName}</h4>
                          <span className="text-xs text-slate-500">({item.dosage})</span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">{item.genericName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">Batch: {item.batchNumber} • Exp: {item.expiryDate}</p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        alert.currentStock === 0
                          ? 'bg-red-700 text-white'
                          : alert.severity === 'critical'
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {alert.currentStock === 0 ? 'Out of Stock' : alert.severity === 'critical' ? 'Critical Low' : 'Warning Low'}
                    </span>
                  </div>

                  {/* Stock Level Bar & Metrics */}
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="font-semibold text-slate-600 flex items-center gap-1">
                        <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                        Current Stock Level:
                      </span>
                      <div className="font-mono">
                        <span className="font-bold text-sm text-red-700">{item.stockCount}</span>
                        <span className="text-slate-400"> / {alert.safetyThreshold} safety buffer</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isCritical ? 'bg-red-600' : 'bg-amber-500'
                        }`}
                        style={{
                          width: `${Math.min(100, (item.stockCount / alert.safetyThreshold) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Restock Action Strip */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/70 text-xs">
                    <div className="space-y-0.5">
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Truck className="w-3 h-3 text-slate-400" />
                        <span>Supplier: <strong>Gulf MediCorp Depot</strong></span>
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-slate-400" />
                        <span>Wholesale Cost: <strong>${(alert.suggestedReorderQuantity * item.unitPrice * 0.6).toFixed(2)}</strong></span>
                      </div>
                    </div>

                    {/* 1-Click Reorder Button */}
                    <button
                      type="button"
                      disabled={isReordering}
                      onClick={() => handleSingleReorder(item, alert.suggestedReorderQuantity)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isReordering ? 'animate-spin' : ''}`} />
                      <span>
                        {language === 'ar'
                          ? `إعادة طلب فوري (+${alert.suggestedReorderQuantity})`
                          : `1-Click Reorder (+${alert.suggestedReorderQuantity} units)`}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
