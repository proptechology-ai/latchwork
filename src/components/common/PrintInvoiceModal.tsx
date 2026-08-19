import React from 'react';
import { BillingInvoice } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Printer, CheckCircle2, QrCode, Building2, CreditCard, ShieldCheck } from 'lucide-react';
import { LatchworkLogo } from './LatchworkLogo';

interface PrintInvoiceModalProps {
  invoice: BillingInvoice;
  onClose: () => void;
}

export const PrintInvoiceModal: React.FC<PrintInvoiceModalProps> = ({ invoice, onClose }) => {
  const { clinicSettings, language, t } = useApp();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Modal Controls (Hidden in Print) */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between no-print bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900">
              Tax Invoice — {invoice.invoiceNumber}
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
              {invoice.paymentStatus}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet */}
        <div className="p-6 sm:p-8 bg-white text-slate-900 rounded-b-2xl font-sans" id="printable-invoice-area">
          {/* Header & Logo */}
          <div className="border-b-2 border-slate-900 pb-5 mb-6 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <LatchworkLogo className="w-10 h-10 text-orange-600 shrink-0" />
              <div>
                <h1 className="text-xl font-black text-slate-950 tracking-tight">
                  {language === 'ar' ? clinicSettings.nameAr : clinicSettings.name}
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  {language === 'ar' ? clinicSettings.taglineAr : clinicSettings.tagline}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {language === 'ar' ? clinicSettings.addressAr : clinicSettings.address} • Tel: {clinicSettings.phone}
                </p>
              </div>
            </div>
            <div className="text-right rtl:text-left">
              <div className="inline-block border border-slate-900 rounded-lg px-3 py-1.5 text-center bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-600 block">TAX INVOICE</span>
                <span className="font-mono text-sm font-black text-slate-950">{invoice.invoiceNumber}</span>
              </div>
              <span className="text-[11px] text-slate-600 block mt-1.5 font-medium">Issue Date: {invoice.date}</span>
            </div>
          </div>

          {/* Bill To & Clinic Metadata */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs mb-6">
            <div>
              <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider block">Billed To (Patient)</span>
              <span className="font-bold text-slate-900 text-sm block mt-0.5">{invoice.patientName}</span>
              <p className="text-slate-600 text-[11px] mt-0.5">Patient ID: {invoice.patientId}</p>
              {invoice.patientPhone && <p className="text-slate-600 text-[11px]">Phone: {invoice.patientPhone}</p>}
            </div>
            <div className="text-right rtl:text-left">
              <span className="text-slate-500 font-bold text-[10px] uppercase tracking-wider block">Payment & Care Provider</span>
              {invoice.doctorName && (
                <p className="font-semibold text-slate-800 text-[11px] mt-0.5">Physician: {invoice.doctorName}</p>
              )}
              <div className="inline-flex items-center gap-1 mt-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold text-[11px]">
                <CheckCircle2 className="w-3 h-3" />
                <span>PAID VIA {invoice.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left rtl:text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3.5">#</th>
                    <th className="py-2.5 px-3.5">Item & Service Description</th>
                    <th className="py-2.5 px-3.5 text-center">Qty</th>
                    <th className="py-2.5 px-3.5 text-right rtl:text-left">Unit Price</th>
                    <th className="py-2.5 px-3.5 text-right rtl:text-left">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {invoice.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3.5 font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-3.5 font-semibold text-slate-900">
                        {item.description}
                        {item.code && <span className="block font-mono text-[10px] text-slate-400 font-normal">{item.code}</span>}
                      </td>
                      <td className="py-3 px-3.5 text-center font-mono text-slate-700">{item.quantity}</td>
                      <td className="py-3 px-3.5 text-right rtl:text-left font-mono text-slate-700">${item.unitPrice.toFixed(2)}</td>
                      <td className="py-3 px-3.5 text-right rtl:text-left font-mono font-bold text-slate-900">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Subtotals and Totals */}
          <div className="flex justify-end mb-6">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold text-slate-800">${invoice.subtotal.toFixed(2)}</span>
              </div>
              {invoice.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount Applied:</span>
                  <span className="font-mono">-${invoice.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>VAT (5% Medical Standard):</span>
                <span className="font-mono font-semibold text-slate-800">${invoice.taxAmount.toFixed(2)}</span>
              </div>
              <div className="border-t-2 border-slate-900 pt-2 flex justify-between font-black text-sm text-slate-950">
                <span>TOTAL PAID:</span>
                <span className="font-mono text-base text-orange-600">${invoice.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes and Stamp */}
          {invoice.notes && (
            <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-lg text-[11px] text-amber-900 mb-6">
              <span className="font-bold block">Patient & Insurance Notes:</span>
              <p>{invoice.notes}</p>
            </div>
          )}

          {/* Footer & QR */}
          <div className="border-t border-slate-200 pt-5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-14 h-14 border border-slate-300 rounded p-1 bg-slate-50 flex items-center justify-center">
                <QrCode className="w-11 h-11 text-slate-800" />
              </div>
              <div className="text-[10px] text-slate-500 leading-tight">
                <p className="font-bold text-slate-800">E-Invoicing Compliance</p>
                <p className="font-mono text-[9px]">ZATCA / Tax Digital Signature</p>
                <p className="text-emerald-700 font-bold flex items-center gap-0.5 mt-0.5">
                  <ShieldCheck className="w-3 h-3" /> Fully Reconciled
                </p>
              </div>
            </div>

            <div className="text-right rtl:text-left text-[10px] text-slate-500">
              <p className="font-semibold text-slate-700">Latchwork Integrated Healthcare OS</p>
              <p>Thank you for choosing Latchwork Medical Plaza.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
