'use client';

import React from 'react';

export default function CrewSection({
  crew = [],
  activeAstronaut,
  onSelectAstronaut,
  alerts = [],
  onAcknowledge
}) {
  const unackedAlerts = alerts.filter(a => !a.acknowledged);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* ── Section Header ── */}
      <div className="section-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.25rem' }}>👥</span>
            <h2 className="font-orbitron" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              CREW MANIFEST &amp; MISSION ALERT TIMELINE
            </h2>
            <span className="cyber-badge cyber-badge-cyan">4 ACTIVE CREW</span>
            {unackedAlerts.length > 0 && (
              <span className="cyber-badge cyber-badge-crimson">
                {unackedAlerts.length} UNACKNOWLEDGED
              </span>
            )}
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Astronaut mission profiles, continuous multi-crew physiological monitoring, and subsystem telemetry alerts.
          </p>
        </div>
      </div>

      {/* ── 1. CREW DOSSIER CARDS (2x2 Grid, Generous Spacing) ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 className="font-orbitron" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#fff', margin: 0 }}>
            CREW MEMBER DOSSIERS
          </h3>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Click an astronaut to switch primary telemetry focus
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '20px'
        }} className="crew-dossier-grid">
          {crew.map((member) => {
            const isSelected = member.id === activeAstronaut?.id;
            const isWarning = member.status === 'Warning';

            return (
              <div
                key={member.id}
                onClick={() => onSelectAstronaut && onSelectAstronaut(member.id)}
                className="hud-panel"
                style={{
                  padding: '22px 24px',
                  cursor: 'pointer',
                  border: isSelected
                    ? '1px solid var(--hud-cyan)'
                    : isWarning
                    ? '1px solid rgba(239, 68, 68, 0.45)'
                    : '1px solid var(--border-subtle)',
                  background: isSelected
                    ? 'rgba(56, 189, 248, 0.08)'
                    : 'var(--bg-surface)',
                  transition: 'all 0.18s ease'
                }}
              >
                {/* Header: Avatar, Name, Status */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: isSelected ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${isSelected ? 'var(--hud-cyan)' : 'var(--border-subtle)'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'var(--font-hud)',
                      fontSize: '0.95rem',
                      fontWeight: 700,
                      color: isSelected ? 'var(--hud-cyan)' : '#ffffff',
                    }}>
                      {member.initials}
                    </div>

                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 className="font-orbitron" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                          {member.name}
                        </h4>
                        <span className="cyber-badge cyber-badge-cyan" style={{ fontSize: '0.65rem' }}>
                          {member.id}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {member.role}
                      </div>
                    </div>
                  </div>

                  <span className={`status-dot ${isWarning ? 'warning' : 'nominal'}`} />
                </div>

                {/* Metric Summary Rows */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '10px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  padding: '14px',
                  borderRadius: '6px',
                  marginBottom: '14px'
                }} className="dossier-metrics-strip">
                  <div>
                    <div className="font-ui" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Heart Rate</div>
                    <div className="font-orbitron" style={{ fontSize: '1.2rem', fontWeight: 700, color: member.hr > 100 ? 'var(--hud-crimson)' : 'var(--hud-emerald)' }}>
                      {member.hr} <span style={{ fontSize: '0.68rem', fontWeight: 500, color: 'var(--text-muted)' }}>BPM</span>
                    </div>
                  </div>

                  <div>
                    <div className="font-ui" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Blood O₂</div>
                    <div className="font-orbitron" style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--hud-cyan)' }}>
                      {member.spo2}%
                    </div>
                  </div>

                  <div>
                    <div className="font-ui" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pressure</div>
                    <div className="font-orbitron" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                      {member.suitP} <span style={{ fontSize: '0.68rem', fontWeight: 500, color: 'var(--text-muted)' }}>PSI</span>
                    </div>
                  </div>

                  <div>
                    <div className="font-ui" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Blood Press</div>
                    <div className="font-orbitron" style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--hud-violet)' }}>
                      {member.bpSys}/{member.bpDia}
                    </div>
                  </div>
                </div>

                {/* Autonomic Stress */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    <span>Autonomic Stress Index</span>
                    <span className="font-mono" style={{ color: member.stress > 50 ? 'var(--hud-crimson)' : 'var(--hud-cyan)', fontWeight: 600 }}>
                      {member.stress}% {member.stress > 50 ? '[ELEVATED]' : '[NOMINAL]'}
                    </span>
                  </div>
                  <div className="telemetry-bar-bg">
                    <div
                      className="telemetry-bar-fill"
                      style={{
                        width: `${member.stress}%`,
                        background: member.stress > 50 ? 'var(--hud-crimson)' : 'var(--hud-emerald)'
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2. ALERT TIMELINE & COMPARATIVE OVERVIEW ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.25fr) minmax(0, 1fr)', gap: '24px' }} className="crew-bottom-grid">
        {/* Left: Mission Alert Event Feed */}
        <div className="hud-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 className="font-orbitron" style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                MISSION ALERT &amp; TELEMETRY LOG
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                System events chronologically ordered
              </div>
            </div>

            <span className="cyber-badge cyber-badge-cyan">
              {alerts.length} EVENTS
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, overflowY: 'auto', maxHeight: '380px' }}>
            {alerts.map((alert) => {
              const isCrit = alert.severity === 'CRITICAL';
              const isCaut = alert.severity === 'CAUTION';

              return (
                <div
                  key={alert.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    background: isCrit ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: `1px solid ${isCrit ? 'rgba(239, 68, 68, 0.35)' : isCaut ? 'rgba(245, 158, 11, 0.25)' : 'var(--border-subtle)'}`,
                    borderRadius: '6px',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                    <span className={`cyber-badge ${isCrit ? 'cyber-badge-crimson' : isCaut ? 'cyber-badge-amber' : 'cyber-badge-emerald'}`} style={{ fontSize: '0.68rem', flexShrink: 0 }}>
                      {alert.severity}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '0.86rem', fontWeight: 600, color: '#fff' }}>
                        {alert.title}
                      </div>
                      <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        {alert.id} • Time: {alert.time} • Subsystem: {alert.subsystem}
                      </div>
                    </div>
                  </div>

                  {!alert.acknowledged && onAcknowledge ? (
                    <button
                      onClick={() => onAcknowledge(alert.id)}
                      className="hud-btn hud-btn-emerald"
                      style={{ padding: '4px 12px', fontSize: '0.72rem', flexShrink: 0 }}
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

        {/* Right: Comparative Roster Table */}
        <div className="hud-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 className="font-orbitron" style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                CREW COMPARATIVE MATRIX
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Multi-crew normalized baseline comparison
              </div>
            </div>
            <span className="cyber-badge cyber-badge-emerald">4/4 SYNCED</span>
          </div>

          <div style={{ overflowX: 'auto', flex: 1 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', fontFamily: 'var(--font-mono)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '10px 8px' }}>NAME</th>
                  <th style={{ padding: '10px 8px' }}>STATUS</th>
                  <th style={{ padding: '10px 8px' }}>HR</th>
                  <th style={{ padding: '10px 8px' }}>SpO₂</th>
                  <th style={{ padding: '10px 8px' }}>BP</th>
                  <th style={{ padding: '10px 8px' }}>STRESS</th>
                </tr>
              </thead>
              <tbody>
                {crew.map((member) => {
                  const isSelected = member.id === activeAstronaut?.id;
                  return (
                    <tr
                      key={member.id}
                      onClick={() => onSelectAstronaut && onSelectAstronaut(member.id)}
                      style={{
                        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                        background: isSelected ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '12px 8px', color: '#fff', fontWeight: 600 }}>
                        {member.name.split(' ').slice(1).join(' ')}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span className={`status-dot ${member.status === 'Warning' ? 'warning' : 'nominal'}`} style={{ marginRight: '6px' }} />
                        <span style={{ color: member.status === 'Warning' ? 'var(--hud-amber)' : 'var(--hud-emerald)' }}>
                          {member.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', color: member.hr > 100 ? 'var(--hud-crimson)' : 'var(--hud-emerald)' }}>
                        {member.hr}
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--hud-cyan)' }}>
                        {member.spo2}%
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--hud-violet)' }}>
                        {member.bpSys}/{member.bpDia}
                      </td>
                      <td style={{ padding: '12px 8px', color: member.stress > 50 ? 'var(--hud-crimson)' : 'var(--hud-emerald)' }}>
                        {member.stress}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1080px) {
          .crew-dossier-grid { grid-template-columns: 1fr !important; }
          .crew-bottom-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .dossier-metrics-strip { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>
    </div>
  );
}
