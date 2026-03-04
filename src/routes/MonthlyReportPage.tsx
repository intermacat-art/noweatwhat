import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { useHistoryStore } from '../stores/historyStore';

const COLORS = ['#f97316', '#3b82f6', '#ec4899', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export default function MonthlyReportPage() {
  const navigate = useNavigate();
  const visits = useHistoryStore((s) => s.visits);
  const now = new Date();
  const [monthOffset, setMonthOffset] = useState(0);

  const targetMonth = useMemo(() => {
    const d = new Date(now.getFullYear(), now.getMonth() + monthOffset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }, [monthOffset]);

  const monthLabel = useMemo(() => {
    const [y, m] = targetMonth.split('-');
    return `${y} 年 ${Number(m)} 月`;
  }, [targetMonth]);

  const monthVisits = useMemo(
    () => visits.filter((v) => v.date.startsWith(targetMonth)),
    [visits, targetMonth]
  );

  const totalCost = monthVisits.reduce((a, b) => a + b.cost, 0);

  const categoryData = useMemo(() => {
    const map = new Map<string, { visits: number; cost: number }>();
    monthVisits.forEach((v) => {
      const prev = map.get(v.category) || { visits: 0, cost: 0 };
      map.set(v.category, { visits: prev.visits + 1, cost: prev.cost + v.cost });
    });
    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      value: data.cost,
      visits: data.visits,
    }));
  }, [monthVisits]);

  const topRestaurant = useMemo(() => {
    const map = new Map<string, number>();
    monthVisits.forEach((v) => map.set(v.name, (map.get(v.name) || 0) + 1));
    let top = { name: '', count: 0 };
    map.forEach((count, name) => {
      if (count > top.count) top = { name, count };
    });
    return top.name ? top : null;
  }, [monthVisits]);

  return (
    <div className="animate-slide-in-right bg-white min-h-full">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate('/profile')}
          className="p-2 bg-slate-100 rounded-xl"
        >
          <ChevronRight className="rotate-180" size={18} />
        </button>
        <h2 className="text-xl font-black text-slate-800 tracking-tighter">
          月報分析
        </h2>
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-center gap-6 py-4">
        <button
          onClick={() => setMonthOffset((o) => o - 1)}
          className="p-2 bg-slate-100 rounded-full active:scale-90 transition-all"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-lg font-black text-slate-800 min-w-[140px] text-center">
          {monthLabel}
        </span>
        <button
          onClick={() => setMonthOffset((o) => Math.min(o + 1, 0))}
          className={`p-2 rounded-full transition-all ${
            monthOffset >= 0 ? 'bg-slate-50 text-slate-200' : 'bg-slate-100 active:scale-90'
          }`}
          disabled={monthOffset >= 0}
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {monthVisits.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <p className="text-5xl mb-4">📊</p>
          <p className="font-bold">本月還沒有紀錄</p>
          <p className="text-sm mt-2">去探索美食吧！</p>
        </div>
      ) : (
        <>
          {/* Stats Summary */}
          <div className="px-8 grid grid-cols-2 gap-4 mb-8">
            <div className="bg-orange-50 p-5 rounded-3xl text-center border border-orange-100">
              <p className="text-[10px] font-black text-orange-300 uppercase tracking-widest mb-1">
                總探索
              </p>
              <p className="text-3xl font-black text-orange-600">
                {monthVisits.length}
              </p>
              <p className="text-[10px] text-orange-400 font-bold mt-1">次</p>
            </div>
            <div className="bg-slate-50 p-5 rounded-3xl text-center border border-slate-100">
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">
                總花費
              </p>
              <p className="text-3xl font-black text-slate-800">${totalCost}</p>
              <p className="text-[10px] text-slate-400 font-bold mt-1">TWD</p>
            </div>
          </div>

          {/* Pie Chart */}
          {categoryData.length > 0 && (
            <div className="px-8 mb-8">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">
                花費分佈
              </h3>
              <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center mt-4">
                  {categoryData.map((d, idx) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="text-xs font-bold text-slate-600">
                        {d.name} ${d.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Top Restaurant */}
          {topRestaurant && (
            <div className="px-8 mb-8">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">
                最愛餐廳
              </h3>
              <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-3xl p-6 text-white">
                <div className="flex items-center gap-3">
                  <TrendingUp size={24} />
                  <div>
                    <p className="font-black text-lg">{topRestaurant.name}</p>
                    <p className="text-white/70 text-sm font-bold">
                      本月造訪 {topRestaurant.count} 次
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="px-8 pb-10">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">
              時間軸
            </h3>
            <div className="space-y-3">
              {monthVisits.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100"
                >
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-lg shadow-sm">
                    {v.date.split('-')[2]}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm">{v.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      {v.category} · ${v.cost}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
