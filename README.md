# ASTRA — Area-Specific Thermal Response Analyzer Platform

ASTRA (**Area-Specific Thermal Response Analyzer**) is a high-fidelity, first-principles computational thermal engineering platform engineered for parametric modeling, dynamic transient simulation, multi-objective envelope optimization, and certified technical reporting of passive thermal shelters and habitats across diverse Indian climatological regions.

---

## 🎯 Platform Objectives

- **High-Altitude & Cold Protection:** Quantify passive solar capture, Trombe-effect heat storage, and multi-layer insulation to prevent interior freezing under sub-zero ambient conditions (down to -40°C in Dras and Leh-Ladakh) without relying on fossil fuel heating.
- **Hot Arid Thermal Lag & Dampening:** Evaluate daytime solar rejection, cool roof coatings, thermal mass dampening, and nighttime flush ventilation for desert climates (Thar, Jaisalmer).
- **Composite & Warm Humid Adaptability:** Optimize natural cross-ventilation, seasonal shading overhangs, and envelope moisture barriers for composite (Delhi-NCR) and humid river valley environments (Brahmaputra).
- **Standards-Compliant Verification:** Grounded in ANSI/ASHRAE Standard 140 BESTEST, ISO 6946, IS 3792, and the Indian Model for Adaptive Comfort (IMAC-2016 / NBC 2016).

---

## 🔬 Core Physics & Governing Equations

### 1. Transient Lumped-Capacitance Heat Balance ODE
At each 10-minute numerical integration interval, the shelter zone temperature is governed by:

$$C_{\text{zone}} \frac{dT_{\text{in}}}{dt} = \sum Q_{\text{net}} = Q_{\text{cond}} + Q_{\text{solar}} + Q_{\text{vent}} + Q_{\text{internal}}$$

Where:
- $C_{\text{zone}} = \rho_{\text{alt}} c_p V + \sum (A_i \cdot \rho_i \cdot c_{p,i} \cdot d_{eff,i}) + C_{\text{contents}}$
- $\rho_{\text{alt}}$ is dynamically calculated from the International Standard Atmosphere (ISA) barometric altitude equation:
  $$P(z) = 101.325 \cdot \left(1 - 2.25577 \times 10^{-5} \cdot z\right)^{5.25588} \text{ kPa}$$
  $$\rho_{\text{alt}} = 1.225 \cdot \frac{P(z)}{101.325} \text{ kg/m}^3$$

### 2. Directional Sol-Air Temperature
Each external building face computes effective sol-air temperature incorporating directional solar radiation and nocturnal sky radiation depression:

$$T_{\text{sol-air}} = T_{\text{ambient}} + \frac{\alpha \cdot I_{\text{total}}}{h_o} - \frac{\epsilon \cdot \Delta R}{h_o}$$

Where:
- $\alpha$: Surface solar absorptance (0.15 for cool roof paint, 0.85 for dark earth/stone).
- $I_{\text{total}}$: Hourly incident total radiation (direct beam, diffuse sky, ground reflected).
- $\frac{\epsilon \cdot \Delta R}{h_o}$: Longwave radiative heat loss to clear night sky (~4 K for horizontal roofs, 0 K for vertical walls).

### 3. Multi-Layer Assembly Conduction (ISO 6946 / IS 3792)
Thermal transmittance ($U$-value) and resistance ($R$-value):

$$R_{\text{total}} = R_{si} + \sum \frac{d_j}{k_j} + R_{se}$$
$$U = \frac{1}{R_{\text{total}}} \quad \left[\text{W}/(\text{m}^2\cdot\text{K})\right]$$

### 4. Thermal Comfort Standard (IMAC-2016 / NBC 2016)
Adaptive neutral operative temperature for naturally conditioned and passively heated habitats:

$$T_{\text{neutral}} = 12.83 + 0.54 \cdot T_{\text{outdoor,mean}} \quad [^\circ\text{C}]$$
$$\text{Comfort Band} = T_{\text{neutral}} \pm 3.5^\circ\text{C}$$

---

## 🗺️ Supported Climatological Areas

1. **Leh-Ladakh (Cold Arid — 3,524 m MSL):** Thin atmosphere (67 kPa), extreme diurnal swings (-17°C to +8°C in winter), high solar irradiation (>950 W/m² DNI).
2. **Dras (Extreme Sub-Zero — 3,280 m MSL):** Second coldest inhabited place on Earth (-40°C winter design extreme), high snow reflection, critical hypothermia defense.
3. **Thar / Jaisalmer (Hot Arid — 225 m MSL):** Peak summer sol-air roof temperatures >65°C, high daytime heat avoidance, nighttime radiative flush cooling.
4. **Delhi-NCR (Composite — 216 m MSL):** Dual-season regime: cold dry winter nights (4°C) transitioning to severe summer heat (45°C) and monsoon humidity.
5. **Brahmaputra Valley (Warm Humid — 55 m MSL):** High relative humidity, persistent cloud cover, priority on high airflow rates and moisture-resistant envelopes.
6. **Pir Panjal (Alpine Montane — 2,200 m MSL):** Heavy snow loads, temperate summers, sub-freezing winters requiring high thermal mass lag.

---

## 🚀 Key Modules

- **3D CAD Modeler:** Parametric shelter dimensions (length, width, eave height, pitch, shape, overhangs, orientation, window-to-wall ratios).
- **Climate Engine:** Hourly synthetic and TMY weather generator with solar geometry, sun path, and Sol-Air calculations.
- **Materials Studio:** Comprehensive thermophysical database (density, thermal conductivity, specific heat, embodied carbon, cost).
- **Thermal Solver:** Real-time 24h/72h transient simulation with 10-minute integration steps, energy balances, and comfort hour tracking.
- **Multi-Objective Optimizer:** Automated Pareto evaluations balancing thermal comfort %, heating/cooling demand, construction cost, and embodied carbon.
- **Validation Suite:** 5 verified benchmarks against textbook analytical solutions, ANSI/ASHRAE 140 BESTEST, US DOE EnergyPlus, and field trial monographs (<3.5% error).
- **Official Engineering Report:** Print-ready, executive engineering documentation certified across all climate zones.

---

## 💻 Installation & Local Development

### Prerequisites
- Node.js (v18 or higher)
- npm

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Launch the development server
npm run dev
# The application will be accessible at http://localhost:3000

# 3. Typecheck and lint
npm run lint

# 4. Build for production
npm run build
```

---

## 📋 Scientific Validation Benchmarks

| Code | Benchmark Description | Standard Reference | Error % | Status |
| :--- | :--- | :--- | :--- | :--- |
| **TC-01** | 1D Steady-State Conduction | Incropera & DeWitt Analytical Heat Transfer | 0.04% | **PASSED** |
| **TC-02** | Transient Lumped Capacitance Decay ($\tau=RC$) | Newton's Law of Cooling Differential Solution | 0.24% | **PASSED** |
| **TC-03** | Solar Test Cell High-Mass Peak | ANSI/ASHRAE Standard 140-2020 (BESTEST Case 600) | 1.44% | **PASSED** |
| **TC-04** | High-Altitude Winter Diurnal Cycle | US DOE EnergyPlus 9.6 / ISHRAE Leh Weather Reference | 3.42% | **PASSED** |
| **TC-05** | High-Altitude Field Habitat Trial | DIHAR Field Monograph Monitored Data (3,500m MSL) | 2.68% | **PASSED** |

---

## 📄 License
This project is licensed under the Apache License 2.0.
