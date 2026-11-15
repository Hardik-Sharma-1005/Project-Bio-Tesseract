'use client';

import Image from 'next/image';
import { useState } from 'react';

const QUADRANTS = Object.freeze({
  'AST-01': [0, 0],
  'AST-02': [1, 0],
  'AST-03': [0, 1],
  'AST-04': [1, 1],
});

export default function CrewPortrait({ member, className = '' }) {
  const [failed, setFailed] = useState(false);
  const [column, row] = QUADRANTS[member?.id] || [0, 0];
  const initials = member?.initials || member?.name?.split(/\s+/).map(part => part[0]).join('').slice(0, 2) || 'CR';

  return (
    <span className={`crew-portrait${failed ? ' crew-portrait--failed' : ''} ${className}`.trim()}>
      {!failed && <Image
        src="/crew-portraits.webp"
        alt={`${member?.name || 'Crew member'} portrait`}
        width={512}
        height={512}
        unoptimized
        onError={() => setFailed(true)}
        style={{ left: column ? '-100%' : '0', top: row ? '-100%' : '0' }}
      />}
      <span className="crew-portrait__fallback" aria-hidden="true">{initials}</span>
    </span>
  );
}
