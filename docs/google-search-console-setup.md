# Google Search Console Setup Guide

## Step 1: Verifikasi Domain
1. Buka https://search.google.com/search-console/
2. Tambahkan property dengan URL website Anda
3. Pilih metode verifikasi:
   - **HTML meta tag** (recommended)
   - DNS record
   - HTML file upload

## Step 2: Update Verification Code
Setelah mendapat verification code dari Google Search Console, update di layout.tsx:

```typescript
verification: {
  google: "your-actual-verification-code-here", // Ganti dengan kode dari Google
},
```

## Step 3: Submit Sitemap
1. Di Google Search Console, pilih "Sitemaps"
2. Submit URL sitemap: `https://your-domain.com/sitemap.xml`
3. Submit URL robots: `https://your-domain.com/robots.txt`

## Step 4: Request Indexing
1. Pilih "URL Inspection"
2. Masukkan URL homepage
3. Klik "Request Indexing"
4. Ulangi untuk halaman penting lainnya

## Monitor Results
- Check "Coverage" untuk melihat halaman yang berhasil diindex
- Monitor "Performance" untuk melihat impression dan clicks
- Review "Enhancements" untuk mobile usability issues
