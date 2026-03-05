import { useNavigate } from 'react-router-dom';
import { ChevronRight, Flame, Trophy, Share2 } from 'lucide-react';
import { useChallengeStore, type ChallengeDay } from '../stores/challengeStore';
import { useRef, useCallback } from 'react';
import { toPng } from 'html-to-image';

function ChallengeCard({ day, isLatest }: { day: ChallengeDay; isLatest: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        width: 360,
        height: 640,
      });

      if (navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `challenge-day${day.day}.png`, { type: 'image/png' });
        await navigator.share({
          title: `命運挑戰 Day ${day.day}`,
          text: `我正在挑戰連續讓命運決定午餐！Day ${day.day}：${day.restaurantName}`,
          files: [file],
        });
      } else {
        const link = document.createElement('a');
        link.download = `challenge-day${day.day}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch { /* cancelled */ }
  }, [day]);

  return (
    <div className="relative">
      {/* Shareable card */}
      <div
        ref={cardRef}
        className="bg-gradient-to-br from-orange-500 to-pink-500 rounded-3xl overflow-hidden shadow-lg"
        style={{ width: 360, height: 640 }}
      >
        <div className="p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={20} />
            <span className="font-black text-lg">命運挑戰</span>
          </div>
          <p className="text-white/80 text-sm font-bold">Day {day.day} · {day.date}</p>
        </div>
        <div className="px-6">
          <img
            src={day.restaurantImage}
            className="w-full h-52 object-cover rounded-2xl"
            alt={day.restaurantName}
            crossOrigin="anonymous"
          />
        </div>
        <div className="p-6 text-white">
          <h3 className="text-2xl font-black tracking-tighter mb-2">
            {day.restaurantName}
          </h3>
          <p className="text-white/80 font-bold text-sm">
            ⭐ {day.rating} · {day.priceStr} · {day.dist}
          </p>
          {day.category && (
            <span className="inline-block mt-2 bg-white/20 px-3 py-1 rounded-full text-xs font-bold">
              {day.category}
            </span>
          )}
        </div>
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white/60">
          <span className="text-xs font-bold">noweatwhat.vercel.app</span>
          <span className="text-xs font-bold">你也來挑戰 →</span>
        </div>
      </div>

      {/* Share button */}
      {isLatest && (
        <button
          onClick={handleShare}
          className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-xl text-white"
        >
          <Share2 size={18} />
        </button>
      )}
    </div>
  );
}

export default function ChallengePage() {
  const navigate = useNavigate();
  const { active, days, startChallenge, endChallenge, getCurrentStreak, getTodayEntry } = useChallengeStore();
  const streak = getCurrentStreak();
  const todayDone = getTodayEntry() !== null;

  return (
    <div className="p-4 space-y-6 animate-slide-in-right">
      {/* Header */}
      <div className="px-2 flex items-center gap-2 mb-2">
        <button
          onClick={() => navigate('/')}
          className="p-2 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-warm-200/50"
        >
          <ChevronRight className="rotate-180" size={18} />
        </button>
        <h2 className="text-xl font-black text-slate-800 tracking-tighter flex-1">
          命運挑戰
        </h2>
      </div>

      {/* Status */}
      {!active ? (
        <div className="text-center py-10">
          <p className="text-6xl mb-6">🎲</p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-3">
            命運挑戰
          </h3>
          <p className="text-slate-500 font-bold text-sm mb-2 px-8">
            連續每天讓命運幫你決定吃什麼！
          </p>
          <p className="text-slate-400 text-xs mb-8 px-8">
            每天骰一次餐廳，打卡記錄，產生分享卡片。看你能堅持幾天！
          </p>
          {days.length > 0 && (
            <div className="mb-6 bg-orange-50 border border-orange-200 rounded-2xl mx-6 p-4">
              <p className="text-orange-700 font-bold text-sm">
                上次挑戰：連續 {days.length} 天
              </p>
            </div>
          )}
          <button
            onClick={() => {
              startChallenge();
              navigate('/dice-result?challenge=1');
            }}
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-10 py-4 rounded-3xl font-black text-lg shadow-xl active:scale-95 transition-all"
          >
            開始挑戰！
          </button>
        </div>
      ) : (
        <>
          {/* Streak banner */}
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-3xl p-6 text-white shadow-lg mx-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Flame size={24} />
                  <span className="text-3xl font-black">Day {days.length}</span>
                </div>
                <p className="text-white/80 font-bold text-sm">
                  連續 {streak} 天 · {todayDone ? '今日已完成' : '今天還沒骰！'}
                </p>
              </div>
              <Trophy size={40} className="text-white/30" />
            </div>
          </div>

          {/* Today's action */}
          {!todayDone && (
            <div className="mx-2">
              <button
                onClick={() => navigate('/dice-result?challenge=1')}
                className="w-full bg-slate-900 text-white py-5 rounded-3xl font-black text-lg shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                🎲 今日骰餐廳
              </button>
            </div>
          )}

          {/* History cards */}
          <div className="space-y-6 px-2 overflow-x-auto">
            {[...days].reverse().map((day, i) => (
              <ChallengeCard key={day.date} day={day} isLatest={i === 0} />
            ))}
          </div>

          {/* End challenge */}
          <div className="text-center pb-8">
            <button
              onClick={endChallenge}
              className="text-slate-400 text-sm font-bold underline"
            >
              結束挑戰
            </button>
          </div>
        </>
      )}
    </div>
  );
}
