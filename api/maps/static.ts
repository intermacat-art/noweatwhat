import type { VercelRequest, VercelResponse } from '@vercel/node';

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!GOOGLE_API_KEY) {
    return res.status(500).json({ error: 'Google API key not configured' });
  }

  const { center, zoom = '14', size = '600x300', markers } = req.query;

  if (!center || !markers) {
    return res.status(400).json({ error: 'center and markers are required' });
  }

  const style = 'feature:poi|visibility:off';

  const params = new URLSearchParams({
    center: String(center),
    zoom: String(zoom),
    size: String(size),
    scale: '2',
    maptype: 'roadmap',
    markers: String(markers),
    style,
    key: GOOGLE_API_KEY,
  });

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/staticmap?${params}`
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Maps Static API error:', errorText);
      return res.status(response.status).json({ error: 'Maps API error' });
    }

    const buffer = Buffer.from(await response.arrayBuffer());

    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');
    return res.status(200).send(buffer);
  } catch (error) {
    console.error('Static map error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
