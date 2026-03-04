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
    <div className="flex flex-col h-screen bg-slate-900 max-w-md mx-auto items-center justify-center p-12 text-center font-sans">
      <h1 className="text-5xl font-black text-white tracking-tighter mb-4">
        現在吃什麼<span className="text-orange-500">.</span>
      </h1>
      <p className="text-slate-400 mb-12 leading-relaxed font-medium">
        專為台灣胃設計的美食決策器
        <br />
        結合即時停車場資訊
      </p>
      <button
        onClick={handleLogin}
        className="w-full bg-white text-slate-900 font-bold py-5 rounded-3xl flex items-center justify-center shadow-2xl active:scale-95 transition-all text-lg"
      >
        使用 Google 帳號登入
      </button>
    </div>
  );
}
