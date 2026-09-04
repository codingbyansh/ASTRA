// DRDO Defence Habitat: Materials Database & Multi-Layer Assembly Studio
import React, { useState } from 'react';
import { MATERIALS_DATABASE, GLAZING_DATABASE, calculateAssemblyThermalProperties } from '../data/materials';
import { Material } from '../types';
import {
  Layers,
  Search,
  Filter,
  Flame,
  Scale,
  DollarSign,
  BookOpen,
  Plus,
  Trash2,
  Sliders,
  CheckCircle,
} from 'lucide-react';

export const MaterialsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Multi-layer Assembly Studio State
  const [assemblyLayers, setAssemblyLayers] = useState<{ materialId: string; thicknessMm: number }[]>([
    { materialId: 'rammed_earth_stabilized', thicknessMm: 300 },
    { materialId: 'rockwool_mineral_slab', thicknessMm: 100 },
  ]);

  const filteredMaterials = MATERIALS_DATABASE.filter((m) => {
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const assemblyProps = calculateAssemblyThermalProperties(assemblyLayers, true);

  const addLayer = () => {
    setAssemblyLayers([...assemblyLayers, { materialId: 'aac_autoclaved_block', thicknessMm: 100 }]);
  };

  const removeLayer = (index: number) => {
    if (assemblyLayers.length <= 1) return;
    setAssemblyLayers(assemblyLayers.filter((_, i) => i !== index));
  };

  const updateLayer = (index: number, materialId: string, thicknessMm: number) => {
    const updated = [...assemblyLayers];
    updated[index] = { materialId, thicknessMm };
    setAssemblyLayers(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">ASTRA Materials & Multi-Layer Assembly Studio</h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            Thermophysical material properties verified by ASHRAE Fundamentals, IS 3792 & NBC India.
          </p>
        </div>

        {/* Search & Filter bar */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search materials..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-900 rounded-lg pl-9 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-amber-500 w-48 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Assembly Calculator Studio */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">Custom Multi-Layer Assembly U-Value Calculator</h3>
          </div>
          <button
            onClick={addLayer}
            className="flex items-center gap-1.5 px-3 py-1 bg-emerald-700 hover:bg-emerald-600 border border-emerald-600 text-white text-xs font-semibold rounded-lg transition shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Layer</span>
          </button>
        </div>

        {/* Interactive Layers List */}
        <div className="space-y-2.5">
          {assemblyLayers.map((layer, idx) => (
            <div
              key={idx}
              className="flex flex-wrap items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200"
            >
              <span className="text-xs font-mono text-amber-800 font-bold w-16">
                Layer {idx + 1}:
              </span>

              <select
                value={layer.materialId}
                onChange={(e) => updateLayer(idx, e.target.value, layer.thicknessMm)}
                className="bg-white border border-slate-300 text-slate-900 rounded-lg px-2.5 py-1.5 text-xs flex-1 min-w-[200px]"
              >
                {MATERIALS_DATABASE.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} (k={m.thermalConductivity} W/mK)
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="5"
                  max="600"
                  step="5"
                  value={layer.thicknessMm}
                  onChange={(e) => updateLayer(idx, layer.materialId, Number(e.target.value))}
                  className="bg-white border border-slate-300 text-slate-900 font-mono font-bold rounded-lg px-2 py-1.5 text-xs w-20 text-center"
                />
                <span className="text-xs text-slate-500 font-mono">mm</span>
              </div>

              <button
                onClick={() => removeLayer(idx)}
                disabled={assemblyLayers.length <= 1}
                className="p-1.5 text-slate-400 hover:text-red-600 disabled:opacity-30 transition"
                title="Remove Layer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Calculated Assembly Result KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Assembly U-Value</span>
            <span className="text-lg font-bold text-amber-700 font-mono">{assemblyProps.uValue}</span>
            <span className="text-[10px] text-slate-500 ml-1">W/(m²·K)</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total R-Value</span>
            <span className="text-lg font-bold text-emerald-700 font-mono">{assemblyProps.rValue}</span>
            <span className="text-[10px] text-slate-500 ml-1">(m²·K)/W</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Dynamic Time Lag</span>
            <span className="text-lg font-bold text-blue-900 font-mono">{assemblyProps.timeLagHours}</span>
            <span className="text-[10px] text-slate-500 ml-1">hours</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-semibold block">Heat Capacity</span>
            <span className="text-lg font-bold text-slate-900 font-mono">
              {(assemblyProps.capacitancePerM2 / 1000).toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-500 ml-1">kJ/(m²·K)</span>
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Materials' },
          { id: 'earth', label: 'Earth & Adobe' },
          { id: 'masonry', label: 'Masonry & Stone' },
          { id: 'concrete', label: 'Concrete & AAC' },
          { id: 'insulation', label: 'Insulation' },
          { id: 'roofing', label: 'Roofing' },
          { id: 'timber', label: 'Timber & Bamboo' },
          { id: 'composite', label: 'Composite' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition ${
              selectedCategory === cat.id
                ? 'bg-blue-900 text-white font-bold shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Materials Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map((mat) => (
          <div
            key={mat.id}
            className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm hover:border-slate-300 transition flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 shrink-0"
                    style={{ backgroundColor: mat.hexColor }}
                  />
                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{mat.name}</h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0 uppercase font-semibold">
                  {mat.category}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {mat.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-2 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-500 block">Thermal Conduct. (k)</span>
                  <span className="text-amber-800 font-bold">{mat.thermalConductivity} W/(m·K)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Density (ρ)</span>
                  <span className="text-slate-900 font-bold">{mat.density} kg/m³</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Specific Heat (c_p)</span>
                  <span className="text-slate-900 font-bold">{mat.specificHeat} J/(kg·K)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Embodied Carbon</span>
                  <span className="text-emerald-700 font-bold">{mat.embodiedCarbonKgCO2ePerKg} kgCO2e/kg</span>
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-200 text-[10px] text-slate-500 flex items-center gap-1">
                <BookOpen className="w-3 h-3 shrink-0 text-amber-700" />
                <span className="truncate">{mat.sourceReference}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
