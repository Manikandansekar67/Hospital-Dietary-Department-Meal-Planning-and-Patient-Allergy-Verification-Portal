import React, { useEffect, useState } from 'react';
import { AlertOctagon, AlertTriangle, Plus, Search, ShieldAlert } from 'lucide-react';
import { Button } from '../../components/common/Button';
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
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search allergens or triggering ingredients (e.g. Peanut, Shellfish, Gluten)..."
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
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Clinical Classification &amp; Mechanism
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="e.g. IgE-mediated hypersensitivity to tree nut storage proteins."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5"
              required
            />
          </div>
          <Input
            label="Triggering Ingredients &amp; Derivatives (Comma-Separated)"
            value={commonIngredients}
            onChange={(e) => setCommonIngredients(e.target.value)}
            placeholder="e.g. Almond, Cashew, Walnut, Pistachio, Pecan, Hazelnut, Nut Butter"
            required
          />
          <Input
            label="Reported Clinical Symptoms"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g. Urticaria, angioedema, respiratory distress, anaphylaxis"
            required
          />
          <div className="flex items-center justify-end gap-2 pt-2">
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
