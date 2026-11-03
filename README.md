# Smart Locker Tool Station

Layanan berbagi perkakas berbasis loker pintar untuk mahasiswa rantau. Pinjam perkakas yang jarang dipakai (bor, tangga, setrika, dll.) dari stasiun loker terdekat, buka dengan kode akses, dan kembalikan dengan verifikasi sensor.

Proyek untuk mata kuliah **Manajemen Inovasi**. Seluruh alur perangkat keras (loker, PIN akses, sensor RFID/berat, pembayaran e-wallet) **disimulasikan** di sisi klien — tidak ada backend, data tersimpan di `localStorage` perangkat.

## Fitur

**Aplikasi pengguna**
- Katalog perkakas dengan pencarian & filter (stasiun, kategori, ketersediaan)
- Denah loker tiap stasiun
- Wizard peminjaman: verifikasi identitas (KTM) → pilih durasi → bayar e-wallet → terbit kode akses
- Pengembalian dengan simulasi pemindaian sensor dan penilaian kondisi alat
- Riwayat peminjaman per pengguna

**Dashboard pengelola** (PIN demo: `2024`)
- Ringkasan operasional real-time
- Manajemen inventaris alat (tambah, ubah kondisi/status, hapus)
- Denah loker & isi kompartemen
- Daftar transaksi dengan filter status
- Antrean verifikasi pengembalian + keputusan deposit
- Analitik: alat terlaris, jam sibuk, kategori, utilisasi stasiun

## Teknologi

- [Vite](https://vite.dev) 8 + [React](https://react.dev) 19 + TypeScript 7
- [Tailwind CSS](https://tailwindcss.com) v4
- [React Router](https://reactrouter.com) 7 (HashRouter)
- [Zustand](https://zustand.docs.pmnd.rs) 5 (state + persist ke localStorage)

## Menjalankan

```bash
npm install
npm run dev      # server pengembangan
npm run build    # build produksi ke dist/
npm run preview  # pratinjau hasil build
```

## Reset data demo

Data tersimpan di `localStorage` (kunci `slt-store-v1`). Untuk mengembalikan ke kondisi awal, gunakan tombol **Reset data demo** di sidebar dashboard pengelola.
