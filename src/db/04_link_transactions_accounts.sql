-- STEP 4: Link transactions to accounts
ALTER TABLE public.transactions 
ADD COLUMN IF NOT EXISTS account_id UUID REFERENCES public.accounts(id) ON DELETE SET NULL;

-- If we want to force every transaction to have an account later, 
-- we can set a default account or leave it nullable for now to avoid breaking existing data.
