import { useState } from 'react';
import TopNav from "../components/TopNav.tsx";
import BottomNav from "../components/BottomNav.tsx";
import StatCard from "../components/StatCard.tsx";
import ActionCard from "../components/ActionCard.tsx";
import ChartCard from "../components/ChartCard.tsx";
import AIButton from '../components/AIButton.tsx';
import OfflineIndicator from '../components/OfflineIndicator.tsx';
import InvoiceManagement from '../components/InvoiceManagement.tsx';
import AnnouncementSystem from '../components/AnnouncementSystem.tsx';
import NotificationWidget from '../components/NotificationWidget.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';

function ManagerDashboard() {
  const { t } = useLanguage();
  const [showInvoiceManagement, setShowInvoiceManagement] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  
  const navItems = [
    { path: '/manager', label: t('nav.dashboard'), active: true },
    { path: '/manager/properties', label: t('nav.properties') },
    { path: '/manager/leases', label: t('nav.leases') },
    { path: '/manager/payments', label: t('nav.payments') }
  ];

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton showLogout />
      
      <div className="main-content">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center',justifyContent: 'center', gap: '12px' }}>
            <div className="page-title">{t('dashboard.manager')}</div>
          </div>
          <div className="page-subtitle">{t('dashboard.listings_leases_payments')}</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value="24" label={t('dashboard.listings')} />
          <StatCard value="R180k" label={t('dashboard.revenue')} />
          <StatCard value="89%" label={t('dashboard.occupancy')} />
          <StatCard value="3" label={t('dashboard.issues')} />
        </div>

        <ChartCard title={t('manager.property_locations')}>
          <div className="map-placeholder">{t('manager.interactive_map')}</div>
        </ChartCard>

        <div className="quick-actions">
          <ActionCard
            to="/manager/properties"
            icon="P"
            title={t('nav.properties')}
            description={t('manager.manage_listings')}
          />
          <ActionCard
            to="/manager/leases"
            icon="L" 
            title={t('nav.leases')}
            description={t('manager.contracts')}
          />
          <ActionCard
            onClick={() => setShowInvoiceManagement(true)}
            icon="I"
            title={t('manager.invoices')}
            description={t('manager.generate_manage')}
          />
          <ActionCard
            onClick={() => {}}
            icon="M"
            title={t('nav.payments')}
            description={t('manager.rent_collection')}
          />
          <ActionCard
            to="/manager/maintenance"
            icon="E"
            title={t('manager.issues')} 
            description={t('manager.handle_escalations')}
          />
          <ActionCard
            onClick={() => setShowAnnouncements(true)}
            icon="A"
            title={t('manager.announcements')}
            description={t('manager.property_updates')}
          />
        </div>
        <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <AIButton 
              userId="manager-user-1" 
              language={localStorage.getItem('language') as 'en' | 'zu' || 'en'}
              userRole="manager"
            />
        </div>
        
        <NotificationWidget />
      </div>
      
      <BottomNav items={navItems} responsive={false} />
      
      {/* Offline Indicator */}
      <OfflineIndicator />
      
      {/* Invoice Management Modal */}
      {showInvoiceManagement && (
        <InvoiceManagement 
          onClose={() => setShowInvoiceManagement(false)}
        />
      )}
      
      {/* Announcement System Modal */}
      {showAnnouncements && (
        <AnnouncementSystem 
          onClose={() => setShowAnnouncements(false)}
        />
      )}
    </div>
  );
}

export default ManagerDashboard;