'use client';

import React, { useState, useEffect } from 'react';

// Shell components (created by shell worker)
import Navbar from '../shell/Navbar';
import Sidebar from '../shell/Sidebar';

// Section components (created by section workers)
import OverviewSection from '../overview/OverviewSection';
import BioMonitorSection from '../biomonitor/BioMonitorSection';
import LifeSupportSection from '../lifesupport/LifeSupportSection';
import MedicalSection from '../medical/MedicalSection';
import CrewSection from '../crew/CrewSection';

// =====================================================================
// SHARED DATA CONSTANTS
// =====================================================================

const INITIAL_CREW = [
  { id: 'AST-01', name: 'Cmdr. Sarah Vance', role: 'Mission Commander (EVA-1)', initials: 'SV', hr: 72, spo2: 98.4, bpSys: 118, bpDia: 76, suitP: 4.3, o2: 94, stress: 18, status: 'Nominal', respRate: 14 },
  { id: 'AST-02', name: 'Dr. Marcus Chen', role: 'Medical Specialist (EVA-2)', initials: 'MC', hr: 78, spo2: 99.0, bpSys: 122, bpDia: 80, suitP: 4.3, o2: 91, stress: 24, status: 'Nominal', respRate: 16 },
  { id: 'AST-03', name: 'Eng. Elena Rostova', role: 'Flight Engineer (Airlock)', initials: 'ER', hr: 68, spo2: 98.8, bpSys: 115, bpDia: 74, suitP: 14.7, o2: 98, stress: 15, status: 'Nominal', respRate: 13 },
  { id: 'AST-04', name: 'Pilot David Kalu', role: 'Command Pilot (Orbiter)', initials: 'DK', hr: 74, spo2: 98.2, bpSys: 120, bpDia: 78, suitP: 14.7, o2: 96, stress: 20, status: 'Nominal', respRate: 15 }
];

const INITIAL_ALERTS = [
  { id: 'ALT-101', severity: 'NOMINAL', title: 'DSN Goldstone X-band lock confirmed', subsystem: 'Comms', time: '14:28:02', acknowledged: true },
  { id: 'ALT-102', severity: 'NOMINAL', title: 'EMU-X Suit telemetry sync complete', subsystem: 'PLSS', time: '14:27:40', acknowledged: true },
  { id: 'ALT-103', severity: 'CAUTION', title: 'Solar particle event flux elevation (low risk)', subsystem: 'Radiation', time: '14:25:15', acknowledged: false },
  { id: 'ALT-104', severity: 'NOMINAL', title: 'Crew telemetry baseline verified', subsystem: 'Bio-Core', time: '14:20:00', acknowledged: true }
];

// =====================================================================
// MAIN DASHBOARD COMPONENT
// =====================================================================

export default function DashboardMain() {
  // ── Shared state ────────────────────────────────────────────────────
  const [crew, setCrew] = useState(INITIAL_CREW);
  const [activeAstronautId, setActiveAstronautId] = useState('AST-01');
  const [activeTab, setActiveTab] = useState('overview');
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Derived: active astronaut object
  const activeAstronaut = crew.find(c => c.id === activeAstronautId) || crew[0];

  // ── Telemetry simulation — 2500 ms drift ───────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let frame = 0;
    const moveGlow = (event) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--pointer-x', `${event.clientX}px`);
        document.documentElement.style.setProperty('--pointer-y', `${event.clientY}px`);
      });
    };
    window.addEventListener('pointermove', moveGlow, { passive: true });
    return () => { window.removeEventListener('pointermove', moveGlow); cancelAnimationFrame(frame); };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCrew(prevCrew =>
        prevCrew.map(ast => {
          // If alarm is active on this specific astronaut, preserve alarm values
          if (isAlarmActive && ast.id === activeAstronautId) {
            return ast;
          }

          // Slight natural biological variance
          const hrDelta = Math.floor(Math.random() * 3) - 1;
          const newHr = Math.min(105, Math.max(55, ast.hr + hrDelta));
          const newSpo2 = +(Math.min(99.8, Math.max(97.0, ast.spo2 + (Math.random() * 0.2 - 0.1)))).toFixed(1);

          return {
            ...ast,
            hr: newHr,
            spo2: newSpo2
          };
        })
      );
    }, 2500);

    return () => clearInterval(interval);
  }, [isAlarmActive, activeAstronautId]);

  // ── Alarm toggle handler ───────────────────────────────────────────
  const handleToggleAlarm = () => {
    const nextAlarm = !isAlarmActive;
    setIsAlarmActive(nextAlarm);

    if (nextAlarm) {
      // Add critical alert to the top of the feed
      setAlerts(prev => [
        {
          id: `ALT-${Date.now()}`,
          severity: 'CRITICAL',
          title: 'SIMULATED TACHYCARDIA & METABOLIC ELEVATION',
          subsystem: 'Cardio-Bio',
          time: new Date().toTimeString().slice(0, 8),
          acknowledged: false
        },
        ...prev
      ]);
      // Elevate active astronaut vitals
      setCrew(prev =>
        prev.map(a =>
          a.id === activeAstronautId
            ? { ...a, hr: 125, stress: 78, status: 'Warning' }
            : a
        )
      );
    } else {
      // Restore from INITIAL_CREW baseline (not whatever the drift landed on)
      setCrew(prev =>
        prev.map(a => {
          if (a.id === activeAstronautId) {
            const baseline = INITIAL_CREW.find(c => c.id === a.id);
            return { ...a, hr: baseline.hr, stress: baseline.stress, status: 'Nominal' };
          }
          return a;
        })
      );
    }
  };

  // ── Alert acknowledge handler ──────────────────────────────────────
  const handleAcknowledgeAlert = (id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  // ── Sidebar helpers ────────────────────────────────────────────────
  const handleMenuToggle = () => setSidebarOpen(prev => !prev);
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false); // close sidebar on mobile after navigation
  };

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <>
      {/* Subtle scanline overlay */}
      <div className="scanline-overlay" aria-hidden="true" />

      <Navbar
        activeAstronaut={activeAstronaut}
        onSelectAstronaut={setActiveAstronautId}
        isAlarmActive={isAlarmActive}
        onToggleAlarm={handleToggleAlarm}
        onMenuToggle={handleMenuToggle}
      />

      <div className={`main-content-wrapper${sidebarOpen ? ' sidebar-open' : ''}`}>
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          activeAstronaut={activeAstronaut}
          crew={crew}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Mobile overlay — clicking it closes sidebar */}
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />

        <main className="main-viewport">
          {activeTab === 'overview' && (
            <OverviewSection
              crew={crew}
              activeAstronaut={activeAstronaut}
              alerts={alerts}
              onAcknowledge={handleAcknowledgeAlert}
              onSelectAstronaut={setActiveAstronautId}
              isAlarmActive={isAlarmActive}
              onToggleAlarm={handleToggleAlarm}
              onNavigate={handleTabChange}
            />
          )}

          {activeTab === 'biomonitor' && (
            <BioMonitorSection
              activeAstronaut={activeAstronaut}
              crew={crew}
              onSelectAstronaut={setActiveAstronautId}
            />
          )}

          {activeTab === 'lifesupport' && (
            <LifeSupportSection
              activeAstronaut={activeAstronaut}
              crew={crew}
              onSelectAstronaut={setActiveAstronautId}
            />
          )}

          {activeTab === 'medical' && (
            <MedicalSection
              activeAstronaut={activeAstronaut}
              crew={crew}
              onSelectAstronaut={setActiveAstronautId}
            />
          )}

          {activeTab === 'crew' && (
            <CrewSection
              crew={crew}
              activeAstronaut={activeAstronaut}
              onSelectAstronaut={setActiveAstronautId}
              alerts={alerts}
              onAcknowledge={handleAcknowledgeAlert}
            />
          )}
        </main>
      </div>
    </>
  );
}
