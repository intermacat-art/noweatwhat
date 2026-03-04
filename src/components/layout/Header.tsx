import { MapPin, Filter as FilterIcon, User, Locate } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFilterStore } from '../../stores/filterStore';
import { useLocationStore } from '../../stores/locationStore';

export default function Header() {
  const navigate = useNavigate();
  const { setShowModal, hasActiveFilters } = useFilterStore();
  const active = hasActiveFilters();
  const { lat, loading, requestLocation } = useLocationStore();
  const hasLocation = lat !== null;

  return (
    <header className="glass-warm px-6 py-5 flex items-center justify-between sticky top-0 z-30 border-b border-warm-200/40">
      <div>
        <h1
          className="text-2xl font-black text-slate-800 tracking-tighter cursor-pointer"
          onClick={() => navigate('/')}
        >
          現在要吃啥<span className="text-orange-500">.</span>
        </h1>
        <button
          onClick={requestLocation}
          className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center mt-1 hover:text-orange-500 transition-colors"
        >
          {loading ? (
            <>
              <Locate size={10} className="mr-1 text-orange-500 animate-pulse" /> 定位中...
            </>
          ) : hasLocation ? (
            <>
              <MapPin size={10} className="mr-1 text-green-500" /> GPS 已定位 · 搜尋附近
            </>
          ) : (
            <>
              <MapPin size={10} className="mr-1 text-orange-500" /> 點擊定位 · 搜尋附近
            </>
          )}
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setShowModal(true)}
          className={`p-2.5 rounded-2xl transition-all ${
            active
              ? 'bg-orange-500 text-white shadow-lg'
              : 'bg-slate-100 text-slate-500'
          }`}
        >
          <FilterIcon size={20} />
        </button>
        <button
          onClick={() => navigate('/profile')}
          className="bg-slate-100 p-2.5 rounded-2xl text-slate-500"
        >
          <User size={20} />
        </button>
      </div>
    </header>
  );
}
