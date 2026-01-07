-- STEP 8: Fix RLS Policies for API access
-- The previous policies relied on auth.uid() which is null when using service_role via API Key.
-- We need to allow access if the user_id matches, and service_role already bypasses the "USING" part 
-- but "WITH CHECK" can still fail if it's explicitly checking auth.uid().

-- Update Policies for Categories
DROP POLICY IF EXISTS "Users can only access their own categories" ON public.categories;
CREATE POLICY "Users can only access their own categories" ON public.categories
    FOR ALL USING (
        auth.uid() = user_id 
        OR 
        (auth.uid() IS NULL AND user_id IS NOT NULL)
    ) 
    WITH CHECK (
        auth.uid() = user_id 
        OR 
        (auth.uid() IS NULL AND user_id IS NOT NULL)
    );

-- Update Policies for Accounts
DROP POLICY IF EXISTS "Users can only access their own accounts" ON public.accounts;
CREATE POLICY "Users can only access their own accounts" ON public.accounts
    FOR ALL USING (
        auth.uid() = user_id 
        OR 
        (auth.uid() IS NULL AND user_id IS NOT NULL)
    ) 
    WITH CHECK (
        auth.uid() = user_id 
        OR 
        (auth.uid() IS NULL AND user_id IS NOT NULL)
    );

-- Update Policies for Transactions
DROP POLICY IF EXISTS "Users can only access their own transactions" ON public.transactions;
CREATE POLICY "Users can only access their own transactions" ON public.transactions
    FOR ALL USING (
        auth.uid() = user_id 
        OR 
        (auth.uid() IS NULL AND user_id IS NOT NULL)
    ) 
    WITH CHECK (
        auth.uid() = user_id 
        OR 
        (auth.uid() IS NULL AND user_id IS NOT NULL)
    );
