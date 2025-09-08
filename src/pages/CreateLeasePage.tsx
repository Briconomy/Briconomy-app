import React, { useState } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';

function CreateLeasePage() {
  const [formData, setFormData] = useState({
    tenant: '',
    property: '',
    unit: '',
    startDate: '',
    endDate: '',
    monthlyRent: '',
    deposit: ''
  });

  const navItems = [
    { path: '/manager', label: 'Dashboard', active: false },
    { path: '/properties', label: 'Properties' },
    { path: '/manager/leases', label: 'Leases', active: true },
    { path: '/manager/payments', label: 'Payments' }
  ];

  const tenants = [
    { id: '1', name: 'John Tenant' },
    { id: '2', name: 'Jane Smith' },
    { id: '3', name: 'Mike Johnson' },
    { id: '4', name: 'Sarah Wilson' }
  ];

  const properties = [
    { id: '1', name: 'Blue Hills Apartments' },
    { id: '2', name: 'Green Valley Complex' },
    { id: '3', name: 'Sunset Towers' }
  ];

  const units = [
    { id: '2A', propertyId: '1', propertyName: 'Blue Hills Apartments' },
    { id: '3C', propertyId: '1', propertyName: 'Blue Hills Apartments' },
    { id: '1B', propertyId: '2', propertyName: 'Green Valley Complex' },
    { id: '4D', propertyId: '3', propertyName: 'Sunset Towers' }
  ];

  const filteredUnits = units.filter(unit => unit.propertyId === formData.property);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Creating lease with data:', formData);
    window.location.href = '/manager/leases';
  };

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout={true} />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Create New Lease</div>
          <div className="page-subtitle">Set up a new lease agreement</div>
        </div>

        <form onSubmit={handleSubmit} className="lease-form">
          <div className="form-group">
            <label>Select Tenant</label>
            <select
              value={formData.tenant}
              onChange={(e) => handleInputChange('tenant', e.target.value)}
              required
            >
              <option value="">Choose Tenant</option>
              {tenants.map(tenant => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Property</label>
            <select
              value={formData.property}
              onChange={(e) => {
                handleInputChange('property', e.target.value);
                handleInputChange('unit', '');
              }}
              required
            >
              <option value="">Choose Property</option>
              {properties.map(property => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Unit</label>
            <select
              value={formData.unit}
              onChange={(e) => handleInputChange('unit', e.target.value)}
              required
              disabled={!formData.property}
            >
              <option value="">Choose Unit</option>
              {filteredUnits.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.id} - {unit.propertyName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Monthly Rent (R)</label>
              <input
                type="number"
                value={formData.monthlyRent}
                onChange={(e) => handleInputChange('monthlyRent', e.target.value)}
                placeholder="0"
                required
              />
            </div>
            <div className="form-group">
              <label>Deposit (R)</label>
              <input
                type="number"
                value={formData.deposit}
                onChange={(e) => handleInputChange('deposit', e.target.value)}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={() => window.location.href = '/manager/leases'}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
            >
              Create Lease
            </button>
          </div>
        </form>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default CreateLeasePage;
