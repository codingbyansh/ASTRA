// DRDO Defence Habitat: Simulation Dashboard & Transient Thermal Analytics
import React, { useState } from 'react';
import { useDesign } from '../store/designStore';
import {
  Activity,
  Thermometer,
  Sun,
  ShieldCheck,
  Zap,
  Layers,
  Flame,
  ArrowDown,
  ArrowUp,
  Download,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
} from 'recharts';
import { ThermalComfortDiagnostic } from '../components/ThermalComfortDiagnostic';

export const SimulationPage: React.FC = () => {
  const {
    currentDesign,
    currentSimulationResult,
    runSimulation,
    isSimulating,
    setActiveView,
  } = useDesign();

  const [activeChartTab, setActiveChartTab] = useState<'temperatures' | 'heat_balance' | 'sol_air' | 'energy_totals'>('temperatures');

  if (!currentSimulationResult) {
    return (
      <div className="p-12 text-center bg-white border border-slate-200 rounded-xl space-y-4 shadow-sm">
        <Activity className="w-8 h-8 text-amber-600 mx-auto animate-pulse" />
        <h3 className="text-base font-bold text-slate-900">No Simulation Data Available</h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Execute the ASTRA transient lumped-capacitance heat balance solver to evaluate indoor temperatures and comfort.
        </p>
        <button
          onClick={runSimulation}
          className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 border border-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm transition"
        >
          Run ASTRA Thermal Simulation
        </button>
      </div>
    );
  }

  const { summary, timeseries, location, assumptionsNotes } = currentSimulationResult;

  const exportCSV = () => {
    const headers = [
      'Hour',
      'Day',
      'Outdoor Temp (C)',
      'Indoor Temp (C)',
      'Solar Gain (W)',
      'Wall Cond (W)',
      'Roof Cond (W)',
      'Floor Cond (W)',
      'Vent Loss (W)',
      'Internal Gain (W)',
      'Net Heat Flow (W)',
      'Is Comfortable',
    ];
    const rows = timeseries.map((pt) => [
      pt.hour,
      pt.day,
      pt.outdoorTempC,
      pt.indoorTempC,
      pt.qSolarGlazingGainW,
      pt.qConductionWallsW,
      pt.qConductionRoofW,
      pt.qConductionFloorW,
      pt.qVentilationLossGainW,
      pt.qInternalGainW,
      pt.qNetHeatRateW,
      pt.isComfortable ? 'YES' : 'NO',
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `astra_thermal_simulation_${currentDesign.locationId}_${currentDesign.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Simulation Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">
              ASTRA Transient Thermal Simulation · {location.shortName} Sector
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Area: <span className="text-slate-900 font-semibold">{location.name}</span> ({location.zoneTitle}, {location.altitudeMeters}m MSL) · 
            Shelter Spec: <span className="text-amber-800 font-semibold">{currentDesign.name}</span> · 
            Duration: <span className="text-slate-900 font-semibold">{summary.totalSimulationHours} Hours</span> · 
            Season: <span className="text-amber-800 font-semibold uppercase">{currentDesign.simulationSettings.season}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-lg transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={runSimulation}
            disabled={isSimulating}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 border border-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Computing...' : 'Re-Run Solver'}</span>
          </button>
        </div>
      </div>

      {/* Main KPI Summary Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Min Indoor (Night)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-slate-900 font-mono">{summary.minIndoorTempC}°C</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Outdoor Min: {summary.minOutdoorTempC}°C
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Max Indoor (Day)</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-slate-900 font-mono">{summary.maxIndoorTempC}°C</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Outdoor Max: {summary.maxOutdoorTempC}°C
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Comfort Duration</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-emerald-700 font-mono">{summary.comfortPercentage}%</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            {summary.comfortHoursCount}/{summary.totalSimulationHours} hrs in IMAC Band
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Diurnal Damping</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-amber-800 font-mono">{summary.dampingFactor}</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            Swing: {summary.diurnalIndoorSwingC}°C vs {summary.diurnalOutdoorSwingC}°C
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Daily Solar Gain</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-amber-700 font-mono">{summary.totalSolarGainKwh}</span>
            <span className="text-[10px] text-slate-500 font-semibold">kWh</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-0.5">
            South Glazing Aperture
          </span>
        </div>

        <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-sm">
          <span className="text-[10px] text-slate-500 uppercase font-semibold block">Habitability & Survival Index</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold text-blue-900 font-mono">{summary.drdoColdSurvivalScore}/100</span>
          </div>
          <span className="text-[10px] text-emerald-700 block mt-0.5 font-bold">
            Status: {summary.passiveSurvivabilityIndex.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Thermal Comfort Assessment */}
      <ThermalComfortDiagnostic />

      {/* Chart Selector & Interactive Viewport */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {[
              { id: 'temperatures', label: 'Indoor vs Outdoor & Comfort Band' },
              { id: 'heat_balance', label: 'Dynamic Heat Balance (Watts)' },
              { id: 'sol_air', label: 'Sol-Air Surface Temperatures' },
              { id: 'energy_totals', label: 'Cumulative Energy Balance (kWh)' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveChartTab(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                  activeChartTab === tab.id
                    ? 'bg-blue-900 text-white font-bold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <span className="text-xs font-mono text-slate-500">
            10-min Euler Sub-Stepping Integration
          </span>
        </div>

        {/* Chart 1: Indoor vs Outdoor & Comfort */}
        {activeChartTab === 'temperatures' && (
          <div className="h-80 w-full bg-slate-50 rounded-lg p-3 border border-slate-200">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeseries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="timestampLabel" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="°C" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: number) => [`${val}°C`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                
                {/* Reference Comfort Band Area */}
                <Line
                  type="monotone"
                  dataKey="comfortBandUpperC"
                  name="IMAC Comfort Upper (26°C)"
                  stroke="#059669"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="comfortBandLowerC"
                  name="IMAC Comfort Lower (16°C)"
                  stroke="#059669"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                />

                {/* Main Curves */}
                <Line
                  type="monotone"
                  dataKey="indoorTempC"
                  name="Indoor Air Temp"
                  stroke="#d97706"
                  strokeWidth={3}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="outdoorTempC"
                  name="Outdoor Ambient Temp"
                  stroke="#64748b"
                  strokeWidth={1.5}
                  strokeDasharray="2 2"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Chart 2: Dynamic Heat Balance in Watts */}
        {activeChartTab === 'heat_balance' && (
          <div className="h-80 w-full bg-slate-50 rounded-lg p-3 border border-slate-200">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeseries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="timestampLabel" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="W" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: number) => [`${val} W`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <ReferenceLine y={0} stroke="#94a3b8" />
                <Line type="monotone" dataKey="qSolarGlazingGainW" name="Solar Gain (+W)" stroke="#d97706" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="qInternalGainW" name="Occupants & Int Gain (+W)" stroke="#059669" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="qConductionWallsW" name="Wall Conduction (W)" stroke="#db2777" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="qConductionRoofW" name="Roof Conduction (W)" stroke="#9333ea" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="qVentilationLossGainW" name="Ventilation Loss (W)" stroke="#64748b" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="qNetHeatRateW" name="Net Heat Flow (dT/dt)" stroke="#ea580c" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Chart 3: Sol-Air Temperatures */}
        {activeChartTab === 'sol_air' && (
          <div className="h-80 w-full bg-slate-50 rounded-lg p-3 border border-slate-200">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeseries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="timestampLabel" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="°C" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: number) => [`${val}°C`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="solAirTempWallSouthC" name="South Wall Sol-Air T" stroke="#ea580c" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="solAirTempRoofC" name="Roof Sol-Air T" stroke="#dc2626" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="outdoorTempC" name="Outdoor Ambient T" stroke="#64748b" strokeWidth={1.5} strokeDasharray="3 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Chart 4: Energy Totals Breakdown Bar Chart */}
        {activeChartTab === 'energy_totals' && (
          <div className="h-80 w-full bg-slate-50 rounded-lg p-3 border border-slate-200">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Solar Direct Gain', kwh: summary.totalSolarGainKwh, fill: '#d97706' },
                  { name: 'Internal Gains', kwh: summary.totalInternalGainKwh, fill: '#059669' },
                  { name: 'Envelope Conduction Loss', kwh: summary.totalConductionLossKwh, fill: '#dc2626' },
                  { name: 'Ventilation & Infiltration Loss', kwh: summary.totalVentilationLossKwh, fill: '#7c3aed' },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" unit=" kWh" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: number) => [`${val} kWh / day`, 'Energy Flux']}
                />
                <Bar dataKey="kwh" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Assumptions & Scientific Transparency Box */}
      <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 text-xs">
        <div className="flex items-center gap-1.5 text-amber-800 font-bold">
          <Info className="w-4 h-4" />
          <span>Simulation Physics & Mathematical Formulation</span>
        </div>
        <ul className="list-disc list-inside text-slate-600 space-y-1">
          {assumptionsNotes.map((note, i) => (
            <li key={i}>{note}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
