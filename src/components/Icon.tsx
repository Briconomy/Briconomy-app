interface IconProps {
  name: string;
  alt?: string;
  className?: string;
  size?: number;
}

const iconMap: Record<string, string> = {
  'logo': '/src/Icons/Logo.svg',
  'payment': '/src/Icons/Payment.svg',
  'maintenance': '/src/Icons/Maintainence.svg',
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
  'maintenanceOverview': '/src/Icons/MainainenceOverview.svg',
  'notifications': '/src/Icons/Notifications.svg',
  'archive': '/src/Icons/Archive.svg',
  'createLease': '/src/Icons/CreateLease.svg',
  'renewals': '/src/Icons/Renewals.svg',
  'docLease': '/src/Icons/DocLease.svg',
  'sendBulkOffers': '/src/Icons/SendBulkOffers.svg',
  'trackResponses': '/src/Icons/TrackResponses.svg',
  'calculateSettlement': '/src/Icons/CalculateSettlement.svg',
  'downloadDocSettlement': '/src/Icons/DownloadDocSettlement.svg',
  'uploadDoc': '/src/Icons/UploadDoc.svg',
  'template': '/src/Icons/Template.svg',
  'signDocs': '/src/Icons/SignDocs.svg',
  'issue': '/src/Icons/Issue.svg',
  'help': '/src/Icons/Help.svg',
  'document': '/src/Icons/Document.svg',
  'refresh': '/src/Icons/Refresh.svg',
  'trash': '/src/Icons/Trash.svg',
  'performanceAnalytics': '/src/Icons/PerformanceAnalytics.svg',
};

function Icon({ name, alt, className = '', size }: IconProps) {
  const iconPath = iconMap[name];
  
  if (!iconPath) {
    console.warn(`Icon "${name}" not found in iconMap`);
    return <div className={`icon-placeholder ${className}`}>{name}</div>;
  }

  const style = size ? { width: size, height: size } : undefined;

  return (
    <img 
      src={iconPath} 
      alt={alt || name} 
      className={`icon ${className}`}
      style={style}
    />
  );
}

export default Icon;
