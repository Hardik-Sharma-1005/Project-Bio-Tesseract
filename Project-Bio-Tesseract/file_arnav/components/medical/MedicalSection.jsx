'use client';

import React, { useState } from 'react';

export default function MedicalSection({ activeAstronaut, crew = [], onSelectAstronaut }) {
  const [activeProtocol, setActiveProtocol] = useState(null);
  const [simulatingDiagnosis, setSimulatingDiagnosis] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanHistory, setScanHistory] = useState([
    {
      id: 'SCAN-101',
      time: '14:20:10',
      subject: 'Cmdr. Sarah Vance',
      status: 'STABLE ADAPTATION',
      hr: 72,
      stress: 18,
      notes: 'All autonomic nervous system markers indicate optimal physiological adaptation to microgravity.'
    }
  ]);

  const hr = activeAstronaut?.hr || 72;
  const stress = activeAstronaut?.stress || 18;
  const spo2 = activeAstronaut?.spo2 || 98.4;
  const name = activeAstronaut?.name || 'Cmdr. Sarah Vance';

  const runDiagnosticScan = () => {
    if (simulatingDiagnosis) return;
    setSimulatingDiagnosis(true);
    setScanProgress(20);

    setTimeout(() => setScanProgress(60), 400);
    setTimeout(() => setScanProgress(90), 900);
    setTimeout(() => {
      setScanProgress(100);
      setSimulatingDiagnosis(false);
      setScanHistory(prev => [
        {
          id: `SCAN-${Date.now().toString().slice(-3)}`,
          time: new Date().toTimeString().slice(0, 8),
          subject: name,
          status: stress > 50 ? 'ELEVATED METABOLIC LOAD' : 'STABLE ADAPTATION',
          hr,
          stress,
          notes: stress > 50
            ? 'Tachycardia and elevated sympathetic tone detected. Recommend hydration protocol and metabolic monitoring.'
            : 'Cardiac output, blood oxygenation, and hemodynamic stability remain within acceptable EVA mission thresholds.'
        },
        ...prev.slice(0, 4)
      ]);
    }, 1400);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── Section Header ── */}
      <div className="section-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.25rem' }}>🧠</span>
            <h2 className="font-orbitron" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              AI BIO-DIAGNOSTIC ADVISOR
            </h2>
            <span className="cyber-badge cyber-badge-cyan">NEURAL ASSISTANT</span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Simulated clinical decision support evaluating physiological adaptation, decompression risks, and spaceflight medical countermeasures.
          </p>
        </div>
      </div>

      {/* ── Subject Switcher Bar ── */}
      <div className="hud-panel" style={{ padding: '14px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>EVALUATION SUBJECT: </span>
            <strong style={{ fontSize: '0.92rem', color: '#fff' }}>{name}</strong>
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
                  <strong>{member.initials}</strong> — {member.name.split(' ').slice(1).join(' ')}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Main Two-Column Layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '24px' }} className="med-section-grid">
        {/* Left Column: Assessment, Risk Indices & Protocol Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Diagnostic Assessment Panel */}
          <div className="hud-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 className="font-orbitron" style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                  PHYSIOLOGICAL SYNTHESIS REPORT
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Evaluated at: 14:28 UTC • Subject: {name}
                </div>
              </div>

              <button
                onClick={runDiagnosticScan}
                disabled={simulatingDiagnosis}
                className="hud-btn hud-btn-emerald"
                style={{ padding: '6px 14px', fontSize: '0.8rem' }}
              >
                {simulatingDiagnosis ? `🔄 Analyzing Sensors (${scanProgress}%)...` : '⚡ Run Neural Scan'}
              </button>
            </div>

            {/* Scanning Progress Bar */}
            {simulatingDiagnosis && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--hud-cyan)', marginBottom: '4px' }}>
                  <span>Synthesizing continuous bio-telemetry stream...</span>
                  <span className="font-mono">{scanProgress}%</span>
                </div>
                <div className="telemetry-bar-bg" style={{ height: '6px' }}>
                  <div className="telemetry-bar-fill" style={{ width: `${scanProgress}%`, background: 'var(--hud-cyan)' }} />
                </div>
              </div>
            )}

            {/* Assessment Narrative */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '18px 20px',
              marginBottom: '20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span className="font-orbitron" style={{ fontSize: '0.88rem', color: 'var(--hud-cyan)' }}>
                  CLINICAL SYNTHESIS
                </span>
                <span className={`cyber-badge ${stress > 50 ? 'cyber-badge-crimson' : 'cyber-badge-emerald'}`}>
                  {stress > 50 ? 'ELEVATED METABOLIC LOAD' : 'STABLE HOMEOSTASIS'}
                </span>
              </div>

              <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
                {simulatingDiagnosis ? (
                  <span style={{ color: 'var(--hud-cyan)' }}>
                    Aggregating PPG waveform morphology, Galvanic Skin Response (GSR), suit atmospheric pressure, and core telemetry...
                  </span>
                ) : stress > 50 ? (
                  `Cardiovascular frequency is elevated at ${hr} BPM with sympathetic stress response (+${stress}%). Hemodynamic stability remains intact but metabolic load is elevated. Recommend initiating the hydration protocol.`
                ) : (
                  `All autonomic nervous system markers indicate optimal physiological adaptation to microgravity. Cardiac output and hemodynamic stability remain within acceptable EVA mission thresholds.`
                )}
              </p>
            </div>

            {/* 3 Key Risk Indicators */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }} className="med-risk-row">
              <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '14px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>DECOMPRESSION SICKNESS</div>
                <div className="font-orbitron" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--hud-emerald)', margin: '4px 0' }}>
                  0.02%
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Low Risk • Pre-breathe nominal</div>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '14px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>ACUTE HYPOXIA RISK</div>
                <div className="font-orbitron" style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--hud-emerald)', margin: '4px 0' }}>
                  0.00%
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Nil Risk • SpO₂ {spo2}%</div>
              </div>

              <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '14px', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', fontWeight: 600 }}>COGNITIVE WORKLOAD</div>
                <div className="font-orbitron" style={{ fontSize: '1.4rem', fontWeight: 700, color: stress > 50 ? 'var(--hud-crimson)' : 'var(--hud-cyan)', margin: '4px 0' }}>
                  {stress}%
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {stress > 50 ? 'Elevated Fatigue' : 'Nominal Workload'}
                </div>
              </div>
            </div>
          </div>

          {/* Meaningful Protocol Countermeasures */}
          <div className="hud-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h3 className="font-orbitron" style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                  RECOMMENDED MEDICAL COUNTERMEASURES
                </h3>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  Dispatch simulated life support and hydration protocols
                </div>
              </div>

              <span className="cyber-badge cyber-badge-cyan">SIMULATED ACTIONS</span>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
              <button
                onClick={() => setActiveProtocol('hydration')}
                className={`hud-btn ${activeProtocol === 'hydration' ? 'hud-btn-primary' : ''}`}
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
              >
                💧 Hydration Pack Dispense
              </button>

              <button
                onClick={() => setActiveProtocol('thermal')}
                className={`hud-btn ${activeProtocol === 'thermal' ? 'hud-btn-primary' : ''}`}
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
              >
                ❄️ LCVG Temp Regulate (+0.5°C)
              </button>

              <button
                onClick={() => setActiveProtocol('oxygen')}
                className={`hud-btn ${activeProtocol === 'oxygen' ? 'hud-btn-primary' : ''}`}
                style={{ padding: '8px 16px', fontSize: '0.82rem' }}
              >
                💨 100% Pre-Breathe Flush
              </button>
            </div>

            {activeProtocol && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(56, 189, 248, 0.08)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: '6px',
                fontSize: '0.82rem',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span className="status-dot nominal" />
                <span>
                  ✓ Simulated protocol <strong>{activeProtocol.toUpperCase()}</strong> command transmitted to EMU-X Life Support Controller.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Scan History & Operational Disclaimer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Scan History */}
          <div className="hud-panel" style={{ padding: '22px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 className="font-orbitron" style={{ fontSize: '0.9rem', color: '#fff', margin: 0 }}>
                DIAGNOSTIC HISTORY
              </h4>
              <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                {scanHistory.length} Recorded
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {scanHistory.map((scan) => (
                <div
                  key={scan.id}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '12px 14px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--hud-cyan)' }}>
                      {scan.id} • {scan.time}
                    </span>
                    <span className="cyber-badge cyber-badge-emerald" style={{ fontSize: '0.62rem' }}>
                      {scan.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#fff' }}>
                    {scan.subject}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '2px 0 6px 0' }}>
                    HR: {scan.hr} BPM • Stress: {scan.stress}%
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {scan.notes}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operational Disclaimer */}
          <div style={{
            padding: '16px 18px',
            background: 'rgba(245, 158, 11, 0.06)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            borderRadius: '6px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1rem' }}>⚠️</span>
              <strong style={{ fontSize: '0.82rem', color: 'var(--hud-amber)' }}>
                SIMULATION NOTICE
              </strong>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              The AI Bio-Diagnostic Advisor is a mission simulation co-pilot for operational demonstration. It does not perform actual medical diagnosis or communicate with physical hardware.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1080px) {
          .med-section-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 640px) {
          .med-risk-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
