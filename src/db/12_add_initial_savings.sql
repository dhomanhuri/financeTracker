-- STEP 12: Add initial_savings to financial_freedom_entries
ALTER TABLE public.financial_freedom_entries ADD COLUMN IF NOT EXISTS initial_savings NUMERIC DEFAULT 0;
