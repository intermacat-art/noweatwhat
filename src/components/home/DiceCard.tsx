import { Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DiceCard() {
  const navigate = useNavigate();

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
    </div>
  );
}
