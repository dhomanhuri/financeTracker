import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { query } from './db';

export async function validateApiKey(req: Request) {
  // Coba API Key dulu (untuk external/programmatic access)
  const apiKey = req.headers.get('x-api-key');

  if (apiKey) {
    const result = await query(
      `UPDATE api_keys SET last_used_at = NOW()
       WHERE key_hash = $1
       RETURNING user_id`,
      [apiKey]
    );

    if (result.rows.length === 0) {
      return { error: 'Invalid API Key', status: 401 };
    }

    return { userId: result.rows[0].user_id as string };
  }

  // Fallback: cek session NextAuth
  // Passing req & res tidak tersedia di App Router, 
  // getServerSession() tanpa arg membaca cookies() dari Next.js context
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: 'Unauthorized', status: 401 };
  }

  return { userId: session.user.id as string };
}
