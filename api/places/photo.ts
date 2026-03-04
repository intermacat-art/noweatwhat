import type { VercelRequest, VercelResponse } from '@vercel/node';

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!GOOGLE_API_KEY) {
    return res.status(500).json({ error: 'Google API key not configured' });
  }

  const { ref, maxwidth = '800' } = req.query;

  if (!ref || typeof ref !== 'string') {
    return res.status(400).json({ error: 'ref (photo resource name) is required' });
  }

  try {
    // Google Places API (New) photo endpoint
    const url = `https://places.googleapis.com/v1/${ref}/media?maxWidthPx=${maxwidth}&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url, { redirect: 'follow' });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch photo' });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    return res.send(buffer);
  } catch (error) {
    console.error('Photo proxy error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
