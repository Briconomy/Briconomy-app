import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import { propertiesApi, unitsApi, formatCurrency } from '../services/api.ts';
import { useLowBandwidthMode, useImageOptimization } from '../utils/bandwidth.ts';

function PropertyDetailsPage() {
  const { propertyId } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { lowBandwidthMode } = useLowBandwidthMode();
  const { optimizeImage } = useImageOptimization();

  const navItems = [
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
