-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Products policies (all authenticated users can read, only creators can modify)
CREATE POLICY "Anyone can view active products" ON public.products
    FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create products" ON public.products
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update own products" ON public.products
    FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own products" ON public.products
    FOR DELETE USING (auth.uid() = created_by);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = cashier_id);

CREATE POLICY "Authenticated users can create transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Transaction items policies
CREATE POLICY "Users can view transaction items" ON public.transaction_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.transactions t
            WHERE t.id = transaction_id AND t.cashier_id = auth.uid()
        )
    );

CREATE POLICY "Users can create transaction items" ON public.transaction_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.transactions t
            WHERE t.id = transaction_id AND t.cashier_id = auth.uid()
        )
    );
