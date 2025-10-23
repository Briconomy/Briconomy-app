import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import PaymentMethodsManager from '../components/PaymentMethodsManager.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';

function ManageTenantPaymentMethodPage() {
  const { t } = useLanguage();

  const navItems = [
    { path: '/tenant', label: t('nav.home'), icon: 'properties', active: false },
    { path: '/tenant/payments', label: t('nav.payments'), icon: 'payment', active: false },
    { path: '/tenant/requests', label: t('nav.requests'), icon: 'maintenance', active: false },
    { path: '/tenant/profile', label: t('nav.profile'), icon: 'profile', active: false }
  ];

  return (
    <div className="app-container mobile-only page-wrapper">
      <TopNav showLogout showBackButton />
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">{t('payments.managePaymentMethods')}</div>
          <div className="page-subtitle">{t('payments.managePaymentMethodsSubtitle')}</div>
        </div>

        <PaymentMethodsManager />

      </div>
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default ManageTenantPaymentMethodPage;
