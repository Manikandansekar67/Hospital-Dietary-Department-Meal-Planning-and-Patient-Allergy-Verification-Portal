import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Clock,
  HeartPulse,
  Info,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
  User,
  Utensils,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { LoadingState } from '../../components/common/StateFeedback';
import { StatusBadge } from '../../components/common/StatusBadge';
import { OrderTimeline } from '../../components/order/OrderTimeline';
import { useAuth } from '../../store/AuthContext';
import { useKitchen } from '../../store/KitchenContext';
import { orderService } from '../../services/orderService';
import { patientService } from '../../services/patientService';
import { Order, Patient } from '../../types';

export const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const { kitchenStatus, currentSession } = useKitchen();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPatientPortal();
  }, [user]);

  const loadPatientPortal = async () => {
    setIsLoading(true);
    try {
      // Find patient corresponding to logged in user or default to Arun (PAT-001)
      let p: Patient | null = null;
      if (user?.patientId) {
        p = (await patientService.getPatientById(user.patientId)) || null;
      }
      if (!p) {
        // Default to Arun Kumar
        const all = await patientService.getPatients();
        p = all[0] || null;
      }

      setPatient(p);

      if (p) {
        const patientOrders = await orderService.getOrdersByPatientId(p.id);
        setOrders(patientOrders);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !patient) {
    return <LoadingState message="Loading your bedside health and meal records..." />;
  }

  const activeOrders = orders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled');
  const pastOrders = orders.filter((o) => o.status === 'delivered');

  return (
    <div className="space-y-6">
      {/* Patient Profile Card (Section 21) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold text-xl shadow-xs">
              {patient.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900">{patient.name}</h2>
                <Badge variant="teal">Inpatient</Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Patient Code: <strong className="text-slate-800 font-semibold">{patient.patientCode}</strong> · Room:{' '}
                <strong className="text-teal-800 text-sm font-extrabold">{patient.roomNumber}</strong> · Admitted:{' '}
                {patient.admissionDate}
              </p>
            </div>
          </div>

          <Link to="/patient/menu">
            <Button size="md" variant="primary" leftIcon={<Utensils className="w-4 h-4" />}>
              Order Meals for Today
            </Button>
          </Link>
        </div>

        {/* Clinical Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-5">
          {/* Medical Conditions */}
          <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5" />
              Diagnosed Conditions
            </span>
            <div className="flex flex-wrap gap-1 pt-1">
              {patient.diseases.map((d, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-white text-blue-900 border border-blue-200 text-xs font-bold">
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Diagnosed Allergies */}
          <div className="bg-red-50/60 p-4 rounded-xl border border-red-100 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5" />
              Diagnosed Food Allergies
            </span>
            <div className="flex flex-wrap gap-1 pt-1">
              {patient.allergies.length === 0 ? (
                <span className="text-xs text-slate-500 font-medium">None Recorded</span>
              ) : (
                patient.allergies.map((a, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-red-600 text-white text-xs font-black uppercase flex items-center gap-1"
                  >
                    <span>{a.allergyName}</span>
                    <span className="opacity-90">({a.severity})</span>
                  </span>
                ))
              )}
            </div>
          </div>

          {/* Current Dietary Instructions */}
          <div className="bg-teal-50/60 p-4 rounded-xl border border-teal-100 space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Dietary Instructions
            </span>
            <p className="text-xs text-slate-700 font-medium leading-relaxed">
              {patient.dietaryRestrictions.join(', ') || 'Standard Clinical Diet'}
            </p>
            {patient.specialInstructions && (
              <p className="text-[11px] text-teal-900 italic mt-1">"{patient.specialInstructions}"</p>
            )}
          </div>
        </div>
      </div>

      {/* Kitchen Status Alert Banner for Patient */}
      <div
        className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs ${
          kitchenStatus.isActive
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : 'bg-amber-50 border-amber-300 text-amber-950'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              kitchenStatus.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span>
            {kitchenStatus.isActive ? (
              <span>
                Hospital Kitchen is <strong>Active</strong>. Current service session: <strong className="uppercase">{currentSession}</strong>.
              </span>
            ) : (
              <span>
                Hospital Kitchen is currently <strong>Not Accepting Orders</strong>. Please check back during the next meal session.
              </span>
            )}
          </span>
        </div>

        <Link to="/patient/menu" className="font-bold underline shrink-0">
          View Approved Menu &rarr;
        </Link>
      </div>

      {/* Active Bedside Orders with Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Active Inpatient Meal Orders</h3>
          <span className="text-xs text-slate-500">{activeOrders.length} in progress</span>
        </div>

        {activeOrders.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-slate-400">
            <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 mb-2" />
            <p className="text-xs font-semibold text-slate-700">No Active Meal Orders</p>
            <p className="text-[11px] text-slate-400 mt-0.5 mb-3">You can order from your physician-approved meals for today.</p>
            <Link to="/patient/menu">
              <Button size="sm" variant="primary">
                Browse Approved Menu
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activeOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">
                      Order #{order.orderNumber} · {order.mealType} Service
                    </span>
                    <h4 className="text-base font-bold text-slate-900">{order.foodName}</h4>
                  </div>
                  <StatusBadge type="status" value={order.status} />
                </div>

                {/* Interactive Timeline */}
                <OrderTimeline order={order} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Previous Orders & Feedback Prompt */}
      {pastOrders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Previous Bedside Orders</h3>
            <Link to="/patient/orders" className="text-xs text-teal-700 hover:text-teal-900 font-semibold">
              View All History &rarr;
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
            {pastOrders.slice(0, 3).map((order) => (
              <div key={order.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-slate-900 font-semibold">{order.foodName}</strong>
                    <span className="text-slate-400 text-[11px]">#{order.orderNumber}</span>
                  </div>
                  <span className="text-slate-500 text-[11px]">
                    Delivered on {new Date(order.orderTime).toLocaleDateString()} at{' '}
                    {new Date(order.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {order.feedback ? (
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span>{order.feedback.rating}/5</span>
                    </div>
                  ) : (
                    <Link to="/patient/orders">
                      <Button size="sm" variant="outline">
                        Rate Meal
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
