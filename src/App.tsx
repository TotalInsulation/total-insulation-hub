import React, { useState, useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import AuthGate from './pages/Auth/AuthGate';
import BottomNav, { NavTab } from './components/BottomNav';
import HomePage from './pages/Home/HomePage';
import ComingSoon from './components/ComingSoon';
import RestrictedModule from './components/RestrictedModule';
import ErrorBoundary from './components/ErrorBoundary';
import BusinessHome from './pages/Business/BusinessHome';
import MessagesHome from './pages/Team/Messages/MessagesHome';
import TeamHome from './pages/Team/TeamHome';
import CrewHome from './pages/Crew/CrewHome';
import MoreHome from './pages/More/MoreHome';
import OnsitePage from './pages/Onsite/OnsitePage';
import { useModuleAccess } from './hooks/useModuleAccess';
import type { NavigateDetail } from './lib/navigation';
import './styles/global.css';

const ACTIVE_TAB_KEY = 'ti_hub_active_tab';

const tabToModuleKey: Record<string, 'business' | 'crew' | 'more' | null> = {
  business: 'business',
  crew: 'crew',
  more: 'more',
  home: null,
  onsite: null,
  team: null,
};

function AppShell() {
  const [activeTab, setActiveTabState] = useState<NavTab>(() => {
    const saved = sessionStorage.getItem(ACTIVE_TAB_KEY);
    return (saved as NavTab) || 'home';
  });
  const { canAccess, loading: permissionsLoading } = useModuleAccess();

  function setActiveTab(tab: NavTab) {
    setActiveTabState(tab);
    sessionStorage.setItem(ACTIVE_TAB_KEY, tab);
  }

  useEffect(() => {
    function handleNavigate(e: Event) {
      const detail = (e as CustomEvent<NavigateDetail>).detail;
      if (detail.subTab) {
        sessionStorage.setItem(`ti_hub_${detail.tab}_subtab`, detail.subTab);
      }
      setActiveTab(detail.tab as NavTab);
    }
    window.addEventListener('ti-navigate', handleNavigate);
    return () => window.removeEventListener('ti-navigate', handleNavigate);
  }, []);

  const moduleKey = tabToModuleKey[activeTab];
  const isBlocked = moduleKey !== null && !permissionsLoading && !canAccess(moduleKey);

  return (
    <div className="app-shell">
      <ErrorBoundary>
        {isBlocked ? (
          <RestrictedModule />
        ) : (
          <>
            {activeTab === 'home' && <HomePage />}
            {activeTab === 'onsite' && <OnsitePage />}
            {activeTab === 'business' && <BusinessHome />}
            {activeTab === 'crew' && <CrewHome />}
            {activeTab === 'team' && <TeamHome />}
            {activeTab === 'more' && <MoreHome />}
          </>
        )}
      </ErrorBoundary>

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
