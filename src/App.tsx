import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';

import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import LocationPage from './pages/LocationPage';
import ContactsPage from './pages/ContactsPage';
import SafetyPage from './pages/SafetyPage';
import ProfilePage from './pages/ProfilePage';

import Header from './components/Layout/Header';
import BottomNavigation from './components/Layout/BottomNavigation';

// 🔥 Import SOS Button + Hooks
import SOSButton from './components/SOSButton';
import { useHardwareSOS } from './hooks/useHardwareSOS';
import useShakeToSOS from './hooks/useShakeToSOS';
import useSOSActions from './hooks/useSOSActions';

const APP_CONFIG = {
  name: 'Andhra Mahila Samraksha',
  pages: {
    home: 'Andhra Mahila Samraksha',
    location: 'Location Tracking',
    contacts: 'Emergency Contacts',
    safety: 'Safety Features',
    profile: 'Profile'
  }
};

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('home');

  // ✅ Import SOS Actions (shared hook)
  const { triggerSOS } = useSOSActions();

  // ✅ Listen for hardware SOS button
  useHardwareSOS(triggerSOS);

  // ✅ Listen for shake motion everywhere
  useShakeToSOS(triggerSOS);

  if (!user) {
    return <LoginPage />;
  }

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage />;
      case 'location':
        return <LocationPage />;
      case 'contacts':
        return <ContactsPage />;
      case 'safety':
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-4">
            <SafetyPage />
            <SOSButton />
          </div>
        );
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  const getPageTitle = () => {
    return APP_CONFIG.pages[activeTab as keyof typeof APP_CONFIG.pages] || APP_CONFIG.name;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header title={getPageTitle()} />
      <main className="flex-1 pt-16 pb-20">
        {renderPage()}
      </main>
      <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
