import { CSSProperties } from 'react';

interface IconProps {
  name: string;
  alt?: string;
  className?: string;
  size?: number;
  color?: string;
  noBackground?: boolean;
  borderRadius?: number | string;
  preserveColor?: boolean;
}

const iconMap: Record<string, string> = {
  'logo': '/src/TransparentIcons/TransparentLogo.svg',
  'payment': '/src/TransparentIcons/Payment.svg',
  'maintenance': '/src/TransparentIcons/Maintenance.svg',
  'contact': '/src/TransparentIcons/Contact.svg',
  'profile': '/src/TransparentIcons/Profile.svg',
  'properties': '/src/TransparentIcons/Properties.svg',
  'lease': '/src/TransparentIcons/Lease.svg',
  'invoice': '/src/TransparentIcons/Invoice.svg',
  'alert': '/src/TransparentIcons/Emergency.svg',
  'emergency': '/src/TransparentIcons/Emergency.svg',
  'announcements': '/src/TransparentIcons/Announcements.svg',
  'users': '/src/TransparentIcons/Users.svg',
  'security': '/src/TransparentIcons/Security.svg',
  'manage': '/src/TransparentIcons/Manage.svg',
  'report': '/src/TransparentIcons/Report.svg',
  'docs': '/src/TransparentIcons/Docs.svg',
  'activityLog': '/src/TransparentIcons/ActivityLog.svg',
  'unitManagement': '/src/TransparentIcons/UnitManagement.svg',
  'propertyAnalytics': '/src/TransparentIcons/PropertyAnalytics.svg',
  'maintenanceOverview': '/src/TransparentIcons/MaintenanceOverview.svg',
  'notifications': '/src/TransparentIcons/Notifications.svg',
  'archive': '/src/TransparentIcons/Archive.svg',
  'createLease': '/src/TransparentIcons/CreateLease.svg',
  'renewals': '/src/TransparentIcons/Renewals.svg',
  'docLease': '/src/TransparentIcons/DocLease.svg',
  'sendBulkOffers': '/src/TransparentIcons/SendBulkOffers.svg',
  'trackResponses': '/src/TransparentIcons/TrackResponses.svg',
  'calculateSettlement': '/src/TransparentIcons/CalculateSettlement.svg',
  'downloadDocSettlement': '/src/TransparentIcons/DownloadSettlement.svg',
  'uploadDoc': '/src/TransparentIcons/UploadDoc.svg',
  'template': '/src/TransparentIcons/Template.svg',
  'signDocs': '/src/TransparentIcons/SignDocs.svg',
  'issue': '/src/TransparentIcons/Issue.svg',
  'help': '/src/TransparentIcons/Help.svg',
  'document': '/src/TransparentIcons/Document.svg',
  'refresh': '/src/TransparentIcons/Refresh.svg',
  'trash': '/src/TransparentIcons/Trash.svg',
  'performanceAnalytics': '/src/TransparentIcons/PerformanceAnalytics.svg',
  'language': '/src/TransparentIcons/Language.svg',
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

function Icon({ name, alt, className = '', size, color, noBackground, borderRadius, preserveColor = false }: IconProps) {
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
      backgroundColor: name === 'logo' ? '#FFFFFF' : 'transparent',
      borderRadius: name === 'logo' ? '8px' : '0',
      padding: name === 'logo' ? '8px' : '0',
    };

    const imgStyle: CSSProperties = {
      width: name === 'logo' ? '100%' : finalSize,
      height: name === 'logo' ? '100%' : finalSize,
      objectFit: 'contain',
      filter: name === 'logo' || preserveColor ? 'none' : 'brightness(0) invert(1)',
      WebkitFilter: name === 'logo' || preserveColor ? 'none' : 'brightness(0) invert(1)',
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

  const finalRadius = borderRadius === undefined
    ? '8px'
    : typeof borderRadius === 'number'
      ? `${borderRadius}px`
      : borderRadius;

  const containerStyle: CSSProperties = {
    width: finalSize,
    height: finalSize,
    backgroundColor: finalColor,
    borderRadius: finalRadius,
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
    filter: preserveColor ? 'none' : 'brightness(0) invert(1)',
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
