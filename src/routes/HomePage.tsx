import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import CategoryGrid from '../components/home/CategoryGrid';
import EggCard from '../components/home/EggCard';
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
      <EggCard />
      <DiceCard />

    </main>
  );
}
