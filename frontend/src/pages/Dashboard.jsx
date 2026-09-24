import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import KPICard from '../components/KPICard';
import { 
  Truck, Receipt, TrendingDown, Wrench, Fuel, ShieldAlert, AlertTriangle, ArrowRight 
} from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, 
  Tooltip, Legend, ArcElement, PointElement, LineElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, 
  ArcElement, PointElement, LineElement
);

export default function Dashboard({ setActivePage }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.getDashboard();
      setData(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs sm:text-sm font-semibold text-slate-600">Loading RevRoute AI Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-8 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 m-4 sm:m-8">
        <h3 className="font-bold flex items-center gap-2 text-sm sm:text-base">
          <AlertTriangle size={18} /> Error Loading Dashboard
        </h3>
        <p className="text-xs sm:text-sm mt-1">{error}</p>
        <button
          onClick={loadDashboardData}
          className="mt-4 px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const { kpis, charts } = data;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Scope Clarification Alert Banner */}
      <div className="p-4 bg-slate-900 text-white rounded-xl sm:rounded-2xl shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-lg bg-teal-500/20 text-teal-400 shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold truncate">Total Potential Financial Impact: ₹{kpis.total_potential_financial_impact.toLocaleString('en-IN')}</p>
            <p className="text-[11px] sm:text-xs text-slate-300 leading-snug">Combines separate billing leakage, maintenance cost overruns, and fuel cost variances. Human verification required before recovery.</p>
          </div>
        </div>
        <button
          onClick={() => setActivePage('billing-audit')}
          className="w-full sm:w-auto px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-lg text-white transition-colors flex items-center justify-center gap-1.5 shrink-0"
        >
          <span>Run Audits</span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* 6 Core Dynamic KPI Cards (2 cols on mobile, 3 cols on tablet, 6 cols on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <KPICard
          title="Shipments Audited"
          value={kpis.shipments_audited.toLocaleString('en-IN')}
          subtext="Verified shipments"
          icon={Truck}
          color="blue"
        />
        <KPICard
          title="Invoices Audited"
          value={kpis.invoices_audited.toLocaleString('en-IN')}
          subtext="Processed invoices"
          icon={Receipt}
          color="indigo"
        />
        <KPICard
          title="Revenue Leakage"
          value={`₹${(kpis.potential_revenue_leakage / 1000).toFixed(1)}k`}
          subtext="Potential billing gap"
          icon={TrendingDown}
          color="red"
        />
        <KPICard
          title="Maintenance Overrun"
          value={`₹${(kpis.potential_maintenance_overrun / 1000).toFixed(1)}k`}
          subtext="Above benchmark"
          icon={Wrench}
          color="teal"
        />
        <KPICard
          title="Fuel Cost Variance"
          value={`₹${(kpis.potential_fuel_cost_variance / 1000).toFixed(1)}k`}
          subtext="Baseline deviation"
          icon={Fuel}
          color="amber"
        />
        <KPICard
          title="Open Alerts"
          value={kpis.open_alerts}
          subtext="Pending human review"
          icon={ShieldAlert}
          color="purple"
        />
      </div>

      {/* Grid of 5 Key Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Chart 1: Financial Variance by Category */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
            Financial Variance by Category
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mb-4">Breakdown of potential financial impact across operational modules</p>
          <div className="h-52 sm:h-64">
            <Bar
              data={charts.financial_variance}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>

        {/* Chart 2: Alerts by Category */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
            Alerts by Category
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mb-4">Distribution of audit alerts across categories</p>
          <div className="h-52 sm:h-64 flex items-center justify-center">
            <Doughnut
              data={charts.alerts_by_category}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom' } },
              }}
            />
          </div>
        </div>

        {/* Chart 3: Alert Status Breakdown */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
            Alert Status Lifecycle
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mb-4">Current verification & resolution progress</p>
          <div className="h-52 sm:h-64">
            <Bar
              data={charts.alert_status}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>

        {/* Chart 4: Fuel Performance */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
            Fuel Consumption Performance
          </h3>
          <p className="text-[11px] sm:text-xs text-slate-500 mb-4">Expected baseline vs estimated actual fuel volume (Liters)</p>
          <div className="h-52 sm:h-64">
            <Bar
              data={charts.fuel_performance}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
              }}
            />
          </div>
        </div>
      </div>

      {/* Chart 5: Recovery / Corrective Action Pipeline (Full Width) */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">
          Recovery & Corrective Action Funnel
        </h3>
        <p className="text-[11px] sm:text-xs text-slate-500 mb-4">From potential financial impact to verified & recovered amounts</p>
        <div className="h-52 sm:h-64">
          <Bar
            data={charts.recovery_action}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
            }}
          />
        </div>
      </div>
    </div>
  );
}
