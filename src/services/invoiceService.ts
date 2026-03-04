export interface InvoiceRecord {
  invNum: string;
  invDate: string;
  sellerName: string;
  amount: number;
}

export async function queryInvoices(
  cardNo: string,
  startDate: string,
  endDate: string
): Promise<InvoiceRecord[]> {
  const response = await fetch('/api/invoice/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cardNo, startDate, endDate }),
  });

  if (!response.ok) throw new Error('Failed to query invoices');

  const data = await response.json();

  if (data.code !== 200 || !data.details) {
    return [];
  }

  return data.details.map((inv: Record<string, unknown>) => ({
    invNum: inv.invNum || '',
    invDate: inv.invDate || '',
    sellerName: inv.sellerName || '',
    amount: Number(inv.amount) || 0,
  }));
}

/**
 * Simple fuzzy match: checks if the restaurant name appears in the seller name or vice versa.
 */
export function matchInvoiceToRestaurant(
  invoiceSellerName: string,
  restaurantNames: string[]
): string | null {
  const seller = invoiceSellerName.toLowerCase();
  for (const name of restaurantNames) {
    const rName = name.toLowerCase();
    if (seller.includes(rName) || rName.includes(seller)) {
      return name;
    }
  }
  return null;
}
