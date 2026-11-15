'use client';

import React from 'react';
import CrewPortrait from './CrewPortrait';

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
  onAcknowledge,
  selectedAlert,
  onSelectAlert
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
          <h1>Crew &amp; alerts</h1>
        </div>
        <div className="crew-mission-context">
          <span className="crew-mission-context__mark" aria-hidden="true">◎</span>
          <span><small>CREW ON MANIFEST</small><strong>{crew.length} <span>members</span></strong></span>
        </div>
      </header>

      <section className="crew-roster-section" aria-labelledby="crew-roster-title">
        <div className="crew-section-heading">
          <div><h2 id="crew-roster-title">Crew roster</h2></div>
        </div>

        {warningCrew.length > 0 && (
          <div className="crew-anomaly-note" role="status" aria-live="polite">
            <span className="crew-anomaly-note__symbol" aria-hidden="true">!</span>
            <span><strong>Crew warning</strong> · {warningCrew.map(member => member.name).join(', ')}</span>
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
                      <CrewPortrait member={member} className="crew-record__portrait" />
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
                </button>
              );
            })}
          </div>
        ) : (
          <p className="crew-empty-state">No crew records are available.</p>
        )}
      </section>

      <section className="crew-alerts-section" aria-labelledby="crew-alerts-title">
        <div className="crew-section-heading crew-section-heading--alerts">
          <div><h2 id="crew-alerts-title">Mission alert log</h2></div>
        </div>

        <div className="crew-alert-summary" aria-label="Alert summary" role="status" aria-live="polite">
          <div className="crew-alert-total"><small>ACTIVE CONDITIONS</small><strong>{activeAlerts.length}</strong></div>
          <div className="crew-alert-count crew-alert-count--critical"><span className="crew-alert-count__mark" aria-hidden="true">!</span><span><small>CRITICAL</small><strong>{criticalCount}</strong></span></div>
          <div className="crew-alert-count crew-alert-count--caution"><span className="crew-alert-count__mark" aria-hidden="true">△</span><span><small>CAUTION</small><strong>{cautionCount}</strong></span></div>
          <div className="crew-alert-count"><span className="crew-alert-count__mark" aria-hidden="true">✓</span><span><small>ACKNOWLEDGED</small><strong>{acknowledgedCount}</strong></span></div>
          <div className="crew-alert-count"><span className="crew-alert-count__mark" aria-hidden="true">↗</span><span><small>RESOLVED</small><strong>{resolvedCount}</strong></span></div>
        </div>

        {activeAlerts.length === 0 && (
          <div className="crew-no-active" role="status"><span aria-hidden="true">✓</span><p><strong>No active conditions</strong></p></div>
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
                    <button type="button" className="crew-alert-select" aria-pressed={selectedAlert?.id === alert.id} onClick={() => onSelectAlert?.(alert.id)}>
                      <span className="crew-alert-event__title-row"><h3>{alert.title}</h3><span className={`crew-alert-lifecycle${alert.resolved ? ' crew-alert-lifecycle--resolved' : ''}`}>{alert.resolved ? 'Resolved' : 'Active'}</span></span>
                      <span className="crew-alert-event__metadata"><span>{alert.id}</span><span>{alert.subsystem}</span>{alert.time && <time>{alert.time}</time>}</span>
                      <span className="crew-alert-event__association">{alert.crewId ? `Crew · ${crew.find(member => member.id === alert.crewId)?.name || 'record unavailable'}` : 'No crew link'}</span>
                    </button>
                  </div>
                  <div className="crew-alert-event__action">
                    {alert.acknowledged ? (
                      <span className="crew-acknowledged"><span aria-hidden="true">✓</span>Acknowledged</span>
                    ) : onAcknowledge ? (
                      <button type="button" onClick={() => onAcknowledge(alert.id)} aria-label={`Acknowledge alert ${alert.id}: ${alert.title}`}>Acknowledge</button>
                    ) : <span className="crew-acknowledged">Unacknowledged</span>}
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <div className="crew-empty-state crew-empty-state--alerts"><strong>No recorded events.</strong></div>
        )}

        {selectedAlert && (
          <aside className="crew-selected-alert" aria-label="Selected shared event details" aria-live="polite">
            <h3>{selectedAlert.title}</h3>
            <p>{selectedAlert.id} · {selectedAlert.subsystem || 'Subsystem unspecified'} · {selectedAlert.resolved ? 'Resolved' : 'Active'} · {selectedAlert.acknowledged ? 'Acknowledged' : 'Awaiting acknowledgement'}</p>
            <p>{selectedAlert.crewId ? `Crew · ${crew.find(member => member.id === selectedAlert.crewId)?.name || 'record unavailable'}` : 'No crew link'}</p>
          </aside>
        )}

      </section>
    </div>
  );
}
