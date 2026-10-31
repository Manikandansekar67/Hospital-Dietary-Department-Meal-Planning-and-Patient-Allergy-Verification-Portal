import React, { useState } from 'react';
import {
  AlertOctagon,
  Bell,
  CheckCircle2,
<<<<<<< HEAD
  ChevronRight,
  LogOut,
  Menu,
  ShieldAlert,
  User,
  Utensils,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
=======
  Menu,
  Utensils,
} from 'lucide-react';
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
import { ROLES } from '../../constants';
import { useAuth } from '../../store/AuthContext';
import { useKitchen } from '../../store/KitchenContext';
import { useNotifications } from '../../store/NotificationContext';

export interface HeaderProps {
  onToggleSidebar: () => void;
  pageTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  pageTitle = 'Hospital Dietary Management',
}) => {
<<<<<<< HEAD
  const { user, role, logout } = useAuth();
  const { kitchenStatus } = useKitchen();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const roleLabel = role ? ROLES[role]?.label : '';

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 h-16 glass-header border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between gap-3 shadow-2xs">
      {/* Left: Mobile hamburger + Breadcrumb Page title */}
=======
  const { user, role } = useAuth();
  const { kitchenStatus } = useKitchen();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  const [isNotifsOpen, setIsNotifsOpen] = useState(false);

  const roleLabel = role ? ROLES[role]?.label : '';
  const roleDescription = role ? ROLES[role]?.description : '';

  // Role-specific accent class for the role badge
  const roleBadgeClass =
    role === 'admin'
      ? 'bg-teal-100 text-teal-800 border-teal-200'
      : role === 'doctor'
      ? 'bg-blue-100 text-blue-800 border-blue-200'
      : role === 'kitchen'
      ? 'bg-amber-100 text-amber-800 border-amber-200'
      : 'bg-emerald-100 text-emerald-800 border-emerald-200';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-3 shadow-sm">
      {/* Left: Mobile menu toggle + Page title */}
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
<<<<<<< HEAD
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Toggle navigation menu"
=======
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-100"
          aria-label="Open sidebar menu"
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
        >
          <Menu className="w-5 h-5" />
        </button>

<<<<<<< HEAD
        <div className="min-w-0 flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 font-medium shrink-0">
            <span>Portal</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          </div>
          <h1 className="text-sm sm:text-base font-bold text-slate-900 truncate tracking-tight">
            {pageTitle}
          </h1>
=======
        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-slate-800 truncate tracking-tight">
            {pageTitle}
          </h1>
          <span className="hidden sm:block text-[11px] text-slate-400 truncate max-w-xs">
            {roleDescription}
          </span>
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
<<<<<<< HEAD
        {/* Kitchen Status indicator for kitchen role */}
        {role === 'kitchen' && (
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
=======

        {/* Kitchen Status Indicator — visible ONLY to kitchen role, read-only */}
        {role === 'kitchen' && (
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border select-none ${
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
              kitchenStatus.isActive
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-red-50 text-red-800 border-red-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                kitchenStatus.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`}
            />
<<<<<<< HEAD
            <span className="hidden sm:inline">
=======
            <span className="uppercase tracking-wide hidden sm:inline">
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
              {kitchenStatus.isActive ? 'Kitchen Active' : 'Kitchen Inactive'}
            </span>
          </div>
        )}

<<<<<<< HEAD
        {/* Role Pill */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200/80">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
=======
        {/* Role Badge (read-only display, no switcher) */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-wider ${roleBadgeClass}`}
        >
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
          {roleLabel}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
<<<<<<< HEAD
            onClick={() => {
              setIsNotifsOpen(!isNotifsOpen);
              setIsUserMenuOpen(false);
            }}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:ring-2 focus:ring-teal-100"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                {unreadCount > 9 ? '9+' : unreadCount}
=======
            onClick={() => setIsNotifsOpen(!isNotifsOpen)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-100"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                {unreadCount}
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
              </span>
            )}
          </button>

          {isNotifsOpen && (
<<<<<<< HEAD
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">Dietary Safety Alerts</span>
                  {unreadCount > 0 && (
                    <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
=======
            <div className="absolute right-0 mt-1.5 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden z-50">
              <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">Dietary Alerts</span>
                  {unreadCount > 0 && (
                    <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
<<<<<<< HEAD
                    className="text-[11px] text-teal-700 hover:text-teal-900 font-semibold"
=======
                    className="text-[11px] text-teal-700 hover:text-teal-900 font-medium"
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
<<<<<<< HEAD
                  <div className="py-8 text-center text-xs text-slate-400">
                    No active dietary notifications
                  </div>
=======
                  <div className="py-6 text-center text-xs text-slate-400">No active notifications</div>
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
<<<<<<< HEAD
                      className={`p-3.5 text-xs transition-colors cursor-pointer hover:bg-slate-50 ${
                        !n.read ? 'bg-teal-50/30 font-medium' : 'text-slate-600'
=======
                      className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-50 ${
                        !n.read ? 'bg-teal-50/40 font-medium' : 'text-slate-600'
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {n.priority === 'critical' || n.type === 'allergy_conflict' ? (
                          <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        ) : (
<<<<<<< HEAD
                          <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
=======
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                        )}
                        <div className="flex-1 min-w-0">
                          <span
                            className={`block leading-snug ${
<<<<<<< HEAD
                              n.priority === 'critical' ? 'text-red-900 font-bold' : 'text-slate-900'
=======
                              n.priority === 'critical' ? 'text-red-900 font-bold' : 'text-slate-800'
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                            }`}
                          >
                            {n.title}
                          </span>
<<<<<<< HEAD
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
=======
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                          <span className="text-[10px] text-slate-400 mt-1 block">
                            {new Date(n.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

<<<<<<< HEAD
        {/* User Profile Menu */}
        <div className="relative pl-2 border-l border-slate-200">
          <button
            type="button"
            onClick={() => {
              setIsUserMenuOpen(!isUserMenuOpen);
              setIsNotifsOpen(false);
            }}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-700 text-white text-xs font-bold flex items-center justify-center shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
            </div>
            <div className="hidden xl:block text-left">
              <span className="text-xs font-bold text-slate-900 block truncate max-w-[120px]">
                {user?.name || 'Staff User'}
              </span>
              <span className="text-[10px] text-slate-500 block truncate max-w-[120px]">
                {user?.department || 'Hospital Care'}
              </span>
            </div>
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden z-50 py-1 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold text-teal-800 uppercase bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                  {role} account
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors font-medium text-left"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
=======
        {/* Profile Card */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-teal-800 text-white text-xs font-bold flex items-center justify-center shadow-sm">
            {user?.name ? user.name.charAt(0) : <Utensils className="w-4 h-4" />}
          </div>
          <div className="hidden xl:block text-left">
            <span className="text-xs font-bold text-slate-800 block truncate max-w-[120px]">
              {user?.name}
            </span>
            <span className="text-[10px] text-slate-500 block truncate max-w-[120px]">
              {user?.department}
            </span>
          </div>
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
        </div>
      </div>
    </header>
  );
};
