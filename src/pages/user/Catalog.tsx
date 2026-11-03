import { useMemo, useState } from 'react'
import { ToolCard } from '@/components/ToolCard'
import { Input } from '@/components/ui/Field'
import { cn } from '@/lib/cn'
import { useStore } from '@/lib/store'

export function Catalog() {
  const tools = useStore((s) => s.tools)
  const stations = useStore((s) => s.stations)
  const [query, setQuery] = useState('')
  const [stationFilter, setStationFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [onlyAvailable, setOnlyAvailable] = useState(false)

  const categories = useMemo(
    () => Array.from(new Set(tools.map((t) => t.category))),
    [tools],
  )

  const filtered = useMemo(() => {
    return tools.filter((t) => {
      if (stationFilter !== 'all' && t.stationId !== stationFilter) return false
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false
      if (onlyAvailable && t.status !== 'Tersedia') return false
      if (query.trim()) {
        const q = query.toLowerCase()
        if (
          !t.name.toLowerCase().includes(q) &&
          !t.id.toLowerCase().includes(q) &&
          !t.category.toLowerCase().includes(q) &&
          !t.description.toLowerCase().includes(q)
        )
          return false
      }
      return true
    })
  }, [tools, query, stationFilter, categoryFilter, onlyAvailable])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="anim-fade-up">
        <h1 className="text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">
          Katalog perkakas
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-ink-500">
          Semua alat yang tersimpan di stasiun loker. Periksa ketersediaan real-time
          sebelum meminjam.
        </p>
      </header>

      {/* Filters */}
      <div className="sticky top-16 z-20 -mx-4 mt-5 border-y border-line bg-canvas/90 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400">
              🔎
            </span>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari alat, kode, atau kategori…"
              className="pl-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterPill
              active={stationFilter === 'all'}
              onClick={() => setStationFilter('all')}
              label="Semua stasiun"
            />
            {stations.map((st) => (
              <FilterPill
                key={st.id}
                active={stationFilter === st.id}
                onClick={() => setStationFilter(st.id)}
                label={st.name.replace('Stasiun ', '')}
              />
            ))}
          </div>
        </div>
        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <FilterPill
            active={categoryFilter === 'all'}
            onClick={() => setCategoryFilter('all')}
            label="Semua kategori"
          />
          {categories.map((c) => (
            <FilterPill
              key={c}
              active={categoryFilter === c}
              onClick={() => setCategoryFilter(c)}
              label={c}
            />
          ))}
          <label className="ml-auto flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-ink-600">
            <input
              type="checkbox"
              checked={onlyAvailable}
              onChange={(e) => setOnlyAvailable(e.target.checked)}
              className="h-4 w-4 rounded border-line-strong accent-ink-900"
            />
            Hanya yang tersedia
          </label>
        </div>
      </div>

      <p className="mt-4 text-[12px] text-ink-400">
        Menampilkan <strong className="text-ink-700">{filtered.length}</strong> dari{' '}
        {tools.length} alat
      </p>

      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => (
          <ToolCard
            key={t.id}
            tool={t}
            station={stations.find((s) => s.id === t.stationId)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-6 rounded-2xl border border-dashed border-line-strong bg-surface p-12 text-center">
          <p className="text-3xl">🗂️</p>
          <p className="mt-2 text-sm font-semibold text-ink-700">
            Tidak ada alat yang cocok
          </p>
          <p className="mt-1 text-[12px] text-ink-400">
            Coba ubah kata kunci atau filter yang dipilih.
          </p>
        </div>
      )}
    </div>
  )
}

function FilterPill({
  active,
  onClick,
  label,
}: {
  active: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-3.5 py-1.5 text-[12px] font-semibold transition',
        active
          ? 'border-ink-900 bg-ink-900 text-white'
          : 'border-line-strong bg-surface text-ink-600 hover:border-ink-300 hover:text-ink-900',
      )}
    >
      {label}
    </button>
  )
}
