import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Management Portal Pages
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Contracts from './pages/Contracts';
import Shipments from './pages/Shipments';
import Invoices from './pages/Invoices';
import Vehicles from './pages/Vehicles';
import Maintenance from './pages/Maintenance';
import FuelLogs from './pages/FuelLogs';
import BillingAudit from './pages/BillingAudit';
import MaintenanceAudit from './pages/MaintenanceAudit';
import FuelAudit from './pages/FuelAudit';
import Alerts from './pages/Alerts';
import ActionCases from './pages/ActionCases';
import Documents from './pages/Documents';
import About from './pages/About';

// Driver Portal Components & Pages
import DriverHeader from './components/driver/DriverHeader';
import DriverLogin from './pages/driver/DriverLogin';
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverFuelEntry from './pages/driver/DriverFuelEntry';
import DriverRepairEntry from './pages/driver/DriverRepairEntry';
import DriverHistory from './pages/driver/DriverHistory';
import { Menu } from 'lucide-react';

export default function App() {
  // Active Portal State: 'manager' | 'driver'
  const [portal, setPortal] = useState('manager');

  // Management Portal Active Page State
  const [activePage, setActivePage] = useState('dashboard');

  // Mobile Sidebar Drawer State
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Driver Portal Active Page State: 'dashboard' | 'fuel' | 'repair' | 'history' | 'login'
  const [driverPage, setDriverPage] = useState('dashboard');

  // Auth User State
  const [currentUser, setCurrentUser] = useState({
    id: 1,
    name: 'Fleet Manager',
    email: 'manager@revroute.ai',
    role: 'Fleet Manager',
    assigned_vehicle_id: null
  });

  const handleDriverLoginSuccess = (user) => {
    setCurrentUser(user);
    setPortal('driver');
    setDriverPage('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setDriverPage('login');
  };

  const pageMeta = {
    dashboard: { title: 'Executive Logistics Dashboard', subtitle: 'Dynamic operational KPIs and financial leakage analytics' },
    customers: { title: 'Customer Directory', subtitle: 'Operations / Customer Master' },
    contracts: { title: 'Contract Management', subtitle: 'Operations / Customer Contracts' },
    shipments: { title: 'Shipment Management', subtitle: 'Operations / Trip Dispatch & Detention' },
    invoices: { title: 'Invoice Registry', subtitle: 'Operations / Customer Billing Invoices' },
    vehicles: { title: 'Vehicle Directory', subtitle: 'Fleet / Vehicle Master & Baselines' },
    maintenance: { title: 'Fleet Maintenance', subtitle: 'Fleet / Repairs & Benchmarks' },
    fuel: { title: 'Fuel Consumption Logs', subtitle: 'Fleet / Fuel Logs & Tank Levels' },
    'billing-audit': { title: 'Billing Revenue Leakage Audit', subtitle: 'Audit Engine / Module 1 — Billing Discrepancies' },
    'maintenance-audit': { title: 'Maintenance Cost Overrun Audit', subtitle: 'Audit Engine / Module 2 — Operational Repair Overruns' },
    'fuel-audit': { title: 'Fuel Consumption & Cost Variance Audit', subtitle: 'Audit Engine / Module 3 — Fuel Baselines & Variances' },
    alerts: { title: 'Leakage & Operational Variance Alerts', subtitle: 'Audit Engine / Centralized Alert Queue' },
    'action-cases': { title: 'Recovery & Corrective Action Cases', subtitle: 'Human Action & Financial Recovery Tracking' },
    documents: { title: 'AI Document Processing Hub', subtitle: 'Document AI / OCR Field Extractor' },
    about: { title: 'About RevRoute AI', subtitle: 'System Architecture, Principles & Future Scope' },
  };

  const currentMeta = pageMeta[activePage] || { title: 'RevRoute AI', subtitle: '' };

  const renderManagerContent = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard setActivePage={setActivePage} />;
      case 'customers':
        return <Customers />;
      case 'contracts':
        return <Contracts />;
      case 'shipments':
        return <Shipments />;
      case 'invoices':
        return <Invoices />;
      case 'vehicles':
        return <Vehicles />;
      case 'maintenance':
        return <Maintenance />;
      case 'fuel':
        return <FuelLogs />;
      case 'billing-audit':
        return <BillingAudit setActivePage={setActivePage} />;
      case 'maintenance-audit':
        return <MaintenanceAudit setActivePage={setActivePage} />;
      case 'fuel-audit':
        return <FuelAudit setActivePage={setActivePage} />;
      case 'alerts':
        return <Alerts setActivePage={setActivePage} />;
      case 'action-cases':
        return <ActionCases />;
      case 'documents':
        return <Documents />;
      case 'about':
        return <About />;
      default:
        return <Dashboard setActivePage={setActivePage} />;
    }
  };

  const renderDriverContent = () => {
    if (!currentUser || driverPage === 'login') {
      return (
        <DriverLogin
          onLoginSuccess={handleDriverLoginSuccess}
          onSwitchToManager={() => setPortal('manager')}
        />
      );
    }

    switch (driverPage) {
      case 'dashboard':
        return <DriverDashboard currentUser={currentUser} setDriverPage={setDriverPage} />;
      case 'fuel':
        return <DriverFuelEntry currentUser={currentUser} setDriverPage={setDriverPage} />;
      case 'repair':
        return <DriverRepairEntry currentUser={currentUser} setDriverPage={setDriverPage} />;
      case 'history':
        return <DriverHistory currentUser={currentUser} setDriverPage={setDriverPage} />;
      default:
        return <DriverDashboard currentUser={currentUser} setDriverPage={setDriverPage} />;
    }
  };

  // Render Driver Portal View
  if (portal === 'driver') {
    if (!currentUser || driverPage === 'login') {
      return (
        <DriverLogin
          onLoginSuccess={handleDriverLoginSuccess}
          onSwitchToManager={() => setPortal('manager')}
        />
      );
    }

    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <DriverHeader
          currentUser={currentUser}
          driverPage={driverPage}
          setDriverPage={setDriverPage}
          onLogout={handleLogout}
          onSwitchPortal={() => setPortal('manager')}
        />
        <main className="bg-[#F8FAFC]">
          {renderDriverContent()}
        </main>
      </div>
    );
  }

  // Render Existing Management Portal View
  return (
    <div className="flex min-h-screen bg-[#F8FAFC] max-w-full">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header with Portal Switcher & Hamburger Toggle */}
        <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 flex items-center justify-between shadow-xs sticky top-0 z-20 gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
              aria-label="Open Navigation Menu"
            >
              <Menu size={20} />
            </button>

            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight truncate">{currentMeta.title}</h1>
              {currentMeta.subtitle && <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">{currentMeta.subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => {
                setPortal('driver');
                if (!currentUser || currentUser.role !== 'Driver') {
                  setCurrentUser({
                    id: 2,
                    name: 'Ramesh Kumar',
                    email: 'driver1@revroute.ai',
                    role: 'Driver',
                    assigned_vehicle_id: 'TRK-101'
                  });
                }
                setDriverPage('dashboard');
              }}
              className="px-2.5 sm:px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-[11px] sm:text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>Driver Portal</span>
            </button>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-3">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                FM
              </div>
              <span className="text-xs sm:text-sm font-medium text-slate-700 hidden sm:inline">Fleet Manager</span>
            </div>
          </div>
        </div>

        <main className="flex-1 bg-[#F8FAFC]">
          {renderManagerContent()}
        </main>
      </div>
    </div>
  );
}
