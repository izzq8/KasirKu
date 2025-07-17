-- Migration script to add weight column to existing tables
-- Run this if you already have existing tables

-- Add weight column to products table if it doesn't exist
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS weight TEXT;

-- Add product_weight column to transaction_items table if it doesn't exist
ALTER TABLE public.transaction_items 
ADD COLUMN IF NOT EXISTS product_weight TEXT;

-- Add comment to clarify the purpose of weight column
COMMENT ON COLUMN public.products.weight IS 'Berat/ukuran produk (contoh: "250g", "1kg", "500ml", "L", "XL")';
COMMENT ON COLUMN public.transaction_items.product_weight IS 'Berat/ukuran produk saat transaksi';

-- Optional: Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_products_weight ON public.products(weight);
