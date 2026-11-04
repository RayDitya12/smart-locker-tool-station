import type { Tone } from './status'
import type { AppNotification, NotificationKind } from './types'

interface KindMeta {
  icon: string
  tone: Tone
  label: string
}

const kindMeta: Record<NotificationKind, KindMeta> = {
  'siap-diambil': { icon: '🔓', tone: 'info', label: 'Siap diambil' },
  'pengingat-jatuh-tempo': { icon: '⏰', tone: 'warn', label: 'Pengingat' },
  terlambat: { icon: '⚠️', tone: 'bad', label: 'Terlambat' },
  'deposit-kembali': { icon: '💸', tone: 'ok', label: 'Deposit kembali' },
  'deposit-ditahan': { icon: '🔒', tone: 'warn', label: 'Deposit ditahan' },
}

export function notificationMeta(kind: NotificationKind): KindMeta {
  return kindMeta[kind]
}

export function unreadCount(notifications: AppNotification[]): number {
  return notifications.filter((n) => !n.read).length
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const diff = Date.now() - then
  const mins = Math.round(diff / 60000)
  if (mins < 1) return 'baru saja'
  if (mins < 60) return `${mins} menit lalu`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} jam lalu`
  const days = Math.round(hrs / 24)
  if (days < 30) return `${days} hari lalu`
  const months = Math.round(days / 30)
  return `${months} bulan lalu`
}
