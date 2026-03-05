import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Vote ID required' });
  }

  if (req.method === 'GET') {
    // Get vote details
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('vote_id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Vote not found' });
    }

    return res.status(200).json({
      voteId: data.vote_id,
      title: data.title,
      creatorName: data.creator_name,
      options: typeof data.options === 'string' ? JSON.parse(data.options) : data.options,
      votes: typeof data.votes === 'string' ? JSON.parse(data.votes) : data.votes,
      createdAt: data.created_at,
      expiresAt: data.expires_at,
    });
  }

  if (req.method === 'POST') {
    // Submit a vote
    const { optionIndex, voterName } = req.body as { optionIndex: number; voterName: string };

    if (optionIndex === undefined || !voterName) {
      return res.status(400).json({ error: 'optionIndex and voterName required' });
    }

    // Get current votes
    const { data, error } = await supabase
      .from('votes')
      .select('votes')
      .eq('vote_id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: 'Vote not found' });
    }

    const currentVotes: Record<string, string[]> = typeof data.votes === 'string'
      ? JSON.parse(data.votes)
      : data.votes || {};

    // Remove voter from any previous choice
    for (const key of Object.keys(currentVotes)) {
      currentVotes[key] = (currentVotes[key] || []).filter((n: string) => n !== voterName);
    }

    // Add vote
    const key = String(optionIndex);
    if (!currentVotes[key]) currentVotes[key] = [];
    currentVotes[key].push(voterName);

    const { error: updateError } = await supabase
      .from('votes')
      .update({ votes: JSON.stringify(currentVotes) })
      .eq('vote_id', id);

    if (updateError) throw updateError;

    return res.status(200).json({ success: true, votes: currentVotes });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
