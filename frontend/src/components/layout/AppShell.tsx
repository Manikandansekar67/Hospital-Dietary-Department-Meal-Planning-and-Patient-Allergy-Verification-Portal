import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { ToastContainer } from '../common/ToastContainer';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const AppShell: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Compute a descriptive title from route
  const getPageTitle = (pathname: string) => {
    if (pathname.startsWith('/admin/users')) return 'System User Management';
    if (pathname.startsWith('/admin/patients')) return 'Inpatient Diet Roster';
    if (pathname.startsWith('/admin/foods') || pathname.startsWith('/kitchen/foods')) return 'Hospital Dietary Foods Catalog';
    if (pathname.startsWith('/admin/diseases')) return 'Medical Conditions & Disease Compatibility';
    if (pathname.startsWith('/admin/allergies')) return 'Clinical Allergen Directory';
    if (pathname.startsWith('/admin/reports')) return 'Dietary Audit & Nutrition Analytics';
    if (pathname === '/admin') return 'Dietary Department Executive Dashboard';

    if (pathname.startsWith('/doctor/recommendations')) return 'Patient Food Recommendations & Allergy Check';
    if (pathname.startsWith('/doctor/approvals')) return 'Clinical Dietary Approvals & Audit';
    if (pathname.startsWith('/doctor/add-food')) return 'Add & Verify Unlisted Hospital Food';
    if (pathname.startsWith('/doctor/conditions')) return 'Patient Clinical Dietary Assessment';
    if (pathname.startsWith('/doctor/patients')) return 'Assigned Inpatient Ward';
    if (pathname === '/doctor') return 'Physician & Clinical Nutritionist Dashboard';

    if (pathname.startsWith('/kitchen/availability')) return 'Daily Meal Availability Management';
    if (pathname.startsWith('/kitchen/orders')) return 'Dietary Kitchen Production Queue';
    if (pathname.startsWith('/kitchen/allergy-prep')) return 'Allergen Isolation & Prep Instructions';
    if (pathname === '/kitchen') return 'Hospital Central Kitchen Dashboard';

    if (pathname.startsWith('/patient/menu')) return 'Approved Dietary Meal Ordering';
    if (pathname.startsWith('/patient/orders')) return 'My Meal Orders & Real-Time Tracking';
    if (pathname.startsWith('/patient/feedback')) return 'Meal Quality Feedback';
    if (pathname === '/patient') return 'Inpatient Dietary Bedside Portal';

    return 'Hospital Dietary & Allergy Verification Portal';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} pageTitle={getPageTitle(location.pathname)} />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};
