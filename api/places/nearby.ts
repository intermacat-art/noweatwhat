import type { VercelRequest, VercelResponse } from '@vercel/node';

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!GOOGLE_API_KEY) {
    return res.status(500).json({ error: 'Google API key not configured' });
  }

  const { lat, lng, keyword, radius = '1000' } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ error: 'lat and lng are required' });
  }

  try {
    const body = {
      includedTypes: ['restaurant'],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude: Number(lat), longitude: Number(lng) },
          radius: Number(radius),
        },
      },
      ...(keyword ? { textQuery: String(keyword) } : {}),
    };

    // Use Text Search if keyword provided, otherwise use Nearby Search
    const url = keyword
      ? 'https://places.googleapis.com/v1/places:searchText'
      : 'https://places.googleapis.com/v1/places:searchNearby';

    const fieldMask = [
      'places.id',
      'places.displayName',
      'places.rating',
      'places.priceLevel',
      'places.location',
      'places.photos',
      'places.currentOpeningHours',
      'places.userRatingCount',
      'places.formattedAddress',
    ].join(',');

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': GOOGLE_API_KEY,
        'X-Goog-FieldMask': fieldMask,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google API error:', errorText);
      return res.status(response.status).json({ error: 'Google API error', detail: errorText });
    }

    const data = await response.json();
    const places = (data.places || []).map((place: Record<string, unknown>) => ({
      placeId: place.id,
      name: (place.displayName as Record<string, string>)?.text || '',
      rating: place.rating || 0,
      priceLevel: place.priceLevel || 'PRICE_LEVEL_UNSPECIFIED',
      location: place.location,
      photoRefs: ((place.photos as Array<Record<string, string>>) || [])
        .slice(0, 3)
        .map((p) => p.name),
      openNow: (place.currentOpeningHours as Record<string, unknown>)?.openNow ?? null,
      userRatingsTotal: place.userRatingCount || 0,
      address: place.formattedAddress || '',
    }));

    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ places });
  } catch (error) {
    console.error('Nearby search error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
