// DRDO Defence Habitat: Official Government Portal Header & Workflow Navigation Bar
import React, { useState } from 'react';
import { useDesign } from '../../store/designStore';
import { AppView } from '../../types';
import { getLocationById } from '../../data/climate';
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
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentDesign,
    activeView,
    setActiveView,
    runSimulation,
    isSimulating,
    loadDemoDataset,
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
    { id: 'methodology', label: 'NBC/IMAC Physics', hindiLabel: 'भौतिकी मानक', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0f233a] border-b border-[#1c3a5e] shadow-md">
      {/* 1. National Tricolor Top Ribbon (Saffron, White, Green) */}
      <div className="w-full flex h-1.5 overflow-hidden">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-[#FFFFFF]" />
        <div className="flex-1 bg-[#138808]" />
      </div>

      {/* 2. Official Government Top Auxiliary Strip */}
      <div className="bg-[#091728] border-b border-[#162d4a] text-slate-300 text-[11px] py-1 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Official Indian Ministry Tagline */}
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-amber-400 flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
              {lang === 'HI' ? 'भारत सरकार' : 'Government of India'}
            </span>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <span className="text-slate-300 hidden sm:inline">
              {lang === 'HI' ? 'रक्षा मंत्रालय' : 'Ministry of Defence'}
            </span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="text-amber-300/90 hidden md:inline font-mono text-[10px]">
              {lang === 'HI' ? 'डीआरडीओ - डिहार मानकीकृत पोर्टल' : 'DRDO - DIHAR DEFENCE PORTAL'}
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

      {/* 3. Main Government Portal Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* State Emblem & DRDO Portal Identity */}
        <div className="flex items-center gap-3.5">
          {/* DRDO Golden Emblem Badge */}
          <div className="w-11 h-11 rounded-lg bg-gradient-to-b from-[#1b3b61] to-[#0c1f33] border-2 border-amber-500/80 flex flex-col items-center justify-center text-amber-400 shadow-md shrink-0">
            <Shield className="w-6 h-6 text-amber-400 stroke-[1.75]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold tracking-wider text-amber-400 bg-[#091728] px-2 py-0.5 rounded border border-amber-500/40 uppercase">
                DRDO · DIHAR
              </span>
              <span className="text-xs text-slate-200 font-semibold hidden sm:inline">
                {lang === 'HI' ? 'रक्षा अनुसंधान एवं विकास संगठन' : 'Defence Research & Development Organisation'}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
              <span>
                {lang === 'HI'
                  ? 'रक्षा आवास तापीय आराम एवं सीएडी इंजीनियरिंग मंच'
                  : 'Passive Habitat Thermal Comfort & CAD Engineering Platform'}
              </span>
            </h1>
          </div>
        </div>

        {/* Status & Quick Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Deployment Region Badge */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-200 bg-[#091728] border border-[#1c3a5e] px-3 py-1.5 rounded-lg shadow-sm font-mono">
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-slate-100">{location.name}</span>
            <span className="text-amber-400">({location.altitudeMeters}m MSL)</span>
          </div>

          {/* Quick Demo Benchmark Loader */}
          <button
            onClick={() => loadDemoDataset('leh')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-600/50 rounded-lg shadow-sm transition"
            title="Load DRDO Leh-Ladakh Standard Outpost Benchmark"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'HI' ? 'लेह बेंचमार्क' : 'Load Leh Benchmark'}</span>
          </button>

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

