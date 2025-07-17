-- Insert sample products
INSERT INTO public.products (name, weight, price, stock) VALUES
('Beras Premium', '5kg', 75000, 50),
('Minyak Goreng', '1L', 18000, 30),
('Gula Pasir', '1kg', 15000, 40),
('Telur Ayam', '1kg', 28000, 25),
('Susu UHT', '1L', 12000, 60),
('Roti Tawar', '400g', 8000, 20),
('Kopi Bubuk', '200g', 25000, 15),
('Teh Celup', '25 sachet', 10000, 35),
('Sabun Mandi', '85g', 3500, 100),
('Pasta Gigi', '120g', 8500, 45),
('Shampoo', '170ml', 15000, 30),
('Deterjen', '800g', 12000, 25),
('Tissue', '250 lembar', 6000, 80),
('Air Mineral', '600ml', 3000, 120),
('Snack Keripik', '68g', 5000, 90)
ON CONFLICT (name) DO NOTHING;
