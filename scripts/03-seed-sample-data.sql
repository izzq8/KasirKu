-- Insert sample products (these will be available to all users for demo purposes)
-- Note: In production, you might want to create these per user or have a different approach

-- First, let's create a function to generate sample data for any user
CREATE OR REPLACE FUNCTION create_sample_products_for_user(target_user_id UUID)
RETURNS void AS $$
BEGIN
    -- Insert sample products for the specified user
    INSERT INTO public.products (name, weight, price, stock, user_id) VALUES
    ('Beras Premium', '5kg', 75000, 50, target_user_id),
    ('Minyak Goreng', '1L', 25000, 30, target_user_id),
    ('Gula Pasir', '1kg', 15000, 40, target_user_id),
    ('Tepung Terigu', '1kg', 12000, 25, target_user_id),
    ('Kopi Bubuk', '200g', 35000, 20, target_user_id),
    ('Teh Celup', '25 sachet', 18000, 35, target_user_id),
    ('Susu UHT', '1L', 22000, 45, target_user_id),
    ('Telur Ayam', '1kg', 28000, 60, target_user_id),
    ('Daging Sapi', '1kg', 120000, 15, target_user_id),
    ('Ayam Potong', '1kg', 35000, 25, target_user_id),
    ('Ikan Lele', '1kg', 25000, 20, target_user_id),
    ('Cabai Merah', '1kg', 45000, 10, target_user_id),
    ('Bawang Merah', '1kg', 35000, 30, target_user_id),
    ('Bawang Putih', '1kg', 40000, 25, target_user_id),
    ('Tomat', '1kg', 15000, 40, target_user_id)
    ON CONFLICT DO NOTHING;

    -- Insert additional sample products
    INSERT INTO public.products (name, description, price, stock, category, barcode) VALUES
    ('Nasi Putih', 'Nasi putih hangat', 5000, 100, 'Makanan', '1001'),
    ('Ayam Goreng', 'Ayam goreng crispy', 15000, 50, 'Makanan', '1002'),
    ('Es Teh Manis', 'Es teh manis segar', 3000, 200, 'Minuman', '2001'),
    ('Es Jeruk', 'Es jeruk segar', 4000, 150, 'Minuman', '2002'),
    ('Kerupuk', 'Kerupuk udang', 2000, 300, 'Snack', '3001'),
    ('Mie Ayam', 'Mie ayam spesial', 12000, 75, 'Makanan', '1003'),
    ('Bakso', 'Bakso sapi', 10000, 60, 'Makanan', '1004'),
    ('Kopi Hitam', 'Kopi hitam panas', 5000, 100, 'Minuman', '2003'),
    ('Teh Tarik', 'Teh tarik manis', 6000, 80, 'Minuman', '2004'),
    ('Pisang Goreng', 'Pisang goreng crispy', 8000, 40, 'Snack', '3002'),
    ('Sate Ayam', 'Sate ayam 5 tusuk', 18000, 30, 'Makanan', '1005'),
    ('Gado-gado', 'Gado-gado sayuran', 13000, 25, 'Makanan', '1006'),
    ('Jus Alpukat', 'Jus alpukat segar', 8000, 50, 'Minuman', '2005'),
    ('Martabak Manis', 'Martabak manis coklat', 20000, 20, 'Snack', '3003'),
    ('Soto Ayam', 'Soto ayam kuning', 14000, 35, 'Makanan', '1007')
    ON CONFLICT (barcode) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger function to automatically create sample products for new users
CREATE OR REPLACE FUNCTION create_sample_data_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create sample products for the new user
    PERFORM create_sample_products_for_user(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to run when a new user is inserted
DROP TRIGGER IF EXISTS trigger_create_sample_data ON public.users;
CREATE TRIGGER trigger_create_sample_data
    AFTER INSERT ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION create_sample_data_for_new_user();
