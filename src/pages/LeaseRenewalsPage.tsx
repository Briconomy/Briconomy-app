import { useMemo, useState, useEffect } from 'react';
import TopNav from '../components/TopNav.tsx';
import BottomNav from '../components/BottomNav.tsx';
import StatCard from '../components/StatCard.tsx';
import ChartCard from '../components/ChartCard.tsx';
import DataTable from '../components/DataTable.tsx';
import SearchFilter from '../components/SearchFilter.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';

type RenewalStatus = 'pending' | 'offer_sent' | 'accepted' | 'declined';

type Renewal = {
  id: string;
  tenantName: string;
  unitNumber: string;
  propertyName: string;
  currentEndDate: string;
  daysUntilExpiry: number;
  status: RenewalStatus;
  renewalOfferSent: boolean;
  tenantResponse: 'pending' | 'accepted' | 'declined' | null;
};

function LeaseRenewalsPage() {
  const { t } = useLanguage();
  const [renewals, setRenewals] = useState<Renewal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | RenewalStatus>('all');
  const [_loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRenewals();
  }, []);

  const fetchRenewals = () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const data = await renewalsApi.getAll();
      // setRenewals(data);
      
      // Mock data for now
      setRenewals([
        {
          id: '1',
          tenantName: 'John Tenant',
          unitNumber: '2A',
          propertyName: 'Blue Hills Apartments',
          currentEndDate: '2024-12-31',
          daysUntilExpiry: 45,
          status: 'pending',
          renewalOfferSent: false,
          tenantResponse: null
        },
        {
          id: '2',
          tenantName: 'Jane Smith',
          unitNumber: '3C',
          propertyName: 'Blue Hills Apartments',
          currentEndDate: '2025-02-28',
          daysUntilExpiry: 104,
          status: 'pending',
          renewalOfferSent: true,
          tenantResponse: null
        },
        {
          id: '3',
          tenantName: 'Mike Johnson',
          unitNumber: '1B',
          propertyName: 'Green Valley Complex',
          currentEndDate: '2024-11-15',
          daysUntilExpiry: 30,
          status: 'offer_sent',
          renewalOfferSent: true,
          tenantResponse: 'pending'
        },
        {
          id: '4',
          tenantName: 'Sarah Wilson',
          unitNumber: '4D',
          propertyName: 'Sunset Towers',
          currentEndDate: '2024-10-01',
          daysUntilExpiry: 15,
          status: 'accepted',
          renewalOfferSent: true,
          tenantResponse: 'accepted'
        }
      ]);
    } catch (error) {
      console.error('Error fetching renewals:', error);
    } finally {
      setLoading(false);
    }
  };

  const navItems = [
    { path: '/manager', label: t('nav.dashboard'), icon: 'performanceAnalytics', active: false },
    { path: '/manager/properties', label: t('nav.properties'), icon: 'properties' },
    { path: '/manager/leases', label: t('nav.leases'), icon: 'lease', active: true },
    { path: '/manager/payments', label: t('nav.payments'), icon: 'payment' }
  ];

  const pendingRenewals = renewals.filter(r => r.status === 'pending').length;
  const offersSent = renewals.filter(r => r.renewalOfferSent).length;
  const acceptedRenewals = renewals.filter(r => r.tenantResponse === 'accepted').length;
  const expiringSoon = renewals.filter(r => r.daysUntilExpiry <= 30).length;

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilterChange = (_key: string, value: string) => {
    setStatusFilter(value as typeof statusFilter);
  };

  const handleSendRenewalOffer = (renewalId: string) => {
    setRenewals(prev => prev.map(renewal => 
      renewal.id === renewalId 
        ? { ...renewal, status: 'offer_sent', renewalOfferSent: true }
        : renewal
    ));
  };

  const filteredRenewals = useMemo(() => {
    return renewals.filter((renewal) => {
      const searchMatch =
        searchTerm.length === 0 ||
        renewal.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        renewal.unitNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        renewal.propertyName.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch = statusFilter === 'all' || renewal.status === statusFilter;

      return searchMatch && statusMatch;
    });
  }, [renewals, searchTerm, statusFilter]);

  const renewalColumns = [
    { key: 'tenantName', label: t('lease.tenant') },
    { key: 'unitNumber', label: t('lease.unit') },
    { key: 'propertyName', label: t('lease.property') },
    { 
      key: 'currentEndDate', 
      label: t('renewals.current_end_date'),
      render: (value: string) => new Date(value).toLocaleDateString()
    },
    { 
      key: 'daysUntilExpiry', 
      label: t('renewals.days_left'),
      render: (value: number) => (
        <span className={value <= 30 ? 'urgent' : 'normal'}>
          {value} days
        </span>
      )
    },
    { 
      key: 'status', 
      label: t('common.status'),
  render: (value: string, _row: Renewal) => (
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
      render: (_value, row: Renewal) => (
        <div className="action-buttons">
          {!row.renewalOfferSent && (
            <button type="button"
              className="btn btn-primary sendRenewal-offer-btn"
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
          onRowClick={() => {}}
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
