// DRDO Defence Habitat: Design Optimizer Studio & Recommendation Engine
import React, { useState } from 'react';
import { useDesign } from '../store/designStore';
import { getLocationById } from '../data/climate';
import { OptimizationGoal } from '../types';
import {
  Sliders,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Thermometer,
  Sun,
  Flame,
  CheckCircle2,
  ArrowRight,
  Zap,
  Play,
  RotateCcw,
  Layers,
  Award,
} from 'lucide-react';

export const OptimizerPage: React.FC = () => {
  const {
    currentDesign,
    setCurrentDesign,
    optimizationResult,
    runOptimization,
    isOptimizing,
    setActiveView,
  } = useDesign();

  const location = getLocationById(currentDesign.locationId);
  const [objective, setObjective] = useState<OptimizationGoal['objective']>('balanced_drdo_cold_climate');

  const handleRunOptimizer = () => {
    runOptimization({ objective });
  };

  const handleApplyRecommended = () => {
    if (!optimizationResult) return;
    setCurrentDesign(optimizationResult.recommendedDesign.design);
    setActiveView('designer');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-700" />
            <h2 className="text-lg font-bold text-slate-900">
              ASTRA Passive Shelter Optimizer · {location?.shortName} Sector
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Algorithmic multi-objective search engineered for {location?.name} ({location?.zoneTitle}, {location?.altitudeMeters}m MSL).
          </p>
        </div>

        <button
          onClick={handleRunOptimizer}
          disabled={isOptimizing}
          className="flex items-center gap-2 px-5 py-2 bg-emerald-700 hover:bg-emerald-600 border border-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm transition"
        >
          <Play className={`w-4 h-4 ${isOptimizing ? 'animate-spin' : ''}`} />
          <span>{isOptimizing ? 'Optimizing Candidates...' : 'Run Optimization Algorithm'}</span>
        </button>
      </div>

      {/* Objective Selector */}
      <div className="bg-white border border-slate-200 p-4 rounded-xl space-y-3 shadow-sm">
        <label className="text-xs font-bold text-slate-900 block">
          Select Primary Optimization Target:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            {
              id: 'balanced_drdo_cold_climate',
              title: `ASTRA ${location?.zoneTitle || 'Regional'} Spec`,
              desc: `Maximizes thermal comfort, inertia and envelope resistance for ${location?.name || 'the deployment sector'}.`,
            },
            {
              id: 'maximize_comfort',
              title: 'Maximize Comfort Hours',
              desc: 'Maximizes % duration within IMAC adaptive comfort band (18°C-24°C).',
            },
            {
              id: 'minimize_heat_loss',
              title: 'Minimize Envelope Heat Loss',
              desc: 'Super-insulation priority to reduce passive heating degradation.',
            },
            {
              id: 'maximize_solar_gain',
              title: 'Maximize Passive Solar Gain',
              desc: 'Maximizes South glazing aperture and solar direct capture.',
            },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setObjective(item.id as any)}
              className={`p-3.5 rounded-lg border cursor-pointer transition ${
                objective === item.id
                  ? 'bg-amber-50/70 border-amber-600 shadow-sm ring-1 ring-amber-500/50'
                  : 'bg-slate-50 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">{item.title}</span>
                {objective === item.id && <CheckCircle2 className="w-3.5 h-3.5 text-amber-700" />}
              </div>
              <p className="text-[11px] text-slate-600 mt-1.5 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Optimization Results Section */}
      {optimizationResult ? (
        <div className="space-y-6">
          {/* Winner Showcase Banner */}
          <div className="bg-emerald-50/50 border border-emerald-300 rounded-xl p-6 shadow-sm relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3 max-w-3xl">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-700" />
                    RECOMMENDED OPTIMAL CONFIGURATION (Rank #1)
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
                    Score: {optimizationResult.recommendedDesign.score}/100
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  {optimizationResult.recommendedDesign.name}
                </h3>

                <p className="text-xs text-slate-700 leading-relaxed">
                  Optimized specifically for {location?.name} ({location?.zoneTitle}, {location?.altitudeMeters}m MSL). Balances climate-appropriate thermal envelope resistance with passive solar gain and high thermal lag storage.
                </p>

                {/* Key Quantitative Deltas over Baseline */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-500 block font-mono">Min Night Temp Lift</span>
                    <span className="text-base font-bold text-emerald-700 font-mono">
                      +{optimizationResult.recommendedDesign.improvementsOverBaseline.minTempDeltaC}°C
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-500 block font-mono">Comfort Duration</span>
                    <span className="text-base font-bold text-emerald-700 font-mono">
                      +{optimizationResult.recommendedDesign.improvementsOverBaseline.comfortDeltaPercent}%
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-500 block font-mono">Heat Loss Cut</span>
                    <span className="text-base font-bold text-amber-800 font-mono">
                      -{optimizationResult.recommendedDesign.improvementsOverBaseline.heatLossReductionPercent}%
                    </span>
                  </div>

                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-xs">
                    <span className="text-[10px] text-slate-500 block font-mono">Solar Gain Boost</span>
                    <span className="text-base font-bold text-amber-700 font-mono">
                      +{optimizationResult.recommendedDesign.improvementsOverBaseline.solarGainIncreasePercent}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Apply Action Button */}
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={handleApplyRecommended}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-700 hover:bg-emerald-600 border border-emerald-600 text-white text-xs font-bold rounded-xl shadow-sm transition"
                >
                  <span>Apply Recommended Design to CAD</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Detailed Engineering Justifications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-sm">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-700" />
                <span>Why This Configuration Scored Highest</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {optimizationResult.engineeringJustifications.map((j, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{j}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-3 shadow-sm">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>Recommended Engineering Actions</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {optimizationResult.recommendedActions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-50 text-amber-800 border border-amber-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Evaluated Candidate Designs Leaderboard */}
          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Candidate Configurations Evaluated ({optimizationResult.candidates.length})
            </h4>

            <div className="space-y-3">
              {optimizationResult.candidates.map((cand) => (
                <div
                  key={cand.id}
                  className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Rank #{cand.rank}
                      </span>
                      <h5 className="text-xs font-bold text-slate-900">{cand.name}</h5>
                    </div>
                    <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5 pt-1">
                      {cand.keyDifferentiators.slice(0, 3).map((diff, i) => (
                        <li key={i}>{diff}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Min Temp</span>
                      <span className="text-slate-900 font-bold">{cand.result.summary.minIndoorTempC}°C</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Comfort %</span>
                      <span className="text-emerald-700 font-bold">{cand.result.summary.comfortPercentage}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Score</span>
                      <span className="text-amber-800 font-bold">{cand.score}/100</span>
                    </div>
                    <button
                      onClick={() => {
                        setCurrentDesign(cand.design);
                        setActiveView('designer');
                      }}
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold rounded-lg shadow-xs transition"
                    >
                      Load
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-xl space-y-3 shadow-sm">
          <Sliders className="w-8 h-8 text-amber-700 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">Optimizer Ready</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Click 'Run Optimization Algorithm' to explore parametric permutations of orientation, insulation thickness, thermal mass, and glazing apertures.
          </p>
          <button
            onClick={handleRunOptimizer}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 border border-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            Run Optimization Now
          </button>
        </div>
      )}
    </div>
  );
};
