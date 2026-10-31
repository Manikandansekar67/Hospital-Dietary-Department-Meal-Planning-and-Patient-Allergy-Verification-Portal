import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertOctagon, CheckCircle2, Clock, Filter, Search, Sparkles, XCircle } from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { SearchBar } from '../../components/common/NavigationControls';
import { EmptyState, LoadingState } from '../../components/common/StateFeedback';
import { StatusBadge } from '../../components/common/StatusBadge';
import { doctorService } from '../../services/doctorService';
import { FoodRecommendation } from '../../types';

export const DoctorApprovalsPage: React.FC = () => {
  const [recommendations, setRecommendations] = useState<FoodRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    setIsLoading(true);
    try {
      const data = await doctorService.getAllRecommendations();
      setRecommendations(data);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = recommendations.filter((r) => {
    const matchesSearch =
      r.food.name.toLowerCase().includes(search.toLowerCase()) ||
      r.food.category.toLowerCase().includes(search.toLowerCase()) ||
      (r.doctorApproval.doctorRemarks && r.doctorApproval.doctorRemarks.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || r.doctorApproval.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Clinical Approvals &amp; Evaluation Queue</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit history of physician food decisions, clinical justifications, and pending review requests.
          </p>
        </div>
        <Link to="/doctor/recommendations">
          <Button size="sm" leftIcon={<Sparkles className="w-4 h-4" />}>
            Recommend / Verify Foods
          </Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <SearchBar value={search} onChange={setSearch} placeholder="Search evaluated food or doctor remarks..." className="w-full sm:w-80" />
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'pending', 'approved', 'rejected'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st as any)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold uppercase transition-colors whitespace-nowrap ${
                statusFilter === st ? 'bg-teal-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Fetching clinical approvals ledger..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No approval records found"
          description="No clinical evaluations match your current criteria."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Food Details</th>
                  <th className="py-3 px-4 font-bold">Safety Status</th>
                  <th className="py-3 px-4 font-bold">Allergy Conflict Check</th>
                  <th className="py-3 px-4 font-bold">Doctor Decision</th>
                  <th className="py-3 px-4 font-bold">Doctor Remarks</th>
                  <th className="py-3 px-4 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <strong className="text-slate-900 block font-semibold">{r.food.name}</strong>
                      <span className="text-slate-400 text-[11px]">
                        {r.food.category} · Patient: {r.patientId}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge type="safety" value={r.safetyStatus} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      {r.allergyCheck.hasConflict ? (
                        <span className="inline-flex items-center gap-1 font-bold text-red-700">
                          <AlertOctagon className="w-3.5 h-3.5" />
                          Conflict ({r.allergyCheck.conflictingIngredients.join(', ')})
                        </span>
                      ) : (
<<<<<<< HEAD
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          No conflict
                        </span>
=======
                        <span className="text-emerald-700 font-semibold">✓ No conflict</span>
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge type="approval" value={r.doctorApproval.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-slate-600 italic max-w-xs">
                      {r.doctorApproval.doctorRemarks || '—'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Link to={`/doctor/recommendations?patientId=${r.patientId}`}>
                        <Button variant="outline" size="sm">
                          Review
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
