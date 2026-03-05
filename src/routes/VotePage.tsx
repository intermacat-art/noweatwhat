import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Users, Check, Crown } from 'lucide-react';

interface VoteOption {
  name: string;
  image: string;
  rating: number;
  dist: string;
  placeId?: string;
}

interface VoteData {
  voteId: string;
  title: string;
  creatorName: string;
  options: VoteOption[];
  votes: Record<string, string[]>; // { "0": ["Alice", "Bob"], "1": ["Charlie"] }
}

export default function VotePage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<VoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [myName, setMyName] = useState('');
  const [myVote, setMyVote] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/vote/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message || '投票不存在或已過期');
        setLoading(false);
      });
  }, [id]);

  const handleVote = async () => {
    if (myVote === null || !myName.trim() || !id) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/vote/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionIndex: myVote, voterName: myName.trim() }),
      });
      const result = await res.json();
      if (result.votes) {
        setData((prev) => prev ? { ...prev, votes: result.votes } : null);
        setSubmitted(true);
      }
    } catch {
      alert('投票失敗');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center">
        <div className="text-center animate-pulse">
          <p className="text-6xl mb-4">🎲</p>
          <p className="text-slate-500 font-bold">載入投票...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-6xl mb-4">😢</p>
          <p className="text-xl font-black text-slate-800 mb-2">{error || '投票不存在'}</p>
          <a href="/" className="text-orange-500 font-bold underline">前往現在要吃啥</a>
        </div>
      </div>
    );
  }

  // Count votes
  const voteCounts: Record<number, number> = {};
  const voterNames: Record<number, string[]> = {};
  let totalVotes = 0;
  for (const [key, names] of Object.entries(data.votes)) {
    const idx = Number(key);
    voteCounts[idx] = (names || []).length;
    voterNames[idx] = names || [];
    totalVotes += (names || []).length;
  }
  const maxVotes = Math.max(...Object.values(voteCounts), 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      {/* Header */}
      <div className="p-6 text-center">
        <p className="text-sm font-bold text-orange-500 tracking-widest uppercase mb-1">群組投票</p>
        <h1 className="text-2xl font-black text-slate-800 tracking-tighter">
          {data.title}
        </h1>
        <p className="text-xs text-slate-400 font-bold mt-1">
          {data.creatorName} 發起 · {totalVotes} 人已投票
        </p>
      </div>

      {/* Options */}
      <div className="px-4 space-y-3">
        {data.options.map((opt, idx) => {
          const count = voteCounts[idx] || 0;
          const isWinner = count === maxVotes && maxVotes > 0;
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
          const isMyChoice = myVote === idx;
          const voters = voterNames[idx] || [];

          return (
            <button
              key={idx}
              onClick={() => !submitted && setMyVote(idx)}
              disabled={submitted}
              className={`w-full rounded-3xl p-4 flex gap-4 shadow-sm transition-all text-left relative overflow-hidden ${
                isMyChoice && !submitted
                  ? 'bg-orange-500 text-white border-2 border-orange-600'
                  : isWinner && submitted
                  ? 'bg-orange-50 border-2 border-orange-400'
                  : 'bg-white border-2 border-transparent'
              }`}
            >
              {/* Vote percentage bar */}
              {submitted && (
                <div
                  className="absolute inset-y-0 left-0 bg-orange-100/60 transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              )}
              <div className="relative flex gap-4 w-full">
                <img
                  src={opt.image}
                  className="w-20 h-20 rounded-2xl object-cover bg-slate-100"
                  alt={opt.name}
                />
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    {isWinner && submitted && <Crown size={14} className="text-orange-500" />}
                    <h3 className={`font-bold leading-tight ${isMyChoice && !submitted ? 'text-white' : 'text-slate-800'}`}>
                      {opt.name}
                    </h3>
                  </div>
                  <p className={`text-xs font-bold mt-1 ${isMyChoice && !submitted ? 'text-white/80' : 'text-slate-400'}`}>
                    <Star size={10} className="inline mr-1" />
                    {opt.rating} · {opt.dist}
                  </p>
                  {submitted && voters.length > 0 && (
                    <p className="text-[10px] text-slate-400 font-bold mt-1">
                      {voters.join('、')}
                    </p>
                  )}
                </div>
                {submitted ? (
                  <div className="self-center text-right">
                    <p className={`text-lg font-black ${isWinner ? 'text-orange-500' : 'text-slate-300'}`}>
                      {pct}%
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold">{count} 票</p>
                  </div>
                ) : isMyChoice ? (
                  <div className="self-center w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <Check size={14} className="text-orange-500" />
                  </div>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>

      {/* Vote action */}
      {!submitted ? (
        <div className="p-6 space-y-3">
          <input
            type="text"
            placeholder="你的名字"
            value={myName}
            onChange={(e) => setMyName(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-800 placeholder-slate-300"
          />
          <button
            onClick={handleVote}
            disabled={myVote === null || !myName.trim() || submitting}
            className={`w-full py-5 rounded-3xl font-black text-lg shadow-lg transition-all ${
              myVote !== null && myName.trim()
                ? 'bg-slate-900 text-white active:scale-95'
                : 'bg-slate-200 text-slate-400'
            }`}
          >
            {submitting ? '投票中...' : '投票！'}
          </button>
        </div>
      ) : (
        <div className="p-6 text-center">
          <p className="text-green-500 font-bold mb-4 flex items-center justify-center gap-1">
            <Check size={16} /> 投票成功！
          </p>
          <p className="text-slate-400 text-xs font-bold mb-4">
            分享此頁面讓更多朋友來投票
          </p>
          <button
            onClick={() => {
              const text = `幫我們決定今天吃什麼！🎲\n${window.location.href}`;
              if (navigator.share) {
                navigator.share({ title: data.title, text, url: window.location.href });
              } else {
                navigator.clipboard.writeText(text);
                alert('連結已複製！');
              }
            }}
            className="bg-green-500 text-white px-8 py-3 rounded-2xl font-black inline-flex items-center gap-2"
          >
            <Users size={16} /> 分享投票
          </button>
          <div className="mt-6">
            <a href="/" className="text-orange-500 font-bold text-sm underline">
              前往現在要吃啥 →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
