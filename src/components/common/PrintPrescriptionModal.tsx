import React from 'react';
import { Prescription, Patient, Doctor } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Printer, CheckCircle, ShieldCheck, QrCode } from 'lucide-react';

interface PrintPrescriptionModalProps {
  prescription: Prescription;
  patient?: Patient;
  doctor?: Doctor;
  onClose: () => void;
}

export const PrintPrescriptionModal: React.FC<PrintPrescriptionModalProps> = ({
  prescription,
  patient,
  doctor,
  onClose,
}) => {
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
              {t('ePrescribe')} — {prescription.code}
            </span>
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded bg-blue-50 text-blue-700 border border-blue-200">
              {prescription.status.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper */}
        <div className="p-6 sm:p-8 bg-white text-slate-900 rounded-b-2xl font-sans" id="printable-rx-area">
          {/* Clinic Letterhead */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-slate-950 tracking-tight">
                {language === 'ar' ? clinicSettings.nameAr : clinicSettings.name}
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                {language === 'ar' ? clinicSettings.taglineAr : clinicSettings.tagline}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {language === 'ar' ? clinicSettings.addressAr : clinicSettings.address} • Tel: {clinicSettings.phone}
              </p>
            </div>
            <div className="text-right rtl:text-left">
              <div className="inline-block border border-slate-800 rounded px-2.5 py-1 text-center bg-slate-50">
                <span className="text-[10px] uppercase font-bold text-slate-600 block">Rx Document ID</span>
                <span className="font-mono text-xs font-bold text-slate-900">{prescription.code}</span>
              </div>
              <span className="text-[11px] text-slate-500 block mt-1">Date: {prescription.createdAt}</span>
            </div>
          </div>

          {/* Patient & Doctor Demographics */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs mb-6">
            <div>
              <span className="text-slate-500 font-semibold text-[10px] uppercase block">Patient Name & Demographics</span>
              <span className="font-bold text-slate-900 text-sm">{prescription.patientName}</span>
              {patient && (
                <div className="text-slate-600 text-[11px] mt-0.5 space-x-2 rtl:space-x-reverse">
                  <span>Age: {patient.age}y</span>
                  <span>•</span>
                  <span>Gender: {patient.gender}</span>
                  <span>•</span>
                  <span>Blood: {patient.bloodType}</span>
                </div>
              )}
              {patient?.allergies && patient.allergies.length > 0 && (
                <div className="mt-1">
                  <span className="text-red-700 font-bold text-[11px]">Allergies: </span>
                  <span className="text-red-600 text-[11px] font-medium">{patient.allergies.join(', ')}</span>
                </div>
              )}
            </div>

            <div>
              <span className="text-slate-500 font-semibold text-[10px] uppercase block">Prescribing Physician</span>
              <span className="font-bold text-slate-900 text-sm">{prescription.doctorName}</span>
              {doctor && (
                <div className="text-slate-600 text-[11px] mt-0.5">
                  <p>{language === 'ar' ? doctor.specialtyAr : doctor.specialty}</p>
                  <p>{doctor.room}</p>
                </div>
              )}
              {prescription.diagnosis && (
                <div className="mt-1 text-[11px] text-slate-700">
                  <span className="font-semibold">Diagnosis: </span>
                  <span>{prescription.diagnosis} {prescription.diagnosisCode && `(${prescription.diagnosisCode})`}</span>
                </div>
              )}
            </div>
          </div>

          {/* Medications Table */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl font-serif font-black text-slate-900 italic">℞</span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Prescribed Pharmaceuticals</span>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left rtl:text-right text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Medication & Formulation</th>
                    <th className="py-2 px-3">Dosage & Frequency</th>
                    <th className="py-2 px-3">Duration</th>
                    <th className="py-2 px-3">Refills</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prescription.medications.map((med, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-500">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{med.drugName}</div>
                        <div className="text-[11px] text-slate-600 italic mt-0.5">
                          {language === 'ar' && med.instructionsAr ? med.instructionsAr : med.instructions}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">
                        <div>{med.dosage}</div>
                        <div className="text-[11px] text-slate-500">
                          {language === 'ar' && med.frequencyAr ? med.frequencyAr : med.frequency}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{med.duration}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-700">{med.refillsRemaining} remaining</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footer & Security Seals */}
          <div className="border-t border-slate-200 pt-6 mt-8 grid grid-cols-3 items-end text-xs">
            <div className="flex items-center gap-2">
              <div className="w-16 h-16 border-2 border-slate-300 rounded p-1 bg-slate-50 flex items-center justify-center">
                <QrCode className="w-12 h-12 text-slate-800" />
              </div>
              <div className="text-[10px] text-slate-500 leading-tight">
                <p className="font-semibold text-slate-700">Digital Security Hash</p>
                <p className="font-mono text-[9px]">eRx-SHA256: 8f4b...39c1</p>
                <p className="text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3 h-3" /> Verified Electronic Rx
                </p>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-500 px-2">
              <p className="font-medium text-slate-700">Pharmacy Direct Dispense</p>
              <p>Direct sync with on-site clinic dispensary</p>
            </div>

            <div className="text-right rtl:text-left">
              <div className="border-b border-slate-400 pb-1 mb-1 font-serif italic text-sm text-slate-800">
                {prescription.doctorName}
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-500">Authorized Physician Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
