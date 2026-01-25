-- STEP 10: Create financial freedom entries table
CREATE TABLE IF NOT EXISTS public.financial_freedom_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    monthly_savings NUMERIC NOT NULL DEFAULT 0,
    annual_savings NUMERIC NOT NULL DEFAULT 0,
    return_rate NUMERIC NOT NULL DEFAULT 0,
    monthly_expenses NUMERIC NOT NULL DEFAULT 0,
    annual_expenses NUMERIC NOT NULL DEFAULT 0,
    monthly_income NUMERIC DEFAULT 0,
    dependents INTEGER DEFAULT 0,
    target_amount NUMERIC DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.financial_freedom_entries ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can only access their own entries" ON public.financial_freedom_entries;
CREATE POLICY "Users can only access their own entries" ON public.financial_freedom_entries
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
