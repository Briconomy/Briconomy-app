import React, { useState, useEffect } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import DataTable from '../components/DataTable.tsx';
import SearchFilter from '../components/SearchFilter.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { renewalsApi } from '../services/api.ts';

function LeaseRenewalsPage() {
  const { t } = useLanguage();
  const [renewals, setRenewals] = useState([]);
  const [filteredRenewals, setFilteredRenewals] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRenewals();
  }, []);

  useEffect(() => {
    applyFilters(searchTerm, statusFilter);
  }, [renewals]);

  const fetchRenewals = async () => {
    try {
      setLoading(true);
      const data = await renewalsApi.getAll();
      setRenewals(data);
      setFilteredRenewals(data);
    } catch (error) {
      console.error('Error fetching renewals:', error);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { path: '/manager', label: t('nav.dashboard'), icon: 'performanceAnalytics', active: false },
    { path: '/properties', label: t('nav.properties'), icon: 'properties' },
    { path: '/manager/leases', label: t('nav.leases'), icon: 'lease', active: true },
    { path: '/manager/payments', label: t('nav.payments'), icon: 'payment' }
  ];

  const pendingRenewals = renewals.filter(r => r.status === 'pending').length;
  const offersSent = renewals.filter(r => r.renewalOfferSent).length;
  const acceptedRenewals = renewals.filter(r => r.tenantResponse === 'accepted').length;
  const expiringSoon = renewals.filter(r => r.daysUntilExpiry <= 30).length;

  const handleSearch = (term) => {
    setSearchTerm(term);
    applyFilters(term, statusFilter);
  };

  const handleFilterChange = (key, value) => {
    setStatusFilter(value);
    applyFilters(searchTerm, value);
  };

  const applyFilters = (search, status) => {
    let filtered = renewals;

    if (search) {
      filtered = filtered.filter(renewal =>
        renewal.tenantName.toLowerCase().includes(search.toLowerCase()) ||
        renewal.unitNumber.toLowerCase().includes(search.toLowerCase()) ||
        renewal.propertyName.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== 'all') {
      filtered = filtered.filter(renewal => renewal.status === status);
    }

    setFilteredRenewals(filtered);
  };

  const handleSendRenewalOffer = async (renewalId) => {
    const renewal = renewals.find(r => r.id === renewalId);
    if (renewal && confirm(`Send renewal offer to ${renewal.tenantName} for unit ${renewal.unitNumber}?`)) {
      try {
        console.log('Sending offer for renewal ID:', renewalId);
        const result = await renewalsApi.sendOffer(renewalId);
        console.log('Send offer result:', result);
        await fetchRenewals();
        alert('Renewal offer sent successfully!');
      } catch (error) {
        console.error('Error sending renewal offer:', error);
        console.error('Error details:', error.message, error.stack);
        alert(`Failed to send renewal offer: ${error.message}`);
      }
    }
  };

  const renewalColumns = [
    { key: 'tenantName', label: t('lease.tenant') },
    { key: 'unitNumber', label: t('lease.unit') },
    { key: 'propertyName', label: t('lease.property') },
    { 
      key: 'currentEndDate', 
      label: t('renewals.current_end_date'),
      render: (value) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'daysUntilExpiry', 
      label: t('renewals.days_left'),
      render: (value) => (
        <span className={value <= 30 ? 'urgent' : 'normal'}>
          {value} days
        </span>
      )
    },
    { 
      key: 'status', 
      label: t('common.status'),
      render: (value, row) => (
        <span className={`status-badge ${
          value === 'accepted' ? 'status-paid' : 
          value === 'offer_sent' ? 'status-pending' : 'status-overdue'
        }`}>
          {value === 'pending' ? t('renewals.status_pending') :
           value === 'offer_sent' ? t('renewals.status_offer_sent') :
           value === 'accepted' ? t('renewals.status_accepted') : t('renewals.status_declined')}
        </span>
      )
    },
    {
      key: 'actions',
      label: t('common.actions'),
      render: (value, row) => (
        <div className="action-buttons">
          {!row.renewalOfferSent && (
            <button type="button"
              className="btn btn-primary btn-sm"
              onClick={() => handleSendRenewalOffer(row.id)}
            >
              {t('renewals.send_offer')}
            </button>
          )}
          {row.tenantResponse === 'pending' && (
            <span className="response-pending">{t('renewals.awaiting_response')}</span>
          )}
        </div>
      )
    }
  ];

  const filters = [
    {
      key: 'status',
      value: statusFilter,
      options: [
        { value: 'all', label: t('common.all_statuses') },
        { value: 'pending', label: t('renewals.status_pending') },
        { value: 'offer_sent', label: t('renewals.status_offer_sent') },
        { value: 'accepted', label: t('renewals.status_accepted') }
      ]
    }
  ];

  return (
    <div className="app-container mobile-only">
      <TopNav showLogout showBackButton />
      
      <div className="main-content">
        <div className="page-header">
          <div className="page-title">{t('renewals.page_title')}</div>
          <div className="page-subtitle">{t('renewals.page_subtitle')}</div>
        </div>
        
        <div className="dashboard-grid">
          <StatCard value={pendingRenewals} label={t('renewals.pending')} />
          <StatCard value={offersSent} label={t('renewals.offers_sent')} />
          <StatCard value={acceptedRenewals} label={t('renewals.accepted')} />
          <StatCard value={expiringSoon} label={t('renewals.expiring_soon')} />
        </div>

        <SearchFilter
          placeholder={t('renewals.search_placeholder')}
          onSearch={handleSearch}
          filters={filters}
          onFilterChange={handleFilterChange}
        />

        <DataTable
          title={t('renewals.overview')}
          data={filteredRenewals}
          columns={renewalColumns}
          actions={null}
          onRowClick={(renewal) => {}}
        />

        <ChartCard title={t('renewals.process')}>
          <div className="renewal-stats">
            <div className="stat-item">
              <div className="stat-value">{pendingRenewals}</div>
              <div className="stat-label">{t('renewals.pending_action')}</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{offersSent}</div>
              <div className="stat-label">{t('renewals.offers_sent')}</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{acceptedRenewals}</div>
              <div className="stat-label">{t('renewals.accepted')}</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{renewals.length}</div>
              <div className="stat-label">{t('renewals.total')}</div>
            </div>
          </div>
        </ChartCard>


      </div>
      
      <BottomNav items={navItems} responsive={false} />
    </div>
  );
}

export default LeaseRenewalsPage;
