import { useState } from 'react'
import { PageHead } from '@/components/layout/PageHead'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import { formatDate, formatDateTime } from '@/lib/format'
import { notificationMeta, relativeTime, unreadCount } from '@/lib/notifications'
import { useStore } from '@/lib/store'
import type { AppNotification } from '@/lib/types'

type Filter = 'semua' | 'belum'

export function Notifikasi() {
  const notifications = useStore((s) => s.notifications)
  const markRead = useStore((s) => s.markNotificationRead)
  const markAllRead = useStore((s) => s.markAllNotificationsRead)
  const clearAll = useStore((s) => s.clearNotifications)

  const [filter, setFilter] = useState<Filter>('semua')
  const unread = unreadCount(notifications)
  const shown = filter === 'belum' ? notifications.filter((n) => !n.read) : notifications

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PageHead
        title="Notifikasi"
        subtitle="Pengingat jatuh tempo, status loker, dan keputusan deposit Anda."
        action={
          notifications.length > 0 ? (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={markAllRead} disabled={unread === 0}>
                Tandai dibaca
              </Button>
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Bersihkan
              </Button>
            </div>
          ) : undefined
        }
      />

      <div className="mb-4 inline-flex rounded-xl border border-line bg-surface p-1 text-[13px] font-semibold">
        {(['semua', 'belum'] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'rounded-lg px-3.5 py-1.5 transition',
              filter === f ? 'bg-fg text-on-fg' : 'text-ink-500 hover:text-ink-800',
            )}
          >
            {f === 'semua' ? `Semua (${notifications.length})` : `Belum dibaca (${unread})`}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <Card className="text-center">
          <p className="text-4xl">🔔</p>
          <h2 className="mt-3 text-base font-bold text-ink-950">
            {filter === 'belum' ? 'Tidak ada yang belum dibaca' : 'Belum ada notifikasi'}
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-[13px] text-ink-500">
            Notifikasi muncul saat alat siap diambil, mendekati jatuh tempo, atau saat
            deposit diproses.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          {shown.map((n) => (
            <NotificationRow key={n.id} n={n} onRead={() => markRead(n.id)} />
          ))}
        </div>
      )}
    </div>
  )
}

function NotificationRow({ n, onRead }: { n: AppNotification; onRead: () => void }) {
  const meta = notificationMeta(n.kind)
  return (
    <Card
      className={cn(
        'flex gap-4 transition',
        !n.read && 'border-accent-500/40 bg-accent-50/40',
      )}
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-canvas text-xl">
        {meta.icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[14px] font-bold text-ink-950">{n.title}</h3>
          <Badge tone={meta.tone}>{meta.label}</Badge>
          {!n.read && <i className="h-2 w-2 rounded-full bg-bad-500" />}
        </div>
        <p className="mt-1 text-[13px] leading-relaxed text-ink-600">{n.body}</p>
        <p className="mt-1.5 text-[11px] text-ink-400" title={formatDateTime(n.createdAt)}>
          {relativeTime(n.createdAt)} · {formatDate(n.createdAt.slice(0, 10))}
        </p>
      </div>
      {!n.read && (
        <button
          onClick={onRead}
          className="shrink-0 self-start text-[12px] font-semibold text-accent-600 hover:text-accent-500"
        >
          Tandai
        </button>
      )}
    </Card>
  )
}
