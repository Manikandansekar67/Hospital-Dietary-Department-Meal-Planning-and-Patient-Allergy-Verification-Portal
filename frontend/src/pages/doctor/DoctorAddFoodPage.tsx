import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  FileCheck,
  Plus,
  ShieldAlert,
  Sparkles,
  Utensils,
  XCircle,
} from 'lucide-react';
import { AllergyAlert } from '../../components/allergy/AllergyAlert';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { MultiSelect } from '../../components/common/MultiSelect';
import { Select } from '../../components/common/Select';
import { StatusBadge } from '../../components/common/StatusBadge';
import { COMMON_DISEASES } from '../../constants';
import { useAuth } from '../../store/AuthContext';
import { useNotifications } from '../../store/NotificationContext';
import { doctorService } from '../../services/doctorService';
import { patientService } from '../../services/patientService';
import { FoodRecommendation, MealCategory, Patient } from '../../types';

export const DoctorAddFoodPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialName = searchParams.get('name') || '';
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useNotifications();

  // Patients for immediate clinical verification
  const [patients, setPatients] = useState<Patient[]>([]);
  const [targetPatientId, setTargetPatientId] = useState<string>('');
  const [targetPatient, setTargetPatient] = useState<Patient | null>(null);

  // Form inputs
  const [name, setName] = useState(initialName);
  const [category, setCategory] = useState<MealCategory>('Lunch');
  const [description, setDescription] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [calories, setCalories] = useState('220');
  const [protein, setProtein] = useState('7');
  const [carbs, setCarbs] = useState('40');
  const [fat, setFat] = useState('3');
  const [sodium, setSodium] = useState('90');
  const [sugar, setSugar] = useState('1');
  const [preparationInstructions, setPreparationInstructions] = useState(
    'Prepare using dedicated sanitized equipment and avoid cross-contact.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<FoodRecommendation | null>(null);
  const [doctorRemarks, setDoctorRemarks] = useState('');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    const pts = await patientService.getPatients();
    setPatients(pts);
    if (pts.length > 0) {
      setTargetPatientId(pts[0].id);
      setTargetPatient(pts[0]);
    }
  };

  const handlePatientSelect = (id: string) => {
    setTargetPatientId(id);
    const p = patients.find((pt) => pt.id === id) || null;
    setTargetPatient(p);
  };

  const handleSubmitAndVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPatient) return;

    setIsSubmitting(true);
    try {
      const ingredients = ingredientsText
        .split(',')
        .map((i) => i.trim())
        .filter(Boolean);

      const result = await doctorService.addUnlistedFoodAndVerify(
        {
          name,
          category,
          description: description || `Custom physician meal for ${targetPatient.name}`,
          ingredients,
          nutrition: {
            calories: parseFloat(calories) || 0,
            protein: parseFloat(protein) || 0,
            carbohydrates: parseFloat(carbs) || 0,
            fat: parseFloat(fat) || 0,
            fiber: 4,
            sodium: parseFloat(sodium) || 0,
            sugar: parseFloat(sugar) || 0,
          },
          preparationInstructions,
          diseaseCompatibility: [],
          status: 'active',
          createdBy: user?.name || 'Dr. Physician',
          createdByRole: 'doctor',
          image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        },
        targetPatient.id,
        user?.name || 'Dr. Physician'
      );

      setEvaluationResult(result);
      addToast({
        title: 'Allergy Verification Complete',
        message: 'Food registered. Review automated clinical safety checks below.',
        type: result.allergyCheck.hasConflict ? 'danger' : 'info',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveEvaluatedFood = async () => {
    if (!evaluationResult) return;
    await doctorService.approveFood({
      foodId: evaluationResult.foodId || evaluationResult.food.id,
      patientId: evaluationResult.patientId || targetPatientId,
      remarks: doctorRemarks || 'Approved by examining physician.',
    });
    addToast({
      title: 'Food Clinically Approved',
      message: `${evaluationResult.food.name} is now approved and will become available when kitchen is active.`,
      type: 'success',
    });
    navigate(`/doctor/recommendations?patientId=${targetPatientId}`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-800 to-teal-900 rounded-2xl p-6 text-white shadow-md">
        <span className="text-teal-200 text-xs font-bold uppercase tracking-wider">Clinical Workflow</span>
        <h2 className="text-xl sm:text-2xl font-black mt-1">Register Unlisted Food &amp; Verify Allergies</h2>
        <p className="text-teal-100/90 text-xs sm:text-sm mt-1 max-w-2xl">
          Register a custom, unlisted, or modified inpatient meal recipe. The system instantly analyzes all constituent
          ingredients against the patient's active allergies and disease contraindications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Registration Form */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <form onSubmit={handleSubmitAndVerify} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              1. Food Profile &amp; Nutrition Facts
            </h3>

            {/* Target Patient */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Verify For Admitted Patient
              </label>
              <select
                value={targetPatientId}
                onChange={(e) => handlePatientSelect(e.target.value)}
                className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 bg-white font-semibold"
                required
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.patientCode} · Room {p.roomNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <Input
                  label="Food Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Steamed Millet Upma with Vegetables"
                  required
                />
              </div>
              <Select
                label="Meal Session"
                value={category}
                onChange={(e) => setCategory(e.target.value as MealCategory)}
                options={[
                  { value: 'Breakfast', label: 'Breakfast' },
                  { value: 'Lunch', label: 'Lunch' },
                  { value: 'Dinner', label: 'Dinner' },
                  { value: 'Snack', label: 'Snack' },
                  { value: 'Beverage', label: 'Beverage' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Constituent Ingredients (Comma-Separated) *Crucial for Allergy Scan*
              </label>
              <textarea
                value={ingredientsText}
                onChange={(e) => setIngredientsText(e.target.value)}
                rows={3}
                placeholder="e.g. Foxtail Millet, Carrot, Beans, Mustard Seeds, Curry Leaves, Peanut Oil, Water"
                className="w-full text-xs rounded-lg border border-slate-300 p-3"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Tip: If testing allergy conflict for patient Arun (Peanut allergy), include "Peanut" or "Peanut Oil".
              </span>
            </div>

            {/* Nutrition Grid */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
                Nutrition Profile (Per Serving)
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                <Input label="Calories" type="number" value={calories} onChange={(e) => setCalories(e.target.value)} required />
                <Input label="Protein" type="number" value={protein} onChange={(e) => setProtein(e.target.value)} required />
                <Input label="Carbs" type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} required />
                <Input label="Fat" type="number" value={fat} onChange={(e) => setFat(e.target.value)} required />
                <Input label="Sodium" type="number" value={sodium} onChange={(e) => setSodium(e.target.value)} required />
                <Input label="Sugar" type="number" value={sugar} onChange={(e) => setSugar(e.target.value)} required />
              </div>
            </div>

            <Input
              label="Preparation & Cross-Contact Instructions"
              value={preparationInstructions}
              onChange={(e) => setPreparationInstructions(e.target.value)}
              placeholder="e.g. Prepare in dedicated cookware. Do not use peanut-contaminated surfaces."
            />

            <Button type="submit" size="md" className="w-full" isLoading={isSubmitting}>
              Run Instant Allergy &amp; Clinical Safety Verification
            </Button>
          </form>
        </div>

        {/* Right: Instant Clinical Verification & Review Screen */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
              2. Automated Verification Result
            </h3>

            {!evaluationResult ? (
              <div className="py-16 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl p-4">
                <Utensils className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-medium text-slate-600">No Food Submitted for Evaluation Yet</p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Fill in food details on the left and click "Run Instant Allergy Verification" to inspect clinical safety.
                </p>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Allergy Conflict Prominent Banner if detected */}
                {evaluationResult.allergyCheck.hasConflict && targetPatient && (
                  <AllergyAlert
                    patientName={targetPatient.name}
                    allergyName={evaluationResult.allergyCheck.allergenName || 'Diagnosed Allergen'}
                    severity={evaluationResult.allergyCheck.severity || 'severe'}
                    foodName={evaluationResult.food.name}
                    conflictingIngredients={evaluationResult.allergyCheck.conflictingIngredients}
                    recommendationText="CONTRAINDICATED: DO NOT APPROVE"
                  />
                )}

                {/* Status summary */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <span className="font-bold text-slate-700">Calculated Safety Status:</span>
                  <StatusBadge type="safety" value={evaluationResult.safetyStatus} />
                </div>

                {/* Disease Compatibility */}
                <div className="p-3 rounded-xl border border-slate-200 bg-white flex items-start gap-2.5">
                  {evaluationResult.diseaseCompatibility.compatible ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className="text-slate-800 block font-semibold">Disease Compatibility</strong>
                    <p className="text-slate-600 mt-0.5">{evaluationResult.diseaseCompatibility.notes}</p>
                  </div>
                </div>

                {/* Allergy Check */}
                <div
                  className={`p-3 rounded-xl border flex items-start gap-2.5 ${
                    evaluationResult.allergyCheck.hasConflict ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'
                  }`}
                >
                  {evaluationResult.allergyCheck.hasConflict ? (
                    <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <strong className={evaluationResult.allergyCheck.hasConflict ? 'text-red-900' : 'text-slate-800'}>
                      Allergen Safety Check
                    </strong>
                    <p className={`mt-0.5 ${evaluationResult.allergyCheck.hasConflict ? 'text-red-800' : 'text-slate-600'}`}>
                      {evaluationResult.allergyCheck.details}
                    </p>
                  </div>
                </div>

                {/* Doctor Remarks Input */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Doctor Clinical Approval Remarks
                  </label>
                  <textarea
                    value={doctorRemarks}
                    onChange={(e) => setDoctorRemarks(e.target.value)}
                    rows={2}
                    placeholder="e.g. Verified safe for diabetic inpatient with low-glycemic load."
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5"
                  />
                </div>

                {/* Doctor Action Button */}
                <Button
                  size="md"
                  variant={evaluationResult.allergyCheck.hasConflict ? 'danger' : 'primary'}
                  className="w-full"
                  onClick={handleApproveEvaluatedFood}
                >
                  {evaluationResult.allergyCheck.hasConflict
                    ? 'Override Allergy Warning & Approve'
                    : 'Approve Food for Patient'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
