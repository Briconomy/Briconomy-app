import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="app-container mobile-only">
      <div className="landing-header">
        <div className="landing-title">Briconomy</div>
        <div className="landing-subtitle">Property Management System</div>
        <div className="demo-notice">DEMO VERSION</div>
      </div>
      
      <div className="user-selector">
        <Link to="/login?type=admin" className="user-type">
          <h3>System Admin</h3>
          <p>System-wide management and oversight</p>
        </Link>
        
        <Link to="/login?type=manager" className="user-type">
          <h3>Property Manager</h3>
          <p>Manage listings, leases, and rent collection</p>
        </Link>
        
        <Link to="/login?type=caretaker" className="user-type">
          <h3>Caretaker</h3>
          <p>Handle maintenance tasks and repairs</p>
        </Link>
        
        <Link to="/login?type=tenant" className="user-type">
          <h3>Tenant</h3>
          <p>View rental info and submit requests</p>
        </Link>
      </div>
    </div>
  );
}

export default LandingPage;