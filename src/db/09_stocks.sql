
-- STEP 9: Create stocks table
CREATE TABLE IF NOT EXISTS public.stocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    symbol TEXT NOT NULL,
    lots NUMERIC NOT NULL,
    buy_price NUMERIC NOT NULL,
    CONSTRAINT stocks_user_id_symbol_key UNIQUE (user_id, symbol)
);

-- Enable RLS
ALTER TABLE public.stocks ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can only access their own stocks" ON public.stocks;
CREATE POLICY "Users can only access their own stocks" ON public.stocks
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
