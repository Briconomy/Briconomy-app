import React from 'react';
import { formatCurrency } from '../services/api.ts';
import { useImageOptimization } from '../utils/bandwidth.ts';

interface ManagerPropertyCardProps {
  property: any;
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
  
  const imageUrl = optimizeImage(`/api/properties/${property._id}/image`, lowBandwidthMode);

  const getOccupancyStatus = () => {
    if (occupancyRate >= 90) return { status: 'high', color: 'success', text: 'High Occupancy' };
    if (occupancyRate >= 70) return { status: 'medium', color: 'warning', text: 'Good Occupancy' };
    return { status: 'low', color: 'danger', text: 'Low Occupancy' };
  };

  const occupancyStatus = getOccupancyStatus();

  return (
    <div className="manager-property-card">
      <div className="property-image-container">
        <div className="property-image">
          <img 
            src={imageUrl} 
            alt={property.name}
            onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
              const target = e.target as HTMLImageElement;
              target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRTVFNUU5Ii8+CjxwYXRoIGQ9Ik0xMjUgNzVIMTc1VjEyNUgxMjVWNzVaTTE0MCA5MEgxNjBWMTBIMTQwVjkwWk0xNDAgMTBIMTYwVjExMEgxNDBWMTAwWk0xNDAgMTEwSDE2MFYxMjBIMTQwVjExMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHRleHQgeD0iMTUwIiB5PSIxNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2Qjc2OEYiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCI+UHJvcGVydHkgSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo=';
            }}
          />
        </div>
        <div className={`occupancy-badge occupancy-${occupancyStatus.color}`}>
          {occupancyStatus.text}
        </div>
      </div>
      
      <div className="property-info">
        <div className="property-header">
          <div className="property-title">{property.name}</div>
          <div className="property-type">{property.type}</div>
        </div>
        
        <div className="property-location">{property.address}</div>
        
        <div className="property-metrics">
          <div className="metric-item">
            <span className="metric-label">Units</span>
            <span className="metric-value">{property.totalUnits}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Occupied</span>
            <span className="metric-value">{property.occupiedUnits}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Available</span>
            <span className="metric-value">{availableUnits}</span>
          </div>
          <div className="metric-item">
            <span className="metric-label">Occupancy</span>
            <span className="metric-value">{occupancyRate}%</span>
          </div>
        </div>

        <div className="financial-metrics">
          <div className="financial-item">
            <span className="financial-label">Est. Monthly Revenue</span>
            <span className="financial-value">{formatCurrency(estimatedMonthlyRevenue)}</span>
          </div>
          <div className="financial-item">
            <span className="financial-label">Occupancy Rate</span>
            <span className={`financial-value occupancy-${occupancyStatus.color}`}>
              {occupancyRate}%
            </span>
          </div>
        </div>

        <div className="property-status">
          <div className="status-item">
            <span className="status-label">Last Updated</span>
            <span className="status-value">{new Date(property.updatedAt).toLocaleDateString()}</span>
          </div>
          {property.maintenanceIssues > 0 && (
            <div className="status-item alert">
              <span className="status-label">Maintenance Issues</span>
              <span className="status-value">{property.maintenanceIssues}</span>
            </div>
          )}
        </div>

        <div className="property-actions">
          <button
            type="button"
            onClick={() => onViewDetails(property._id)}
            className="btn btn-secondary btn-sm"
          >
            View Details
          </button>
          <button
            type="button"
            onClick={() => onEditProperty(property._id)}
            className="btn btn-primary btn-sm"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => onManageUnits(property._id)}
            className="btn btn-info btn-sm"
          >
            Units
          </button>
          <button
            type="button"
            onClick={() => onViewTenants(property._id)}
            className="btn btn-success btn-sm"
          >
            Tenants
          </button>
        </div>
      </div>
    </div>
  );
}

export default ManagerPropertyCard;
