import React, { useState, useEffect } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import ManagerPropertyCard from '../components/ManagerPropertyCard.tsx';
import { propertiesApi, formatCurrency } from '../services/api.ts';
import { useLowBandwidthMode, useImageOptimization } from '../utils/bandwidth.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import { useProspectiveTenant } from '../contexts/ProspectiveTenantContext.tsx';

function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const { lowBandwidthMode } = useLowBandwidthMode();
  const { optimizeImage } = useImageOptimization();
  const { user } = useAuth();
  const { session, updateSearchPreferences, addViewedProperty, isActive } = useProspectiveTenant();

  const isManager = user?.userType === 'manager';
  const isTenant = user?.userType === 'tenant';

  const navItems = isManager ? [
    { path: '/manager', label: 'Dashboard', active: false },
    { path: '/properties', label: 'Properties', active: true },
    { path: '/manager/leases', label: 'Leases', active: false },
    { path: '/manager/payments', label: 'Payments', active: false }
  ] : [
    { path: '/', label: 'Home', active: false },
    { path: '/properties', label: 'Properties', active: true },
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
    if (!isManager && !isTenant) { // Only for prospective tenants
      updateSearchPreferences({
        searchTerm,
        selectedType,
        priceRange
      });
    }
  }, [searchTerm, selectedType, priceRange, isManager, isTenant, updateSearchPreferences]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching properties from API...');
      const data = await propertiesApi.getAll();
      console.log('Properties data received:', data);
      setProperties(data);
      
      // Debugging: Check if data is empty or invalid
      if (!Array.isArray(data)) {
        console.warn('Properties API did not return an array:', data);
        setError('Invalid data format received from server');
        setProperties([]);
      } else if (data.length === 0) {
        console.log('No properties found in the database');
        // Don't set error for empty array - this is a valid case
      }
    } catch (err) {
      console.error('Error fetching properties:', err);
      const errorMessage = err.message || 'Failed to fetch properties';
      
      // Provide more specific error messages
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
    if (!isManager && !isTenant && propertyId) {
      addViewedProperty(propertyId);
    }
    globalThis.location.href = `/property/${propertyId}`;
  };

  const handleManagerViewDetails = (propertyId) => {
    globalThis.location.href = `/property/${propertyId}`;
  };

  const handleApplyNow = (propertyId) => {
    if (!propertyId || propertyId === 'undefined' || propertyId.trim() === '') {
      alert('Unable to apply for this property. Please select a valid property.');
      return;
    }
    globalThis.location.href = `/apply/${propertyId}`;
  };

  const handleEditProperty = (propertyId) => {
    globalThis.location.href = `/property/${propertyId}/edit`;
  };

  const handleManageUnits = (propertyId) => {
    globalThis.location.href = `/property/${propertyId}/units`;
  };

  const handleViewTenants = (propertyId) => {
    globalThis.location.href = `/property/${propertyId}/tenants`;
  };

  const handleAddProperty = () => {
    globalThis.location.href = `/property/new`;
  };

if (loading) {
    return (
      <div className="app-container mobile-only">
  <TopNav showBackButton={true} backLink="/" />
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
  <TopNav showBackButton={true} backLink="/" />
        <div className="main-content">
          <div className="error-state">
            <p>Error loading properties: {error}</p>
            <button type="button" onClick={fetchProperties} className="btn btn-primary">Retry</button>
          </div>
        </div>
      </div>
    );
  }

// Manager View - Property Management Interface
  if (isManager) {
    const totalProperties = properties.length;
    const totalUnits = properties.reduce((sum, property) => sum + property.totalUnits, 0);
    const occupiedUnits = properties.reduce((sum, property) => sum + property.occupiedUnits, 0);
    const overallOccupancy = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
    const estimatedMonthlyRevenue = properties.reduce((sum, property) => {
      const baseRent = property.type === 'apartment' ? 8000 : 
                       property.type === 'complex' ? 10000 : 12000;
      return sum + (property.occupiedUnits * baseRent);
    }, 0);

    return (
      <div className="app-container mobile-only">
        <TopNav showBackButton={true} />
        
        <div className="main-content">
          <div className="page-header">
            <div className="page-title">Property Management</div>
            <div className="page-subtitle">Manage your property portfolio</div>
          </div>

          <div className="manager-overview-stats">
            <div className="stat-card">
              <div className="stat-value">{totalProperties}</div>
              <div className="stat-label">Total Properties</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{totalUnits}</div>
              <div className="stat-label">Total Units</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{occupiedUnits}</div>
              <div className="stat-label">Occupied Units</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{overallOccupancy}%</div>
              <div className="stat-label">Occupancy Rate</div>
            </div>
          </div>

          <div className="financial-overview">
            <div className="financial-card">
              <div className="financial-value">{formatCurrency(estimatedMonthlyRevenue)}</div>
              <div className="financial-label">Estimated Monthly Revenue</div>
            </div>
          </div>

          <div className="manager-actions">
            <button
              type="button"
              onClick={handleAddProperty}
              className="btn btn-primary btn-large"
            >
              Add New Property
            </button>
          </div>

          <div className="manager-search-section">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search your properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="results-info">
            <span>{filteredProperties.length} properties found</span>
            {lowBandwidthMode && (
              <span className="low-bandwidth-indicator">Low bandwidth mode</span>
            )}
          </div>

          <div className="manager-property-grid">
            {filteredProperties.map((property) => (
              <ManagerPropertyCard
                key={property._id}
                property={property}
                onViewDetails={handleManagerViewDetails}
                onEditProperty={handleEditProperty}
                onManageUnits={handleManageUnits}
                onViewTenants={handleViewTenants}
                lowBandwidthMode={lowBandwidthMode}
              />
            ))}
          </div>

          {filteredProperties.length === 0 && (
            <div className="no-results">
              <div className="no-results-icon">Building</div>
              <h3>No properties found</h3>
              {properties.length === 0 ? (
                <>
                  <p>You don't have any properties in your portfolio yet.</p>
                  <p>Get started by adding your first property to the system.</p>
                </>
              ) : (
                <p>Try adjusting your search criteria or add a new property.</p>
              )}
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="btn btn-secondary"
                  >
                    Clear Search
                  </button>
                )}
                <button
                  type="button"
                  onClick={fetchProperties}
                  className="btn btn-primary"
                >
                  {properties.length === 0 ? 'Refresh Properties' : 'Refresh Search'}
                </button>
                {properties.length === 0 && (
                  <button
                    type="button"
                    onClick={handleAddProperty}
                    className="btn btn-primary"
                  >
                    Add Property
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
        
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

// Tenant View - Current Rental Properties
  if (isTenant) {
    return (
      <div className="app-container mobile-only">
        <TopNav showBackButton={true} />
        
        <div className="main-content">
          <div className="page-header">
            <div className="page-title">My Rental Properties</div>
            <div className="page-subtitle">View your current rentals</div>
          </div>

          <div className="tenant-property-grid">
            {filteredProperties.map((property) => {
              const imageUrl = optimizeImage(`/api/properties/${property._id}/image`, lowBandwidthMode);
              
              return (
                <div key={property._id} className="tenant-property-card">
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
                  </div>
                  
                  <div className="property-info">
                    <div className="property-title">{property.name}</div>
                    <div className="property-location">{property.address}</div>
                    
                    <div className="property-actions">
                      <button type="button"
                        onClick={() => handleViewDetails(property._id)}
                        className="btn btn-primary btn-sm"
                      >
                        View Details
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
              <h3>No rental properties found</h3>
              <p>You don't have any active rental properties.</p>
            </div>
          )}
        </div>
        
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  // Public View - Prospective Tenant Property Search
  return (
    <div className="app-container mobile-only">
<TopNav showBackButton={true} backLink="/" />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Available Properties</div>
          <div className="page-subtitle">Find your perfect home</div>
          <div className="prospective-tenant-indicator">
            <span className="indicator-badge">Search - Prospective Tenant Mode</span>
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
                fetchProperties(); // Also refresh the data when clearing filters
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

export default PropertiesPage;
