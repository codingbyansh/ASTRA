// ASTRA Habitat Engineering: Header & Workflow Navigation Bar
import React, { useState } from 'react';
import { useDesign } from '../../store/designStore';
import { AppView } from '../../types';
import { getLocationById, CLIMATE_LOCATIONS } from '../../data/climate';
import {
  Compass,
  Box,
  Sun,
  Layers,
  Activity,
  GitCompare,
  Sliders,
  CheckCircle2,
  FileText,
  BookOpen,
  Play,
  RotateCcw,
  Sparkles,
  Shield,
  Building2,
  Flame,
  Globe,
  Award,
  MapPin,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentDesign,
    activeView,
    setActiveView,
    runSimulation,
    isSimulating,
    loadDemoDataset,
    setAreaLocation,
    lang,
    setLang,
  } = useDesign();

  const location = getLocationById(currentDesign.locationId);

  const navItems: { id: AppView; label: string; hindiLabel: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Overview', hindiLabel: 'अवलोकन', icon: Activity },
    { id: 'designer', label: '3D CAD Designer', hindiLabel: '3D अभिकल्पन', icon: Box },
    { id: 'climate', label: 'Climate Engine', hindiLabel: 'जलवायु इंजन', icon: Sun },
    { id: 'materials', label: 'Materials DB', hindiLabel: 'सामग्री डेटाबेस', icon: Layers },
    { id: 'simulation', label: 'Thermal Solver', hindiLabel: 'तापीय अनुकरण', icon: Activity },
    { id: 'compare', label: 'Compare Designs', hindiLabel: 'तुलना मैट्रिक्स', icon: GitCompare },
    { id: 'optimize', label: 'Design Optimizer', hindiLabel: 'इष्टतमीकरण', icon: Sliders },
    { id: 'validation', label: 'Validation Suite', hindiLabel: 'सत्यापन सूट', icon: CheckCircle2 },
    { id: 'reports', label: 'Official Report', hindiLabel: 'तकनीकी रिपोर्ट', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0f233a] border-b border-[#1c3a5e] shadow-md">
      {/* 1. Top Auxiliary Strip */}
      <div className="bg-[#091728] border-b border-[#162d4a] text-slate-300 text-[11px] py-1 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Platform Tagline */}
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              {lang === 'HI' ? 'परियोजना एस्ट्रा' : 'Project ASTRA'}
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-300 hidden sm:inline">
              {lang === 'HI' ? 'क्षेत्र-विशिष्ट तापीय प्रतिक्रिया विश्लेषक' : 'Area-Specific Thermal Response Analyzer'}
            </span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="text-amber-300/90 hidden md:inline font-mono text-[10px]">
              HABITAT THERMAL & ENVELOPE SIMULATION STUDIO
            </span>
          </div>

          {/* Quick Accessibility & Standards Utility Tools */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded font-mono font-medium hidden lg:inline">
              ISO 6946 · IMAC-2016 · IS 3792 COMPLIANT
            </span>

            {/* Language Switch */}
            <button
              onClick={() => setLang((l) => (l === 'EN' ? 'HI' : 'EN'))}
              className="text-[11px] font-bold px-2.5 py-0.5 rounded bg-[#162e4c] border border-[#274872] text-amber-300 hover:text-white hover:bg-[#203f66] transition flex items-center gap-1.5 shadow-sm"
              title="Toggle English / Hindi Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{lang === 'EN' ? 'हिन्दी' : 'English'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Platform Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* State Emblem & Platform Identity */}
        <div className="flex items-center gap-3.5">
          {/* ASTRA Golden Shield Emblem */}
          <div className="w-11 h-11 rounded-lg bg-gradient-to-b from-[#1b3b61] to-[#0c1f33] border-2 border-amber-500/80 flex flex-col items-center justify-center text-amber-400 shadow-md shrink-0">
            <Shield className="w-6 h-6 text-amber-400 stroke-[1.75]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black tracking-widest text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/50 uppercase">
                ASTRA
              </span>
              <span className="text-[11px] font-bold tracking-wider text-slate-300 bg-[#091728] px-2 py-0.5 rounded border border-[#1c3a5e] uppercase">
                THERMAL SIMULATION PLATFORM
              </span>
              <span className="text-xs text-amber-300/90 font-medium hidden sm:inline">
                {lang === 'HI' ? 'क्षेत्र-विशिष्ट तापीय प्रतिक्रिया विश्लेषक' : 'Area-Specific Thermal Response Analyzer'}
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
              <span>
                {lang === 'HI'
                  ? 'एस्ट्रा (ASTRA) — क्षेत्र-विशिष्ट तापीय प्रतिक्रिया विश्लेषक मंच'
                  : 'ASTRA — Area-Specific Thermal Response Analyzer Platform'}
              </span>
            </h1>
          </div>
        </div>

        {/* Status & Quick Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Dynamic Operational Sector / Area Selector */}
          <div className="flex items-center gap-1.5 bg-[#091728] border border-[#1c3a5e] px-2.5 py-1 rounded-lg shadow-sm">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <label htmlFor="area-sector-select" className="text-[11px] font-bold text-slate-300 uppercase tracking-wider hidden sm:inline">
              {lang === 'HI' ? 'क्षेत्र:' : 'Area:'}
            </label>
            <select
              id="area-sector-select"
              value={currentDesign.locationId}
              onChange={(e) => setAreaLocation(e.target.value, true)}
              className="bg-transparent text-xs font-bold text-amber-300 focus:outline-none cursor-pointer pr-1 py-0.5"
              title="Select Area / Climate Zone"
            >
              {CLIMATE_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id} className="bg-[#0b1b2d] text-slate-100">
                  {loc.shortName} ({loc.altitudeMeters}m MSL)
                </option>
              ))}
            </select>
          </div>

          {/* Area Sector Tag */}
          <div className="hidden xl:flex items-center gap-1.5 text-xs text-slate-200 bg-[#091728]/90 border border-[#1c3a5e] px-2.5 py-1.5 rounded-lg shadow-sm font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-slate-300 font-semibold">{location?.zoneTitle || location?.region}</span>
          </div>

          {/* Run Simulation Primary Action Button */}
          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold text-white rounded-lg shadow-md transition border ${
              isSimulating
                ? 'bg-slate-700 border-slate-600 cursor-not-allowed text-slate-300'
                : 'bg-emerald-700 hover:bg-emerald-600 border-emerald-500/70 shadow-emerald-950 text-white'
            }`}
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : 'fill-white'}`} />
            <span>
              {isSimulating
                ? (lang === 'HI' ? 'गणना जारी...' : 'Computing...')
                : (lang === 'HI' ? 'तापीय सॉल्वर चलाएं' : 'Run Thermal Solver')}
            </span>
          </button>
        </div>
      </div>

      {/* 4. Workflow Navigation Bar */}
      <nav className="bg-[#0b1b2d] border-t border-[#162d4a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto scrollbar-none flex items-center gap-1 py-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-md whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-[#1b3b61] text-amber-300 border-b-2 border-amber-400 font-bold shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-[#12273f]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{lang === 'HI' ? item.hindiLabel : item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};

