import React from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import PaymentMethodsManager from '../components/PaymentMethodsManager.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';

function ManageTenantPaymentMethodPage() {
  const { t } = useLanguage();

  const navItems = [
    { path: '/tenant', label: t('nav.home'), active: false },
    { path: '/tenant/payments', label: t('nav.payments'), active: false },
    { path: '/tenant/requests', label: t('nav.requests'), active: false },
    { path: '/tenant/profile', label: t('nav.profile'), active: false }
  ];

  return (
    <div className="app-container mobile-only" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <TopNav showLogout showBackButton={true} />
      <div className="main-content" style={{ flex: 1, overflowY: 'auto', padding: '16px', paddingBottom: '80px' }}>
        <div className="page-header" style={{ marginBottom: '16px' }}>
          <div className="page-title">Manage Payment Methods</div>
          <div className="page-subtitle">Add, edit or remove your saved payment methods</div>
        </div>

        <PaymentMethodsManager />

      </div>
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default ManageTenantPaymentMethodPage;
