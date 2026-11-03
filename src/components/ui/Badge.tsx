import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { toneClasses, type Tone } from '@/lib/status'

interface BadgeProps {
  tone?: Tone
  children: ReactNode
  className?: string
  dot?: boolean
}

export function Badge({ tone = 'neutral', children, className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ring-inset whitespace-nowrap',
        toneClasses(tone),
        className,
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}
