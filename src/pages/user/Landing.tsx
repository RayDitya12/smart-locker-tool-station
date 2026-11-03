import { Link } from 'react-router-dom'
import { ToolCard } from '@/components/ToolCard'
import { LockerGrid } from '@/components/locker/LockerGrid'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionHead } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { useStore } from '@/lib/store'

const howItWorks = [
  {
    no: '01',
    icon: '🔎',
    title: 'Pilih alat & stasiun',
    text: 'Cari perkakas yang tersedia beserta lokasi loker terdekat dari kosmu.',
  },
  {
    no: '02',
    icon: '🪪',
    title: 'Verifikasi identitas',
    text: 'Verifikasi KTM/NIM aktif agar akun dan transaksi terjamin keamanannya.',
  },
  {
    no: '03',
    icon: '💳',
    title: 'Bayar sewa + deposit',
    text: 'Bayar lewat dompet digital. Deposit ditahan sebagai jaminan, bukan hangus.',
  },
  {
    no: '04',
    icon: '🔓',
    title: 'Buka loker dengan kode',
    text: 'Sistem menerbitkan kode akses untuk membuka kompartemen loker secara mandiri.',
  },
  {
    no: '05',
    icon: '📡',
    title: 'Kembalikan & sensor cek',
    text: 'Kembalikan ke loker yang sama. RFID/sensor berat memverifikasi keberadaan alat.',
  },
  {
    no: '06',
    icon: '↩️',
    title: 'Deposit kembali',
    text: 'Deposit otomatis dikembalikan bila alat pulang tepat waktu dan dalam kondisi baik.',
  },
]

export function Landing() {
  const tools = useStore((s) => s.tools)
  const stations = useStore((s) => s.stations)
  const compartments = useStore((s) => s.compartments)
  const loans = useStore((s) => s.loans)

  const available = tools.filter((t) => t.status === 'Tersedia')
  const active = loans.filter(
    (l) => l.status === 'Aktif' || l.status === 'Menunggu verifikasi',
  )
  const featured = available.slice(0, 3)
  const heroStation = stations[0]
  const heroCompartments = compartments.filter((c) => c.stationId === heroStation?.id)

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      {/* Hero */}
      <section className="relative mt-6 overflow-hidden rounded-3xl bg-ink-950 px-6 py-12 text-white sm:mt-8 sm:px-10 sm:py-16">
        <div
          className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-accent-400/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-28 left-1/3 h-72 w-72 rounded-full bg-signal-500/20 blur-3xl"
          aria-hidden
        />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="anim-fade-up">
            <Badge tone="warn" className="bg-white/10 text-accent-300 ring-white/15">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-400" />
              Layanan 24 jam · mandiri · tercatat digital
            </Badge>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
              Perkakas ada saat
              <br />
              kamu butuh.
              <span className="text-accent-400"> Tanpa beli.</span>
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/65">
              Smart Locker Tool Station adalah loker pintar tempat mahasiswa rantau
              meminjam perkakas rumah tangga sesekali pakai — bor, obeng, tangga,
              setrika — cukup dengan scan, bayar, dan buka loker sendiri.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/katalog">
                <Button variant="accent" size="lg">
                  Lihat katalog alat →
                </Button>
              </Link>
              <Link to="/pinjam">
                <Button
                  size="lg"
                  className="border border-white/20 bg-white/10 text-white hover:bg-white/15"
                >
                  Mulai pinjam
                </Button>
              </Link>
            </div>
            <dl className="mt-9 grid max-w-md grid-cols-3 gap-4 border-t border-white/10 pt-6">
              {[
                { k: `${tools.length}`, v: 'Perkakas siap pinjam' },
                { k: `${stations.length}`, v: 'Titik stasiun loker' },
                { k: '24/7', v: 'Akses mandiri' },
              ].map((s) => (
                <div key={s.v}>
                  <dt className="text-2xl font-extrabold text-accent-400">{s.k}</dt>
                  <dd className="mt-0.5 text-[11px] leading-snug text-white/55">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="anim-fade-up relative">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-white/45">
                    Stasiun loker
                  </p>
                  <p className="text-sm font-bold text-white">{heroStation?.name}</p>
                </div>
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-400 text-ink-950">
                  ▦
                </span>
              </div>
              <div className="rounded-xl bg-ink-900/60 p-3">
                <LockerGrid compartments={heroCompartments} columns={3} />
              </div>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] text-white/55">
                <span className="flex items-center gap-1.5">
                  <i className="h-2 w-2 rounded-full bg-ok-500" /> Terisi alat
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="h-2 w-2 rounded-full bg-ink-400" /> Kompartemen kosong
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="h-2 w-2 rounded-full bg-accent-400" /> Perlu diperiksa
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live stats */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        <StatCard icon="🧰" value={tools.length} label="Total alat terdaftar" />
        <StatCard icon="✅" value={available.length} label="Alat tersedia" tone="ok" />
        <StatCard icon="📍" value={stations.length} label="Stasiun loker" tone="info" />
        <StatCard icon="↗" value={active.length} label="Peminjaman aktif" tone="accent" />
      </section>

      {/* Featured tools */}
      <section className="mt-12">
        <SectionHead
          title="Alat yang siap dipinjam"
          subtitle="Perkakas sesekali pakai yang paling dibutuhkan anak kos."
          action={
            <Link to="/katalog">
              <Button variant="outline" size="sm">
                Semua alat →
              </Button>
            </Link>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((t) => (
            <ToolCard
              key={t.id}
              tool={t}
              station={stations.find((s) => s.id === t.stationId)}
            />
          ))}
        </div>
        {featured.length === 0 && (
          <p className="rounded-2xl border border-dashed border-line-strong bg-surface p-8 text-center text-sm text-ink-400">
            Semua alat sedang dipinjam. Cek lagi sebentar lagi.
          </p>
        )}
      </section>

      {/* How it works */}
      <section className="mt-14">
        <SectionHead
          title="Cara kerjanya"
          subtitle="Enam langkah dari memilih alat sampai deposit kembali."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {howItWorks.map((s) => (
            <div
              key={s.no}
              className="group relative overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="absolute right-4 top-3 font-mono text-3xl font-bold text-line transition group-hover:text-accent-100">
                {s.no}
              </span>
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-canvas text-xl">
                {s.icon}
              </span>
              <h3 className="mt-3.5 text-[15px] font-bold text-ink-950">{s.title}</h3>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stations */}
      <section className="mt-14">
        <SectionHead
          title="Titik stasiun loker"
          subtitle="Ditempatkan di lokasi aman, terang, dan dekat dengan hunian mahasiswa."
        />
        <div className="grid gap-4 md:grid-cols-2">
          {stations.map((st) => {
            const stComps = compartments.filter((c) => c.stationId === st.id)
            const filled = stComps.filter((c) => c.status === 'Terisi').length
            return (
              <Link
                key={st.id}
                to={`/stasiun/${st.id}`}
                className="group rounded-2xl border border-line bg-surface p-5 shadow-soft transition hover:-translate-y-1 hover:shadow-lift"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-ink-950">{st.name}</h3>
                    <p className="mt-1 flex items-center gap-1 text-[12px] text-ink-500">
                      <span>📍</span> {st.location}
                    </p>
                  </div>
                  <Badge tone="info">{st.compartmentCount} loker</Badge>
                </div>
                <p className="mt-3 text-[12.5px] leading-relaxed text-ink-500">
                  {st.description}
                </p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[12px]">
                  <span className="text-ink-500">
                    <strong className="text-ink-900">{filled}</strong> alat tersedia di
                    stasiun ini
                  </span>
                  <span className="font-semibold text-signal-600 transition group-hover:translate-x-0.5">
                    Detail →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
