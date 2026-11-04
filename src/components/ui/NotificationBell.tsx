import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from './Badge'
import { cn } from '@/lib/cn'
import { notificationMeta, relativeTime, unreadCount } from '@/lib/notifications'
import { useStore } from '@/lib/store'

export function NotificationBell() {
  const notifications = useStore((s) => s.notifications)
  const markAllRead = useStore((s) => s.markAllNotificationsRead)
  const markRead = useStore((s) => s.markNotificationRead)

  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const unread = unreadCount(notifications)

  useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const recent = notifications.slice(0, 6)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifikasi"
        className="relative grid h-10 w-10 place-items-center rounded-xl text-ink-600 transition hover:bg-canvas hover:text-ink-900"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-bad-500 px-1 text-[10px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="anim-fade-up absolute right-0 z-50 mt-2 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-line bg-surface shadow-lift">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-[13px] font-bold text-ink-950">Notifikasi</p>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-[12px] font-semibold text-accent-600 hover:text-accent-500"
              >
                Tandai semua dibaca
              </button>
            )}
          </div>

          {recent.length === 0 ? (
            <p className="px-4 py-8 text-center text-[13px] text-ink-400">
              Belum ada notifikasi.
            </p>
          ) : (
            <ul className="max-h-80 overflow-y-auto scrollbar-thin">
              {recent.map((n) => {
                const meta = notificationMeta(n.kind)
                return (
                  <li key={n.id}>
                    <button
                      onClick={() => markRead(n.id)}
                      className={cn(
                        'flex w-full gap-3 border-b border-line/70 px-4 py-3 text-left transition hover:bg-canvas',
                        !n.read && 'bg-accent-50/60',
                      )}
                    >
                      <span className="text-lg leading-none">{meta.icon}</span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[13px] font-bold text-ink-950">
                            {n.title}
                          </span>
                          {!n.read && <i className="h-2 w-2 shrink-0 rounded-full bg-bad-500" />}
                        </span>
                        <span className="mt-0.5 block text-[12px] leading-snug text-ink-500">
                          {n.body}
                        </span>
                        <span className="mt-1 block text-[11px] text-ink-400">
                          {relativeTime(n.createdAt)}
                        </span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          <div className="flex items-center justify-between px-4 py-2.5">
            <Badge tone={unread > 0 ? 'bad' : 'neutral'}>
              {unread > 0 ? `${unread} belum dibaca` : 'Semua terbaca'}
            </Badge>
            <Link
              to="/notifikasi"
              onClick={() => setOpen(false)}
              className="text-[12px] font-semibold text-accent-600 hover:text-accent-500"
            >
              Lihat semua →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
