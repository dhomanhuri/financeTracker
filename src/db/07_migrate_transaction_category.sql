-- STEP 7: Migrate category text to category_id
-- 1. Add category_id column
ALTER TABLE public.transactions ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id);

-- 2. Migrate existing data (Optional but good if there is data)
-- This assumes the 'category' text matches 'name' in public.categories
UPDATE public.transactions t
SET category_id = c.id
FROM public.categories c
WHERE t.category = c.name AND t.type = c.type;

-- 3. Make category_id NOT NULL after migration
ALTER TABLE public.transactions ALTER COLUMN category_id SET NOT NULL;

-- 4. Drop the old category column
ALTER TABLE public.transactions DROP COLUMN category;

-- 5. Add index for performance
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);
