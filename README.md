# KasirKu - Sistem Kasir Modern

KasirKu adalah sistem kasir modern yang dibangun dengan Next.js dan Supabase, dirancang untuk memudahkan pengelolaan penjualan dan inventori bisnis retail.

## ✨ Fitur Utama

- **Dashboard Komprehensif**: Visualisasi data penjualan dan metrik bisnis
- **Sistem POS**: Interface point of sale yang intuitif dan responsif
- **Manajemen Produk**: Kelola produk dengan mudah termasuk import dari Excel
- **Riwayat Transaksi**: Lacak semua transaksi dengan detail lengkap
- **Laporan Penjualan**: Generate laporan komprehensif untuk analisis bisnis
- **Autentikasi**: Sistem login yang aman dengan Supabase Auth
- **Responsif**: Desain yang optimal untuk desktop dan mobile
- **Dark Mode**: Tema gelap dan terang sesuai preferensi

## 🚀 Teknologi yang Digunakan

- **Framework**: Next.js 15 dengan App Router
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + shadcn/ui
- **TypeScript**: Full type safety
- **Authentication**: Supabase Auth
- **State Management**: React Hooks
- **Charts**: Recharts untuk visualisasi data

## 📋 Prasyarat

Pastikan Anda memiliki:
- Node.js 18 atau lebih baru
- pnpm (package manager)
- Akun Supabase

## 🛠️ Instalasi

1. **Clone repository**
   ```bash
   git clone https://github.com/izzq8/KasirKu.git
   cd KasirKu
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Setup environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Kemudian isi variabel environment di `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Setup database**
   
   Jalankan script SQL yang tersedia di folder `scripts/` pada Supabase SQL Editor:
   ```sql
   -- Jalankan secara berurutan:
   -- 1. scripts/01-create-tables.sql
   -- 2. scripts/02-setup-rls.sql
   -- 3. scripts/03-seed-sample-data.sql
   -- 4. scripts/04-add-weight-column.sql
   ```

5. **Jalankan aplikasi**
   ```bash
   pnpm dev
   ```

   Aplikasi akan berjalan di `http://localhost:3000`

## 📱 Penggunaan

### Setup Awal
1. Buka aplikasi dan buat akun atau login
2. Lakukan setup database pada halaman setup
3. Import produk dari Excel atau tambah manual

### Mengelola Produk
- Gunakan halaman Product Management untuk menambah/edit produk
- Import produk dalam jumlah besar menggunakan Excel
- Kelola kategori dan harga produk

### Transaksi POS
- Akses POS interface untuk melakukan transaksi
- Scan barcode atau cari produk manual
- Proses pembayaran dan print struk

### Laporan & Analytics
- Lihat dashboard untuk overview bisnis
- Generate laporan penjualan harian/bulanan
- Analisis performa produk terlaris

## 🗂️ Struktur Proyek

```
├── app/                    # Next.js App Router
│   ├── auth/              # Authentication routes
│   ├── setup/             # Setup page
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── dashboard-home.tsx
│   ├── pos-interface.tsx
│   └── ...
├── lib/                   # Utility functions
│   ├── supabase.ts       # Supabase client
│   └── utils.ts          # Helper functions
├── scripts/              # Database scripts
│   ├── 01-create-tables.sql
│   ├── 02-setup-rls.sql
│   └── ...
└── styles/               # Global styles
```

## 🔐 Keamanan

- Menggunakan Row Level Security (RLS) di Supabase
- Autentikasi berbasis JWT
- Validasi input pada client dan server
- Environment variables untuk kredensial sensitif

## 📊 Database Schema

Aplikasi menggunakan beberapa tabel utama:
- `users`: Data pengguna
- `products`: Informasi produk
- `transactions`: Transaksi penjualan
- `transaction_items`: Item dalam transaksi

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan:
1. Fork repository
2. Buat branch fitur (`git checkout -b feature/amazing-feature`)
3. Commit perubahan (`git commit -m 'Add amazing feature'`)
4. Push ke branch (`git push origin feature/amazing-feature`)
5. Buka Pull Request

## 📝 Lisensi

Proyek ini menggunakan lisensi MIT. Lihat file `LICENSE` untuk detail.

## 🐛 Bug Report & Feature Request

Jika menemukan bug atau ingin request fitur baru, silakan buat issue di GitHub repository.

## 📞 Support

Untuk pertanyaan dan dukungan:
- Email: [your-email@example.com]
- GitHub Issues: [https://github.com/izzq8/KasirKu/issues]

---

Dibuat dengan ❤️ untuk komunitas developer Indonesia
