import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, HeartPulse, Plus, Search, Trash2, XCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { SearchBar } from '../../components/common/NavigationControls';
import { EmptyState, LoadingState } from '../../components/common/StateFeedback';
import { adminService } from '../../services/adminService';
import { Disease } from '../../types';

export const DiseaseManagement: React.FC = () => {
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [avoidFoodItems, setAvoidFoodItems] = useState('');
  const [recommendedFoodItems, setRecommendedFoodItems] = useState('');

  useEffect(() => {
    loadDiseases();
  }, []);

  const loadDiseases = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getDiseases();
      setDiseases(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const created = await adminService.addDisease({
      name,
      description,
      avoidFoodItems: avoidFoodItems.split(',').map((s) => s.trim()).filter(Boolean),
      recommendedFoodItems: recommendedFoodItems.split(',').map((s) => s.trim()).filter(Boolean),
    });
    setDiseases([...diseases, created]);
    setIsModalOpen(false);
    setName('');
    setDescription('');
    setAvoidFoodItems('');
    setRecommendedFoodItems('');
  };

  const filteredDiseases = diseases.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Medical Conditions &amp; Disease Profiles</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Rule-based dietary restrictions, recommended nutrients, and contraindicated ingredients.
          </p>
        </div>
        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
          Add Condition Rule
        </Button>
      </div>

      <div className="bg-white p-3 rounded-xl border border-slate-200">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search conditions (e.g. Diabetes, Hypertension)..."
          className="max-w-md"
        />
      </div>

      {isLoading ? (
        <LoadingState message="Loading clinical condition guidelines..." />
      ) : filteredDiseases.length === 0 ? (
        <EmptyState
          title="No conditions found"
          description="No medical condition records match your filter."
          action={{ label: 'Add Condition', onClick: () => setIsModalOpen(true) }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDiseases.map((d) => (
            <div key={d.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center shrink-0">
                  <HeartPulse className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 leading-tight">{d.name}</h4>
                  <span className="text-[10px] text-slate-400">Rule Profile #{d.id.slice(0, 6)}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{d.description}</p>

              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                    ✓ Recommended Diet Focus:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(d.recommendedFoodItems ?? d.compatibleCategories ?? []).map((item, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-800 block mb-1">
                    ✗ Contraindicated / Strictly Avoid:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {(d.avoidFoodItems ?? d.contraindications ?? []).map((item, i) => (
                      <span
                        key={i}
                        className="px-1.5 py-0.5 rounded bg-red-50 text-red-800 border border-red-200 text-[10px] font-medium"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
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
        title="Add Medical Condition Rule"
        subtitle="Configures automated recommendation and disease compatibility logic"
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Condition / Disease Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Celiac Disease"
            required
          />
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Clinical Rationale &amp; Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="e.g. Autoimmune reaction to dietary gluten causing intestinal villi damage."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5"
              required
            />
          </div>
          <Input
            label="Recommended Diet Items (Comma-Separated)"
            value={recommendedFoodItems}
            onChange={(e) => setRecommendedFoodItems(e.target.value)}
            placeholder="e.g. Millet, Rice, Corn, Quinoa, Fresh Vegetables"
          />
          <Input
            label="Contraindicated Ingredients to Avoid (Comma-Separated)"
            value={avoidFoodItems}
            onChange={(e) => setAvoidFoodItems(e.target.value)}
            placeholder="e.g. Wheat, Barley, Rye, Spelt, Semolina, Maida"
          />
          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Save Rule Profile
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
