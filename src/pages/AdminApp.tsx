import { useState, useEffect } from 'react';
// Unused imports removed for cleaner code
import { Navigation } from '../components/Navigation';
import { MapView } from '../components/Map/MapView';
import { APIKeysManager } from '../components/admin/APIKeysManager';
import { WhatsAppManager } from '../components/admin/WhatsAppManager';
import { AdminInsights } from './AdminInsights';
import { AdminHub } from './AdminHub';
import { AdminRequests } from './AdminRequests';
import { AdminTestGuide } from './AdminTestGuide';
import { AdminPartners } from './admin/AdminPartners';
import { CommunityFundAdmin } from './admin/CommunityFundAdmin';
import { ProDashboard } from './ProDashboard';
import { supabase } from '../lib/supabase';
import { Vendor, RelayPoint, Location } from '../types';
// Integration imports removed (not used in this view)

export function AdminApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [relayPoints, setRelayPoints] = useState<RelayPoint[]>([]);
  // Stats now managed by ProDashboard
  const [mapCenter] = useState<Location>({
    latitude: 14.6415,
    longitude: -61.0242,
  });
  // Loading state managed by ProDashboard and sub-views

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      await Promise.all([
        loadVendors(),
        loadRelayPoints(),
      ]);
    } catch (error) {
      console.error('Error loading admin data:', error);
    }
  };

  // loadStats removed - now handled by ProDashboard

  const loadVendors = async () => {
    const { data, error } = await supabase
      .from('vendors')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setVendors(data);
    }
  };

  const loadRelayPoints = async () => {
    const { data, error } = await supabase
      .from('relay_points')
      .select(`
        *,
        storage_capacities(*)
      `)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setRelayPoints(data);
    }
  };

  const renderDashboard = () => (
    <ProDashboard onNavigate={setCurrentView} />
  );

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'hub':
        return <AdminHub />;
      case 'requests':
        return <AdminRequests />;
      case 'partners':
        return <AdminPartners />;
      case 'insights':
        return <AdminInsights />;
      case 'test-guide':
        return <AdminTestGuide />;
      case 'map':
        return <MapView vendors={vendors} relayPoints={relayPoints} center={mapCenter} zoom={11} />;
      case 'api-keys':
        return <APIKeysManager />;
      case 'whatsapp':
        return <WhatsAppManager />;
      case 'community-fund':
        return <CommunityFundAdmin />;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderView()}
      <Navigation userType="admin" currentView={currentView} onNavigate={setCurrentView} />
    </div>
  );
}
