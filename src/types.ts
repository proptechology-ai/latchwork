export type Role = 'doctor' | 'pharmacy' | 'reception' | 'patient' | 'financial' | 'showcase';
export type Language = 'en' | 'ar';

export interface Patient {
  id: string;
  name: string;
  nameAr?: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email: string;
  nationalId: string;
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
  avatarUrl?: string;
  vitals?: {
    bloodPressure: string;
    heartRate: number;
    oxygenSaturation: number;
    temperature: number;
    weightKg: number;
    heightCm: number;
    bmi: number;
    lastRecorded: string;
  };
}

export interface Doctor {
  id: string;
  name: string;
  nameAr: string;
  specialty: string;
  specialtyAr: string;
  room: string;
  avatarUrl: string;
  consultationFee: number;
  availableDays: string[];
  scheduleHours: string;
  rating?: number;
  experienceYears?: number;
  bio?: string;
  availability?: string;
}

export interface DoctorTimeSlot {
  time: string;
  period: 'morning' | 'afternoon' | 'evening';
  available: boolean;
  bookedBy?: string;
}

export type AppointmentStatus = 'scheduled' | 'waiting' | 'in_consultation' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone?: string;
  doctorId: string;
  doctorName: string;
  dateTime: string;
  date?: string;
  timeSlot: string;
  reason: string;
  reasonAr?: string;
  status: AppointmentStatus;
  room: string;
  queueNumber: number;
  fee?: number;
  paymentStatus?: 'paid' | 'pending' | 'insurance_covered';
  checkedInAt?: string;
  isWalkIn?: boolean;
}

export interface PrescribedMedication {
  drugId: string;
  drugName: string;
  dosage: string;
  frequency: string;
  frequencyAr?: string;
  duration: string;
  instructions: string;
  instructionsAr?: string;
  refillsAllowed: number;
  refillsRemaining: number;
  price?: number;
}

export type PrescriptionStatus = 'pending_dispense' | 'verifying' | 'ready_for_pickup' | 'dispensed' | 'cancelled';

export interface Prescription {
  id: string;
  code: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  createdAt: string;
  diagnosis: string;
  diagnosisCode?: string;
  medications: PrescribedMedication[];
  status: PrescriptionStatus;
  pharmacyNotes?: string;
  allergyWarning?: string;
  totalCost: number;
  isDelivered?: boolean;
}

export interface DrugInventoryItem {
  id: string;
  genericName: string;
  brandName: string;
  dosage: string;
  form: 'tablet' | 'capsule' | 'syrup' | 'injection' | 'cream' | 'inhaler';
  stockCount: number;
  reorderLevel: number;
  unitPrice: number;
  costPrice?: number;
  batchNumber: string;
  expiryDate: string;
  category: string;
  contraindications: string[];
}

export interface IntakeSubmission {
  id: string;
  patientName: string;
  phone: string;
  nationalId: string;
  dob: string;
  gender: string;
  reasonForVisit: string;
  symptoms: string[];
  currentMedications: string;
  knownAllergies: string;
  emergencyContact: string;
  submittedAt: string;
  status: 'pending_review' | 'processed';
}

export interface RefillRequest {
  id: string;
  prescriptionId: string;
  patientId: string;
  patientName: string;
  medicationName: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  patientNote?: string;
}

export interface ClinicalEncounterNote {
  patientId: string;
  doctorId: string;
  date: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  icd10: string;
}

export interface ClinicNotification {
  id: string;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  timestamp: string;
  type: 'rx' | 'appointment' | 'stock' | 'intake' | 'financial';
  read: boolean;
}

// Financial & POS Types
export interface FinancialTransaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  source: string;
  description: string;
  amount: number;
  paymentMethod: string;
  department: 'clinic' | 'pharmacy' | 'facility';
  receiptNo: string;
}

export interface POSProduct {
  id: string;
  name: string;
  nameAr?: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  type: 'pharmacy' | 'clinic_service';
}

export interface POSCartItem {
  product: POSProduct;
  quantity: number;
}

export interface EcommerceProduct {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  price: number;
  requiresPrescription: boolean;
  inStock: number;
  image: string;
  description: string;
}

export interface AITriageResult {
  recommendedSpecialty: string;
  urgency: string;
  triageSummary: string;
  preVisitInstructions: string;
  suggestedDurationMinutes: number;
  homeComfortAdvice: string;
}

export interface AIFinancialAnalysis {
  executiveSummary: string;
  pharmacyMarginAnalysis: string;
  clinicCapacityAnalysis: string;
  strategicActionItems: string[];
  projectedNextMonthRevenue: string;
  cashflowHealthScore: number;
}

export interface PatientNotification {
  id: string;
  patientId: string;
  type: 'appointment_reminder' | 'rx_status' | 'pickup_ready' | 'refill_approved' | 'system';
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  urgency?: 'normal' | 'important' | 'urgent';
  relatedId?: string; // rxId or appointmentId
}

export interface DoctorAIBriefing {
  greeting: string;
  timelineOverview: string;
  clinicalReminders: string[];
  highPriorityPatients: {
    name: string;
    time: string;
    flag: string;
    prepRecommendation: string;
  }[];
  scheduleEfficiencyTip: string;
  pendingRxSummary: string;
}

export interface BillingInvoice {
  id?: string;
  invoiceNumber: string;
  date: string;
  dueDate?: string;
  patientName: string;
  patientNameAr?: string;
  patientId: string;
  patientPhone?: string;
  doctorId?: string;
  doctorName?: string;
  department: 'clinic' | 'pharmacy' | 'combined';
  items: {
    id?: string;
    description: string;
    code?: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending' | 'partially_paid';
  notes?: string;
}

export type WalkInUrgency = 'emergency' | 'urgent_sameday' | 'priority' | 'routine';
export type WalkInStatus = 'waiting' | 'triaged' | 'called' | 'admitted' | 'completed' | 'cancelled';

export interface WalkInQueueItem {
  id: string;
  ticketNumber: string; // e.g. "W-201"
  patientName: string;
  patientPhone: string;
  patientId?: string;
  nationalId?: string;
  age?: number;
  gender?: string;
  chiefComplaint: string;
  chiefComplaintAr?: string;
  urgency: WalkInUrgency;
  targetDoctorId?: string;
  targetDoctorName?: string;
  assignedRoom?: string;
  arrivedAt: string;
  estimatedWaitMinutes: number;
  status: WalkInStatus;
  notes?: string;
  triageVitals?: {
    bp?: string;
    pulse?: number;
    temp?: number;
    spo2?: number;
  };
}

export interface LowStockAlert {
  id: string;
  drugId: string;
  brandName: string;
  genericName: string;
  currentStock: number;
  reorderLevel: number;
  safetyThreshold: number;
  suggestedReorderQuantity: number;
  suggestedPackSize?: number;
  unitPrice: number;
  costPrice: number;
  category: string;
  severity: 'critical' | 'warning' | 'low';
  lastReorderedAt?: string;
  item: DrugInventoryItem;
}

