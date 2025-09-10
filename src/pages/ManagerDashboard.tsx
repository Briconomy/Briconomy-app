import React from 'react';
import TopNav from "../components/TopNav.tsx";
import BottomNav from "../components/BottomNav.tsx";
import StatCard from "../components/StatCard.tsx";
import ActionCard from "../components/ActionCard.tsx";
import ChartCard from "../components/ChartCard.tsx";

function ManagerDashboard() {
  const navItems = [
    { path: '/manager', label: 'Dashboard', active: true },
    { path: '/manager/properties', label: 'Properties' },
    { path: '/manager/leases', label: 'Leases' },
    { path: '/manager/payments', label: 'Payments' }
  ];

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Property Manager</div>
          <div className="page-subtitle">Listings, leases & payments</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value="24" label="Listings" />
          <StatCard value="R180k" label="Revenue" />
          <StatCard value="89%" label="Occupancy" />
          <StatCard value="3" label="Issues" />
        </div>

        <ChartCard title="Property Locations">
          <div className="map-placeholder">Interactive Property Map</div>
        </ChartCard>

        <div className="quick-actions">
          <ActionCard
            to="/manager/properties"
            icon="P"
            title="Properties"
            description="Manage listings"
          />
          <ActionCard
            to="/manager/leases"
            icon="L" 
            title="Leases"
            description="Contracts"
          />
          <ActionCard
            onClick={() => {}}
            icon="M"
            title="Payments"
            description="Rent collection"
          />
          <ActionCard
            to="/manager/maintenance"
            icon="E"
            title="Issues" 
            description="Handle escalations"
          />
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default ManagerDashboard;