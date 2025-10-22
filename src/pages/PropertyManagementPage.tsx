import { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import { propertiesApi } from '../services/api.ts';
import { useAuth } from '../contexts/AuthContext.tsx';

function PropertyManagementPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: 'apartment',
    totalUnits: '',
    amenities: []
  });

  const isMaintenanceView = location.pathname.includes('/maintenance');
  const isNewProperty = id === 'new';

  console.log('PropertyManagementPage - id:', id);
  console.log('PropertyManagementPage - isNewProperty:', isNewProperty);
  console.log('PropertyManagementPage - isMaintenanceView:', isMaintenanceView);
  console.log('PropertyManagementPage - pathname:', location.pathname);

  const navItems = [
    { path: '/manager', label: 'Dashboard', icon: 'performanceAnalytics' },
    { path: '/manager/properties', label: 'Properties', icon: 'properties', active: true },
    { path: '/manager/leases', label: 'Leases', icon: 'lease' },
    { path: '/manager/payments', label: 'Payments', icon: 'payment' }
  ];

  const handleSubmitProperty = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const totalUnits = parseInt(formData.totalUnits);
      const newProperty = {
        name: formData.name,
        address: formData.address,
        type: formData.type,
        totalUnits,
        occupiedUnits: 0,
        status: 'active',
        amenities: formData.amenities,
        managerId: user?.id || null,
        description: ''
      };
      
      await propertiesApi.create(newProperty);
      
      setFormData({ name: '', address: '', type: 'apartment', totalUnits: '', amenities: [] });
      
      navigate('/manager/properties');
    } catch (err) {
      console.error('Error creating property:', err);
      setError('Failed to create property. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAmenityToggle = (amenity) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const amenityOptions = ['pool', 'gym', 'parking', 'security', 'garden', 'playground', 'ocean_view', 'laundry'];

return (
    <div className="app-container mobile-only">
      <TopNav showLogout showBackButton />
      
      <div className="main-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>Error: {error}</p>
            <button type="button" onClick={() => navigate('/manager/properties')} className="btn btn-primary">
              Back to Properties
            </button>
          </div>
        ) : isMaintenanceView ? (
          <>
            <div className="page-header">
              <div className="page-title">Property Maintenance</div>
              <div className="page-subtitle">Maintenance requests for this property</div>
            </div>
            <div className="data-table">
              <p>Property-specific maintenance interface coming soon...</p>
              <button type="button" onClick={() => navigate('/manager/properties')} className="btn btn-primary">
                Back to Properties
              </button>
            </div>
          </>
        ) : isNewProperty ? (
          <>
            <div className="page-header">
              <div className="page-title">Add New Property</div>
              <div className="page-subtitle">Create a new property listing</div>
            </div>
            <div className="form-container">
              <form onSubmit={handleSubmitProperty} className="property-form">
                <div className="form-group">
                  <label>Property Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="e.g., Sunset Apartments"
                  />
                </div>
                
                <div className="form-group">
                  <label>Address *</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
                    placeholder="Full property address"
                  />
                </div>
                
                <div className="form-group">
                  <label>Property Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="apartment">Apartment</option>
                    <option value="complex">Complex</option>
                    <option value="house">House</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Total Units *</label>
                  <input
                    type="number"
                    value={formData.totalUnits}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalUnits: e.target.value }))}
                    required
                    min="1"
                    placeholder="Number of units"
                  />
                </div>
                
                <div className="form-group">
                  <label>Amenities</label>
                  <div className="amenities-grid">
                    {amenityOptions.map(amenity => (
                      <label key={amenity} className="amenity-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.amenities.includes(amenity)}
                          onChange={() => handleAmenityToggle(amenity)}
                        />
                        <span>{amenity.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="form-actions">
                  <button 
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/manager/properties')}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Property'}
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <>
            <div className="error-state">
              <p>Invalid route. Please return to properties.</p>
              <button type="button" onClick={() => navigate('/manager/properties')} className="btn btn-primary">
                Back to Properties
              </button>
            </div>
          </>
        )}
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default PropertyManagementPage;
