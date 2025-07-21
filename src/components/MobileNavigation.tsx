
import React from 'react';
import { LayoutDashboard, Package, QrCode, Tag, Clock, Mail, Users, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileNavigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { isSuperAdmin, logout } = useAuth();
  
  const baseTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'articles', label: 'Artikel', icon: Package },
    { id: 'scanner', label: 'Scanner', icon: QrCode },
    { id: 'labels', label: 'Schilder', icon: Tag },
    { id: 'log', label: 'Protokoll', icon: Clock },
    { id: 'email', label: 'E-Mail', icon: Mail }
  ];

  const adminTabs = isSuperAdmin ? [
    { id: 'users', label: 'Benutzer', icon: Users }
  ] : [];

  const tabs = [...baseTabs, ...adminTabs];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className={`grid ${isSuperAdmin ? 'grid-cols-7' : 'grid-cols-6'}`}>
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 py-2 px-1 transition-colors ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <IconComponent className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
        <button
          onClick={logout}
          className="flex flex-col items-center gap-1 py-2 px-1 transition-colors text-muted-foreground hover:text-foreground hover:bg-muted"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-xs font-medium">Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileNavigation;
