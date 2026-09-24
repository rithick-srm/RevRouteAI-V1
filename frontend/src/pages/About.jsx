import React from 'react';
import { ShieldCheck, Cpu, Code, Database, Sparkles, CheckCircle2 } from 'lucide-react';

export default function About() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 sm:space-y-8">
      {/* Hero Banner */}
      <div className="bg-slate-900 text-white p-5 sm:p-8 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/30 text-blue-300 text-xs font-semibold border border-blue-500/30">
            <Sparkles size={14} /> College CSE AIML Project Prototype
          </div>
          <span className="text-xs text-slate-400 font-mono">v1.0.0</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">RevRoute AI</h1>
        <p className="text-teal-400 text-xs sm:text-sm font-semibold tracking-wider uppercase">
          AI-Assisted Logistics Financial & Operational Leakage Audit Platform
        </p>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-3xl">
          RevRoute AI uses AI-assisted document extraction and deterministic auditing rules to compare contractual, operational and financial records. The platform identifies potential revenue leakage, maintenance cost overruns, and fuel consumption variances, providing a human-reviewed workflow for verification and recovery or corrective action.
        </p>

        <div className="pt-4 border-t border-slate-800 flex items-center gap-6 text-xs text-slate-300 font-mono">
          <span>Core Principle: <strong>AI EXTRACTS → RULES CALCULATE → HUMAN VERIFIES</strong></span>
        </div>
      </div>

      {/* 3 Audit Modules Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="p-2 w-fit rounded-lg bg-blue-50 text-blue-600 font-bold text-xs uppercase">Module 1</div>
          <h3 className="font-bold text-slate-900 text-sm">Billing Revenue Leakage</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Identifies unbilled or underbilled customer freight, missing fuel surcharges, weight overcharges, and warehouse detention fees.
          </p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="p-2 w-fit rounded-lg bg-teal-50 text-teal-600 font-bold text-xs uppercase">Module 2</div>
          <h3 className="font-bold text-slate-900 text-sm">Maintenance Cost Overrun</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Identifies operational repair costs exceeding reference benchmarks, duplicate service records, and repeated maintenance patterns.
          </p>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-2">
          <div className="p-2 w-fit rounded-lg bg-amber-50 text-amber-600 font-bold text-xs uppercase">Module 3</div>
          <h3 className="font-bold text-slate-900 text-sm">Fuel Consumption & Cost Variance</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Calculates expected fuel consumption based on distance and vehicle baseline mileage, highlighting abnormal variances for investigation.
          </p>
        </div>
      </div>

      {/* Technology Stack */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Code size={18} className="text-blue-600" /> Technology Stack
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 block">Frontend</span>
            <span className="text-slate-600">React.js, Vite, Tailwind CSS, Chart.js, Lucide Icons</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 block">Backend</span>
            <span className="text-slate-600">Python 3.14, FastAPI, SQLAlchemy ORM</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 block">Database</span>
            <span className="text-slate-600">MySQL 8.0 / SQLite dual compatibility</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="font-bold text-slate-800 block">Document Processing</span>
            <span className="text-slate-600">PyPDF2, PIL, Regex Parser, Tesseract OCR</span>
          </div>
        </div>
      </div>

      {/* MVP Limitations */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-amber-700 flex items-center gap-2">
          <ShieldCheck size={18} /> MVP System Limitations
        </h3>
        <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
          <li>Billing calculations use simplified contract pricing structures (PER_KM, PER_KG, FLAT).</li>
          <li>One invoice is associated with one shipment in the MVP.</li>
          <li>Contract and invoice document AI extraction provides suggested fields requiring human manager verification.</li>
          <li>Fuel consumption may be estimated based on fuel purchases when tank level sensors are unavailable.</li>
          <li>Maintenance benchmarks are configurable reference values for comparison.</li>
          <li>Alerts indicate potential financial & operational discrepancies and do not establish fraud or legal liability.</li>
        </ul>
      </div>

      {/* Future Scope */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-blue-700 flex items-center gap-2">
          <Cpu size={18} /> Future Scope & Enhancements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600">
          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <strong className="text-slate-900 block mb-1">Advanced Document AI & LLMs</strong>
            More advanced multi-page contract extraction and LLM-generated natural language audit summaries.
          </div>
          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <strong className="text-slate-900 block mb-1">IoT Telematics & OBD-II</strong>
            Real-time CAN bus fuel level telemetry, OBD-II diagnostic fault codes, and live GPS tracking.
          </div>
          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <strong className="text-slate-900 block mb-1">Predictive Maintenance</strong>
            Machine learning models to forecast component failure risks based on historical vehicle maintenance logs.
          </div>
          <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-100">
            <strong className="text-slate-900 block mb-1">Enterprise ERP Integration</strong>
            Direct integrations with SAP, Oracle, and enterprise logistics management platforms.
          </div>
        </div>
      </div>
    </div>
  );
}
