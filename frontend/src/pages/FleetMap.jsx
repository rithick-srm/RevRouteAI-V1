import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  MapPin, Truck, Navigation, Activity, Clock, Fuel, 
  ExternalLink, RefreshCw, AlertTriangle, ShieldCheck, CheckCircle2 
} from 'lucide-react';

// Fix Leaflet Default Marker Icon issue in React/Vite builds
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom Colored HTML Pin Markers for Fleet Statuses
const createCustomPin = (status) => {
  let color = '#2563EB'; // Default Blue for Idle
  if (status === 'Moving') color = '#10B981'; // Emerald Green
  if (status === 'Maintenance') color = '#F59E0B'; // Amber Orange
  if (status === 'Offline') color = '#64748B'; // Slate Gray

  const svgIcon = `
    <svg width="34" height="34" viewBox="0 0 24 24" fill="${color}" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 3px 4px rgba(0,0,0,0.4));">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="${color}"/>
    </svg>
  `;

  return L.divIcon({
    className: 'custom-leaflet-pin',
    html: svgIcon,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  });
};

// Helper Component to Recenter Map Bounds when Vehicles Load
function MapRecenter({ vehicles }) {
  const map = useMap();
  useEffect(() => {
    if (vehicles && vehicles.length > 0) {
      const validVehicles = vehicles.filter(v => v.latitude && v.longitude);
      if (validVehicles.length > 0) {
        const bounds = L.latLngBounds(validVehicles.map(v => [v.latitude, v.longitude]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [vehicles, map]);
  return null;
}

export default function FleetMap({ setActivePage }) {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMapData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getVehicleMapData();
      setVehicles(data);
      if (data.length > 0 && !selectedVehicle) {
        setSelectedVehicle(data[0]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch vehicle location data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, []);

  const movingCount = vehicles.filter(v => v.status === 'Moving').length;
  const idleCount = vehicles.filter(v => v.status === 'Idle').length;
  const maintCount = vehicles.filter(v => v.status === 'Maintenance').length;
  const offlineCount = vehicles.filter(v => v.status === 'Offline').length;

  const defaultCenter = [13.0827, 80.2707]; // Chennai default center

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <MapPin size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Fleet Tracking Map</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Current Recorded Locations & Vehicle Telematics Master
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchMapData}
            className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Locations</span>
          </button>
        </div>
      </div>

      {/* Disclaimer / Recorded Location Notice Banner */}
      <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3 text-xs text-blue-800">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-blue-600 shrink-0" />
          <span className="font-medium">
            <strong>Current Recorded Location Data:</strong> Visualizing stored vehicle telematics coordinates and latest recorded operational status from RevRoute database.
          </span>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-1 bg-blue-100 text-blue-900 rounded-md font-bold uppercase text-[10px] tracking-wider shrink-0">
          Last Known Telematics
        </span>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2 font-medium">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {/* Fleet Status Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Moving</p>
            <p className="text-2xl font-bold text-emerald-600 font-mono mt-0.5">{movingCount}</p>
          </div>
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Idle</p>
            <p className="text-2xl font-bold text-blue-600 font-mono mt-0.5">{idleCount}</p>
          </div>
          <div className="w-3 h-3 rounded-full bg-blue-500" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Maintenance</p>
            <p className="text-2xl font-bold text-amber-600 font-mono mt-0.5">{maintCount}</p>
          </div>
          <div className="w-3 h-3 rounded-full bg-amber-500" />
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Offline</p>
            <p className="text-2xl font-bold text-slate-400 font-mono mt-0.5">{offlineCount}</p>
          </div>
          <div className="w-3 h-3 rounded-full bg-slate-400" />
        </div>
      </div>

      {/* Interactive Leaflet Map Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden relative">
        <div className="h-[420px] sm:h-[500px] w-full z-10 relative">
          <MapContainer
            center={defaultCenter}
            zoom={6}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapRecenter vehicles={vehicles} />

            {vehicles.map((veh) => {
              if (!veh.latitude || !veh.longitude) return null;
              return (
                <Marker
                  key={veh.vehicle_id}
                  position={[veh.latitude, veh.longitude]}
                  icon={createCustomPin(veh.status)}
                  eventHandlers={{
                    click: () => setSelectedVehicle(veh),
                  }}
                >
                  <Popup>
                    <div className="p-1 space-y-2 text-slate-800">
                      <div className="flex items-center justify-between border-b pb-1.5 gap-3">
                        <span className="font-bold text-sm text-blue-600">{veh.vehicle_id}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                          veh.status === 'Moving' ? 'bg-emerald-100 text-emerald-800' :
                          veh.status === 'Maintenance' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {veh.status}
                        </span>
                      </div>

                      <div className="text-xs space-y-1">
                        <p><strong>Driver:</strong> {veh.current_driver_name || 'Ramesh Kumar'}</p>
                        <p><strong>Route:</strong> {veh.current_route || 'Chennai → Bengaluru'}</p>
                        <p><strong>Location:</strong> {veh.location_name || 'Recorded Location'}</p>
                        <p><strong>Speed:</strong> {veh.speed_kmh != null ? `${veh.speed_kmh} km/h` : '0 km/h'}</p>
                        <p><strong>Fuel Level:</strong> {veh.fuel_level_pct != null ? `${veh.fuel_level_pct}%` : 'N/A'}</p>
                      </div>

                      {setActivePage && (
                        <button
                          onClick={() => setActivePage('vehicles')}
                          className="w-full mt-2 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded transition-colors flex items-center justify-center gap-1"
                        >
                          <span>View Vehicle Details</span> <ExternalLink size={12} />
                        </button>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>

      {/* Vehicle Tracking Master Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Recorded Telematics Vehicle List</h3>
          <span className="text-xs text-slate-500 font-mono">Total Vehicles: {vehicles.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
                <th className="py-3 px-4">Vehicle ID</th>
                <th className="py-3 px-4">License Plate</th>
                <th className="py-3 px-4">Driver</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Recorded Location</th>
                <th className="py-3 px-4 text-center">Speed</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Fuel</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-medium">
                    Loading vehicle locations...
                  </td>
                </tr>
              ) : vehicles.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 font-medium">
                    No vehicle telematics records available.
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.vehicle_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{v.vehicle_id}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{v.license_plate}</td>
                    <td className="py-3 px-4 font-medium text-slate-900">{v.current_driver_name || 'Ramesh Kumar'}</td>
                    <td className="py-3 px-4 text-slate-600">{v.current_route || 'Chennai → Bengaluru'}</td>
                    <td className="py-3 px-4 text-slate-800 font-medium">{v.location_name || 'Hub Depot'}</td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-900">
                      {v.speed_kmh != null ? `${v.speed_kmh} km/h` : '0 km/h'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        v.status === 'Moving' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        v.status === 'Maintenance' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                        'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {v.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-700">
                      {v.fuel_level_pct != null ? `${v.fuel_level_pct}%` : 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {setActivePage && (
                        <button
                          onClick={() => setActivePage('vehicles')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded border border-slate-200 transition-colors flex items-center gap-1 inline-flex"
                        >
                          <span>Details</span> <ExternalLink size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
