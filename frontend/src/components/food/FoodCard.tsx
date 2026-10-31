import React from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Flame,
  Info,
  ShieldCheck,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { FoodRecommendation, Patient } from '../../types';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';

<<<<<<< HEAD
const DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';

=======
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
export interface FoodCardProps {
  recommendation: FoodRecommendation;
  patient?: Patient;
  onApprove?: (rec: FoodRecommendation) => void;
  onReject?: (rec: FoodRecommendation) => void;
  onViewDetails?: (rec: FoodRecommendation) => void;
  compact?: boolean;
}

export const FoodCard: React.FC<FoodCardProps> = ({
  recommendation,
  patient,
  onApprove,
  onReject,
  onViewDetails,
  compact = false,
}) => {
  const { food, diseaseCompatibility, allergyCheck, safetyStatus, doctorApproval } = recommendation;
  const isConflict = allergyCheck.hasConflict;

<<<<<<< HEAD
  const imageSrc = food?.image && food.image.trim() !== '' ? food.image : DEFAULT_FOOD_IMAGE;

=======
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
  return (
    <div
      className={`bg-white rounded-xl border transition-all hover:shadow-md flex flex-col justify-between overflow-hidden ${
        isConflict ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200'
      }`}
    >
      {/* Top Banner / Image Header */}
      <div>
        <div className="relative h-44 bg-slate-100 overflow-hidden">
          <img
<<<<<<< HEAD
            src={imageSrc}
            alt={food?.name || 'Food item'}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (target.src !== DEFAULT_FOOD_IMAGE) {
                target.src = DEFAULT_FOOD_IMAGE;
              }
=======
            src={food.image}
            alt={food.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback placeholder image
              (e.target as HTMLElement).style.display = 'none';
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/10" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className="bg-white/95 backdrop-blur-xs text-teal-800 text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs">
              {food.category}
            </span>
            <StatusBadge type="safety" value={safetyStatus} size="sm" />
          </div>

          {/* Name & Calories */}
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <h4 className="text-base font-bold drop-shadow-xs leading-snug">{food.name}</h4>
            <span className="text-xs text-teal-100 font-medium">{food.nutrition.calories} kcal · {food.nutrition.protein}g Protein</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 space-y-3.5">
          {/* Prominent Allergy Conflict Alert if triggered */}
          {isConflict && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-300 flex items-start gap-2.5">
              <AlertOctagon className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <strong className="text-amber-900 block font-bold">ALLERGY CONFLICT DETECTED</strong>
                <p className="text-amber-800 mt-0.5">
                  Contains: <span className="font-extrabold">{allergyCheck.conflictingIngredients.join(', ')}</span>.
                  {patient && ` Conflicts with patient's ${allergyCheck.allergenName} allergy.`}
                </p>
              </div>
            </div>
          )}

          {/* Clinical Compatibility Checks */}
          <div className="space-y-2 text-xs">
            {/* Disease Compatibility */}
            <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
              {diseaseCompatibility.compatible ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="font-semibold text-slate-700 block">Disease Compatibility:</span>
                <p className={`mt-0.5 leading-relaxed ${diseaseCompatibility.compatible ? 'text-slate-600' : 'text-red-700 font-medium'}`}>
                  {diseaseCompatibility.notes}
                </p>
              </div>
            </div>

            {/* Allergy Check */}
            <div
              className={`flex items-start gap-2 p-2 rounded-lg border ${
                allergyCheck.hasConflict ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-100'
              }`}
            >
              {allergyCheck.hasConflict ? (
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <span className="font-semibold text-slate-700 block">Allergy Check:</span>
                <p className={`mt-0.5 leading-relaxed ${allergyCheck.hasConflict ? 'text-amber-800 font-medium' : 'text-slate-600'}`}>
                  {allergyCheck.details}
                </p>
              </div>
            </div>
          </div>

          {/* Key Nutrition Strip */}
          <div className="grid grid-cols-4 gap-1.5 text-center text-[11px] bg-slate-50 p-2 rounded-lg border border-slate-100">
            <div>
              <span className="text-slate-400 block text-[10px]">Carbs</span>
              <strong className="text-slate-700">{food.nutrition.carbohydrates}g</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Fat</span>
              <strong className="text-slate-700">{food.nutrition.fat}g</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Sodium</span>
              <strong className={food.nutrition.sodium > 200 ? 'text-amber-700' : 'text-slate-700'}>
                {food.nutrition.sodium}mg
              </strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Sugar</span>
              <strong className={food.nutrition.sugar > 5 ? 'text-amber-700' : 'text-slate-700'}>
                {food.nutrition.sugar}g
              </strong>
            </div>
          </div>

          {/* Ingredients list */}
          <div className="text-xs">
            <span className="text-slate-500 font-medium">Ingredients: </span>
            <span className="text-slate-700">{food.ingredients.slice(0, 5).join(', ')}</span>
            {food.ingredients.length > 5 && <span className="text-slate-400"> +{food.ingredients.length - 5} more</span>}
          </div>

          {/* Approval Status */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Doctor Decision:</span>
            <StatusBadge type="approval" value={doctorApproval.status} size="sm" />
          </div>

          {doctorApproval.doctorRemarks && (
            <p className="text-[11px] text-slate-600 italic bg-teal-50/50 p-2 rounded border border-teal-100">
              "{doctorApproval.doctorRemarks}"
            </p>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 pt-0 flex items-center gap-2">
        {onViewDetails && (
          <Button variant="ghost" size="sm" onClick={() => onViewDetails(recommendation)} className="flex-1">
            Details
          </Button>
        )}

        {onReject && (
          <Button
<<<<<<< HEAD
            variant={doctorApproval.status === 'rejected' ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => onReject(recommendation)}
            className={`flex-1 ${
              doctorApproval.status === 'rejected'
                ? 'text-red-700 bg-red-50 border-red-300 hover:bg-red-100 font-semibold'
                : 'text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300'
            }`}
            title={doctorApproval.status === 'rejected' ? 'Click to review or edit rejection remarks' : 'Reject meal for this patient'}
          >
            {doctorApproval.status === 'rejected' ? 'Rejected' : 'Reject'}
          </Button>
        )}

        {onApprove && (
          <Button
            variant={doctorApproval.status === 'approved' ? 'secondary' : isConflict ? 'outline' : 'primary'}
            size="sm"
            onClick={() => onApprove(recommendation)}
            className={`flex-1 transition-all ${
              doctorApproval.status === 'approved'
                ? 'text-emerald-800 bg-emerald-50 border border-emerald-300 hover:bg-emerald-100 font-bold shadow-2xs'
                : isConflict
                ? 'text-amber-800 bg-amber-50 border border-amber-300 hover:bg-amber-100 font-semibold'
                : 'font-semibold'
            }`}
            title={
              doctorApproval.status === 'approved'
                ? 'Approved by doctor. Click to edit or update clinical remarks.'
                : isConflict
                ? 'Review allergen conflict and clinical override'
                : 'Approve meal for inpatient plan'
            }
          >
            {doctorApproval.status === 'approved' ? (
              <span className="inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                Approved
              </span>
            ) : isConflict ? (
              <span className="inline-flex items-center gap-1 text-[11px]">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                Override
              </span>
            ) : (
              'Approve'
            )}
=======
            variant="outline"
            size="sm"
            onClick={() => onReject(recommendation)}
            disabled={doctorApproval.status === 'rejected'}
            className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
          >
            Reject
          </Button>
        )}

        {onApprove && !isConflict && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onApprove(recommendation)}
            disabled={doctorApproval.status === 'approved'}
            className="flex-1"
          >
            Approve
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
          </Button>
        )}
      </div>
    </div>
  );
};
