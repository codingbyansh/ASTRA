// ASTRA Habitat Materials Thermophysical Engineering Database
// Grounded in ASHRAE Handbook of Fundamentals, IS 3792, NBC 2016 India, and alpine high-altitude technical specifications.

import { Material, GlazingType } from '../types';

export const MATERIALS_DATABASE: Material[] = [
  // --- MASONRY & EARTH MATERIALS (Thermal Mass) ---
  {
    id: 'rammed_earth_stabilized',
    name: 'Stabilized Rammed Earth (High-Altitude Alpine)',
    category: 'earth',
    density: 2050,
    specificHeat: 1150,
    thermalConductivity: 0.95,
    standardThicknessMm: 300,
    emissivity: 0.90,
    solarAbsorptance: 0.65,
    embodiedCarbonKgCO2ePerKg: 0.045,
    costIndexINRPerM3: 4200,
    sourceReference: 'IS 13827 / Cold Desert Shelter Technical Manual',
    description: 'Local Ladakh clay-gravel compacted with 6% lime-cement stabilizer. High thermal inertia for passive heat storage.',
    hexColor: '#a77b5a',
  },
  {
    id: 'adobe_mud_brick',
    name: 'Traditional Sun-Dried Mud Brick (Adobe)',
    category: 'earth',
    density: 1650,
    specificHeat: 1000,
    thermalConductivity: 0.60,
    standardThicknessMm: 350,
    emissivity: 0.90,
    solarAbsorptance: 0.70,
    embodiedCarbonKgCO2ePerKg: 0.015,
    costIndexINRPerM3: 2800,
    sourceReference: 'IS 2110 / NBC 2016 Part 8 Sec 1',
    description: 'Unburnt clay mud block mixed with straw fiber. Excellent microclimatic moisture buffering and local availability in Ladakh.',
    hexColor: '#b88960',
  },
  {
    id: 'local_granite_stone',
    name: 'Leh Local Granite / Fieldstone Rubble',
    category: 'masonry',
    density: 2600,
    specificHeat: 820,
    thermalConductivity: 2.20,
    standardThicknessMm: 350,
    emissivity: 0.92,
    solarAbsorptance: 0.68,
    embodiedCarbonKgCO2ePerKg: 0.030,
    costIndexINRPerM3: 5500,
    sourceReference: 'ASHRAE Fundamentals Ch. 26 / IS 3792',
    description: 'Heavy structural stone with extreme volumetric thermal capacity ($2.13\\times 10^6\\text{ J}/(\\text{m}^3\\cdot\\text{K})$). Requires exterior insulation in winter.',
    hexColor: '#787673',
  },
  {
    id: 'fired_clay_brick',
    name: 'Standard Fired Clay Brick Masonry',
    category: 'masonry',
    density: 1800,
    specificHeat: 880,
    thermalConductivity: 0.81,
    standardThicknessMm: 230,
    emissivity: 0.90,
    solarAbsorptance: 0.70,
    embodiedCarbonKgCO2ePerKg: 0.220,
    costIndexINRPerM3: 6200,
    sourceReference: 'IS 1077 / IS 2212 Indian Standards',
    description: 'Conventional 9-inch brick wall in 1:6 cement mortar. High structural durability.',
    hexColor: '#a64b38',
  },
  {
    id: 'aac_autoclaved_block',
    name: 'Autoclaved Aerated Concrete (AAC) Block',
    category: 'concrete',
    density: 600,
    specificHeat: 1050,
    thermalConductivity: 0.16,
    standardThicknessMm: 200,
    emissivity: 0.88,
    solarAbsorptance: 0.55,
    embodiedCarbonKgCO2ePerKg: 0.320,
    costIndexINRPerM3: 5200,
    sourceReference: 'IS 2185 Part 3 / NBC India 2016',
    description: 'Lightweight cellular block providing both moderate structural support and inherent thermal insulation ($R=1.25\\text{ m}^2\\text{K}/\\text{W}$).',
    hexColor: '#c5c7c9',
  },
  {
    id: 'rcc_heavy_concrete',
    name: 'Reinforced Cement Concrete (RCC)',
    category: 'concrete',
    density: 2400,
    specificHeat: 960,
    thermalConductivity: 1.58,
    standardThicknessMm: 150,
    emissivity: 0.90,
    solarAbsorptance: 0.65,
    embodiedCarbonKgCO2ePerKg: 0.380,
    costIndexINRPerM3: 8500,
    sourceReference: 'IS 456 / SP 41 (S&T)',
    description: 'Structural slab or wall. High mass but low thermal resistance; acts as cold bridge unless insulated.',
    hexColor: '#8a8e91',
  },
  {
    id: 'timber_deodar_wood',
    name: 'Himalayan Deodar Timber Plank',
    category: 'timber',
    density: 560,
    specificHeat: 1600,
    thermalConductivity: 0.13,
    standardThicknessMm: 50,
    emissivity: 0.85,
    solarAbsorptance: 0.60,
    embodiedCarbonKgCO2ePerKg: -0.800, // Carbon sequestered
    costIndexINRPerM3: 38000,
    sourceReference: 'IS 399 / Forest Research Institute Dehradun',
    description: 'Natural mountain softwood with low thermal conductivity. Used for interior lining and floor deck.',
    hexColor: '#966336',
  },
  {
    id: 'bamboo_composite_board',
    name: 'Bamboo Composite Mat Board',
    category: 'timber',
    density: 720,
    specificHeat: 1400,
    thermalConductivity: 0.15,
    standardThicknessMm: 25,
    emissivity: 0.88,
    solarAbsorptance: 0.58,
    embodiedCarbonKgCO2ePerKg: -0.450,
    costIndexINRPerM3: 24000,
    sourceReference: 'IPIRTI / National Bamboo Mission',
    description: 'Rapidly renewable sustainable structural board with high tensile strength and favorable insulation value.',
    hexColor: '#c29a53',
  },

  // --- INSULATION MATERIALS ---
  {
    id: 'rockwool_mineral_slab',
    name: 'High-Density Rockwool Mineral Slab (100 kg/m³)',
    category: 'insulation',
    density: 100,
    specificHeat: 840,
    thermalConductivity: 0.035,
    standardThicknessMm: 100,
    emissivity: 0.90,
    solarAbsorptance: 0.30,
    embodiedCarbonKgCO2ePerKg: 1.20,
    costIndexINRPerM3: 9500,
    sourceReference: 'IS 8183 / ASTM C612 / High Altitude Engineering Spec',
    description: 'Non-combustible basalt stone fiber board. Essential for perimeter envelope in freezing Leh/Siachen conditions.',
    hexColor: '#b4a682',
  },
  {
    id: 'extruded_polystyrene_xps',
    name: 'Extruded Polystyrene (XPS) Rigid Foam',
    category: 'insulation',
    density: 35,
    specificHeat: 1450,
    thermalConductivity: 0.028,
    standardThicknessMm: 75,
    emissivity: 0.90,
    solarAbsorptance: 0.25,
    embodiedCarbonKgCO2ePerKg: 3.40,
    costIndexINRPerM3: 14000,
    sourceReference: 'ASTM C578 / DIN 4108',
    description: 'Closed-cell waterproof insulation with extreme resistance to moisture freeze-thaw degradation. Ideal for under-slab.',
    hexColor: '#53a8d6',
  },
  {
    id: 'expanded_polystyrene_eps',
    name: 'Expanded Polystyrene (EPS) Thermocol Board',
    category: 'insulation',
    density: 20,
    specificHeat: 1300,
    thermalConductivity: 0.038,
    standardThicknessMm: 100,
    emissivity: 0.90,
    solarAbsorptance: 0.20,
    embodiedCarbonKgCO2ePerKg: 2.80,
    costIndexINRPerM3: 4500,
    sourceReference: 'IS 4671 / NBC India',
    description: 'Economical rigid cellular plastic insulation for cavity walls and ceiling overlays.',
    hexColor: '#e8e8e8',
  },
  {
    id: 'polyurethane_puf_board',
    name: 'Polyurethane Foam (PUF) Rigid Core',
    category: 'insulation',
    density: 40,
    specificHeat: 1400,
    thermalConductivity: 0.022,
    standardThicknessMm: 80,
    emissivity: 0.90,
    solarAbsorptance: 0.30,
    embodiedCarbonKgCO2ePerKg: 4.50,
    costIndexINRPerM3: 16500,
    sourceReference: 'IS 12436 / Specialized Engineering Services',
    description: 'Ultra-low thermal conductivity foam ($k=0.022\\text{ W}/(\\text{m}\\cdot\\text{K})$). Used in modular prefabricated high-performance shelters.',
    hexColor: '#e0c879',
  },
  {
    id: 'sheep_wool_natural_batt',
    name: 'Ladakh Local Sheep Wool Insulation Batt',
    category: 'insulation',
    density: 25,
    specificHeat: 1800,
    thermalConductivity: 0.039,
    standardThicknessMm: 100,
    emissivity: 0.90,
    solarAbsorptance: 0.40,
    embodiedCarbonKgCO2ePerKg: 0.150,
    costIndexINRPerM3: 6000,
    sourceReference: 'Leh Alpine Field Research / Secmol Eco-Studies',
    description: 'Indigenous high-altitude wool batt naturally hygroscopic with excellent breathability and negative net carbon footprint.',
    hexColor: '#dfd7c2',
  },
  {
    id: 'aerogel_super_blanket',
    name: 'Silica Aerogel Thermal Super-Blanket',
    category: 'insulation',
    density: 150,
    specificHeat: 1000,
    thermalConductivity: 0.015,
    standardThicknessMm: 20,
    emissivity: 0.88,
    solarAbsorptance: 0.30,
    embodiedCarbonKgCO2ePerKg: 8.50,
    costIndexINRPerM3: 95000,
    sourceReference: 'ASTM C1728 / Aerospace Defence Materials',
    description: 'State-of-the-art nanostructured insulation achieving unprecedented $R=1.33\\text{ m}^2\\text{K}/\\text{W}$ at just 20mm thickness.',
    hexColor: '#3ea6b0',
  },

  // --- ROOFING MATERIALS ---
  {
    id: 'cgi_corrugated_metal_sheet',
    name: 'Corrugated Galvanized Iron (CGI) Sheet (0.6mm)',
    category: 'roofing',
    density: 7850,
    specificHeat: 480,
    thermalConductivity: 50.0,
    standardThicknessMm: 1,
    emissivity: 0.25,
    solarAbsorptance: 0.65,
    embodiedCarbonKgCO2ePerKg: 2.85,
    costIndexINRPerM3: 45000,
    sourceReference: 'IS 277 / CPWD Specifications',
    description: 'Common rapid construction metal roof. Extremely high thermal conductivity; unlivable in extreme cold without thick sub-deck insulation.',
    hexColor: '#9aa0a6',
  },
  {
    id: 'puf_sandwich_roof_panel',
    name: 'Prefab PUF Sandwich Panel (80mm Core + Steel Skins)',
    category: 'composite',
    density: 85,
    specificHeat: 1200,
    thermalConductivity: 0.024,
    standardThicknessMm: 80,
    emissivity: 0.85,
    solarAbsorptance: 0.40, // Cool roof coating
    embodiedCarbonKgCO2ePerKg: 3.80,
    costIndexINRPerM3: 18500,
    sourceReference: 'Prefab High Altitude Technical Standard',
    description: 'Complete integrated roof system delivering $U=0.28\\text{ W}/(\\text{m}^2\\cdot\\text{K})$ with high snow-load capacity.',
    hexColor: '#5c768d',
  },
  {
    id: 'slate_stone_shingle',
    name: 'Himalayan Slate Stone Tile Shingle',
    category: 'roofing',
    density: 2700,
    specificHeat: 760,
    thermalConductivity: 1.80,
    standardThicknessMm: 25,
    emissivity: 0.90,
    solarAbsorptance: 0.85,
    embodiedCarbonKgCO2ePerKg: 0.040,
    costIndexINRPerM3: 12000,
    sourceReference: 'IS 6250 / Traditional Mountain Architecture',
    description: 'Natural stone tile with dark solar absorption surface and excellent weather resistance.',
    hexColor: '#3f4448',
  },
  {
    id: 'mud_straw_thatch_composite',
    name: 'Traditional Straw-Clay Earth Roof (300mm)',
    category: 'earth',
    density: 1200,
    specificHeat: 1350,
    thermalConductivity: 0.35,
    standardThicknessMm: 300,
    emissivity: 0.92,
    solarAbsorptance: 0.72,
    embodiedCarbonKgCO2ePerKg: 0.020,
    costIndexINRPerM3: 1900,
    sourceReference: 'Ladakh Ecological Development Group (LEDeG)',
    description: 'Multi-layer poplar beam, willow twigs, dry grass, and compacted clay top seal with 14-hour thermal damping lag.',
    hexColor: '#8c704f',
  },

  // --- FLOORING MATERIALS ---
  {
    id: 'insulated_concrete_slab_on_grade',
    name: 'Concrete Slab with 75mm Under-Slab XPS Insulation',
    category: 'composite',
    density: 2200,
    specificHeat: 1000,
    thermalConductivity: 0.35,
    standardThicknessMm: 225,
    emissivity: 0.90,
    solarAbsorptance: 0.65,
    embodiedCarbonKgCO2ePerKg: 0.450,
    costIndexINRPerM3: 9800,
    sourceReference: 'NBC 2016 Part 8 / ASHRAE 90.1',
    description: 'Prevents permafrost ground heat drain while retaining indoor solar warmth in floor slab.',
    hexColor: '#6e777e',
  },
  {
    id: 'timber_plank_air_gap_floor',
    name: 'Deodar Wood Plank on Joists with Crawlspace Air Gap',
    category: 'timber',
    density: 500,
    specificHeat: 1500,
    thermalConductivity: 0.12,
    standardThicknessMm: 120,
    emissivity: 0.88,
    solarAbsorptance: 0.55,
    embodiedCarbonKgCO2ePerKg: -0.600,
    costIndexINRPerM3: 26000,
    sourceReference: 'IS 3792 / NBC 2016',
    description: 'Suspended wooden deck with warm tactile contact temperature ($b=400\\text{ J}/(\\text{m}^2\\cdot\\text{K}\\cdot\\text{s}^{0.5})$).',
    hexColor: '#a1784e',
  },
];

export const GLAZING_DATABASE: Record<GlazingType, {
  name: string;
  uValue: number; // W/(m2*K)
  shgc: number; // 0 to 1
  vlt: number; // Visible light transmittance
  costPerM2INR: number;
  description: string;
}> = {
  single_clear: {
    name: 'Single Clear Annealed Glass (4mm)',
    uValue: 5.70,
    shgc: 0.82,
    vlt: 0.88,
    costPerM2INR: 1200,
    description: 'Standard single pane. Severe condensation and high heat loss in cold zones.',
  },
  double_clear: {
    name: 'Double Glazed Unit (4mm Clear + 12mm Air + 4mm Clear)',
    uValue: 2.80,
    shgc: 0.72,
    vlt: 0.78,
    costPerM2INR: 3800,
    description: 'Standard sealed insulated glazing unit. Halves the conductive heat loss of single pane.',
  },
  double_low_e: {
    name: 'Double Glazed Unit with Low-E & Argon Gas (4mm + 16mm Ar + 4mm Low-E)',
    uValue: 1.40,
    shgc: 0.58,
    vlt: 0.74,
    costPerM2INR: 6500,
    description: 'Reflects long-wave interior infrared heat back indoors while admitting direct solar radiation. Highly recommended for Leh.',
  },
  triple_low_e: {
    name: 'Triple Glazed High-Performance Unit (2x Low-E + Krypton Gas)',
    uValue: 0.75,
    shgc: 0.50,
    vlt: 0.65,
    costPerM2INR: 12500,
    description: 'Extreme thermal barrier designed for Arctic and -30°C Himalayan high-altitude outpost shelters.',
  },
  polycarbonate: {
    name: 'Multiwall Polycarbonate Sheet (16mm Triple-Wall)',
    uValue: 2.30,
    shgc: 0.75,
    vlt: 0.72,
    costPerM2INR: 2200,
    description: 'Lightweight impact-resistant glazing frequently used for Trombe walls and attached passive solar greenhouses in Ladakh.',
  },
};

/**
 * Calculates overall assembly U-value, R-value and thermal mass for a multi-layered construction
 * R_total = R_si + sum(d_i / k_i) + R_se
 * U = 1 / R_total
 */
export function calculateAssemblyThermalProperties(
  layers: { materialId: string; thicknessMm: number }[],
  isVerticalWall: boolean = true
): { uValue: number; rValue: number; capacitancePerM2: number; timeLagHours: number } {
  // Surface film resistances according to ISO 6946 / ASHRAE
  const r_si = isVerticalWall ? 0.13 : 0.10; // Indoor surface resistance (m2*K/W)
  const r_se = 0.04; // Outdoor surface resistance (m2*K/W)

  let r_material_sum = 0;
  let total_capacitance = 0;
  let total_mass_density = 0;

  for (const layer of layers) {
    const mat = MATERIALS_DATABASE.find((m) => m.id === layer.materialId);
    if (!mat) continue;
    const thicknessM = layer.thicknessMm / 1000;
    const r_layer = thicknessM / Math.max(0.001, mat.thermalConductivity);
    r_material_sum += r_layer;

    // Volumetric heat capacity: rho * cp * thickness (J/(m2*K))
    const cap_layer = mat.density * mat.specificHeat * thicknessM;
    total_capacitance += cap_layer;
    total_mass_density += mat.density * thicknessM;
  }

  const r_total = r_si + r_material_sum + r_se;
  const u_value = 1 / Math.max(0.01, r_total);

  // Time lag empirical calculation based on Mackey & Wright dynamic heat transfer model:
  // phi ~ 1.38 * sqrt(sum(d_i * rho_i * cp_i / k_i)) / 3600
  const dynamicLagFactor = Math.sqrt(Math.max(0.1, total_capacitance * r_material_sum)) / 360;
  const timeLagHours = Math.min(24, Math.max(0.5, dynamicLagFactor));

  return {
    uValue: Number(u_value.toFixed(3)),
    rValue: Number(r_total.toFixed(3)),
    capacitancePerM2: Math.round(total_capacitance),
    timeLagHours: Number(timeLagHours.toFixed(1)),
  };
}

export function getMaterialById(id: string): Material {
  const found = MATERIALS_DATABASE.find((m) => m.id === id);
  if (!found) {
    return MATERIALS_DATABASE[0];
  }
  return found;
}
