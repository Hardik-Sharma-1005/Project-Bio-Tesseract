'use client';

import React, { useEffect, useRef, useState } from 'react';

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
      status: 'SIMULATED RESULT',
      hr: 72,
      stress: 18,
      notes: 'Illustrative scan history entry. No clinical assessment was performed.'
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
            status: stress > 50 ? 'ELEVATED DEMO SCENARIO' : 'SIMULATED BASELINE',
            hr,
            stress,
            notes: stress > 50
              ? 'In this simulated scenario, the demonstration heart-rate and stress inputs are elevated. Suggested action: review the hydration protocol.'
              : 'This simulation presents baseline demonstration inputs. No clinical threshold or diagnosis is being evaluated.'
          },
          ...prev.slice(0, 4)
        ]);
        scanTimers.current = [];
      }, 1400)
    ];
  };

  const protocols = [
    { id: 'hydration', code: 'HYD-01', name: 'Hydration pack dispense', detail: 'Simulated hydration protocol' },
    { id: 'thermal', code: 'THM-02', name: 'LCVG temperature regulate', detail: 'Illustrative adjustment · +0.5°C' },
    { id: 'oxygen', code: 'OXY-03', name: 'Pre-breathe flush', detail: 'Demonstration · 100% O₂' }
  ];

  return (
    <main className="medical-workspace">
      <header className="medical-page-heading">
        <div>
          <p className="medical-eyebrow">MISSION MEDICINE <span> / </span> DECISION SUPPORT</p>
          <h1>Medical advisor</h1>
          <p className="medical-page-heading__description">Review simulated crew inputs, run a demonstration scan, and inspect the recorded output.</p>
        </div>
        <div className="medical-environment-tag"><span aria-hidden="true" /> Simulation environment</div>
      </header>

      <section className="medical-subject-strip" aria-labelledby="medical-subject-title">
        <div className="medical-subject-identity">
          <span className="medical-subject-mark" aria-hidden="true">{activeAstronaut?.initials || 'CR'}</span>
          <div>
            <p className="medical-eyebrow">CURRENT EVALUATION SUBJECT</p>
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
                {member.initials || member.id}
              </button>
            );
          })}
        </div>
      </section>

      <div className="medical-workspace-grid">
        <div className="medical-primary-column">
          <section className="medical-evaluation-panel" aria-labelledby="medical-evaluation-title">
            <div className="medical-panel-heading">
              <div><p className="medical-eyebrow">01 / EVALUATION CONTEXT</p><h2 id="medical-evaluation-title">Simulated telemetry inputs</h2></div>
              <span className="medical-input-label">DEMONSTRATION DATA</span>
            </div>
            <div className="medical-input-grid">
              <div className="medical-input"><span>Heart rate</span><strong>{hr}<small> bpm</small></strong><em>Current crew input</em></div>
              <div className="medical-input"><span>Blood oxygen</span><strong>{spo2}<small> %</small></strong><em>Current crew input</em></div>
              <div className="medical-input"><span>Stress</span><strong>{stress}<small> %</small></strong><em>Current crew input</em></div>
            </div>
          </section>

          <section className={`medical-scan-panel${simulatingDiagnosis ? ' is-processing' : ''}`} aria-labelledby="medical-scan-title">
            <div className="medical-scan-panel__topline"><span className="medical-scan-step">02</span><span className="medical-eyebrow">SIMULATED ANALYSIS</span><span className="medical-scan-rule" /></div>
            <div className="medical-scan-panel__body">
              <div><h2 id="medical-scan-title">Physiological synthesis</h2><p>Demonstration workflow using the selected crew member’s current illustrative inputs.</p></div>
              <button type="button" onClick={runDiagnosticScan} disabled={simulatingDiagnosis} className="medical-scan-button">
                <span aria-hidden="true">{simulatingDiagnosis ? '◌' : '↗'}</span>{simulatingDiagnosis ? 'Processing scan…' : 'Run demonstration scan'}
              </button>
            </div>
            {simulatingDiagnosis ? (
              <div className="medical-progress" role="status" aria-live="polite">
                <div className="medical-progress__labels"><span>Processing illustrative telemetry sequence</span><strong>{scanProgress}%</strong></div>
                <div className="medical-progress__track" role="progressbar" aria-label="Demonstration scan progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={scanProgress}><span style={{ width: `${scanProgress}%` }} /></div>
              </div>
            ) : (
              <div className="medical-scan-ready"><span className="medical-ready-marker" /> Ready for demonstration scan <span>·</span> No external sensors connected</div>
            )}
          </section>

          <section className="medical-results" aria-labelledby="medical-results-title">
            <div className="medical-panel-heading">
              <div><p className="medical-eyebrow">03 / OUTPUT REVIEW</p><h2 id="medical-results-title">Illustrative scenario results</h2></div>
              <span className="medical-result-label">NOT A CLINICAL ASSESSMENT</span>
            </div>
            <div className="medical-result-narrative">
              <div className="medical-result-narrative__index">A</div>
              <div><span className="medical-eyebrow">DEMONSTRATION OBSERVATION</span>
                <p>{simulatingDiagnosis
                  ? 'Processing the simulated telemetry sequence. No clinical model or external sensor data is being used.'
                  : stress > 50
                    ? `In this simulated scenario, the demonstration heart-rate input is ${hr} bpm and stress input is ${stress}%. The existing example suggests reviewing the hydration protocol; this is not a medical recommendation.`
                    : `This simulation presents baseline demonstration inputs for ${name}. No clinical thresholds, diagnosis, or medical risk are evaluated.`}</p>
              </div>
            </div>
            <div className="medical-indicator-grid">
              <div className="medical-indicator"><span>Decompression scenario index</span><strong>0.02%</strong><small>Fixed illustrative value · not calculated</small></div>
              <div className="medical-indicator"><span>Hypoxia scenario index</span><strong>0.00%</strong><small>Fixed illustrative value · not calculated</small></div>
              <div className="medical-indicator medical-indicator--input"><span>Cognitive workload input</span><strong>{stress}%</strong><small>{stress > 50 ? 'Elevated demonstration input' : 'Baseline demonstration input'}</small></div>
            </div>
            <p className="medical-result-footnote">Scenario indices are static examples. They are not derived from this crew member’s telemetry and do not indicate probability or clinical risk.</p>
          </section>

          <section className="medical-protocols" aria-labelledby="medical-protocol-title">
            <div className="medical-panel-heading">
              <div><p className="medical-eyebrow">04 / OPERATOR CONTROLS</p><h2 id="medical-protocol-title">Demonstration protocols</h2></div>
              <span className="medical-protocol-label">SIMULATED SELECTION</span>
            </div>
            <p className="medical-protocol-intro">Select a protocol to record a local demonstration state. No physical action is initiated.</p>
            <div className="medical-protocol-list">
              {protocols.map(protocol => (
                <button key={protocol.id} type="button" aria-pressed={activeProtocol === protocol.id}
                  onClick={() => setActiveProtocol(protocol.id)} className={`medical-protocol-option${activeProtocol === protocol.id ? ' is-selected' : ''}`}>
                  <span className="medical-protocol-code">{protocol.code}</span><span className="medical-protocol-copy"><strong>{protocol.name}</strong><small>{protocol.detail}</small></span>
                  <span className="medical-protocol-choice">{activeProtocol === protocol.id ? 'Selected' : 'Select'}</span>
                </button>
              ))}
            </div>
            {activeProtocol && <p className="medical-protocol-feedback" role="status"><span aria-hidden="true">✓</span> {protocols.find(protocol => protocol.id === activeProtocol)?.name} selected for demonstration. No hardware command was sent.</p>}
          </section>
        </div>

        <aside className="medical-history-column">
          <section className="medical-history-panel" aria-labelledby="medical-history-title">
            <div className="medical-panel-heading medical-panel-heading--history">
              <div><p className="medical-eyebrow">RECORD / LOCAL SESSION</p><h2 id="medical-history-title">Scan history</h2></div>
              <span className="medical-history-count">{scanHistory.length} <small>records</small></span>
            </div>
            <p className="medical-history-context">Completed demonstrations across crew selection.</p>
            <ol className="medical-history-list" aria-label="Completed simulated scan history" aria-live="polite">
              {scanHistory.map(scan => (
                <li key={scan.id} className="medical-history-entry">
                  <div className="medical-history-entry__top"><span>{scan.id}</span><time>{scan.time}</time></div>
                  <span className="medical-history-entry__status">{scan.status}</span>
                  <strong>{scan.subject}</strong>
                  <p>HR {scan.hr} bpm <span>·</span> Stress {scan.stress}%</p>
                  <small>{scan.notes}</small>
                </li>
              ))}
            </ol>
          </section>
          <section className="medical-disclosure" aria-labelledby="medical-disclosure-title">
            <span className="medical-disclosure__mark" aria-hidden="true">i</span>
            <div><h2 id="medical-disclosure-title">Simulation limitations</h2><p>This demonstration is not clinically validated and does not diagnose, assess medical risk, or communicate with spacecraft hardware. All displayed readings and outputs are illustrative.</p></div>
          </section>
        </aside>
      </div>
    </main>
  );
}
