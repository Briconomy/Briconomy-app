import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import CreateAccountPage from './pages/CreateAccountPage.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import ManagerDashboard from './pages/ManagerDashboard.tsx';
import CaretakerDashboard from './pages/CaretakerDashboard.tsx';
import TenantDashboard from './pages/TenantDashboard.tsx';
import PropertiesPage from './pages/PropertiesPage.tsx';
import PropertyDetailsPage from './pages/PropertyDetailsPage.tsx';
import RentalApplicationPage from './pages/RentalApplicationPage.tsx';
import TenantPaymentsPage from './pages/TenantPaymentsPage.tsx';
import MaintenanceRequestsPage from './pages/MaintenanceRequestsPage.tsx';
import CaretakerTasksPage from './pages/CaretakerTasksPage.tsx';
import PropertyManagementPage from './pages/PropertyManagementPage.tsx';
import LeaseManagementPage from './pages/LeaseManagementPage.tsx';
import CommunicationPage from './pages/CommunicationPage.tsx';
import DocumentManagementPage from './pages/DocumentManagementPage.tsx';
import ReportingDashboardPage from './pages/ReportingDashboardPage.tsx';
import UserProfilePage from './pages/UserProfilePage.tsx';
import ApiTestPage from './pages/ApiTestPage.tsx';
import ManagerPaymentsPage from './pages/ManagerPaymentsPage.tsx';
import CreateLeasePage from './pages/CreateLeasePage.tsx';
import LeaseRenewalsPage from './pages/LeaseRenewalsPage.tsx';
import LeaseTerminationsPage from './pages/LeaseTerminationsPage.tsx';
import { AdminRoute, ManagerRoute, CaretakerRoute, TenantRoute } from './components/ProtectedRoute.tsx';

function App() {
  return (
    <div className="app">
      <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/create-account" element={<CreateAccountPage />} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/manager" element={<ManagerRoute><ManagerDashboard /></ManagerRoute>} />
          <Route path="/caretaker" element={<CaretakerRoute><CaretakerDashboard /></CaretakerRoute>} />
          <Route path="/tenant" element={<TenantRoute><TenantDashboard /></TenantRoute>} />
          <Route path="/tenant/payments" element={<TenantRoute><TenantPaymentsPage /></TenantRoute>} />
          <Route path="/tenant/requests" element={<TenantRoute><MaintenanceRequestsPage /></TenantRoute>} />
          <Route path="/caretaker/tasks" element={<CaretakerRoute><CaretakerTasksPage /></CaretakerRoute>} />
          <Route path="/properties" element={<PropertiesPage />} />
          <Route path="/property/:propertyId" element={<PropertyDetailsPage />} />
          <Route path="/apply/:propertyId" element={<RentalApplicationPage />} />
          <Route path="/manager/properties" element={<ManagerRoute><PropertyManagementPage /></ManagerRoute>} />
          <Route path="/manager/leases" element={<ManagerRoute><LeaseManagementPage /></ManagerRoute>} />
          <Route path="/manager/payments" element={<ManagerRoute><ManagerPaymentsPage /></ManagerRoute>} />
          <Route path="/manager/create-lease" element={<ManagerRoute><CreateLeasePage /></ManagerRoute>} />
          <Route path="/manager/renewals" element={<ManagerRoute><LeaseRenewalsPage /></ManagerRoute>} />
          <Route path="/manager/terminations" element={<ManagerRoute><LeaseTerminationsPage /></ManagerRoute>} />
          <Route path="/tenant/messages" element={<TenantRoute><CommunicationPage /></TenantRoute>} />
          <Route path="/manager/documents" element={<ManagerRoute><DocumentManagementPage /></ManagerRoute>} />
          <Route path="/manager/reports" element={<ManagerRoute><ReportingDashboardPage /></ManagerRoute>} />
          <Route path="/tenant/profile" element={<TenantRoute><UserProfilePage /></TenantRoute>} />
          <Route path="/admin/api-test" element={<AdminRoute><ApiTestPage /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </div>
  );
}

export default App;
