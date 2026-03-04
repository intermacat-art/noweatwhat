import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronRight,
  Star,
  MapPin,
  Car,
  Heart,
  Navigation,
  ExternalLink,
  Youtube,
  BookOpen,
  Clock,
  ChevronLeft,
  Camera,
} from 'lucide-react';
import { mockRestaurants } from '../data/restaurants';
import { useHistoryStore } from '../stores/historyStore';
import { useParking } from '../hooks/useParking';
import {
  navigateToRestaurant,
  navigateToParking,
  openGoogleReviews,
} from '../services/navigationService';
import { getDetail, getPhotoUrl } from '../services/placesService';
import type { Restaurant } from '../data/types';
import type { GooglePlaceDetail } from '../services/placesService';

function PhotoCarousel({ photoRefs }: { photoRefs: string[] }) {
  const [current, setCurrent] = useState(0);
  if (photoRefs.length === 0) return null;

  return (
    <div className="relative">
      <img
        src={getPhotoUrl(photoRefs[current], 800)}
        className="w-full h-80 object-cover"
        alt="Restaurant"
      />
      {photoRefs.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c - 1 + photoRefs.length) % photoRefs.length); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-md p-2 rounded-full text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setCurrent((c) => (c + 1) % photoRefs.length); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-md p-2 rounded-full text-white"
          >
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {photoRefs.map((_, i) => (
              <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-white scale-125' : 'bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const addVisit = useHistoryStore((s) => s.addVisit);

  // Check if this is a Google Place (passed via route state)
  const stateRest = (location.state as { restaurant?: Restaurant })?.restaurant;
  const isGooglePlace = id?.startsWith('google-');
  const placeId = isGooglePlace ? id!.replace('google-', '') : null;

  const rest = isGooglePlace ? stateRest : mockRestaurants.find((r) => r.id === Number(id));

  const [googleDetail, setGoogleDetail] = useState<GooglePlaceDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (placeId) {
      setDetailLoading(true);
      getDetail(placeId)
        .then(setGoogleDetail)
        .catch(() => {})
        .finally(() => setDetailLoading(false));
    }
  }, [placeId]);

  const mockForParking = rest && !isGooglePlace ? rest : null;
  const { lots: parkingLots, loading: parkingLoading, source: parkingSource } = useParking(mockForParking);

  if (!rest && !isGooglePlace) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        找不到此餐廳
      </div>
    );
  }

  if (!rest && isGooglePlace && !googleDetail) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 animate-pulse">
        載入中...
      </div>
    );
  }

  const displayName = googleDetail?.name || rest?.name || '';
  const displayRating = googleDetail?.rating || rest?.rating || 0;
  const displayAddress = googleDetail?.address || rest?.address || '';
  const displayPhotos = googleDetail?.photoRefs || rest?.googlePhotos || [];
  const openingHours = googleDetail?.openingHours || [];
  const userRatingsTotal = googleDetail?.userRatingsTotal || rest?.userRatingsTotal || 0;
  const reviews = googleDetail?.reviews || [];
  const openNow = googleDetail?.openNow ?? rest?.openNow;

  const handleNavigate = () => {
    if (rest) addVisit(rest);
    if (rest) navigateToRestaurant(rest);
    else if (googleDetail) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${googleDetail.location.latitude},${googleDetail.location.longitude}&query_place_id=${placeId}`,
        '_blank'
      );
    }
  };

  const handleCheckIn = () => {
    if (rest?.id) {
      navigate(`/checkin/${rest.id}`);
    } else {
      navigate('/checkin', { state: { name: displayName, category: rest?.category } });
    }
  };

  return (
    <div className="animate-slide-in-bottom">
      {/* Hero */}
      <div className="relative h-80">
        {displayPhotos.length > 0 ? (
          <PhotoCarousel photoRefs={displayPhotos} />
        ) : (
          <img
            src={rest?.image || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'}
            className="w-full h-full object-cover"
            alt={displayName}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 to-transparent pointer-events-none" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white z-10"
        >
          <ChevronRight className="rotate-180" size={24} />
        </button>
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <div className="flex gap-2 mb-3 flex-wrap">
            <span className="bg-orange-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              {rest?.category || '餐廳'}
            </span>
            {openNow !== null && openNow !== undefined && (
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center ${
                openNow ? 'bg-green-500' : 'bg-red-500'
              }`}>
                <Clock size={10} className="mr-1" />
                {openNow ? '營業中' : '休息中'}
              </span>
            )}
            {rest?.tags?.includes('date') && (
              <span className="bg-pink-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center">
                <Heart size={10} className="mr-1 fill-current" /> 約會首選
              </span>
            )}
            {rest?.tags?.includes('pet') && (
              <span className="bg-amber-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                寵物友善
              </span>
            )}
          </div>
          <h2 className="text-3xl font-black tracking-tighter mb-2">
            {displayName}
          </h2>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg">
              <Star size={14} className="text-yellow-400 fill-current mr-1" />
              <span className="font-bold text-sm mr-2">{displayRating}</span>
              {userRatingsTotal > 0 && (
                <span className="text-[10px] text-white/70 mr-2">({userRatingsTotal})</span>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openGoogleReviews(displayName);
                }}
                className="text-[10px] font-black underline decoration-white/50 hover:text-orange-400"
              >
                Google 評論
              </button>
            </div>
            <p className="text-slate-300 text-sm font-medium flex items-center">
              <MapPin size={14} className="mr-1" /> {displayAddress}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 bg-white -mt-8 rounded-t-[48px] relative z-10 min-h-[500px]">
        {/* Opening Hours */}
        {openingHours.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xl font-black text-slate-800 tracking-tighter flex items-center mb-4">
              <Clock className="mr-2 text-orange-500" /> 營業時間
            </h3>
            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 space-y-1">
              {openingHours.map((line, i) => (
                <p key={i} className="text-sm text-slate-600 font-medium">{line}</p>
              ))}
            </div>
          </div>
        )}

        {/* Google Reviews */}
        {reviews.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xl font-black text-slate-800 tracking-tighter flex items-center mb-4">
              <Star className="mr-2 text-yellow-500" /> Google 評論
            </h3>
            <div className="space-y-3">
              {reviews.map((review, i) => (
                <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-sm text-slate-800">{review.author}</span>
                    <span className="flex items-center text-xs text-yellow-500">
                      <Star size={12} className="fill-current mr-0.5" />
                      {review.rating}
                    </span>
                  </div>
                  {review.text && (
                    <p className="text-sm text-slate-600 line-clamp-3">{review.text}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Loading detail */}
        {detailLoading && (
          <div className="mb-10 space-y-4 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/3" />
            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-slate-200 rounded w-3/4" />
              <div className="h-4 bg-slate-200 rounded w-2/3" />
            </div>
          </div>
        )}

        {/* Parking - for mock restaurants */}
        {!isGooglePlace && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-slate-800 tracking-tighter flex items-center">
                <Car className="mr-2 text-orange-500" /> 推薦停車位
              </h3>
              <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                {parkingSource === 'tdx' ? 'TDX 即時' : 'Killer Feature'}
              </span>
            </div>
            <div className="space-y-4">
              {parkingLoading && (
                <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 animate-pulse">
                  <div className="h-5 bg-slate-200 rounded w-2/3 mb-3" />
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-4" />
                  <div className="h-10 bg-slate-200 rounded-2xl" />
                </div>
              )}
              {parkingLots.map((lot, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 rounded-3xl p-5 border border-slate-100"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-slate-800 text-lg">
                          {lot.name}
                        </p>
                        {idx === 0 && (
                          <span className="text-[10px] bg-orange-100 text-orange-600 font-black px-2 py-0.5 rounded uppercase">
                            Best
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-xs font-bold mt-1">
                        <span className={lot.statusColor}>{lot.status}</span>
                        <span className="mx-2 text-slate-200">|</span>
                        <span className="text-slate-400">{lot.price}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-300 font-black uppercase">
                        步行
                      </p>
                      <p className="text-lg font-black text-slate-800">
                        {lot.walkTime}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigateToParking(lot)}
                    className="w-full bg-white border border-slate-200 py-3 rounded-2xl text-slate-600 font-bold text-sm flex items-center justify-center hover:bg-slate-100 transition-colors"
                  >
                    <Navigation size={14} className="mr-2 text-slate-400" />{' '}
                    導航此停車場
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Videos */}
        {rest?.videos && rest.videos.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xl font-black text-slate-800 tracking-tighter flex items-center mb-6">
              <Youtube className="mr-2 text-red-600" /> 精選影音
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
              {rest.videos.map((vid, idx) => (
                <div
                  key={idx}
                  className="min-w-[260px] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 group cursor-pointer"
                  onClick={() =>
                    window.open(vid.url || 'https://youtube.com', '_blank')
                  }
                >
                  <div className="relative">
                    <img
                      src={vid.thumb}
                      className="w-full h-36 object-cover"
                      alt={vid.title}
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                        <Navigation
                          size={16}
                          className="text-slate-900 ml-1 fill-current"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="font-bold text-slate-800 text-sm line-clamp-1">
                      {vid.title}
                    </p>
                    <p className="text-xs text-slate-500 font-bold mt-1">
                      {vid.creator}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Articles */}
        {rest?.articles && rest.articles.length > 0 && (
          <div className="mb-10">
            <h3 className="text-xl font-black text-slate-800 tracking-tighter flex items-center mb-6">
              <BookOpen className="mr-2 text-blue-500" /> 部落客食記
            </h3>
            <div className="space-y-3">
              {rest.articles.map((art, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm active:scale-[0.99] transition-transform cursor-pointer"
                  onClick={() =>
                    window.open(art.url || 'https://google.com', '_blank')
                  }
                >
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      {art.title}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-wider">
                      {art.source} · {art.date}
                    </p>
                  </div>
                  <ExternalLink size={16} className="text-slate-300 shrink-0 ml-2" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-40 pb-safe">
        <div className="flex gap-3">
          <button
            onClick={handleCheckIn}
            className="bg-slate-100 text-slate-600 p-5 rounded-[28px] font-black flex items-center justify-center active:scale-95 transition-all"
          >
            <Camera size={20} />
          </button>
          <button
            onClick={handleNavigate}
            className="flex-1 bg-slate-900 text-white py-5 rounded-[28px] font-black text-xl shadow-2xl flex items-center justify-center active:scale-95 transition-all"
          >
            直接導航餐廳{' '}
            <ExternalLink size={20} className="ml-3 text-orange-500" />
          </button>
        </div>
      </div>
    </div>
  );
}
