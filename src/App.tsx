import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import CreateAccountPage from './pages/CreateAccountPage.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import ManagerDashboard from './pages/ManagerDashboard.tsx';
import CaretakerDashboard from './pages/CaretakerDashboard.tsx';
import TenantDashboard from './pages/TenantDashboard.tsx';
import PropertiesPage from './pages/PropertiesPage.tsx';
import ManagerPropertiesPage from './pages/ManagerPropertiesPage.tsx';
import ProspectiveTenantPropertiesPage from './pages/ProspectiveTenantPropertiesPage.tsx';
import PropertyDetailsPage from './pages/PropertyDetailsPage.tsx';
import RentalApplicationPage from './pages/RentalApplicationPage.tsx';
import TenantPaymentsPage from './pages/TenantPaymentsPage.tsx';
import MaintenanceRequestsPage from './pages/MaintenanceRequestsPage.tsx';
import CaretakerTasksPage from './pages/CaretakerTasksPage.tsx';
import PropertyManagementPage from './pages/PropertyManagementPage.tsx';
import LeaseManagementPage from './pages/LeaseManagementPage.tsx';
import ManagerPaymentsPage from './pages/ManagerPaymentsPage.tsx';
import CommunicationPage from './pages/CommunicationPage.tsx';
import CreateLeasePage from './pages/CreateLeasePage.tsx';
import DocumentManagementPage from './pages/DocumentManagementPage.tsx';
import ReportingDashboardPage from './pages/ReportingDashboardPage.tsx';
import UserProfilePage from './pages/UserProfilePage.tsx';
import ApiTestPage from './pages/ApiTestPage.tsx';
import { ProtectedRoute, AdminRoute, ManagerRoute, CaretakerRoute, TenantRoute } from './components/ProtectedRoute.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ProspectiveTenantProvider } from './contexts/ProspectiveTenantContext.tsx';

function App() {
  return (
    <div className="app">
      <AuthProvider>
        <ProspectiveTenantProvider>
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
              <Route path="/browse-properties" element={<ProspectiveTenantPropertiesPage />} />
              <Route path="/manager/properties" element={<ManagerRoute><ManagerPropertiesPage /></ManagerRoute>} />
              <Route path="/manager/leases" element={<ManagerRoute><LeaseManagementPage /></ManagerRoute>} />
              <Route path="/manager/leases/new" element={<ManagerRoute><CreateLeasePage /></ManagerRoute>} />
              <Route path="/manager/payments" element={<ManagerRoute><ManagerPaymentsPage /></ManagerRoute>} />
              <Route path="/property/:id" element={<PropertyDetailsPage />} />
              <Route path="/apply/:id" element={<RentalApplicationPage />} />
              <Route path="/property/new" element={<ManagerRoute><PropertyManagementPage /></ManagerRoute>} />
              <Route path="/property/:id/edit" element={<ManagerRoute><PropertyManagementPage /></ManagerRoute>} />
              <Route path="/property/:id/units" element={<ManagerRoute><PropertyManagementPage /></ManagerRoute>} />
              <Route path="/property/:id/tenants" element={<ManagerRoute><PropertyManagementPage /></ManagerRoute>} />
              <Route path="/property/:id/maintenance" element={<ManagerRoute><PropertyManagementPage /></ManagerRoute>} />
              <Route path="/tenant/messages" element={<TenantRoute><CommunicationPage /></TenantRoute>} />
              <Route path="/manager/documents" element={<ManagerRoute><DocumentManagementPage /></ManagerRoute>} />
              <Route path="/manager/reports" element={<ManagerRoute><ReportingDashboardPage /></ManagerRoute>} />
              <Route path="/tenant/profile" element={<TenantRoute><UserProfilePage /></TenantRoute>} />
              <Route path="/admin/api-test" element={<AdminRoute><ApiTestPage /></AdminRoute>} />
              <Route path="/apply/undefined" element={<Navigate to="/create-account" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </ProspectiveTenantProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
