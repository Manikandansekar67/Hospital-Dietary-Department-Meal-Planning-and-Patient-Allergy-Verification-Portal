import React, { useEffect, useState } from 'react';
import {
  AlertOctagon,
  Calendar,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Search,
  Star,
  XCircle,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { SearchBar } from '../../components/common/NavigationControls';
import { LoadingState } from '../../components/common/StateFeedback';
import { StatusBadge } from '../../components/common/StatusBadge';
import { adminService } from '../../services/adminService';
import { doctorService } from '../../services/doctorService';
import { orderService } from '../../services/orderService';
import { FoodRecommendation, Order } from '../../types';

export const ReportsPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [recommendations, setRecommendations] = useState<FoodRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'orders' | 'approvals' | 'allergies'>('orders');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [o, r] = await Promise.all([orderService.getOrders(), doctorService.getAllRecommendations()]);
      setOrders(o);
      setRecommendations(r);
    } finally {
      setIsLoading(false);
    }
  };

  const exportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    if (activeTab === 'orders') {
      csvContent += 'Order ID,Patient,Room,Food,Meal,Status,Order Time,Rating,Comment\n';
      orders.forEach((o) => {
        csvContent += `"${o.orderNumber}","${o.patientName}","${o.roomNumber}","${o.foodName}","${o.mealSession}","${o.status}","${o.orderTime}","${o.feedback?.rating || 'N/A'}","${o.feedback?.comment || ''}"\n`;
      });
    } else {
      csvContent += 'ID,Patient ID,Food,Safety Status,Doctor Decision,Doctor Remarks,Allergy Conflict\n';
      recommendations.forEach((r) => {
        csvContent += `"${r.id}","${r.patientId}","${r.food.name}","${r.safetyStatus}","${r.doctorApproval.status}","${r.doctorApproval.doctorRemarks || ''}","${r.allergyCheck.hasConflict}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hospital-dietary-report-${activeTab}-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Hospital Dietary Department Audit &amp; Reports</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable logs of physician verifications, allergen containment intercepts, meal dispatches, and patient satisfaction ratings.
          </p>
        </div>
        <Button size="sm" variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={exportCSV}>
          Export Audit (.CSV)
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`pb-3 text-xs font-semibold px-2 border-b-2 transition-colors ${
            activeTab === 'orders'
              ? 'border-teal-700 text-teal-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Meal Delivery Fulfillment Log ({orders.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('approvals')}
          className={`pb-3 text-xs font-semibold px-2 border-b-2 transition-colors ${
            activeTab === 'approvals'
              ? 'border-teal-700 text-teal-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Physician Diet Approvals Audit ({recommendations.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('allergies')}
          className={`pb-3 text-xs font-semibold px-2 border-b-2 transition-colors ${
            activeTab === 'allergies'
              ? 'border-red-600 text-red-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Critical Allergy Conflicts Intercepted (
          {recommendations.filter((r) => r.allergyCheck.hasConflict).length})
        </button>
      </div>

      {/* Search toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200">
        <SearchBar value={search} onChange={setSearch} placeholder="Filter audit records..." className="max-w-md" />
      </div>

      {isLoading ? (
        <LoadingState message="Generating verified audit ledger..." />
      ) : activeTab === 'orders' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Order ID</th>
                  <th className="py-3 px-4 font-bold">Inpatient</th>
                  <th className="py-3 px-4 font-bold">Meal &amp; Session</th>
                  <th className="py-3 px-4 font-bold">Fulfillment Status</th>
                  <th className="py-3 px-4 font-bold">Timestamp</th>
                  <th className="py-3 px-4 font-bold">Patient Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders
                  .filter(
                    (o) =>
                      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
                      o.patientName.toLowerCase().includes(search.toLowerCase()) ||
                      o.foodName.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-teal-800">{o.orderNumber}</td>
                      <td className="py-3 px-4">
                        <strong className="text-slate-900 block">{o.patientName}</strong>
                        <span className="text-slate-400 text-[11px]">{o.roomNumber}</span>
                      </td>
                      <td className="py-3 px-4">
                        <strong className="text-slate-800 block">{o.foodName}</strong>
                        <span className="text-slate-500 text-[11px]">{o.mealSession}</span>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge type="status" value={o.status} size="sm" />
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(o.orderTime).toLocaleDateString()} at{' '}
                        {new Date(o.orderTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-4">
                        {o.feedback ? (
                          <div className="flex items-center gap-1 text-amber-500 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{o.feedback.rating}/5</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">No feedback yet</span>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeTab === 'approvals' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Evaluated Food</th>
                  <th className="py-3 px-4 font-bold">Patient Key</th>
                  <th className="py-3 px-4 font-bold">Safety Classification</th>
                  <th className="py-3 px-4 font-bold">Physician Decision</th>
                  <th className="py-3 px-4 font-bold">Allergy Conflict Detected</th>
                  <th className="py-3 px-4 font-bold">Doctor Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recommendations
                  .filter((r) => r.food.name.toLowerCase().includes(search.toLowerCase()))
                  .map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{r.food.name}</td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{r.patientId}</td>
                      <td className="py-3 px-4">
                        <StatusBadge type="safety" value={r.safetyStatus} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge type="approval" value={r.doctorApproval.status} size="sm" />
                      </td>
                      <td className="py-3 px-4">
                        {r.allergyCheck.hasConflict ? (
                          <span className="inline-flex items-center gap-1 font-bold text-red-700">
                            <AlertOctagon className="w-3.5 h-3.5" />
                            Yes ({r.allergyCheck.conflictingIngredients.join(', ')})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            No conflict
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 italic">
                        {r.doctorApproval.doctorRemarks || '—'}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-900">
            <span className="font-bold block mb-1">Clinical Safety Guarantee</span>
            <span>
              All foods flagged below contain ingredients that directly match the patient's diagnosed allergies.
              In accordance with hospital dietary protocol, these foods are automatically contra-indicated.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations
              .filter((r) => r.allergyCheck.hasConflict)
              .map((r) => (
                <div key={r.id} className="bg-white p-4 rounded-xl border-2 border-red-300 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="font-extrabold text-sm text-red-950">{r.food.name}</h4>
                    <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase">
                      Intercepted
                    </span>
                  </div>
                  <div className="text-xs space-y-1">
                    <p className="text-slate-600">
                      <strong>Patient Code:</strong> {r.patientId}
                    </p>
                    <p className="text-red-800 font-semibold">
                      <strong>Diagnosed Allergen:</strong> {r.allergyCheck.allergenName} ({r.allergyCheck.severity})
                    </p>
                    <p className="text-red-800">
                      <strong>Conflicting Ingredient(s):</strong>{' '}
                      <span className="font-bold">{r.allergyCheck.conflictingIngredients.join(', ')}</span>
                    </p>
                  </div>
                  <div className="pt-2 border-t border-red-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Doctor Decision:</span>
                    <StatusBadge type="approval" value={r.doctorApproval.status} size="sm" />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
