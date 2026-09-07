// DRDO Defence Habitat Climate Database & Representative Meteorological Normal Profiles
// Derived from IMD (India Meteorological Department), ISHRAE Weather Data, and NASA POWER Climatology.

import { ClimateLocation, HourlyClimateData, Season } from '../types';

export const CLIMATE_LOCATIONS: ClimateLocation[] = [
  {
    id: 'leh_ladakh',
    name: 'Leh, Ladakh (Cold Arid / High Altitude)',
    shortName: 'Leh (Ladakh)',
    region: 'Ladakh (Union Territory)',
    state: 'Ladakh',
    country: 'India',
    latitude: 34.15,
    longitude: 77.58,
    altitudeMeters: 3524,
    climateZone: 'cold_arid',
    designWinterTempC: -16.5,
    designSummerTempC: 26.0,
    annualMeanTempC: 5.4,
    annualSolarRadiationKwhM2: 1950,
    drdoRelevanceNotes: 'Primary high-altitude field habitat zone. Characterized by severe sub-zero ambient temperatures (-20°C in winter) combined with abundant, clear-sky solar direct normal irradiance (DNI > 900 W/m²). Prime opportunity for passive solar architecture.',
    description: 'Cold desert climate with extreme diurnal swings, thin atmosphere (approx 65 kPa barometric pressure), and near-zero winter precipitation.',
    zoneTitle: 'Cold-Arid High-Altitude Sector',
    overviewHeadline: 'ASTRA: Cold-Arid High-Altitude Alpine Shelter Analysis',
    overviewDescription: 'Area-specific passive solar heat capture and high thermal inertia shelter engineering for Leh-Ladakh outpost shelters (3,524m MSL). Evaluates dynamic sol-air irradiance under sub-zero ambient swings with high DNI solar gain.',
    recommendedShelterTitle: 'ASTRA Alpine Field Shelter (Leh Baseline)',
    primaryThermalChallenge: 'Severe sub-zero winter (-17°C) & high diurnal swing with abundant clear-sky solar gain',
    keyPassiveStrategy: 'Maximal direct solar capture through south glazing + Trombe mass wall & insulated shutters',
    terrainType: 'alpine_gravel',
    terrainColor: '#2a3441',
    terrainGridColor: '#38bdf8',
    skyColor: '#0b1329',
    recommendedWallMaterialId: 'rammed_earth_stabilized',
    recommendedWallThicknessMm: 300,
    recommendedOverhangM: 0.6,
    recommendedNightPurgeAch: 0.4,
    recommendedSolarAbsorptance: 0.70,
  },
  {
    id: 'dras_kargil',
    name: 'Dras, Kargil (Extreme Cold Desert)',
    shortName: 'Dras (Kargil)',
    region: 'Kargil District',
    state: 'Ladakh',
    country: 'India',
    latitude: 34.43,
    longitude: 75.76,
    altitudeMeters: 3280,
    climateZone: 'extreme_cold',
    designWinterTempC: -28.0,
    designSummerTempC: 22.0,
    annualMeanTempC: 1.8,
    annualSolarRadiationKwhM2: 1780,
    drdoRelevanceNotes: 'Second coldest inhabited place on earth. Critical forward logistical hub requiring high thermal resistance and heavy insulated envelope.',
    description: 'Sub-arctic mountain climate with prolonged snow cover and intense katabatic winds.',
    zoneTitle: 'Extreme Cold Sub-Zero Mountain Sector',
    overviewHeadline: 'ASTRA: Extreme Cold Sub-Zero Outpost Thermal Analysis',
    overviewDescription: 'Area-specific extreme sub-zero thermal retention engineering for forward positions in Dras-Kargil (3,280m MSL). Calibrated for -28°C design winter extremes, katabatic winds, and continuous snow cover.',
    recommendedShelterTitle: 'ASTRA Sub-Zero Forward Outpost (Dras Extreme Cold)',
    primaryThermalChallenge: 'Extreme -28°C sub-zero ambient chill, high wind chill & katabatic heat loss',
    keyPassiveStrategy: 'Ultra-insulated envelope (R > 5.5) + Triple Low-E + Insulated night shutters',
    terrainType: 'snow_ice',
    terrainColor: '#cbd5e1',
    terrainGridColor: '#60a5fa',
    skyColor: '#081426',
    recommendedWallMaterialId: 'puf_sandwich_roof_panel',
    recommendedWallThicknessMm: 250,
    recommendedOverhangM: 0.5,
    recommendedNightPurgeAch: 0.3,
    recommendedSolarAbsorptance: 0.80,
  },
  {
    id: 'new_delhi',
    name: 'New Delhi (Composite)',
    shortName: 'New Delhi',
    region: 'National Capital Region',
    state: 'Delhi',
    country: 'India',
    latitude: 28.61,
    longitude: 77.20,
    altitudeMeters: 216,
    climateZone: 'composite',
    designWinterTempC: 4.8,
    designSummerTempC: 43.5,
    annualMeanTempC: 25.1,
    annualSolarRadiationKwhM2: 1720,
    drdoRelevanceNotes: 'Dual challenge: requires passive cooling and solar shading in May-June, yet thermal retention and solar heating in Dec-Jan.',
    description: 'Composite climate with three distinct seasons: extreme hot dry summer, humid monsoon, and dry cold winter.',
    zoneTitle: 'Composite Indo-Gangetic Tactical Sector',
    overviewHeadline: 'ASTRA: Composite Multi-Seasonal Tactical Habitat Analysis',
    overviewDescription: 'Area-specific dual-season thermal performance analyzer for composite climate bases in the National Capital Region (216m MSL). Optimizes summer passive heat rejection alongside winter solar warmth retention.',
    recommendedShelterTitle: 'ASTRA Dual-Season Tactical Habitat (Delhi Composite)',
    primaryThermalChallenge: 'Dual extreme challenge: scorching summer (+43.5°C) & winter chill (+4.8°C)',
    keyPassiveStrategy: 'Deep overhang solar shading + Cool roof coatings + Selective summer night purge',
    terrainType: 'composite_earth',
    terrainColor: '#3f473c',
    terrainGridColor: '#94a3b8',
    skyColor: '#0c1624',
    recommendedWallMaterialId: 'aac_autoclaved_block',
    recommendedWallThicknessMm: 200,
    recommendedOverhangM: 1.0,
    recommendedNightPurgeAch: 2.0,
    recommendedSolarAbsorptance: 0.35,
  },
  {
    id: 'jaisalmer_rajasthan',
    name: 'Jaisalmer, Thar Desert (Hot & Arid)',
    shortName: 'Jaisalmer (Thar)',
    region: 'Thar Desert',
    state: 'Rajasthan',
    country: 'India',
    latitude: 26.91,
    longitude: 70.90,
    altitudeMeters: 225,
    climateZone: 'hot_arid',
    designWinterTempC: 6.2,
    designSummerTempC: 45.8,
    annualMeanTempC: 27.2,
    annualSolarRadiationKwhM2: 2150,
    drdoRelevanceNotes: 'Border outpost zone with extreme solar gain and scorching desert winds. Demands high thermal mass (rammed earth/stone) with night purge ventilation.',
    description: 'Arid desert with low humidity, high direct radiation, and massive daily diurnal temperature oscillations (15-20°C swing).',
    zoneTitle: 'Hot & Arid Desert Border Sector',
    overviewHeadline: 'ASTRA: Hot & Arid Desert Defensive Outpost Analysis',
    overviewDescription: 'Area-specific extreme heat rejection and thermal lag engineering for Thar Desert border outposts (225m MSL). Evaluates 46°C daytime peak solar heat rejection, deep shading overhangs, and high-velocity nocturnal cool ventilation purges.',
    recommendedShelterTitle: 'ASTRA Desert Patrol Shelter (Jaisalmer Arid Zone)',
    primaryThermalChallenge: 'Extreme desert heat (+46°C), intense solar irradiance & 18°C daily swing',
    keyPassiveStrategy: 'Massive thermal inertia (400mm Rammed Earth/Stone) + Night purge ventilation (ACH > 3.0)',
    terrainType: 'thar_sand',
    terrainColor: '#b88648',
    terrainGridColor: '#f59e0b',
    skyColor: '#19150e',
    recommendedWallMaterialId: 'rammed_earth_stabilized',
    recommendedWallThicknessMm: 400,
    recommendedOverhangM: 1.2,
    recommendedNightPurgeAch: 3.5,
    recommendedSolarAbsorptance: 0.28,
  },
  {
    id: 'guwahati_assam',
    name: 'Guwahati (Warm & Humid)',
    shortName: 'Guwahati (Assam)',
    region: 'North-East Region',
    state: 'Assam',
    country: 'India',
    latitude: 26.14,
    longitude: 91.73,
    altitudeMeters: 55,
    climateZone: 'warm_humid',
    designWinterTempC: 10.5,
    designSummerTempC: 34.0,
    annualMeanTempC: 24.3,
    annualSolarRadiationKwhM2: 1480,
    drdoRelevanceNotes: 'Eastern sector border deployment. High precipitation, heavy cloud cover, and persistent humidity requiring maximum cross-ventilation.',
    description: 'Subtropical monsoon climate with heavy rainfall, high moisture index, and reduced clear-sky direct solar fraction.',
    zoneTitle: 'Warm & Humid North-East Sector',
    overviewHeadline: 'ASTRA: Warm & Humid North-East Sector Habitat Analysis',
    overviewDescription: 'Area-specific aerodynamic and cross-ventilation engineering for Eastern sector border habitats (55m MSL). Calibrated for high humidity, monsoonal rainfall, and continuous passive breeze optimization.',
    recommendedShelterTitle: 'ASTRA Humid-Sector Tactical Barracks (Guwahati Zone)',
    primaryThermalChallenge: 'Persistent high humidity (>85%), overcast diffuse sky & low diurnal swing',
    keyPassiveStrategy: 'Maximized cross-ventilation apertures + Rain-screen overhangs + Low thermal mass',
    terrainType: 'subtropical_green',
    terrainColor: '#253d26',
    terrainGridColor: '#34d399',
    skyColor: '#0c1a18',
    recommendedWallMaterialId: 'aac_autoclaved_block',
    recommendedWallThicknessMm: 150,
    recommendedOverhangM: 1.4,
    recommendedNightPurgeAch: 3.0,
    recommendedSolarAbsorptance: 0.40,
  },
  {
    id: 'shimla_hp',
    name: 'Shimla (Cold & Cloudy)',
    shortName: 'Shimla (HP)',
    region: 'Western Himalayas',
    state: 'Himachal Pradesh',
    country: 'India',
    latitude: 31.10,
    longitude: 77.17,
    altitudeMeters: 2205,
    climateZone: 'cold_cloudy',
    designWinterTempC: -2.0,
    designSummerTempC: 25.5,
    annualMeanTempC: 14.2,
    annualSolarRadiationKwhM2: 1620,
    drdoRelevanceNotes: 'Middle Himalayan mountain outpost with frequent winter cloud cover and snow, requiring tight air sealing and double glazing.',
    description: 'Mountain subtropical highland climate with cool temperate summers and cold snowy winters.',
    zoneTitle: 'Cold & Cloudy Mountain Sector',
    overviewHeadline: 'ASTRA: Cold & Cloudy Mountain Habitat Analysis',
    overviewDescription: 'Area-specific thermal envelope analysis for Western Himalayan highland outposts (2,205m MSL). Addresses reduced clear-sky solar availability with optimized envelope airtightness and snow-shedding steep pitch.',
    recommendedShelterTitle: 'ASTRA Highland Mountain Habitat (Shimla Cold Zone)',
    primaryThermalChallenge: 'Cold cloudy winters (-2°C), diffuse solar fraction & frequent snowfall',
    keyPassiveStrategy: 'Steep gable snow-shedding roof + High envelope airtightness + Double Low-E glazing',
    terrainType: 'mountain_rock',
    terrainColor: '#2e3d3c',
    terrainGridColor: '#38bdf8',
    skyColor: '#091624',
    recommendedWallMaterialId: 'fired_clay_brick',
    recommendedWallThicknessMm: 250,
    recommendedOverhangM: 0.7,
    recommendedNightPurgeAch: 0.5,
    recommendedSolarAbsorptance: 0.72,
  },
];

/**
 * Generates continuous synthetic 24h to 168h hourly meteorological records
 * based on location latitude, day of year, and verified regional climate bounds.
 */
export function generateHourlyClimateData(
  locationId: string,
  season: Season = 'winter',
  durationHours: number = 24
): HourlyClimateData[] {
  const loc = CLIMATE_LOCATIONS.find((l) => l.id === locationId) || CLIMATE_LOCATIONS[0];
  const hourlyData: HourlyClimateData[] = [];

  // Determine baseline seasonal conditions
  let minT = loc.designWinterTempC;
  let maxT = loc.designWinterTempC + 11.0; // Typical diurnal swing
  let baseDNI = 850; // W/m2 clear sky peak
  let baseDHI = 120;
  let baseHumidity = 35;
  let baseWind = 3.2;
  let groundT = minT + 4.0;
  let dayOfYear = 15; // Jan 15 for winter

  if (season === 'summer') {
    minT = loc.designSummerTempC - 12.0;
    maxT = loc.designSummerTempC;
    baseDNI = 920;
    baseDHI = 180;
    baseHumidity = 25;
    baseWind = 4.5;
    groundT = minT + 2.0;
    dayOfYear = 165; // June 15 for summer
  } else if (season === 'monsoon') {
    minT = 22.0;
    maxT = 30.0;
    baseDNI = 350;
    baseDHI = 320;
    baseHumidity = 85;
    baseWind = 2.8;
    groundT = 24.0;
    dayOfYear = 210; // July 29 for monsoon
  } else if (season === 'annual') {
    minT = loc.annualMeanTempC - 8.0;
    maxT = loc.annualMeanTempC + 8.0;
    dayOfYear = 80;
  }

  // Adjust for Leh extreme winter conditions
  if (loc.id === 'leh_ladakh' && season === 'winter') {
    minT = -17.5;
    maxT = -2.5; // Sunny afternoon in Leh
    baseDNI = 950; // Intense high altitude solar
    baseDHI = 95;
    baseHumidity = 28;
    groundT = -4.0;
  } else if (loc.id === 'dras_kargil' && season === 'winter') {
    minT = -26.0;
    maxT = -10.0;
    baseDNI = 880;
    baseDHI = 110;
    baseHumidity = 40;
    groundT = -12.0;
  } else if (loc.id === 'jaisalmer_rajasthan' && season === 'summer') {
    minT = 28.5;
    maxT = 46.0;
    baseDNI = 980;
    baseDHI = 160;
    baseHumidity = 20;
    groundT = 32.0;
  }

  const latRad = (loc.latitude * Math.PI) / 180;

  for (let t = 0; t < durationHours; t++) {
    const hourOfDay = t % 24;
    const currentDay = Math.floor(t / 24) + 1;
    const currentDayOfYear = (dayOfYear + Math.floor(t / 24)) % 365;

    // Daily sinusoidal temperature cycle with minimum at 05:00 and peak at 14:00 (standard meteorological lag)
    // T(h) = T_mean - (T_max - T_min)/2 * cos(2*pi*(h - 5)/24)
    const tMean = (minT + maxT) / 2;
    const tAmp = (maxT - minT) / 2;
    const phaseHour = (hourOfDay - 5 + 24) % 24;
    const ambientT = tMean - tAmp * Math.cos((2 * Math.PI * phaseHour) / 24);

    // Solar calculation for this hour
    // Solar declination (Spencer 1971 / Cooper 1969)
    const declinationDeg = 23.45 * Math.sin(((284 + currentDayOfYear) / 365) * 2 * Math.PI);
    const declinationRad = (declinationDeg * Math.PI) / 180;

    // Solar hour angle (omega = 15 deg * (hour - 12))
    const hourAngleDeg = 15 * (hourOfDay + 0.5 - 12);
    const hourAngleRad = (hourAngleDeg * Math.PI) / 180;

    // Solar altitude angle alpha_s
    const sinAltitude =
      Math.sin(latRad) * Math.sin(declinationRad) +
      Math.cos(latRad) * Math.cos(declinationRad) * Math.cos(hourAngleRad);
    const altitudeRad = Math.asin(Math.max(0, sinAltitude));
    const altitudeDeg = (altitudeRad * 180) / Math.PI;

    // Solar radiation calculations
    let dni = 0;
    let dhi = 0;
    let ghi = 0;

    if (altitudeDeg > 1.0) {
      // Sun is above the horizon
      const airMass = 1 / (Math.sin(altitudeRad) + 0.50572 * Math.pow(altitudeDeg + 6.07995, -1.6364));
      // Atmospheric transmittance adjusted for altitude
      const altitudeFactor = 1 + 0.00008 * loc.altitudeMeters;
      dni = Math.min(1050, baseDNI * Math.pow(0.72, Math.pow(airMass, 0.65)) * altitudeFactor);
      dhi = baseDHI * Math.sin(altitudeRad);
      ghi = dni * Math.sin(altitudeRad) + dhi;
    }

    // Relative humidity inverted against temperature
    const rh = Math.min(95, Math.max(15, baseHumidity - (ambientT - tMean) * 1.5));
    const wind = Math.max(0.5, baseWind + Math.sin((hourOfDay / 24) * 2 * Math.PI) * 1.2);

    hourlyData.push({
      hour: t,
      month: season === 'winter' ? 1 : season === 'summer' ? 6 : season === 'monsoon' ? 8 : 4,
      day: currentDay,
      ambientTempC: Number(ambientT.toFixed(2)),
      directNormalRadiationWm2: Math.round(dni),
      diffuseHorizontalRadiationWm2: Math.round(dhi),
      globalHorizontalRadiationWm2: Math.round(ghi),
      relativeHumidityPercent: Math.round(rh),
      windSpeedMs: Number(wind.toFixed(1)),
      windDirectionDeg: 180 + Math.sin(t / 6) * 45, // Southerly/Westerly valley breezes
      groundTempC: Number(groundT.toFixed(1)),
    });
  }

  return hourlyData;
}

export function getLocationById(id: string): ClimateLocation {
  const found = CLIMATE_LOCATIONS.find((l) => l.id === id);
  if (!found) return CLIMATE_LOCATIONS[0];
  return found;
}
