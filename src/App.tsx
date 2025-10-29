// src/App.tsx - COMPLETE VERSION
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/shared/LoginScreen';
import AdminDashboard from './components/admin/AdminDashboard';
import HarvestFlowDashboard from './components/harvestflow/HarvestFlowDashboard';
import FlavorCoreManagerDashboard from './components/flavorcore/FlavorCoreManagerDashboard';
import SupervisorDashboard from './components/supervisor/SupervisorDashboard';
import EnhancedOnboardingForm from './components/onboarding/EnhancedOnboardingForm';
import FaceAttendanceKiosk from './components/attendance/FaceAttendanceKiosk';

const GlobalHeader: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="bg-white text-gray-800 p-3 shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="h-20 w-20 rounded flex items-center justify-center overflow-hidden">
            <img 
              src="/flavorcore-logo.png" 
              alt="FlavorCore Logo" 
              className="h-full w-full object-contain"
            />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Relish Agro Management System</h1>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component<{
  children: React.ReactNode;
  fallback: React.ReactNode;
}, { hasError: boolean }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("💥 Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const ProtectedRoute: React.FC<{ 
  children: React.ReactNode;
  requiredRole?: string;
}> = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

const HarvestFlowWrapper: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userWithName = {
    ...user,
    name: user.full_name || user.staff_id
  };

  return <HarvestFlowDashboard currentUser={userWithName} />;
};

const SupervisorWrapper: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userWithName = {
    ...user,
    name: user.full_name || user.staff_id
  };

  return <SupervisorDashboard currentUser={userWithName} />;
};

const UnauthorizedPage: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this resource. Please contact your administrator.
        </p>
        <button
          onClick={logout}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
        >
          Return to Login
        </button>
      </div>
    </div>
  );
};

const DashboardRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userWithName = {
    ...user,
    name: user.full_name || user.staff_id
  };

  const getDashboardComponent = () => {
    const staffId = user.staff_id?.toLowerCase() || '';
    
    if (staffId.startsWith('admin-')) {
      return <AdminDashboard />;
    } else if (staffId.startsWith('hf-')) {
      return <HarvestFlowDashboard currentUser={userWithName} />;
    } else if (staffId.startsWith('fc-')) {
      return <FlavorCoreManagerDashboard />;
    } else if (staffId.startsWith('sup-')) {
      return <SupervisorDashboard currentUser={userWithName} />;
    } else {
      return <AdminDashboard />;
    }
  };

  return getDashboardComponent();
};

const AppContent: React.FC = () => {
  const location = useLocation();

  return (
    <div className="App">
      {location.pathname !== '/login' && <GlobalHeader />}
      
      <Routes>
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/harvestflow" 
          element={
            <ProtectedRoute>
              <HarvestFlowWrapper />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/flavorcore" 
          element={
            <ProtectedRoute>
              <FlavorCoreManagerDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/supervisor" 
          element={
            <ProtectedRoute>
              <SupervisorWrapper />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/onboarding/new" 
          element={
            <ProtectedRoute>
              <EnhancedOnboardingForm />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/attendance/kiosk" 
          element={
            <ProtectedRoute>
              <FaceAttendanceKiosk />
            </ProtectedRoute>
          } 
        />
        
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;