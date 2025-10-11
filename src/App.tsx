import { useState, useEffect } from 'react';
import { LoginScreen } from './components/shared/LoginScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { HarvestFlowDashboard } from './components/harvestflow/HarvestFlowDashboard';
import { FlavorCoreManagerDashboard } from './components/flavorcore/FlavorCoreManagerDashboard';
import { SupervisorDashboard } from './components/supervisor/SupervisorDashboard';
import { MobileNav } from './components/shared/MobileNav';
import api from './lib/api';
import { initOfflineDB, setupAutoSync } from './lib/offlineSync';
import { requestNotificationPermission } from './lib/pushNotifications';

interface User {
  id: string;
  staff_id: string;
  full_name: string;
  role: string;
}

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRoute, setCurrentRoute] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await initOfflineDB();
      setupAutoSync();
      await requestNotificationPermission();

      const token = localStorage.getItem('auth_token');
      const userData = localStorage.getItem('user_data');

      if (token && userData) {
        setCurrentUser(JSON.parse(userData));
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (staffId: string) => {
    try {
      const response = await api.login(staffId);

      if (response.authenticated && response.user) {
        const userData: User = {
          id: response.user.id,
          staff_id: response.user.staff_id,
          full_name: response.user.full_name,
          role: response.user.role,
        };

        setCurrentUser(userData);
        setIsLoggedIn(true);
        setCurrentRoute('dashboard');
      } else {
        alert('Login failed: ' + (response.error || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Login error:', error);
      alert('Login failed: ' + (error.message || 'Network error'));
    }
  };

  const handleLogout = () => {
    api.clearAuth();
    setCurrentUser(null);
    setIsLoggedIn(false);
    setCurrentRoute('dashboard');
  };

  const handleNavigate = (route: string) => {
    setCurrentRoute(route);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center">
        <div className="text-center text-white">
          <img
            src="/flavorcore-logo.png"
            alt="FlavorCore"
            className="w-24 h-24 mx-auto mb-4 animate-pulse"
          />
          <p className="text-xl font-semibold">Loading FlavorCore...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !currentUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderDashboard = () => {
    // Desktop Navigation (visible only on md+ screens)
    const DesktopNav = () => (
      <div className="hidden md:block bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap gap-2">
          {[
            { label: 'Dashboard', route: 'dashboard' },
            { label: 'Onboarding', route: 'onboarding' },
            { label: 'Attendance', route: 'attendance' },
            { label: 'Procurement', route: 'procurement' },
            { label: 'Daily Work', route: 'daily-work' },
            { label: 'Harvest Jobs', route: 'harvest-jobs' },
            { label: 'Lot Management', route: 'lot-management' },
            { label: 'Dispatch', route: 'dispatch' },
            { label: 'Wages', route: 'wages' },
          ].map((item) => (
            <button
              key={item.route}
              onClick={() => handleNavigate(item.route)}
              className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
                currentRoute === item.route
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    );

    return (
      <>
        <DesktopNav />
        {/* Main Dashboard Content */}
        {(() => {
          switch (currentUser.role) {
            case 'admin':
              return (
                <AdminDashboard
                  userId={currentUser.id}
                  userRole={currentUser.role}
                  onLogout={handleLogout}
                />
              );
            case 'harvestflow_manager':
              return (
                <HarvestFlowDashboard 
                  currentUser={{
                    id: currentUser.id,
                    staff_id: currentUser.staff_id,
                    role: currentUser.role,
                    full_name: currentUser.full_name
                  }}
                />
              );
            case 'flavorcore_manager':
              return (
                <FlavorCoreManagerDashboard
                  userId={currentUser.id}
                  userRole={currentUser.role}
                  onLogout={handleLogout}
                />
              );
            case 'flavorcore_supervisor':
              return (
                <SupervisorDashboard
                  currentUser={{
                    id: currentUser.id,
                    staff_id: currentUser.staff_id,
                    role: currentUser.role,
                    full_name: currentUser.full_name
                  }}
                />
              );
            default:
              return (
                <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                  <div className="bg-white p-8 rounded-lg shadow-lg text-center">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
                    <p className="text-gray-600 mb-4">
                      Your role ({currentUser.role}) does not have dashboard access.
                    </p>
                    <button
                      onClick={handleLogout}
                      className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              );
          }
        })()}
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Navigation: ONLY on small screens */}
      <div className="md:hidden">
        <MobileNav
          userRole={currentUser.role}
          onNavigate={handleNavigate}
          onLogout={handleLogout}
          currentRoute={currentRoute}
        />
      </div>

      {/* Main Content */}
      <div className="md:pl-0">
        {renderDashboard()}
      </div>

      {/* Install PWA Prompt */}
      <InstallPrompt />
    </div>
  );
}

// PWA Install Prompt Component
function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA installed');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-2xl max-w-sm z-50 border-2 border-purple-600">
      <div className="flex items-start gap-3">
        <img
          src="/flavorcore-logo.png"
          alt="FlavorCore"
          className="w-16 h-16"
        />
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">Install FlavorCore App</h3>
          <p className="text-sm text-gray-600 mb-3">
            Install our app for offline access and a better experience!
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700"
            >
              Install
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;