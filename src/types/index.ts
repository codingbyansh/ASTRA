// DRDO Defence Passive Habitat Thermal Comfort Platform
// Canonical Data Types and Interfaces

export type ShelterShape = 'rectangular' | 'gable' | 'flat' | 'pitched';

export type GlazingType = 'single_clear' | 'double_clear' | 'double_low_e' | 'triple_low_e' | 'polycarbonate';

export type Season = 'winter' | 'summer' | 'monsoon' | 'annual';

export type ClimateZone = 'cold_arid' | 'extreme_cold' | 'composite' | 'hot_arid' | 'warm_humid' | 'cold_cloudy';

export interface Material {
  id: string;
  name: string;
  category: 'masonry' | 'concrete' | 'timber' | 'earth' | 'insulation' | 'roofing' | 'glazing' | 'composite';
  density: number; // kg/m3
  specificHeat: number; // J/(kg*K)
  thermalConductivity: number; // W/(m*K)
  standardThicknessMm: number; // mm
  emissivity: number; // 0 to 1
  solarAbsorptance: number; // 0 to 1
  embodiedCarbonKgCO2ePerKg: number;
  costIndexINRPerM3: number;
  sourceReference: string;
  description: string;
  hexColor: string;
}

export interface LayeredAssembly {
  layers: {
    materialId: string;
    thicknessMm: number;
  }[];
  totalThicknessMm: number;
  uValue: number; // W/(m2*K)
  rValue: number; // (m2*K)/W
  thermalCapacitancePerM2: number; // J/(m2*K)
  thermalMassHours: number; // Time lag in hours
}

export interface ClimateLocation {
  id: string;
  name: string;
  shortName: string;
  region: string;
  state: string;
  country: string;
  latitude: number; // deg North
  longitude: number; // deg East
  altitudeMeters: number;
  climateZone: ClimateZone;
  designWinterTempC: number;
  designSummerTempC: number;
  annualMeanTempC: number;
  annualSolarRadiationKwhM2: number;
  drdoRelevanceNotes: string;
  description: string;
  // Area-Specific Thermal Response & 3D Environment Properties
  zoneTitle: string;
  overviewHeadline: string;
  overviewDescription: string;
  recommendedShelterTitle: string;
  primaryThermalChallenge: string;
  keyPassiveStrategy: string;
  terrainType: 'alpine_gravel' | 'snow_ice' | 'composite_earth' | 'thar_sand' | 'subtropical_green' | 'mountain_rock';
  terrainColor: string;
  terrainGridColor: string;
  skyColor: string;
  recommendedWallMaterialId: string;
  recommendedWallThicknessMm: number;
  recommendedOverhangM: number;
  recommendedNightPurgeAch: number;
  recommendedSolarAbsorptance: number;
}

export interface HourlyClimateData {
  hour: number; // 0 to 23 (or cumulative)
  month: number; // 1 to 12
  day: number;
  ambientTempC: number;
  directNormalRadiationWm2: number;
  diffuseHorizontalRadiationWm2: number;
  globalHorizontalRadiationWm2: number;
  relativeHumidityPercent: number;
  windSpeedMs: number;
  windDirectionDeg: number;
  groundTempC: number;
}

export interface ShelterGeometry {
  lengthM: number;
  widthM: number;
  heightM: number;
  shape: ShelterShape;
  roofPitchDeg: number;
  overhangLengthM: number;
  orientationDeg: number; // 0 = South-facing ridge / entrance, 90 = West, 180 = North, 270 = East
}

export interface ShelterEnvelope {
  wallMaterialId: string;
  wallThicknessMm: number;
  roofMaterialId: string;
  roofThicknessMm: number;
  floorMaterialId: string;
  floorThicknessMm: number;
  insulationMaterialId: string;
  insulationThicknessMm: number;
  roofInsulationThicknessMm: number;
  wallSolarAbsorptance: number; // 0 to 1
  roofSolarAbsorptance: number; // 0 to 1
  interiorSurfaceEmissivity: number;
}

export interface ShelterOpenings {
  windowAreaSouthM2: number;
  windowAreaNorthM2: number;
  windowAreaEastM2: number;
  windowAreaWestM2: number;
  totalWindowAreaM2: number;
  glazingType: GlazingType;
  shgc: number; // Solar Heat Gain Coefficient (0 to 1)
  windowUValue: number; // W/(m2*K)
  doorAreaM2: number;
  doorUValue: number;
  shadingOverhangRatio: number; // ratio of overhang depth to window height
  nightShutterInstalled: boolean;
  nightShutterRValue: number; // (m2*K)/W
  ventilationRateAchDay: number; // Air changes per hour during day
  ventilationRateAchNight: number; // Air changes per hour during night
}

export interface ShelterOccupants {
  count: number;
  activityMet: number; // 1.0 = resting, 1.2 = light work, 2.0 = moderate exercise
  heatPerPersonWatts: number; // ~90W to 140W sensible
  applianceWatts: number;
  schedule: 'continuous' | 'night_only' | 'day_only';
}

export interface SimulationSettings {
  durationHours: number; // e.g. 24, 48, 72, 168 (1 week)
  timeStepMinutes: number; // e.g. 10, 15, 30, 60
  season: Season;
  initialIndoorTempC: number;
  groundTempCouplingC: number;
  solverType: 'explicit_euler' | 'crank_nicolson' | 'runge_kutta_4';
}

export interface ShelterDesign {
  id: string;
  name: string;
  locationId: string;
  geometry: ShelterGeometry;
  envelope: ShelterEnvelope;
  openings: ShelterOpenings;
  occupants: ShelterOccupants;
  simulationSettings: SimulationSettings;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  tags?: string[];
}

export interface HourlySimulationPoint {
  timeIndex: number;
  hour: number;
  day: number;
  timestampLabel: string;
  outdoorTempC: number;
  indoorTempC: number;
  solAirTempWallSouthC: number;
  solAirTempRoofC: number;
  solarRadiationWm2: number;
  sunAltitudeDeg: number;
  sunAzimuthDeg: number;
  
  // Heat Flows in Watts (W)
  qConductionWallsW: number;
  qConductionRoofW: number;
  qConductionFloorW: number;
  qConductionWindowsW: number;
  qSolarGlazingGainW: number;
  qVentilationLossGainW: number;
  qInternalGainW: number;
  qNetHeatRateW: number;

  // Comfort Status
  isComfortable: boolean;
  comfortStatus: 'cold_discomfort' | 'comfortable' | 'warm_discomfort' | 'extreme_cold';
  comfortBandLowerC: number;
  comfortBandUpperC: number;
  adaptiveNeutralTempC: number;
}

export interface SimulationSummary {
  minIndoorTempC: number;
  maxIndoorTempC: number;
  avgIndoorTempC: number;
  minOutdoorTempC: number;
  maxOutdoorTempC: number;
  avgOutdoorTempC: number;
  diurnalIndoorSwingC: number;
  diurnalOutdoorSwingC: number;
  dampingFactor: number; // Ratio of indoor swing to outdoor swing (0 to 1, lower = higher thermal stability)
  thermalLagHours: number;
  
  totalSolarGainKwh: number;
  totalConductionLossKwh: number;
  totalVentilationLossKwh: number;
  totalInternalGainKwh: number;
  
  comfortHoursCount: number;
  totalSimulationHours: number;
  comfortPercentage: number;
  underheatingDegreeHours: number;
  overheatingDegreeHours: number;
  
  effectiveEnvelopeUValue: number; // Area-weighted average U-value W/(m2*K)
  totalEnvelopeAreaM2: number;
  totalEnclosedVolumeM3: number;
  totalThermalMassCapacityKjK: number;
  
  passiveSurvivabilityIndex: 'safe' | 'caution' | 'dangerous';
  drdoColdSurvivalScore: number; // 0 to 100 score for Leh/High altitude conditions
  areaThermalHabitabilityScore?: number; // 0 to 100 score adapted for any climate zone (hot, cold, composite, humid)
  heatingDemandKwh?: number;
  coolingDemandKwh?: number;
  solAirPeakRoofTempC?: number;
  nightFlushEffectivenessPercent?: number;
}

export interface SimulationResult {
  designId: string;
  designName: string;
  location: ClimateLocation;
  summary: SimulationSummary;
  timeseries: HourlySimulationPoint[];
  calculatedAt: string;
  assumptionsNotes: string[];
}

export interface OptimizationGoal {
  objective: 'maximize_comfort' | 'minimize_heat_loss' | 'maximize_solar_gain' | 'balanced_drdo_cold_climate';
  targetComfortMinC: number;
  targetComfortMaxC: number;
  maxCostMultiplier?: number;
  minUsableFloorAreaM2: number;
  variableWeights: {
    comfortWeight: number;
    heatLossWeight: number;
    solarGainWeight: number;
    costWeight: number;
    carbonWeight: number;
  };
}

export interface CandidateDesign {
  id: string;
  rank: number;
  name: string;
  design: ShelterDesign;
  result: SimulationResult;
  score: number; // 0 to 100
  keyDifferentiators: string[];
  improvementsOverBaseline: {
    comfortDeltaPercent: number;
    minTempDeltaC: number;
    heatLossReductionPercent: number;
    solarGainIncreasePercent: number;
    costDeltaPercent: number;
  };
}

export interface OptimizationResult {
  baselineDesignId: string;
  goal: OptimizationGoal;
  recommendedDesign: CandidateDesign;
  candidates: CandidateDesign[];
  searchSpaceEvaluatedCount: number;
  convergenceReason: string;
  engineeringJustifications: string[];
  recommendedActions: string[];
}

export interface ValidationTestCase {
  id: string;
  code: string;
  title: string;
  standardReference: string; // e.g. "ASHRAE Standard 140 / BESTEST", "Fourier 1D Conduction Analytical"
  description: string;
  conditions: string;
  metricName: string;
  unit: string;
  referenceExpectedValue: number;
  modelSimulatedValue: number;
  absoluteDelta: number;
  percentageError: number;
  allowableErrorTolerancePercent: number;
  status: 'PASSED' | 'FAILED';
  scientificNotes: string;
  easyToSayTakeaway?: string;
}

export type AppView = 
  | 'overview'
  | 'designer'
  | 'climate'
  | 'materials'
  | 'simulation'
  | 'compare'
  | 'optimize'
  | 'validation'
  | 'reports';
