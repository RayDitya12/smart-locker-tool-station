import { useState } from 'react'
import { cn } from '@/lib/cn'
import { currentTheme, toggleTheme, type ThemeMode } from '@/lib/theme'

interface ThemeToggleProps {
  className?: string
  onDark?: boolean
}

export function ThemeToggle({ className, onDark }: ThemeToggleProps) {
  const [mode, setMode] = useState<ThemeMode>(() => currentTheme())

  function switchTo(next: ThemeMode) {
    if (next === mode) return
    const applied = toggleTheme()
    setMode(applied)
  }

  const base = onDark
    ? 'border-white/15 bg-white/5 text-white/70'
    : 'border-line bg-surface text-ink-500'

  return (
    <div
      role="group"
      aria-label="Ganti tema"
      className={cn(
        'no-print inline-flex items-center gap-0.5 rounded-full border p-0.5',
        base,
        className,
      )}
    >
      <button
        type="button"
        onClick={() => switchTo('light')}
        aria-pressed={mode === 'light'}
        className={cn(
          'grid h-7 w-7 place-items-center rounded-full transition',
          mode === 'light'
            ? onDark
              ? 'bg-white/90 text-ink-950'
              : 'bg-accent-400 text-ink-950 shadow-soft'
            : 'hover:text-ink-900',
        )}
        title="Mode terang"
      >
        <Sun />
      </button>
      <button
        type="button"
        onClick={() => switchTo('dark')}
        aria-pressed={mode === 'dark'}
        className={cn(
          'grid h-7 w-7 place-items-center rounded-full transition',
          mode === 'dark'
            ? onDark
              ? 'bg-white/90 text-ink-950'
              : 'bg-ink-900 text-accent-300 shadow-soft'
            : 'hover:text-ink-900',
        )}
        title="Mode gelap"
      >
        <Moon />
      </button>
    </div>
  )
}

function Sun() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

function Moon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a6.6 6.6 0 0 0 9.8 9.8Z" />
    </svg>
  )
}
