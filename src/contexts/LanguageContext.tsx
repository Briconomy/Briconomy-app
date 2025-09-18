import React, { createContext, useContext, useState, useEffect } from 'react';

interface Translations {
  [key: string]: {
    en: string;
    zu: string;
  };
}

interface LanguageContextType {
  language: 'en' | 'zu';
  setLanguage: (lang: 'en' | 'zu') => void;
  t: (key: string) => string;
  isLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Translations = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', zu: 'Ideshibodi' },
  'nav.properties': { en: 'Properties', zu: 'Izindawo' },
  'nav.payments': { en: 'Payments', zu: 'Ukukhokha' },
  'nav.maintenance': { en: 'Maintenance', zu: 'Ukulungisa' },
  'nav.leases': { en: 'Leases', zu: 'Ama-lease' },
  'nav.communication': { en: 'Messages', zu: 'Imilayezo' },
  'nav.reports': { en: 'Reports', zu: 'Imibiko' },
  'nav.profile': { en: 'Profile', zu: 'Iphrofayela' },
  'nav.settings': { en: 'Settings', zu: 'Izilungiselelo' },
  'nav.logout': { en: 'Logout', zu: 'Phuma' },

  // Common Actions
  'action.save': { en: 'Save', zu: 'Londoloza' },
  'action.cancel': { en: 'Cancel', zu: 'Khansela' },
  'action.delete': { en: 'Delete', zu: 'Susa' },
  'action.edit': { en: 'Edit', zu: 'Hlela' },
  'action.view': { en: 'View', zu: 'Buka' },
  'action.add': { en: 'Add', zu: 'Engeza' },
  'action.create': { en: 'Create', zu: 'Yenza' },
  'action.update': { en: 'Update', zu: 'Buyekeza' },
  'action.submit': { en: 'Submit', zu: 'Thumela' },
  'action.close': { en: 'Close', zu: 'Vala' },
  'action.search': { en: 'Search', zu: 'Sesha' },
  'action.filter': { en: 'Filter', zu: 'Hlola' },
  'action.download': { en: 'Download', zu: 'Landa' },
  'action.upload': { en: 'Upload', zu: 'Layisha' },

  // Status Labels
  'status.active': { en: 'Active', zu: 'Iyasebenza' },
  'status.inactive': { en: 'Inactive', zu: 'Ayisebenzi' },
  'status.pending': { en: 'Pending', zu: 'Kusalindile' },
  'status.completed': { en: 'Completed', zu: 'Kuphelile' },
  'status.approved': { en: 'Approved', zu: 'Kuvunyiwe' },
  'status.rejected': { en: 'Rejected', zu: 'Kwenqatshiwe' },
  'status.overdue': { en: 'Overdue', zu: 'Kuphelelwe isikhathi' },
  'status.paid': { en: 'Paid', zu: 'Kukhokhelwe' },

  // Property Management
  'property.title': { en: 'Property Management', zu: 'Ukuphatha Izindawo' },
  'property.address': { en: 'Address', zu: 'Ikheli' },
  'property.type': { en: 'Property Type', zu: 'Uhlobo Lwendawo' },
  'property.rent': { en: 'Monthly Rent', zu: 'Intsimbi Yenyanga' },
  'property.available': { en: 'Available', zu: 'Iyatholakala' },
  'property.occupied': { en: 'Occupied', zu: 'Kuhleli umuntu' },
  'property.amenities': { en: 'Amenities', zu: 'Izinsiza' },
  'property.description': { en: 'Description', zu: 'Incazelo' },

  // Payment Management
  'payment.title': { en: 'Payment Management', zu: 'Ukuphatha Ukukhokha' },
  'payment.amount': { en: 'Amount', zu: 'Imali' },
  'payment.date': { en: 'Payment Date', zu: 'Usuku Lokukhokha' },
  'payment.method': { en: 'Payment Method', zu: 'Indlela Yokukhokha' },
  'payment.reference': { en: 'Reference Number', zu: 'Inombolo Yesithombe' },
  'payment.receipt': { en: 'Receipt', zu: 'Iresidi' },
  'payment.due': { en: 'Due Date', zu: 'Usuku Lokuphela' },

  // Maintenance
  'maintenance.title': { en: 'Maintenance Requests', zu: 'Izicelo Zokulungisa' },
  'maintenance.description': { en: 'Description', zu: 'Incazelo' },
  'maintenance.category': { en: 'Category', zu: 'Isigaba' },
  'maintenance.priority': { en: 'Priority', zu: 'Ukubaluleka' },
  'maintenance.assigned': { en: 'Assigned To', zu: 'Kwabelwe' },
  'maintenance.reported': { en: 'Reported Date', zu: 'Usuku Lokubikwa' },
  'maintenance.resolved': { en: 'Resolved Date', zu: 'Usuku Lokuxazulula' },

  // Lease Management
  'lease.title': { en: 'Lease Management', zu: 'Ukuphatha Ama-lease' },
  'lease.tenant': { en: 'Tenant', zu: 'Umqashi' },
  'lease.start': { en: 'Start Date', zu: 'Usuku Lokuqala' },
  'lease.end': { en: 'End Date', zu: 'Usuku Lokuphela' },
  'lease.deposit': { en: 'Security Deposit', zu: 'Idiphozithi Yokuphepha' },
  'lease.renewal': { en: 'Renewal', zu: 'Ukuvuselela' },
  'lease.termination': { en: 'Termination', zu: 'Ukuphela' },

  // User Roles
  'role.admin': { en: 'Administrator', zu: 'Umphathi' },
  'role.manager': { en: 'Property Manager', zu: 'Umphathi Wendawo' },
  'role.tenant': { en: 'Tenant', zu: 'Umqashi' },
  'role.caretaker': { en: 'Caretaker', zu: 'Umgcini' },

  // Messages
  'message.welcome': { en: 'Welcome to Briconomy', zu: 'Wamukelekile ku-Briconomy' },
  'message.loading': { en: 'Loading...', zu: 'Kuyalayishwa...' },
  'message.error': { en: 'An error occurred', zu: 'Kuye kwaba khona iphutha' },
  'message.success': { en: 'Operation successful', zu: 'Umsebenzi uphumelele' },
  'message.no_data': { en: 'No data available', zu: 'Akukho datha etholakalayo' },
  'message.confirm_delete': { en: 'Are you sure you want to delete?', zu: 'Uqinisekile ukuthi ufuna ukususa?' },

  // Forms
  'form.name': { en: 'Name', zu: 'Igama' },
  'form.email': { en: 'Email', zu: 'I-imeyili' },
  'form.phone': { en: 'Phone Number', zu: 'Inombolo Yocingo' },
  'form.password': { en: 'Password', zu: 'Iphasiwedi' },
  'form.confirm_password': { en: 'Confirm Password', zu: 'Qinisekisa Iphasiwedi' },
  'form.required': { en: 'This field is required', zu: 'Leli ndawo iyadingeka' },
  'form.invalid_email': { en: 'Please enter a valid email', zu: 'Sicela ufake i-imeyili efanele' },

  // Time Periods
  'time.today': { en: 'Today', zu: 'Namuhla' },
  'time.yesterday': { en: 'Yesterday', zu: 'Izolo' },
  'time.this_week': { en: 'This Week', zu: 'Kule viki' },
  'time.this_month': { en: 'This Month', zu: 'Kule nyanga' },
  'time.this_year': { en: 'This Year', zu: 'Kulo nyaka' },

  // Language Settings
  'settings.language': { en: 'Language', zu: 'Ulimi' },
  'settings.english': { en: 'English', zu: 'IsiNgisi' },
  'settings.zulu': { en: 'Zulu', zu: 'IsiZulu' },
  'settings.change_language': { en: 'Change Language', zu: 'Shintsha Ulimi' },

  // Notifications
  'notif.new_message': { en: 'New message received', zu: 'Umyalezo omusha utholiwe' },
  'notif.payment_due': { en: 'Payment due soon', zu: 'Ukukhokha kuseduze' },
  'notif.maintenance_update': { en: 'Maintenance request updated', zu: 'Isicelo sokulungisa sibuyekeziwe' },
  'notif.lease_expiry': { en: 'Lease expiring soon', zu: 'I-lease iphela masinyane' }
};

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguageState] = useState<'en' | 'zu'>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load saved language preference
    const savedLanguage = localStorage.getItem('briconomy_language') as 'en' | 'zu';
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'zu')) {
      setLanguageState(savedLanguage);
    }
    setIsLoading(false);
  }, []);

  const setLanguage = (lang: 'en' | 'zu') => {
    setLanguageState(lang);
    localStorage.setItem('briconomy_language', lang);
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return key;
    }
    return translation[language] || translation.en || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
    isLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// HOC for components that need translation
export function withTranslation<P extends object>(
  Component: React.ComponentType<P>
): React.ComponentType<P> {
  return function WrappedComponent(props: P) {
    const { t, language } = useLanguage();
    return <Component {...props} t={t} language={language} />;
  };
}

// Language switcher component
export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <div className="flex items-center space-x-2">
      <label className="text-sm font-medium text-gray-700">
        {t('settings.language')}:
      </label>
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as 'en' | 'zu')}
        className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="en">{t('settings.english')}</option>
        <option value="zu">{t('settings.zulu')}</option>
      </select>
    </div>
  );
};