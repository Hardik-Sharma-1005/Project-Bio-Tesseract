'use client';

import React, { useEffect, useRef, useState } from 'react';
import CrewPortrait from '../crew/CrewPortrait';

export default function MedicalSection({ activeAstronaut, crew = [], onSelectAstronaut }) {
  const scanTimers = useRef([]);
  const [activeProtocol, setActiveProtocol] = useState(null);
  const [simulatingDiagnosis, setSimulatingDiagnosis] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanHistory, setScanHistory] = useState([
    {
      id: 'SCAN-101',
      time: '14:20:10',
      subject: 'Cmdr. Sarah Vance',
      status: 'Baseline',
      hr: 72,
      stress: 18
    }
  ]);

  const hr = activeAstronaut?.hr || 72;
  const stress = activeAstronaut?.stress || 18;
  const spo2 = activeAstronaut?.spo2 || 98.4;
  const name = activeAstronaut?.name || 'Cmdr. Sarah Vance';
  const telemetryStatus = activeAstronaut?.status || 'Unknown';

  useEffect(() => () => {
    scanTimers.current.forEach(clearTimeout);
    scanTimers.current = [];
  }, []);

  const runDiagnosticScan = () => {
    if (simulatingDiagnosis) return;
    setSimulatingDiagnosis(true);
    setScanProgress(20);

    scanTimers.current = [
      setTimeout(() => setScanProgress(60), 400),
      setTimeout(() => setScanProgress(90), 900),
      setTimeout(() => {
        const scanId = `SCAN-${Date.now().toString().slice(-3)}`;
        const scanTime = new Date().toTimeString().slice(0, 8);
        setScanProgress(100);
        setSimulatingDiagnosis(false);
        setScanHistory(prev => [
          {
            id: scanId,
            time: scanTime,
            subject: name,
            status: stress > 50 ? 'Elevated' : 'Baseline',
            hr,
            stress
          },
          ...prev.slice(0, 4)
        ]);
        scanTimers.current = [];
      }, 1400)
    ];
  };

  const protocols = [
    { id: 'hydration', code: 'HYD-01', name: 'Hydration pack dispense' },
    { id: 'thermal', code: 'THM-02', name: 'LCVG temperature regulate', detail: '+0.5°C' },
    { id: 'oxygen', code: 'OXY-03', name: 'Pre-breathe flush', detail: '100% O₂' }
  ];

  return (
    <main className="medical-workspace">
      <header className="medical-page-heading">
        <div>
          <h1>Medical advisor</h1>
        </div>
        <div className="medical-environment-tag"><span aria-hidden="true" /> SIMULATION · NOT CLINICAL</div>
      </header>

      <section className="medical-subject-strip" aria-labelledby="medical-subject-title">
        <div className="medical-subject-identity">
          <CrewPortrait member={activeAstronaut} className="medical-subject-portrait" />
          <div>
            <h2 id="medical-subject-title">{name}</h2>
            <p>{activeAstronaut?.role || 'Crew member'} <span>·</span> {activeAstronaut?.id || 'ID unavailable'}</p>
          </div>
        </div>
        <div className="medical-subject-status"><span className={`medical-status-dot medical-status-dot--${String(telemetryStatus).toLowerCase()}`} />
          <span><small>TELEMETRY STATUS</small><strong>{telemetryStatus}</strong></span>
        </div>
        <div className="medical-crew-select" aria-label="Select evaluation subject">
          {crew.map(member => {
            const isSelected = member.id === activeAstronaut?.id;
            return (
              <button key={member.id} type="button" aria-label={`Select ${member.name}`} aria-pressed={isSelected}
                onClick={() => onSelectAstronaut && onSelectAstronaut(member.id)}
                className={`medical-crew-button${isSelected ? ' is-selected' : ''}`}>
                <CrewPortrait member={member} className="medical-crew-button__portrait" />
              </button>
            );
          })}
        </div>
      </section>

      <div className="medical-workspace-grid">
        <div className="medical-primary-column">
          <section className="medical-evaluation-panel" aria-labelledby="medical-evaluation-title">
            <div className="medical-panel-heading">
              <div><h2 id="medical-evaluation-title">Telemetry inputs</h2></div>
            </div>
            <div className="medical-input-grid">
              <div className="medical-input"><span>Heart rate</span><strong>{hr}<small> bpm</small></strong></div>
              <div className="medical-input"><span>Blood oxygen</span><strong>{spo2}<small> %</small></strong></div>
              <div className="medical-input"><span>Stress</span><strong>{stress}<small> %</small></strong></div>
            </div>
          </section>

          <section className={`medical-scan-panel${simulatingDiagnosis ? ' is-processing' : ''}`} aria-label="Medical scan">
            <div className="medical-scan-panel__body">
              <button type="button" onClick={runDiagnosticScan} disabled={simulatingDiagnosis} className="medical-scan-button">
                <span aria-hidden="true">{simulatingDiagnosis ? '◌' : '↗'}</span>{simulatingDiagnosis ? 'Processing scan…' : 'Run scan'}
              </button>
            </div>
            {simulatingDiagnosis && (
              <div className="medical-progress" role="status" aria-live="polite">
                <div className="medical-progress__labels"><strong>{scanProgress}%</strong></div>
                <div className="medical-progress__track" role="progressbar" aria-label="Demonstration scan progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={scanProgress}><span style={{ width: `${scanProgress}%` }} /></div>
              </div>
            )}
          </section>

          <section className="medical-results" aria-labelledby="medical-results-title">
            <div className="medical-panel-heading">
              <div><h2 id="medical-results-title">Scenario results</h2></div>
            </div>
            <div className="medical-indicator-grid">
              <div className="medical-indicator"><span>Decompression scenario index</span><strong>0.02%</strong></div>
              <div className="medical-indicator"><span>Hypoxia scenario index</span><strong>0.00%</strong></div>
              <div className="medical-indicator medical-indicator--input"><span>Cognitive workload input</span><strong>{stress}%</strong></div>
            </div>
          </section>

          <section className="medical-protocols" aria-labelledby="medical-protocol-title">
            <div className="medical-panel-heading">
              <div><h2 id="medical-protocol-title">Protocols</h2></div>
            </div>
            <div className="medical-protocol-list">
              {protocols.map(protocol => (
                <button key={protocol.id} type="button" aria-pressed={activeProtocol === protocol.id}
                  onClick={() => setActiveProtocol(protocol.id)} className={`medical-protocol-option${activeProtocol === protocol.id ? ' is-selected' : ''}`}>
                  <span className="medical-protocol-code">{protocol.code}</span><span className="medical-protocol-copy"><strong>{protocol.name}</strong>{protocol.detail && <small>{protocol.detail}</small>}</span>
                  <span className="medical-protocol-choice">{activeProtocol === protocol.id ? 'Selected' : 'Select'}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="medical-history-column">
          <section className="medical-history-panel" aria-labelledby="medical-history-title">
            <div className="medical-panel-heading medical-panel-heading--history">
              <div><h2 id="medical-history-title">Scan history</h2></div>
              <span className="medical-history-count">{scanHistory.length} <small>records</small></span>
            </div>
            <ol className="medical-history-list" aria-label="Completed simulated scan history" aria-live="polite">
              {scanHistory.map(scan => (
                <li key={scan.id} className="medical-history-entry">
                  <div className="medical-history-entry__top"><span>{scan.id}</span><time>{scan.time}</time></div>
                  <span className="medical-history-entry__status">{scan.status}</span>
                  <strong>{scan.subject}</strong>
                  <p>HR {scan.hr} bpm <span>·</span> Stress {scan.stress}%</p>
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </main>
  );
}
