import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  ArrowLeft,
  HeartPulse,
  Lock,
  Mail,
  Plus,
  ShieldCheck,
  Trash2,
  User,
  UserPlus,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { MultiSelect } from '../../components/common/MultiSelect';
import { Select } from '../../components/common/Select';
import { ALLERGIES_LIST, COMMON_DISEASES, HOSPITAL_INFO } from '../../constants';
import { useAuth } from '../../store/AuthContext';
import { AllergySeverity, PatientAllergy } from '../../types';

export const RegisterPage: React.FC = () => {
  const { registerPatient, isLoading } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('35');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [roomNumber, setRoomNumber] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [allergiesList, setAllergiesList] = useState<PatientAllergy[]>([]);
  const [newAllergyName, setNewAllergyName] = useState('');
  const [newAllergySeverity, setNewAllergySeverity] = useState<AllergySeverity>('severe');
  const [error, setError] = useState<string | null>(null);

  const handleAddAllergy = () => {
    if (!newAllergyName.trim()) return;
    if (allergiesList.some((a) => a.allergyName.toLowerCase() === newAllergyName.trim().toLowerCase())) return;

    setAllergiesList([
      ...allergiesList,
      {
        allergyId: `alg_${Date.now()}`,
        allergyName: newAllergyName.trim(),
        severity: newAllergySeverity,
      },
    ]);
    setNewAllergyName('');
  };

  const handleRemoveAllergy = (idx: number) => {
    setAllergiesList(allergiesList.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password entry.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      await registerPatient({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        age: parseInt(age, 10) || 30,
        gender,
        roomNumber: roomNumber.trim(),
        contactNumber: contactNumber.trim(),
        diseases: selectedDiseases,
        allergies: allergiesList,
      });

      navigate('/patient', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center backdrop-blur-xs">
                <HeartPulse className="w-6 h-6 text-teal-300" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-white">{HOSPITAL_INFO.name}</h1>
                <p className="text-xs text-teal-200 font-medium">{HOSPITAL_INFO.portalTitle}</p>
              </div>
            </div>
            <Link
              to="/login"
              className="text-xs text-teal-200 hover:text-white flex items-center gap-1.5 transition-colors bg-white/10 px-3 py-1.5 rounded-lg border border-white/10"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
            </Link>
          </div>
          <div className="mt-4 pt-4 border-t border-teal-700/50">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-teal-400" /> Inpatient Bedside Registration
            </h2>
            <p className="text-xs text-teal-200/90 mt-0.5">
              Create your patient account to access physician-approved meals and enable automated allergy conflict protection.
            </p>
          </div>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
              <AlertOctagon className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Account & Demographics */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 border-b border-slate-100 pb-1 flex items-center gap-1.5">
              <User className="w-4 h-4 text-teal-700" /> 1. Personal &amp; Account Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Full Patient Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Eleanor Vance"
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. eleanor@hospital.com"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Password (min. 6 characters)"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
              <Select
                label="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                options={[
                  { value: 'MALE', label: 'Male' },
                  { value: 'FEMALE', label: 'Female' },
                  { value: 'OTHER', label: 'Other' },
                ]}
              />
              <Input
                label="Room / Bed Station"
                value={roomNumber}
                onChange={(e) => setRoomNumber(e.target.value)}
                placeholder="e.g. Ward 3B, Bed 12"
                required
              />
            </div>

            <Input
              label="Emergency Contact Number (Optional)"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="e.g. +1 555-0192"
            />
          </div>

          {/* Section 2: Clinical Diagnoses */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 border-b border-slate-100 pb-1 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-teal-700" /> 2. Diagnosed Clinical Conditions
            </h3>
            <MultiSelect
              label="Medical Conditions / Chronic Diagnoses"
              options={COMMON_DISEASES.map((d) => ({
                value: typeof d === 'string' ? d : (d as any).name,
                label: typeof d === 'string' ? d : (d as any).name,
                subtitle: typeof d === 'string' ? undefined : (d as any).description,
              }))}
              selectedValues={selectedDiseases}
              onChange={setSelectedDiseases}
              placeholder="Select conditions (e.g. Type 2 Diabetes, Hypertension, Celiac)..."
              helperText="Dietary engine cross-checks kitchen ingredients against your selected conditions."
              allowCustom={true}
            />
          </div>

          {/* Section 3: Allergen Profile */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 border-b border-slate-100 pb-1 flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-red-600" /> 3. Food Allergies &amp; Clinical Severity
            </h3>

            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="flex-1 w-full">
                  <input
                    list="register-allergies"
                    value={newAllergyName}
                    onChange={(e) => setNewAllergyName(e.target.value)}
                    placeholder="Type or select allergen (e.g. Peanuts, Shellfish, Lactose)..."
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white"
                  />
                  <datalist id="register-allergies">
                    {ALLERGIES_LIST.map((a: any) => {
                      const aName = typeof a === 'string' ? a : a.name;
                      return <option key={aName} value={aName} />;
                    })}
                  </datalist>
                </div>

                <div className="w-full sm:w-36">
                  <select
                    value={newAllergySeverity}
                    onChange={(e) => setNewAllergySeverity(e.target.value as AllergySeverity)}
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white"
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <Button type="button" size="sm" variant="outline" onClick={handleAddAllergy}>
                  Add
                </Button>
              </div>

              {/* Added Allergies List */}
              <div className="space-y-1.5 pt-1">
                {allergiesList.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No allergies added. If you have any food allergies, add them above.</p>
                ) : (
                  allergiesList.map((alg, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <AlertOctagon className="w-3.5 h-3.5 text-red-600" />
                        <span className="font-bold text-slate-800">{alg.allergyName}</span>
                        <span
                          className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                            alg.severity === 'severe' || alg.severity === 'critical'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {alg.severity}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergy(idx)}
                        className="text-slate-400 hover:text-red-600 p-1"
                        aria-label="Remove allergen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Submit Actions */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-700 font-bold hover:underline">
                Sign in here
              </Link>
            </p>
            <Button type="submit" size="md" isLoading={isLoading} className="w-full sm:w-auto">
              Complete Registration &amp; Enter Portal
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
