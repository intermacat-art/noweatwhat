import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import BottomNav from './BottomNav';
import FilterModal from '../filter/FilterModal';
import { useFilterStore } from '../../stores/filterStore';

export default function AppShell() {
  const location = useLocation();
  const { showModal } = useFilterStore();
  const isSharePage = location.pathname.startsWith('/share');
  const isDetailPage = location.pathname.startsWith('/restaurant');
  const isCheckInPage = location.pathname.startsWith('/checkin');
  const isSettingsPage = location.pathname.startsWith('/settings');
  const hideNav = isSharePage || isDetailPage || isCheckInPage || isSettingsPage;

  return (
    <div className="flex flex-col h-screen bg-slate-50 max-w-md mx-auto shadow-2xl font-sans overflow-hidden border-x relative">
      {!isSharePage && !isCheckInPage && <Header />}
      {showModal && <FilterModal />}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
        <Outlet />
      </div>
      {!hideNav && <BottomNav />}
    </div>
  );
}
