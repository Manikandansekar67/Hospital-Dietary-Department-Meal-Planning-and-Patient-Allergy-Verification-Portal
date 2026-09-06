import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChefHat,
  Clock,
  MessageSquare,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  Utensils,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { EmptyState, LoadingState } from '../../components/common/StateFeedback';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FeedbackModal } from '../../components/order/FeedbackModal';
import { OrderTimeline } from '../../components/order/OrderTimeline';
import { useAuth } from '../../store/AuthContext';
import { useNotifications } from '../../store/NotificationContext';
import { orderService } from '../../services/orderService';
import { patientService } from '../../services/patientService';
import { Order, Patient } from '../../types';

export const PatientOrderTrackingPage: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useNotifications();

  const [orders, setOrders] = useState<Order[]>([]);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Feedback modal
  const [selectedOrderForFeedback, setSelectedOrderForFeedback] = useState<Order | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [user]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      let p: Patient | null = null;
      if (user?.patientId) {
        p = (await patientService.getPatientById(user.patientId)) || null;
      }
      if (!p) {
        const all = await patientService.getPatients();
        p = all[0] || null;
      }
      setPatient(p);

      if (p) {
        const data = await orderService.getOrdersByPatientId(p.id);
        setOrders(data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenFeedback = (order: Order) => {
    setSelectedOrderForFeedback(order);
    setIsFeedbackModalOpen(true);
  };

  const handleSubmitFeedback = async (orderId: string, rating: number, comment: string) => {
    const updated = await orderService.submitFeedback(orderId, rating, comment);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    addToast({
      title: 'Feedback Submitted',
      message: 'Thank you! Your rating has been recorded for the dietary department.',
      type: 'success',
    });
  };

  if (isLoading) {
    return <LoadingState message="Tracking bedside meal delivery status..." />;
  }

  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const deliveredOrders = orders.filter((o) => o.status === 'delivered');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Bedside Order Tracking &amp; History</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Live updates on meal preparation, delivery progress, and post-meal dietary ratings.
          </p>
        </div>
        <Link to="/patient/menu">
          <Button size="sm" leftIcon={<Utensils className="w-4 h-4" />}>
            Order Another Meal
          </Button>
        </Link>
      </div>

      {/* Active Orders Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-teal-800">
          Live Order Status ({activeOrders.length})
        </h3>

        {activeOrders.length === 0 ? (
          <div className="p-6 bg-white rounded-2xl border border-dashed border-slate-300 text-center text-slate-400">
            <Clock className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-700">No Orders in Active Preparation</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Place an order from your approved menu to view live tracking.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-teal-200 p-5 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-sm text-teal-900">
                        Order #{order.orderNumber}
                      </span>
                      <StatusBadge type="status" value={order.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {order.foodName} · {order.mealType} Service · Placed at{' '}
                      {new Date(order.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100">
                    Room {order.roomNumber} Bedside
                  </span>
                </div>

                {/* Timeline Component */}
                <OrderTimeline order={order} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delivered Orders & Feedback Section */}
      <div className="space-y-4 pt-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700">
          Completed &amp; Delivered Meals ({deliveredOrders.length})
        </h3>

        {deliveredOrders.length === 0 ? (
          <p className="text-xs text-slate-400 italic">No previous meals delivered yet.</p>
        ) : (
          <div className="space-y-3">
            {deliveredOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <h4 className="text-sm font-bold text-slate-900">{order.foodName}</h4>
                    <span className="font-mono text-xs text-slate-400">#{order.orderNumber}</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Delivered on {new Date(order.orderTime).toLocaleDateString()} at{' '}
                    {new Date(order.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                {/* Feedback Display or Prompt */}
                <div>
                  {order.feedback ? (
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs">
                      <div className="flex items-center gap-1 text-amber-600 font-bold mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < order.feedback!.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-200 fill-slate-100'
                            }`}
                          />
                        ))}
                        <span className="ml-1 text-slate-800 font-bold">{order.feedback.rating}/5</span>
                      </div>
                      {order.feedback.comment && (
                        <p className="text-slate-700 italic text-[11px]">"{order.feedback.comment}"</p>
                      )}
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<MessageSquare className="w-4 h-4" />}
                      onClick={() => handleOpenFeedback(order)}
                    >
                      Rate Meal &amp; Dietary Care
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Post Delivery Feedback Modal */}
      {selectedOrderForFeedback && (
        <FeedbackModal
          isOpen={isFeedbackModalOpen}
          onClose={() => setIsFeedbackModalOpen(false)}
          order={selectedOrderForFeedback}
          onSubmit={handleSubmitFeedback}
        />
      )}
    </div>
  );
};
