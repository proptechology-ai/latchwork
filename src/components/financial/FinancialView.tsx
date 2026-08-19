import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  ShoppingCart,
  Receipt,
  Sparkles,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Pill,
  Stethoscope,
  Search,
  CheckCircle2,
  Trash2,
  Printer,
  X,
  Package,
  Layers,
  Truck,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { POSProduct, FinancialTransaction, EcommerceProduct, AIFinancialAnalysis, BillingInvoice } from '../../types';
import { FinancialCharts } from './FinancialCharts';
import { PrintInvoiceModal } from '../common/PrintInvoiceModal';

export const FinancialView: React.FC = () => {
  const {
    t,
    language,
    transactions,
    addFinancialTransaction,
    posCart,
    addToPOSCart,
    removeFromPOSCart,
    updatePOSCartQty,
    clearPOSCart,
    checkoutPOS,
    inventory,
    ecommerceProducts,
    ecomCart,
    addToEcomCart,
    removeFromEcomCart,
    placeEcomOrder,
    getAIFinancialInsights,
    clinicSettings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'pos' | 'income' | 'expenses' | 'ecommerce' | 'ai_insights'>('dashboard');

  // POS State
  const [posSearch, setPosSearch] = useState('');
  const [posCategory, setPosCategory] = useState<string>('all');
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card (Visa)');
  const [posDiscount, setPosDiscount] = useState<number>(0);
  const [lastReceipt, setLastReceipt] = useState<any | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // New Expense Modal State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExpCategory, setNewExpCategory] = useState('Wholesale Pharmaceuticals');
  const [newExpDept, setNewExpDept] = useState<'clinic' | 'pharmacy' | 'facility'>('pharmacy');
  const [newExpAmount, setNewExpAmount] = useState<number>(150);
  const [newExpDesc, setNewExpDesc] = useState('');
  const [newExpPayment, setNewExpPayment] = useState('Bank Wire');

  // E-Commerce Checkout Modal
  const [showEcomModal, setShowEcomModal] = useState(false);
  const [ecomName, setEcomName] = useState('Sarah Al-Mansoor');
  const [ecomPhone, setEcomPhone] = useState('+966 50 123 4567');
  const [ecomAddress, setEcomAddress] = useState('Al-Olaya District, Riyadh');
  const [ecomDeliveryType, setEcomDeliveryType] = useState('pickup');
  const [ecomPayment, setEcomPayment] = useState('Online Card');
  const [ecomSuccessOrder, setEcomSuccessOrder] = useState<any | null>(null);

  // AI Financial Insights State
  const [aiInsights, setAiInsights] = useState<AIFinancialAnalysis | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [selectedInvoiceToPrint, setSelectedInvoiceToPrint] = useState<BillingInvoice | null>(null);

  const handlePrintTransactionInvoice = (tx: FinancialTransaction) => {
    const inv: BillingInvoice = {
      id: `inv-${tx.id}`,
      invoiceNumber: tx.receiptNo,
      patientId: 'PAT-8841',
      patientName: tx.description.includes('(') ? tx.description.split('(')[1].replace(')', '') : 'Sarah Al-Mansoor',
      patientPhone: '+966 50 123 4567',
      doctorId: 'doc-1',
      doctorName: 'Dr. Zaid Al-Husseini',
      department: tx.department === 'clinic' ? 'clinic' : 'pharmacy',
      date: tx.date,
      items: [
        {
          id: 'item-1',
          description: tx.description,
          code: tx.department === 'clinic' ? 'MED-CONS-01' : 'RX-PHARM-01',
          quantity: 1,
          unitPrice: tx.amount,
          total: tx.amount,
        },
      ],
      subtotal: tx.amount,
      taxAmount: tx.amount * 0.05,
      discount: 0,
      totalAmount: tx.amount * 1.05,
      paymentMethod: tx.paymentMethod || 'Credit Card (Visa)',
      paymentStatus: 'paid',
      notes: `Official Latchwork Plaza Tax Receipt for ${tx.department.toUpperCase()} encounter. Verified electronic invoice.`,
    };
    setSelectedInvoiceToPrint(inv);
  };

  // Calculate totals
  const totalIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalExpenses = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const netProfit = totalIncome - totalExpenses;
  const marginPercent = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

  const clinicIncome = transactions
    .filter((tx) => tx.type === 'income' && tx.department === 'clinic')
    .reduce((acc, tx) => acc + tx.amount, 0);

  const pharmacyIncome = transactions
    .filter((tx) => tx.type === 'income' && tx.department === 'pharmacy')
    .reduce((acc, tx) => acc + tx.amount, 0);

  // POS Available Catalog combining Pharmacy items & Clinic services
  const posProductsList: POSProduct[] = [
    // Clinic services
    { id: 'srv-1', name: 'General Physician Consultation', nameAr: 'استشارة طب عام', sku: 'SRV-CONS-01', category: 'Clinic Services', price: 120.0, stock: 999, type: 'clinic_service' },
    { id: 'srv-2', name: 'Specialist Consultation (Cardiology/Endo)', nameAr: 'استشارة استشاري تخصصي', sku: 'SRV-CONS-02', category: 'Clinic Services', price: 150.0, stock: 999, type: 'clinic_service' },
    { id: 'srv-3', name: 'Comprehensive Metabolic Lab Panel', nameAr: 'فحص وظائف الجسم الشامل', sku: 'SRV-LAB-01', category: 'Laboratory', price: 175.0, stock: 999, type: 'clinic_service' },
    { id: 'srv-4', name: 'ECG / Electrocardiogram 12-Lead', nameAr: 'تخطيط قلب 12 مسار', sku: 'SRV-LAB-02', category: 'Laboratory', price: 85.0, stock: 999, type: 'clinic_service' },
    { id: 'srv-5', name: 'Wound Dressing & Sterile Bandaging', nameAr: 'تضميد جروح وتعقيم', sku: 'SRV-NURS-01', category: 'Nursing', price: 45.0, stock: 999, type: 'clinic_service' },
    // Pharmacy items from inventory
    ...inventory.map((item) => ({
      id: item.id,
      name: `${item.brandName} (${item.genericName}) ${item.dosage}`,
      nameAr: item.brandName,
      sku: item.batchNumber,
      category: item.category,
      price: item.unitPrice,
      stock: item.stockCount,
      type: 'pharmacy' as const,
    })),
  ];

  const filteredPOSProducts = posProductsList.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(posSearch.toLowerCase()) || p.sku.toLowerCase().includes(posSearch.toLowerCase());
    const matchesCat = posCategory === 'all' || (posCategory === 'clinic' && p.type === 'clinic_service') || (posCategory === 'pharmacy' && p.type === 'pharmacy');
    return matchesSearch && matchesCat;
  });

  const posSubtotal = posCart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const posTax = posSubtotal * 0.05;
  const posTotal = Math.max(0, posSubtotal + posTax - posDiscount);

  const handlePOSCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (posCart.length === 0) return;
    setIsCheckingOut(true);
    try {
      const result = await checkoutPOS(customerName, paymentMethod, posDiscount, 'pharmacy');
      setLastReceipt(result.receipt);
      setCustomerName('');
      setPosDiscount(0);
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpDesc || newExpAmount <= 0) return;
    addFinancialTransaction({
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      category: newExpCategory,
      source: 'Internal Clinic Admin',
      description: newExpDesc,
      amount: Number(newExpAmount),
      paymentMethod: newExpPayment,
      department: newExpDept,
    });
    setShowExpenseModal(false);
    setNewExpDesc('');
    setNewExpAmount(150);
  };

  const handleRunAIFinancials = async () => {
    setIsLoadingAI(true);
    try {
      const analysis = await getAIFinancialInsights();
      setAiInsights(analysis);
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handlePlaceEcomOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (ecomCart.length === 0) return;
    const res = await placeEcomOrder({
      name: ecomName,
      phone: ecomPhone,
      address: ecomAddress,
      deliveryType: ecomDeliveryType,
      paymentMethod: ecomPayment,
    });
    setEcomSuccessOrder(res);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Top Header & Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-600 animate-pulse" />
            <span>Latchwork Ledger & POS Operating Engine</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {t('financialTitle')}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Integrated revenue accounting, real-time POS cashiering, pharmacy e-commerce, and AI cashflow forecasting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('pos');
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Launch POS Terminal</span>
          </button>
          <button
            onClick={() => setShowExpenseModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs shadow-sm transition-all"
          >
            <Plus className="w-4 h-4 text-orange-600" />
            <span>{t('addExpense')}</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Income */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('totalIncome')}</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <span>+14.8% vs last month</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('totalExpenses')}</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-[11px] text-slate-500 font-medium">Wholesale meds & facility ops</div>
        </div>

        {/* Net Profit */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{t('netProfit')}</span>
            <div className="p-1.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600">${netProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-[11px] text-slate-600 font-semibold">Operating Margin: {marginPercent}%</div>
        </div>

        {/* Department Ratio */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Revenue Breakdown</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xs font-bold text-slate-800 space-y-1 pt-1">
            <div className="flex justify-between">
              <span className="text-slate-500 flex items-center gap-1"><Stethoscope className="w-3 h-3 text-blue-600" /> Clinic:</span>
              <span className="font-bold font-mono">${clinicIncome.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 flex items-center gap-1"><Pill className="w-3 h-3 text-orange-600" /> Pharmacy:</span>
              <span className="font-bold font-mono">${pharmacyIncome.toFixed(0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-1.5 px-3.5 py-2 font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'dashboard' ? 'bg-orange-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{t('tabFinancialDashboard')}</span>
        </button>

        <button
          onClick={() => setActiveTab('pos')}
          className={`flex items-center gap-1.5 px-3.5 py-2 font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'pos' ? 'bg-orange-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>{t('tabPOSTerminal')}</span>
          {posCart.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-white text-orange-700 text-[10px] font-black">
              {posCart.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('income')}
          className={`flex items-center gap-1.5 px-3.5 py-2 font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'income' ? 'bg-orange-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
          <span>{t('tabIncome')}</span>
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-1.5 px-3.5 py-2 font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'expenses' ? 'bg-orange-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ArrowDownRight className="w-3.5 h-3.5 text-rose-600" />
          <span>{t('tabExpenses')}</span>
        </button>

        <button
          onClick={() => setActiveTab('ecommerce')}
          className={`flex items-center gap-1.5 px-3.5 py-2 font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'ecommerce' ? 'bg-orange-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-3.5 h-3.5 text-sky-600" />
          <span>{t('tabEcommerceStore')}</span>
          {ecomCart.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-sky-100 text-sky-800 text-[10px] font-black">
              {ecomCart.length}
            </span>
          )}
        </button>

        <button
          onClick={() => {
            setActiveTab('ai_insights');
            if (!aiInsights) {
              handleRunAIFinancials();
            }
          }}
          className={`flex items-center gap-1.5 px-3.5 py-2 font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'ai_insights' ? 'bg-orange-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>{t('tabAIAnalytics')}</span>
        </button>
      </div>

      {/* 1. DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Recharts Analytics Dashboard */}
          <FinancialCharts />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Recent Transactions Feed */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-orange-600" />
                  <span>Real-Time Transaction Ledger</span>
                </h3>
                <span className="text-xs font-semibold text-slate-500 font-mono">{transactions.length} entries</span>
              </div>

              <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
                {transactions.slice(0, 8).map((tx) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-lg transition-colors text-xs group">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg mt-0.5 ${
                          tx.type === 'income' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'
                        }`}
                      >
                        {tx.type === 'income' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{tx.description}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-mono">{tx.receiptNo}</span>
                          <span>•</span>
                          <span>{tx.paymentMethod}</span>
                          <span>•</span>
                          <span className="capitalize px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px]">{tx.department}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`font-mono font-bold text-sm ${tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {tx.type === 'income' ? '+' : '-'}${tx.amount.toFixed(2)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">{tx.date}</div>
                      </div>
                      <button
                        onClick={() => handlePrintTransactionInvoice(tx)}
                        title="Print / Export Tax Invoice"
                        className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg border border-transparent hover:border-orange-200 transition-all cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions & Department P&L */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                <h3 className="font-bold text-sm text-slate-900">Department Performance</h3>
                <div className="space-y-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600">Attached Dispensary (Pharmacy)</span>
                      <span className="font-mono text-slate-900">${pharmacyIncome.toFixed(2)}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full"
                        style={{ width: `${totalIncome > 0 ? (pharmacyIncome / totalIncome) * 100 : 50}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-600">Consultations & Medical Services</span>
                      <span className="font-mono text-slate-900">${clinicIncome.toFixed(2)}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full"
                        style={{ width: `${totalIncome > 0 ? (clinicIncome / totalIncome) * 100 : 50}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex gap-2">
                  <button
                    onClick={() => setActiveTab('pos')}
                    className="flex-1 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs text-center transition-colors"
                  >
                    Open POS Terminal
                  </button>
                  <button
                    onClick={() => setActiveTab('ecommerce')}
                    className="flex-1 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs text-center transition-colors"
                  >
                    Online Store
                  </button>
                </div>
              </div>

              {/* Gemini Financial AI Banner */}
              <div className="bg-gradient-to-br from-orange-950 to-slate-900 text-white rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-orange-200">Gemini Financial Intelligence</h4>
                    <p className="text-[10px] text-slate-300">Automated gross profit analysis & margin forecasting</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setActiveTab('ai_insights');
                    handleRunAIFinancials();
                  }}
                  className="w-full py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow transition-colors flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Compute AI Financial Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. POS CASHIER TERMINAL */}
      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Products & Services Grid (Col 7) */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-orange-600" />
                <span>{t('posCashierTitle')}</span>
              </h3>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPosCategory('all')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold ${posCategory === 'all' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  All Items
                </button>
                <button
                  onClick={() => setPosCategory('pharmacy')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold ${posCategory === 'pharmacy' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Pharmacy / Rx
                </button>
                <button
                  onClick={() => setPosCategory('clinic')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold ${posCategory === 'clinic' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  Clinic Services
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={t('scanOrSearchItem')}
                value={posSearch}
                onChange={(e) => setPosSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white"
              />
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1">
              {filteredPOSProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => addToPOSCart(product)}
                  className="p-3 rounded-xl border border-slate-200 hover:border-orange-400 bg-slate-50/50 hover:bg-white transition-all cursor-pointer flex flex-col justify-between space-y-2 group shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-mono text-slate-500 font-semibold">{product.sku}</span>
                      <span className={`px-1.5 py-0.5 rounded font-bold ${product.type === 'clinic_service' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                        {product.type === 'clinic_service' ? 'Clinic Service' : `Stock: ${product.stock}`}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                      {product.name}
                    </h4>
                    <p className="text-[10px] text-slate-500">{product.category}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                    <span className="text-sm font-black text-slate-900 font-mono">${product.price.toFixed(2)}</span>
                    <button className="px-2.5 py-1 rounded bg-orange-100 group-hover:bg-orange-600 group-hover:text-white text-orange-700 text-[11px] font-bold transition-colors">
                      + Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* POS Cart & Checkout (Col 5) */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-orange-600" />
                  <span>{t('posCart')}</span>
                </h3>
                {posCart.length > 0 && (
                  <button onClick={clearPOSCart} className="text-xs text-rose-600 hover:underline font-semibold">
                    Clear Cart
                  </button>
                )}
              </div>

              {/* Cart items list */}
              {posCart.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs space-y-2">
                  <ShoppingCart className="w-8 h-8 mx-auto text-slate-300" />
                  <p>{t('emptyCartMsg')}</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto divide-y divide-slate-100">
                  {posCart.map((item) => (
                    <div key={item.product.id} className="pt-2 flex items-center justify-between text-xs">
                      <div className="pr-2 flex-1">
                        <div className="font-bold text-slate-900 line-clamp-1">{item.product.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">${item.product.price.toFixed(2)} each</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                          <button
                            onClick={() => updatePOSCartQty(item.product.id, -1)}
                            className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 font-bold"
                          >
                            -
                          </button>
                          <span className="px-2 font-mono font-bold text-slate-900">{item.quantity}</span>
                          <button
                            onClick={() => updatePOSCartQty(item.product.id, 1)}
                            className="px-2 py-0.5 text-slate-600 hover:bg-slate-200 font-bold"
                          >
                            +
                          </button>
                        </div>
                        <span className="font-mono font-bold text-slate-900 w-14 text-right">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeFromPOSCart(item.product.id)}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Order Summary & Payment */}
            <form onSubmit={handlePOSCheckout} className="space-y-3 pt-3 border-t border-slate-200 text-xs">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-600">{t('customerNameOptional')}</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Al-Mansoor"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-orange-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">{t('paymentMethod')}</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-orange-600"
                  >
                    <option value="Credit Card (Visa)">Credit Card (Visa)</option>
                    <option value="Credit Card (Mastercard)">Mastercard</option>
                    <option value="Apple Pay">Apple Pay / Contactless</option>
                    <option value="Cash">Cash Currency</option>
                    <option value="Insurance Co-Pay">Insurance Co-Pay</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600">Discount ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={posDiscount}
                    onChange={(e) => setPosDiscount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:border-orange-600"
                  />
                </div>
              </div>

              {/* Totals */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1 text-xs font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>{t('subtotal')}:</span>
                  <span>${posSubtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t('taxVat')}:</span>
                  <span>${posTax.toFixed(2)}</span>
                </div>
                {posDiscount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount:</span>
                    <span>-${posDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-900 font-black text-sm pt-1 border-t border-slate-200">
                  <span>{t('totalAmount')}:</span>
                  <span className="text-orange-600">${posTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={posCart.length === 0 || isCheckingOut}
                className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>{isCheckingOut ? 'Processing Payment...' : t('checkoutAndPrint')}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 3. INCOME TRANSACTIONS */}
      {activeTab === 'income' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                <span>Clinic & Pharmacy Revenue Ledger</span>
              </h3>
              <p className="text-xs text-slate-500">Itemized record of all incoming consultation fees, Rx dispensing, and lab sales.</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-semibold block">Total Inflow</span>
              <span className="text-lg font-black text-emerald-600 font-mono">${totalIncome.toFixed(2)}</span>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {transactions
              .filter((t) => t.type === 'income')
              .map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{tx.description}</div>
                    <div className="text-slate-500 text-[11px] flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-bold text-slate-700">{tx.receiptNo}</span>
                      <span>•</span>
                      <span>{tx.category}</span>
                      <span>•</span>
                      <span>{tx.paymentMethod}</span>
                      <span>•</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] uppercase font-bold">{tx.department}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-black text-emerald-600 text-sm">+${tx.amount.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{tx.date}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 4. EXPENSES & PROCUREMENT */}
      {activeTab === 'expenses' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <ArrowDownRight className="w-4 h-4 text-rose-600" />
                <span>Operating Expenses & Wholesale Procurement</span>
              </h3>
              <p className="text-xs text-slate-500">Track drug supplier orders, consumable medical supplies, and facility costs.</p>
            </div>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Expense</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {transactions
              .filter((t) => t.type === 'expense')
              .map((tx) => (
                <div key={tx.id} className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg text-xs">
                  <div>
                    <div className="font-bold text-slate-900">{tx.description}</div>
                    <div className="text-slate-500 text-[11px] flex items-center gap-2 mt-0.5">
                      <span className="font-mono font-bold text-slate-700">{tx.receiptNo}</span>
                      <span>•</span>
                      <span>{tx.category}</span>
                      <span>•</span>
                      <span>{tx.paymentMethod}</span>
                      <span>•</span>
                      <span className="px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 text-[10px] uppercase font-bold">{tx.department}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-black text-rose-600 text-sm">-${tx.amount.toFixed(2)}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{tx.date}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* 5. PHARMACY E-COMMERCE STORE */}
      {activeTab === 'ecommerce' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-600" />
                <span>{t('ecomTitle')}</span>
              </h3>
              <p className="text-xs text-slate-500">Live storefront for patients to purchase OTC medications, supplements, and home care devices.</p>
            </div>

            {ecomCart.length > 0 && (
              <button
                onClick={() => setShowEcomModal(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Checkout Cart ({ecomCart.length} items)</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ecommerceProducts.map((prod) => (
              <div key={prod.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs flex flex-col justify-between hover:border-orange-400 transition-all">
                <div className="h-36 bg-slate-100 overflow-hidden relative">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {prod.requiresPrescription ? (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-rose-900/90 text-white text-[10px] font-bold backdrop-blur-xs">
                      Rx Required
                    </span>
                  ) : (
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-800/90 text-white text-[10px] font-bold backdrop-blur-xs">
                      OTC Available
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">{prod.category}</span>
                    <h4 className="font-bold text-xs text-slate-900">{language === 'ar' ? prod.nameAr : prod.name}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{prod.description}</p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-base font-black text-slate-900 font-mono">${prod.price.toFixed(2)}</span>
                      <span className="text-[10px] text-slate-400 block">Stock: {prod.inStock}</span>
                    </div>

                    <button
                      onClick={() => addToEcomCart(prod)}
                      className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-2xs transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('addToCart')}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. AI FINANCIAL INTELLIGENCE */}
      {activeTab === 'ai_insights' && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-orange-50 text-orange-600 border border-orange-200">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">Gemini Clinical Financial Auditor</h3>
                <p className="text-xs text-slate-500">Autonomous analysis of clinic capacity, pharmacy gross margins, and revenue trajectory.</p>
              </div>
            </div>

            <button
              onClick={handleRunAIFinancials}
              disabled={isLoadingAI}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>{isLoadingAI ? 'Analyzing Financial Data...' : 'Re-Run Financial Audit'}</span>
            </button>
          </div>

          {isLoadingAI ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-slate-700">Synthesizing revenue streams & running predictive models...</p>
            </div>
          ) : aiInsights ? (
            <div className="space-y-6 text-xs">
              {/* Executive Summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700">Executive Overview</span>
                <p className="text-slate-800 leading-relaxed font-medium">{aiInsights.executiveSummary}</p>
              </div>

              {/* 2 Column breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Dispensary Margin Analysis</span>
                  <p className="text-slate-700 leading-relaxed">{aiInsights.pharmacyMarginAnalysis}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Clinic Capacity & Booking Yield</span>
                  <p className="text-slate-700 leading-relaxed">{aiInsights.clinicCapacityAnalysis}</p>
                </div>
              </div>

              {/* Strategic Action Items */}
              <div className="p-4 rounded-xl bg-orange-50/50 border border-orange-200 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-800">
                  Strategic Action Items for Operating Margin Expansion
                </span>
                <div className="space-y-2">
                  {aiInsights.strategicActionItems.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Projections */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Next 30-Day Projected Revenue</span>
                  <span className="text-lg font-black text-slate-900 font-mono mt-1 block">{aiInsights.projectedNextMonthRevenue}</span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Cashflow Health Score</span>
                  <span className="text-lg font-black text-emerald-600 font-mono mt-1 block">{aiInsights.cashflowHealthScore} / 100</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* MODAL: POS Itemized Receipt */}
      {lastReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="font-bold text-sm text-slate-900">Transaction Successful</span>
              </div>
              <button onClick={() => setLastReceipt(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Official Printable Slip */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 font-mono text-xs">
              <div className="text-center border-b border-slate-200 pb-2">
                <h4 className="font-bold text-slate-900 text-sm">{clinicSettings.name}</h4>
                <p className="text-[10px] text-slate-500">Official POS Tax Invoice</p>
                <p className="text-[10px] text-slate-500">Receipt #{lastReceipt.receiptNo}</p>
                <p className="text-[10px] text-slate-400">{lastReceipt.date} • {lastReceipt.time}</p>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="text-slate-600">Customer: <span className="font-bold text-slate-900">{lastReceipt.customerName}</span></div>
                <div className="text-slate-600">Payment: <span className="font-bold text-slate-900">{lastReceipt.paymentMethod}</span></div>
              </div>

              <div className="divide-y divide-slate-200 border-t border-b border-slate-200 py-2">
                {lastReceipt.items?.map((it: any, i: number) => (
                  <div key={i} className="py-1 flex justify-between text-[11px]">
                    <span className="text-slate-800">{it.qty}x {it.name}</span>
                    <span className="font-bold text-slate-900">${it.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-[11px] pt-1">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>${lastReceipt.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>VAT (5%):</span>
                  <span>${lastReceipt.tax.toFixed(2)}</span>
                </div>
                {lastReceipt.discount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount:</span>
                    <span>-${lastReceipt.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-900 font-bold text-xs pt-1 border-t border-slate-200">
                  <span>TOTAL PAID:</span>
                  <span className="text-orange-600 font-black">${lastReceipt.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => setLastReceipt(null)}
                className="flex-1 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Record Expense */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Record Operating Expense</h3>
              <button onClick={() => setShowExpenseModal(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Expense Description / Vendor</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Restock 50 boxes Amoxicillin 500mg"
                  value={newExpDesc}
                  onChange={(e) => setNewExpDesc(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newExpCategory}
                    onChange={(e) => setNewExpCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-600"
                  >
                    <option value="Wholesale Pharmaceuticals">Wholesale Pharmaceuticals</option>
                    <option value="Medical Supplies">Medical Supplies</option>
                    <option value="Staff Salaries">Staff Salaries</option>
                    <option value="Facility & Utilities">Facility & Utilities</option>
                    <option value="Equipment Maintenance">Equipment Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Department</label>
                  <select
                    value={newExpDept}
                    onChange={(e) => setNewExpDept(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-600"
                  >
                    <option value="pharmacy">Pharmacy</option>
                    <option value="clinic">Clinic</option>
                    <option value="facility">Facility</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    min="1"
                    step="0.01"
                    required
                    value={newExpAmount}
                    onChange={(e) => setNewExpAmount(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={newExpPayment}
                    onChange={(e) => setNewExpPayment(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-600"
                  >
                    <option value="Bank Wire">Bank Wire</option>
                    <option value="Corporate Debit">Corporate Debit</option>
                    <option value="Cash">Cash Drawer</option>
                    <option value="Supplier Credit Line">Supplier Credit Line</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition-colors mt-2"
              >
                Confirm & Log Expense
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: E-Commerce Checkout */}
      {showEcomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Place Pharmacy Online Order</h3>
              <button onClick={() => { setShowEcomModal(false); setEcomSuccessOrder(null); }} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {ecomSuccessOrder ? (
              <div className="space-y-4 text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-bold text-base text-slate-900">Order Confirmed!</h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">Order ID: {ecomSuccessOrder.orderId}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                  {ecomDeliveryType === 'delivery'
                    ? 'Your order has been routed to our clinical courier. Estimated arrival within 2 hours.'
                    : 'Your medication has been packaged. Ready for pickup at Pharmacy Counter #01.'}
                </div>
                <button
                  onClick={() => { setShowEcomModal(false); setEcomSuccessOrder(null); }}
                  className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handlePlaceEcomOrder} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={ecomName}
                      onChange={(e) => setEcomName(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-600"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      required
                      value={ecomPhone}
                      onChange={(e) => setEcomPhone(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Delivery Method</label>
                  <div className="grid grid-cols-2 gap-2">
                    <label
                      onClick={() => setEcomDeliveryType('pickup')}
                      className={`p-2.5 rounded-lg border cursor-pointer text-center flex flex-col items-center gap-1 ${
                        ecomDeliveryType === 'pickup' ? 'border-orange-600 bg-orange-50 text-orange-900 font-bold' : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <Building2 className="w-4 h-4 text-orange-600" />
                      <span>Clinic Pickup (Free)</span>
                    </label>

                    <label
                      onClick={() => setEcomDeliveryType('delivery')}
                      className={`p-2.5 rounded-lg border cursor-pointer text-center flex flex-col items-center gap-1 ${
                        ecomDeliveryType === 'delivery' ? 'border-orange-600 bg-orange-50 text-orange-900 font-bold' : 'border-slate-200 bg-slate-50 text-slate-600'
                      }`}
                    >
                      <Truck className="w-4 h-4 text-orange-600" />
                      <span>Express Home ($5.00)</span>
                    </label>
                  </div>
                </div>

                {ecomDeliveryType === 'delivery' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Delivery Address</label>
                    <input
                      type="text"
                      required
                      value={ecomAddress}
                      onChange={(e) => setEcomAddress(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-orange-600"
                    />
                  </div>
                )}

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Items ({ecomCart.length}):</span>
                    <span>${ecomCart.reduce((a, b) => a + b.product.price * b.quantity, 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Fee:</span>
                    <span>{ecomDeliveryType === 'delivery' ? '$5.00' : '$0.00'}</span>
                  </div>
                  <div className="flex justify-between text-slate-900 font-bold pt-1 border-t border-slate-200">
                    <span>Total Due:</span>
                    <span className="text-orange-600 font-black">
                      ${(ecomCart.reduce((a, b) => a + b.product.price * b.quantity, 0) + (ecomDeliveryType === 'delivery' ? 5 : 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  Confirm & Place Order
                </button>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Print Invoice Modal */}
      {selectedInvoiceToPrint && (
        <PrintInvoiceModal invoice={selectedInvoiceToPrint} onClose={() => setSelectedInvoiceToPrint(null)} />
      )}
    </div>
  );
};
