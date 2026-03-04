import { useState, useEffect } from 'react';
import { Share2, CheckCircle2, PieChart, LogOut, Plus, Star, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHistoryStore } from '../stores/historyStore';
import { useAuthStore } from '../stores/authStore';
import { getPhoto } from '../services/photoStorage';

function VisitPhoto({ photoId }: { photoId: string }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    getPhoto(photoId).then((data) => { if (data) setSrc(data); });
  }, [photoId]);
  if (!src) return null;
  return <img src={src} className="w-12 h-12 rounded-xl object-cover" alt="" />;
}

function MiniStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={10}
          className={s <= rating ? 'text-yellow-400 fill-current' : 'text-slate-200'}
        />
      ))}
    </span>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const visits = useHistoryStore((s) => s.visits);
  const logout = useAuthStore((s) => s.logout);
  const totalCost = visits.reduce((a, b) => a + (b.actualCost ?? b.cost), 0);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="animate-slide-in-left bg-app min-h-full bg-dots">
      {/* User Header */}
      <div className="p-8 pt-12 text-center">
        <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-50 rounded-[40px] mx-auto flex items-center justify-center mb-4 text-4xl shadow-xl border-4 border-white">
          🤠
        </div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter">
          美食探險家
        </h2>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
          Google 帳號已同步
        </p>
      </div>

      {/* Stats */}
      <div className="px-8 grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white/60 backdrop-blur-sm p-6 rounded-[32px] text-center border border-warm-200/50">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">
            本月探索
          </p>
          <p className="text-3xl font-black text-slate-800">{visits.length}</p>
        </div>
        <div className="bg-white/60 backdrop-blur-sm p-6 rounded-[32px] text-center border border-warm-200/50">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">
            預估花費
          </p>
          <p className="text-3xl font-black text-slate-800">${totalCost}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-8 flex gap-3 mb-10">
        <button
          onClick={() => navigate('/checkin')}
          className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center shadow-lg active:scale-95 transition-all"
        >
          <Plus size={18} className="mr-2" /> 新增紀錄
        </button>
        <button
          onClick={() => navigate('/profile/report')}
          className="flex-1 bg-orange-500 text-white py-4 rounded-2xl font-black flex items-center justify-center shadow-lg shadow-orange-200 active:scale-95 transition-all"
        >
          <PieChart size={18} className="mr-2" /> 月報分析
        </button>
        <button
          onClick={() => navigate('/settings')}
          className="bg-slate-100 text-slate-400 px-5 py-4 rounded-2xl font-bold active:scale-95 transition-all"
        >
          <Settings size={18} />
        </button>
        <button
          onClick={handleLogout}
          className="bg-slate-100 text-slate-400 px-5 py-4 rounded-2xl font-bold active:scale-95 transition-all"
        >
          <LogOut size={18} />
        </button>
      </div>

      {/* History */}
      <div className="px-8 pb-10">
        <h4 className="text-lg font-black text-slate-800 mb-6 flex items-center justify-between tracking-tight">
          <span>最近的足跡</span>
          <CheckCircle2 size={18} className="text-green-500" />
        </h4>
        <div className="space-y-4">
          {visits.length === 0 && (
            <div className="text-center py-8 text-slate-400">
              <p className="text-3xl mb-3">👣</p>
              <p className="font-bold text-sm">還沒有足跡</p>
            </div>
          )}
          {visits.map((h) => (
            <div
              key={h.id}
              className="bg-white/60 backdrop-blur-sm rounded-3xl p-5 border border-warm-200/50 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {h.photo && <VisitPhoto photoId={h.photo} />}
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">{h.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {h.date} · {h.category}
                    </p>
                    {h.rating && <MiniStars rating={h.rating} />}
                  </div>
                  {h.actualCost != null && h.actualCost > 0 && (
                    <p className="text-xs font-bold text-orange-500 mt-0.5">${h.actualCost}</p>
                  )}
                  {h.moodTags && h.moodTags.length > 0 && (
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {h.moodTags.map((tag) => (
                        <span key={tag} className="text-[10px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => navigate(`/share/${h.id}`)}
                className="bg-white p-3 rounded-2xl shadow-sm text-slate-400 hover:text-orange-500 transition-colors shrink-0 ml-2"
              >
                <Share2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
