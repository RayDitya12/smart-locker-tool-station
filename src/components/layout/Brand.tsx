import { cn } from '@/lib/cn'

interface BrandProps {
  className?: string
  compact?: boolean
  light?: boolean
}

export function Brand({ className, compact, light }: BrandProps) {
  return (
    <span className={cn('flex items-center gap-2.5', className)}>
      <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-accent-400 text-ink-950 shadow-soft">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="3" />
          <path d="M3 12h18M12 3v18" />
          <circle cx="16.5" cy="7.5" r="0.6" fill="currentColor" />
        </svg>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              'text-[15px] font-extrabold tracking-tight',
              light ? 'text-white' : 'text-ink-950',
            )}
          >
            Smart Locker
          </span>
          <span
            className={cn(
              'mt-0.5 text-[10px] font-bold uppercase tracking-[0.18em]',
              light ? 'text-white/55' : 'text-ink-400',
            )}
          >
            Tool Station
          </span>
        </span>
      )}
    </span>
  )
}
