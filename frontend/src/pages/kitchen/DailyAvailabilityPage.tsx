import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Plus,
  Power,
  Search,
  Sparkles,
  Utensils,
  XCircle,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { SearchBar } from '../../components/common/NavigationControls';
import { Select } from '../../components/common/Select';
import { EmptyState, LoadingState } from '../../components/common/StateFeedback';
import { MEAL_SESSION_TIMES } from '../../constants';
import { useNotifications } from '../../store/NotificationContext';
import { foodService } from '../../services/foodService';
import { kitchenService } from '../../services/kitchenService';
import { DailyFoodAvailability, Food, MealCategory, MealSession } from '../../types';

export const DailyAvailabilityPage: React.FC = () => {
  const [availabilities, setAvailabilities] = useState<DailyFoodAvailability[]>([]);
  const [foods, setFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mealSessionFilter, setMealSessionFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  // Add Availability Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFoodId, setSelectedFoodId] = useState('');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealSession, setMealSession] = useState<MealSession>('lunch');
  const [startTime, setStartTime] = useState(MEAL_SESSION_TIMES.lunch.start);
  const [endTime, setEndTime] = useState(MEAL_SESSION_TIMES.lunch.end);

  const { addToast } = useNotifications();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [avs, allFoods] = await Promise.all([
        kitchenService.getDailyAvailability(),
        foodService.getFoods(),
      ]);
      setAvailabilities(avs);
      setFoods(allFoods);
      if (allFoods.length > 0) {
        setSelectedFoodId(allFoods[0].id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMealSessionChange = (session: MealSession) => {
    setMealSession(session);
    setStartTime(MEAL_SESSION_TIMES[session]?.start || '07:00');
    setEndTime(MEAL_SESSION_TIMES[session]?.end || '10:00');
  };

  const handleToggleAvailable = async (id: string) => {
    const updated = await kitchenService.toggleFoodAvailability(id);
    setAvailabilities((prev) => prev.map((a) => (a.id === id ? updated : a)));
    addToast({
      title: updated.isAvailable ? 'Food Made Available' : 'Food Marked Out of Stock',
      message: `${updated.foodName} availability status updated for ${updated.mealSession || updated.mealType}.`,
      type: updated.isAvailable ? 'success' : 'warning',
    });
  };

  const handleAddAvailability = async (e: React.FormEvent) => {
    e.preventDefault();
    const food = foods.find((f) => f.id === selectedFoodId);
    if (!food) return;

    const created = await kitchenService.addFoodAvailability({
      foodId: food.id,
      foodName: food.name,
      foodCategory: food.category,
      date: targetDate,
      mealSession,
      startTime,
      endTime,
      isAvailable: true,
      maxPortions: 50,
      currentOrders: 0,
    });

    setAvailabilities([created, ...availabilities]);
    setIsModalOpen(false);
    addToast({
      title: 'Added to Daily Kitchen Menu',
      message: `${food.name} is now registered for ${mealSession} on ${targetDate}.`,
      type: 'success',
    });
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const filtered = availabilities.filter((a) => {
    const category = a.foodCategory || a.category || '';
    const session = a.mealSession || a.mealType || '';
    const matchesSearch =
      a.foodName.toLowerCase().includes(search.toLowerCase()) ||
      category.toLowerCase().includes(search.toLowerCase());
    const matchesSession =
      mealSessionFilter === 'all' || session.toLowerCase() === mealSessionFilter.toLowerCase();
    return matchesSearch && matchesSession;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Daily Kitchen Food Availability</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Controls which hospital recipes the kitchen is actively preparing. Inpatients can only order available items.
          </p>
        </div>
        <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setIsModalOpen(true)}>
          Add Meal to Daily Menu
        </Button>
      </div>

      {/* Date Policy Notice */}
      <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl flex items-center justify-between text-xs text-teal-900">
        <span className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-teal-700 shrink-0" />
          <span>
            Active Operating Date: <strong>{todayStr}</strong>. Yesterdays' scheduled meals are expired automatically by policy.
          </span>
        </span>
        <span className="text-[11px] font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-teal-200">
          Strict Date Gate Active
        </span>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <SearchBar value={search} onChange={setSearch} placeholder="Search scheduled menu items..." className="w-full sm:w-72" />

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['all', 'breakfast', 'lunch', 'dinner', 'snack'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setMealSessionFilter(s)}
              className={`text-xs px-3 py-1.5 rounded-lg font-semibold uppercase transition-colors whitespace-nowrap ${
                mealSessionFilter === s ? 'bg-teal-700 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingState message="Fetching kitchen production menu..." />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No food scheduled for this session"
          description="The kitchen has not enabled any foods for this meal session."
          action={{ label: 'Schedule Food', onClick: () => setIsModalOpen(true) }}
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-bold">Scheduled Food</th>
                  <th className="py-3 px-4 font-bold">Meal Session</th>
                  <th className="py-3 px-4 font-bold">Date Scheduled</th>
                  <th className="py-3 px-4 font-bold">Serving Window</th>
                  <th className="py-3 px-4 font-bold">Kitchen Status</th>
                  <th className="py-3 px-4 font-bold text-right">Quick Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const isPastDate = item.date < todayStr;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <strong className="text-slate-900 block font-semibold">{item.foodName}</strong>
                        <span className="text-slate-400 text-[11px]">{item.foodCategory}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="uppercase font-bold text-teal-800 text-[11px] bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                          {item.mealSession}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={isPastDate ? 'text-slate-400 line-through' : 'font-medium text-slate-800'}>
                          {item.date}
                        </span>
                        {isPastDate && (
                          <span className="text-[10px] text-red-600 block font-bold uppercase">Expired</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                        {item.startTime} – {item.endTime}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                            item.isAvailable && !isPastDate ? 'text-emerald-700' : 'text-slate-400'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              item.isAvailable && !isPastDate ? 'bg-emerald-500' : 'bg-slate-300'
                            }`}
                          />
                          {item.isAvailable && !isPastDate ? 'Available Now' : 'Out of Stock'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant={item.isAvailable ? 'outline' : 'primary'}
                          onClick={() => handleToggleAvailable(item.id)}
                        >
                          {item.isAvailable ? 'Mark Out of Stock' : 'Set In Stock'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Availability Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Food to Kitchen Daily Menu"
        subtitle="Makes this meal available for inpatient bedside ordering"
        maxWidth="md"
      >
        <form onSubmit={handleAddAvailability} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Select Food from Catalog
            </label>
            <select
              value={selectedFoodId}
              onChange={(e) => setSelectedFoodId(e.target.value)}
              className="w-full text-xs sm:text-sm rounded-lg border border-slate-300 p-2.5 bg-white font-semibold"
              required
            >
              {foods.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.category} · {f.nutrition.calories} kcal)
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Production Date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              required
            />
            <Select
              label="Meal Session"
              value={mealSession}
              onChange={(e) => handleMealSessionChange(e.target.value as MealSession)}
              options={[
                { value: 'breakfast', label: 'Breakfast (07:00 - 10:00)' },
                { value: 'lunch', label: 'Lunch (12:00 - 15:00)' },
                { value: 'snack', label: 'Snack (16:00 - 18:00)' },
                { value: 'dinner', label: 'Dinner (19:00 - 22:00)' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Service Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
            <Input
              label="Service End Time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              required
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm">
              Add to Daily Kitchen Menu
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
