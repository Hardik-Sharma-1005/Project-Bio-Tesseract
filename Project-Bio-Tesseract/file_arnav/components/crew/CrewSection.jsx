'use client';

import React from 'react';

const getCrewTone = (status) => {
  if (status === 'Nominal') return 'nominal';
  if (status === 'Warning') return 'warning';
  return 'unknown';
};

const getSeverityTone = (severity, resolved) => {
  if (resolved) return 'resolved';
  if (severity === 'CRITICAL') return 'critical';
  if (severity === 'CAUTION') return 'warning';
  if (severity === 'NOMINAL') return 'nominal';
  return 'unknown';
};

export default function CrewSection({
  crew = [],
  activeAstronaut,
  onSelectAstronaut,
  alerts = [],
  onAcknowledge
}) {
  const activeAlerts = alerts.filter(alert => !alert.resolved && ['CRITICAL', 'CAUTION'].includes(alert.severity));
  const criticalCount = activeAlerts.filter(alert => alert.severity === 'CRITICAL').length;
  const cautionCount = activeAlerts.filter(alert => alert.severity === 'CAUTION').length;
  const acknowledgedCount = alerts.filter(alert => alert.acknowledged).length;
  const resolvedCount = alerts.filter(alert => alert.resolved).length;
  const warningCrew = crew.filter(member => member.status === 'Warning');

  return (
    <div className="crew-operations">
      <header className="crew-page-heading">
        <div>
          <p className="crew-eyebrow">MISSION OPERATIONS <span>/</span> CREW &amp; ALERTS</p>
          <h1>Crew &amp; alerts</h1>
          <p className="crew-page-heading__description">Crew roster and operational events from the Bio-Tesseract demonstration.</p>
        </div>
        <div className="crew-mission-context">
          <span className="crew-mission-context__mark" aria-hidden="true">◎</span>
          <span><small>CREW ON MANIFEST</small><strong>{crew.length} <span>members</span></strong></span>
        </div>
      </header>

      <section className="crew-roster-section" aria-labelledby="crew-roster-title">
        <div className="crew-section-heading">
          <div><p className="crew-eyebrow">PERSONNEL / LIVE DEMONSTRATION FEED</p><h2 id="crew-roster-title">Crew roster</h2></div>
          <p>Select a crew record to update the shared dashboard focus. Additional monitoring is available in Bio-Monitor.</p>
        </div>

        {warningCrew.length > 0 && (
          <div className="crew-anomaly-note" role="status" aria-live="polite">
            <span className="crew-anomaly-note__symbol" aria-hidden="true">!</span>
            <span><strong>Simulated crew warning</strong> · {warningCrew.map(member => member.name).join(', ')}. This is demonstration telemetry, not a real spacecraft event.</span>
          </div>
        )}

        {crew.length > 0 ? (
          <div className="crew-roster-grid">
            {crew.map(member => {
              const selected = member.id === activeAstronaut?.id;
              const tone = getCrewTone(member.status);
              const hasAnomaly = member.status === 'Warning';
              return (
                <button
                  key={member.id}
                  type="button"
                  aria-pressed={selected}
                  aria-label={`Select ${member.name}, ${member.role}, status ${member.status}`}
                  onClick={() => onSelectAstronaut?.(member.id)}
                  className={`crew-record${selected ? ' crew-record--selected' : ''}${hasAnomaly ? ' crew-record--warning' : ''}`}
                >
                  <span className="crew-record__topline">
                    <span className="crew-record__identity">
                      <span className="crew-record__initials" aria-hidden="true">{member.initials}</span>
                      <span className="crew-record__nameplate"><span className="crew-eyebrow">{member.id}</span><strong>{member.name}</strong><small>{member.role}</small></span>
                    </span>
                    <span className={`crew-status crew-status--${tone}`}><span aria-hidden="true">{tone === 'nominal' ? '✓' : tone === 'warning' ? '!' : '·'}</span>{member.status || 'Unknown'}</span>
                  </span>
                  <span className="crew-record__divider" />
                  <span className="crew-record__readings">
                    <span><small>HEART RATE</small><strong>{member.hr ?? '—'}<i> bpm</i></strong></span>
                    <span><small>SpO₂</small><strong>{member.spo2 ?? '—'}<i>%</i></strong></span>
                    <span><small>BLOOD PRESSURE</small><strong>{member.bpSys ?? '—'}/{member.bpDia ?? '—'}</strong></span>
                    <span><small>STRESS INPUT</small><strong>{member.stress ?? '—'}<i>%</i></strong></span>
                  </span>
                  <span className="crew-record__footer">
                    {hasAnomaly ? <span className="crew-anomaly-flag">Simulated anomaly associated with this crew record</span> : <span>Telemetry status from shared crew state</span>}
                    {selected && <span className="crew-selected-label">SELECTED</span>}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="crew-empty-state">No crew records are available.</p>
        )}
        <p className="crew-data-disclosure">Physiological readings and status are simulated demonstration values, not live astronaut measurements.</p>
      </section>

      <section className="crew-alerts-section" aria-labelledby="crew-alerts-title">
        <div className="crew-section-heading crew-section-heading--alerts">
          <div><p className="crew-eyebrow">EVENT MANAGEMENT / SHARED DASHBOARD STATE</p><h2 id="crew-alerts-title">Mission alert log</h2></div>
          <p>Severity, acknowledgement, and resolution are separate states.</p>
        </div>

        <div className="crew-alert-summary" aria-label="Alert summary" role="status" aria-live="polite">
          <div className="crew-alert-total"><small>ACTIVE CONDITIONS</small><strong>{activeAlerts.length}</strong><span>unresolved caution or critical events</span></div>
          <div className="crew-alert-count crew-alert-count--critical"><span className="crew-alert-count__mark" aria-hidden="true">!</span><span><small>CRITICAL</small><strong>{criticalCount}</strong></span></div>
          <div className="crew-alert-count crew-alert-count--caution"><span className="crew-alert-count__mark" aria-hidden="true">△</span><span><small>CAUTION</small><strong>{cautionCount}</strong></span></div>
          <div className="crew-alert-count"><span className="crew-alert-count__mark" aria-hidden="true">✓</span><span><small>ACKNOWLEDGED</small><strong>{acknowledgedCount}</strong></span></div>
          <div className="crew-alert-count"><span className="crew-alert-count__mark" aria-hidden="true">↗</span><span><small>RESOLVED</small><strong>{resolvedCount}</strong></span></div>
        </div>

        {activeAlerts.length === 0 && (
          <div className="crew-no-active" role="status"><span aria-hidden="true">✓</span><p><strong>No active conditions require attention.</strong><small>Unresolved critical and caution events: 0</small></p></div>
        )}

        <div className="crew-alert-feed-heading"><h3>Event feed</h3><span>{alerts.length} {alerts.length === 1 ? 'event' : 'events'} · newest first</span></div>
        {alerts.length > 0 ? (
          <ol className="crew-alert-feed" aria-label="Mission alerts, newest first" aria-live="polite">
            {alerts.map(alert => {
              const tone = getSeverityTone(alert.severity, alert.resolved);
              const severityLabel = alert.severity === 'NOMINAL' ? 'INFORMATIONAL' : alert.severity || 'UNKNOWN';
              return (
                <li key={alert.id} className={`crew-alert-event crew-alert-event--${tone}`}>
                  <span className="crew-alert-event__severity"><span aria-hidden="true">{tone === 'critical' ? '!' : tone === 'warning' ? '△' : tone === 'nominal' ? '✓' : '·'}</span>{severityLabel}</span>
                  <div className="crew-alert-event__body">
                    <div className="crew-alert-event__title-row"><h3>{alert.title}</h3><span className={`crew-alert-lifecycle${alert.resolved ? ' crew-alert-lifecycle--resolved' : ''}`}>{alert.resolved ? 'Resolved' : 'Active'}</span></div>
                    <p className="crew-alert-event__metadata"><span>{alert.id}</span><span>{alert.subsystem}</span>{alert.time && <time>{alert.time}</time>}</p>
                    <p className="crew-alert-event__association">System: {alert.subsystem || 'Not specified'} <span aria-hidden="true">·</span> Crew linkage is not recorded on this event.</p>
                  </div>
                  <div className="crew-alert-event__action">
                    {alert.acknowledged ? (
                      <span className="crew-acknowledged"><span aria-hidden="true">✓</span>Acknowledged</span>
                    ) : onAcknowledge ? (
                      <button type="button" onClick={() => onAcknowledge(alert.id)} aria-label={`Acknowledge alert ${alert.id}: ${alert.title}`}>Acknowledge</button>
                    ) : <span className="crew-acknowledged">Unacknowledged</span>}
                  </div>
                  <span className="crew-alert-event__state-note">Acknowledgement records operator receipt; it does not resolve the event.</span>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="crew-empty-state crew-empty-state--alerts"><strong>No alert events recorded.</strong><span>There are no current or historical events in the shared demonstration log.</span></div>
        )}

        {alerts.some(alert => alert.severity === 'CRITICAL' && !alert.resolved) && (
          <p className="crew-resolution-note">To resolve the simulated anomaly, use <strong>Resolve simulation</strong> in the mission header. This closes the shared demonstration event; no spacecraft hardware is contacted.</p>
        )}
        <p className="crew-alert-disclosure">All roster telemetry and alert events are simulated. They do not represent live crew sensors or actual spacecraft incidents.</p>
      </section>
    </div>
  );
}
