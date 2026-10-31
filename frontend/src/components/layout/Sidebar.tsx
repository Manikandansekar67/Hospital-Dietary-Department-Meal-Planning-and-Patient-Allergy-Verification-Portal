import React from 'react';
import { NavLink as RouterNavLink, useNavigate as useRouterNavigate } from 'react-router-dom';
import {
  AlertOctagon,
<<<<<<< HEAD
=======
  BookOpen,
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
  CalendarCheck,
  ChefHat,
  ClipboardCheck,
  FileText,
<<<<<<< HEAD
  HeartPulse,
  LayoutDashboard,
  LogOut,
  PlusCircle,
=======
  HeartHandshake,
  HeartPulse,
  LayoutDashboard,
  LogOut,
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
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
<<<<<<< HEAD
  section?: string;
=======
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
  badge?: string;
}

export const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { user, role, logout } = useAuth();
  const navigate = useRouterNavigate();

  const navItems: NavItem[] = [
    // Dashboards
    {
<<<<<<< HEAD
      label: 'Executive Overview',
      to: '/admin',
      icon: <LayoutDashboard className="w-4 h-4" />,
      allowedRoles: ['admin'],
      section: 'Main',
    },
    {
      label: 'Physician Overview',
      to: '/doctor',
      icon: <Stethoscope className="w-4 h-4" />,
      allowedRoles: ['doctor'],
      section: 'Main',
    },
    {
      label: 'Kitchen Station',
      to: '/kitchen',
      icon: <ChefHat className="w-4 h-4" />,
      allowedRoles: ['kitchen'],
      section: 'Main',
    },
    {
      label: 'Patient Bedside',
      to: '/patient',
      icon: <HeartPulse className="w-4 h-4" />,
      allowedRoles: ['patient'],
      section: 'Main',
    },

    // Administrative & Directory
    {
      label: 'User Accounts',
      to: '/admin/users',
      icon: <Users className="w-4 h-4" />,
      allowedRoles: ['admin'],
      section: 'Administration',
    },
    {
      label: 'Inpatient Roster',
      to: role === 'admin' ? '/admin/patients' : '/doctor/patients',
      icon: <UserCheck className="w-4 h-4" />,
      allowedRoles: ['admin', 'doctor'],
      section: role === 'admin' ? 'Administration' : 'Clinical Care',
=======
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
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
    },
    {
      label: 'Foods Catalog',
      to: role === 'admin' ? '/admin/foods' : '/kitchen/foods',
      icon: <Utensils className="w-4 h-4" />,
      allowedRoles: ['admin', 'kitchen'],
<<<<<<< HEAD
      section: role === 'admin' ? 'Administration' : 'Kitchen Management',
    },
    {
      label: 'Disease Rules',
      to: '/admin/diseases',
      icon: <HeartPulse className="w-4 h-4" />,
      allowedRoles: ['admin'],
      section: 'Safety Engines',
    },
    {
      label: 'Allergy Directory',
      to: '/admin/allergies',
      icon: <AlertOctagon className="w-4 h-4" />,
      allowedRoles: ['admin'],
      section: 'Safety Engines',
    },

    // Doctor Clinical Workflows
    {
      label: 'Food Approvals',
      to: '/doctor/recommendations',
      icon: <Sparkles className="w-4 h-4" />,
      allowedRoles: ['doctor'],
      section: 'Clinical Care',
    },
    {
      label: 'Approval Audits',
      to: '/doctor/approvals',
      icon: <ClipboardCheck className="w-4 h-4" />,
      allowedRoles: ['doctor'],
      section: 'Clinical Care',
    },
    {
      label: 'Add Unlisted Food',
      to: '/doctor/add-food',
      icon: <PlusCircle className="w-4 h-4" />,
      allowedRoles: ['doctor'],
      section: 'Clinical Care',
    },

    // Kitchen Workflows
    {
      label: 'Meal Availability',
      to: '/kitchen/availability',
      icon: <CalendarCheck className="w-4 h-4" />,
      allowedRoles: ['kitchen', 'admin'],
      section: role === 'admin' ? 'Administration' : 'Kitchen Management',
    },
    {
      label: 'Orders Queue',
      to: '/kitchen/orders',
      icon: <ShoppingBag className="w-4 h-4" />,
      allowedRoles: ['kitchen'],
      section: 'Kitchen Management',
    },
    {
      label: 'Allergy Isolation',
      to: '/kitchen/allergy-prep',
      icon: <ShieldCheck className="w-4 h-4" />,
      allowedRoles: ['kitchen'],
      section: 'Kitchen Management',
    },

    // Patient Workflows
    {
      label: 'Order Approved Meals',
      to: '/patient/menu',
      icon: <Utensils className="w-4 h-4" />,
      allowedRoles: ['patient'],
      section: 'Patient Care',
    },
    {
      label: 'Order Status & Tracking',
      to: '/patient/orders',
      icon: <ShoppingBag className="w-4 h-4" />,
      allowedRoles: ['patient'],
      section: 'Patient Care',
=======
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
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
    },

    // Reports / Audit
    {
<<<<<<< HEAD
      label: 'Audit & Analytics',
      to: '/admin/reports',
      icon: <FileText className="w-4 h-4" />,
      allowedRoles: ['admin'],
      section: 'Audit & Compliance',
=======
      label: 'Dietary Reports',
      to: '/admin/reports',
      icon: <FileText className="w-4 h-4" />,
      allowedRoles: ['admin'],
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
    },
  ];

  const visibleItems = navItems.filter((item) => role && item.allowedRoles.includes(role));

<<<<<<< HEAD
  // Group items by section
  const sections = Array.from(new Set(visibleItems.map((item) => item.section || 'General')));

=======
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
<<<<<<< HEAD
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-xs transition-opacity duration-200"
=======
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-xs transition-opacity"
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 left-0 z-40 h-full w-64 bg-slate-900 text-slate-100 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
<<<<<<< HEAD
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-xs font-bold">
              <HeartPulse className="w-5 h-5 text-teal-100" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[11px] font-bold uppercase tracking-wider text-teal-400 leading-none">
                Hospital Dietary
              </h1>
              <span className="text-xs font-semibold text-white block truncate max-w-[140px] mt-1">
=======
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
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                {HOSPITAL_INFO.name}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
<<<<<<< HEAD
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
=======
            className="lg:hidden text-slate-400 hover:text-white p-1 rounded-md"
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

<<<<<<< HEAD
        {/* User Card */}
        <div className="px-4 py-3 bg-slate-950/40 border-b border-slate-800/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-800/80 text-teal-300 font-bold text-xs flex items-center justify-center border border-teal-700/50 shrink-0">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-slate-100 truncate">{user?.name || 'Authorized User'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                  {role} portal
                </span>
              </div>
=======
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
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
            </div>
          </div>
        </div>

<<<<<<< HEAD
        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {sections.map((sectionName) => {
            const sectionItems = visibleItems.filter((item) => (item.section || 'General') === sectionName);
            if (sectionItems.length === 0) return null;

            return (
              <div key={sectionName} className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                  {sectionName}
                </div>
                {sectionItems.map((item) => (
                  <RouterNavLink
                    key={item.to}
                    to={item.to}
                    end={
                      item.to === '/admin' ||
                      item.to === '/doctor' ||
                      item.to === '/kitchen' ||
                      item.to === '/patient'
                    }
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-teal-700 text-white font-semibold shadow-xs'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="shrink-0">{item.icon}</span>
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </RouterNavLink>
                ))}
              </div>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/60 shrink-0 space-y-2">
          <div className="px-3 py-2 text-[10px] text-slate-400 border border-slate-800/80 rounded-lg bg-slate-900/60 flex items-center justify-between">
            <span className="font-semibold text-teal-400">Allergy Protocols</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Active
            </span>
=======
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
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
          </div>

          <button
            type="button"
            onClick={handleLogout}
<<<<<<< HEAD
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-red-950/40 hover:text-red-300 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4 shrink-0" />
=======
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-red-950/40 hover:text-red-400 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
