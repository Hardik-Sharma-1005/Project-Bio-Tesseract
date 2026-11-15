'use client';

import React, { useRef, useEffect } from 'react';
import { useTheme } from '../theme/ThemeProvider';
import HistoricalTelemetryPanel from '../telemetry/HistoricalTelemetryPanel';

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

const getSubsystemDestination = (subsystem) => {
  if (['Cardio-Bio', 'Bio-Core'].includes(subsystem)) return { id: 'biomonitor', label: 'Open Bio-Monitor' };
  if (subsystem === 'PLSS') return { id: 'lifesupport', label: 'Open Life Support' };
  return null;
};

export default function OverviewSection({
  crew = [],
  activeAstronaut,
  alerts = [],
  selectedAlert,
  onSelectAlert,
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
  const anomalyAlert = alerts.find((alert) => alert.severity === 'CRITICAL' && !alert.resolved);
  const anomalyOwner = anomalyAlert?.crewId ? crew.find(member => member.id === anomalyAlert.crewId) : null;
  const selectedAlertCrew = selectedAlert?.crewId ? crew.find(member => member.id === selectedAlert.crewId) : null;
  const selectedAlertDestination = getSubsystemDestination(selectedAlert?.subsystem);

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

  const navigateForAlert = () => {
    if (!selectedAlertDestination) return;
    if (selectedAlertCrew) onSelectAstronaut?.(selectedAlertCrew.id);
    onNavigate?.(selectedAlertDestination.id);
  };

  return (
    <section className="mission-overview overview-v2" aria-labelledby="mission-overview-title">
      <header className="overview-v2-heading">
        <div>
          <p className="overview-eyebrow">MISSION OPERATIONS <span aria-hidden="true">/</span> SITUATIONAL AWARENESS</p>
          <h1 id="mission-overview-title">Mission overview</h1>
          <p>Shared crew and subsystem picture · demonstration environment</p>
        </div>
        <div className={`overview-v2-status overview-v2-status--${missionTone}`} role="status" aria-live="polite">
          <span className="overview-v2-status__dot" aria-hidden="true" />
          <span><small>MISSION STATE</small><strong>{missionStatus}</strong></span>
          <span className="overview-v2-status__sim">SIMULATED</span>
        </div>
      </header>

      {isAlarmActive && (
        <div className="overview-v2-anomaly" role="status">
          <span className="overview-v2-anomaly__icon" aria-hidden="true">!</span>
          <span><strong>Demonstration anomaly active</strong><small>{anomalyOwner?.name || 'Crew association unavailable'} · {anomalyAlert?.subsystem || 'Cardio-Bio'}</small></span>
          <button type="button" onClick={() => onToggleAlarm?.()}>Resolve simulation</button>
        </div>
      )}

      <HistoricalTelemetryPanel group="physiology" mode="compact" onNavigate={onNavigate} />

      <section className="overview-command-strip" aria-label="Mission command summary">
        <div className="overview-command-strip__lead"><small>CREW ON MANIFEST</small><strong>{crew.length}<span> members</span></strong><p>{nominalCrewCount} nominal{warningCrew.length ? ` · ${warningCrew.length} attention` : ''}</p></div>
        <div><small>OPEN CONDITIONS</small><strong className={criticalCount ? 'is-critical' : ''}>{activeAlerts.length}</strong><p>{criticalCount} critical · {cautionCount} caution</p></div>
        <div><small>SELECTED CREW</small><strong className="overview-command-strip__selected">{activeAstronaut?.id || '—'}</strong><p>{activeAstronaut?.name || 'No crew selected'}</p></div>
        <div><small>EVENT RECORD</small><strong>{alerts.length}</strong><p>Recorded demonstration events</p></div>
      </section>

      <div className="overview-ops-grid">
        <div className="overview-crew-workspace">
          <section className="overview-v2-panel overview-crew-picker" aria-labelledby="overview-crew-title">
            <div className="overview-v2-panel__heading">
              <div><p className="overview-eyebrow">PERSONNEL / SHARED SELECTION</p><h2 id="overview-crew-title">Crew roster</h2></div>
              <span>{crew.length} crew</span>
            </div>
            <div className="overview-crew-list" role="group" aria-label="Select crew member">
              {crew.map((member) => {
                const isSelected = member.id === activeAstronaut?.id;
                const isWarning = member.status === 'Warning';
                return (
                  <button key={member.id} type="button" className={`overview-crew-row${isSelected ? ' is-selected' : ''}${isWarning ? ' is-warning' : ''}`} aria-pressed={isSelected} onClick={() => onSelectAstronaut?.(member.id)}>
                    <span className="overview-crew-row__initials" aria-hidden="true">{member.initials}</span>
                    <span className="overview-crew-row__identity"><strong>{member.name}</strong><small>{member.role}</small></span>
                    <span className={`overview-crew-row__status${isWarning ? ' is-warning' : ''}`}><i aria-hidden="true" />{member.status || 'Unknown'}</span>
                    <span className="overview-crew-row__preview"><span>{formatValue(member.hr)} <small>bpm</small></span><span>{formatValue(member.spo2, 1)}<small>% SpO₂</small></span></span>
                    <span className="overview-crew-row__arrow" aria-hidden="true">{isSelected ? '●' : '›'}</span>
                  </button>
                );
              })}
              {!crew.length && <p className="overview-v2-empty">No crew records are available.</p>}
            </div>
          </section>

          <section className="overview-v2-panel overview-selected-crew" aria-labelledby="overview-subject-title">
            <div className="overview-v2-panel__heading overview-selected-crew__heading">
              <div><p className="overview-eyebrow">SELECTED CREW TELEMETRY · SIMULATED</p><h2 id="overview-subject-title">{activeAstronaut?.name || 'No crew member selected'}</h2><p>{activeAstronaut ? `${activeAstronaut.id} · ${activeAstronaut.role}` : 'Crew readings unavailable'}</p></div>
              {activeAstronaut && <span className={`overview-v2-crew-status${activeAstronaut.status === 'Warning' ? ' is-warning' : ''}`}><i aria-hidden="true" />{activeAstronaut.status}</span>}
            </div>
            <dl className="overview-v2-readings">
              <div className="is-primary"><dt>Heart rate</dt><dd>{formatValue(hr)} <small>bpm</small></dd></div>
              <div><dt>Blood oxygen · SpO₂</dt><dd>{formatValue(spo2, 1)}<small>%</small></dd></div>
              <div><dt>Blood pressure</dt><dd>{formatValue(bpSys)}/{formatValue(bpDia)}<small> mmHg</small></dd></div>
              <div><dt>Respiration</dt><dd>{formatValue(respRate)}<small> / min</small></dd></div>
              <div><dt>Stress input</dt><dd>{formatValue(activeAstronaut?.stress)}<small>%</small></dd></div>
              <div><dt>Suit pressure</dt><dd>{formatValue(suitP, 1)}<small> PSI</small></dd></div>
              <div><dt>Suit oxygen reserve</dt><dd>{formatValue(o2)}<small>%</small></dd></div>
            </dl>
            <p className="overview-v2-disclosure">Demonstration values only. SpO₂ is blood oxygen saturation; suit oxygen is a separate reserve measurement.</p>
            <div className="overview-v2-crew-actions">
              <button type="button" onClick={() => onNavigate?.('biomonitor')}>Open Bio-Monitor <span aria-hidden="true">→</span></button>
              <button type="button" onClick={() => onNavigate?.('lifesupport')}>Suit systems <span aria-hidden="true">→</span></button>
              <button type="button" onClick={() => onNavigate?.('medical')}>Medical Advisor <span aria-hidden="true">→</span></button>
            </div>
          </section>
        </div>

        <section className="overview-v2-panel overview-event-workspace" aria-labelledby="overview-events-title">
          <div className="overview-v2-panel__heading">
            <div><p className="overview-eyebrow">OPERATIONAL EVENTS / SHARED LOG</p><h2 id="overview-events-title">Alert timeline</h2></div>
            <button type="button" className="overview-v2-text-action" onClick={() => onNavigate?.('crew')}>Full event log <span aria-hidden="true">→</span></button>
          </div>
          {alerts.length ? (
            <ol className="overview-event-list" aria-label="Mission events">
              {alerts.map(alert => {
                const tone = getAlertTone(alert.severity, alert.resolved);
                const selected = selectedAlert?.id === alert.id;
                return (
                  <li key={alert.id} className={`overview-event${selected ? ' is-selected' : ''} overview-event--${tone}`}>
                    <button type="button" className="overview-event__select" onClick={() => onSelectAlert?.(alert.id)} aria-pressed={selected}>
                      <span className="overview-event__mark" aria-hidden="true">{alert.resolved ? '✓' : alert.severity === 'CRITICAL' ? '!' : alert.severity === 'CAUTION' ? '△' : '·'}</span>
                      <span className="overview-event__copy"><strong>{alert.title || 'Untitled event'}</strong><small>{alert.subsystem || 'Subsystem unspecified'}{alert.time ? ` · ${alert.time}` : ''}</small></span>
                      <span className="overview-event__severity">{alert.resolved ? 'RESOLVED' : alert.severity || 'UNKNOWN'}</span>
                    </button>
                    {!alert.acknowledged && onAcknowledge && <button className="overview-event__ack" type="button" onClick={() => onAcknowledge(alert.id)} aria-label={`Acknowledge ${alert.title}`}>Acknowledge</button>}
                    {alert.acknowledged && <span className="overview-event__acknowledged">✓ Acknowledged</span>}
                  </li>
                );
              })}
            </ol>
          ) : <p className="overview-v2-empty">No mission events have been recorded.</p>}

          <section className="overview-alert-inspector" aria-labelledby="overview-inspector-title" aria-live="polite">
            <div className="overview-alert-inspector__topline"><p className="overview-eyebrow">EVENT INSPECTOR</p>{selectedAlert && <span className={`overview-inspector-state overview-inspector-state--${getAlertTone(selectedAlert.severity, selectedAlert.resolved)}`}>{selectedAlert.resolved ? 'RESOLVED' : selectedAlert.severity || 'UNKNOWN'}</span>}</div>
            {selectedAlert ? (
              <>
                <h3 id="overview-inspector-title">{selectedAlert.title || 'Untitled event'}</h3>
                <dl className="overview-inspector-details">
                  <div><dt>Event ID</dt><dd>{selectedAlert.id}</dd></div>
                  <div><dt>Subsystem</dt><dd>{selectedAlert.subsystem || 'Not specified'}</dd></div>
                  {selectedAlert.time && <div><dt>Recorded time</dt><dd>{selectedAlert.time}</dd></div>}
                  <div><dt>Acknowledgement</dt><dd>{selectedAlert.acknowledged ? 'Acknowledged' : 'Awaiting acknowledgement'}</dd></div>
                  <div><dt>Lifecycle</dt><dd>{selectedAlert.resolved ? 'Resolved' : 'Active'}</dd></div>
                </dl>
                <p className="overview-inspector-association">{selectedAlertCrew ? <>Associated crew: <strong>{selectedAlertCrew.name}</strong> <span>· simulated anomaly record</span></> : 'No crew association is recorded for this event.'}</p>
                <div className="overview-inspector-actions">
                  {!selectedAlert.acknowledged && onAcknowledge && <button type="button" onClick={() => onAcknowledge(selectedAlert.id)}>Acknowledge event</button>}
                  {selectedAlertDestination && <button type="button" onClick={navigateForAlert}>{selectedAlertDestination.label} <span aria-hidden="true">→</span></button>}
                  <button type="button" className="is-secondary" onClick={() => onNavigate?.('crew')}>Open event log <span aria-hidden="true">→</span></button>
                </div>
                {selectedAlert.severity === 'CRITICAL' && selectedAlert.crewId && !selectedAlert.resolved && <p className="overview-inspector-resolution">Resolve this demonstration event using the mission header control.</p>}
              </>
            ) : <div className="overview-inspector-empty"><span aria-hidden="true">◎</span><h3 id="overview-inspector-title">Select an event to inspect</h3><p>Event details and supported crew context will appear here.</p></div>}
          </section>
        </section>
      </div>

      <section className="overview-v2-waveform" aria-label="Procedural waveform preview">
        <div><p className="overview-eyebrow">DISPLAY SIMULATION</p><strong>Procedural ECG preview</strong><span>Uses the selected crew heart-rate input · not a sensor feed</span></div>
        <canvas ref={canvasRef} width={700} height={180} role="img" aria-label={`Procedural ECG preview for ${activeAstronaut?.name || 'selected crew member'}, simulated at ${formatValue(hr)} beats per minute`}>Procedural ECG waveform preview. Simulated display data.</canvas>
      </section>
      <p className="overview-simulation-disclosure">No spacecraft hardware, live sensors, orbital tracking, or clinical systems are connected.</p>
    </section>
  );
}
