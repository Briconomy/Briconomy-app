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
import { useLanguage } from '../contexts/LanguageContext.tsx';

function ManagerDashboard() {
  const { t } = useLanguage();
  const [showInvoiceManagement, setShowInvoiceManagement] = useState(false);
  const [showAnnouncements, setShowAnnouncements] = useState(false);
  
  const navItems = [
    { path: '/manager', label: 'Dashboard', active: true },
    { path: '/manager/properties', label: 'Properties' },
    { path: '/manager/leases', label: 'Leases' },
    { path: '/manager/payments', label: 'Payments' }
  ];

  return (
    <div className="app-container mobile-only">
      <TopNav showBackButton showLogout />
      
      <div className="main-content">
        <div className="page-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="page-title">{t('dashboard.manager')}</div>
            <AIButton 
              userId="manager-user-1" 
              language={localStorage.getItem('language') as 'en' | 'zu' || 'en'}
            />
          </div>
          <div className="page-subtitle">{t('dashboard.listings_leases_payments')}</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value="24" label={t('dashboard.listings')} />
          <StatCard value="R180k" label={t('dashboard.revenue')} />
          <StatCard value="89%" label={t('dashboard.occupancy')} />
          <StatCard value="3" label={t('dashboard.issues')} />
        </div>

        <ChartCard title="Property Locations">
          <div className="map-placeholder">Interactive Property Map</div>
        </ChartCard>

        <div className="quick-actions">
          <ActionCard
            to="/manager/properties"
            icon="P"
            title="Properties"
            description="Manage listings"
          />
          <ActionCard
            to="/manager/leases"
            icon="L" 
            title="Leases"
            description="Contracts"
          />
          <ActionCard
            onClick={() => setShowInvoiceManagement(true)}
            icon="I"
            title="Invoices"
            description="Generate & manage"
          />
          <ActionCard
            onClick={() => {}}
            icon="M"
            title="Payments"
            description="Rent collection"
          />
          <ActionCard
            to="/manager/maintenance"
            icon="E"
            title="Issues" 
            description="Handle escalations"
          />
          <ActionCard
            onClick={() => setShowAnnouncements(true)}
            icon="A"
            title="Announcements"
            description="Property updates"
          />
        </div>
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