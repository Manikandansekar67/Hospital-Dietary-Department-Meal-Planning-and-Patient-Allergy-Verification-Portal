import React from 'react';
import { AlertOctagon, AlertTriangle, ShieldAlert } from 'lucide-react';
import { AllergySeverity } from '../../types';

export interface AllergyAlertProps {
  patientName: string;
  allergyName: string;
  severity: AllergySeverity;
  foodName: string;
  conflictingIngredients: string[];
  recommendationText?: string;
  className?: string;
}

export const AllergyAlert: React.FC<AllergyAlertProps> = ({
  patientName,
  allergyName,
  severity,
  foodName,
  conflictingIngredients,
  recommendationText = 'DO NOT APPROVE FOR PATIENT',
  className = '',
}) => {
  const isCritical = severity === 'severe' || severity === 'critical';

  return (
    <div
      role="alert"
      className={`rounded-xl border p-4 transition-all shadow-2xs ${
        isCritical
          ? 'border-red-200 bg-red-50/70 text-red-950'
          : 'border-amber-200 bg-amber-50/70 text-amber-950'
      } ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2.5 border-b border-red-200/60 mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg shrink-0 ${
              isCritical ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
            }`}
          >
            {isCritical ? <AlertOctagon className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-xs font-bold tracking-tight uppercase flex items-center gap-1.5">
              <span>{isCritical ? 'Critical Allergy Conflict Detected' : 'Allergy Warning Flag'}</span>
            </h4>
            <span className="text-[10px] text-slate-500 font-medium">HACCP &amp; Clinical Safety Protocol</span>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 rounded text-[11px] font-black uppercase tracking-wider ${
            isCritical ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
          }`}
        >
          {recommendationText}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="bg-white/80 p-2.5 rounded-lg border border-red-100">
          <span className="text-slate-500 block text-[10px] font-semibold uppercase">Patient</span>
          <span className="font-bold text-slate-900 truncate block mt-0.5">{patientName}</span>
        </div>

        <div className="bg-white/80 p-2.5 rounded-lg border border-red-100">
          <span className="text-slate-500 block text-[10px] font-semibold uppercase">Diagnosed Allergy</span>
          <span className="font-bold text-red-700 truncate block mt-0.5">
            {allergyName} ({severity})
          </span>
        </div>

        <div className="bg-white/80 p-2.5 rounded-lg border border-red-100">
          <span className="text-slate-500 block text-[10px] font-semibold uppercase">Evaluated Food</span>
          <span className="font-bold text-slate-900 truncate block mt-0.5">{foodName}</span>
        </div>

        <div className="bg-white/80 p-2.5 rounded-lg border border-red-100">
          <span className="text-slate-500 block text-[10px] font-semibold uppercase">Conflicting Allergen</span>
          <span className="font-bold text-red-700 truncate block mt-0.5">
            {conflictingIngredients.join(', ') || 'Allergen Match'}
          </span>
        </div>
      </div>
    </div>
  );
};
