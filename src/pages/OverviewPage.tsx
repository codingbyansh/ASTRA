// DRDO Defence Habitat: Overview Dashboard & Design Summary
import React from 'react';
import { useDesign } from '../store/designStore';
import { Shelter3DViewer } from '../components/ThreeCanvas/Shelter3DViewer';
import { getLocationById } from '../data/climate';
import { getMaterialById } from '../data/materials';
import { calculateGeometricBreakdown } from '../engine/thermalEngine';
import {
  Thermometer,
  Sun,
  ShieldCheck,
  Zap,
  Box,
  Compass,
  Layers,
  ArrowRight,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Sliders,
  CheckCircle2,
  Shield,
} from 'lucide-react';

export const OverviewPage: React.FC = () => {
  const {
    currentDesign,
    currentSimulationResult,
    setActiveView,
    loadDemoDataset,
    runSimulation,
    isSimulating,
  } = useDesign();

  const location = getLocationById(currentDesign.locationId);
  const geo = calculateGeometricBreakdown(currentDesign);
  const wallMat = getMaterialById(currentDesign.envelope.wallMaterialId);
  const roofMat = getMaterialById(currentDesign.envelope.roofMaterialId);
  const insMat = getMaterialById(currentDesign.envelope.insulationMaterialId);

  const summary = currentSimulationResult?.summary;

  return (
    <div className="space-y-6">
      {/* Hero / Strategic Overview Banner */}
      <div className="bg-gradient-to-r from-[#0b1728] via-[#0f213b] to-[#0b1728] border-2 border-[#1f385c] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-600/50">
                DRDO Defence Habitat Optimization Platform
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Scientific Lumped-Capacitance Heat Balance Model
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Design High-Altitude Shelters for Extreme Himalayan Climates
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Area-specific passive solar and high thermal inertia shelter design portal for Indian Armed Forces outposts.
              Evaluates dynamic sol-air solar irradiance, multi-layer envelope conduction, internal thermal mass dampening,
              and IMAC-2016 adaptive thermal comfort across Leh, Siachen Base, Dras, and Tawang.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setActiveView('designer')}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-950/60 border border-emerald-500/70 transition"
            >
              <Box className="w-4 h-4" />
              <span>Open 3D CAD Studio</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveView('optimize')}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#142640] hover:bg-[#1a3254] text-amber-300 border border-amber-600/50 text-xs font-bold rounded-xl transition shadow-sm"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Optimize Configuration</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Performance KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Min Indoor Temp */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-semibold text-slate-500">Min Indoor Temp (Night)</span>
            <Thermometer className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {summary ? `${summary.minIndoorTempC}°C` : '--'}
            </span>
            <span className="text-xs font-medium text-slate-500">
              (Ambient: {summary ? `${summary.minOutdoorTempC}°C` : '--'})
            </span>
          </div>
          <div className="mt-2 text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded flex items-center gap-1 font-semibold w-fit">
            <TrendingUp className="w-3 h-3 text-emerald-700" />
            <span>
              +{summary ? (summary.minIndoorTempC - summary.minOutdoorTempC).toFixed(1) : 0}°C Passive Thermal Lift
            </span>
          </div>
        </div>

        {/* Comfort Percentage */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-semibold text-slate-500">Thermal Comfort %</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {summary ? `${summary.comfortPercentage}%` : '--'}
            </span>
            <span className="text-xs font-medium text-slate-500">
              ({summary ? summary.comfortHoursCount : 0}/{summary ? summary.totalSimulationHours : 24} hrs)
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 font-medium">
            IMAC / NBC 2016 Adaptive Comfort Band
          </div>
        </div>

        {/* Daily Solar Gain */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-semibold text-slate-500">Direct Passive Solar Gain</span>
            <Sun className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {summary ? `${summary.totalSolarGainKwh} kWh` : '--'}
            </span>
            <span className="text-xs font-medium text-slate-500">per 24h cycle</span>
          </div>
          <div className="mt-2 text-[11px] text-amber-900 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium w-fit">
            Aperture: {currentDesign.openings.windowAreaSouthM2} m² South Glazing
          </div>
        </div>

        {/* Envelope Average U-Value */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-semibold text-slate-500">Effective Envelope U-Value</span>
            <Layers className="w-4 h-4 text-slate-700" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">
              {summary ? `${summary.effectiveEnvelopeUValue}` : '--'}
            </span>
            <span className="text-xs font-medium text-slate-500">W/(m²·K)</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-600 font-medium">
            Area-weighted walls, roof & glazing
          </div>
        </div>
      </div>

      {/* Main Grid: 3D CAD Preview + Climate & Assembly Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: 3D Interactive Viewer */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Parametric 3D Shelter Visualizer (Solar Sun-Path & Envelope)
              </h3>
            </div>
            <button
              onClick={() => setActiveView('designer')}
              className="text-xs text-blue-700 hover:text-blue-900 flex items-center gap-1 font-bold hover:underline"
            >
              <span>Full 3D Studio</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <Shelter3DViewer design={currentDesign} heightClass="h-[420px]" />
          </div>
        </div>

        {/* Right 1 Col: Current Project Spec & Climate Details */}
        <div className="space-y-4">
          {/* Active Climate Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-slate-900">Deployed Location</span>
              </div>
              <button
                onClick={() => setActiveView('climate')}
                className="text-xs font-bold text-blue-700 hover:underline"
              >
                Change
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Location:</span>
                <span className="font-bold text-slate-900">{location.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Altitude:</span>
                <span className="text-slate-800 font-mono font-semibold">{location.altitudeMeters} meters MSL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Design Winter Temp:</span>
                <span className="text-rose-700 font-mono font-bold">{location.designWinterTempC}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Solar Irradiance:</span>
                <span className="text-slate-800 font-mono font-semibold">{location.annualSolarRadiationKwhM2} kWh/m²/yr</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 leading-relaxed">
              {location.drdoRelevanceNotes}
            </div>
          </div>

          {/* Envelope & Materials Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-slate-900">Envelope Assembly</span>
              </div>
              <button
                onClick={() => setActiveView('materials')}
                className="text-xs font-bold text-blue-700 hover:underline"
              >
                Inspect
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-start">
                <span className="text-slate-500">Wall:</span>
                <span className="text-slate-800 font-medium text-right">
                  {wallMat.name} ({currentDesign.envelope.wallThicknessMm}mm)
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-500">Insulation:</span>
                <span className="text-amber-800 font-medium text-right">
                  {insMat.name} ({currentDesign.envelope.insulationThicknessMm}mm)
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-500">Roof:</span>
                <span className="text-slate-800 font-medium text-right">
                  {roofMat.name}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-500">Occupancy:</span>
                <span className="text-slate-900 font-bold">
                  {currentDesign.occupants.count} Personnel ({currentDesign.occupants.heatPerPersonWatts}W sensible)
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-slate-500">Enclosed Vol:</span>
                <span className="text-slate-800 font-mono font-semibold">{geo.enclosedVolumeM3} m³</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Workflow Navigation Stepper */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
          Integrated Development & Design Lifecycle
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {[
            { step: '01', title: 'Climate & Solar', view: 'climate' as const, desc: 'Hourly DNI & weather' },
            { step: '02', title: '3D Geometry', view: 'designer' as const, desc: 'Parametric CAD & solar' },
            { step: '03', title: 'Materials DB', view: 'materials' as const, desc: 'Thermophysical specs' },
            { step: '04', title: 'Thermal Solver', view: 'simulation' as const, desc: 'Transient heat balance' },
            { step: '05', title: 'Optimizer', view: 'optimize' as const, desc: 'Multi-criteria ranking' },
            { step: '06', title: 'Validation Suite', view: 'validation' as const, desc: 'ASHRAE / EnergyPlus' },
          ].map((item) => (
            <button
              key={item.step}
              onClick={() => setActiveView(item.view)}
              className="text-left p-3 rounded-lg bg-slate-50 hover:bg-amber-50/70 border border-slate-200 hover:border-amber-400 transition group shadow-sm"
            >
              <div className="text-[10px] font-mono text-amber-700 font-bold mb-1">
                STEP {item.step}
              </div>
              <div className="text-xs font-bold text-slate-900 group-hover:text-amber-900 transition">
                {item.title}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
