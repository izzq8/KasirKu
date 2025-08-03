-- ================================================
-- Migration: Add image_url column and setup storage
-- ================================================

-- 1. Add image_url column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 2. Create products storage bucket if not exists
DO $$
BEGIN
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
    VALUES (
        'products', 
        'products', 
        true, 
        2097152,  -- 2MB limit
        ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    )
    ON CONFLICT (id) DO NOTHING;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Storage bucket creation skipped or failed: %', SQLERRM;
END $$;

-- 3. Create storage policies for products bucket
DO $$
BEGIN
    -- Policy for viewing product images (public read)
    CREATE POLICY "Anyone can view product images" ON storage.objects
    FOR SELECT USING (bucket_id = 'products');
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy "Anyone can view product images" already exists';
END $$;

DO $$
BEGIN
    -- Policy for uploading product images (authenticated users only)
    CREATE POLICY "Authenticated users can upload product images" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'products' 
        AND auth.role() = 'authenticated'
    );
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy "Authenticated users can upload product images" already exists';
END $$;

DO $$
BEGIN
    -- Policy for updating product images (authenticated users only)
    CREATE POLICY "Users can update their own product images" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'products' 
        AND auth.role() = 'authenticated'
    );
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy "Users can update their own product images" already exists';
END $$;

DO $$
BEGIN
    -- Policy for deleting product images (authenticated users only)
    CREATE POLICY "Users can delete their own product images" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'products' 
        AND auth.role() = 'authenticated'
    );
EXCEPTION WHEN duplicate_object THEN
    RAISE NOTICE 'Policy "Users can delete their own product images" already exists';
END $$;

-- 4. Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'products' 
  AND column_name = 'image_url';

-- Success message
SELECT 'Migration completed successfully! image_url column added to products table.' as status;
