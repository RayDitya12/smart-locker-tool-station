import { PageHead } from '@/components/layout/PageHead'
import { LockerGrid } from '@/components/locker/LockerGrid'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { compartmentTone } from '@/lib/status'
import { useStore } from '@/lib/store'

export function AdminLockers() {
  const stations = useStore((s) => s.stations)
  const compartments = useStore((s) => s.compartments)
  const tools = useStore((s) => s.tools)

  return (
    <div>
      <PageHead
        title="Loker & stasiun"
        subtitle="Denah kompartemen dan isi tiap loker di setiap stasiun."
      />

      <div className="grid gap-5 lg:grid-cols-2">
        {stations.map((st) => {
          const comps = compartments.filter((c) => c.stationId === st.id)
          const filled = comps.filter((c) => c.status === 'Terisi').length
          const empty = comps.filter((c) => c.status === 'Kosong').length
          const check = comps.filter((c) => c.status === 'Perlu diperiksa').length
          const utilization = comps.length
            ? Math.round((filled / comps.length) * 100)
            : 0

          return (
            <Card key={st.id}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-ink-950">{st.name}</h2>
                  <p className="mt-0.5 text-[12px] text-ink-500">📍 {st.location}</p>
                </div>
                <Badge tone="info">{utilization}% terisi</Badge>
              </div>

              <div className="mt-4 rounded-2xl border border-line bg-panel p-4">
                <LockerGrid compartments={comps} columns={3} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="ok">🧰 {filled} terisi</Badge>
                <Badge tone="neutral">▫ {empty} kosong</Badge>
                {check > 0 && <Badge tone="warn">⚠ {check} perlu cek</Badge>}
              </div>

              <div className="mt-4 border-t border-line pt-3">
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink-400">
                  Isi kompartemen
                </p>
                <div className="grid gap-1.5">
                  {comps.map((c) => {
                    const t = c.toolId ? tools.find((x) => x.id === c.toolId) : null
                    return (
                      <div
                        key={c.id}
                        className="flex items-center justify-between rounded-lg bg-surface-2 px-3 py-1.5 text-[12px]"
                      >
                        <span className="flex items-center gap-2">
                          <span className="font-mono font-bold text-ink-700">
                            {c.label}
                          </span>
                          <span className="text-ink-400">({c.size})</span>
                        </span>
                        <span className="flex items-center gap-2">
                          {t ? (
                            <span className="text-ink-700">
                              {t.icon} {t.name}
                            </span>
                          ) : (
                            <span className="text-ink-400">Kosong</span>
                          )}
                          <Badge tone={compartmentTone(c.status)}>{c.status}</Badge>
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
