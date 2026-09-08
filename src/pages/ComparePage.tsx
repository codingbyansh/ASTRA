// DRDO Defence Habitat: Multi-Design Comparison Matrix & Superimposed Thermal Profiler
import React, { useState } from 'react';
import { useDesign } from '../store/designStore';
import { ShelterDesign, SimulationResult } from '../types';
import { runThermalSimulation } from '../engine/thermalEngine';
import { getMaterialById } from '../data/materials';
import {
  GitCompare,
  CheckCircle2,
  TrendingUp,
  Box,
  Layers,
  Thermometer,
  ShieldCheck,
  Sun,
  Plus,
  Trash2,
  Play,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const ComparePage: React.FC = () => {
  const { savedDesigns, currentDesign, setCurrentDesign, setActiveView } = useDesign();

  // Run simulation for all saved designs
  const evaluatedDesigns = savedDesigns.map((d) => ({
    design: d,
    result: runThermalSimulation(d),
  }));

  const colors = ['#f59e0b', '#10b981', '#38bdf8', '#ec4899'];

  // Merge time-series data for superimposed comparison plot
  const primaryTimeseries = evaluatedDesigns[0]?.result.timeseries || [];
  const mergedTimeseries = primaryTimeseries.map((pt, idx) => {
    const point: any = {
      timestampLabel: pt.timestampLabel,
      outdoorTempC: pt.outdoorTempC,
    };
    evaluatedDesigns.forEach((item, dIdx) => {
      const dPt = item.result.timeseries[idx];
      point[`design_${dIdx}_temp`] = dPt ? dPt.indoorTempC : null;
    });
    return point;
  });

  const handleSelectActive = (design: ShelterDesign) => {
    setCurrentDesign(design);
    setActiveView('designer');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-amber-700" />
            <h2 className="text-lg font-bold text-slate-900">ASTRA Multi-Design Thermal Performance Comparison</h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Evaluate alternative envelope assemblies, insulation thicknesses & passive solar apertures side-by-side.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <span>Comparing: <strong className="text-amber-800">{evaluatedDesigns.length} Configurations</strong></span>
        </div>
      </div>

      {/* Superimposed Thermal Performance Chart */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
            <Thermometer className="w-4 h-4 text-amber-700" />
            <span>Superimposed 24h Indoor Temperature Waveforms</span>
          </div>
          <span className="text-[11px] font-mono text-slate-500">Unit: °Celsius</span>
        </div>

        <div className="h-72 w-full bg-slate-50 rounded-lg p-2 border border-slate-200">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mergedTimeseries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="timestampLabel" stroke="#64748b" tick={{ fontSize: 10 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 10 }} unit="°C" />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '11px', color: '#0f172a' }}
                formatter={(val: number) => [`${val}°C`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '11px' }} />

              {/* Outdoor Ambient Reference Line */}
              <Line
                type="monotone"
                dataKey="outdoorTempC"
                name="Outdoor Ambient Temp"
                stroke="#64748b"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />

              {/* Design Curves */}
              {evaluatedDesigns.map((item, idx) => (
                <Line
                  key={item.design.id}
                  type="monotone"
                  dataKey={`design_${idx}_temp`}
                  name={item.design.name}
                  stroke={colors[idx % colors.length]}
                  strokeWidth={2.5}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {evaluatedDesigns.map((item, idx) => {
          const { design, result } = item;
          const { summary } = result;
          const isCurrent = design.id === currentDesign.id;
          const wallMat = getMaterialById(design.envelope.wallMaterialId);
          const insMat = getMaterialById(design.envelope.insulationMaterialId);

          return (
            <div
              key={design.id}
              className={`bg-white rounded-xl p-5 border flex flex-col justify-between shadow-sm transition ${
                isCurrent
                  ? 'border-amber-600 ring-1 ring-amber-500/80 bg-amber-50/20'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-4">
                {/* Card Title */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: colors[idx % colors.length] }}
                      />
                      <h3 className="text-xs font-bold text-slate-900 leading-snug">{design.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      {design.tags?.map((t) => (
                        <span key={t} className="text-[10px] font-mono text-slate-600 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {isCurrent && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                      Active
                    </span>
                  )}
                </div>

                {/* Key Thermophysical Metrics Table */}
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Min Temp (Night):</span>
                    <span className="font-bold text-slate-900">{summary.minIndoorTempC}°C</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Thermal Comfort %:</span>
                    <span className="font-bold text-emerald-700">{summary.comfortPercentage}%</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Effective Envelope U:</span>
                    <span className="font-bold text-amber-800">{summary.effectiveEnvelopeUValue} W/m²K</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Daily Heat Loss:</span>
                    <span className="text-red-700 font-bold">{summary.totalConductionLossKwh} kWh</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Passive Solar Gain:</span>
                    <span className="text-amber-800 font-bold">{summary.totalSolarGainKwh} kWh</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Habitability Score:</span>
                    <span className="font-bold text-blue-900">{summary.drdoColdSurvivalScore}/100</span>
                  </div>
                </div>

                {/* Construction Specs */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-[11px] space-y-1">
                  <div className="text-slate-700">
                    <strong className="text-slate-900 font-medium">Wall:</strong> {wallMat.name} ({design.envelope.wallThicknessMm}mm)
                  </div>
                  <div className="text-slate-700">
                    <strong className="text-slate-900 font-medium">Insulation:</strong> {insMat.name} ({design.envelope.insulationThicknessMm}mm)
                  </div>
                  <div className="text-slate-700">
                    <strong className="text-slate-900 font-medium">Glazing:</strong> {design.openings.windowAreaSouthM2}m² South ({design.openings.glazingType})
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-4 pt-3 border-t border-slate-200">
                <button
                  onClick={() => handleSelectActive(design)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-slate-800 hover:text-white bg-slate-100 hover:bg-slate-800 border border-slate-200 rounded-lg transition"
                >
                  <Box className="w-3.5 h-3.5" />
                  <span>Inspect in 3D CAD</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
