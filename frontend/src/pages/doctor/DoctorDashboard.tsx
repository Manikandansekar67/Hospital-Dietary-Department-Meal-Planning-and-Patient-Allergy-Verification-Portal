import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Clock,
<<<<<<< HEAD
  Filter,
  HeartPulse,
  Plus,
  Search,
=======
  HeartPulse,
  Plus,
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
  ShieldAlert,
  Sparkles,
  Stethoscope,
  UserCheck,
  Utensils,
  XCircle,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
<<<<<<< HEAD
import { SearchBar } from '../../components/common/NavigationControls';
=======
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
import { LoadingState } from '../../components/common/StateFeedback';
import { doctorService } from '../../services/doctorService';
import { patientService } from '../../services/patientService';
import { Patient } from '../../types';

export const DoctorDashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
<<<<<<< HEAD
  const [search, setSearch] = useState('');
=======
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
  const [stats, setStats] = useState({
    assignedPatients: 0,
    pendingApprovals: 0,
    approvedFoods: 0,
    rejectedFoods: 0,
    allergyAlerts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const [pts, recs] = await Promise.all([
        patientService.getPatients(),
        doctorService.getAllRecommendations(),
      ]);

      setPatients(pts);

      const pending = recs.filter((r) => r.doctorApproval.status === 'pending').length;
      const approved = recs.filter((r) => r.doctorApproval.status === 'approved').length;
      const rejected = recs.filter((r) => r.doctorApproval.status === 'rejected').length;
      const allergyConflicts = recs.filter((r) => r.allergyCheck.hasConflict).length;

      setStats({
        assignedPatients: pts.length,
        pendingApprovals: pending,
        approvedFoods: approved,
        rejectedFoods: rejected,
        allergyAlerts: allergyConflicts,
      });
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
      p.patientCode.toLowerCase().includes(search.toLowerCase()) ||
      p.diseases.some((d) => d.toLowerCase().includes(search.toLowerCase()))
  );

=======
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
  if (isLoading) {
    return <LoadingState message="Loading assigned patient profiles and clinical safety queues..." />;
  }

  return (
    <div className="space-y-6">
<<<<<<< HEAD
      {/* Clinical Station Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Physician &amp; Nutritionist Workstation
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-xs text-slate-500 font-medium">Inpatient Dietary Care</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1">Clinical Verification &amp; Allergy Review</h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            Evaluate rule-based meal suggestions against active patient diagnoses, inspect allergen cross-contact risks, and issue dietary authorizations.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            to="/doctor/add-food"
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition-colors border border-slate-200 flex items-center gap-1.5"
=======
      {/* Doctor Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 via-teal-800 to-teal-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-teal-200 text-xs font-bold uppercase tracking-wider">Clinical Nutrition &amp; Dietary</span>
          <h2 className="text-xl sm:text-2xl font-black mt-1">Physician Verification &amp; Allergy Portal</h2>
          <p className="text-teal-100/90 text-xs sm:text-sm mt-1 max-w-2xl">
            Evaluate rule-based dietary recommendations, inspect allergen cross-contact risks, and grant clinical meal approvals for inpatients.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            to="/doctor/add-food"
            className="px-4 py-2 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-semibold text-white transition-colors border border-white/20 whitespace-nowrap flex items-center gap-1.5"
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
          >
            <Plus className="w-3.5 h-3.5" />
            Add Unlisted Food
          </Link>
          <Link
            to="/doctor/recommendations"
<<<<<<< HEAD
            className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
=======
            className="px-4 py-2 bg-white text-teal-900 hover:bg-teal-50 rounded-lg text-xs font-bold transition-colors shadow-xs whitespace-nowrap flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
            Food Approvals
          </Link>
        </div>
      </div>

      {/* 5 Stats KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
<<<<<<< HEAD
        {/* Assigned Inpatients */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-xs font-medium text-slate-500">Inpatients</span>
=======
        {/* Assigned Patients */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Assigned Inpatients</span>
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
            <UserCheck className="w-4 h-4 text-teal-700" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.assignedPatients}</p>
          <span className="text-[11px] text-teal-700 font-medium">Under active care</span>
        </div>

<<<<<<< HEAD
        {/* Pending Approvals */}
        <div className="bg-white p-4 rounded-xl border border-amber-200/90 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-1.5">
            <span className="text-xs font-medium text-amber-800">Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700">{stats.pendingApprovals}</p>
          <span className="text-[11px] text-amber-600 font-medium">Awaiting evaluation</span>
=======
        {/* Pending Food Approvals */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-semibold text-amber-800">Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700">{stats.pendingApprovals}</p>
          <span className="text-[11px] text-amber-600 font-medium">Awaiting doctor review</span>
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
        </div>

        {/* Approved Foods */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
<<<<<<< HEAD
          <div className="flex items-center justify-between text-emerald-600 mb-1.5">
            <span className="text-xs font-medium text-emerald-800">Approved Foods</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{stats.approvedFoods}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Cleared for ordering</span>
=======
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-semibold text-emerald-800">Approved Foods</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{stats.approvedFoods}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Cleared for patients</span>
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
        </div>

        {/* Rejected Foods */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
<<<<<<< HEAD
          <div className="flex items-center justify-between text-red-500 mb-1.5">
            <span className="text-xs font-medium text-red-800">Contraindicated</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-black text-red-700">{stats.rejectedFoods}</p>
          <span className="text-[11px] text-red-600 font-medium">Excluded by physician</span>
        </div>

        {/* Allergy Alerts */}
        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-xl border border-red-200 shadow-2xs">
          <div className="flex items-center justify-between text-red-700 mb-1.5">
            <span className="text-xs font-medium text-red-800">Allergy Flags</span>
            <AlertOctagon className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-black text-red-700">{stats.allergyAlerts}</p>
          <span className="text-[11px] text-red-600 font-medium">Auto-detected conflicts</span>
        </div>
      </div>

      {/* Ward Roster Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search patients by name, code, room, or condition..."
            className="w-full sm:max-w-md"
          />
          <span className="text-xs text-slate-500 font-medium">
            Showing {filteredPatients.length} of {patients.length} admitted inpatients
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {filteredPatients.map((patient) => {
=======
          <div className="flex items-center justify-between text-red-500 mb-2">
            <span className="text-xs font-semibold text-red-800">Rejected Foods</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-black text-red-700">{stats.rejectedFoods}</p>
          <span className="text-[11px] text-red-600 font-medium">Contraindicated</span>
        </div>

        {/* Allergy Alerts */}
        <div className="col-span-2 sm:col-span-1 bg-red-50/80 p-4 rounded-xl border border-red-200 shadow-2xs">
          <div className="flex items-center justify-between text-red-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-red-800">Allergy Alerts</span>
            <AlertOctagon className="w-4 h-4 text-red-600 animate-pulse" />
          </div>
          <p className="text-2xl font-black text-red-700">{stats.allergyAlerts}</p>
          <span className="text-[11px] text-red-600 font-medium">Blocked allergen hazards</span>
        </div>
      </div>

      {/* Inpatient Ward Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Assigned Inpatient Ward Roster</h3>
          <span className="text-xs text-slate-500">{patients.length} patients admitted</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {patients.map((patient) => {
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
            const hasCriticalAllergy = patient.allergies.some(
              (a) => a.severity === 'severe' || a.severity === 'critical'
            );

            return (
              <div
                key={patient.id}
<<<<<<< HEAD
                className={`bg-white rounded-xl border p-4.5 transition-all hover:border-slate-300 shadow-2xs flex flex-col justify-between ${
                  hasCriticalAllergy ? 'border-red-200 bg-red-50/10' : 'border-slate-200'
=======
                className={`bg-white rounded-xl border transition-all hover:shadow-md flex flex-col justify-between overflow-hidden p-4.5 ${
                  hasCriticalAllergy ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
<<<<<<< HEAD
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                          {patient.patientCode}
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">Room {patient.roomNumber}</span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">{patient.name}</h4>
=======
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                        {patient.patientCode} · Room {patient.roomNumber}
                      </span>
                      <h4 className="text-base font-bold text-slate-900">{patient.name}</h4>
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                      <span className="text-xs text-slate-500">
                        {patient.age} yrs · {patient.gender} · Admitted {patient.admissionDate}
                      </span>
                    </div>

<<<<<<< HEAD
                    <Badge variant={hasCriticalAllergy ? 'danger' : 'success'} size="sm">
                      {hasCriticalAllergy ? 'HIGH ALLERGY RISK' : 'NORMAL'}
                    </Badge>
                  </div>

                  {/* Diagnosed Conditions */}
                  <div className="space-y-2.5 mb-3.5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Active Conditions:
=======
                    <Badge variant={hasCriticalAllergy ? 'danger' : 'teal'}>
                      {hasCriticalAllergy ? 'HIGH ALLERGY RISK' : 'STABLE'}
                    </Badge>
                  </div>

                  {/* Diagnosed Diseases */}
                  <div className="space-y-2 mb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Diagnosed Conditions:
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {patient.diseases.map((d, i) => (
                          <span
                            key={i}
<<<<<<< HEAD
                            className="inline-block px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-medium border border-blue-200"
=======
                            className="inline-block px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-semibold border border-blue-200"
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Allergies */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
<<<<<<< HEAD
                        Diagnosed Allergies:
=======
                        Allergies:
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                      </span>
                      {patient.allergies.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">No food allergies recorded</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {patient.allergies.map((a, i) => (
                            <span
                              key={i}
<<<<<<< HEAD
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${
=======
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                                a.severity === 'severe' || a.severity === 'critical'
                                  ? 'bg-red-50 text-red-800 border-red-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
<<<<<<< HEAD
                              <AlertOctagon className="w-3 h-3 text-red-600 shrink-0" />
=======
                              <AlertOctagon className="w-3 h-3 text-red-600" />
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                              {a.allergyName} ({a.severity})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

<<<<<<< HEAD
                  {/* Clinical strategy */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-600 mb-4">
                    <span className="font-semibold text-slate-800 block text-[11px]">Dietary Strategy:</span>
                    <p className="line-clamp-2 mt-0.5 text-slate-600">
                      {patient.dietaryRestrictions.join(', ') || 'Standard Clinical Diet'}
                    </p>
=======
                  {/* Clinical note */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 mb-4">
                    <span className="font-semibold text-slate-800 block text-[11px]">Dietary Strategy:</span>
                    <p className="line-clamp-2 mt-0.5">{patient.dietaryRestrictions.join(', ') || 'General'}</p>
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                  </div>
                </div>

                {/* Card Action */}
                <Button
                  size="sm"
                  variant="primary"
                  className="w-full"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                  onClick={() => navigate(`/doctor/recommendations?patientId=${patient.id}`)}
                >
                  Verify &amp; Approve Meals
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
