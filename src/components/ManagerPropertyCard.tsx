import type { CSSProperties, SyntheticEvent } from 'react';
import { formatCurrency } from '../services/api.ts';
import { useImageOptimization } from '../utils/bandwidth.ts';

interface ManagerPropertySummary {
  id: string;
  name: string;
  type: string;
  address: string;
  occupiedUnits: number;
  totalUnits: number;
  updatedAt: string | number | Date;
}

interface ManagerPropertyCardProps {
  property: ManagerPropertySummary;
  onViewDetails: (propertyId: string) => void;
  onEditProperty: (propertyId: string) => void;
  onManageUnits: (propertyId: string) => void;
  onViewTenants: (propertyId: string) => void;
  lowBandwidthMode: boolean;
}

function ManagerPropertyCard({
  property,
  onViewDetails,
  onEditProperty,
  onManageUnits,
  onViewTenants,
  lowBandwidthMode
}: ManagerPropertyCardProps) {
  const { optimizeImage } = useImageOptimization();

  const occupancyRate = Math.round((property.occupiedUnits / property.totalUnits) * 100);
  const availableUnits = property.totalUnits - property.occupiedUnits;
  const estimatedMonthlyRevenue = property.occupiedUnits * (property.type === 'apartment' ? 8000 :
                                 property.type === 'complex' ? 10000 : 12000);

  const imageUrl = optimizeImage(`/api/properties/${property.id}/image`, lowBandwidthMode);

  const getOccupancyStatus = () => {
    if (occupancyRate >= 90) return { status: 'high', color: '#1f7a3a', text: 'High' };
    if (occupancyRate >= 70) return { status: 'medium', color: '#d79a2b', text: 'Good' };
    return { status: 'low', color: '#c23a3a', text: 'Low' };
  };

  const occupancyStatus = getOccupancyStatus();

  const styles: Record<string, CSSProperties> = {
    card: {
      display: 'flex',
      gap: 16,
      background: '#ffffff',
      borderRadius: 12,
      padding: 18,
      boxShadow: '0 8px 24px rgba(18, 43, 34, 0.06)',
      alignItems: 'flex-start',
      minHeight: 150,
      boxSizing: 'border-box',
      overflow: 'hidden',
      flexWrap: 'wrap' // allow content to wrap to next line on narrow widths
    },
    imageWrap: {
      width: 160,
      height: 110,
      borderRadius: 8,
      overflow: 'hidden',
      background: '#f1f3f4',
      flex: '0 0 160px', // fixed size, don't shrink below width
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    img: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    },
    info: {
      flex: '1 1 auto',
      minWidth: 0,              // allows children to shrink inside flexbox
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
      flexWrap: 'wrap' // lets right-side badges move below title on small widths
    },
    titleBlock: {
      display: 'flex',
      flexDirection: 'column'
    },
    title: {
      margin: 0,
      fontSize: 18,
      fontWeight: 700,
      color: '#12301f',
      wordBreak: 'break-word' // prevent overflow from long names
    },
    subtype: {
      marginTop: 6,
      display: 'inline-block',
      padding: '4px 8px',
      background: '#f3f6f4',
      color: '#3d5a4b',
      borderRadius: 999,
      fontSize: 12
    },
    address: {
      fontSize: 13,
      color: '#6b7b70',
      marginTop: 8,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '100%'
    },
    metricsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(60px, 1fr))', // flexible boxes
      gap: 10,
      marginTop: 10,
      width: '100%'
    },
    metric: {
      background: '#fbfdfb',
      borderRadius: 8,
      padding: '8px 10px',
      textAlign: 'center',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)'
    },
    metricLabel: {
      display: 'block',
      fontSize: 12,
      color: '#6b7b70'
    },
    metricValue: {
      fontSize: 15,
      fontWeight: 700,
      color: '#153826',
      marginTop: 4
    },
    bottomRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
      marginTop: 12,
      flexWrap: 'wrap'
    },
    leftBottom: {
      display: 'flex',
      gap: 8,
      alignItems: 'center'
    },
    lastUpdated: {
      fontSize: 12,
      color: '#8a9b90'
    },
    actions: {
      display: 'flex',
      gap: 8,
      flexWrap: 'wrap'
    },
    btn: {
      border: 'none',
      padding: '8px 12px',
      borderRadius: 8,
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: 13
    },
    btnSecondary: {
      background: '#f3f4f3',
      color: '#243a33'
    },
    btnPrimary: {
      background: '#153826',
      color: '#fff'
    },
    revenueBadge: {
      padding: '6px 10px',
      borderRadius: 999,
      background: '#eef8f2',
      color: '#0f5a2f',
      fontWeight: 700,
      fontSize: 13,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: 120
    },
    occupancyBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '6px 10px',
      borderRadius: 999,
      background: '#fff',
      boxShadow: '0 2px 6px rgba(18,48,35,0.06)',
      fontSize: 13,
      fontWeight: 700,
      color: occupancyStatus.color,
      whiteSpace: 'nowrap'
    }
  };

  return (
    <div style={styles.card} aria-label={`Property ${property.name}`}>
      <div style={styles.imageWrap}>
        <img
          src={imageUrl}
          alt={property.name || 'Property image'}
          style={styles.img}
          onError={(event: SyntheticEvent<HTMLImageElement, Event>) => {
            const target = event.target as HTMLImageElement;
            target.src =
              'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRTVFNUU5Ii8+CjxwYXRoIGQ9Ik0xMjUgNzVIMTc1VjEyNUgxMjVWNzVaTTE0MCA5MEgxNjBWMTBIMTQwVjkwWk0xNDAgMTBIMTYwVjExMEgxNDBWMTAwWk0xNDAgMTEwSDE2MFYxMjBIMTQwVjExMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iMTUwIiB5PSIxNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2Qjc2OEYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+UHJvcGVydHkgSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
          }}
        />
      </div>

      <div style={styles.info}>
        <div style={styles.header}>
          <div style={styles.titleBlock}>
            <h3 style={styles.title}>{property.name}</h3>
            <span style={styles.subtype}>{property.type}</span>
            <div style={styles.address}>{property.address}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <div style={styles.occupancyBadge}>
              <svg width="10" height="10" viewBox="0 0 10 10" style={{ borderRadius: 999 }}>
                <circle cx="5" cy="5" r="5" fill={occupancyStatus.color} />
              </svg>
              {occupancyStatus.text} {occupancyRate}%
            </div>
            <div style={styles.revenueBadge}>{formatCurrency(estimatedMonthlyRevenue)}</div>
          </div>
        </div>

        <div style={styles.metricsGrid}>
          <div style={styles.metric}>
            <span style={styles.metricLabel}>Units</span>
            <span style={styles.metricValue}>{property.totalUnits}</span>
          </div>
          <div style={styles.metric}>
            <span style={styles.metricLabel}>Occupied</span>
            <span style={styles.metricValue}>{property.occupiedUnits}</span>
          </div>
          <div style={styles.metric}>
            <span style={styles.metricLabel}>Available</span>
            <span style={styles.metricValue}>{availableUnits}</span>
          </div>
        </div>

        <div style={styles.bottomRow}>
          <div style={styles.leftBottom}>
            <div style={styles.lastUpdated}>Last updated {new Date(property.updatedAt).toLocaleDateString()}</div>
          </div>

          <div style={styles.actions}>
            <button type="button"
              style={{ ...styles.btn, ...styles.btnSecondary }}
              onClick={() => onViewDetails(property.id)}
            >
              View
            </button>
            <button type="button"
              style={{ ...styles.btn, ...styles.btnSecondary }}
              onClick={() => onEditProperty(property.id)}
            >
              Edit
            </button>
            <button type="button"
              style={{ ...styles.btn, ...styles.btnSecondary }}
              onClick={() => onManageUnits(property.id)}
            >
              Units
            </button>
            <button type="button"
              style={{ ...styles.btn, ...styles.btnSecondary }}
              onClick={() => onViewTenants(property.id)}
            >
              Tenants
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManagerPropertyCard;
