'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import BioTesseractLogo from '../logo/BioTesseractLogo';

const INITIAL_CREW = [
  { av: 'SV', name: 'Cmdr. Sarah Vance', role: 'Mission Commander · EVA-1', hr: 72 },
  { av: 'MC', name: 'Dr. Marcus Chen', role: 'Medical Specialist · EVA-2', hr: 78 },
  { av: 'ER', name: 'Eng. Elena Rostova', role: 'Flight Engineer · Airlock', hr: 68 },
  { av: 'DK', name: 'Pilot David Kalu', role: 'Command Pilot · Orbiter', hr: 74 },
];

const FEATURES = [
  { n: '01', icon: '❤️', title: 'Bio-Monitor', desc: 'Live ECG, heart rate, SpO₂ and blood pressure — realistic telemetry drift every 2.5 seconds.' },
  { n: '02', icon: '🌬️', title: 'Life Support', desc: 'Suit pressure and O₂ levels tracked across the entire crew simultaneously.' },
  { n: '03', icon: '🧠', title: 'AI Medical Advisor', desc: 'Telemetry pattern recognition to flag physiological anomalies before they escalate.' },
  { n: '04', icon: '📡', title: 'Mission Alerts', desc: 'Tiered mission feed — from nominal comm locks to simulated cardiac alerts.' },
  { n: '05', icon: '👩‍🚀', title: 'Crew Dossiers', desc: 'Deep-dive into individual biometrics, assigned EVA roles, and suit telemetry.' },
  { n: '06', icon: '🚨', title: 'Anomaly Simulation', desc: 'Test mission control response with instant tachycardia and metabolic elevation triggers.' },
];

const TYPEWRITER_WORDS = ['Astronaut Health.', 'Deep-Space Vitals.', 'Crew Biometrics.'];

export default function HeroView() {
  const canvasRef = useRef(null);

  // ── Typewriter headline state ──────────────────────────────────────
  const [typedText, setTypedText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timeout;
    let active = false;
    const currentWord = TYPEWRITER_WORDS[wordIdx];
    const clearTimer = () => {
      clearTimeout(timeout);
      timeout = undefined;
    };
    const tick = () => {
      if (!active) return;
      if (!isDeleting && typedText.length < currentWord.length) {
        timeout = setTimeout(() => setTypedText(currentWord.slice(0, typedText.length + 1)), 85);
      } else if (!isDeleting) {
        timeout = setTimeout(() => setIsDeleting(true), 1800);
      } else if (typedText.length > 0) {
        timeout = setTimeout(() => setTypedText(currentWord.slice(0, typedText.length - 1)), 45);
      } else {
        timeout = setTimeout(() => {
          setIsDeleting(false);
          setWordIdx((prev) => (prev + 1) % TYPEWRITER_WORDS.length);
        }, 45);
      }
    };
    const sync = () => {
      clearTimer();
      active = !motionQuery.matches && document.visibilityState !== 'hidden';
      if (motionQuery.matches) {
        timeout = setTimeout(() => {
          setTypedText(currentWord);
          setIsDeleting(false);
        }, 0);
      } else if (active) {
        tick();
      }
    };
    const onMotionChange = () => sync();
    const onVisibilityChange = () => sync();

    motionQuery.addEventListener('change', onMotionChange);
    document.addEventListener('visibilitychange', onVisibilityChange);
    sync();
    return () => {
      active = false;
      clearTimer();
      motionQuery.removeEventListener('change', onMotionChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [typedText, isDeleting, wordIdx]);

  // ── Stats count-up ─────────────────────────────────────────────────
  const [stats, setStats] = useState({ crew: 4, spo2: 98, hr: 72, days: 14 });

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let startTs = null;
    const dur = 1400;
    let frameId;
    let running = false;

    const step = (ts) => {
      if (!running) return;
      if (!startTs) startTs = ts;
      const progress = Math.min((ts - startTs) / dur, 1);
      const ease = 1 - Math.pow(1 - progress, 3);

      setStats({
        crew: Math.floor(ease * 4),
        spo2: Math.floor(ease * 98),
        hr: Math.floor(ease * 72),
        days: Math.floor(ease * 14),
      });

      if (progress < 1 && running) {
        frameId = requestAnimationFrame(step);
      }
    };

    const stop = () => {
      running = false;
      if (frameId !== undefined) cancelAnimationFrame(frameId);
      frameId = undefined;
    };
    const sync = () => {
      stop();
      if (!motionQuery.matches && document.visibilityState !== 'hidden' && stats.crew < 4) {
        running = true;
        frameId = requestAnimationFrame(step);
      }
    };

    motionQuery.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    sync();
    return () => {
      stop();
      motionQuery.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, [stats.crew]);

  // ── Live crew heart rate drift ─────────────────────────────────────
  const [crewData, setCrewData] = useState(INITIAL_CREW);

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer;
    const stop = () => {
      clearInterval(timer);
      timer = undefined;
    };
    const start = () => {
      if (timer || motionQuery.matches || document.visibilityState === 'hidden') return;
      timer = setInterval(() => {
        setCrewData((prev) => prev.map((c) => {
          const delta = Math.floor(Math.random() * 3) - 1;
          const nextHr = Math.min(105, Math.max(55, c.hr + delta));
          return { ...c, hr: nextHr };
        }));
      }, 2500);
    };
    const sync = () => {
      stop();
      start();
    };
    motionQuery.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    sync();
    return () => {
      stop();
      motionQuery.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  // ── Starfield & Shooting Comets Canvas ──────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
      initStars();
    };
    window.addEventListener('resize', onResize);

    // Stars
    const NUM_STARS = 160;
    const stars = [];
    const initStars = () => {
      stars.length = 0;
      for (let i = 0; i < NUM_STARS; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.3 + 0.3,
          base: Math.random() * 0.45 + 0.1,
          spd: Math.random() * 0.025 + 0.008,
          off: Math.random() * Math.PI * 2,
        });
      }
    };
    initStars();

    // Comets
    const comets = [];
    const MAX_COMETS = 4;

    const spawnComet = () => {
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.4;
      const side = Math.random() < 0.6 ? 'top' : 'left';
      const len = 90 + Math.random() * 110;
      const spd = 2.5 + Math.random() * 3;
      const x = side === 'top' ? Math.random() * W : -len;
      const y = side === 'top' ? -len : Math.random() * H * 0.6;
      comets.push({
        x,
        y,
        angle,
        spd,
        len,
        op: 0.6 + Math.random() * 0.35,
        w: 1 + Math.random(),
      });
    };

    const timeouts = [];
    for (let i = 0; i < MAX_COMETS; i++) {
      timeouts.push(
        setTimeout(spawnComet, i * 1800 + Math.random() * 800)
      );
    }

    let animFrame = null;
    let running = false;
    let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pendingTimeouts = new Set();
    const scheduleComet = (delay) => {
      const timeout = setTimeout(() => {
        pendingTimeouts.delete(timeout);
        if (running) spawnComet();
      }, delay);
      pendingTimeouts.add(timeout);
    };
    const render = (ts) => {
      ctx.clearRect(0, 0, W, H);
      const t = ts * 0.001;

      // Draw Stars
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const op = s.base + Math.sin(t * s.spd + s.off) * 0.18;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, Math.min(1, op))})`;
        ctx.fill();
      }

      // Update & Draw Comets
      for (let i = comets.length - 1; i >= 0; i--) {
        const c = comets[i];
        c.x += Math.cos(c.angle) * c.spd;
        c.y += Math.sin(c.angle) * c.spd;

        if (c.x > W + c.len || c.y > H + c.len) {
          comets.splice(i, 1);
          scheduleComet(2000 + Math.random() * 3000);
          continue;
        }

        const tx = c.x - Math.cos(c.angle) * c.len;
        const ty = c.y - Math.sin(c.angle) * c.len;
        const grad = ctx.createLinearGradient(tx, ty, c.x, c.y);
        grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
        grad.addColorStop(0.6, `rgba(242, 190, 221, ${c.op * 0.4})`);
        grad.addColorStop(1, `rgba(255, 255, 255, ${c.op})`);

        ctx.beginPath();
        ctx.moveTo(tx, ty);
        ctx.lineTo(c.x, c.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = c.w;
        ctx.lineCap = 'round';
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(c.x, c.y, c.w * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${c.op})`;
        ctx.fill();
      }

      if (running) animFrame = requestAnimationFrame(render);
    };

    const drawStaticFrame = () => {
      ctx.clearRect(0, 0, W, H);
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.base})`;
        ctx.fill();
      });
    };
    const stop = () => {
      running = false;
      if (animFrame !== null) cancelAnimationFrame(animFrame);
      animFrame = null;
      pendingTimeouts.forEach(clearTimeout);
      pendingTimeouts.clear();
      comets.length = 0;
    };
    const start = () => {
      if (running || reducedMotion.matches || document.visibilityState === 'hidden') return;
      running = true;
      scheduleComet(0);
      scheduleComet(1800 + Math.random() * 800);
      scheduleComet(3600 + Math.random() * 800);
      scheduleComet(5400 + Math.random() * 800);
      animFrame = requestAnimationFrame(render);
    };
    const syncMotion = () => {
      stop();
      if (reducedMotion.matches) drawStaticFrame();
      else start();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') stop();
      else syncMotion();
    };
    const onMotionChange = () => syncMotion();

    reducedMotion.addEventListener('change', onMotionChange);
    document.addEventListener('visibilitychange', onVisibilityChange);
    syncMotion();

    return () => {
      window.removeEventListener('resize', onResize);
      reducedMotion.removeEventListener('change', onMotionChange);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      stop();
    };
  }, []);

  return (
    <div className="hero-root">
      {/* Background Starfield and Comets */}
      <canvas ref={canvasRef} className="space-canvas" aria-hidden="true" />

      {/* Main Content Layer */}
      <div className="content-layer">
        {/* Navigation Bar */}
        <header className="hero-nav">
          <Link href="/" className="nav-brand-wrap">
            <BioTesseractLogo size={42} />
            <div className="nav-brand-text">
              <span className="nb-tag">Project</span>
              <span className="nb-main">Bio-Tesseract</span>
            </div>
          </Link>

          <nav className="nav-menu">
            <a href="#features">Features</a>
            <a href="#crew">Crew</a>
            <Link href="/dashboard" className="nav-cta-btn">
              Open Dashboard →
            </Link>
          </nav>
        </header>

        {/* Hero Section */}
        <section className="hero-main">
          <div className="hero-left">
            <div className="eyebrow-badge">
              Deep Space Bio-Telemetry
            </div>

            <h1 className="hero-heading">
              <span className="typed-line">
                {typedText}
                <span className="typing-cursor" />
              </span>
              <span className="sub-heading">Monitored.<br />Always.</span>
            </h1>

            <p className="hero-description">
              A real-time astronaut health and life-support mission platform.
              Track biometrics, habitat telemetry, and crew vitals across missions.
            </p>

            <div className="hero-btn-group">
              <Link href="/dashboard" className="btn-primary">
                Open Mission Dashboard →
              </Link>
              <a href="#features" className="btn-secondary">
                See features
              </a>
            </div>
          </div>

          <div className="hero-right">
            <BioTesseractLogo size={300} spinning={true} className="hero-logo-large" />
          </div>
        </section>

        {/* Stats Strip */}
        <section className="stats-strip">
          <div className="stat-item">
            <div className="stat-number" style={{ color: 'var(--hero-magenta)' }}>
              {stats.crew}
            </div>
            <div className="stat-label">Crew Active</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" style={{ color: '#ffffff' }}>
              {stats.spo2}%
            </div>
            <div className="stat-label">Avg SpO₂</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" style={{ color: '#ffffff' }}>
              {stats.hr}
            </div>
            <div className="stat-label">Avg Heart Rate (BPM)</div>
          </div>
          <div className="stat-item">
            <div className="stat-number" style={{ color: 'var(--hero-pink)' }}>
              {stats.days}d
            </div>
            <div className="stat-label">Mission Elapsed</div>
          </div>
        </section>

        {/* Features Section */}
        <section className="section-container" id="features">
          <div className="section-eyebrow">What&apos;s inside</div>
          <h2 className="section-heading">Built for mission control.</h2>
          <p className="section-subtext">
            From ECG waveforms to suit pressure — every critical telemetry system in one unified view.
          </p>

          <div className="features-grid">
            {FEATURES.map((feat) => (
              <div key={feat.n} className="feature-card">
                <div className="feat-num">{feat.n}</div>
                <div className="feat-icon">{feat.icon}</div>
                <h3 className="feat-title">{feat.title}</h3>
                <p className="feat-desc">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="section-divider" />

        {/* Crew Section */}
        <section className="section-container" id="crew">
          <div className="section-eyebrow">On board</div>
          <h2 className="section-heading">Meet the crew</h2>
          <p className="section-subtext">
            Four active specialists. Telemetry synchronized live every 2.5 seconds.
          </p>

          <div className="crew-grid">
            {crewData.map((c) => (
              <div key={c.av} className="crew-card">
                <div className="crew-avatar">{c.av}</div>
                <div className="crew-details">
                  <div className="crew-name">{c.name}</div>
                  <div className="crew-role">{c.role}</div>
                </div>
                <div className="crew-vital">
                  <span className="live-dot" />
                  <span className="vital-num">{c.hr}</span>
                  <span className="vital-unit">bpm</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Banner */}
        <section className="cta-banner">
          <div className="cta-inner">
            <div>
              <h2 className="cta-title">Ready to monitor the mission?</h2>
              <p className="cta-subtitle">
                Open the live Bio-Tesseract dashboard with active crew biometrics and telemetry.
              </p>
            </div>
            <div className="cta-actions">
              <BioTesseractLogo size={56} />
              <Link href="/dashboard" className="cta-button">
                Launch Dashboard →
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="hero-footer">
          <div className="footer-left">
            <BioTesseractLogo size={30} />
            <span>Project Bio-Tesseract · Mission Simulation · © 2026</span>
          </div>
          <div className="footer-links">
            <Link href="/dashboard">Dashboard</Link>
            <a href="#features">Features</a>
            <a href="#crew">Crew</a>
          </div>
        </footer>
      </div>

      <style jsx>{`
        :root {
          --hero-bg: #0a0a0a;
          --hero-bg-card: #121212;
          --hero-bg-hover: #181818;
          --hero-maroon: #5A1A3C;
          --hero-pink: #F2BEDD;
          --hero-magenta: #C02878;
          --hero-border: #222222;
          --hero-text: #f0f0f0;
          --hero-muted: #888888;
        }

        .hero-root {
          background-color: #0a0a0a;
          color: #f0f0f0;
          min-height: 100vh;
          position: relative;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          overflow-x: hidden;
        }

        .space-canvas {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        .content-layer {
          position: relative;
          z-index: 1;
        }

        /* ── Navbar ── */
        .hero-nav {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 48px;
          height: 66px;
          background: rgba(10, 10, 10, 0.94);
          border-bottom: 1px solid #222222;
          backdrop-filter: blur(12px);
        }

        .nav-brand-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .nav-brand-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }

        .nb-tag {
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #C02878;
        }

        .nb-main {
          font-size: 0.98rem;
          font-weight: 800;
          letter-spacing: 0.04em;
          color: #ffffff;
        }

        .nav-menu {
          display: flex;
          align-items: center;
          gap: 32px;
        }

        .nav-menu a {
          color: #888888;
          text-decoration: none;
          font-size: 0.88rem;
          font-weight: 500;
          transition: color 0.2s;
        }

        .nav-menu a:hover {
          color: #ffffff;
        }

        .nav-cta-btn {
          background: #C02878 !important;
          color: #ffffff !important;
          font-weight: 700 !important;
          font-size: 0.84rem !important;
          padding: 9px 20px;
          border-radius: 6px;
          letter-spacing: 0.02em;
          transition: background 0.2s, transform 0.15s !important;
        }

        .nav-cta-btn:hover {
          background: #a01f63 !important;
          transform: translateY(-1px);
        }

        /* ── Hero Main ── */
        .hero-main {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
          max-width: 1120px;
          margin: 0 auto;
          padding: 88px 36px 72px;
        }

        .eyebrow-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: #C02878;
          margin-bottom: 20px;
        }

        .eyebrow-badge::before {
          content: '';
          display: block;
          width: 24px;
          height: 1.5px;
          background: #C02878;
        }

        .hero-heading {
          font-size: clamp(2.2rem, 4.5vw, 3.5rem);
          font-weight: 900;
          line-height: 1.08;
          letter-spacing: -0.025em;
          margin-bottom: 20px;
        }

        .typed-line {
          color: #C02878;
          display: block;
          min-height: 1.15em;
        }

        .typing-cursor {
          display: inline-block;
          width: 3px;
          height: 0.85em;
          background: #C02878;
          margin-left: 3px;
          vertical-align: middle;
          animation: blink 1s step-end infinite;
        }

        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }

        .sub-heading {
          color: #ffffff;
          display: block;
        }

        .hero-description {
          color: #888888;
          font-size: 1rem;
          line-height: 1.72;
          max-width: 440px;
          margin-bottom: 36px;
        }

        .hero-btn-group {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          align-items: center;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #C02878;
          color: #ffffff;
          font-weight: 700;
          font-size: 0.88rem;
          padding: 13px 28px;
          border-radius: 7px;
          text-decoration: none;
          letter-spacing: 0.02em;
          transition: background 0.2s, transform 0.15s;
        }

        .btn-primary:hover {
          background: #a01f63;
          transform: translateY(-2px);
        }

        .btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: #ffffff;
          font-weight: 600;
          font-size: 0.88rem;
          padding: 12px 24px;
          border-radius: 7px;
          border: 1px solid #222222;
          text-decoration: none;
          transition: border-color 0.2s, background 0.2s, transform 0.15s;
        }

        .btn-secondary:hover {
          border-color: #444444;
          background: #181818;
          transform: translateY(-2px);
        }

        .hero-right {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        /* ── Stats Strip ── */
        .stats-strip {
          border-top: 1px solid #222222;
          border-bottom: 1px solid #222222;
          background: #111111;
          display: flex;
        }

        .stat-item {
          flex: 1;
          padding: 26px 32px;
          text-align: center;
          border-right: 1px solid #222222;
        }

        .stat-item:last-child {
          border-right: none;
        }

        .stat-number {
          font-size: 2.1rem;
          font-weight: 900;
          letter-spacing: -0.03em;
          line-height: 1;
          margin-bottom: 6px;
          font-variant-numeric: tabular-nums;
        }

        .stat-label {
          font-size: 0.72rem;
          color: #888888;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 600;
        }

        /* ── Sections ── */
        .section-container {
          max-width: 1120px;
          margin: 0 auto;
          padding: 86px 36px;
        }

        .section-eyebrow {
          font-size: 0.72rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: #C02878;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .section-eyebrow::before {
          content: '';
          display: block;
          width: 20px;
          height: 1.5px;
          background: #C02878;
        }

        .section-heading {
          font-size: clamp(1.6rem, 3vw, 2.3rem);
          font-weight: 900;
          letter-spacing: -0.02em;
          line-height: 1.1;
          margin-bottom: 12px;
        }

        .section-subtext {
          color: #888888;
          font-size: 0.95rem;
          line-height: 1.65;
          max-width: 500px;
          margin-bottom: 48px;
        }

        .section-divider {
          height: 1px;
          background: #222222;
        }

        /* ── Features Grid ── */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          border: 1px solid #222222;
          border-radius: 10px;
          overflow: hidden;
          background: #222222;
        }

        .feature-card {
          background: #111111;
          padding: 28px 24px;
          transition: background 0.2s;
        }

        .feature-card:hover {
          background: #181818;
        }

        .feat-num {
          font-size: 0.72rem;
          font-weight: 700;
          color: #C02878;
          letter-spacing: 0.08em;
          margin-bottom: 14px;
        }

        .feat-icon {
          font-size: 1.4rem;
          margin-bottom: 12px;
        }

        .feat-title {
          font-size: 0.95rem;
          font-weight: 700;
          margin-bottom: 8px;
          color: #ffffff;
        }

        .feat-desc {
          font-size: 0.84rem;
          color: #888888;
          line-height: 1.6;
        }

        /* ── Crew Grid ── */
        .crew-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1px;
          border: 1px solid #222222;
          border-radius: 10px;
          overflow: hidden;
          background: #222222;
        }

        .crew-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 22px 24px;
          background: #111111;
          transition: background 0.2s;
        }

        .crew-card:hover {
          background: #181818;
        }

        .crew-avatar {
          width: 46px;
          height: 46px;
          border-radius: 50%;
          background: rgba(192, 40, 120, 0.12);
          border: 1.5px solid rgba(192, 40, 120, 0.35);
          color: #C02878;
          font-weight: 800;
          font-size: 0.82rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          letter-spacing: 0.03em;
        }

        .crew-details {
          flex: 1;
          min-width: 0;
        }

        .crew-name {
          font-weight: 700;
          font-size: 0.92rem;
        }

        .crew-role {
          color: #888888;
          font-size: 0.78rem;
          margin-top: 2px;
        }

        .crew-vital {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 0.84rem;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
        }

        .live-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c55e;
          flex-shrink: 0;
          animation: dot-pulse 2.2s ease-in-out infinite;
        }

        @keyframes dot-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        .vital-num {
          color: #F2BEDD;
        }

        .vital-unit {
          color: #888888;
          font-weight: 500;
          font-size: 0.78rem;
        }

        /* ── CTA Banner ── */
        .cta-banner {
          background: #5A1A3C;
          border-top: 1px solid rgba(242, 190, 221, 0.2);
        }

        .cta-inner {
          max-width: 1120px;
          margin: 0 auto;
          padding: 56px 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
          flex-wrap: wrap;
        }

        .cta-title {
          font-size: clamp(1.4rem, 3vw, 2rem);
          font-weight: 900;
          color: #F2BEDD;
          letter-spacing: -0.02em;
          line-height: 1.1;
        }

        .cta-subtitle {
          color: rgba(242, 190, 221, 0.75);
          font-size: 0.92rem;
          margin-top: 8px;
        }

        .cta-actions {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }

        .cta-button {
          background: #F2BEDD;
          color: #5A1A3C;
          font-weight: 800;
          font-size: 0.88rem;
          padding: 13px 28px;
          border-radius: 7px;
          text-decoration: none;
          letter-spacing: 0.02em;
          transition: opacity 0.2s, transform 0.15s;
          white-space: nowrap;
        }

        .cta-button:hover {
          opacity: 0.9;
          transform: translateY(-2px);
        }

        /* ── Footer ── */
        .hero-footer {
          background: #111111;
          border-top: 1px solid #222222;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 36px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .footer-left {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #888888;
          font-size: 0.82rem;
          font-weight: 500;
        }

        .footer-links {
          display: flex;
          gap: 24px;
        }

        .footer-links a {
          color: #888888;
          text-decoration: none;
          font-size: 0.82rem;
          transition: color 0.2s;
        }

        .footer-links a:hover {
          color: #ffffff;
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .hero-main {
            grid-template-columns: 1fr;
            text-align: center;
            padding-top: 50px;
          }
          .hero-description {
            margin-left: auto;
            margin-right: auto;
          }
          .hero-btn-group {
            justify-content: center;
          }
          .eyebrow-badge {
            justify-content: center;
          }
          .features-grid {
            grid-template-columns: 1fr;
          }
          .crew-grid {
            grid-template-columns: 1fr;
          }
          .stats-strip {
            flex-direction: column;
          }
          .stat-item {
            border-right: none;
            border-bottom: 1px solid #222222;
          }
          .stat-item:last-child {
            border-bottom: none;
          }
          .hero-nav {
            padding: 0 20px;
          }
        }
      `}</style>
    </div>
  );
}
