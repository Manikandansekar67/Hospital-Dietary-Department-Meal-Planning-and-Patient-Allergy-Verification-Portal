import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertOctagon,
  ArrowRight,
  CalendarCheck,
  CheckCircle2,
  ChefHat,
  Clock,
<<<<<<< HEAD
  FileText,
  HeartPulse,
  RefreshCw,
  ShieldAlert,
  ShoppingBag,
  Sparkles,
=======
  HeartPulse,
  ShieldAlert,
  ShoppingBag,
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
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

<<<<<<< HEAD
const fallbackStats: AdminDashboardStats = {
  totalPatients: 3,
  totalDoctors: 2,
  totalKitchenStaff: 2,
  totalFoods: 7,
  totalDiseases: 6,
  todaysOrders: 4,
  activeFoods: 7,
  pendingApprovals: 0,
  allergyAlerts: 1,
  ordersByDay: [
    { day: 'Mon', count: 12 },
    { day: 'Tue', count: 14 },
    { day: 'Wed', count: 18 },
    { day: 'Thu', count: 15 },
    { day: 'Fri', count: 20 },
    { day: 'Sat', count: 16 },
    { day: 'Sun', count: 4 },
  ],
  dietDistribution: [
    { name: 'Type 2 Diabetes', value: 1 },
    { name: 'Hypertension', value: 1 },
    { name: 'Celiac Disease', value: 1 },
  ],
  foodCategoryDistribution: [
    { category: 'BREAKFAST', count: 1 },
    { category: 'LUNCH', count: 2 },
    { category: 'DINNER', count: 2 },
    { category: 'SNACK', count: 1 },
    { category: 'BEVERAGE', count: 1 },
  ],
  approvalComparison: [
    { name: 'Approved', count: 7 },
    { name: 'Pending', count: 0 },
    { name: 'Rejected (Safety)', count: 1 },
  ],
};

=======
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
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
<<<<<<< HEAD
      setStats(data || fallbackStats);
    } catch (e) {
      console.warn('Dashboard stats API error, using operational fallback:', e);
      setStats(fallbackStats);
=======
      setStats(data);
    } catch (e) {
      console.error(e);
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
  const activeStats = stats || fallbackStats;

  if (isLoading && !stats) {
    return <LoadingState message="Compiling dietary audits &amp; patient metrics..." className="min-h-[400px]" />;
  }

  const PALETTE = ['#0F766E', '#0284C7', '#6366F1', '#F59E0B', '#10B981', '#EC4899'];
  const APPROVAL_COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Department Operations
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">Real-Time Clinical Status</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Dietary Department Executive Overview</h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Centralized monitoring of inpatient meal fulfillment, clinical allergy contraindications, and nutrition safety compliance.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={loadStats}
            className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors border border-slate-200"
            title="Refresh metrics"
            aria-label="Refresh metrics"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
          </button>
          <Link
            to="/admin/reports"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors border border-slate-200 flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" />
=======
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
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
            Audit Reports
          </Link>
          <Link
            to="/admin/foods"
<<<<<<< HEAD
            className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Utensils className="w-3.5 h-3.5" />
=======
            className="px-4 py-2 bg-white text-teal-900 hover:bg-teal-50 rounded-lg text-xs font-bold transition-colors shadow-xs whitespace-nowrap"
          >
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
            Food Catalog
          </Link>
        </div>
      </div>

<<<<<<< HEAD
      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Inpatients */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium text-slate-500">Admitted Patients</span>
            <UserCheck className="w-4 h-4 text-teal-700" />
          </div>
          <p className="text-2xl font-black text-slate-900">{activeStats.totalPatients}</p>
          <span className="text-[11px] text-teal-700 font-medium">Allergies mapped</span>
        </div>

        {/* Master Food Catalog */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium text-slate-500">Food Catalog</span>
            <Utensils className="w-4 h-4 text-teal-700" />
          </div>
          <p className="text-2xl font-black text-slate-900">{activeStats.totalFoods}</p>
          <span className="text-[11px] text-emerald-700 font-medium">{activeStats.activeFoods} active today</span>
        </div>

        {/* Today's Orders */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium text-slate-500">Today's Orders</span>
            <ShoppingBag className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-slate-900">{activeStats.todaysOrders}</p>
          <span className="text-[11px] text-emerald-700 font-medium">In kitchen production</span>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white p-4 rounded-xl border border-amber-200/90 shadow-2xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between text-amber-600 mb-1.5">
            <span className="text-xs font-medium text-amber-800">Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-700">{activeStats.pendingApprovals}</p>
=======
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
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
          <span className="text-[11px] text-amber-600 font-medium">Doctor review queue</span>
        </div>

        {/* Allergy Alerts */}
<<<<<<< HEAD
        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-xl border border-red-200 shadow-2xs hover:border-red-300 transition-colors">
          <div className="flex items-center justify-between text-red-700 mb-1.5">
            <span className="text-xs font-medium text-red-800">Allergy Blocked</span>
            <AlertOctagon className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-black text-red-700">{activeStats.allergyAlerts}</p>
          <span className="text-[11px] text-red-600 font-medium">High safety hazards prevented</span>
        </div>
      </div>

      {/* Secondary Status Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-600 font-medium">Physicians &amp; Nutritionists</span>
          <span className="text-sm font-bold text-slate-900">{activeStats.totalDoctors}</span>
        </div>
        <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-600 font-medium">Kitchen Staff</span>
          <span className="text-sm font-bold text-slate-900">{activeStats.totalKitchenStaff}</span>
        </div>
        <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-600 font-medium">Disease Rule Profiles</span>
          <span className="text-sm font-bold text-slate-900">{activeStats.totalDiseases}</span>
        </div>
        <div className="bg-slate-50/80 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-600 font-medium">Master Ingredients</span>
          <span className="text-sm font-bold text-emerald-700">17 Cataloged</span>
=======
        <div className="col-span-2 sm:col-span-1 bg-red-50/70 p-4 rounded-xl border border-red-200 shadow-2xs">
          <div className="flex items-center justify-between text-red-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-800">Allergy Alerts</span>
            <AlertOctagon className="w-4 h-4 text-red-600 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-red-700">{stats.allergyAlerts}</p>
          <span className="text-[11px] text-red-600 font-medium">Blocked hazards</span>
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Orders by Day */}
        <Card title="Dietary Orders by Day" subtitle="Daily patient meal fulfillment over the past 7 days">
<<<<<<< HEAD
          <div className="h-[270px] w-full min-w-0">
            <ResponsiveContainer width="100%" height={260} minWidth={100} minHeight={240}>
              <LineChart data={activeStats.ordersByDay || []} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
=======
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.ordersByDay} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderColor: '#CBD5E1',
                    fontSize: '12px',
<<<<<<< HEAD
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
=======
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Orders Delivered"
                  stroke="#0F766E"
                  strokeWidth={2.5}
<<<<<<< HEAD
                  dot={{ fill: '#0F766E', r: 3.5 }}
                  activeDot={{ r: 5 }}
=======
                  dot={{ fill: '#0F766E', r: 4 }}
                  activeDot={{ r: 6 }}
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 2: Approved vs Rejected Foods */}
<<<<<<< HEAD
        <Card title="Clinical Approvals Breakdown" subtitle="Safety and allergy verification decisions">
          <div className="h-[270px] w-full min-w-0">
            <ResponsiveContainer width="100%" height={260} minWidth={100} minHeight={240}>
              <BarChart data={activeStats.approvalComparison || []} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
=======
        <Card title="Doctor Clinical Approvals Breakdown" subtitle="Safety and allergy verification decisions">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.approvalComparison} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} />
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderColor: '#CBD5E1',
                    fontSize: '12px',
<<<<<<< HEAD
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Bar dataKey="count" name="Evaluations" radius={[4, 4, 0, 0]}>
                  {(activeStats.approvalComparison || []).map((entry, index) => (
=======
                  }}
                />
                <Bar dataKey="count" name="Evaluations" radius={[4, 4, 0, 0]}>
                  {stats.approvalComparison.map((entry, index) => (
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                    <Cell key={`cell-${index}`} fill={APPROVAL_COLORS[index % APPROVAL_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 3: Patient Diet Distribution */}
        <Card title="Patient Medical Diet Distribution" subtitle="Active diagnoses across admitted inpatients">
<<<<<<< HEAD
          <div className="h-[270px] w-full min-w-0 flex items-center justify-center">
            <ResponsiveContainer width="100%" height={260} minWidth={100} minHeight={240}>
              <PieChart>
                <Pie
                  data={activeStats.dietDistribution || []}
=======
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.dietDistribution}
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
<<<<<<< HEAD
                  fontSize={11}
                >
                  {(activeStats.dietDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
=======
                  fontSize={10}
                >
                  {stats.dietDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Chart 4: Food Category Distribution */}
        <Card title="Master Food Catalog by Category" subtitle="Distribution of available nutritional groups">
<<<<<<< HEAD
          <div className="h-[270px] w-full min-w-0">
            <ResponsiveContainer width="100%" height={260} minWidth={100} minHeight={240}>
              <BarChart
                data={activeStats.foodCategoryDistribution || []}
=======
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={stats.foodCategoryDistribution}
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                layout="vertical"
                margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
<<<<<<< HEAD
                <XAxis type="number" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis dataKey="category" type="category" stroke="#64748B" fontSize={11} width={80} tickLine={false} />
=======
                <XAxis type="number" stroke="#64748B" fontSize={11} />
                <YAxis dataKey="category" type="category" stroke="#64748B" fontSize={11} width={80} />
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '8px',
                    borderColor: '#CBD5E1',
                    fontSize: '12px',
<<<<<<< HEAD
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
=======
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
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
