import { useState, useEffect } from 'react';
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
  const [loadingProperty, setLoadingProperty] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: 'apartment',
    totalUnits: '',
    description: '',
    amenities: []
  });

  const isMaintenanceView = location.pathname.includes('/maintenance');
  const isNewProperty = id === 'new' || !id;
  const isEditMode = id && id !== 'new' && !isMaintenanceView;

  useEffect(() => {
    if (isEditMode && id) {
      loadPropertyData(id);
    }
  }, [id, isEditMode]);

  const loadPropertyData = async (propertyId: string) => {
    try {
      setLoadingProperty(true);
      setError(null);
      const property = await propertiesApi.getById(propertyId);
      
      if (!property) {
        setError('Property not found');
        return;
      }

      if (property.managerId !== user?.id) {
        setError('You do not have permission to edit this property');
        return;
      }

      setFormData({
        name: property.name || '',
        address: property.address || '',
        type: property.type || 'apartment',
        totalUnits: property.totalUnits?.toString() || '',
        description: property.description || '',
        amenities: property.amenities || []
      });
    } catch (err) {
      console.error('Error loading property:', err);
      setError('Failed to load property data');
    } finally {
      setLoadingProperty(false);
    }
  };

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
      const propertyData = {
        name: formData.name,
        address: formData.address,
        type: formData.type,
        totalUnits,
        amenities: formData.amenities,
        description: formData.description
      };

      if (isEditMode && id) {
        await propertiesApi.update(id, propertyData);
      } else {
        const newProperty = {
          ...propertyData,
          occupiedUnits: 0,
          status: 'active',
          managerId: user?.id || null
        };
        await propertiesApi.create(newProperty);
      }
      
      navigate('/manager/properties');
    } catch (err) {
      console.error('Error saving property:', err);
      setError(isEditMode ? 'Failed to update property. Please try again.' : 'Failed to create property. Please try again.');
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
        {loadingProperty ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading property data...</p>
          </div>
        ) : loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Saving...</p>
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
        ) : isNewProperty || isEditMode ? (
          <>
            <div className="page-header">
              <div className="page-title">{isEditMode ? 'Edit Property' : 'Add New Property'}</div>
              <div className="page-subtitle">{isEditMode ? 'Update property details' : 'Create a new property listing'}</div>
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
                  <label>Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the property"
                    rows={3}
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
                    className="btn btn-secondary newProperty-cancel-btn"
                    onClick={() => navigate('/manager/properties')}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary newProperty-create-btn"
                    disabled={loading}
                  >
                    {loading ? (isEditMode ? 'Saving...' : 'Creating...') : (isEditMode ? 'Save Changes' : 'Create Property')}
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
