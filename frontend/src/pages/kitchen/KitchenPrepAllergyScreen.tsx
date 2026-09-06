import React, { useEffect, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ChefHat,
  Filter,
  Flame,
  Search,
  ShieldAlert,
  ShieldCheck,
  Utensils,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { SearchBar } from '../../components/common/NavigationControls';
import { EmptyState, LoadingState } from '../../components/common/StateFeedback';
import { KitchenAllergyCard } from '../../components/kitchen/KitchenAllergyCard';
import { useAuth } from '../../store/AuthContext';
import { useNotifications } from '../../store/NotificationContext';
import { orderService } from '../../services/orderService';
import { Order } from '../../types';

export const KitchenPrepAllergyScreen: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user } = useAuth();
  const { addToast } = useNotifications();

  useEffect(() => {
    loadActiveOrders();
  }, []);

  const loadActiveOrders = async () => {
    setIsLoading(true);
    try {
      const all = await orderService.getOrders();
      // Filter orders currently in pending or preparing
      setOrders(all.filter((o) => o.status === 'pending' || o.status === 'preparing'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkCooked = async (orderId: string) => {
    const updated = await orderService.updateOrderStatus(
      orderId,
      'ready',
      user?.name || 'Prep Cook',
      'Cooked according to strict allergen containment guidelines.'
    );
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    addToast({
      title: 'Prep Verified & Marked Ready',
      message: `Order #${updated.orderNumber} for ${updated.patientName} moved to Ready station.`,
      type: 'success',
    });
  };

  const filtered = orders.filter(
    (o) =>
      o.patientName.toLowerCase().includes(search.toLowerCase()) ||
      o.foodName.toLowerCase().includes(search.toLowerCase()) ||
      o.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.avoidIngredients.some((i) => i.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-md border-2 border-red-500/40">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
          <span className="text-xs font-black uppercase tracking-widest text-red-400">
            HACCP Allergen Isolation Production Station
          </span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-tight">
          Patient Allergy Avoidance &amp; Cross-Contact Safeguards
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mt-1 leading-relaxed">
          The dietary verification engine and physician have determined food safety. Kitchen staff must strictly
          follow the preparation protocols and avoid all listed allergen derivatives.
        </p>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Filter active prep orders by patient, room, or allergen ingredient..."
          className="max-w-md"
        />
      </div>

      {isLoading ? (
        <LoadingState message="Loading live prep tickets..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No active cooking tickets requiring isolation"
          description="All active orders have been prepped or moved to ready dispatch."
          icon={<ChefHat className="w-8 h-8 text-teal-700" />}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl border-2 border-slate-200 p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-xs text-teal-800">TICKET #{order.orderNumber}</span>
                  <h3 className="text-base font-extrabold text-slate-900">{order.foodName}</h3>
                </div>
                <Button
                  size="sm"
                  variant="success"
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={() => handleMarkCooked(order.id)}
                >
                  Confirm Prep Complete
                </Button>
              </div>

              {/* Patient and Allergy Instructions */}
              <KitchenAllergyCard order={order} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
