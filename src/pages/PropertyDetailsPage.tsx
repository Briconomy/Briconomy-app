import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import { propertiesApi, unitsApi, formatCurrency } from '../services/api.ts';
import { useLowBandwidthMode, useImageOptimization } from '../utils/bandwidth.ts';
import { useAuth } from '../contexts/AuthContext.tsx';

function PropertyDetailsPage() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<{
    name?: string;
    address?: string;
    type?: string;
    totalUnits?: number;
    description?: string;
    yearBuilt?: number;
    amenities?: string[];
  }>({});

  const { lowBandwidthMode } = useLowBandwidthMode();
  const { optimizeImage } = useImageOptimization();
  const { user } = useAuth();

  const isManager = user?.userType === 'manager';
  const isTenant = user?.userType === 'tenant';

  const navItems = isManager ? [
    { path: '/manager', label: 'Dashboard', active: false },
    { path: '/properties', label: 'Properties', active: true },
    { path: '/manager/leases', label: 'Leases', active: false },
    { path: '/manager/payments', label: 'Payments', active: false }
  ] : isTenant ? [
    { path: '/tenant', label: 'Dashboard', active: false },
    { path: '/properties', label: 'My Properties', active: true },
    { path: '/tenant/payments', label: 'Payments', active: false },
    { path: '/tenant/maintenance', label: 'Maintenance', active: false }
  ] : [
    { path: '/', label: 'Home', active: false },
    { path: '/properties', label: 'Properties', active: true },
    { path: '/login', label: 'Login', active: false }
  ];

  useEffect(() => {
    if (propertyId) {
      fetchPropertyDetails();
    }
  }, [propertyId]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [propertyData, unitsData] = await Promise.all([
        propertiesApi.getById(propertyId),
        unitsApi.getAll(propertyId)
      ]);
      
      setProperty(propertyData);
      setUnits(unitsData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching property details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyNow = () => {
    navigate(`/apply/${propertyId}`);
  };

  const handleBack = () => {
    navigate('/properties');
  };

  // Manager-specific handlers
  const handleEditProperty = () => {
    setEditing(true);
    setEditForm({
      name: property.name,
      address: property.address,
      type: property.type,
      totalUnits: property.totalUnits,
      description: property.description,
      yearBuilt: property.yearBuilt,
      amenities: property.amenities
    });
  };

  const handleSaveProperty = async () => {
    try {
      await propertiesApi.update(propertyId, editForm);
      setProperty({ ...property, ...editForm });
      setEditing(false);
    } catch (err) {
      console.error('Error updating property:', err);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setEditForm({});
  };

  const handleManageUnits = () => {
    navigate(`/property/${propertyId}/units`);
  };

  const handleViewTenants = () => {
    navigate(`/property/${propertyId}/tenants`);
  };

  const handleViewMaintenance = () => {
    navigate(`/property/${propertyId}/maintenance`);
  };

  const handleEditFormChange = (field, value) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getEstimatedRentRange = () => {
    if (!property) return { min: 0, max: 0 };
    
    const baseRent = property.type === 'apartment' ? 8000 : 
                    property.type === 'complex' ? 10000 : 12000;
    const occupancyMultiplier = property.occupiedUnits / property.totalUnits;
    const avgRent = Math.round(baseRent * (1 + occupancyMultiplier * 0.5));
    
    return {
      min: Math.round(avgRent * 0.8),
      max: Math.round(avgRent * 1.2)
    };
  };

  const getAvailableUnits = () => {
    return units.filter(unit => unit.status === 'available');
  };

  const getPropertyImages = () => {
    if (!property) return [];
    
    const images = [
      `/api/properties/${property._id}/image/main`,
      `/api/properties/${property._id}/image/interior1`,
      `/api/properties/${property._id}/image/interior2`,
      `/api/properties/${property._id}/image/exterior1`,
      `/api/properties/${property._id}/image/exterior2`
    ];
    
    return images.map(img => optimizeImage(img, lowBandwidthMode));
  };

  if (loading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showBackButton={true} backLink="/properties" />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading property details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container mobile-only">
        <TopNav showBackButton={true} backLink="/properties" />
        <div className="main-content">
          <div className="error-state">
            <p>Error loading property details: {error}</p>
            <button onClick={fetchPropertyDetails} className="btn btn-primary">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="app-container mobile-only">
        <TopNav showBackButton={true} backLink="/properties" />
        <div className="main-content">
          <div className="error-state">
            <p>Property not found</p>
            <button onClick={handleBack} className="btn btn-primary">Back to Properties</button>
          </div>
        </div>
      </div>
    );
  }

  const rentRange = getEstimatedRentRange();
  const availableUnits = getAvailableUnits();
  const propertyImages = getPropertyImages();
  const availability = {
    available: property.totalUnits - property.occupiedUnits,
    total: property.totalUnits,
    percentage: Math.round(((property.totalUnits - property.occupiedUnits) / property.totalUnits) * 100)
  };

  // Manager View - Property Management Interface
  if (isManager) {
    const estimatedMonthlyRevenue = property.occupiedUnits * (property.type === 'apartment' ? 8000 : 
                                 property.type === 'complex' ? 10000 : 12000);
    const occupancyRate = Math.round((property.occupiedUnits / property.totalUnits) * 100);

    return (
      <div className="app-container mobile-only">
        <TopNav showBackButton={true} backLink="/properties" />
        
        <div className="main-content">
          {editing ? (
            <div className="property-edit-form">
              <div className="page-header">
                <div className="page-title">Edit Property</div>
                <div className="page-subtitle">{property.name}</div>
              </div>

              <div className="form-section">
                <label>Property Name</label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => handleEditFormChange('name', e.target.value)}
                  className="form-input"
                />
              </div>

              <div className="form-section">
                <label>Address</label>
                <textarea
                  value={editForm.address || ''}
                  onChange={(e) => handleEditFormChange('address', e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="form-section">
                <label>Property Type</label>
                <select
                  value={editForm.type || ''}
                  onChange={(e) => handleEditFormChange('type', e.target.value)}
                  className="form-select"
                >
                  <option value="apartment">Apartment</option>
                  <option value="complex">Complex</option>
                  <option value="house">House</option>
                </select>
              </div>

              <div className="form-section">
                <label>Total Units</label>
                <input
                  type="number"
                  value={editForm.totalUnits || ''}
                  onChange={(e) => handleEditFormChange('totalUnits', parseInt(e.target.value))}
                  className="form-input"
                />
              </div>

              <div className="form-section">
                <label>Description</label>
                <textarea
                  value={editForm.description || ''}
                  onChange={(e) => handleEditFormChange('description', e.target.value)}
                  className="form-textarea"
                />
              </div>

              <div className="form-actions">
                <button onClick={handleCancelEdit} className="btn btn-secondary">
                  Cancel
                </button>
                <button onClick={handleSaveProperty} className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="property-details-header">
                <h1>{property.name}</h1>
                <p className="property-address">{property.address}</p>
                <div className="property-type-badge">{property.type}</div>
              </div>

              <div className="property-image-gallery">
                <div className="main-image-container">
                  <img 
                    src={propertyImages[selectedImageIndex]} 
                    alt={`${property.name} - Image ${selectedImageIndex + 1}`}
                    className="main-property-image"
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRTVFNUU5Ii8+CjxwYXRoIGQ9Ik0xNzUgMTEySDIyNVYxODJIMTc1VjExMlpNMTkwIDEzMkgyMFYxNDJIMTkwVjEzMlpNMTkwIDE0MkgyMFYxNTJIMTkwVjE0MlpNMTkwIDE1MkgyMFYxNjJIMTkwVjE1MloiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iMjAwIiB5PSIxOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2Qjc2OEYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiI+UHJvcGVydHkgSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
                    }}
                  />
                </div>
                <div className="thumbnail-grid">
                  {propertyImages.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${property.name} - Thumbnail ${index + 1}`}
                      className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                      onClick={() => setSelectedImageIndex(index)}
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="manager-financial-overview">
                <div className="financial-card">
                  <div className="financial-value">{formatCurrency(estimatedMonthlyRevenue)}</div>
                  <div className="financial-label">Estimated Monthly Revenue</div>
                </div>
                <div className="financial-card">
                  <div className="financial-value">{occupancyRate}%</div>
                  <div className="financial-label">Occupancy Rate</div>
                </div>
              </div>

              <div className="manager-actions">
                <button onClick={handleEditProperty} className="btn btn-primary">
                  Edit Property
                </button>
                <button onClick={handleManageUnits} className="btn btn-secondary">
                  Manage Units
                </button>
                <button onClick={handleViewTenants} className="btn btn-info">
                  View Tenants
                </button>
                <button onClick={handleViewMaintenance} className="btn btn-warning">
                  Maintenance
                </button>
              </div>

              <div className="property-overview-section">
                <h2>Property Overview</h2>
                <div className="overview-grid">
                  <div className="overview-item">
                    <span className="overview-label">Total Units</span>
                    <span className="overview-value">{property.totalUnits}</span>
                  </div>
                  <div className="overview-item">
                    <span className="overview-label">Occupied Units</span>
                    <span className="overview-value">{property.occupiedUnits}</span>
                  </div>
                  <div className="overview-item">
                    <span className="overview-label">Available Units</span>
                    <span className="overview-value">{availability.available}</span>
                  </div>
                  <div className="overview-item">
                    <span className="overview-label">Occupancy Rate</span>
                    <span className="overview-value">{occupancyRate}%</span>
                  </div>
                </div>
              </div>

              <div className="property-description-section">
                <h2>Description</h2>
                <p>{property.description}</p>
              </div>

              <div className="property-amenities-section">
                <h2>Amenities</h2>
                <div className="amenities-grid">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="amenity-item">
                      <span className="amenity-icon">✓</span>
                      <span className="amenity-name">{amenity.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {units.length > 0 && (
                <div className="manager-units-section">
                  <h2>Unit Management</h2>
                  <div className="units-summary">
                    <div className="summary-item occupied">
                      <span className="summary-count">{units.filter(u => u.status === 'occupied').length}</span>
                      <span className="summary-label">Occupied</span>
                    </div>
                    <div className="summary-item vacant">
                      <span className="summary-count">{units.filter(u => u.status === 'vacant').length}</span>
                      <span className="summary-label">Vacant</span>
                    </div>
                    <div className="summary-item maintenance">
                      <span className="summary-count">{units.filter(u => u.status === 'maintenance').length}</span>
                      <span className="summary-label">Maintenance</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="property-location-section">
                <h2>Location</h2>
                <div className="location-info">
                  <p className="address">{property.address}</p>
                  <div className="map-placeholder">
                    <div className="map-placeholder-content">
                      <span className="map-icon">📍</span>
                      <p>Interactive map coming soon</p>
                      <p className="map-subtitle">Google Maps integration will be available</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="property-actions-section">
                <div className="action-buttons">
                  <button onClick={handleBack} className="btn btn-secondary">
                    Back to Properties
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  // Tenant View - Their Rental Property Details
  if (isTenant) {
    return (
      <div className="app-container mobile-only">
        <TopNav showBackButton={true} backLink="/properties" />
        
        <div className="main-content">
          <div className="property-details-header">
            <h1>{property.name}</h1>
            <p className="property-address">{property.address}</p>
            <div className="property-type-badge">{property.type}</div>
          </div>

          <div className="property-image-gallery">
            <div className="main-image-container">
              <img 
                src={propertyImages[selectedImageIndex]} 
                alt={`${property.name} - Image ${selectedImageIndex + 1}`}
                className="main-property-image"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  const target = e.target as HTMLImageElement;
                  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRTVFNUU5Ii8+CjxwYXRoIGQ9Ik0xNzUgMTEySDIyNVYxODJIMTc1VjExMlpNMTkwIDEzMkgyMFYxNDJIMTkwVjEzMlpNMTkwIDE0MkgyMFYxNTJIMTkwVjE0MlpNMTkwIDE1MkgyMFYxNjJIMTkwVjE1MloiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iMjAwIiB5PSIxOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2Qjc2OEYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiI+UHJvcGVydHkgSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
                }}
              />
            </div>
            <div className="thumbnail-grid">
              {propertyImages.map((image, index) => (
                <img
                  key={index}
                  src={image}
                  alt={`${property.name} - Thumbnail ${index + 1}`}
                  className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                  onClick={() => setSelectedImageIndex(index)}
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              ))}
            </div>
          </div>

          <div className="tenant-property-info">
            <div className="info-section">
              <h2>My Rental Information</h2>
              <div className="rental-details">
                <div className="detail-item">
                  <span className="detail-label">Property</span>
                  <span className="detail-value">{property.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">{property.address}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Property Type</span>
                  <span className="detail-value">{property.type}</span>
                </div>
              </div>
            </div>

            <div className="info-section">
              <h2>Property Amenities</h2>
              <div className="amenities-grid">
                {property.amenities.map((amenity, index) => (
                  <div key={index} className="amenity-item">
                    <span className="amenity-icon">✓</span>
                    <span className="amenity-name">{amenity.replace('_', ' ')}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="property-actions-section">
              <div className="action-buttons">
                <button onClick={handleBack} className="btn btn-secondary">
                  Back to My Properties
                </button>
                <button 
                  onClick={() => navigate('/tenant/maintenance')}
                  className="btn btn-primary"
                >
                  Report Maintenance
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  // Public View - Prospective Tenant Property Details
  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton={true} backLink="/properties" />
      
      <div className="main-content">
        <div className="property-details-header">
          <h1>{property.name}</h1>
          <p className="property-address">{property.address}</p>
          <div className="property-type-badge">{property.type}</div>
        </div>

        <div className="property-image-gallery">
          <div className="main-image-container">
            <img 
              src={propertyImages[selectedImageIndex]} 
              alt={`${property.name} - Image ${selectedImageIndex + 1}`}
              className="main-property-image"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                const target = e.target as HTMLImageElement;
                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRTVFNUU5Ii8+CjxwYXRoIGQ9Ik0xNzUgMTEySDIyNVYxODJIMTc1VjExMlpNMTkwIDEzMkgyMFYxNDJIMTkwVjEzMlpNMTkwIDE0MkgyMFYxNTJIMTkwVjE0MlpNMTkwIDE1MkgyMFYxNjJIMTkwVjE1MloiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iMjAwIiB5PSIxOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2Qjc2OEYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiI+UHJvcGVydHkgSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
              }}
            />
          </div>
          <div className="thumbnail-grid">
            {propertyImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`${property.name} - Thumbnail ${index + 1}`}
                className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                onClick={() => setSelectedImageIndex(index)}
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ))}
          </div>
        </div>

        <div className="property-pricing-section">
          <div className="pricing-info">
            <div className="rent-range">
              <span className="price-label">Estimated Rent:</span>
              <span className="price-range">
                {formatCurrency(rentRange.min)} - {formatCurrency(rentRange.max)}/month
              </span>
            </div>
            <div className="availability-info">
              <span className={`availability-status ${availability.available > 0 ? 'available' : 'unavailable'}`}>
                {availability.available > 0 ? `${availability.available} units available` : 'Fully occupied'}
              </span>
              <span className="occupancy-percentage">
                {availability.percentage}% available
              </span>
            </div>
          </div>
          
          <button 
            onClick={handleApplyNow}
            className="btn btn-primary btn-large"
            disabled={availability.available === 0}
          >
            {availability.available > 0 ? 'Apply for Rental' : 'No Units Available'}
          </button>
        </div>

        <div className="property-overview-section">
          <h2>Property Overview</h2>
          <div className="overview-grid">
            <div className="overview-item">
              <span className="overview-label">Property Type</span>
              <span className="overview-value">{property.type}</span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Total Units</span>
              <span className="overview-value">{property.totalUnits}</span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Occupied Units</span>
              <span className="overview-value">{property.occupiedUnits}</span>
            </div>
            <div className="overview-item">
              <span className="overview-label">Occupancy Rate</span>
              <span className="overview-value">{Math.round((property.occupiedUnits / property.totalUnits) * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="property-amenities-section">
          <h2>Amenities</h2>
          <div className="amenities-grid">
            {property.amenities.map((amenity, index) => (
              <div key={index} className="amenity-item">
                <span className="amenity-icon">✓</span>
                <span className="amenity-name">{amenity.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {units.length > 0 && (
          <div className="available-units-section">
            <h2>Unit Details</h2>
            <div className="units-list">
              {units.map((unit, index) => (
                <div key={unit._id || index} className={`unit-card ${unit.status}`}>
                  <div className="unit-info">
                    <div className="unit-header">
                      <h4>Unit {unit.unitNumber}</h4>
                      <span className={`unit-status ${unit.status}`}>
                        {unit.status === 'occupied' ? 'Occupied' : 
                         unit.status === 'vacant' ? 'Vacant' : 
                         unit.status === 'maintenance' ? 'Maintenance' : 'Unknown'}
                      </span>
                    </div>
                    <div className="unit-details">
                      <span className="unit-specs">
                        {unit.bedrooms} bed • {unit.bathrooms} bath • {unit.sqft} sqm
                      </span>
                      <span className="unit-floor">Floor {unit.floor}</span>
                    </div>
                    <p className="unit-rent">{formatCurrency(unit.rent)}/month</p>
                    
                    {unit.features && unit.features.length > 0 && (
                      <div className="unit-features">
                        {unit.features.map((feature, idx) => (
                          <span key={idx} className="feature-tag">
                            {feature.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {unit.maintenanceNotes && (
                      <div className="maintenance-notes">
                        <strong>Maintenance:</strong> {unit.maintenanceNotes}
                      </div>
                    )}
                    
                    {unit.status === 'vacant' && (
                      <button 
                        onClick={() => navigate(`/apply/${propertyId}?unit=${unit._id || unit.unitNumber}`)}
                        className="btn btn-primary btn-sm"
                      >
                        Apply for Unit
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="property-location-section">
          <h2>Location</h2>
          <div className="location-info">
            <p className="address">{property.address}</p>
            <div className="map-placeholder">
              <div className="map-placeholder-content">
                <span className="map-icon">📍</span>
                <p>Interactive map coming soon</p>
                <p className="map-subtitle">Google Maps integration will be available</p>
              </div>
            </div>
          </div>
        </div>

        <div className="property-actions-section">
          <div className="action-buttons">
            <button onClick={handleBack} className="btn btn-secondary">
              Back to Properties
            </button>
            <button 
              onClick={handleApplyNow}
              className="btn btn-primary"
              disabled={availability.available === 0}
            >
              {availability.available > 0 ? 'Apply Now' : 'Join Waitlist'}
            </button>
          </div>
        </div>
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default PropertyDetailsPage;
