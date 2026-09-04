// DRDO Defence Habitat Climate Database & Representative Meteorological Normal Profiles
// Derived from IMD (India Meteorological Department), ISHRAE Weather Data, and NASA POWER Climatology.

import { ClimateLocation, HourlyClimateData, Season } from '../types';

export const CLIMATE_LOCATIONS: ClimateLocation[] = [
  {
    id: 'leh_ladakh',
    name: 'Leh, Ladakh (Cold Arid / High Altitude)',
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
    drdoRelevanceNotes: 'Primary high-altitude field defense habitat zone. Characterized by severe sub-zero ambient temperatures (-20°C in winter) combined with abundant, clear-sky solar direct normal irradiance (DNI > 900 W/m²). Prime opportunity for passive solar architecture.',
    description: 'Cold desert climate with extreme diurnal swings, thin atmosphere (approx 65 kPa barometric pressure), and near-zero winter precipitation.',
  },
  {
    id: 'dras_kargil',
    name: 'Dras, Kargil (Extreme Cold Desert)',
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
  },
  {
    id: 'new_delhi',
    name: 'New Delhi (Composite)',
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
  },
  {
    id: 'jaisalmer_rajasthan',
    name: 'Jaisalmer, Thar Desert (Hot & Arid)',
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
  },
  {
    id: 'guwahati_assam',
    name: 'Guwahati (Warm & Humid)',
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
  },
  {
    id: 'shimla_hp',
    name: 'Shimla (Cold & Cloudy)',
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
