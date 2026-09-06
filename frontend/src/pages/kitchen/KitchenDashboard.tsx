import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertOctagon,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  ChefHat,
  Clock,
  Power,
  ShieldCheck,
  ShoppingBag,
  Truck,
  Utensils,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { LoadingState } from '../../components/common/StateFeedback';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../store/AuthContext';
import { useKitchen } from '../../store/KitchenContext';
import { kitchenService } from '../../services/kitchenService';
import { orderService } from '../../services/orderService';
import { MealSession, Order } from '../../types';

export const KitchenDashboard: React.FC = () => {
  const { kitchenStatus, toggleKitchenStatus, currentSession, availableTodayCount } = useKitchen();
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handleToggleStatus = async () => {
    if (user) {
      await toggleKitchenStatus(!kitchenStatus.isActive, user.name);
    }
  };

  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const readyCount = orders.filter((o) => o.status === 'ready').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;

  const activeAllergyOrders = orders.filter(
    (o) => o.patientAllergies.length > 0 && (o.status === 'pending' || o.status === 'preparing')
  );

  return (
    <div className="space-y-6">
      {/* Top Banner with Kitchen Status Toggle */}
      <div
        className={`rounded-2xl p-6 text-white shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${
          kitchenStatus.isActive
            ? 'bg-gradient-to-r from-emerald-800 to-teal-900'
            : 'bg-gradient-to-r from-slate-800 to-slate-900 border-2 border-red-500/50'
        }`}
      >
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                kitchenStatus.isActive ? 'bg-emerald-400 animate-ping' : 'bg-red-500'
              }`}
            />
            <span className="text-xs font-black uppercase tracking-widest text-emerald-200">
              Central Dietary Kitchen Status
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-2">
            <Power className={`w-6 h-6 ${kitchenStatus.isActive ? 'text-emerald-300' : 'text-red-400'}`} />
            {kitchenStatus.isActive ? 'Kitchen Operational — Intake Active' : 'Kitchen Intake Currently Inactive'}
          </h2>

          <p className="text-xs sm:text-sm text-slate-200 max-w-xl leading-relaxed">
            {kitchenStatus.isActive
              ? 'Inpatients may place meal orders for approved foods. Kitchen staff receives live allergy-safe tickets.'
              : 'Meal ordering is paused for patient bedside terminals. Use the toggle below to activate meal intake.'}
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1 font-medium">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-300" />
              Today: <strong>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-300" />
              Current Meal Session: <strong className="text-white uppercase">{currentSession}</strong>
            </span>
          </div>
        </div>

        {/* Large Toggle Control */}
        <div className="flex flex-col items-center gap-2 bg-white/10 p-4 rounded-xl backdrop-blur-xs border border-white/20 shrink-0">
          <button
            type="button"
            onClick={handleToggleStatus}
            className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-md transition-all active:scale-95 ${
              kitchenStatus.isActive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold'
            }`}
          >
            <Power className="w-4 h-4" />
            {kitchenStatus.isActive ? 'Deactivate Kitchen' : 'Activate Kitchen Now'}
          </button>
          <span className="text-[10px] text-slate-300">
            Last toggled: {kitchenStatus.lastToggledAt ? new Date(kitchenStatus.lastToggledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'} by{' '}
            {kitchenStatus.lastToggledBy || kitchenStatus.toggledBy || 'Staff'}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Available Foods</span>
            <Utensils className="w-4 h-4 text-teal-700" />
          </div>
          <p className="text-2xl font-black text-slate-900">{availableTodayCount}</p>
          <span className="text-[11px] text-teal-700 font-medium">On today's menu</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-semibold text-amber-800">Pending Orders</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700">{pendingCount}</p>
          <span className="text-[11px] text-amber-600 font-medium">Awaiting preparation</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-2xs">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-semibold text-blue-800">In Preparation</span>
            <ChefHat className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-blue-700">{preparingCount}</p>
          <span className="text-[11px] text-blue-600 font-medium">Active cooking</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-semibold text-emerald-800">Ready for Bedside</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{readyCount}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Quality inspected</span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Delivered Today</span>
            <Truck className="w-4 h-4 text-teal-700" />
          </div>
          <p className="text-2xl font-black text-slate-900">{deliveredCount}</p>
          <span className="text-[11px] text-slate-500 font-medium">Bedside fulfilled</span>
        </div>
      </div>

      {/* Allergy Isolation & Production Station Quick Alert */}
      {activeAllergyOrders.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-red-950 flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-red-600" />
                {activeAllergyOrders.length} Active Kitchen Order(s) with Patient Food Allergies
              </h4>
              <p className="text-xs text-red-800 mt-0.5">
                Ensure strict protocol: separate cookware, isolated sanitization, and allergen avoidance instructions.
              </p>
            </div>
          </div>
          <Link to="/kitchen/allergy-prep">
            <Button variant="danger" size="sm">
              Open Allergy Prep Station
            </Button>
          </Link>
        </div>
      )}

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center mb-3">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Daily Food Availability</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Define which approved meals are in stock and being cooked for Breakfast, Lunch, Dinner, or Snacks today.
            </p>
          </div>
          <Link to="/kitchen/availability" className="mt-4">
            <Button size="sm" variant="outline" className="w-full">
              Manage Daily Menu
            </Button>
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center mb-3">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Kitchen Production Queue</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Track incoming meal tickets. Advance tickets through Preparing, Ready, and Delivered states with one click.
            </p>
          </div>
          <Link to="/kitchen/orders" className="mt-4">
            <Button size="sm" variant="primary" className="w-full">
              View Cooking Queue ({pendingCount + preparingCount})
            </Button>
          </Link>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="w-9 h-9 rounded-lg bg-red-100 text-red-800 flex items-center justify-center mb-3">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Allergen Isolation Station</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Dedicated high-visibility station showing exact avoided ingredients for each patient.
            </p>
          </div>
          <Link to="/kitchen/allergy-prep" className="mt-4">
            <Button size="sm" variant="outline" className="w-full">
              Open Prep Station
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
