'use client';

import React from 'react';

export default function LifeSupportSection({ activeAstronaut, crew = [], onSelectAstronaut }) {
  const suitPressure = activeAstronaut?.suitP ?? 4.3;
  const o2Primary = activeAstronaut?.o2 ?? 94;

  // Component-level hardware defaults
  const o2Secondary = 100;
  const co2Level = 0.18;
  const coreTemp = 37.1;
  const lcvgWaterTemp = 16.4;
  const batteryHours = 6.4;
  const radiationRate = 12.8;
  const powerBusVoltage = 28.4;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── Section Header ── */}
      <div className="section-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.25rem' }}>🧑‍🚀</span>
            <h2 className="font-orbitron" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              EVA LIFE SUPPORT TELEMETRY (PLSS / EMU-X)
            </h2>
            <span className="cyber-badge cyber-badge-emerald">SYSTEM NOMINAL</span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Portable Life Support System suit atmospheric loop, cryogenic oxygen management, thermal regulation, and power cell reserves.
          </p>
        </div>
      </div>

      {/* ── Subject Switcher Bar ── */}
      <div className="hud-panel" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ACTIVE SUIT TELEMETRY: </span>
            <strong style={{ fontSize: '0.92rem', color: '#fff' }}>{activeAstronaut?.name}</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '6px' }}>({activeAstronaut?.role})</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {crew.map((member) => {
              const isSelected = member.id === activeAstronaut?.id;
              return (
                <button
                  key={member.id}
                  onClick={() => onSelectAstronaut && onSelectAstronaut(member.id)}
                  className={`hud-btn ${isSelected ? 'hud-btn-primary' : ''}`}
                  style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                >
                  <strong>{member.initials}</strong> ({member.suitP} PSI)
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Grouped Subsystem Cards (3 Logical Systems) ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {/* System 1: Atmospheric & Oxygen Loop */}
        <div className="hud-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 className="font-orbitron" style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                1. ATMOSPHERIC PRESSURE &amp; OXYGEN LOOP
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Primary breathing atmosphere and metabolic $CO_2$ scrubbers
              </div>
            </div>
            <span className="cyber-badge cyber-badge-cyan">PLSS PRIMARY</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '18px' }} className="ls-group-grid">
            {/* Suit Pressure */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="font-ui" style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>SUIT PRESSURE</span>
                <span className="cyber-badge cyber-badge-cyan" style={{ fontSize: '0.65rem' }}>
                  {suitPressure <= 5.0 ? 'EVA 100% O₂' : '1 ATM CABIN'}
                </span>
              </div>
              <div className="font-orbitron" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--hud-cyan)' }}>
                {suitPressure.toFixed(1)} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>PSI</span>
              </div>
              <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '4px 0 10px 0' }}>
                Equivalent: {suitPressure <= 5.0 ? '29.6 kPa' : '101.3 kPa'}
              </div>
              <div className="telemetry-bar-bg">
                <div className="telemetry-bar-fill" style={{ width: `${Math.min(100, (suitPressure / 15) * 100)}%`, background: 'var(--hud-cyan)' }} />
              </div>
            </div>

            {/* O2 Storage */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="font-ui" style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CRYOGENIC O₂ STORAGE</span>
                <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--hud-emerald)' }}>~6.1 hrs EVA</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '4px 0 10px 0' }}>
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>PRIMARY TANK</div>
                  <div className="font-orbitron" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>
                    {o2Primary}%
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>SECONDARY SOP</div>
                  <div className="font-orbitron" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--hud-emerald)' }}>
                    {o2Secondary}%
                  </div>
                </div>
              </div>
              <div className="telemetry-bar-bg">
                <div className="telemetry-bar-fill" style={{ width: `${o2Primary}%`, background: 'var(--hud-emerald)' }} />
              </div>
            </div>

            {/* CO2 Scrubber */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="font-ui" style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CO₂ REMOVAL (LiOH)</span>
                <span className="cyber-badge cyber-badge-emerald" style={{ fontSize: '0.65rem' }}>EFFICIENT</span>
              </div>
              <div className="font-orbitron" style={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>
                {co2Level.toFixed(2)} <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>mmHg</span>
              </div>
              <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: '4px 0 10px 0' }}>
                Threshold Limit: &lt; 5.30 mmHg
              </div>
              <div className="telemetry-bar-bg">
                <div className="telemetry-bar-fill" style={{ width: `${(co2Level / 5.3) * 100}%`, background: 'var(--hud-emerald)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* System 2: Thermal & Liquid Cooling Loop */}
        <div className="hud-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 className="font-orbitron" style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                2. THERMAL REGULATION &amp; LIQUID COOLING (LCVG)
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Liquid cooling garment water loop and astronaut homeostatic balance
              </div>
            </div>
            <span className="cyber-badge cyber-badge-emerald">THERMAL STEADY</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }} className="ls-thermal-grid">
            {/* Core Body Temp */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '18px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="font-ui" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>CORE BODY TEMPERATURE</span>
                <span className="cyber-badge cyber-badge-emerald" style={{ fontSize: '0.65rem' }}>HOMEOSTATIC</span>
              </div>
              <div className="font-orbitron" style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--hud-emerald)' }}>
                {coreTemp.toFixed(1)} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>°C (98.8 °F)</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '6px 0 12px 0' }}>
                Subdermal telemetry pill • Target envelope: 36.5°C — 37.5°C
              </div>
              <div className="telemetry-bar-bg">
                <div className="telemetry-bar-fill" style={{ width: `${Math.min(100, Math.max(0, ((coreTemp - 35) / 4) * 100))}%`, background: 'var(--hud-emerald)' }} />
              </div>
            </div>

            {/* Coolant Loop */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '18px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="font-ui" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>LCVG COOLANT TEMPERATURE</span>
                <span className="cyber-badge cyber-badge-cyan" style={{ fontSize: '0.65rem' }}>ICE SUBLIMATOR ACTIVE</span>
              </div>
              <div className="font-orbitron" style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--hud-cyan)' }}>
                {lcvgWaterTemp.toFixed(1)} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>°C (61.5 °F)</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '6px 0 12px 0' }}>
                Closed-loop chilled water garment circulation (42 L/hr)
              </div>
              <div className="telemetry-bar-bg">
                <div className="telemetry-bar-fill" style={{ width: `${(lcvgWaterTemp / 25) * 100}%`, background: 'var(--hud-cyan)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* System 3: Power & Space Radiation Environment */}
        <div className="hud-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 className="font-orbitron" style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                3. POWER BUS &amp; RADIATION ENVIRONMENT
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                EMU power storage cells and ionizing particle flux dosimeters
              </div>
            </div>
            <span className="cyber-badge cyber-badge-cyan">ELECTRICAL STEADY</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }} className="ls-power-grid">
            {/* Battery */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '18px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="font-ui" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>BATTERY ENDURANCE</span>
                <span className="font-mono" style={{ fontSize: '0.72rem', color: '#fff' }}>Bus: {powerBusVoltage} VDC</span>
              </div>
              <div className="font-orbitron" style={{ fontSize: '2.2rem', fontWeight: 700, color: '#fff' }}>
                {batteryHours} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Hours Remaining</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '6px 0 12px 0' }}>
                Silver-Zinc cell pack • 82% rated state of charge
              </div>
              <div className="telemetry-bar-bg">
                <div className="telemetry-bar-fill" style={{ width: '82%', background: 'var(--hud-violet)' }} />
              </div>
            </div>

            {/* Radiation */}
            <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '18px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="font-ui" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600 }}>RADIATION FLUX RATE</span>
                <span className="cyber-badge cyber-badge-amber" style={{ fontSize: '0.65rem' }}>NOMINAL ORBITAL</span>
              </div>
              <div className="font-orbitron" style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--hud-amber)' }}>
                {radiationRate} <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>µSv/h</span>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: '6px 0 12px 0' }}>
                Cumulative mission exposure: 81.9 µSv (Permissible threshold: 500 µSv/day)
              </div>
              <div className="telemetry-bar-bg">
                <div className="telemetry-bar-fill" style={{ width: `${(radiationRate / 50) * 100}%`, background: 'var(--hud-amber)' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Architecture Note ── */}
      <div style={{
        padding: '14px 18px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '6px',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)',
        lineHeight: 1.5
      }}>
        <strong>Telemetry Architecture Note:</strong> Suit internal pressure ({suitPressure} PSI) and primary $O_2$ ({o2Primary}%) are dynamic records specific to {activeAstronaut?.name}. The cryogenic backup tanks, LiOH scrubbers, and coolant garters reflect standardized EMU-X hardware component specifications.
      </div>

      <style>{`
        @media (max-width: 900px) {
          .ls-group-grid { grid-template-columns: 1fr !important; }
          .ls-thermal-grid { grid-template-columns: 1fr !important; }
          .ls-power-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
