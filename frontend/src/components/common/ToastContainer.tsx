import React from 'react';
import { AlertCircle, AlertOctagon, CheckCircle2, Info, X } from 'lucide-react';
import { useNotifications } from '../../store/NotificationContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotifications();

  if (toasts.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'danger':
        return <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-teal-600 shrink-0" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'border-emerald-200 bg-white';
      case 'danger':
        return 'border-red-300 bg-red-50/90';
      case 'warning':
        return 'border-amber-200 bg-white';
      case 'info':
      default:
        return 'border-teal-200 bg-white';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none p-2 sm:p-0">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg transition-all animate-in slide-in-from-bottom-3 duration-200 ${getStyles(
            toast.type
          )}`}
          role="status"
        >
          <div className="mt-0.5">{getIcon(toast.type)}</div>
          <div className="flex-1">
            <h5 className="text-xs font-semibold text-slate-900">{toast.title}</h5>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
          </div>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
