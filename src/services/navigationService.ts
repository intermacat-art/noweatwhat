import type { Restaurant, ParkingLot } from '../data/types';

export function navigateToRestaurant(restaurant: Restaurant) {
  const { lat, lng } = restaurant.coordinates;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  window.open(url, '_blank');
}

export function navigateToParking(lot: ParkingLot) {
  if (lot.coordinates) {
    const { lat, lng } = lot.coordinates;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  } else {
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(lot.name)}`, '_blank');
  }
}

export function openGoogleReviews(name: string) {
  window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name)}`, '_blank');
}
