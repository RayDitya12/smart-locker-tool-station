import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/cn'

const faqs: { q: string; a: string }[] = [
  {
    q: 'Bagaimana cara memulai peminjaman?',
    a: 'Buka katalog, pilih alat berstatus tersedia, lalu isi identitas (nama, NIM, kontak) dan jalankan verifikasi KTM. Setelah memilih durasi dan membayar sewa + deposit, kode akses loker langsung terbit dan kompartemen bisa kamu buka.',
  },
  {
    q: 'Kenapa ada kode akses 6 digit?',
    a: 'Kode akses menggantikan kunci fisik. Kamu memasukkannya di panel loker pintar untuk membuka kompartemen tempat alat disimpan, lalu mengambilnya secara mandiri tanpa bertemu pengelola.',
  },
  {
    q: 'Apa itu deposit dan kapan dikembalikan?',
    a: 'Deposit adalah uang jaminan penuh yang dibayar di awal. Deposit dikembalikan otomatis setelah alat kembali tepat waktu dan tervalidasi sensor dalam kondisi baik. Bila terlambat atau perlu diperiksa, sebagian atau seluruh deposit bisa ditahan sampai admin memverifikasi.',
  },
  {
    q: 'Bagaimana denda keterlambatan dihitung?',
    a: 'Denda berjalan per hari setelah tanggal jatuh tempo, sebesar harga sewa harian alat, dan dipotong dari depositmu (maksimal sebesar deposit). Kembalikan lebih cepat untuk menghindarinya.',
  },
  {
    q: 'Bagaimana kalau alat rusak saat aku pinjam?',
    a: 'Saat mengembalikan, pilih kondisi "Perlu diperiksa" atau "Rusak" dan jelaskan pada kolom laporan. Sistem meneruskan ke antrean verifikasi admin untuk memutuskan pengembalian deposit secara adil.',
  },
  {
    q: 'Apakah bisa memesan alat untuk tanggal depan?',
    a: 'Ya. Pada langkah durasi terdapat kalender ketersediaan 14 hari. Pilih tanggal kosong; sistem menolak jika rentangmu bentrok dengan reservation orang lain.',
  },
]

const policies: { title: string; body: string; icon: string }[] = [
  {
    icon: '🔐',
    title: 'Identitas & jaminan',
    body: 'Hanya mahasiswa aktif dengan KTM terverifikasi. Deposit penuh ditahan selama peminjaman sebagai jaminan fisik alat.',
  },
  {
    icon: '⏱️',
    title: 'Batas waktu',
    body: 'Alat harus kembali sebelum tanggal jatuh tempo. Keterlambatan memicu denda harian yang dipotong dari deposit.',
  },
  {
    icon: '🧼',
    title: 'Kondisi pengembalian',
    body: 'Kembalikan dalam kondisi bersih dan lengkap. Kerusakan atau komponen hilang membuat deposit dapat ditahan sebagian.',
  },
  {
    icon: '🔁',
    title: 'Pengembalian & refund',
    body: 'Deposit yang layak kembali masuk ke dompetmu seketika; kasus perlu diperiksa diputuskan admin dalam antrean verifikasi.',
  },
]

export function Bantuan() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="anim-fade-up text-center">
        <p className="text-4xl">💬</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink-950 sm:text-3xl">
          Bantuan & kebijakan
        </h1>
        <p className="mx-auto mt-1.5 max-w-xl text-sm text-ink-500">
          Pertanyaan umum seputar peminjaman, deposit, denda, dan pengembalian alat
          di Smart Locker Tool Station.
        </p>
      </header>

      <section className="mt-7">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-400">
          Kebijakan deposit
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {policies.map((p) => (
            <Card key={p.title} className="flex gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-canvas text-xl">
                {p.icon}
              </span>
              <div>
                <h3 className="text-[14px] font-bold text-ink-950">{p.title}</h3>
                <p className="mt-1 text-[12.5px] leading-relaxed text-ink-500">{p.body}</p>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-7">
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-ink-400">
          Pertanyaan yang sering muncul
        </h2>
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
          {faqs.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={f.q} className={cn('border-b border-line last:border-0')}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-canvas"
                >
                  <span className="text-[14px] font-bold text-ink-950">{f.q}</span>
                  <span
                    className={cn(
                      'grid h-6 w-6 shrink-0 place-items-center rounded-full bg-canvas text-ink-600 transition-transform duration-200',
                      isOpen && 'rotate-45',
                    )}
                  >
                    ＋
                  </span>
                </button>
                <div
                  className={cn(
                    'grid overflow-hidden px-5 transition-all duration-300',
                    isOpen ? 'grid-rows-[1fr] pb-4 opacity-100' : 'grid-rows-[0fr] opacity-0',
                  )}
                >
                  <p className="min-h-0 text-[13px] leading-relaxed text-ink-500">{f.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <Card className="mt-7 flex flex-wrap items-center justify-between gap-3 bg-surface-2">
        <div>
          <h3 className="text-[14px] font-bold text-ink-950">Masih ada yang belum jelas?</h3>
          <p className="mt-0.5 text-[12.5px] text-ink-500">
            Cek dompet untuk posisi depositmu, atau langsung mulai pinjam.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/dompet">
            <Button variant="outline" size="sm">
              Dompet saya
            </Button>
          </Link>
          <Link to="/katalog">
            <Button size="sm">Pinjam alat →</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}
