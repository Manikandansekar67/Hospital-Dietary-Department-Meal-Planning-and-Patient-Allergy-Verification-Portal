import React from 'react';
import { NavLink as RouterNavLink, useNavigate as useRouterNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  BookOpen,
  CalendarCheck,
  ChefHat,
  ClipboardCheck,
  FileText,
  HeartHandshake,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Stethoscope,
  UserCheck,
  Users,
  Utensils,
  X,
} from 'lucide-react';
import { HOSPITAL_INFO } from '../../constants';
import { useAuth } from '../../store/AuthContext';
import { Role } from '../../types';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
  allowedRoles: Role[];
  badge?: string;
}

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, role, logout } = useAuth();
  const navigate = useRouterNavigate();

  const navItems: NavItem[] = [
    // Dashboards
    {
      label: 'Admin Dashboard',
      to: '/admin',
      icon: <LayoutDashboard className="w-4 h-4" />,
      allowedRoles: ['admin'],
    },
    {
      label: 'Doctor Dashboard',
      to: '/doctor',
      icon: <Stethoscope className="w-4 h-4" />,
      allowedRoles: ['doctor'],
    },
    {
      label: 'Kitchen Dashboard',
      to: '/kitchen',
      icon: <ChefHat className="w-4 h-4" />,
      allowedRoles: ['kitchen'],
    },
    {
      label: 'Patient Portal',
      to: '/patient',
      icon: <HeartPulse className="w-4 h-4" />,
      allowedRoles: ['patient'],
    },

    // Administrative & Clinical Management
    {
      label: 'User Management',
      to: '/admin/users',
      icon: <Users className="w-4 h-4" />,
      allowedRoles: ['admin'],
    },
    {
      label: 'Patients',
      to: role === 'admin' ? '/admin/patients' : '/doctor/patients',
      icon: <UserCheck className="w-4 h-4" />,
      allowedRoles: ['admin', 'doctor'],
    },
    {
      label: 'Foods Catalog',
      to: role === 'admin' ? '/admin/foods' : '/kitchen/foods',
      icon: <Utensils className="w-4 h-4" />,
      allowedRoles: ['admin', 'kitchen'],
    },
    {
      label: 'Diseases',
      to: '/admin/diseases',
      icon: <HeartPulse className="w-4 h-4" />,
      allowedRoles: ['admin'],
    },
    {
      label: 'Allergies',
      to: '/admin/allergies',
      icon: <AlertOctagon className="w-4 h-4" />,
      allowedRoles: ['admin'],
    },

    // Doctor Clinical Workflow
    {
      label: 'Food Recommendations',
      to: '/doctor/recommendations',
      icon: <Sparkles className="w-4 h-4" />,
      allowedRoles: ['doctor'],
    },
    {
      label: 'Approvals & Reviews',
      to: '/doctor/approvals',
      icon: <ClipboardCheck className="w-4 h-4" />,
      allowedRoles: ['doctor'],
    },

    // Kitchen Workflow
    {
      label: 'Daily Availability',
      to: '/kitchen/availability',
      icon: <CalendarCheck className="w-4 h-4" />,
      allowedRoles: ['kitchen', 'admin'],
    },
    {
      label: 'Kitchen Orders',
      to: '/kitchen/orders',
      icon: <ShoppingBag className="w-4 h-4" />,
      allowedRoles: ['kitchen'],
    },
    {
      label: 'Allergy & Prep Station',
      to: '/kitchen/allergy-prep',
      icon: <ShieldCheck className="w-4 h-4" />,
      allowedRoles: ['kitchen'],
    },

    // Patient Workflow
    {
      label: 'Approved Meal Menu',
      to: '/patient/menu',
      icon: <Utensils className="w-4 h-4" />,
      allowedRoles: ['patient'],
    },
    {
      label: 'My Orders & Delivery',
      to: '/patient/orders',
      icon: <ShoppingBag className="w-4 h-4" />,
      allowedRoles: ['patient'],
    },

    // Reports / Audit
    {
      label: 'Dietary Reports',
      to: '/admin/reports',
      icon: <FileText className="w-4 h-4" />,
      allowedRoles: ['admin'],
    },
  ];

  const visibleItems = navItems.filter((item) => role && item.allowedRoles.includes(role));

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="px-5 py-4.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-xs">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xs font-bold uppercase tracking-wider text-teal-400 leading-tight">Hospital Dietary</h1>
              <span className="text-xs font-semibold text-slate-200 block truncate max-w-[135px]">
                {HOSPITAL_INFO.name}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Card in Sidebar */}
        <div className="px-4 py-3 bg-slate-950/60 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-teal-900/80 text-teal-300 font-bold text-xs flex items-center justify-center border border-teal-700/60">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.name}</p>
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-teal-400">
                {role} role
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
            Navigation Menu
          </div>
          {visibleItems.map((item) => (
            <RouterNavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin' || item.to === '/doctor' || item.to === '/kitchen' || item.to === '/patient'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-700 text-white font-semibold shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {item.badge}
                </span>
              )}
            </RouterNavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2">
          <div className="px-3 py-1.5 text-[10px] text-slate-400 border border-slate-800 rounded-lg bg-slate-900/50">
            <span className="font-semibold text-teal-400 block">Safety Protocol</span>
            <span>HACCP Verified · Allergy Rules Active</span>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-red-950/40 hover:text-red-400 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
