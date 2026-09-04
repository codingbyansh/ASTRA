// DRDO Defence Habitat: 3D CAD Parametric Shelter Designer Studio (3-Pane Layout)
import React, { useState } from 'react';
import { useDesign } from '../store/designStore';
import { Shelter3DViewer } from '../components/ThreeCanvas/Shelter3DViewer';
import { MATERIALS_DATABASE, GLAZING_DATABASE, calculateAssemblyThermalProperties } from '../data/materials';
import { calculateGeometricBreakdown } from '../engine/thermalEngine';
import { ShelterShape, GlazingType } from '../types';
import {
  Box,
  Compass,
  Layers,
  Sliders,
  Play,
  Check,
  RotateCcw,
  Users,
  Sun,
  Flame,
  ArrowRight,
  Info,
  Maximize2,
  Sparkles,
} from 'lucide-react';

export const DesignerPage: React.FC = () => {
  const {
    currentDesign,
    updateGeometry,
    updateEnvelope,
    updateOpenings,
    updateOccupants,
    runSimulation,
    isSimulating,
    setActiveView,
  } = useDesign();

  const [activeTabLeft, setActiveTabLeft] = useState<'dimensions' | 'roof' | 'orientation' | 'occupants'>('dimensions');
  const [activeTabRight, setActiveTabRight] = useState<'materials' | 'insulation' | 'glazing'>('materials');

  const geo = calculateGeometricBreakdown(currentDesign);

  // Live Wall & Roof U-Values
  const wallAssembly = calculateAssemblyThermalProperties(
    [
      { materialId: currentDesign.envelope.wallMaterialId, thicknessMm: currentDesign.envelope.wallThicknessMm },
      { materialId: currentDesign.envelope.insulationMaterialId, thicknessMm: currentDesign.envelope.insulationThicknessMm },
    ],
    true
  );

  const roofAssembly = calculateAssemblyThermalProperties(
    [
      { materialId: currentDesign.envelope.roofMaterialId, thicknessMm: currentDesign.envelope.roofThicknessMm },
      { materialId: currentDesign.envelope.insulationMaterialId, thicknessMm: currentDesign.envelope.roofInsulationThicknessMm },
    ],
    false
  );

  const handleShapeChange = (shape: ShelterShape) => {
    updateGeometry({ shape });
  };

  const handleGlazingChange = (glazingType: GlazingType) => {
    const glz = GLAZING_DATABASE[glazingType];
    updateOpenings({
      glazingType,
      windowUValue: glz.uValue,
      shgc: glz.shgc,
    });
  };

  return (
    <div className="space-y-4">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">Parametric Shelter CAD Studio</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Modify length, width, height, roof pitch, orientation & multi-layer envelope in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-4 text-xs font-mono bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <div>
              <span className="text-slate-500">Floor Area:</span>{' '}
              <span className="text-slate-900 font-bold">{geo.floorAreaM2} m²</span>
            </div>
            <div>
              <span className="text-slate-500">Volume:</span>{' '}
              <span className="text-slate-900 font-bold">{geo.enclosedVolumeM3} m³</span>
            </div>
            <div>
              <span className="text-slate-500">Wall U:</span>{' '}
              <span className="text-emerald-700 font-bold">{wallAssembly.uValue} W/m²K</span>
            </div>
          </div>

          <button
            onClick={() => {
              runSimulation();
              setActiveView('simulation');
            }}
            disabled={isSimulating}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-600 border border-emerald-600 text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            <Play className="w-4 h-4" />
            <span>Simulate Thermal Performance</span>
          </button>
        </div>
      </div>

      {/* 3-Pane Studio Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT DOCK: Geometry, Roof, Orientation & Occupancy (3 cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            {/* Sub-tabs for Left Dock */}
            <div className="flex items-center gap-1 border-b border-slate-200 pb-2">
              {[
                { id: 'dimensions', label: 'Dimensions' },
                { id: 'roof', label: 'Roof' },
                { id: 'orientation', label: 'Orientation' },
                { id: 'occupants', label: 'Occupancy' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabLeft(tab.id as any)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded transition ${
                    activeTabLeft === tab.id
                      ? 'bg-amber-100 text-amber-900 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Dimensions */}
            {activeTabLeft === 'dimensions' && (
              <div className="space-y-3 text-xs">
                {/* Length */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-slate-700 font-medium">Length (East-West axis):</label>
                    <span className="font-mono text-amber-800 font-bold">{currentDesign.geometry.lengthM} m</span>
                  </div>
                  <input
                    type="range"
                    min="3.0"
                    max="16.0"
                    step="0.5"
                    value={currentDesign.geometry.lengthM}
                    onChange={(e) => updateGeometry({ lengthM: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg accent-amber-600"
                  />
                </div>

                {/* Width */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-slate-700 font-medium">Width (North-South depth):</label>
                    <span className="font-mono text-amber-800 font-bold">{currentDesign.geometry.widthM} m</span>
                  </div>
                  <input
                    type="range"
                    min="2.5"
                    max="10.0"
                    step="0.5"
                    value={currentDesign.geometry.widthM}
                    onChange={(e) => updateGeometry({ widthM: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg accent-amber-600"
                  />
                </div>

                {/* Height */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-slate-700 font-medium">Clear Wall Height:</label>
                    <span className="font-mono text-amber-800 font-bold">{currentDesign.geometry.heightM} m</span>
                  </div>
                  <input
                    type="range"
                    min="2.2"
                    max="4.5"
                    step="0.1"
                    value={currentDesign.geometry.heightM}
                    onChange={(e) => updateGeometry({ heightM: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg accent-amber-600"
                  />
                </div>

                {/* Aspect Ratio note */}
                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-700 space-y-1">
                  <div className="flex justify-between font-semibold">
                    <span>Aspect Ratio (L/W):</span>
                    <span className="text-slate-900 font-mono">
                      {(currentDesign.geometry.lengthM / currentDesign.geometry.widthM).toFixed(2)}:1
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Recommended 1.3:1 to 1.7:1 elongated along East-West axis for maximum winter solar gain in Ladakh.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 2: Roof Shape & Pitch */}
            {activeTabLeft === 'roof' && (
              <div className="space-y-3 text-xs">
                <label className="text-slate-700 font-medium">Roof Form:</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'gable', label: 'Gable (Dual Pitch)' },
                    { id: 'pitched', label: 'Shed (Monopitch)' },
                    { id: 'flat', label: 'Flat (Terrace)' },
                    { id: 'rectangular', label: 'Quonset / Vault' },
                  ].map((shape) => (
                    <button
                      key={shape.id}
                      onClick={() => handleShapeChange(shape.id as ShelterShape)}
                      className={`p-2 rounded-lg text-xs font-semibold border text-center transition ${
                        currentDesign.geometry.shape === shape.id
                          ? 'bg-amber-100 border-amber-500 text-amber-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {shape.label}
                    </button>
                  ))}
                </div>

                {/* Roof Pitch */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex justify-between">
                    <label className="text-slate-700 font-medium">Roof Pitch Angle:</label>
                    <span className="font-mono text-amber-800 font-bold">{currentDesign.geometry.roofPitchDeg}°</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="45"
                    step="1"
                    value={currentDesign.geometry.roofPitchDeg}
                    onChange={(e) => updateGeometry({ roofPitchDeg: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg accent-amber-600"
                  />
                  <span className="text-[10px] text-slate-500">
                    Optimal for Leh winter solar altitude = 32° (Latitude ~34°N).
                  </span>
                </div>

                {/* Overhang */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between">
                    <label className="text-slate-700 font-medium">Eaves / Overhang Depth:</label>
                    <span className="font-mono text-amber-800 font-bold">{currentDesign.geometry.overhangLengthM} m</span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.2"
                    step="0.1"
                    value={currentDesign.geometry.overhangLengthM}
                    onChange={(e) => updateGeometry({ overhangLengthM: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg accent-amber-600"
                  />
                  <span className="text-[10px] text-slate-500">
                    Blocks high summer sun while allowing low winter sun deep into the interior.
                  </span>
                </div>
              </div>
            )}

            {/* Tab 3: Orientation */}
            {activeTabLeft === 'orientation' && (
              <div className="space-y-3 text-xs">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-slate-700 font-medium">Azimuth Offset from True South:</label>
                    <span className="font-mono text-amber-800 font-bold">{currentDesign.geometry.orientationDeg}°</span>
                  </div>
                  <input
                    type="range"
                    min="-45"
                    max="45"
                    step="5"
                    value={currentDesign.geometry.orientationDeg}
                    onChange={(e) => updateGeometry({ orientationDeg: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg accent-amber-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                    <span>-45° (SE)</span>
                    <span className="text-emerald-700 font-bold">0° (True South)</span>
                    <span>+45° (SW)</span>
                  </div>
                </div>

                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-[11px] text-amber-900 space-y-1.5">
                  <div className="font-bold text-amber-900 flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-700" />
                    <span>Solar Orientation Rule</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed">
                    True South orientation (0° Azimuth) captures up to +40% more solar radiation during freezing December-January days compared to East-West orientations.
                  </p>
                </div>
              </div>
            )}

            {/* Tab 4: Occupancy */}
            {activeTabLeft === 'occupants' && (
              <div className="space-y-3 text-xs">
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-slate-700 font-medium">Number of Occupants:</label>
                    <span className="font-mono text-amber-800 font-bold">{currentDesign.occupants.count} Personnel</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="24"
                    step="1"
                    value={currentDesign.occupants.count}
                    onChange={(e) => updateOccupants({ count: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg accent-amber-600"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-slate-700 font-medium">Sensible Heat / Person:</label>
                    <span className="font-mono text-amber-800 font-bold">{currentDesign.occupants.heatPerPersonWatts} W</span>
                  </div>
                  <input
                    type="range"
                    min="80"
                    max="180"
                    step="10"
                    value={currentDesign.occupants.heatPerPersonWatts}
                    onChange={(e) => updateOccupants({ heatPerPersonWatts: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg accent-amber-600"
                  />
                </div>

                <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                  Total Internal Body Heat Gain:{' '}
                  <span className="text-slate-900 font-bold font-mono">
                    {currentDesign.occupants.count * currentDesign.occupants.heatPerPersonWatts} Watts
                  </span>{' '}
                  (~{((currentDesign.occupants.count * currentDesign.occupants.heatPerPersonWatts * 24) / 1000).toFixed(1)} kWh/day).
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER VIEWPORT: Three.js 3D CAD Canvas (6 cols) */}
        <div className="lg:col-span-6 flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <Shelter3DViewer design={currentDesign} heightClass="h-[480px]" />
        </div>

        {/* RIGHT DOCK: Materials, Insulation, Openings & U-Value Calculator (3 cols) */}
        <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-4 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            {/* Sub-tabs for Right Dock */}
            <div className="flex items-center gap-1 border-b border-slate-200 pb-2">
              {[
                { id: 'materials', label: 'Envelope' },
                { id: 'insulation', label: 'Insulation' },
                { id: 'glazing', label: 'Glazing' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTabRight(tab.id as any)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded transition ${
                    activeTabRight === tab.id
                      ? 'bg-amber-100 text-amber-900 font-bold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1: Wall & Roof Base Materials */}
            {activeTabRight === 'materials' && (
              <div className="space-y-3 text-xs">
                {/* Wall Material Selector */}
                <div className="space-y-1">
                  <label className="text-slate-700 font-medium">Wall Mass Material:</label>
                  <select
                    value={currentDesign.envelope.wallMaterialId}
                    onChange={(e) => updateEnvelope({ wallMaterialId: e.target.value })}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500"
                  >
                    {MATERIALS_DATABASE.filter((m) => ['earth', 'masonry', 'concrete', 'timber'].includes(m.category)).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Wall Thickness */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-slate-700">Wall Mass Thickness:</label>
                    <span className="font-mono text-amber-800 font-bold">{currentDesign.envelope.wallThicknessMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="150"
                    max="500"
                    step="25"
                    value={currentDesign.envelope.wallThicknessMm}
                    onChange={(e) => updateEnvelope({ wallThicknessMm: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg accent-amber-600"
                  />
                </div>

                {/* Roof Material Selector */}
                <div className="space-y-1 pt-1">
                  <label className="text-slate-700 font-medium">Roof Material Structure:</label>
                  <select
                    value={currentDesign.envelope.roofMaterialId}
                    onChange={(e) => updateEnvelope({ roofMaterialId: e.target.value })}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500"
                  >
                    {MATERIALS_DATABASE.filter((m) => ['roofing', 'composite', 'earth', 'timber'].includes(m.category)).map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Tab 2: Insulation Thicknesses */}
            {activeTabRight === 'insulation' && (
              <div className="space-y-3 text-xs">
                {/* Insulation Material Selector */}
                <div className="space-y-1">
                  <label className="text-slate-700 font-medium">Insulation Type:</label>
                  <select
                    value={currentDesign.envelope.insulationMaterialId}
                    onChange={(e) => updateEnvelope({ insulationMaterialId: e.target.value })}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500"
                  >
                    {MATERIALS_DATABASE.filter((m) => m.category === 'insulation').map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (k={m.thermalConductivity} W/mK)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Wall Insulation Thickness */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-slate-700">Wall Insulation:</label>
                    <span className="font-mono text-amber-800 font-bold">{currentDesign.envelope.insulationThicknessMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200"
                    step="10"
                    value={currentDesign.envelope.insulationThicknessMm}
                    onChange={(e) => updateEnvelope({ insulationThicknessMm: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg accent-amber-600"
                  />
                </div>

                {/* Roof Insulation Thickness */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-slate-700">Roof Insulation:</label>
                    <span className="font-mono text-amber-800 font-bold">{currentDesign.envelope.roofInsulationThicknessMm} mm</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="250"
                    step="10"
                    value={currentDesign.envelope.roofInsulationThicknessMm}
                    onChange={(e) => updateEnvelope({ roofInsulationThicknessMm: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg accent-amber-600"
                  />
                </div>
              </div>
            )}

            {/* Tab 3: Glazing & Openings */}
            {activeTabRight === 'glazing' && (
              <div className="space-y-3 text-xs">
                {/* Glazing Type Selector */}
                <div className="space-y-1">
                  <label className="text-slate-700 font-medium">Window Glazing Type:</label>
                  <select
                    value={currentDesign.openings.glazingType}
                    onChange={(e) => handleGlazingChange(e.target.value as GlazingType)}
                    className="w-full bg-white border border-slate-300 text-slate-900 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-amber-500"
                  >
                    {Object.entries(GLAZING_DATABASE).map(([key, glz]) => (
                      <option key={key} value={key}>
                        {glz.name} (U={glz.uValue}, SHGC={glz.shgc})
                      </option>
                    ))}
                  </select>
                </div>

                {/* South Window Area */}
                <div className="space-y-1.5">
                  <div className="flex justify-between">
                    <label className="text-slate-700">South Window Solar Collector Area:</label>
                    <span className="font-mono text-amber-800 font-bold">{currentDesign.openings.windowAreaSouthM2} m²</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="10.0"
                    step="0.5"
                    value={currentDesign.openings.windowAreaSouthM2}
                    onChange={(e) => updateOpenings({ windowAreaSouthM2: Number(e.target.value) })}
                    className="w-full h-1.5 bg-slate-200 rounded-lg accent-amber-600"
                  />
                </div>

                {/* Night Thermal Shutter Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="nightShutter"
                    checked={currentDesign.openings.nightShutterInstalled}
                    onChange={(e) => updateOpenings({ nightShutterInstalled: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-600 bg-white border-slate-300"
                  />
                  <label htmlFor="nightShutter" className="text-slate-700 cursor-pointer">
                    Insulated Night Shutters (R=0.65 m²K/W)
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Calculated Thermophysical Property Card */}
          <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg space-y-2 text-xs">
            <div className="font-bold text-slate-900 border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <span>Calculated U-Values</span>
              <span className="text-[10px] text-emerald-700 font-mono font-bold">ISO 6946 / ASHRAE</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Wall U-Value:</span>
              <span className="font-mono font-bold text-slate-900">{wallAssembly.uValue} W/m²K</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Roof U-Value:</span>
              <span className="font-mono font-bold text-slate-900">{roofAssembly.uValue} W/m²K</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Wall Time Lag:</span>
              <span className="font-mono text-slate-800 font-semibold">{wallAssembly.timeLagHours} hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
