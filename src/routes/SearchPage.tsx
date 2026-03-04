import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Star, Car, MapPin, Clock, Filter as FilterIcon } from 'lucide-react';
import { mockRestaurants } from '../data/restaurants';
import { useFilterStore } from '../stores/filterStore';
import { useCoords } from '../stores/locationStore';
import { searchNearby } from '../services/placesService';
import type { Restaurant } from '../data/types';

function SkeletonCard() {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-[32px] p-4 flex gap-4 shadow-sm border border-warm-200/50 animate-pulse">
      <div className="w-24 h-24 rounded-2xl bg-slate-200" />
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
          <div className="h-3 bg-slate-200 rounded w-1/2" />
        </div>
        <div className="h-3 bg-slate-200 rounded w-1/3" />
      </div>
    </div>
  );
}

export default function SearchPage() {
  const navigate = useNavigate();
  const { price, tags, setShowModal } = useFilterStore();
  const { lat, lng } = useCoords();

  const [googlePlaces, setGooglePlaces] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [useGoogle, setUseGoogle] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    searchNearby(lat, lng, undefined, 1500)
      .then((places) => {
        if (!cancelled) {
          setGooglePlaces(places);
          setUseGoogle(true);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUseGoogle(false);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [lat, lng]);

  const mockFiltered = useMemo(() => {
    return mockRestaurants.filter((r) => {
      if (price.length > 0 && !price.includes(r.priceLevel)) return false;
      if (tags.length > 0 && !tags.every((tag) => r.tags.includes(tag))) return false;
      return true;
    });
  }, [price, tags]);

  const displayList = useMemo(() => {
    const list = useGoogle ? googlePlaces : mockFiltered;
    if (!useGoogle) return list;
    return list.filter((r) => {
      if (price.length > 0 && !price.includes(r.priceLevel)) return false;
      return true;
    });
  }, [useGoogle, googlePlaces, mockFiltered, price]);

  const filterLabel = [
    ...(price.length > 0 ? [price.map((p) => '$'.repeat(p)).join(' ')] : []),
    ...(tags.includes('date') ? ['約會'] : []),
    ...(tags.includes('pet') ? ['寵物'] : []),
  ].join(' · ');

  return (
    <div className="p-4 space-y-4 animate-slide-in-right">
      <div className="px-2 flex items-center gap-2 mb-2">
        <button
          onClick={() => navigate('/')}
          className="p-2 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-warm-200/50"
        >
          <ChevronRight className="rotate-180" size={18} />
        </button>
        <h2 className="text-xl font-black text-slate-800 tracking-tighter flex-1">
          篩選結果
        </h2>
        <button
          onClick={() => setShowModal(true)}
          className="p-2 bg-orange-500 text-white rounded-xl shadow-sm"
        >
          <FilterIcon size={18} />
        </button>
      </div>

      {filterLabel && (
        <div className="mx-2 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-2 text-xs text-orange-700 font-bold">
          篩選條件：{filterLabel}
        </div>
      )}

      {!useGoogle && !loading && (
        <div className="mx-2 bg-amber-50 border border-amber-200 rounded-2xl p-3 text-xs text-amber-700 font-bold">
          目前顯示模擬資料（Google API 未連線）
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!loading && displayList.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-4">🍽️</p>
          <p className="font-bold">沒有符合條件的餐廳</p>
          <p className="text-sm mt-2">試試調整篩選條件</p>
        </div>
      )}

      {!loading && displayList.map((rest) => (
        <div
          key={rest.placeId || rest.id}
          onClick={() => {
            if (rest.placeId) {
              navigate(`/restaurant/google-${rest.placeId}`, { state: { restaurant: rest } });
            } else {
              navigate(`/restaurant/${rest.id}`);
            }
          }}
          className="bg-white/70 backdrop-blur-sm rounded-[32px] p-4 flex gap-4 shadow-sm border border-warm-200/50 active:scale-[0.98] transition-all cursor-pointer"
        >
          <img
            src={rest.image}
            className="w-24 h-24 rounded-2xl object-cover bg-slate-100"
            alt={rest.name}
          />
          <div className="flex-1 flex flex-col justify-between py-1">
            <div>
              <h3 className="font-bold text-slate-800 text-lg leading-tight">
                {rest.name}
              </h3>
              <div className="flex items-center text-xs font-bold text-slate-400 mt-1 flex-wrap gap-1">
                <span className="text-orange-500 flex items-center">
                  <Star size={12} className="mr-1 fill-current" />
                  {rest.rating}
                  {rest.userRatingsTotal ? (
                    <span className="text-slate-300 ml-1">({rest.userRatingsTotal})</span>
                  ) : null}
                </span>
                <span>
                  {rest.priceStr} · {rest.dist}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {rest.openNow !== undefined && rest.openNow !== null && (
                <span className={`text-[10px] px-2 py-1 rounded-lg font-bold flex items-center ${
                  rest.openNow ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  <Clock size={10} className="mr-1" />
                  {rest.openNow ? '營業中' : '休息中'}
                </span>
              )}
              {rest.parkingLots[0] && (
                <span className="bg-slate-100 text-slate-500 text-[10px] px-2 py-1 rounded-lg font-bold flex items-center">
                  <Car size={10} className="mr-1" /> {rest.parkingLots[0].status}
                </span>
              )}
              {rest.placeId && (
                <span className="text-[10px] font-bold text-slate-300 flex items-center">
                  <MapPin size={10} className="mr-1" /> Google
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
