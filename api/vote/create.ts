import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

function randomId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    // Fallback: generate a local vote ID (no persistence)
    const id = randomId();
    return res.status(200).json({ voteId: id, fallback: true });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { title, options, creatorName } = req.body as {
      title: string;
      options: { name: string; image: string; rating: number; dist: string; placeId?: string }[];
      creatorName: string;
    };

    if (!options || options.length < 2) {
      return res.status(400).json({ error: 'At least 2 options required' });
    }

    const voteId = randomId();

    const { error } = await supabase.from('votes').insert({
      vote_id: voteId,
      title: title || '今天吃什麼？',
      creator_name: creatorName || '匿名',
      options: JSON.stringify(options),
      votes: JSON.stringify({}), // { optionIndex: [voterNames] }
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    });

    if (error) throw error;

    return res.status(200).json({ voteId });
  } catch (error) {
    console.error('Vote create error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
