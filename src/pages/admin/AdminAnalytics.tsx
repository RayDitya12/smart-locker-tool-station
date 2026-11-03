import { useMemo } from 'react'
import { PageHead } from '@/components/layout/PageHead'
import { Card, SectionHead } from '@/components/ui/Card'
import { StatCard } from '@/components/ui/StatCard'
import { formatRupiah } from '@/lib/format'
import { useStore } from '@/lib/store'

export function AdminAnalytics() {
  const loans = useStore((s) => s.loans)
  const tools = useStore((s) => s.tools)
  const stations = useStore((s) => s.stations)
  const compartments = useStore((s) => s.compartments)

  const paid = loans.filter((l) => l.payment)
  const revenue = paid.reduce((s, l) => s + l.rentalFee, 0)
  const completed = loans.filter((l) => l.status === 'Selesai').length

  const byTool = useMemo(() => {
    const map = new Map<string, number>()
    for (const l of loans) map.set(l.toolId, (map.get(l.toolId) ?? 0) + 1)
    return [...map.entries()]
      .map(([id, count]) => ({ tool: tools.find((t) => t.id === id), count }))
      .filter((x) => x.tool)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
  }, [loans, tools])

  const byHour = useMemo(() => {
    const arr = new Array(24).fill(0) as number[]
    for (const l of loans) {
      const h = new Date(l.createdAt).getHours()
      arr[h] += 1
    }
    return arr
  }, [loans])

  const byCategory = useMemo(() => {
    const map = new Map<string, number>()
    for (const l of loans) {
      const t = tools.find((x) => x.id === l.toolId)
      if (t) map.set(t.category, (map.get(t.category) ?? 0) + 1)
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [loans, tools])

  const maxTool = byTool[0]?.count ?? 1
  const maxHour = Math.max(1, ...byHour)

  const stationUtil = stations.map((st) => {
    const comps = compartments.filter((c) => c.stationId === st.id)
    const filled = comps.filter((c) => c.status === 'Terisi').length
    return {
      st,
      pct: comps.length ? Math.round((filled / comps.length) * 100) : 0,
      loans: loans.filter((l) => l.stationId === st.id).length,
    }
  })

  return (
    <div>
      <PageHead
        title="Analitik"
        subtitle="Wawasan penggunaan untuk menentukan stok, lokasi, dan jam operasional."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon="🧾" value={loans.length} label="Total transaksi" />
        <StatCard icon="✅" value={completed} label="Transaksi selesai" tone="ok" />
        <StatCard icon="💰" value={formatRupiah(revenue)} label="Pendapatan sewa" tone="accent" />
        <StatCard
          icon="📊"
          value={loans.length ? Math.round((completed / loans.length) * 100) + '%' : '0%'}
          label="Tingkat penyelesaian"
          tone="info"
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card>
          <SectionHead
            title="Alat paling sering dipinjam"
            subtitle="Berdasarkan jumlah transaksi per alat."
          />
          {byTool.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-3">
              {byTool.map(({ tool, count }) => (
                <div key={tool!.id}>
                  <div className="mb-1 flex items-center justify-between text-[13px]">
                    <span className="font-semibold text-ink-800">
                      {tool!.icon} {tool!.name}
                    </span>
                    <span className="text-ink-500">{count}×</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-canvas">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent-400 to-accent-500 transition-all duration-700"
                      style={{ width: `${(count / maxTool) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionHead
            title="Jam sibuk peminjaman"
            subtitle="Distribusi transaksi berdasarkan jam pembuatan."
          />
          {loans.length === 0 ? (
            <Empty />
          ) : (
            <div className="flex h-40 items-end gap-1">
              {byHour.map((v, h) => (
                <div key={h} className="group relative flex-1">
                  <div
                    className="w-full rounded-t bg-signal-500/80 transition-all duration-500 group-hover:bg-signal-600"
                    style={{ height: `${(v / maxHour) * 100}%`, minHeight: v ? 4 : 2 }}
                  />
                  {h % 3 === 0 && (
                    <span className="mt-1 block text-center text-[9px] text-ink-400">
                      {h}
                    </span>
                  )}
                  {v > 0 && (
                    <span className="pointer-events-none absolute -top-6 left-1/2 hidden -translate-x-1/2 rounded bg-fg px-1.5 py-0.5 text-[10px] font-bold text-on-fg group-hover:block">
                      {v}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionHead title="Kategori alat" subtitle="Sebaran transaksi per kategori." />
          {byCategory.length === 0 ? (
            <Empty />
          ) : (
            <div className="space-y-2.5">
              {byCategory.map(([cat, count]) => (
                <div
                  key={cat}
                  className="flex items-center justify-between rounded-xl bg-surface-2 px-4 py-2.5 text-[13px]"
                >
                  <span className="font-semibold text-ink-800">{cat}</span>
                  <span className="rounded-full bg-fg px-2.5 py-0.5 text-[11px] font-bold text-on-fg">
                    {count} transaksi
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <SectionHead
            title="Utilisasi stasiun"
            subtitle="Tingkat keterisian loker & aktivitas per lokasi."
          />
          <div className="space-y-4">
            {stationUtil.map(({ st, pct, loans: n }) => (
              <div key={st.id}>
                <div className="mb-1 flex items-center justify-between text-[13px]">
                  <span className="font-semibold text-ink-800">{st.name}</span>
                  <span className="text-ink-500">{pct}% terisi · {n} transaksi</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-canvas">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-ok-500 to-ok-600 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

function Empty() {
  return (
    <p className="rounded-xl border border-dashed border-line-strong p-8 text-center text-[13px] text-ink-400">
      Belum ada data transaksi untuk dianalisis.
    </p>
  )
}
