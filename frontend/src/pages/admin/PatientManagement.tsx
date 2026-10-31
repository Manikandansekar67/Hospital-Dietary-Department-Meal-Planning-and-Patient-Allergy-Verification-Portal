import React, { useEffect, useState } from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  Stethoscope,
  Trash2,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
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
import { adminService, DoctorInfo } from '../../services/adminService';
import { patientService } from '../../services/patientService';
import { AllergySeverity, Patient, PatientAllergy } from '../../types';

type TabType = 'roster' | 'assignment';

interface AssignmentRow {
  patientId: string;
  patientName: string;
  email?: string;
  phone?: string;
  currentDoctorId?: string;
  currentDoctorName?: string;
  selectedDoctorId: string;
  isSaving: boolean;
  isRemoving: boolean;
  successMsg: string;
  errorMsg: string;
}

export const PatientManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('roster');

  // ────────────────────────────────────────────────
  //  Roster tab state
  // ────────────────────────────────────────────────
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
  const [specialInstructions, setSpecialInstructions] = useState(
    'Verify all ingredients. Ensure no cross-contact.'
  );
  const [assignDoctorId, setAssignDoctorId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // ────────────────────────────────────────────────
  //  Doctor Assignment tab state
  // ────────────────────────────────────────────────
  const [doctors, setDoctors] = useState<DoctorInfo[]>([]);
  const [isDoctorsLoading, setIsDoctorsLoading] = useState(false);
  const [assignmentRows, setAssignmentRows] = useState<AssignmentRow[]>([]);
  const [assignmentSearch, setAssignmentSearch] = useState('');
  const [filterByDoctor, setFilterByDoctor] = useState('');

  // ────────────────────────────────────────────────
  //  Load data
  // ────────────────────────────────────────────────
  useEffect(() => {
    loadPatients();
    loadDoctors();
  }, []);

  useEffect(() => {
    if (activeTab === 'assignment') {
      // Always re-fetch patients and doctors from server when entering assignment tab
      // so newly created patients are visible immediately.
      loadPatients();
      loadDoctors();
    }
  }, [activeTab]);

  useEffect(() => {
    // Rebuild assignment rows whenever patients change
    const rows: AssignmentRow[] = patients.map((p) => ({
      patientId: p.id,
      patientName: p.name,
      email: (p as any).email || (p as any).phone,
      phone: p.contactNumber || (p as any).phone,
      currentDoctorId: p.doctorId || undefined,
      currentDoctorName: p.doctorName || undefined,
      selectedDoctorId: p.doctorId || '',
      isSaving: false,
      isRemoving: false,
      successMsg: '',
      errorMsg: '',
    }));
    setAssignmentRows(rows);
  }, [patients]);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const data = await patientService.getPatients();
      setPatients(data);
    } catch {
      // keep existing state on error
    } finally {
      setIsLoading(false);
    }
  };

  const loadDoctors = async () => {
    setIsDoctorsLoading(true);
    try {
      const data = await adminService.getDoctors();
      setDoctors(data);
    } catch {
      // silently fail; doctors list will stay empty
    } finally {
      setIsDoctorsLoading(false);
    }
  };

  // ────────────────────────────────────────────────
  //  Roster helpers
  // ────────────────────────────────────────────────
  const handleAddAllergy = () => {
    if (!newAllergyName) return;
    if (allergiesList.some((a) => a.allergyName.toLowerCase() === newAllergyName.toLowerCase()))
      return;

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
    setIsSubmitting(true);
    setSubmitError('');
    try {
      const assignedDoc = doctors.find((d) => d.id === assignDoctorId || d.userId === assignDoctorId);
      await patientService.addPatient({
        patientCode: `P-${Math.floor(1000 + Math.random() * 9000)}`,
        name,
        age: parseInt(age, 10) || 30,
        gender: (gender.charAt(0).toUpperCase() + gender.slice(1)) as any,
        roomNumber,
        contactNumber,
        admissionDate: new Date().toISOString().split('T')[0],
        doctorId: assignDoctorId || undefined,
        doctorName: assignedDoc ? assignedDoc.name : undefined,
        status: 'admitted',
        diseases: selectedDiseases,
        allergies: allergiesList,
        dietaryRestrictions: dietaryRestrictions
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        specialInstructions,
      });

      // Re-fetch the full patient list from the server so both the roster
      // and the Doctor Assignment tab immediately see the new patient.
      await loadPatients();
      if (doctors.length === 0) {
        await loadDoctors();
      }
      setIsAddModalOpen(false);
      resetForm();
    } catch (err: any) {
      setSubmitError(
        err?.response?.data?.error?.message || err?.message || 'Failed to register inpatient.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setName('');
    setAge('45');
    setRoomNumber('');
    setContactNumber('');
    setAssignDoctorId('');
    setSelectedDiseases([]);
    setAllergiesList([]);
    setSubmitError('');
  };

  // ────────────────────────────────────────────────
  //  Doctor Assignment helpers
  // ────────────────────────────────────────────────
  const updateRow = (patientId: string, patch: Partial<AssignmentRow>) => {
    setAssignmentRows((prev) =>
      prev.map((r) => (r.patientId === patientId ? { ...r, ...patch } : r))
    );
  };

  const handleAssign = async (row: AssignmentRow) => {
    if (!row.selectedDoctorId) return;
    updateRow(row.patientId, { isSaving: true, successMsg: '', errorMsg: '' });
    try {
      await adminService.assignDoctor(row.patientId, row.selectedDoctorId);
      const doctor = doctors.find((d) => d.id === row.selectedDoctorId || d.userId === row.selectedDoctorId);
      updateRow(row.patientId, {
        isSaving: false,
        currentDoctorId: row.selectedDoctorId,
        currentDoctorName: doctor?.name || 'Assigned Doctor',
        successMsg: `Assigned to ${doctor?.name || 'doctor'} successfully.`,
        errorMsg: '',
      });
      // Update the main patients list as well
      setPatients((prev) =>
        prev.map((p) =>
          p.id === row.patientId
            ? { ...p, doctorId: row.selectedDoctorId, doctorName: doctor?.name || 'Assigned Doctor' }
            : p
        )
      );
      // Background re-fetch to ensure complete sync
      loadPatients();
    } catch (err: any) {
      updateRow(row.patientId, {
        isSaving: false,
        errorMsg: err?.response?.data?.error?.message || 'Failed to assign doctor.',
      });
    }
  };

  const handleRemove = async (row: AssignmentRow) => {
    updateRow(row.patientId, { isRemoving: true, successMsg: '', errorMsg: '' });
    try {
      await adminService.removeDoctor(row.patientId);
      updateRow(row.patientId, {
        isRemoving: false,
        currentDoctorId: '',
        currentDoctorName: '',
        selectedDoctorId: '',
        successMsg: 'Doctor assignment removed.',
        errorMsg: '',
      });
      setPatients((prev) =>
        prev.map((p) =>
          p.id === row.patientId ? { ...p, doctorId: undefined as any, doctorName: undefined as any } : p
        )
      );
      loadPatients();
    } catch (err: any) {
      updateRow(row.patientId, {
        isRemoving: false,
        errorMsg: err?.response?.data?.error?.message || 'Failed to remove doctor.',
      });
    }
  };

  // ────────────────────────────────────────────────
  //  Filtered data
  // ────────────────────────────────────────────────
  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.patientCode.toLowerCase().includes(search.toLowerCase()) ||
      p.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.diseases.some((d) => d.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredAssignmentRows = assignmentRows.filter((r) => {
    const matchSearch =
      r.patientName.toLowerCase().includes(assignmentSearch.toLowerCase()) ||
      (r.email || '').toLowerCase().includes(assignmentSearch.toLowerCase()) ||
      (r.phone || '').toLowerCase().includes(assignmentSearch.toLowerCase());
    const matchDoctor =
      !filterByDoctor ||
      (filterByDoctor === '__unassigned__'
        ? !r.currentDoctorId
        : r.currentDoctorId === filterByDoctor);
    return matchSearch && matchDoctor;
  });

  // ────────────────────────────────────────────────
  //  Render
  // ────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Patient Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage inpatient records, clinical dietary profiles, and doctor assignments.
          </p>
        </div>
        {activeTab === 'roster' && (
          <Button size="sm" leftIcon={<UserPlus className="w-4 h-4" />} onClick={() => setIsAddModalOpen(true)}>
            Register Inpatient
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('roster')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'roster'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          Patient Roster
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('assignment')}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            activeTab === 'assignment'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Stethoscope className="w-3.5 h-3.5" />
          Doctor Assignments
        </button>
      </div>

      {/* ── ROSTER TAB ─────────────────────────────── */}
      {activeTab === 'roster' && (
        <>
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
                            {(p.diseases || []).map((d, i) => (
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
                            {(p.allergies || []).length === 0 ? (
                              <span className="text-slate-400 text-[11px]">None recorded</span>
                            ) : (
                              (p.allergies || []).map((a, i) => (
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
        </>
      )}

      {/* ── DOCTOR ASSIGNMENT TAB ──────────────────── */}
      {activeTab === 'assignment' && (
        <div className="space-y-4">
          {/* Section description */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 flex items-start gap-3">
            <Stethoscope className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
            <p className="text-xs text-indigo-800">
              Assign or reassign a physician to each inpatient. Doctors will only see patients
              assigned to them. Changes are persisted immediately to the database.
            </p>
          </div>

          {/* Filters row */}
          <div className="flex flex-col sm:flex-row gap-2">
            <SearchBar
              value={assignmentSearch}
              onChange={setAssignmentSearch}
              placeholder="Search by patient name or phone..."
              className="flex-1 max-w-sm"
            />
            <select
              value={filterByDoctor}
              onChange={(e) => setFilterByDoctor(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-400 min-w-[180px]"
            >
              <option value="">All Patients</option>
              <option value="__unassigned__">Unassigned Only</option>
              {doctors.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          {isLoading || isDoctorsLoading ? (
            <LoadingState message="Loading patients and doctors..." />
          ) : filteredAssignmentRows.length === 0 ? (
            <EmptyState
              title="No patients found"
              description="Try clearing your search or filter."
            />
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4 font-bold">Patient</th>
                      <th className="py-3 px-4 font-bold">Contact</th>
                      <th className="py-3 px-4 font-bold">Current Doctor</th>
                      <th className="py-3 px-4 font-bold w-56">Assign Doctor</th>
                      <th className="py-3 px-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAssignmentRows.map((row) => (
                      <tr key={row.patientId} className="hover:bg-slate-50/60 transition-colors">
                        {/* Patient name */}
                        <td className="py-3 px-4">
                          <strong className="text-slate-900 block font-semibold">
                            {row.patientName}
                          </strong>
                          {row.email && (
                            <span className="text-slate-400 text-[11px]">{row.email}</span>
                          )}
                        </td>

                        {/* Contact */}
                        <td className="py-3 px-4 text-slate-600">
                          {row.phone || <span className="text-slate-300 italic">—</span>}
                        </td>

                        {/* Current doctor */}
                        <td className="py-3 px-4">
                          {row.currentDoctorName ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 font-semibold text-[11px]">
                              <Stethoscope className="w-3 h-3" />
                              {row.currentDoctorName}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                          )}
                        </td>

                        {/* Doctor dropdown */}
                        <td className="py-3 px-4">
                          <select
                            value={row.selectedDoctorId}
                            onChange={(e) =>
                              updateRow(row.patientId, { selectedDoctorId: e.target.value })
                            }
                            className="w-full text-xs rounded-lg border border-slate-300 px-2 py-1.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-400"
                            disabled={row.isSaving || row.isRemoving}
                          >
                            <option value="">— Select Doctor —</option>
                            {doctors.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name}
                                {d.department ? ` (${d.department})` : ''}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2 flex-wrap">
                            {/* Inline feedback */}
                            {row.successMsg && (
                              <span className="flex items-center gap-1 text-emerald-700 text-[11px] font-medium">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                {row.successMsg}
                              </span>
                            )}
                            {row.errorMsg && (
                              <span className="flex items-center gap-1 text-red-600 text-[11px] font-medium">
                                <XCircle className="w-3.5 h-3.5" />
                                {row.errorMsg}
                              </span>
                            )}

                            <Button
                              size="sm"
                              isLoading={row.isSaving}
                              disabled={
                                !row.selectedDoctorId ||
                                row.selectedDoctorId === row.currentDoctorId ||
                                row.isRemoving
                              }
                              onClick={() => handleAssign(row)}
                            >
                              {row.currentDoctorId ? 'Reassign' : 'Assign'}
                            </Button>

                            {row.currentDoctorId && (
                              <Button
                                size="sm"
                                variant="outline"
                                isLoading={row.isRemoving}
                                disabled={row.isSaving}
                                leftIcon={<Trash2 className="w-3 h-3" />}
                                onClick={() => handleRemove(row)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── PATIENT DETAIL MODAL ───────────────────── */}
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
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Age / Gender
                </span>
                <strong className="text-slate-800 text-sm">
                  {selectedPatient.age} yrs / {selectedPatient.gender}
                </strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Room Station
                </span>
                <strong className="text-teal-800 text-sm">{selectedPatient.roomNumber}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Admission Date
                </span>
                <strong className="text-slate-800 text-sm">{selectedPatient.admissionDate}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Clinical Status
                </span>
                <StatusBadge type="status" value={selectedPatient.status} size="sm" />
              </div>
            </div>

            {/* Assigned Doctor */}
            {selectedPatient.doctorName && (
              <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 rounded-lg border border-teal-200">
                <Stethoscope className="w-4 h-4 text-teal-700 shrink-0" />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
                    Assigned Physician
                  </span>
                  <span className="text-teal-900 font-semibold">{selectedPatient.doctorName}</span>
                </div>
              </div>
            )}

            {/* Diagnosed Conditions */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1.5">
                Diagnosed Medical Conditions
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {(selectedPatient.diseases || []).map((d, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-semibold"
                  >
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
                {(selectedPatient.allergies || []).length === 0 ? (
                  <p className="text-slate-400">No known food allergies.</p>
                ) : (
                  (selectedPatient.allergies || []).map((a, i) => (
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
              <p className="text-slate-700">
                {selectedPatient.dietaryRestrictions.join(', ') || 'Standard in-hospital diet'}
              </p>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block pt-1">
                Special Clinical Instructions
              </span>
              <p className="text-slate-600 italic leading-relaxed">
                {selectedPatient.specialInstructions || 'None'}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setSelectedPatient(null)}>
                Close Chart
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── REGISTER PATIENT MODAL ─────────────────── */}
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

          <Select
            label="Assigned Attending Doctor (Optional)"
            value={assignDoctorId}
            onChange={(e) => setAssignDoctorId(e.target.value)}
            options={[
              { value: '', label: '— Unassigned (Can assign later in Doctor Assignment tab) —' },
              ...doctors.map((d) => ({
                value: d.id,
                label: `${d.name}${d.department ? ` (${d.department})` : ''}`,
              })),
            ]}
          />

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
                    return <option key={allergyName} value={allergyName} />;
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

          {submitError && (
            <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 shrink-0 text-red-600" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Save Inpatient Record
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
