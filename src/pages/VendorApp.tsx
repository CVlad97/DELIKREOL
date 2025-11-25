import { useState } from 'react';
import { Navigation } from '../components/Navigation';
import { ProDashboard } from './ProDashboard';

export function VendorApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  // Vendor data now managed by ProDashboard and specific views
  // Remove unused state variables to simplify component

  // Data loading removed - now handled by ProDashboard and specific views when needed

  const renderDashboard = () => (
    <ProDashboard onNavigate={setCurrentView} />
  );

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'products':
        return <div className="p-4">Products View (TODO)</div>;
      case 'orders':
        return <div className="p-4">Orders View (TODO)</div>;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderView()}
      <Navigation userType="vendor" currentView={currentView} onNavigate={setCurrentView} />
    </div>
  );
}
