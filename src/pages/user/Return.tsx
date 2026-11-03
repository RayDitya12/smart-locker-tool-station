import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LockerGrid } from '@/components/locker/LockerGrid'
import { ToolArt } from '@/components/ToolArt'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Receipt } from '@/components/ui/Receipt'
import { Stepper } from '@/components/ui/Stepper'
import { cn } from '@/lib/cn'
import { formatDate, formatRupiah } from '@/lib/format'
import { useStore } from '@/lib/store'
import type { SensorKind, ToolCondition } from '@/lib/types'

const steps = ['Buka loker', 'Scan sensor', 'Kondisi alat', 'Selesai']
const scanLines = [
  'Membaca tag RFID perkakas…',
  'Menimbang sensor berat kompartemen…',
  'Mencocokkan dengan inventaris…',
  'Alat terdeteksi & sesuai ✓',
]

export function Return() {
  const { loanId } = useParams()
  const loans = useStore((s) => s.loans)
  const tools = useStore((s) => s.tools)
  const stations = useStore((s) => s.stations)
  const compartments = useStore((s) => s.compartments)
  const submitReturn = useStore((s) => s.submitReturn)

  const active = useMemo(
    () => loans.filter((l) => l.status === 'Aktif' || l.status === 'Terlambat'),
    [loans],
  )
  const targetId = loanId ?? ''
  const loan = loans.find((l) => l.id === targetId) ?? null

  const [step, setStep] = useState(0)
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState(false)
  const [scanIndex, setScanIndex] = useState(0)
  const [scanning, setScanning] = useState(false)
  const [sensor, setSensor] = useState<SensorKind>('RFID')
  const [condition, setCondition] = useState<ToolCondition | ''>('')
  const [notes, setNotes] = useState('')
  const [done, setDone] = useState(false)

  const tool = tools.find((t) => t.id === loan?.toolId)
  const station = stations.find((s) => s.id === loan?.stationId)
  const comp = compartments.find((c) => c.id === loan?.compartmentId)

  useEffect(() => {
    setStep(0)
    setCode('')
    setCodeError(false)
    setScanIndex(0)
    setScanning(false)
    setSensor('RFID')
    setCondition('')
    setNotes('')
    setDone(false)
  }, [targetId])

  useEffect(() => {
    if (!scanning) return
    if (scanIndex >= scanLines.length - 1) {
      const t = setTimeout(() => {
        setScanning(false)
        setStep(2)
      }, 900)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setScanIndex((i) => i + 1), 850)
    return () => clearTimeout(t)
  }, [scanning, scanIndex])

  // No loan selected -> picker
  if (!loan) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">
          Kembalikan alat
        </h1>
        <p className="mt-1.5 text-sm text-ink-500">
          Pilih transaksi aktif yang ingin dikembalikan.
        </p>
        {active.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-line-strong bg-surface p-12 text-center">
            <p className="text-4xl">📭</p>
            <h2 className="mt-3 text-base font-bold text-ink-950">
              Tidak ada peminjaman aktif
            </h2>
            <p className="mx-auto mt-1 max-w-sm text-[13px] text-ink-500">
              Kamu tidak sedang meminjam alat apa pun saat ini.
            </p>
            <Link to="/katalog" className="mt-5 inline-block">
              <Button>Pinjam alat →</Button>
            </Link>
          </div>
        ) : (
          <div className="mt-5 grid gap-3">
            {active.map((l) => {
              const t = tools.find((x) => x.id === l.toolId)
              return (
                <Link key={l.id} to={`/kembalikan/${l.id}`}>
                  <Card className="flex items-center gap-3.5 transition hover:-translate-y-0.5 hover:shadow-lift">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-canvas p-1.5">
                      <ToolArt id={l.toolId} name={t?.name} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[15px] font-bold text-ink-950">
                        {t?.name ?? l.toolId}
                      </p>
                      <p className="truncate text-[12px] text-ink-500">
                        {l.id} · kembali sebelum {formatDate(l.dueDate)}
                      </p>
                    </div>
                    <span className="font-semibold text-signal-600">Pilih →</span>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  function unlock() {
    if (code.trim() === loan!.accessCode) {
      setCodeError(false)
      setScanIndex(0)
      setScanning(true)
      setStep(1)
    } else {
      setCodeError(true)
    }
  }

  function finalize() {
    if (!condition) return
    submitReturn(loan!.id, sensor, condition, notes.trim())
    setDone(true)
    setStep(3)
  }

  const cleanReturn = condition === 'Baik'

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link
        to="/pinjaman"
        className="text-[12px] font-semibold text-ink-400 transition hover:text-ink-700"
      >
        ← Pinjaman saya
      </Link>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">
        Kembalikan alat
      </h1>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Badge tone="info">{tool?.icon} {tool?.name}</Badge>
        <Badge tone="neutral">{loan.id}</Badge>
        <Badge tone="neutral">📍 {station?.name}</Badge>
      </div>

      <div className="mt-6">
        <Stepper steps={steps} current={step} />
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-[1.3fr_0.7fr]">
        <div className="min-w-0">
          {/* STEP 0 - unlock */}
          {step === 0 && (
            <Card className="anim-fade-up">
              <h2 className="text-base font-bold text-ink-950">Buka kompartemen</h2>
              <p className="mt-1 text-[13px] text-ink-500">
                Masukkan kode akses untuk membuka kompartemen{' '}
                <span className="font-mono font-bold text-ink-800">{comp?.label}</span>{' '}
                dan menaruh alat kembali.
              </p>
              <Field label="Kode akses loker" required className="mt-4 max-w-xs">
                <Input
                  value={code}
                  inputMode="numeric"
                  maxLength={6}
                  onChange={(e) => {
                    setCode(e.target.value.replace(/\D/g, ''))
                    setCodeError(false)
                  }}
                  placeholder="6 digit kode"
                  className={cn(
                    'font-mono text-center text-2xl tracking-[0.4em]',
                    codeError && 'border-bad-500 focus:border-bad-500 focus:ring-bad-500/12',
                  )}
                />
              </Field>
              {codeError && (
                <p className="mt-1.5 text-[12px] font-semibold text-bad-600">
                  Kode akses salah. Periksa lagi di kartu pinjamanmu.
                </p>
              )}
              <div className="mt-4 flex items-center gap-3 rounded-xl bg-signal-50 px-4 py-3 text-[12px] text-signal-600 ring-1 ring-inset ring-signal-500/15">
                <span className="text-base">💡</span>
                <span>
                  Lupa kode? Kode akses kamu: <span className="font-mono font-bold">{loan.accessCode}</span> (demo)
                </span>
              </div>
              <div className="mt-5">
                <Button size="lg" onClick={unlock} disabled={code.length < 4}>
                  Buka loker & scan →
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 1 - scanning */}
          {step === 1 && (
            <Card className="anim-fade-up">
              <h2 className="text-base font-bold text-ink-950">Verifikasi sensor</h2>
              <p className="mt-1 text-[13px] text-ink-500">
                Sistem memeriksa keberadaan & keaslian alat di kompartemen.
              </p>
              <div className="relative mt-5 overflow-hidden rounded-2xl border border-line bg-panel p-6">
                <div className="flex items-center justify-center">
                  <div className="relative grid h-28 w-28 place-items-center rounded-2xl border-2 border-accent-400/60 bg-ink-900/5">
                    <span className="h-14 w-14">
                      <ToolArt id={tool?.id ?? ''} name={tool?.name} />
                    </span>
                    {scanning && (
                      <span className="pointer-events-none absolute inset-x-0 h-1 bg-accent-500 shadow-[0_0_16px_2px_rgba(245,166,35,0.55)] anim-scan" />
                    )}
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  {scanLines.map((line, i) => (
                    <div
                      key={line}
                      className={cn(
                        'flex items-center gap-2.5 text-[13px] transition-all duration-300',
                        i < scanIndex && 'text-ok-600',
                        i === scanIndex && 'text-ink-950',
                        i > scanIndex && 'text-ink-400',
                      )}
                    >
                      <span
                        className={cn(
                          'grid h-5 w-5 place-items-center rounded-full text-[10px]',
                          i < scanIndex
                            ? 'bg-ok-500/20 text-ok-600'
                            : i === scanIndex
                              ? 'bg-accent-500 text-ink-950'
                              : 'bg-ink-900/10 text-ink-400',
                        )}
                      >
                        {i < scanIndex ? '✓' : i === scanIndex ? '●' : i + 1}
                      </span>
                      {line}
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-3 text-center text-[12px] text-ink-400">
                Memverifikasi dengan {sensor} + sensor berat…
              </p>
            </Card>
          )}

          {/* STEP 2 - condition */}
          {step === 2 && (
            <Card className="anim-fade-up">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-ok-50 text-ok-600">
                  ✓
                </span>
                <div>
                  <h2 className="text-base font-bold text-ink-950">
                    Alat terdeteksi sensor
                  </h2>
                  <p className="text-[13px] text-ink-500">
                    Laporkan kondisi fisik alat untuk penentuan deposit.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                {(['RFID', 'Sensor berat'] as SensorKind[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSensor(s)}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-[12px] font-semibold transition',
                      sensor === s
                        ? 'border-fg bg-fg text-on-fg'
                        : 'border-line-strong bg-surface text-ink-600',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="mt-5">
                <span className="mb-2 block text-[12px] font-bold text-ink-700">
                  Kondisi alat saat dikembalikan
                </span>
                <div className="grid gap-2.5 sm:grid-cols-3">
                  {(['Baik', 'Perlu diperiksa', 'Rusak'] as ToolCondition[]).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCondition(c)}
                      className={cn(
                        'rounded-xl border-2 p-3.5 text-left transition',
                        condition === c
                          ? c === 'Baik'
                            ? 'border-ok-500 bg-ok-50'
                            : c === 'Rusak'
                              ? 'border-bad-500 bg-bad-50'
                              : 'border-accent-500 bg-accent-50'
                          : 'border-line hover:border-line-strong',
                      )}
                    >
                      <span className="text-xl">
                        {c === 'Baik' ? '👍' : c === 'Rusak' ? '🛠️' : '🔍'}
                      </span>
                      <span className="mt-1 block text-[13px] font-bold text-ink-900">
                        {c}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <Field label="Catatan (opsional)" className="mt-4">
                <Textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: ada goresan ringan di badan bor"
                />
              </Field>

              <div className="mt-5 flex justify-between">
                <Button variant="ghost" onClick={() => setStep(0)}>
                  ← Kembali
                </Button>
                <Button variant="accent" size="lg" disabled={!condition} onClick={finalize}>
                  Konfirmasi pengembalian →
                </Button>
              </div>
            </Card>
          )}

          {/* STEP 3 - result */}
          {step === 3 && done && (
            <Card className="anim-fade-up overflow-hidden !p-0">
              <div
                className={cn(
                  'px-6 py-5 text-white',
                  cleanReturn ? 'bg-ok-solid' : 'bg-accent-solid',
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-white/20 text-xl">
                    {cleanReturn ? '✓' : '⏳'}
                  </span>
                  <div>
                    <h2 className="text-lg font-extrabold">
                      {cleanReturn ? 'Pengembalian selesai' : 'Menunggu verifikasi admin'}
                    </h2>
                    <p className="text-[13px] text-white/85">
                      {cleanReturn
                        ? 'Deposit kamu telah dikembalikan.'
                        : 'Admin akan memeriksa kondisi & memutuskan deposit.'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 p-6 text-[13px]">
                <div className="flex justify-between">
                  <span className="text-ink-500">Alat</span>
                  <span className="font-semibold text-ink-900">{tool?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Diverifikasi oleh</span>
                  <span className="font-semibold text-ink-900">{sensor}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-500">Kondisi dilaporkan</span>
                  <span className="font-semibold text-ink-900">{condition}</span>
                </div>
                {loan.lateFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-ink-500">Denda keterlambatan</span>
                    <span className="font-semibold text-bad-600">
                      - {formatRupiah(loan.lateFee)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-t border-line pt-2">
                  <span className="text-ink-500">Deposit {formatRupiah(loan.deposit)}</span>
                  <span
                    className={cn(
                      'font-bold',
                      cleanReturn ? 'text-ok-600' : 'text-accent-600',
                    )}
                  >
                    {cleanReturn
                      ? `Dikembalikan ${formatRupiah(loan.returnInfo?.depositReturned ?? 0)} ✓`
                      : 'Ditahan sementara'}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to="/pinjaman">
                    <Button>Lihat pinjaman saya →</Button>
                  </Link>
                  <Link to="/katalog">
                    <Button variant="outline">Pinjam alat lain</Button>
                  </Link>
                </div>
              </div>

              <div className="no-print border-t border-dashed border-line-strong bg-canvas px-6 py-7">
                <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-wider text-ink-400">
                  Struk pengembalian
                </p>
                <Receipt
                  mode="return"
                  loan={loan}
                  tool={tool}
                  station={station}
                  compartment={comp}
                />
              </div>
            </Card>
          )}
        </div>

        {/* side: locker */}
        <aside className="md:sticky md:top-20 md:self-start">
          <Card className="bg-surface-2">
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-ink-400">
              Kompartemen {comp?.label}
            </h3>
            <div className="mt-3 rounded-2xl border border-line bg-panel p-3.5">
              <LockerGrid
                compartments={compartments.filter(
                  (c) => c.stationId === loan.stationId,
                )}
                columns={3}
                openId={step === 0 || step === 1 ? loan.compartmentId : null}
                activeId={step >= 2 ? loan.compartmentId : null}
              />
            </div>
            <div className="mt-4 space-y-2 border-t border-line pt-4 text-[12px]">
              <div className="flex justify-between">
                <span className="text-ink-500">Stasiun</span>
                <span className="font-semibold text-ink-900">{station?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-500">Kembali sebelum</span>
                <span className="font-semibold text-ink-900">
                  {formatDate(loan.dueDate)}
                </span>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  )
}
