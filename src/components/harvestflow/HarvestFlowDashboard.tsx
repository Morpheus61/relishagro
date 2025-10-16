import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

// Import your UI components with correct paths
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';

// ADDED: Import shared components
import { OnboardingScreen } from '../shared/OnboardingScreen';
import { ProcurementScreen } from '../shared/ProcurementScreen';

const HarvestFlowDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview'); // ADDED: Tab state

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // ADDED: Navigation function for shared components
  const navigateToScreen = (screen: string) => {
    setActiveTab(screen);
  };

  // ADDED: Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'onboarding':
        return (
          <OnboardingScreen 
            navigateToScreen={navigateToScreen}
            currentUser={user}
          />
        );
      case 'procurement':
        return (
          <ProcurementScreen 
            navigateToScreen={navigateToScreen}
            currentUser={user}
          />
        );
      case 'overview':
      default:
        return renderDashboardOverview();
    }
  };

  // ADDED: Main dashboard overview content
  const renderDashboardOverview = () => (
    <>
      {/* Dashboard Title */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">HarvestFlow Manager</h2>
        <p className="text-gray-600">Field operations, crop monitoring, and harvest coordination</p>
        <div className="flex items-center space-x-4 mt-4">
          <Badge variant="outline" className="text-green-700 border-green-300">
            {formatDate(currentTime)}
          </Badge>
          <Badge variant="outline" className="text-blue-700 border-blue-300">
            {formatTime(currentTime)}
          </Badge>
        </div>
      </div>

      {/* Navigation Tabs - UPDATED with new tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-t-lg ${
                activeTab === 'overview' 
                  ? 'bg-green-600 text-white' 
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent hover:border-gray-300'
              }`}
            >
              Field Overview
            </button>
            <button 
              onClick={() => setActiveTab('crop-monitoring')}
              className="text-gray-500 hover:text-gray-700 px-4 py-2 border-b-2 border-transparent hover:border-gray-300"
            >
              Crop Monitoring
            </button>
            <button 
              onClick={() => setActiveTab('harvest-planning')}
              className="text-gray-500 hover:text-gray-700 px-4 py-2 border-b-2 border-transparent hover:border-gray-300"
            >
              Harvest Planning
            </button>
            <button 
              onClick={() => setActiveTab('equipment-status')}
              className="text-gray-500 hover:text-gray-700 px-4 py-2 border-b-2 border-transparent hover:border-gray-300"
            >
              Equipment Status
            </button>
            <button 
              onClick={() => setActiveTab('worker-assignments')}
              className="text-gray-500 hover:text-gray-700 px-4 py-2 border-b-2 border-transparent hover:border-gray-300"
            >
              Worker Assignments
            </button>
            {/* ADDED: New manager-specific tabs */}
            <button 
              onClick={() => setActiveTab('onboarding')}
              className="text-gray-500 hover:text-gray-700 px-4 py-2 border-b-2 border-transparent hover:border-gray-300"
            >
              Worker Onboarding
            </button>
            <button 
              onClick={() => setActiveTab('procurement')}
              className="text-gray-500 hover:text-gray-700 px-4 py-2 border-b-2 border-transparent hover:border-gray-300"
            >
              Procurement
            </button>
          </nav>
        </div>
      </div>

      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Field Status Card */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <span className="text-green-600">🌾</span>
              <span>Active Fields</span>
            </h3>
            <p className="text-sm text-gray-600">Current field operations status</p>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Field A-12</span>
              <Badge className="bg-green-100 text-green-800">Harvesting</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Field B-05</span>
              <Badge className="bg-yellow-100 text-yellow-800">Preparation</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Field C-08</span>
              <Badge className="bg-blue-100 text-blue-800">Planted</Badge>
            </div>
          </div>
        </Card>

        {/* Harvest Progress Card */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <span className="text-orange-600">📊</span>
              <span>Harvest Progress</span>
            </h3>
            <p className="text-sm text-gray-600">Today's harvest metrics</p>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Tomatoes</span>
                <span>2,450 kg</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-red-500 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Onions</span>
                <span>1,800 kg</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Garlic</span>
                <span>950 kg</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </Card>

        {/* Equipment Status Card */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <span className="text-blue-600">🚜</span>
              <span>Equipment Status</span>
            </h3>
            <p className="text-sm text-gray-600">Farm equipment availability</p>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Tractor T-01</span>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Harvester H-03</span>
              <Badge className="bg-green-100 text-green-800">Active</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Irrigation I-07</span>
              <Badge className="bg-red-100 text-red-800">Maintenance</Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Activities */}
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Current Field Activities</h3>
            <p className="text-sm text-gray-600">Real-time field operations</p>
          </div>
          <div className="space-y-4">
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-green-700">Harvest Operation - Field A-12</h4>
              <p className="text-sm text-gray-600">Premium tomato harvest in progress</p>
              <p className="text-sm text-gray-500">Started: 6:00 AM • Progress: 75%</p>
            </div>
            
            <div className="border-t border-gray-100 my-2"></div>
            
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-blue-700">Soil Preparation - Field B-05</h4>
              <p className="text-sm text-gray-600">Preparing for next planting cycle</p>
              <p className="text-sm text-gray-500">Started: 8:30 AM • Progress: 40%</p>
            </div>
            
            <div className="border-t border-gray-100 my-2"></div>
            
            <div className="border-l-4 border-yellow-500 pl-4">
              <h4 className="font-semibold text-yellow-700">Quality Inspection - Field C-08</h4>
              <p className="text-sm text-gray-600">Crop quality assessment ongoing</p>
              <p className="text-sm text-gray-500">Started: 10:00 AM • Progress: 25%</p>
            </div>
          </div>
        </Card>

        {/* Team Status */}
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold">Field Team Status</h3>
            <p className="text-sm text-gray-600">Worker assignments and availability</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div>
                <h4 className="font-semibold">Team Alpha</h4>
                <p className="text-sm text-gray-600">Field A-12 Harvest</p>
              </div>
              <div className="text-right">
                <Badge className="bg-green-100 text-green-800">8/8 Active</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div>
                <h4 className="font-semibold">Team Beta</h4>
                <p className="text-sm text-gray-600">Field B-05 Preparation</p>
              </div>
              <div className="text-right">
                <Badge className="bg-blue-100 text-blue-800">6/6 Active</Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div>
                <h4 className="font-semibold">Team Gamma</h4>
                <p className="text-sm text-gray-600">Quality Control</p>
              </div>
              <div className="text-right">
                <Badge className="bg-yellow-100 text-yellow-800">4/4 Active</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons - UPDATED with new manager options */}
      <div className="mt-8 flex flex-wrap gap-4">
        <Button className="bg-green-600 hover:bg-green-700">
          New Harvest Plan
        </Button>
        <Button variant="outline">
          Equipment Check
        </Button>
        <Button variant="outline">
          Team Assignment
        </Button>
        <Button variant="outline">
          Quality Report
        </Button>
        {/* ADDED: Manager-specific action buttons */}
        <Button 
          onClick={() => setActiveTab('onboarding')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Onboard Worker
        </Button>
        <Button 
          onClick={() => setActiveTab('procurement')}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          Request Procurement
        </Button>
      </div>
    </>
  );

  // MODIFIED: Return either full dashboard or shared component
  if (activeTab === 'onboarding' || activeTab === 'procurement') {
    return renderTabContent();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* SINGLE CLEAN HEADER */}
      <header className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center space-x-4">
              <img 
                src="/flavorcore-logo.png" 
                alt="FlavorCore Logo" 
                className="h-10 w-10 rounded-lg bg-white/10 p-1"
                onError={(e) => {
                  console.error('Logo failed to load from /flavorcore-logo.png');
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div>
                <h1 className="text-xl font-bold">HarvestFlow Agricultural Management</h1>
                <p className="text-green-100 text-sm">Field Operations Dashboard</p>
              </div>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="font-medium">Welcome, {user?.full_name || 'User'}</p>
                <p className="text-green-100 text-sm">
                  HarvestFlow Manager ({user?.staff_id})
                </p>
              </div>
              <Button 
                onClick={logout}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN DASHBOARD CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default HarvestFlowDashboard;