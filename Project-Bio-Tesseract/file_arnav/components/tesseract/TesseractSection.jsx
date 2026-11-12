'use client';

import React from 'react';
import TesseractViewer from './TesseractViewer';

export default function TesseractSection({ activeAstronaut, crew = [], onSelectAstronaut }) {
  const hr = activeAstronaut?.hr || 72;
  const stress = activeAstronaut?.stress || 18;
  const status = activeAstronaut?.status || 'Nominal';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* ── Section Header ── */}
      <div className="section-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.25rem' }}>💠</span>
            <h2 className="font-orbitron" style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff', margin: 0 }}>
              4D TESSERACT HYPERCUBE EXPLORATION
            </h2>
            <span className="cyber-badge cyber-badge-cyan">MATHEMATICAL VISUALIZER</span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: 'var(--text-secondary)' }}>
            Interactive four-dimensional geometry projected into screen space, demonstrating $SO(4)$ hyper-rotations and simulated biometric pulse coupling.
          </p>
        </div>
      </div>

      {/* ── Main Two-Column Layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)', gap: '24px' }} className="tess-section-grid">
        {/* Left: Large Interactive Canvas Viewport */}
        <div className="hud-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 className="font-orbitron" style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', margin: 0 }}>
                INTERACTIVE 4D PROJECTION VIEWPORT
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Coupled to: <strong style={{ color: 'var(--hud-cyan)' }}>{activeAstronaut?.name}</strong> ({hr} BPM • Stress: {stress}%)
              </div>
            </div>

            <span className={`cyber-badge ${stress > 50 ? 'cyber-badge-crimson' : 'cyber-badge-emerald'}`}>
              {status.toUpperCase()}
            </span>
          </div>

          <TesseractViewer
            heartRate={hr}
            stressLevel={stress}
            suitStatus={status}
          />
        </div>

        {/* Right: Educational & Mathematical Clarification Panels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Panel 1: What is a Tesseract? */}
          <div className="hud-panel" style={{ padding: '22px' }}>
            <h4 className="font-orbitron" style={{ fontSize: '0.9rem', color: 'var(--hud-cyan)', margin: '0 0 10px 0' }}>
              WHAT IS A 4D HYPERCUBE?
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: '0 0 14px 0' }}>
              Just as a 3D cube is formed by extending a 2D square into a third perpendicular axis, a <strong>Tesseract (4D Hypercube)</strong> is formed by extending a cube along a fourth spatial dimension ($w$).
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 12px', borderRadius: '5px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>VERTICES (R⁴)</div>
                <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>16 Points</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Coords: (±1, ±1, ±1, ±1)</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 12px', borderRadius: '5px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>HYPER-EDGES</div>
                <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>32 Edges</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Hamming distance = 1</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 12px', borderRadius: '5px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>2D FACES</div>
                <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>24 Squares</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Bounding planar faces</div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '10px 12px', borderRadius: '5px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>3D CELLS</div>
                <div className="font-mono" style={{ fontSize: '1.05rem', fontWeight: 600, color: '#fff' }}>8 Cubes</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Bounding solid cells</div>
              </div>
            </div>
          </div>

          {/* Panel 2: Projection Mechanics */}
          <div className="hud-panel" style={{ padding: '22px' }}>
            <h4 className="font-orbitron" style={{ fontSize: '0.9rem', color: 'var(--hud-emerald)', margin: '0 0 10px 0' }}>
              HOW 4D ROTATION IS PROJECTED
            </h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: '0 0 10px 0' }}>
              In four dimensions, rotations occur about planes rather than axes ($SO(4)$ group). We apply rotation transformations in the $XW$, $ZW$, $XY$, and $YZ$ planes simultaneously:
            </p>
            <div className="font-mono" style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '10px 14px',
              borderRadius: '5px',
              fontSize: '0.78rem',
              color: 'var(--hud-cyan)',
              marginBottom: '10px'
            }}>
              x&apos; = x · cos(θ) - w · sin(θ)<br />
              w&apos; = x · sin(θ) + w · cos(θ)
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
              The 4D coordinates are projected to 3D using stereographic factor <code>1 / (d₄ - w)</code>, and finally perspective-mapped to the 2D canvas screen.
            </p>
          </div>

          {/* Panel 3: Biological Coupling Transparency */}
          <div className="hud-panel" style={{ padding: '22px' }}>
            <h4 className="font-orbitron" style={{ fontSize: '0.9rem', color: 'var(--hud-amber)', margin: '0 0 8px 0' }}>
              SIMULATED BIOMETRIC COUPLING
            </h4>
            <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 12px 0' }}>
              In this operational module, the astronaut&apos;s heart rate ({hr} BPM) controls the harmonic pulse frequency ($f = {(hr / 60).toFixed(2)}\text{ Hz}$), and autonomic stress ({stress}%) modulates vertex color and vector weight.
            </p>

            <div style={{
              padding: '10px 14px',
              background: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: '6px',
              fontSize: '0.78rem',
              color: 'var(--text-primary)',
              lineHeight: 1.45
            }}>
              <strong>Operational Disclaimer:</strong> This visualizer is a mathematical projection. The animation does not represent anatomical structures, clinical conditions, or real biological hyperspace.
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1080px) {
          .tess-section-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
