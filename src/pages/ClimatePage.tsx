// DRDO Defence Habitat: Climate Engine & Solar Radiation Climatology Suite
import React, { useState } from 'react';
import { useDesign } from '../store/designStore';
import { CLIMATE_LOCATIONS, generateHourlyClimateData, getLocationById } from '../data/climate';
import { Season } from '../types';
import {
  Sun,
  Wind,
  Droplets,
  Compass,
  MapPin,
  CheckCircle2,
  Calendar,
  Layers,
  Thermometer,
  Shield,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';

export const ClimatePage: React.FC = () => {
  const { currentDesign, setCurrentDesign, runSimulation } = useDesign();
  const [selectedSeason, setSelectedSeason] = useState<Season>(currentDesign.simulationSettings.season);

  const activeLoc = getLocationById(currentDesign.locationId);
  const hourlyData = generateHourlyClimateData(currentDesign.locationId, selectedSeason, 24);

  const handleLocationSelect = (locId: string) => {
    setCurrentDesign((prev) => ({
      ...prev,
      locationId: locId,
      updatedAt: new Date().toISOString(),
    }));
  };

  const handleSeasonChange = (season: Season) => {
    setSelectedSeason(season);
    setCurrentDesign((prev) => ({
      ...prev,
      simulationSettings: { ...prev.simulationSettings, season },
      updatedAt: new Date().toISOString(),
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">Area-Specific Climate & Solar Engine</h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Standardized IMD, ISHRAE & NASA POWER hourly climatological profiles for defence deployment zones.
          </p>
        </div>

        {/* Season Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
          <Calendar className="w-4 h-4 text-slate-500 ml-1.5" />
          {[
            { id: 'winter', label: 'Winter (Critical Cold)' },
            { id: 'summer', label: 'Summer' },
            { id: 'monsoon', label: 'Monsoon' },
          ].map((s) => (
            <button
              key={s.id}
              onClick={() => handleSeasonChange(s.id as Season)}
              className={`px-3 py-1 text-xs font-semibold rounded transition ${
                selectedSeason === s.id
                  ? 'bg-blue-900 text-white font-bold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Climate Location Selector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CLIMATE_LOCATIONS.map((loc) => {
          const isSelected = loc.id === currentDesign.locationId;
          return (
            <div
              key={loc.id}
              onClick={() => handleLocationSelect(loc.id)}
              className={`p-4 rounded-xl border cursor-pointer transition relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'bg-amber-50/60 border-amber-500 shadow-sm ring-1 ring-amber-500'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <MapPin className="w-4 h-4 text-amber-600" />
                    <span>{loc.name}</span>
                  </div>
                  {isSelected && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                      <CheckCircle2 className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                  {loc.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] block">Altitude</span>
                  <span className="text-slate-900 font-bold">{loc.altitudeMeters}m MSL</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] block">Winter Design T</span>
                  <span className="text-rose-700 font-bold">{loc.designWinterTempC}°C</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Location Climatology Analysis */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-6 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>{activeLoc.name}</span>
              <span className="text-xs font-normal text-slate-500">
                ({selectedSeason.toUpperCase()} 24h Meteorological Waveform)
              </span>
            </h3>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono font-bold">
            <span className="text-amber-800">Lat: {activeLoc.latitude}°N</span>
            <span className="text-amber-800">Long: {activeLoc.longitude}°E</span>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Diurnal Ambient Temperature */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Thermometer className="w-4 h-4 text-amber-600" />
                Hourly Ambient & Ground Temperature
              </span>
              <span className="text-slate-500 font-mono text-[11px]">Units: °Celsius</span>
            </div>

            <div className="h-64 bg-slate-50 rounded-lg p-2 border border-slate-200">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={hourlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="hour" stroke="#64748b" tickFormatter={(h) => `${h}:00`} textAnchor="end" />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(val: number) => [`${val}°C`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Line type="monotone" dataKey="ambientTempC" name="Ambient Air Temp" stroke="#d97706" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="groundTempC" name="Deep Ground Temp" stroke="#059669" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Direct Normal & Global Solar Irradiance */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
              <span className="flex items-center gap-1.5">
                <Sun className="w-4 h-4 text-amber-600" />
                Solar Irradiance Flux (DNI vs GHI vs DHI)
              </span>
              <span className="text-slate-500 font-mono text-[11px]">Units: W/m²</span>
            </div>

            <div className="h-64 bg-slate-50 rounded-lg p-2 border border-slate-200">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="hour" stroke="#64748b" tickFormatter={(h) => `${h}:00`} />
                  <YAxis stroke="#64748b" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(val: number) => [`${val} W/m²`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="directNormalRadiationWm2" name="Direct Normal (DNI)" stroke="#d97706" fill="#d97706" fillOpacity={0.25} />
                  <Area type="monotone" dataKey="globalHorizontalRadiationWm2" name="Global Horiz (GHI)" stroke="#059669" fill="#059669" fillOpacity={0.15} />
                  <Area type="monotone" dataKey="diffuseHorizontalRadiationWm2" name="Diffuse Sky (DHI)" stroke="#64748b" fill="#64748b" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Operational Strategic Notes for DRDO */}
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
            <Shield className="w-4 h-4 text-amber-700" />
            <span>DRDO Defence Shelter Thermal Strategic Assessment</span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {activeLoc.drdoRelevanceNotes}
          </p>
        </div>
      </div>
    </div>
  );
};

