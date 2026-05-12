import TopBar from './TopBar.jsx';
import BottomNav from './BottomNav.jsx';
import ToastNotification from '../ui/ToastNotification.jsx';
import { useGame } from '../../context/GameStateContext.jsx';

export default function AppShell({ children, activePage, onNavigate }) {
  const { profile, streak, toasts, actions } = useGame();

  return (
    <div className="min-h-screen bg-bg" style={{ maxWidth: '480px', margin: '0 auto', position: 'relative' }}>
      <TopBar profile={profile} streak={streak} />
      <main
        className="overflow-y-auto px-4 pb-24 pt-24"
        style={{ minHeight: '100vh' }}
      >
        {children}
      </main>
      <BottomNav activePage={activePage} onNavigate={onNavigate} />
      <ToastNotification toasts={toasts} onRemove={actions.removeToast} />
    </div>
  );
}
