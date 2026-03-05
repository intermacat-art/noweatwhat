import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { mockRestaurants } from '../data/restaurants';
import { useFilterStore } from '../stores/filterStore';
import { useCoords, useLocationStore } from '../stores/locationStore';
import { searchNearby, distanceMeters } from '../services/placesService';
import type { Restaurant } from '../data/types';

export default function DiceResultPage() {
  const navigate = useNavigate();
  const { price, tags, distance } = useFilterStore();
  const { lat, lng } = useCoords();
  const [rolling, setRolling] = useState(true);
  const [diceEmoji, setDiceEmoji] = useState('🎲');
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Restaurant | null>(null);

  const locationReady = useLocationStore((s) => s.ready);
  const searchRadius = distance > 0 ? distance : 1500;

  // Fetch nearby restaurants on mount
  useEffect(() => {
    if (!locationReady) return;
    let cancelled = false;
    setLoading(true);
    searchNearby(lat, lng, undefined, searchRadius)
      .then((places) => {
        if (!cancelled) {
          setRestaurants(places);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          // Fallback to mock data with distance
          const mock = mockRestaurants.map((r) => ({
            ...r,
            distanceMeters: distanceMeters(lat, lng, r.coordinates.lat, r.coordinates.lng),
          }));
          setRestaurants(mock);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [lat, lng, searchRadius, locationReady]);

  // Filter candidates by price/tags/distance
  const candidates = useMemo(() => {
    return restaurants.filter((r) => {
      if (price.length > 0 && !price.includes(r.priceLevel)) return false;
      if (tags.length > 0 && !tags.every((tag) => r.tags.includes(tag))) return false;
      if (distance > 0 && (r.distanceMeters ?? Infinity) > distance) return false;
      return true;
    });
  }, [restaurants, price, tags, distance]);

  // Pick a random restaurant
  const pickRandom = useCallback(() => {
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }, [candidates]);

  // Initial selection after data loads
  useEffect(() => {
    if (!loading && candidates.length > 0 && !selected) {
      setSelected(pickRandom());
    }
  }, [loading, candidates, selected, pickRandom]);

  // Rolling animation
  useEffect(() => {
    const emojis = ['🎲', '🎰', '🍀', '✨', '🔥'];
    let i = 0;
    const interval = setInterval(() => {
      setDiceEmoji(emojis[i % emojis.length]);
      i++;
    }, 150);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setRolling(false);
    }, 2000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const handleReroll = () => {
    setRolling(true);
    setSelected(pickRandom());
    setTimeout(() => setRolling(false), 2000);
  };

  const handleNavigate = (rest: Restaurant) => {
    if (rest.placeId) {
      navigate(`/restaurant/google-${rest.placeId}`, { state: { restaurant: rest } });
    } else {
      navigate(`/restaurant/${rest.id}`);
    }
  };

  if (!loading && candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <p className="text-6xl mb-6">😢</p>
        <p className="text-xl font-black text-slate-800 mb-4">
          沒有符合條件的餐廳
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-orange-500 text-white px-8 py-4 rounded-3xl font-black"
        >
          回首頁
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8 text-center">
      {(rolling || loading) ? (
        <div className="animate-bounce">
          <p className="text-8xl mb-6">{diceEmoji}</p>
          <p className="text-xl font-black text-slate-800 tracking-tighter">
            {loading ? '搜尋附近餐廳...' : '命運正在轉動...'}
          </p>
        </div>
      ) : selected ? (
        <div className="animate-fade-in w-full max-w-sm">
          <p className="text-sm font-black text-orange-500 uppercase tracking-widest mb-4">
            命運之選
          </p>
          <div
            className="bg-white rounded-[40px] overflow-hidden shadow-2xl border border-slate-100 cursor-pointer active:scale-[0.98] transition-all"
            onClick={() => handleNavigate(selected)}
          >
            <img
              src={selected.image}
              className="w-full h-48 object-cover"
              alt={selected.name}
            />
            <div className="p-6">
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter mb-2">
                {selected.name}
              </h2>
              <div className="flex items-center justify-center gap-3 text-sm font-bold text-slate-400">
                <span className="text-orange-500 flex items-center">
                  <Star size={14} className="mr-1 fill-current" />
                  {selected.rating}
                </span>
                <span>{selected.priceStr}</span>
                <span>{selected.dist}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleReroll}
              className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-3xl font-black"
            >
              🎲 再骰一次
            </button>
            <button
              onClick={() => handleNavigate(selected)}
              className="flex-1 bg-orange-500 text-white py-4 rounded-3xl font-black shadow-lg"
            >
              就決定是你了
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
