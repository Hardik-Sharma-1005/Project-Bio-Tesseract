'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import BioTesseractLogo from '../logo/BioTesseractLogo';

export default function Navbar({
  activeAstronaut,
  onSelectAstronaut,
  isAlarmActive,
  onToggleAlarm,
  onMenuToggle
}) {
  const [met, setMet] = useState({ h: 42, m: 0, s: 0 });
  const [utc, setUtc] = useState('');

  useEffect(() => {
    const tick = () => {
      setMet(prev => {
        let s = prev.s + 1;
        let m = prev.m;
        let h = prev.h;
        if (s >= 60) { s = 0; m++; }
        if (m >= 60) { m = 0; h++; }
        return { h, m, s };
      });
      const now = new Date();
      setUtc(
        now.getUTCHours().toString().padStart(2, '0') + ':' +
        now.getUTCMinutes().toString().padStart(2, '0') + ':' +
        now.getUTCSeconds().toString().padStart(2, '0')
      );
    };

    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n) => String(n).padStart(2, '0');
  const metStr = `MET +042:${pad(met.h % 24)}:${pad(met.m)}:${pad(met.s)}`;

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      width: '100%',
      height: '58px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      background: 'rgba(9, 14, 28, 0.94)',
      backdropFilter: 'blur(16px)',
      borderBottom: isAlarmActive ? '1px solid rgba(239, 68, 68, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
      boxSizing: 'border-box',
      gap: '16px',
    }}>
      {/* ── Brand & Mission with Project Logo ── */}
      <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <BioTesseractLogo size={36} />

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="font-orbitron" style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', letterSpacing: '0.06em' }}>
              BIO-TESSERACT
            </span>
            <span className="cyber-badge cyber-badge-cyan" style={{ fontSize: '0.65rem' }}>
              ARTEMIS-VII
            </span>
          </div>
          <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            AEROSPACE MEDICAL MONITORING SYSTEM
          </div>
        </div>
      </Link>

      {/* ── Center Mission Clocks & Comm Status ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }} className="nav-center-clocks">
        <div style={{ textAlign: 'center' }}>
          <div className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--hud-cyan)' }}>
            {metStr}
          </div>
          <div className="font-ui" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            MISSION ELAPSED
          </div>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.08)' }} />

        <div style={{ textAlign: 'center' }}>
          <div className="font-mono" style={{ fontSize: '0.85rem', color: '#e2e8f0' }}>
            {utc} <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>UTC</span>
          </div>
          <div className="font-ui" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            UNIVERSAL TIME
          </div>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'rgba(255, 255, 255, 0.08)' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="status-dot nominal" />
          <div>
            <div className="font-mono" style={{ fontSize: '0.8rem', color: 'var(--hud-emerald)' }}>
              DSN LOCKED
            </div>
            <div className="font-ui" style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              27,580 km/h (LEO)
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Controls ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Link back to Hero */}
        <Link
          href="/"
          className="hud-btn"
          style={{ padding: '6px 12px', fontSize: '0.78rem', textDecoration: 'none' }}
        >
          ← Home
        </Link>

        {/* Astronaut Selector */}
        <select
          value={activeAstronaut?.id || 'AST-01'}
          onChange={(e) => onSelectAstronaut && onSelectAstronaut(e.target.value)}
          style={{
            background: 'rgba(12, 19, 38, 0.9)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '5px',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.82rem',
            fontWeight: 600,
            padding: '6px 12px',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="AST-01">Cmdr. Sarah Vance (EVA-1)</option>
          <option value="AST-02">Dr. Marcus Chen (EVA-2)</option>
          <option value="AST-03">Eng. Elena Rostova (Airlock)</option>
          <option value="AST-04">Pilot David Kalu (Orbiter)</option>
        </select>

        {/* Anomaly Toggle Button */}
        <button
          onClick={() => onToggleAlarm && onToggleAlarm()}
          className={isAlarmActive ? 'hud-btn-danger' : 'hud-btn'}
          style={{ padding: '6px 14px', fontSize: '0.8rem' }}
        >
          {isAlarmActive ? '⚠️ ALARM ACTIVE' : '🚨 SIM ANOMALY'}
        </button>

        {/* Mobile menu toggle */}
        <button
          onClick={() => onMenuToggle && onMenuToggle()}
          className="hud-btn nav-hamburger"
          style={{ display: 'none', padding: '6px 10px', fontSize: '1rem' }}
          aria-label="Toggle navigation"
        >
          ☰
        </button>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .nav-center-clocks { display: none !important; }
          .nav-hamburger { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
