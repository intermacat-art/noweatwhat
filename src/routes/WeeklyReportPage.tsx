import { useMemo, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useHistoryStore } from '../stores/historyStore';
import { useDiceStore, getMonday } from '../stores/diceStore';
import { useEggStore } from '../stores/eggStore';
import { getStaticMapUrl } from '../services/placesService';

export default function WeeklyReportPage() {
  const navigate = useNavigate();
  const visits = useHistoryStore((s) => s.visits);
  const { getWeekRolls } = useDiceStore();
  const [weekOffset, setWeekOffset] = useState(0);
  const addEnergy = useEggStore((s) => s.addEnergy);
  const cardRef = useRef<HTMLDivElement>(null);
  const sharedRef = useRef(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [sharing, setSharing] = useState(false);

  const weekStart = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + weekOffset * 7);
    return getMonday(d);
  }, [weekOffset]);

  const weekEnd = useMemo(() => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + 6);
    return d;
  }, [weekStart]);

  const fmt = (d: Date) =>
    `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;

  const weekLabel = `${fmt(weekStart)} ~ ${fmt(weekEnd)}`;

  // Week visits
  const weekVisits = useMemo(() => {
    const start = weekStart.toISOString().split('T')[0];
    const endDate = new Date(weekEnd);
    endDate.setDate(endDate.getDate() + 1);
    const end = endDate.toISOString().split('T')[0];
    return visits.filter((v) => v.date >= start && v.date < end);
  }, [visits, weekStart, weekEnd]);

  // Stats
  const diceCount = useMemo(() => getWeekRolls(weekStart).length, [weekStart, getWeekRolls]);

  const newRestaurants = useMemo(() => {
    const startStr = weekStart.toISOString().split('T')[0];
    const endDate = new Date(weekEnd);
    endDate.setDate(endDate.getDate() + 1);
    const endStr = endDate.toISOString().split('T')[0];

    // Names visited before this week
    const pastNames = new Set(
      visits.filter((v) => v.date < startStr).map((v) => v.name)
    );
    // Names visited this week that weren't visited before
    const weekNames = new Set(
      visits
        .filter((v) => v.date >= startStr && v.date < endStr)
        .map((v) => v.name)
    );
    return [...weekNames].filter((n) => !pastNames.has(n)).length;
  }, [visits, weekStart, weekEnd]);

  const topCategory = useMemo(() => {
    const map = new Map<string, number>();
    weekVisits.forEach((v) => map.set(v.category, (map.get(v.category) || 0) + 1));
    let top = { name: '', count: 0 };
    map.forEach((count, name) => {
      if (count > top.count) top = { name, count };
    });
    return top.name || '—';
  }, [weekVisits]);

  const totalCost = useMemo(
    () => weekVisits.reduce((a, b) => a + (b.actualCost ?? b.cost), 0),
    [weekVisits]
  );

  // Map coords
  const coords = useMemo(
    () => weekVisits.filter((v) => v.coordinates).map((v) => v.coordinates!),
    [weekVisits]
  );
  const mapUrl = useMemo(
    () => (coords.length > 0 ? getStaticMapUrl(coords, { width: 540, height: 260 }) : ''),
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
      const file = new File([blob], '現在要吃啥-週報.png', { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: '現在要吃啥 — 週報',
          text: `我的美食週報 ${weekLabel}`,
          files: [file],
        });
      } else {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = '現在要吃啥-週報.png';
        a.click();
      }
      if (!sharedRef.current) {
        sharedRef.current = true;
        addEnergy(1);
      }
    } catch {
      // User cancelled or error
    } finally {
      setSharing(false);
    }
  }, [weekLabel, addEnergy]);

  const hasData = weekVisits.length > 0 || diceCount > 0;

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
          週報
        </h2>
      </div>

      {/* Week Selector */}
      <div className="flex items-center justify-center gap-6 py-4">
        <button
          onClick={() => { setWeekOffset((o) => o - 1); setMapLoaded(false); }}
          className="p-2 bg-slate-100 rounded-full active:scale-90 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-lg font-black text-slate-800 min-w-[160px] text-center">
          {weekLabel}
        </span>
        <button
          onClick={() => { setWeekOffset((o) => Math.min(o + 1, 0)); setMapLoaded(false); }}
          className={`p-2 rounded-full transition-all ${
            weekOffset >= 0 ? 'bg-slate-50 text-slate-200' : 'bg-slate-100 active:scale-90'
          }`}
          disabled={weekOffset >= 0}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {!hasData ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-5xl mb-4">📋</p>
          <p className="font-bold">本週還沒有紀錄</p>
          <p className="text-sm mt-2">用骰子選餐廳開始累積！</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="px-8 grid grid-cols-2 gap-4 mb-6">
            <div className="bg-orange-50 p-5 rounded-3xl text-center border border-orange-100">
              <p className="text-2xl mb-1">🎲</p>
              <p className="text-3xl font-black text-orange-600">{diceCount}</p>
              <p className="text-[10px] font-black text-orange-300 uppercase tracking-widest mt-1">次骰子</p>
            </div>
            <div className="bg-blue-50 p-5 rounded-3xl text-center border border-blue-100">
              <p className="text-2xl mb-1">🆕</p>
              <p className="text-3xl font-black text-blue-600">{newRestaurants}</p>
              <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mt-1">家新店</p>
            </div>
            <div className="bg-pink-50 p-5 rounded-3xl text-center border border-pink-100">
              <p className="text-2xl mb-1">🍜</p>
              <p className="text-3xl font-black text-pink-600 truncate px-2">{topCategory}</p>
              <p className="text-[10px] font-black text-pink-300 uppercase tracking-widest mt-1">最愛類別</p>
            </div>
            <div className="bg-green-50 p-5 rounded-3xl text-center border border-green-100">
              <p className="text-2xl mb-1">💰</p>
              <p className="text-3xl font-black text-green-600">${totalCost}</p>
              <p className="text-[10px] font-black text-green-300 uppercase tracking-widest mt-1">總花費</p>
            </div>
          </div>

          {/* Mini Map */}
          {mapUrl && (
            <div className="px-8 mb-6">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">
                美食足跡
              </h3>
              <div className="rounded-3xl overflow-hidden border border-slate-100">
                <img
                  src={mapUrl}
                  alt="美食地圖"
                  className="w-full"
                  onLoad={() => setMapLoaded(true)}
                />
              </div>
            </div>
          )}

          {/* Shareable Card (offscreen for capture) */}
          <div className="overflow-hidden" style={{ height: 0 }}>
            <div
              ref={cardRef}
              style={{ width: 360, height: 640 }}
              className="bg-gradient-to-b from-orange-500 to-pink-500 text-white flex flex-col p-8 relative"
            >
              {/* Dot pattern overlay */}
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="relative z-10 flex flex-col h-full">
                {/* Title */}
                <div className="mb-1">
                  <p className="text-[10px] uppercase tracking-[0.3em] font-bold opacity-70">Weekly Digest</p>
                </div>
                <div className="flex items-baseline justify-between mb-6">
                  <p className="text-lg font-black">{weekLabel}</p>
                  <p className="text-xs font-bold opacity-70">現在要吃啥</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                    <p className="text-2xl mb-1">🎲</p>
                    <p className="text-2xl font-black">{diceCount}</p>
                    <p className="text-[10px] font-bold opacity-70">次骰子</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                    <p className="text-2xl mb-1">🆕</p>
                    <p className="text-2xl font-black">{newRestaurants}</p>
                    <p className="text-[10px] font-bold opacity-70">家新店</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                    <p className="text-2xl mb-1">🍜</p>
                    <p className="text-2xl font-black truncate">{topCategory}</p>
                    <p className="text-[10px] font-bold opacity-70">最愛類別</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-center">
                    <p className="text-2xl mb-1">💰</p>
                    <p className="text-2xl font-black">${totalCost}</p>
                    <p className="text-[10px] font-bold opacity-70">總花費</p>
                  </div>
                </div>

                {/* Mini Map in card */}
                {mapUrl && (
                  <div className="flex-1 rounded-2xl overflow-hidden mb-4 bg-white/10">
                    <img
                      src={mapUrl}
                      alt="Map"
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  </div>
                )}
                {!mapUrl && <div className="flex-1" />}

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
              disabled={sharing || (mapUrl !== '' && !mapLoaded)}
              className="w-full bg-orange-500 text-white py-5 rounded-[28px] font-black text-lg flex items-center justify-center shadow-xl shadow-orange-200 active:scale-95 transition-all disabled:opacity-50"
            >
              {sharing ? (
                <span className="animate-pulse">產生中...</span>
              ) : (
                <>
                  <Download size={22} className="mr-2" /> 分享週報卡片
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
