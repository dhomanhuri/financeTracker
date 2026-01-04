import { createClient } from '@supabase/supabase-js';

// Fallback values are used to prevent build errors when env vars are not set yet.
// The user must provide valid credentials in .env.local for the app to work.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
