import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.tsx';
import AdminAddUserPage from './pages/AdminAddUserPage.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import ManagerDashboard from './pages/ManagerDashboard.tsx';
import CaretakerDashboard from './pages/CaretakerDashboard.tsx';
import TenantDashboard from './pages/TenantDashboard.tsx';
import CaretakerSchedulePage from './pages/CaretakerSchedulePage.tsx';
import CaretakerHistoryPage from './pages/CaretakerHistoryPage.tsx';
import CaretakerProfilePage from './pages/CaretakerProfilePage.tsx';
import AdminUsersPage from './pages/AdminUsersPage.tsx';
import AdminSecurityPage from './pages/AdminSecurityPage.tsx';
import AdminOperationsPage from './pages/AdminOperationsPage.tsx';
import AdminReportsPage from './pages/AdminReportsPage.tsx';
import CaretakerMaintenancePage from './pages/CaretakerMaintenancePage.tsx';
import CaretakerReportsPage from './pages/CaretakerReportsPage.tsx';
import PropertiesPage from './pages/PropertiesPage.tsx';
import ManagerPropertiesPage from './pages/ManagerPropertiesPage.tsx';
import ProspectiveTenantPropertiesPage from './pages/ProspectiveTenantPropertiesPage.tsx';
import PropertyDetailsPage from './pages/PropertyDetailsPage.tsx';
import RentalApplicationPage from './pages/RentalApplicationPage.tsx';
import TenantPaymentsPage from './pages/TenantPaymentsPage.tsx';
import ManageTenantPaymentMethodPage from './pages/ManageTenantPaymentMethodPage.tsx';
import MaintenanceRequestsPage from './pages/MaintenanceRequestsPage.tsx';
import CaretakerTasksPage from './pages/CaretakerTasksPage.tsx';
import PropertyManagementPage from './pages/PropertyManagementPage.tsx';
import LeaseManagementPage from './pages/LeaseManagementPage.tsx';
import LeaseDetailsPage from './pages/LeaseDetailsPage.tsx';
import LeaseRenewalsPage from './pages/LeaseRenewalsPage.tsx';
import ManagerPaymentsPage from './pages/ManagerPaymentsPage.tsx';
import ManagerMaintenancePage from './pages/ManagerMaintenancePage.tsx';
import ManagerApplicationsPage from './pages/ManagerApplicationsPage.tsx';
import CommunicationPage from './pages/CommunicationPage.tsx';
import CreateLeasePage from './pages/CreateLeasePage.tsx';
import DocumentManagementPage from './pages/DocumentManagementPage.tsx';
import ReportingDashboardPage from './pages/ReportingDashboardPage.tsx';
import UserProfilePage from './pages/UserProfilePage.tsx';
import TenantProfileEditPage from './pages/TenantProfileEditPage.tsx';
import TenantDocumentsPage from './pages/TenantDocumentsPage.tsx';
import TenantActivityPage from './pages/TenantActivityPage.tsx';
import AccessLogsPage from './pages/AccessLogsPage.tsx';
import ApiTestPage from './pages/ApiTestPage.tsx';
import AddPaymentMethodPage from './pages/AddPaymentMethodPage.tsx';
import EditPaymentMethodPage from './pages/EditPaymentMethodPage.tsx';
import { AdminRoute, ManagerRoute, CaretakerRoute, TenantRoute } from './components/ProtectedRoute.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ProspectiveTenantProvider } from './contexts/ProspectiveTenantContext.tsx';
import { ToastProvider } from './contexts/ToastContext.tsx';
import ProspectiveTenantRegisterPage from './pages/ProspectiveTenantRegisterPage.tsx';
import PendingApprovalPage from './pages/PendingApprovalPage.tsx';
import AdminPendingUsersPage from './pages/AdminPendingUsersPage.tsx';

type RuntimeEnv = Record<string, string | undefined>;

function App() {
  const scopedGlobal = globalThis as typeof globalThis & { __BRICONOMY_ENV__?: RuntimeEnv };
  const runtimeEnv: RuntimeEnv = scopedGlobal.__BRICONOMY_ENV__ ?? {};
  const googleClientId = runtimeEnv.VITE_GOOGLE_CLIENT_ID || '471516393144-mb8903q4kvefqrl89na1ntevhq17t8h1.apps.googleusercontent.com';

  return (
    <div className="app">
      <ToastProvider>
        <AuthProvider>
          <ProspectiveTenantProvider>
            <GoogleOAuthProvider clientId={googleClientId}>
              <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/register" element={<ProspectiveTenantRegisterPage />} />
              <Route path="/pending-approval" element={<PendingApprovalPage />} />
              <Route path="/admin/add-user" element={<AdminRoute><AdminAddUserPage /></AdminRoute>} />
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
              <Route path="/admin/pending-users" element={<AdminRoute><AdminPendingUsersPage /></AdminRoute>} />
              <Route path="/admin/security" element={<AdminRoute><AdminSecurityPage /></AdminRoute>} />
              <Route path="/admin/operations" element={<AdminRoute><AdminOperationsPage /></AdminRoute>} />
              <Route path="/admin/reports" element={<AdminRoute><AdminReportsPage /></AdminRoute>} />
              <Route path="/admin/access-logs" element={<AdminRoute><AccessLogsPage /></AdminRoute>} />
              <Route path="/manager" element={<ManagerRoute><ManagerDashboard /></ManagerRoute>} />
              <Route path="/caretaker" element={<CaretakerRoute><CaretakerDashboard /></CaretakerRoute>} />
              <Route path="/tenant" element={<TenantRoute><TenantDashboard /></TenantRoute>} />
              <Route path="/tenant/payments" element={<TenantRoute><TenantPaymentsPage /></TenantRoute>} />
              <Route path="/tenant/manage-payment-methods" element={<TenantRoute><ManageTenantPaymentMethodPage /></TenantRoute>} />
              <Route path="/tenant/add-payment-method" element={<TenantRoute><AddPaymentMethodPage /></TenantRoute>} />
              <Route path="/tenant/edit-payment-method/:id" element={<TenantRoute><EditPaymentMethodPage /></TenantRoute>} />
              <Route path="/tenant/requests" element={<TenantRoute><MaintenanceRequestsPage /></TenantRoute>} />
              <Route path="/caretaker/tasks" element={<CaretakerRoute><CaretakerTasksPage /></CaretakerRoute>} />
              <Route path="/properties" element={<PropertiesPage />} />
              <Route path="/browse-properties" element={<ProspectiveTenantPropertiesPage />} />
              <Route path="/manager/properties" element={<ManagerRoute><ManagerPropertiesPage /></ManagerRoute>} />
              <Route path="/manager/applications" element={<ManagerRoute><ManagerApplicationsPage /></ManagerRoute>} />
              <Route path="/manager/leases" element={<ManagerRoute><LeaseManagementPage /></ManagerRoute>} />
              <Route path="/manager/leases/new" element={<ManagerRoute><CreateLeasePage /></ManagerRoute>} />
              <Route path="/manager/leases/:id" element={<ManagerRoute><LeaseDetailsPage /></ManagerRoute>} />
              <Route path="/manager/renewals" element={<ManagerRoute><LeaseRenewalsPage /></ManagerRoute>} />
              <Route path="/manager/payments" element={<ManagerRoute><ManagerPaymentsPage /></ManagerRoute>} />
              <Route path="/manager/maintenance" element={<ManagerRoute><ManagerMaintenancePage /></ManagerRoute>} />
              <Route path="/property/new" element={<ManagerRoute><PropertyManagementPage /></ManagerRoute>} />
              <Route path="/property/:id/edit" element={<ManagerRoute><PropertyManagementPage /></ManagerRoute>} />
              <Route path="/property/:id/maintenance" element={<ManagerRoute><PropertyManagementPage /></ManagerRoute>} />
              <Route path="/property/:id" element={<PropertyDetailsPage />} />
              <Route path="/apply/:id" element={<RentalApplicationPage />} />
              <Route path="/caretaker/schedule" element={<CaretakerRoute><CaretakerSchedulePage /></CaretakerRoute>} />
              <Route path="/caretaker/history" element={<CaretakerRoute><CaretakerHistoryPage /></CaretakerRoute>} />
              <Route path="/caretaker/profile" element={<CaretakerRoute><CaretakerProfilePage /></CaretakerRoute>} />
              <Route path="/caretaker/maintenance" element={<CaretakerRoute><CaretakerMaintenancePage /></CaretakerRoute>} />
              <Route path="/caretaker/reports" element={<CaretakerRoute><CaretakerReportsPage /></CaretakerRoute>} />
              <Route path="/tenant/messages" element={<TenantRoute><CommunicationPage /></TenantRoute>} />
              <Route path="/manager/documents" element={<ManagerRoute><DocumentManagementPage /></ManagerRoute>} />
              <Route path="/manager/reports" element={<ManagerRoute><ReportingDashboardPage /></ManagerRoute>} />
              <Route path="/manager/access-logs" element={<ManagerRoute><AccessLogsPage /></ManagerRoute>} />
              <Route path="/tenant/profile" element={<TenantRoute><UserProfilePage /></TenantRoute>} />
              <Route path="/tenant/profile/edit" element={<TenantRoute><TenantProfileEditPage /></TenantRoute>} />
              <Route path="/tenant/documents" element={<TenantRoute><TenantDocumentsPage /></TenantRoute>} />
              <Route path="/tenant/activity" element={<TenantRoute><TenantActivityPage /></TenantRoute>} />
              <Route path="/tenant/access-logs" element={<TenantRoute><AccessLogsPage /></TenantRoute>} />
              <Route path="/caretaker/access-logs" element={<CaretakerRoute><AccessLogsPage /></CaretakerRoute>} />
              <Route path="/tenant/profile/payment-methods" element={<TenantRoute><UserProfilePage /></TenantRoute>} />
              <Route path="/tenant/profile/documents" element={<TenantRoute><UserProfilePage /></TenantRoute>} />
              <Route path="/tenant/profile/help" element={<TenantRoute><UserProfilePage /></TenantRoute>} />
              <Route path="/tenant/profile/activity" element={<TenantRoute><UserProfilePage /></TenantRoute>} />
              <Route path="/admin/api-test" element={<AdminRoute><ApiTestPage /></AdminRoute>} />
              <Route path="/apply/undefined" element={<Navigate to="/create-account" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </GoogleOAuthProvider>
          </ProspectiveTenantProvider>
        </AuthProvider>
      </ToastProvider>
    </div>
  );
}

export default App;
