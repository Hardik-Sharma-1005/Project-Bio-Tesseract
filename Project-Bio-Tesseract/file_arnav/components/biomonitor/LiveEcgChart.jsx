'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useTheme } from '../theme/ThemeProvider';

const formatReading = (value, decimals = 0) => (
  Number.isFinite(value) ? Number(value).toFixed(decimals).replace(/\.0$/, '') : '—'
);
const formatSampleTimestamp = value => new Intl.DateTimeFormat(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 }).format(new Date(value));

export default function LiveEcgChart({
  heartRate,
  spO2,
  bpSys,
  bpDia,
  respRate,
  statusTone = 'unknown',
}) {
  const canvasRef = useRef(null);
  const { theme } = useTheme();
  const [waveformMode, setWaveformMode] = useState('ECG-II');
  const [inspection, setInspection] = useState(null);
  const inspectionRef = useRef(null);
  const samplesRef = useRef(null);
  const redrawRef = useRef(null);
  const readingsRef = useRef({ heartRate, waveformMode, theme });
  useEffect(() => { readingsRef.current = { heartRate, waveformMode, theme }; }, [heartRate, waveformMode, theme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !Number.isFinite(readingsRef.current.heartRate)) return undefined;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const width = canvas.width;
    const height = canvas.height;
    const chartTokens = getComputedStyle(canvas);
    const chartBackground = chartTokens.getPropertyValue('--dashboard-chart-bg').trim() || '#070c18';
    const ecgColor = chartTokens.getPropertyValue('--status-nominal').trim() || '#73D3A7';
    const ppgColor = chartTokens.getPropertyValue('--dashboard-info').trim() || '#76C4DC';

    const points = new Array(width).fill(height / 2);
    const sampleValues = new Array(width).fill(0);
    const sampleTimes = new Array(width).fill(0);
    let currentX = 0;
    let animationId = null;
    const startTime = performance.now();
    const wallClockStart = Date.now();
    samplesRef.current = { sampleValues, sampleTimes, wallClockStart };
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = motionPreference.matches;

    const getEcgSample = (t) => {
      const { heartRate: currentHeartRate, waveformMode: currentWaveformMode } = readingsRef.current;
      const period = 60 / Math.max(40, currentHeartRate);
      const normalizedTime = (t % period) / period;

      let sample = 0;

      if (currentWaveformMode === 'PPG') {
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

        if (currentWaveformMode === 'ECG-I') {
          rScale = 0.82;
          pScale = 0.75;
          tScale = 0.85;
        } else if (currentWaveformMode === 'ECG-III') {
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

      sample += Math.sin(t * 17.31) * 0.34 + Math.sin(t * 43.7) * 0.12;
      return sample;
    };

    const drawGrid = () => {
      const { theme: currentTheme, waveformMode: currentWaveformMode } = readingsRef.current;
      ctx.strokeStyle = currentTheme === 'light' ? 'rgba(23, 35, 56, 0.08)' : 'rgba(232, 222, 237, 0.08)';
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
      ctx.strokeStyle = currentWaveformMode === 'PPG'
        ? (currentTheme === 'light' ? 'rgba(40, 101, 122, 0.2)' : 'rgba(118, 196, 220, 0.2)')
        : (currentTheme === 'light' ? 'rgba(33, 122, 91, 0.18)' : 'rgba(220, 156, 183, 0.2)');
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

    const render = (staticFrame = false, preserveSamples = false) => {
      if (staticFrame && !preserveSamples) {
        const period = 60 / Math.max(40, readingsRef.current.heartRate);
        const windowSeconds = period * 4;
        const elapsed = (performance.now() - startTime) / 1000;
        for (let x = 0; x < width; x++) {
          const sampleTime = Math.max(0, elapsed - windowSeconds + (x / width) * windowSeconds);
          sampleValues[x] = getEcgSample(sampleTime);
          points[x] = height / 2 - sampleValues[x];
          sampleTimes[x] = sampleTime;
        }
        currentX = width;
      } else {
        const elapsed = (performance.now() - startTime) / 1000;
        for (let i = 0; i < 3; i++) {
          const sampleTime = Math.max(0, elapsed - (2 - i) / 180);
          const sampleValue = getEcgSample(sampleTime);
          sampleValues[currentX] = sampleValue;
          sampleTimes[currentX] = sampleTime;
          points[currentX] = height / 2 - sampleValue;
          currentX = (currentX + 1) % width;
        }
      }

      ctx.fillStyle = chartBackground;
      ctx.fillRect(0, 0, width, height);

      drawGrid();

      // Trace line
      ctx.beginPath();
      const { theme: currentTheme, waveformMode: currentWaveformMode } = readingsRef.current;
      const traceColor = currentWaveformMode === 'PPG' ? ppgColor : ecgColor;
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

      if (inspectionRef.current !== null) {
        const x = inspectionRef.current;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.strokeStyle = currentTheme === 'light' ? 'rgba(102,87,127,.68)' : 'rgba(232,212,232,.68)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.beginPath(); ctx.arc(x, points[x], 5, 0, Math.PI * 2); ctx.fillStyle = traceColor; ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
      }

      if (staticFrame) return;

      // Sweep Line
      ctx.beginPath();
      ctx.strokeStyle = currentWaveformMode === 'PPG'
        ? (currentTheme === 'light' ? 'rgba(40, 101, 122, 0.72)' : 'rgba(118, 196, 220, 0.72)')
        : (currentTheme === 'light' ? 'rgba(33, 122, 91, 0.72)' : 'rgba(115, 211, 167, 0.72)');
      ctx.lineWidth = 1.5;
      ctx.moveTo(currentX, 0);
      ctx.lineTo(currentX, height);
      ctx.stroke();

      // Cursor dot
      ctx.beginPath();
      ctx.arc(currentX, points[currentX], 4, 0, Math.PI * 2);
      ctx.fillStyle = traceColor;
      ctx.fill();

      if (!document.hidden && !reducedMotion) animationId = requestAnimationFrame(render);
    };
    redrawRef.current = () => render(true, true);

    const onVisibilityChange = () => {
      if (document.hidden) {
        if (animationId !== null) cancelAnimationFrame(animationId);
        animationId = null;
      } else if (!reducedMotion && animationId === null) {
        animationId = requestAnimationFrame(render);
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    const onThemeChange = () => { if (reducedMotion) render(true, true); };
    const onMotionChange = event => {
      reducedMotion = event.matches;
      if (animationId !== null) cancelAnimationFrame(animationId);
      animationId = null;
      if (reducedMotion) render(true);
      else if (!document.hidden) animationId = requestAnimationFrame(render);
    };
    window.addEventListener('bio-tesseract-theme-change', onThemeChange);
    motionPreference.addEventListener('change', onMotionChange);
    if (reducedMotion) render(true);
    else if (!document.hidden) animationId = requestAnimationFrame(render);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('bio-tesseract-theme-change', onThemeChange);
      motionPreference.removeEventListener('change', onMotionChange);
      if (animationId !== null) cancelAnimationFrame(animationId);
      samplesRef.current = null;
      redrawRef.current = null;
    };
  }, []);

  const inspectPoint = (event) => {
    const canvas = canvasRef.current; const samples = samplesRef.current;
    if (!canvas || !samples) return;
    const bounds = canvas.getBoundingClientRect();
    const index = Math.max(0, Math.min(canvas.width - 1, Math.floor(((event.clientX - bounds.left) / bounds.width) * canvas.width)));
    const timestamp = samples.wallClockStart + samples.sampleTimes[index] * 1000;
    const next = { index, value: samples.sampleValues[index], timestamp, unit: 'a.u.' };
    inspectionRef.current = index; setInspection(next);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) redrawRef.current?.();
  };
  const moveInspection = delta => {
    const samples = samplesRef.current;
    if (!samples) return;
    const index = Math.max(0, Math.min(samples.sampleValues.length - 1, (inspectionRef.current ?? samples.sampleValues.length - 1) + delta));
    const timestamp = samples.wallClockStart + samples.sampleTimes[index] * 1000;
    inspectionRef.current = index; setInspection({ index, value: samples.sampleValues[index], timestamp, unit: 'a.u.' });
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) redrawRef.current?.();
  };

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
        <div className="biomonitor-canvas-frame" role="group" aria-label="Inspect procedural waveform sample" tabIndex={0}
          onPointerMove={inspectPoint}
          onPointerDown={inspectPoint}
          onPointerLeave={event => { if (event.pointerType !== 'touch') { inspectionRef.current = null; setInspection(null); } }}
          onKeyDown={event => { if (event.key === 'ArrowLeft') moveInspection(-1); else if (event.key === 'ArrowRight') moveInspection(1); }}>
          <canvas
            ref={canvasRef}
            width={840}
            height={300}
            role="img"
            aria-label={`${waveformMode === 'PPG' ? 'Procedural PPG pulse waveform' : `Procedural ECG ${waveformMode} waveform`} for ${formatReading(heartRate)} beats per minute; simulation display, not a sensor feed`}
          >
          </canvas>
          {inspection && <div className="biomonitor-inspection" style={{ left: `${Math.max(5, Math.min(95, inspection.index / 840 * 100))}%` }} role="status" aria-live="polite">
            <strong>{Number(inspection.value.toPrecision(8)).toString()} {inspection.unit}</strong>
            <time>{formatSampleTimestamp(inspection.timestamp)}</time>
          </div>}
        </div>
      </figure>

      <div className="biomonitor-mode-controls">
        <div className="biomonitor-mode-controls__heading">
          <span>Display mode</span>
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
