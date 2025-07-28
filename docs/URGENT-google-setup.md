# IMMEDIATE: Google Search Console Setup

## 🚨 LANGKAH URGENT (Lakukan SEKARANG):

### 1. Buka Google Search Console
👉 **URL**: https://search.google.com/search-console/

### 2. Add Property
- Klik "Add Property"
- Pilih "URL prefix"
- Masukkan: `https://kasirku.vercel.app`
- Klik "Continue"

### 3. Verify Ownership (Pilih HTML tag method)
Google akan memberikan meta tag seperti:
```html
<meta name="google-site-verification" content="abc123xyz789" />
```

### 4. UPDATE Layout.tsx dengan Verification Code
Edit file: `app/layout.tsx`
Cari baris:
```typescript
verification: {
  google: "your-google-site-verification-code", // Ganti dengan kode dari Google
},
```

Ganti dengan kode yang diberikan Google (hanya bagian content):
```typescript
verification: {
  google: "abc123xyz789", // Kode dari Google
},
```

### 5. Deploy Ulang
- Commit changes ke GitHub
- Vercel akan auto-deploy
- Tunggu 2-3 menit

### 6. Verify di Google Search Console
- Kembali ke Google Search Console
- Klik "Verify"
- Jika berhasil, lanjut ke langkah berikutnya

### 7. Submit Sitemap
- Di Google Search Console, pilih "Sitemaps"
- Add new sitemap: `https://kasirku.vercel.app/sitemap.xml`
- Submit

### 8. Request Indexing untuk Halaman Utama
- Pilih "URL Inspection"
- Masukkan: `https://kasirku.vercel.app`
- Klik "Request Indexing"

## ✅ HASIL YANG DIHARAPKAN:
- Website terverifikasi di Google Search Console
- Sitemap submitted dan accepted
- Halaman utama di-request untuk indexing
- Dalam 24-48 jam akan mulai muncul di Google

## 📊 MONITOR:
- Coverage: Berapa halaman yang ter-index
- Performance: Impression dan clicks dari Google
- Enhancements: Mobile usability issues
