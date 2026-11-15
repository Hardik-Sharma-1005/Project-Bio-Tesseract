'use client';

import { useEffect, useRef } from 'react';

const TAU = Math.PI * 2;
const BODY_PARTS = [
  { kind: 'ellipsoid', center: [0, 2.18, 0], radius: [0.19, 0.26, 0.2] }, // head
  { kind: 'ellipsoid', center: [0, 1.88, 0], radius: [0.09, 0.16, 0.1] }, // neck
  { kind: 'lathe', profile: [[0.55, 0.15, 0.12], [0.72, 0.28, 0.16], [0.88, 0.25, 0.15], [1.02, 0.18, 0.13], [1.24, 0.23, 0.145], [1.48, 0.34, 0.18], [1.65, 0.37, 0.17], [1.77, 0.28, 0.13], [1.83, 0.13, 0.11]] },
  { kind: 'segment', from: [-0.34, 1.65, 0], to: [-0.49, 1.04, 0], radius: 0.105 },
  { kind: 'segment', from: [-0.49, 1.04, 0], to: [-0.57, 0.48, 0.015], radius: 0.083 },
  { kind: 'ellipsoid', center: [-0.58, 0.35, 0.015], radius: [0.085, 0.14, 0.07] },
  { kind: 'segment', from: [0.34, 1.65, 0], to: [0.49, 1.04, 0], radius: 0.105 },
  { kind: 'segment', from: [0.49, 1.04, 0], to: [0.57, 0.48, 0.015], radius: 0.083 },
  { kind: 'ellipsoid', center: [0.58, 0.35, 0.015], radius: [0.085, 0.14, 0.07] },
  { kind: 'segment', from: [-0.16, 0.66, 0], to: [-0.205, -0.13, 0], radius: 0.145 },
  { kind: 'segment', from: [-0.205, -0.13, 0], to: [-0.22, -0.91, 0.005], radius: 0.105 },
  { kind: 'ellipsoid', center: [-0.22, -1.05, 0.045], radius: [0.105, 0.105, 0.23] },
  { kind: 'segment', from: [0.16, 0.66, 0], to: [0.205, -0.13, 0], radius: 0.145 },
  { kind: 'segment', from: [0.205, -0.13, 0], to: [0.22, -0.91, 0.005], radius: 0.105 },
  { kind: 'ellipsoid', center: [0.22, -1.05, 0.045], radius: [0.105, 0.105, 0.23] },
];

function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
function normalize(a) { const length = Math.hypot(...a) || 1; return a.map(value => value / length); }

function sphereMesh(center, radius, rows = 12, columns = 20) {
  const vertices = [];
  for (let row = 0; row <= rows; row += 1) {
    const latitude = -Math.PI / 2 + Math.PI * row / rows;
    for (let column = 0; column <= columns; column += 1) {
      const longitude = TAU * column / columns;
      vertices.push([
        center[0] + radius[0] * Math.cos(latitude) * Math.cos(longitude),
        center[1] + radius[1] * Math.sin(latitude),
        center[2] + radius[2] * Math.cos(latitude) * Math.sin(longitude),
      ]);
    }
  }
  const faces = [];
  for (let row = 0; row < rows; row += 1) for (let column = 0; column < columns; column += 1) {
    const a = row * (columns + 1) + column; const b = a + columns + 1;
    faces.push([vertices[a], vertices[b], vertices[a + 1]], [vertices[a + 1], vertices[b], vertices[b + 1]]);
  }
  return faces;
}

function latheMesh(profile) {
  const faces = []; const columns = 56; const smooth = [];
  for (let index = 0; index < profile.length - 1; index += 1) {
    const before = profile[Math.max(0, index - 1)]; const from = profile[index]; const to = profile[index + 1]; const after = profile[Math.min(profile.length - 1, index + 2)];
    for (let step = 0; step < 6; step += 1) {
      const t = step / 6; const t2 = t * t; const t3 = t2 * t;
      const curve = dimension => 0.5 * ((2 * from[dimension]) + (-before[dimension] + to[dimension]) * t + (2 * before[dimension] - 5 * from[dimension] + 4 * to[dimension] - after[dimension]) * t2 + (-before[dimension] + 3 * from[dimension] - 3 * to[dimension] + after[dimension]) * t3);
      smooth.push([from[0] + (to[0] - from[0]) * t, Math.max(0.01, curve(1)), Math.max(0.01, curve(2))]);
    }
  }
  smooth.push(profile[profile.length - 1]);
  const rings = smooth.map(([y, rx, rz]) => Array.from({ length: columns }, (_, index) => {
    const angle = TAU * index / columns;
    return [rx * Math.cos(angle), y, rz * Math.sin(angle)];
  }));
  for (let ring = 0; ring < rings.length - 1; ring += 1) for (let column = 0; column < columns; column += 1) {
    const next = (column + 1) % columns;
    faces.push([rings[ring][column], rings[ring + 1][column], rings[ring][next]], [rings[ring][next], rings[ring + 1][column], rings[ring + 1][next]]);
  }
  return faces;
}

function segmentMesh(from, to, radius, radialSteps = 12, lengthSteps = 12) {
  const axis = normalize(to.map((value, index) => value - from[index]));
  const basisA = normalize(cross(axis, [0, 0, 1]));
  const basisB = normalize(cross(axis, basisA));
  const length = Math.hypot(...to.map((value, index) => value - from[index]));
  const center = from.map((value, index) => (value + to[index]) / 2);
  const rings = [];
  for (let step = 0; step <= lengthSteps; step += 1) {
    const along = -Math.PI / 2 + Math.PI * step / lengthSteps;
    const r = radius * Math.cos(along);
    const position = center.map((value, index) => value + axis[index] * Math.sin(along) * (length / 2 + radius * 0.72));
    rings.push(Array.from({ length: radialSteps }, (_, index) => {
      const angle = TAU * index / radialSteps;
      return position.map((value, axisIndex) => value + basisA[axisIndex] * r * Math.cos(angle) + basisB[axisIndex] * r * Math.sin(angle));
    }));
  }
  const faces = [];
  for (let ring = 0; ring < rings.length - 1; ring += 1) for (let index = 0; index < radialSteps; index += 1) {
    const next = (index + 1) % radialSteps;
    faces.push([rings[ring][index], rings[ring + 1][index], rings[ring][next]], [rings[ring][next], rings[ring + 1][index], rings[ring + 1][next]]);
  }
  return faces;
}

const MESH = BODY_PARTS.flatMap(part => part.kind === 'lathe' ? latheMesh(part.profile)
  : part.kind === 'segment' ? segmentMesh(part.from, part.to, part.radius)
    : sphereMesh(part.center, part.radius));

function renderHuman(context, width, height, elapsed, reducedMotion) {
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  const yaw = reducedMotion ? -0.18 : elapsed * 0.00016 - 0.8;
  const cosine = Math.cos(yaw); const sine = Math.sin(yaw);
  const scale = Math.min(width * 0.36, height * 0.22);
  const originX = width * 0.5; const originY = height * 0.63;
  const project = ([x, y, z]) => ({ x: originX + scale * (x * cosine + z * sine), y: originY - scale * y, z: -x * sine + z * cosine });
  const light = normalize([-0.42, 0.63, 0.83]);
  context.clearRect(0, 0, width * ratio, height * ratio);
  context.save(); context.scale(ratio, ratio);

  const triangles = MESH.map(face => {
    const vertices = face.map(project);
    const normal = normalize(cross(
      [vertices[1].x - vertices[0].x, vertices[1].y - vertices[0].y, vertices[1].z - vertices[0].z],
      [vertices[2].x - vertices[0].x, vertices[2].y - vertices[0].y, vertices[2].z - vertices[0].z],
    ));
    const diffuse = Math.max(0, dot(normal, light));
    const depth = vertices.reduce((sum, vertex) => sum + vertex.z, 0) / 3;
    return { vertices, diffuse, depth };
  }).sort((a, b) => a.depth - b.depth);

  for (const triangle of triangles) {
    const [a, b, c] = triangle.vertices;
    const shade = Math.round(116 + triangle.diffuse * 112);
    context.beginPath(); context.moveTo(a.x, a.y); context.lineTo(b.x, b.y); context.lineTo(c.x, c.y); context.closePath();
    context.fillStyle = `rgba(${shade},${Math.round(shade * 0.79)},${Math.round(shade * 0.88)},0.97)`;
    context.fill();
  }

  const faceCenter = project([0, 2.16, 0.18]);
  if (faceCenter.z > 0.035) {
    const faceAlpha = Math.min(0.72, (faceCenter.z - 0.035) * 2.8);
    context.save(); context.globalAlpha = faceAlpha; context.strokeStyle = 'rgba(72,43,63,.8)'; context.fillStyle = 'rgba(72,43,63,.8)'; context.lineWidth = 1.05;
    for (const eyeX of [-0.063, 0.063]) {
      const eyeA = project([eyeX - 0.025, 2.22, 0.176]); const eyeB = project([eyeX + 0.025, 2.22, 0.176]); const eyeMid = project([eyeX, 2.232, 0.184]);
      context.beginPath(); context.moveTo(eyeA.x, eyeA.y); context.quadraticCurveTo(eyeMid.x, eyeMid.y, eyeB.x, eyeB.y); context.stroke();
      const iris = project([eyeX, 2.22, 0.186]); context.beginPath(); context.arc(iris.x, iris.y, 1.25, 0, TAU); context.fill();
    }
    const noseTop = project([0, 2.20, 0.19]); const noseTip = project([0, 2.125, 0.205]);
    context.beginPath(); context.moveTo(noseTop.x, noseTop.y); context.quadraticCurveTo(noseTip.x + scale * 0.025, noseTip.y, noseTip.x, noseTip.y); context.stroke();
    const mouthLeft = project([-0.038, 2.06, 0.176]); const mouthRight = project([0.038, 2.06, 0.176]); const mouthMid = project([0, 2.052, 0.182]);
    context.beginPath(); context.moveTo(mouthLeft.x, mouthLeft.y); context.quadraticCurveTo(mouthMid.x, mouthMid.y, mouthRight.x, mouthRight.y); context.stroke();
    context.restore();
  }

  // A quiet vascular/nerve path follows the rendered volume and rotates with it.
  const pathways = [
    [[0, 1.65, 0.17], [-0.16, 1.49, 0.17], [-0.08, 1.27, 0.155], [0, 1.03, 0.14], [0.07, 0.81, 0.15], [0.18, 0.55, 0.12], [0.2, 0.22, 0.105], [0.22, -0.04, 0.105]],
    [[0, 1.65, 0.17], [0.16, 1.49, 0.17], [0.08, 1.27, 0.155], [0, 1.03, 0.14], [-0.07, 0.81, 0.15], [-0.18, 0.55, 0.12], [-0.2, 0.22, 0.105], [-0.22, -0.04, 0.105]],
    [[-0.1, 1.58, 0.17], [-0.32, 1.62, 0.12], [-0.40, 1.35, 0.09], [-0.48, 1.05, 0.08], [-0.54, 0.77, 0.075], [-0.57, 0.5, 0.06]],
    [[0.1, 1.58, 0.17], [0.32, 1.62, 0.12], [0.40, 1.35, 0.09], [0.48, 1.05, 0.08], [0.54, 0.77, 0.075], [0.57, 0.5, 0.06]],
  ];
  for (const points of pathways) {
    const visible = points.map(point => ({ point, screen: project(point) })).filter(({ screen }) => screen.z > -0.06);
    if (visible.length < 2) continue;
    context.beginPath(); context.moveTo(visible[0].screen.x, visible[0].screen.y);
    for (let index = 1; index < visible.length; index += 1) context.lineTo(visible[index].screen.x, visible[index].screen.y);
    context.strokeStyle = 'rgba(239,174,207,0.78)'; context.lineWidth = 1.15; context.stroke();
    for (let index = 2; index < visible.length - 1; index += 2) {
      const { x, y } = visible[index].screen; context.beginPath(); context.arc(x, y, 2, 0, TAU); context.fillStyle = 'rgba(247,205,224,0.85)'; context.fill();
    }
  }
  context.restore();
}

export default function LifeSystemsIllustration() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!canvas || !context) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0; let width = 0; let height = 0;
    const resize = () => {
      const rect = canvas.getBoundingClientRect(); const ratio = Math.min(2, window.devicePixelRatio || 1);
      width = rect.width; height = rect.height;
      canvas.width = Math.round(width * ratio); canvas.height = Math.round(height * ratio);
      if (reducedMotion.matches) render(performance.now());
    };
    const render = (now) => {
      renderHuman(context, width, height, now, reducedMotion.matches);
      frame = 0;
      if (!reducedMotion.matches && document.visibilityState !== 'hidden') frame = requestAnimationFrame(render);
    };
    const sync = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      if (reducedMotion.matches) render(performance.now());
      else if (document.visibilityState !== 'hidden') frame = requestAnimationFrame(render);
    };
    const visibility = () => sync();
    const observer = new ResizeObserver(resize); observer.observe(canvas);
    document.addEventListener('visibilitychange', visibility);
    reducedMotion.addEventListener('change', sync);
    resize(); sync();
    return () => { if (frame) cancelAnimationFrame(frame); observer.disconnect(); document.removeEventListener('visibilitychange', visibility); reducedMotion.removeEventListener('change', sync); };
  }, []);

  return (
    <div className="bt-life-systems" role="img" aria-label="Slowly rotating three-dimensional human systems visualization connected to crew, biology, environment, response, and mission">
      <svg className="bt-life-systems__orbits" viewBox="0 0 620 470" aria-hidden="true">
        <ellipse cx="310" cy="228" rx="205" ry="112" transform="rotate(-24 310 228)" />
        <ellipse cx="310" cy="228" rx="170" ry="92" transform="rotate(29 310 228)" />
        <path d="M310 30V430M56 230H564" />
      </svg>
      <canvas ref={canvasRef} className="bt-life-systems__human" aria-hidden="true" />
      <span className="bt-life-systems__node bt-life-systems__node--crew"><i />Crew</span>
      <span className="bt-life-systems__node bt-life-systems__node--biology"><i />Biology</span>
      <span className="bt-life-systems__node bt-life-systems__node--environment"><i />Environment</span>
      <span className="bt-life-systems__node bt-life-systems__node--response"><i />Response</span>
      <span className="bt-life-systems__node bt-life-systems__node--mission"><i />Mission</span>
    </div>
  );
}
