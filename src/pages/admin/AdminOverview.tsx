import { Link } from 'react-router-dom'
import { PageHead } from '@/components/layout/PageHead'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { formatRupiah, isOverdue } from '@/lib/format'
import { loanStatusTone } from '@/lib/status'
import { useStore } from '@/lib/store'

export function AdminOverview() {
  const tools = useStore((s) => s.tools)
  const loans = useStore((s) => s.loans)
  const stations = useStore((s) => s.stations)

  const available = tools.filter((t) => t.status === 'Tersedia').length
  const borrowed = tools.filter((t) => t.status === 'Dipinjam').length
  const active = loans.filter(
    (l) =>
      l.status === 'Aktif' ||
      l.status === 'Terlambat' ||
      l.status === 'Menunggu verifikasi',
  )
  const pending = loans.filter((l) => l.status === 'Menunggu verifikasi')
  const paid = loans.filter((l) => l.payment)
  const revenue = paid.reduce((sum, l) => sum + l.rentalFee, 0)
  const denda = loans.reduce(
    (sum, l) => sum + (l.returnInfo ? l.lateFee : 0),
    0,
  )
  const depositHeld = paid
    .filter((l) => !l.returnInfo?.depositRefunded)
    .reduce((sum, l) => sum + l.deposit, 0)
  const overdue = loans.filter(
    (l) =>
      l.status === 'Terlambat' || (l.status === 'Aktif' && isOverdue(l.dueDate)),
  )
  const needsCheck = tools.filter(
    (t) => t.condition === 'Rusak' || t.condition === 'Perlu diperiksa',
  )

  const utilization = tools.length
    ? Math.round((borrowed / tools.length) * 100)
    : 0
  const lateLoans = loans.filter(
    (l) =>
      l.status === 'Terlambat' ||
      l.lateFee > 0 ||
      (l.status === 'Aktif' && isOverdue(l.dueDate)),
  )
  const lateRate = paid.length
    ? Math.round((lateLoans.length / paid.length) * 100)
    : 0
  const avgDuration = paid.length
    ? paid.reduce((sum, l) => sum + l.durationDays, 0) / paid.length
    : 0
  const depositFloat = depositHeld

  const kpis = [
    {
      label: 'Tingkat utilisasi alat',
      value: `${utilization}%`,
      caption: `${borrowed} dari ${tools.length} alat sedang dipinjam`,
      pct: utilization,
      tone: 'accent' as const,
    },
    {
      label: 'Rasio keterlambatan',
      value: `${lateRate}%`,
      caption: `${lateLoans.length} dari ${paid.length} transaksi terlambat`,
      pct: lateRate,
      tone: (lateRate > 25 ? 'bad' : 'warn') as 'bad' | 'warn',
    },
    {
      label: 'Rata-rata durasi pinjam',
      value: `${avgDuration.toFixed(1)} hari`,
      caption: `Berlaku pada ${paid.length} transaksi berbayar`,
      pct: Math.min(100, Math.round((avgDuration / 7) * 100)),
      tone: 'info' as const,
    },
    {
      label: 'Deposit mengambang',
      value: formatRupiah(depositFloat),
      caption: 'Dana jaminan yang masih tertahan',
      pct: revenue + depositFloat > 0 ? Math.round((depositFloat / (revenue + depositFloat)) * 100) : 0,
      tone: 'ok' as const,
    },
  ]

  const recent = loans.slice(0, 6)

  return (
    <div>
      <PageHead
        title="Ringkasan"
        subtitle="Pantau operasional Smart Locker Tool Station secara real-time."
        action={
          <Link to="/admin/verifikasi">
            <Button variant="outline" size="sm">
              Verifikasi kembali ({pending.length}) →
            </Button>
          </Link>
        }
      />

      <section className="mb-5">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-[13px] font-bold uppercase tracking-wider text-ink-400">
            Indikator bisnis
          </h2>
          <span className="h-px flex-1 bg-line" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <KpiCard key={k.label} {...k} />
          ))}
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon="🧰" value={tools.length} label="Total alat" />
        <StatCard icon="✅" value={available} label="Alat tersedia" tone="ok" />
        <StatCard icon="📤" value={borrowed} label="Sedang dipinjam" tone="accent" />
        <StatCard icon="📍" value={stations.length} label="Stasiun aktif" tone="info" />
        <StatCard icon="↗" value={active.length} label="Peminjaman aktif" />
        <StatCard icon="⏳" value={pending.length} label="Menunggu verifikasi" tone="accent" />
        <StatCard
          icon="💰"
          value={formatRupiah(revenue)}
          label="Pendapatan sewa"
          tone="ok"
        />
        <StatCard
          icon="🔒"
          value={formatRupiah(depositHeld)}
          label="Deposit ditahan"
          tone="info"
        />
        <StatCard
          icon="⏰"
          value={overdue.length}
          label="Peminjaman terlambat"
          tone={overdue.length > 0 ? 'bad' : 'default'}
        />
        <StatCard
          icon="⚖️"
          value={formatRupiah(denda)}
          label="Denda terkumpul"
          tone="accent"
        />
      </div>

      {(overdue.length > 0 || needsCheck.length > 0) && (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {overdue.length > 0 && (
            <Alert
              tone="bad"
              title={`${overdue.length} peminjaman terlambat`}
              text="Alat belum kembali melewati tanggal jatuh tempo. Tindak lanjuti denda/deposit."
            />
          )}
          {needsCheck.length > 0 && (
            <Alert
              tone="warn"
              title={`${needsCheck.length} alat perlu pemeriksaan`}
              text="Ada alat berstatus rusak atau perlu diperiksa sebelum bisa dipinjam lagi."
            />
          )}
        </div>
      )}

      <Card className="mt-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-ink-950">Transaksi terbaru</h2>
          <Link to="/admin/transaksi">
            <Button variant="ghost" size="sm">
              Lihat semua →
            </Button>
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line-strong p-8 text-center text-sm text-ink-400">
            Belum ada transaksi.
          </p>
        ) : (
          <div className="-mx-5 overflow-x-auto px-5 scrollbar-thin sm:mx-0 sm:px-0">
            <table className="w-full min-w-[560px] border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-line text-left text-[10px] uppercase tracking-wider text-ink-400">
                  <th className="py-2 font-bold">Peminjam</th>
                  <th className="py-2 font-bold">Alat</th>
                  <th className="py-2 font-bold">Jatuh tempo</th>
                  <th className="py-2 font-bold">Nilai</th>
                  <th className="py-2 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((l) => {
                  const t = tools.find((x) => x.id === l.toolId)
                  const late =
                    l.status === 'Terlambat' ||
                    (l.status === 'Aktif' && isOverdue(l.dueDate))
                  return (
                    <tr key={l.id} className="border-b border-line/70 last:border-0">
                      <td className="py-2.5">
                        <span className="font-semibold text-ink-900">{l.userName}</span>
                        <span className="block text-[11px] text-ink-400">
                          {l.studentId}
                        </span>
                      </td>
                      <td className="py-2.5 text-ink-700">
                        {t?.icon} {t?.name ?? l.toolId}
                      </td>
                      <td
                        className={
                          late
                            ? 'py-2.5 font-semibold text-bad-600'
                            : 'py-2.5 text-ink-700'
                        }
                      >
                        {l.dueDate}
                      </td>
                      <td className="py-2.5 font-semibold text-ink-900">
                        {formatRupiah(l.rentalFee)}
                      </td>
                      <td className="py-2.5">
                        <Badge tone={loanStatusTone(l.status)} dot>
                          {late ? 'Terlambat' : l.status}
                        </Badge>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

const kpiSkin: Record<'accent' | 'info' | 'ok' | 'bad' | 'warn', { chip: string; bar: string }> = {
  accent: { chip: 'text-accent-solid dark:text-accent-600', bar: 'from-accent-400 to-accent-500' },
  info: { chip: 'text-signal-600', bar: 'from-signal-500 to-signal-600' },
  ok: { chip: 'text-ok-600', bar: 'from-ok-500 to-ok-600' },
  bad: { chip: 'text-bad-600', bar: 'from-bad-500 to-bad-500' },
  warn: { chip: 'text-warn-600', bar: 'from-accent-500 to-accent-600' },
}

function KpiCard({
  label,
  value,
  caption,
  pct,
  tone,
}: {
  label: string
  value: string
  caption: string
  pct: number
  tone: 'accent' | 'info' | 'ok' | 'bad' | 'warn'
}) {
  const skin = kpiSkin[tone]
  return (
    <Card className="flex flex-col gap-2">
      <p className="text-[12px] font-semibold text-ink-500">{label}</p>
      <p className={`text-[26px] font-extrabold leading-none ${skin.chip}`}>{value}</p>
      <div className="h-1.5 overflow-hidden rounded-full bg-canvas">
        <div
          className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ${skin.bar}`}
          style={{ width: `${Math.max(4, Math.min(100, pct))}%` }}
        />
      </div>
      <p className="text-[11px] leading-snug text-ink-400">{caption}</p>
    </Card>
  )
}

function Alert({
  tone,
  title,
  text,
}: {
  tone: 'bad' | 'warn'
  title: string
  text: string
}) {
  const skin =
    tone === 'bad'
      ? 'border-bad-500/30 bg-bad-50 text-bad-600'
      : 'border-accent-500/30 bg-accent-50 text-accent-600'
  return (
    <div className={`flex items-start gap-3 rounded-2xl border p-4 ${skin}`}>
      <span className="text-lg">{tone === 'bad' ? '⚠️' : '🔧'}</span>
      <div>
        <p className="text-[13px] font-bold">{title}</p>
        <p className="mt-0.5 text-[12px] opacity-85">{text}</p>
      </div>
    </div>
  )
}
