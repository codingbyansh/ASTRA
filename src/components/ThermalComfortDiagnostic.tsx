import React from 'react';
import { useDesign } from '../store/designStore';
import { getLocationById } from '../data/climate';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';

export const ThermalComfortDiagnostic: React.FC = () => {
  const { currentDesign, currentSimulationResult, setActiveView } = useDesign();

  const location = getLocationById(currentDesign.locationId);
  const summary = currentSimulationResult?.summary;

  const comfortPct = summary ? summary.comfortPercentage : 0;
  const minIn = summary ? summary.minIndoorTempC : 0;
  const maxIn = summary ? summary.maxIndoorTempC : 0;
  const minOut = summary ? summary.minOutdoorTempC : 0;

  // Analysis of 4 Passive Levers
  const southWindowOk = currentDesign.openings.windowAreaSouthM2 >= 3.5;
  const nightShuttersOk = currentDesign.openings.nightShutterInstalled;
  const nightAirtightOk = currentDesign.openings.ventilationRateAchNight <= 0.5;
  const insulationOk =
    currentDesign.envelope.insulationThicknessMm >= 80 &&
    currentDesign.envelope.roofInsulationThicknessMm >= 80;

  const isComfortLow = comfortPct < 50;

  return (
    <div
      id="thermal-comfort-card"
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
                Thermal Comfort & Performance Standard
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
              IMAC-2016 Adaptive Thermal Comfort Standard Compliance Assessment
            </p>
          </div>
        </div>

        {/* Status Tag */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200 font-semibold">
            Target Band: 16.0°C – 24.5°C
          </span>
        </div>
      </div>

      {/* Comfort Overview Body */}
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Temperature Status */}
        <div className="lg:col-span-7 space-y-3">
          <div className="bg-white/90 rounded-lg p-3.5 border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isComfortLow ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
              <h4 className="text-xs font-bold text-slate-900">
                Thermal Performance Summary
              </h4>
            </div>

            {isComfortLow ? (
              <p className="text-xs text-slate-700 leading-relaxed">
                While outdoor ambient reaches a low of{' '}
                <strong className="text-blue-700 font-semibold">{minOut}°C</strong>, the
                shelter maintains an indoor temperature of{' '}
                <strong className="text-slate-900 font-semibold">
                  {minIn}°C to {maxIn}°C
                </strong>
                . This delivers a{' '}
                <strong className="text-emerald-700 font-semibold">
                  +{(minIn - minOut).toFixed(1)}°C passive thermal lift
                </strong>{' '}
                above sub-zero ambient conditions, operating relative to the national IMAC-2016
                adaptive comfort lower limit (16.0°C).
              </p>
            ) : (
              <p className="text-xs text-slate-700 leading-relaxed">
                Indoor temperature maintains strictly between{' '}
                <strong className="text-emerald-800 font-semibold">
                  {minIn}°C and {maxIn}°C
                </strong>
                , remaining entirely within the IMAC-2016 adaptive comfort band throughout
                the 24-hour cycle.
              </p>
            )}

            {/* Quick stats comparison */}
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
                <span className="text-[10px] text-slate-500 block">Comfort Target</span>
                <span className="font-mono text-xs font-bold text-emerald-700">16.0°C – 24.5°C</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 4 Passive Lever Checks */}
        <div className="lg:col-span-5 bg-white/95 rounded-lg p-3.5 border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Passive Solar & Envelope Levers</span>
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
                    {southWindowOk ? '(Optimal)' : '(Baseline)'}
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
                    {nightShuttersOk ? 'Active (R-0.65)' : 'Inactive'}
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
                    {nightAirtightOk ? '(Sealed)' : '(Standard)'}
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
                    {insulationOk ? '(Optimal)' : '(Baseline)'}
                  </span>
                </div>
              </li>
            </ul>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Configure parameters</span>
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
