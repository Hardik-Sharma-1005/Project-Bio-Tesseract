'use client';

import React, { useRef, useEffect, useState } from 'react';

export default function TesseractViewer({
  heartRate = 72,
  stressLevel = 18,
  suitStatus = 'Nominal'
}) {
  const canvasRef = useRef(null);
  const [rotationSpeed, setRotationSpeed] = useState(0.015);
  const [projectionMode, setProjectionMode] = useState('stereographic'); // 'stereographic' | 'orthographic'
  const [activePlane, setActivePlane] = useState('ALL'); // 'ALL' | 'XW-ZW' | 'XY-YZ'
  const [isRotating, setIsRotating] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // 16 Vertices of a 4D Hypercube: (±1, ±1, ±1, ±1)
    const vertices4D = [];
    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
          for (let w = -1; w <= 1; w += 2) {
            vertices4D.push([x, y, z, w]);
          }
        }
      }
    }

    // 32 Edges connecting vertices with Hamming distance of 1
    const edges = [];
    for (let i = 0; i < 16; i++) {
      for (let j = i + 1; j < 16; j++) {
        let diff = 0;
        for (let k = 0; k < 4; k++) {
          if (vertices4D[i][k] !== vertices4D[j][k]) diff++;
        }
        if (diff === 1) {
          edges.push([i, j]);
        }
      }
    }

    let angleXY = 0;
    let angleXW = 0;
    let angleYZ = 0;
    let angleZW = 0;
    let animationFrameId;

    const rotate4D = (v) => {
      let [x, y, z, w] = v;

      if (activePlane === 'ALL' || activePlane === 'XW-ZW') {
        const cosXW = Math.cos(angleXW), sinXW = Math.sin(angleXW);
        const x1 = x * cosXW - w * sinXW;
        const w1 = x * sinXW + w * cosXW;
        x = x1;
        w = w1;

        const cosZW = Math.cos(angleZW), sinZW = Math.sin(angleZW);
        const z1 = z * cosZW - w * sinZW;
        const w2 = z * sinZW + w * cosZW;
        z = z1;
        w = w2;
      }

      if (activePlane === 'ALL' || activePlane === 'XY-YZ') {
        const cosXY = Math.cos(angleXY), sinXY = Math.sin(angleXY);
        const x2 = x * cosXY - y * sinXY;
        const y1 = x * sinXY + y * cosXY;
        x = x2;
        y = y1;

        const cosYZ = Math.cos(angleYZ), sinYZ = Math.sin(angleYZ);
        const y2 = y * cosYZ - z * sinYZ;
        const z2 = y * sinYZ + z * cosYZ;
        y = y2;
        z = z2;
      }

      return [x, y, z, w];
    };

    const project = (v, width, height, pulseFactor) => {
      let [x, y, z, w] = v;

      // Simulated biological pulse factor
      const scale = 1.0 + (pulseFactor * 0.1);
      x *= scale;
      y *= scale;
      z *= scale;
      w *= scale;

      const distance4D = 2.7;
      const distance3D = 3.8;

      let factor4D;
      if (projectionMode === 'stereographic') {
        factor4D = 1 / (distance4D - w);
      } else {
        factor4D = 0.45; // Orthographic
      }

      const x3D = x * factor4D;
      const y3D = y * factor4D;
      const z3D = z * factor4D;

      const factor3D = 1 / (distance3D - z3D);
      const x2D = x3D * factor3D * (width * 0.82) + width / 2;
      const y2D = y3D * factor3D * (height * 0.82) + height / 2;

      return { x: x2D, y: y2D, depth: z3D + w, wVal: w };
    };

    const render = (time) => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Pulse speed based on simulated heart rate
      const pulseSpeed = (heartRate / 60) * 2 * Math.PI;
      const pulseFactor = Math.sin((time / 1000) * pulseSpeed) * 0.5 + 0.5;

      if (isRotating) {
        angleXW += rotationSpeed * 0.8;
        angleZW += rotationSpeed * 0.6;
        angleXY += rotationSpeed * 0.4;
        angleYZ += rotationSpeed * 0.3;
      }

      const projected = vertices4D.map(v => {
        const rotated = rotate4D(v);
        return project(rotated, width, height, pulseFactor);
      });

      const centerX = width / 2;
      const centerY = height / 2;

      // Subtle center reference ring
      ctx.beginPath();
      ctx.arc(centerX, centerY, 80 + pulseFactor * 10, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 6]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Edges
      edges.forEach(([i, j]) => {
        const p1 = projected[i];
        const p2 = projected[j];

        const avgDepth = (p1.depth + p2.depth) / 2;
        const alpha = Math.max(0.2, Math.min(0.85, (avgDepth + 1.6) / 3.2));

        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);

        if (stressLevel > 50) {
          ctx.strokeStyle = `rgba(239, 68, 68, ${alpha})`;
          ctx.lineWidth = 1.8;
        } else {
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.lineWidth = 1.5;
        }
        ctx.stroke();
      });

      // Draw Vertices
      projected.forEach((p) => {
        const radius = 3 + Math.max(0, (p.wVal + 1) * 1.8) + (pulseFactor * 1.5);

        ctx.beginPath();
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);

        if (stressLevel > 50) {
          ctx.fillStyle = '#ef4444';
        } else {
          ctx.fillStyle = '#38bdf8';
        }
        ctx.fill();

        // Core white dot
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationFrameId);
  }, [rotationSpeed, projectionMode, activePlane, isRotating, heartRate, stressLevel]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Canvas Viewport */}
      <div style={{
        position: 'relative',
        background: '#070b16',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        minHeight: '440px',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <canvas
          ref={canvasRef}
          width={760}
          height={440}
          style={{ width: '100%', height: '100%', display: 'block', objectFit: 'contain' }}
        />

        {/* Informative HUD overlay tags */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '18px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          background: 'rgba(9, 14, 28, 0.85)',
          padding: '8px 14px',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)',
          lineHeight: 1.6
        }}>
          <div>VERTICES: <strong style={{ color: '#fff' }}>16 Nodes</strong></div>
          <div>HYPER-EDGES: <strong style={{ color: '#fff' }}>32 Vectors</strong></div>
          <div>SIMULATED PULSE: <strong style={{ color: 'var(--hud-cyan)' }}>{(heartRate / 60).toFixed(2)} Hz</strong></div>
        </div>

        <div style={{
          position: 'absolute',
          top: '16px',
          right: '18px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          background: 'rgba(9, 14, 28, 0.85)',
          padding: '8px 14px',
          borderRadius: '6px',
          border: '1px solid var(--border-subtle)',
          lineHeight: 1.6,
          textAlign: 'right'
        }}>
          <div>PROJECTION: <strong style={{ color: 'var(--hud-emerald)' }}>{projectionMode.toUpperCase()}</strong></div>
          <div>PLANES: <strong style={{ color: 'var(--hud-cyan)' }}>{activePlane}</strong></div>
          <div>COLOR STATE: <strong style={{ color: stressLevel > 50 ? 'var(--hud-crimson)' : 'var(--hud-cyan)' }}>
            {stressLevel > 50 ? 'STRESS SHIFT' : 'NOMINAL'}
          </strong></div>
        </div>
      </div>

      {/* Control Bar: Spacious, clean, intuitive */}
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
        {/* Playback & Mode Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setIsRotating(!isRotating)}
            className={`hud-btn ${!isRotating ? 'hud-btn-primary' : ''}`}
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            {isRotating ? '⏸ Pause Rotation' : '▶ Resume Rotation'}
          </button>

          <button
            onClick={() => setProjectionMode(projectionMode === 'stereographic' ? 'orthographic' : 'stereographic')}
            className="hud-btn"
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            Mode: {projectionMode === 'stereographic' ? 'Stereographic' : 'Orthographic'}
          </button>

          <button
            onClick={() => {
              const planes = ['ALL', 'XW-ZW', 'XY-YZ'];
              const next = planes[(planes.indexOf(activePlane) + 1) % planes.length];
              setActivePlane(next);
            }}
            className="hud-btn"
            style={{ padding: '6px 14px', fontSize: '0.8rem' }}
          >
            Planes: {activePlane === 'ALL' ? 'All 6 Planes' : activePlane}
          </button>
        </div>

        {/* Speed Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            Rotation Speed:
          </span>
          <input
            type="range"
            min="0.005"
            max="0.04"
            step="0.005"
            value={rotationSpeed}
            onChange={(e) => setRotationSpeed(parseFloat(e.target.value))}
            style={{ width: '100px', accentColor: 'var(--hud-cyan)', cursor: 'pointer' }}
          />
          <span className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--hud-cyan)', minWidth: '40px' }}>
            {(rotationSpeed * 100).toFixed(1)}x
          </span>
        </div>
      </div>
    </div>
  );
}
