-- Create API Keys table
CREATE TABLE IF NOT EXISTS public.api_keys (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    key_hash TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    last_used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Policies for api_keys
CREATE POLICY "Users can manage their own API keys" ON public.api_keys
    FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Index for faster lookup
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);

-- Function to validate API key and get user_id
-- This can be used by the server-side with service_role to verify keys
CREATE OR REPLACE FUNCTION public.verify_api_key(key_to_check TEXT)
RETURNS TABLE (authorized_user_id UUID) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    UPDATE public.api_keys
    SET last_used_at = NOW()
    WHERE key_hash = key_to_check
    RETURNING user_id;
END;
$$;
