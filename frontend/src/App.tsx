import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

// Providers
import { AuthProvider, useAuth } from './store/AuthContext';
import { KitchenProvider } from './store/KitchenContext';
import { NotificationProvider } from './store/NotificationContext';

// Layout & Guards
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
<<<<<<< HEAD
import { RegisterPage } from './pages/auth/RegisterPage';
=======
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AllergyManagement } from './pages/admin/AllergyManagement';
import { DiseaseManagement } from './pages/admin/DiseaseManagement';
import { FoodManagement } from './pages/admin/FoodManagement';
import { PatientManagement } from './pages/admin/PatientManagement';
import { ReportsPage } from './pages/admin/ReportsPage';
import { UserManagement } from './pages/admin/UserManagement';

// Doctor Pages
import { DoctorAddFoodPage } from './pages/doctor/DoctorAddFoodPage';
import { DoctorApprovalsPage } from './pages/doctor/DoctorApprovalsPage';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { FoodRecommendationPage } from './pages/doctor/FoodRecommendationPage';

// Kitchen Pages
import { DailyAvailabilityPage } from './pages/kitchen/DailyAvailabilityPage';
import { KitchenDashboard } from './pages/kitchen/KitchenDashboard';
import { KitchenOrdersPage } from './pages/kitchen/KitchenOrdersPage';
import { KitchenPrepAllergyScreen } from './pages/kitchen/KitchenPrepAllergyScreen';

// Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { PatientFoodMenuPage } from './pages/patient/PatientFoodMenuPage';
import { PatientOrderTrackingPage } from './pages/patient/PatientOrderTrackingPage';

/**
 * Role-based Root Redirector
 */
const RootRedirect: React.FC = () => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500">Loading portal...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (role) {
    case 'admin':
      return <Navigate to="/admin" replace />;
    case 'doctor':
      return <Navigate to="/doctor" replace />;
    case 'kitchen':
      return <Navigate to="/kitchen" replace />;
    case 'patient':
      return <Navigate to="/patient" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <KitchenProvider>
            <Routes>
<<<<<<< HEAD
              {/* Public Authentication Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
=======
              {/* Public Authentication Route */}
              <Route path="/login" element={<LoginPage />} />
>>>>>>> 0c7ae5e2eaa9e1ecd06819a349ca24027fce68f3

              {/* Protected App Layout */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppShell />
                  </ProtectedRoute>
                }
              >
                {/* Root Redirector */}
                <Route path="/" element={<RootRedirect />} />

                {/* ADMIN ROUTES */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/dashboard"
                  element={<Navigate to="/admin" replace />}
                />
                <Route
                  path="/admin/users"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <UserManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/patients"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                      <PatientManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/foods"
                  element={
                    <ProtectedRoute allowedRoles={['admin', 'kitchen']}>
                      <FoodManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/diseases"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <DiseaseManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/allergies"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AllergyManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin/reports"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ReportsPage />
                    </ProtectedRoute>
                  }
                />

                {/* DOCTOR ROUTES */}
                <Route
                  path="/doctor"
                  element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                      <DoctorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/dashboard"
                  element={<Navigate to="/doctor" replace />}
                />
                <Route
                  path="/doctor/patients"
                  element={
                    <ProtectedRoute allowedRoles={['doctor', 'admin']}>
                      <PatientManagement />
                    </ProtectedRoute>
                  }
                />

                <Route
                  path="/doctor/recommendations"
                  element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                      <FoodRecommendationPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/approvals"
                  element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                      <DoctorApprovalsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/doctor/add-food"
                  element={
                    <ProtectedRoute allowedRoles={['doctor']}>
                      <DoctorAddFoodPage />
                    </ProtectedRoute>
                  }
                />

                {/* KITCHEN ROUTES */}
                <Route
                  path="/kitchen"
                  element={
                    <ProtectedRoute allowedRoles={['kitchen']}>
                      <KitchenDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/kitchen/dashboard"
                  element={<Navigate to="/kitchen" replace />}
                />
                <Route
                  path="/kitchen/foods"
                  element={
                    <ProtectedRoute allowedRoles={['kitchen', 'admin']}>
                      <FoodManagement />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/kitchen/availability"
                  element={
                    <ProtectedRoute allowedRoles={['kitchen', 'admin']}>
                      <DailyAvailabilityPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/kitchen/orders"
                  element={
                    <ProtectedRoute allowedRoles={['kitchen']}>
                      <KitchenOrdersPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/kitchen/allergy-prep"
                  element={
                    <ProtectedRoute allowedRoles={['kitchen']}>
                      <KitchenPrepAllergyScreen />
                    </ProtectedRoute>
                  }
                />

                {/* PATIENT ROUTES */}
                <Route
                  path="/patient"
                  element={
                    <ProtectedRoute allowedRoles={['patient']}>
                      <PatientDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/dashboard"
                  element={<Navigate to="/patient" replace />}
                />
                <Route
                  path="/patient/menu"
                  element={
                    <ProtectedRoute allowedRoles={['patient']}>
                      <PatientFoodMenuPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/patient/orders"
                  element={
                    <ProtectedRoute allowedRoles={['patient']}>
                      <PatientOrderTrackingPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Fallback Catch-All */}
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </KitchenProvider>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
