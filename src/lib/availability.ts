import { addDaysISO, todayISO } from './format'
import type { Loan, LoanStatus } from './types'

const OCCUPYING: LoanStatus[] = [
  'Menunggu pembayaran',
  'Aktif',
  'Terlambat',
  'Menunggu verifikasi',
]

export function isOccupying(loan: Loan): boolean {
  return OCCUPYING.includes(loan.status)
}

function spanDates(startDate: string, durationDays: number): string[] {
  const span = Math.max(1, Math.round(durationDays))
  return Array.from({ length: span }, (_, i) => addDaysISO(startDate, i))
}

export function bookedDates(loans: Loan[], toolId: string): Set<string> {
  const booked = new Set<string>()
  for (const l of loans) {
    if (l.toolId !== toolId || !isOccupying(l)) continue
    for (const d of spanDates(l.startDate, l.durationDays)) booked.add(d)
  }
  return booked
}

export function hasConflict(
  loans: Loan[],
  toolId: string,
  startDate: string,
  durationDays: number,
): boolean {
  const booked = bookedDates(loans, toolId)
  return spanDates(startDate, durationDays).some((d) => booked.has(d))
}

export function availabilityWindow(
  loans: Loan[],
  toolId: string,
  days = 14,
): { date: string; free: boolean }[] {
  const booked = bookedDates(loans, toolId)
  const today = todayISO()
  return Array.from({ length: days }, (_, i) => {
    const date = addDaysISO(today, i)
    return { date, free: !booked.has(date) }
  })
}

export function nextBookingEnd(
  loans: Loan[],
  toolId: string,
): { start: string; end: string } | null {
  const today = todayISO()
  const upcoming = loans
    .filter((l) => l.toolId === toolId && isOccupying(l) && addDaysISO(l.startDate, l.durationDays) >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
  const first = upcoming[0]
  if (!first) return null
  return { start: first.startDate, end: addDaysISO(first.startDate, first.durationDays) }
}
