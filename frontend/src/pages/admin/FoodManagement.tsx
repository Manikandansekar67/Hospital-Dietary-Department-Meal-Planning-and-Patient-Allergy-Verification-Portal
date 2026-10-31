import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Edit2,
  Eye,
  Plus,
  Power,
  Search,
  Sparkles,
  Utensils,
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
import { COMMON_DISEASES } from '../../constants';
import { foodService } from '../../services/foodService';
import { Food, MealCategory } from '../../types';

export const FoodManagement: React.FC = () => {
  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // View Details Modal
  const [viewingFood, setViewingFood] = useState<Food | null>(null);

  // Add / Edit Modal
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingFood, setEditingFood] = useState<Food | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MealCategory>('Lunch');
  const [description, setDescription] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [compatibleDiseases, setCompatibleDiseases] = useState<string[]>([]);
  const [incompatibleDiseases, setIncompatibleDiseases] = useState<string[]>([]);
  const [preparationInstructions, setPreparationInstructions] = useState('');

  // Nutrition Fields
  const [calories, setCalories] = useState('250');
  const [protein, setProtein] = useState('8');
  const [carbs, setCarbs] = useState('45');
  const [fat, setFat] = useState('4');
  const [fiber, setFiber] = useState('6');
  const [sodium, setSodium] = useState('120');
  const [sugar, setSugar] = useState('2');

  useEffect(() => {
    loadFoods();
  }, []);

  const loadFoods = async () => {
    setIsLoading(true);
    try {
      const data = await foodService.getFoods();
      setFoods(data);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditingFood(null);
    setName('');
    setCategory('Lunch');
    setDescription('');
    setIngredientsText('');
    setCompatibleDiseases(['Hypertension']);
    setIncompatibleDiseases([]);
    setPreparationInstructions('Cook thoroughly and keep covered until service.');
    setCalories('250');
    setProtein('8');
    setCarbs('45');
    setFat('4');
    setFiber('6');
    setSodium('120');
    setSugar('2');
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (f: Food) => {
    setEditingFood(f);
    setName(f.name);
    setCategory(f.category);
    setDescription(f.description);
    setIngredientsText(f.ingredients.join(', '));
    const compatList: any[] = Array.isArray(f.diseaseCompatibility)
      ? f.diseaseCompatibility
      : (f.compatibleDiseases || []).map((name) => ({ diseaseName: name, compatible: true }))
          .concat((f.contraindicatedDiseases || []).map((name) => ({ diseaseName: name, compatible: false })));
    setCompatibleDiseases(compatList.filter((d) => d.compatible).map((d) => d.diseaseName));
    setIncompatibleDiseases(compatList.filter((d) => !d.compatible).map((d) => d.diseaseName));
    setPreparationInstructions(f.preparationInstructions || '');
    setCalories(String(f.nutrition.calories));
    setProtein(String(f.nutrition.protein));
    setCarbs(String(f.nutrition.carbohydrates));
    setFat(String(f.nutrition.fat));
    setFiber(String(f.nutrition.fiber));
    setSodium(String(f.nutrition.sodium));
    setSugar(String(f.nutrition.sugar));
    setIsFormModalOpen(true);
  };

  const handleToggleActive = async (id: string) => {
    const updated = await foodService.toggleFoodStatus(id);
    setFoods((prev) => prev.map((f) => (f.id === id ? updated : f)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const ingredients = ingredientsText
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);

    const compatibility = [
      ...compatibleDiseases.map((d) => ({ diseaseName: d, compatible: true, notes: `Suitable for ${d}` })),
      ...incompatibleDiseases.map((d) => ({ diseaseName: d, compatible: false, notes: `Contraindicated for ${d}` })),
    ];

    const nutrition = {
      calories: parseFloat(calories) || 0,
      protein: parseFloat(protein) || 0,
      carbohydrates: parseFloat(carbs) || 0,
      fat: parseFloat(fat) || 0,
      fiber: parseFloat(fiber) || 0,
      sodium: parseFloat(sodium) || 0,
      sugar: parseFloat(sugar) || 0,
    };

    if (editingFood) {
      const updated = await foodService.updateFood(editingFood.id, {
        name,
        category,
        description,
        ingredients,
        diseaseCompatibility: compatibility,
        nutrition,
        preparationInstructions,
      });
      setFoods((prev) => prev.map((f) => (f.id === editingFood.id ? updated : f)));
    } else {
      const created = await foodService.addFood({
        name,
        category,
        description,
        ingredients,
        diseaseCompatibility: compatibility,
        nutrition,
        preparationInstructions,
        status: 'active',
        createdBy: 'Hospital Admin',
        createdByRole: 'admin',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
      });
      setFoods((prev) => [created, ...prev]);
    }

    setIsFormModalOpen(false);
  };

  const filteredFoods = foods.filter((f) => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.ingredients.some((i) => i.toLowerCase().includes(search.toLowerCase())) ||
      f.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || f.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Hospital Dietary Food Catalog</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Registered meals with verified ingredient listings, clinical disease contraindications, and nutrition facts.
          </p>
        </div>
        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={handleOpenAdd}>
          Register New Food
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by food name or ingredient..."
          className="w-full sm:w-72"
        />
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Beverage'].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                categoryFilter.toLowerCase() === cat.toLowerCase()
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table of Foods */}
      {isLoading ? (
        <LoadingState message="Loading hospital culinary catalog..." />
      ) : filteredFoods.length === 0 ? (
        <EmptyState
          title="No food records found"
          description="No foods match your search filter."
          action={{ label: 'Add Food Item', onClick: handleOpenAdd }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Food Details</th>
                  <th className="py-3 px-4 font-bold">Category</th>
                  <th className="py-3 px-4 font-bold">Key Ingredients</th>
                  <th className="py-3 px-4 font-bold">Disease Suitability</th>
                  <th className="py-3 px-4 font-bold">Status</th>
                  <th className="py-3 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFoods.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
<<<<<<< HEAD
                          src={f.image && f.image.trim() !== '' ? f.image : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                          alt={f.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
=======
                          src={f.image}
                          alt={f.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                        />
                        <div>
                          <strong className="text-slate-900 block font-semibold">{f.name}</strong>
                          <span className="text-slate-400 text-[11px]">
<<<<<<< HEAD
                            {f.nutrition?.calories ?? 250} kcal · Added by {f.createdBy || 'Hospital Dietary'}
=======
                            {f.nutrition.calories} kcal · Added by {f.createdBy}
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{f.category}</td>
                    <td className="py-3 px-4 max-w-xs">
                      <span className="text-slate-600 line-clamp-1">
<<<<<<< HEAD
                        {(f.ingredients || []).join(', ') || 'Wholesome ingredients'}
=======
                        {f.ingredients.join(', ')}
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
<<<<<<< HEAD
                        {(f.diseaseCompatibility || [])
                          .filter((d) => d && d.compatible)
                          .map((d, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200"
                            >
                              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                              {d.diseaseName}
                            </span>
                          ))}
=======
                        {(() => {
                          const dc = f.diseaseCompatibility;
                          let compatList: { diseaseName: string; compatible: boolean }[] = [];
                          if (Array.isArray(dc)) {
                            compatList = dc;
                          } else if (f.compatibleDiseases && f.compatibleDiseases.length > 0) {
                            compatList = (f.compatibleDiseases || []).map((name) => ({ diseaseName: name, compatible: true }));
                          }
                          const compatible = compatList.filter((d) => d.compatible);
                          if (compatible.length === 0) {
                            return <span className="text-slate-400 text-[10px]">—</span>;
                          }
                          return compatible.map((d, i) => (
                            <span
                              key={i}
                              className="inline-block px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-semibold border border-emerald-200"
                            >
                              ✓ {d.diseaseName}
                            </span>
                          ));
                        })()}
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                          f.status === 'active' ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${f.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                        {f.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingFood(f)}
                          className="p-1.5 rounded text-slate-500 hover:text-teal-700 hover:bg-slate-100"
                          title="View clinical details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(f)}
                          className="p-1.5 rounded text-slate-500 hover:text-teal-700 hover:bg-slate-100"
                          title="Edit food"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(f.id)}
                          className={`p-1.5 rounded ${
                            f.status === 'active'
                              ? 'text-slate-400 hover:text-red-600 hover:bg-red-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                          title={f.status === 'active' ? 'Deactivate food' : 'Activate food'}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View Food Modal */}
      {viewingFood && (
        <Modal
          isOpen={!!viewingFood}
          onClose={() => setViewingFood(null)}
          title={viewingFood.name}
          subtitle={`${viewingFood.category} · Master Food ID: ${viewingFood.id}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs">
            <div className="relative h-48 rounded-xl overflow-hidden bg-slate-100">
              <img
<<<<<<< HEAD
                src={viewingFood.image && viewingFood.image.trim() !== '' ? viewingFood.image : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80'}
                alt={viewingFood.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement;
                  const fallback = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80';
                  if (target.src !== fallback) {
                    target.src = fallback;
                  }
                }}
=======
                src={viewingFood.image}
                alt={viewingFood.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
              />
            </div>

            <p className="text-slate-700 leading-relaxed text-sm">{viewingFood.description}</p>

            {/* Nutrition Facts */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                Nutritional Profile (Per Serving)
              </span>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center">
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Calories</span>
                  <strong className="text-slate-800 text-sm">{viewingFood.nutrition.calories}</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Protein</span>
                  <strong className="text-slate-800 text-sm">{viewingFood.nutrition.protein}g</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Carbs</span>
                  <strong className="text-slate-800 text-sm">{viewingFood.nutrition.carbohydrates}g</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Fat</span>
                  <strong className="text-slate-800 text-sm">{viewingFood.nutrition.fat}g</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Fiber</span>
                  <strong className="text-slate-800 text-sm">{viewingFood.nutrition.fiber}g</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Sodium</span>
                  <strong className="text-slate-800 text-sm">{viewingFood.nutrition.sodium}mg</strong>
                </div>
                <div className="bg-white p-2 rounded-lg border border-slate-100">
                  <span className="text-slate-400 block text-[10px]">Sugar</span>
                  <strong className="text-slate-800 text-sm">{viewingFood.nutrition.sugar}g</strong>
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Full Ingredient Breakdown
              </span>
              <div className="flex flex-wrap gap-1.5">
<<<<<<< HEAD
                {(viewingFood.ingredients || []).map((ing, i) => (
=======
                {viewingFood.ingredients.map((ing, i) => (
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3
                  <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-md font-medium">
                    {ing}
                  </span>
                ))}
              </div>
            </div>

            {/* Prep instructions */}
            <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 block mb-0.5">
                Kitchen Preparation &amp; Cross-Contact Safeguards
              </span>
              <p className="text-slate-700">{viewingFood.preparationInstructions}</p>
            </div>

            <div className="flex justify-end pt-2">
              <Button size="sm" onClick={() => setViewingFood(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Add / Edit Food Modal */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={editingFood ? 'Edit Food Specifications' : 'Register New Hospital Food'}
        subtitle="Complete clinical nutrition, full ingredient disclosures, and disease compatibility"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <Input
                label="Food Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Steamed Vegetable Porridge"
                required
              />
            </div>
            <Select
              label="Meal Category"
              value={category}
              onChange={(e) => setCategory(e.target.value as MealCategory)}
              options={[
                { value: 'Breakfast', label: 'Breakfast' },
                { value: 'Lunch', label: 'Lunch' },
                { value: 'Dinner', label: 'Dinner' },
                { value: 'Snack', label: 'Snack' },
                { value: 'Beverage', label: 'Beverage' },
              ]}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Description &amp; Presentation
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Clinical overview and presentation notes..."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Ingredients (Comma-Separated) *Critical for Allergy Verification*
            </label>
            <textarea
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              rows={2}
              placeholder="e.g. Broken Wheat, Green Beans, Carrots, Turmeric, Cumin, Mustard Seeds, Water"
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5"
              required
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Every single constituent ingredient must be listed so the allergy verification engine can scan for allergens.
            </span>
          </div>

          {/* Disease Compatibility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <MultiSelect
              label="Compatible Medical Conditions (Safe)"
              options={COMMON_DISEASES.map((d) => (typeof d === 'string' ? { value: d, label: d } : { value: (d as any).name, label: (d as any).name }))}
              selectedValues={compatibleDiseases}
              onChange={setCompatibleDiseases}
              placeholder="Select safe conditions..."
            />
            <MultiSelect
              label="Incompatible Conditions (Contraindicated)"
              options={COMMON_DISEASES.map((d) => (typeof d === 'string' ? { value: d, label: d } : { value: (d as any).name, label: (d as any).name }))}
              selectedValues={incompatibleDiseases}
              onChange={setIncompatibleDiseases}
              placeholder="Select contraindicated conditions..."
            />
          </div>

          {/* Nutritional Profile */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-2">
              Nutritional Facts (Per Serving)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <Input
                label="Calories (kcal)"
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                required
              />
              <Input
                label="Protein (g)"
                type="number"
                step="0.1"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                required
              />
              <Input
                label="Carbs (g)"
                type="number"
                step="0.1"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                required
              />
              <Input
                label="Fat (g)"
                type="number"
                step="0.1"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                required
              />
              <Input
                label="Fiber (g)"
                type="number"
                step="0.1"
                value={fiber}
                onChange={(e) => setFiber(e.target.value)}
              />
              <Input
                label="Sodium (mg)"
                type="number"
                value={sodium}
                onChange={(e) => setSodium(e.target.value)}
                required
              />
              <Input
                label="Sugar (g)"
                type="number"
                step="0.1"
                value={sugar}
                onChange={(e) => setSugar(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Preparation Instructions &amp; Allergy Cross-Contact Safeguards
            </label>
            <input
              type="text"
              value={preparationInstructions}
              onChange={(e) => setPreparationInstructions(e.target.value)}
              placeholder="e.g. Prepare in sanitized steam kettle. Use dedicated allergen-free ladles."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsFormModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              {editingFood ? 'Save Modifications' : 'Register Food Item'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
