'use client';

import React, { useRef, useEffect } from 'react';
import { useTheme } from '../theme/ThemeProvider';

const formatValue = (value, digits = 0) => {
  if (!Number.isFinite(value)) return '—';
  return Number(value).toFixed(digits).replace(/\.0$/, '');
};

const getMissionTone = (status) => {
  if (status === 'CRITICAL') return 'critical';
  if (status === 'CAUTION') return 'warning';
  if (status === 'NOMINAL') return 'nominal';
  return 'unknown';
};

const getAlertTone = (severity, resolved) => {
  if (resolved) return 'resolved';
  if (severity === 'CRITICAL') return 'critical';
  if (severity === 'CAUTION') return 'warning';
  if (severity === 'NOMINAL') return 'nominal';
  return 'unknown';
};

export default function OverviewSection({
  crew = [],
  activeAstronaut,
  alerts = [],
  onAcknowledge,
  onSelectAstronaut,
  missionStatus = 'CAUTION',
  isAlarmActive,
  onToggleAlarm,
  onNavigate,
}) {
  const canvasRef = useRef(null);
  const { theme } = useTheme();
  const hr = activeAstronaut?.hr;
  const spo2 = activeAstronaut?.spo2;
  const bpSys = activeAstronaut?.bpSys;
  const bpDia = activeAstronaut?.bpDia;
  const suitP = activeAstronaut?.suitP;
  const o2 = activeAstronaut?.o2;
  const respRate = activeAstronaut?.respRate;
  const missionTone = getMissionTone(missionStatus);
  const activeAlerts = alerts.filter((alert) => !alert.resolved && ['CRITICAL', 'CAUTION'].includes(alert.severity));
  const criticalCount = activeAlerts.filter((alert) => alert.severity === 'CRITICAL').length;
  const cautionCount = activeAlerts.filter((alert) => alert.severity === 'CAUTION').length;
  const warningCrew = crew.filter((member) => member.status === 'Warning');
  const nominalCrewCount = crew.filter((member) => member.status === 'Nominal').length;
  const o2Readings = crew.map((member) => member.o2).filter(Number.isFinite);
  const oxygenRange = o2Readings.length
    ? `${formatValue(Math.min(...o2Readings))}–${formatValue(Math.max(...o2Readings))}%`
    : '—';
  const anomalyAlert = alerts.find((alert) => alert.severity === 'CRITICAL' && !alert.resolved);
  const anomalyOwner = warningCrew[0];

  // Procedural ECG preview. The waveform remains a display simulation, not a sensor feed.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !Number.isFinite(hr)) return undefined;

    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;

    const width = canvas.width;
    const height = canvas.height;
    const chartTokens = getComputedStyle(canvas);
    const chartBackground = chartTokens.getPropertyValue('--dashboard-chart-bg').trim() || '#101820';
    const traceColor = chartTokens.getPropertyValue('--status-nominal').trim() || '#54C79A';
    let currentX = 0;
    const points = new Array(width).fill(height / 2);
    let animationId = null;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const startTime = performance.now();

    const getEcgSample = (time) => {
      const period = 60 / Math.max(40, hr);
      const normalizedTime = (time % period) / period;
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

    const render = (staticFrame = false) => {
      if (staticFrame) {
        const period = 60 / Math.max(40, hr);
        for (let x = 0; x < width; x++) points[x] = height / 2 - getEcgSample((x / width) * period * 4);
        currentX = width;
      } else {
        const elapsed = (performance.now() - startTime) / 1000;
        const yValue = height / 2 - getEcgSample(elapsed);
        for (let index = 0; index < 3; index++) {
          points[currentX] = yValue;
          currentX = (currentX + 1) % width;
        }
      }

      ctx.fillStyle = chartBackground;
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = theme === 'light' ? 'rgba(23, 35, 56, 0.12)' : 'rgba(232, 222, 237, 0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height / 2);
      ctx.lineTo(width, height / 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.strokeStyle = traceColor;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      for (let x = 0; x < width; x++) {
        if (!staticFrame && Math.abs(x - currentX) < 10) continue;
        if (x === 0 || (!staticFrame && Math.abs(x - currentX) === 10)) ctx.moveTo(x, points[x]);
        else ctx.lineTo(x, points[x]);
      }
      ctx.stroke();

      if (staticFrame) return;

      ctx.beginPath();
      ctx.arc(currentX, points[currentX], 3.5, 0, Math.PI * 2);
      ctx.fillStyle = theme === 'light' ? '#9A587C' : '#E09AC0';
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
  }, [hr, theme]);

  return (
    <section className="mission-overview" aria-labelledby="mission-overview-title">
      <header className="overview-page-heading">
        <div>
          <p className="overview-eyebrow">MISSION OPERATIONS <span aria-hidden="true">/</span> SITUATIONAL AWARENESS</p>
          <h1 id="mission-overview-title">Mission overview</h1>
          <p className="overview-page-heading__description">Crew health and life-support telemetry at a glance.</p>
        </div>
        <div className={`overview-mission-status overview-mission-status--${missionTone}`} role="status" aria-live="polite">
          <span className="overview-mission-status__symbol" aria-hidden="true">
            {missionTone === 'nominal' ? '✓' : missionTone === 'warning' ? '!' : missionTone === 'critical' ? '×' : '—'}
          </span>
          <span>
            <span className="overview-mission-status__label">MISSION STATUS</span>
            <span className="overview-mission-status__value">{missionStatus}</span>
          </span>
        </div>
      </header>

      {isAlarmActive && (
        <section className="overview-anomaly-banner" aria-labelledby="overview-anomaly-title">
          <span className="overview-anomaly-banner__mark" aria-hidden="true">!</span>
          <div className="overview-anomaly-banner__copy">
            <p className="overview-anomaly-banner__eyebrow">SIMULATED ANOMALY ACTIVE</p>
            <h2 id="overview-anomaly-title">{anomalyAlert?.title || 'Physiological telemetry anomaly'}</h2>
            <p>
              {anomalyAlert?.subsystem || 'Crew telemetry'}
              {anomalyAlert?.time ? ` · ${anomalyAlert.time}` : ''}
              {anomalyOwner ? ` · Affects ${anomalyOwner.name}` : ''}
            </p>
          </div>
          <button type="button" className="overview-anomaly-banner__action" onClick={() => onToggleAlarm?.()}>
            Resolve simulation
          </button>
        </section>
      )}

      <section className="overview-at-a-glance" aria-label="Mission health summary">
        <article className="overview-summary-item overview-summary-item--crew">
          <span className="overview-summary-item__index">01</span>
          <div>
            <h2>Crew telemetry</h2>
            <p className="overview-summary-item__value">{nominalCrewCount}<span> / {crew.length || '—'}</span></p>
            <p className="overview-summary-item__detail">
              {warningCrew.length
                ? `${warningCrew.length} crew member${warningCrew.length === 1 ? '' : 's'} need attention`
                : crew.length > 0 && nominalCrewCount === crew.length ? 'Crew readings nominal' : 'Crew condition unavailable'}
            </p>
          </div>
        </article>
        <article className={`overview-summary-item${activeAlerts.length ? ' overview-summary-item--alerts' : ''}${criticalCount ? ' overview-summary-item--critical' : ''}`}>
          <span className="overview-summary-item__index">02</span>
          <div>
            <h2>Open conditions</h2>
            <p className="overview-summary-item__value">{activeAlerts.length}</p>
            <p className="overview-summary-item__detail">
              {criticalCount ? `${criticalCount} critical` : 'No critical conditions'}
              {cautionCount ? ` · ${cautionCount} caution` : ''}
            </p>
          </div>
        </article>
        <article className="overview-summary-item overview-summary-item--systems">
          <span className="overview-summary-item__index">03</span>
          <div>
            <h2>Crew oxygen range</h2>
            <p className="overview-summary-item__value">{oxygenRange}</p>
            <p className="overview-summary-item__detail">Pack telemetry · simulated</p>
          </div>
        </article>
      </section>

      <section className="overview-crew-section" aria-labelledby="overview-crew-title">
        <div className="overview-section-heading">
          <div>
            <p className="overview-eyebrow">CREW STATUS</p>
            <h2 id="overview-crew-title">Crew roster</h2>
          </div>
          <p>Select a crew member to inspect their telemetry.</p>
        </div>

        <div className="overview-crew-grid">
          {crew.map((member) => {
            const isSelected = member.id === activeAstronaut?.id;
            const isWarning = member.status === 'Warning';
            return (
              <button
                type="button"
                key={member.id}
                className={`overview-crew-member${isSelected ? ' overview-crew-member--selected' : ''}${isWarning ? ' overview-crew-member--warning' : ''}`}
                aria-pressed={isSelected}
                aria-label={`Select ${member.name}, ${member.role}, ${member.status}, heart rate ${formatValue(member.hr)} beats per minute, blood oxygen ${formatValue(member.spo2, 1)} percent`}
                onClick={() => onSelectAstronaut?.(member.id)}
              >
                <span className="overview-crew-member__topline">
                  <span className="overview-crew-member__initials" aria-hidden="true">{member.initials}</span>
                  <span className={`overview-crew-member__status overview-crew-member__status--${isWarning ? 'warning' : 'nominal'}`}>
                    <span aria-hidden="true">{isWarning ? '!' : '✓'}</span>{isWarning ? 'ATTENTION' : 'NOMINAL'}
                  </span>
                  {isSelected && <span className="overview-crew-member__selected">SELECTED</span>}
                </span>
                <span className="overview-crew-member__name">{member.name}</span>
                <span className="overview-crew-member__role">{member.id} <span aria-hidden="true">·</span> {member.role}</span>
                <span className="overview-crew-member__readings">
                  <span><span>HR</span><strong>{formatValue(member.hr)} <small>bpm</small></strong></span>
                  <span><span>SpO₂</span><strong>{formatValue(member.spo2, 1)}<small>%</small></strong></span>
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="overview-detail-grid">
        <div className="overview-detail-primary">
          <section className="overview-panel overview-subject-panel" aria-labelledby="overview-subject-title">
            <div className="overview-panel-heading">
              <div>
                <p className="overview-eyebrow">SELECTED CREW TELEMETRY</p>
                <h2 id="overview-subject-title">{activeAstronaut?.name || 'No crew member selected'}</h2>
                {activeAstronaut?.role && <p>{activeAstronaut.role}</p>}
              </div>
              {activeAstronaut && (
                <span className={`overview-text-status overview-text-status--${activeAstronaut.status === 'Warning' ? 'warning' : 'nominal'}`}>
                  <span aria-hidden="true">{activeAstronaut.status === 'Warning' ? '!' : '✓'}</span>
                  {activeAstronaut.status.toUpperCase()}
                </span>
              )}
            </div>
            <dl className="overview-vitals-grid">
              <div className="overview-vital overview-vital--heart">
                <dt>Heart rate</dt>
                <dd>{formatValue(hr)} <span>bpm</span></dd>
              </div>
              <div className="overview-vital">
                <dt>Blood oxygen · SpO₂</dt>
                <dd>{formatValue(spo2, 1)}<span>%</span></dd>
              </div>
              <div className="overview-vital">
                <dt>Blood pressure</dt>
                <dd>{formatValue(bpSys)}/{formatValue(bpDia)} <span>mmHg</span></dd>
              </div>
              <div className="overview-vital">
                <dt>Respiration</dt>
                <dd>{formatValue(respRate)} <span>/ min</span></dd>
              </div>
            </dl>
            <p className="overview-data-note">Simulated crew readings · demonstration data, not medical measurements.</p>
          </section>

          <section className="overview-panel overview-ecg-panel" aria-labelledby="overview-ecg-title">
            <div className="overview-panel-heading overview-panel-heading--compact">
              <div>
                <p className="overview-eyebrow">PROCEDURAL DISPLAY</p>
                <h2 id="overview-ecg-title">ECG waveform preview</h2>
              </div>
              <button type="button" className="overview-text-link" onClick={() => onNavigate?.('biomonitor')}>
                Open Bio-Monitor <span aria-hidden="true">→</span>
              </button>
            </div>
            <figure className="overview-ecg-figure">
              <div className="overview-ecg-canvas-wrap">
                <canvas
                  ref={canvasRef}
                  width={700}
                  height={180}
                  role="img"
                  aria-label={`Procedural ECG waveform preview for ${activeAstronaut?.name || 'selected crew member'}; simulation at ${formatValue(hr)} beats per minute`}
                >
                  Procedural ECG waveform preview. This is simulated display data.
                </canvas>
              </div>
              <figcaption><span>Waveform uses selected crew heart-rate input</span><span>Not a sensor feed</span></figcaption>
            </figure>
          </section>
        </div>

        <aside className="overview-detail-secondary" aria-label="Life support and medical tools">
          <section className="overview-panel overview-life-support" aria-labelledby="overview-life-support-title">
            <div className="overview-panel-heading overview-panel-heading--compact">
              <div>
                <p className="overview-eyebrow">SELECTED CREW MEMBER</p>
                <h2 id="overview-life-support-title">Suit telemetry</h2>
              </div>
              <button type="button" className="overview-text-link" onClick={() => onNavigate?.('lifesupport')}>
                Details <span aria-hidden="true">→</span>
              </button>
            </div>
            <dl className="overview-system-readings">
              <div><dt>Suit pressure</dt><dd>{formatValue(suitP, 1)} <span>PSI</span></dd></div>
              <div><dt>Primary oxygen</dt><dd>{formatValue(o2)}<span>%</span></dd></div>
            </dl>
            <p className="overview-data-note">Crew pack telemetry · simulated values.</p>
          </section>

          <section className="overview-advisor-callout" aria-labelledby="overview-advisor-title">
            <div className="overview-advisor-callout__eyebrow">SIMULATION TOOL</div>
            <h2 id="overview-advisor-title">Medical Advisor</h2>
            <p>Open the procedural advisory demonstration. It does not provide a clinical diagnosis.</p>
            <button type="button" className="overview-advisor-callout__action" onClick={() => onNavigate?.('medical')}>
              Open advisor <span aria-hidden="true">→</span>
            </button>
          </section>
        </aside>
      </div>

      <section className="overview-alerts" aria-labelledby="overview-alerts-title">
        <div className="overview-section-heading overview-alerts__heading">
          <div>
            <p className="overview-eyebrow">OPERATIONAL EVENTS</p>
            <h2 id="overview-alerts-title">Recent alerts</h2>
          </div>
          <button type="button" className="overview-text-link" onClick={() => onNavigate?.('crew')}>
            View all events <span aria-hidden="true">→</span>
          </button>
        </div>

        {alerts.length ? (
          <ul className="overview-alert-list">
            {alerts.slice(0, 4).map((alert) => {
              const tone = getAlertTone(alert.severity, alert.resolved);
              return (
                <li key={alert.id} className={`overview-alert overview-alert--${tone}`}>
                  <span className="overview-alert__severity">{alert.resolved ? 'RESOLVED' : alert.severity || 'UNKNOWN'}</span>
                  <div className="overview-alert__content">
                    <p className="overview-alert__title">{alert.title}</p>
                    <p className="overview-alert__meta">
                      <span>{alert.subsystem}</span>
                      {alert.time && <><span aria-hidden="true">·</span><time>{alert.time}</time></>}
                    </p>
                  </div>
                  <div className="overview-alert__action">
                    {alert.acknowledged ? (
                      <span className="overview-alert__acknowledged"><span aria-hidden="true">✓</span> Acknowledged</span>
                    ) : onAcknowledge ? (
                      <button type="button" onClick={() => onAcknowledge(alert.id)} aria-label={`Acknowledge alert: ${alert.title}`}>
                        Acknowledge
                      </button>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="overview-alerts__empty">No mission events have been recorded.</p>
        )}
      </section>

      <p className="overview-simulation-disclosure">Demonstration simulation · No spacecraft hardware, live sensors, or clinical systems are connected.</p>
    </section>
  );
}
