import type {
  CompartmentStatus,
  LoanStatus,
  ToolCondition,
  ToolStatus,
} from './types'

export type Tone = 'ok' | 'warn' | 'bad' | 'info' | 'neutral'

const toneClass: Record<Tone, string> = {
  ok: 'bg-ok-50 text-ok-600 ring-ok-500/20',
  warn: 'bg-warn-50 text-warn-600 ring-accent-500/20',
  bad: 'bg-bad-50 text-bad-600 ring-bad-500/20',
  info: 'bg-signal-50 text-signal-600 ring-signal-500/20',
  neutral: 'bg-canvas text-ink-500 ring-line-strong',
}

export function toneClasses(tone: Tone): string {
  return toneClass[tone]
}

export function toolStatusTone(status: ToolStatus): Tone {
  switch (status) {
    case 'Tersedia':
      return 'ok'
    case 'Dipinjam':
      return 'warn'
    case 'Tidak tersedia':
      return 'bad'
    default:
      return 'neutral'
  }
}

export function conditionTone(condition: ToolCondition | ''): Tone {
  switch (condition) {
    case 'Baik':
      return 'ok'
    case 'Perlu diperiksa':
      return 'warn'
    case 'Rusak':
      return 'bad'
    case 'Dalam perbaikan':
      return 'info'
    default:
      return 'neutral'
  }
}

export function loanStatusTone(status: LoanStatus): Tone {
  switch (status) {
    case 'Aktif':
      return 'info'
    case 'Selesai':
      return 'ok'
    case 'Menunggu pembayaran':
      return 'warn'
    case 'Menunggu verifikasi':
      return 'warn'
    case 'Terlambat':
      return 'bad'
    case 'Dibatalkan':
      return 'neutral'
    default:
      return 'neutral'
  }
}

export function compartmentTone(status: CompartmentStatus): Tone {
  switch (status) {
    case 'Terisi':
      return 'ok'
    case 'Kosong':
      return 'neutral'
    case 'Terkunci':
      return 'info'
    case 'Perlu diperiksa':
      return 'warn'
    default:
      return 'neutral'
  }
}
