import { useState } from 'react';
import { QUICK_AMOUNTS } from '../../data/types';

interface QuickAmountPickerProps {
  value: number | null;
  onChange: (amount: number) => void;
}

export default function QuickAmountPicker({ value, onChange }: QuickAmountPickerProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customValue, setCustomValue] = useState('');

  const isCustom = value !== null && !QUICK_AMOUNTS.includes(value as typeof QUICK_AMOUNTS[number]);

  const handleCustomConfirm = () => {
    const num = parseInt(customValue, 10);
    if (num > 0) {
      onChange(num);
      setShowCustom(false);
    }
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-3">
        {QUICK_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            onClick={() => { onChange(amount); setShowCustom(false); }}
            className={`py-3 rounded-2xl font-bold text-lg transition-all active:scale-95 ${
              value === amount
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            ${amount}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowCustom(true)}
          className={`py-3 rounded-2xl font-bold text-lg transition-all active:scale-95 ${
            isCustom
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {isCustom ? `$${value}` : '自訂'}
        </button>
      </div>
      {showCustom && (
        <div className="mt-3 flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
            <input
              type="number"
              inputMode="numeric"
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="輸入金額"
              className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-lg focus:outline-none focus:ring-2 focus:ring-orange-300"
              autoFocus
            />
          </div>
          <button
            type="button"
            onClick={handleCustomConfirm}
            className="px-6 py-3 bg-orange-500 text-white rounded-2xl font-bold active:scale-95 transition-all"
          >
            確定
          </button>
        </div>
      )}
    </div>
  );
}
