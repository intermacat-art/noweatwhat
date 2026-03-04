import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  size?: number;
  readOnly?: boolean;
}

export default function StarRating({ value, onChange, size = 36, readOnly = false }: StarRatingProps) {
  return (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => onChange(star)}
          className={`transition-all duration-200 ${
            readOnly ? 'cursor-default' : 'active:scale-125 cursor-pointer'
          }`}
          style={{ minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Star
            size={size}
            className={`transition-all duration-200 ${
              star <= value
                ? 'text-yellow-400 fill-current scale-110'
                : 'text-slate-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
}
