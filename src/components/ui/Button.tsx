import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'accent' | 'outline' | 'ghost' | 'danger' | 'signal'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary:
    'bg-fg text-on-fg hover:opacity-90 active:opacity-100 shadow-soft disabled:opacity-40',
  accent:
    'bg-accent-400 text-ink-950 hover:bg-accent-300 active:bg-accent-500 shadow-soft disabled:bg-accent-100 disabled:text-ink-400',
  signal:
    'bg-signal-500 text-white hover:bg-signal-600 active:bg-signal-600 shadow-soft disabled:bg-signal-100',
  outline:
    'bg-surface text-ink-800 border border-line-strong hover:bg-canvas active:bg-line/60 disabled:text-ink-300',
  ghost: 'bg-transparent text-ink-700 hover:bg-canvas active:bg-line/60',
  danger: 'bg-bad-50 text-bad-600 hover:bg-bad-500/15 active:bg-bad-500/20',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[13px] rounded-lg gap-1.5',
  md: 'h-11 px-5 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-[15px] rounded-xl gap-2',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-all duration-150',
        'disabled:cursor-not-allowed disabled:shadow-none',
        'hover:-translate-y-px active:translate-y-0',
        variants[variant],
        sizes[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}
