import React from 'react';
import { AlertOctagon, AlertTriangle, ShieldCheck, Utensils, X } from 'lucide-react';
import { Order } from '../../types';

export const KitchenAllergyCard: React.FC<{ order: Order; className?: string }> = ({ order, className = '' }) => {
  const hasAllergies = order.patientAllergies.length > 0;
  const criticalAllergy = order.patientAllergies.find((a) => a.severity === 'severe' || a.severity === 'critical');

  if (!hasAllergies) {
    return (
      <div className={`p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center gap-3 ${className}`}>
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <div className="text-xs">
          <span className="font-semibold text-emerald-950 block">No Known Food Allergies</span>
          <span className="text-emerald-800">Standard culinary hygiene and sanitary guidelines apply.</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        criticalAllergy ? 'border-red-300 bg-red-50 text-red-900' : 'border-amber-300 bg-amber-50 text-amber-900'
      } ${className}`}
    >
      {/* Banner */}
      <div className="flex items-center gap-2.5 pb-2.5 border-b border-red-200/80 mb-3">
        <div className={`p-1.5 rounded-lg ${criticalAllergy ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-amber-100 text-amber-600 border border-amber-200'}`}>
          {criticalAllergy ? <AlertOctagon className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-red-700">KITCHEN PREP ALERT</span>
          <h4 className="text-sm font-extrabold tracking-tight">PATIENT ALLERGY WARNING</h4>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs mb-3">
        <div className="bg-white/80 p-2 rounded-lg border border-red-100">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Patient &amp; Room:</span>
          <strong className="text-slate-900 text-xs">{order.patientName} ({order.roomNumber})</strong>
        </div>
        <div className="bg-white/80 p-2 rounded-lg border border-red-100">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Allergies:</span>
          <div className="flex flex-wrap gap-1 mt-0.5">
            {order.patientAllergies.map((a, i) => (
              <span
                key={i}
                className="inline-block px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-bold uppercase"
              >
                {a.allergyName} ({a.severity})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Avoid list */}
      <div className="bg-white/90 p-3 rounded-lg border border-red-200 mb-3">
        <span className="text-[11px] font-bold text-red-900 uppercase block mb-1">
          Strictly Avoid from this Order:
        </span>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-red-800">
          {order.avoidIngredients.map((item, idx) => (
            <li key={idx} className="flex items-center gap-1.5 font-semibold">
              <X className="w-3.5 h-3.5 text-red-600 shrink-0" /> {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Preparation instructions */}
      <div className="flex items-start gap-2.5 bg-slate-100 border border-slate-200 text-slate-800 p-3 rounded-lg text-xs">
        <Utensils className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="text-amber-700 font-bold block text-[10px] uppercase tracking-wider">
            Preparation Instruction (Standard Protocol):
          </span>
          <p className="mt-0.5 text-slate-600 leading-relaxed font-medium">
            {order.preparationInstructions || 'Use separate utensils and sanitize station. Avoid cross-contact with allergens.'}
          </p>
        </div>
      </div>
    </div>
  );
};
