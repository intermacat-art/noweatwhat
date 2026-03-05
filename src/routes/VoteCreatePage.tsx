import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, RefreshCw, Share2, Users } from 'lucide-react';
import { useCoords, useLocationStore } from '../stores/locationStore';
import { searchNearby } from '../services/placesService';
import type { Restaurant } from '../data/types';

export default function VoteCreatePage() {
  const navigate = useNavigate();
  const { lat, lng } = useCoords();
  const locationReady = useLocationStore((s) => s.ready);

  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [creating, setCreating] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [myName, setMyName] = useState('');

  // Fetch random restaurants
  const fetchRestaurants = () => {
    if (!locationReady) return;
    setLoading(true);
    searchNearby(lat, lng, undefined, 1500)
      .then((places) => {
        // Shuffle and take 6
        const shuffled = [...places].sort(() => Math.random() - 0.5).slice(0, 6);
        setRestaurants(shuffled);
        // Auto-select first 3-4
        const autoSelect = new Set(shuffled.slice(0, Math.min(4, shuffled.length)).map((_, i) => i));
        setSelected(autoSelect);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(fetchRestaurants, [lat, lng, locationReady]);

  const toggleSelect = (idx: number) => {
    const next = new Set(selected);
    if (next.has(idx)) next.delete(idx);
    else next.add(idx);
    setSelected(next);
  };

  const handleCreate = async () => {
    const options = [...selected].map((idx) => {
      const r = restaurants[idx];
      return {
        name: r.name,
        image: r.image,
        rating: r.rating,
        dist: r.dist,
        placeId: r.placeId,
      };
    });
    if (options.length < 2) return;

    setCreating(true);
    try {
      const res = await fetch('/api/vote/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '今天吃什麼？',
          options,
          creatorName: myName || '匿名',
        }),
      });
      const data = await res.json();
      if (data.voteId) {
        const url = `${window.location.origin}/vote/${data.voteId}`;
        setShareUrl(url);
      }
    } catch {
      alert('建立投票失敗，請稍後再試');
    }
    setCreating(false);
  };

  const handleShare = async () => {
    if (!shareUrl) return;
    const text = `幫我們決定今天吃什麼！🎲\n${shareUrl}`;
    if (navigator.share) {
      await navigator.share({ title: '今天吃什麼？', text, url: shareUrl });
    } else {
      await navigator.clipboard.writeText(text);
      alert('連結已複製！');
    }
  };

  if (shareUrl) {
    return (
      <div className="p-4 animate-fade-in">
        <div className="text-center py-16">
          <p className="text-6xl mb-6">🎉</p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tighter mb-3">
            投票已建立！
          </h3>
          <p className="text-slate-500 text-sm font-bold mb-8 px-8">
            分享連結給朋友，大家一起投票決定今天吃什麼
          </p>
          <div className="mx-6 bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-6">
            <p className="text-xs text-slate-400 font-bold mb-1">投票連結</p>
            <p className="text-sm text-slate-800 font-bold break-all">{shareUrl}</p>
          </div>
          <button
            onClick={handleShare}
            className="bg-green-500 text-white px-10 py-4 rounded-3xl font-black text-lg shadow-lg flex items-center justify-center mx-auto gap-2 active:scale-95 transition-all"
          >
            <Share2 size={20} /> 分享給朋友
          </button>
          <button
            onClick={() => navigate(`/vote/${shareUrl.split('/').pop()}`)}
            className="mt-4 text-orange-500 font-bold text-sm underline"
          >
            查看投票頁面
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 animate-slide-in-right">
      <div className="px-2 flex items-center gap-2 mb-2">
        <button
          onClick={() => navigate('/')}
          className="p-2 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm border border-warm-200/50"
        >
          <ChevronRight className="rotate-180" size={18} />
        </button>
        <h2 className="text-xl font-black text-slate-800 tracking-tighter flex-1">
          <Users size={20} className="inline mr-2" />
          建立投票
        </h2>
        <button
          onClick={fetchRestaurants}
          className="p-2 bg-slate-100 rounded-xl"
          title="換一批"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="mx-2 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3">
        <p className="text-xs text-orange-700 font-bold">
          選擇 2-4 家餐廳，建立投票讓朋友一起決定！
        </p>
      </div>

      <div className="mx-2">
        <input
          type="text"
          placeholder="你的名字（選填）"
          value={myName}
          onChange={(e) => setMyName(e.target.value)}
          className="w-full bg-white/70 border border-warm-200/50 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 placeholder-slate-300"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/70 rounded-[32px] p-4 flex gap-4 animate-pulse">
              <div className="w-20 h-20 rounded-2xl bg-slate-200" />
              <div className="flex-1 py-2">
                <div className="h-5 bg-slate-200 rounded w-3/4 mb-2" />
                <div className="h-3 bg-slate-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {restaurants.map((r, idx) => (
            <button
              key={r.placeId || idx}
              onClick={() => toggleSelect(idx)}
              className={`w-full bg-white/70 backdrop-blur-sm rounded-[32px] p-4 flex gap-4 shadow-sm border-2 transition-all text-left ${
                selected.has(idx)
                  ? 'border-orange-500 bg-orange-50/50'
                  : 'border-transparent'
              }`}
            >
              <img
                src={r.image}
                className="w-20 h-20 rounded-2xl object-cover bg-slate-100"
                alt={r.name}
              />
              <div className="flex-1 flex flex-col justify-center">
                <h3 className="font-bold text-slate-800 leading-tight">{r.name}</h3>
                <p className="text-xs text-slate-400 font-bold mt-1">
                  ⭐ {r.rating} · {r.priceStr} · {r.dist}
                </p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center self-center ${
                selected.has(idx) ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-300'
              }`}>
                {selected.has(idx) && <span className="text-xs font-black">✓</span>}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Create button */}
      <div className="px-2 pb-8">
        <button
          onClick={handleCreate}
          disabled={selected.size < 2 || creating}
          className={`w-full py-5 rounded-3xl font-black text-lg shadow-lg transition-all ${
            selected.size >= 2
              ? 'bg-slate-900 text-white active:scale-95'
              : 'bg-slate-200 text-slate-400'
          }`}
        >
          {creating ? '建立中...' : `建立投票（已選 ${selected.size} 家）`}
        </button>
      </div>
    </div>
  );
}
