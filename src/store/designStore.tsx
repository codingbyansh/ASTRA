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

// Default Canonical Demo Design (DRDO Leh, Ladakh Standard High-Altitude Test Case)
export const DEFAULT_LEH_DEMO_DESIGN: ShelterDesign = {
  id: 'drdo_leh_baseline',
  name: 'ASTRA High-Altitude Field Shelter (Leh Baseline)',
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
  notes: 'Canonical DRDO 8-soldier outpost shelter configuration designed for -18°C Leh winter conditions.',
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
  loadDemoDataset: (presetKey?: 'leh' | 'dras' | 'delhi' | 'jaisalmer') => void;
  updateGeometry: (geometry: Partial<ShelterDesign['geometry']>) => void;
  updateEnvelope: (envelope: Partial<ShelterDesign['envelope']>) => void;
  updateOpenings: (openings: Partial<ShelterDesign['openings']>) => void;
  updateOccupants: (occupants: Partial<ShelterDesign['occupants']>) => void;
  updateSimulationSettings: (settings: Partial<ShelterDesign['simulationSettings']>) => void;
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

  const loadDemoDataset = (presetKey: 'leh' | 'dras' | 'delhi' | 'jaisalmer' = 'leh') => {
    let newDesign: ShelterDesign;
    if (presetKey === 'leh') {
      newDesign = { ...DEFAULT_LEH_DEMO_DESIGN };
    } else if (presetKey === 'dras') {
      newDesign = {
        ...DEFAULT_LEH_DEMO_DESIGN,
        id: 'drdo_dras_extreme_winter',
        name: 'DRDO Dras Forward Outpost (-28°C Sub-Zero)',
        locationId: 'dras_kargil',
        envelope: {
          ...DEFAULT_LEH_DEMO_DESIGN.envelope,
          insulationThicknessMm: 120,
          roofInsulationThicknessMm: 160,
        },
      };
    } else if (presetKey === 'delhi') {
      newDesign = {
        ...DEFAULT_LEH_DEMO_DESIGN,
        id: 'delhi_composite_barracks',
        name: 'Delhi Composite Climate Barracks',
        locationId: 'new_delhi',
        geometry: {
          ...DEFAULT_LEH_DEMO_DESIGN.geometry,
          overhangLengthM: 1.0, // Deep shading against summer sun
        },
        envelope: {
          ...DEFAULT_LEH_DEMO_DESIGN.envelope,
          wallMaterialId: 'aac_autoclaved_block',
          wallSolarAbsorptance: 0.35, // Light reflective coating
          roofSolarAbsorptance: 0.30, // Cool roof
          insulationThicknessMm: 50,
        },
      };
    } else {
      newDesign = {
        ...DEFAULT_LEH_DEMO_DESIGN,
        id: 'jaisalmer_desert_patrol',
        name: 'Jaisalmer Thar Desert Heavy Mass Shelter',
        locationId: 'jaisalmer_rajasthan',
        envelope: {
          ...DEFAULT_LEH_DEMO_DESIGN.envelope,
          wallMaterialId: 'rammed_earth_stabilized',
          wallThicknessMm: 400,
          insulationThicknessMm: 50,
          wallSolarAbsorptance: 0.30,
        },
        openings: {
          ...DEFAULT_LEH_DEMO_DESIGN.openings,
          windowAreaSouthM2: 2.0,
          ventilationRateAchNight: 3.5, // High night purge cooling
        },
      };
    }
    setCurrentDesign(newDesign);
    const res = runThermalSimulation(newDesign);
    setCurrentSimulationResult(res);
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
        updateGeometry,
        updateEnvelope,
        updateOpenings,
        updateOccupants,
        updateSimulationSettings,
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
