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
      className={`rounded-xl border p-5 transition-all shadow-sm ${
        isCritical
          ? 'border-red-300 bg-red-50 text-red-900'
          : 'border-amber-300 bg-amber-50 text-amber-900'
      } ${className}`}
    >
      {/* Header Banner */}
      <div className="flex items-center gap-3 pb-3 border-b border-red-200/80 mb-3.5">
        <div className={`p-2 rounded-lg ${isCritical ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'}`}>
          {isCritical ? <AlertOctagon className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
        </div>
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase opacity-80">Clinical Safety Flag</span>
          <h3 className="text-base font-extrabold tracking-tight">
            {isCritical ? 'CRITICAL ALLERGY CONFLICT' : 'ALLERGY WARNING DETECTED'}
          </h3>
        </div>
      </div>

      {/* Grid details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs mb-4">
        <div className="bg-white/80 p-2.5 rounded-lg border border-red-100">
          <span className="text-slate-500 block text-[11px] font-medium">Patient:</span>
          <span className="font-bold text-slate-900 text-sm">{patientName}</span>
        </div>
        <div className="bg-white/80 p-2.5 rounded-lg border border-red-100">
          <span className="text-slate-500 block text-[11px] font-medium">Diagnosed Allergy:</span>
          <span className="font-bold text-red-700 text-sm">
            {allergyName} — <span className="uppercase">{severity}</span>
          </span>
        </div>
        <div className="bg-white/80 p-2.5 rounded-lg border border-red-100">
          <span className="text-slate-500 block text-[11px] font-medium">Evaluated Food:</span>
          <span className="font-bold text-slate-900 text-sm">{foodName}</span>
        </div>
        <div className="bg-white/80 p-2.5 rounded-lg border border-red-100">
          <span className="text-slate-500 block text-[11px] font-medium">Conflicting Ingredient(s):</span>
          <span className="font-extrabold text-red-800 text-sm">
            {conflictingIngredients.join(', ') || 'Direct Allergen Match'}
          </span>
        </div>
      </div>

      {/* Action Directive */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-red-100 text-red-700 font-semibold text-xs tracking-wide border border-red-200">
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" />
          SYSTEM RECOMMENDATION:
        </span>
        <span className="bg-red-600 text-white px-2.5 py-0.5 rounded font-black tracking-wider uppercase">
          {recommendationText}
        </span>
      </div>
    </div>
  );
};
