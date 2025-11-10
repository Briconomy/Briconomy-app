import { useEffect, useState } from 'react';
import TopNav from "../components/TopNav.tsx";
import BottomNav from "../components/BottomNav.tsx";
import StatCard from "../components/StatCard.tsx";
import ActionCard from "../components/ActionCard.tsx";
import ChartCard from "../components/ChartCard.tsx";
import AIButton from '../components/AIButton.tsx';
import OfflineIndicator from '../components/OfflineIndicator.tsx';
import AnnouncementSystem from '../components/AnnouncementSystem.tsx';
import LanguageSelector from '../components/LanguageSelector.tsx';
import Icon from '../components/Icon.tsx';
import PropertyMap, { type PropertyLocation } from '../components/PropertyMap.tsx';
import NotificationWidget from '../components/NotificationWidget.tsx';
import OnboardingTutorial from '../components/OnboardingTutorial.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { useAuth } from '../contexts/AuthContext.tsx';
import { dashboardApi, propertiesApi, maintenanceApi, leasesApi, formatCurrency, useApi } from '../services/api.ts';

function ManagerDashboard() {
  const { t } = useLanguage();
  const { user, loading: authLoading } = useAuth();
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [userLocation, setUserLocation] = useState<PropertyLocation | null>(null);
  const [userLocationStatus, setUserLocationStatus] = useState<'pending' | 'ready' | 'denied' | 'error' | 'unsupported'>('pending');

  // API calls for real-time data - FILTERED BY MANAGER ID
  const { data: dashboardStats, loading: statsLoading, error: statsError } = useApi(
    () => user?.id ? dashboardApi.getStats({ managerId: user.id }) : Promise.resolve(null),
    [user?.id]
  );

  const { data: properties, loading: propertiesLoading, error: propertiesError } = useApi(
    () => user?.id ? propertiesApi.getAll({ managerId: user.id }) : Promise.resolve([]),
    [user?.id]
  );

  const { data: maintenanceRequests, loading: maintenanceLoading, error: maintenanceError } = useApi(
    () => user?.id ? maintenanceApi.getAll({ status: 'pending', managerId: user.id }) : Promise.resolve([]),
    [user?.id]
  );

  const { data: leases } = useApi(
    () => user?.id ? leasesApi.getAll() : Promise.resolve([]),
    [user?.id]
  );

  const navItems = [
    { path: '/manager', label: t('nav.dashboard'), icon: 'performanceAnalytics', active: true },
    { path: '/manager/properties', label: t('nav.properties'), icon: 'properties' },
    { path: '/manager/leases', label: t('nav.leases'), icon: 'lease' },
    { path: '/manager/payments', label: t('nav.payments'), icon: 'payment' }
  ];

  const isLoading = authLoading || statsLoading || propertiesLoading || maintenanceLoading;
  const hasError = statsError || propertiesError || maintenanceError;

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
        // #COMPLETION_DRIVE: Assuming manager browsers grant geolocation for precise positioning
        // #SUGGEST_VERIFY: Accept the location prompt on first load and confirm the map centers correctly
        setUserLocation({
          id: 'manager-current-location',
          name: 'You',
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

  const userLocationMessage = (() => {
    if (userLocationStatus === 'ready') {
      return '';
    }
    if (userLocationStatus === 'pending') {
      return t('manager.locating_you') || 'Locating you...';
    }
    if (userLocationStatus === 'denied') {
      return t('manager.location_permission_required') || 'Location access is required to display your current position.';
    }
    if (userLocationStatus === 'unsupported') {
      return t('manager.location_not_supported') || 'This device does not support location services.';
    }
    return t('manager.location_unavailable') || 'Unable to determine your location at the moment.';
  })();

  if (isLoading) {
    return (
      <div className="app-container mobile-only">
        <TopNav showBackButton showLogout />
        <div className="main-content">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>{t('dashboard.loading')}...</p>
          </div>
        </div>
        <BottomNav items={navItems} responsive={false} />
      </div>
    );
  }

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton showLogout />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title-wrapper">
            <div className="page-title">{t('dashboard.manager')}</div>
          </div>
          <div className="page-subtitle">{t('dashboard.listings_leases_payments')}</div>
          {hasError && (
            <div className="offline-indicator">
              <span>{t('dashboard.some_data_unavailable')}</span>
            </div>
          )}
        </div>
        
        <div className="dashboard-grid">
          <StatCard 
            value={properties?.length?.toString() || '0'} 
            label={t('dashboard.listings')} 
          />
          <StatCard 
            value={dashboardStats?.totalRevenue ? formatCurrency(dashboardStats.totalRevenue) : 'R0'} 
            label={t('dashboard.revenue')} 
          />
          <StatCard 
            value={leases?.filter(l => l.status === 'active')?.length?.toString() || '0'} 
            label={t('dashboard.active_leases')} 
          />
          <StatCard 
            value={maintenanceRequests?.length?.toString() || '0'} 
            label={t('dashboard.issues')} 
          />
        </div>

        <ChartCard title={t('manager.property_locations')}>
          {userLocationStatus === 'ready' && userLocation ? (
            <PropertyMap locations={[userLocation]} />
          ) : (
            <div
              className="map-placeholder"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: '8px',
                fontWeight: 600,
                color: '#153826'
              }}
            >
              <span>{userLocationMessage}</span>
              {userLocationStatus === 'denied' && (
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#486152' }}>
                  {t('manager.enable_location_prompt') || 'Enable location in your browser settings to view the map.'}
                </span>
              )}
            </div>
          )}
        </ChartCard>

        <div className="quick-actions">
          <ActionCard
            to="/manager/properties"
            icon={<Icon name="properties" alt="Properties" size={48} />}
            title={t('nav.properties')}
            description={t('manager.manage_listings')}
          />
          <ActionCard
            to="/manager/applications"
            icon={<Icon name="users" alt="Applications" size={48} />}
            title={t('dashboard.applications')}
            description={t('dashboard.review_tenant_applications')}
          />
          <ActionCard
            to="/manager/leases"
            icon={<Icon name="lease" alt="Leases" size={48} />}
            title={t('nav.leases')}
            description={t('manager.contracts')}
          />
          <ActionCard
            to="/manager/payments"
            icon={<Icon name="payment" alt="Payments" size={48} />}
            title={t('nav.payments')}
            description={t('manager.rent_collection')}
          />
          <ActionCard
            to="/manager/maintenance"
            icon={<Icon name="emergency" alt="Issues" size={48} />}
            title={t('manager.issues')} 
            description={t('manager.handle_escalations')}
          />
          <ActionCard
            onClick={() => {
              console.log('Announcements button clicked');
              setShowAnnouncements(true);
            }}
            icon={<Icon name="announcements" alt="Announcements" size={48} />}
            title={t('manager.announcements')}
            description={t('manager.property_updates')}
          />
          <ActionCard
            onClick={() => setShowLanguageSelector(true)}
            icon={<Icon name="language" alt="Language" size={48} />}
            title={t('settings.change_language')}
            description={t('settings.language_description')}
          />
        </div>
        <div className="ai-button-container">
        <AIButton 
              userId="manager-user-1" 
              language={localStorage.getItem('language') as 'en' | 'zu' || 'en'}
              userRole="manager"
            />
        </div>
        
        <NotificationWidget />
      </div>
      
      <BottomNav items={navItems} responsive={false} />
      
      {/* Onboarding Tutorial */}
      <OnboardingTutorial />
      
      {/* Offline Indicator */}
      <OfflineIndicator />
      
      {/* Announcement System Modal */}
      {showAnnouncements && (
        <AnnouncementSystem 
          onClose={() => setShowAnnouncements(false)}
          userRole="manager"
        />
      )}

      {/* Language Selector Modal */}
      {showLanguageSelector && (
        <LanguageSelector
          isOpen={showLanguageSelector}
          onClose={() => setShowLanguageSelector(false)}
        />
      )}
    </div>
  );
}

export default ManagerDashboard;