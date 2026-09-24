import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { Plus, Fuel, MapPin, Upload, AlertCircle } from 'lucide-react';

export default function FuelLogs() {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    fuel_log_id: '', vehicle_id: '', shipment_id: '', fuel_date: '2024-09-15',
    liters_filled: 80.0, price_per_liter: 90.0, total_cost: 7200.0, odometer_reading: 45000,
    opening_fuel: 20.0, closing_fuel: 30.0, gps_latitude: 13.0827, gps_longitude: 80.2707
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lgs, vechs, shps] = await Promise.all([
        api.getFuelLogs(), api.getVehicles(), api.getShipments()
      ]);
      setLogs(lgs);
      setVehicles(vechs);
      setShipments(shps);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await api.uploadDocument(file, 'fuel');
      const extFields = res.extraction?.extracted_fields || {};

      setForm((prev) => ({
        ...prev,
        liters_filled: extFields.liters_filled ?? prev.liters_filled,
        price_per_liter: extFields.price_per_liter ?? prev.price_per_liter,
        total_cost: extFields.total_cost ?? (extFields.liters_filled && extFields.price_per_liter ? extFields.liters_filled * extFields.price_per_liter : prev.total_cost),
      }));
    } catch (err) {
      alert(`OCR Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.shipment_id) delete payload.shipment_id;

      await api.createFuelLog(payload);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Fuel Consumption & Purchase Logs</h2>
          <p className="text-xs text-slate-500">Record fuel purchases, opening/closing tank levels, and optional GPS tags</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
        >
          <Plus size={16} /> Add Fuel Record
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm font-medium">Loading fuel logs...</div>
      ) : logs.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center">
          <Fuel size={40} className="mx-auto text-slate-400 mb-3" />
          <h3 className="font-bold text-slate-800">No Fuel Records Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Record fuel purchases to perform fuel variance audits.</p>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">
            Add Fuel Log
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto min-w-full block">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-4 sm:px-5 py-3.5">Fuel Log ID</th>
                <th className="px-4 sm:px-5 py-3.5">Vehicle</th>
                <th className="px-4 sm:px-5 py-3.5">Shipment</th>
                <th className="px-4 sm:px-5 py-3.5">Fuel Date</th>
                <th className="px-4 sm:px-5 py-3.5">Liters Filled</th>
                <th className="px-4 sm:px-5 py-3.5">Price/L</th>
                <th className="px-4 sm:px-5 py-3.5">Total Cost</th>
                <th className="px-4 sm:px-5 py-3.5">Estimated Consumption</th>
                <th className="px-4 sm:px-5 py-3.5">GPS Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {logs.map((log) => {
                const estCons = (log.opening_fuel !== null && log.closing_fuel !== null)
                  ? (log.opening_fuel + log.liters_filled - log.closing_fuel).toFixed(1)
                  : log.liters_filled.toFixed(1);

                return (
                  <tr key={log.fuel_log_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 sm:px-5 py-4 font-bold text-blue-600 font-mono text-xs">{log.fuel_log_id}</td>
                    <td className="px-4 sm:px-5 py-4 font-semibold text-slate-900">{log.vehicle_id}</td>
                    <td className="px-4 sm:px-5 py-4 text-slate-700 font-mono text-xs">{log.shipment_id || 'N/A'}</td>
                    <td className="px-4 sm:px-5 py-4 text-slate-600">{log.fuel_date}</td>
                    <td className="px-4 sm:px-5 py-4 font-semibold text-slate-800">{log.liters_filled} L</td>
                    <td className="px-4 sm:px-5 py-4 text-slate-600">₹{log.price_per_liter}/L</td>
                    <td className="px-4 sm:px-5 py-4 font-bold text-slate-900">₹{log.total_cost.toLocaleString('en-IN')}</td>
                    <td className="px-4 sm:px-5 py-4 text-amber-700 font-semibold text-xs">{estCons} L</td>
                    <td className="px-4 sm:px-5 py-4 text-xs text-slate-500 font-mono">
                      {log.gps_latitude && log.gps_longitude ? (
                        <span className="flex items-center gap-1 text-slate-700">
                          <MapPin size={13} className="text-rose-500" /> {log.gps_latitude.toFixed(4)}, {log.gps_longitude.toFixed(4)}
                        </span>
                      ) : 'No GPS'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Fuel Record Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Fuel Log">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Upload size={14} className="text-blue-600" /> Upload Fuel Receipt (OCR Extractor)
              </label>
            </div>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="text-xs text-slate-500 w-full" />
            {uploading && <p className="text-xs text-blue-600 font-semibold animate-pulse">Extracting receipt data...</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fuel Log ID</label>
              <input type="text" required placeholder="FL-5003" value={form.fuel_log_id} onChange={(e) => setForm({ ...form, fuel_log_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle</label>
              <select required value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                <option value="">Select Vehicle</option>
                {vehicles.map((v) => <option key={v.vehicle_id} value={v.vehicle_id}>{v.vehicle_id}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Shipment (Optional)</label>
              <select value={form.shipment_id} onChange={(e) => setForm({ ...form, shipment_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                <option value="">None / Fleet Direct</option>
                {shipments.map((s) => <option key={s.shipment_id} value={s.shipment_id}>{s.shipment_id} ({s.origin}-{s.destination})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fuel Date</label>
              <input type="date" required value={form.fuel_date} onChange={(e) => setForm({ ...form, fuel_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Liters Filled</label>
              <input type="number" step="0.1" required value={form.liters_filled} onChange={(e) => {
                const l = parseFloat(e.target.value);
                setForm({ ...form, liters_filled: l, total_cost: l * form.price_per_liter });
              }} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price Per Liter (₹)</label>
              <input type="number" step="0.1" required value={form.price_per_liter} onChange={(e) => {
                const p = parseFloat(e.target.value);
                setForm({ ...form, price_per_liter: p, total_cost: form.liters_filled * p });
              }} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Cost (₹)</label>
              <input type="number" step="0.01" required value={form.total_cost} onChange={(e) => setForm({ ...form, total_cost: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm font-bold text-blue-600" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Opening Tank Level (L)</label>
              <input type="number" step="0.1" value={form.opening_fuel} onChange={(e) => setForm({ ...form, opening_fuel: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Closing Tank Level (L)</label>
              <input type="number" step="0.1" value={form.closing_fuel} onChange={(e) => setForm({ ...form, closing_fuel: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border text-slate-700 text-xs font-semibold rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">Save Record</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
