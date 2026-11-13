'use client';

import React, { useRef, useEffect } from 'react';

export default function OverviewSection({
  crew = [],
  activeAstronaut,
  alerts = [],
  onAcknowledge,
  onSelectAstronaut,
  isAlarmActive,
  onToggleAlarm,
  onNavigate
}) {
  const canvasRef = useRef(null);

  const hr = activeAstronaut?.hr || 72;
  const spo2 = activeAstronaut?.spo2 || 98.4;
  const bpSys = activeAstronaut?.bpSys || 118;
  const bpDia = activeAstronaut?.bpDia || 76;
  const suitP = activeAstronaut?.suitP || 4.3;
  const o2 = activeAstronaut?.o2 || 94;
  const respRate = activeAstronaut?.respRate || 14;
  const stress = activeAstronaut?.stress || 18;

  // Real-time mini ECG canvas preview
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    let currentX = 0;
    const points = new Array(width).fill(height / 2);
    let animationId;
    const startTime = performance.now();

    const getEcgSample = (t) => {
      const period = 60 / Math.max(40, hr);
      const normalizedTime = (t % period) / period;
      let sample = 0;

      if (normalizedTime > 0.1 && normalizedTime < 0.2) {
        sample = Math.sin(((normalizedTime - 0.1) / 0.1) * Math.PI) * 10;
      } else if (normalizedTime >= 0.22 && normalizedTime < 0.25) {
        sample = -8;
      } else if (normalizedTime >= 0.25 && normalizedTime < 0.28) {
        sample = Math.sin(((normalizedTime - 0.25) / 0.03) * Math.PI) * 58;
      } else if (normalizedTime >= 0.28 && normalizedTime < 0.31) {
        sample = -16;
      } else if (normalizedTime >= 0.42 && normalizedTime < 0.6) {
        sample = Math.sin(((normalizedTime - 0.42) / 0.18) * Math.PI) * 16;
      }
      return sample + (Math.random() - 0.5) * 1.5;
    };

    const render = () => {
      const now = performance.now();
      const elapsed = (now - startTime) / 1000;
      const rawEcg = getEcgSample(elapsed);
      const yVal = height / 2 - rawEcg;

      for (let i = 0; i < 3; i++) {
        points[currentX] = yVal;
        currentX = (currentX + 1) % width;
      }

      ctx.fillStyle = '#080d1a';
      ctx.fillRect(0, 0, width, height);

      // Subtle horizontal baseline
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      // Waveform trace
      ctx.beginPath();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';

      for (let x = 0; x < width; x++) {
        if (Math.abs(x - currentX) < 10) continue;
        if (x === 0 || Math.abs(x - currentX) === 10) {
          ctx.moveTo(x, points[x]);
        } else {
          ctx.lineTo(x, points[x]);
        }
      }
      ctx.stroke();

      // Sweep head dot
      ctx.beginPath();
      ctx.arc(currentX, points[currentX], 3.5, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [hr]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* ── A. MISSION STATUS BAR ── */}
      <div className="hud-panel" style={{
        padding: '16px 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <span className="cyber-badge cyber-badge-cyan">MISSION STATUS: NOMINAL</span>
          <span style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            ARTEMIS-BIO-VII • STAGE 03/06 (EXTERNAL HULL INSPECTION &amp; TELEMETRY SYNC)
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className={`status-dot ${isAlarmActive ? 'critical' : 'nominal'}`} />
            <span className="font-mono" style={{ fontSize: '0.8rem', color: isAlarmActive ? 'var(--hud-crimson)' : 'var(--hud-emerald)' }}>
              {isAlarmActive ? 'ALERT FLAGGED' : 'ALL SYSTEMS NOMINAL'}
            </span>
          </div>

          <button
            onClick={() => onToggleAlarm && onToggleAlarm()}
            className={isAlarmActive ? 'hud-btn-danger' : 'hud-btn'}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            {isAlarmActive ? '⚠️ CLEAR ALARM' : '🚨 SIM ANOMALY'}
          </button>
        </div>
      </div>

      {/* ── B. FOUR ASTRONAUT SUMMARY CARDS ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h2 className="font-orbitron" style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            CREW TELEMETRY OVERVIEW
          </h2>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Select an astronaut to switch dashboard context
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px'
        }} className="overview-crew-grid">
          {crew.map((member) => {
            const isSelected = member.id === activeAstronaut?.id;
            const isWarning = member.status === 'Warning';
            return (
              <div
                key={member.id}
                onClick={() => onSelectAstronaut && onSelectAstronaut(member.id)}
                className="hud-panel"
                style={{
                  padding: '18px 20px',
                  cursor: 'pointer',
                  border: isSelected
                    ? '1px solid var(--hud-cyan)'
                    : isWarning
                    ? '1px solid rgba(239, 68, 68, 0.4)'
                    : '1px solid var(--border-subtle)',
                  background: isSelected
                    ? 'rgba(56, 189, 248, 0.08)'
                    : 'var(--bg-surface)',
                  transition: 'all 0.18s ease',
                  position: 'relative'
                }}
              >
                {/* Top: Avatar, Name, Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${isSelected ? 'var(--hud-cyan)' : 'var(--border-subtle)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-hud)',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      color: isSelected ? 'var(--hud-cyan)' : '#ffffff',
                    }}>
                      {member.initials}
                    </div>

                    <div>
                      <div className="font-orbitron" style={{ fontSize: '0.88rem', fontWeight: 700, color: '#ffffff' }}>
                        {member.name.split(' ').slice(1).join(' ')}
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {member.id} • {member.role.split('(')[0].trim()}
                      </div>
                    </div>
                  </div>

                  <span className={`status-dot ${isWarning ? 'warning' : 'nominal'}`} />
                </div>

                {/* Vitals: Clean and spacious (HR and SpO2 only!) */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  marginTop: '10px'
                }}>
                  <div>
                    <div className="font-ui" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      Heart Rate
                    </div>
                    <div className="font-orbitron" style={{ fontSize: '1.25rem', fontWeight: 700, color: member.hr > 100 ? 'var(--hud-crimson)' : 'var(--hud-emerald)' }}>
                      {member.hr} <span style={{ fontSize: '0.72rem', fontWeight: 500, color: 'var(--text-muted)' }}>BPM</span>
                    </div>
                  </div>

                  <div style={{ width: '1px', height: '28px', background: 'rgba(255, 255, 255, 0.08)' }} />

                  <div style={{ textAlign: 'right' }}>
                    <div className="font-ui" style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                      Blood O₂
                    </div>
                    <div className="font-orbitron" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--hud-cyan)' }}>
                      {member.spo2}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── C. MAIN MONITORING AREA ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: '24px' }} className="overview-main-grid">
        {/* Left Column: Selected Astronaut Bio-Metrics & ECG Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Card 1: Prominent Biometrics */}
          <div className="hud-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <span className="font-mono" style={{ fontSize: '0.74rem', color: 'var(--hud-cyan)', letterSpacing: '0.05em' }}>
                  ACTIVE SUBJECT TELEMETRY
                </span>
                <h3 className="font-orbitron" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: '4px 0 0 0' }}>
                  {activeAstronaut?.name}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {activeAstronaut?.role}
                </div>
              </div>

              <span className={`cyber-badge ${activeAstronaut?.status === 'Warning' ? 'cyber-badge-crimson' : 'cyber-badge-emerald'}`}>
                {activeAstronaut?.status.toUpperCase()}
              </span>
            </div>

            {/* 4 Essential Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }} className="overview-metrics-grid">
              <div className="metric-card">
                <span className="label">Heart Rate</span>
                <span className="value font-orbitron" style={{ color: hr > 100 ? 'var(--hud-crimson)' : 'var(--hud-emerald)' }}>
                  {hr} <span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)' }}>BPM</span>
                </span>
              </div>

              <div className="metric-card">
                <span className="label">Blood O₂ (SpO₂)</span>
                <span className="value font-orbitron" style={{ color: 'var(--hud-cyan)' }}>
                  {spo2}%
                </span>
              </div>

              <div className="metric-card">
                <span className="label">Blood Pressure</span>
                <span className="value font-orbitron" style={{ color: 'var(--hud-violet)' }}>
                  {bpSys}/{bpDia} <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-muted)' }}>mmHg</span>
                </span>
              </div>

              <div className="metric-card">
                <span className="label">Respiration</span>
                <span className="value font-orbitron" style={{ color: 'var(--hud-amber)' }}>
                  {respRate} <span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)' }}>BrPM</span>
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Readable ECG Waveform Preview */}
          <div className="hud-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.1rem' }}>🫀</span>
                <h4 className="font-orbitron" style={{ fontSize: '0.92rem', color: '#fff', margin: 0 }}>
                  LIVE CARDIAC TRACE (LEAD-II PREVIEW)
                </h4>
              </div>

              <button
                onClick={() => onNavigate && onNavigate('biomonitor')}
                className="hud-btn hud-btn-primary"
                style={{ padding: '4px 12px', fontSize: '0.75rem' }}
              >
                Full Bio-Monitor →
              </button>
            </div>

            <div style={{
              borderRadius: '6px',
              overflow: 'hidden',
              border: '1px solid var(--border-subtle)',
              height: '180px',
              background: '#080d1a'
            }}>
              <canvas
                ref={canvasRef}
                width={700}
                height={180}
                style={{ width: '100%', height: '100%', display: 'block' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              <span>25 mm/s • Normal Sinus Rhythm</span>
              <span>Procedural physiological simulation</span>
            </div>
          </div>
        </div>

        {/* Right Column: Subsystems and AI Advisor */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Card 3: Life Support Overview */}
          <div className="hud-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 className="font-orbitron" style={{ fontSize: '0.9rem', color: '#fff', margin: 0 }}>
                EVA LIFE SUPPORT (PLSS)
              </h4>
              <button
                onClick={() => onNavigate && onNavigate('lifesupport')}
                className="hud-btn"
                style={{ padding: '4px 10px', fontSize: '0.72rem' }}
              >
                Details →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Suit Pressure</span>
                  <span className="font-mono" style={{ color: 'var(--hud-cyan)', fontWeight: 600 }}>{suitP} PSI</span>
                </div>
                <div className="telemetry-bar-bg">
                  <div className="telemetry-bar-fill" style={{ width: `${(suitP / 15) * 100}%`, background: 'var(--hud-cyan)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>Primary O₂ Tank</span>
                  <span className="font-mono" style={{ color: 'var(--hud-emerald)', fontWeight: 600 }}>{o2}% (~6.1h)</span>
                </div>
                <div className="telemetry-bar-bg">
                  <div className="telemetry-bar-fill" style={{ width: `${o2}%`, background: 'var(--hud-emerald)' }} />
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-secondary)' }}>CO₂ Scrubber Level</span>
                  <span className="font-mono" style={{ color: '#ffffff', fontWeight: 600 }}>0.18 mmHg</span>
                </div>
                <div className="telemetry-bar-bg">
                  <div className="telemetry-bar-fill" style={{ width: '15%', background: 'var(--hud-violet)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: AI Medical Advisor Preview */}
          <div className="hud-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1rem' }}>🧠</span>
                <h4 className="font-orbitron" style={{ fontSize: '0.9rem', color: '#fff', margin: 0 }}>
                  AI MEDICAL ADVISOR
                </h4>
              </div>
              <span className={`cyber-badge ${stress > 50 ? 'cyber-badge-amber' : 'cyber-badge-emerald'}`}>
                {stress > 50 ? 'METABOLIC SPIKE' : 'STABLE'}
              </span>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-primary)', lineHeight: 1.5, margin: '0 0 14px 0' }}>
              {stress > 50
                ? `Cardiac rate and sympathetic tone elevated for ${activeAstronaut?.name}. Recommend hydration protocol.`
                : `Autonomic regulation is optimal for ${activeAstronaut?.name}. Decompression sickness risk is 0.02% (nominal).`}
            </p>

            <button
              onClick={() => onNavigate && onNavigate('medical')}
              className="hud-btn hud-btn-primary"
              style={{ width: '100%', fontSize: '0.78rem', padding: '8px 12px' }}
            >
              Open AI Medical Advisor →
            </button>
          </div>

        </div>
      </div>

      {/* ── D. RECENT MISSION ALERTS LOG ── */}
      <div className="hud-panel" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 className="font-orbitron" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              MISSION EVENT &amp; TELEMETRY LOG
            </h3>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
              Recent subsystem events and anomaly alerts
            </span>
          </div>

          <button
            onClick={() => onNavigate && onNavigate('crew')}
            className="hud-btn"
            style={{ padding: '5px 12px', fontSize: '0.75rem' }}
          >
            View All Events ({alerts.length}) →
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {alerts.slice(0, 4).map((alert) => {
            const isCrit = alert.severity === 'CRITICAL';
            const isCaut = alert.severity === 'CAUTION';

            return (
              <div
                key={alert.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: isCrit ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: `1px solid ${isCrit ? 'rgba(239, 68, 68, 0.35)' : isCaut ? 'rgba(245, 158, 11, 0.25)' : 'var(--border-subtle)'}`,
                  borderRadius: '6px',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <span className={`cyber-badge ${isCrit ? 'cyber-badge-crimson' : isCaut ? 'cyber-badge-amber' : 'cyber-badge-emerald'}`} style={{ fontSize: '0.65rem' }}>
                    {alert.severity}
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {alert.title}
                    </div>
                    <div className="font-mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {alert.time} • Subsystem: {alert.subsystem}
                    </div>
                  </div>
                </div>

                {!alert.acknowledged && onAcknowledge ? (
                  <button
                    onClick={() => onAcknowledge(alert.id)}
                    className="hud-btn hud-btn-emerald"
                    style={{ padding: '3px 10px', fontSize: '0.7rem', flexShrink: 0 }}
                  >
                    Acknowledge
                  </button>
                ) : (
                  <span className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', flexShrink: 0 }}>
                    ✓ ACKNOWLEDGED
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @media (max-width: 1100px) {
          .overview-crew-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .overview-main-grid {
            grid-template-columns: 1fr !important;
          }
        }
        @media (max-width: 600px) {
          .overview-crew-grid {
            grid-template-columns: 1fr !important;
          }
          .overview-metrics-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
