import React, { useState, useEffect } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import ManagerPropertyCard from '../components/ManagerPropertyCard.tsx';
import { propertiesApi, formatCurrency } from '../services/api.ts';
import { useLowBandwidthMode } from '../utils/bandwidth.ts';
import { useAuth } from '../contexts/AuthContext.tsx';

function ManagerPropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredProperties, setFilteredProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const { lowBandwidthMode } = useLowBandwidthMode();
  const { user } = useAuth();

  const navItems = [
    { path: '/manager', label: 'Dashboard', active: false },
    { path: '/manager/properties', label: 'Properties', active: true },
    { path: '/manager/leases', label: 'Leases', active: false },
    { path: '/manager/payments', label: 'Payments', active: false }
  ];

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    filterProperties();
  }, [properties, searchTerm]);

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

    setFilteredProperties(filtered);
  };

  const handleViewDetails = (propertyId) => {
    globalThis.location.href = `/property/${propertyId}`;
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
        <TopNav showBackButton={false} />
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
        <TopNav showBackButton={false} />
        <div className="main-content">
          <div className="error-state">
            <p>Error loading properties: {error}</p>
            <button type="button" onClick={fetchProperties} className="btn btn-primary">Retry</button>
          </div>
        </div>
      </div>
    );
  }

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
      <TopNav showBackButton={false} />
      
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
              onViewDetails={handleViewDetails}
              onEditProperty={handleEditProperty}
              onManageUnits={handleManageUnits}
              onViewTenants={handleViewTenants}
              lowBandwidthMode={lowBandwidthMode}
            />
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="no-results">
            <div className="no-results-icon">🏢</div>
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

export default ManagerPropertiesPage;
