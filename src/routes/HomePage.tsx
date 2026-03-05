import { useNavigate } from 'react-router-dom';
import { Users, Sparkles } from 'lucide-react';
import CategoryGrid from '../components/home/CategoryGrid';
import DiceCard from '../components/home/DiceCard';
import { useRecommendation } from '../hooks/useRecommendation';

export default function HomePage() {
  const navigate = useNavigate();
  const { suggestion, visitCount, favoriteCategory } = useRecommendation();

  return (
    <main className="animate-fade-in">
      {/* Personalized suggestion */}
      {visitCount >= 2 && (
        <div className="px-6 pt-4">
          <div className="bg-gradient-to-r from-violet-50 to-orange-50 border border-violet-200/50 rounded-2xl px-4 py-3 flex items-center gap-3">
            <Sparkles size={16} className="text-violet-500 shrink-0" />
            <p className="text-xs text-slate-600 font-bold flex-1">{suggestion}</p>
            {favoriteCategory && (
              <button
                onClick={() => navigate(`/category/${favoriteCategory}`)}
                className="text-[10px] text-orange-500 font-black shrink-0"
              >
                探索 →
              </button>
            )}
          </div>
        </div>
      )}

      <CategoryGrid />
      <DiceCard />

      {/* Group vote entry */}
      <div className="px-6 mb-10">
        <button
          onClick={() => navigate('/vote/create')}
          className="w-full bg-white/70 backdrop-blur-sm border border-warm-200/50 rounded-[32px] p-6 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-all"
        >
          <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
            <Users size={24} className="text-green-600" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="font-black text-slate-800 tracking-tighter">
              朋友一起決定
            </h3>
            <p className="text-xs text-slate-400 font-bold mt-0.5">
              建立投票，分享給朋友一起選餐廳
            </p>
          </div>
          <span className="text-2xl">🗳️</span>
        </button>
      </div>
    </main>
  );
}
