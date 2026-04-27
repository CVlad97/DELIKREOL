import { useState } from 'react';
import { Navigation } from '../components/Navigation';
import { QRScanner } from '../components/QRScanner';
import { ProDashboard } from './ProDashboard';
import { supabase } from '../lib/supabase';

export function RelayHostApp() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [showScanner, setShowScanner] = useState(false);
  // Host data now managed by ProDashboard and specific views

  // Data loading removed - now handled by ProDashboard and specific views

  const handleQRScan = async (qrData: string) => {
    try {
      const depositId = qrData.split('-')[0];

      const { data: deposit, error } = await supabase
        .from('relay_point_deposits')
        .select('*, order:orders(*)')
        .eq('id', depositId)
        .maybeSingle();

      if (error) throw error;
      if (!deposit) {
        alert('Dépôt non trouvé');
        return;
      }

      if (deposit.status === 'awaiting_deposit') {
        await supabase
          .from('relay_point_deposits')
          .update({
            status: 'deposited',
            deposited_at: new Date().toISOString(),
          })
          .eq('id', depositId);

        alert('Dépôt confirmé avec succès!');
      } else if (deposit.status === 'deposited') {
        await supabase
          .from('relay_point_deposits')
          .update({
            status: 'picked_up',
            picked_up_at: new Date().toISOString(),
          })
          .eq('id', depositId);

        alert('Retrait confirmé avec succès!');
      }

      setShowScanner(false);
    } catch (error) {
      console.error('Error processing QR code:', error);
      alert('Erreur lors du traitement du QR code');
    }
  };

  const renderDashboard = () => (
    <ProDashboard onNavigate={setCurrentView} />
  );

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return renderDashboard();
      case 'deposits':
        return <div className="p-4">Deposits View (TODO)</div>;
      case 'capacity':
        return <div className="p-4">Capacity View (TODO)</div>;
      case 'scanner':
        return <div className="p-4">QR Scanner (TODO)</div>;
      default:
        return renderDashboard();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {renderView()}
      <Navigation userType="relay_host" currentView={currentView} onNavigate={setCurrentView} />
      {showScanner && (
        <QRScanner onScan={handleQRScan} onClose={() => setShowScanner(false)} />
      )}
    </div>
  );
}
