# 🔧 FIX: Menambahkan Kolom image_url ke Tabel Products

## Masalah
Error saat upload gambar karena kolom `image_url` belum ada di tabel `products`.

## Solusi
Jalankan SQL migration untuk menambahkan kolom `image_url` dan setup Supabase Storage.

## Cara Menjalankan

### Option 1: Via Supabase Dashboard (Recommended)
1. **Login ke Supabase Dashboard**
2. **Pilih project Anda**
3. **Pergi ke SQL Editor**
4. **Copy-paste script berikut dan klik RUN:**

```sql
-- Add image_url column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create products storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
    'products', 
    'products', 
    true, 
    2097152,  -- 2MB limit
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
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

-- Verify
SELECT 'Migration completed!' as status;
```

### Option 2: Via File (Alternative)
1. Gunakan file `scripts/fix-image-column.sql`
2. Copy isi file ke SQL Editor Supabase
3. Klik RUN

## Verifikasi
Setelah menjalankan script, Anda bisa verify dengan query:

```sql
-- Check if column exists
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'products' 
  AND column_name = 'image_url';

-- Check storage bucket
SELECT * FROM storage.buckets WHERE id = 'products';
```

## Setelah Migration
1. **Restart development server** (Ctrl+C dan npm run dev)
2. **Test upload gambar** di Product Management
3. **Gambar akan tersimpan** di Supabase Storage bucket 'products'

## Troubleshooting

### Jika masih error "duplicate_object":
Policy sudah ada, ini normal. Migration tetap berhasil.

### Jika error "permission denied":
1. Pastikan Anda login sebagai owner project
2. Atau jalankan via Database > SQL Editor dengan role yang tepat

### Jika storage bucket tidak terbuat:
Buat manual via Dashboard:
1. Storage > Buckets
2. New bucket
3. Name: `products`
4. Public: `true`
5. File size limit: `2097152` (2MB)

**Setelah menjalankan migration, fitur upload gambar akan berfungsi normal!** ✅
