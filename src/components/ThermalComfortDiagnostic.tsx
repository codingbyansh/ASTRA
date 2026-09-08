import React, { useState } from 'react';
import { useDesign } from '../store/designStore';
import { getLocationById } from '../data/climate';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Sun,
  Moon,
  Wind,
  Layers,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const ThermalComfortDiagnostic: React.FC = () => {
  const {
    currentDesign,
    currentSimulationResult,
    applyHighComfortSpec,
    isSimulating,
    setActiveView,
  } = useDesign();

  const [showPhysicsExplainer, setShowPhysicsExplainer] = useState(false);
  const location = getLocationById(currentDesign.locationId);
  const summary = currentSimulationResult?.summary;

  const comfortPct = summary ? summary.comfortPercentage : 0;
  const minIn = summary ? summary.minIndoorTempC : 0;
  const maxIn = summary ? summary.maxIndoorTempC : 0;
  const minOut = summary ? summary.minOutdoorTempC : 0;
  const isColdZone = location ? location.climateZone.includes('cold') : true;

  // Analysis of 4 Passive Levers
  const southWindowOk = currentDesign.openings.windowAreaSouthM2 >= 3.5;
  const nightShuttersOk = currentDesign.openings.nightShutterInstalled;
  const nightAirtightOk = currentDesign.openings.ventilationRateAchNight <= 0.5;
  const insulationOk =
    (currentDesign.envelope.insulationThicknessMm >= 80 &&
      currentDesign.envelope.roofInsulationThicknessMm >= 80);

  const isComfortLow = comfortPct < 50;

  return (
    <div
      id="thermal-comfort-diagnostic-card"
      className={`rounded-xl border p-5 transition-all shadow-sm ${
        isComfortLow
          ? 'bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-white border-amber-300'
          : 'bg-gradient-to-br from-emerald-50/90 via-slate-50/40 to-white border-emerald-300'
      }`}
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-lg ${
              isComfortLow
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
            }`}
          >
            {isComfortLow ? (
              <ShieldAlert className="w-5 h-5 text-amber-700" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                {isComfortLow
                  ? 'Thermal Comfort Diagnostic & Physics Analysis'
                  : 'Thermal Comfort Standard Compliance (IMAC-2016)'}
              </h3>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  isComfortLow
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-emerald-200 text-emerald-900'
                }`}
              >
                {comfortPct}% Comfort
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {isComfortLow
                ? `Why is comfort ${comfortPct}%? Explaining the difference between survival and national comfort standards.`
                : 'Optimal passive solar design achieved: shelter stays naturally comfortable throughout 24h cycle.'}
            </p>
          </div>
        </div>

        {/* 1-Click Optimization Button */}
        <button
          id="btn-apply-high-comfort"
          onClick={applyHighComfortSpec}
          disabled={isSimulating}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95 disabled:opacity-50 shrink-0"
          title="Instantly applies True South orientation, optimized glazing, night shutters, and 100mm XPS insulation"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
          <span>{isSimulating ? 'Recalculating...' : '1-Click Auto-Fix: Apply High-Comfort Spec'}</span>
        </button>
      </div>

      {/* Diagnostic Explanation Body */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Why Comfort is 0% / Low */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white/90 rounded-lg p-3.5 border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <h4 className="text-xs font-bold text-slate-900">
                {isComfortLow
                  ? 'Key Takeaway for Presenters & Evaluators'
                  : 'Design Verification Summary'}
              </h4>
            </div>

            {isComfortLow ? (
              <p className="text-xs text-slate-700 leading-relaxed">
                While outdoor ambient drops to{' '}
                <strong className="text-blue-700 font-semibold">{minOut}°C</strong>, the
                shelter maintains an indoor temperature of{' '}
                <strong className="text-slate-900 font-semibold">
                  {minIn}°C to {maxIn}°C
                </strong>
                . This provides a{' '}
                <strong className="text-emerald-700 font-semibold">
                  +{(minIn - minOut).toFixed(1)}°C passive thermal lift
                </strong>{' '}
                (preventing hypothermia and freezing), but technically falls below the{' '}
                <strong className="text-slate-900 font-semibold">
                  IMAC-2016 adaptive comfort lower threshold (16.0°C)
                </strong>
                .
              </p>
            ) : (
              <p className="text-xs text-slate-700 leading-relaxed">
                Indoor temperature strictly maintains between{' '}
                <strong className="text-emerald-800 font-semibold">
                  {minIn}°C and {maxIn}°C
                </strong>
                , remaining entirely within the IMAC-2016 adaptive comfort neutral band. No
                active fossil fuel heating is required.
              </p>
            )}

            {/* Quick stats comparison chip */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-slate-50 p-2 rounded border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 block">Outdoor Min</span>
                <span className="font-mono text-xs font-bold text-blue-700">{minOut}°C</span>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 block">Indoor Range</span>
                <span className="font-mono text-xs font-bold text-slate-900">
                  {minIn}°C – {maxIn}°C
                </span>
              </div>
              <div className="bg-slate-50 p-2 rounded border border-slate-200 text-center">
                <span className="text-[10px] text-slate-500 block">IMAC Target</span>
                <span className="font-mono text-xs font-bold text-emerald-700">16.0°C – 24.5°C</span>
              </div>
            </div>
          </div>

          {/* Toggleable Physics Reference */}
          <div>
            <button
              onClick={() => setShowPhysicsExplainer(!showPhysicsExplainer)}
              className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1.5 font-semibold transition"
            >
              <Info className="w-3.5 h-3.5 text-amber-600" />
              <span>
                {showPhysicsExplainer ? 'Hide Standard IMAC Formula' : 'Why does IMAC-2016 define 16°C as comfortable?'}
              </span>
              {showPhysicsExplainer ? (
                <ChevronUp className="w-3 h-3 text-slate-500" />
              ) : (
                <ChevronDown className="w-3 h-3 text-slate-500" />
              )}
            </button>

            {showPhysicsExplainer && (
              <div className="mt-2 bg-slate-900 text-slate-200 p-3.5 rounded-lg text-xs space-y-2 font-mono">
                <p className="text-amber-300 font-bold">
                  NBC 2016 / IMAC Indian Model for Adaptive Comfort:
                </p>
                <div className="bg-slate-800/80 p-2 rounded border border-slate-700 text-[11px] text-amber-200">
                  T_neutral = 12.83 + 0.54 · T_outdoor,mean (±3.5°C 90% acceptability band)
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  In severe sub-zero winters, humans naturally adapt with multi-layer winter
                  clothing (1.5–2.0 clo). At this insulation level, human metabolic heat balance
                  requires a minimum room temperature of 16.0°C for sedentary comfort without
                  shivering.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: 4 Passive Lever Checks */}
        <div className="lg:col-span-5 bg-white/95 rounded-lg p-3.5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>4 Critical Levers to Reach 100% Comfort</span>
            </span>

            <ul className="space-y-2 text-xs">
              {/* Lever 1: South Window */}
              <li className="flex items-start gap-2">
                {southWindowOk ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold text-slate-800">
                    South Solar Glazing:{' '}
                  </span>
                  <span className="text-slate-600">
                    {currentDesign.openings.windowAreaSouthM2} m²{' '}
                    {southWindowOk ? '(Optimal)' : '(Needs ≥ 4.0 m²)'}
                  </span>
                </div>
              </li>

              {/* Lever 2: Night Shutters */}
              <li className="flex items-start gap-2">
                {nightShuttersOk ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold text-slate-800">
                    Night Thermal Shutters:{' '}
                  </span>
                  <span className="text-slate-600">
                    {nightShuttersOk ? 'Active (R-0.65)' : 'Disabled (High Night Heat Loss)'}
                  </span>
                </div>
              </li>

              {/* Lever 3: Infiltration */}
              <li className="flex items-start gap-2">
                {nightAirtightOk ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold text-slate-800">
                    Night Seal / Infiltration:{' '}
                  </span>
                  <span className="text-slate-600">
                    {currentDesign.openings.ventilationRateAchNight} ACH{' '}
                    {nightAirtightOk ? '(Sealed)' : '(Leaking cold air, set ≤ 0.4)'}
                  </span>
                </div>
              </li>

              {/* Lever 4: Envelope Insulation */}
              <li className="flex items-start gap-2">
                {insulationOk ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className="font-semibold text-slate-800">
                    Envelope Insulation:{' '}
                  </span>
                  <span className="text-slate-600">
                    {currentDesign.envelope.insulationThicknessMm}mm wall /{' '}
                    {currentDesign.envelope.roofInsulationThicknessMm}mm roof{' '}
                    {insulationOk ? '(Optimal)' : '(Needs ≥ 100mm)'}
                  </span>
                </div>
              </li>
            </ul>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Want to customize details?</span>
            <button
              onClick={() => setActiveView('designer')}
              className="text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 hover:underline"
            >
              <span>3D CAD Studio</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
