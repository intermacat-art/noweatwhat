import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { mockRestaurants } from '../data/restaurants';
import { useFilterStore } from '../stores/filterStore';

export default function DiceResultPage() {
  const navigate = useNavigate();
  const { price, tags } = useFilterStore();
  const [rolling, setRolling] = useState(true);
  const [diceEmoji, setDiceEmoji] = useState('🎲');

  const candidates = useMemo(() => {
    return mockRestaurants.filter((r) => {
      if (price.length > 0 && !price.includes(r.priceLevel)) return false;
      if (tags.length > 0 && !tags.every((tag) => r.tags.includes(tag)))
        return false;
      return true;
    });
  }, [price, tags]);

  const selected = useMemo(() => {
    if (candidates.length === 0) return null;
    return candidates[Math.floor(Math.random() * candidates.length)];
  }, [candidates]);

  useEffect(() => {
    const emojis = ['🎲', '🎰', '🍀', '✨', '🔥'];
    let i = 0;
    const interval = setInterval(() => {
      setDiceEmoji(emojis[i % emojis.length]);
      i++;
    }, 150);
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setRolling(false);
    }, 2000);
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  if (!selected) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <p className="text-6xl mb-6">😢</p>
        <p className="text-xl font-black text-slate-800 mb-4">
          沒有符合條件的餐廳
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-orange-500 text-white px-8 py-4 rounded-3xl font-black"
        >
          回首頁
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-full p-8 text-center">
      {rolling ? (
        <div className="animate-bounce">
          <p className="text-8xl mb-6">{diceEmoji}</p>
          <p className="text-xl font-black text-slate-800 tracking-tighter">
            命運正在轉動...
          </p>
        </div>
      ) : (
        <div className="animate-fade-in w-full max-w-sm">
          <p className="text-sm font-black text-orange-500 uppercase tracking-widest mb-4">
            命運之選
          </p>
          <div
            className="bg-white rounded-[40px] overflow-hidden shadow-2xl border border-slate-100 cursor-pointer active:scale-[0.98] transition-all"
            onClick={() => navigate(`/restaurant/${selected.id}`)}
          >
            <img
              src={selected.image}
              className="w-full h-48 object-cover"
              alt={selected.name}
            />
            <div className="p-6">
              <h2 className="text-2xl font-black text-slate-800 tracking-tighter mb-2">
                {selected.name}
              </h2>
              <div className="flex items-center justify-center gap-3 text-sm font-bold text-slate-400">
                <span className="text-orange-500 flex items-center">
                  <Star size={14} className="mr-1 fill-current" />
                  {selected.rating}
                </span>
                <span>{selected.priceStr}</span>
                <span>{selected.dist}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-4 mt-8">
            <button
              onClick={() => {
                setRolling(true);
                setTimeout(() => setRolling(false), 2000);
              }}
              className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-3xl font-black"
            >
              🎲 再骰一次
            </button>
            <button
              onClick={() => navigate(`/restaurant/${selected.id}`)}
              className="flex-1 bg-orange-500 text-white py-4 rounded-3xl font-black shadow-lg"
            >
              就決定是你了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
