'use client';

import React, { useId } from 'react';

export default function BioTesseractLogo({ size = 44, spinning = false, className = '' }) {
  const uniqueId = useId().replace(/:/g, '');
  const topArcId = `top-arc-${uniqueId}`;
  const botArcId = `bot-arc-${uniqueId}`;

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ flexShrink: 0, display: 'inline-block' }}
      aria-label="Project Bio-Tesseract Logo"
    >
      {/* Optional rotating outer dashed ring */}
      {spinning && (
        <g style={{ animation: 'bioSpin 24s linear infinite', transformOrigin: '100px 100px' }}>
          <circle
            cx="100"
            cy="100"
            r="97"
            fill="none"
            stroke="#3a1028"
            strokeWidth="1.5"
            strokeDasharray="5 7"
          />
        </g>
      )}

      {/* Main dark maroon circle */}
      <circle cx="100" cy="100" r={spinning ? 90 : 96} fill="#5A1A3C" />

      {/* Left swoosh strand */}
      <path
        d="M 80,42 C 58,78 58,122 80,158"
        fill="none"
        stroke="#F2BEDD"
        strokeWidth={spinning ? '4.5' : '5'}
        strokeLinecap="round"
      />

      {/* Right swoosh strand */}
      <path
        d="M 120,42 C 142,78 142,122 120,158"
        fill="none"
        stroke="#F2BEDD"
        strokeWidth={spinning ? '4.5' : '5'}
        strokeLinecap="round"
      />

      {/* Helix ellipse */}
      <ellipse
        cx="100"
        cy="100"
        rx="21"
        ry="58"
        fill="none"
        stroke="#F2BEDD"
        strokeWidth="2.5"
      />

      {/* DNA rungs */}
      <line x1="79" y1="63" x2="121" y2="63" stroke="#F2BEDD" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="79" y1="77" x2="121" y2="77" stroke="#F2BEDD" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="79" y1="91" x2="121" y2="91" stroke="#F2BEDD" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="79" y1="100" x2="121" y2="100" stroke="#F2BEDD" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="79" y1="109" x2="121" y2="109" stroke="#F2BEDD" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="79" y1="123" x2="121" y2="123" stroke="#F2BEDD" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="79" y1="137" x2="121" y2="137" stroke="#F2BEDD" strokeWidth="2.5" strokeLinecap="round" />

      {/* Dots on strands */}
      <circle cx="80" cy="42" r="6.5" fill="#ffffff" />
      <circle cx="120" cy="42" r="6.5" fill="#ffffff" />
      <circle cx="66" cy="66" r="4.5" fill="#F8D8EC" />
      <circle cx="134" cy="66" r="4.5" fill="#F8D8EC" />
      <circle cx="64" cy="90" r="3.5" fill="#F8D8EC" opacity="0.75" />
      <circle cx="136" cy="90" r="3.5" fill="#F8D8EC" opacity="0.75" />
      <circle cx="64" cy="110" r="3.5" fill="#F8D8EC" opacity="0.75" />
      <circle cx="136" cy="110" r="3.5" fill="#F8D8EC" opacity="0.75" />
      <circle cx="66" cy="134" r="4.5" fill="#F8D8EC" />
      <circle cx="134" cy="134" r="4.5" fill="#F8D8EC" />
      <circle cx="80" cy="158" r="6.5" fill="#ffffff" />
      <circle cx="120" cy="158" r="6.5" fill="#ffffff" />

      {/* Arc text top: PROJECT */}
      <path id={topArcId} d="M 12,100 A 88,88 0 0,0 188,100" fill="none" />
      <text
        fontSize="17"
        fontWeight="900"
        fill="#C02878"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        letterSpacing="6"
      >
        <textPath href={`#${topArcId}`} startOffset="26%">PROJECT</textPath>
      </text>

      {/* Arc text bottom: BIO-TESSERACT */}
      <path id={botArcId} d="M 12,100 A 88,88 0 0,1 188,100" fill="none" />
      <text
        fontSize="12.5"
        fontWeight="800"
        fill="#C02878"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
        letterSpacing="2.5"
      >
        <textPath href={`#${botArcId}`} startOffset="13%">BIO-TESSERACT</textPath>
      </text>
    </svg>
  );
}
