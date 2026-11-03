import { useState } from 'react'
import { PageHead } from '@/components/layout/PageHead'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { formatDate, formatRupiah, isOverdue } from '@/lib/format'
import { useStore } from '@/lib/store'
import type { Loan, ToolCondition } from '@/lib/types'

const conditions: ToolCondition[] = ['Baik', 'Perlu diperiksa', 'Rusak', 'Dalam perbaikan']

export function AdminReturns() {
  const loans = useStore((s) => s.loans)
  const tools = useStore((s) => s.tools)
  const stations = useStore((s) => s.stations)
  const resolveReturn = useStore((s) => s.resolveReturn)

  const queue = loans.filter((l) => l.status === 'Menunggu verifikasi')
  const [target, setTarget] = useState<Loan | null>(null)
  const [condition, setCondition] = useState<ToolCondition>('Baik')
  const [refund, setRefund] = useState(true)
  const [notes, setNotes] = useState('')

  function openResolve(l: Loan) {
    setTarget(l)
    setCondition((l.returnInfo?.condition as ToolCondition) || 'Baik')
    setRefund(!isOverdue(l.dueDate) && l.returnInfo?.condition !== 'Rusak')
    setNotes('')
  }

  function confirm() {
    if (!target) return
    resolveReturn(target.id, condition, refund, notes.trim())
    setTarget(null)
  }

  return (
    <div>
      <PageHead
        title="Verifikasi pengembalian"
        subtitle="Periksa kondisi fisik alat dan putuskan pengembalian deposit."
      />

      {queue.length === 0 ? (
        <Card className="text-center">
          <p className="text-4xl">🎉</p>
          <h2 className="mt-3 text-base font-bold text-ink-950">Antrean kosong</h2>
          <p className="mx-auto mt-1 max-w-sm text-[13px] text-ink-500">
            Tidak ada pengembalian yang menunggu verifikasi. Semua beres!
          </p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {queue.map((l) => {
            const t = tools.find((x) => x.id === l.toolId)
            const st = stations.find((x) => x.id === l.stationId)
            const late = isOverdue(l.dueDate)
            return (
              <Card key={l.id} className={late ? 'border-bad-500/40' : undefined}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <span className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-canvas text-3xl">
                      {t?.icon ?? '🧰'}
                    </span>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-[16px] font-bold text-ink-950">
                          {t?.name ?? l.toolId}
                        </h3>
                        {late && <Badge tone="bad" dot>Terlambat</Badge>}
                        <Badge tone="warn">{l.returnInfo?.sensor}</Badge>
                      </div>
                      <p className="mt-0.5 font-mono text-[11px] text-ink-400">{l.id}</p>
                      <p className="mt-1 text-[12px] text-ink-600">
                        {l.userName} · {l.studentId} · 📍 {st?.name}
                      </p>
                      <p className="mt-0.5 text-[12px] text-ink-500">
                        Jatuh tempo {formatDate(l.dueDate)} · deposit{' '}
                        {formatRupiah(l.deposit)}
                      </p>
                      {l.returnInfo?.notes && (
                        <p className="mt-2 rounded-lg bg-surface-2 px-3 py-2 text-[12px] text-ink-600">
                          <strong>Catatan pengguna:</strong> “{l.returnInfo.notes}”
                        </p>
                      )}
                    </div>
                  </div>
                  <Button onClick={() => openResolve(l)}>Periksa & putuskan →</Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal
        open={!!target}
        onClose={() => setTarget(null)}
        title="Verifikasi kondisi alat"
        footer={
          <>
            <Button variant="ghost" onClick={() => setTarget(null)}>
              Batal
            </Button>
            <Button onClick={confirm}>Simpan keputusan</Button>
          </>
        }
      >
        {target && (
          <div className="grid gap-4">
            <div className="rounded-xl bg-surface-2 px-4 py-3 text-[13px] text-ink-600">
              <strong className="text-ink-900">
                {tools.find((x) => x.id === target.toolId)?.name}
              </strong>{' '}
              · {target.id} · deposit {formatRupiah(target.deposit)}
            </div>
            <Field label="Kondisi fisik alat (hasil pemeriksaan)">
              <Select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ToolCondition)}
              >
                {conditions.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </Field>
            <Field label="Keputusan deposit">
              <div className="flex gap-2">
                <button
                  onClick={() => setRefund(true)}
                  className={
                    refund
                      ? 'flex-1 rounded-xl border-2 border-ok-500 bg-ok-50 px-4 py-3 text-left text-[13px] font-bold text-ok-600'
                      : 'flex-1 rounded-xl border-2 border-line px-4 py-3 text-left text-[13px] font-semibold text-ink-500'
                  }
                >
                  ✓ Kembalikan deposit
                </button>
                <button
                  onClick={() => setRefund(false)}
                  className={
                    !refund
                      ? 'flex-1 rounded-xl border-2 border-bad-500 bg-bad-50 px-4 py-3 text-left text-[13px] font-bold text-bad-600'
                      : 'flex-1 rounded-xl border-2 border-line px-4 py-3 text-left text-[13px] font-semibold text-ink-500'
                  }
                >
                  ✕ Tahan deposit
                </button>
              </div>
            </Field>
            <Field label="Catatan admin (opsional)">
              <Textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Misal: denda keterlambatan dipotong dari deposit"
              />
            </Field>
          </div>
        )}
      </Modal>
    </div>
  )
}
