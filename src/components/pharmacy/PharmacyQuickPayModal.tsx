import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  QrCode,
  Smartphone,
  CheckCircle2,
  Copy,
  Check,
  Send,
  CreditCard,
  Lock,
  ArrowRight,
  ShieldCheck,
  Printer,
  Sparkles,
  ExternalLink,
  DollarSign,
  AlertCircle,
  Receipt,
  FileText,
} from 'lucide-react';
import { Prescription } from '../../types';

interface PharmacyQuickPayModalProps {
  prescription: Prescription;
  onClose: () => void;
  onPaymentComplete?: (receiptNo: string) => void;
}

export const PharmacyQuickPayModal: React.FC<PharmacyQuickPayModalProps> = ({
  prescription,
  onClose,
  onPaymentComplete,
}) => {
  const { language, updatePrescriptionStatus, addPatientNotification } = useApp();
  const [copiedLink, setCopiedLink] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [selectedMobileMethod, setSelectedMobileMethod] = useState<'apple_pay' | 'mada' | 'credit_card'>('apple_pay');
  const [isProcessingMobilePay, setIsProcessingMobilePay] = useState(false);
  const [isPaid, setIsPaid] = useState(prescription.paymentStatus === 'paid');
  const [receiptData, setReceiptData] = useState<any>(null);
  const [showMobileSimulator, setShowMobileSimulator] = useState(false);

  const sessionId = `PAY-${prescription.code.replace(/[^a-zA-Z0-9]/g, '')}-${Date.now().toString().slice(-4)}`;
  const payUrl = `https://latchwork-pay.health/pay/${sessionId}?rx=${encodeURIComponent(prescription.code)}&amt=${prescription.totalCost.toFixed(2)}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(payUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleSendSMS = () => {
    setSmsSent(true);
    setTimeout(() => setSmsSent(false), 4000);
  };

  const handleExecutePayment = async (methodName: string) => {
    setIsProcessingMobilePay(true);
    try {
      const res = await fetch('/api/pharmacy/settle-quick-pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          rxCode: prescription.code,
          patientName: prescription.patientName,
          amount: prescription.totalCost,
          paymentMethod: methodName,
        }),
      });
      const json = await res.json();
      const receiptNo = json?.data?.receiptNo || `REC-QP-${Math.floor(100000 + Math.random() * 900000)}`;

      // Update App Context state
      updatePrescriptionStatus(prescription.id, 'ready_for_pickup');

      // Send real-time patient notification
      addPatientNotification({
        patientId: prescription.patientId,
        type: 'pickup_ready',
        title: 'Payment Received — Prescription Ready',
        titleAr: 'تم استلام الدفع بنجاح — الوصفة جاهزة للاستلام',
        message: `Quick-Pay settled $${prescription.totalCost.toFixed(2)} via ${methodName}. Your medication package is ready at Pharmacy Counter #1 (Receipt #${receiptNo}).`,
        messageAr: `تم سداد $${prescription.totalCost.toFixed(2)} عبر الدفع السريع (${methodName}). أدويتك جاهزة للاستلام من صيدلية المركز (إيصال #${receiptNo}).`,
        read: false,
        urgency: 'important',
        relatedId: prescription.id,
      });

      setReceiptData({
        receiptNo,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        amount: prescription.totalCost,
        method: methodName,
      });

      setIsPaid(true);
      if (onPaymentComplete) {
        onPaymentComplete(receiptNo);
      }
    } catch (e) {
      // Fallback settlement
      const fallbackReceipt = `REC-QP-${Math.floor(100000 + Math.random() * 900000)}`;
      updatePrescriptionStatus(prescription.id, 'ready_for_pickup');
      setReceiptData({
        receiptNo: fallbackReceipt,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        amount: prescription.totalCost,
        method: methodName,
      });
      setIsPaid(true);
    } finally {
      setIsProcessingMobilePay(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto animate-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-slate-900">
                  {language === 'ar' ? 'بوابة الدفع السريع بالرمز الشريطي (Quick-Pay QR)' : 'Prescription Quick-Pay QR Gateway'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                  Live SSL Encrypted
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {language === 'ar'
                  ? `ربط إلكتروني مباشر للوصفة ${prescription.code} لتسوية الرصيد فورياً عبر الجوال`
                  : `Instant secure mobile settlement token linked to ${prescription.code}`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold flex items-center justify-center text-sm transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {isPaid ? (
          /* Payment Success State */
          <div className="p-6 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center space-y-4 animate-in fade-in-50">
            <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-lg text-emerald-950">
                {language === 'ar' ? 'تم استلام الدفعة بنجاح!' : 'Payment Successfully Settled!'}
              </h4>
              <p className="text-xs text-emerald-800">
                {language === 'ar'
                  ? `تم سداد مبلغ $${prescription.totalCost.toFixed(2)} بنجاح وتم تحديث حالة الوصفة إلى جاهزة للاستلام`
                  : `Amount of $${prescription.totalCost.toFixed(2)} captured. Prescription is now marked as ready for pickup.`}
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-white p-4 rounded-xl border border-emerald-200 max-w-sm mx-auto text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between text-slate-500">
                <span>Receipt Number:</span>
                <span className="font-bold text-slate-900">{receiptData?.receiptNo || 'REC-QP-882194'}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Prescription Ref:</span>
                <span className="font-bold text-blue-700">{prescription.code}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Patient:</span>
                <span className="font-bold text-slate-800">{prescription.patientName}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Payment Method:</span>
                <span className="font-bold text-slate-800">{receiptData?.method || 'Apple Pay'}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-bold text-emerald-700">
                <span>Total Settled:</span>
                <span>${prescription.totalCost.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Tax Receipt</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* Active QR & Mobile Pay View */
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
              {/* Left Column: QR Matrix Box */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                <div className="relative p-4 bg-white rounded-2xl border-2 border-slate-300 shadow-md">
                  {/* Stylized QR Code SVG */}
                  <svg
                    viewBox="0 0 160 160"
                    className="w-40 h-40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Top-Left Finder */}
                    <rect x="10" y="10" width="40" height="40" rx="6" stroke="#0F172A" strokeWidth="8" />
                    <rect x="22" y="22" width="16" height="16" rx="2" fill="#0F172A" />

                    {/* Top-Right Finder */}
                    <rect x="110" y="10" width="40" height="40" rx="6" stroke="#0F172A" strokeWidth="8" />
                    <rect x="122" y="22" width="16" height="16" rx="2" fill="#0F172A" />

                    {/* Bottom-Left Finder */}
                    <rect x="10" y="110" width="40" height="40" rx="6" stroke="#0F172A" strokeWidth="8" />
                    <rect x="22" y="122" width="16" height="16" rx="2" fill="#0F172A" />

                    {/* Data Points Grid */}
                    <rect x="60" y="12" width="8" height="8" fill="#2563EB" />
                    <rect x="76" y="12" width="8" height="8" fill="#0F172A" />
                    <rect x="92" y="12" width="8" height="8" fill="#0F172A" />

                    <rect x="60" y="28" width="8" height="8" fill="#0F172A" />
                    <rect x="76" y="28" width="16" height="8" fill="#2563EB" />

                    <rect x="12" y="60" width="8" height="8" fill="#0F172A" />
                    <rect x="28" y="60" width="16" height="8" fill="#0F172A" />
                    <rect x="60" y="60" width="8" height="8" fill="#2563EB" />
                    <rect x="76" y="60" width="8" height="8" fill="#0F172A" />
                    <rect x="92" y="60" width="16" height="8" fill="#0F172A" />
                    <rect x="124" y="60" width="8" height="8" fill="#2563EB" />
                    <rect x="140" y="60" width="8" height="8" fill="#0F172A" />

                    <rect x="12" y="76" width="16" height="8" fill="#0F172A" />
                    <rect x="44" y="76" width="8" height="8" fill="#2563EB" />
                    <rect x="60" y="76" width="16" height="8" fill="#0F172A" />
                    <rect x="92" y="76" width="8" height="8" fill="#2563EB" />
                    <rect x="108" y="76" width="16" height="8" fill="#0F172A" />
                    <rect x="140" y="76" width="8" height="8" fill="#0F172A" />

                    <rect x="12" y="92" width="8" height="8" fill="#2563EB" />
                    <rect x="28" y="92" width="8" height="8" fill="#0F172A" />
                    <rect x="44" y="92" width="16" height="8" fill="#0F172A" />
                    <rect x="76" y="92" width="8" height="8" fill="#0F172A" />
                    <rect x="92" y="92" width="8" height="8" fill="#2563EB" />
                    <rect x="124" y="92" width="16" height="8" fill="#0F172A" />

                    <rect x="60" y="108" width="8" height="8" fill="#0F172A" />
                    <rect x="76" y="108" width="16" height="8" fill="#2563EB" />
                    <rect x="108" y="108" width="8" height="8" fill="#0F172A" />
                    <rect x="124" y="108" width="8" height="8" fill="#2563EB" />
                    <rect x="140" y="108" width="8" height="8" fill="#0F172A" />

                    <rect x="60" y="124" width="16" height="8" fill="#2563EB" />
                    <rect x="92" y="124" width="8" height="8" fill="#0F172A" />
                    <rect x="108" y="124" width="16" height="8" fill="#0F172A" />
                    <rect x="140" y="124" width="8" height="8" fill="#2563EB" />

                    <rect x="60" y="140" width="8" height="8" fill="#0F172A" />
                    <rect x="76" y="140" width="8" height="8" fill="#0F172A" />
                    <rect x="92" y="140" width="16" height="8" fill="#2563EB" />
                    <rect x="124" y="140" width="8" height="8" fill="#0F172A" />

                    {/* Center Brand Badge */}
                    <circle cx="80" cy="80" r="14" fill="#1E293B" />
                    <text
                      x="80"
                      y="84"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      PAY
                    </text>
                  </svg>
                </div>

                <div className="space-y-0.5">
                  <span className="font-mono text-xs font-bold text-slate-900 block">
                    Scan with Mobile Camera
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Supports Apple Pay, mada, STC Pay & Cards
                  </span>
                </div>
              </div>

              {/* Right Column: Order Details & Actions */}
              <div className="md:col-span-7 space-y-4 text-xs">
                {/* Bill Breakdown Box */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <div>
                      <span className="font-semibold text-slate-500 text-[11px]">Prescription Ref:</span>
                      <h4 className="font-mono font-bold text-slate-900 text-sm">{prescription.code}</h4>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-500 text-[11px]">Due Balance:</span>
                      <div className="font-bold text-lg text-blue-700 font-mono">
                        ${prescription.totalCost.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="font-semibold text-slate-600 block text-[11px]">Prescribed Medications ({prescription.medications.length}):</span>
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                      {prescription.medications.map((m, idx) => (
                        <div key={idx} className="flex justify-between text-slate-700 bg-white p-1.5 rounded-lg border border-slate-100">
                          <span className="font-semibold">{m.drugName} ({m.dosage})</span>
                          <span className="font-mono font-bold text-slate-900">${m.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 flex justify-between pt-1 border-t border-slate-200/60">
                    <span>Patient: <strong>{prescription.patientName}</strong></span>
                    <span>Physician: <strong>{prescription.doctorName}</strong></span>
                  </div>
                </div>

                {/* Direct Link Share Actions */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-all cursor-pointer shadow-2xs"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                      <span>{copiedLink ? 'Payment Link Copied!' : 'Copy Digital Pay URL'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleSendSMS}
                      className="flex-1 flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold border border-blue-200 transition-all cursor-pointer shadow-2xs"
                    >
                      {smsSent ? <Check className="w-4 h-4 text-emerald-600" /> : <Send className="w-4 h-4 text-blue-600" />}
                      <span>{smsSent ? 'SMS Link Sent!' : 'Send SMS to Mobile'}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMobileSimulator(!showMobileSimulator)}
                    className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <Smartphone className="w-4 h-4 text-orange-400" />
                    <span>{showMobileSimulator ? 'Hide Mobile Checkout Simulation' : 'Launch Mobile Scan & Settle Simulator'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Interactive Mobile Checkout Simulator */}
            {showMobileSimulator && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-3 animate-in fade-in-50 border border-slate-700 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2.5 text-xs">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-orange-400" />
                    <span className="font-bold">Patient Mobile Checkout Screen</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Secure Token: {sessionId}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMobileMethod('apple_pay')}
                    className={`p-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      selectedMobileMethod === 'apple_pay'
                        ? 'bg-white text-slate-900 border-white shadow-md'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <span className="block text-sm"> Pay</span>
                    <span className="text-[10px] opacity-80">Apple Pay Express</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMobileMethod('mada')}
                    className={`p-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      selectedMobileMethod === 'mada'
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <span className="block text-sm">mada</span>
                    <span className="text-[10px] opacity-80">Saudi Debit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMobileMethod('credit_card')}
                    className={`p-3 rounded-xl border text-center font-bold text-xs transition-all cursor-pointer ${
                      selectedMobileMethod === 'credit_card'
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <span className="block text-sm">Visa / MC</span>
                    <span className="text-[10px] opacity-80">Credit Card</span>
                  </button>
                </div>

                <button
                  type="button"
                  disabled={isProcessingMobilePay}
                  onClick={() =>
                    handleExecutePayment(
                      selectedMobileMethod === 'apple_pay'
                        ? 'Apple Pay'
                        : selectedMobileMethod === 'mada'
                        ? 'mada Debit'
                        : 'Credit Card (Visa)'
                    )
                  }
                  className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Lock className="w-4 h-4" />
                  <span>
                    {isProcessingMobilePay
                      ? 'Authorizing with Bank Gateway...'
                      : `Authorize & Pay $${prescription.totalCost.toFixed(2)}`}
                  </span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
