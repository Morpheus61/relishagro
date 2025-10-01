import { useState } from 'react';
import { supabase } from './lib/supabase'; // Use centralized instance
import { LoginScreen } from './components/shared/LoginScreen';
import { DashboardScreen } from './components/shared/DashboardScreen';

export default function App() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);

  const handleLogin = (id: string, role: string) => {
    console.log('Login successful:', { id, role }); // Debug log
    setUserId(id);
    setUserRole(role);
  };

  const handleLogout = () => {
    setUserId(null);
    setUserRole(null);
  };

  if (!userId || !userRole) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <DashboardScreen 
      userId={userId}
      userRole={userRole}
      onLogout={handleLogout}
    />
  );
}