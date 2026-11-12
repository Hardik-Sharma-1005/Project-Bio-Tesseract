// Shared crew and alert data constants for Project Bio-Tesseract

export const INITIAL_CREW = [
  { id: 'AST-01', name: 'Cmdr. Sarah Vance', role: 'Mission Commander (EVA-1)', initials: 'SV', hr: 72, spo2: 98.4, bpSys: 118, bpDia: 76, suitP: 4.3, o2: 94, stress: 18, status: 'Nominal', respRate: 14 },
  { id: 'AST-02', name: 'Dr. Marcus Chen', role: 'Medical Specialist (EVA-2)', initials: 'MC', hr: 78, spo2: 99.0, bpSys: 122, bpDia: 80, suitP: 4.3, o2: 91, stress: 24, status: 'Nominal', respRate: 16 },
  { id: 'AST-03', name: 'Eng. Elena Rostova', role: 'Flight Engineer (Airlock)', initials: 'ER', hr: 68, spo2: 98.8, bpSys: 115, bpDia: 74, suitP: 14.7, o2: 98, stress: 15, status: 'Nominal', respRate: 13 },
  { id: 'AST-04', name: 'Pilot David Kalu', role: 'Command Pilot (Orbiter)', initials: 'DK', hr: 74, spo2: 98.2, bpSys: 120, bpDia: 78, suitP: 14.7, o2: 96, stress: 20, status: 'Nominal', respRate: 15 }
];

export const INITIAL_ALERTS = [
  { id: 'ALT-101', severity: 'NOMINAL', title: 'DSN Goldstone X-band lock confirmed', subsystem: 'Comms', time: '14:28:02', acknowledged: true },
  { id: 'ALT-102', severity: 'NOMINAL', title: 'EMU-X Suit telemetry sync complete', subsystem: 'PLSS', time: '14:27:40', acknowledged: true },
  { id: 'ALT-103', severity: 'CAUTION', title: 'Solar particle event flux elevation (low risk)', subsystem: 'Radiation', time: '14:25:15', acknowledged: false },
  { id: 'ALT-104', severity: 'NOMINAL', title: '4D Bio-Tesseract hypercube resonance calibrated', subsystem: 'Bio-Core', time: '14:20:00', acknowledged: true }
];
