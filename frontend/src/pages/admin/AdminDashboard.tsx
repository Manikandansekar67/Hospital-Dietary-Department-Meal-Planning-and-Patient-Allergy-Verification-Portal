import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertOctagon,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ChefHat,
  Clock,
  HeartPulse,
  ShieldAlert,
  ShoppingBag,
  Stethoscope,
  TrendingUp,
  UserCheck,
  Users,
  Utensils,
  XCircle,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card } from '../../components/common/Card';
import { LoadingState } from '../../components/common/StateFeedback';
import { AdminDashboardStats, adminService } from '../../services/adminService';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !stats) {
    return <LoadingState message="Compiling dietary audits &amp; patient metrics..." className="min-h-[400px]" />;
  }

  const COLORS = ['#0F766E', '#2563EB', '#F59E0B', '#16A34A', '#8B5CF6', '#EC4899'];
  const APPROVAL_COLORS = ['#16A34A', '#F59E0B', '#DC2626'];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-teal-200 text-xs font-bold uppercase tracking-wider">Executive Overview</span>
          <h2 className="text-xl sm:text-2xl font-black mt-1">Hospital Dietary &amp; Nutrition System</h2>
          <p className="text-teal-100/90 text-xs sm:text-sm mt-1 max-w-2xl">
            Real-time monitoring of clinical condition matching, allergen cross-contact hazards, kitchen availability, and patient meal safety.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/reports"
            className="px-4 py-2 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-semibold text-white transition-colors border border-white/20 whitespace-nowrap"
          >
            Audit Reports
          </Link>
          <Link
            to="/admin/foods"
            className="px-4 py-2 bg-white text-teal-900 hover:bg-teal-50 rounded-lg text-xs font-bold transition-colors shadow-xs whitespace-nowrap"
          >
            Food Catalog
          </Link>
        </div>
      </div>

      {/* 9 Stat KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Patients */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Inpatients</span>
            <UserCheck className="w-4 h-4 text-teal-700" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalPatients}</p>
          <span className="text-[11px] text-teal-700 font-medium">Allergies tracked</span>
        </div>

        {/* Total Doctors */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Physicians</span>
            <Stethoscope className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalDoctors}</p>
          <span className="text-[11px] text-slate-500">Approving diets</span>
        </div>

        {/* Total Kitchen Staff */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Kitchen Staff</span>
            <ChefHat className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalKitchenStaff}</p>
          <span className="text-[11px] text-slate-500">Preparation team</span>
        </div>

        {/* Total Foods */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Foods</span>
            <Utensils className="w-4 h-4 text-teal-700" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalFoods}</p>
          <span className="text-[11px] text-emerald-700 font-medium">{stats.activeFoods} active today</span>
        </div>

        {/* Total Diseases */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Diseases</span>
            <HeartPulse className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.totalDiseases}</p>
          <span className="text-[11px] text-slate-500">Rule profiles</span>
        </div>

        {/* Today's Orders */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Today's Orders</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.todaysOrders}</p>
          <span className="text-[11px] text-emerald-700 font-medium">Delivering safely</span>
        </div>

        {/* Active Foods */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-500">Active Foods</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.activeFoods}</p>
          <span className="text-[11px] text-teal-700 font-medium">In master catalog</span>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-amber-700">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-700">{stats.pendingApprovals}</p>
          <span className="text-[11px] text-amber-600 font-medium">Doctor review queue</span>
        </div>

        {/* Allergy Alerts */}
        <div className="col-span-2 sm:col-span-1 bg-red-50/70 p-4 rounded-xl border border-red-200 shadow-2xs">
          <div className="flex items-center justify-between text-red-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-800">Allergy Alerts</span>
            <AlertOctagon className="w-4 h-4 text-red-600 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-red-700">{stats.allergyAlerts}</p>
          <span className="text-[11px] text-red-600 font-medium">Blocked hazards</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Orders by Day */}
        <Card title="Dietary Orders by Day" subtitle="Daily patient meal fulfillment over the past 7 days">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.ordersByDay} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderColor: '#CBD5E1',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Orders Delivered"
                  stroke="#0F766E"
                  strokeWidth={2.5}
                  dot={{ fill: '#0F766E', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Approved vs Rejected Foods */}
        <Card title="Doctor Clinical Approvals Breakdown" subtitle="Safety and allergy verification decisions">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.approvalComparison} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderColor: '#CBD5E1',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Evaluations" radius={[4, 4, 0, 0]}>
                  {stats.approvalComparison.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={APPROVAL_COLORS[index % APPROVAL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 3: Patient Diet Distribution */}
        <Card title="Patient Medical Diet Distribution" subtitle="Active diagnoses across admitted inpatients">
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.dietDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  fontSize={10}
                >
                  {stats.dietDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 4: Food Category Distribution */}
        <Card title="Master Food Catalog by Category" subtitle="Distribution of available nutritional groups">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.foodCategoryDistribution}
                layout="vertical"
                margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                <XAxis type="number" stroke="#64748B" fontSize={11} />
                <YAxis dataKey="category" type="category" stroke="#64748B" fontSize={11} width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderColor: '#CBD5E1',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" name="Food Items" fill="#0F766E" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
