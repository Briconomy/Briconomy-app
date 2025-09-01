import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.tsx';
import LoginPage from './pages/LoginPage.tsx';
import AdminDashboard from './pages/AdminDashboard.tsx';
import ManagerDashboard from './pages/ManagerDashboard.tsx';
import CaretakerDashboard from './pages/CaretakerDashboard.tsx';
import TenantDashboard from './pages/TenantDashboard.tsx';
import PropertiesPage from './pages/PropertiesPage.tsx';

function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/manager" element={<ManagerDashboard />} />
        <Route path="/caretaker" element={<CaretakerDashboard />} />
        <Route path="/tenant" element={<TenantDashboard />} />
        <Route path="/properties" element={<PropertiesPage />} />
      </Routes>
    </div>
  );
}

export default App;