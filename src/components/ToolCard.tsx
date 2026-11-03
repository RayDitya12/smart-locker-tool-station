import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { formatRupiah } from '@/lib/format'
import { toolStatusTone } from '@/lib/status'
import type { Station, Tool } from '@/lib/types'

interface ToolCardProps {
  tool: Tool
  station?: Station
}

export function ToolCard({ tool, station }: ToolCardProps) {
  const available = tool.status === 'Tersedia'
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-surface-2 to-signal-50">
        <span className="text-5xl transition-transform duration-300 group-hover:scale-110">
          {tool.icon}
        </span>
        <span className="absolute left-3 top-3 rounded-full bg-surface/85 px-2 py-0.5 font-mono text-[10px] font-bold text-ink-700 backdrop-blur">
          {tool.id}
        </span>
        <span className="absolute right-3 top-3">
          <Badge tone={toolStatusTone(tool.status)} dot>
            {tool.status}
          </Badge>
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-bold text-ink-950">{tool.name}</h3>
          <span className="shrink-0 rounded-md bg-canvas px-2 py-0.5 text-[10px] font-semibold text-ink-500">
            {tool.category}
          </span>
        </div>
        <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-ink-500">
          {tool.description}
        </p>

        {station && (
          <p className="mt-2 flex items-center gap-1 text-[11px] text-ink-400">
            <span>📍</span>
            <span className="truncate">{station.name}</span>
          </p>
        )}

        <div className="mt-3 flex items-end justify-between border-t border-line pt-3">
          <div>
            <span className="block text-[15px] font-extrabold text-ink-950">
              {formatRupiah(tool.pricePerDay)}
            </span>
            <span className="text-[11px] text-ink-400">per hari</span>
          </div>
          <div className="text-right">
            <span className="block text-[11px] text-ink-400">deposit</span>
            <span className="text-[12px] font-bold text-ink-700">
              {formatRupiah(tool.deposit)}
            </span>
          </div>
        </div>

        <Link
          to={available ? `/pinjam/${tool.id}` : '/katalog'}
          aria-disabled={!available}
          className={
            available
              ? 'mt-3.5 inline-flex h-10 items-center justify-center rounded-xl bg-ink-900 text-[13px] font-semibold text-white transition hover:bg-ink-800'
              : 'mt-3.5 inline-flex h-10 cursor-not-allowed items-center justify-center rounded-xl bg-canvas text-[13px] font-semibold text-ink-400'
          }
        >
          {available ? 'Pinjam alat →' : 'Sedang dipinjam'}
        </Link>
      </div>
    </article>
  )
}
