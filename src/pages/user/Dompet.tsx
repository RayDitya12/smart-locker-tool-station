import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'
import { downloadCsv, toCsv } from '@/lib/csv'
import { formatDateTime, formatRupiah } from '@/lib/format'
import { useStore } from '@/lib/store'

type EntryKind = 'sewa' | 'deposit-tahan' | 'deposit-kembali' | 'denda'

interface Entry {
  at: string
  loanId: string
  toolName: string
  kind: EntryKind
  amount: number
}

const kindMeta: Record<EntryKind, { label: string; tone: 'ok' | 'bad' | 'info' | 'neutral'; sign: string }> = {
  sewa: { label: 'Sewa dibayar', tone: 'neutral', sign: '−' },
  'deposit-tahan': { label: 'Deposit ditahan', tone: 'info', sign: '−' },
  'deposit-kembali': { label: 'Deposit kembali', tone: 'ok', sign: '+' },
  denda: { label: 'Denda keterlambatan', tone: 'bad', sign: '−' },
}

export function Dompet() {
  const loans = useStore((s) => s.loans)
  const tools = useStore((s) => s.tools)
  const session = useStore((s) => s.session)

  const [onlyMine, setOnlyMine] = useState(true)

  const nameOf = (id: string) => tools.find((t) => t.id === id)?.name ?? id

  const scoped = useMemo(
    () =>
      loans
        .filter((l) => l.payment)
        .filter((l) => (onlyMine && session ? l.studentId === session.studentId : true)),
    [loans, session, onlyMine],
  )

  const entries: Entry[] = []
  for (const l of scoped) {
    if (!l.payment) continue
    entries.push({ at: l.payment.paidAt, loanId: l.id, toolName: nameOf(l.toolId), kind: 'sewa', amount: l.rentalFee })
    entries.push({ at: l.payment.paidAt, loanId: l.id, toolName: nameOf(l.toolId), kind: 'deposit-tahan', amount: l.deposit })
    if (l.returnInfo && l.returnInfo.depositReturned > 0) {
      entries.push({ at: l.returnInfo.returnedAt, loanId: l.id, toolName: nameOf(l.toolId), kind: 'deposit-kembali', amount: l.returnInfo.depositReturned })
    }
    if (l.lateFee > 0) {
      entries.push({ at: l.returnInfo?.returnedAt ?? l.payment.paidAt, loanId: l.id, toolName: nameOf(l.toolId), kind: 'denda', amount: l.lateFee })
    }
  }
  entries.sort((a, b) => b.at.localeCompare(a.at))

  const totals = scoped.reduce(
    (acc, l) => {
      acc.sewa += l.rentalFee
      if (!l.returnInfo) acc.held += l.deposit
      else if (l.returnInfo.depositReturned > 0) acc.returned += l.returnInfo.depositReturned
      else acc.held += l.deposit
      acc.denda += l.lateFee
      return acc
    },
    { sewa: 0, held: 0, returned: 0, denda: 0 },
  )

  function exportCsv() {
    const csv = toCsv(
      ['Waktu', 'Transaksi', 'Alat', 'Jenis', 'Nominal (Rp)'],
      entries.map((e) => [e.at, e.loanId, e.toolName, kindMeta[e.kind].label, e.amount]),
    )
    downloadCsv('mutasi-dompet.csv', csv)
  }

  const noSession = !session

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="anim-fade-up flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">
            Dompet & jaminan
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">
            Pantau deposit yang ditahan, yang kembali, dan denda keterlambatan.
          </p>
        </div>
        <Link to="/bantuan">
          <Button variant="ghost" size="sm">
            Kebijakan deposit →
          </Button>
        </Link>
      </header>

      <div className="mt-5 inline-flex rounded-xl border border-line bg-surface p-1 text-[12px] font-semibold">
        <button
          onClick={() => setOnlyMine(true)}
          className={cn('rounded-lg px-3 py-1.5 transition', onlyMine ? 'bg-fg text-on-fg' : 'text-ink-500')}
        >
          Milik saya
        </button>
        <button
          onClick={() => setOnlyMine(false)}
          className={cn('rounded-lg px-3 py-1.5 transition', !onlyMine ? 'bg-fg text-on-fg' : 'text-ink-500')}
        >
          Semua (demo)
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line-strong bg-surface p-12 text-center">
          <p className="text-4xl">👛</p>
          <h2 className="mt-3 text-base font-bold text-ink-950">
            {noSession && onlyMine ? 'Belum ada aktivitas dompet' : 'Belum ada mutasi pada pilihan ini'}
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-[13px] text-ink-500">
            {noSession && onlyMine
              ? 'Pinjam alat untuk mulai melihat riwayat deposit dan denda kamu, atau lihat mode demo.'
              : 'Tidak ada transaksi berbayar untuk ditampilkan.'}
          </p>
          {noSession && onlyMine && (
            <Link to="/katalog" className="mt-5 inline-block">
              <Button>Lihat katalog →</Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Summary label="Deposit tertahan" value={formatRupiah(totals.held)} tone="info" />
            <Summary label="Deposit kembali" value={formatRupiah(totals.returned)} tone="ok" />
            <Summary label="Denda dibayar" value={formatRupiah(totals.denda)} tone="bad" />
            <Summary label="Total sewa" value={formatRupiah(totals.sewa)} tone="neutral" />
          </div>

          <Card padded={false} className="mt-5">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <h2 className="text-[13px] font-bold text-ink-950">Mutasi ({entries.length})</h2>
              <Button variant="secondary" size="sm" onClick={exportCsv}>
                ⬇ Ekspor CSV
              </Button>
            </div>
            <ul className="divide-y divide-line">
              {entries.map((e, i) => {
                const meta = kindMeta[e.kind]
                return (
                  <li key={`${e.loanId}-${e.kind}-${i}`} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <Badge tone={meta.tone}>{meta.label}</Badge>
                      <p className="mt-1 truncate text-[12px] text-ink-500">
                        {e.toolName} · <span className="font-mono text-[11px]">{e.loanId}</span>
                      </p>
                      <p className="text-[11px] text-ink-400">{formatDateTime(e.at)}</p>
                    </div>
                    <p
                      className={cn(
                        'shrink-0 text-[14px] font-bold',
                        meta.sign === '+' ? 'text-ok-600' : 'text-ink-900',
                      )}
                    >
                      {meta.sign}
                      {formatRupiah(e.amount)}
                    </p>
                  </li>
                )
              })}
            </ul>
          </Card>
        </>
      )}
    </div>
  )
}

function Summary({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'ok' | 'bad' | 'info' | 'neutral'
}) {
  const skin = {
    ok: 'text-ok-600',
    bad: 'text-bad-600',
    info: 'text-signal-600',
    neutral: 'text-ink-950',
  }[tone]
  return (
    <Card className="flex flex-col gap-1">
      <p className="text-[11px] font-semibold text-ink-500">{label}</p>
      <p className={cn('text-[19px] font-extrabold leading-tight', skin)}>{value}</p>
    </Card>
  )
}
