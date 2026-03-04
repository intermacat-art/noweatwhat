import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, CreditCard, RefreshCw, Check, AlertCircle } from 'lucide-react';
import { queryInvoices, matchInvoiceToRestaurant } from '../services/invoiceService';
import { useHistoryStore } from '../stores/historyStore';
import type { InvoiceRecord } from '../services/invoiceService';

const CARRIER_KEY = 'noweatwhat-carrier';

export default function SettingsPage() {
  const navigate = useNavigate();
  const visits = useHistoryStore((s) => s.visits);
  const updateVisit = useHistoryStore((s) => s.updateVisit);

  const [carrierNo, setCarrierNo] = useState('');
  const [saved, setSaved] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [matchedInvoices, setMatchedInvoices] = useState<(InvoiceRecord & { matchedName: string })[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(CARRIER_KEY);
    if (stored) setCarrierNo(stored);
  }, []);

  const handleSave = () => {
    localStorage.setItem(CARRIER_KEY, carrierNo);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSync = async () => {
    if (!carrierNo) return;
    setSyncing(true);
    setSyncResult(null);
    setMatchedInvoices([]);

    try {
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const invoices = await queryInvoices(carrierNo, startDate, endDate);
      const restaurantNames = visits.map((v) => v.name);
      const matched: (InvoiceRecord & { matchedName: string })[] = [];

      for (const inv of invoices) {
        const match = matchInvoiceToRestaurant(inv.sellerName, restaurantNames);
        if (match) {
          matched.push({ ...inv, matchedName: match });
          // Auto-update the matching visit's cost
          const visit = visits.find((v) => v.name === match && !v.actualCost);
          if (visit) {
            updateVisit(visit.id, { actualCost: inv.amount, cost: inv.amount });
          }
        }
      }

      setMatchedInvoices(matched);
      setSyncResult(
        matched.length > 0
          ? `成功匹配 ${matched.length} 筆消費紀錄`
          : `查到 ${invoices.length} 筆發票，但未匹配到造訪過的餐廳`
      );
    } catch {
      setSyncResult('查詢失敗，請確認載具號碼是否正確');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="animate-slide-in-right bg-app min-h-full bg-dots">
      {/* Header */}
      <div className="sticky top-0 z-20 glass-warm border-b border-warm-200/40 px-6 py-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-slate-100 rounded-xl"
        >
          <ChevronRight className="rotate-180" size={20} />
        </button>
        <h1 className="text-lg font-black text-slate-800 tracking-tight">設定</h1>
      </div>

      <div className="p-6 space-y-8">
        {/* Carrier Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={20} className="text-orange-500" />
            <h2 className="text-lg font-black text-slate-800 tracking-tight">電子發票載具</h2>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            輸入手機條碼載具號碼，自動匹配消費紀錄到造訪過的餐廳。
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={carrierNo}
              onChange={(e) => setCarrierNo(e.target.value)}
              placeholder="/XXXXXXX"
              className="flex-1 px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-lg tracking-wider focus:outline-none focus:ring-2 focus:ring-orange-300"
            />
            <button
              onClick={handleSave}
              className="px-5 py-4 bg-orange-500 text-white rounded-2xl font-bold active:scale-95 transition-all"
            >
              {saved ? <Check size={20} /> : '儲存'}
            </button>
          </div>
          <p className="text-[10px] text-slate-400 mt-2 font-bold">
            格式：/ 開頭 + 7 位大寫英數字
          </p>
        </div>

        {/* Sync Button */}
        {carrierNo && (
          <div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black flex items-center justify-center active:scale-95 transition-all disabled:opacity-50"
            >
              <RefreshCw size={18} className={`mr-2 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? '查詢中...' : '同步最近 30 天發票'}
            </button>

            {syncResult && (
              <div className={`mt-4 p-4 rounded-2xl text-sm font-bold flex items-start gap-2 ${
                matchedInvoices.length > 0 ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
              }`}>
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                {syncResult}
              </div>
            )}

            {matchedInvoices.length > 0 && (
              <div className="mt-4 space-y-3">
                {matchedInvoices.map((inv, i) => (
                  <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-slate-800">{inv.matchedName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                          {inv.invDate} · {inv.sellerName}
                        </p>
                      </div>
                      <p className="text-lg font-black text-orange-500">${inv.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info */}
        <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-2">如何取得載具號碼？</h3>
          <ol className="text-sm text-slate-500 space-y-1 list-decimal list-inside">
            <li>下載「財政部統一發票兌獎」APP</li>
            <li>註冊並取得手機條碼</li>
            <li>將載具號碼貼到上方欄位</li>
            <li>結帳時出示條碼即可自動歸戶</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
