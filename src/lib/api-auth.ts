import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { authOptions } from './auth';
import { query } from './db';
import { createHash } from 'crypto';

export async function validateApiKey(req: Request | NextRequest) {
  // Coba API Key dulu
  const apiKey = req.headers.get('x-api-key');

  if (apiKey) {
    // Hash raw key sebelum lookup
    const hashedKey = createHash('sha256').update(apiKey).digest('hex');
    const result = await query(
      `UPDATE api_keys SET last_used_at = NOW()
       WHERE key_hash = $1
       RETURNING user_id`,
      [hashedKey]
    );

    if (result.rows.length === 0) {
      return { error: 'Invalid API Key', status: 401 };
    }

    return { userId: result.rows[0].user_id as string };
  }

  // Fallback: cek session NextAuth
  // getServerSession() tanpa argument membaca cookies dari Next.js request context
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: 'Unauthorized', status: 401 };
  }

  return { userId: session.user.id as string };
}
