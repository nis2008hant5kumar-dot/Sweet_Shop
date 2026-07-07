import { useState } from 'react';
import SplashScreen from './components/SplashScreen.jsx';
import Navbar       from './components/Navbar.jsx';
import PinLock      from './components/PinLock.jsx';
import Toast, { useToast } from './components/Toast.jsx';
import Home         from './pages/Home.jsx';
import Dashboard    from './pages/Dashboard.jsx';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [page, setPage]             = useState('home'); // 'home' | 'pin' | 'dashboard'
  const { toast, show: showToast }  = useToast();

  function navigate(dest) {
    if (dest === 'pin' && page !== 'dashboard') {
      setPage('pin');
    } else {
      setPage(dest);
    }
  }

  return (
    <>
      {/* Splash */}
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}

      {/* Navbar — always shown unless splash is active */}
      {!showSplash && <Navbar page={page} onNavigate={navigate} />}

      {/* Pages */}
      {!showSplash && page === 'home'      && <Home />}
      {!showSplash && page === 'pin'       && <PinLock onUnlock={() => setPage('dashboard')} />}
      {!showSplash && page === 'dashboard' && (
        <Dashboard showToast={showToast} onExit={() => setPage('home')} />
      )}

      {/* Toast notification */}
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </>
  );
}
