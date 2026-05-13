import { useState } from 'react';
import { Navigation } from '../components/Navigation';
import { ProDashboard } from './ProDashboard';
import { VendorProducts } from './vendor/VendorProducts';
import { PartnerDashboardPage } from './PartnerDashboardPage';

export function VendorApp() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderDashboard = () => (
    <ProDashboard onNavigate={setCurrentView} />
  );

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'products':
        return <VendorProducts />;
      case 'documents':
        return <PartnerDashboardPage />;
      case 'orders':
        return <VendorProducts />;
      case 'stats':
        return <ProDashboard onNavigate={setCurrentView} />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-[#f6efe7]">
      {renderView()}
      <Navigation userType="vendor" currentView={currentView} onNavigate={setCurrentView} />
    </div>
  );
}
