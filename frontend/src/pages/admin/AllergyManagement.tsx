import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  Plus,
  Search,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
=======
import { AlertOctagon, AlertTriangle, Plus, Search, ShieldAlert } from 'lucide-react';
import { Button } from '../../components/common/Button';
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { SearchBar } from '../../components/common/NavigationControls';
import { EmptyState, LoadingState } from '../../components/common/StateFeedback';
import { adminService } from '../../services/adminService';
import { Allergy } from '../../types';

export const AllergyManagement: React.FC = () => {
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [commonIngredients, setCommonIngredients] = useState('');
  const [symptoms, setSymptoms] = useState('');

  useEffect(() => {
    loadAllergies();
  }, []);

  const loadAllergies = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAllergies();
      setAllergies(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await adminService.addAllergy({
      name,
      description,
      commonIngredients: commonIngredients.split(',').map((s) => s.trim()).filter(Boolean),
      symptoms,
    });
    setAllergies([...allergies, created]);
    setIsModalOpen(false);
    setName('');
    setDescription('');
    setCommonIngredients('');
    setSymptoms('');
  };

  const filteredAllergies = allergies.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.commonIngredients.some((i) => i.toLowerCase().includes(search.toLowerCase())) ||
<<<<<<< HEAD
      (a.symptoms && a.symptoms.toLowerCase().includes(search.toLowerCase()))
  );

  // Compute stats
  const totalDerivatives = allergies.reduce((acc, a) => acc + (a.commonIngredients?.length || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Clinical Safety Engine
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1.5">Master Allergen Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5 max-w-xl">
            Classified allergen database powering automated cross-contact detection and real-time food verification.
          </p>
        </div>

        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
          Register New Allergen
        </Button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Registered Allergens</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{allergies.length}</p>
          <span className="text-[11px] text-teal-700 font-medium">Standard WHO / FDA taxonomy</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Mapped Derivatives</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalDerivatives}</p>
          <span className="text-[11px] text-teal-700 font-medium">Triggering food ingredients</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Engine Protocol</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">100% Active</p>
          <span className="text-[11px] text-emerald-600 font-medium">Auto-verifies all doctor orders</span>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
=======
      a.symptoms.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Hospital Allergen Master Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Classified food allergens, known derivatives, clinical symptoms, and cross-contact matching rules.
          </p>
        </div>
        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
          Register Allergen
        </Button>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200">
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search allergens or triggering ingredients (e.g. Peanut, Shellfish, Gluten)..."
<<<<<<< HEAD
          className="w-full sm:max-w-md"
        />

        <span className="text-xs text-slate-500 shrink-0 font-medium">
          Showing {filteredAllergies.length} of {allergies.length} allergens
        </span>
      </div>

      {/* Allergen Cards Grid */}
      {isLoading ? (
        <LoadingState message="Scanning master allergen directory..." />
      ) : filteredAllergies.length === 0 ? (
        <EmptyState
          title="No allergens found"
          description={search ? `No allergens match "${search}"` : 'No registered allergens in system.'}
          action={{ label: 'Register Allergen', onClick: () => setIsModalOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5">
          {filteredAllergies.map((a) => (
            <div
              key={a.id}
              className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-red-50 text-red-700 flex items-center justify-center border border-red-200 shrink-0">
                      <AlertOctagon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">{a.name}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">ID: {a.id}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                    Allergen
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed">{a.description}</p>

                {/* Clinical Symptoms - ONLY show if non-empty */}
                {a.symptoms && a.symptoms.trim().length > 0 && (
                  <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs">
                    <span className="text-[10px] font-bold text-amber-900 uppercase block tracking-wider">
                      Clinical Presentation / Symptoms:
                    </span>
                    <p className="text-amber-800 text-[11px] font-medium mt-0.5 leading-snug">{a.symptoms}</p>
                  </div>
                )}

                {/* Triggering Ingredients */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                    Triggering Ingredients &amp; Derivatives:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {a.commonIngredients.map((item, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-700 border border-slate-200 text-[10px] font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
=======
          className="max-w-md"
        />
      </div>

      {isLoading ? (
        <LoadingState message="Scanning hospital allergen index..." />
      ) : filteredAllergies.length === 0 ? (
        <EmptyState
          title="No allergens found"
          description="No registered allergens match your query."
          action={{ label: 'Add Allergen', onClick: () => setIsModalOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAllergies.map((a) => (
            <div key={a.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center shrink-0">
                  <AlertOctagon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">{a.name}</h4>
                  <span className="text-[10px] text-slate-400">Allergen ID: {a.id}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{a.description}</p>

              <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200 text-xs">
                <span className="text-[10px] font-bold text-amber-900 uppercase block">Clinical Presentation / Symptoms:</span>
                <span className="text-amber-800 text-[11px] font-medium">{a.symptoms}</span>
              </div>

              <div className="pt-2 border-t border-slate-100 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Triggering Ingredients &amp; Derivatives:
                </span>
                <div className="flex flex-wrap gap-1">
                  {a.commonIngredients.map((item, i) => (
                    <span
                      key={i}
                      className="px-1.5 py-0.5 rounded bg-red-50 text-red-800 border border-red-200 text-[10px] font-semibold"
                    >
                      {item}
                    </span>
                  ))}
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Master Allergen &amp; Derivatives"
        subtitle="Used by the verification engine to catch ingredient conflicts"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Allergen Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Tree Nuts"
            required
          />
<<<<<<< HEAD

=======
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Clinical Classification &amp; Mechanism
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="e.g. IgE-mediated hypersensitivity to tree nut storage proteins."
<<<<<<< HEAD
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-teal-100 focus:border-teal-600 text-slate-800"
              required
            />
          </div>

=======
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5"
              required
            />
          </div>
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
          <Input
            label="Triggering Ingredients &amp; Derivatives (Comma-Separated)"
            value={commonIngredients}
            onChange={(e) => setCommonIngredients(e.target.value)}
            placeholder="e.g. Almond, Cashew, Walnut, Pistachio, Pecan, Hazelnut, Nut Butter"
            required
          />
<<<<<<< HEAD

=======
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
          <Input
            label="Reported Clinical Symptoms"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g. Urticaria, angioedema, respiratory distress, anaphylaxis"
            required
          />
<<<<<<< HEAD

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
=======
          <div className="flex items-center justify-end gap-2 pt-2">
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Allergen
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
