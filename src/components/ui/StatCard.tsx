import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface StatCardProps {
  icon: ReactNode
  value: ReactNode
  label: string
  tone?: 'default' | 'accent' | 'ok' | 'info'
  className?: string
}

const toneSkin = {
  default: 'bg-canvas text-ink-700',
  accent: 'bg-accent-50 text-accent-600',
  ok: 'bg-ok-50 text-ok-600',
  info: 'bg-signal-50 text-signal-600',
}

export function StatCard({
  icon,
  value,
  label,
  tone = 'default',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3.5 rounded-2xl border border-line bg-surface p-4 shadow-soft sm:p-5',
        className,
      )}
    >
      <span
        className={cn(
          'grid h-11 w-11 shrink-0 place-items-center rounded-xl text-lg',
          toneSkin[tone],
        )}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block text-2xl font-extrabold leading-tight text-ink-950">
          {value}
        </span>
        <span className="block truncate text-[12px] text-ink-500">{label}</span>
      </span>
    </div>
  )
}
