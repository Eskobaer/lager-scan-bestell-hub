
import React, { useState } from 'react';
import Dashboard from '@/components/Dashboard';
import ArticleManagement from '@/components/ArticleManagement';
import QRScanner from '@/components/QRScanner';
import LabelGenerator from '@/components/LabelGenerator';
import ActivityLog from '@/components/ActivityLog';
import MobileNavigation from '@/components/MobileNavigation';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

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
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Digitales Lagersystem
              </h1>
              <p className="text-sm text-gray-600">
                Intelligente Lagerverwaltung mit QR-Codes
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Online</span>
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
