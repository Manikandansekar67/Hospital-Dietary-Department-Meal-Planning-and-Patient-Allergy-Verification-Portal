import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Clock,
  HeartPulse,
  Plus,
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
import { LoadingState } from '../../components/common/StateFeedback';
import { doctorService } from '../../services/doctorService';
import { patientService } from '../../services/patientService';
import { Patient } from '../../types';

export const DoctorDashboard: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
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

  if (isLoading) {
    return <LoadingState message="Loading assigned patient profiles and clinical safety queues..." />;
  }

  return (
    <div className="space-y-6">
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
          >
            <Plus className="w-3.5 h-3.5" />
            Add Unlisted Food
          </Link>
          <Link
            to="/doctor/recommendations"
            className="px-4 py-2 bg-white text-teal-900 hover:bg-teal-50 rounded-lg text-xs font-bold transition-colors shadow-xs whitespace-nowrap flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            Food Approvals
          </Link>
        </div>
      </div>

      {/* 5 Stats KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Assigned Patients */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold text-slate-600">Assigned Inpatients</span>
            <UserCheck className="w-4 h-4 text-teal-700" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats.assignedPatients}</p>
          <span className="text-[11px] text-teal-700 font-medium">Under active care</span>
        </div>

        {/* Pending Food Approvals */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-semibold text-amber-800">Pending Approvals</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700">{stats.pendingApprovals}</p>
          <span className="text-[11px] text-amber-600 font-medium">Awaiting doctor review</span>
        </div>

        {/* Approved Foods */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-semibold text-emerald-800">Approved Foods</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{stats.approvedFoods}</p>
          <span className="text-[11px] text-emerald-600 font-medium">Cleared for patients</span>
        </div>

        {/* Rejected Foods */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
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
            const hasCriticalAllergy = patient.allergies.some(
              (a) => a.severity === 'severe' || a.severity === 'critical'
            );

            return (
              <div
                key={patient.id}
                className={`bg-white rounded-xl border transition-all hover:shadow-md flex flex-col justify-between overflow-hidden p-4.5 ${
                  hasCriticalAllergy ? 'border-red-300 ring-1 ring-red-100' : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                        {patient.patientCode} · Room {patient.roomNumber}
                      </span>
                      <h4 className="text-base font-bold text-slate-900">{patient.name}</h4>
                      <span className="text-xs text-slate-500">
                        {patient.age} yrs · {patient.gender} · Admitted {patient.admissionDate}
                      </span>
                    </div>

                    <Badge variant={hasCriticalAllergy ? 'danger' : 'teal'}>
                      {hasCriticalAllergy ? 'HIGH ALLERGY RISK' : 'STABLE'}
                    </Badge>
                  </div>

                  {/* Diagnosed Diseases */}
                  <div className="space-y-2 mb-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Diagnosed Conditions:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {patient.diseases.map((d, i) => (
                          <span
                            key={i}
                            className="inline-block px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-semibold border border-blue-200"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Allergies */}
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                        Allergies:
                      </span>
                      {patient.allergies.length === 0 ? (
                        <span className="text-xs text-slate-400 italic">No food allergies recorded</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {patient.allergies.map((a, i) => (
                            <span
                              key={i}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                                a.severity === 'severe' || a.severity === 'critical'
                                  ? 'bg-red-50 text-red-800 border-red-300'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              <AlertOctagon className="w-3 h-3 text-red-600" />
                              {a.allergyName} ({a.severity})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Clinical note */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-600 mb-4">
                    <span className="font-semibold text-slate-800 block text-[11px]">Dietary Strategy:</span>
                    <p className="line-clamp-2 mt-0.5">{patient.dietaryRestrictions.join(', ') || 'General'}</p>
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
