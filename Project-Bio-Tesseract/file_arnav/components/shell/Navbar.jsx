'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import ThemeToggle from '../theme/ThemeToggle';

const CREW_OPTIONS = [
  { id: 'AST-01', label: 'Cmdr. Sarah Vance · EVA-1' },
  { id: 'AST-02', label: 'Dr. Marcus Chen · EVA-2' },
  { id: 'AST-03', label: 'Eng. Elena Rostova · Airlock' },
  { id: 'AST-04', label: 'Pilot David Kalu · Orbiter' },
];

const getStatusTone = (status) => (
  status === 'CRITICAL' ? 'critical' : status === 'CAUTION' ? 'warning' : 'nominal'
);

export default function Navbar({
  activeAstronaut,
  onSelectAstronaut,
  isAlarmActive,
  missionStatus = 'CAUTION',
  onToggleAlarm,
  onMenuToggle,
  isSidebarOpen = false,
}) {
  const [met, setMet] = useState({ h: 42, m: 0, s: 0 });
  const [utc, setUtc] = useState('');

  useEffect(() => {
    const tick = () => {
      setMet((prev) => {
        let s = prev.s + 1;
        let m = prev.m;
        let h = prev.h;
        if (s >= 60) { s = 0; m++; }
        if (m >= 60) { m = 0; h++; }
        return { h, m, s };
      });
      const now = new Date();
      setUtc(`${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}`);
    };

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (value) => String(value).padStart(2, '0');
  const metStr = `MET +042:${pad(met.h % 24)}:${pad(met.m)}:${pad(met.s)}`;
  const statusTone = getStatusTone(missionStatus);

  return (
    <header className={`dashboard-navbar${isAlarmActive ? ' dashboard-navbar--alert' : ''}`}>
      <Link className="dashboard-brand" href="/dashboard" aria-label="Bio-Tesseract dashboard">
        <span className="dashboard-brand__mark" aria-hidden="true">＋</span>
        <span className="dashboard-brand__copy">
          <span className="dashboard-brand__name">BIO-TESSERACT</span>
          <span className="dashboard-brand__descriptor">CREW HEALTH &amp; MISSION SYSTEMS</span>
          <span className="dashboard-mobile-meta">{metStr} <span aria-hidden="true">·</span> MISSION {missionStatus}</span>
        </span>
      </Link>

      <div className="dashboard-mission-meta" aria-label="Mission timing and status">
        <div className="dashboard-clock">
          <span className="dashboard-clock__label">MISSION ELAPSED</span>
          <span className="dashboard-clock__value">{metStr}</span>
        </div>
        <span className="dashboard-meta-divider" aria-hidden="true" />
        <div className="dashboard-clock dashboard-clock--utc">
          <span className="dashboard-clock__label">UNIVERSAL TIME</span>
          <span className="dashboard-clock__value">{utc || '--:--:--'} <span>UTC</span></span>
        </div>
        <span className="dashboard-meta-divider dashboard-meta-divider--status" aria-hidden="true" />
        <div className={`dashboard-mission-status dashboard-mission-status--${statusTone}`} role="status" aria-live="polite">
          <span className="dashboard-status-mark" aria-hidden="true">{statusTone === 'nominal' ? '✓' : statusTone === 'warning' ? '!' : '×'}</span>
          <span>
            <span className="dashboard-clock__label">MISSION STATUS</span>
            <span className="dashboard-mission-status__value">{missionStatus}</span>
          </span>
        </div>
      </div>

      <div className="dashboard-navbar__controls">
        <label className="dashboard-select-wrap">
          <span className="dashboard-visually-hidden">Select crew member</span>
          <select
            value={activeAstronaut?.id || 'AST-01'}
            onChange={(event) => onSelectAstronaut?.(event.target.value)}
            aria-label="Select crew member"
          >
            {CREW_OPTIONS.map((member) => (
              <option key={member.id} value={member.id}>{member.label}</option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className={`dashboard-anomaly-button${isAlarmActive ? ' dashboard-anomaly-button--active' : ''}`}
          onClick={() => onToggleAlarm?.()}
          aria-pressed={isAlarmActive}
          title={isAlarmActive ? 'Resolve the simulated anomaly' : 'Run a simulated anomaly'}
        >
          <span className="dashboard-anomaly-button__indicator" aria-hidden="true" />
          <span>{isAlarmActive ? 'Resolve simulation' : 'Simulate anomaly'}</span>
        </button>

        <ThemeToggle className="theme-toggle--dashboard" />

        <button
          type="button"
          className="dashboard-menu-button"
          onClick={() => onMenuToggle?.()}
          aria-label={isSidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isSidebarOpen}
          aria-controls="dashboard-sidebar"
        >
          <span aria-hidden="true">{isSidebarOpen ? '×' : '☰'}</span>
        </button>
      </div>
    </header>
  );
}
