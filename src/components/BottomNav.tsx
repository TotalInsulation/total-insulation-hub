import React from 'react';
import { Home, ShoppingCart, Briefcase, Users, MessageCircle, Menu } from 'lucide-react';

export type NavTab = 'home' | 'onsite' | 'business' | 'crew' | 'team' | 'more';

interface BottomNavProps {
  active: NavTab;
  onChange: (tab: NavTab) => void;
}

const tabs: { key: NavTab; label: string; icon: React.ReactNode }[] = [
  { key: 'home', label: 'Home', icon: <Home size={20} /> },
  { key: 'onsite', label: 'Onsite', icon: <ShoppingCart size={20} /> },
  { key: 'business', label: 'Business', icon: <Briefcase size={20} /> },
  { key: 'crew', label: 'Crew', icon: <Users size={20} /> },
  { key: 'team', label: 'Team', icon: <MessageCircle size={20} /> },
  { key: 'more', label: 'More', icon: <Menu size={20} /> },
];

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="bottom-nav">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`nav-item ${active === tab.key ? 'active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          <span className="nav-icon">{tab.icon}</span>
          <span className="nav-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  );
}
