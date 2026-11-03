import { HashRouter, Route, Routes } from 'react-router-dom'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { UserLayout } from '@/components/layout/UserLayout'
import { Toaster } from '@/components/ui/Toaster'
import { AdminAnalytics } from '@/pages/admin/AdminAnalytics'
import { AdminInventory } from '@/pages/admin/AdminInventory'
import { AdminLockers } from '@/pages/admin/AdminLockers'
import { AdminOverview } from '@/pages/admin/AdminOverview'
import { AdminReturns } from '@/pages/admin/AdminReturns'
import { AdminTransactions } from '@/pages/admin/AdminTransactions'
import { NotFound } from '@/pages/NotFound'
import { Borrow } from '@/pages/user/Borrow'
import { Catalog } from '@/pages/user/Catalog'
import { Landing } from '@/pages/user/Landing'
import { Rentals } from '@/pages/user/Rentals'
import { Return } from '@/pages/user/Return'
import { StationDetail } from '@/pages/user/StationDetail'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<UserLayout />}>
          <Route index element={<Landing />} />
          <Route path="katalog" element={<Catalog />} />
          <Route path="stasiun/:id" element={<StationDetail />} />
          <Route path="pinjam" element={<Borrow />} />
          <Route path="pinjam/:toolId" element={<Borrow />} />
          <Route path="pinjaman" element={<Rentals />} />
          <Route path="kembalikan" element={<Return />} />
          <Route path="kembalikan/:loanId" element={<Return />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<AdminOverview />} />
          <Route path="inventaris" element={<AdminInventory />} />
          <Route path="loker" element={<AdminLockers />} />
          <Route path="transaksi" element={<AdminTransactions />} />
          <Route path="verifikasi" element={<AdminReturns />} />
          <Route path="analitik" element={<AdminAnalytics />} />
        </Route>
      </Routes>
      <Toaster />
    </HashRouter>
  )
}
