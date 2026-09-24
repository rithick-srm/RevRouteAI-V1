import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { Plus, Truck, Clock } from 'lucide-react';

export default function Shipments() {
  const [shipments, setShipments] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    shipment_id: '', contract_id: '', vehicle_id: '', origin: '', destination: '',
    distance_km: 500, cargo_weight_kg: 1000, arrival_time: '', service_start_time: '',
    departure_time: '', status: 'Scheduled'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [shps, cnts, vehs] = await Promise.all([
        api.getShipments(), api.getContracts(), api.getVehicles()
      ]);
      setShipments(shps);
      setContracts(cnts);
      setVehicles(vehs);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.arrival_time) delete payload.arrival_time;
      if (!payload.service_start_time) delete payload.service_start_time;
      if (!payload.departure_time) delete payload.departure_time;

      await api.createShipment(payload);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Shipment Management</h2>
          <p className="text-xs text-slate-500">Track shipments, trip distances, cargo weights, and warehouse detention times</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
        >
          <Plus size={16} /> New Shipment
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm font-medium">Loading shipments...</div>
      ) : shipments.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center">
          <Truck size={40} className="mx-auto text-slate-400 mb-3" />
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">No Shipments Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Create shipment records to perform billing and fuel audits.</p>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">
            Create Shipment
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Scrollable Container for Table */}
          <div className="overflow-x-auto min-w-full block">
            <table className="w-full text-left text-sm min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th className="px-4 sm:px-5 py-3.5">Shipment ID</th>
                  <th className="px-4 sm:px-5 py-3.5">Contract</th>
                  <th className="px-4 sm:px-5 py-3.5">Vehicle</th>
                  <th className="px-4 sm:px-5 py-3.5">Route</th>
                  <th className="px-4 sm:px-5 py-3.5">Distance</th>
                  <th className="px-4 sm:px-5 py-3.5">Cargo Weight</th>
                  <th className="px-4 sm:px-5 py-3.5">Detention Waiting</th>
                  <th className="px-4 sm:px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {shipments.map((s) => {
                  let waitingTimeStr = 'N/A';
                  if (s.arrival_time && s.service_start_time) {
                    const arr = new Date(s.arrival_time);
                    const st = new Date(s.service_start_time);
                    const diffHrs = ((st - arr) / (1000 * 60 * 60)).toFixed(1);
                    waitingTimeStr = `${diffHrs} hrs (${arr.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} → ${st.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`;
                  }

                  return (
                    <tr key={s.shipment_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 sm:px-5 py-4 font-bold text-blue-600 font-mono text-xs">{s.shipment_id}</td>
                      <td className="px-4 sm:px-5 py-4 text-slate-700 font-mono text-xs">{s.contract_id}</td>
                      <td className="px-4 sm:px-5 py-4 font-semibold text-slate-900">{s.vehicle_id}</td>
                      <td className="px-4 sm:px-5 py-4 text-slate-800 text-xs sm:text-sm">{s.origin} → {s.destination}</td>
                      <td className="px-4 sm:px-5 py-4 text-slate-700 font-semibold">{s.distance_km} km</td>
                      <td className="px-4 sm:px-5 py-4 text-slate-700">{s.cargo_weight_kg} kg</td>
                      <td className="px-4 sm:px-5 py-4 text-xs text-slate-600 font-mono">{waitingTimeStr}</td>
                      <td className="px-4 sm:px-5 py-4"><StatusBadge status={s.status} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Shipment Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Shipment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shipment ID</label>
              <input type="text" required placeholder="SHP-1005" value={form.shipment_id} onChange={(e) => setForm({ ...form, shipment_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contract</label>
              <select required value={form.contract_id} onChange={(e) => setForm({ ...form, contract_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                <option value="">Select Contract</option>
                {contracts.map((c) => <option key={c.contract_id} value={c.contract_id}>{c.contract_id} ({c.customer_id})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle</label>
              <select required value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                <option value="">Select Vehicle</option>
                {vehicles.map((v) => <option key={v.vehicle_id} value={v.vehicle_id}>{v.vehicle_id} ({v.license_plate})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Origin</label>
              <input type="text" required placeholder="Chennai" value={form.origin} onChange={(e) => setForm({ ...form, origin: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Destination</label>
              <input type="text" required placeholder="Bengaluru" value={form.destination} onChange={(e) => setForm({ ...form, destination: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Distance (km)</label>
              <input type="number" step="0.1" required value={form.distance_km} onChange={(e) => setForm({ ...form, distance_km: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Cargo Weight (kg)</label>
              <input type="number" step="0.1" required value={form.cargo_weight_kg} onChange={(e) => setForm({ ...form, cargo_weight_kg: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                <option value="Scheduled">Scheduled</option>
                <option value="In Transit">In Transit</option>
                <option value="Delivered">Delivered</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Clock size={14} className="text-blue-600 shrink-0" /> Detention Timing (Optional for Detention Audit)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600">Arrival Time</label>
                <input type="datetime-local" value={form.arrival_time} onChange={(e) => setForm({ ...form, arrival_time: e.target.value })} className="w-full px-2 py-1.5 border rounded text-xs" />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600">Service Start Time</label>
                <input type="datetime-local" value={form.service_start_time} onChange={(e) => setForm({ ...form, service_start_time: e.target.value })} className="w-full px-2 py-1.5 border rounded text-xs" />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border text-slate-700 text-xs font-semibold rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">Save Shipment</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
