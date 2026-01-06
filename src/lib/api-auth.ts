import { supabaseAdmin } from './supabase-admin';
import { createClient } from '@supabase/supabase-js';

export async function validateApiKey(req: Request) {
  const apiKey = req.headers.get('x-api-key');

  if (!apiKey) {
    return { error: 'Missing API Key', status: 401 };
  }

  // Use the RPC function we created in SQL
  const { data, error } = await supabaseAdmin.rpc('verify_api_key', {
    key_to_check: apiKey
  });

  if (error || !data || data.length === 0) {
    console.error('API Key validation error:', error);
    return { error: 'Invalid API Key', status: 401 };
  }

  const userId = data[0].authorized_user_id;

  // Create a specialized supabase client for this user
  // Since we don't have a user JWT, we'll use the admin client 
  // but manually filter by user_id in our queries, 
  // OR we can try to use the service role key to act as that user.
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  const userClient = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return { userId, userClient };
}
