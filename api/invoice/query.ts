import type { VercelRequest, VercelResponse } from '@vercel/node';

const EINVOICE_APP_ID = process.env.EINVOICE_APP_ID;
const EINVOICE_API_KEY = process.env.EINVOICE_API_KEY;
const EINVOICE_BASE = 'https://api.einvoice.nat.gov.tw';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!EINVOICE_APP_ID || !EINVOICE_API_KEY) {
    return res.status(500).json({ error: 'E-invoice API not configured' });
  }

  const { cardNo, startDate, endDate } = req.body as {
    cardNo?: string;
    startDate?: string;
    endDate?: string;
  };

  if (!cardNo || !startDate || !endDate) {
    return res.status(400).json({ error: 'cardNo, startDate, endDate are required' });
  }

  try {
    // Query carrier invoices
    const params = new URLSearchParams({
      version: '0.5',
      action: 'carrierInvChk',
      cardType: '3J0002',
      cardNo,
      startDate: startDate.replace(/-/g, '/'),
      endDate: endDate.replace(/-/g, '/'),
      onlyWinningInv: 'N',
      uuid: '1000',
      appID: EINVOICE_APP_ID,
    });

    // Generate HMAC signature
    const timeStamp = Math.floor(Date.now() / 1000);
    params.set('timeStamp', String(timeStamp));

    const encoder = new TextEncoder();
    const keyData = encoder.encode(EINVOICE_API_KEY);
    const key = await crypto.subtle.importKey(
      'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const signature = await crypto.subtle.sign(
      'HMAC', key, encoder.encode(params.toString())
    );
    const sig = Buffer.from(signature).toString('base64');
    params.set('signature', sig);

    const response = await fetch(
      `${EINVOICE_BASE}/PB2CAPIVAN/invServ/InvServ`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      }
    );

    if (!response.ok) {
      return res.status(response.status).json({ error: 'E-invoice API error' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Invoice query error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
