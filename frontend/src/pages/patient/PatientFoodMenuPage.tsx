import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  AlertOctagon,
  Calendar,
  CheckCircle2,
  Clock,
  HeartPulse,
  Info,
  Power,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Utensils,
  XCircle,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { SearchBar } from '../../components/common/NavigationControls';
import { EmptyState, LoadingState } from '../../components/common/StateFeedback';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useAuth } from '../../store/AuthContext';
import { useKitchen } from '../../store/KitchenContext';
import { useNotifications } from '../../store/NotificationContext';
import { orderService } from '../../services/orderService';
import { patientService } from '../../services/patientService';
import { Food, MealSession, Patient } from '../../types';

export const PatientFoodMenuPage: React.FC = () => {
  const { user } = useAuth();
  const { kitchenStatus, currentSession } = useKitchen();
  const { addToast } = useNotifications();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [approvedFoods, setApprovedFoods] = useState<Food[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Selected food for order confirmation dialog
  const [orderingFood, setOrderingFood] = useState<Food | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  useEffect(() => {
    loadPatientMenu();
  }, [user]);

  const loadPatientMenu = async () => {
    setIsLoading(true);
    try {
      let p: Patient | null = null;
      if (user?.patientId) {
        p = (await patientService.getPatientById(user.patientId)) || null;
      }
      if (!p) {
        const all = await patientService.getPatients();
        p = all[0] || null;
      }
      setPatient(p);

      if (p) {
        // Enforce Section 22:
        // Only return foods that are Doctor Approved for this patient AND have No allergy conflict!
        const foods = await patientService.getApprovedFoodsForPatient(p.id);
        setApprovedFoods(foods);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenOrderConfirmation = (food: Food) => {
    setOrderingFood(food);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmOrder = async () => {
    if (!orderingFood || !patient) return;

    setIsSubmittingOrder(true);
    try {
      const order = await orderService.createOrder({
        patientId: patient.id,
        patientName: patient.name,
        roomNumber: patient.roomNumber,
        foodId: orderingFood.id,
        foodName: orderingFood.name,
        mealSession: currentSession,
        patientAllergies: patient.allergies,
        avoidIngredients: patient.allergies.map((a) => a.allergyName),
        preparationInstructions:
          patient.specialInstructions || 'Use sanitized separate cookware. Avoid cross-contact.',
      });

      setIsConfirmModalOpen(false);
      addToast({
        title: 'Order Placed Successfully',
        message: `Order #${order.orderNumber} for ${orderingFood.name} has been sent to the dietary kitchen!`,
        type: 'success',
      });

      navigate('/patient/orders');
    } catch (err: any) {
      addToast({
        title: 'Order Placement Blocked',
        message: err.message || 'Could not verify safety or kitchen status.',
        type: 'danger',
      });
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (isLoading || !patient) {
    return <LoadingState message="Checking clinical meal authorizations and live kitchen status..." />;
  }

  const filteredFoods = approvedFoods.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.ingredients.some((i) => i.toLowerCase().includes(search.toLowerCase())) ||
      f.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-900 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-teal-200 text-xs font-bold uppercase tracking-wider">Patient Bedside Ordering</span>
          <h2 className="text-xl sm:text-2xl font-black mt-1">Approved Dietary Meal Menu</h2>
          <p className="text-teal-100/90 text-xs sm:text-sm mt-1 max-w-2xl">
            This menu exclusively contains foods pre-screened for your diagnoses ({patient.diseases.join(', ')}),
            verified free of your allergens ({patient.allergies.map((a) => a.allergyName).join(', ') || 'None'}), and
            approved by your attending physician.
          </p>
        </div>
        <div className="text-right text-xs bg-white/10 p-3 rounded-xl border border-white/20 shrink-0">
          <span className="text-teal-200 block text-[10px] uppercase font-bold">Inpatient Station</span>
          <strong className="text-white text-sm">{patient.name}</strong>
          <span className="text-teal-100 block text-[11px]">Room {patient.roomNumber}</span>
        </div>
      </div>

      {/* Kitchen Inactive Notice (Section 22 requirement) */}
      {!kitchenStatus.isActive && (
        <div className="p-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
          <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-amber-900">
              Hospital Kitchen is Currently Closed
            </h4>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
              The central dietary kitchen is between preparation sessions. You may browse your approved
              meal list below, but ordering is temporarily disabled until the kitchen reopens.
              Please check with your nurse for next service time.
            </p>
          </div>
        </div>
      )}

      {/* Search Toolbar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search approved meals (e.g. Dosa, Khichdi, Oats)..."
          className="max-w-md"
        />
      </div>

      {/* Approved Food Cards Grid */}
      {filteredFoods.length === 0 ? (
        <EmptyState
          title="No approved foods currently available"
          description={
            search
              ? `No approved foods matched "${search}".`
              : 'Your physician has not yet approved meals for your current diagnosis, or conflicting items were blocked.'
          }
          icon={<Utensils className="w-8 h-8 text-teal-700" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFoods.map((food) => (
            <div
              key={food.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Food Image */}
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  <img
                    src={food.image}
                    alt={food.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 text-teal-800 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                    {food.category}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-base font-extrabold drop-shadow-xs">{food.name}</h3>
                    <span className="text-xs text-teal-100 font-medium">{food.nutrition.calories} kcal</span>
                  </div>
                </div>

                <div className="p-4 space-y-3 text-xs">
                  <p className="text-slate-600 leading-relaxed line-clamp-2">{food.description}</p>

                  {/* 3 Green Checks of Confidence */}
                  <div className="space-y-1.5 p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200 text-emerald-950 font-semibold text-[11px]">
                    <div className="flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Doctor Approved for {patient.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Allergy Free (No {patient.allergies.map((a) => a.allergyName).join(', ') || 'Allergens'})</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Disease Compatible with Diagnoses</span>
                    </div>
                  </div>

                  {/* Nutrition Strip */}
                  <div className="grid grid-cols-3 gap-1.5 text-center bg-slate-50 p-2 rounded-lg border border-slate-100 text-[10px]">
                    <div>
                      <span className="text-slate-400 block">Protein</span>
                      <strong className="text-slate-700">{food.nutrition.protein}g</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Carbs</span>
                      <strong className="text-slate-700">{food.nutrition.carbohydrates}g</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Sodium</span>
                      <strong className="text-slate-700">{food.nutrition.sodium}mg</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Button */}
              <div className="p-4 pt-0">
                <Button
                  size="sm"
                  variant="primary"
                  className="w-full"
                  disabled={!kitchenStatus.isActive}
                  onClick={() => handleOpenOrderConfirmation(food)}
                >
                  {kitchenStatus.isActive ? 'Order for Bedside Delivery' : 'Kitchen Closed'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Confirmation Dialog (Section 22 requirement) */}
      {orderingFood && (
        <Modal
          isOpen={isConfirmModalOpen}
          onClose={() => setIsConfirmModalOpen(false)}
          title="Confirm Meal Order"
          subtitle={`Bedside Delivery for ${patient.name} · Room ${patient.roomNumber}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            {/* Meal summary */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700 block">
                {orderingFood.category} Service
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-0.5">{orderingFood.name}</h3>
              <p className="text-slate-500 text-[11px] mt-1">{orderingFood.description}</p>
            </div>

            {/* Mandatory Safety Confirmation Checklist */}
            <div>
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2">
                Clinical Safety Verification Checks:
              </h4>

              <div className="space-y-2">
                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-emerald-950 text-xs">Doctor Approved for your medical chart</span>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-emerald-950 text-xs">
                    Allergy Safe: Scanned and free of {patient.allergies.map((a) => a.allergyName).join(', ') || 'allergens'}
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-emerald-950 text-xs">
                    Available Today for {currentSession} Service
                  </span>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold text-emerald-950 text-xs">Kitchen Active and accepting tickets</span>
                </div>
              </div>
            </div>

            <p className="text-slate-500 text-[11px] leading-relaxed italic">
              Once placed, the dietary kitchen will receive your order with allergen containment protocols and dispatch to your bedside.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsConfirmModalOpen(false)}
                disabled={isSubmittingOrder}
              >
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleConfirmOrder} isLoading={isSubmittingOrder}>
                Confirm Order
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
