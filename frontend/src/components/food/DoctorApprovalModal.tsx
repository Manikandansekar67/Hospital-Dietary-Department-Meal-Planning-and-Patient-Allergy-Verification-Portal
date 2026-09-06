import React, { useState } from 'react';
import { AlertOctagon, CheckCircle2, ShieldCheck, XCircle } from 'lucide-react';
import { FoodRecommendation, Patient } from '../../types';
import { AllergyAlert } from '../allergy/AllergyAlert';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';

export interface DoctorApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: FoodRecommendation | null;
  patient: Patient | null;
  mode: 'approve' | 'reject';
  onConfirm: (recId: string, remarks: string) => Promise<void>;
}

export const DoctorApprovalModal: React.FC<DoctorApprovalModalProps> = ({
  isOpen,
  onClose,
  recommendation,
  patient,
  mode,
  onConfirm,
}) => {
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!recommendation) return null;

  const { food, diseaseCompatibility, allergyCheck, safetyStatus } = recommendation;
  const isAllergyConflict = allergyCheck.hasConflict;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConfirm(recommendation.id, remarks);
      setRemarks('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'approve' ? 'Clinical Food Approval Review' : 'Reject Food for Patient'}
      subtitle={`Patient: ${patient?.name || 'Inpatient'} (${patient?.patientCode || ''})`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Prominent Allergy Alert if there is a conflict */}
        {isAllergyConflict && patient && (
          <AllergyAlert
            patientName={patient.name}
            allergyName={allergyCheck.allergenName || 'Known Allergen'}
            severity={allergyCheck.severity || 'severe'}
            foodName={food.name}
            conflictingIngredients={allergyCheck.conflictingIngredients}
            recommendationText="CONTRAINDICATED: DO NOT APPROVE"
          />
        )}

        {/* Food Overview Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">{food.category}</span>
              <h3 className="text-base font-bold text-slate-900">{food.name}</h3>
            </div>
            <div className="text-right text-xs">
              <span className="text-slate-500">Calories: </span>
              <strong className="text-slate-800">{food.nutrition.calories} kcal</strong>
            </div>
          </div>

          <p className="text-xs text-slate-600 mt-2 leading-relaxed">{food.description}</p>
        </div>

        {/* System Verification Results */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">System Verification Results:</h4>

          {/* Disease check */}
          <div className="p-3 rounded-lg border border-slate-200 bg-white flex items-start gap-2.5">
            {diseaseCompatibility.compatible ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs">
              <span className="font-semibold text-slate-800">
                {diseaseCompatibility.compatible ? 'Medically Suitable' : 'Disease Contraindication Detected'}
              </span>
              <p className="text-slate-600 mt-0.5">{diseaseCompatibility.notes}</p>
            </div>
          </div>

          {/* Allergy check */}
          <div
            className={`p-3 rounded-lg border flex items-start gap-2.5 ${
              allergyCheck.hasConflict ? 'bg-red-50/70 border-red-200' : 'bg-white border-slate-200'
            }`}
          >
            {allergyCheck.hasConflict ? (
              <AlertOctagon className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs">
              <span className={`font-semibold ${allergyCheck.hasConflict ? 'text-red-900' : 'text-slate-800'}`}>
                {allergyCheck.hasConflict ? 'Allergen Conflict Detected' : 'No Detected Allergy Conflict'}
              </span>
              <p className={`mt-0.5 ${allergyCheck.hasConflict ? 'text-red-800' : 'text-slate-600'}`}>
                {allergyCheck.details}
              </p>
            </div>
          </div>
        </div>

        {/* Doctor Remarks field */}
        <div>
          <label htmlFor="doctor-remarks" className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
            Doctor Remarks &amp; Clinical Rationale
          </label>
          <textarea
            id="doctor-remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            rows={3}
            required={mode === 'reject' || isAllergyConflict}
            placeholder={
              mode === 'approve'
                ? 'Optional notes on portion size, meal timing, or glycemic considerations...'
                : 'Reason for clinical rejection (required for patient records)...'
            }
            className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-3 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-600 text-slate-800"
          />
          {isAllergyConflict && mode === 'approve' && (
            <p className="text-xs text-red-600 font-bold mt-1">
              Warning: Overriding an active allergy conflict requires clinical justification in the remarks field.
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>

          {mode === 'approve' ? (
            <Button
              type="submit"
              variant={isAllergyConflict ? 'danger' : 'primary'}
              size="sm"
              isLoading={isSubmitting}
            >
              {isAllergyConflict ? 'Override Warning & Approve Food' : 'Approve Food for Patient'}
            </Button>
          ) : (
            <Button type="submit" variant="danger" size="sm" isLoading={isSubmitting}>
              Confirm Food Rejection
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};
