import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// CORRECTED IMPORTS - Based on actual component exports
import { LoginScreen } from './components/shared/LoginScreen';
import AdminDashboard from './components/admin/AdminDashboard';
import HarvestFlowDashboard from './components/harvestflow/HarvestFlowDashboard';
import FlavorCoreManagerDashboard from './components/flavorcore/FlavorCoreManagerDashboard';
import { SupervisorDashboard } from './components/supervisor/SupervisorDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Define the navigation routes
type Route = 'dashboard' | 'reports' | 'settings';

const AppContent: React.FC = () => {
  const { user, login, logout, isLoading, error } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<Route>('dashboard');

  // FUNCTIONAL Navigation handler - NO MORE DUMMY BUTTONS
  const handleNavigation = (route: Route) => {
    console.log(`🎯 App.tsx: Navigation clicked: ${route}`);
    setCurrentRoute(route);
  };

  // Enhanced debug logging for user changes
  useEffect(() => {
    console.log('🔄 App.tsx: User state changed:', {
      user: user,
      hasUser: !!user,
      userId: user?.id,
      userRole: user?.role,
      userStaffId: user?.staff_id,
      userFullName: user?.full_name
    });
    console.log('🔄 App.tsx: isLoading:', isLoading);
    console.log('🔄 App.tsx: error:', error);
    console.log('🔄 App.tsx: currentRoute:', currentRoute);
    console.log('🔄 App.tsx: Will show:', !isLoading && !user ? 'LOGIN' : !isLoading && user ? 'DASHBOARD' : 'LOADING');
  }, [user, isLoading, error, currentRoute]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log('⏳ App.tsx: Still loading...');
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f3f4f6'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading FlavorCore...</p>
        </div>
      </div>
    );
  }

  // Enhanced login handler with better error handling
  const handleLogin = async (staffId: string, role: string) => {
    console.log('🚀 App.tsx: handleLogin called with:', { staffId, role });
    console.log('🚀 App.tsx: Current user state before login:', user);
    
    try {
      console.log('🚀 App.tsx: Calling AuthContext login...');
      await login(staffId);
      console.log('✅ App.tsx: AuthContext login call completed');
      console.log('✅ App.tsx: User state after login:', user);
      
      // Don't handle success here - let the useEffect handle user state changes
      
    } catch (error) {
      console.error('❌ App.tsx: Login error caught:', error);
      console.error('❌ App.tsx: Error type:', typeof error);
      console.error('❌ App.tsx: Error details:', error);
    }
  };

  // FIXED: Render appropriate dashboard based on ACTUAL backend role values
  const renderDashboard = () => {
    if (!user) {
      console.log('❌ App.tsx: renderDashboard called but no user');
      return null;
    }

    console.log('🎯 App.tsx: Rendering dashboard for user:', {
      role: user.role,
      staff_id: user.staff_id,
      full_name: user.full_name,
      currentRoute: currentRoute
    });

    // Match the ACTUAL backend role values
    switch (user.role) {
      case 'Admin':  // Backend returns "Admin"
        console.log('📊 App.tsx: Rendering AdminDashboard');
        return <AdminDashboard currentRoute={currentRoute} onNavigate={handleNavigation} />;
      
      case 'HarvestFlow':  // Backend returns "HarvestFlow" 
        console.log('🌾 App.tsx: Rendering HarvestFlowDashboard');
        return <HarvestFlowDashboard />;
      
      case 'FlavorCore':  // Backend returns "FlavorCore"
        console.log('🏭 App.tsx: Rendering FlavorCoreManagerDashboard');
        return <FlavorCoreManagerDashboard />;
      
      case 'Supervisor':  // Backend returns "Supervisor"
        console.log('👨‍💼 App.tsx: Rendering SupervisorDashboard');
        return (
          <SupervisorDashboard 
            currentUser={{
              id: user.id,
              staff_id: user.staff_id,
              full_name: user.full_name,
              role: user.role
            }}
            onLogout={logout}
          />
        );
      
      // Legacy support for old role values (just in case)
      case 'admin':
        console.log('📊 App.tsx: Rendering AdminDashboard (legacy)');
        return <AdminDashboard currentRoute={currentRoute} onNavigate={handleNavigation} />;
      case 'harvestflow_manager':
        console.log('🌾 App.tsx: Rendering HarvestFlowDashboard (legacy)');
        return <HarvestFlowDashboard />;
      case 'flavorcore_manager':
        console.log('🏭 App.tsx: Rendering FlavorCoreManagerDashboard (legacy)');
        return <FlavorCoreManagerDashboard />;
      case 'flavorcore_supervisor':
        console.log('👨‍💼 App.tsx: Rendering SupervisorDashboard (legacy)');
        return (
          <SupervisorDashboard 
            currentUser={{
              id: user.id,
              staff_id: user.staff_id,
              full_name: user.full_name,
              role: user.role
            }}
            onLogout={logout}
          />
        );
      
      default:
        console.error('❌ App.tsx: Unknown user role:', user.role);
        return (
          <div style={{
            padding: '48px 24px',
            textAlign: 'center',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            margin: '24px'
          }}>
            <h2 style={{ color: '#dc2626', marginBottom: '16px' }}>Access Error</h2>
            <p style={{ color: '#7f1d1d', marginBottom: '16px' }}>
              Unknown user role: <strong>{user.role}</strong>
            </p>
            <p style={{ color: '#7f1d1d', marginBottom: '24px', fontSize: '14px' }}>
              Expected roles: Admin, HarvestFlow, FlavorCore, Supervisor
            </p>
            <button 
              onClick={logout}
              style={{
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Logout
            </button>
          </div>
        );
    }
  };

  // If user is not authenticated, show login screen
if (!user) {
  console.log('🔒 App.tsx: No user found, showing LoginScreen');
  return (
    <div>
      <LoginScreen />
      {/* Show error message if login failed */}
      {error && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          padding: '16px',
          color: '#dc2626',
          maxWidth: '300px',
          zIndex: 1000
        }}>
          <strong>Login Error:</strong> {error}
        </div>
      )}
    </div>
  );
}

  console.log('✅ App.tsx: User authenticated, showing dashboard for:', user);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header with user info and FUNCTIONAL navigation */}
      <header style={{
        backgroundColor: '#6366f1',
        color: 'white',
        padding: '16px 24px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#4f46e5',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: 'bold'
            }}>
              🌾
            </div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              Relish Agro - FlavorCore Management
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '14px', opacity: 0.9 }}>
                Welcome, {user.full_name}
              </span>
              <br />
              <span style={{ fontSize: '12px', opacity: 0.8 }}>
                {user.designation} • {user.staff_id}
              </span>
            </div>
            <button 
              onClick={logout}
              style={{
                backgroundColor: '#4338ca',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Logout
            </button>
          </div>
        </div>
        
        {/* FUNCTIONAL Navigation menu - NO MORE DUMMY BUTTONS */}
        <nav style={{
          marginTop: '16px',
          display: 'flex',
          gap: '8px',
          maxWidth: '1200px',
          margin: '16px auto 0'
        }}>
          <button 
            onClick={() => handleNavigation('dashboard')}
            style={{
              padding: '8px 16px',
              backgroundColor: currentRoute === 'dashboard' ? '#4338ca' : 'transparent',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            Dashboard
          </button>
          <button 
            onClick={() => handleNavigation('reports')}
            style={{
              padding: '8px 16px',
              backgroundColor: currentRoute === 'reports' ? '#4338ca' : 'transparent',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            Reports
          </button>
          <button 
            onClick={() => handleNavigation('settings')}
            style={{
              padding: '8px 16px',
              backgroundColor: currentRoute === 'settings' ? '#4338ca' : 'transparent',
              color: 'white',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s'
            }}
          >
            Settings
          </button>
        </nav>
      </header>

      {/* Main content area */}
      <main style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {renderDashboard()}
      </main>

      {/* Add CSS animation for loading spinner */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<AppContent />} />
            <Route path="/login" element={<AppContent />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;