import { useStore } from '@/lib/store'
import { cn } from '@/lib/cn'

const toneStyles = {
  info: 'border-line-strong bg-ink-900 text-white',
  success: 'border-ok-500/30 bg-ok-600 text-white',
  error: 'border-bad-500/30 bg-bad-600 text-white',
}

const toneIcon = {
  info: 'ⓘ',
  success: '✓',
  error: '!',
}

export function Toaster() {
  const toasts = useStore((s) => s.toasts)
  const dismiss = useStore((s) => s.dismissToast)

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100%-2rem)] max-w-xs flex-col gap-2">
      {toasts.map((t) => (
        <button
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={cn(
            'anim-fade-up pointer-events-auto flex items-start gap-2.5 rounded-xl border px-4 py-3 text-left text-[13px] font-medium shadow-lift',
            toneStyles[t.tone],
          )}
        >
          <span className="mt-px grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/20 text-[11px] font-bold">
            {toneIcon[t.tone]}
          </span>
          <span className="flex-1">{t.message}</span>
        </button>
      ))}
    </div>
  )
}
