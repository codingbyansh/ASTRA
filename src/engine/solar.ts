// DRDO Defence Habitat: Solar Radiation & Geometric Incident Angle Engine
// Follows ASHRAE Handbook Fundamentals Ch. 14 / Duffie & Beckman Solar Engineering of Thermal Processes.

import { ShelterGeometry, HourlyClimateData } from '../types';

export interface SurfaceSolarRadiation {
  incidentTotalWm2: number;
  incidentDirectWm2: number;
  incidentDiffuseWm2: number;
  incidentReflectedWm2: number;
  incidentAngleDeg: number;
  shadingFraction: number; // 0 (unshaded) to 1 (fully shaded)
}

export interface ShelterSolarDistribution {
  southWall: SurfaceSolarRadiation;
  northWall: SurfaceSolarRadiation;
  eastWall: SurfaceSolarRadiation;
  westWall: SurfaceSolarRadiation;
  roof: SurfaceSolarRadiation;
  solarAltitudeDeg: number;
  solarAzimuthDeg: number;
}

/**
 * Calculates solar position angles for given latitude, day of year, and hour
 */
export function calculateSolarPosition(
  latitudeDeg: number,
  dayOfYear: number,
  hourOfDay: number // 0 to 24 (float)
): { altitudeDeg: number; azimuthDeg: number; hourAngleDeg: number } {
  const latRad = (latitudeDeg * Math.PI) / 180;

  // Declination (Cooper 1969 equation)
  const deltaDeg = 23.45 * Math.sin(((284 + dayOfYear) / 365) * 2 * Math.PI);
  const deltaRad = (deltaDeg * Math.PI) / 180;

  // Hour angle (omega = 15 deg * (hour - 12))
  const omegaDeg = 15 * (hourOfDay - 12);
  const omegaRad = (omegaDeg * Math.PI) / 180;

  // Solar Altitude (alpha)
  const sinAlpha =
    Math.sin(latRad) * Math.sin(deltaRad) +
    Math.cos(latRad) * Math.cos(deltaRad) * Math.cos(omegaRad);
  const altitudeRad = Math.asin(Math.max(-1, Math.min(1, sinAlpha)));
  const altitudeDeg = (altitudeRad * 180) / Math.PI;

  if (altitudeDeg <= 0) {
    return { altitudeDeg: 0, azimuthDeg: 180, hourAngleDeg: omegaDeg };
  }

  // Solar Azimuth (gamma) - 0 = North, 90 = East, 180 = South, 270 = West
  const cosGamma =
    (Math.sin(altitudeRad) * Math.sin(latRad) - Math.sin(deltaRad)) /
    (Math.cos(altitudeRad) * Math.cos(latRad));
  const clampedCosGamma = Math.max(-1, Math.min(1, cosGamma));
  let gammaRad = Math.acos(clampedCosGamma);

  if (omegaDeg > 0) {
    // Afternoon (sun is in the west)
    gammaRad = 2 * Math.PI - gammaRad;
  }
  const azimuthDeg = (gammaRad * 180) / Math.PI;

  return {
    altitudeDeg: Number(altitudeDeg.toFixed(2)),
    azimuthDeg: Number(azimuthDeg.toFixed(2)),
    hourAngleDeg: Number(omegaDeg.toFixed(2)),
  };
}

/**
 * Calculates incident radiation on a tilted planar surface with surface azimuth and tilt angle.
 * @param surfaceTiltDeg Tilt from horizontal (0 = Flat horizontal, 90 = Vertical wall)
 * @param surfaceAzimuthDeg Direction surface faces (180 = South, 90 = East, 270 = West, 0 = North)
 * @param albedo Ground reflectance (typically 0.20 for soil, 0.70 for snow in Ladakh)
 */
export function calculateTiltedSurfaceRadiation(
  surfaceTiltDeg: number,
  surfaceAzimuthDeg: number,
  sunAltitudeDeg: number,
  sunAzimuthDeg: number,
  dniWm2: number,
  dhiWm2: number,
  albedo: number = 0.25
): SurfaceSolarRadiation {
  if (sunAltitudeDeg <= 0 || (dniWm2 === 0 && dhiWm2 === 0)) {
    return {
      incidentTotalWm2: 0,
      incidentDirectWm2: 0,
      incidentDiffuseWm2: 0,
      incidentReflectedWm2: 0,
      incidentAngleDeg: 90,
      shadingFraction: 0,
    };
  }

  const betaRad = (surfaceTiltDeg * Math.PI) / 180;
  const alphaRad = (sunAltitudeDeg * Math.PI) / 180;
  const gammaSurRad = (surfaceAzimuthDeg * Math.PI) / 180;
  const gammaSunRad = (sunAzimuthDeg * Math.PI) / 180;

  // Cosine of incidence angle theta_i on tilted surface
  // cos(theta) = sin(alpha)*cos(beta) + cos(alpha)*sin(beta)*cos(gamma_sun - gamma_surface)
  const cosTheta =
    Math.sin(alphaRad) * Math.cos(betaRad) +
    Math.cos(alphaRad) * Math.sin(betaRad) * Math.cos(gammaSunRad - gammaSurRad);

  const thetaDeg = (Math.acos(Math.max(-1, Math.min(1, cosTheta))) * 180) / Math.PI;

  // Direct beam component
  let iBeam = 0;
  if (cosTheta > 0) {
    iBeam = dniWm2 * cosTheta;
  }

  // Diffuse component (Liu & Jordan isotropic sky model)
  // I_d_tilted = DHI * (1 + cos(beta)) / 2
  const iDiffuse = dhiWm2 * ((1 + Math.cos(betaRad)) / 2);

  // Ground reflected component
  // I_r = GHI * albedo * (1 - cos(beta)) / 2
  const ghi = dniWm2 * Math.sin(alphaRad) + dhiWm2;
  const iReflected = ghi * albedo * ((1 - Math.cos(betaRad)) / 2);

  const iTotal = iBeam + iDiffuse + iReflected;

  return {
    incidentTotalWm2: Number(iTotal.toFixed(1)),
    incidentDirectWm2: Number(iBeam.toFixed(1)),
    incidentDiffuseWm2: Number(iDiffuse.toFixed(1)),
    incidentReflectedWm2: Number(iReflected.toFixed(1)),
    incidentAngleDeg: Number(thetaDeg.toFixed(1)),
    shadingFraction: 0,
  };
}

/**
 * Calculates the solar distribution on all 5 main envelope surfaces of the shelter
 */
export function calculateShelterSolarDistribution(
  geometry: ShelterGeometry,
  climate: HourlyClimateData,
  latitudeDeg: number,
  dayOfYear: number = 15,
  albedo: number = 0.30
): ShelterSolarDistribution {
  const hourOfDay = (climate.hour % 24) + 0.5;
  const solarPos = calculateSolarPosition(latitudeDeg, dayOfYear, hourOfDay);

  const orientationOffset = geometry.orientationDeg; // 0 = South, rotate clockwise

  // Facade azimuths adjusted for orientation:
  // South = (180 + offset) % 360
  // North = (0 + offset) % 360
  // East  = (90 + offset) % 360
  // West  = (270 + offset) % 360
  const azSouth = (180 + orientationOffset) % 360;
  const azNorth = (0 + orientationOffset) % 360;
  const azEast = (90 + orientationOffset) % 360;
  const azWest = (270 + orientationOffset) % 360;

  const southWall = calculateTiltedSurfaceRadiation(
    90,
    azSouth,
    solarPos.altitudeDeg,
    solarPos.azimuthDeg,
    climate.directNormalRadiationWm2,
    climate.diffuseHorizontalRadiationWm2,
    albedo
  );

  const northWall = calculateTiltedSurfaceRadiation(
    90,
    azNorth,
    solarPos.altitudeDeg,
    solarPos.azimuthDeg,
    climate.directNormalRadiationWm2,
    climate.diffuseHorizontalRadiationWm2,
    albedo
  );

  const eastWall = calculateTiltedSurfaceRadiation(
    90,
    azEast,
    solarPos.altitudeDeg,
    solarPos.azimuthDeg,
    climate.directNormalRadiationWm2,
    climate.diffuseHorizontalRadiationWm2,
    albedo
  );

  const westWall = calculateTiltedSurfaceRadiation(
    90,
    azWest,
    solarPos.altitudeDeg,
    solarPos.azimuthDeg,
    climate.directNormalRadiationWm2,
    climate.diffuseHorizontalRadiationWm2,
    albedo
  );

  // Roof tilt
  let roofTilt = geometry.roofPitchDeg;
  if (geometry.shape === 'flat') roofTilt = 3;
  const roofAzimuth = azSouth; // Pitch towards South for maximum winter solar gain
  const roof = calculateTiltedSurfaceRadiation(
    roofTilt,
    roofAzimuth,
    solarPos.altitudeDeg,
    solarPos.azimuthDeg,
    climate.directNormalRadiationWm2,
    climate.diffuseHorizontalRadiationWm2,
    albedo
  );

  // Calculate Overhang Shading on South Windows
  if (geometry.overhangLengthM > 0 && solarPos.altitudeDeg > 0) {
    const sunAltRad = (solarPos.altitudeDeg * Math.PI) / 180;
    // Overhang projection factor = overhangLength * tan(altitude)
    // Window vertical extent typically 1.2m
    const shadowDepth = geometry.overhangLengthM * Math.tan(sunAltRad);
    const shadeFraction = Math.min(1, Math.max(0, shadowDepth / 1.2));
    southWall.shadingFraction = Number(shadeFraction.toFixed(2));
  }

  return {
    southWall,
    northWall,
    eastWall,
    westWall,
    roof,
    solarAltitudeDeg: solarPos.altitudeDeg,
    solarAzimuthDeg: solarPos.azimuthDeg,
  };
}

/**
 * Calculates Sol-Air Temperature for a facade:
 * T_sol_air = T_out + (alpha * I_total) / h_o - (epsilon * delta_R) / h_o
 * where h_o is external surface heat transfer coefficient (typically 17-23 W/(m2*K))
 */
export function calculateSolAirTemperature(
  outdoorTempC: number,
  incidentTotalWm2: number,
  solarAbsorptance: number,
  emissivity: number = 0.90,
  isHorizontalRoof: boolean = false,
  h_o: number = 20.0
): number {
  // delta_R is long-wave radiation correction factor: ~20 W/m2 for horizontal surfaces to sky, ~0 for vertical walls
  const deltaR = isHorizontalRoof ? 20.0 : 0.0;
  const radiationGain = (solarAbsorptance * incidentTotalWm2) / h_o;
  const longwaveLoss = (emissivity * deltaR) / h_o;

  return outdoorTempC + radiationGain - longwaveLoss;
}
