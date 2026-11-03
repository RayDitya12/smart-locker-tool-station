import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LockerGrid } from '@/components/locker/LockerGrid'
import { ToolArt } from '@/components/ToolArt'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, Input } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { Receipt } from '@/components/ui/Receipt'
import { Stepper } from '@/components/ui/Stepper'
import { cn } from '@/lib/cn'
import { addDaysISO, formatDate, formatRupiah, todayISO } from '@/lib/format'
import { useStore } from '@/lib/store'
import { durations, wallets } from '@/lib/wallets'
import type { PaymentMethod } from '@/lib/types'

const stepLabels = ['Alat', 'Identitas', 'Durasi', 'Bayar', 'Selesai']

export function Borrow() {
  const { toolId } = useParams()
  const tools = useStore((s) => s.tools)
  const stations = useStore((s) => s.stations)
  const compartments = useStore((s) => s.compartments)
  const session = useStore((s) => s.session)
  const requestLoan = useStore((s) => s.requestLoan)
  const payLoan = useStore((s) => s.payLoan)
  const pushToast = useStore((s) => s.pushToast)

  const [step, setStep] = useState(0)
  const [selectedId, setSelectedId] = useState<string>(toolId ?? '')
  const [name, setName] = useState(session?.name ?? '')
  const [studentId, setStudentId] = useState(session?.studentId ?? '')
  const [contact, setContact] = useState(session?.contact ?? '')
  const [verified, setVerified] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [startDate, setStartDate] = useState(todayISO())
  const [duration, setDuration] = useState(1)
  const [method, setMethod] = useState<PaymentMethod>('GoPay')
  const [paying, setPaying] = useState(false)
  const [loanId, setLoanId] = useState<string | null>(null)
  const [opening, setOpening] = useState(false)

  const tool = useMemo(
    () => tools.find((t) => t.id === selectedId),
    [tools, selectedId],
  )
  const station = stations.find((s) => s.id === tool?.stationId)
  const loan = useStore((s) => s.loans.find((l) => l.id === loanId)) ?? null

  useEffect(() => {
    if (toolId && tools.some((t) => t.id === toolId)) setSelectedId(toolId)
  }, [toolId, tools])

  const rentalFee = tool ? tool.pricePerDay * duration : 0
  const deposit = tool?.deposit ?? 0
  const total = rentalFee + deposit
  const dueDate = addDaysISO(startDate, duration)

  const availableTools = tools.filter((t) => t.status === 'Tersedia')

  function runVerify() {
    setVerifying(true)
    setTimeout(() => {
      setVerifying(false)
      setVerified(true)
      pushToast('Identitas terverifikasi (KTM aktif).', 'success')
    }, 1400)
  }

  function runPayment() {
    if (!tool) return
    setPaying(true)
    setTimeout(() => {
      const id = requestLoan({
        userName: name.trim(),
        studentId: studentId.trim(),
        contact: contact.trim(),
        toolId: tool.id,
        startDate,
        durationDays: duration,
      })
      if (!id) {
        setPaying(false)
        return
      }
      const ok = payLoan(id, method)
      setPaying(false)
      if (ok) {
        setLoanId(id)
        setStep(4)
        setOpening(true)
        setTimeout(() => setOpening(false), 2600)
      }
    }, 1700)
  }

  const identityComplete =
    verified && name.trim() && studentId.trim() && contact.trim()

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link
        to="/katalog"
        className="text-[12px] font-semibold text-ink-400 transition hover:text-ink-700"
      >
        ← Batal & kembali ke katalog
      </Link>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">
        Pinjam perkakas
      </h1>
      <p className="mt-1 text-sm text-ink-500">
        Ikuti alur peminjaman loker pintar berikut.
      </p>

      <div className="mt-6">
        <Stepper steps={stepLabels} current={step} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
        <div className="min-w-0">
          {/* STEP 0 - pilih alat */}
          {step === 0 && (
            <Card className="anim-fade-up">
              <h2 className="text-base font-bold text-ink-950">Pilih alat</h2>
              <p className="mt-1 text-[13px] text-ink-500">
                Hanya alat berstatus tersedia yang bisa dipinjam.
              </p>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {availableTools.map((t) => {
                  const st = stations.find((s) => s.id === t.stationId)
                  const active = selectedId === t.id
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedId(t.id)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border-2 p-3 text-left transition',
                        active
                          ? 'border-ink-900 bg-canvas'
                          : 'border-line hover:border-line-strong hover:bg-surface-2',
                      )}
                    >
                      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-surface p-1.5 shadow-soft">
                        <ToolArt id={t.id} name={t.name} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <span className="truncate text-[14px] font-bold text-ink-950">
                            {t.name}
                          </span>
                          <span className="font-mono text-[10px] text-ink-400">{t.id}</span>
                        </span>
                        <span className="mt-0.5 block truncate text-[11px] text-ink-500">
                          📍 {st?.name}
                        </span>
                        <span className="mt-1 block text-[12px] font-bold text-ink-800">
                          {formatRupiah(t.pricePerDay)}
                          <span className="font-medium text-ink-400"> /hari</span>
                        </span>
                      </span>
                      <span
                        className={cn(
                          'grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 text-[10px]',
                          active ? 'border-fg bg-fg text-on-fg' : 'border-line-strong text-transparent',
                        )}
                      >
                        {active ? '✓' : ''}
                      </span>
                    </button>
                  )
                })}
              </div>
              {availableTools.length === 0 && (
                <p className="mt-4 rounded-xl border border-dashed border-line-strong p-6 text-center text-sm text-ink-400">
                  Tidak ada alat tersedia saat ini.
                </p>
              )}
              <div className="mt-5 flex justify-end">
                <Button disabled={!tool} onClick={() => setStep(1)}>
                  Lanjut ke verifikasi →
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 1 - identitas */}
          {step === 1 && (
            <Card className="anim-fade-up">
              <h2 className="text-base font-bold text-ink-950">Verifikasi identitas</h2>
              <p className="mt-1 text-[13px] text-ink-500">
                Data ini dipakai untuk menjamin keamanan & deposit peminjaman.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Nama lengkap" required className="sm:col-span-2">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Dinda Putri"
                  />
                </Field>
                <Field label="NIM / ID mahasiswa" required>
                  <Input
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Contoh: 2401001"
                  />
                </Field>
                <Field label="Kontak (WhatsApp)" required>
                  <Input
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    placeholder="Contoh: 0812xxxxxxx"
                  />
                </Field>
              </div>

              <div className="mt-5 flex flex-col gap-3 rounded-xl border border-line bg-surface-2 p-4 sm:flex-row sm:items-center">
                <div className="flex h-20 w-32 shrink-0 items-center justify-center rounded-lg border border-dashed border-line-strong bg-surface text-center">
                  {verified ? (
                    <span className="text-[11px] font-bold text-ok-600">
                      🪪<br />KTM<br />Terverifikasi
                    </span>
                  ) : (
                    <span className="text-[11px] text-ink-400">Preview KTM</span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-ink-800">
                    Status verifikasi KTM
                  </p>
                  <p className="mt-0.5 text-[12px] text-ink-500">
                    {verified
                      ? 'Identitas kamu sudah diverifikasi sebagai mahasiswa aktif.'
                      : 'Jalankan verifikasi untuk memastikan KTM aktif (simulasi).'}
                  </p>
                  {!verified && (
                    <Button
                      variant={verifying ? 'outline' : 'signal'}
                      size="sm"
                      className="mt-2.5"
                      disabled={verifying || !name.trim() || !studentId.trim()}
                      onClick={runVerify}
                    >
                      {verifying ? (
                        <>
                          <Spinner /> Memeriksa…
                        </>
                      ) : (
                        'Verifikasi KTM sekarang'
                      )}
                    </Button>
                  )}
                  {verified && (
                    <Badge tone="ok" className="mt-2.5" dot>
                      Terverifikasi
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mt-5 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(0)}>
                  ← Kembali
                </Button>
                <Button disabled={!identityComplete} onClick={() => setStep(2)}>
                  Lanjut ke durasi →
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 2 - durasi */}
          {step === 2 && (
            <Card className="anim-fade-up">
              <h2 className="text-base font-bold text-ink-950">Durasi & jadwal</h2>
              <p className="mt-1 text-[13px] text-ink-500">
                Tentukan mulai pinjam dan berapa lama alat digunakan.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="Tanggal mulai" required>
                  <Input
                    type="date"
                    value={startDate}
                    min={todayISO()}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </Field>
                <Field label="Rencana kembali">
                  <Input value={formatDate(dueDate)} readOnly className="bg-canvas" />
                </Field>
              </div>
              <div className="mt-4">
                <span className="mb-2 block text-[12px] font-bold text-ink-700">
                  Lama pinjam
                </span>
                <div className="flex flex-wrap gap-2">
                  {durations.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={cn(
                        'rounded-xl border-2 px-4 py-2.5 text-[13px] font-bold transition',
                        duration === d
                          ? 'border-fg bg-fg text-on-fg'
                          : 'border-line bg-surface text-ink-700 hover:border-line-strong',
                      )}
                    >
                      {d} hari
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-4 rounded-xl bg-signal-50 px-4 py-3 text-[12px] text-signal-600 ring-1 ring-inset ring-signal-500/15">
                Lewat dari <strong>{formatDate(dueDate)}</strong> akan dikenakan denda
                dan deposit berisiko ditahan.
              </div>
              <div className="mt-5 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(1)}>
                  ← Kembali
                </Button>
                <Button onClick={() => setStep(3)}>Lanjut ke pembayaran →</Button>
              </div>
            </Card>
          )}

          {/* STEP 3 - pembayaran */}
          {step === 3 && (
            <Card className="anim-fade-up">
              <h2 className="text-base font-bold text-ink-950">Pembayaran</h2>
              <p className="mt-1 text-[13px] text-ink-500">
                Pilih dompet digital. Deposit ditahan dan dikembalikan saat alat
                pulang tepat waktu & kondisi baik.
              </p>
              <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
                {wallets.map((w) => {
                  const active = method === w.id
                  return (
                    <button
                      key={w.id}
                      onClick={() => setMethod(w.id)}
                      className={cn(
                        'flex items-center gap-3 rounded-xl border-2 p-3.5 text-left transition',
                        active
                          ? 'border-ink-900 bg-canvas'
                          : 'border-line hover:border-line-strong',
                      )}
                    >
                      <span
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-[13px] font-extrabold text-white"
                        style={{ background: w.color }}
                      >
                        {w.label.slice(0, 2).toUpperCase()}
                      </span>
                      <span className="flex-1">
                        <span className="block text-[14px] font-bold text-ink-950">
                          {w.label}
                        </span>
                        <span className="text-[11px] text-ink-500">{w.note}</span>
                      </span>
                      <span
                        className={cn(
                          'grid h-5 w-5 place-items-center rounded-full border-2 text-[10px]',
                          active ? 'border-fg bg-fg text-on-fg' : 'border-line-strong text-transparent',
                        )}
                      >
                        {active ? '✓' : ''}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="mt-5 space-y-2 rounded-xl border border-line bg-surface-2 p-4 text-[13px]">
                <Row label={`Sewa ${duration} hari`} value={formatRupiah(rentalFee)} />
                <Row label="Deposit (jaminan)" value={formatRupiah(deposit)} />
                <div className="flex justify-between border-t border-line pt-2 text-base font-extrabold text-ink-950">
                  <span>Total bayar</span>
                  <span>{formatRupiah(total)}</span>
                </div>
              </div>

              <div className="mt-5 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(2)}>
                  ← Kembali
                </Button>
                <Button variant="accent" size="lg" onClick={runPayment}>
                  Bayar {formatRupiah(total)} →
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 4 - sukses */}
          {step === 4 && loan && (
            <Card className="anim-fade-up overflow-hidden !p-0">
              <div className="bg-ok-solid px-6 py-5 text-white">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white/20 text-xl">
                    ✓
                  </span>
                  <div>
                    <h2 className="text-lg font-extrabold">Pembayaran berhasil</h2>
                    <p className="text-[13px] text-white/80">
                      Loker siap dibuka. Simpan kode akses berikut.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-5 p-6 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-ink-400">
                    Kode akses loker
                  </p>
                  <p className="mt-1.5 font-mono text-4xl font-bold tracking-[0.2em] text-ink-950">
                    {loan.accessCode}
                  </p>
                  <div className="mt-4 space-y-1.5 text-[13px] text-ink-600">
                    <p>
                      <span className="text-ink-400">Alat:</span>{' '}
                      <strong className="text-ink-900">{tool?.name}</strong>
                    </p>
                    <p>
                      <span className="text-ink-400">Stasiun:</span> {station?.name}
                    </p>
                    <p>
                      <span className="text-ink-400">Kompartemen:</span>{' '}
                      <strong className="font-mono text-ink-900">
                        {compartments.find((c) => c.id === loan.compartmentId)?.label}
                      </strong>
                    </p>
                    <p>
                      <span className="text-ink-400">Kembali sebelum:</span>{' '}
                      {formatDate(loan.dueDate)}
                    </p>
                    <p>
                      <span className="text-ink-400">Deposit ditahan:</span>{' '}
                      {formatRupiah(loan.deposit)}
                    </p>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link to="/pinjaman">
                      <Button>Lihat pinjaman saya →</Button>
                    </Link>
                    <Link to={`/kembalikan/${loan.id}`}>
                      <Button variant="outline">Kembalikan alat</Button>
                    </Link>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-400">
                    {opening ? 'Membuka kompartemen…' : 'Kompartemen kamu'}
                  </p>
                  <div className="rounded-2xl border border-line bg-panel p-4">
                    <LockerGrid
                      compartments={compartments.filter(
                        (c) => c.stationId === loan.stationId,
                      )}
                      columns={3}
                      openId={opening ? loan.compartmentId : null}
                      activeId={opening ? null : loan.compartmentId}
                    />
                  </div>
                  <p className="mt-2.5 text-[11px] leading-relaxed text-ink-400">
                    Masukkan kode akses di panel loker atau scan QR pada stasiun untuk
                    membuka kompartemen secara mandiri.
                  </p>
                </div>
              </div>

              <div className="no-print border-t border-dashed border-line-strong bg-canvas px-6 py-7">
                <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-wider text-ink-400">
                  Struk transaksi
                </p>
                <Receipt
                  mode="payment"
                  loan={loan}
                  tool={tool}
                  station={station}
                  compartment={compartments.find((c) => c.id === loan.compartmentId)}
                />
              </div>
            </Card>
          )}
        </div>

        {/* Summary sidebar */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card className="bg-surface-2">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-ink-400">
              Ringkasan
            </h3>
            {tool ? (
              <div className="mt-3 flex items-center gap-3">
                <span className="grid h-14 w-14 place-items-center rounded-xl bg-surface p-1.5 shadow-soft">
                  <ToolArt id={tool.id} name={tool.name} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold text-ink-950">
                    {tool.name}
                  </p>
                  <p className="truncate text-[11px] text-ink-500">📍 {station?.name}</p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-[13px] text-ink-400">Belum ada alat dipilih.</p>
            )}

            <div className="mt-4 space-y-2 border-t border-line pt-4 text-[13px]">
              <Row label="Durasi" value={`${duration} hari`} />
              <Row label="Mulai" value={formatDate(startDate)} />
              <Row label="Kembali" value={formatDate(dueDate)} />
              <Row label="Sewa" value={formatRupiah(rentalFee)} />
              <Row label="Deposit" value={formatRupiah(deposit)} />
              <div className="flex justify-between border-t border-line pt-2 text-[15px] font-extrabold text-ink-950">
                <span>Total</span>
                <span>{formatRupiah(total)}</span>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-ink-400">
              Deposit bukan biaya. Akan dikembalikan setelah alat diverifikasi kembali
              dalam kondisi baik.
            </p>
          </Card>
        </aside>
      </div>

      {/* Payment processing overlay */}
      <Modal open={paying} onClose={() => {}}>
        <div className="flex flex-col items-center py-6 text-center">
          <p className="text-sm font-bold text-ink-950">Memproses pembayaran</p>
          <div className="mt-4">
            <Spinner large />
          </div>
          <p className="mt-4 text-sm font-semibold text-ink-800">
            Menghubungkan ke {method}…
          </p>
          <p className="mt-1 text-[12px] text-ink-500">
            Jangan tutup halaman ini. (Simulasi pembayaran)
          </p>
          <p className="mt-4 font-mono text-lg font-bold text-ink-950">
            {formatRupiah(total)}
          </p>
        </div>
      </Modal>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-ink-500">{label}</span>
      <span className="font-semibold text-ink-900">{value}</span>
    </div>
  )
}

function Spinner({ large }: { large?: boolean }) {
  return (
    <span
      className={cn(
        'inline-block animate-spin rounded-full border-2 border-line-strong border-t-ink-900',
        large ? 'h-10 w-10' : 'h-4 w-4',
      )}
    />
  )
}
