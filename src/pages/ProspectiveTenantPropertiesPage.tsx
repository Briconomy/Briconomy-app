import React, { useState, useEffect } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import { propertiesApi, formatCurrency } from '../services/api.ts';
import { useLowBandwidthMode, useImageOptimization } from '../utils/bandwidth.ts';
import { useProspectiveTenant } from '../contexts/ProspectiveTenantContext.tsx';
import { useNavigate } from 'react-router-dom';

function ProspectiveTenantPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const { lowBandwidthMode } = useLowBandwidthMode();
  const { optimizeImage } = useImageOptimization();
  const { session, updateSearchPreferences, addViewedProperty, isActive } = useProspectiveTenant();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', label: 'Home', active: false },
    { path: '/browse-properties', label: 'Properties', active: true },
    { path: '/login', label: 'Login', active: false }
  ];

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [properties, searchTerm, selectedType, priceRange]);

  // Update search preferences in session when they change
  useEffect(() => {
    updateSearchPreferences({
      searchTerm,
      selectedType,
      priceRange
    });
  }, [searchTerm, selectedType, priceRange, updateSearchPreferences]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching properties from API...');
      const data = await propertiesApi.getAll();
      console.log('Properties data received:', data);
      setProperties(data);
      
      if (!Array.isArray(data)) {
        console.warn('Properties API did not return an array:', data);
        setError('Invalid data format received from server');
        setProperties([]);
      } else if (data.length === 0) {
        console.log('No properties found in the database');
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      const errorMessage = err.message || 'Failed to fetch properties';
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setError('Unable to connect to the server. Please check your internet connection.');
      } else if (errorMessage.includes('404')) {
        setError('Properties endpoint not found. Please contact support.');
      } else if (errorMessage.includes('500')) {
        setError('Server error occurred. Please try again later.');
      } else {
        setError(`Error loading properties: ${errorMessage}`);
      }
      
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProperties = () => {
    let filtered = [...properties];

    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(property => property.type === selectedType);
    }

    if (priceRange.min) {
      filtered = filtered.filter(property => {
        const estimatedRent = calculateEstimatedRent(property);
        return estimatedRent >= parseInt(priceRange.min);
      });
    }

    if (priceRange.max) {
      filtered = filtered.filter(property => {
        const estimatedRent = calculateEstimatedRent(property);
        return estimatedRent <= parseInt(priceRange.max);
      });
    }

    setFilteredProperties(filtered);
  };

  const calculateEstimatedRent = (property) => {
    const baseRent = property.type === 'apartment' ? 8000 : 
                    property.type === 'complex' ? 10000 : 12000;
    const occupancyMultiplier = property.occupiedUnits / property.totalUnits;
    return Math.round(baseRent * (1 + occupancyMultiplier * 0.5));
  };

  const getPropertyAvailability = (property) => {
    const availableUnits = property.totalUnits - property.occupiedUnits;
    return {
      available: availableUnits,
      total: property.totalUnits,
      percentage: Math.round((availableUnits / property.totalUnits) * 100)
    };
  };

  const handleViewDetails = (propertyId) => {
    // Track viewed property for prospective tenants
    if (propertyId) {
      addViewedProperty(propertyId);
    }
    globalThis.location.href = `/property/${propertyId}`;
  };

  const handleApplyNow = (propertyId) => {
    // If propertyId is missing or invalid, send the user to create account so they can register
    if (!propertyId || typeof propertyId !== 'string' || propertyId.trim() === '') {
      navigate('/create-account');
      return;
    }

    // If we have a valid id, go to the apply page
    globalThis.location.href = `/apply/${propertyId}`;
  };

  if (loading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showBackButton backLink="/" />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading properties...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container mobile-only">
        <TopNav showBackButton backLink="/" />
        <div className="main-content">
          <div className="error-state">
            <p>Error loading properties: {error}</p>
            <button type="button" onClick={fetchProperties} className="btn btn-primary">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton backLink="/" />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Available Properties</div>
          <div className="page-subtitle">Find your perfect home</div>
          <div className="prospective-tenant-indicator">
            <span className="indicator-badge"> Prospective Tenant Mode</span>
            <span className="indicator-text">Browse freely - No login required</span>
          </div>
        </div>

        <div className="search-filter-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <label>Property Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Types</option>
                <option value="apartment">Apartment</option>
                <option value="complex">Complex</option>
                <option value="house">House</option>
              </select>
            </div>

            <div className="price-range-filter">
              <label>Price Range (ZAR/month)</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="price-input"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="price-input"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="results-info">
          <span>{filteredProperties.length} properties found</span>
          {lowBandwidthMode && (
            <span className="low-bandwidth-indicator">Low bandwidth mode</span>
          )}
        </div>

        <div className="property-grid">
          {filteredProperties.map((property) => {
            const estimatedRent = calculateEstimatedRent(property);
            const availability = getPropertyAvailability(property);
            const imageUrl = optimizeImage(`/api/properties/${property._id}/image`, lowBandwidthMode);

            return (
              <div key={property._id} className="property-card">
                <div className="property-image-container">
                  <div className="property-image">
                    <img 
                      src={imageUrl} 
                      alt={property.name}
                      onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRTVFNUU5Ii8+CjxwYXRoIGQ9Ik0xMjUgNzVIMTc1VjEyNUgxMjVWNzVaTTE0MCA5MEgxNjBWMTBIMTQwVjkwWk0xNDAgMTBIMTYwVjExMEgxNDBWMTAwWk0xNDAgMTEwSDE2MFYxMjBIMTQwVjExMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iMTUwIiB5PSIxNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2Qjc2OEYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+UHJvcGVydHkgSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
                      }}
                    />
                  </div>
                  <div className={`availability-badge ${availability.available > 0 ? 'available' : 'unavailable'}`}>
                    {availability.available > 0 ? `${availability.available} available` : 'Fully occupied'}
                  </div>
                </div>
                
                <div className="property-info">
                  <div className="property-price">{formatCurrency(estimatedRent)}/month</div>
                  <div className="property-title">{property.name}</div>
                  <div className="property-location">{property.address}</div>
                  
                  <div className="property-details">
                    <span className="property-type">{property.type}</span>
                    <span className="property-units">{property.totalUnits} units</span>
                    <span className="occupancy-rate">{availability.percentage}% available</span>
                  </div>

                  <div className="property-description">
                    <p>{property.description}</p>
                  </div>

                  <div className="property-meta">
                    <span className="year-built">Built: {property.yearBuilt}</span>
                    {property.lastRenovation && (
                      <span className="last-renovation">Renovated: {property.lastRenovation}</span>
                    )}
                  </div>

                  <div className="property-amenities">
                    {property.amenities.slice(0, 4).map((amenity, index) => (
                      <span key={index} className="amenity-tag">
                        {amenity.replace('_', ' ')}
                      </span>
                    ))}
                    {property.amenities.length > 4 && (
                      <span className="amenity-tag">+{property.amenities.length - 4}</span>
                    )}
                  </div>

                  <div className="property-actions">
                    <button type="button"
                      onClick={() => handleViewDetails(property._id)}
                      className="btn btn-secondary btn-sm"
                    >
                      View Details
                    </button>
                    <button type="button"
                      onClick={() => handleApplyNow(property._id)}
                      className="btn btn-primary btn-sm"
                      disabled={availability.available === 0}
                    >
                      {availability.available > 0 ? 'Apply Now' : 'Unavailable'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProperties.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">House</div>
            <h3>No properties found</h3>
            {properties.length === 0 ? (
              <>
                <p>There are currently no properties available in the system.</p>
                <p>This could be because:</p>
                <ul style={{ textAlign: 'left', margin: '10px 0' }}>
                  <li>The database hasn't been set up with sample properties yet</li>
                  <li>All properties are currently occupied</li>
                  <li>There might be a connection issue</li>
                </ul>
                <p>Please check the browser console for more details or contact support.</p>
              </>
            ) : (
              <p>Try adjusting your search criteria or filters.</p>
            )}
            <button type="button"
              onClick={() => {
                setSearchTerm('');
                setSelectedType('all');
                setPriceRange({ min: '', max: '' });
                fetchProperties();
              }}
              className="btn btn-primary"
            >
              {properties.length === 0 ? 'Refresh Properties' : 'Clear Filters'}
            </button>
          </div>
        )}
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default ProspectiveTenantPropertiesPage;
