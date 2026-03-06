import { useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Download } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useHistoryStore } from '../stores/historyStore';
import { useDiceStore } from '../stores/diceStore';
import { useEggStore } from '../stores/eggStore';
import { calculatePersonality } from '../utils/foodPersonality';

export default function FoodPersonalityPage() {
  const navigate = useNavigate();
  const visits = useHistoryStore((s) => s.visits);
  const rolls = useDiceStore((s) => s.rolls);
  const addEnergy = useEggStore((s) => s.addEnergy);
  const cardRef = useRef<HTMLDivElement>(null);
  const sharedRef = useRef(false);
  const [sharing, setSharing] = useState(false);

  const result = useMemo(() => calculatePersonality(visits, rolls), [visits, rolls]);
  const { stats } = result;

  const now = new Date();
  const volLabel = `Vol.${now.getFullYear() - 2025}`;
  const monthLabel = `${now.getFullYear()} ${now.toLocaleString('en', { month: 'long' })}`;

  const highlights = useMemo(() => {
    const items: string[] = [];
    if (stats.categoryCount > 0) items.push(`探索了 ${stats.categoryCount} 種料理`);
    if (stats.totalVisits > 0) items.push(`新店率 ${Math.round(stats.newRate * 100)}%`);
    if (stats.topCategory) items.push(`最愛${stats.topCategory}`);
    return items.slice(0, 3);
  }, [stats]);

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
      const file = new File([blob], '現在要吃啥-美食人格.png', { type: 'image/png' });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: '現在要吃啥 — 美食人格',
          text: `我的美食人格是「${result.name}」！`,
          files: [file],
        });
      } else {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = '現在要吃啥-美食人格.png';
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
  }, [result.name, addEnergy]);

  const insufficientData = visits.length < 3;

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
          美食人格
        </h2>
      </div>

      {insufficientData ? (
        <div className="text-center py-20 px-8 text-slate-400">
          <p className="text-6xl mb-6">🔮</p>
          <p className="font-black text-lg text-slate-600 mb-2">再多吃幾次就能解鎖你的美食人格！</p>
          <p className="text-sm">
            目前 {visits.length} 筆紀錄，需要至少 3 筆才能分析
          </p>
          <button
            onClick={() => navigate('/checkin')}
            className="mt-8 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black active:scale-95 transition-all"
          >
            去打卡
          </button>
        </div>
      ) : (
        <>
          {/* Personality Result */}
          <div className="px-8 pt-4 pb-6 text-center">
            <p className="text-7xl mb-4">{result.emoji}</p>
            <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-1">
              {result.name}
            </h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">
              {result.nameEn}
            </p>
            <p className="text-sm text-slate-500 leading-relaxed">
              「{result.description}」
            </p>
          </div>

          {/* Stats Grid */}
          <div className="px-8 grid grid-cols-2 gap-4 mb-6">
            <div className="bg-purple-50 p-5 rounded-3xl text-center border border-purple-100">
              <p className="text-2xl mb-1">🎲</p>
              <p className="text-3xl font-black text-purple-600">{stats.diceCount}</p>
              <p className="text-[10px] font-black text-purple-300 uppercase tracking-widest mt-1">次骰子</p>
            </div>
            <div className="bg-orange-50 p-5 rounded-3xl text-center border border-orange-100">
              <p className="text-2xl mb-1">💰</p>
              <p className="text-3xl font-black text-orange-600">
                ${Math.round(stats.avgCost)}
              </p>
              <p className="text-[10px] font-black text-orange-300 uppercase tracking-widest mt-1">平均花費</p>
            </div>
            <div className="bg-blue-50 p-5 rounded-3xl text-center border border-blue-100">
              <p className="text-2xl mb-1">🆕</p>
              <p className="text-3xl font-black text-blue-600">
                {Math.round(stats.newRate * 100)}%
              </p>
              <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mt-1">新店率</p>
            </div>
            <div className="bg-pink-50 p-5 rounded-3xl text-center border border-pink-100">
              <p className="text-2xl mb-1">⭐</p>
              <p className="text-3xl font-black text-pink-600">
                {stats.avgRating ?? '—'}
              </p>
              <p className="text-[10px] font-black text-pink-300 uppercase tracking-widest mt-1">平均評分</p>
            </div>
          </div>

          {/* Highlights */}
          {highlights.length > 0 && (
            <div className="px-8 mb-8">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">
                Highlights
              </h4>
              <div className="space-y-2">
                {highlights.map((h) => (
                  <div
                    key={h}
                    className="bg-slate-50 px-5 py-3 rounded-2xl text-sm font-bold text-slate-600"
                  >
                    「{h}」
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Shareable Card (offscreen) */}
          <div className="overflow-hidden" style={{ height: 0 }}>
            <div
              ref={cardRef}
              style={{ width: 360, height: 640, fontFamily: 'serif' }}
              className="relative flex flex-col"
            >
              {/* Cream background */}
              <div className="absolute inset-0" style={{ backgroundColor: '#FAF9F6' }} />
              {/* Dot pattern */}
              <div
                className="absolute inset-0 opacity-[0.08] pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#999 0.8px, transparent 0.8px)',
                  backgroundSize: '14px 14px',
                }}
              />

              <div className="relative z-10 flex flex-col h-full px-8 py-8">
                {/* Magazine header */}
                <p
                  className="text-[10px] uppercase tracking-[0.35em] font-bold"
                  style={{ color: '#999', fontFamily: 'sans-serif' }}
                >
                  Food Personality
                </p>
                <div className="w-full h-[2px] bg-slate-300 mt-2 mb-3" />
                <div
                  className="flex items-baseline justify-between mb-6"
                  style={{ fontFamily: 'sans-serif' }}
                >
                  <p className="text-[11px] font-bold text-slate-400">{volLabel}</p>
                  <p className="text-[11px] font-bold text-slate-400">{monthLabel}</p>
                </div>

                {/* Personality name — large vertical text + emoji */}
                <div className="flex items-start gap-3 mb-4 flex-1">
                  <div className="flex flex-col">
                    {result.name.split('').map((char, i) => (
                      <span
                        key={i}
                        className="text-[44px] font-black leading-[1.15] text-slate-800"
                        style={{ fontFamily: 'serif' }}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                  <span className="text-5xl mt-1">{result.emoji}</span>
                </div>

                {/* Description */}
                <p
                  className="text-[13px] leading-relaxed text-slate-500 mb-5"
                  style={{ fontFamily: 'sans-serif' }}
                >
                  「{result.description}」
                </p>

                {/* Highlights */}
                <div className="mb-4" style={{ fontFamily: 'sans-serif' }}>
                  <p className="text-[9px] uppercase tracking-[0.3em] font-black text-slate-300 mb-2">
                    ── Highlights ──
                  </p>
                  {highlights.map((h) => (
                    <p key={h} className="text-[12px] font-bold text-slate-600 mb-1">
                      「{h}」
                    </p>
                  ))}
                </div>

                {/* Stats row */}
                <div
                  className="flex flex-wrap gap-2 mb-5"
                  style={{ fontFamily: 'sans-serif' }}
                >
                  <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-full">
                    🎲 {stats.diceCount}次骰子
                  </span>
                  <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-full">
                    💰 ${Math.round(stats.avgCost * stats.totalVisits)}
                  </span>
                  <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-full">
                    🆕 {new Set(visits.map((v) => v.name)).size}家新店
                  </span>
                  {stats.avgRating != null && (
                    <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-3 py-1.5 rounded-full">
                      ⭐ 平均{stats.avgRating}
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-auto" style={{ fontFamily: 'sans-serif' }}>
                  <div className="w-10 h-[1.5px] bg-slate-300 mb-3" />
                  <p className="text-[11px] font-black text-slate-700 tracking-tight">
                    現在要吃啥
                  </p>
                  <p className="text-[9px] text-slate-400 tracking-widest">
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
              disabled={sharing}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white py-5 rounded-[28px] font-black text-lg flex items-center justify-center shadow-xl shadow-purple-200 active:scale-95 transition-all disabled:opacity-50"
            >
              {sharing ? (
                <span className="animate-pulse">產生中...</span>
              ) : (
                <>
                  <Download size={22} className="mr-2" /> 分享美食人格卡片
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
