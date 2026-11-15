'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';

const formatReading = (value, decimals = 0) => (
  Number.isFinite(value) ? Number(value).toFixed(decimals).replace(/\.0$/, '') : '—'
);

export default function LiveEcgChart({
  heartRate,
  spO2,
  bpSys,
  bpDia,
  respRate,
  statusTone = 'unknown',
}) {
  const canvasRef = useRef(null);
  const [waveformMode, setWaveformMode] = useState('ECG-II');
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !Number.isFinite(heartRate)) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const width = canvas.width;
    const height = canvas.height;
    const chartTokens = getComputedStyle(canvas);
    const chartBackground = chartTokens.getPropertyValue('--dashboard-chart-bg').trim() || '#070c18';
    const chartGrid = theme === 'light' ? 'rgba(23, 35, 56, 0.08)' : 'rgba(232, 222, 237, 0.08)';
    const ecgColor = chartTokens.getPropertyValue('--status-nominal').trim() || '#73D3A7';
    const ppgColor = chartTokens.getPropertyValue('--dashboard-info').trim() || '#76C4DC';

    const points = new Array(width).fill(height / 2);
    let currentX = 0;
    let animationId = null;
    const startTime = performance.now();
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const getEcgSample = (t) => {
      const period = 60 / Math.max(40, heartRate);
      const normalizedTime = (t % period) / period;

      let sample = 0;

      if (waveformMode === 'PPG') {
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

        if (waveformMode === 'ECG-I') {
          rScale = 0.82;
          pScale = 0.75;
          tScale = 0.85;
        } else if (waveformMode === 'ECG-III') {
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
      ctx.strokeStyle = chartGrid;
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
      ctx.strokeStyle = waveformMode === 'PPG'
        ? (theme === 'light' ? 'rgba(40, 101, 122, 0.2)' : 'rgba(118, 196, 220, 0.2)')
        : (theme === 'light' ? 'rgba(33, 122, 91, 0.18)' : 'rgba(220, 156, 183, 0.2)');
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

    const render = (staticFrame = false) => {
      if (staticFrame) {
        const period = 60 / Math.max(40, heartRate);
        for (let x = 0; x < width; x++) {
          points[x] = height / 2 - getEcgSample((x / width) * period * 4);
        }
        currentX = width;
      } else {
        const elapsed = (performance.now() - startTime) / 1000;
        const yVal = height / 2 - getEcgSample(elapsed);
        for (let i = 0; i < 3; i++) {
          points[currentX] = yVal;
          currentX = (currentX + 1) % width;
        }
      }

      ctx.fillStyle = chartBackground;
      ctx.fillRect(0, 0, width, height);

      drawGrid();

      // Trace line
      ctx.beginPath();
      const traceColor = waveformMode === 'PPG' ? ppgColor : ecgColor;
      ctx.strokeStyle = traceColor;
      ctx.lineWidth = 2.2;
      ctx.lineJoin = 'round';

      for (let x = 0; x < width; x++) {
        if (!staticFrame && Math.abs(x - currentX) < 14) continue;
        if (x === 0 || (!staticFrame && Math.abs(x - currentX) === 14)) {
          ctx.moveTo(x, points[x]);
        } else {
          ctx.lineTo(x, points[x]);
        }
      }
      ctx.stroke();

      if (staticFrame) return;

      // Sweep Line
      ctx.beginPath();
      ctx.strokeStyle = waveformMode === 'PPG'
        ? (theme === 'light' ? 'rgba(40, 101, 122, 0.72)' : 'rgba(118, 196, 220, 0.72)')
        : (theme === 'light' ? 'rgba(33, 122, 91, 0.72)' : 'rgba(115, 211, 167, 0.72)');
      ctx.lineWidth = 1.5;
      ctx.moveTo(currentX, 0);
      ctx.lineTo(currentX, height);
      ctx.stroke();

      // Cursor dot
      ctx.beginPath();
      ctx.arc(currentX, points[currentX], 4, 0, Math.PI * 2);
      ctx.fillStyle = traceColor;
      ctx.fill();

      if (!document.hidden) animationId = requestAnimationFrame(render);
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (animationId !== null) cancelAnimationFrame(animationId);
        animationId = null;
      } else if (!reducedMotion && animationId === null) {
        animationId = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    if (reducedMotion) render(true);
    else if (!document.hidden) animationId = requestAnimationFrame(render);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      if (animationId !== null) cancelAnimationFrame(animationId);
    };
  }, [heartRate, waveformMode, theme]);

  return (
    <div className={`biomonitor-chart biomonitor-chart--${statusTone}${waveformMode === 'PPG' ? ' biomonitor-chart--ppg' : ' biomonitor-chart--ecg'}`} role="group" aria-label="Selected crew physiological measurements and waveform display">
      <section className="biomonitor-measurements" aria-label="Current simulated physiological measurements">
        <div className="biomonitor-primary-measurements">
          <div className="biomonitor-reading biomonitor-reading--heart">
            <span className="biomonitor-reading__label">Heart rate <abbr title="Heart rate">HR</abbr></span>
            <span className="biomonitor-reading__value">{formatReading(heartRate)} <small>bpm</small></span>
          </div>
          <div className="biomonitor-reading biomonitor-reading--spo2">
            <span className="biomonitor-reading__label">Blood oxygen saturation <abbr title="Peripheral oxygen saturation">SpO₂</abbr></span>
            <span className="biomonitor-reading__value">{formatReading(spO2, 1)}<small>%</small></span>
          </div>
        </div>
        <dl className="biomonitor-secondary-measurements">
          <div><dt>Blood pressure</dt><dd>{Number.isFinite(bpSys) && Number.isFinite(bpDia) ? `${formatReading(bpSys)}/${formatReading(bpDia)}` : '—'} <small>mmHg</small></dd></div>
          <div><dt>Respiration rate</dt><dd>{formatReading(respRate)} <small>breaths/min</small></dd></div>
        </dl>
      </section>

      <div className="biomonitor-signal-toolbar">
        <div>
          <span className="biomonitor-signal-toolbar__label">SIGNAL VIEW</span>
          <span className="biomonitor-signal-toolbar__mode">
            {waveformMode === 'PPG' ? 'Photoplethysmogram · PPG' : `Electrocardiogram · ${waveformMode}`}
          </span>
        </div>
        <span className={`biomonitor-signal-tag${waveformMode === 'PPG' ? ' biomonitor-signal-tag--ppg' : ''}`}>
          PROCEDURAL {waveformMode === 'PPG' ? 'PULSE' : 'ECG'}
        </span>
      </div>

      <figure className="biomonitor-signal-figure">
        <div className="biomonitor-canvas-frame">
          <canvas
            ref={canvasRef}
            width={840}
            height={300}
            role="img"
            aria-label={`${waveformMode === 'PPG' ? 'Procedural PPG pulse waveform' : `Procedural ECG ${waveformMode} waveform`} for ${formatReading(heartRate)} beats per minute; simulation display, not a sensor feed`}
          >
            Procedural waveform display. Simulated data, not a sensor feed.
          </canvas>
        </div>
        <figcaption>
          <span>Waveform timing follows the simulated heart-rate input.</span>
          <span>No acquisition hardware connected</span>
        </figcaption>
      </figure>

      <div className="biomonitor-mode-controls">
        <div className="biomonitor-mode-controls__heading">
          <span>Display mode</span>
          <span>Choose a procedural view</span>
        </div>
        <div className="biomonitor-mode-buttons" role="group" aria-label="Select waveform display mode">
          {[
            { id: 'ECG-I', label: 'Lead I' },
            { id: 'ECG-II', label: 'Lead II' },
            { id: 'ECG-III', label: 'Lead III' },
            { id: 'PPG', label: 'PPG' },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              aria-pressed={waveformMode === mode.id}
              onClick={() => setWaveformMode(mode.id)}
              className={`biomonitor-mode-button${waveformMode === mode.id ? ' biomonitor-mode-button--active' : ''}${mode.id === 'PPG' ? ' biomonitor-mode-button--ppg' : ''}`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
