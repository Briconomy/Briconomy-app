import { useState, useEffect, SyntheticEvent } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import { propertiesApi, unitsApi, formatCurrency } from '../services/api.ts';
import { useLowBandwidthMode, useImageOptimization } from '../utils/bandwidth.ts';
import { useProspectiveTenant } from '../contexts/ProspectiveTenantContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';

type ProspectiveProperty = {
  id: string;
  name: string;
  address: string;
  type: string;
  totalUnits: number;
  occupiedUnits: number;
  rent?: number;
  description?: string;
  yearBuilt?: string | number;
  lastRenovation?: string | number;
  amenities: string[];
  [key: string]: unknown;
};

type PriceRange = {
  min: string;
  max: string;
};

type PropertyUnit = {
  status?: string;
  [key: string]: unknown;
};

function ProspectiveTenantPropertiesPage() {
  const [properties, setProperties] = useState<ProspectiveProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredProperties, setFilteredProperties] = useState<ProspectiveProperty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [priceRange, setPriceRange] = useState<PriceRange>({ min: '', max: '' });

  const { lowBandwidthMode } = useLowBandwidthMode();
  const { optimizeImage } = useImageOptimization();
  const { t } = useLanguage();
  const { session: _session, updateSearchPreferences, addViewedProperty, isActive: _isActive } = useProspectiveTenant();
  const navigate = useNavigate();
  const { user } = useAuth();

  const navItems = [
    { path: '/', label: t('nav.home'), icon: 'properties', active: false },
    { path: '/browse-properties', label: t('nav.properties'), icon: 'properties', active: true },
    { path: '/login', label: t('auth.login'), icon: 'profile', active: false }
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
      const data = await propertiesApi.getAll();
      if (!Array.isArray(data)) {
        setError('Invalid data format received from server');
        setProperties([]);
        setFilteredProperties([]);
        return;
      }

      const normalized: ProspectiveProperty[] = await Promise.all(data.map(async (item) => {
        if (!item || typeof item !== 'object') {
          return {
            id: crypto.randomUUID(),
            name: 'Property',
            address: '',
            type: 'apartment',
            totalUnits: 0,
            occupiedUnits: 0,
            amenities: [],
          } satisfies ProspectiveProperty;
        }

        const record = item as Record<string, unknown>;
        const id = typeof record.id === 'string'
          ? record.id
          : typeof record._id === 'string'
            ? record._id
            : crypto.randomUUID();
        const amenities = Array.isArray(record.amenities)
          ? record.amenities.filter((value): value is string => typeof value === 'string')
          : [];

        let occupiedUnits = 0;
        try {
          const units = await unitsApi.getAll(id);
          if (Array.isArray(units)) {
            const processedUnits = units.filter((unit): unit is PropertyUnit => typeof unit === 'object' && unit !== null);
            occupiedUnits = processedUnits.filter(unit => unit.status === 'occupied').length;
          } else {
            occupiedUnits = 0;
          }
        } catch {
          occupiedUnits = typeof record.occupiedUnits === 'number' ? record.occupiedUnits : 0;
        }

        return {
          id,
          name: typeof record.name === 'string' ? record.name : 'Property',
          address: typeof record.address === 'string' ? record.address : '',
          type: typeof record.type === 'string' ? record.type : 'apartment',
          totalUnits: typeof record.totalUnits === 'number' ? record.totalUnits : 0,
          occupiedUnits: occupiedUnits,
          rent: typeof record.rent === 'number' ? record.rent : undefined,
          description: typeof record.description === 'string' ? record.description : undefined,
          yearBuilt: typeof record.yearBuilt === 'number' || typeof record.yearBuilt === 'string' ? record.yearBuilt : undefined,
          lastRenovation: typeof record.lastRenovation === 'number' || typeof record.lastRenovation === 'string' ? record.lastRenovation : undefined,
          amenities,
        } satisfies ProspectiveProperty;
      }));

      setProperties(normalized);
      setFilteredProperties(normalized);
    } catch (err) {
      console.error('Error fetching properties:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch properties';

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
      setFilteredProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const filterProperties = () => {
    let filtered = [...properties];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(property =>
        property.name.toLowerCase().includes(term) ||
        property.address.toLowerCase().includes(term)
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(property => property.type === selectedType);
    }

    if (priceRange.min) {
      filtered = filtered.filter(property => {
        const estimatedRent = calculateEstimatedRent(property);
        return estimatedRent >= parseInt(priceRange.min, 10);
      });
    }

    if (priceRange.max) {
      filtered = filtered.filter(property => {
        const estimatedRent = calculateEstimatedRent(property);
        return estimatedRent <= parseInt(priceRange.max, 10);
      });
    }

    setFilteredProperties(filtered);
  };

  const calculateEstimatedRent = (property: ProspectiveProperty) => {
    const baseRent = property.type === 'apartment' ? 8000 : 
                    property.type === 'complex' ? 10000 : 12000;
    const totalUnits = property.totalUnits > 0 ? property.totalUnits : 1;
    const occupancyMultiplier = property.occupiedUnits / totalUnits;
    return Math.round(baseRent * (1 + occupancyMultiplier * 0.5));
  };

  const getPropertyAvailability = (property: ProspectiveProperty) => {
    const availableUnits = Math.max(property.totalUnits - property.occupiedUnits, 0);
    const totalUnits = property.totalUnits > 0 ? property.totalUnits : 1;
    return {
      available: availableUnits,
      total: totalUnits,
      percentage: Math.round((availableUnits / totalUnits) * 100)
    };
  };

  const handleViewDetails = (propertyId: string) => {
    // Track viewed property for prospective tenants
    if (propertyId) {
      addViewedProperty(propertyId);
    }
    globalThis.location.href = `/property/${propertyId}`;
  };

  const handleApplyNow = (propertyId: string) => {
    // If propertyId is missing or invalid, alert user
    if (!propertyId || propertyId.trim() === '') {
      alert('Unable to apply for this property. Please try again.');
      return;
    }

    // Get property name for registration
    const property = properties.find(p => p.id === propertyId);
    const propertyName = property?.name || 'Selected Property';

    // Check if user is logged in
    if (!user) {
      // Not logged in - redirect to registration with property info
      navigate('/register', { 
        state: { 
          propertyId: propertyId,
          propertyName: propertyName
        } 
      });
    } else {
      // Logged in - go to rental application
      navigate(`/apply/${propertyId}`);
    }
  };

  const getPropertyImage = (property: ProspectiveProperty) => {
    // Property-specific main images to match the detail page
    const propertyMainImages = {
      // Blue Hills Apartments - Modern Cape Town apartment building
      '67b2a1e0c9e4b8a3d4f5e6b1': 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=300&fit=crop&crop=entropy',

      // Green Valley Complex - Family-friendly Durban complex
      '67b2a1e0c9e4b8a3d4f5e6b2': 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400&h=300&fit=crop&crop=entropy',

      // Sunset Towers - Luxury Port Elizabeth beachfront
      '67b2a1e0c9e4b8a3d4f5e6b3': 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&h=300&fit=crop&crop=entropy'
    };
    
    // Get property-specific main image or fall back to placeholder
  const mainImage = propertyMainImages[property.id];
    
    if (mainImage) {
      return optimizeImage(mainImage, lowBandwidthMode);
    } else {
      // Fallback for any other properties
      const seed = parseInt(property.id.slice(-6), 16) || 123456;
      return optimizeImage(`https://picsum.photos/seed/${seed}/400/300`, lowBandwidthMode);
    }
  };

  if (loading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showBackButton backLink="/" />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{t('common.loading')}</p>
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
            <p>{t('common.error')}: {error}</p>
            <button type="button" onClick={fetchProperties} className="btn btn-primary">{t('common.refresh')}</button>
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
          <div className="page-title">{t('prospect.available_properties')}</div>
          <div className="page-subtitle">{t('prospect.find_perfect_home')}</div>
          <div className="prospective-tenant-indicator">
            <span className="indicator-badge">{t('prospect.tenant_mode')}</span>
            <span className="indicator-text">{t('prospect.browse_freely')}</span>
          </div>
        </div>

        <div className="search-filter-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder={t('prospect.search_properties')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <label>{t('prospect.property_type')}</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="filter-select"
              >
                <option value="all">{t('prospect.all_types')}</option>
                <option value="apartment">{t('prospect.apartment')}</option>
                <option value="complex">{t('prospect.complex')}</option>
                <option value="house">{t('prospect.house')}</option>
              </select>
            </div>

            <div className="price-range-filter">
              <label>{t('prospect.price_range')}</label>
              <div className="price-inputs">
                <input
                  type="number"
                  placeholder={t('prospect.min')}
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="price-input"
                />
                <span>-</span>
                <input
                  type="number"
                  placeholder={t('prospect.max')}
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="price-input"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="results-info">
          <span>{filteredProperties.length} {t('prospect.properties_found')}</span>
          {lowBandwidthMode && (
            <span className="low-bandwidth-indicator">{t('prospect.low_bandwidth')}</span>
          )}
        </div>

        <div className="property-grid">
          {filteredProperties.map((property) => {
            const estimatedRent = calculateEstimatedRent(property);
            const availability = getPropertyAvailability(property);

            return (
              <div key={property.id} className="property-card">
                <div className="property-image-container">
                  <div className="property-image">
                    <img 
                      src={getPropertyImage(property)}
                      alt={property.name}
                      className="property-image"
                      onError={(event: SyntheticEvent<HTMLImageElement, Event>) => {
                        const target = event.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjRTVFNUU5Ii8+CjxwYXRoIGQ9Ik0xNzUgMTEySDIyNVYxODJIMTc1VjExMlpNMTkwIDEzMkgyMFYxNDJIMTkwVjEzMlpNMTkwIDE0MkgyMFYxNTJIMTkwVjE0MlpNMTkwIDE1MkgyMFYxNjJIMTkwVjE1MloiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iMjAwIiB5PSIxOTAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2Qjc2OEYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiI+UHJvcGVydHkgSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
                      }}
                    />
                  </div>
                  <div className={`availability-badge ${availability.available > 0 ? 'available' : 'unavailable'}`}>
                    {availability.available > 0 ? `${availability.available} ${t('prospect.available')}` : t('prospect.fully_occupied')}
                  </div>
                </div>
                
                <div className="property-info">
                  <div className="property-price">{formatCurrency(estimatedRent)}/month</div>
                  <div className="property-title">{property.name}</div>
                  <div className="property-location">{property.address}</div>
                  
                  <div className="property-details">
                    <span className="property-type">{property.type}</span>
                    <span className="property-units">{property.totalUnits} {t('prospect.units')}</span>
                    <span className="occupancy-rate">{availability.percentage}% {t('prospect.available')}</span>
                  </div>

                  <div className="property-description">
                    <p>{property.description ?? t('prospect.no_description')}</p>
                  </div>

                  <div className="property-meta">
                    <span className="year-built">{t('prospect.built')} {property.yearBuilt ?? t('prospect.not_available')}</span>
                    {property.lastRenovation && (
                      <span className="last-renovation">{t('prospect.renovated')} {property.lastRenovation}</span>
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
                      onClick={() => handleViewDetails(property.id)}
                      className="btn btn-secondary btn-sm"
                    >
                      {t('prospect.view_details')}
                    </button>
                    <button type="button"
                      onClick={() => handleApplyNow(property.id)}
                      className="btn btn-primary btn-sm"
                      disabled={availability.available === 0}
                    >
                      {availability.available > 0 ? t('prospect.apply_now') : t('prospect.unavailable')}
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
            <h3>{t('prospect.no_properties')}</h3>
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
              {properties.length === 0 ? t('prospect.refresh_properties') : t('prospect.clear_filters')}
            </button>
          </div>
        )}
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default ProspectiveTenantPropertiesPage;
