# Panduan Import Excel - Master Data Produk

## Format File Excel

File Excel harus memiliki format sebagai berikut:

### Struktur Kolom
| Kolom A | Kolom B | Kolom C | Kolom D |
|---------|---------|---------|---------|
| Nama Produk | Berat/Ukuran | Harga | Stok |

### Contoh Data
\`\`\`
Nama Produk     | Berat/Ukuran | Harga  | Stok
Beras Premium   | 5kg          | 75000  | 50
Minyak Goreng   | 1L           | 15000  | 30
Gula Pasir      | 1kg          | 12000  | 25
Tepung Terigu   | 1kg          | 8000   | 40
\`\`\`

## Aturan Validasi

### Data Valid
- **Nama Produk**: Tidak boleh kosong
- **Berat/Ukuran**: Tidak boleh kosong (contoh: 1kg, 500ml, 1pcs)
- **Harga**: Harus angka dan lebih dari 0
- **Stok**: Harus angka dan tidak boleh negatif

### Data Invalid
Data akan ditandai sebagai invalid jika:
- Nama produk kosong
- Berat/ukuran kosong
- Harga 0 atau negatif
- Stok negatif

## Cara Menggunakan

### 1. Download Template
1. Klik tombol **"Template Excel"** untuk download template kosong
2. Isi template dengan data produk Anda
3. Simpan file dalam format .xlsx atau .xls

### 2. Import Data
1. Klik tombol **"Import Excel"**
2. Pilih file Excel yang sudah diisi
3. Sistem akan menampilkan preview data
4. Periksa status validasi setiap data
5. Klik **"Import X Data Valid"** untuk mengimport

### 3. Preview Import
- **Badge Hijau**: Data valid dan siap diimport
- **Badge Merah**: Data invalid dengan keterangan error
- Hanya data valid yang akan diimport ke database

## Tips & Troubleshooting

### Format Data
- Pastikan kolom harga berisi angka, bukan teks
- Gunakan format angka untuk kolom stok
- Hindari karakter khusus dalam nama produk

### Error Umum
- **"Nama produk tidak boleh kosong"**: Isi kolom A dengan nama produk
- **"Harga harus lebih dari 0"**: Pastikan kolom C berisi angka positif
- **"Stok tidak boleh negatif"**: Pastikan kolom D berisi angka 0 atau positif

### Batasan
- Maksimal 1000 produk per import
- File maksimal 5MB
- Format yang didukung: .xlsx, .xls

## Contoh Template

Anda dapat mendownload template Excel yang sudah berisi contoh data dengan mengklik tombol "Template Excel" di halaman Master Data Produk.
