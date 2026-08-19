import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Role,
  Language,
  Patient,
  Doctor,
  Appointment,
  Prescription,
  DrugInventoryItem,
  IntakeSubmission,
  RefillRequest,
  ClinicNotification,
  PrescriptionStatus,
  AppointmentStatus,
  FinancialTransaction,
  POSProduct,
  POSCartItem,
  EcommerceProduct,
  AITriageResult,
  AIFinancialAnalysis,
  PatientNotification,
  DoctorAIBriefing,
  BillingInvoice,
  WalkInQueueItem,
  WalkInStatus,
  WalkInUrgency,
  LowStockAlert,
} from '../types';
import {
  INITIAL_PATIENTS,
  INITIAL_DOCTORS,
  INITIAL_APPOINTMENTS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_INVENTORY,
  INITIAL_INTAKES,
  INITIAL_REFILL_REQUESTS,
  INITIAL_NOTIFICATIONS,
} from '../data/mockData';
import { translations } from '../i18n/translations';

interface ClinicSettings {
  name: string;
  nameAr: string;
  tagline: string;
  taglineAr: string;
  accentColor: string;
  logoUrl?: string;
  phone: string;
  address: string;
  addressAr: string;
}

const INITIAL_FINANCIAL_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 'tx-101',
    date: '2026-08-18',
    type: 'income',
    category: 'Consultation Fee',
    source: 'Clinic Desk',
    description: 'Consultation - Dr. Sarah Mitchell (Patient: Sarah Al-Mansoor)',
    amount: 120.0,
    paymentMethod: 'Credit Card (Visa)',
    department: 'clinic',
    receiptNo: 'REC-2026-0891',
  },
  {
    id: 'tx-102',
    date: '2026-08-18',
    type: 'income',
    category: 'Prescription Sale',
    source: 'POS Terminal 1',
    description: 'Rx Dispensing #RX-8841 (Metformin 500mg, Lisinopril 10mg)',
    amount: 68.5,
    paymentMethod: 'Apple Pay',
    department: 'pharmacy',
    receiptNo: 'REC-2026-0892',
  },
  {
    id: 'tx-103',
    date: '2026-08-18',
    type: 'income',
    category: 'OTC Store Sale',
    source: 'E-Commerce / Online Store',
    description: 'Online Order #ORD-4412 (Vitamin C 1000mg, Omeprazole)',
    amount: 45.0,
    paymentMethod: 'Credit Card (Mastercard)',
    department: 'pharmacy',
    receiptNo: 'REC-2026-0893',
  },
  {
    id: 'tx-104',
    date: '2026-08-17',
    type: 'expense',
    category: 'Wholesale Pharmaceuticals',
    source: 'Supplier Invoice',
    description: 'Restock Batch #AMX-2026B (Amoxicillin 500mg, 100 units)',
    amount: 420.0,
    paymentMethod: 'Bank Wire',
    department: 'pharmacy',
    receiptNo: 'EXP-2026-0311',
  },
  {
    id: 'tx-105',
    date: '2026-08-17',
    type: 'expense',
    category: 'Medical Supplies',
    source: 'Clinic Operations',
    description: 'Sterile Syringes, Disposable Gloves, BP Cuffs Replacement',
    amount: 280.0,
    paymentMethod: 'Corporate Debit',
    department: 'clinic',
    receiptNo: 'EXP-2026-0312',
  },
  {
    id: 'tx-106',
    date: '2026-08-16',
    type: 'income',
    category: 'Lab Diagnostics',
    source: 'Clinic Lab Desk',
    description: 'Comprehensive Metabolic Panel + HbA1c Test',
    amount: 175.0,
    paymentMethod: 'Insurance Co-Pay',
    department: 'clinic',
    receiptNo: 'REC-2026-0888',
  },
  {
    id: 'tx-107',
    date: '2026-08-15',
    type: 'expense',
    category: 'Facility & Utilities',
    source: 'Admin Office',
    description: 'Medical Refrigeration & Clinic Electricity Utilities',
    amount: 350.0,
    paymentMethod: 'Direct Debit',
    department: 'facility',
    receiptNo: 'EXP-2026-0309',
  },
];

const INITIAL_ECOMMERCE_PRODUCTS: EcommerceProduct[] = [
  {
    id: 'ecom-1',
    name: 'Amoxicillin 500mg (Amoxil)',
    nameAr: 'أموكسيسيلين 500 ملغ',
    category: 'Prescription Antibiotic',
    price: 18.5,
    requiresPrescription: true,
    inStock: 48,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300',
    description: 'Broad-spectrum bactericidal penicillin-class antibiotic for bacterial infections.',
  },
  {
    id: 'ecom-2',
    name: 'Vitamin C 1000mg + Zinc Effervescent',
    nameAr: 'فيتامين سي 1000 ملغ فوار',
    category: 'Supplements & Wellness',
    price: 14.0,
    requiresPrescription: false,
    inStock: 120,
    image: 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=300',
    description: 'Daily immune defense support with high-potency antioxidant bioflavonoids.',
  },
  {
    id: 'ecom-3',
    name: 'Digital Blood Pressure Monitor (Arm)',
    nameAr: 'جهاز قياس ضغط الدم الرقمي',
    category: 'Medical Devices',
    price: 49.99,
    requiresPrescription: false,
    inStock: 15,
    image: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=300',
    description: 'Clinical accuracy upper-arm digital sphygmomanometer with memory log.',
  },
  {
    id: 'ecom-4',
    name: 'Paracetamol 500mg Rapid Relief (Panadol)',
    nameAr: 'باراسيتامول 500 ملغ بنادول',
    category: 'OTC Analgesic & Antipyretic',
    price: 6.5,
    requiresPrescription: false,
    inStock: 250,
    image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=300',
    description: 'Gentle on stomach, fast-acting relief for headaches and fevers.',
  },
  {
    id: 'ecom-5',
    name: 'Omeprazole 20mg Acid Reducer (Prilosec)',
    nameAr: 'أوميبرازول 20 ملغ للمعدة',
    category: 'Gastrointestinal Care',
    price: 22.0,
    requiresPrescription: false,
    inStock: 65,
    image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=300',
    description: 'Proton-pump inhibitor for relief of frequent heartburn and GERD.',
  },
  {
    id: 'ecom-6',
    name: 'Saline Nasal Hydration Spray (100ml)',
    nameAr: 'بخاخ ماء البحر للأنف',
    category: 'Respiratory Care',
    price: 9.75,
    requiresPrescription: false,
    inStock: 80,
    image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=300',
    description: 'Sterile hypertonic micro-diffusion sea water for sinus clearance.',
  },
];

const INITIAL_WALKIN_QUEUE: WalkInQueueItem[] = [
  {
    id: 'walkin-1',
    ticketNumber: 'W-201',
    patientName: 'Fahad Al-Hajri',
    patientPhone: '+966 50 998 1234',
    age: 38,
    gender: 'Male',
    chiefComplaint: 'Acute seasonal allergic conjunctivitis & rhinitis',
    chiefComplaintAr: 'حساسية موسمية حادة بالعين والأنف',
    urgency: 'priority',
    targetDoctorId: 'doc-2',
    targetDoctorName: 'Dr. Reem Baban, MD',
    assignedRoom: 'Suite 2A',
    arrivedAt: '09:40 AM',
    estimatedWaitMinutes: 10,
    status: 'waiting',
    triageVitals: {
      bp: '124/78',
      pulse: 76,
      temp: 36.8,
      spo2: 99,
    },
    notes: 'Patient requested immediate same-day evaluation with Dr. Reem.',
  },
  {
    id: 'walkin-2',
    ticketNumber: 'W-202',
    patientName: 'Layla Al-Otaibi',
    patientPhone: '+966 55 432 7890',
    age: 29,
    gender: 'Female',
    chiefComplaint: 'Sudden onset vertigo, mild migraine & light sensitivity',
    chiefComplaintAr: 'دوار مفاجئ وصداع نصفي خفيف مع حساسية للضوء',
    urgency: 'urgent_sameday',
    targetDoctorId: 'doc-1',
    targetDoctorName: 'Dr. Zaid Al-Husseini, MD',
    assignedRoom: 'Suite 4B',
    arrivedAt: '10:05 AM',
    estimatedWaitMinutes: 15,
    status: 'triaged',
    triageVitals: {
      bp: '138/88',
      pulse: 88,
      temp: 37.1,
      spo2: 98,
    },
    notes: 'Triage nurse logged elevated BP and moderate dizziness. Priority consultation queue.',
  },
  {
    id: 'walkin-3',
    ticketNumber: 'W-203',
    patientName: 'Hamad Al-Ghamdi',
    patientPhone: '+966 54 112 3344',
    age: 45,
    gender: 'Male',
    chiefComplaint: 'Chronic asthma inhaler review & routine BP check',
    chiefComplaintAr: 'متابعة بخاخ الربو المزمن وفحص ضغط الدم',
    urgency: 'routine',
    targetDoctorId: 'doc-3',
    targetDoctorName: 'Dr. Karim Najjar, MD',
    assignedRoom: 'Suite 3C',
    arrivedAt: '10:15 AM',
    estimatedWaitMinutes: 20,
    status: 'waiting',
    triageVitals: {
      bp: '128/82',
      pulse: 74,
      temp: 36.6,
      spo2: 98,
    },
    notes: 'Routine walk-in refill and chest auscultation review.',
  },
];

interface AppContextType {
  role: Role;
  setRole: (role: Role) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'ltr' | 'rtl';
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Data collections
  patients: Patient[];
  activePatientId: string;
  setActivePatientId: (id: string) => void;
  activePatient: Patient | undefined;

  doctors: Doctor[];
  activeDoctorId: string;
  setActiveDoctorId: (id: string) => void;
  activeDoctor: Doctor | undefined;

  // Appointments & Scheduling
  appointments: Appointment[];
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  bookAppointment: (apt: Omit<Appointment, 'id' | 'queueNumber'>) => void;
  rescheduleAppointment: (appointmentId: string, newDate: string, newTimeSlot: string) => void;

  // Walk-in / Wait-list Queue Hub
  walkInQueue: WalkInQueueItem[];
  addWalkInPatient: (walkIn: Omit<WalkInQueueItem, 'id' | 'ticketNumber' | 'arrivedAt' | 'status'>) => WalkInQueueItem;
  updateWalkInStatus: (id: string, status: WalkInStatus, targetDoctorId?: string, assignedRoom?: string) => void;
  removeWalkIn: (id: string) => void;
  convertWalkInToAppointment: (walkInId: string, doctorId: string, room?: string) => void;

  // Inventory & Automated Low-Stock Alert System
  inventory: DrugInventoryItem[];
  restockItem: (drugId: string, amount?: number) => void;
  reorderLowStockItem: (drugId: string, amount?: number) => void;
  bulkReorderAllLowStock: () => void;
  safetyStockThreshold: number;
  setSafetyStockThreshold: (val: number) => void;
  lowStockAlerts: LowStockAlert[];

  intakes: IntakeSubmission[];
  submitIntake: (intake: Omit<IntakeSubmission, 'id' | 'submittedAt' | 'status'>) => void;
  processIntake: (id: string) => void;

  refillRequests: RefillRequest[];
  requestRefill: (prescriptionId: string, medicationName: string, patientNote?: string) => void;
  resolveRefill: (refillId: string, approved: boolean) => void;

  notifications: ClinicNotification[];
  markNotificationRead: (id: string) => void;
  addNotification: (title: string, titleAr: string, message: string, messageAr: string, type: ClinicNotification['type']) => void;

  // Real-time Patient Notifications
  patientNotifications: PatientNotification[];
  markPatientNotificationRead: (id: string) => void;
  addPatientNotification: (notif: Omit<PatientNotification, 'id' | 'timestamp'>) => void;
  clearPatientNotifications: (patientId: string) => void;

  // Billing Invoices & Receipts
  invoices: BillingInvoice[];
  createInvoice: (invoice: BillingInvoice) => void;

  clinicSettings: ClinicSettings;
  updateClinicSettings: (settings: Partial<ClinicSettings>) => void;

  mobilePreview: boolean;
  setMobilePreview: (val: boolean) => void;

  // Financials & POS Hub
  transactions: FinancialTransaction[];
  addFinancialTransaction: (tx: Omit<FinancialTransaction, 'id' | 'receiptNo'>) => FinancialTransaction;
  posCart: POSCartItem[];
  addToPOSCart: (product: POSProduct) => void;
  removeFromPOSCart: (productId: string) => void;
  updatePOSCartQty: (productId: string, delta: number) => void;
  clearPOSCart: () => void;
  checkoutPOS: (customerName: string, paymentMethod: string, discount?: number, dept?: 'clinic' | 'pharmacy') => Promise<any>;

  // E-Commerce
  ecommerceProducts: EcommerceProduct[];
  ecomCart: { product: EcommerceProduct; quantity: number }[];
  addToEcomCart: (product: EcommerceProduct) => void;
  removeFromEcomCart: (productId: string) => void;
  clearEcomCart: () => void;
  placeEcomOrder: (orderDetails: { name: string; phone: string; address: string; deliveryType: string; paymentMethod: string }) => Promise<any>;

  // Gemini AI Assistants
  generateSOAPWithAI: (params: { patientInfo: string; symptoms: string; vitals?: any; existingConditions?: string; currentMeds?: string }) => Promise<any>;
  triagePatientWithAI: (params: { symptoms: string; duration: string; age?: number; gender?: string }) => Promise<AITriageResult>;
  getAIFinancialInsights: () => Promise<AIFinancialAnalysis>;
  getDoctorAIBriefing: (doctorId?: string) => Promise<DoctorAIBriefing>;
  callQueueTicket: (appointment: Appointment) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<Role>('doctor');
  const [language, setLanguage] = useState<Language>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobilePreview, setMobilePreview] = useState(false);

  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [activePatientId, setActivePatientId] = useState<string>('pat-1');

  const [doctors] = useState<Doctor[]>(INITIAL_DOCTORS);
  const [activeDoctorId, setActiveDoctorId] = useState<string>('doc-2');

  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [inventory, setInventory] = useState<DrugInventoryItem[]>(INITIAL_INVENTORY);
  const [intakes, setIntakes] = useState<IntakeSubmission[]>(INITIAL_INTAKES);
  const [refillRequests, setRefillRequests] = useState<RefillRequest[]>(INITIAL_REFILL_REQUESTS);
  const [notifications, setNotifications] = useState<ClinicNotification[]>(INITIAL_NOTIFICATIONS);

  // Walk-in / Wait-list Queue State
  const [walkInQueue, setWalkInQueue] = useState<WalkInQueueItem[]>(INITIAL_WALKIN_QUEUE);

  // Safety Stock Level Configuration State
  const [safetyStockThreshold, setSafetyStockThreshold] = useState<number>(30);

  // Real-time Patient Portal Notifications State
  const [patientNotifications, setPatientNotifications] = useState<PatientNotification[]>([
    {
      id: 'pnotif-1',
      patientId: 'pat-1',
      type: 'pickup_ready',
      title: 'Prescription Ready for Pickup',
      titleAr: 'الوصفة الطبية جاهزة للاستلام',
      message: 'Your prescribed Metformin and Lisinopril have been packaged and verified. Ready at Dispensary Box #14.',
      messageAr: 'تم تجهيز وتدقيق الميتفورمين والليسينوبريل. يمكنك استلامها من شباك الصيدلية رقم 14.',
      timestamp: '10 mins ago',
      read: false,
      urgency: 'important',
      relatedId: 'rx-1',
    },
    {
      id: 'pnotif-2',
      patientId: 'pat-1',
      type: 'appointment_reminder',
      title: 'Consultation Starting Soon',
      titleAr: 'موعد استشارتك يقترب',
      message: 'Dr. Reem Baban is reviewing your digital intake in Suite 2A. Please take a seat in waiting zone B.',
      messageAr: 'الدكتورة ريم بابان تقوم بمراجعة ملفك في الجناح 2أ. يرجى التفضل بالجلوس في منطقة الانتظار ب.',
      timestamp: '25 mins ago',
      read: false,
      urgency: 'urgent',
      relatedId: 'apt-1',
    },
    {
      id: 'pnotif-3',
      patientId: 'pat-1',
      type: 'refill_approved',
      title: '30-Day Refill Approved',
      titleAr: 'تمت الموافقة على إعادة صرف الدواء',
      message: 'Clinic physician approved your chronic medication refill request. Transmitted to dispensary.',
      messageAr: 'وافق الطبيب على طلب إعادة صرف دوائك المزمن. تم إرسال الطلب للصيدلية الملحقة.',
      timestamp: '2 hours ago',
      read: true,
      urgency: 'normal',
      relatedId: 'ref-1',
    },
  ]);

  // Billing Invoices State
  const [invoices, setInvoices] = useState<BillingInvoice[]>([
    {
      invoiceNumber: 'INV-2026-0891',
      date: '2026-08-18',
      dueDate: '2026-08-18',
      patientName: 'Sarah Al-Mansoor',
      patientNameAr: 'سارة المنصور',
      patientId: 'pat-1',
      patientPhone: '+966 50 123 4567',
      doctorName: 'Dr. Sarah Mitchell, MD',
      department: 'combined',
      items: [
        {
          description: 'Specialist Consultation (Cardiology & Internal)',
          code: 'CONS-401',
          quantity: 1,
          unitPrice: 120.0,
          total: 120.0,
        },
        {
          description: 'Metformin HCl 500mg (Glucophage - 90 Tabs)',
          code: 'DRUG-002',
          quantity: 1,
          unitPrice: 38.5,
          total: 38.5,
        },
        {
          description: 'Lisinopril 10mg (Zestril - 30 Tabs)',
          code: 'DRUG-004',
          quantity: 1,
          unitPrice: 30.0,
          total: 30.0,
        },
      ],
      subtotal: 188.5,
      taxAmount: 9.43,
      discount: 0.0,
      totalAmount: 197.93,
      paymentMethod: 'Credit Card (Visa - **** 4821)',
      paymentStatus: 'paid',
      notes: 'Consultation covered under Standard Care Policy. Electronic prescription dispensed via Latchwork attached pharmacy.',
    },
  ]);

  // Financials & POS State
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(INITIAL_FINANCIAL_TRANSACTIONS);
  const [posCart, setPosCart] = useState<POSCartItem[]>([]);
  const [ecommerceProducts] = useState<EcommerceProduct[]>(INITIAL_ECOMMERCE_PRODUCTS);
  const [ecomCart, setEcomCart] = useState<{ product: EcommerceProduct; quantity: number }[]>([]);

  const [clinicSettings, setClinicSettings] = useState<ClinicSettings>({
    name: 'Latchwork Medical Plaza & Dispensary',
    nameAr: 'مجمع لاتشورك الطبي والصيدلية الملحقة',
    tagline: 'Precision Care & Connected Dispensary',
    taglineAr: 'رعاية طبية دقيقة وصيدلية متكاملة',
    accentColor: '#EA580C', // Latchwork Copper Orange
    phone: '+966 11 400 9988',
    address: 'Building 4, Healthcare City, Suite 300',
    addressAr: 'مبنى 4، مدينة الرعاية الصحية، جناح 300',
  });

  const dir = language === 'ar' ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
    if (language === 'ar') {
      document.documentElement.classList.add('lang-ar');
    } else {
      document.documentElement.classList.remove('lang-ar');
    }
  }, [language, dir]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  const activePatient = patients.find((p) => p.id === activePatientId) || patients[0];
  const activeDoctor = doctors.find((d) => d.id === activeDoctorId) || doctors[0];

  const addNotification = (
    title: string,
    titleAr: string,
    message: string,
    messageAr: string,
    type: ClinicNotification['type']
  ) => {
    const newNotif: ClinicNotification = {
      id: `notif-${Date.now()}`,
      title,
      titleAr,
      message,
      messageAr,
      timestamp: 'Just now',
      type,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status } : apt))
    );
  };

  const rescheduleAppointment = (appointmentId: string, newDate: string, newTimeSlot: string) => {
    setAppointments((prev) =>
      prev.map((apt) => {
        if (apt.id === appointmentId) {
          const updated: Appointment = {
            ...apt,
            date: newDate,
            dateTime: `${newDate} ${newTimeSlot.split(' ')[0]}`,
            timeSlot: newTimeSlot,
            status: 'scheduled',
          };

          // Send real-time patient notification
          addPatientNotification({
            patientId: apt.patientId,
            type: 'appointment_reminder',
            title: 'Appointment Rescheduled Successfully',
            titleAr: 'تمت إعادة جدولة الموعد بنجاح',
            message: `Your visit with ${apt.doctorName} has been rescheduled to ${newDate} at ${newTimeSlot}. Queue Ticket #${apt.queueNumber}.`,
            messageAr: `تم تعديل موعدك مع ${apt.doctorName} إلى ${newDate} الساعة ${newTimeSlot}. تذكرة الدور #${apt.queueNumber}.`,
            read: false,
            urgency: 'important',
            relatedId: apt.id,
          });

          addNotification(
            'Appointment Rescheduled',
            'تمت إعادة جدولة موعد',
            `${apt.patientName} rescheduled with ${apt.doctorName} to ${newDate} at ${newTimeSlot}`,
            `قام المريض ${apt.patientName} بتعديل موعده مع ${apt.doctorName} إلى ${newDate} ${newTimeSlot}`,
            'appointment'
          );

          return updated;
        }
        return apt;
      })
    );
  };

  const bookAppointment = (aptData: Omit<Appointment, 'id' | 'queueNumber'>) => {
    const newApt: Appointment = {
      ...aptData,
      id: `apt-${Date.now()}`,
      queueNumber: appointments.length + 1,
      fee: aptData.fee || 120.0,
      paymentStatus: 'paid',
    };
    setAppointments((prev) => [...prev, newApt]);

    // Record financial income automatically
    addFinancialTransaction({
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      category: 'Consultation Fee',
      source: 'Online / Reception Booking',
      description: `Appointment with ${newApt.doctorName} for ${newApt.patientName} (${newApt.timeSlot})`,
      amount: newApt.fee || 120.0,
      paymentMethod: 'Credit Card (Online Booking)',
      department: 'clinic',
    });

    addNotification(
      'New Appointment Scheduled',
      'تم حجز موعد جديد',
      `${newApt.patientName} booked with ${newApt.doctorName} at ${newApt.timeSlot}`,
      `تم حجز موعد للمريض ${newApt.patientName} مع ${newApt.doctorName} في ${newApt.timeSlot}`,
      'appointment'
    );
  };

  // Walk-in / Wait-list Queue Management
  const addWalkInPatient = (
    walkInData: Omit<WalkInQueueItem, 'id' | 'ticketNumber' | 'arrivedAt' | 'status'>
  ): WalkInQueueItem => {
    const nextNum = 201 + walkInQueue.length;
    const ticketNumber = `W-${nextNum}`;
    const now = new Date();
    const arrivedAt = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newWalkIn: WalkInQueueItem = {
      ...walkInData,
      id: `walkin-${Date.now()}`,
      ticketNumber,
      arrivedAt,
      status: 'waiting',
      estimatedWaitMinutes:
        walkInData.estimatedWaitMinutes ||
        Math.max(10, walkInQueue.filter((w) => w.status === 'waiting').length * 10 + 10),
    };

    setWalkInQueue((prev) => [newWalkIn, ...prev]);

    addNotification(
      'New Walk-In Patient Registered',
      'تسجيل مريض بدون موعد مسبق',
      `Ticket #${ticketNumber} (${newWalkIn.patientName}) added to reception queue [${newWalkIn.urgency.toUpperCase()}]`,
      `تمت إضافة التذكرة #${ticketNumber} (${newWalkIn.patientName}) لقائمة الانتظار`,
      'appointment'
    );

    return newWalkIn;
  };

  const updateWalkInStatus = (
    id: string,
    status: WalkInStatus,
    targetDoctorId?: string,
    assignedRoom?: string
  ) => {
    setWalkInQueue((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return {
            ...item,
            status,
            targetDoctorId: targetDoctorId || item.targetDoctorId,
            assignedRoom: assignedRoom || item.assignedRoom,
          };
        }
        return item;
      })
    );
  };

  const removeWalkIn = (id: string) => {
    setWalkInQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const convertWalkInToAppointment = (walkInId: string, doctorId: string, room?: string) => {
    const walkIn = walkInQueue.find((w) => w.id === walkInId);
    if (!walkIn) return;

    const doc = doctors.find((d) => d.id === doctorId) || doctors[0];
    const now = new Date();
    const timeSlot = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    const newApt: Appointment = {
      id: `apt-walkin-${Date.now()}`,
      patientId: walkIn.patientId || `pat-${Date.now()}`,
      patientName: walkIn.patientName,
      patientPhone: walkIn.patientPhone,
      doctorId: doc.id,
      doctorName: doc.name,
      dateTime: `${dateStr} ${timeSlot}`,
      date: dateStr,
      timeSlot: `${timeSlot} (Walk-In)`,
      reason: `[WALK-IN] ${walkIn.chiefComplaint}`,
      reasonAr: walkIn.chiefComplaintAr || walkIn.chiefComplaint,
      status: 'in_consultation',
      room: room || walkIn.assignedRoom || doc.room,
      queueNumber: appointments.length + 1,
      isWalkIn: true,
      checkedInAt: walkIn.arrivedAt,
    };

    setAppointments((prev) => [newApt, ...prev]);
    updateWalkInStatus(walkInId, 'admitted', doc.id, room || doc.room);

    addNotification(
      'Walk-In Admitted to Doctor Schedule',
      'تم إدخال مريض الانتظار لجدول الطبيب',
      `${walkIn.patientName} (Ticket #${walkIn.ticketNumber}) admitted to ${doc.name}'s room (${room || doc.room})`,
      `تم إدخال ${walkIn.patientName} (${walkIn.ticketNumber}) لعيادة ${doc.name}`,
      'appointment'
    );
  };

  // Automated Low-Stock Alert System & 1-Click Reordering
  const reorderLowStockItem = (drugId: string, amount: number = 50) => {
    const item = inventory.find((i) => i.id === drugId);
    if (!item) return;

    restockItem(drugId, amount);

    addNotification(
      'Automated Stock PO Generated',
      'تم إصدار طلب توريد تلقائي للمخزون',
      `1-Click Reorder executed: +${amount} units of ${item.brandName} added to inventory.`,
      `تم تنفيذ إعادة الطلب السريع: +${amount} عبوة من ${item.brandName}.`,
      'stock'
    );
  };

  const bulkReorderAllLowStock = () => {
    const lowItems = inventory.filter(
      (i) => i.stockCount <= (i.reorderLevel || safetyStockThreshold)
    );
    if (lowItems.length === 0) return;

    lowItems.forEach((item) => {
      restockItem(item.id, 60);
    });

    addNotification(
      'Bulk Stock Replenishment Executed',
      'تم تنفيذ التزويد الشامل للأدوية المنخفضة',
      `Restocked ${lowItems.length} critical inventory lines with +60 units each.`,
      `تمت إعادة تزويد ${lowItems.length} أدوية منخفضة بـ 60 عبوة لكل صنف.`,
      'stock'
    );
  };

  // Derived low stock alerts
  const lowStockAlerts: LowStockAlert[] = inventory
    .filter((i) => i.stockCount <= (i.reorderLevel || safetyStockThreshold))
    .map((i) => ({
      id: `alert-${i.id}`,
      drugId: i.id,
      brandName: i.brandName,
      genericName: i.genericName,
      currentStock: i.stockCount,
      reorderLevel: i.reorderLevel || safetyStockThreshold,
      safetyThreshold: safetyStockThreshold,
      suggestedReorderQuantity: Math.max(50, safetyStockThreshold * 2 - i.stockCount),
      suggestedPackSize: 50,
      unitPrice: i.unitPrice,
      costPrice: i.costPrice || i.unitPrice * 0.55,
      category: i.category,
      severity: i.stockCount <= 10 ? 'critical' : 'warning',
      item: i,
    }));

  const createPrescription = (rxData: Omit<Prescription, 'id' | 'code' | 'createdAt'>): string => {
    const rxCode = `RX-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRx: Prescription = {
      ...rxData,
      id: `rx-${Date.now()}`,
      code: rxCode,
      createdAt: 'Just now',
      status: 'pending_dispense',
    };

    setPrescriptions((prev) => [newRx, ...prev]);

    // Add real-time sync notification
    addNotification(
      'New e-Prescription to Dispensary',
      'وصفة إلكترونية واردة للصيدلية',
      `${newRx.doctorName} sent ${rxCode} (${newRx.patientName}) to Dispensary Queue`,
      `أرسل ${newRx.doctorName} الوصفة ${rxCode} للمريض ${newRx.patientName} إلى الصيدلية`,
      'rx'
    );

    return rxCode;
  };

  const updatePrescriptionStatus = (id: string, status: PrescriptionStatus, notes?: string) => {
    setPrescriptions((prev) =>
      prev.map((rx) => {
        if (rx.id === id) {
          // If dispensed, deduct stock from inventory & record POS income
          if (status === 'dispensed' && rx.status !== 'dispensed') {
            rx.medications.forEach((med) => {
              setInventory((inv) =>
                inv.map((item) =>
                  item.id === med.drugId
                    ? { ...item, stockCount: Math.max(0, item.stockCount - 1) }
                    : item
                )
              );
            });

            // Auto-record pharmacy dispensing revenue
            addFinancialTransaction({
              date: new Date().toISOString().split('T')[0],
              type: 'income',
              category: 'Prescription Dispense',
              source: 'Dispensary Register',
              description: `Dispensed Rx #${rx.code} to ${rx.patientName} (${rx.medications.length} items)`,
              amount: rx.totalCost || 45.0,
              paymentMethod: 'Insurance / Card Copay',
              department: 'pharmacy',
            });
          }
          return {
            ...rx,
            status,
            pharmacyNotes: notes !== undefined ? notes : rx.pharmacyNotes,
            isDelivered: status === 'dispensed' ? true : rx.isDelivered,
          };
        }
        return rx;
      })
    );

    if (status === 'ready_for_pickup') {
      const rx = prescriptions.find((r) => r.id === id);
      if (rx) {
        addNotification(
          'Prescription Ready for Pickup',
          'الوصفة جاهزة للاستلام',
          `Rx ${rx.code} for ${rx.patientName} is packaged & ready in dispensary.`,
          `الوصفة ${rx.code} للمريض ${rx.patientName} جاهزة للاستلام بالصيدلية.`,
          'rx'
        );
      }
    }
  };

  const restockItem = (drugId: string, amount: number = 50) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === drugId) {
          const cost = (item.costPrice || item.unitPrice * 0.55) * amount;
          // Record wholesale expense
          addFinancialTransaction({
            date: new Date().toISOString().split('T')[0],
            type: 'expense',
            category: 'Wholesale Pharmaceuticals',
            source: 'Drug Distributor',
            description: `Restock ${amount} units of ${item.brandName} (${item.dosage})`,
            amount: parseFloat(cost.toFixed(2)),
            paymentMethod: 'Supplier Credit Line',
            department: 'pharmacy',
          });
          return { ...item, stockCount: item.stockCount + amount };
        }
        return item;
      })
    );
  };

  const submitIntake = (intakeData: Omit<IntakeSubmission, 'id' | 'submittedAt' | 'status'>) => {
    const newIntake: IntakeSubmission = {
      ...intakeData,
      id: `intake-${Date.now()}`,
      submittedAt: 'Just now',
      status: 'pending_review',
    };
    setIntakes((prev) => [newIntake, ...prev]);

    const existing = patients.find((p) => p.nationalId === newIntake.nationalId || p.phone === newIntake.phone);
    if (!existing) {
      const newPat: Patient = {
        id: `pat-${Date.now()}`,
        name: newIntake.patientName,
        age: 30,
        gender: (newIntake.gender as any) || 'female',
        phone: newIntake.phone,
        email: `${newIntake.patientName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
        nationalId: newIntake.nationalId,
        bloodType: 'A+',
        allergies: newIntake.knownAllergies && newIntake.knownAllergies !== 'None' ? [newIntake.knownAllergies] : [],
        chronicConditions: [],
        vitals: {
          bloodPressure: '120/80',
          heartRate: 72,
          oxygenSaturation: 99,
          temperature: 36.8,
          weightKg: 65,
          heightCm: 168,
          bmi: 23.0,
          lastRecorded: 'Today',
        },
      };
      setPatients((prev) => [...prev, newPat]);
    }

    addNotification(
      'New Digital Intake Submitted',
      'استمارة تسجيل مريض جديدة',
      `${newIntake.patientName} completed pre-visit digital intake.`,
      `أكمل ${newIntake.patientName} استمارة التسجيل الذاتي قبل الزيارة.`,
      'intake'
    );
  };

  const processIntake = (id: string) => {
    setIntakes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: 'processed' } : item))
    );
  };

  const requestRefill = (prescriptionId: string, medicationName: string, patientNote?: string) => {
    const rx = prescriptions.find((r) => r.id === prescriptionId);
    if (!rx) return;

    const newRefill: RefillRequest = {
      id: `refill-${Date.now()}`,
      prescriptionId,
      patientId: rx.patientId,
      patientName: rx.patientName,
      medicationName,
      requestedAt: 'Just now',
      status: 'pending',
      patientNote,
    };

    setRefillRequests((prev) => [newRefill, ...prev]);

    addNotification(
      'Prescription Refill Requested',
      'طلب تكرار وصفة وارد',
      `${rx.patientName} requested a refill for ${medicationName}`,
      `طلب المريض ${rx.patientName} إعادة صرف دواء ${medicationName}`,
      'rx'
    );
  };

  const resolveRefill = (refillId: string, approved: boolean) => {
    setRefillRequests((prev) =>
      prev.map((req) => {
        if (req.id === refillId) {
          return { ...req, status: approved ? 'approved' : 'rejected' };
        }
        return req;
      })
    );

    if (approved) {
      const req = refillRequests.find((r) => r.id === refillId);
      if (req) {
        addNotification(
          'Refill Request Approved',
          'تمت الموافقة على إعادة الصرف',
          `Dispensary approved refill for ${req.medicationName} (${req.patientName})`,
          `وافقت الصيدلية على طلب إعادة صرف ${req.medicationName} للمريض ${req.patientName}`,
          'rx'
        );
      }
    }
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const updateClinicSettings = (newSettings: Partial<ClinicSettings>) => {
    setClinicSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Financial & POS Operations
  const addFinancialTransaction = (txData: Omit<FinancialTransaction, 'id' | 'receiptNo'>): FinancialTransaction => {
    const newTx: FinancialTransaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      receiptNo: `${txData.type === 'income' ? 'REC' : 'EXP'}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setTransactions((prev) => [newTx, ...prev]);
    return newTx;
  };

  const addToPOSCart = (product: POSProduct) => {
    setPosCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromPOSCart = (productId: string) => {
    setPosCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updatePOSCartQty = (productId: string, delta: number) => {
    setPosCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as POSCartItem[]
    );
  };

  const clearPOSCart = () => {
    setPosCart([]);
  };

  const checkoutPOS = async (customerName: string, paymentMethod: string, discount: number = 0, dept: 'clinic' | 'pharmacy' = 'pharmacy') => {
    const subtotal = posCart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const tax = subtotal * 0.05;
    const total = Math.max(0, subtotal + tax - discount);

    const newTx = addFinancialTransaction({
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      category: dept === 'pharmacy' ? 'POS Dispensary Sale' : 'POS Clinic Service',
      source: `POS Counter #01`,
      description: `POS Checkout for ${customerName || 'Walk-in Customer'} (${posCart.length} items)`,
      amount: parseFloat(total.toFixed(2)),
      paymentMethod,
      department: dept,
    });

    // Deduct stock if pharmacy item
    posCart.forEach((item) => {
      if (item.product.type === 'pharmacy') {
        setInventory((inv) =>
          inv.map((d) => (d.id === item.product.id ? { ...d, stockCount: Math.max(0, d.stockCount - item.quantity) } : d))
        );
      }
    });

    clearPOSCart();

    return {
      transaction: newTx,
      receipt: {
        receiptNo: newTx.receiptNo,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        customerName: customerName || 'Valued Customer',
        items: posCart.map((i) => ({ name: i.product.name, price: i.product.price, qty: i.quantity, total: i.product.price * i.quantity })),
        subtotal: parseFloat(subtotal.toFixed(2)),
        tax: parseFloat(tax.toFixed(2)),
        discount,
        total: parseFloat(total.toFixed(2)),
        paymentMethod,
      },
    };
  };

  // E-Commerce Store
  const addToEcomCart = (product: EcommerceProduct) => {
    setEcomCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromEcomCart = (productId: string) => {
    setEcomCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearEcomCart = () => {
    setEcomCart([]);
  };

  const placeEcomOrder = async (orderDetails: { name: string; phone: string; address: string; deliveryType: string; paymentMethod: string }) => {
    const subtotal = ecomCart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const deliveryFee = orderDetails.deliveryType === 'delivery' ? 5.0 : 0.0;
    const total = subtotal + deliveryFee;

    const newTx = addFinancialTransaction({
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      category: 'E-Commerce Online Order',
      source: 'Latchwork Patient Web Store',
      description: `Online Order for ${orderDetails.name} (${ecomCart.length} items, ${orderDetails.deliveryType})`,
      amount: parseFloat(total.toFixed(2)),
      paymentMethod: orderDetails.paymentMethod,
      department: 'pharmacy',
    });

    clearEcomCart();

    addNotification(
      'New Online Pharmacy Order',
      'طلب صيدلية إلكتروني جديد',
      `Order ${newTx.receiptNo} received from ${orderDetails.name} ($${total.toFixed(2)})`,
      `تم استلام الطلب ${newTx.receiptNo} من المريض ${orderDetails.name} بمبلغ ${total.toFixed(2)}$`,
      'financial'
    );

    return {
      orderId: newTx.receiptNo,
      total,
      deliveryType: orderDetails.deliveryType,
    };
  };

  // Gemini AI Server API Callers
  const generateSOAPWithAI = async (params: { patientInfo: string; symptoms: string; vitals?: any; existingConditions?: string; currentMeds?: string }) => {
    try {
      const res = await fetch('/api/ai/soap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.error);
    } catch (e) {
      console.warn('Falling back to local clinical model:', e);
      return {
        subjective: `Patient presents with ${params.symptoms || 'reported chief complaint'}. Symptoms are persistent without acute distress.`,
        objective: `Vitals reviewed: BP ${params.vitals?.bloodPressure || '120/80'}, HR ${params.vitals?.heartRate || 72} bpm. Physical exam reveals clear lung fields, regular cardiac rate and rhythm.`,
        assessment: `Primary: Clinical evaluation for ${params.symptoms || 'reported symptoms'}.\nSecondary: Stable vital parameters.`,
        icd10: 'R68.89',
        plan: `1. Initiate targeted pharmaceutical therapy.\n2. Transmit electronic prescription to Latchwork dispensary.\n3. Return for clinical re-evaluation in 7-10 days if symptoms do not resolve.`,
      };
    }
  };

  const triagePatientWithAI = async (params: { symptoms: string; duration: string; age?: number; gender?: string }): Promise<AITriageResult> => {
    try {
      const res = await fetch('/api/ai/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.error);
    } catch (e) {
      return {
        recommendedSpecialty: 'General Practice & Internal Medicine',
        urgency: 'Priority',
        triageSummary: `Symptoms of "${params.symptoms}" require evaluation by an Internal Medicine or General Practice specialist.`,
        preVisitInstructions: 'Please arrive 10 minutes prior to your time slot. Bring your insurance card and current medication packaging.',
        suggestedDurationMinutes: 25,
        homeComfortAdvice: 'Maintain comfortable hydration and rest before your appointment.',
      };
    }
  };

  const getAIFinancialInsights = async (): Promise<AIFinancialAnalysis> => {
    try {
      const res = await fetch('/api/ai/financial-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summaryData: { transactions } }),
      });
      const data = await res.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.error);
    } catch (e) {
      return {
        executiveSummary: 'Latchwork Clinic & Dispensary demonstrate high financial performance with a 68.4% gross profit margin. Dispensary e-Rx capture rate from internal consultations exceeds 91%.',
        pharmacyMarginAnalysis: 'Pharmaceutical margins average 42% on prescription lines and 68% on OTC/wellness supplements. Bulk orders can yield a further 4.5% margin boost.',
        clinicCapacityAnalysis: 'Consultation room utilization peaks at 82% during morning and late afternoon hours. Midday appointment availability provides immediate expansion room.',
        strategicActionItems: [
          'Enable automated 30-day chronic prescription refill reminders on patient portal to boost dispensary retention.',
          'Package routine lab diagnostics (CMP + Lipid + HbA1c) into structured health check packages.',
          'Utilize POS barcode batching during peak 11 AM - 1 PM dispensary rush hours.',
        ],
        projectedNextMonthRevenue: '$48,500 - $54,200 (+12% MoM)',
        cashflowHealthScore: 94,
      };
    }
  };

  // Real-Time Patient Notification Management
  const markPatientNotificationRead = (id: string) => {
    setPatientNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const addPatientNotification = (notif: Omit<PatientNotification, 'id' | 'timestamp'>) => {
    const newNotif: PatientNotification = {
      ...notif,
      id: `pnotif-${Date.now()}`,
      timestamp: 'Just now',
    };
    setPatientNotifications((prev) => [newNotif, ...prev]);
  };

  const clearPatientNotifications = (patientId: string) => {
    setPatientNotifications((prev) => prev.filter((n) => n.patientId !== patientId));
  };

  // Billing Invoices Management
  const createInvoice = (invoice: BillingInvoice) => {
    setInvoices((prev) => [invoice, ...prev]);
  };

  // Doctor AI Briefing
  const getDoctorAIBriefing = async (doctorId?: string): Promise<DoctorAIBriefing> => {
    const doc = doctors.find((d) => d.id === doctorId) || activeDoctor;
    const docAppointments = appointments.filter((a) => a.doctorId === doc?.id);
    const pendingRxCount = prescriptions.filter((p) => p.status === 'pending_dispense').length;

    try {
      const res = await fetch('/api/ai/doctor-briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorName: doc?.name,
          specialty: doc?.specialty,
          appointments: docAppointments,
          pendingRxCount,
        }),
      });
      const data = await res.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.error);
    } catch (e) {
      return {
        greeting: `Good morning, ${doc?.name || 'Doctor'}. You have ${docAppointments.length} patient consultations scheduled for today's clinical session.`,
        timelineOverview: 'Morning schedule focuses on chronic care reviews, followed by 3 afternoon follow-ups and telemetry consultations.',
        clinicalReminders: [
          'Verify latest HbA1c and lipid panel trend for Sarah Al-Mansoor.',
          'Review Lisinopril blood pressure log and kidney function indicators.',
          'Check allergen status before submitting new medication orders to attached dispensary.',
        ],
        highPriorityPatients: [
          {
            name: 'Sarah Al-Mansoor',
            time: '09:30 AM',
            flag: 'Metabolic & Glycemic Review',
            prepRecommendation: 'Review last 14-day blood glucose logs and prepare Metformin titration note.',
          },
          {
            name: 'Rashid Al-Kuwari',
            time: '11:15 AM',
            flag: 'Severe Sulfa/NSAID Allergy Warning',
            prepRecommendation: 'Ensure no NSAID-based analgesics are selected in e-Rx composer.',
          },
        ],
        scheduleEfficiencyTip: 'Use 1-click AI SOAP documentation during physical exams to complete chart closures in under 3 minutes per encounter.',
        pendingRxSummary: `There are ${pendingRxCount} electronic prescriptions queued in dispensary.`,
      };
    }
  };

  // Queue Callout Voice/Screen Chime
  const callQueueTicket = (apt: Appointment) => {
    updateAppointmentStatus(apt.id, 'in_consultation');
    addNotification(
      `Patient Called to ${apt.room || 'Consultation Suite'}`,
      `تم استدعاء المريض إلى ${apt.room || 'عيادة الكشف'}`,
      `Calling Token #${apt.queueNumber || '1'} (${apt.patientName}) to ${apt.room}`,
      `نداء على التذكرة رقم ${apt.queueNumber || '1'} (${apt.patientName}) للتوجه إلى ${apt.room}`,
      'appointment'
    );
    addPatientNotification({
      patientId: apt.patientId,
      type: 'appointment_reminder',
      title: 'It is Your Turn!',
      titleAr: 'حان دورك الآن!',
      message: `Please proceed directly to ${apt.room} with ${apt.doctorName}.`,
      messageAr: `يرجى التوجه فوراً إلى ${apt.room} لمقابلة ${apt.doctorName}.`,
      read: false,
      urgency: 'urgent',
      relatedId: apt.id,
    });
  };

  return (
    <AppContext.Provider
      value={{
        role,
        setRole,
        language,
        setLanguage,
        t,
        dir,
        searchQuery,
        setSearchQuery,
        patients,
        activePatientId,
        setActivePatientId,
        activePatient,
        doctors,
        activeDoctorId,
        setActiveDoctorId,
        activeDoctor,
        appointments,
        updateAppointmentStatus,
        bookAppointment,
        rescheduleAppointment,

        // Walk-in / Wait-list Queue Hub
        walkInQueue,
        addWalkInPatient,
        updateWalkInStatus,
        removeWalkIn,
        convertWalkInToAppointment,

        prescriptions,
        createPrescription,
        updatePrescriptionStatus,

        // Inventory & Automated Low-Stock Alert System
        inventory,
        restockItem,
        reorderLowStockItem,
        bulkReorderAllLowStock,
        safetyStockThreshold,
        setSafetyStockThreshold,
        lowStockAlerts,
        intakes,
        submitIntake,
        processIntake,
        refillRequests,
        requestRefill,
        resolveRefill,
        notifications,
        markNotificationRead,
        addNotification,

        // Patient Notifications
        patientNotifications,
        markPatientNotificationRead,
        addPatientNotification,
        clearPatientNotifications,

        // Invoices
        invoices,
        createInvoice,

        clinicSettings,
        updateClinicSettings,
        mobilePreview,
        setMobilePreview,

        // Financials & POS
        transactions,
        addFinancialTransaction,
        posCart,
        addToPOSCart,
        removeFromPOSCart,
        updatePOSCartQty,
        clearPOSCart,
        checkoutPOS,

        // E-Commerce
        ecommerceProducts,
        ecomCart,
        addToEcomCart,
        removeFromEcomCart,
        clearEcomCart,
        placeEcomOrder,

        // AI Assistants
        generateSOAPWithAI,
        triagePatientWithAI,
        getAIFinancialInsights,
        getDoctorAIBriefing,
        callQueueTicket,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
