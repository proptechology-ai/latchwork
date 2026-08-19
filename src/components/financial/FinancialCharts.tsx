import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { TrendingUp, PieChart as PieIcon, BarChart3, Activity, ShieldCheck, ArrowUpRight, DollarSign } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Multi-month financial trend data
const MONTHLY_TREND_DATA = [
  { month: 'Mar 2026', clinic: 24500, pharmacy: 31200, expenses: 18400, netProfit: 37300 },
  { month: 'Apr 2026', clinic: 26800, pharmacy: 33500, expenses: 19800, netProfit: 40500 },
  { month: 'May 2026', clinic: 28400, pharmacy: 36800, expenses: 21100, netProfit: 44100 },
  { month: 'Jun 2026', clinic: 31200, pharmacy: 39400, expenses: 22800, netProfit: 47800 },
  { month: 'Jul 2026', clinic: 33900, pharmacy: 42100, expenses: 24200, netProfit: 51800 },
  { month: 'Aug 2026 (MTD)', clinic: 36200, pharmacy: 45800, expenses: 25900, netProfit: 56100 },
  { month: 'Sep 2026 (Proj)', clinic: 38500, pharmacy: 49200, expenses: 26800, netProfit: 60900 },
];

const QUARTERLY_COMPARISON_DATA = [
  { quarter: 'Q1 2026', clinicConsultations: 68400, rxDispensary: 86500, otcEcommerce: 18200 },
  { quarter: 'Q2 2026', clinicConsultations: 86400, rxDispensary: 109700, otcEcommerce: 26400 },
  { quarter: 'Q3 2026 (Est)', clinicConsultations: 108600, rxDispensary: 137100, otcEcommerce: 34900 },
];

const EXPENSE_DISTRIBUTION_DATA = [
  { name: 'Wholesale Pharmaceuticals', value: 14200, color: '#EA580C' },
  { name: 'Medical Supplies & Reagents', value: 5800, color: '#0284C7' },
  { name: 'Physician & Clinical Staff', value: 12500, color: '#0D9488' },
  { name: 'Facility, Refrigeration & Utilities', value: 3900, color: '#6366F1' },
  { name: 'IT, EHR & Regulatory Licenses', value: 2400, color: '#E11D48' },
];

export const FinancialCharts: React.FC = () => {
  const { language, t } = useApp();
  const [chartView, setChartView] = useState<'monthly' | 'quarterly' | 'expenses'>('monthly');

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`;

  return (
    <div className="space-y-6">
      {/* Chart View Selector & Controls */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span>Financial Analytics & Department Performance Visualizer</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live visualization of Clinic income, Pharmacy sales, and operational expense distributions.
            </p>
          </div>

          {/* Toggle buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setChartView('monthly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartView === 'monthly'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly Revenue Trend
            </button>
            <button
              onClick={() => setChartView('quarterly')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartView === 'quarterly'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Department Comparison
            </button>
            <button
              onClick={() => setChartView('expenses')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                chartView === 'expenses'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expense Distribution
            </button>
          </div>
        </div>

        {/* 1. Monthly Area Chart */}
        {chartView === 'monthly' && (
          <div className="pt-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-orange-600 inline-block" />
                  <strong>Pharmacy Dispensary</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-sky-600 inline-block" />
                  <strong>Clinic Consultations</strong>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
                  <strong>Operating Expenses</strong>
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-bold">
                +14.8% Month-over-Month Growth
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MONTHLY_TREND_DATA} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPharmacy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EA580C" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#EA580C" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorClinic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284C7" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="pharmacy" name="Pharmacy Sales" stroke="#EA580C" strokeWidth={2.5} fillOpacity={1} fill="url(#colorPharmacy)" />
                  <Area type="monotone" dataKey="clinic" name="Clinic Consultations" stroke="#0284C7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorClinic)" />
                  <Area type="monotone" dataKey="expenses" name="Operating Expenses" stroke="#F43F5E" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 2. Department Comparison Bar Chart */}
        {chartView === 'quarterly' && (
          <div className="pt-5 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span className="font-semibold">Quarterly Gross Revenue Breakdown (Clinic vs Dispensary vs E-Commerce)</span>
              <span className="text-[11px] font-mono text-slate-500">2026 Fiscal Timeline</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={QUARTERLY_COMPARISON_DATA} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="quarter" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: '#e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="clinicConsultations" name="Clinic Services" fill="#0284C7" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="rxDispensary" name="Rx Dispensary" fill="#EA580C" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="otcEcommerce" name="OTC E-Commerce Store" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 3. Expense Breakdown Donut Chart */}
        {chartView === 'expenses' && (
          <div className="pt-5 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={EXPENSE_DISTRIBUTION_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {EXPENSE_DISTRIBUTION_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend with percent breakdown */}
              <div className="space-y-2.5 text-xs">
                <h4 className="font-bold text-slate-900 border-b border-slate-100 pb-2">
                  Operating Cost Allocation Breakdown ($38,800 Total/Mo)
                </h4>
                {EXPENSE_DISTRIBUTION_DATA.map((item, idx) => {
                  const total = EXPENSE_DISTRIBUTION_DATA.reduce((acc, curr) => acc + curr.value, 0);
                  const percentage = ((item.value / total) * 100).toFixed(1);
                  return (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-md shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="font-medium text-slate-700">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900">${item.value.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-500 font-mono ml-2">({percentage}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3 Executive Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Prescription Capture Rate</span>
          <div className="text-2xl font-black text-slate-900">91.4%</div>
          <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Direct internal dispensary dispensing
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg. Encounter Revenue</span>
          <div className="text-2xl font-black text-slate-900">$148.50</div>
          <p className="text-[11px] text-slate-500">Blended consultation & medication bill</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gross Operating Margin</span>
          <div className="text-2xl font-black text-orange-600">68.4%</div>
          <p className="text-[11px] text-slate-500">Top-quartile medical clinic benchmark</p>
        </div>
      </div>
    </div>
  );
};
