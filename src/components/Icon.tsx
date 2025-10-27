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
    'logo': '#162F1B',
    'payment': '#FF894D',
    'maintenance': '#FF894D',
    'contact': '#FF894D',
    'profile': '#FF894D',
    'properties': '#FF894D',
    'lease': '#FF894D',
    'invoice': '#FF894D',
    'alert': '#FF894D',
    'emergency': '#FF894D',
    'announcements': '#FF894D',
    'users': '#FF894D',
    'security': '#162F1B',
    'manage': '#162F1B',
    'report': '#162F1B',
    'docs': '#162F1B',
    'activityLog': '#162F1B',
    'unitManagement': '#FF894D',
    'propertyAnalytics': '#FF894D',
    'maintenanceOverview': '#162F1B',
    'notifications': '#f59e0b',
    'archive': '#162F1B',
    'createLease': '#FF894D',
    'renewals': '#FF894D',
    'docLease': '#FF894D',
    'sendBulkOffers': '#FF894D',
    'trackResponses': '#FF894D',
    'calculateSettlement': '#162F1B',
    'downloadDocSettlement': '#162F1B',
    'uploadDoc': '#FF894D',
    'template': '#162F1B',
    'signDocs': '#162F1B',
    'issue': '#FF894D',
    'help': '#FF894D',
    'document': '#162F1B',
    'refresh': '#3b82f6',
    'trash': '#ef4444',
    'performanceAnalytics': '#162F1B',
    'language': '#FF894D',
  };

  return colorMap[iconName] || '#162F1B';
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
