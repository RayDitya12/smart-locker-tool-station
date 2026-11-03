const rupiah = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export function formatRupiah(value: number): string {
  return rupiah.format(value)
}

export function todayISO(): string {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10)
}

export function addDaysISO(iso: string, days: number): string {
  const base = iso ? new Date(`${iso}T00:00:00`) : new Date()
  base.setDate(base.getDate() + days)
  return new Date(base.getTime() - base.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10)
}

const dateFmt = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

const dateTimeFmt = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatDate(iso: string): string {
  if (!iso) return '-'
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso)
  return Number.isNaN(d.getTime()) ? '-' : dateFmt.format(d)
}

export function formatDateTime(iso: string): string {
  if (!iso) return '-'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '-' : dateTimeFmt.format(d)
}

export function daysBetween(fromISO: string, toISO: string): number {
  const a = new Date(`${fromISO.slice(0, 10)}T00:00:00`).getTime()
  const b = new Date(`${toISO.slice(0, 10)}T00:00:00`).getTime()
  return Math.round((b - a) / 86400000)
}

export function isOverdue(dueISO: string): boolean {
  if (!dueISO) return false
  return todayISO() > dueISO.slice(0, 10)
}

export function daysLate(dueISO: string, atISO?: string): number {
  if (!dueISO) return 0
  const d = daysBetween(dueISO, atISO ?? todayISO())
  return d > 0 ? d : 0
}

export function lateFeeFor(
  loan: { deposit: number; rentalFee: number; durationDays: number },
  lateDays: number,
): number {
  if (lateDays <= 0) return 0
  const perDay =
    loan.durationDays > 0 ? Math.round(loan.rentalFee / loan.durationDays) : 0
  return Math.min(loan.deposit, lateDays * perDay)
}

export function generateAccessCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function generateLoanId(): string {
  return `TRX-${Date.now().toString().slice(-8)}`
}
