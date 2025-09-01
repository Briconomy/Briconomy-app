import React from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import TaskChart from '../components/TaskChart.tsx';

function CaretakerDashboard() {
  const navItems = [
    { path: '/caretaker', label: 'Tasks', active: true },
    { path: '/caretaker/schedule', label: 'Schedule' },
    { path: '/caretaker/history', label: 'History' },
    { path: '/caretaker/profile', label: 'Profile' }
  ];

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Caretaker Tasks</div>
          <div className="page-subtitle">Maintenance & updates</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value="12" label="Assigned" />
          <StatCard value="8" label="Today" />
          <StatCard value="3" label="Priority" />
          <StatCard value="95%" label="Rate" />
        </div>

        <ChartCard title="Task Performance">
          <TaskChart />
        </ChartCard>

        <div className="data-table">
          <div className="table-header">
            <div className="table-title">Today's Tasks</div>
          </div>
          <div className="list-item">
            <div className="item-info">
              <h4>09:00 - Plumbing Unit 2A</h4>
              <p>Kitchen sink repair</p>
            </div>
            <span className="status-badge status-pending">Progress</span>
          </div>
          <div className="list-item">
            <div className="item-info">
              <h4>14:00 - Electrical Unit 5C</h4>
              <p>Outlet replacement</p>
            </div>
            <span className="status-badge status-pending">Scheduled</span>
          </div>
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default CaretakerDashboard;