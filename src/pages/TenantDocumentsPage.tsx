import { useAuth } from '../contexts/AuthContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import DocumentViewer from '../components/DocumentViewer.tsx';

function TenantDocumentsPage() {
  const { user: _user } = useAuth();
  const { t } = useLanguage();

  const navItems = [
    { path: '/tenant', label: t('nav.home'), icon: 'properties', active: false },
    { path: '/tenant/payments', label: t('nav.payments'), icon: 'payment' },
    { path: '/tenant/requests', label: t('nav.requests'), icon: 'maintenance' },
    { path: '/tenant/profile', label: t('nav.profile'), icon: 'profile' }
  ];

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout showBackButton backLink="/tenant/profile" />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">{t('profile.documents')}</div>
          <div className="page-subtitle">View and manage your documents</div>
        </div>
        
        <DocumentViewer />
      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default TenantDocumentsPage;