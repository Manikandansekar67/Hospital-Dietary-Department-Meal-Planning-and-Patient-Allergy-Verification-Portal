import React from 'react';
<<<<<<< HEAD
import { AlertOctagon, AlertTriangle, ShieldCheck, Utensils, XCircle } from 'lucide-react';
=======
import { AlertOctagon, AlertTriangle, ShieldCheck, Utensils, X } from 'lucide-react';
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
import { Order } from '../../types';

export const KitchenAllergyCard: React.FC<{ order: Order; className?: string }> = ({ order, className = '' }) => {
  const hasAllergies = order.patientAllergies.length > 0;
  const criticalAllergy = order.patientAllergies.find((a) => a.severity === 'severe' || a.severity === 'critical');

  if (!hasAllergies) {
    return (
      <div className={`p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center gap-3 ${className}`}>
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <div className="text-xs">
<<<<<<< HEAD
          <span className="font-semibold text-emerald-950 block">No Recorded Food Allergies</span>
=======
          <span className="font-semibold text-emerald-950 block">No Known Food Allergies</span>
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
          <span className="text-emerald-800">Standard culinary hygiene and sanitary guidelines apply.</span>
        </div>
      </div>
    );
  }

  return (
    <div
<<<<<<< HEAD
      className={`rounded-xl border p-4 transition-all shadow-2xs ${
        criticalAllergy
          ? 'border-red-200 bg-red-50/70 text-red-950'
          : 'border-amber-200 bg-amber-50/70 text-amber-950'
      } ${className}`}
    >
      {/* Banner */}
      <div className="flex items-center justify-between pb-2.5 border-b border-red-200/60 mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg shrink-0 ${
              criticalAllergy ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
            }`}
          >
            {criticalAllergy ? <AlertOctagon className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider">
              {criticalAllergy ? 'Critical Allergy Protocol' : 'Allergy Warning Flag'}
            </h4>
            <span className="text-[10px] text-slate-500 font-medium">HACCP Isolation Protocol</span>
          </div>
        </div>

        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
            criticalAllergy ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
          }`}
        >
          Isolate Station
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
        <div className="bg-white/90 p-2.5 rounded-lg border border-red-100">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Patient &amp; Room:</span>
          <strong className="text-slate-900 text-xs mt-0.5 block">{order.patientName} (Room {order.roomNumber})</strong>
        </div>
        <div className="bg-white/90 p-2.5 rounded-lg border border-red-100">
          <span className="text-slate-500 block text-[10px] uppercase font-bold">Diagnosed Allergens:</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {order.patientAllergies.map((a, i) => (
              <span
                key={i}
                className="inline-block px-1.5 py-0.5 rounded bg-red-100 text-red-800 text-[10px] font-semibold uppercase"
=======
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
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
              >
                {a.allergyName} ({a.severity})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Avoid list */}
      <div className="bg-white/90 p-3 rounded-lg border border-red-200 mb-3">
<<<<<<< HEAD
        <span className="text-[10px] font-bold text-red-900 uppercase block mb-1 tracking-wider">
          Strictly Avoid from this Order:
        </span>
        <ul className="flex flex-wrap gap-1.5 text-xs text-red-800">
          {order.avoidIngredients.map((item, idx) => (
            <li
              key={idx}
              className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded bg-red-50 border border-red-200"
            >
              <XCircle className="w-3 h-3 text-red-600 shrink-0" strokeWidth={2.2} />
              <span>{item}</span>
=======
        <span className="text-[11px] font-bold text-red-900 uppercase block mb-1">
          Strictly Avoid from this Order:
        </span>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-red-800">
          {order.avoidIngredients.map((item, idx) => (
            <li key={idx} className="flex items-center gap-1.5 font-semibold">
              <X className="w-3.5 h-3.5 text-red-600 shrink-0" /> {item}
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
            </li>
          ))}
        </ul>
      </div>

      {/* Preparation instructions */}
<<<<<<< HEAD
      <div className="flex items-start gap-2.5 bg-slate-900 text-slate-100 p-3 rounded-lg text-xs">
        <Utensils className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="text-amber-400 font-bold block text-[10px] uppercase tracking-wider">
            Preparation Instructions (Station Directive):
          </span>
          <p className="mt-0.5 text-slate-200 leading-relaxed font-normal">
=======
      <div className="flex items-start gap-2.5 bg-slate-100 border border-slate-200 text-slate-800 p-3 rounded-lg text-xs">
        <Utensils className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="text-amber-700 font-bold block text-[10px] uppercase tracking-wider">
            Preparation Instruction (Standard Protocol):
          </span>
          <p className="mt-0.5 text-slate-600 leading-relaxed font-medium">
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
            {order.preparationInstructions || 'Use separate utensils and sanitize station. Avoid cross-contact with allergens.'}
          </p>
        </div>
      </div>
    </div>
  );
};
