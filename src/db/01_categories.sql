-- STEP 1: Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('income', 'expense')) NOT NULL,
    UNIQUE(name, type)
);

-- Enable RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Policy
DROP POLICY IF EXISTS "Enable all access for public categories" ON public.categories;
CREATE POLICY "Enable all access for public categories" ON public.categories
    FOR ALL USING (true) WITH CHECK (true);

-- Initial Data
INSERT INTO public.categories (name, type) VALUES
('Makanan & Minuman', 'expense'),
('Transportasi', 'expense'),
('Belanja', 'expense'),
('Hiburan', 'expense'),
('Tagihan', 'expense'),
('Kesehatan', 'expense'),
('Pendidikan', 'expense'),
('Lainnya', 'expense'),
('Gaji', 'income'),
('Bonus', 'income'),
('Investasi', 'income'),
('Hadiah', 'income'),
('Lainnya', 'income')
ON CONFLICT (name, type) DO NOTHING;
