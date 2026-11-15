'use client';

import React from 'react';
import LiveEcgChart from './LiveEcgChart';
import HistoricalTelemetryPanel from '../telemetry/HistoricalTelemetryPanel';
import CrewPortrait from '../crew/CrewPortrait';

const displayValue = (value, decimals = 0) => (
  Number.isFinite(value) ? Number(value).toFixed(decimals).replace(/\.0$/, '') : '—'
);

const getStatusTone = (status) => {
  if (status === 'Nominal') return 'nominal';
  if (status === 'Warning') return 'warning';
  if (status === 'Critical') return 'critical';
  return 'unknown';
};

export default function BioMonitorSection({ activeAstronaut, crew = [], onSelectAstronaut }) {
  const hr = activeAstronaut?.hr;
  const spo2 = activeAstronaut?.spo2;
  const bpSys = activeAstronaut?.bpSys;
  const bpDia = activeAstronaut?.bpDia;
  const respRate = activeAstronaut?.respRate;
  const stress = activeAstronaut?.stress;
  const map = Number.isFinite(bpSys) && Number.isFinite(bpDia)
    ? Math.round((2 * bpDia + bpSys) / 3)
    : undefined;
  const pulsePressure = Number.isFinite(bpSys) && Number.isFinite(bpDia)
    ? bpSys - bpDia
    : undefined;
  const statusTone = getStatusTone(activeAstronaut?.status);
  const warningCrew = crew.filter((member) => member.status === 'Warning');

  return (
    <section className="biomonitor-section" aria-labelledby="biomonitor-title">
      <header className="biomonitor-page-heading">
        <div>
          <h1 id="biomonitor-title">Bio-Monitor</h1>
        </div>
        <div className={`biomonitor-status biomonitor-status--${statusTone}`} role="status" aria-live="polite">
          <span className="biomonitor-status__symbol" aria-hidden="true">
            {statusTone === 'nominal' ? '✓' : statusTone === 'warning' ? '!' : statusTone === 'critical' ? '×' : '—'}
          </span>
          <span>
            <span className="biomonitor-status__label">SELECTED CREW STATUS</span>
            <span className="biomonitor-status__value">{activeAstronaut?.status || 'Unknown'}</span>
          </span>
        </div>
      </header>

      {warningCrew.length > 0 && (
        <div className="biomonitor-anomaly-note" role="status">
          <span className="biomonitor-anomaly-note__mark" aria-hidden="true">!</span>
          <span>
            <strong>SIMULATED ANOMALY</strong>
            <span> Warning status is active for {warningCrew.map((member) => member.name).join(', ')}.</span>
          </span>
        </div>
      )}

      <section className="biomonitor-crew-context" aria-labelledby="biomonitor-crew-title">
        <div className="biomonitor-crew-context__heading">
          <div>
            <h2 id="biomonitor-crew-title">{activeAstronaut?.name || 'Crew member unavailable'}</h2>
            <p>{activeAstronaut ? `${activeAstronaut.id} · ${activeAstronaut.role}` : 'Select an available crew member.'}</p>
          </div>
          <span className={`biomonitor-crew-context__state biomonitor-crew-context__state--${statusTone}`}>
            <span aria-hidden="true">{statusTone === 'nominal' ? '✓' : statusTone === 'warning' ? '!' : statusTone === 'critical' ? '×' : '—'}</span>
            {activeAstronaut?.status?.toUpperCase() || 'UNKNOWN'}
          </span>
        </div>
        <div className="biomonitor-crew-options" role="group" aria-label="Select monitored crew member">
          {crew.map((member) => {
            const selected = member.id === activeAstronaut?.id;
            const tone = getStatusTone(member.status);
            return (
              <button
                key={member.id}
                type="button"
                className={`biomonitor-crew-option${selected ? ' biomonitor-crew-option--selected' : ''}`}
                aria-pressed={selected}
                aria-label={`Monitor ${member.name}, ${member.role}, telemetry ${member.status}`}
                onClick={() => onSelectAstronaut?.(member.id)}
              >
                <CrewPortrait member={member} className="biomonitor-crew-option__portrait" />
                <span className="biomonitor-crew-option__copy">
                  <span className="biomonitor-crew-option__name">{member.name}</span>
                  <span className="biomonitor-crew-option__role">{member.role}</span>
                </span>
                <span className={`biomonitor-crew-option__status biomonitor-crew-option__status--${tone}`}>
                  <span aria-hidden="true">{tone === 'nominal' ? '✓' : tone === 'warning' ? '!' : tone === 'critical' ? '×' : '—'}</span>
                  {member.status.toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="biomonitor-workspace">
        <section className="biomonitor-waveform-panel" aria-labelledby="biomonitor-waveform-title">
          <div className="biomonitor-panel-heading">
            <div>
              <h2 id="biomonitor-waveform-title">Cardiac &amp; pulse signals</h2>
            </div>
            <span className="biomonitor-subject-tag">{activeAstronaut?.id || 'NO SUBJECT'}</span>
          </div>
          <LiveEcgChart
            heartRate={hr}
            spO2={spo2}
            bpSys={bpSys}
            bpDia={bpDia}
            respRate={respRate}
            statusTone={statusTone}
          />
        </section>

        <aside className="biomonitor-reference-column" aria-label="Derived parameters">
          <section className="biomonitor-reference-panel" aria-labelledby="biomonitor-hemodynamics-title">
            <div className="biomonitor-reference-heading">
              <div>
                <h2 id="biomonitor-hemodynamics-title">Hemodynamics</h2>
              </div>
            </div>
            <dl className="biomonitor-hemodynamic-list">
              <div><dt>Mean arterial pressure</dt><dd>{displayValue(map)} <small>mmHg</small></dd></div>
              <div><dt>Pulse pressure</dt><dd>{displayValue(pulsePressure)} <small>mmHg</small></dd></div>
            </dl>
          </section>

          <section className="biomonitor-stress-panel" aria-labelledby="biomonitor-stress-title">
            <div className="biomonitor-stress-panel__heading">
              <div>
                <h2 id="biomonitor-stress-title">Stress index</h2>
              </div>
              <p>{displayValue(stress)}<span>%</span></p>
            </div>
            <div
              className="biomonitor-stress-track"
              role="progressbar"
              aria-label="Illustrative stress simulation input"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Number.isFinite(stress) ? stress : undefined}
              aria-valuetext={Number.isFinite(stress) ? `${stress} percent, simulation input` : 'Unavailable'}
            >
              <span style={{ width: `${Number.isFinite(stress) ? Math.min(100, Math.max(0, stress)) : 0}%` }} />
            </div>
          </section>
        </aside>
      </div>

      <HistoricalTelemetryPanel group="physiology" />

    </section>
  );
}
