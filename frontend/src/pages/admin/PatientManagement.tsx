import React, { useEffect, useState } from 'react';
import { AlertOctagon, HeartPulse, Plus, Search, Trash2, UserPlus } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { MultiSelect } from '../../components/common/MultiSelect';
import { SearchBar } from '../../components/common/NavigationControls';
import { Select } from '../../components/common/Select';
import { EmptyState, LoadingState } from '../../components/common/StateFeedback';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ALLERGIES_LIST, COMMON_DISEASES } from '../../constants';
import { patientService } from '../../services/patientService';
import { AllergySeverity, Patient, PatientAllergy } from '../../types';

export const PatientManagement: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Add Patient Modal Form State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [age, setAge] = useState('45');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [roomNumber, setRoomNumber] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedDiseases, setSelectedDiseases] = useState<string[]>([]);
  const [allergiesList, setAllergiesList] = useState<PatientAllergy[]>([]);
  const [newAllergyName, setNewAllergyName] = useState('');
  const [newAllergySeverity, setNewAllergySeverity] = useState<AllergySeverity>('severe');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('Low Sodium, Diabetic Diet');
  const [specialInstructions, setSpecialInstructions] = useState('Verify all ingredients. Ensure no cross-contact.');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const data = await patientService.getPatients();
      setPatients(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAllergy = () => {
    if (!newAllergyName) return;
    if (allergiesList.some((a) => a.allergyName.toLowerCase() === newAllergyName.toLowerCase())) return;

    setAllergiesList([
      ...allergiesList,
      {
        allergyId: `alg_${Date.now()}`,
        allergyName: newAllergyName,
        severity: newAllergySeverity,
      },
    ]);
    setNewAllergyName('');
  };

  const handleRemoveAllergy = (idx: number) => {
    setAllergiesList(allergiesList.filter((_, i) => i !== idx));
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    const newPatient = await patientService.addPatient({
      patientCode: `P-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      age: parseInt(age, 10) || 30,
      gender: (gender.charAt(0).toUpperCase() + gender.slice(1)) as any,
      roomNumber,
      contactNumber,
      admissionDate: new Date().toISOString().split('T')[0],
      doctorId: 'doc-1',
      doctorName: 'Dr. Sarah Jenkins',
      status: 'admitted',
      diseases: selectedDiseases,
      allergies: allergiesList,
      dietaryRestrictions: dietaryRestrictions.split(',').map((s) => s.trim()).filter(Boolean),
      specialInstructions,
    });

    setPatients([newPatient, ...patients]);
    setIsAddModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setAge('45');
    setRoomNumber('');
    setContactNumber('');
    setSelectedDiseases([]);
    setAllergiesList([]);
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.patientCode.toLowerCase().includes(search.toLowerCase()) ||
      p.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.diseases.some((d) => d.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Inpatient Clinical Dietary Roster</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Admitted hospital patients with diagnosed clinical conditions, allergen profiles, and dietary orders.
          </p>
        </div>
        <Button size="sm" leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>
          Register Inpatient
        </Button>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search patient name, ID (e.g. PAT-001), room, or condition..."
          className="max-w-md"
        />
      </div>

      {/* Patient Table */}
      {isLoading ? (
        <LoadingState message="Retrieving inpatient health records..." />
      ) : filteredPatients.length === 0 ? (
        <EmptyState
          title="No patients found"
          description="No patients matched your search criteria."
          action={{ label: 'Register Patient', onClick: () => setIsAddModalOpen(true) }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Patient Details</th>
                  <th className="py-3 px-4 font-bold">Room</th>
                  <th className="py-3 px-4 font-bold">Medical Conditions</th>
                  <th className="py-3 px-4 font-bold">Diagnosed Allergies</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <strong className="text-slate-900 block font-semibold">{p.name}</strong>
                        <span className="text-slate-400 text-[11px]">
                          {p.patientCode} · {p.age} yrs · {p.gender}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-teal-800">{p.roomNumber}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {p.diseases.map((d, i) => (
                          <span
                            key={i}
                            className="inline-block px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-medium border border-blue-200"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {p.allergies.length === 0 ? (
                          <span className="text-slate-400 text-[11px]">None recorded</span>
                        ) : (
                          p.allergies.map((a, i) => (
                            <span
                              key={i}
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                a.severity === 'severe' || a.severity === 'critical'
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                            >
                              <AlertOctagon className="w-3 h-3" />
                              {a.allergyName} ({a.severity})
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge type="status" value={p.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelectedPatient(p)}>
                        View Chart
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <Modal
          isOpen={!!selectedPatient}
          onClose={() => setSelectedPatient(null)}
          title={`Clinical Profile: ${selectedPatient.name}`}
          subtitle={`${selectedPatient.patientCode} · Room ${selectedPatient.roomNumber}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Age / Gender</span>
                <strong className="text-slate-800 text-sm">
                  {selectedPatient.age} yrs / {selectedPatient.gender}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Room Station</span>
                <strong className="text-teal-800 text-sm">{selectedPatient.roomNumber}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Admission Date</span>
                <strong className="text-slate-800 text-sm">{selectedPatient.admissionDate}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Clinical Status</span>
                <StatusBadge type="status" value={selectedPatient.status} size="sm" />
              </div>
            </div>

            {/* Diagnosed Conditions */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                Diagnosed Medical Conditions
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedPatient.diseases.map((d, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-semibold">
                    {d}
                  </span>
                ))}
              </div>
            </div>

            {/* Diagnosed Allergies */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                Active Food Allergies &amp; Severity
              </h4>
              <div className="space-y-1.5">
                {selectedPatient.allergies.length === 0 ? (
                  <p className="text-slate-400">No known food allergies.</p>
                ) : (
                  selectedPatient.allergies.map((a, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-red-50 border border-red-200 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <AlertOctagon className="w-4 h-4 text-red-600" />
                        <strong className="text-red-900">{a.allergyName}</strong>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase">
                        {a.severity}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Dietary Restrictions & Special Instructions */}
            <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block">
                Dietary Restrictions
              </span>
              <p className="text-slate-700">{selectedPatient.dietaryRestrictions.join(', ') || 'Standard in-hospital diet'}</p>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block pt-1">
                Special Clinical Instructions
              </span>
              <p className="text-slate-600 italic leading-relaxed">{selectedPatient.specialInstructions || 'None'}</p>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setSelectedPatient(null)}>
                Close Chart
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Register Patient Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register Inpatient Medical &amp; Allergy Profile"
        subtitle="Collects diseases and allergies to initialize rule-based food evaluation"
        maxWidth="xl"
      >
        <form onSubmit={handleCreatePatient} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Patient Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Arun Kumar"
              required
            />
            <div className="grid grid-cols-2 gap-2">
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
                  { value: 'male', label: 'Male' },
                  { value: 'female', label: 'Female' },
                  { value: 'other', label: 'Other' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Room / Bed Number"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g. Ward 3, Bed 304-B"
              required
            />
            <Input
              label="Emergency Contact"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="e.g. +1 555-0192"
            />
          </div>

          {/* Searchable Multi-select for Diseases */}
          <MultiSelect
            label="Diagnosed Medical Conditions / Diseases"
            options={COMMON_DISEASES.map((d) => ({
              value: typeof d === 'string' ? d : (d as any).name,
              label: typeof d === 'string' ? d : (d as any).name,
              subtitle: typeof d === 'string' ? undefined : (d as any).description,
            }))}
            selectedValues={selectedDiseases}
            onChange={setSelectedDiseases}
            placeholder="Select medical conditions (e.g. Type 2 Diabetes, Hypertension)..."
            helperText="The dietary engine verifies food ingredients against each selected disease."
            allowCustom={true}
          />

          {/* Allergies Builder with Severity */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
              Food Allergies &amp; Clinical Severity
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="flex-1 w-full">
                <input
                  list="allergies-options"
                  value={newAllergyName}
                  onChange={(e) => setNewAllergyName(e.target.value)}
                  placeholder="Type or select an allergy..."
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                />
                <datalist id="allergies-options">
                  {ALLERGIES_LIST.map((a: any) => {
                    const allergyName = typeof a === 'string' ? a : a.name;
                    return (
                      <option key={allergyName} value={allergyName} />
                    );
                  })}
                </datalist>
              </div>

              <div className="w-full sm:w-36">
                <select
                  value={newAllergySeverity}
                  onChange={(e) => setNewAllergySeverity(e.target.value as AllergySeverity)}
                  className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                >
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <Button type="button" size="sm" variant="outline" onClick={handleAddAllergy}>
                Add Allergy
              </Button>
            </div>

            {/* List of added allergies */}
            <div className="space-y-1.5 pt-1">
              {allergiesList.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No allergies added yet.</p>
              ) : (
                allergiesList.map((alg, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded bg-white border border-slate-200 text-xs"
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
                      aria-label="Remove allergy"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <Input
            label="Dietary Restrictions"
            value={dietaryRestrictions}
            onChange={(e) => setDietaryRestrictions(e.target.value)}
            placeholder="e.g. Low Sodium, Low Sugar, High Fiber"
          />

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Special Clinical Instructions for Kitchen
            </label>
            <textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={2}
              placeholder="e.g. Patient is at high risk of anaphylaxis. Prepare using isolated cookware."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Inpatient Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
