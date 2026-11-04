import { useState } from 'react'
import { PageHead } from '@/components/layout/PageHead'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Field'
import { cn } from '@/lib/cn'
import { downloadCsv, toCsv } from '@/lib/csv'
import { formatDate, formatDateTime, formatRupiah, isOverdue } from '@/lib/format'
import { loanStatusTone } from '@/lib/status'
import { useStore } from '@/lib/store'
import type { LoanStatus } from '@/lib/types'

const filters: Array<LoanStatus | 'Semua'> = [
  'Semua',
  'Menunggu pembayaran',
  'Aktif',
  'Terlambat',
  'Menunggu verifikasi',
  'Selesai',
  'Dibatalkan',
]

export function AdminTransactions() {
  const loans = useStore((s) => s.loans)
  const tools = useStore((s) => s.tools)
  const stations = useStore((s) => s.stations)
  const cancelLoan = useStore((s) => s.cancelLoan)
  const [filter, setFilter] = useState<LoanStatus | 'Semua'>('Semua')

  const rows = filter === 'Semua' ? loans : loans.filter((l) => l.status === filter)

  function exportCsv() {
    const csv = toCsv(
      ['ID', 'Peminjam', 'NIM', 'Alat', 'Stasiun', 'Mulai', 'Jatuh tempo', 'Durasi (hari)', 'Sewa (Rp)', 'Deposit (Rp)', 'Denda (Rp)', 'Metode', 'Status', 'Deposit kembali (Rp)'],
      rows.map((l) => [
        l.id,
        l.userName,
        l.studentId,
        tools.find((x) => x.id === l.toolId)?.name ?? l.toolId,
        stations.find((x) => x.id === l.stationId)?.name ?? l.stationId,
        l.startDate,
        l.dueDate,
        l.durationDays,
        l.rentalFee,
        l.deposit,
        l.lateFee,
        l.payment?.method ?? '',
        l.status,
        l.returnInfo?.depositReturned ?? 0,
      ]),
    )
    downloadCsv(`transaksi-${filter === 'Semua' ? 'semua' : filter.toLowerCase().replace(/ /g, '-')}.csv`, csv)
  }

  return (
    <div>
      <PageHead
        title="Transaksi"
        subtitle={`${loans.length} total transaksi peminjaman.`}
        action={
          <div className="flex items-center gap-2">
            <div className="w-52">
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value as LoanStatus | 'Semua')}
                aria-label="Filter status"
              >
                {filters.map((f) => (
                  <option key={f}>{f}</option>
                ))}
              </Select>
            </div>
            <Button variant="secondary" size="sm" onClick={exportCsv}>
              ⬇ Ekspor CSV
            </Button>
          </div>
        }
      />

      <Card padded={false}>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[860px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-line bg-surface-2 text-left text-[10px] uppercase tracking-wider text-ink-400">
                <th className="px-5 py-3 font-bold">Peminjam</th>
                <th className="px-3 py-3 font-bold">Alat</th>
                <th className="px-3 py-3 font-bold">Stasiun</th>
                <th className="px-3 py-3 font-bold">Periode</th>
                <th className="px-3 py-3 font-bold">Nilai</th>
                <th className="px-3 py-3 font-bold">Bayar</th>
                <th className="px-3 py-3 font-bold">Status</th>
                <th className="px-5 py-3 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => {
                const t = tools.find((x) => x.id === l.toolId)
                const st = stations.find((x) => x.id === l.stationId)
                const late =
                  l.status === 'Terlambat' ||
                  (isOverdue(l.dueDate) && l.status === 'Aktif')
                return (
                  <tr key={l.id} className="border-b border-line/70 last:border-0">
                    <td className="px-5 py-3">
                      <p className="font-semibold text-ink-950">{l.userName}</p>
                      <p className="text-[11px] text-ink-400">{l.studentId}</p>
                      <p className="font-mono text-[10px] text-ink-300">{l.id}</p>
                    </td>
                    <td className="px-3 py-3 text-ink-700">
                      {t?.icon} {t?.name ?? l.toolId}
                    </td>
                    <td className="px-3 py-3 text-[12px] text-ink-600">{st?.name}</td>
                    <td className="px-3 py-3 text-[12px]">
                      <p className="text-ink-700">{formatDate(l.startDate)}</p>
                      <p className={cn('text-[11px]', late ? 'font-bold text-bad-600' : 'text-ink-400')}>
                        s/d {formatDate(l.dueDate)} {late && '· telat'}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-ink-900">
                        {formatRupiah(l.rentalFee)}
                      </p>
                      <p className="text-[11px] text-ink-400">
                        dep {formatRupiah(l.deposit)}
                      </p>
                      {l.lateFee > 0 && (
                        <p className="text-[11px] font-semibold text-bad-600">
                          denda {formatRupiah(l.lateFee)}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-3 text-[12px]">
                      {l.payment ? (
                        <>
                          <p className="font-semibold text-ink-800">
                            {l.payment.method}
                          </p>
                          <p className="text-[10px] text-ink-400">
                            {formatDateTime(l.payment.paidAt)}
                          </p>
                        </>
                      ) : (
                        <span className="text-ink-400">Belum bayar</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <Badge tone={loanStatusTone(l.status)} dot>
                        {late ? 'Terlambat' : l.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {l.status === 'Menunggu pembayaran' ||
                      l.status === 'Aktif' ||
                      l.status === 'Terlambat' ? (
                        <Button variant="danger" size="sm" onClick={() => cancelLoan(l.id)}>
                          Batalkan
                        </Button>
                      ) : (
                        <span className="text-ink-300">—</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {rows.length === 0 && (
          <p className="p-10 text-center text-sm text-ink-400">
            Tidak ada transaksi pada filter ini.
          </p>
        )}
      </Card>
    </div>
  )
}
