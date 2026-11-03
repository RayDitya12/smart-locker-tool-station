import { Link } from 'react-router-dom'
import { ToolArt } from '@/components/ToolArt'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import { formatDate, formatDateTime, formatRupiah, isOverdue } from '@/lib/format'
import { loanStatusTone } from '@/lib/status'
import { useStore } from '@/lib/store'
import type { Loan } from '@/lib/types'

export function Rentals() {
  const loans = useStore((s) => s.loans)
  const tools = useStore((s) => s.tools)
  const stations = useStore((s) => s.stations)
  const compartments = useStore((s) => s.compartments)
  const session = useStore((s) => s.session)

  const mine = session
    ? loans.filter((l) => l.studentId === session.studentId)
    : []
  const active = mine.filter(
    (l) =>
      l.status === 'Aktif' ||
      l.status === 'Terlambat' ||
      l.status === 'Menunggu verifikasi',
  )
  const history = mine.filter(
    (l) => l.status === 'Selesai' || l.status === 'Dibatalkan',
  )

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="anim-fade-up">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">
          Pinjaman saya
        </h1>
        <p className="mt-1.5 text-sm text-ink-500">
          {session
            ? `Halo, ${session.name}. Pantau peminjaman aktif dan riwayatmu.`
            : 'Belum ada identitas yang masuk di perangkat ini.'}
        </p>
      </header>

      {!session && (
        <EmptyState
          emoji="🔑"
          title="Belum ada pinjaman"
          text="Mulai pinjam alat untuk melihat transaksi kamu di sini."
          cta={
            <Link to="/katalog">
              <Button>Pinjam alat sekarang →</Button>
            </Link>
          }
        />
      )}

      {session && mine.length === 0 && (
        <EmptyState
          emoji="🧰"
          title="Belum ada pinjaman"
          text="Kamu belum pernah meminjam alat. Yuk mulai!"
          cta={
            <Link to="/katalog">
              <Button>Lihat katalog →</Button>
            </Link>
          }
        />
      )}

      {active.length > 0 && (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-400">
            Sedang berjalan ({active.length})
          </h2>
          <div className="grid gap-4">
            {active.map((l) => (
              <LoanCard
                key={l.id}
                loan={l}
                toolName={tools.find((t) => t.id === l.toolId)?.name ?? l.toolId}
                toolId={l.toolId}
                stationName={stations.find((s) => s.id === l.stationId)?.name ?? ''}
                compLabel={
                  compartments.find((c) => c.id === l.compartmentId)?.label ?? ''
                }
              />
            ))}
          </div>
        </section>
      )}

      {history.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-400">
            Riwayat ({history.length})
          </h2>
          <div className="grid gap-4">
            {history.map((l) => (
              <LoanCard
                key={l.id}
                loan={l}
                toolName={tools.find((t) => t.id === l.toolId)?.name ?? l.toolId}
                toolId={l.toolId}
                stationName={stations.find((s) => s.id === l.stationId)?.name ?? ''}
                compLabel={
                  compartments.find((c) => c.id === l.compartmentId)?.label ?? ''
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function LoanCard({
  loan,
  toolName,
  toolId,
  stationName,
  compLabel,
}: {
  loan: Loan
  toolName: string
  toolId: string
  stationName: string
  compLabel: string
}) {
  const overdue =
    loan.status === 'Terlambat' ||
    ((loan.status === 'Aktif' || loan.status === 'Menunggu verifikasi') &&
      isOverdue(loan.dueDate))
  const canReturn = loan.status === 'Aktif' || loan.status === 'Terlambat'

  return (
    <Card className={cn('anim-fade-up', overdue && 'border-bad-500/40')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-canvas p-1.5">
            <ToolArt id={toolId} name={toolName} />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[16px] font-bold text-ink-950">{toolName}</h3>
              <Badge tone={loanStatusTone(loan.status)} dot>
                {overdue ? 'Terlambat' : loan.status}
              </Badge>
            </div>
            <p className="mt-0.5 font-mono text-[11px] text-ink-400">{loan.id}</p>
            <p className="mt-1 text-[12px] text-ink-500">
              📍 {stationName} · Kompartemen{' '}
              <span className="font-mono font-bold text-ink-700">{compLabel}</span>
            </p>
          </div>
        </div>

        {canReturn && (
          <div className="flex flex-col items-end gap-2">
            {loan.accessCode && (
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                  Kode akses
                </p>
                <p className="font-mono text-xl font-bold tracking-widest text-ink-950">
                  {loan.accessCode}
                </p>
              </div>
            )}
            <Link to={`/kembalikan/${loan.id}`}>
              <Button variant="accent" size="sm">
                Kembalikan alat →
              </Button>
            </Link>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-[12px] sm:grid-cols-4">
        <Info label="Mulai" value={formatDate(loan.startDate)} />
        <Info
          label="Kembali sebelum"
          value={formatDate(loan.dueDate)}
          tone={overdue ? 'bad' : undefined}
        />
        <Info label="Sewa" value={formatRupiah(loan.rentalFee)} />
        <Info
          label="Deposit"
          value={formatRupiah(loan.deposit)}
          sub={
            loan.returnInfo
              ? loan.returnInfo.depositReturned > 0
                ? `Kembali ${formatRupiah(loan.returnInfo.depositReturned)}`
                : 'Ditahan'
              : 'Ditahan sementara'
          }
          tone={loan.returnInfo?.depositReturned ? 'ok' : undefined}
        />
      </div>

      {loan.payment && (
        <p className="mt-3 text-[11px] text-ink-400">
          Dibayar via {loan.payment.method} · {formatDateTime(loan.payment.paidAt)} ·{' '}
          {loan.payment.status}
        </p>
      )}
      {loan.returnInfo && (
        <div className="mt-3 rounded-xl bg-surface-2 px-3.5 py-2.5 text-[12px] text-ink-600">
          <strong className="text-ink-800">Pengembalian:</strong> diverifikasi{' '}
          {loan.returnInfo.sensor} · kondisi{' '}
          <strong>{loan.returnInfo.condition || 'menunggu'}</strong>
          {loan.lateFee > 0 && (
            <>
              {' · '}
              <span className="font-semibold text-bad-600">
                denda {formatRupiah(loan.lateFee)}
              </span>
            </>
          )}
          {loan.returnInfo.notes && <> · “{loan.returnInfo.notes}”</>}
        </div>
      )}
    </Card>
  )
}

function Info({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: string
  sub?: string
  tone?: 'ok' | 'bad'
}) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
        {label}
      </p>
      <p
        className={cn(
          'mt-0.5 font-semibold',
          tone === 'bad' ? 'text-bad-600' : tone === 'ok' ? 'text-ok-600' : 'text-ink-900',
        )}
      >
        {value}
      </p>
      {sub && <p className="text-[10px] text-ink-400">{sub}</p>}
    </div>
  )
}

function EmptyState({
  emoji,
  title,
  text,
  cta,
}: {
  emoji: string
  title: string
  text: string
  cta: React.ReactNode
}) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-line-strong bg-surface p-12 text-center">
      <p className="text-4xl">{emoji}</p>
      <h2 className="mt-3 text-base font-bold text-ink-950">{title}</h2>
      <p className="mx-auto mt-1 max-w-sm text-[13px] text-ink-500">{text}</p>
      <div className="mt-5 flex justify-center">{cta}</div>
    </div>
  )
}
