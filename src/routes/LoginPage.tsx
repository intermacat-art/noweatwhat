import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleLogin = () => {
    login();
    navigate('/');
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-orange-950 max-w-md mx-auto items-center justify-center p-12 text-center font-sans relative overflow-hidden">
      {/* Decorative glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-orange-600/8 rounded-full blur-[80px]" />
      <div className="relative z-10">
        <h1 className="text-5xl font-black text-white tracking-tighter mb-4">
          現在要吃啥<span className="text-orange-500">.</span>
        </h1>
        <p className="text-slate-400 mb-12 leading-relaxed font-medium">
          專為台灣胃設計的美食決策器
          <br />
          結合即時停車場資訊
        </p>
        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-white to-orange-50 text-slate-900 font-bold py-5 rounded-3xl flex items-center justify-center shadow-2xl active:scale-95 transition-all text-lg"
        >
          使用 Google 帳號登入
        </button>
      </div>
    </div>
  );
}
