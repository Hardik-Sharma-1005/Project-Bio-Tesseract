'use client';

import React, { useRef, useEffect, useState } from 'react';

export default function LiveEcgChart({
  heartRate = 72,
  spO2 = 98.4,
  bpSys = 118,
  bpDia = 76,
  respRate = 15
}) {
  const canvasRef = useRef(null);
  const [leadMode, setLeadMode] = useState('LEAD-II');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const width = canvas.width;
    const height = canvas.height;

    const points = new Array(width).fill(height / 2);
    let currentX = 0;
    let animationId;
    const startTime = performance.now();

    const getEcgSample = (t) => {
      const period = 60 / Math.max(40, heartRate);
      const normalizedTime = (t % period) / period;

      let sample = 0;

      if (leadMode === 'V1-PPG') {
        // Photoplethysmogram arterial pulse wave
        if (normalizedTime < 0.25) {
          const phase = normalizedTime / 0.25;
          sample = Math.sin(phase * Math.PI * 0.5) * 62;
        } else if (normalizedTime < 0.45) {
          const phase = (normalizedTime - 0.25) / 0.2;
          sample = 62 - phase * 32;
        } else if (normalizedTime < 0.55) {
          const phase = (normalizedTime - 0.45) / 0.1;
          sample = 30 + Math.sin(phase * Math.PI) * 14;
        } else {
          const phase = (normalizedTime - 0.55) / 0.45;
          sample = 30 * Math.exp(-phase * 3.5);
        }
      } else {
        let rScale = 1.0;
        let pScale = 1.0;
        let tScale = 1.0;

        if (leadMode === 'LEAD-I') {
          rScale = 0.82;
          pScale = 0.75;
          tScale = 0.85;
        } else if (leadMode === 'LEAD-III') {
          rScale = 0.68;
          pScale = -0.5; // Inverted P in Lead-III
          tScale = 0.6;
        }

        // P Wave
        if (normalizedTime > 0.1 && normalizedTime < 0.2) {
          const phase = (normalizedTime - 0.1) / 0.1;
          sample = Math.sin(phase * Math.PI) * 14 * pScale;
        }
        // Q Wave
        else if (normalizedTime >= 0.22 && normalizedTime < 0.25) {
          sample = -12 * rScale;
        }
        // R Peak
        else if (normalizedTime >= 0.25 && normalizedTime < 0.28) {
          const phase = (normalizedTime - 0.25) / 0.03;
          sample = Math.sin(phase * Math.PI) * 88 * rScale;
        }
        // S Wave
        else if (normalizedTime >= 0.28 && normalizedTime < 0.31) {
          sample = -24 * rScale;
        }
        // T Wave
        else if (normalizedTime >= 0.42 && normalizedTime < 0.6) {
          const phase = (normalizedTime - 0.42) / 0.18;
          sample = Math.sin(phase * Math.PI) * 26 * tScale;
        }
      }

      sample += (Math.random() - 0.5) * 1.5;
      return sample;
    };

    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;

      // Fine grid lines
      for (let x = 0; x < width; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Major grid lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.1)';
      for (let x = 0; x < width; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 100) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    const render = () => {
      const now = performance.now();
      const elapsed = (now - startTime) / 1000;
      const rawEcg = getEcgSample(elapsed);
      const baselineY = height / 2;
      const yVal = baselineY - rawEcg;

      for (let i = 0; i < 3; i++) {
        points[currentX] = yVal;
        currentX = (currentX + 1) % width;
      }

      ctx.fillStyle = '#070c18';
      ctx.fillRect(0, 0, width, height);

      drawGrid();

      // Trace line
      ctx.beginPath();
      const traceColor = leadMode === 'V1-PPG' ? '#38bdf8' : '#10b981';
      ctx.strokeStyle = traceColor;
      ctx.lineWidth = 2.2;
      ctx.lineJoin = 'round';

      for (let x = 0; x < width; x++) {
        if (Math.abs(x - currentX) < 14) continue;
        if (x === 0 || Math.abs(x - currentX) === 14) {
          ctx.moveTo(x, points[x]);
        } else {
          ctx.lineTo(x, points[x]);
        }
      }
      ctx.stroke();

      // Sweep Line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.moveTo(currentX, 0);
      ctx.lineTo(currentX, height);
      ctx.stroke();

      // Cursor dot
      ctx.beginPath();
      ctx.arc(currentX, points[currentX], 4, 0, Math.PI * 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fill();

      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [heartRate, leadMode]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* 4 Prominent Vital Metrics Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '18px'
      }} className="ecg-vitals-strip">
        <div className="metric-card" style={{ padding: '14px 18px' }}>
          <span className="label">Heart Rate (HR)</span>
          <span className="value font-orbitron" style={{ color: heartRate > 100 ? 'var(--hud-crimson)' : 'var(--hud-emerald)' }}>
            {heartRate} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>BPM</span>
          </span>
        </div>

        <div className="metric-card" style={{ padding: '14px 18px' }}>
          <span className="label">Oxygen Saturation (SpO₂)</span>
          <span className="value font-orbitron" style={{ color: 'var(--hud-cyan)' }}>
            {spO2}%
          </span>
        </div>

        <div className="metric-card" style={{ padding: '14px 18px' }}>
          <span className="label">Blood Pressure (BP)</span>
          <span className="value font-orbitron" style={{ color: 'var(--hud-violet)' }}>
            {bpSys}/{bpDia} <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--text-muted)' }}>mmHg</span>
          </span>
        </div>

        <div className="metric-card" style={{ padding: '14px 18px' }}>
          <span className="label">Respiration Rate (RR)</span>
          <span className="value font-orbitron" style={{ color: 'var(--hud-amber)' }}>
            {respRate} <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)' }}>BrPM</span>
          </span>
        </div>
      </div>

      {/* Main Oscilloscope Viewport */}
      <div style={{
        flex: 1,
        minHeight: '300px',
        position: 'relative',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        background: '#070c18'
      }}>
        <canvas
          ref={canvasRef}
          width={840}
          height={300}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />

        {/* Lead & Rhythm Tag */}
        <div style={{
          position: 'absolute',
          top: '12px',
          right: '16px',
          display: 'flex',
          gap: '8px'
        }}>
          <span className="cyber-badge cyber-badge-cyan">
            {leadMode}
          </span>
          <span className="cyber-badge cyber-badge-emerald">
            SINUS RHYTHM
          </span>
        </div>

        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '16px',
          fontSize: '0.72rem',
          color: 'var(--text-muted)'
        }}>
          SIMULATED PROCEDURAL TELEMETRY • NOT VALIDATED CLINICAL DIAGNOSTIC
        </div>
      </div>

      {/* Lead Selector Controls */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: '16px',
        padding: '12px 16px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '6px',
        border: '1px solid var(--border-subtle)',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            ECG LEAD:
          </span>
          {['LEAD-I', 'LEAD-II', 'LEAD-III', 'V1-PPG'].map((mode) => (
            <button
              key={mode}
              onClick={() => setLeadMode(mode)}
              className={`hud-btn ${leadMode === mode ? 'hud-btn-primary' : ''}`}
              style={{ padding: '5px 14px', fontSize: '0.8rem' }}
            >
              {mode}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <span>Sweep: <strong>25 mm/s</strong></span>
          <span>Gain: <strong>10 mm/mV</strong></span>
        </div>
      </div>

      <style>{`
        @media (max-width: 860px) {
          .ecg-vitals-strip {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  );
}
