import type { ReactElement } from 'react'
import { cn } from '@/lib/cn'

const S = '#8b95a6' // brushed steel
const SD = '#5b6577' // steel shadow
const H = '#f5a623' // amber handle
const HD = '#cf8617' // amber shadow
const B = '#3563e9' // accent tool body (blue)
const BD = '#2749c4' // blue shadow
const D = '#2a3342' // dark detail

const shapes: Record<string, ReactElement> = {
  // Screwdriver set
  A01: (
    <g>
      <rect x="27" y="8" width="10" height="20" rx="5" fill={H} />
      <path d="M29 12h6M29 16h6M29 20h6" stroke={HD} strokeWidth="1.6" strokeLinecap="round" />
      <rect x="29.5" y="28" width="5" height="20" rx="1.5" fill={S} />
      <path d="M29.5 48h5l-1.5 7h-2z" fill={SD} />
    </g>
  ),
  // Pliers
  A02: (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 55 L33 30" stroke={H} strokeWidth="7" />
      <path d="M44 55 L31 30" stroke={H} strokeWidth="7" />
      <path d="M33 30 L28 13 L23 16" stroke={S} strokeWidth="4.5" />
      <path d="M31 30 L36 13 L41 16" stroke={S} strokeWidth="4.5" />
      <circle cx="32" cy="31" r="4" fill={SD} />
    </g>
  ),
  // Hammer
  A03: (
    <g>
      <rect x="16" y="10" width="34" height="13" rx="3" fill={SD} />
      <path d="M46 10q11 5 5 17l-7-3q4-6-1-9z" fill={S} />
      <rect x="29" y="22" width="7" height="34" rx="3.5" fill={H} />
      <rect x="29" y="46" width="7" height="10" rx="3.5" fill={HD} />
    </g>
  ),
  // Ring spanner / wrench
  A04: (
    <g>
      <path
        d="M20 6a13 13 0 1 0 9 22l18 18a6 6 0 0 0 9-9L38 19A13 13 0 0 0 20 6Zm0 7a6 6 0 1 1 0 12 6 6 0 0 1 0-12Z"
        fillRule="evenodd"
        fill={S}
      />
      <circle cx="20" cy="19" r="4.4" fill="#fff" opacity="0.35" />
    </g>
  ),
  // Tape measure
  A05: (
    <g>
      <rect x="12" y="16" width="34" height="30" rx="7" fill={H} />
      <rect x="17" y="21" width="24" height="20" rx="4" fill={S} />
      <rect x="46" y="28" width="10" height="7" rx="1.5" fill={SD} />
      <rect x="20" y="12" width="6" height="5" rx="2" fill={D} />
      <path d="M22 25h13M22 30h13" stroke={SD} strokeWidth="1.8" strokeLinecap="round" />
    </g>
  ),
  // Cordless drill
  A06: (
    <g>
      <rect x="10" y="18" width="30" height="16" rx="4" fill={B} />
      <rect x="38" y="22" width="8" height="9" rx="1.5" fill={S} />
      <rect x="46" y="25" width="11" height="4" rx="2" fill={SD} />
      <path d="M14 34h11l-2 18a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3z" fill={BD} />
      <rect x="12" y="14" width="14" height="5" rx="2.5" fill={BD} />
      <circle cx="30" cy="26" r="3" fill={H} />
    </g>
  ),
  // Folding ladder
  A07: (
    <g fill="none" strokeLinecap="round">
      <path d="M21 8 L17 56" stroke={S} strokeWidth="5" />
      <path d="M43 8 L47 56" stroke={S} strokeWidth="5" />
      <path d="M23 20h18M22 32h20M20 44h24" stroke={SD} strokeWidth="4" />
    </g>
  ),
  // Iron
  B01: (
    <g>
      <path d="M10 42 L54 42 Q52 24 34 22 L18 24 Q11 30 10 42Z" fill={S} />
      <path d="M10 42h44v4H11z" fill={SD} />
      <path d="M18 24 Q34 8 46 22" stroke={B} strokeWidth="6" fill="none" strokeLinecap="round" />
      <circle cx="20" cy="34" r="2.4" fill={H} />
    </g>
  ),
  // Handheld vacuum
  B02: (
    <g>
      <rect x="12" y="18" width="28" height="30" rx="9" fill={B} />
      <rect x="12" y="14" width="28" height="9" rx="4.5" fill={BD} />
      <path d="M40 30q12 1 12 13v9" stroke={S} strokeWidth="6" fill="none" strokeLinecap="round" />
      <rect x="19" y="26" width="14" height="14" rx="4" fill="#dbe6ff" />
    </g>
  ),
  // Rice cooker
  B03: (
    <g>
      <path d="M12 28h40v6a20 15 0 0 1-40 0z" fill={S} />
      <rect x="12" y="27" width="40" height="6" rx="2" fill={B} />
      <ellipse cx="32" cy="24" rx="22" ry="5" fill={SD} />
      <rect x="29" y="16" width="6" height="6" rx="2" fill={D} />
      <rect x="36" y="36" width="8" height="4" rx="2" fill={H} />
    </g>
  ),
}

const fallback = (
  <g>
    <rect x="10" y="22" width="44" height="30" rx="5" fill={SD} />
    <rect x="10" y="22" width="44" height="7" rx="3" fill={S} />
    <rect x="26" y="34" width="12" height="8" rx="2" fill={H} />
    <path d="M22 22l4-8h12l4 8" stroke={D} strokeWidth="3" fill="none" strokeLinecap="round" />
  </g>
)

interface ToolArtProps {
  id: string
  name?: string
  className?: string
}

export function ToolArt({ id, name, className }: ToolArtProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      role="img"
      aria-label={name ?? id}
      className={cn('h-full w-full', className)}
    >
      {shapes[id] ?? fallback}
    </svg>
  )
}
