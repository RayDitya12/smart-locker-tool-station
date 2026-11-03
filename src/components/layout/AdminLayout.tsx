import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Brand } from './Brand'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { cn } from '@/lib/cn'
import { ADMIN_PIN, useStore } from '@/lib/store'

const adminNav = [
  { to: '/admin', label: 'Ringkasan', end: true, icon: '▦' },
  { to: '/admin/inventaris', label: 'Inventaris Alat', icon: '🧰' },
  { to: '/admin/loker', label: 'Loker & Stasiun', icon: '🔲' },
  { to: '/admin/transaksi', label: 'Transaksi', icon: '↔' },
  { to: '/admin/verifikasi', label: 'Verifikasi Kembali', icon: '✓' },
  { to: '/admin/analitik', label: 'Analitik', icon: '📈' },
]

function AdminGate() {
  const [pin, setPin] = useState('')
  const adminLogin = useStore((s) => s.adminLogin)
  const navigate = useNavigate()

  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-4">
      <div className="anim-fade-up w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Brand />
        </div>
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-lift">
          <h1 className="text-lg font-bold text-ink-950">Area Pengelola</h1>
          <p className="mt-1 text-[13px] text-ink-500">
            Masuk untuk mengelola inventaris, loker, dan transaksi.
          </p>
          <form
            className="mt-5 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              if (adminLogin(pin)) setPin('')
            }}
          >
            <Field label="PIN pengelola" required>
              <Input
                type="password"
                inputMode="numeric"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Masukkan PIN"
                autoFocus
              />
            </Field>
            <Button type="submit" className="w-full" size="lg">
              Masuk →
            </Button>
          </form>
          <div className="mt-4 rounded-xl bg-accent-50 px-3.5 py-2.5 text-[12px] text-accent-600 ring-1 ring-inset ring-accent-500/20">
            Demo: PIN pengelola adalah <span className="font-mono font-bold">{ADMIN_PIN}</span>
          </div>
          <button
            onClick={() => navigate('/')}
            className="mt-4 w-full text-center text-[12px] font-semibold text-ink-400 transition hover:text-ink-700"
          >
            ← Kembali ke halaman pengguna
          </button>
        </div>
      </div>
    </div>
  )
}

export function AdminLayout() {
  const adminAuthed = useStore((s) => s.adminAuthed)
  const adminLogout = useStore((s) => s.adminLogout)
  const resetDemo = useStore((s) => s.resetDemo)
  const [confirmReset, setConfirmReset] = useState(false)
  const pendingReturns = useStore(
    (s) => s.loans.filter((l) => l.status === 'Menunggu verifikasi').length,
  )
  const navigate = useNavigate()

  if (!adminAuthed) return <AdminGate />

  return (
    <div className="min-h-screen bg-canvas lg:flex">
      <aside className="no-print border-b border-line bg-panel lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-4 py-4 lg:block">
          <Link to="/admin">
            <Brand />
          </Link>
          <Link
            to="/"
            className="text-[12px] font-semibold text-ink-500 transition hover:text-ink-900 lg:mt-6 lg:inline-flex lg:items-center lg:gap-1"
          >
            ← Situs pengguna
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 scrollbar-thin lg:mt-2 lg:flex-col lg:overflow-visible lg:px-3 lg:pb-0">
          {adminNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition lg:shrink',
                  isActive
                    ? 'bg-ink-900/10 text-ink-950'
                    : 'text-ink-500 hover:bg-ink-900/5 hover:text-ink-900',
                )
              }
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="whitespace-nowrap">{item.label}</span>
              {item.to === '/admin/verifikasi' && pendingReturns > 0 && (
                <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-accent-400 px-1 text-[10px] font-bold text-night">
                  {pendingReturns}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="flex gap-2 px-3 pb-3 lg:mt-4 lg:flex-col lg:pb-4">
          <div className="flex items-center justify-between gap-2 lg:w-full">
            <span className="text-[12px] font-semibold text-ink-400">Tampilan</span>
            <ThemeToggle />
          </div>
          <button
            onClick={() => {
              adminLogout()
              navigate('/admin')
            }}
            className="flex-1 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold text-ink-500 transition hover:bg-ink-900/5 hover:text-ink-900 lg:flex-none"
          >
            Keluar dari admin
          </button>
          {confirmReset ? (
            <div className="flex flex-1 gap-2 lg:flex-col">
              <button
                onClick={() => {
                  resetDemo()
                  setConfirmReset(false)
                  navigate('/admin')
                }}
                className="flex-1 rounded-xl bg-bad-solid px-3 py-2.5 text-[13px] font-bold text-white transition hover:bg-bad-500"
              >
                Ya, reset semua
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="flex-1 rounded-xl px-3 py-2.5 text-[13px] font-semibold text-ink-500 transition hover:bg-ink-900/5 hover:text-ink-900"
              >
                Batal
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="flex-1 rounded-xl px-3 py-2.5 text-left text-[13px] font-semibold text-ink-400 transition hover:bg-ink-900/5 hover:text-ink-800 lg:flex-none"
            >
              Reset data demo
            </button>
          )}
        </div>
      </aside>

      <div className="flex-1 lg:min-w-0">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:py-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
