import { formatDate, formatDateTime, formatRupiah } from '@/lib/format'
import type { Compartment, Loan, Station, Tool } from '@/lib/types'

interface ReceiptProps {
  loan: Loan
  tool?: Tool
  station?: Station
  compartment?: Compartment
  mode: 'payment' | 'return'
}

function Line({
  label,
  value,
  strong,
  tone,
}: {
  label: string
  value: string
  strong?: boolean
  tone?: 'muted' | 'bad' | 'ok'
}) {
  const toneClass =
    tone === 'bad'
      ? 'text-[#b23224]'
      : tone === 'ok'
        ? 'text-[#127a4d]'
        : strong
          ? 'text-[#080c16]'
          : 'text-[#3b4252]'
  return (
    <div className="flex items-baseline justify-between gap-3 text-[12px] leading-6">
      <span className={tone === 'muted' ? 'text-[#6c7a90]' : toneClass}>
        {label}
      </span>
      <span className={strong ? 'font-bold text-[#080c16]' : toneClass}>
        {value}
      </span>
    </div>
  )
}

export function Receipt({ loan, tool, station, compartment, mode }: ReceiptProps) {
  const isReturn = mode === 'return'
  const lateFee = loan.lateFee
  const depositReturned = loan.returnInfo?.depositReturned ?? 0
  const held = isReturn && depositReturned === 0

  return (
    <div className="mx-auto w-full max-w-[320px]">
      <div
        className="receipt-print relative rounded-md bg-white px-5 py-6 font-mono text-[#080c16] shadow-lift"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg,#fff 0 6px,#fafafa 6px 7px)',
        }}
      >
        {/* perforation edges */}
        <span className="pointer-events-none absolute inset-x-0 -top-2 h-2 [mask-image:radial-gradient(circle_at_50%_100%,#000_40%,transparent_41%)] [mask-size:10px_10px] [mask-repeat:repeat-x] bg-white" />
        <span className="pointer-events-none absolute inset-x-0 -bottom-2 h-2 rotate-180 [mask-image:radial-gradient(circle_at_50%_100%,#000_40%,transparent_41%)] [mask-size:10px_10px] [mask-repeat:repeat-x] bg-white" />

        <div className="text-center">
          <p className="text-[13px] font-extrabold tracking-[0.18em]">
            SMART LOCKER
          </p>
          <p className="mt-0.5 text-[10px] tracking-[0.28em] text-[#3b4252]">
            TOOL STATION
          </p>
          <p className="mt-2 text-[10px] leading-4 text-[#6c7a90]">
            {station?.name ?? 'Stasiun loker'}
            <br />
            {station?.location ?? 'Kawasan mahasiswa rantau'}
          </p>
        </div>

        <div className="my-3 border-t border-dashed border-[#c9cfda]" />

        <div className="text-center text-[11px] font-bold tracking-[0.14em]">
          {isReturn ? 'STRUK PENGEMBALIAN' : 'STRUK PEMBAYARAN'}
        </div>

        <div className="mt-2 space-y-0.5 text-[10px] text-[#6c7a90]">
          <div className="flex justify-between">
            <span>No. Transaksi</span>
            <span className="text-[#080c16]">{loan.id}</span>
          </div>
          <div className="flex justify-between">
            <span>{isReturn ? 'Diproses' : 'Dibayar'}</span>
            <span className="text-[#080c16]">
              {formatDateTime(
                isReturn ? loan.returnInfo?.returnedAt ?? '' : loan.payment?.paidAt ?? '',
              )}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Peminjam</span>
            <span className="text-[#080c16]">{loan.userName}</span>
          </div>
          <div className="flex justify-between">
            <span>NIM</span>
            <span className="text-[#080c16]">{loan.studentId}</span>
          </div>
        </div>

        <div className="my-3 border-t border-dashed border-[#c9cfda]" />

        <div className="space-y-0.5">
          <p className="text-[11px] font-bold">
            {tool?.icon} {tool?.name ?? loan.toolId}
          </p>
          <Line
            label={`Sewa ${loan.durationDays} hari × ${formatRupiah(
              loan.durationDays > 0 ? Math.round(loan.rentalFee / loan.durationDays) : 0,
            )}`}
            value={formatRupiah(loan.rentalFee)}
          />
          <Line label="Deposit / jaminan" value={formatRupiah(loan.deposit)} />
          {isReturn && lateFee > 0 && (
            <Line label="Denda keterlambatan" value={`- ${formatRupiah(lateFee)}`} tone="bad" />
          )}
        </div>

        <div className="my-3 border-t border-dashed border-[#c9cfda]" />

        {!isReturn ? (
          <>
            <div className="flex items-baseline justify-between">
              <span className="text-[12px] font-bold text-[#080c16]">Total dibayar</span>
              <span className="text-[15px] font-extrabold text-[#080c16]">
                {formatRupiah((loan.payment?.total ?? loan.rentalFee + loan.deposit))}
              </span>
            </div>
            <div className="mt-2 rounded-md border border-dashed border-[#c9cfda] px-3 py-2 text-center">
              <p className="text-[9px] tracking-[0.22em] text-[#6c7a90]">KODE AKSES LOKER</p>
              <p className="text-[22px] font-extrabold tracking-[0.3em]">
                {loan.accessCode}
              </p>
            </div>
            <p className="mt-2 text-center text-[10px] text-[#6c7a90]">
              Kembali sebelum {formatDate(loan.dueDate)} · kompartemen{' '}
              {compartment?.label ?? '-'}
            </p>
          </>
        ) : (
          <>
            <Line label="Kondisi dilaporkan" value={loan.returnInfo?.condition || '-'} />
            {lateFee > 0 ? (
              <Line
                label="Deposit dikembalikan"
                value={formatRupiah(depositReturned)}
                tone={held ? 'bad' : 'ok'}
                strong
              />
            ) : (
              <Line
                label="Deposit dikembalikan"
                value={held ? 'Ditahan (verifikasi)' : formatRupiah(loan.deposit)}
                tone={held ? 'bad' : 'ok'}
                strong
              />
            )}
            <div className="mt-1 flex items-baseline justify-between border-t border-[#e4e7ee] pt-1 text-[10px]">
              <span className="text-[#6c7a90]">Sewa lunas</span>
              <span className="text-[#080c16]">{formatRupiah(loan.rentalFee)}</span>
            </div>
          </>
        )}

        <div className="my-3 border-t border-dashed border-[#c9cfda]" />

        <div className="flex h-9 items-end justify-center gap-[3px]" aria-hidden>
          {loan.id.split('').concat(isReturn ? loan.userName : loan.accessCode).map((ch, i) => {
            const w = 1 + (ch.charCodeAt(0) % 4)
            return (
              <span
                key={i}
                className="bg-[#080c16]"
                style={{ width: w, height: 24 + ((i * 7) % 12) }}
              />
            )
          })}
        </div>

        <p className="mt-3 text-center text-[9px] leading-4 tracking-wide text-[#6c7a90]">
          {isReturn
            ? 'Simpan struk ini sebagai bukti pengembalian yang sah.'
            : 'Simpan kode & struk ini. Tunjukkan di panel loker.'}
          <br />
          — Terima kasih telah berbagi perkakas —
        </p>
      </div>

      <button
        type="button"
        onClick={() => window.print()}
        className="no-print mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-4 py-2.5 text-[13px] font-bold text-ink-800 transition hover:bg-canvas"
      >
        🖨️ Cetak / simpan struk (PDF)
      </button>
    </div>
  )
}
