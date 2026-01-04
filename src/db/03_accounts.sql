-- STEP 3: Create accounts table
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    balance NUMERIC DEFAULT 0 NOT NULL,
    color TEXT DEFAULT '#3b82f6' NOT NULL, -- Default blue
    icon TEXT DEFAULT 'Wallet' NOT NULL,
    UNIQUE(name)
);

-- Enable RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Policy
DROP POLICY IF EXISTS "Enable all access for public accounts" ON public.accounts;
CREATE POLICY "Enable all access for public accounts" ON public.accounts
    FOR ALL USING (true) WITH CHECK (true);

-- Initial Data
INSERT INTO public.accounts (name, balance, color, icon) VALUES
('Cash', 0, '#10b981', 'Banknote'),
('Bank Mandiri', 0, '#3b82f6', 'Building2'),
('E-Wallet', 0, '#f59e0b', 'Smartphone')
ON CONFLICT (name) DO NOTHING;
