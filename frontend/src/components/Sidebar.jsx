import React from 'react';
import { 
  LayoutDashboard, Users, FileText, Truck, Receipt, MapPin, CreditCard,
  Wrench, Fuel, ShieldAlert, CheckSquare, FolderArchive, Info, ChevronRight, Scale, X, Bot, Sparkles
} from 'lucide-react';

export default function Sidebar({ activePage, setActivePage, isOpen, onClose }) {
  const menu = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      header: 'Operations',
      items: [
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'contracts', label: 'Contracts', icon: FileText },
        { id: 'shipments', label: 'Shipments', icon: Truck },
        { id: 'invoices', label: 'Invoices', icon: Receipt },
      ]
    },
    {
      header: 'Fleet',
      items: [
        { id: 'vehicles', label: 'Vehicles', icon: Truck },
        { id: 'maintenance', label: 'Maintenance', icon: Wrench },
        { id: 'fuel', label: 'Fuel Logs', icon: Fuel },
        { id: 'fleet-map', label: 'Fleet Map', icon: MapPin },
        { id: 'toll-costs', label: 'Toll Costs', icon: CreditCard },
      ]
    },
    {
      header: 'Audit',
      items: [
        { id: 'ai-assistant', label: 'AI Fleet Assistant', icon: Bot },
        { id: 'billing-audit', label: 'Billing Audit', icon: Scale },
        { id: 'maintenance-audit', label: 'Maintenance Audit', icon: Wrench },
        { id: 'fuel-audit', label: 'Fuel Audit', icon: Fuel },
        { id: 'toll-audit', label: 'Toll Audit', icon: Receipt },
        { id: 'alerts', label: 'Alerts', icon: ShieldAlert },
      ]
    },
    { id: 'action-cases', label: 'Recovery & Actions', icon: CheckSquare },
    { id: 'documents', label: 'Documents', icon: FolderArchive },
    { id: 'about', label: 'About', icon: Info },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    if (onClose) onClose();
  };

  const navContent = (
    <div className="flex flex-col h-full text-slate-300 select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-md shrink-0">
            RR
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-white text-base sm:text-lg tracking-tight truncate">REVROUTE AI</h1>
            <p className="text-[10px] sm:text-[11px] text-teal-400 font-medium tracking-wide uppercase truncate">Detect. Analyze. Recover.</p>
          </div>
        </div>
        {/* Close Button for Mobile Drawer */}
        <button 
          onClick={onClose}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Close menu"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4">
        {menu.map((section, idx) => {
          if (section.header) {
            return (
              <div key={idx} className="space-y-1">
                <div className="px-3 text-[10px] sm:text-[11px] font-semibold tracking-wider text-slate-400 uppercase my-2">
                  {section.header}
                </div>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-sm font-semibold'
                          : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon size={17} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {isActive && <ChevronRight size={14} className="text-blue-200 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            );
          }

          const Icon = section.icon;
          const isActive = activePage === section.id;
          return (
            <button
              key={section.id}
              onClick={() => handleNavClick(section.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-xs sm:text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm font-semibold'
                  : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon size={18} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{section.label}</span>
              </div>
              {isActive && <ChevronRight size={14} className="text-blue-200 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Footer User Info */}
      <div className="p-3.5 sm:p-4 border-t border-slate-800 bg-slate-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-semibold text-xs border border-teal-500/30 shrink-0">
            FM
          </div>
          <div className="text-xs min-w-0">
            <p className="font-semibold text-slate-200 truncate">Fleet Manager</p>
            <p className="text-[10px] text-slate-400 truncate">manager@revroute.ai</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar (Visible on lg screens: >= 1024px) */}
      <aside className="w-64 bg-[#0B1B32] border-r border-slate-800 shadow-xl hidden lg:flex flex-col h-screen sticky top-0 shrink-0 z-30">
        {navContent}
      </aside>

      {/* Mobile & Tablet Slide-Over Drawer Overlay (< 1024px) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Semi-transparent Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200" 
            onClick={onClose}
          />
          {/* Drawer Panel */}
          <aside className="relative w-64 max-w-[80vw] bg-[#0B1B32] border-r border-slate-800 shadow-2xl flex flex-col h-full z-50 animate-in slide-in-from-left duration-200">
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
