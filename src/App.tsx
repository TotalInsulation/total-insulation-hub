import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import AuthGate from './pages/Auth/AuthGate';
import BottomNav, { NavTab } from './components/BottomNav';
import HomePage from './pages/Home/HomePage';
import ComingSoon from './components/ComingSoon';
import './styles/global.css';

function AppShell() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  return (
    <div className="app-shell">
      {activeTab === 'home' && <HomePage />}
      {activeTab === 'onsite' && <ComingSoon moduleName="Onsite" />}
      {activeTab === 'business' && <ComingSoon moduleName="Business" />}
      {activeTab === 'crew' && <ComingSoon moduleName="Crew" />}
      {activeTab === 'team' && <ComingSoon moduleName="Team" />}
      {activeTab === 'more' && <ComingSoon moduleName="More" />}

      <BottomNav active={activeTab} onChange={setActiveTab} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <AppShell />
      </AuthGate>
    </AuthProvider>
  );
}
