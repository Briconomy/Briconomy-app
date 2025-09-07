import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import CreateAccountPage from './pages/CreateAccountPage';
import AdminDashboard from './pages/AdminDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import CaretakerDashboard from './pages/CaretakerDashboard';
import TenantDashboard from './pages/TenantDashboard';
import PropertiesPage from './pages/PropertiesPage';
import TenantPaymentsPage from './pages/TenantPaymentsPage';
import MaintenanceRequestsPage from './pages/MaintenanceRequestsPage';
import CaretakerTasksPage from './pages/CaretakerTasksPage';
import PropertyManagementPage from './pages/PropertyManagementPage';
import LeaseManagementPage from './pages/LeaseManagementPage';
import CommunicationPage from './pages/CommunicationPage';
import DocumentManagementPage from './pages/DocumentManagementPage';
import ReportingDashboardPage from './pages/ReportingDashboardPage';
import UserProfilePage from './pages/UserProfilePage';
import ApiTestPage from './pages/ApiTestPage';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute, AdminRoute, ManagerRoute, CaretakerRoute, TenantRoute } from './components/ProtectedRoute';

function App() {
  return (
    <div className="app">
      <AuthProvider>
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
          <Route path="/properties" element={<ProtectedRoute><PropertyManagementPage /></ProtectedRoute>} />
          <Route path="/manager/leases" element={<ManagerRoute><LeaseManagementPage /></ManagerRoute>} />
          <Route path="/tenant/messages" element={<TenantRoute><CommunicationPage /></TenantRoute>} />
          <Route path="/manager/documents" element={<ManagerRoute><DocumentManagementPage /></ManagerRoute>} />
          <Route path="/manager/reports" element={<ManagerRoute><ReportingDashboardPage /></ManagerRoute>} />
          <Route path="/tenant/profile" element={<TenantRoute><UserProfilePage /></TenantRoute>} />
          <Route path="/admin/api-test" element={<AdminRoute><ApiTestPage /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;