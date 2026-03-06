import { useState, useEffect, useCallback } from 'react';
import { useEggStore } from '../../stores/eggStore';
import {
  getEggStage,
  HATCH_THRESHOLD,
  RARITY_LABELS,
  type HatchedCreature,
} from '../../data/creatureData';

function HatchModal({
  hatched,
  onClose,
}: {
  hatched: HatchedCreature;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<'shake' | 'flash' | 'reveal' | 'done'>('shake');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('flash'), 1000);
    const t2 = setTimeout(() => setPhase('reveal'), 1500);
    const t3 = setTimeout(() => setPhase('done'), 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  const rarityInfo = RARITY_LABELS[hatched.rarity];
  const topCategories = Object.entries(hatched.categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat]) => cat);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" />

      <div className="relative z-10 flex flex-col items-center text-center px-8">
        {/* Shaking egg phase */}
        {phase === 'shake' && (
          <div className="text-8xl egg-shake-intense">🥚</div>
        )}

        {/* White flash */}
        {phase === 'flash' && (
          <div className="hatch-flash fixed inset-0 bg-white z-20" />
        )}

        {/* Creature reveal */}
        {(phase === 'reveal' || phase === 'done') && (
          <div className="animate-creature-bounce">
            <div className="text-[120px] leading-none mb-4 drop-shadow-2xl">
              {hatched.creature.emoji}
            </div>
            <h3 className="text-3xl font-black text-white mb-1 tracking-tight">
              {hatched.creature.name}
            </h3>
            <p className="text-sm font-bold text-white/60 uppercase tracking-widest mb-3">
              {hatched.creature.nameEn}
            </p>
            <span
              className={`inline-block px-4 py-1.5 rounded-full text-sm font-black ${
                hatched.rarity === 'legendary'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-amber-900'
                  : hatched.rarity === 'rare'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                  : 'bg-white/10 text-white/60'
              }`}
            >
              {rarityInfo.label}
            </span>

            {topCategories.length > 0 && (
              <div className="flex gap-2 justify-center mt-4 flex-wrap">
                {topCategories.map((cat) => (
                  <span
                    key={cat}
                    className="text-xs font-bold text-white/40 bg-white/10 px-3 py-1 rounded-full"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}

            {phase === 'done' && (
              <button
                onClick={onClose}
                className="mt-8 bg-gradient-to-r from-amber-400 to-orange-400 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl shadow-orange-500/30 active:scale-95 transition-all"
              >
                收進動物園 🎉
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function EggCard() {
  const currentEgg = useEggStore((s) => s.currentEgg);
  const creatures = useEggStore((s) => s.creatures);
  const startNewEgg = useEggStore((s) => s.startNewEgg);
  const hatch = useEggStore((s) => s.hatch);
  const [hatched, setHatched] = useState<HatchedCreature | null>(null);

  const isFirstTime = currentEgg === null && creatures.length === 0;

  const handleHatch = useCallback(() => {
    const result = hatch();
    if (result) setHatched(result);
  }, [hatch]);

  const handleCloseModal = useCallback(() => {
    setHatched(null);
    startNewEgg();
  }, [startNewEgg]);

  // First-time CTA
  if (isFirstTime) {
    return (
      <div className="px-6 mt-4">
        <button
          onClick={startNewEgg}
          className="w-full bg-gradient-to-r from-amber-100 to-orange-100 border-2 border-dashed border-amber-300 rounded-3xl p-6 text-center active:scale-[0.98] transition-all"
        >
          <div className="text-5xl mb-3">🥚</div>
          <p className="text-lg font-black text-amber-800 tracking-tight">
            開始孵蛋！
          </p>
          <p className="text-xs text-amber-600/70 mt-1">
            使用 APP 累積能量，孵出你的美食怪獸
          </p>
        </button>
      </div>
    );
  }

  // Auto-start next egg after hatching
  useEffect(() => {
    if (!currentEgg && creatures.length > 0) {
      startNewEgg();
    }
  }, [currentEgg, creatures.length, startNewEgg]);

  // No current egg but has creatures (between eggs, wait for effect)
  if (!currentEgg) {
    return null;
  }

  const stage = getEggStage(currentEgg.energy);
  const pct = Math.min(currentEgg.energy / HATCH_THRESHOLD, 1);
  const isReady = currentEgg.energy >= HATCH_THRESHOLD;

  // Crack visual overlays
  const crackEmoji =
    stage.phase === 0
      ? ''
      : stage.phase === 1
      ? '·'
      : stage.phase === 2
      ? '╱'
      : '⚡';

  return (
    <>
      <div className="px-6 mt-4">
        <div
          className={`relative overflow-hidden rounded-3xl p-5 border transition-all ${
            isReady
              ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 egg-ready-pulse'
              : 'bg-white/60 backdrop-blur-sm border-warm-200/50'
          }`}
        >
          <div className="flex items-center gap-4">
            {/* Egg */}
            <div className="relative">
              <div
                className={`text-5xl ${
                  stage.phase === 0
                    ? 'egg-wobble-slow'
                    : stage.phase === 1
                    ? 'egg-wobble-slow'
                    : stage.phase === 2
                    ? 'egg-wobble-medium'
                    : stage.phase === 3
                    ? 'egg-wobble-fast'
                    : 'egg-wobble-fast'
                }`}
              >
                🥚
              </div>
              {crackEmoji && (
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-lg pointer-events-none opacity-60">
                  {crackEmoji}
                </span>
              )}
              {stage.phase >= 3 && (
                <div className="absolute inset-0 rounded-full egg-glow" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-sm font-black text-slate-700 tracking-tight">
                  {stage.label}
                </p>
                <p className="text-xs font-bold text-slate-400">
                  {currentEgg.energy}/{HATCH_THRESHOLD}
                </p>
              </div>

              {/* Progress bar */}
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isReady
                      ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                      : 'bg-gradient-to-r from-amber-200 to-orange-300'
                  }`}
                  style={{ width: `${pct * 100}%` }}
                />
              </div>

              {/* Hatch button */}
              {isReady && (
                <button
                  onClick={handleHatch}
                  className="mt-3 w-full bg-gradient-to-r from-amber-400 to-orange-400 text-white py-2.5 rounded-xl font-black text-sm shadow-lg shadow-orange-200 active:scale-95 transition-all"
                >
                  孵化！🐣
                </button>
              )}
            </div>
          </div>

          {/* Creature count badge */}
          {creatures.length > 0 && (
            <div className="absolute top-3 right-3">
              <span className="text-[10px] font-bold text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">
                🏠 {creatures.length}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hatch Modal */}
      {hatched && <HatchModal hatched={hatched} onClose={handleCloseModal} />}
    </>
  );
}
