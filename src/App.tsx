import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import AuthGate from './pages/Auth/AuthGate';
import BottomNav, { NavTab } from './components/BottomNav';
import HomePage from './pages/Home/HomePage';
import ComingSoon from './components/ComingSoon';
import RestrictedModule from './components/RestrictedModule';
import BusinessHome from './pages/Business/BusinessHome';
import MessagesHome from './pages/Team/Messages/MessagesHome';
import TeamHome from './pages/Team/TeamHome';
import CrewHome from './pages/Crew/CrewHome';
import MoreHome from './pages/More/MoreHome';
import { useModuleAccess } from './hooks/useModuleAccess';
import './styles/global.css';

const tabToModuleKey: Record<string, 'business' | 'crew' | 'more' | null> = {
  business: 'business',
  crew: 'crew',
  more: 'more',
  home: null,
  onsite: null,
  team: null,
};

function AppShell() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const { canAccess, loading: permissionsLoading } = useModuleAccess();

  const moduleKey = tabToModuleKey[activeTab];
  const isBlocked = moduleKey !== null && !permissionsLoading && !canAccess(moduleKey);

  return (
    <div className="app-shell">
      {isBlocked ? (
        <RestrictedModule />
      ) : (
        <>
          {activeTab === 'home' && <HomePage />}
          {activeTab === 'onsite' && <ComingSoon moduleName="Onsite" />}
          {activeTab === 'business' && <BusinessHome />}
          {activeTab === 'crew' && <CrewHome />}
          {activeTab === 'team' && <TeamHome />}
          {activeTab === 'more' && <MoreHome />}
        </>
      )}

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
