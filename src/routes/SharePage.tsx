import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Star } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useHistoryStore } from '../stores/historyStore';
import { useEggStore } from '../stores/eggStore';
import { getPhoto } from '../services/photoStorage';

function ShareStars({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-0.5 justify-center">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= rating ? 'text-yellow-400 fill-current' : 'text-slate-300'}
        />
      ))}
    </span>
  );
}

export default function SharePage() {
  const { historyId } = useParams<{ historyId: string }>();
  const navigate = useNavigate();
  const visits = useHistoryStore((s) => s.visits);
  const visit = visits.find((v) => v.id === historyId);
  const addEnergy = useEggStore((s) => s.addEnergy);
  const cardRef = useRef<HTMLDivElement>(null);
  const sharedRef = useRef(false);
  const [quote, setQuote] = useState('');
  const [userPhoto, setUserPhoto] = useState<string | null>(null);

  useEffect(() => {
    if (visit?.quote) setQuote(visit.quote);
    else setQuote('今天的晚餐太完美了，一定要再來吃一次！');
  }, [visit?.quote]);

  useEffect(() => {
    if (visit?.photo) {
      getPhoto(visit.photo).then((data) => { if (data) setUserPhoto(data); });
    }
  }, [visit?.photo]);

  if (!visit) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        找不到此紀錄
      </div>
    );
  }

  const displayImage = userPhoto || visit.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';

  const handleSave = async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        quality: 0.95,
      });
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], '現在要吃啥-分享.png', {
        type: 'image/png',
      });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: '現在要吃啥',
          text: '看看我吃了什麼！',
          files: [file],
        });
      } else {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = '現在要吃啥-分享.png';
        a.click();
      }
      if (!sharedRef.current) {
        sharedRef.current = true;
        addEnergy(1);
      }
    } catch {
      // User cancelled share or error
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-[#2C2C2C] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Share Card */}
        <div
          ref={cardRef}
          className="bg-[#FAF9F6] w-full aspect-[9/16] shadow-2xl relative flex flex-col p-8 overflow-hidden rounded-sm border-[12px] border-white"
        >
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]" />
          {/* Masking Tape */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-8 bg-amber-100/80 -rotate-2 z-10 shadow-sm flex items-center justify-center border-b border-amber-200">
            <span className="text-[10px] text-amber-800 font-bold opacity-30 tracking-tighter">
              MASKING TAPE
            </span>
          </div>
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex justify-between items-end border-b-2 border-slate-200 pb-3 mb-6">
              <div className="font-serif">
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  Food Footprint
                </p>
                <p className="text-xl font-black text-slate-800">
                  {visit.date}
                </p>
              </div>
              <div className="text-[10px] font-black bg-slate-900 text-white px-2 py-1 rounded">
                TAIWAN
              </div>
            </div>
            <div className="bg-white p-3 shadow-lg -rotate-1 mb-6">
              <img
                src={displayImage}
                className="w-full aspect-square object-cover grayscale-[0.2]"
                alt="Food"
                crossOrigin="anonymous"
              />
              <p className="font-serif text-center text-sm font-bold text-slate-600 mt-4 tracking-tight">
                @ {visit.name}
              </p>
              {visit.rating && (
                <div className="mt-2">
                  <ShareStars rating={visit.rating} />
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col justify-center px-4 relative">
              <div className="absolute top-0 left-0 text-5xl font-serif text-orange-200 opacity-50">
                "
              </div>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 focus:outline-none font-serif text-xl italic text-slate-700 leading-relaxed text-center h-24 resize-none"
              />
              <div className="mt-4 flex justify-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                  #{visit.category}
                </span>
                {visit.moodTags?.map((tag) => (
                  <span key={tag} className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                  #口袋名單
                </span>
              </div>
            </div>
            <div className="mt-auto pt-6 flex flex-col items-center opacity-40">
              <div className="h-px w-12 bg-slate-300 mb-4" />
              <p className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase">
                現在要吃啥 . App
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 w-full mt-8">
          <button
            onClick={() => navigate('/profile')}
            className="flex-1 bg-white/10 text-white py-4 rounded-2xl font-bold backdrop-blur-md"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-[2] bg-orange-500 text-white py-4 px-8 rounded-2xl font-black flex items-center justify-center shadow-lg"
          >
            <Download size={20} className="mr-2" /> 儲存圖片
          </button>
        </div>
      </div>
    </div>
  );
}
