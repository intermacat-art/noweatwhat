import { useNavigate } from 'react-router-dom';
import { categories } from '../../data/categories';

export default function CategoryGrid() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-4 gap-3 p-6">
      {categories.map((cat) => (
        <button
          key={cat.name}
          onClick={() => navigate(`/category/${cat.name}`)}
          className="flex flex-col items-center justify-center aspect-square bg-white/70 backdrop-blur-sm rounded-3xl shadow-sm border border-warm-200/50 active:scale-90 transition-all hover:bg-white/90"
        >
          <span className="text-2xl mb-1">{cat.icon}</span>
          <span className="text-xs text-slate-600 font-bold">{cat.name}</span>
        </button>
      ))}
    </div>
  );
}
