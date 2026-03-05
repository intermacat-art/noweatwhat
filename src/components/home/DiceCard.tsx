import { Utensils, Flame } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChallengeStore } from '../../stores/challengeStore';

export default function DiceCard() {
  const navigate = useNavigate();
  const { active, days, getCurrentStreak, getTodayEntry } = useChallengeStore();
  const todayDone = getTodayEntry() !== null;

  return (
    <div className="px-6 mb-10 space-y-4">
      {/* Dice card */}
      <div className="bg-slate-900 p-8 rounded-[48px] text-white shadow-2xl relative overflow-hidden group">
        <div className="relative z-10">
          <h3 className="text-2xl font-black mb-2 tracking-tight">
            真的選不出來？
          </h3>
          <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">
            我們根據你的偏好，隨機從附近挑選一家餐廳。
          </p>
          <button
            onClick={() => navigate('/dice-result')}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-5 rounded-3xl font-black text-xl shadow-lg shadow-orange-500/20 active:translate-y-1 transition-all"
          >
            🎲 幫我骰一個
          </button>
        </div>
        <Utensils
          className="absolute -right-6 -bottom-6 text-white opacity-5 rotate-12"
          size={200}
        />
      </div>

      {/* Challenge card */}
      <div
        onClick={() => navigate('/challenge')}
        className="bg-gradient-to-r from-orange-500 to-pink-500 p-6 rounded-[32px] text-white shadow-lg relative overflow-hidden cursor-pointer active:scale-[0.98] transition-all"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame size={20} />
              <span className="font-black text-lg">命運挑戰</span>
            </div>
            {active ? (
              <p className="text-white/80 text-sm font-bold">
                Day {days.length} · 連續 {getCurrentStreak()} 天
                {todayDone ? ' · 今日完成 ✓' : ' · 今天還沒骰！'}
              </p>
            ) : (
              <p className="text-white/80 text-sm font-bold">
                連續每天讓命運決定午餐！
              </p>
            )}
          </div>
          <span className="text-3xl">{active ? '🔥' : '🎯'}</span>
        </div>
      </div>
    </div>
  );
}
