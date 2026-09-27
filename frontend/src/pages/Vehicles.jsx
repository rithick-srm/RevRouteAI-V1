import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { Plus, Truck, Trash2, Settings, Sliders } from 'lucide-react';

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBaselineModalOpen, setIsBaselineModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [form, setForm] = useState({
    vehicle_id: '', vehicle_class: 'Heavy Truck', license_plate: '',
    expected_mileage_km_l: 4.5, fuel_type: 'Diesel',
    expected_fuel_price_per_l: 90.0, expected_maint_cost_min: 6000.0,
    expected_maint_cost_max: 8000.0, expected_maint_interval_km: 10000.0,
    expected_maint_interval_days: 90
  });

  const [baselineForm, setBaselineForm] = useState({
    expected_mileage_km_l: 4.5,
    expected_fuel_price_per_l: 90.0,
    expected_maint_cost_min: 6000.0,
    expected_maint_cost_max: 8000.0,
    expected_maint_interval_km: 10000.0,
    expected_maint_interval_days: 90
  });

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const res = await api.getVehicles();
      setVehicles(res);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createVehicle(form);
      setIsModalOpen(false);
      loadVehicles();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenBaselineModal = (veh) => {
    setSelectedVehicle(veh);
    setBaselineForm({
      expected_mileage_km_l: veh.expected_mileage_km_l || 4.5,
      expected_fuel_price_per_l: veh.expected_fuel_price_per_l || 90.0,
      expected_maint_cost_min: veh.expected_maint_cost_min || 6000.0,
      expected_maint_cost_max: veh.expected_maint_cost_max || 8000.0,
      expected_maint_interval_km: veh.expected_maint_interval_km || 10000.0,
      expected_maint_interval_days: veh.expected_maint_interval_days || 90
    });
    setIsBaselineModalOpen(true);
  };

  const handleSaveBaseline = async (e) => {
    e.preventDefault();
    if (!selectedVehicle) return;
    try {
      await api.updateVehicleBaseline(selectedVehicle.vehicle_id, baselineForm);
      setIsBaselineModalOpen(false);
      loadVehicles();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Delete vehicle '${id}'?`)) {
      try {
        await api.deleteVehicle(id);
        loadVehicles();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Vehicle Fleet Directory & Audit Baselines</h2>
          <p className="text-xs text-slate-500">Configure vehicle classes, expected fuel efficiency, fuel prices, and maintenance baselines</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
        >
          <Plus size={16} /> Add Vehicle
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm font-medium">Loading vehicles...</div>
      ) : vehicles.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center">
          <Truck size={40} className="mx-auto text-slate-400 mb-3" />
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">No Vehicles Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Add fleet vehicles to record maintenance and fuel logs.</p>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">
            Add Vehicle
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Scrollable Container for Table */}
          <div className="overflow-x-auto min-w-full block">
            <table className="w-full text-left text-sm min-w-[750px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th className="px-4 sm:px-6 py-3.5">Vehicle ID</th>
                  <th className="px-4 sm:px-6 py-3.5">Vehicle Class</th>
                  <th className="px-4 sm:px-6 py-3.5">License Plate</th>
                  <th className="px-4 sm:px-6 py-3.5">Fuel Baseline</th>
                  <th className="px-4 sm:px-6 py-3.5">Maintenance Baseline</th>
                  <th className="px-4 sm:px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {vehicles.map((v) => (
                  <tr key={v.vehicle_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 sm:px-6 py-4 font-bold text-blue-600 font-mono text-xs">{v.vehicle_id}</td>
                    <td className="px-4 sm:px-6 py-4 font-semibold text-slate-900">{v.vehicle_class}</td>
                    <td className="px-4 sm:px-6 py-4 text-slate-700 font-mono text-xs">{v.license_plate}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-xs">
                        <span className="text-emerald-700 font-bold block">{v.expected_mileage_km_l} km/L</span>
                        <span className="text-[11px] text-slate-400">Price: ₹{v.expected_fuel_price_per_l || 90}/L</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <div className="text-xs">
                        <span className="text-teal-700 font-semibold block">
                          ₹{(v.expected_maint_cost_min || 6000).toLocaleString('en-IN')} – ₹{(v.expected_maint_cost_max || 8000).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] text-slate-400">Interval: {(v.expected_maint_interval_km || 10000).toLocaleString('en-IN')} km</span>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenBaselineModal(v)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-300 flex items-center gap-1"
                          title="Configure Baselines"
                        >
                          <Sliders size={13} /> Edit Baseline
                        </button>
                        <button onClick={() => handleDelete(v.vehicle_id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Vehicle Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Vehicle to Fleet">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle ID</label>
              <input type="text" required placeholder="TRK-105" value={form.vehicle_id} onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Class</label>
              <select value={form.vehicle_class} onChange={(e) => setForm({ ...form, vehicle_class: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                <option value="Heavy Truck">Heavy Truck</option>
                <option value="Medium Commercial">Medium Commercial</option>
                <option value="Light Commercial">Light Commercial</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">License Plate</label>
              <input type="text" required placeholder="TN-01-XX-9999" value={form.license_plate} onChange={(e) => setForm({ ...form, license_plate: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Baseline Efficiency (km/L)</label>
              <input type="number" step="0.1" required value={form.expected_mileage_km_l} onChange={(e) => setForm({ ...form, expected_mileage_km_l: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border text-slate-700 text-xs font-semibold rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">Save Vehicle</button>
          </div>
        </form>
      </Modal>

      {/* Edit Vehicle Baselines Modal */}
      {selectedVehicle && (
        <Modal isOpen={isBaselineModalOpen} onClose={() => setIsBaselineModalOpen(false)} title={`Configure Baselines — ${selectedVehicle.vehicle_id}`}>
          <form onSubmit={handleSaveBaseline} className="space-y-4">
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 font-medium">
              Configure baseline expectations for {selectedVehicle.vehicle_id}. The AI Fleet Audit Assistant compares actual trip & repair records against these baseline values.
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Fuel Baseline Configuration</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Efficiency (km/L)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={baselineForm.expected_mileage_km_l}
                    onChange={(e) => setBaselineForm({ ...baselineForm, expected_mileage_km_l: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expected Fuel Price (₹/L)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={baselineForm.expected_fuel_price_per_l}
                    onChange={(e) => setBaselineForm({ ...baselineForm, expected_fuel_price_per_l: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Maintenance Baseline Configuration</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Expected Cost (₹)</label>
                  <input
                    type="number"
                    step="100"
                    required
                    value={baselineForm.expected_maint_cost_min}
                    onChange={(e) => setBaselineForm({ ...baselineForm, expected_maint_cost_min: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Max Expected Cost (₹)</label>
                  <input
                    type="number"
                    step="100"
                    required
                    value={baselineForm.expected_maint_cost_max}
                    onChange={(e) => setBaselineForm({ ...baselineForm, expected_maint_cost_max: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Service Interval (km)</label>
                  <input
                    type="number"
                    step="500"
                    required
                    value={baselineForm.expected_maint_interval_km}
                    onChange={(e) => setBaselineForm({ ...baselineForm, expected_maint_interval_km: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Service Interval (Days)</label>
                  <input
                    type="number"
                    step="1"
                    required
                    value={baselineForm.expected_maint_interval_days}
                    onChange={(e) => setBaselineForm({ ...baselineForm, expected_maint_interval_days: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button type="button" onClick={() => setIsBaselineModalOpen(false)} className="px-4 py-2 border text-slate-700 text-xs font-semibold rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">Save Baseline Settings</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
