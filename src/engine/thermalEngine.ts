// DRDO Defence Habitat: Core Transient Lumped-Capacitance Thermal Simulation Engine
// Rigorous First-Principles Heat Balance Solver for DRDO Area-Specific Shelters.

import {
  ShelterDesign,
  SimulationResult,
  HourlySimulationPoint,
  SimulationSummary,
  HourlyClimateData,
} from '../types';
import { getMaterialById, GLAZING_DATABASE, calculateAssemblyThermalProperties } from '../data/materials';
import { getLocationById, generateHourlyClimateData } from '../data/climate';
import { calculateShelterSolarDistribution, calculateSolAirTemperature } from './solar';

export interface GeometricBreakdown {
  floorAreaM2: number;
  roofAreaM2: number;
  wallAreaSouthM2: number;
  wallAreaNorthM2: number;
  wallAreaEastM2: number;
  wallAreaWestM2: number;
  grossWallAreaM2: number;
  netWallAreaM2: number;
  totalWindowAreaM2: number;
  enclosedVolumeM3: number;
}

/**
 * Computes exact envelope surface areas and volume from 3D parametric geometry
 */
export function calculateGeometricBreakdown(design: ShelterDesign): GeometricBreakdown {
  const { lengthM: L, widthM: W, heightM: H, shape, roofPitchDeg, overhangLengthM } = design.geometry;
  const floorAreaM2 = L * W;

  let roofAreaM2 = L * W;
  let gableTriangleAreaM2 = 0;
  let atticVolumeM3 = 0;

  const pitchRad = (roofPitchDeg * Math.PI) / 180;

  if (shape === 'gable') {
    const ridgeHeight = (W / 2) * Math.tan(pitchRad);
    const rafterLength = Math.sqrt(Math.pow(W / 2, 2) + Math.pow(ridgeHeight, 2)) + overhangLengthM;
    roofAreaM2 = 2 * (L + 2 * overhangLengthM) * rafterLength;
    gableTriangleAreaM2 = 2 * (0.5 * W * ridgeHeight);
    atticVolumeM3 = 0.5 * W * ridgeHeight * L;
  } else if (shape === 'pitched') {
    const rise = W * Math.tan(pitchRad);
    const rafterLength = Math.sqrt(Math.pow(W, 2) + Math.pow(rise, 2)) + overhangLengthM;
    roofAreaM2 = (L + 2 * overhangLengthM) * rafterLength;
    gableTriangleAreaM2 = 0.5 * W * rise * 2;
    atticVolumeM3 = 0.5 * W * rise * L;
  } else if (shape === 'flat') {
    roofAreaM2 = (L + 2 * overhangLengthM) * (W + 2 * overhangLengthM);
  }

  // Facade areas
  const wallAreaSouthM2 = L * H;
  const wallAreaNorthM2 = L * H;
  const wallAreaEastM2 = W * H + (shape === 'gable' || shape === 'pitched' ? gableTriangleAreaM2 / 2 : 0);
  const wallAreaWestM2 = W * H + (shape === 'gable' || shape === 'pitched' ? gableTriangleAreaM2 / 2 : 0);

  const grossWallAreaM2 = wallAreaSouthM2 + wallAreaNorthM2 + wallAreaEastM2 + wallAreaWestM2;
  const totalWindowAreaM2 =
    design.openings.windowAreaSouthM2 +
    design.openings.windowAreaNorthM2 +
    design.openings.windowAreaEastM2 +
    design.openings.windowAreaWestM2;
  
  const netWallAreaM2 = Math.max(1, grossWallAreaM2 - totalWindowAreaM2 - design.openings.doorAreaM2);
  const enclosedVolumeM3 = L * W * H + atticVolumeM3;

  return {
    floorAreaM2: Number(floorAreaM2.toFixed(2)),
    roofAreaM2: Number(roofAreaM2.toFixed(2)),
    wallAreaSouthM2: Number(wallAreaSouthM2.toFixed(2)),
    wallAreaNorthM2: Number(wallAreaNorthM2.toFixed(2)),
    wallAreaEastM2: Number(wallAreaEastM2.toFixed(2)),
    wallAreaWestM2: Number(wallAreaWestM2.toFixed(2)),
    grossWallAreaM2: Number(grossWallAreaM2.toFixed(2)),
    netWallAreaM2: Number(netWallAreaM2.toFixed(2)),
    totalWindowAreaM2: Number(totalWindowAreaM2.toFixed(2)),
    enclosedVolumeM3: Number(enclosedVolumeM3.toFixed(2)),
  };
}

/**
 * Runs transient thermal simulation using 1st principles heat balance ODE
 */
export function runThermalSimulation(design: ShelterDesign): SimulationResult {
  const location = getLocationById(design.locationId);
  const duration = design.simulationSettings.durationHours || 24;
  const hourlyWeather = generateHourlyClimateData(design.locationId, design.simulationSettings.season, duration);

  const geo = calculateGeometricBreakdown(design);

  // Material properties & assembly U-values
  const wallAssembly = calculateAssemblyThermalProperties(
    [
      { materialId: design.envelope.wallMaterialId, thicknessMm: design.envelope.wallThicknessMm },
      { materialId: design.envelope.insulationMaterialId, thicknessMm: design.envelope.insulationThicknessMm },
    ],
    true
  );

  const roofAssembly = calculateAssemblyThermalProperties(
    [
      { materialId: design.envelope.roofMaterialId, thicknessMm: design.envelope.roofThicknessMm },
      { materialId: design.envelope.insulationMaterialId, thicknessMm: design.envelope.roofInsulationThicknessMm },
    ],
    false
  );

  const floorAssembly = calculateAssemblyThermalProperties(
    [
      { materialId: design.envelope.floorMaterialId, thicknessMm: design.envelope.floorThicknessMm },
      { materialId: design.envelope.insulationMaterialId, thicknessMm: Math.min(100, design.envelope.insulationThicknessMm * 0.75) },
    ],
    false
  );

  const glazingInfo = GLAZING_DATABASE[design.openings.glazingType] || GLAZING_DATABASE.double_low_e;
  const windowU = design.openings.windowUValue || glazingInfo.uValue;
  const windowSHGC = design.openings.shgc || glazingInfo.shgc;

  // Thermal Capacitance Calculation (J/K)
  const airDensity = 1.15; // kg/m3 (adjusted for high altitude 3500m barometric pressure)
  const airCp = 1005; // J/(kg*K)
  const cAir = geo.enclosedVolumeM3 * airDensity * airCp;

  const wallMat = getMaterialById(design.envelope.wallMaterialId);
  const floorMat = getMaterialById(design.envelope.floorMaterialId);
  const roofMat = getMaterialById(design.envelope.roofMaterialId);

  // Participating thermal mass (interior 80mm of heavy masonry/earth actively participates in diurnal cycle)
  const participatingWallThicknessM = Math.min(0.08, design.envelope.wallThicknessMm / 1000);
  const cWalls = geo.netWallAreaM2 * wallMat.density * wallMat.specificHeat * participatingWallThicknessM * 0.75;
  const cFloor = geo.floorAreaM2 * floorMat.density * floorMat.specificHeat * 0.10 * 0.85;
  const cRoof = geo.roofAreaM2 * roofMat.density * roofMat.specificHeat * (design.envelope.roofThicknessMm / 1000) * 0.35;
  const cContents = geo.floorAreaM2 * 8500; // Internal fittings & bedding capacity

  const totalCapacitanceJPerK = cAir + cWalls + cFloor + cRoof + cContents;

  // Initial conditions
  let currentIndoorTempC =
    design.simulationSettings.initialIndoorTempC !== undefined
      ? design.simulationSettings.initialIndoorTempC
      : hourlyWeather[0].ambientTempC + 6.0;

  const timeseries: HourlySimulationPoint[] = [];

  let sumIndoorTemp = 0;
  let minIndoorTemp = 100;
  let maxIndoorTemp = -100;
  let minOutdoorTemp = 100;
  let maxOutdoorTemp = -100;
  let sumOutdoorTemp = 0;

  let totalSolarKwh = 0;
  let totalCondLossKwh = 0;
  let totalVentLossKwh = 0;
  let totalIntGainKwh = 0;
  let comfortHours = 0;
  let underheatingDegreeHours = 0;
  let overheatingDegreeHours = 0;

  // Mean outdoor temperature for adaptive comfort
  const meanOutdoorT = hourlyWeather.reduce((acc, curr) => acc + curr.ambientTempC, 0) / hourlyWeather.length;
  // Indian Model for Adaptive Comfort (IMAC / NBC 2016)
  const adaptiveNeutralT = Math.max(18.0, Math.min(26.0, 0.54 * meanOutdoorT + 12.83));
  const comfortLower = Math.max(16.0, adaptiveNeutralT - 3.5);
  const comfortUpper = Math.min(27.0, adaptiveNeutralT + 3.5);

  const subStepsPerHour = 6; // 10-minute numerical integration intervals
  const dtSec = 3600 / subStepsPerHour;

  for (let t = 0; t < hourlyWeather.length; t++) {
    const weather = hourlyWeather[t];
    const hourOfDay = t % 24;
    const isNight = hourOfDay < 6 || hourOfDay >= 19;

    minOutdoorTemp = Math.min(minOutdoorTemp, weather.ambientTempC);
    maxOutdoorTemp = Math.max(maxOutdoorTemp, weather.ambientTempC);
    sumOutdoorTemp += weather.ambientTempC;

    // Solar radiation distribution
    const solarDist = calculateShelterSolarDistribution(design.geometry, weather, location.latitude);

    // Sol-Air Temperatures for each facade
    const solAirSouth = calculateSolAirTemperature(
      weather.ambientTempC,
      solarDist.southWall.incidentTotalWm2,
      design.envelope.wallSolarAbsorptance,
      0.90,
      false
    );
    const solAirNorth = calculateSolAirTemperature(
      weather.ambientTempC,
      solarDist.northWall.incidentTotalWm2,
      design.envelope.wallSolarAbsorptance,
      0.90,
      false
    );
    const solAirEast = calculateSolAirTemperature(
      weather.ambientTempC,
      solarDist.eastWall.incidentTotalWm2,
      design.envelope.wallSolarAbsorptance,
      0.90,
      false
    );
    const solAirWest = calculateSolAirTemperature(
      weather.ambientTempC,
      solarDist.westWall.incidentTotalWm2,
      design.envelope.wallSolarAbsorptance,
      0.90,
      false
    );
    const solAirRoof = calculateSolAirTemperature(
      weather.ambientTempC,
      solarDist.roof.incidentTotalWm2,
      design.envelope.roofSolarAbsorptance,
      0.90,
      true
    );

    // Dynamic Night Shutter adjustment on windows
    let effectiveWindowU = windowU;
    if (isNight && design.openings.nightShutterInstalled) {
      // 1 / (R_win + R_shutter)
      const rTotal = 1 / windowU + (design.openings.nightShutterRValue || 0.65);
      effectiveWindowU = 1 / rTotal;
    }

    // Direct Solar Gain through Glazing (Watts)
    // South window gets main solar gain modulated by overhang shading
    const southSolarFlux = solarDist.southWall.incidentTotalWm2 * (1 - solarDist.southWall.shadingFraction);
    const qSolarSouth = design.openings.windowAreaSouthM2 * southSolarFlux * windowSHGC;
    const qSolarEast = design.openings.windowAreaEastM2 * solarDist.eastWall.incidentTotalWm2 * windowSHGC;
    const qSolarWest = design.openings.windowAreaWestM2 * solarDist.westWall.incidentTotalWm2 * windowSHGC;
    const qSolarNorth = design.openings.windowAreaNorthM2 * solarDist.northWall.incidentTotalWm2 * windowSHGC;
    const qSolarTotal = Math.max(0, qSolarSouth + qSolarEast + qSolarWest + qSolarNorth);

    // Internal Heat Gain (Watts)
    const occupantsCount = design.occupants.count;
    let occupancyFactor = 1.0;
    if (design.occupants.schedule === 'night_only') {
      occupancyFactor = isNight ? 1.0 : 0.2;
    } else if (design.occupants.schedule === 'day_only') {
      occupancyFactor = isNight ? 0.0 : 1.0;
    }
    const qOccupants = occupantsCount * design.occupants.heatPerPersonWatts * occupancyFactor;
    const qInternal = qOccupants + design.occupants.applianceWatts;

    // Ventilation Rate (ACH)
    const ach = isNight ? design.openings.ventilationRateAchNight : design.openings.ventilationRateAchDay;
    const ventHeatCapacityRate = (ach * geo.enclosedVolumeM3 * airDensity * airCp) / 3600; // W/K

    // Numerical integration across sub-steps within the hour
    let qCondWallsAccum = 0;
    let qCondRoofAccum = 0;
    let qCondFloorAccum = 0;
    let qCondWinAccum = 0;
    let qVentAccum = 0;
    let qNetAccum = 0;

    for (let s = 0; s < subStepsPerHour; s++) {
      // Wall heat conduction: U * A * (T_sol - T_in)
      const qWalls =
        wallAssembly.uValue *
        (geo.wallAreaSouthM2 * (solAirSouth - currentIndoorTempC) +
          geo.wallAreaNorthM2 * (solAirNorth - currentIndoorTempC) +
          geo.wallAreaEastM2 * (solAirEast - currentIndoorTempC) +
          geo.wallAreaWestM2 * (solAirWest - currentIndoorTempC));

      const qRoof = roofAssembly.uValue * geo.roofAreaM2 * (solAirRoof - currentIndoorTempC);
      const qFloor = floorAssembly.uValue * geo.floorAreaM2 * (weather.groundTempC - currentIndoorTempC);
      const qWindows = effectiveWindowU * geo.totalWindowAreaM2 * (weather.ambientTempC - currentIndoorTempC);
      const qVent = ventHeatCapacityRate * (weather.ambientTempC - currentIndoorTempC);

      const qNet = qWalls + qRoof + qFloor + qWindows + qSolarTotal + qVent + qInternal;

      // Transient Euler step
      currentIndoorTempC += (qNet / totalCapacitanceJPerK) * dtSec;

      qCondWallsAccum += qWalls / subStepsPerHour;
      qCondRoofAccum += qRoof / subStepsPerHour;
      qCondFloorAccum += qFloor / subStepsPerHour;
      qCondWinAccum += qWindows / subStepsPerHour;
      qVentAccum += qVent / subStepsPerHour;
      qNetAccum += qNet / subStepsPerHour;
    }

    minIndoorTemp = Math.min(minIndoorTemp, currentIndoorTempC);
    maxIndoorTemp = Math.max(maxIndoorTemp, currentIndoorTempC);
    sumIndoorTemp += currentIndoorTempC;

    // Energy totals in kWh
    totalSolarKwh += qSolarTotal / 1000;
    totalCondLossKwh += Math.max(0, -(qCondWallsAccum + qCondRoofAccum + qCondFloorAccum + qCondWinAccum)) / 1000;
    totalVentLossKwh += Math.max(0, -qVentAccum) / 1000;
    totalIntGainKwh += qInternal / 1000;

    // Comfort evaluation
    const isComfortable = currentIndoorTempC >= comfortLower && currentIndoorTempC <= comfortUpper;
    if (isComfortable) {
      comfortHours++;
    } else if (currentIndoorTempC < comfortLower) {
      underheatingDegreeHours += comfortLower - currentIndoorTempC;
    } else if (currentIndoorTempC > comfortUpper) {
      overheatingDegreeHours += currentIndoorTempC - comfortUpper;
    }

    let comfortStatus: 'cold_discomfort' | 'comfortable' | 'warm_discomfort' | 'extreme_cold' = 'comfortable';
    if (currentIndoorTempC < 5.0) {
      comfortStatus = 'extreme_cold';
    } else if (currentIndoorTempC < comfortLower) {
      comfortStatus = 'cold_discomfort';
    } else if (currentIndoorTempC > comfortUpper) {
      comfortStatus = 'warm_discomfort';
    }

    const hourFormatted = `${String(hourOfDay).padStart(2, '0')}:00 (D${Math.floor(t / 24) + 1})`;

    timeseries.push({
      timeIndex: t,
      hour: hourOfDay,
      day: Math.floor(t / 24) + 1,
      timestampLabel: hourFormatted,
      outdoorTempC: Number(weather.ambientTempC.toFixed(2)),
      indoorTempC: Number(currentIndoorTempC.toFixed(2)),
      solAirTempWallSouthC: Number(solAirSouth.toFixed(2)),
      solAirTempRoofC: Number(solAirRoof.toFixed(2)),
      solarRadiationWm2: weather.globalHorizontalRadiationWm2,
      sunAltitudeDeg: solarDist.solarAltitudeDeg,
      sunAzimuthDeg: solarDist.solarAzimuthDeg,
      
      qConductionWallsW: Math.round(qCondWallsAccum),
      qConductionRoofW: Math.round(qCondRoofAccum),
      qConductionFloorW: Math.round(qCondFloorAccum),
      qConductionWindowsW: Math.round(qCondWinAccum),
      qSolarGlazingGainW: Math.round(qSolarTotal),
      qVentilationLossGainW: Math.round(qVentAccum),
      qInternalGainW: Math.round(qInternal),
      qNetHeatRateW: Math.round(qNetAccum),

      isComfortable,
      comfortStatus,
      comfortBandLowerC: Number(comfortLower.toFixed(1)),
      comfortBandUpperC: Number(comfortUpper.toFixed(1)),
      adaptiveNeutralTempC: Number(adaptiveNeutralT.toFixed(1)),
    });
  }

  const avgIndoor = sumIndoorTemp / timeseries.length;
  const avgOutdoor = sumOutdoorTemp / timeseries.length;
  const diurnalIndoorSwing = maxIndoorTemp - minIndoorTemp;
  const diurnalOutdoorSwing = maxOutdoorTemp - minOutdoorTemp;
  const dampingFactor = Math.max(0.01, diurnalIndoorSwing / Math.max(1, diurnalOutdoorSwing));

  // Area-weighted average envelope U-value
  const totalEnvelopeArea = geo.grossWallAreaM2 + geo.roofAreaM2 + geo.floorAreaM2;
  const weightedU =
    (wallAssembly.uValue * geo.netWallAreaM2 +
      roofAssembly.uValue * geo.roofAreaM2 +
      floorAssembly.uValue * geo.floorAreaM2 +
      windowU * geo.totalWindowAreaM2) /
    Math.max(1, totalEnvelopeArea);

  // DRDO High Altitude Cold Survival Score (0 to 100)
  // Evaluates minimum temperature achieved during coldest night hours
  let survivalScore = 100;
  if (minIndoorTemp < 18.0) {
    survivalScore -= (18.0 - minIndoorTemp) * 4.5;
  }
  survivalScore += Math.min(20, (totalSolarKwh / (timeseries.length / 24)) * 0.8);
  survivalScore = Math.max(10, Math.min(100, Math.round(survivalScore)));

  let survivabilityIndex: 'safe' | 'caution' | 'dangerous' = 'safe';
  if (minIndoorTemp < 0.0) {
    survivabilityIndex = 'dangerous';
  } else if (minIndoorTemp < 10.0) {
    survivabilityIndex = 'caution';
  }

  const summary: SimulationSummary = {
    minIndoorTempC: Number(minIndoorTemp.toFixed(2)),
    maxIndoorTempC: Number(maxIndoorTemp.toFixed(2)),
    avgIndoorTempC: Number(avgIndoor.toFixed(2)),
    minOutdoorTempC: Number(minOutdoorTemp.toFixed(2)),
    maxOutdoorTempC: Number(maxOutdoorTemp.toFixed(2)),
    avgOutdoorTempC: Number(avgOutdoor.toFixed(2)),
    diurnalIndoorSwingC: Number(diurnalIndoorSwing.toFixed(2)),
    diurnalOutdoorSwingC: Number(diurnalOutdoorSwing.toFixed(2)),
    dampingFactor: Number(dampingFactor.toFixed(3)),
    thermalLagHours: wallAssembly.timeLagHours,

    totalSolarGainKwh: Number(totalSolarKwh.toFixed(1)),
    totalConductionLossKwh: Number(totalCondLossKwh.toFixed(1)),
    totalVentilationLossKwh: Number(totalVentLossKwh.toFixed(1)),
    totalInternalGainKwh: Number(totalIntGainKwh.toFixed(1)),

    comfortHoursCount: comfortHours,
    totalSimulationHours: timeseries.length,
    comfortPercentage: Number(((comfortHours / timeseries.length) * 100).toFixed(1)),
    underheatingDegreeHours: Number(underheatingDegreeHours.toFixed(1)),
    overheatingDegreeHours: Number(overheatingDegreeHours.toFixed(1)),

    effectiveEnvelopeUValue: Number(weightedU.toFixed(3)),
    totalEnvelopeAreaM2: Number(totalEnvelopeArea.toFixed(1)),
    totalEnclosedVolumeM3: geo.enclosedVolumeM3,
    totalThermalMassCapacityKjK: Math.round(totalCapacitanceJPerK / 1000),

    passiveSurvivabilityIndex: survivabilityIndex,
    drdoColdSurvivalScore: survivalScore,
  };

  const assumptionsNotes = [
    `Zone lumped air & participating boundary wall mass capacitance ($C_{zone} = ${Math.round(totalCapacitanceJPerK / 1000)}\\text{ kJ/K}$).`,
    `Wall composite U-value: ${wallAssembly.uValue} W/(m²·K), Roof U-value: ${roofAssembly.uValue} W/(m²·K).`,
    `Window Glazing: ${glazingInfo.name} ($U=${windowU}\\text{ W/m}^2\\text{K}$, $SHGC=${windowSHGC}$).`,
    `Solar radiation computed with Cooper solar declination and isotropic sky model on ${location.latitude}°N latitude.`,
    `Infiltration & Ventilation: Day ${design.openings.ventilationRateAchDay} ACH, Night ${design.openings.ventilationRateAchNight} ACH.`,
    `Internal occupant sensible heat: ${design.occupants.count} occupants @ ${design.occupants.heatPerPersonWatts} W/person.`,
  ];

  return {
    designId: design.id,
    designName: design.name,
    location,
    summary,
    timeseries,
    calculatedAt: new Date().toISOString(),
    assumptionsNotes,
  };
}
