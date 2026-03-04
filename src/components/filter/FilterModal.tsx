import { X, Heart, Dog, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFilterStore } from '../../stores/filterStore';
import type { DistanceOption } from '../../stores/filterStore';
import { useMemo } from 'react';
import { mockRestaurants } from '../../data/restaurants';

const DISTANCE_OPTIONS: { value: DistanceOption; label: string }[] = [
  { value: 100, label: '100m' },
  { value: 200, label: '200m' },
  { value: 400, label: '400m' },
  { value: 1000, label: '1km+' },
];

export default function FilterModal() {
  const navigate = useNavigate();
  const { price, tags, distance, togglePrice, toggleTag, setDistance, setShowModal } = useFilterStore();

  const filteredCount = useMemo(() => {
    return mockRestaurants.filter((r) => {
      if (price.length > 0 && !price.includes(r.priceLevel)) return false;
      if (tags.length > 0 && !tags.every((tag) => r.tags.includes(tag))) return false;
      return true;
    }).length;
  }, [price, tags]);

  const hasFilters = price.length > 0 || tags.length > 0 || distance > 0;

  const handleViewResults = () => {
    setShowModal(false);
    navigate('/search');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-end">
      <div className="bg-white w-full rounded-t-[40px] p-8 pb-12 animate-slide-in-bottom">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-black text-slate-800 tracking-tighter">篩選美味</h3>
          <button
            onClick={() => setShowModal(false)}
            className="bg-slate-100 p-2 rounded-full"
          >
            <X size={24} />
          </button>
        </div>
        <div className="space-y-8">
          {/* Distance */}
          <div>
            <p className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest flex items-center">
              <MapPin size={14} className="mr-1.5" /> 距離範圍
            </p>
            <div className="flex gap-3">
              {DISTANCE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setDistance(distance === opt.value ? 0 : opt.value)}
                  className={`flex-1 py-4 rounded-2xl font-black transition-all text-sm ${
                    distance === opt.value
                      ? 'bg-orange-500 text-white shadow-xl scale-105'
                      : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          {/* Price */}
          <div>
            <p className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">
              預算範圍
            </p>
            <div className="flex gap-3">
              {[1, 2, 3, 4].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => togglePrice(lvl)}
                  className={`flex-1 py-4 rounded-2xl font-black transition-all ${
                    price.includes(lvl)
                      ? 'bg-slate-900 text-white shadow-xl scale-105'
                      : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  {Array(lvl).fill('$').join('')}
                </button>
              ))}
            </div>
          </div>
          {/* Tags */}
          <div>
            <p className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-widest">
              特別需求
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => toggleTag('date')}
                className={`flex-1 py-4 px-4 rounded-2xl font-bold flex items-center justify-center transition-all ${
                  tags.includes('date')
                    ? 'bg-pink-500 text-white shadow-lg scale-105'
                    : 'bg-slate-50 text-slate-400'
                }`}
              >
                <Heart size={18} className="mr-2 fill-current" /> 適合約會
              </button>
              <button
                onClick={() => toggleTag('pet')}
                className={`flex-1 py-4 px-4 rounded-2xl font-bold flex items-center justify-center transition-all ${
                  tags.includes('pet')
                    ? 'bg-amber-500 text-white shadow-lg scale-105'
                    : 'bg-slate-50 text-slate-400'
                }`}
              >
                <Dog size={18} className="mr-2" /> 寵物友善
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={hasFilters ? handleViewResults : () => setShowModal(false)}
          className="w-full bg-orange-500 text-white font-black py-5 rounded-3xl mt-10 shadow-xl shadow-orange-200 active:scale-95 transition-all text-lg"
        >
          {hasFilters ? `查看結果 (${filteredCount})` : '關閉'}
        </button>
      </div>
    </div>
  );
}
