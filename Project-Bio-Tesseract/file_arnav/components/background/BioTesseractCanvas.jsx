'use client';

import { useEffect, useRef } from 'react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function createField(width, height, coarsePointer) {
  let seed = Math.round(width * 17 + height * 31) || 57419;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const areaScale = coarsePointer ? 1 / 19000 : 1 / 14500;
  const count = clamp(Math.round(width * height * areaScale), coarsePointer ? 24 : 38, coarsePointer ? 46 : 82);

  return Array.from({ length: count }, (_, index) => ({
    anchorX: random() * width,
    anchorY: random() * height,
    x: 0,
    y: 0,
    phase: random() * Math.PI * 2,
    speed: 0.00012 + random() * 0.0001,
    radius: index % 11 === 0 ? 1.7 + random() * 0.7 : 0.7 + random() * 0.6,
    depth: 0.35 + random() * 0.9,
    driftX: 0,
    driftY: 0,
  })).map((particle) => ({ ...particle, x: particle.anchorX, y: particle.anchorY }));
}

export default function BioTesseractCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !context) return undefined;

    let width = 1;
    let height = 1;
    let ratio = 1;
    let frame = 0;
    let tick = 0;
    let particles = [];
    let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const pointer = { x: -1000, y: -1000, vx: 0, vy: 0, previousX: -1000, previousY: -1000 };
    let scrollTarget = 0;
    let scrollPosition = 0;
    let running = false;

    const resize = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      ratio = Math.min(window.devicePixelRatio || 1, coarsePointer ? 1.15 : 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles = createField(width, height, coarsePointer);
      if (reducedMotion.matches) render(performance.now(), true);
    };

    const updatePointer = (event) => {
      if (event.pointerType === 'touch') return;
      const nextX = event.clientX;
      const nextY = event.clientY;
      if (pointer.previousX >= 0) {
        pointer.vx = clamp(nextX - pointer.previousX, -24, 24);
        pointer.vy = clamp(nextY - pointer.previousY, -24, 24);
      }
      pointer.x = nextX;
      pointer.y = nextY;
      pointer.previousX = nextX;
      pointer.previousY = nextY;
      if (reducedMotion.matches) render(performance.now(), true);
    };

    const clearPointer = () => {
      pointer.x = -1000;
      pointer.y = -1000;
      pointer.previousX = -1000;
      pointer.previousY = -1000;
      pointer.vx = 0;
      pointer.vy = 0;
      if (reducedMotion.matches) render(performance.now(), true);
    };

    const updateScroll = () => {
      const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollTarget = window.scrollY / scrollRange;
    };

    function render(now, staticFrame = false) {
      frame = 0;
      if (document.visibilityState === 'hidden') return;

      tick = staticFrame ? 0 : now;
      const dark = document.documentElement.dataset.theme !== 'light';
      const ink = dark ? [228, 217, 230] : [84, 72, 94];
      const accent = dark ? [206, 151, 182] : [152, 94, 130];
      const elapsed = staticFrame ? 0 : tick;
      scrollPosition += (scrollTarget - scrollPosition) * (staticFrame ? 1 : 0.025);
      pointer.vx *= staticFrame ? 0 : 0.78;
      pointer.vy *= staticFrame ? 0 : 0.78;
      context.clearRect(0, 0, width, height);

      const parallaxX = pointer.x < 0 ? 0 : ((pointer.x / width) - 0.5) * -7;
      const parallaxY = pointer.y < 0 ? 0 : ((pointer.y / height) - 0.5) * -6;
      const pointerActive = pointer.x >= 0 && pointer.x <= width && pointer.y >= 0 && pointer.y <= height;

      for (const particle of particles) {
        const ambientX = staticFrame ? 0 : Math.sin(elapsed * particle.speed + particle.phase) * 2.4;
        const ambientY = staticFrame ? 0 : Math.cos(elapsed * particle.speed * 0.82 + particle.phase) * 2.2;
        let targetX = particle.anchorX + ambientX + parallaxX * particle.depth;
        let targetY = particle.anchorY + ambientY + parallaxY * particle.depth + scrollPosition * (particle.depth - 0.6) * 9;

        if (pointerActive) {
          const dx = targetX - pointer.x;
          const dy = targetY - pointer.y;
          const distance = Math.hypot(dx, dy);
          const influence = Math.pow(Math.max(0, 1 - distance / 148), 2);
          if (influence > 0 && distance > 0) {
            const push = 13 * influence;
            targetX += (dx / distance) * push + pointer.vx * influence * 0.18;
            targetY += (dy / distance) * push + pointer.vy * influence * 0.18;
          }
        }

        const ease = staticFrame ? 1 : 0.045;
        particle.x += (targetX - particle.x) * ease;
        particle.y += (targetY - particle.y) * ease;
      }

      // A sparse, nearest-neighbour field suggests connected systems without forming a net.
      for (let index = 0; index < particles.length; index += 1) {
        const source = particles[index];
        let nearestIndex = -1;
        let nearestDistance = 72;
        for (let candidateIndex = index + 1; candidateIndex < particles.length; candidateIndex += 1) {
          const candidate = particles[candidateIndex];
          const distance = Math.hypot(source.x - candidate.x, source.y - candidate.y);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = candidateIndex;
          }
        }
        if (nearestIndex < 0) continue;
        const target = particles[nearestIndex];
        const alpha = (1 - nearestDistance / 72) * (dark ? 0.09 : 0.1);
        context.beginPath();
        context.moveTo(source.x, source.y);
        context.quadraticCurveTo((source.x + target.x) / 2 + (source.y - target.y) * 0.025, (source.y + target.y) / 2 + (target.x - source.x) * 0.025, target.x, target.y);
        context.strokeStyle = `rgba(${ink.join(',')},${alpha})`;
        context.lineWidth = 0.7;
        context.stroke();
      }

      for (const particle of particles) {
        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const nearCursor = pointerActive ? Math.max(0, 1 - Math.hypot(dx, dy) / 150) : 0;
        const shimmer = staticFrame ? 0 : (0.5 + 0.5 * Math.sin(elapsed * 0.001 + particle.phase)) * 0.08;
        context.beginPath();
        context.arc(particle.x, particle.y, particle.radius + nearCursor * 0.55, 0, Math.PI * 2);
        context.fillStyle = `rgba(${nearCursor > 0.35 ? accent.join(',') : ink.join(',')},${(dark ? 0.22 : 0.2) + shimmer + nearCursor * 0.36})`;
        context.fill();
      }

      if (pointerActive) {
        const radius = Math.max(170, width * 0.19);
        const glow = context.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, radius);
        glow.addColorStop(0, dark ? 'rgba(173,112,150,0.10)' : 'rgba(154,94,130,0.075)');
        glow.addColorStop(0.42, dark ? 'rgba(129,112,154,0.045)' : 'rgba(100,91,129,0.035)');
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        context.fillStyle = glow;
        context.fillRect(0, 0, width, height);
      }

      if (!staticFrame && !reducedMotion.matches && running) frame = window.requestAnimationFrame((nextTime) => render(nextTime));
    }

    const start = () => {
      if (running || reducedMotion.matches || document.visibilityState === 'hidden') return;
      running = true;
      frame = window.requestAnimationFrame((now) => render(now));
    };
    const stop = () => {
      running = false;
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
    };
    const syncMotion = () => {
      stop();
      if (reducedMotion.matches) render(performance.now(), true);
      else start();
    };
    const syncVisibility = () => {
      if (document.visibilityState === 'hidden') stop();
      else syncMotion();
    };
    const syncTheme = () => {
      if (reducedMotion.matches) render(performance.now(), true);
    };

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', updatePointer, { passive: true });
    window.addEventListener('blur', clearPointer);
    window.addEventListener('scroll', updateScroll, { passive: true });
    document.addEventListener('visibilitychange', syncVisibility);
    window.addEventListener('bio-tesseract-theme-change', syncTheme);
    reducedMotion.addEventListener('change', syncMotion);
    resize();
    updateScroll();
    syncMotion();

    return () => {
      stop();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', updatePointer);
      window.removeEventListener('blur', clearPointer);
      window.removeEventListener('scroll', updateScroll);
      document.removeEventListener('visibilitychange', syncVisibility);
      window.removeEventListener('bio-tesseract-theme-change', syncTheme);
      reducedMotion.removeEventListener('change', syncMotion);
    };
  }, []);

  return <canvas ref={canvasRef} className="bio-tesseract-canvas" aria-hidden="true" />;
}
