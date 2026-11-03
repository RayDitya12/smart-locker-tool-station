import { cn } from '@/lib/cn'
import type { Compartment } from '@/lib/types'

interface LockerGridProps {
  compartments: Compartment[]
  activeId?: string | null
  openId?: string | null
  onPick?: (c: Compartment) => void
  columns?: number
}

const statusSkin: Record<Compartment['status'], string> = {
  Terisi: 'border-ok-500/30 bg-ok-50 text-ok-600',
  Kosong: 'border-line-strong bg-surface-2 text-ink-400',
  Terkunci: 'border-signal-500/30 bg-signal-50 text-signal-600',
  'Perlu diperiksa': 'border-accent-500/40 bg-accent-50 text-accent-600',
}

const statusGlyph: Record<Compartment['status'], string> = {
  Terisi: '🧰',
  Kosong: '·',
  Terkunci: '🔒',
  'Perlu diperiksa': '⚠',
}

export function LockerGrid({
  compartments,
  activeId,
  openId,
  onPick,
  columns = 3,
}: LockerGridProps) {
  return (
    <div
      className="grid gap-2.5"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {compartments.map((c) => {
        const isActive = activeId === c.id
        const isOpen = openId === c.id
        return (
          <button
            key={c.id}
            type="button"
            disabled={!onPick}
            onClick={() => onPick?.(c)}
            className={cn(
              'group relative aspect-[4/3] overflow-hidden rounded-xl border-2 transition-all duration-300',
              statusSkin[c.status],
              onPick && 'cursor-pointer hover:-translate-y-0.5 hover:shadow-soft',
              isActive && 'ring-2 ring-signal-500 ring-offset-2',
              isOpen && 'border-accent-400 bg-accent-50',
            )}
          >
            <span className="absolute left-2 top-1.5 font-mono text-[11px] font-bold opacity-70">
              {c.label}
            </span>
            <span className="absolute right-2 top-1.5 text-[9px] font-bold uppercase tracking-wide opacity-60">
              {c.size}
            </span>
            <span
              className={cn(
                'grid h-full place-items-center text-2xl transition-transform duration-500',
                isOpen && 'scale-110',
              )}
            >
              {statusGlyph[c.status]}
            </span>
            {isOpen && (
              <>
                <span className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-accent-300/70 to-transparent anim-scan" />
                <span className="absolute inset-x-0 bottom-0 bg-ink-900/85 py-1 text-center text-[10px] font-bold text-accent-300">
                  TERBUKA
                </span>
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}
