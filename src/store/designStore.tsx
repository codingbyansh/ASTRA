// DRDO Defence Habitat: Application Central State Store & Single Source of Truth
// Manages ShelterDesign, multiple comparison iterations, simulation cache & optimization workflow.

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ShelterDesign,
  SimulationResult,
  OptimizationResult,
  AppView,
  OptimizationGoal,
} from '../types';
import { runThermalSimulation } from '../engine/thermalEngine';
import { runDesignOptimization } from '../engine/optimizer';
import { CLIMATE_LOCATIONS, getLocationById } from '../data/climate';

// Default Canonical Demo Design (ASTRA Leh, Ladakh Standard High-Altitude Test Case)
export const DEFAULT_LEH_DEMO_DESIGN: ShelterDesign = {
  id: 'leh_baseline_shelter',
  name: 'ASTRA Alpine Field Shelter (Leh Baseline)',
  locationId: 'leh_ladakh',
  geometry: {
    lengthM: 6.0,
    widthM: 4.0,
    heightM: 3.0,
    shape: 'gable',
    roofPitchDeg: 30,
    overhangLengthM: 0.6,
    orientationDeg: 0, // Facing True South
  },
  envelope: {
    wallMaterialId: 'rammed_earth_stabilized',
    wallThicknessMm: 300,
    roofMaterialId: 'puf_sandwich_roof_panel',
    roofThicknessMm: 80,
    floorMaterialId: 'insulated_concrete_slab_on_grade',
    floorThicknessMm: 225,
    insulationMaterialId: 'rockwool_mineral_slab',
    insulationThicknessMm: 75,
    roofInsulationThicknessMm: 100,
    wallSolarAbsorptance: 0.70,
    roofSolarAbsorptance: 0.75,
    interiorSurfaceEmissivity: 0.90,
  },
  openings: {
    windowAreaSouthM2: 4.5,
    windowAreaNorthM2: 0.5,
    windowAreaEastM2: 1.0,
    windowAreaWestM2: 1.0,
    totalWindowAreaM2: 7.0,
    glazingType: 'double_low_e',
    shgc: 0.60,
    windowUValue: 1.40,
    doorAreaM2: 1.8,
    doorUValue: 2.2,
    shadingOverhangRatio: 0.45,
    nightShutterInstalled: true,
    nightShutterRValue: 0.60,
    ventilationRateAchDay: 0.8,
    ventilationRateAchNight: 0.4,
  },
  occupants: {
    count: 8,
    activityMet: 1.2,
    heatPerPersonWatts: 110,
    applianceWatts: 150,
    schedule: 'continuous',
    positionZone: 'north_bunks',
    customOffsetX: 0,
    customOffsetZ: 0,
  },
  simulationSettings: {
    durationHours: 24,
    timeStepMinutes: 10,
    season: 'winter',
    initialIndoorTempC: 8.0,
    groundTempCouplingC: -4.0,
    solverType: 'explicit_euler',
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  notes: 'Canonical 8-soldier outpost shelter configuration designed for -18°C Leh winter conditions.',
  tags: ['Leh-Ladakh', '8-Personnel', 'Passive-Solar', 'Rammed-Earth'],
};

// Alternative Design 2: Uninsulated Lightweight Baseline (Reference of poor thermal performance)
export const UNINSULATED_BASELINE_DESIGN: ShelterDesign = {
  ...DEFAULT_LEH_DEMO_DESIGN,
  id: 'uninsulated_tin_shed',
  name: 'Uninsulated CGI Tin Shed (Sub-standard Control)',
  envelope: {
    ...DEFAULT_LEH_DEMO_DESIGN.envelope,
    wallMaterialId: 'fired_clay_brick',
    wallThicknessMm: 230,
    roofMaterialId: 'cgi_corrugated_metal_sheet',
    roofThicknessMm: 1,
    insulationMaterialId: 'rockwool_mineral_slab',
    insulationThicknessMm: 0, // No insulation
    roofInsulationThicknessMm: 0,
  },
  openings: {
    ...DEFAULT_LEH_DEMO_DESIGN.openings,
    glazingType: 'single_clear',
    windowUValue: 5.7,
    shgc: 0.82,
    nightShutterInstalled: false,
    ventilationRateAchDay: 2.5,
    ventilationRateAchNight: 1.8, // Draughty
  },
  tags: ['Uninsulated', 'Control-Reference'],
};

// Alternative Design 3: Heavy Indigenous Adobe + Local Wool
export const INDIGENOUS_HIGH_MASS_DESIGN: ShelterDesign = {
  ...DEFAULT_LEH_DEMO_DESIGN,
  id: 'indigenous_adobe_wool',
  name: 'Indigenous High-Mass Mud Brick + Ladakh Wool',
  envelope: {
    ...DEFAULT_LEH_DEMO_DESIGN.envelope,
    wallMaterialId: 'adobe_mud_brick',
    wallThicknessMm: 380,
    roofMaterialId: 'mud_straw_thatch_composite',
    roofThicknessMm: 250,
    insulationMaterialId: 'sheep_wool_natural_batt',
    insulationThicknessMm: 120,
    roofInsulationThicknessMm: 150,
  },
  openings: {
    ...DEFAULT_LEH_DEMO_DESIGN.openings,
    windowAreaSouthM2: 5.8,
    windowAreaNorthM2: 0.3,
    glazingType: 'double_low_e',
    windowUValue: 1.40,
    nightShutterInstalled: true,
  },
  tags: ['Eco-Indigenous', 'Zero-Carbon', 'Ladakh-Wool'],
};

// Area-Specific Canonical Baseline Design Presets for ASTRA
export const DRAS_DEMO_DESIGN: ShelterDesign = {
  ...DEFAULT_LEH_DEMO_DESIGN,
  id: 'astra_dras_extreme_winter',
  name: 'ASTRA Sub-Zero Forward Outpost (Dras Extreme Cold)',
  locationId: 'dras_kargil',
  geometry: {
    ...DEFAULT_LEH_DEMO_DESIGN.geometry,
    roofPitchDeg: 35,
    overhangLengthM: 0.5,
  },
  envelope: {
    ...DEFAULT_LEH_DEMO_DESIGN.envelope,
    wallMaterialId: 'puf_sandwich_roof_panel',
    wallThicknessMm: 120,
    roofMaterialId: 'puf_sandwich_roof_panel',
    roofThicknessMm: 120,
    insulationThicknessMm: 140,
    roofInsulationThicknessMm: 180,
    wallSolarAbsorptance: 0.80,
    roofSolarAbsorptance: 0.85,
  },
  openings: {
    ...DEFAULT_LEH_DEMO_DESIGN.openings,
    windowAreaSouthM2: 4.0,
    windowAreaNorthM2: 0.2,
    glazingType: 'triple_low_e',
    windowUValue: 1.10,
    nightShutterInstalled: true,
    nightShutterRValue: 0.85,
    ventilationRateAchDay: 0.5,
    ventilationRateAchNight: 0.3,
  },
  notes: 'ASTRA Sub-Zero Outpost: Ultra-insulated envelope calibrated for -28°C Dras-Kargil extremes with triple-pane Low-E glazing.',
  tags: ['Sub-Zero', 'Extreme-Cold', 'Dras-Kargil', 'Ultra-Insulated'],
};

export const JAISALMER_DEMO_DESIGN: ShelterDesign = {
  ...DEFAULT_LEH_DEMO_DESIGN,
  id: 'astra_jaisalmer_desert',
  name: 'ASTRA Desert Patrol Shelter (Jaisalmer Arid Zone)',
  locationId: 'jaisalmer_rajasthan',
  geometry: {
    ...DEFAULT_LEH_DEMO_DESIGN.geometry,
    shape: 'flat',
    roofPitchDeg: 0,
    overhangLengthM: 1.2,
  },
  envelope: {
    ...DEFAULT_LEH_DEMO_DESIGN.envelope,
    wallMaterialId: 'rammed_earth_stabilized',
    wallThicknessMm: 400,
    roofMaterialId: 'insulated_concrete_slab_on_grade',
    roofThicknessMm: 200,
    insulationThicknessMm: 50,
    roofInsulationThicknessMm: 75,
    wallSolarAbsorptance: 0.28,
    roofSolarAbsorptance: 0.25,
  },
  openings: {
    ...DEFAULT_LEH_DEMO_DESIGN.openings,
    windowAreaSouthM2: 1.8,
    windowAreaNorthM2: 0.8,
    windowAreaEastM2: 0.4,
    windowAreaWestM2: 0.2,
    totalWindowAreaM2: 3.2,
    glazingType: 'double_low_e',
    shadingOverhangRatio: 0.85,
    nightShutterInstalled: true,
    ventilationRateAchDay: 0.4,
    ventilationRateAchNight: 3.5,
  },
  simulationSettings: {
    ...DEFAULT_LEH_DEMO_DESIGN.simulationSettings,
    season: 'summer',
    initialIndoorTempC: 30.0,
    groundTempCouplingC: 28.0,
  },
  notes: 'ASTRA Desert Patrol Shelter: 400mm thermal mass, high night purge ventilation, and low solar absorptance for 46°C Thar heat.',
  tags: ['Hot-Arid', 'Thar-Desert', 'Thermal-Mass', 'Night-Purge'],
};

export const DELHI_DEMO_DESIGN: ShelterDesign = {
  ...DEFAULT_LEH_DEMO_DESIGN,
  id: 'astra_delhi_composite',
  name: 'ASTRA Dual-Season Tactical Habitat (Delhi Composite)',
  locationId: 'new_delhi',
  geometry: {
    ...DEFAULT_LEH_DEMO_DESIGN.geometry,
    shape: 'flat',
    roofPitchDeg: 5,
    overhangLengthM: 1.0,
  },
  envelope: {
    ...DEFAULT_LEH_DEMO_DESIGN.envelope,
    wallMaterialId: 'aac_autoclaved_block',
    wallThicknessMm: 200,
    roofMaterialId: 'insulated_concrete_slab_on_grade',
    roofThicknessMm: 150,
    insulationThicknessMm: 60,
    roofInsulationThicknessMm: 80,
    wallSolarAbsorptance: 0.35,
    roofSolarAbsorptance: 0.30,
  },
  openings: {
    ...DEFAULT_LEH_DEMO_DESIGN.openings,
    windowAreaSouthM2: 3.0,
    windowAreaNorthM2: 1.0,
    windowAreaEastM2: 0.8,
    windowAreaWestM2: 0.5,
    totalWindowAreaM2: 5.3,
    shadingOverhangRatio: 0.65,
    ventilationRateAchDay: 0.8,
    ventilationRateAchNight: 2.0,
  },
  notes: 'ASTRA Composite Barracks: Dual-season passive cooling and heating response for Delhi composite climate.',
  tags: ['Composite', 'National-Capital', 'Dual-Season', 'Cool-Roof'],
};

export const GUWAHATI_DEMO_DESIGN: ShelterDesign = {
  ...DEFAULT_LEH_DEMO_DESIGN,
  id: 'astra_guwahati_humid',
  name: 'ASTRA Humid-Sector Tactical Barracks (Guwahati Zone)',
  locationId: 'guwahati_assam',
  geometry: {
    ...DEFAULT_LEH_DEMO_DESIGN.geometry,
    shape: 'pitched',
    roofPitchDeg: 25,
    overhangLengthM: 1.4,
  },
  envelope: {
    ...DEFAULT_LEH_DEMO_DESIGN.envelope,
    wallMaterialId: 'aac_autoclaved_block',
    wallThicknessMm: 150,
    roofMaterialId: 'puf_sandwich_roof_panel',
    roofThicknessMm: 60,
    insulationThicknessMm: 40,
    roofInsulationThicknessMm: 60,
    wallSolarAbsorptance: 0.40,
    roofSolarAbsorptance: 0.35,
  },
  openings: {
    ...DEFAULT_LEH_DEMO_DESIGN.openings,
    windowAreaSouthM2: 3.5,
    windowAreaNorthM2: 2.5,
    windowAreaEastM2: 1.5,
    windowAreaWestM2: 1.2,
    totalWindowAreaM2: 8.7,
    glazingType: 'double_clear',
    shadingOverhangRatio: 0.75,
    nightShutterInstalled: false,
    ventilationRateAchDay: 3.0,
    ventilationRateAchNight: 2.5,
  },
  simulationSettings: {
    ...DEFAULT_LEH_DEMO_DESIGN.simulationSettings,
    season: 'monsoon',
  },
  notes: 'ASTRA Humid-Sector Barracks: Maximized cross-ventilation and deep solar/rain overhangs for North-East terrain.',
  tags: ['Warm-Humid', 'North-East', 'Cross-Ventilation', 'Deep-Eaves'],
};

export const SHIMLA_DEMO_DESIGN: ShelterDesign = {
  ...DEFAULT_LEH_DEMO_DESIGN,
  id: 'astra_shimla_mountain',
  name: 'ASTRA Highland Mountain Habitat (Shimla Cold Zone)',
  locationId: 'shimla_hp',
  geometry: {
    ...DEFAULT_LEH_DEMO_DESIGN.geometry,
    shape: 'gable',
    roofPitchDeg: 35,
    overhangLengthM: 0.7,
  },
  envelope: {
    ...DEFAULT_LEH_DEMO_DESIGN.envelope,
    wallMaterialId: 'fired_clay_brick',
    wallThicknessMm: 250,
    roofMaterialId: 'puf_sandwich_roof_panel',
    roofThicknessMm: 80,
    insulationThicknessMm: 100,
    roofInsulationThicknessMm: 120,
    wallSolarAbsorptance: 0.72,
    roofSolarAbsorptance: 0.75,
  },
  openings: {
    ...DEFAULT_LEH_DEMO_DESIGN.openings,
    windowAreaSouthM2: 4.2,
    windowAreaNorthM2: 0.4,
    windowAreaEastM2: 0.8,
    windowAreaWestM2: 0.8,
    totalWindowAreaM2: 6.2,
    glazingType: 'double_low_e',
    nightShutterInstalled: true,
    ventilationRateAchDay: 0.7,
    ventilationRateAchNight: 0.5,
  },
  notes: 'ASTRA Highland Mountain Habitat: Snow-shedding steep pitch and airtight envelope for Western Himalayan climate.',
  tags: ['Cold-Cloudy', 'Western-Himalayas', 'Snow-Shedding', 'Airtight-Envelope'],
};

export function getAreaAdaptedDesign(locationId: string): ShelterDesign {
  switch (locationId) {
    case 'dras_kargil':
      return { ...DRAS_DEMO_DESIGN };
    case 'jaisalmer_rajasthan':
      return { ...JAISALMER_DEMO_DESIGN };
    case 'new_delhi':
      return { ...DELHI_DEMO_DESIGN };
    case 'guwahati_assam':
      return { ...GUWAHATI_DEMO_DESIGN };
    case 'shimla_hp':
      return { ...SHIMLA_DEMO_DESIGN };
    case 'leh_ladakh':
    default:
      return { ...DEFAULT_LEH_DEMO_DESIGN };
  }
}

interface DesignContextType {
  currentDesign: ShelterDesign;
  setCurrentDesign: React.Dispatch<React.SetStateAction<ShelterDesign>>;
  savedDesigns: ShelterDesign[];
  saveDesign: (design: ShelterDesign) => void;
  deleteDesign: (id: string) => void;
  loadDesign: (id: string) => void;
  currentSimulationResult: SimulationResult | null;
  isSimulating: boolean;
  runSimulation: () => void;
  optimizationResult: OptimizationResult | null;
  isOptimizing: boolean;
  runOptimization: (goal?: Partial<OptimizationGoal>) => void;
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  selectedHour: number;
  setSelectedHour: (hour: number) => void;
  lang: 'EN' | 'HI';
  setLang: React.Dispatch<React.SetStateAction<'EN' | 'HI'>>;
  loadDemoDataset: (presetKey?: string) => void;
  setAreaLocation: (locationId: string, adaptDesignSpec?: boolean) => void;
  updateGeometry: (geometry: Partial<ShelterDesign['geometry']>) => void;
  updateEnvelope: (envelope: Partial<ShelterDesign['envelope']>) => void;
  updateOpenings: (openings: Partial<ShelterDesign['openings']>) => void;
  updateOccupants: (occupants: Partial<ShelterDesign['occupants']>) => void;
  updateSimulationSettings: (settings: Partial<ShelterDesign['simulationSettings']>) => void;
  applyHighComfortSpec: () => void;
}

const DesignContext = createContext<DesignContextType | undefined>(undefined);

export const DesignProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDesign, setCurrentDesign] = useState<ShelterDesign>(DEFAULT_LEH_DEMO_DESIGN);
  const [savedDesigns, setSavedDesigns] = useState<ShelterDesign[]>([
    DEFAULT_LEH_DEMO_DESIGN,
    UNINSULATED_BASELINE_DESIGN,
    INDIGENOUS_HIGH_MASS_DESIGN,
  ]);
  const [currentSimulationResult, setCurrentSimulationResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<AppView>('overview');
  const [selectedHour, setSelectedHour] = useState<number>(13);
  const [lang, setLang] = useState<'EN' | 'HI'>('EN');

  // Run initial simulation on load
  useEffect(() => {
    try {
      const res = runThermalSimulation(currentDesign);
      setCurrentSimulationResult(res);
    } catch (e) {
      console.error('Initial simulation error:', e);
    }
  }, []);

  const runSimulation = () => {
    setIsSimulating(true);
    // Real calculation with short tick for UI state transition
    setTimeout(() => {
      try {
        const res = runThermalSimulation(currentDesign);
        setCurrentSimulationResult(res);
      } catch (err) {
        console.error('Simulation execution failed:', err);
      } finally {
        setIsSimulating(false);
      }
    }, 250);
  };

  const runOptimization = (customGoal?: Partial<OptimizationGoal>) => {
    setIsOptimizing(true);
    const goal: OptimizationGoal = {
      objective: 'balanced_drdo_cold_climate',
      targetComfortMinC: 18.0,
      targetComfortMaxC: 24.0,
      minUsableFloorAreaM2: 20.0,
      variableWeights: {
        comfortWeight: 0.35,
        heatLossWeight: 0.30,
        solarGainWeight: 0.20,
        costWeight: 0.10,
        carbonWeight: 0.05,
      },
      ...customGoal,
    };

    setTimeout(() => {
      try {
        const optRes = runDesignOptimization(currentDesign, goal);
        setOptimizationResult(optRes);
      } catch (err) {
        console.error('Optimization error:', err);
      } finally {
        setIsOptimizing(false);
      }
    }, 450);
  };

  const saveDesign = (designToSave: ShelterDesign) => {
    setSavedDesigns((prev) => {
      const idx = prev.findIndex((d) => d.id === designToSave.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...designToSave, updatedAt: new Date().toISOString() };
        return updated;
      }
      return [...prev, { ...designToSave, updatedAt: new Date().toISOString() }];
    });
  };

  const deleteDesign = (id: string) => {
    setSavedDesigns((prev) => prev.filter((d) => d.id !== id));
  };

  const loadDesign = (id: string) => {
    const found = savedDesigns.find((d) => d.id === id);
    if (found) {
      setCurrentDesign(found);
      const res = runThermalSimulation(found);
      setCurrentSimulationResult(res);
    }
  };

  const setAreaLocation = (locationId: string, adaptDesignSpec: boolean = true) => {
    let newDesign: ShelterDesign;
    if (adaptDesignSpec) {
      newDesign = getAreaAdaptedDesign(locationId);
    } else {
      const loc = getLocationById(locationId);
      newDesign = {
        ...currentDesign,
        locationId,
        name: loc ? loc.recommendedShelterTitle : currentDesign.name,
        updatedAt: new Date().toISOString(),
      };
    }
    setCurrentDesign(newDesign);
    try {
      const res = runThermalSimulation(newDesign);
      setCurrentSimulationResult(res);
    } catch (e) {
      console.error('Simulation error after location switch:', e);
    }
  };

  const loadDemoDataset = (presetKey: string = 'leh') => {
    let targetLocId = 'leh_ladakh';
    if (presetKey === 'dras' || presetKey === 'dras_kargil') {
      targetLocId = 'dras_kargil';
    } else if (presetKey === 'delhi' || presetKey === 'new_delhi') {
      targetLocId = 'new_delhi';
    } else if (presetKey === 'jaisalmer' || presetKey === 'jaisalmer_rajasthan') {
      targetLocId = 'jaisalmer_rajasthan';
    } else if (presetKey === 'guwahati' || presetKey === 'guwahati_assam') {
      targetLocId = 'guwahati_assam';
    } else if (presetKey === 'shimla' || presetKey === 'shimla_hp') {
      targetLocId = 'shimla_hp';
    }

    const newDesign = getAreaAdaptedDesign(targetLocId);
    setCurrentDesign(newDesign);
    try {
      const res = runThermalSimulation(newDesign);
      setCurrentSimulationResult(res);
    } catch (e) {
      console.error('Simulation error on preset load:', e);
    }
  };

  const updateGeometry = (geom: Partial<ShelterDesign['geometry']>) => {
    setCurrentDesign((prev) => {
      const updated = { ...prev, geometry: { ...prev.geometry, ...geom }, updatedAt: new Date().toISOString() };
      // Auto update total window area when dimensions change
      return updated;
    });
  };

  const updateEnvelope = (env: Partial<ShelterDesign['envelope']>) => {
    setCurrentDesign((prev) => ({
      ...prev,
      envelope: { ...prev.envelope, ...env },
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateOpenings = (ops: Partial<ShelterDesign['openings']>) => {
    setCurrentDesign((prev) => {
      const newOps = { ...prev.openings, ...ops };
      newOps.totalWindowAreaM2 =
        newOps.windowAreaSouthM2 +
        newOps.windowAreaNorthM2 +
        newOps.windowAreaEastM2 +
        newOps.windowAreaWestM2;
      return {
        ...prev,
        openings: newOps,
        updatedAt: new Date().toISOString(),
      };
    });
  };

  const updateOccupants = (occ: Partial<ShelterDesign['occupants']>) => {
    setCurrentDesign((prev) => ({
      ...prev,
      occupants: { ...prev.occupants, ...occ },
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateSimulationSettings = (settings: Partial<ShelterDesign['simulationSettings']>) => {
    setCurrentDesign((prev) => ({
      ...prev,
      simulationSettings: { ...prev.simulationSettings, ...settings },
      updatedAt: new Date().toISOString(),
    }));
  };

  const applyHighComfortSpec = () => {
    setIsSimulating(true);
    setCurrentDesign((prev) => {
      const loc = getLocationById(prev.locationId) || CLIMATE_LOCATIONS[0];
      const isCold = loc.climateZone.includes('cold');
      const isHot = loc.climateZone.includes('hot');

      const optimized: ShelterDesign = {
        ...prev,
        geometry: {
          ...prev.geometry,
          orientationAzimuthDeg: 0, // True South for maximum solar gain
          roofOverhangDepthM: isHot ? 1.0 : 0.45,
        },
        envelope: {
          ...prev.envelope,
          insulationMaterialId: 'extruded_polystyrene_xps',
          insulationThicknessMm: isCold ? 120 : 75,
          roofInsulationThicknessMm: isCold ? 120 : 100,
          wallThicknessMm: isCold ? 380 : 300,
          wallSolarAbsorptance: isHot ? 0.35 : 0.75,
          roofSolarAbsorptance: isHot ? 0.25 : 0.75,
        },
        openings: {
          ...prev.openings,
          glazingType: isCold ? 'double_low_e' : 'double_tinted',
          windowAreaSouthM2: isCold ? Math.min(5.6, Math.max(3.8, prev.geometry.lengthM * 0.7)) : 1.5,
          windowAreaNorthM2: 0.5,
          windowAreaEastM2: isCold ? 0.8 : 0.4,
          windowAreaWestM2: 0.2,
          totalWindowAreaM2: (isCold ? Math.min(5.6, Math.max(3.8, prev.geometry.lengthM * 0.7)) : 1.5) + 0.5 + (isCold ? 0.8 : 0.4) + 0.2,
          nightShutterInstalled: true,
          nightShutterRValue: 0.65,
          ventilationRateAchNight: isCold ? 0.35 : 1.8,
          ventilationRateAchDay: isCold ? 0.6 : 0.8,
        },
        occupants: {
          ...prev.occupants,
          positionZone: 'north_bunks',
          customOffsetX: 0,
          customOffsetZ: 0,
        },
        updatedAt: new Date().toISOString(),
      };

      setTimeout(() => {
        try {
          const res = runThermalSimulation(optimized);
          setCurrentSimulationResult(res);
        } catch (e) {
          console.error('Auto comfort simulation error:', e);
        } finally {
          setIsSimulating(false);
        }
      }, 250);

      return optimized;
    });
  };

  return (
    <DesignContext.Provider
      value={{
        currentDesign,
        setCurrentDesign,
        savedDesigns,
        saveDesign,
        deleteDesign,
        loadDesign,
        currentSimulationResult,
        isSimulating,
        runSimulation,
        optimizationResult,
        isOptimizing,
        runOptimization,
        activeView,
        setActiveView,
        selectedHour,
        setSelectedHour,
        lang,
        setLang,
        loadDemoDataset,
        setAreaLocation,
        updateGeometry,
        updateEnvelope,
        updateOpenings,
        updateOccupants,
        updateSimulationSettings,
        applyHighComfortSpec,
      }}
    >
      {children}
    </DesignContext.Provider>
  );
};

export function useDesign(): DesignContextType {
  const ctx = useContext(DesignContext);
  if (!ctx) throw new Error('useDesign must be used within DesignProvider');
  return ctx;
}
