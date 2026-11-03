import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function NotFound() {
  return (
    <div className="mx-auto grid max-w-3xl place-items-center px-4 py-24 text-center sm:px-6">
      <p className="font-mono text-6xl font-bold text-line">404</p>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-ink-950">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-2 max-w-md text-sm text-ink-500">
        Tautan yang kamu buka tidak mengarah ke halaman mana pun di Smart Locker Tool
        Station.
      </p>
      <Link to="/" className="mt-6">
        <Button size="lg">← Kembali ke beranda</Button>
      </Link>
    </div>
  )
}
