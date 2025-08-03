# Setup Fitur Upload Gambar Produk

## Database Migration

Jalankan script SQL berikut untuk menambahkan kolom image_url dan setup Supabase Storage:

```sql
-- 1. Tambah kolom image_url ke tabel products
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Create products storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Create storage policies for products bucket
CREATE POLICY "Anyone can view product images" ON storage.objects
FOR SELECT USING (bucket_id = 'products');

CREATE POLICY "Authenticated users can upload product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own product images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their own product images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'products' 
  AND auth.role() = 'authenticated'
);
```

## Cara Menjalankan Setup

1. **Via Supabase Dashboard:**
   - Login ke dashboard Supabase
   - Pergi ke SQL Editor
   - Copy-paste script di atas dan jalankan

2. **Via Script (Recommended):**
   ```bash
   # Jalankan script migration
   npm run setup:db
   ```

## Fitur yang Ditambahkan

### ✅ Product Management
- **Upload gambar produk** (JPG, PNG, WebP, max 2MB)
- **Preview gambar** di form add/edit
- **Display gambar** di product list (mobile card + desktop table)
- **Hapus gambar** dengan tombol X di corner
- **Validation** ukuran dan format file

### ✅ POS Interface  
- **Display gambar produk** di product grid
- **Responsive image** (24px mobile, 32px desktop)
- **Fallback**: Tidak ada placeholder jika gambar kosong

### ✅ Image Handling
- **Supabase Storage integration** 
- **Automatic cleanup** saat delete/update produk
- **Error handling** untuk upload failures
- **Loading states** saat upload/delete

## Cara Menggunakan

### Tambah Produk dengan Gambar
1. Klik "Tambah Produk" di Product Management
2. Isi data produk (nama, weight, harga, stok)
3. Klik "Pilih Gambar" untuk upload (opsional)
4. Preview gambar akan muncul
5. Klik "Tambah" untuk simpan

### Edit Gambar Produk
1. Klik tombol Edit di produk yang ada
2. Gambar existing akan ditampilkan (jika ada)
3. Klik "Ganti Gambar" untuk upload baru
4. Atau klik tombol X untuk hapus gambar existing
5. Klik "Update" untuk simpan

### Lihat Produk di POS
1. Buka halaman Transaksi/POS
2. Produk dengan gambar akan menampilkan thumbnail
3. Produk tanpa gambar akan kosong (no placeholder)

## Struktur File

```
lib/
  ├── imageUtils.ts         # Utility functions untuk image handling
  └── supabase.ts          # Updated Product interface

components/
  ├── product-management.tsx # Updated dengan image upload
  └── pos-interface.tsx     # Updated dengan image display

scripts/
  └── 05-add-product-image.sql # Database migration script
```

## Notes
- Gambar disimpan di Supabase Storage bucket `products`
- Image URL disimpan di kolom `image_url` tabel products  
- Gambar bersifat **opsional** - produk bisa tanpa gambar
- Auto cleanup: gambar lama dihapus saat upload baru
- Validation: Max 2MB, format JPG/PNG/WebP
- **No placeholder** jika produk tidak ada gambar
