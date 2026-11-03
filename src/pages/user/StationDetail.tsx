import { Link, useParams } from 'react-router-dom'
import { ToolCard } from '@/components/ToolCard'
import { LockerGrid } from '@/components/locker/LockerGrid'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, SectionHead } from '@/components/ui/Card'
import { useStore } from '@/lib/store'

export function StationDetail() {
  const { id } = useParams()
  const stations = useStore((s) => s.stations)
  const tools = useStore((s) => s.tools)
  const compartments = useStore((s) => s.compartments)

  const station = stations.find((s) => s.id === id)

  if (!station) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
        <p className="text-4xl">🧭</p>
        <h1 className="mt-3 text-xl font-bold text-ink-950">Stasiun tidak ditemukan</h1>
        <Link to="/katalog" className="mt-4 inline-block">
          <Button variant="outline">← Kembali ke katalog</Button>
        </Link>
      </div>
    )
  }

  const stationComps = compartments.filter((c) => c.stationId === station.id)
  const stationTools = tools.filter((t) => t.stationId === station.id)
  const available = stationTools.filter((t) => t.status === 'Tersedia').length
  const occupied = stationComps.filter((c) => c.status === 'Terisi').length

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Link
        to="/katalog"
        className="text-[12px] font-semibold text-ink-400 transition hover:text-ink-700"
      >
        ← Semua stasiun
      </Link>

      <header className="anim-fade-up mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold Tracking-tight text-ink-950 sm:text-3xl">
            {station.name}
          </h1>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-ink-500">
            <span>📍</span> {station.location}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge tone="info">{station.compartmentCount} kompartemen</Badge>
          <Badge tone="ok" dot>
            {available} alat tersedia
          </Badge>
        </div>
      </header>

      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-500">
        {station.description}
      </p>

      <div className="mt-6 grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <SectionHead
            title="Denah loker"
            subtitle={`${occupied} dari ${stationComps.length} kompartemen terisi`}
          />
          <div className="rounded-2xl bg-ink-950 p-4">
            <LockerGrid compartments={stationComps} columns={3} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-4">
            <Legend color="bg-ok-500" label="Terisi" />
            <Legend color="bg-ink-300" label="Kosong" />
            <Legend color="bg-signal-500" label="Terkunci" />
            <Legend color="bg-accent-400" label="Perlu cek" />
          </div>
        </Card>

        <div>
          <SectionHead
            title="Alat di stasiun ini"
            subtitle={`${stationTools.length} perkakas terdaftar`}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {stationTools.map((t) => (
              <ToolCard key={t.id} tool={t} />
            ))}
          </div>
          {stationTools.length === 0 && (
            <p className="rounded-2xl border border-dashed border-line-strong bg-surface p-8 text-center text-sm text-ink-400">
              Belum ada alat di stasiun ini.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-ink-500">
      <i className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </span>
  )
}
