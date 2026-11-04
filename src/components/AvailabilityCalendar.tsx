import { useMemo } from 'react'
import { cn } from '@/lib/cn'
import { addDaysISO, formatDate, todayISO } from '@/lib/format'
import { availabilityWindow, hasConflict } from '@/lib/availability'
import { useStore } from '@/lib/store'

interface Props {
  toolId: string
  startDate: string
  durationDays: number
  onSelect?: (dateISO: string) => void
}

function dayLabel(iso: string): { dow: string; num: string } {
  const d = new Date(`${iso}T00:00:00`)
  return {
    dow: d.toLocaleDateString('id-ID', { weekday: 'short' }).slice(0, 3),
    num: String(d.getDate()).padStart(2, '0'),
  }
}

export function AvailabilityCalendar({ toolId, startDate, durationDays, onSelect }: Props) {
  const loans = useStore((s) => s.loans)
  const window = useMemo(
    () => availabilityWindow(loans, toolId, 14),
    [loans, toolId],
  )
  const selected = useMemo(() => {
    const span = new Set<string>()
    for (let i = 0; i < durationDays; i++) span.add(addDaysISO(startDate, i))
    return span
  }, [startDate, durationDays])

  const conflict = hasConflict(loans, toolId, startDate, durationDays)
  const today = todayISO()

  return (
    <div>
      <div className="grid grid-cols-7 gap-1.5">
        {window.map(({ date, free }) => {
          const { dow, num } = dayLabel(date)
          const isSelected = selected.has(date)
          const isToday = date === today
          const startable = free
          return (
            <button
              key={date}
              type="button"
              disabled={!onSelect}
              onClick={() => onSelect?.(date)}
              title={`${formatDate(date)} · ${free ? 'Tersedia' : 'Dipesan'}`}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-lg border py-1.5 text-[11px] transition',
                onSelect && 'cursor-pointer hover:-translate-y-px',
                !free && 'border-bad-500/30 bg-bad-50 text-bad-600',
                free && !isSelected && 'border-line bg-surface text-ink-600',
                isSelected && 'border-fg bg-fg text-on-fg',
                isToday && !isSelected && 'ring-1 ring-signal-500/50',
                onSelect && !startable && 'cursor-not-allowed opacity-70',
              )}
            >
              <span className="font-semibold uppercase tracking-wide opacity-80">{dow}</span>
              <span className="text-[13px] font-bold">{num}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-ink-500">
        <Legend className="border-line bg-surface" label="Tersedia" />
        <Legend className="border-bad-500/30 bg-bad-50" label="Dipesan" />
        <Legend className="border-fg bg-fg" label="Pilihanmu" />
      </div>

      {conflict && (
        <p className="mt-3 flex items-center gap-2 rounded-xl bg-bad-50 px-3.5 py-2.5 text-[12px] font-semibold text-bad-600 ring-1 ring-inset ring-bad-500/20">
          ⚠ Salah satu tanggal pilihan sudah dipesan orang lain. Geser tanggal mulai atau
          pilih hari kosong di kalender.
        </p>
      )}
    </div>
  )
}

function Legend({ className, label }: { className: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <i className={cn('h-3 w-3 rounded border', className)} />
      {label}
    </span>
  )
}
