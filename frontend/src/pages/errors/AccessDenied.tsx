import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, ShieldOff } from 'lucide-react';
import { useAuth } from '../../store/AuthContext';

export const AccessDenied: React.FC = () => {
  const navigate = useNavigate();
  const { role } = useAuth();

  const dashboardPath =
    role === 'admin'
      ? '/admin'
      : role === 'doctor'
      ? '/doctor'
      : role === 'kitchen'
      ? '/kitchen'
      : '/patient';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-red-50 border-2 border-red-200 flex items-center justify-center">
            <ShieldOff className="w-10 h-10 text-red-500" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-red-600">
            <Lock className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Access Restricted</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Authorisation Required</h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-sm mx-auto">
            You do not have the necessary permissions to view this section. This area is restricted
            to specific clinical roles within the hospital dietary portal.
          </p>
        </div>

        {/* Details box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-left space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 font-medium">Your current role:</span>
            <span className="bg-teal-100 text-teal-800 font-bold px-2.5 py-0.5 rounded-md uppercase">
              {role}
            </span>
          </div>
          <div className="flex items-start justify-between gap-2">
            <span className="text-slate-500 font-medium shrink-0">Access policy:</span>
            <span className="text-slate-700 font-semibold text-right">
              Role-based access control (RBAC) is enforced across all hospital portal modules.
            </span>
          </div>
        </div>

        {/* Action */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
          <button
            type="button"
            onClick={() => navigate(dashboardPath, { replace: true })}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors shadow-sm"
          >
            Return to My Dashboard
          </button>
        </div>

        {/* Footer note */}
        <p className="text-[11px] text-slate-400">
          If you believe this is an error, contact the system administrator at{' '}
          <span className="font-medium text-slate-500">Ext. 4082 (Dietary Nurse Dispatch)</span>.
        </p>
      </div>
    </div>
  );
};
