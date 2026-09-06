import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Utensils,
  XCircle,
} from 'lucide-react';
import { AllergyAlert } from '../../components/allergy/AllergyAlert';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { SearchBar } from '../../components/common/NavigationControls';
import { Select } from '../../components/common/Select';
import { EmptyState, LoadingState } from '../../components/common/StateFeedback';
import { DoctorApprovalModal } from '../../components/food/DoctorApprovalModal';
import { FoodCard } from '../../components/food/FoodCard';
import { useNotifications } from '../../store/NotificationContext';
import { doctorService } from '../../services/doctorService';
import { patientService } from '../../services/patientService';
import { FoodRecommendation, Patient } from '../../types';

export const FoodRecommendationPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPatientId = searchParams.get('patientId') || '';

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(initialPatientId);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const [recommendations, setRecommendations] = useState<FoodRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'safe' | 'conflict' | 'approved' | 'rejected'>('all');

  // Modal State for Doctor Approval/Rejection
  const [activeModalRec, setActiveModalRec] = useState<FoodRecommendation | null>(null);
  const [modalMode, setModalMode] = useState<'approve' | 'reject'>('approve');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { addToast } = useNotifications();

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const data = await patientService.getPatients();
      setPatients(data);

      const targetId = initialPatientId || (data.length > 0 ? data[0].id : '');
      if (targetId) {
        setSelectedPatientId(targetId);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedPatientId) return;

    const patient = patients.find((p) => p.id === selectedPatientId) || null;
    setSelectedPatient(patient);
    setSearchParams({ patientId: selectedPatientId });

    loadRecommendations(selectedPatientId);
  }, [selectedPatientId, patients]);

  const loadRecommendations = async (patientId: string) => {
    setIsLoading(true);
    try {
      const recs = await doctorService.getRecommendationsForPatient(patientId);
      setRecommendations(recs);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenApprove = (rec: FoodRecommendation) => {
    setActiveModalRec(rec);
    setModalMode('approve');
    setIsModalOpen(true);
  };

  const handleOpenReject = (rec: FoodRecommendation) => {
    setActiveModalRec(rec);
    setModalMode('reject');
    setIsModalOpen(true);
  };

  const handleConfirmApprovalOrRejection = async (recId: string, remarks: string) => {
    if (modalMode === 'approve') {
      const updated = await doctorService.approveFood(recId, remarks);
      setRecommendations((prev) => prev.map((r) => (r.id === recId ? updated : r)));
      addToast({
        title: 'Food Clinically Approved',
        message: `${updated.food.name} is now approved for ${selectedPatient?.name}.`,
        type: 'success',
      });
    } else {
      const updated = await doctorService.rejectFood(recId, remarks);
      setRecommendations((prev) => prev.map((r) => (r.id === recId ? updated : r)));
      addToast({
        title: 'Food Clinically Rejected',
        message: `${updated.food.name} was marked contraindicated.`,
        type: 'warning',
      });
    }
  };

  // Check if there is an active severe allergy conflict in the list
  const criticalAllergyConflicts = recommendations.filter((r) => r.allergyCheck.hasConflict);

  // Filter recommendations based on search & status filter
  const filteredRecs = recommendations.filter((rec) => {
    const matchesSearch =
      rec.food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.food.ingredients.some((i) => i.toLowerCase().includes(searchQuery.toLowerCase())) ||
      rec.food.category.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (statusFilter === 'safe') matchesFilter = rec.safetyStatus === 'SAFE';
    if (statusFilter === 'conflict') matchesFilter = rec.allergyCheck.hasConflict;
    if (statusFilter === 'approved') matchesFilter = rec.doctorApproval.status === 'approved';
    if (statusFilter === 'rejected') matchesFilter = rec.doctorApproval.status === 'rejected';

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Patient Selector Strip */}
      <div className="bg-white p-4.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="w-full md:w-80">
          <label className="block text-xs font-bold uppercase tracking-wider text-teal-800 mb-1.5">
            Select Inpatient for Verification
          </label>
          <select
            value={selectedPatientId}
            onChange={(e) => setSelectedPatientId(e.target.value)}
            className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 bg-white text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-600"
          >
            {patients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.patientCode} · Room {p.roomNumber})
              </option>
            ))}
          </select>
        </div>

        {selectedPatient && (
          <div className="flex-1 flex flex-wrap items-center gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200 w-full md:w-auto">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Diagnoses:</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {selectedPatient.diseases.map((d, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 font-semibold border border-blue-200 text-[10px]">
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-l border-slate-200 pl-3">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Allergies:</span>
              <div className="flex flex-wrap gap-1 mt-0.5">
                {selectedPatient.allergies.length === 0 ? (
                  <span className="text-slate-500 font-medium">None recorded</span>
                ) : (
                  selectedPatient.allergies.map((a, i) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded font-bold uppercase text-[10px] border ${
                        a.severity === 'severe' || a.severity === 'critical'
                          ? 'bg-red-50 text-red-800 border-red-300'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      <AlertOctagon className="w-3 h-3 text-red-600" />
                      {a.allergyName} ({a.severity})
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Prominent Critical Allergy Alert Banner when conflicts exist */}
      {selectedPatient && criticalAllergyConflicts.length > 0 && (
        <div className="space-y-2">
          {criticalAllergyConflicts.slice(0, 2).map((conflictRec) => (
            <AllergyAlert
              key={conflictRec.id}
              patientName={selectedPatient.name}
              allergyName={conflictRec.allergyCheck.allergenName || 'Diagnosed Allergen'}
              severity={conflictRec.allergyCheck.severity || 'severe'}
              foodName={conflictRec.food.name}
              conflictingIngredients={conflictRec.allergyCheck.conflictingIngredients}
              recommendationText="CONTRAINDICATED: DO NOT APPROVE"
            />
          ))}
        </div>
      )}

      {/* Toolbar & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search foods or ingredients for this patient..."
          className="w-full sm:w-80"
        />

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Foods' },
            { id: 'safe', label: 'Safe Only' },
            { id: 'conflict', label: 'Allergy Warnings' },
            { id: 'approved', label: 'Approved' },
            { id: 'rejected', label: 'Rejected' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap ${
                statusFilter === tab.id
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Recommendation Results Grid */}
      {isLoading ? (
        <LoadingState message="Executing clinical food evaluation &amp; allergy verification engine..." />
      ) : filteredRecs.length === 0 ? (
        /* Section 13 requirement: If food not found in database, show "Food not found in database" + [Add New Food] button! */
        <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3">
            <Utensils className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {searchQuery ? `Food "${searchQuery}" not found in database` : 'No foods match this filter'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4 leading-relaxed">
            {searchQuery
              ? 'You can register this custom or unlisted food item. The system will automatically scan its ingredients for allergy conflicts.'
              : 'Try clearing your filter or selecting a different patient.'}
          </p>
          <Link to={`/doctor/add-food?name=${encodeURIComponent(searchQuery)}`}>
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Add Unlisted Food &amp; Verify
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRecs.map((rec) => (
            <FoodCard
              key={rec.id}
              recommendation={rec}
              patient={selectedPatient || undefined}
              onReject={handleOpenReject}
            />
          ))}
        </div>
      )}

      {/* Doctor Approval & Remarks Modal */}
      <DoctorApprovalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        recommendation={activeModalRec}
        patient={selectedPatient}
        mode={modalMode}
        onConfirm={handleConfirmApprovalOrRejection}
      />
    </div>
  );
};
