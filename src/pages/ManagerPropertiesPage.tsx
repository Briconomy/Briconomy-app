import { useState, useEffect } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ManagerPropertyCard from '../components/ManagerPropertyCard.tsx';
import { propertiesApi, formatCurrency } from '../services/api.ts';
import { useLowBandwidthMode } from '../utils/bandwidth.ts';
import { useLanguage } from '../contexts/LanguageContext.tsx';

type ManagerProperty = {
  _id?: string;
  id?: string;
  name: string;
  address: string;
  totalUnits: number;
  occupiedUnits: number;
  type: string;
  [key: string]: unknown;
};

function ManagerPropertiesPage() {
  const { t } = useLanguage();
  const [properties, setProperties] = useState<ManagerProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredProperties, setFilteredProperties] = useState<ManagerProperty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const { lowBandwidthMode } = useLowBandwidthMode();

  const navItems = [
    { path: '/manager', label: t('nav.dashboard'), icon: 'performanceAnalytics' },
    { path: '/manager/properties', label: t('nav.properties'), icon: 'properties', active: true },
    { path: '/manager/leases', label: t('nav.leases'), icon: 'lease' },
    { path: '/manager/payments', label: t('nav.payments'), icon: 'payment' }
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
      const propertyList: ManagerProperty[] = Array.isArray(data)
        ? data.map((item) => {
            if (!item || typeof item !== 'object') {
              return {
                name: 'Property',
                address: '',
                totalUnits: 0,
                occupiedUnits: 0,
                type: 'property',
              } satisfies ManagerProperty;
            }
            const record = item as Record<string, unknown>;
            const normalized: ManagerProperty = {
              _id: typeof record._id === 'string' ? record._id : undefined,
              id: typeof record.id === 'string' ? record.id : undefined,
              name: typeof record.name === 'string' ? record.name : 'Property',
              address: typeof record.address === 'string' ? record.address : '',
              totalUnits: typeof record.totalUnits === 'number' ? record.totalUnits : 0,
              occupiedUnits: typeof record.occupiedUnits === 'number' ? record.occupiedUnits : 0,
              type: typeof record.type === 'string' ? record.type : 'property',
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

  const handleViewDetails = (propertyId: string) => {
    globalThis.location.href = `/property/${propertyId}`;
  };

  const handleEditProperty = (propertyId: string) => {
    globalThis.location.href = `/property/${propertyId}/edit`;
  };

  const handleManageUnits = (propertyId: string) => {
    globalThis.location.href = `/property/${propertyId}/units`;
  };

  const handleViewTenants = (propertyId: string) => {
    globalThis.location.href = `/property/${propertyId}/tenants`;
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

        <div className="manager-property-grid">
          {filteredProperties.map((property) => (
            <ManagerPropertyCard
              key={property._id ?? property.id ?? property.name}
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
