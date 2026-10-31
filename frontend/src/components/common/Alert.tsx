import React from 'react';
import { AlertCircle, AlertOctagon, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

export interface AlertProps {
  variant?: 'danger' | 'warning' | 'success' | 'info';
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onDismiss?: () => void;
  className?: string;
  prominent?: boolean;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  icon,
  onDismiss,
  className = '',
  prominent = false,
}) => {
  const configs = {
    danger: {
      bg: prominent ? 'bg-red-50 border-red-500' : 'bg-red-50/80 border-red-200',
      text: 'text-red-900',
      desc: 'text-red-800',
      defaultIcon: <AlertOctagon className="w-5 h-5 text-red-600 shrink-0" />,
      titleColor: 'text-red-950 font-bold',
    },
    warning: {
      bg: prominent ? 'bg-amber-50 border-amber-500' : 'bg-amber-50/80 border-amber-200',
      text: 'text-amber-900',
      desc: 'text-amber-800',
      defaultIcon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
      titleColor: 'text-amber-950 font-semibold',
    },
    success: {
      bg: 'bg-emerald-50/80 border-emerald-200',
      text: 'text-emerald-900',
      desc: 'text-emerald-800',
      defaultIcon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      titleColor: 'text-emerald-950 font-semibold',
    },
    info: {
      bg: 'bg-teal-50/80 border-teal-200',
      text: 'text-teal-900',
      desc: 'text-teal-800',
      defaultIcon: <Info className="w-5 h-5 text-teal-700 shrink-0" />,
      titleColor: 'text-teal-950 font-semibold',
    },
  };

  const cfg = configs[variant];

  return (
    <div
      role="alert"
      className={`rounded-xl border p-4 flex gap-3.5 transition-all ${cfg.bg} ${
        prominent ? 'border-2 shadow-xs' : ''
      } ${className}`}
    >
      <div className="pt-0.5">{icon || cfg.defaultIcon}</div>
      <div className="flex-1 text-sm">
        {title && <h4 className={`text-sm tracking-tight mb-1 ${cfg.titleColor}`}>{title}</h4>}
        <div className={`text-xs sm:text-sm leading-relaxed ${cfg.desc}`}>{children}</div>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="text-slate-400 hover:text-slate-700 shrink-0 rounded p-1"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
