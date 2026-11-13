// Parameter and Organ Registry
// System is structured for easy addition of future vitals, thresholds, and organ mappings.

export const ORGANS = [
  { id: "brain", name: "Brain" },
  { id: "lungs", name: "Lungs" },
  { id: "heart", name: "Heart" },
  { id: "liver", name: "Liver" },
  { id: "stomach", name: "Stomach" },
  { id: "kidneys", name: "Kidneys" }
];

export const VITAL_PARAMETERS = [
  {
    id: "heart_rate",
    name: "Heart Rate",
    unit: "bpm",
    organ: "heart",
    hasGraph: true,
    description: "Cardiac depolarization frequency per minute",
    thresholds: {
      normal: [60, 95],
      lowCritical: 40,
      lowWarning: 55,
      highWarning: 100,
      highCritical: 130
    }
  },
  {
    id: "spo2",
    name: "Blood Oxygen Saturation (SpO₂)",
    unit: "%",
    organ: "lungs",
    hasGraph: true,
    description: "Peripheral capillary oxygen saturation",
    thresholds: {
      normal: [95, 100],
      lowCritical: 88,
      lowWarning: 93,
      highWarning: 100,
      highCritical: 101
    }
  },
  {
    id: "breathing_rate",
    name: "Breathing Rate",
    unit: "breaths/min",
    organ: "lungs",
    hasGraph: true,
    description: "Respiratory cycles per minute",
    thresholds: {
      normal: [12, 18],
      lowCritical: 8,
      lowWarning: 12,
      highWarning: 20,
      highCritical: 28
    }
  },
  {
    id: "bp_systolic",
    name: "Systolic Blood Pressure",
    unit: "mmHg",
    organ: "heart",
    hasGraph: true,
    description: "Peak arterial pressure during cardiac contraction",
    thresholds: {
      normal: [110, 130],
      lowCritical: 80,
      lowWarning: 100,
      highWarning: 140,
      highCritical: 160
    }
  },
  {
    id: "bp_diastolic",
    name: "Diastolic Blood Pressure",
    unit: "mmHg",
    organ: "heart",
    hasGraph: true,
    description: "Resting arterial pressure between heartbeats",
    thresholds: {
      normal: [70, 85],
      lowCritical: 50,
      lowWarning: 60,
      highWarning: 90,
      highCritical: 105
    }
  },
  {
    id: "core_temp",
    name: "Core Body Temperature",
    unit: "°C",
    organ: "liver",
    hasGraph: true,
    description: "Internal metabolic core thermal equilibrium",
    thresholds: {
      normal: [36.5, 37.4],
      lowCritical: 35.0,
      lowWarning: 36.0,
      highWarning: 38.0,
      highCritical: 39.5
    }
  },
  {
    id: "brain_activity",
    name: "Neuro-Cognitive Activity (EEG)",
    unit: "Hz",
    organ: "brain",
    hasGraph: true,
    description: "Cortical alpha/beta bio-electric resonance frequency",
    thresholds: {
      normal: [12, 28],
      lowCritical: 4,
      lowWarning: 8,
      highWarning: 35,
      highCritical: 45
    }
  },
  {
    id: "metabolic_rate",
    name: "Metabolic Caloric Index",
    unit: "kcal/h",
    organ: "stomach",
    hasGraph: true,
    description: "Active metabolic energy consumption rate",
    thresholds: {
      normal: [85, 140],
      lowCritical: 50,
      lowWarning: 70,
      highWarning: 180,
      highCritical: 220
    }
  },
  {
    id: "hydration_kidney",
    name: "Renal Filtration & Hydration",
    unit: "%",
    organ: "kidneys",
    hasGraph: true,
    description: "Kidney glomerular filtration and hydration balance",
    thresholds: {
      normal: [90, 100],
      lowCritical: 70,
      lowWarning: 85,
      highWarning: 100,
      highCritical: 102
    }
  }
];

export const ENVIRONMENTAL_PARAMETERS = [
  { id: "cabin_pressure_kpa", name: "Cabin Pressure", unit: "kPa", defaultVal: 101.3 },
  { id: "o2_percent", name: "Oxygen Concentration (O₂)", unit: "%", defaultVal: 20.9 },
  { id: "co2_percent", name: "Carbon Dioxide (CO₂)", unit: "%", defaultVal: 0.04 },
  { id: "cabin_temp_c", name: "Cabin Temperature", unit: "°C", defaultVal: 21.5 },
  { id: "humidity_percent", name: "Relative Humidity", unit: "%", defaultVal: 45.0 },
  { id: "co2", name: "Carbon Dioxide (CO₂ Trace)", unit: "ppm", defaultVal: 400 },
  { id: "co", name: "Carbon Monoxide (CO)", unit: "ppm", defaultVal: 0.8 },
  { id: "gamma_cosmic_radiation", name: "Cosmic Ionizing Radiation", unit: "µSv/h", defaultVal: 12.4 },
  { id: "acoustic_noise", name: "Acoustic Habitat Noise", unit: "dBA", defaultVal: 54.2 },
  { id: "air_ionization", name: "Air Ionization", unit: "ions/cm³", defaultVal: 820 },
  { id: "ambient_pressure", name: "Suit Atmospheric Delta", unit: "kPa", defaultVal: 29.6 }
];

// Threshold Evaluation Helper
export function evaluateVitalStatus(value, thresholds) {
  if (value === null || value === undefined || isNaN(value)) {
    return "NO_DATA";
  }
  if (!thresholds) {
    return "NORMAL";
  }
  if (thresholds.lowCritical !== undefined && value < thresholds.lowCritical) {
    return "CRITICAL";
  }
  if (thresholds.lowWarning !== undefined && value < thresholds.lowWarning) {
    return "WARNING";
  }
  if (thresholds.highCritical !== undefined && value > thresholds.highCritical) {
    return "CRITICAL";
  }
  if (thresholds.highWarning !== undefined && value > thresholds.highWarning) {
    return "WARNING";
  }
  return "NORMAL";
}
