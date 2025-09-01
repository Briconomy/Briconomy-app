import React from 'react';
import TopNav from '../components/TopNav.tsx';

function PropertiesPage() {
  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton={true} backLink="/manager" />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Available Properties</div>
          <div className="page-subtitle">Browse & apply</div>
        </div>
        
        <div className="property-grid">
          <div className="property-card">
            <div className="property-image">Property Image</div>
            <div className="property-info">
              <div className="property-price">R12,500/month</div>
              <div className="property-title">Modern 2BR Apartment</div>
              <div className="property-details">Blue Hills • 2 bed • 2 bath • 85 sqm</div>
              <a href="#" className="btn btn-primary">View Details</a>
            </div>
          </div>
          
          <div className="property-card">
            <div className="property-image">Property Image</div>
            <div className="property-info">
              <div className="property-price">R9,800/month</div>
              <div className="property-title">Cozy 1BR Unit</div>
              <div className="property-details">Birchleigh • 1 bed • 1 bath • 55 sqm</div>
              <a href="#" className="btn btn-primary">View Details</a>
            </div>
          </div>
          
          <div className="property-card">
            <div className="property-image">Property Image</div>
            <div className="property-info">
              <div className="property-price">R15,200/month</div>
              <div className="property-title">Luxury 3BR Penthouse</div>
              <div className="property-details">Florida • 3 bed • 2 bath • 120 sqm</div>
              <a href="#" className="btn btn-primary">View Details</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertiesPage;