import { useState } from 'react';
import { supabase } from './lib/supabase';
import { LoginScreen } from './components/shared/LoginScreen';
import { DashboardScreen } from './components/shared/DashboardScreen';
import { FlavorCoreDashboard } from './components/flavorcore/FlavorCoreDashboard';
import { HarvestFlowDashboard } from './components/harvestflow/HarvestFlowDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SupervisorDashboard } from './components/supervisor/SupervisorDashboard';
import { HarvestingDashboard } from './components/harvesting/HarvestingDashboard';

interface User {
  id: string;
  role: string;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (userId: string, role: string) => {
    console.log('Login:', { userId, role });
    setUser({ id: userId, role });
  };

  const handleLogout = () => {
    setUser(null);
  };

  const renderDashboard = () => {
    if (!user) return null;

    switch (user.role) {
      case 'admin':
        return <AdminDashboard userId={user.id} userRole={user.role} onLogout={handleLogout} />;
      
      case 'harvestflow_manager':
        return <HarvestFlowDashboard userId={user.id} userRole={user.role} onLogout={handleLogout} />;
      
      case 'flavorcore_manager':
        return <FlavorCoreDashboard userId={user.id} userRole={user.role} onLogout={handleLogout} />;
      
      case 'flavorcore_supervisor':
        return <SupervisorDashboard userId={user.id} userRole={user.role} onLogout={handleLogout} />;
      
      case 'harvesting':
        return <HarvestingDashboard userId={user.id} userRole={user.role} onLogout={handleLogout} />;
      
      default:
        return <DashboardScreen userId={user.id} userRole={user.role} onLogout={handleLogout} />;
    }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return renderDashboard();
}