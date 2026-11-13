'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// ── tiny hook: counts up a number on mount ─────────────────────────
function useCountUp(target, duration = 1800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const pct = Math.min((ts - start) / duration, 1);
      // ease-out cubic
      const ease = 1 - Math.pow(1 - pct, 3);
      setValue(Math.floor(ease * target));
      if (pct < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

// ── Animated stat card ─────────────────────────────────────────────
function StatCard({ value, suffix = '', label, color }) {
  const count = useCountUp(value);
  return (
    <div className="stat-card">
      <div className="stat-value" style={{ color }}>
        {count}{suffix}
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ── Pulsing dot ────────────────────────────────────────────────────
function PulseDot({ color = '#10b981' }) {
  return (
    <span className="pulse-dot-wrap">
      <span className="pulse-dot" style={{ background: color }} />
      <span className="pulse-ring" style={{ borderColor: color }} />
    </span>
  );
}

// ── Feature card ───────────────────────────────────────────────────
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="feature-card">
      <div className="feature-icon">{icon}</div>
      <div className="feature-title">{title}</div>
      <div className="feature-desc">{desc}</div>
    </div>
  );
}

// ── Crew member mini card ──────────────────────────────────────────
function CrewPill({ initials, name, role, hr }) {
  return (
    <div className="crew-pill">
      <div className="crew-avatar">{initials}</div>
      <div className="crew-info">
        <div className="crew-name">{name}</div>
        <div className="crew-role">{role}</div>
      </div>
      <div className="crew-hr">
        <PulseDot color="#10b981" />
        <span>{hr} bpm</span>
      </div>
    </div>
  );
}

export default function HeroPage() {
  const [scrolled, setScrolled] = useState(false);
  const [visibleSection, setVisibleSection] = useState('');
  const featuresRef = useRef(null);
  const crewRef = useRef(null);

  // scroll-aware navbar
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // simple intersection observer for fade-ins
  useEffect(() => {
    const els = document.querySelectorAll('.fade-in-section');
    const obs = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('visible');
      }),
      { threshold: 0.15 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <>
      <style>{`
        /* ── Reset & base ───────────────────────── */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg: #060913;
          --bg-card: #0c1326;
          --cyan: #38bdf8;
          --emerald: #10b981;
          --amber: #f59e0b;
          --text: #f1f5f9;
          --muted: #94a3b8;
          --border: rgba(255,255,255,0.08);
        }

        body {
          background: var(--bg);
          color: var(--text);
          font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
          overflow-x: hidden;
        }

        /* ── Starfield background ─────────────────── */
        .hero-page {
          min-height: 100vh;
          position: relative;
          background:
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(56,189,248,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 90% 80%, rgba(16,185,129,0.05) 0%, transparent 70%),
            #060913;
        }

        .stars {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
        }

        .star {
          position: absolute;
          border-radius: 50%;
          background: white;
          animation: twinkle var(--d, 3s) ease-in-out infinite;
          animation-delay: var(--delay, 0s);
        }

        @keyframes twinkle {
          0%, 100% { opacity: var(--min, 0.1); }
          50% { opacity: var(--max, 0.8); }
        }

        /* ── Navbar ───────────────────────────────── */
        .hero-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          height: 64px;
          transition: background 0.3s, border-bottom 0.3s;
        }

        .hero-nav.scrolled {
          background: rgba(6, 9, 19, 0.9);
          border-bottom: 1px solid rgba(56,189,248,0.1);
          backdrop-filter: blur(12px);
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 700;
          font-size: 1.1rem;
          letter-spacing: 0.03em;
          color: var(--text);
          text-decoration: none;
        }

        .nav-logo-icon {
          font-size: 1.4rem;
        }

        .nav-logo span {
          color: var(--cyan);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 32px;
          list-style: none;
        }

        .nav-links a {
          color: var(--muted);
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.2s;
        }

        .nav-links a:hover { color: var(--text); }

        .nav-cta {
          background: rgba(56,189,248,0.1);
          color: var(--cyan) !important;
          border: 1px solid rgba(56,189,248,0.3);
          padding: 8px 20px;
          border-radius: 8px;
          font-weight: 600;
          transition: background 0.2s, border-color 0.2s, color 0.2s !important;
        }

        .nav-cta:hover {
          background: var(--cyan) !important;
          color: #060913 !important;
          border-color: var(--cyan) !important;
        }

        /* ── Hero section ─────────────────────────── */
        .hero-section {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 160px 24px 100px;
          min-height: 100vh;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(16,185,129,0.1);
          border: 1px solid rgba(16,185,129,0.25);
          color: var(--emerald);
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 32px;
        }

        .hero-title {
          font-size: clamp(2.4rem, 6vw, 5rem);
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
          max-width: 820px;
          margin-bottom: 24px;
        }

        .hero-title .accent {
          background: linear-gradient(135deg, var(--cyan), var(--emerald));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-subtitle {
          font-size: 1.15rem;
          color: var(--muted);
          max-width: 580px;
          line-height: 1.7;
          margin-bottom: 48px;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 72px;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--cyan);
          color: #060913;
          font-weight: 700;
          font-size: 0.95rem;
          padding: 14px 32px;
          border-radius: 10px;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          box-shadow: 0 0 24px rgba(56,189,248,0.25);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 32px rgba(56,189,248,0.4);
          opacity: 0.92;
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.04);
          color: var(--text);
          font-weight: 600;
          font-size: 0.95rem;
          padding: 14px 28px;
          border-radius: 10px;
          text-decoration: none;
          border: 1px solid var(--border);
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }

        .btn-secondary:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.18);
          transform: translateY(-2px);
        }

        /* ── Live stats bar ───────────────────────── */
        .stats-bar {
          display: flex;
          align-items: center;
          gap: 0;
          background: rgba(12,19,38,0.7);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          backdrop-filter: blur(12px);
        }

        .stat-card {
          padding: 20px 32px;
          text-align: center;
          border-right: 1px solid var(--border);
          flex: 1;
        }

        .stat-card:last-child { border-right: none; }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          font-variant-numeric: tabular-nums;
          line-height: 1;
          margin-bottom: 6px;
        }

        .stat-label {
          font-size: 0.78rem;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          font-weight: 600;
        }

        /* ── Pulse dot ────────────────────────────── */
        .pulse-dot-wrap {
          position: relative;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 12px;
          height: 12px;
          flex-shrink: 0;
        }

        .pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          position: relative;
          z-index: 1;
        }

        .pulse-ring {
          position: absolute;
          inset: -2px;
          border-radius: 50%;
          border: 1.5px solid;
          animation: ring-pulse 2s ease-out infinite;
        }

        @keyframes ring-pulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.2); opacity: 0; }
        }

        /* ── Sections ─────────────────────────────── */
        .section {
          position: relative;
          z-index: 1;
          padding: 100px 24px;
          max-width: 1100px;
          margin: 0 auto;
        }

        .section-label {
          font-size: 0.78rem;
          color: var(--cyan);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .section-title {
          font-size: clamp(1.8rem, 4vw, 2.8rem);
          font-weight: 800;
          letter-spacing: -0.015em;
          line-height: 1.15;
          margin-bottom: 16px;
        }

        .section-sub {
          color: var(--muted);
          font-size: 1.05rem;
          line-height: 1.65;
          max-width: 540px;
          margin-bottom: 56px;
        }

        /* ── Features ─────────────────────────────── */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 20px;
        }

        .feature-card {
          background: rgba(12,19,38,0.6);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 28px;
          transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
        }

        .feature-card:hover {
          border-color: rgba(56,189,248,0.25);
          transform: translateY(-4px);
          box-shadow: 0 12px 36px rgba(0,0,0,0.25);
        }

        .feature-icon {
          font-size: 1.8rem;
          margin-bottom: 16px;
        }

        .feature-title {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .feature-desc {
          color: var(--muted);
          font-size: 0.9rem;
          line-height: 1.6;
        }

        /* ── Crew section ─────────────────────────── */
        .crew-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 16px;
        }

        .crew-pill {
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(12,19,38,0.7);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 18px 20px;
          transition: border-color 0.2s, transform 0.2s;
        }

        .crew-pill:hover {
          border-color: rgba(56,189,248,0.2);
          transform: translateX(4px);
        }

        .crew-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: rgba(56,189,248,0.12);
          border: 1.5px solid rgba(56,189,248,0.25);
          color: var(--cyan);
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          letter-spacing: 0.03em;
        }

        .crew-info { flex: 1; min-width: 0; }

        .crew-name {
          font-weight: 600;
          font-size: 0.9rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .crew-role {
          color: var(--muted);
          font-size: 0.78rem;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .crew-hr {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          color: var(--emerald);
          font-weight: 600;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
          flex-shrink: 0;
        }

        /* ── Divider ──────────────────────────────── */
        .section-divider {
          width: 100%;
          height: 1px;
          background: var(--border);
          margin: 0 auto;
          max-width: 1100px;
        }

        /* ── CTA banner ───────────────────────────── */
        .cta-banner {
          position: relative;
          z-index: 1;
          background: rgba(12,19,38,0.7);
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 80px 24px;
          text-align: center;
        }

        .cta-banner h2 {
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          font-weight: 800;
          margin-bottom: 16px;
          letter-spacing: -0.015em;
        }

        .cta-banner p {
          color: var(--muted);
          font-size: 1.05rem;
          margin-bottom: 36px;
          max-width: 460px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.65;
        }

        /* ── Footer ───────────────────────────────── */
        .hero-footer {
          position: relative;
          z-index: 1;
          padding: 36px 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--border);
          color: var(--muted);
          font-size: 0.84rem;
          flex-wrap: wrap;
          gap: 12px;
        }

        .footer-links {
          display: flex;
          gap: 24px;
          list-style: none;
        }

        .footer-links a {
          color: var(--muted);
          text-decoration: none;
          transition: color 0.2s;
        }

        .footer-links a:hover { color: var(--text); }

        /* ── Fade-in animations ───────────────────── */
        .fade-in-section {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .fade-in-section.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .fade-in-section:nth-child(2) { transition-delay: 0.1s; }
        .fade-in-section:nth-child(3) { transition-delay: 0.2s; }
        .fade-in-section:nth-child(4) { transition-delay: 0.3s; }

        /* ── Responsive ───────────────────────────── */
        @media (max-width: 640px) {
          .hero-nav { padding: 0 20px; }
          .nav-links { display: none; }
          .stats-bar { flex-direction: column; gap: 0; border-radius: 12px; }
          .stat-card { border-right: none; border-bottom: 1px solid var(--border); }
          .stat-card:last-child { border-bottom: none; }
          .hero-footer { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      {/* Stars */}
      <Stars />

      <div className="hero-page">
        {/* Navbar */}
        <nav className={`hero-nav${scrolled ? ' scrolled' : ''}`}>
          <a href="#" className="nav-logo">
            <span className="nav-logo-icon">💠</span>
            Bio<span>-Tesseract</span>
          </a>
          <ul className="nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#crew">Crew</a></li>
            <li><Link href="/" className="nav-cta">Open Dashboard →</Link></li>
          </ul>
        </nav>

        {/* ── Hero ──────────────────────────────────── */}
        <section className="hero-section">
          <div className="hero-badge">
            <PulseDot color="#10b981" />
            Mission Active · All Systems Nominal
          </div>

          <h1 className="hero-title">
            Astronaut health.<br />
            <span className="accent">Monitored in real time.</span>
          </h1>

          <p className="hero-subtitle">
            Project Bio-Tesseract tracks vitals, life-support, and crew biotelemetry
            across deep-space missions — giving mission control a clear view, always.
          </p>

          <div className="hero-actions">
            <Link href="/" className="btn-primary">
              Open Mission Dashboard →
            </Link>
            <a href="#features" className="btn-secondary">
              See how it works
            </a>
          </div>

          {/* Live stats */}
          <div className="stats-bar">
            <StatCard value={4}  suffix="" label="Crew Active"      color="#38bdf8" />
            <StatCard value={98} suffix="%" label="Avg SpO₂"         color="#10b981" />
            <StatCard value={72} suffix="" label="Avg Heart Rate"    color="#f59e0b" />
            <StatCard value={14} suffix="d" label="Mission Duration" color="#818cf8" />
          </div>
        </section>

        <div className="section-divider" />

        {/* ── Features ──────────────────────────────── */}
        <section className="section" id="features">
          <div className="section-label">What's inside</div>
          <h2 className="section-title">Everything mission control needs</h2>
          <p className="section-sub">
            One dashboard, four astronauts, full visibility — from heartbeats to habitat pressure.
          </p>

          <div className="features-grid">
            {[
              {
                icon: '❤️',
                title: 'Bio-Monitor',
                desc: 'Live ECG, heart rate, SpO₂ and blood pressure — updated every 2.5 seconds with realistic biological drift.',
              },
              {
                icon: '🌬️',
                title: 'Life Support',
                desc: 'Suit pressure, O₂ levels and habitat environment tracked across all crew members simultaneously.',
              },
              {
                icon: '🧠',
                title: 'Medical AI Advisor',
                desc: 'Pattern recognition on telemetry data to flag anomalies before they become emergencies.',
              },
              {
                icon: '📡',
                title: 'Mission Alerts',
                desc: 'Tiered alert feed — from nominal status checks to critical cardiac events — with one-click acknowledgement.',
              },
              {
                icon: '👩‍🚀',
                title: 'Crew Dossiers',
                desc: 'Tap any crew member to deep-dive into their biometrics, mission role, and current suit telemetry.',
              },
              {
                icon: '🔭',
                title: 'Alarm Simulation',
                desc: 'Test your incident response with a realistic tachycardia + metabolic elevation alarm scenario.',
              },
            ].map((f, i) => (
              <div className="fade-in-section" key={i}>
                <FeatureCard {...f} />
              </div>
            ))}
          </div>
        </section>

        <div className="section-divider" />

        {/* ── Crew section ──────────────────────────── */}
        <section className="section" id="crew">
          <div className="section-label">On board</div>
          <h2 className="section-title">Meet the crew</h2>
          <p className="section-sub">
            Four specialists, one mission. Each with real-time biometrics and mission status tracked live.
          </p>

          <div className="crew-grid">
            {[
              { initials: 'SV', name: 'Cmdr. Sarah Vance',   role: 'Mission Commander · EVA-1', hr: 72 },
              { initials: 'MC', name: 'Dr. Marcus Chen',      role: 'Medical Specialist · EVA-2', hr: 78 },
              { initials: 'ER', name: 'Eng. Elena Rostova',   role: 'Flight Engineer · Airlock',  hr: 68 },
              { initials: 'DK', name: 'Pilot David Kalu',     role: 'Command Pilot · Orbiter',    hr: 74 },
            ].map((c, i) => (
              <div className="fade-in-section" key={i}>
                <CrewPill {...c} />
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────── */}
        <div className="cta-banner fade-in-section">
          <h2>Ready to monitor the mission?</h2>
          <p>Open the live dashboard and see the full Bio-Tesseract control center.</p>
          <Link href="/" className="btn-primary">
            Launch Dashboard →
          </Link>
        </div>

        {/* ── Footer ────────────────────────────────── */}
        <footer className="hero-footer">
          <span>© 2026 Project Bio-Tesseract · Simulation Only</span>
          <ul className="footer-links">
            <li><Link href="/">Dashboard</Link></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#crew">Crew</a></li>
          </ul>
        </footer>
      </div>
    </>
  );
}

// ── Starfield ─────────────────────────────────────────────────────
function Stars() {
  const stars = React.useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      dur: `${Math.random() * 4 + 2}s`,
      delay: `${Math.random() * 4}s`,
      min: (Math.random() * 0.2 + 0.05).toFixed(2),
      max: (Math.random() * 0.5 + 0.4).toFixed(2),
    }));
  }, []);

  return (
    <div className="stars" aria-hidden>
      {stars.map(s => (
        <div
          key={s.id}
          className="star"
          style={{
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            '--d': s.dur,
            '--delay': s.delay,
            '--min': s.min,
            '--max': s.max,
          }}
        />
      ))}
    </div>
  );
}
