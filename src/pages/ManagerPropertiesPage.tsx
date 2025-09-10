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
    { path: '/manager', label: 'Dashboard' },
    { path: '/manager/properties', label: 'Properties', active: true },
    { path: '/manager/leases', label: 'Leases' },
    { path: '/manager/payments', label: 'Payments' }
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
      const data = await propertiesApi.getAll();
      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Failed to fetch properties');
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

  const totalProperties = properties.length;
  const totalUnits = properties.reduce((sum, property) => sum + property.totalUnits, 0);
  const occupiedUnits = properties.reduce((sum, property) => sum + property.occupiedUnits, 0);
  const overallOccupancy = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  const estimatedMonthlyRevenue = properties.reduce((sum, property) => {
    const baseRent = property.type === 'apartment' ? 8000 : 
                     property.type === 'complex' ? 10000 : 12000;
    return sum + (property.occupiedUnits * baseRent);
  }, 0);

  if (loading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout={true} />
        <div className="main-content" style={{ padding: 16 }}>
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
        <TopNav showLogout={true} />
        <div className="main-content" style={{ padding: 16 }}>
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
      <TopNav showLogout={true} />

      <div className="main-content">
        <div className="page-header">
          <div className="page-title">Property Management</div>
          <div className="page-subtitle">Manage your property portfolio</div>
        </div>

        <div className="dashboard-grid">
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
          <div className="stat-card">
            <div className="stat-value">{formatCurrency(estimatedMonthlyRevenue)}</div>
            <div className="stat-label">Est. Monthly Revenue</div>
          </div>
        </div>

        <div className="manager-actions">
          <button type="button" onClick={handleAddProperty} className="btn btn-primary">
            + Add New Property
          </button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder="Search your properties..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
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
            <h3>No properties found</h3>
            <p>
              {properties.length === 0
                ? "You don't have any properties yet. Start by adding one."
                : "Try adjusting your search or add a new property."}
            </p>
            <button type="button" onClick={fetchProperties} className="btn btn-primary">
              Refresh
            </button>
            {properties.length === 0 && (
              <button type="button" onClick={handleAddProperty} className="btn btn-secondary">
                Add Property
              </button>
            )}
          </div>
        )}
      </div>

      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default ManagerPropertiesPage;
