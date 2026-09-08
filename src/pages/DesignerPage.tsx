// DRDO Defence Habitat: 3D CAD Parametric Shelter Designer Studio (3-Pane Layout)
import React, { useState } from 'react';
import { useDesign } from '../store/designStore';
import { Shelter3DViewer } from '../components/ThreeCanvas/Shelter3DViewer';
import { MATERIALS_DATABASE, GLAZING_DATABASE, calculateAssemblyThermalProperties } from '../data/materials';
import { calculateGeometricBreakdown } from '../engine/thermalEngine';
import { getLocationById } from '../data/climate';
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
  CheckCircle2,
  ShieldCheck,
  Move,
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

  const [activeTabLeft, setActiveTabLeft] = useState<'dimensions' | 'roof' | 'orientation' | 'occupants' | 'position'>('dimensions');
  const [activeTabRight, setActiveTabRight] = useState<'materials' | 'insulation' | 'glazing'>('materials');

  const location = getLocationById(currentDesign.locationId);
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

  // Occupant Bounding & Position Math for Safe Layout
  const roomL = currentDesign.geometry.lengthM;
  const roomW = currentDesign.geometry.widthM;
  const wallThick = 0.25;
  const wallMargin = wallThick + 0.35;
  const safeHalfL = Math.max(0.4, roomL / 2 - wallMargin);
  const safeHalfW = Math.max(0.4, roomW / 2 - wallMargin);
  const occCount = Math.min(16, Math.max(1, currentDesign.occupants.count));
  const occZone = currentDesign.occupants.positionZone || 'north_bunks';
  const userOffsetX = currentDesign.occupants.customOffsetX || 0;
  const userOffsetZ = currentDesign.occupants.customOffsetZ || 0;

  // Calculate 2D coordinates for schematic preview
  const previewOccupants: { x: number; z: number; id: number }[] = [];
  for (let i = 0; i < occCount; i++) {
    let posX = 0;
    let posZ = 0;
    if (occZone === 'north_bunks') {
      const zTarget = -safeHalfW + 0.12;
      const cols = Math.ceil(occCount / 2);
      const isRow2 = i >= cols;
      const colIndex = isRow2 ? i - cols : i;
      const xSpan = safeHalfL * 0.85;
      const stepX = cols > 1 ? (2 * xSpan) / (cols - 1) : 0;
      posX = -xSpan + colIndex * stepX;
      posZ = isRow2 ? zTarget + 0.55 : zTarget;
    } else if (occZone === 'center') {
      const angle = (i / occCount) * 2 * Math.PI;
      const radiusX = Math.min(safeHalfL * 0.65, 0.9);
      const radiusZ = Math.min(safeHalfW * 0.65, 0.7);
      posX = Math.cos(angle) * radiusX;
      posZ = Math.sin(angle) * radiusZ;
    } else if (occZone === 'perimeter') {
      const isEast = i % 2 === 0;
      const flankIndex = Math.floor(i / 2);
      const totalFlank = Math.ceil(occCount / 2);
      const zSpan = safeHalfW * 0.8;
      const stepZ = totalFlank > 1 ? (2 * zSpan) / (totalFlank - 1) : 0;
      posX = isEast ? safeHalfL - 0.15 : -safeHalfL + 0.15;
      posZ = -zSpan + flankIndex * stepZ;
    } else {
      const cols = Math.min(occCount, 4);
      const rows = Math.ceil(occCount / cols);
      const r = Math.floor(i / cols);
      const c = i % cols;
      const stepX = cols > 1 ? (2 * safeHalfL) / (cols - 1) : 0;
      const stepZ = rows > 1 ? (2 * safeHalfW) / (rows - 1) : 0;
      posX = -safeHalfL + c * stepX;
      posZ = -safeHalfW + r * stepZ;
    }

    let finalX = posX + userOffsetX;
    let finalZ = posZ + userOffsetZ;
    finalX = Math.max(-safeHalfL, Math.min(safeHalfL, finalX));
    finalZ = Math.max(-safeHalfW, Math.min(safeHalfW, finalZ));
    if (Math.abs(finalX) < 0.26 && Math.abs(finalZ) < roomW * 0.22) {
      finalX = finalX >= 0 ? 0.38 : -0.38;
      finalX = Math.max(-safeHalfL, Math.min(safeHalfL, finalX));
    }
    previewOccupants.push({ x: finalX, z: finalZ, id: i });
  }

  return (
    <div className="space-y-4">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 p-4 rounded-xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-slate-900">
              ASTRA 3D CAD Studio · {location?.shortName} Sector
            </h2>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
              {currentDesign.name}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Parametric envelope CAD engineered for {location?.name} ({location?.zoneTitle}, {location?.altitudeMeters}m MSL).
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
                { id: 'position', label: 'Position' },
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
                    {location?.climateZone === 'cold_arid' || location?.climateZone === 'extreme_cold' || location?.climateZone === 'cold_cloudy'
                      ? `Recommended 1.3:1 to 1.7:1 elongated along East-West axis for maximum winter solar heat gain in ${location.shortName}.`
                      : location?.climateZone === 'hot_arid'
                      ? `Recommended compact geometry (1.1:1 to 1.3:1) to minimize external solar envelope exposure in ${location.shortName}.`
                      : `Recommended orientation & ratio optimized for thermal buffering and cross-ventilation in ${location?.shortName}.`}
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
                    Calculated for {location?.shortName} solar latitude ~{location?.latitude}°N (Optimal winter pitch: ~{Math.min(45, Math.max(15, Math.round((location?.latitude || 34) - 2)))}°).
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

                {/* Link to Position Tab */}
                <button
                  onClick={() => setActiveTabLeft('position')}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-semibold text-xs transition"
                >
                  <div className="flex items-center gap-2">
                    <Move className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Configure 3D Spatial Layout & Bounds</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
                </button>
              </div>
            )}

            {/* Tab 5: Position & Spatial Bounding */}
            {activeTabLeft === 'position' && (
              <div className="space-y-3.5 text-xs">
                {/* 100% In-Bounds Guard Status Badge */}
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div className="leading-tight">
                    <span className="font-bold text-xs block text-emerald-900">
                      100% Inside Envelope Bounds
                    </span>
                    <span className="text-[11px] text-emerald-800">
                      Zero out-of-bounds collision. Wall safety clearance buffer of ≥350mm strictly enforced.
                    </span>
                  </div>
                </div>

                {/* Layout Zone Selector */}
                <div className="space-y-1.5">
                  <label className="text-slate-700 font-semibold block">Arrangement Layout:</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {[
                      { id: 'north_bunks', label: 'North Berths (Recommended)', desc: 'Leaves south solar zone open' },
                      { id: 'center', label: 'Center Station', desc: 'Clustered in living core' },
                      { id: 'perimeter', label: 'Flank Berths', desc: 'East & West side walls' },
                      { id: 'uniform', label: 'Uniform Grid', desc: 'Mathematically spaced' },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => updateOccupants({ positionZone: mode.id as any })}
                        className={`p-2 rounded-lg border text-left transition ${
                          occZone === mode.id
                            ? 'bg-amber-50 border-amber-400 text-amber-950 font-bold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-[11px] font-bold">{mode.label}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{mode.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spatial Fine-Tuning Sliders */}
                <div className="space-y-2.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-[11px]">Position Fine-Tuning:</span>
                    <button
                      onClick={() => updateOccupants({ customOffsetX: 0, customOffsetZ: 0 })}
                      className="text-[10px] text-amber-800 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Reset to Center</span>
                    </button>
                  </div>

                  {/* East-West (X) Offset */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600">East-West Shift (X):</span>
                      <span className="font-mono font-bold text-slate-900">
                        {userOffsetX > 0 ? `+${userOffsetX.toFixed(2)}m` : `${userOffsetX.toFixed(2)}m`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={(-safeHalfL * 0.8).toFixed(2)}
                      max={(safeHalfL * 0.8).toFixed(2)}
                      step="0.1"
                      value={userOffsetX}
                      onChange={(e) => updateOccupants({ customOffsetX: Number(e.target.value) })}
                      className="w-full h-1.5 bg-slate-200 rounded-lg accent-amber-600"
                    />
                    <div className="flex justify-between text-[9px] text-slate-600">
                      <span>West (-{(safeHalfL * 0.8).toFixed(1)}m)</span>
                      <span>Center</span>
                      <span>East (+{(safeHalfL * 0.8).toFixed(1)}m)</span>
                    </div>
                  </div>

                  {/* North-South (Z) Offset */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600">North-South Shift (Z):</span>
                      <span className="font-mono font-bold text-slate-900">
                        {userOffsetZ > 0 ? `+${userOffsetZ.toFixed(2)}m` : `${userOffsetZ.toFixed(2)}m`}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={(-safeHalfW * 0.8).toFixed(2)}
                      max={(safeHalfW * 0.8).toFixed(2)}
                      step="0.1"
                      value={userOffsetZ}
                      onChange={(e) => updateOccupants({ customOffsetZ: Number(e.target.value) })}
                      className="w-full h-1.5 bg-slate-200 rounded-lg accent-amber-600"
                    />
                    <div className="flex justify-between text-[9px] text-slate-600">
                      <span>North (-{(safeHalfW * 0.8).toFixed(1)}m)</span>
                      <span>Center</span>
                      <span>South (+{(safeHalfW * 0.8).toFixed(1)}m)</span>
                    </div>
                  </div>
                </div>

                {/* 2D Floor Plan Schematic Preview */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-800">2D Shelter Floor Footprint:</span>
                    <span className="text-slate-500 font-mono text-[10px]">
                      {roomL}m × {roomW}m
                    </span>
                  </div>

                  <div className="bg-slate-950 rounded-lg p-2 border border-slate-800 flex flex-col items-center justify-center">
                    {(() => {
                      const svgW = 230;
                      const svgH = 130;
                      const scale = Math.min(180 / roomL, 90 / roomW);
                      const cx = svgW / 2;
                      const cy = svgH / 2;
                      const outerW = roomL * scale;
                      const outerH = roomW * scale;
                      const innerW = 2 * safeHalfL * scale;
                      const innerH = 2 * safeHalfW * scale;

                      return (
                        <svg width={svgW} height={svgH} className="overflow-visible">
                          {/* Compass North Indicator */}
                          <text x={cx} y={cy - outerH / 2 - 6} fill="#38bdf8" fontSize="9" fontWeight="bold" textAnchor="middle">
                            ▲ NORTH (Cold Facade)
                          </text>

                          {/* Outer Wall Boundary */}
                          <rect
                            x={cx - outerW / 2}
                            y={cy - outerH / 2}
                            width={outerW}
                            height={outerH}
                            fill="#1e293b"
                            stroke="#64748b"
                            strokeWidth="2.5"
                            rx="3"
                          />

                          {/* Inner Safe Usable Bounds (Dashed Green) */}
                          <rect
                            x={cx - innerW / 2}
                            y={cy - innerH / 2}
                            width={innerW}
                            height={innerH}
                            fill="#0f172a"
                            stroke="#10b981"
                            strokeWidth="1"
                            strokeDasharray="3 3"
                            rx="2"
                          />

                          {/* South Solar Glazing Opening Indicator */}
                          <rect
                            x={cx - outerW * 0.3}
                            y={cy + outerH / 2 - 2}
                            width={outerW * 0.6}
                            height={4}
                            fill="#fbbf24"
                            rx="1"
                          />

                          {/* Central Thermal Partition Mass Wall */}
                          <rect
                            x={cx - 2}
                            y={cy - outerH * 0.22}
                            width={4}
                            height={outerH * 0.44}
                            fill="#b45309"
                            rx="1"
                          />

                          {/* Occupant Avatars */}
                          {previewOccupants.map((pt) => {
                            const px = cx + pt.x * scale;
                            const py = cy + pt.z * scale;
                            return (
                              <g key={pt.id}>
                                <circle cx={px} cy={py} r={5} fill="#10b981" stroke="#ffffff" strokeWidth="1.2" />
                                <text
                                  x={px}
                                  y={py + 2.5}
                                  fill="#ffffff"
                                  fontSize="6.5"
                                  fontWeight="bold"
                                  textAnchor="middle"
                                >
                                  {pt.id + 1}
                                </text>
                              </g>
                            );
                          })}

                          {/* South Label */}
                          <text x={cx} y={cy + outerH / 2 + 12} fill="#fbbf24" fontSize="9" fontWeight="bold" textAnchor="middle">
                            ▼ SOUTH (Solar Glazing Face)
                          </text>
                        </svg>
                      );
                    })()}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      Occupants ({occCount})
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-1 bg-amber-400 inline-block rounded" />
                      Solar Windows
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-1 border border-emerald-400 border-dashed inline-block" />
                      Safe Bounds
                    </span>
                  </div>
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
