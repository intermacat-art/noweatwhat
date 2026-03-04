import { Utensils, Search, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFilterStore } from '../../stores/filterStore';

export default function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setShowModal } = useFilterStore();

  const isHome = location.pathname === '/' || location.pathname.startsWith('/category');
  const isProfile = location.pathname === '/profile';

  return (
    <nav className="glass-warm border-t border-warm-200/40 px-12 py-6 flex justify-around items-center absolute bottom-0 left-0 right-0 z-40 pb-safe">
      <button
        onClick={() => navigate('/')}
        className={`flex flex-col items-center gap-1 ${
          isHome ? 'text-orange-500' : 'text-slate-300'
        }`}
      >
        <Utensils size={26} strokeWidth={isHome ? 3 : 2} />
        <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
      </button>
      <div
        className="bg-slate-900 p-4 rounded-[28px] shadow-xl shadow-slate-200 -mt-12 border-8 border-white cursor-pointer active:scale-90 transition-all"
        onClick={() => setShowModal(true)}
      >
        <Search size={24} className="text-white" />
      </div>
      <button
        onClick={() => navigate('/profile')}
        className={`flex flex-col items-center gap-1 ${
          isProfile ? 'text-orange-500' : 'text-slate-300'
        }`}
      >
        <User size={26} strokeWidth={isProfile ? 3 : 2} />
        <span className="text-[9px] font-black uppercase tracking-widest">Me</span>
      </button>
    </nav>
  );
}
