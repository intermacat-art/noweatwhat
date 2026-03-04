import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Camera, ChevronRight, Check } from 'lucide-react';
import { mockRestaurants } from '../data/restaurants';
import { useHistoryStore } from '../stores/historyStore';
import { savePhoto } from '../services/photoStorage';
import StarRating from '../components/profile/StarRating';
import QuickAmountPicker from '../components/profile/QuickAmountPicker';
import MoodTags from '../components/profile/MoodTags';

export default function CheckInPage() {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const addCheckIn = useHistoryStore((s) => s.addCheckIn);

  const restaurant = restaurantId
    ? mockRestaurants.find((r) => r.id === Number(restaurantId))
    : null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [name, setName] = useState(restaurant?.name ?? '');
  const [rating, setRating] = useState(0);
  const [amount, setAmount] = useState<number | null>(null);
  const [moodTags, setMoodTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      let photoId: string | undefined;
      if (photoPreview && photoFile) {
        photoId = `photo-${Date.now()}`;
        await savePhoto(photoId, photoPreview);
      }

      addCheckIn({
        restaurantId: restaurant?.id,
        name: name.trim(),
        category: restaurant?.category ?? '小吃',
        image: restaurant?.image,
        rating: rating || undefined,
        photoId,
        actualCost: amount ?? undefined,
        moodTags: moodTags.length > 0 ? moodTags : undefined,
      });

      navigate('/profile');
    } catch {
      setSaving(false);
    }
  };

  const canSave = name.trim().length > 0;

  return (
    <div className="animate-slide-in-bottom bg-white min-h-full">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-slate-100 rounded-xl"
        >
          <ChevronRight className="rotate-180" size={20} />
        </button>
        <h1 className="text-lg font-black text-slate-800 tracking-tight">用餐打卡</h1>
        <div className="w-10" />
      </div>

      <div className="p-6 space-y-8 pb-32">
        {/* Photo */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handlePhotoChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full aspect-[4/3] rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-orange-300 active:scale-[0.98]"
          >
            {photoPreview ? (
              <img
                src={photoPreview}
                className="w-full h-full object-cover rounded-3xl"
                alt="Preview"
              />
            ) : (
              <>
                <Camera size={48} className="text-slate-300 mb-3" />
                <p className="text-sm font-bold text-slate-400">拍照 / 選照片</p>
              </>
            )}
          </button>
        </div>

        {/* Restaurant Name */}
        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">
            餐廳名稱
          </label>
          {restaurant ? (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="font-bold text-slate-800 text-lg">{restaurant.name}</p>
              <p className="text-xs text-slate-400 font-bold mt-1">{restaurant.category} · {restaurant.address}</p>
            </div>
          ) : (
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="輸入餐廳名稱"
              className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
          )}
        </div>

        {/* Star Rating */}
        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">
            評分
          </label>
          <div className="flex justify-center">
            <StarRating value={rating} onChange={setRating} />
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">
            花費
          </label>
          <QuickAmountPicker value={amount} onChange={setAmount} />
        </div>

        {/* Mood Tags */}
        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">
            心得
          </label>
          <MoodTags selected={moodTags} onChange={setMoodTags} />
        </div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-40 pb-safe">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className={`w-full py-5 rounded-[28px] font-black text-xl flex items-center justify-center transition-all active:scale-95 ${
              canSave
                ? 'bg-orange-500 text-white shadow-2xl shadow-orange-200'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <span className="animate-pulse">儲存中...</span>
            ) : (
              <>
                <Check size={24} className="mr-2" /> 完成打卡
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
