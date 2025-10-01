import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import { propertiesApi, unitsApi, leasesApi, useApi } from '../services/api.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';

function CreateLeasePage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    tenantId: '',
    propertyId: '',
    unitId: '',
    startDate: '',
    endDate: '',
    monthlyRent: '',
    deposit: '',
    terms: ''
  });

  const navItems = [
    { path: '/manager', label: 'Dashboard', active: false },
    { path: '/manager/properties', label: 'Properties' },
    { path: '/manager/leases', label: 'Leases', active: true },
    { path: '/manager/payments', label: 'Payments' }
  ];

  // Fetch real data from database
  const { data: properties } = useApi(() => propertiesApi.getAll(), []);
  const { data: tenants } = useApi(() => 
    fetch('/api/users?userType=tenant').then(res => res.json()), []
  );
  const { data: units } = useApi(() => 
    formData.propertyId ? unitsApi.getAll(formData.propertyId) : Promise.resolve([]), 
    [formData.propertyId]
  );

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const leaseData = {
        tenantId: formData.tenantId,
        propertyId: formData.propertyId,
        unitId: formData.unitId,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        monthlyRent: Number(formData.monthlyRent),
        deposit: Number(formData.deposit),
        terms: formData.terms,
        status: 'active'
      };

      await leasesApi.create(leaseData);
      alert('Lease created successfully!');
      navigate('/manager/leases');
    } catch (error) {
      console.error('Error creating lease:', error);
      alert('Failed to create lease. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout showBackButton />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Create New Lease</div>
          <div className="page-subtitle">Set up a new lease agreement</div>
        </div>

        <form onSubmit={handleSubmit} className="lease-form">
          <div className="form-group">
            <label>Select Tenant</label>
            <select
              value={formData.tenantId}
              onChange={(e) => handleInputChange('tenantId', e.target.value)}
              required
            >
              <option value="">Choose Tenant</option>
              {tenants?.map(tenant => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Property</label>
            <select
              value={formData.propertyId}
              onChange={(e) => {
                handleInputChange('propertyId', e.target.value);
                handleInputChange('unitId', '');
              }}
              required
            >
              <option value="">Choose Property</option>
              {properties?.map(property => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select Unit</label>
            <select
              value={formData.unitId}
              onChange={(e) => handleInputChange('unitId', e.target.value)}
              required
              disabled={!formData.propertyId}
            >
              <option value="">Choose Unit</option>
              {units?.map(unit => (
                <option key={unit.id} value={unit.id}>
                  {unit.unitNumber}
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

          <div className="form-group">
            <label>Additional Terms</label>
            <textarea
              value={formData.terms}
              onChange={(e) => handleInputChange('terms', e.target.value)}
              placeholder="Enter any additional lease terms and conditions..."
              rows={3}
            />
          </div>

          <div className="form-actions">
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/manager/leases')}
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Lease'}
            </button>
          </div>
        </form>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default CreateLeasePage;
