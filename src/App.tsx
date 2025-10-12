import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// CORRECT IMPORTS - Using named imports to match your component exports
import { LoginScreen } from './components/shared/LoginScreen';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { HarvestFlowDashboard } from './components/harvestflow/HarvestFlowDashboard';
import { FlavorCoreManagerDashboard } from './components/flavorcore/FlavorCoreManagerDashboard';
import { SupervisorDashboard } from './components/supervisor/SupervisorDashboard';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Define the navigation routes
type Route = 'dashboard' | 'users' | 'farms' | 'harvest' | 'processing' | 'quality' | 'reports' | 'settings';

const AppContent: React.FC = () => {
  const { user, login, logout, isLoading, error } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<Route>('dashboard');

  // Navigation handler
  const handleNavigation = (route: Route) => {
    setCurrentRoute(route);
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
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

  // FIXED: Handle login from LoginScreen - now calls AuthContext login properly
  const handleLogin = async (staffId: string, role: string) => {
    console.log('🚀 App.tsx handleLogin called with:', { staffId, role });
    
    try {
      // Call the AuthContext login method with the staffId
      const success = await login(staffId);
      
      if (success) {
        console.log('✅ App.tsx: Login successful, user should be set in AuthContext');
      } else {
        console.log('❌ App.tsx: Login failed');
      }
    } catch (error) {
      console.error('❌ App.tsx: Login error:', error);
    }
  };

  // Render appropriate dashboard based on user role with CORRECT PROPS
  const renderDashboard = () => {
    if (!user) return null;

    console.log('🎯 App.tsx: Rendering dashboard for user:', user);

    switch (user.role) {
      case 'admin':
        return (
          <AdminDashboard 
            userId={user.id} 
            userRole={user.role} 
            onLogout={logout} 
          />
        );
      
      case 'harvestflow_manager':
        return (
          <HarvestFlowDashboard 
            currentUser={{
              id: user.id,
              staff_id: user.staff_id,
              full_name: user.full_name,
              role: user.role
            }} 
          />
        );
      
      case 'flavorcore_manager':
        return (
          <FlavorCoreManagerDashboard 
            userId={user.id}
            userRole={user.role}
            onLogout={logout}
          />
        );
      
      case 'flavorcore_supervisor':
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
            <p style={{ color: '#7f1d1d', marginBottom: '24px' }}>Unknown user role: {user.role}</p>
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
      <LoginScreen 
        onLogin={handleLogin}
      />
    );
  }

  console.log('✅ App.tsx: User authenticated, showing dashboard for:', user);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Header with user info and navigation */}
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
              FlavorCore Agricultural Management
            </h1>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '14px', opacity: 0.9 }}>
                Welcome, {user.full_name || user.staff_id}
              </span>
              <br />
              <span style={{ fontSize: '12px', opacity: 0.8 }}>
                {user.designation} ({user.role.replace('_', ' ')})
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
        
        {/* Navigation menu */}
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
              fontSize: '14px'
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
              fontSize: '14px'
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
              fontSize: '14px'
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