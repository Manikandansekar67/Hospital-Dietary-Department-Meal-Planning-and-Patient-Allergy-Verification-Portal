import React, { useEffect, useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  ChefHat,
  Clock,
  Filter,
  Search,
  Truck,
  Utensils,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { SearchBar } from '../../components/common/NavigationControls';
import { EmptyState, LoadingState } from '../../components/common/StateFeedback';
import { StatusBadge } from '../../components/common/StatusBadge';
import { KitchenAllergyCard } from '../../components/kitchen/KitchenAllergyCard';
import { useAuth } from '../../store/AuthContext';
import { useNotifications } from '../../store/NotificationContext';
import { orderService } from '../../services/orderService';
import { Order, OrderStatus } from '../../types';

export const KitchenOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const { user } = useAuth();
  const { addToast } = useNotifications();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus, notes?: string) => {
    const updated = await orderService.updateOrderStatus(
      orderId,
      newStatus,
      user?.name || 'Kitchen Staff',
      notes
    );
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));

    addToast({
      title: `Order Updated: ${newStatus.toUpperCase()}`,
      message: `Order #${updated.orderNumber} for ${updated.patientName} is now ${newStatus}.`,
      type: newStatus === 'delivered' ? 'success' : 'info',
    });
  };

  const filtered = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.patientName.toLowerCase().includes(search.toLowerCase()) ||
      o.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.foodName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Dietary Kitchen Production Queue</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Incoming meal orders from inpatients with automated allergy isolation instructions and station progression.
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <SearchBar value={search} onChange={setSearch} placeholder="Search order ID, patient, or room..." className="w-full sm:w-80" />

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Orders' },
            { id: 'pending', label: 'Pending Queue' },
            { id: 'preparing', label: 'In Cooking' },
            { id: 'ready', label: 'Ready for Dispatch' },
            { id: 'delivered', label: 'Delivered' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold uppercase transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Connecting to central kitchen production queue..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No orders in this queue"
          description="There are currently no meal tickets matching your filter."
        />
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const hasAllergy = order.patientAllergies.length > 0;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-2xs ${
                  hasAllergy ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200'
                }`}
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                      {order.mealType.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-teal-900">
                          Order #{order.orderNumber}
                        </span>
                        <StatusBadge type="status" value={order.status} size="sm" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Patient: <strong className="text-slate-800 font-semibold">{order.patientName}</strong> · Room:{' '}
                        <strong className="text-teal-800">{order.roomNumber}</strong> ·{' '}
                        {new Date(order.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {/* Production Workflow Action Button */}
                  <div className="flex items-center gap-2 w-full lg:w-auto">
                    {order.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="primary"
                        leftIcon={<ChefHat className="w-4 h-4" />}
                        className="w-full lg:w-auto"
                        onClick={() =>
                          handleUpdateStatus(order.id, 'preparing', 'Cooked at sanitized isolation station.')
                        }
                      >
                        Start Preparing
                      </Button>
                    )}

                    {order.status === 'preparing' && (
                      <Button
                        size="sm"
                        variant="success"
                        leftIcon={<CheckCircle2 className="w-4 h-4" />}
                        className="w-full lg:w-auto"
                        onClick={() =>
                          handleUpdateStatus(order.id, 'ready', 'Quality-inspected and sealed for transit.')
                        }
                      >
                        Mark Quality Ready
                      </Button>
                    )}

                    {order.status === 'ready' && (
                      <Button
                        size="sm"
                        variant="primary"
                        leftIcon={<Truck className="w-4 h-4" />}
                        className="w-full lg:w-auto"
                        onClick={() =>
                          handleUpdateStatus(order.id, 'delivered', 'Hand-delivered to patient bedside tray.')
                        }
                      >
                        Mark Bedside Delivered
                      </Button>
                    )}

                    {order.status === 'delivered' && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Fulfilled
                      </span>
                    )}
                  </div>
                </div>

                {/* Body Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-4">
                  {/* Food item details */}
                  <div className="lg:col-span-4 space-y-2 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Ordered Meal Item
                    </span>
                    <h4 className="text-base font-bold text-slate-900">{order.foodName}</h4>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-slate-600">
                      <span className="font-semibold block text-[11px] text-slate-700">Meal Session:</span>
                      <span className="capitalize">{order.mealType} Service</span>
                    </div>
                  </div>

                  {/* Allergy Warning and Kitchen Protocol */}
                  <div className="lg:col-span-8">
                    <KitchenAllergyCard order={order} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
