import { useMemo, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Download, MapPin } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useHistoryStore } from '../stores/historyStore';
import { getStaticMapUrl } from '../services/placesService';
import { getMonday } from '../stores/diceStore';

type TimeFilter = 'week' | 'month' | 'all';

export default function FoodMapPage() {
  const navigate = useNavigate();
  const visits = useHistoryStore((s) => s.visits);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const cardRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [sharing, setSharing] = useState(false);

  const filteredVisits = useMemo(() => {
    const now = new Date();
    if (timeFilter === 'week') {
      const monday = getMonday(now);
      const start = monday.toISOString().split('T')[0];
      return visits.filter((v) => v.date >= start && v.coordinates);
    }
    if (timeFilter === 'month') {
      const start = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return visits.filter((v) => v.date.startsWith(start) && v.coordinates);
    }
    return visits.filter((v) => v.coordinates);
  }, [visits, timeFilter]);

  const coords = useMemo(
    () => filteredVisits.map((v) => v.coordinates!),
    [filteredVisits]
  );

  const mapUrl = useMemo(
    () => (coords.length > 0 ? getStaticMapUrl(coords, { width: 600, height: 400 }) : ''),
    [coords]
  );

  // Share card map (slightly different dimensions)
  const shareMapUrl = useMemo(
    () => (coords.length > 0 ? getStaticMapUrl(coords, { width: 540, height: 400 }) : ''),
    [coords]
  );

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;
    setSharing(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        quality: 0.95,
        width: 360,
        height: 640,
      });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], '現在要吃啥-美食地圖.png', { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: '現在要吃啥 — 美食地圖',
          text: `我的美食地圖：${filteredVisits.length} 家餐廳`,
          files: [file],
        });
      } else {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = '現在要吃啥-美食地圖.png';
        a.click();
      }
    } catch {
      // User cancelled or error
    } finally {
      setSharing(false);
    }
  }, [filteredVisits.length]);

  const filterLabels: Record<TimeFilter, string> = {
    week: '本週',
    month: '本月',
    all: '全部',
  };

  return (
    <div className="animate-slide-in-right bg-white min-h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 bg-slate-100 rounded-xl"
        >
          <ChevronRight className="rotate-180" size={18} />
        </button>
        <h2 className="text-xl font-black text-slate-800 tracking-tighter">
          美食地圖
        </h2>
      </div>

      {/* Time Filter */}
      <div className="px-8 flex gap-2 mb-6">
        {(['week', 'month', 'all'] as TimeFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => { setTimeFilter(f); setMapLoaded(false); }}
            className={`px-5 py-2.5 rounded-full font-black text-sm transition-all ${
              timeFilter === f
                ? 'bg-slate-900 text-white shadow-lg'
                : 'bg-slate-100 text-slate-500 active:scale-95'
            }`}
          >
            {filterLabels[f]}
          </button>
        ))}
      </div>

      {filteredVisits.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-5xl mb-4">🗺️</p>
          <p className="font-bold">還沒有地圖資料</p>
          <p className="text-sm mt-2">用骰子選餐廳開始累積！</p>
        </div>
      ) : (
        <>
          {/* Map */}
          {mapUrl && (
            <div className="px-8 mb-6">
              <div className="rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                <img
                  src={mapUrl}
                  alt="美食地圖"
                  className="w-full"
                  onLoad={() => setMapLoaded(true)}
                />
              </div>
            </div>
          )}

          {/* Restaurant List */}
          <div className="px-8 mb-6">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">
              {filteredVisits.length} 家餐廳
            </h3>
            <div className="space-y-3">
              {filteredVisits.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100"
                >
                  <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                    <MapPin size={18} className="text-red-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{v.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {v.date} · {v.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Share Card (offscreen) */}
          <div className="overflow-hidden" style={{ height: 0 }}>
            <div
              ref={cardRef}
              style={{ width: 360, height: 640 }}
              className="bg-gradient-to-b from-emerald-500 to-teal-600 text-white flex flex-col p-8 relative"
            >
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="relative z-10 flex flex-col h-full">
                {/* Title */}
                <div className="mb-1">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-70">Food Map</p>
                </div>
                <div className="flex items-baseline justify-between mb-4">
                  <p className="text-lg font-black">{filteredVisits.length} 家餐廳</p>
                  <p className="text-xs font-bold opacity-70">現在要吃啥</p>
                </div>

                {/* Map */}
                {shareMapUrl && (
                  <div className="rounded-2xl overflow-hidden mb-4 bg-white/10 flex-1">
                    <img
                      src={shareMapUrl}
                      alt="Map"
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                )}

                {/* Restaurant names */}
                <div className="space-y-1.5 mb-4 max-h-[140px] overflow-hidden">
                  {filteredVisits.slice(0, 6).map((v) => (
                    <div key={v.id} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-400 rounded-full shrink-0" />
                      <p className="text-xs font-bold truncate">{v.name}</p>
                      <p className="text-[10px] opacity-50 shrink-0">{v.category}</p>
                    </div>
                  ))}
                  {filteredVisits.length > 6 && (
                    <p className="text-[10px] opacity-50 pl-4">
                      ...還有 {filteredVisits.length - 6} 家
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="text-center mt-auto">
                  <div className="h-px w-12 bg-white/30 mx-auto mb-3" />
                  <p className="text-[10px] font-black tracking-[0.3em] uppercase opacity-50">
                    noweatwhat.vercel.app
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Share Button */}
          <div className="px-8 pb-10">
            <button
              onClick={handleShare}
              disabled={sharing || !mapLoaded}
              className="w-full bg-emerald-500 text-white py-5 rounded-[28px] font-black text-lg flex items-center justify-center shadow-xl shadow-emerald-200 active:scale-95 transition-all disabled:opacity-50"
            >
              {sharing ? (
                <span className="animate-pulse">產生中...</span>
              ) : (
                <>
                  <Download size={22} className="mr-2" /> 分享美食地圖
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
