import { useState, useEffect, useMemo } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ManagerPropertyCard from '../components/ManagerPropertyCard.tsx';
import PropertyMap, { type PropertyLocation } from '../components/PropertyMap.tsx';
import { propertiesApi, formatCurrency } from '../services/api.ts';
import { useLowBandwidthMode } from '../utils/bandwidth.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';

type ManagerProperty = {
  id: string;
  name: string;
  address: string;
  totalUnits: number;
  occupiedUnits: number;
  type: string;
  updatedAt: string | number | Date;
  [key: string]: unknown;
};

function ManagerPropertiesPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [properties, setProperties] = useState<ManagerProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredProperties, setFilteredProperties] = useState<ManagerProperty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<PropertyLocation | null>(null);
  const [userLocationStatus, setUserLocationStatus] = useState<'pending' | 'ready' | 'denied' | 'error' | 'unsupported'>('pending');

  const { lowBandwidthMode } = useLowBandwidthMode();

  const fallbackCoordinatesByName: Record<string, [number, number]> = {
    'blue hills apartments': [18.4241, -33.9249],
    'green valley complex': [31.0218, -29.8587],
    'sunset towers': [25.6022, -33.9608]
  };

  const fallbackCoordinatesByCity: Array<{ matcher: RegExp; coordinates: [number, number] }> = [
    { matcher: /cape town/i, coordinates: [18.4241, -33.9249] },
    { matcher: /durban/i, coordinates: [31.0218, -29.8587] },
    { matcher: /(gqeberha|port elizabeth)/i, coordinates: [25.6022, -33.9608] },
    { matcher: /johannesburg/i, coordinates: [28.0473, -26.2041] }
  ];

  const parseCoordinate = (value: unknown): number | null => {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = Number(value.trim());
      if (!Number.isNaN(parsed) && Number.isFinite(parsed)) {
        return parsed;
      }
    }
    return null;
  };

  const extractCoordinates = (property: ManagerProperty): [number, number] | null => {
    const record = property as Record<string, unknown>;
    const locationValue = record.location as unknown;
    const locationObject = typeof locationValue === 'object' && locationValue !== null ? locationValue as Record<string, unknown> : null;
    const coordinatesValue = record.coordinates as unknown;
    const tuple = Array.isArray(coordinatesValue) && coordinatesValue.length === 2 ? coordinatesValue : null;
    const latCandidates = [
      record.latitude,
      record.lat,
      record.locationLatitude,
      record.locationLat,
      locationObject?.latitude,
      locationObject?.lat,
      locationObject?.y,
      tuple ? tuple[1] : null
    ];
    const lngCandidates = [
      record.longitude,
      record.lng,
      record.locationLongitude,
      record.locationLng,
      locationObject?.longitude,
      locationObject?.lng,
      locationObject?.x,
      tuple ? tuple[0] : null
    ];
    const latitude = latCandidates.map(parseCoordinate).find((candidate) => candidate !== null) ?? null;
    const longitude = lngCandidates.map(parseCoordinate).find((candidate) => candidate !== null) ?? null;
    if (latitude !== null && longitude !== null) {
      // #COMPLETION_DRIVE: Assuming property coordinate arrays store [longitude, latitude] ordering when provided via coordinates tuple
      // #SUGGEST_VERIFY: Confirm backend coordinate payload matches the expected [lng, lat] order to avoid inverted map placement
      return [longitude, latitude];
    }

    const normalizedName = property.name?.toLowerCase().trim() ?? '';
    if (normalizedName && fallbackCoordinatesByName[normalizedName]) {
      // #COMPLETION_DRIVE: Using static fallback coordinates keyed by property name when precise coordinates are missing
      // #SUGGEST_VERIFY: Update property records with true latitude/longitude to improve accuracy
      return fallbackCoordinatesByName[normalizedName];
    }

    if (typeof property.address === 'string') {
      const matchedCity = fallbackCoordinatesByCity.find((entry) => entry.matcher.test(property.address as string));
      if (matchedCity) {
        // #COMPLETION_DRIVE: Falling back to city-level coordinates if only city information is available
        // #SUGGEST_VERIFY: Enhance seed data to include exact coordinates per property address
        return matchedCity.coordinates;
      }
    }

    return null;
  };

  const deriveLocationText = (property: ManagerProperty): string => {
    const record = property as Record<string, unknown>;
    const locationValue = record.location as unknown;
    const locationObject = typeof locationValue === 'object' && locationValue !== null ? locationValue as Record<string, unknown> : null;
    const parts = [
      typeof property.address === 'string' ? property.address.trim() : '',
      typeof record.city === 'string' ? (record.city as string).trim() : '',
      typeof record.town === 'string' ? (record.town as string).trim() : '',
      typeof record.suburb === 'string' ? (record.suburb as string).trim() : '',
      typeof locationObject?.city === 'string' ? (locationObject.city as string).trim() : '',
      typeof locationObject?.province === 'string' ? (locationObject.province as string).trim() : '',
      typeof locationObject?.state === 'string' ? (locationObject.state as string).trim() : '',
      typeof locationObject?.country === 'string' ? (locationObject.country as string).trim() : ''
    ]
      .filter(Boolean)
      .reduce<string[]>((acc, entry) => {
        if (!acc.includes(entry)) {
          acc.push(entry);
        }
        return acc;
      }, []);

    if (parts.length) {
      // #COMPLETION_DRIVE: Using available city/province metadata as a fallback geocoding string when street address is absent
      // #SUGGEST_VERIFY: Populate precise street addresses in property records to improve geocoding accuracy
      return parts.join(', ');
    }

    return '';
  };

  const navItems = [
    { path: '/manager', label: t('nav.dashboard'), icon: 'performanceAnalytics' },
    { path: '/manager/properties', label: t('nav.properties'), icon: 'properties', active: true },
    { path: '/manager/leases', label: t('nav.leases'), icon: 'lease' },
    { path: '/manager/payments', label: t('nav.payments'), icon: 'payment' }
  ];

  useEffect(() => {
    fetchProperties();
  }, [user?.id]);

  useEffect(() => {
    filterProperties();
  }, [properties, searchTerm]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setUserLocationStatus('unsupported');
      return;
    }

    let watchId: number | null = null;

    const handleSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const parsedLat = Number(latitude);
      const parsedLng = Number(longitude);
      if (Number.isFinite(parsedLat) && Number.isFinite(parsedLng)) {
        // #COMPLETION_DRIVE: Assuming browser geolocation provides accurate coordinates for the manager session
        // #SUGGEST_VERIFY: Accept the location prompt and confirm the map pins the expected position
        setUserLocation({
          id: 'current-user-location',
          name: 'Current Location',
          coordinates: [parsedLng, parsedLat]
        });
        setUserLocationStatus('ready');
      }
    };

    const handleError = (errorEvent: GeolocationPositionError) => {
      if (errorEvent.code === errorEvent.PERMISSION_DENIED) {
        setUserLocationStatus('denied');
      } else {
        setUserLocationStatus('error');
      }
    };

    watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      maximumAge: 30000,
      timeout: 20000
    });

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await propertiesApi.getAll({ managerId: user?.id });
      const propertyList: ManagerProperty[] = Array.isArray(data)
        ? data.map((item) => {
            if (!item || typeof item !== 'object') {
              return {
                id: 'unknown',
                name: 'Property',
                address: '',
                totalUnits: 0,
                occupiedUnits: 0,
                type: 'property',
                updatedAt: new Date().toISOString(),
              } satisfies ManagerProperty;
            }
            const record = item as Record<string, unknown>;
            const normalized: ManagerProperty = {
              id: typeof record.id === 'string' ? record.id : 'unknown',
              name: typeof record.name === 'string' ? record.name : 'Property',
              address: typeof record.address === 'string' ? record.address : '',
              totalUnits: typeof record.totalUnits === 'number' ? record.totalUnits : 0,
              occupiedUnits: typeof record.occupiedUnits === 'number' ? record.occupiedUnits : 0,
              type: typeof record.type === 'string' ? record.type : 'property',
              updatedAt: (typeof record.updatedAt === 'string' || typeof record.updatedAt === 'number' || record.updatedAt instanceof Date) ? record.updatedAt : new Date().toISOString(),
            };
            return { ...record, ...normalized } as ManagerProperty;
          })
        : [];
      setProperties(propertyList);
      setFilteredProperties(propertyList);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch properties';
      setError(message);
      setProperties([]);
      setFilteredProperties([]);
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

  const handleEditProperty = (propertyId: string) => {
    globalThis.location.href = `/property/${propertyId}/edit`;
  };

  const handleAddProperty = () => {
    globalThis.location.href = `/property/new`;
  };

  const totalProperties = properties.length;
  const totalUnits = properties.reduce((sum, property) => sum + (property.totalUnits ?? 0), 0);
  const occupiedUnits = properties.reduce((sum, property) => sum + (property.occupiedUnits ?? 0), 0);
  const overallOccupancy = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  const estimatedMonthlyRevenue = properties.reduce((sum, property) => {
    const baseRent = property.type === 'apartment' ? 8000 : 
                     property.type === 'complex' ? 10000 : 12000;
    return sum + ((property.occupiedUnits ?? 0) * baseRent);
  }, 0);

  const propertyLocations = useMemo(() => {
    return filteredProperties.reduce<PropertyLocation[]>((acc, property) => {
      const coordinates = extractCoordinates(property);
      const hasAddress = typeof property.address === 'string' && property.address.trim().length > 0;
      const fallbackLocation = deriveLocationText(property);
      const lookupText = hasAddress ? property.address : fallbackLocation || property.name;
      if (!coordinates && (!lookupText || !lookupText.trim())) {
        return acc;
      }
      acc.push({
        id: property.id,
        name: property.name,
        address: hasAddress ? property.address : fallbackLocation || undefined,
        coordinates: coordinates ?? undefined
      });
      return acc;
    }, []);
  }, [filteredProperties]);

  const userLocationMessage = (() => {
    if (userLocationStatus === 'ready') {
      return '';
    }
    if (userLocationStatus === 'pending') {
      return 'Locating you...';
    }
    if (userLocationStatus === 'denied') {
      return 'Location access is required to display your current position.';
    }
    if (userLocationStatus === 'unsupported') {
      return 'This device does not support location services.';
    }
    return 'Unable to determine your location at the moment.';
  })();

  if (loading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{t('common.loading')}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-container mobile-only">
        <TopNav showLogout showBackButton />
        <div className="main-content">
          <div className="error-state">
            <p>{t('manager.error_loading')}: {error}</p>
            <button type="button" onClick={fetchProperties} className="btn btn-primary">{t('common.retry')}</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout showBackButton />

      <div className="main-content">
        <div className="page-header">
          <div className="page-title">{t('property.title')}</div>
          <div className="page-subtitle">{t('manager.manage_portfolio')}</div>
        </div>

        <div className="section-card" style={{ marginBottom: '24px', padding: '16px' }}>
          <div className="section-title" style={{ marginBottom: '12px' }}>Your Current Location</div>
          {userLocationStatus === 'ready' && userLocation ? (
            <PropertyMap locations={[userLocation]} />
          ) : (
            <div
              style={{
                height: '220px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(22, 47, 27, 0.08), rgba(22, 47, 27, 0.02))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                fontWeight: 600,
                color: '#153826',
                textAlign: 'center'
              }}
            >
              {userLocationMessage}
            </div>
          )}
        </div>

        <div className="dashboard-grid">
          <StatCard 
            value={totalProperties.toString()} 
            label={t('properties.total')} 
          />
          <StatCard 
            value={totalUnits.toString()} 
            label={t('manager.total_units')} 
          />
          <StatCard 
            value={occupiedUnits.toString()} 
            label={t('manager.occupied_units')} 
          />
          <StatCard 
            value={`${overallOccupancy}%`} 
            label={t('manager.occupancy_rate')} 
          />
          <StatCard 
            value={formatCurrency(estimatedMonthlyRevenue)} 
            label={t('manager.est_monthly_revenue')} 
          />
        </div>

        <div className="manager-actions">
          <button type="button" onClick={handleAddProperty} className="btn btn-primary btnNewProperty">
            + {t('manager.add_new_property')}
          </button>
        </div>

        <div className="search-bar">
          <input
            type="text"
            placeholder={t('manager.search_properties')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="results-info">
          <span>{filteredProperties.length} {t('manager.properties_found')}</span>
          {lowBandwidthMode && (
            <span className="low-bandwidth-indicator">{t('manager.low_bandwidth_mode')}</span>
          )}
        </div>

        {propertyLocations.length > 0 && (
          <div className="section-card" style={{ marginBottom: '24px', padding: '16px' }}>
            <div className="section-title" style={{ marginBottom: '12px' }}>{t('manager.property_locations')}</div>
            <PropertyMap locations={propertyLocations} />
          </div>
        )}

        <div className="manager-property-grid">
          {filteredProperties.map((property) => (
            <ManagerPropertyCard
              key={property.id}
              property={property}
              onEditProperty={handleEditProperty}
              lowBandwidthMode={lowBandwidthMode}
            />
          ))}
        </div>

        {filteredProperties.length === 0 && (
          <div className="no-results">
            <h3>{t('manager.no_properties_found')}</h3>
            <p>
              {properties.length === 0
                ? t('manager.no_properties_yet')
                : t('manager.adjust_search')}
            </p>
            <button type="button" onClick={fetchProperties} className="btn btn-primary">
              {t('common.refresh')}
            </button>
            {properties.length === 0 && (
              <button type="button" onClick={handleAddProperty} className="btn btn-secondary">
                {t('properties.add')}
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
