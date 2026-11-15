'use client';

import React from 'react';
import HistoricalTelemetryPanel from '../telemetry/HistoricalTelemetryPanel';
import CrewPortrait from '../crew/CrewPortrait';

const formatValue = (value, decimals = 0) => (
  Number.isFinite(value) ? Number(value).toFixed(decimals).replace(/\.0$/, '') : '—'
);

const getCrewStatusTone = (status) => {
  if (status === 'Nominal') return 'nominal';
  if (status === 'Warning') return 'warning';
  if (status === 'Critical') return 'critical';
  return 'unknown';
};

export default function LifeSupportSection({ activeAstronaut, crew = [], onSelectAstronaut }) {
  const suitPressure = activeAstronaut?.suitP;
  const suitOxygenReserve = activeAstronaut?.o2;
  const statusTone = getCrewStatusTone(activeAstronaut?.status);
  const warningCrew = crew.filter((member) => member.status === 'Warning');

  return (
    <section className="life-support-section" aria-labelledby="life-support-title">
      <header className="life-support-page-heading">
        <div>
          <h1 id="life-support-title">Life Support</h1>
        </div>
      </header>

      {warningCrew.length > 0 && (
        <div className="life-support-crew-warning" role="status">
          <span className="life-support-crew-warning__mark" aria-hidden="true">!</span>
          <p>
            <strong>CREW BIOMETRIC WARNING</strong>
            <span>{warningCrew.map((member) => member.name).join(', ')}</span>
          </p>
        </div>
      )}

      <section className="life-support-selected" aria-labelledby="life-support-selected-title">
        <div className="life-support-selected__identity">
          <CrewPortrait member={activeAstronaut} className="life-support-selected__portrait" />
          <div>
            <h2 id="life-support-selected-title">{activeAstronaut?.name || 'Crew member unavailable'}</h2>
            <p>{activeAstronaut ? `${activeAstronaut.id} · ${activeAstronaut.role}` : 'Select an available crew member.'}</p>
          </div>
        </div>
        <span className={`life-support-crew-status life-support-crew-status--${statusTone}`}>
          <span aria-hidden="true">{statusTone === 'nominal' ? '✓' : statusTone === 'warning' ? '!' : statusTone === 'critical' ? '×' : '—'}</span>
          CREW STATUS: {activeAstronaut?.status?.toUpperCase() || 'UNKNOWN'}
        </span>
      </section>

      <section className="life-support-resource-panel" aria-labelledby="life-support-resources-title">
        <div className="life-support-panel-heading">
          <div>
            <h2 id="life-support-resources-title">Suit resources</h2>
          </div>
          <span className="life-support-record-id">{activeAstronaut?.id || 'NO SUBJECT'}</span>
        </div>

        <dl className="life-support-primary-readings">
          <div className="life-support-reading life-support-reading--pressure">
            <dt><span className="life-support-reading__index">01</span> Suit internal pressure</dt>
            <dd>{formatValue(suitPressure, 1)} <span>PSI</span></dd>
          </div>
          <div className="life-support-reading life-support-reading--oxygen">
            <dt><span className="life-support-reading__index">02</span> Suit oxygen reserve</dt>
            <dd>{formatValue(suitOxygenReserve)}<span>%</span></dd>
            <div
              className="life-support-oxygen-scale"
              role="progressbar"
              aria-label="Suit oxygen reserve percentage"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Number.isFinite(suitOxygenReserve) ? Math.max(0, Math.min(100, suitOxygenReserve)) : undefined}
              aria-valuetext={Number.isFinite(suitOxygenReserve) ? `${suitOxygenReserve} percent, simulated suit reserve` : 'Unavailable'}
            >
              <span style={{ width: `${Number.isFinite(suitOxygenReserve) ? Math.max(0, Math.min(100, suitOxygenReserve)) : 0}%` }} />
            </div>
          </div>
        </dl>
      </section>

      <section className="life-support-crew-section" aria-labelledby="life-support-crew-title">
        <div className="life-support-section-heading">
          <div>
            <h2 id="life-support-crew-title">Suit telemetry roster</h2>
          </div>
          <p>Select a row to change the monitored suit record.</p>
        </div>

        <div className="life-support-roster" role="group" aria-label="Select a crew member suit record">
          <div className="life-support-roster__header" aria-hidden="true">
            <span>Crew member</span>
            <span>Crew status</span>
            <span>Suit pressure</span>
            <span>Suit O₂ reserve</span>
          </div>
          {crew.map((member) => {
            const selected = member.id === activeAstronaut?.id;
            const memberTone = getCrewStatusTone(member.status);
            return (
              <button
                key={member.id}
                type="button"
                className={`life-support-roster__row${selected ? ' life-support-roster__row--selected' : ''}`}
                aria-pressed={selected}
                aria-label={`Select ${member.name}, ${member.role}; crew status ${member.status}; suit pressure ${formatValue(member.suitP, 1)} PSI; suit oxygen reserve ${formatValue(member.o2)} percent`}
                onClick={() => onSelectAstronaut?.(member.id)}
              >
                <span className="life-support-roster__identity">
                  <CrewPortrait member={member} className="life-support-roster__portrait" />
                  <span>
                    <span className="life-support-roster__name">{member.name}</span>
                    <span className="life-support-roster__role">{member.id} · {member.role}</span>
                  </span>
                </span>
                <span className={`life-support-roster__status life-support-roster__status--${memberTone}`}>
                  <span aria-hidden="true">{memberTone === 'nominal' ? '✓' : memberTone === 'warning' ? '!' : memberTone === 'critical' ? '×' : '—'}</span>
                  {member.status.toUpperCase()}
                </span>
                <span className="life-support-roster__reading life-support-roster__reading--pressure">{formatValue(member.suitP, 1)} <small>PSI</small></span>
                <span className="life-support-roster__reading life-support-roster__reading--oxygen">{formatValue(member.o2)}<small>%</small></span>
              </button>
            );
          })}
        </div>
      </section>

      <HistoricalTelemetryPanel group="environment" />

    </section>
  );
}
