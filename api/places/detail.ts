import type { VercelRequest, VercelResponse } from '@vercel/node';

const GOOGLE_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!GOOGLE_API_KEY) {
    return res.status(500).json({ error: 'Google API key not configured' });
  }

  const { placeId } = req.query;

  if (!placeId || typeof placeId !== 'string') {
    return res.status(400).json({ error: 'placeId is required' });
  }

  try {
    const fieldMask = [
      'id',
      'displayName',
      'rating',
      'priceLevel',
      'location',
      'photos',
      'currentOpeningHours',
      'regularOpeningHours',
      'userRatingCount',
      'formattedAddress',
      'reviews',
      'websiteUri',
      'nationalPhoneNumber',
    ].join(',');

    const response = await fetch(
      `https://places.googleapis.com/v1/places/${placeId}`,
      {
        headers: {
          'X-Goog-Api-Key': GOOGLE_API_KEY,
          'X-Goog-FieldMask': fieldMask,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google API error:', errorText);
      return res.status(response.status).json({ error: 'Google API error' });
    }

    const place = await response.json();

    const result = {
      placeId: place.id,
      name: place.displayName?.text || '',
      rating: place.rating || 0,
      priceLevel: place.priceLevel || 'PRICE_LEVEL_UNSPECIFIED',
      location: place.location,
      photoRefs: (place.photos || []).slice(0, 10).map((p: Record<string, string>) => p.name),
      openNow: place.currentOpeningHours?.openNow ?? null,
      openingHours: place.regularOpeningHours?.weekdayDescriptions || [],
      userRatingsTotal: place.userRatingCount || 0,
      address: place.formattedAddress || '',
      reviews: (place.reviews || []).slice(0, 5).map((r: Record<string, unknown>) => ({
        author: (r.authorAttribution as Record<string, string>)?.displayName || '',
        rating: r.rating || 0,
        text: (r.text as Record<string, string>)?.text || '',
        time: r.publishTime || '',
      })),
      website: place.websiteUri || null,
      phone: place.nationalPhoneNumber || null,
    };

    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=1200');
    return res.status(200).json(result);
  } catch (error) {
    console.error('Place detail error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
