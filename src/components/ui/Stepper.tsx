import { cn } from '@/lib/cn'

interface StepperProps {
  steps: string[]
  current: number
}

export function Stepper({ steps, current }: StepperProps) {
  return (
    <ol className="flex items-center gap-1 sm:gap-2">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className="flex flex-1 items-center gap-1 sm:gap-2">
            <div className="flex min-w-0 flex-col items-center gap-1.5 sm:flex-row sm:gap-2.5">
              <span
                className={cn(
                  'grid h-7 w-7 shrink-0 place-items-center rounded-full text-[11px] font-bold transition-all',
                  done && 'bg-ok-500 text-white',
                  active && 'bg-ink-900 text-white anim-ring',
                  !done && !active && 'bg-line text-ink-400',
                )}
              >
                {done ? '✓' : i + 1}
              </span>
              <span
                className={cn(
                  'hidden truncate text-[11px] font-semibold sm:block',
                  active ? 'text-ink-900' : done ? 'text-ink-500' : 'text-ink-400',
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <span
                className={cn(
                  'h-0.5 flex-1 rounded-full transition-colors',
                  done ? 'bg-ok-500' : 'bg-line',
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
