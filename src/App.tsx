import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import AppShell from './components/layout/AppShell';
import LoginPage from './routes/LoginPage';
import HomePage from './routes/HomePage';
import ListPage from './routes/ListPage';
import DetailPage from './routes/DetailPage';
import ProfilePage from './routes/ProfilePage';
import SharePage from './routes/SharePage';
import DiceResultPage from './routes/DiceResultPage';
import MonthlyReportPage from './routes/MonthlyReportPage';
import CheckInPage from './routes/CheckInPage';
import SettingsPage from './routes/SettingsPage';
import SearchPage from './routes/SearchPage';
import WeeklyReportPage from './routes/WeeklyReportPage';
import FoodMapPage from './routes/FoodMapPage';
import FoodPersonalityPage from './routes/FoodPersonalityPage';
import ZooPage from './routes/ZooPage';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <AuthGuard>
              <AppShell />
            </AuthGuard>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="category/:name" element={<ListPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="restaurant/:id" element={<DetailPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="share/:historyId" element={<SharePage />} />
          <Route path="dice-result" element={<DiceResultPage />} />
          <Route path="profile/report" element={<MonthlyReportPage />} />
          <Route path="checkin" element={<CheckInPage />} />
          <Route path="checkin/:restaurantId" element={<CheckInPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile/weekly" element={<WeeklyReportPage />} />
          <Route path="profile/foodmap" element={<FoodMapPage />} />
          <Route path="profile/personality" element={<FoodPersonalityPage />} />
          <Route path="profile/zoo" element={<ZooPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
