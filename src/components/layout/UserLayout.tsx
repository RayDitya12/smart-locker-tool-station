import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Brand } from './Brand'
import { cn } from '@/lib/cn'
import { useStore } from '@/lib/store'

const navItems = [
  { to: '/', label: 'Beranda', end: true },
  { to: '/katalog', label: 'Katalog' },
  { to: '/pinjaman', label: 'Pinjaman Saya' },
]

export function UserLayout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const session = useStore((s) => s.session)
  const activeLoans = useStore(
    (s) => s.loans.filter((l) => l.status === 'Aktif' || l.status === 'Menunggu verifikasi').length,
  )

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" onClick={() => setOpen(false)}>
            <Brand />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'relative rounded-lg px-3.5 py-2 text-[13px] font-semibold transition',
                    isActive
                      ? 'text-ink-950'
                      : 'text-ink-500 hover:bg-canvas hover:text-ink-800',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {item.to === '/pinjaman' && activeLoans > 0 && (
                      <span className="ml-1.5 inline-grid h-4 min-w-4 place-items-center rounded-full bg-accent-400 px-1 text-[10px] font-bold text-ink-950">
                        {activeLoans}
                      </span>
                    )}
                    {isActive && (
                      <span className="absolute inset-x-3.5 -bottom-[1px] h-0.5 rounded-full bg-accent-400" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link
              to="/admin"
              className="rounded-lg px-3 py-2 text-[13px] font-semibold text-ink-500 transition hover:bg-canvas hover:text-ink-800"
            >
              Admin
            </Link>
            <button
              onClick={() => navigate(session ? '/pinjam' : '/katalog')}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-ink-900 px-4 text-[13px] font-semibold text-white shadow-soft transition hover:-translate-y-px hover:bg-ink-800"
            >
              <span className="text-base leading-none">＋</span> Pinjam alat
            </button>
          </div>

          <button
            className="grid h-10 w-10 place-items-center rounded-lg text-ink-700 transition hover:bg-canvas md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              {open ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
            </svg>
          </button>
        </div>

        {open && (
          <div className="border-t border-line bg-surface px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {[...navItems, { to: '/admin', label: 'Admin' }].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={'end' in item ? item.end : false}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'rounded-lg px-3 py-2.5 text-sm font-semibold transition',
                      isActive ? 'bg-canvas text-ink-950' : 'text-ink-600 hover:bg-canvas',
                    )
                  }
                >
                  {item.label}
                </NavLink>
              ))}
              <button
                onClick={() => {
                  setOpen(false)
                  navigate('/pinjam')
                }}
                className="mt-1 inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-ink-900 px-4 text-sm font-semibold text-white"
              >
                ＋ Pinjam alat
              </button>
            </nav>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-center sm:flex-row sm:px-6 sm:text-left">
          <Brand />
          <p className="max-w-md text-[12px] leading-relaxed text-ink-400">
            Prototipe proyek Manajemen Inovasi · Layanan berbagi perkakas berbasis
            loker pintar untuk mahasiswa rantau. Data tersimpan lokal di perangkat
            ini (simulasi).
          </p>
        </div>
      </footer>
    </div>
  )
}
