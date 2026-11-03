import { useState } from 'react'
import { PageHead } from '@/components/layout/PageHead'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { formatRupiah } from '@/lib/format'
import { conditionTone, toolStatusTone } from '@/lib/status'
import { useStore } from '@/lib/store'
import type { ToolCondition, ToolStatus } from '@/lib/types'

const conditions: ToolCondition[] = ['Baik', 'Perlu diperiksa', 'Rusak', 'Dalam perbaikan']
const statuses: ToolStatus[] = ['Tersedia', 'Dipinjam', 'Tidak tersedia']

export function AdminInventory() {
  const tools = useStore((s) => s.tools)
  const stations = useStore((s) => s.stations)
  const updateTool = useStore((s) => s.updateTool)
  const addTool = useStore((s) => s.addTool)
  const removeTool = useStore((s) => s.removeTool)
  const pushToast = useStore((s) => s.pushToast)

  const [openAdd, setOpenAdd] = useState(false)
  const [form, setForm] = useState({
    name: '',
    icon: '🧰',
    category: 'Perkakas',
    description: '',
    stationId: stations[0]?.id ?? '',
    pricePerDay: 5000,
    deposit: 20000,
  })

  function submitAdd() {
    if (!form.name.trim()) {
      pushToast('Nama alat wajib diisi.', 'error')
      return
    }
    addTool({
      name: form.name.trim(),
      icon: form.icon || '🧰',
      category: form.category,
      description: form.description.trim(),
      condition: 'Baik',
      stationId: form.stationId,
      pricePerDay: Number(form.pricePerDay) || 0,
      deposit: Number(form.deposit) || 0,
    })
    setOpenAdd(false)
    setForm({ ...form, name: '', description: '' })
  }

  return (
    <div>
      <PageHead
        title="Inventaris alat"
        subtitle={`${tools.length} perkakas terdaftar di semua stasiun.`}
        action={
          <Button size="sm" onClick={() => setOpenAdd(true)}>
            ＋ Tambah alat
          </Button>
        }
      />

      <Card padded={false}>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full min-w-[720px] border-collapse text-[13px]">
            <thead>
              <tr className="border-b border-line bg-surface-2 text-left text-[10px] uppercase tracking-wider text-ink-400">
                <th className="px-5 py-3 font-bold">Alat</th>
                <th className="px-3 py-3 font-bold">Stasiun</th>
                <th className="px-3 py-3 font-bold">Harga/deposit</th>
                <th className="px-3 py-3 font-bold">Kondisi</th>
                <th className="px-3 py-3 font-bold">Status</th>
                <th className="px-5 py-3 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((t) => {
                const st = stations.find((s) => s.id === t.stationId)
                return (
                  <tr key={t.id} className="border-b border-line/70 last:border-0">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-lg bg-canvas text-xl">
                          {t.icon}
                        </span>
                        <div>
                          <p className="font-bold text-ink-950">{t.name}</p>
                          <p className="font-mono text-[11px] text-ink-400">
                            {t.id} · {t.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-ink-600">{st?.name ?? '-'}</td>
                    <td className="px-3 py-3">
                      <p className="font-semibold text-ink-900">
                        {formatRupiah(t.pricePerDay)}
                      </p>
                      <p className="text-[11px] text-ink-400">
                        deposit {formatRupiah(t.deposit)}
                      </p>
                    </td>
                    <td className="px-3 py-3">
                      <Select
                        value={t.condition}
                        onChange={(e) =>
                          updateTool(t.id, {
                            condition: e.target.value as ToolCondition,
                          })
                        }
                        className="!py-1.5 text-[12px]"
                        aria-label={`Kondisi ${t.name}`}
                      >
                        {conditions.map((c) => (
                          <option key={c}>{c}</option>
                        ))}
                      </Select>
                      <Badge tone={conditionTone(t.condition)} className="mt-1.5">
                        {t.condition}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <Select
                        value={t.status}
                        disabled={t.status === 'Dipinjam'}
                        onChange={(e) =>
                          updateTool(t.id, { status: e.target.value as ToolStatus })
                        }
                        className="!py-1.5 text-[12px]"
                        aria-label={`Status ${t.name}`}
                      >
                        {statuses.map((s) => (
                          <option key={s}>{s}</option>
                        ))}
                      </Select>
                      <Badge tone={toolStatusTone(t.status)} className="mt-1.5" dot>
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeTool(t.id)}
                        disabled={t.status === 'Dipinjam'}
                      >
                        Hapus
                      </Button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {tools.length === 0 && (
          <p className="p-10 text-center text-sm text-ink-400">Inventaris kosong.</p>
        )}
      </Card>

      <Modal
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        title="Tambah alat baru"
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpenAdd(false)}>
              Batal
            </Button>
            <Button onClick={submitAdd}>Simpan alat</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama alat" required className="sm:col-span-2">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Contoh: Kunci L set"
            />
          </Field>
          <Field label="Ikon (emoji)">
            <Input
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
            />
          </Field>
          <Field label="Kategori">
            <Input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Perkakas / Kebersihan / Elektronik"
            />
          </Field>
          <Field label="Stasiun penempatan">
            <Select
              value={form.stationId}
              onChange={(e) => setForm({ ...form, stationId: e.target.value })}
            >
              {stations.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Harga/hari (Rp)">
              <Input
                type="number"
                min={0}
                value={form.pricePerDay}
                onChange={(e) =>
                  setForm({ ...form, pricePerDay: Number(e.target.value) })
                }
              />
            </Field>
            <Field label="Deposit (Rp)">
              <Input
                type="number"
                min={0}
                value={form.deposit}
                onChange={(e) => setForm({ ...form, deposit: Number(e.target.value) })}
              />
            </Field>
          </div>
          <Field label="Deskripsi" className="sm:col-span-2">
            <Textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Deskripsi singkat alat"
            />
          </Field>
        </div>
      </Modal>
    </div>
  )
}
