import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useEggStore } from '../stores/eggStore';
import { RARITY_LABELS, type Rarity } from '../data/creatureData';

function RarityBadge({ rarity }: { rarity: Rarity }) {
  const info = RARITY_LABELS[rarity];
  return (
    <span
      className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
        rarity === 'legendary'
          ? 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700'
          : rarity === 'rare'
          ? 'bg-blue-50 text-blue-500'
          : 'bg-slate-50 text-slate-400'
      }`}
    >
      {info.label}
    </span>
  );
}

export default function ZooPage() {
  const navigate = useNavigate();
  const creatures = useEggStore((s) => s.creatures);

  const legendaryCount = creatures.filter((c) => c.rarity === 'legendary').length;
  const rareCount = creatures.filter((c) => c.rarity === 'rare').length;

  return (
    <div className="animate-slide-in-right bg-app min-h-full bg-dots">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 bg-slate-100 rounded-xl"
        >
          <ChevronRight className="rotate-180" size={18} />
        </button>
        <h2 className="text-xl font-black text-slate-800 tracking-tighter">
          我的動物園
        </h2>
        <span className="text-xs font-bold text-slate-400 ml-auto">
          {creatures.length} 隻
        </span>
      </div>

      {/* Stats bar */}
      {creatures.length > 0 && (
        <div className="px-6 mb-4 flex gap-2">
          <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-3 py-1.5 rounded-full">
            ✨ 傳說 {legendaryCount}
          </span>
          <span className="text-[10px] font-bold bg-blue-50 text-blue-500 px-3 py-1.5 rounded-full">
            💎 稀有 {rareCount}
          </span>
          <span className="text-[10px] font-bold bg-slate-50 text-slate-400 px-3 py-1.5 rounded-full">
            🏠 普通 {creatures.length - legendaryCount - rareCount}
          </span>
        </div>
      )}

      {creatures.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-6xl mb-6">🥚</p>
          <p className="font-black text-lg text-slate-600 mb-2">
            動物園還是空的
          </p>
          <p className="text-sm">快去孵蛋，收集你的第一隻美食怪獸！</p>
          <button
            onClick={() => navigate('/')}
            className="mt-8 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black active:scale-95 transition-all"
          >
            回首頁
          </button>
        </div>
      ) : (
        <div className="px-6 pb-10 grid grid-cols-2 gap-4">
          {creatures.map((h) => {
            const topCats = Object.entries(h.categoryBreakdown)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 2)
              .map(([cat]) => cat);

            return (
              <div
                key={h.id}
                className={`bg-white/70 backdrop-blur-sm rounded-3xl p-5 border text-center transition-all ${
                  h.rarity === 'legendary'
                    ? 'border-amber-200 shadow-lg shadow-amber-100/50'
                    : h.rarity === 'rare'
                    ? 'border-blue-100'
                    : 'border-warm-200/50'
                }`}
              >
                <div className="text-5xl mb-2">{h.creature.emoji}</div>
                <p className="font-black text-sm text-slate-800 tracking-tight mb-0.5">
                  {h.creature.name}
                </p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                  {h.creature.nameEn}
                </p>
                <RarityBadge rarity={h.rarity} />
                <div className="flex gap-1 justify-center mt-2 flex-wrap">
                  {topCats.map((cat) => (
                    <span
                      key={cat}
                      className="text-[9px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
                <p className="text-[9px] text-slate-300 mt-2">{h.hatchedAt}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
