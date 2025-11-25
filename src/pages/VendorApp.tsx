import { useState, useEffect } from 'react';
import { Plus, Package, TrendingUp, Clock, DollarSign } from 'lucide-react';
import { Navigation } from '../components/Navigation';
import { MapView } from '../components/Map/MapView';
import { ProDashboard } from './ProDashboard';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Product, Vendor, Order, RelayPoint } from '../types';

export function VendorApp() {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [relayPoints, setRelayPoints] = useState<RelayPoint[]>([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayOrders: 0,
    activeProducts: 0,
    avgOrderValue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendorData();
  }, [user]);

  const loadVendorData = async () => {
    if (!user) return;

    try {
      const { data: vendorData, error: vendorError } = await supabase
        .from('vendors')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (vendorError) throw vendorError;
      setVendor(vendorData);

      await Promise.all([
        loadProducts(vendorData.id),
        loadOrders(vendorData.id),
        loadRelayPoints(vendorData),
      ]);
    } catch (error) {
      console.error('Error loading vendor data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async (vendorId: string) => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('vendor_id', vendorId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setProducts(data);
      setStats((prev) => ({ ...prev, activeProducts: data.filter((p) => p.is_available).length }));
    }
  };

  const loadOrders = async (vendorId: string) => {
    const { data, error } = await supabase
      .from('order_items')
      .select(`
        *,
        order:orders(*)
      `)
      .eq('vendor_id', vendorId);

    if (!error && data) {
      const uniqueOrders = Array.from(
        new Map(data.map((item) => [item.order.id, item.order])).values()
      );
      setOrders(uniqueOrders);

      const today = new Date().toISOString().split('T')[0];
      const todayOrders = uniqueOrders.filter((o) => o.created_at.startsWith(today));

      const totalRevenue = data.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
      const avgOrderValue = uniqueOrders.length > 0 ? totalRevenue / uniqueOrders.length : 0;

      setStats((prev) => ({
        ...prev,
        totalRevenue,
        todayOrders: todayOrders.length,
        avgOrderValue,
      }));
    }
  };

  const loadRelayPoints = async (vendorData: Vendor) => {
    if (!vendorData.latitude || !vendorData.longitude) return;

    const { data, error } = await supabase
      .from('relay_points')
      .select('*')
      .eq('is_active', true);

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
