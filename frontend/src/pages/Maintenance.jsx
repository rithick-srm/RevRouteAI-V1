import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { Plus, Wrench, Upload, Settings, AlertCircle } from 'lucide-react';

export default function Maintenance() {
  const [logs, setLogs] = useState([]);
  const [benchmarks, setBenchmarks] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBmModalOpen, setIsBmModalOpen] = useState(false);

  const [form, setForm] = useState({
    repair_id: '', vehicle_id: '', service_center: '', service_date: '2024-09-15',
    repair_type: 'Brake Pad Replacement', parts_cost: 7000, labor_cost: 2000,
    benchmark_cost: 6500, total_repair_cost: 9000, invoice_number: 'MNT-4410'
  });

  const [bmForm, setBmForm] = useState({ repair_type: '', vehicle_class: 'Heavy Truck', benchmark_cost: 6500 });
  const [uploading, setUploading] = useState(false);
  const [ocrMessage, setOcrMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lgs, bms, vechs] = await Promise.all([
        api.getMaintenanceLogs(), api.getMaintenanceBenchmarks(), api.getVehicles()
      ]);
      setLogs(lgs);
      setBenchmarks(bms);
      setVehicles(vechs);
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
      setOcrMessage(null);
      const res = await api.uploadDocument(file, 'maintenance');
      const extFields = res.extraction?.extracted_fields || {};
      setOcrMessage(res.extraction?.message || 'Receipt parsed');

      setForm((prev) => ({
        ...prev,
        service_center: extFields.service_center || prev.service_center,
        repair_type: extFields.repair_type || prev.repair_type,
        total_repair_cost: extFields.total_repair_cost ?? prev.total_repair_cost,
        parts_cost: extFields.parts_cost ?? prev.parts_cost,
        labor_cost: extFields.labor_cost ?? prev.labor_cost,
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
      await api.createMaintenanceLog(form);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleBmSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createBenchmark(bmForm);
      setIsBmModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Fleet Maintenance & Repairs</h2>
          <p className="text-xs text-slate-500">Track repair logs and operational cost overruns against reference benchmarks</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsBmModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg border border-slate-300 flex items-center gap-1.5"
          >
            <Settings size={15} /> Edit Benchmarks
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center gap-1.5"
          >
            <Plus size={16} /> Add Maintenance Record
          </button>
        </div>
      </div>

      {/* Configurable Reference Benchmarks Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Configurable Reference Benchmarks</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {benchmarks.map((b) => (
            <div key={b.benchmark_id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-center">
              <p className="text-[11px] font-semibold text-slate-600 truncate">{b.repair_type}</p>
              <p className="text-sm font-bold text-blue-600 mt-0.5">₹{b.benchmark_cost.toLocaleString('en-IN')}</p>
              <p className="text-[10px] text-slate-400">{b.vehicle_class}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance Logs Table */}
      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm font-medium">Loading maintenance logs...</div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto min-w-full block">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-4 sm:px-5 py-3.5">Repair ID</th>
                <th className="px-4 sm:px-5 py-3.5">Vehicle</th>
                <th className="px-4 sm:px-5 py-3.5">Repair Type</th>
                <th className="px-4 sm:px-5 py-3.5">Service Center</th>
                <th className="px-4 sm:px-5 py-3.5">Date</th>
                <th className="px-4 sm:px-5 py-3.5">Reference Benchmark</th>
                <th className="px-4 sm:px-5 py-3.5">Total Repair Cost</th>
                <th className="px-4 sm:px-5 py-3.5 text-right">Cost Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {logs.map((log) => {
                const overrun = Math.max(log.total_repair_cost - log.benchmark_cost, 0);
                return (
                  <tr key={log.repair_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 sm:px-5 py-4 font-bold text-blue-600 font-mono text-xs">{log.repair_id}</td>
                    <td className="px-4 sm:px-5 py-4 font-semibold text-slate-900">{log.vehicle_id}</td>
                    <td className="px-4 sm:px-5 py-4 text-slate-800">{log.repair_type}</td>
                    <td className="px-4 sm:px-5 py-4 text-slate-600 text-xs">{log.service_center}</td>
                    <td className="px-4 sm:px-5 py-4 text-slate-600">{log.service_date}</td>
                    <td className="px-4 sm:px-5 py-4 text-slate-700 font-mono text-xs">₹{log.benchmark_cost.toLocaleString('en-IN')}</td>
                    <td className="px-4 sm:px-5 py-4 font-bold text-slate-900">₹{log.total_repair_cost.toLocaleString('en-IN')}</td>
                    <td className="px-4 sm:px-5 py-4 text-right whitespace-nowrap">
                      {overrun > 0 ? (
                        <span className="font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md text-xs border border-teal-200">
                          +₹{overrun.toLocaleString('en-IN')} Overrun
                        </span>
                      ) : (
                        <span className="text-xs text-slate-500 font-medium">Within Benchmark</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Record Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Maintenance Log">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Upload size={14} className="text-blue-600" />
                Upload Repair Receipt (OCR Extractor)
              </label>
            </div>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="text-xs text-slate-500 w-full" />
            {uploading && <p className="text-xs text-blue-600 font-semibold animate-pulse">Extracting receipt data...</p>}
            {ocrMessage && <p className="text-xs text-amber-800 bg-amber-50 p-2 rounded">{ocrMessage}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Repair ID</label>
              <input type="text" required placeholder="REP-3004" value={form.repair_id} onChange={(e) => setForm({ ...form, repair_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle</label>
              <select required value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                <option value="">Select Vehicle</option>
                {vehicles.map((v) => <option key={v.vehicle_id} value={v.vehicle_id}>{v.vehicle_id}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Service Center</label>
              <input type="text" required placeholder="Apex Truck Care" value={form.service_center} onChange={(e) => setForm({ ...form, service_center: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Repair Type</label>
              <select value={form.repair_type} onChange={(e) => setForm({ ...form, repair_type: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                <option value="Brake Pad Replacement">Brake Pad Replacement</option>
                <option value="Oil Change">Oil Change</option>
                <option value="Battery Replacement">Battery Replacement</option>
                <option value="Tyre Replacement">Tyre Replacement</option>
                <option value="Engine Service">Engine Service</option>
                <option value="Clutch Service">Clutch Service</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Service Date</label>
              <input type="date" required value={form.service_date} onChange={(e) => setForm({ ...form, service_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Repair Cost (₹)</label>
              <input type="number" step="0.01" required value={form.total_repair_cost} onChange={(e) => setForm({ ...form, total_repair_cost: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm font-bold text-blue-600" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border text-slate-700 text-xs font-semibold rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">Save Record</button>
          </div>
        </form>
      </Modal>

      {/* Benchmark Config Modal */}
      <Modal isOpen={isBmModalOpen} onClose={() => setIsBmModalOpen(false)} title="Add Reference Benchmark">
        <form onSubmit={handleBmSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Repair Type</label>
            <input type="text" required placeholder="Brake Pad Replacement" value={bmForm.repair_type} onChange={(e) => setBmForm({ ...bmForm, repair_type: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Class</label>
            <input type="text" required placeholder="Heavy Truck" value={bmForm.vehicle_class} onChange={(e) => setBmForm({ ...bmForm, vehicle_class: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Benchmark Cost (₹)</label>
            <input type="number" step="0.01" required value={bmForm.benchmark_cost} onChange={(e) => setBmForm({ ...bmForm, benchmark_cost: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => setIsBmModalOpen(false)} className="px-4 py-2 border text-slate-700 text-xs font-semibold rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">Save Benchmark</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
