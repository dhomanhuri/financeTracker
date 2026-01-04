-- STEP 5: Update tables to support multi-user with RLS
-- 1. Add user_id to categories
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
-- 2. Add user_id to accounts
ALTER TABLE public.accounts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();
-- 3. Add user_id to transactions
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) DEFAULT auth.uid();

-- Update Policies for Categories
DROP POLICY IF EXISTS "Enable all access for public categories" ON public.categories;
CREATE POLICY "Users can only access their own categories" ON public.categories
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Update Policies for Accounts
DROP POLICY IF EXISTS "Enable all access for public accounts" ON public.accounts;
CREATE POLICY "Users can only access their own accounts" ON public.accounts
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Update Policies for Transactions
DROP POLICY IF EXISTS "Enable all access for public" ON public.transactions;
CREATE POLICY "Users can only access their own transactions" ON public.transactions
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
