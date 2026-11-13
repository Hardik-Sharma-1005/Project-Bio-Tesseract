'use client';

import React from 'react';
import LiveEcgChart from './LiveEcgChart';

export default function BioMonitorSection({ activeAstronaut, crew = [], onSelectAstronaut }) {
  const hr = activeAstronaut?.hr || 72;
  const spo2 = activeAstronaut?.spo2 || 98.4;
  const bpSys = activeAstronaut?.bpSys || 118;
  const bpDia = activeAstronaut?.bpDia || 76;
  const respRate = activeAstronaut?.respRate || 14;
  const stress = activeAstronaut?.stress || 18;

  const map = Math.round((2 * bpDia + bpSys) / 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── Section Header ── */}
      <div className="section-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.25rem' }}>🫀</span>
            <h2 className="font-orbitron" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              CARDIOVASCULAR BIO-MONITOR &amp; ECG
            </h2>
            <span className="cyber-badge cyber-badge-amber">SIMULATED</span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Procedural ECG-style and PPG waveforms with simulated crew telemetry.
          </p>
        </div>
      </div>

      <div className="hud-panel" role="note" style={{ padding: '14px 18px', borderColor: 'rgba(245,158,11,.25)', background: 'rgba(245,158,11,.06)' }}>
        <strong style={{ color: 'var(--hud-amber)' }}>SIMULATION NOTICE</strong>
        <span style={{ color: 'var(--text-secondary)', marginLeft: '8px' }}>
          Heart rate and SpO₂ drift in the demonstration simulation; blood pressure, respiration and stress are demonstration inputs (stress rises in the anomaly simulation). Waveforms are procedural. ECG intervals, ST deviation, cardiac output and stroke volume below are fixed illustrative values, not measurements or clinical assessments.
        </span>
      </div>

      {/* ── Subject Switcher Strip ── */}
      <div className="hud-panel" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>MONITORED CREW MEMBER: </span>
            <strong style={{ fontSize: '0.92rem', color: '#fff' }}>{activeAstronaut?.name}</strong>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '6px' }}>({activeAstronaut?.role})</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {crew.map((member) => {
              const isSelected = member.id === activeAstronaut?.id;
              return (
                <button
                  key={member.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onSelectAstronaut && onSelectAstronaut(member.id)}
                  className={`hud-btn ${isSelected ? 'hud-btn-primary' : ''}`}
                  style={{ padding: '5px 12px', fontSize: '0.78rem' }}
                >
                  <strong>{member.initials}</strong> — {member.name.split(' ').slice(1).join(' ')}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Two-Column Layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '24px' }} className="biomonitor-grid">
        {/* Left Column: Primary ECG Chart and Big Vitals */}
        <div className="hud-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 className="font-orbitron" style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              CONTINUOUS CARDIAC WAVEFORM
            </h3>
            <span className="font-mono" style={{ fontSize: '0.76rem', color: 'var(--text-secondary)' }}>
              Procedural waveform • Display animation
            </span>
          </div>

          <LiveEcgChart
            heartRate={hr}
            spO2={spo2}
            bpSys={bpSys}
            bpDia={bpDia}
            respRate={respRate}
          />
        </div>

        {/* Right Column: Reference Intervals & Autonomic Data */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Card 1: Electrophysiological Intervals */}
          <div className="hud-panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h4 className="font-orbitron" style={{ fontSize: '0.9rem', color: 'var(--hud-cyan)', margin: 0 }}>
                ILLUSTRATIVE ECG INTERVALS
              </h4>
              <span className="cyber-badge cyber-badge-amber font-mono" style={{ fontSize: '0.65rem' }}>
                FIXED DEMO VALUES
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>QT / QTc Interval</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Illustrative interval example</div>
                </div>
                <div className="font-mono" style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>
                  392 / 418 <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ms</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>PR Interval</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Illustrative conduction interval</div>
                </div>
                <div className="font-mono" style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>
                  158 <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ms</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>QRS Duration</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Illustrative QRS duration</div>
                </div>
                <div className="font-mono" style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>
                  86 <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>ms</span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                <div>
                  <div style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 600 }}>ST-Segment Deviation</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Illustrative segment value</div>
                </div>
                <div className="font-mono" style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  +0.02 <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>mV</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Hemodynamic Outputs */}
          <div className="hud-panel" style={{ padding: '22px' }}>
            <h4 className="font-orbitron" style={{ fontSize: '0.9rem', color: 'var(--hud-emerald)', margin: '0 0 14px 0' }}>
              HEMODYNAMIC PARAMETERS
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="metric-card">
              <span className="label">Cardiac Output · illustrative</span>
                <span className="value font-orbitron" style={{ color: 'var(--hud-cyan)' }}>
                  5.4 <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>L/min</span>
                </span>
              </div>

              <div className="metric-card">
              <span className="label">Stroke Volume · illustrative</span>
                <span className="value font-orbitron">
                  75 <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>mL</span>
                </span>
              </div>

              <div className="metric-card">
              <span className="label">Mean Arterial · derived demo</span>
                <span className="value font-orbitron" style={{ color: 'var(--hud-violet)' }}>
                  {map} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>mmHg</span>
                </span>
              </div>

              <div className="metric-card">
              <span className="label">Pulse Pressure · derived demo</span>
                <span className="value font-orbitron" style={{ color: 'var(--hud-amber)' }}>
                  {bpSys - bpDia} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>mmHg</span>
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Autonomic Balance */}
          <div className="hud-panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h4 className="font-orbitron" style={{ fontSize: '0.88rem', color: 'var(--text-primary)', margin: 0 }}>
                AUTONOMIC TONE BALANCE
              </h4>
              <span className="font-mono" style={{ fontSize: '0.75rem', color: stress > 50 ? 'var(--hud-crimson)' : 'var(--hud-emerald)' }}>
                Stress Flux: {stress}%
              </span>
            </div>

            <div style={{ margin: '10px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                <span>Parasympathetic (Vagal)</span>
                <span>Sympathetic</span>
              </div>
              <div className="telemetry-bar-bg" style={{ height: '7px' }}>
                <div
                  className="telemetry-bar-fill"
                  style={{
                    width: `${Math.min(100, Math.max(10, 100 - stress))}%`,
                    background: stress > 50 ? 'var(--hud-crimson)' : 'var(--hud-emerald)'
                  }}
                />
              </div>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5, margin: '8px 0 0 0' }}>
                Stress index is an illustrative simulation input. No autonomic or baroreflex assessment is performed.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1080px) {
          .biomonitor-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
