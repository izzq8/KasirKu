# 📏 Weight/Size Feature Implementation

## Overview
Fitur berat/ukuran telah ditambahkan ke sistem KasirKu untuk membantu membedakan produk dengan nama yang sama tetapi memiliki ukuran/berat yang berbeda.

## Database Changes

### 1. Products Table
Ditambahkan kolom `weight` (TEXT) untuk menyimpan informasi berat/ukuran produk.

```sql
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS weight TEXT;
```

### 2. Transaction Items Table
Ditambahkan kolom `product_weight` (TEXT) untuk menyimpan informasi berat/ukuran saat transaksi.

```sql
ALTER TABLE public.transaction_items 
ADD COLUMN IF NOT EXISTS product_weight TEXT;
```

## Usage Examples

### Contoh Format Berat/Ukuran:
- **Makanan/Minuman**: `250g`, `1kg`, `500ml`, `1L`, `2L`
- **Pakaian**: `S`, `M`, `L`, `XL`, `XXL`
- **Elektronik**: `32"`, `55"`, `65"`
- **Obat**: `100mg`, `250mg`, `500mg`
- **Umum**: `1 pcs`, `1 pak`, `1 dus`

### Contoh Produk dengan Nama Sama:
```
Coca Cola - 250ml - Rp 5.000
Coca Cola - 500ml - Rp 8.000
Coca Cola - 1L - Rp 12.000
```

## Implementation Details

### 1. Product Management
- ✅ Form input untuk weight/ukuran
- ✅ Validation: field weight wajib diisi
- ✅ Mobile view: menampilkan weight di bawah nama produk
- ✅ Desktop view: kolom terpisah untuk weight
- ✅ Duplikasi check: nama + weight kombinasi harus unik

### 2. POS Interface
- ✅ Product grid: menampilkan weight di bawah nama produk
- ✅ Shopping cart: menampilkan weight untuk setiap item
- ✅ Transaction saving: menyimpan product_weight ke database

### 3. Receipt/Struk
- ✅ Digital receipt: menampilkan weight untuk setiap item
- ✅ Format: `Nama Produk` + `Weight` + `Quantity x Price`

### 4. Transaction History
- ✅ Riwayat transaksi akan menampilkan weight untuk setiap item
- ✅ Data tersimpan di `transaction_items.product_weight`

## Code Changes

### TypeScript Interfaces
```typescript
export type Product = {
  id: string
  name: string
  weight?: string // Berat/ukuran produk
  price: number
  stock: number
  // ... other fields
}

interface CartItem extends Product {
  quantity: number
}
```

### Form Validation
```typescript
if (!formData.name.trim() || !formData.weight.trim() || !formData.price || !formData.stock) {
  toast({
    title: "Error",
    description: "Semua field wajib diisi",
    variant: "destructive",
  })
  return
}
```

### Database Operations
```typescript
// Create product
const { error } = await supabase.from("products").insert([
  {
    name: formData.name.trim(),
    weight: formData.weight.trim(),
    price: price,
    stock: stock,
    user_id: currentUserId,
  },
])

// Save transaction item
const transactionItems = cart.map((item) => ({
  transaction_id: insertedTransaction.id,
  product_id: item.id,
  product_name: item.name,
  product_weight: item.weight || null,
  price: item.price,
  quantity: item.quantity,
  subtotal: item.price * item.quantity,
}))
```

## Migration Instructions

### For New Installations
SQL schema sudah include kolom weight. Jalankan `01-create-tables.sql` seperti biasa.

### For Existing Installations
Jalankan migration script:

```bash
# Option 1: Run TypeScript migration
npx tsx scripts/run-weight-migration.ts

# Option 2: Run SQL migration manually
psql -h your-host -U your-user -d your-db -f scripts/04-add-weight-column.sql
```

### Supabase Dashboard
Atau jalankan manual di Supabase SQL Editor:
```sql
-- Add weight column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS weight TEXT;

-- Add product_weight column to transaction_items table
ALTER TABLE public.transaction_items 
ADD COLUMN IF NOT EXISTS product_weight TEXT;
```

## User Experience

### Before (Confusing):
```
Coca Cola - Rp 5.000
Coca Cola - Rp 8.000
Coca Cola - Rp 12.000
```

### After (Clear):
```
Coca Cola
250ml
Rp 5.000

Coca Cola
500ml
Rp 8.000

Coca Cola
1L
Rp 12.000
```

## Best Practices

### 1. Consistent Format
- Gunakan format yang konsisten untuk kategori produk yang sama
- Contoh: semua minuman menggunakan "ml" atau "L"

### 2. User-Friendly
- Gunakan satuan yang familiar untuk pengguna
- Hindari kode yang tidak jelas

### 3. Validation
- Pastikan weight tidak kosong
- Validasi format jika diperlukan

### 4. Display
- Tampilkan weight dengan font yang lebih kecil dari nama produk
- Gunakan warna yang lebih muted untuk weight

## Testing

### Test Cases
1. ✅ Create product dengan weight
2. ✅ Create product dengan nama sama, weight berbeda
3. ✅ Edit product weight
4. ✅ Delete product
5. ✅ Add to cart dengan weight
6. ✅ Process transaction dengan weight
7. ✅ View receipt dengan weight
8. ✅ View transaction history dengan weight

### Mobile Testing
1. ✅ Product form responsive
2. ✅ Product list mobile view
3. ✅ Cart mobile view
4. ✅ Receipt mobile view

## Future Enhancements

1. **Weight-based Search**: Filter produk berdasarkan weight
2. **Weight Categories**: Dropdown untuk kategori weight yang common
3. **Weight Validation**: Validasi format weight berdasarkan kategori
4. **Weight Conversion**: Konversi otomatis antar satuan
5. **Barcode Integration**: Include weight di barcode system
