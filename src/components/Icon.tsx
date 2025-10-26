import { CSSProperties } from 'react';

interface IconProps {
  name: string;
  alt?: string;
  className?: string;
  size?: number;
  color?: string;
  noBackground?: boolean;
}

const iconMap: Record<string, string> = {
  'logo': '/src/Icons/Logo.svg',
  'payment': '/src/Icons/Payment.svg',
  'maintenance': '/src/Icons/Maintenance.svg',
  'contact': '/src/Icons/Contact.svg',
  'profile': '/src/Icons/Profile.svg',
  'properties': '/src/Icons/Properties.svg',
  'lease': '/src/Icons/Lease.svg',
  'invoice': '/src/Icons/Invoice.svg',
  'alert': '/src/Icons/Emergency.svg',
  'emergency': '/src/Icons/Emergency.svg',
  'announcements': '/src/Icons/Announcements.svg',
  'users': '/src/Icons/Users.svg',
  'security': '/src/Icons/Security.svg',
  'manage': '/src/Icons/Manage.svg',
  'report': '/src/Icons/Report.svg',
  'docs': '/src/Icons/Docs.svg',
  'activityLog': '/src/Icons/ActivityLog.svg',
  'unitManagement': '/src/Icons/UnitManagement.svg',
  'propertyAnalytics': '/src/Icons/PropertyAnalytics.svg',
  'maintenanceOverview': '/src/Icons/MaintenanceOverview.svg',
  'notifications': '/src/Icons/Notifications.svg',
  'archive': '/src/Icons/Archive.svg',
  'createLease': '/src/Icons/CreateLease.svg',
  'renewals': '/src/Icons/Renewals.svg',
  'docLease': '/src/Icons/DocLease.svg',
  'sendBulkOffers': '/src/Icons/SendBulkOffers.svg',
  'trackResponses': '/src/Icons/TrackResponses.svg',
  'calculateSettlement': '/src/Icons/CalculateSettlement.svg',
  'downloadDocSettlement': '/src/Icons/DownloadSettlement.svg',
  'uploadDoc': '/src/Icons/UploadDoc.svg',
  'template': '/src/Icons/Template.svg',
  'signDocs': '/src/Icons/SignDocs.svg',
  'issue': '/src/Icons/Issue.svg',
  'help': '/src/Icons/Help.svg',
  'document': '/src/Icons/Document.svg',
  'refresh': '/src/Icons/Refresh.svg',
  'trash': '/src/Icons/Trash.svg',
  'performanceAnalytics': '/src/Icons/PerformanceAnalytics.svg',
  'language': '/src/Icons/Language.svg',
};

const getDefaultIconColor = (iconName: string): string => {
  const colorMap: Record<string, string> = {
    'logo': '#1e3a8a',
    'payment': '#10b981',
    'maintenance': '#ea580c',
    'contact': '#3b82f6',
    'profile': '#1f2937',
    'properties': '#2563eb',
    'lease': '#1e3a8a',
    'invoice': '#10b981',
    'alert': '#ef4444',
    'emergency': '#ef4444',
    'announcements': '#f59e0b',
    'users': '#1e3a8a',
    'security': '#dc2626',
    'manage': '#2563eb',
    'report': '#1e3a8a',
    'docs': '#3b82f6',
    'activityLog': '#6b7280',
    'unitManagement': '#2563eb',
    'propertyAnalytics': '#1e3a8a',
    'maintenanceOverview': '#ea580c',
    'notifications': '#f59e0b',
    'archive': '#6b7280',
    'createLease': '#1e3a8a',
    'renewals': '#10b981',
    'docLease': '#3b82f6',
    'sendBulkOffers': '#2563eb',
    'trackResponses': '#3b82f6',
    'calculateSettlement': '#10b981',
    'downloadDocSettlement': '#3b82f6',
    'uploadDoc': '#2563eb',
    'template': '#6b7280',
    'signDocs': '#1e3a8a',
    'issue': '#ef4444',
    'help': '#3b82f6',
    'document': '#1f2937',
    'refresh': '#3b82f6',
    'trash': '#ef4444',
    'performanceAnalytics': '#1e3a8a',
    'language': '#1e3a8a',
  };

  return colorMap[iconName] || '#1f2937';
};

function Icon({ name, alt, className = '', size, color, noBackground }: IconProps) {
  const iconPath = iconMap[name];
  
  if (!iconPath) {
    console.warn(`Icon "${name}" not found in iconMap`);
    return <div className={`icon-placeholder ${className}`}>{name}</div>;
  }

  const finalColor = color || getDefaultIconColor(name);
  const finalSize = size || 32;

  if (noBackground || name === 'logo') {
    const containerStyle: CSSProperties = {
      width: finalSize,
      height: finalSize,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    };

    const imgStyle: CSSProperties = {
      width: finalSize,
      height: finalSize,
      objectFit: 'contain',
      filter: name === 'logo' ? 'none' : 'brightness(0) invert(1)',
      WebkitFilter: name === 'logo' ? 'none' : 'brightness(0) invert(1)',
    };

    return (
      <div className={`icon ${className}`} style={containerStyle}>
        <img 
          src={iconPath} 
          alt={alt || name}
          style={imgStyle}
          key={`${name}-${iconPath}`}
        />
      </div>
    );
  }

  const containerStyle: CSSProperties = {
    width: finalSize,
    height: finalSize,
    backgroundColor: finalColor,
    borderRadius: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px',
    flexShrink: 0,
  };

  const imgStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    filter: 'brightness(0) invert(1)',
  };

  return (
    <div 
      className={`icon-container ${className}`} 
      style={containerStyle}
      role="img"
      aria-label={alt || name}
    >
      <img 
        src={iconPath} 
        alt="" 
        style={imgStyle}
      />
    </div>
  );
}

export default Icon;
