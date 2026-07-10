import { useState } from 'react';
import SplashScreen from './components/SplashScreen.jsx';
import Navbar       from './components/Navbar.jsx';
import PinLock      from './components/PinLock.jsx';
import Toast, { useToast } from './components/Toast.jsx';
import Home         from './pages/Home.jsx';
import Dashboard    from './pages/Dashboard.jsx';
import CustomerLogin from './pages/CustomerLogin.jsx';
import CustomerShop  from './pages/CustomerShop.jsx';
import { CustomerAuth } from './utils.js';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [page, setPage]             = useState('home'); // 'home'|'customer-login'|'customer-shop'|'pin'|'dashboard'
  const [customer, setCustomer]     = useState(() => CustomerAuth.getCurrent());
  const { toast, show: showToast }  = useToast();

  function navigate(dest) {
    // If customer is already logged in and tries to go to customer-login, skip to shop
    if (dest === 'customer-login' && CustomerAuth.getCurrent()) {
      setPage('customer-shop');
      return;
    }
    if (dest === 'pin' && page !== 'dashboard') {
      setPage('pin');
    } else {
      setPage(dest);
    }
  }

  function handleCustomerLogin(cust) {
    setCustomer(cust);
    setPage('customer-shop');
  }

  function handleCustomerLogout() {
    CustomerAuth.logout();
    setCustomer(null);
    setPage('home');
  }

  return (
    <>
      {/* Splash */}
      {showSplash && <SplashScreen onDone={() => setShowSplash(false)} />}

      {/* Navbar — always shown unless splash is active */}
      {!showSplash && (
        <Navbar
          page={page}
          onNavigate={navigate}
          customer={customer}
          onCustomerLogout={handleCustomerLogout}
        />
      )}

      {/* Pages */}
      {!showSplash && page === 'home'           && <Home onNavigate={navigate} />}
      {!showSplash && page === 'customer-login' && <CustomerLogin onLogin={handleCustomerLogin} />}
      {!showSplash && page === 'customer-shop'  && customer && (
        <CustomerShop customer={customer} onLogout={handleCustomerLogout} />
      )}
      {!showSplash && page === 'pin'       && <PinLock onUnlock={() => setPage('dashboard')} />}
      {!showSplash && page === 'dashboard' && (
        <Dashboard showToast={showToast} onExit={() => setPage('home')} />
      )}

      {/* Toast notification */}
      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </>
  );
}
