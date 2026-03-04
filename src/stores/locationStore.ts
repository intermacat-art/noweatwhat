import { create } from 'zustand';

interface LocationState {
  lat: number | null;
  lng: number | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => void;
}

// Default: Taipei 101 area
const DEFAULT_LAT = 25.033;
const DEFAULT_LNG = 121.565;

export const useLocationStore = create<LocationState>((set, get) => ({
  lat: null,
  lng: null,
  loading: false,
  error: null,
  requestLocation: () => {
    if (get().loading) return;
    if (!navigator.geolocation) {
      set({ lat: DEFAULT_LAT, lng: DEFAULT_LNG, error: 'Geolocation not supported' });
      return;
    }
    set({ loading: true, error: null });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        set({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          loading: false,
        });
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        set({
          lat: DEFAULT_LAT,
          lng: DEFAULT_LNG,
          loading: false,
          error: err.message,
        });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  },
}));

export function useCoords() {
  const { lat, lng } = useLocationStore();
  return { lat: lat ?? DEFAULT_LAT, lng: lng ?? DEFAULT_LNG };
}
