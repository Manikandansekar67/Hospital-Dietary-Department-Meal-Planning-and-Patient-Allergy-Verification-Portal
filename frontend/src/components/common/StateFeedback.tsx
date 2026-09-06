import React from 'react';
import { AlertCircle, FolderOpen, Loader2, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const EmptyState: React.FC<{
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}> = ({ title, description, icon, action, className = '' }) => {
  return (
    <div className={`p-8 text-center flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 ${className}`}>
      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        {icon || <FolderOpen className="w-6 h-6" />}
      </div>
      <h4 className="text-sm font-semibold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-4 leading-relaxed">{description}</p>
      {action && (
        <Button size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

export const LoadingState: React.FC<{
  message?: string;
  className?: string;
}> = ({ message = 'Verifying medical records...', className = '' }) => {
  return (
    <div className={`py-12 flex flex-col items-center justify-center text-center ${className}`}>
      <Loader2 className="w-8 h-8 text-teal-700 animate-spin mb-3" />
      <p className="text-xs font-medium text-slate-600">{message}</p>
    </div>
  );
};

export const ErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}> = ({ title = 'Failed to load clinical data', message, onRetry, className = '' }) => {
  return (
    <div className={`p-6 rounded-xl border border-red-200 bg-red-50/40 text-center flex flex-col items-center justify-center ${className}`}>
      <AlertCircle className="w-8 h-8 text-red-600 mb-2" />
      <h4 className="text-sm font-semibold text-red-950">{title}</h4>
      <p className="text-xs text-red-800 max-w-md mt-1 mb-4">{message}</p>
      {onRetry && (
        <Button size="sm" variant="outline" leftIcon={<RefreshCw className="w-3.5 h-3.5" />} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
