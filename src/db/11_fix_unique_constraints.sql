-- STEP 11: Fix unique constraints for multi-user support

-- 1. Fix Accounts Table
-- Remove old unique constraint on (name)
ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS accounts_name_key;

-- Add new unique constraint on (user_id, name)
ALTER TABLE public.accounts ADD CONSTRAINT accounts_user_id_name_key UNIQUE (user_id, name);


-- 2. Fix Categories Table
-- Remove old unique constraint on (name, type)
ALTER TABLE public.categories DROP CONSTRAINT IF EXISTS categories_name_type_key;

-- Add new unique constraint on (user_id, name, type)
ALTER TABLE public.categories ADD CONSTRAINT categories_user_id_name_type_key UNIQUE (user_id, name, type);
