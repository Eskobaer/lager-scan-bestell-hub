
import React from 'react';
import { LayoutDashboard, Package, QrCode, Tag, Clock } from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileNavigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'articles', label: 'Artikel', icon: Package },
    { id: 'scanner', label: 'Scanner', icon: QrCode },
    { id: 'labels', label: 'Schilder', icon: Tag },
    { id: 'log', label: 'Protokoll', icon: Clock }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="grid grid-cols-5">
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center gap-1 py-2 px-1 transition-colors ${
                isActive 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <IconComponent className={`h-5 w-5 ${isActive ? 'text-blue-600' : 'text-gray-600'}`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNavigation;
