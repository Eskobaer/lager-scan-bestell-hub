
import React, { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import ArticleManagement from '@/components/ArticleManagement';
import QRScanner from '@/components/QRScanner';
import LabelGenerator from '@/components/LabelGenerator';
import ActivityLog from '@/components/ActivityLog';
import UserManagement from '@/components/UserManagement';
import MobileNavigation from '@/components/MobileNavigation';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { user } = useAuth();

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'articles':
        return <ArticleManagement />;
      case 'scanner':
        return <QRScanner />;
      case 'labels':
        return <LabelGenerator />;
      case 'log':
        return <ActivityLog />;
      case 'users':
        return <UserManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <header className="bg-card shadow-sm border-b border-border sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-foreground">
                Digitales Lagersystem
              </h1>
              <p className="text-sm text-muted-foreground">
                Intelligente Lagerverwaltung mit QR-Codes
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Online</span>
              </div>
              {user && (
                <div className="text-sm text-muted-foreground">
                  Angemeldet als: <span className="font-medium text-foreground">{user.username}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hauptinhalt */}
      <main className="flex-1">
        {renderActiveComponent()}
      </main>

      {/* Mobile Navigation */}
      <MobileNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
    </div>
  );
};

export default Index;
