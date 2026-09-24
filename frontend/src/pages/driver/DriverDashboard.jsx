import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Truck, Fuel, Wrench, Upload, History, ArrowRight, ShieldCheck } from 'lucide-react';

export default function DriverDashboard({ currentUser, setDriverPage }) {
  const [history, setHistory] = useState({ fuel_logs: [], maintenance_logs: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDriverData();
  }, [currentUser]);

  const loadDriverData = async () => {
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

  const assignedTruck = currentUser?.assigned_vehicle_id || 'TRK-101';

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Welcome Card */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-teal-400 font-semibold tracking-wider uppercase">Welcome Back</span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">{currentUser?.name || 'Ramesh Kumar'}</h2>
          <p className="text-xs text-slate-300 mt-1">License: {currentUser?.license_number || 'DL-TN01-20210001'}</p>
        </div>

        <div className="bg-slate-800 border border-slate-700 p-3 sm:p-4 rounded-xl text-center w-full sm:w-auto">
          <Truck size={24} className="mx-auto text-teal-400 mb-1" />
          <span className="text-[10px] text-slate-400 font-bold block uppercase">Assigned Truck</span>
          <span className="text-base font-extrabold text-white font-mono">{assignedTruck}</span>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setDriverPage('fuel')}
          className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-md hover:border-blue-500 text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <Fuel size={22} />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Add Fuel Entry</h3>
          <p className="text-xs text-slate-500 mt-1">Record fuel quantity, station, cost & receipt</p>
        </button>

        <button
          onClick={() => setDriverPage('repair')}
          className="p-4 sm:p-5 bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-md hover:border-teal-500 text-left transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:bg-teal-600 group-hover:text-white transition-colors">
            <Wrench size={22} />
          </div>
          <h3 className="font-bold text-slate-900 text-sm">Report Repair / Service</h3>
          <p className="text-xs text-slate-500 mt-1">Submit maintenance details & upload repair bill</p>
        </button>
      </div>

      {/* Central Database Integration Banner */}
      <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl text-teal-900 text-xs flex items-center gap-3">
        <ShieldCheck size={20} className="text-teal-600 shrink-0" />
        <div>
          <p className="font-bold">Central Database Synchronization</p>
          <p className="text-[11px] text-teal-700">Submissions are saved to the central database and integrated automatically into management Fuel & Maintenance Audits.</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <History size={16} className="text-blue-600" /> Recent Submissions
          </h3>
          <button onClick={() => setDriverPage('history')} className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-1">
            View All <ArrowRight size={12} />
          </button>
        </div>

        {loading ? (
          <p className="text-xs text-slate-500 py-4 text-center">Loading recent history...</p>
        ) : (history.fuel_logs.length === 0 && history.maintenance_logs.length === 0) ? (
          <p className="text-xs text-slate-400 py-4 text-center italic">No submissions yet. Add your first fuel or repair log above!</p>
        ) : (
          <div className="space-y-2">
            {history.fuel_logs.slice(0, 2).map((fl) => (
              <div key={fl.fuel_log_id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><Fuel size={14} /></div>
                  <div>
                    <p className="font-bold text-slate-900">Fuel: {fl.liters_filled} L (₹{fl.total_cost})</p>
                    <p className="text-[10px] text-slate-500">{fl.fuel_date} • {fl.fuel_station || 'Station Recorded'}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded text-[10px]">Saved to Central DB</span>
              </div>
            ))}

            {history.maintenance_logs.slice(0, 2).map((ml) => (
              <div key={ml.repair_id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-teal-100 text-teal-700 rounded-lg"><Wrench size={14} /></div>
                  <div>
                    <p className="font-bold text-slate-900">Repair: {ml.repair_type} (₹{ml.total_repair_cost})</p>
                    <p className="text-[10px] text-slate-500">{ml.service_date} • {ml.service_center}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-semibold rounded text-[10px]">Saved to Central DB</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
