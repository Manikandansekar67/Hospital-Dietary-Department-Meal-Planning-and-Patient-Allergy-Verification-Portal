import React, { useState } from 'react';
import {
  AlertOctagon,
  Bell,
  CheckCircle2,
  Menu,
  Utensils,
} from 'lucide-react';
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
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-100"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-slate-800 truncate tracking-tight">
            {pageTitle}
          </h1>
          <span className="hidden sm:block text-[11px] text-slate-400 truncate max-w-xs">
            {roleDescription}
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">

        {/* Kitchen Status Indicator — visible ONLY to kitchen role, read-only */}
        {role === 'kitchen' && (
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border select-none ${
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
            <span className="uppercase tracking-wide hidden sm:inline">
              {kitchenStatus.isActive ? 'Kitchen Active' : 'Kitchen Inactive'}
            </span>
          </div>
        )}

        {/* Role Badge (read-only display, no switcher) */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold uppercase tracking-wider ${roleBadgeClass}`}
        >
          {roleLabel}
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsNotifsOpen(!isNotifsOpen)}
            className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-100"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifsOpen && (
            <div className="absolute right-0 mt-1.5 w-80 sm:w-96 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden z-50">
              <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">Dietary Alerts</span>
                  {unreadCount > 0 && (
                    <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={markAllAsRead}
                    className="text-[11px] text-teal-700 hover:text-teal-900 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">No active notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-50 ${
                        !n.read ? 'bg-teal-50/40 font-medium' : 'text-slate-600'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        {n.priority === 'critical' || n.type === 'allergy_conflict' ? (
                          <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1 min-w-0">
                          <span
                            className={`block leading-snug ${
                              n.priority === 'critical' ? 'text-red-900 font-bold' : 'text-slate-800'
                            }`}
                          >
                            {n.title}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
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
        </div>
      </div>
    </header>
  );
};
