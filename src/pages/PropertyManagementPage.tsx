import { useState, useEffect } from 'react';
import { useNavigate as _useNavigate } from 'react-router-dom';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ActionCard from '../components/ActionCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import { propertiesApi, dashboardApi, formatCurrency as _formatCurrency } from '../services/api.ts';
import Icon from '../components/Icon.tsx';

function PropertyManagementPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState(null);

  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null); // eslint-disable-next-line
  const _selectedProperty = selectedProperty; // eslint-disable-next-line
  const _setSelectedProperty = setSelectedProperty;
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    type: 'apartment',
    totalUnits: '',
    amenities: []
  });

  const navItems = [
    { path: '/manager', label: 'Dashboard', icon: 'performanceAnalytics' },
    { path: '/manager/properties', label: 'Properties', icon: 'properties', active: true },
    { path: '/manager/leases', label: 'Leases', icon: 'lease' },
    { path: '/manager/payments', label: 'Payments', icon: 'payment' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [propertiesData, statsData] = await Promise.all([
        propertiesApi.getAll(),
        dashboardApi.getStats()
      ]);
      
      setProperties(propertiesData);
      setDashboardStats(statsData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalProperties = dashboardStats?.totalProperties || properties.length;
  const totalUnits = dashboardStats?.totalUnits || properties.reduce((sum, p) => sum + p.totalUnits, 0);
  const occupiedUnits = dashboardStats?.occupiedUnits || properties.reduce((sum, p) => sum + p.occupiedUnits, 0);
  const occupancyRate = dashboardStats?.occupancyRate || (totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0);
  const totalRevenue = dashboardStats?.totalRevenue || properties.reduce((sum, p) => sum + p.monthlyRevenue, 0);

  const handleSubmitProperty = async (e) => {
    e.preventDefault();
    try {
      const totalUnits = parseInt(formData.totalUnits);
      let monthlyRevenue = 0;
      if (!isNaN(totalUnits)) {
        if (formData.type === 'apartment') monthlyRevenue = totalUnits * 8000;
        else if (formData.type === 'complex') monthlyRevenue = totalUnits * 10000;
        else if (formData.type === 'house') monthlyRevenue = totalUnits * 12000;
      }
      const newProperty = {
        name: formData.name,
        address: formData.address,
        type: formData.type,
        totalUnits,
        occupiedUnits: 0,
        monthlyRevenue,
        status: 'active',
        amenities: formData.amenities
      };
      
      await propertiesApi.create(newProperty);
      setProperties(prev => [newProperty, ...prev]);
      setShowPropertyForm(false);
      setFormData({ name: '', address: '', type: 'apartment', totalUnits: '', amenities: [] });
      
      fetchData();
    } catch (error) {
      console.error('Error creating property:', error);
      alert('Failed to create property. Please try again.');
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
        <div className="page-header">
          <div className="page-title">Properties</div>
          <div className="page-subtitle">Manage your property portfolio</div>
        </div>
        
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading properties...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>Error loading data: {error}</p>
            <button type="button" onClick={fetchData} className="btn btn-primary">Retry</button>
          </div>
        ) : (
          <>
            <div className="dashboard-grid">
              <StatCard value={totalProperties.toString()} label="Properties" />
              <StatCard value={totalUnits.toString()} label="Total Units" />
              <StatCard value={`${occupancyRate}%`} label="Occupancy" />
              <StatCard value={`R${(totalRevenue / 1000).toFixed(0)}k`} label="Monthly Revenue" />
            </div>

            <div className="data-table">
              <div className="table-header">
                <div className="table-title">Property Portfolio</div>
                <button type="button"
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowPropertyForm(true)}
                >
                  Add Property
                </button>
              </div>
              
              {properties.map((property) => (
                <div key={property.id} className="list-item">
                  <div className="item-info">
                    <h4>{property.name}</h4>
                    <p className="text-sm text-gray-600">{property.address}</p>
                    <div className="property-meta">
                      <span className="text-xs text-gray-500">
                        {property.type} • {property.occupiedUnits}/{property.totalUnits} units
                      </span>
                      <span className="text-xs text-green-600">
                        {
                          (() => {
                            const rev = Number(property.monthlyRevenue);
                            if (isNaN(rev) || rev <= 0) return 'R0/month';
                            return `R${(rev / 1000).toFixed(0)}k/month`;
                          })()
                        }
                      </span>
                      <span className="text-xs text-gray-500">
                        {Math.round((property.occupiedUnits / property.totalUnits) * 100)}% occupied
                      </span>
                    </div>
                    <div className="amenities">
                      {property.amenities.slice(0, 3).map(amenity => (
                        <span key={amenity} className="amenity-tag">
                          {amenity.replace('_', ' ')}
                        </span>
                      ))}
                      {property.amenities.length > 3 && (
                        <span className="amenity-tag">+{property.amenities.length - 3} more</span>
                      )}
                    </div>
                  </div>
                  <div className="item-actions">
                    <span className="status-badge status-paid">Active</span>
                    <div className="property-actions">
                      <button type="button" className="btn btn-sm btn-secondary">View</button>
                      <button type="button" className="btn btn-sm btn-secondary">Edit</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <ChartCard title="Portfolio Overview">
              <div className="portfolio-stats">
                <div className="stat-item">
                  <div className="stat-value">{totalProperties}</div>
                  <div className="stat-label">Properties</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{totalUnits}</div>
                  <div className="stat-label">Total Units</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{occupiedUnits}</div>
                  <div className="stat-label">Occupied</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{totalUnits - occupiedUnits}</div>
                  <div className="stat-label">Vacant</div>
                </div>
              </div>
            </ChartCard>

            <div className="quick-actions">
              <ActionCard
                to="#"
                icon={<Icon name="unitManagement" alt="Unit Management" />}
                title="Unit Management"
                description="Manage individual units"
              />
              <ActionCard
                to="#"
                icon={<Icon name="propertyAnalytics" alt="Property Analytics" />}
                title="Property Analytics"
                description="View performance metrics"
              />
              <ActionCard
                to="#"
                icon={<Icon name="maintenanceOverview" alt="Maintenance Overview" />}
                title="Maintenance Overview"
                description="Track property maintenance"
              />
            </div>
          </>
        )}
      </div>
      
      {showPropertyForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add New Property</h3>
              <button type="button" className="close-btn" onClick={() => setShowPropertyForm(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmitProperty}>
                <div className="form-group">
                  <label>Property Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Property Type</label>
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
                  <label>Total Units</label>
                  <input
                    type="number"
                    value={formData.totalUnits}
                    onChange={(e) => setFormData(prev => ({ ...prev, totalUnits: e.target.value }))}
                    required
                    min="1"
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
                    onClick={() => setShowPropertyForm(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn btn-primary"
                  >
                    Add Property
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default PropertyManagementPage;
