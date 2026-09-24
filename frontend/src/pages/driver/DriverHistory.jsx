import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { History, Fuel, Wrench, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function DriverHistory({ currentUser, setDriverPage }) {
  const [history, setHistory] = useState({ fuel_logs: [], maintenance_logs: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('fuel'); // 'fuel' | 'maintenance'

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getDriverHistory(currentUser?.id || 2);
      setHistory(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setDriverPage('dashboard')}
          className="p-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-700 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Driver Submission History</h2>
          <p className="text-xs text-slate-500">Track all driver-submitted fuel records and reported repairs</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('fuel')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'fuel'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Fuel size={16} /> Fuel Submissions ({history.fuel_logs.length})
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`pb-3 px-4 flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'maintenance'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wrench size={16} /> Repair & Bill Submissions ({history.maintenance_logs.length})
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm font-medium">Loading submission history...</div>
      ) : activeTab === 'fuel' ? (
        history.fuel_logs.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border text-center text-slate-400 text-xs italic">
            No fuel entries submitted yet.
          </div>
        ) : (
          <div className="space-y-3">
            {history.fuel_logs.map((fl) => (
              <div key={fl.fuel_log_id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-blue-600 font-mono">{fl.fuel_log_id}</span>
                  <span className="text-slate-500">{fl.fuel_date}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Truck</span>
                    <span className="font-bold font-mono text-slate-800">{fl.vehicle_id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Liters</span>
                    <span className="font-bold text-slate-900">{fl.liters_filled} L</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Cost</span>
                    <span className="font-bold text-slate-900">₹{fl.total_cost.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Odometer</span>
                    <span className="font-mono text-slate-700">{fl.odometer_reading || 'N/A'} km</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Station: {fl.fuel_station || 'N/A'}</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Active in Central Fuel Audit
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        history.maintenance_logs.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border text-center text-slate-400 text-xs italic">
            No repair records submitted yet.
          </div>
        ) : (
          <div className="space-y-3">
            {history.maintenance_logs.map((ml) => (
              <div key={ml.repair_id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-teal-600 font-mono">{ml.repair_id}</span>
                  <span className="text-slate-500">{ml.service_date}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Truck</span>
                    <span className="font-bold font-mono text-slate-800">{ml.vehicle_id}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Repair Type</span>
                    <span className="font-bold text-slate-900">{ml.repair_type}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Total Cost</span>
                    <span className="font-bold text-teal-700">₹{ml.total_repair_cost.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Workshop</span>
                    <span className="text-slate-700">{ml.service_center}</span>
                  </div>
                </div>
                {ml.problem_description && (
                  <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">
                    <strong>Problem Description:</strong> {ml.problem_description}
                  </p>
                )}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Invoice/Bill: {ml.invoice_number || 'Uploaded'}</span>
                  <span className="text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Active in Central Maintenance & Billing Audits
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
