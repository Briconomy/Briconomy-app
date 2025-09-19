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
  // Dashboard
  'dashboard.welcome_back': { en: 'Welcome Back', zu: 'Siyakwamukela' },
  'dashboard.tenant': { en: 'Tenant Dashboard', zu: 'Ideshibodi Yomqashi' },
  'dashboard.manager': { en: 'Property Manager', zu: 'Umphathi Wendawo' },
  'dashboard.listings_leases_payments': { en: 'Listings, leases & payments', zu: 'Izindawo, ama-lease nemali' },
  'dashboard.listings': { en: 'Listings', zu: 'Izindawo' },
  'dashboard.revenue': { en: 'Revenue', zu: 'Imali Engenayo' },
  'dashboard.occupancy': { en: 'Occupancy', zu: 'Ukukhona' },
  'dashboard.issues': { en: 'Issues', zu: 'Izinkinga' },
  'dashboard.rent_due': { en: 'Rent Due', zu: 'Irenti Elidingekayo' },
  'dashboard.due_date': { en: 'Due Date', zu: 'Usuku Lokuphela' },
  'dashboard.requests': { en: 'Requests', zu: 'Izicelo' },
  'dashboard.notifications': { en: 'Notifications', zu: 'Izaziso' },
  'dashboard.pay_rent': { en: 'Pay Rent', zu: 'Khokha Irenti' },
  'dashboard.make_payment': { en: 'Make a payment', zu: 'Yenza inkokhelo' },
  'dashboard.maintenance': { en: 'Maintenance', zu: 'Ukulungisa' },
  'dashboard.report_issue': { en: 'Report an issue', zu: 'Bika inkinga' },
  'dashboard.contact': { en: 'Contact', zu: 'Xhumana' },
  'dashboard.message_management': { en: 'Message management', zu: 'Ukuphatha imilayezo' },
      profile: {
      en: 'Profile',
      zu: 'Iphrofayili'
    },
    subtitle: {
      en: 'Manage your account information',
      zu: 'Phatha ulwazi lwe-akhawunti yakho'
    },
    personalInfo: {
      en: 'Personal Information',
      zu: 'Ulwazi Lomuntu Siqu'
    },
    propertyInfo: {
      en: 'Property Information', 
      zu: 'Ulwazi Lwepropathi'
    },
    emergencyContact: {
      en: 'Emergency Contact',
      zu: 'Oxhumana Naye Esimweni Sesiphuthumiso'
    },
    preferences: {
      en: 'Preferences',
      zu: 'Okukhethayo'
    },
    security: {
      en: 'Security',
      zu: 'Ukuphepha'
    },
    notifications: {
      en: 'Notifications',
      zu: 'Izaziso'
    },
    emailNotifications: {
      en: 'Email Notifications',
      zu: 'Izaziso Ze-imeyili'
    },
    smsNotifications: {
      en: 'SMS Notifications',
      zu: 'Izaziso Ze-SMS'
    },
    twoFactorAuth: {
      en: 'Two-Factor Authentication',
      zu: 'Ukuqinisekisa Izinyathelo Ezimbili'
    },
    fullName: {
      en: 'Full Name',
      zu: 'Igama Eliphelele'
    },
    email: {
      en: 'Email',
      zu: 'I-imeyili'
    },
    phone: {
      en: 'Phone',
      zu: 'Ifoni'
    },
    memberSince: {
      en: 'Member Since',
      zu: 'Ilungu Kusukela'
    },
    leaseInfo: {
      en: 'Lease Information',
      zu: 'Ulwazi Lwesivumelwano'
    },
    leaseStart: {
      en: 'Lease Start',
      zu: 'Ukuqala Kwesivumelwano'
    },
    leaseEnd: {
      en: 'Lease End',
      zu: 'Ukuphela Kwesivumelwano'
    },
    accountSettings: {
      en: 'Account Settings',
      zu: 'Izilungiselelo Ze-akhawunti'
    },
    name: {
      en: 'Name',
      zu: 'Igama'
    },
    relationship: {
      en: 'Relationship',
      zu: 'Ubuhlobo'
    },
  'dashboard.update_info': { en: 'Update information', zu: 'Buyekeza ulwazi' },

  // Navigation
  'nav.home': { en: 'Home', zu: 'Ikhaya' },
  'nav.dashboard': { en: 'Dashboard', zu: 'Ideshibodi' },
  'nav.properties': { en: 'Properties', zu: 'Izindawo' },
  'nav.payments': { en: 'Payments', zu: 'Ukukhokha' },
  'nav.requests': { en: 'Requests', zu: 'Izicelo' },
  'nav.maintenance': { en: 'Maintenance', zu: 'Ukulungisa' },
  'nav.leases': { en: 'Leases', zu: 'Ama-lease' },
  'nav.communication': { en: 'Messages', zu: 'Imilayezo' },
  'nav.reports': { en: 'Reports', zu: 'Imibiko' },
  'nav.profile': { en: 'Profile', zu: 'Iphrofayela' },
  'nav.tasks': { en: 'Tasks', zu: 'Imisebenzi' },
  'nav.schedule': { en: 'Schedule', zu: 'Uhlelo' },
  'nav.history': { en: 'History', zu: 'Umlando' },
  'nav.users': { en: 'Users', zu: 'Abasebenzisi' },
  'nav.security': { en: 'Security', zu: 'Ukuphepha' },
  'nav.settings': { en: 'Settings', zu: 'Izilungiselelo' },
  'nav.logout': { en: 'Logout', zu: 'Phuma' },
  'nav.analytics': { en: 'Analytics', zu: 'Ukuhlaziya' },

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

  // Authentication & Forms
  'auth.login': { en: 'Login', zu: 'Ngena' },
  'auth.email': { en: 'Email', zu: 'I-imeyili' },
  'auth.password': { en: 'Password', zu: 'Iphasiwedi' },
  'auth.sign_in': { en: 'Sign In', zu: 'Ngena' },
  
  // Common Messages
  'common.loading': { en: 'Loading...', zu: 'Kuyalayishwa...' },
  'common.back': { en: 'Back', zu: 'Emuva' },
  'common.email_address': { en: 'Email Address', zu: 'Ikheli le-imeyili' },
  'common.enter_email': { en: 'Enter your email', zu: 'Faka i-imeyili yakho' },
  'common.enter_password': { en: 'Enter your password', zu: 'Faka iphasiwedi yakho' },
  'common.signing_in': { en: 'Signing In...', zu: 'Kuyangena...' },

  // Dashboard Text
  'dashboard.admin': { en: 'Admin Dashboard', zu: 'Ideshibodi Lomphathi' },
  'dashboard.total_users': { en: 'Total Users', zu: 'Abasebenzisi Bonke' },
  'dashboard.system_overview': { en: 'System overview and management', zu: 'Ukubuka kwesistimu nokuphatha' },
  'dashboard.manage_users': { en: 'Manage system users', zu: 'Phatha abasebenzisi besistimu' },
  'dashboard.system_security': { en: 'System security', zu: 'Ukuphepha kwesistimu' },
  'dashboard.performance_health': { en: 'Performance & health', zu: 'Ukusebenza nezempilo' },
  'dashboard.analytics_insights': { en: 'Analytics & insights', zu: 'Ukuhlaziya nemibono' },
  
  // More Common UI Elements  
  'common.add_user': { en: 'Add User', zu: 'Engeza Umsebenzisi' },
  'common.edit_user': { en: 'Edit User', zu: 'Hlela Umsebenzisi' },
  'common.user_management': { en: 'User Management', zu: 'Ukuphatha Abasebenzisi' },
  'common.create': { en: 'Create', zu: 'Yenza' },
  'common.update': { en: 'Update', zu: 'Buyekeza' },
  'common.submit': { en: 'Submit', zu: 'Thumela' },
  'common.reset': { en: 'Reset', zu: 'Setha Kabusha' },
  'common.confirm': { en: 'Confirm', zu: 'Qinisekisa' },
  'common.close': { en: 'Close', zu: 'Vala' },
  'common.status': { en: 'Status', zu: 'Isimo' },
  'common.actions': { en: 'Actions', zu: 'Izenzo' },
  'common.details': { en: 'Details', zu: 'Imininingwane' },
  'common.description': { en: 'Description', zu: 'Incazelo' },
  'common.name': { en: 'Name', zu: 'Igama' },
  'common.type': { en: 'Type', zu: 'Uhlobo' },
  'common.date': { en: 'Date', zu: 'Usuku' },
  'common.time': { en: 'Time', zu: 'Isikhathi' },
  'common.amount': { en: 'Amount', zu: 'Imali' },
  'common.total': { en: 'Total', zu: 'Yonke' },
  'common.balance': { en: 'Balance', zu: 'Isamba' },
  'common.address': { en: 'Address', zu: 'Ikheli' },
  'common.phone': { en: 'Phone', zu: 'Ifoni' },
  'common.role': { en: 'Role', zu: 'Indima' },
  'common.first_name': { en: 'First Name', zu: 'Igama Lokuqala' },
  'common.last_name': { en: 'Last Name', zu: 'Isibongo' },
  'common.full_name': { en: 'Full Name', zu: 'Igama Eliphelele' },
  'common.user_type': { en: 'User Type', zu: 'Uhlobo Lomsebenzisi' },
  'common.select': { en: 'Select', zu: 'Khetha' },
  'common.choose': { en: 'Choose', zu: 'Khetha' },
  'common.upload': { en: 'Upload', zu: 'Layisha' },
  'common.download': { en: 'Download', zu: 'Landa' },
  'common.refresh': { en: 'Refresh', zu: 'Vuselela' },
  'common.filter': { en: 'Filter', zu: 'Hlola' },
  'common.sort': { en: 'Sort', zu: 'Hlela' },
  'common.clear': { en: 'Clear', zu: 'Sula' },
  'common.all': { en: 'All', zu: 'Konke' },
  'common.none': { en: 'None', zu: 'Lutho' },
  'common.yes': { en: 'Yes', zu: 'Yebo' },
  'common.no': { en: 'No', zu: 'Cha' },
  'common.ok': { en: 'OK', zu: 'Kulungile' },
  'common.error': { en: 'Error', zu: 'Iphutha' },
  'common.success': { en: 'Success', zu: 'Impumelelo' },
  'common.warning': { en: 'Warning', zu: 'Isexwayiso' },
  'common.info': { en: 'Information', zu: 'Ulwazi' },
  'common.from_date': { en: 'From Date', zu: 'Kusukela Kusuku' },
  'common.to_date': { en: 'To Date', zu: 'Kuya Kusuku' },
  'payments.monthly_revenue': { en: 'Monthly Revenue', zu: 'Imali Yenyanga' },
  'payments.collection_rate': { en: 'Collection Rate', zu: 'Izinga Lokuqoqa' },

  // Payments
  'payment.title': { en: 'Payments', zu: 'Ukukhokha' },
  'payment.rent_payments': { en: 'Rent Payments', zu: 'Ukukhokha Irenti' },
  'payment.amount_due': { en: 'Amount Due', zu: 'Imali Edingekayo' },
  'payment.due_date': { en: 'Due Date', zu: 'Usuku Lokuphela' },
  'payment.make_payment': { en: 'Make Payment', zu: 'Yenza Inkokhelo' },
  'payment.payment_history': { en: 'Payment History', zu: 'Umlando Wokukhokhela' },
  'payment.total_paid': { en: 'Total Paid', zu: 'Yonke Imali Ekhokhelwe' },

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
  'property.unit': { en: 'Unit', zu: 'Iyunithi' },
  'property.monthlyRent': { en: 'Monthly Rent', zu: 'Irenti Yenyanga' },
  'property.leaseRemaining': { en: 'Lease Remaining', zu: 'Isivumelwano Esisele' },
  'property.days': { en: 'days', zu: 'izinsuku' },
  'property.daysRemaining': { en: 'Days Remaining', zu: 'Izinsuku Ezisele' },
  'property.property': { en: 'Property', zu: 'Ipropathi' },
  'property.available': { en: 'Available', zu: 'Iyatholakala' },
  'property.occupied': { en: 'Occupied', zu: 'Kuhleli umuntu' },
  'property.amenities': { en: 'Amenities', zu: 'Izinsiza' },
  'property.description': { en: 'Description', zu: 'Incazelo' },

  // Payment Management
  'payment.management': { en: 'Payment Management', zu: 'Ukuphatha Ukukhokha' },
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

  // Reports Section
  'reports.title': { en: 'Reports', zu: 'Imibiko' },
  'reports.generate': { en: 'Generate Report', zu: 'Khiqiza Umbiko' },
  'reports.financial': { en: 'Financial Reports', zu: 'Imibiko Yezimali' },
  'reports.occupancy': { en: 'Occupancy Reports', zu: 'Imibiko Yokuhlala' },
  'reports.maintenance': { en: 'Maintenance Reports', zu: 'Imibiko Yokulungisa' },
  'reports.tenant': { en: 'Tenant Reports', zu: 'Imibiko Yabaqashi' },
  'reports.property': { en: 'Property Reports', zu: 'Imibiko Yezindlu' },
  'reports.export': { en: 'Export Report', zu: 'Thumela Umbiko' },
  'reports.type': { en: 'Report Type', zu: 'Uhlobo Lombiko' },
  'reports.custom': { en: 'Custom Report', zu: 'Umbiko Oyaqondisiwe' },
  'reports.performance': { en: 'Performance Report', zu: 'Umbiko Wokusebenza' },
  'reports.available': { en: 'Available Reports', zu: 'Imibiko Etholakalayo' },
  'reports.recent_activity': { en: 'Recent Report Activity', zu: 'Ukusebenza Kwemibiko Yakamuva' },
  'reports.financial_overview': { en: 'Financial Overview', zu: 'Ukubuka Kwezimali' },
  'reports.active_reports': { en: 'Active Reports', zu: 'Imibiko Esebenzayo' },
  
  // Properties Section
  'properties.title': { en: 'Properties', zu: 'Izindlu' },
  'properties.all': { en: 'All Properties', zu: 'Zonke Izindlu' },
  'properties.vacant': { en: 'Vacant Properties', zu: 'Izindlu Ezingekho' },
  'properties.occupied': { en: 'Occupied Properties', zu: 'Izindlu Ezinabantu' },
  'properties.add': { en: 'Add Property', zu: 'Engeza Indlu' },
  'properties.edit': { en: 'Edit Property', zu: 'Hlela Indlu' },
  'properties.delete': { en: 'Delete Property', zu: 'Susa Indlu' },
  'properties.view': { en: 'View Property', zu: 'Buka Indlu' },
  'properties.manage': { en: 'Manage Properties', zu: 'Phatha Izindlu' },
  'properties.bedrooms': { en: 'Bedrooms', zu: 'Amagumbi Okulala' },
  'properties.bathrooms': { en: 'Bathrooms', zu: 'Amagumbi Okugezela' },
  'properties.rent': { en: 'Rent', zu: 'Irenti' },
  'properties.deposit': { en: 'Deposit', zu: 'Idiphozithi' },
  'properties.available': { en: 'Available', zu: 'Iyatholakala' },
  'properties.unavailable': { en: 'Unavailable', zu: 'Ayitholakali' },
  
  // Tenants Section
  'tenants.title': { en: 'Tenants', zu: 'Abaqashi' },
  'tenants.all': { en: 'All Tenants', zu: 'Bonke Abaqashi' },
  'tenants.active': { en: 'Active Tenants', zu: 'Abaqashi Abasebenzayo' },
  'tenants.inactive': { en: 'Inactive Tenants', zu: 'Abaqashi Abangasebenzi' },
  'tenants.add': { en: 'Add Tenant', zu: 'Engeza Umqashi' },
  'tenants.edit': { en: 'Edit Tenant', zu: 'Hlela Umqashi' },
  'tenants.delete': { en: 'Delete Tenant', zu: 'Susa Umqashi' },
  'tenants.view': { en: 'View Tenant', zu: 'Buka Umqashi' },
  'tenants.manage': { en: 'Manage Tenants', zu: 'Phatha Abaqashi' },
  'tenants.contact': { en: 'Contact Tenant', zu: 'Xhumana Nomqashi' },
  'tenants.lease': { en: 'Lease Details', zu: 'Imininingwane Yeqashi' },
  
  // Payments Section
  'payments.title': { en: 'Payments', zu: 'Ukukhokha' },
  'payments.all': { en: 'All Payments', zu: 'Konke Ukukhokha' },
  'payments.pending': { en: 'Pending Payments', zu: 'Ukukhokha Okusalindile' },
  'payments.overdue': { en: 'Overdue Payments', zu: 'Ukukhokha Okweqile' },
  'payments.completed': { en: 'Completed Payments', zu: 'Ukukhokha Okuphelele' },
  'payments.make': { en: 'Make Payment', zu: 'Yenza Inkokhelo' },
  'payments.record': { en: 'Record Payment', zu: 'Bhala Inkokhelo' },
  'payments.history': { en: 'Payment History', zu: 'Umlando Wezikhokho' },
  'payments.methods': { en: 'Payment Methods', zu: 'Izindlela Zokukhokha' },
  'payments.due_date': { en: 'Due Date', zu: 'Usuku Lokukhokhwa' },
  'payments.amount_due': { en: 'Amount Due', zu: 'Imali Ekhokhwayo' },
  'payments.amount_paid': { en: 'Amount Paid', zu: 'Imali Ekhokhiwe' },
  'payments.outstanding': { en: 'Outstanding', zu: 'Esasele' },
  
  // Maintenance Section
  'maintenance.requests': { en: 'Maintenance Requests', zu: 'Izicelo Zokulungisa' },
  'maintenance.all': { en: 'All Requests', zu: 'Zonke Izicelo' },
  'maintenance.pending': { en: 'Pending Requests', zu: 'Izicelo Ezisalindile' },
  'maintenance.in_progress': { en: 'In Progress', zu: 'Iyaqhubeka' },
  'maintenance.completed': { en: 'Completed', zu: 'Kuphelile' },
  'maintenance.cancelled': { en: 'Cancelled', zu: 'Kucinyiwe' },
  'maintenance.new': { en: 'New Request', zu: 'Isicelo Esisha' },
  'maintenance.edit': { en: 'Edit Request', zu: 'Hlela Isicelo' },
  'maintenance.assign': { en: 'Assign Request', zu: 'Nikeza Isicelo' },
  'maintenance.high': { en: 'High', zu: 'Okuphezulu' },
  'maintenance.medium': { en: 'Medium', zu: 'Okuphakathi' },
  'maintenance.low': { en: 'Low', zu: 'Okuphansi' },
  'maintenance.urgent': { en: 'Urgent', zu: 'Okuphuthumayo' },
  'maintenance.schedule': { en: 'Schedule', zu: 'Uhlelo' },
  'maintenance.caretaker': { en: 'Caretaker', zu: 'Umphathi' },
  
  // Leases Section
  'leases.title': { en: 'Leases', zu: 'Amaqashi' },
  'leases.all': { en: 'All Leases', zu: 'Wonke Amaqashi' },
  'leases.active': { en: 'Active Leases', zu: 'Amaqashi Asebenzayo' },
  'leases.expired': { en: 'Expired Leases', zu: 'Amaqashi Aphelelwe' },
  'leases.terminating': { en: 'Terminating Leases', zu: 'Amaqashi Aphela' },
  'leases.renewals': { en: 'Lease Renewals', zu: 'Ukuvuselela Amaqashi' },
  'leases.new': { en: 'New Lease', zu: 'Iqashi Elisha' },
  'leases.create': { en: 'Create Lease', zu: 'Yenza Iqashi' },
  'leases.edit': { en: 'Edit Lease', zu: 'Hlela Iqashi' },
  'leases.terminate': { en: 'Terminate Lease', zu: 'Phela Iqashi' },
  'leases.renew': { en: 'Renew Lease', zu: 'Vuselela Iqashi' },
  'leases.start_date': { en: 'Start Date', zu: 'Usuku Lokuqala' },
  'leases.end_date': { en: 'End Date', zu: 'Usuku Lokugcina' },
  'leases.duration': { en: 'Duration', zu: 'Isikhathi' },
  'leases.monthly_rent': { en: 'Monthly Rent', zu: 'Irenti Yenyanga' },
  
  // Documents Section
  'documents.title': { en: 'Documents', zu: 'Amadokhumenti' },
  'documents.all': { en: 'All Documents', zu: 'Wonke Amadokhumenti' },
  'documents.contracts': { en: 'Contracts', zu: 'Izinkontileka' },
  'documents.invoices': { en: 'Invoices', zu: 'Ama-invoice' },
  'documents.receipts': { en: 'Receipts', zu: 'Amarisidi' },
  'documents.reports': { en: 'Reports', zu: 'Imibiko' },
  'documents.upload': { en: 'Upload Document', zu: 'Layisha Idokhumenti' },
  'documents.generate': { en: 'Generate Document', zu: 'Khiqiza Idokhumenti' },
  'documents.view': { en: 'View Document', zu: 'Buka Idokhumenti' },
  'documents.download': { en: 'Download Document', zu: 'Landa Idokhumenti' },
  'documents.delete': { en: 'Delete Document', zu: 'Susa Idokhumenti' },
  
  'settings.title': { en: 'Settings', zu: 'Izilungiselelo' },
  'settings.profile': { en: 'Profile Settings', zu: 'Izilungiselelo Zephrofayili' },
  'settings.account': { en: 'Account Settings', zu: 'Izilungiselelo Ze-akhawunti' },
  'settings.security': { en: 'Security Settings', zu: 'Izilungiselelo Zokuphepha' },
  'settings.notifications': { en: 'Notification Settings', zu: 'Izilungiselelo Zezaziso' },
  'settings.preferences': { en: 'Preferences', zu: 'Okuthandayo' },
  'settings.password': { en: 'Change Password', zu: 'Shintsha Iphasiwedi' },
  'settings.theme': { en: 'Theme', zu: 'Itimu' },
  'settings.privacy': { en: 'Privacy', zu: 'Ubumfihlo' },
  'settings.backup': { en: 'Backup', zu: 'Backup' },
  'settings.restore': { en: 'Restore', zu: 'Buyisela' },

  // Admin Operations
  'admin.operations': { en: 'Operations Management', zu: 'Ukuphatha Ukusebenza' },
  'admin.operations_desc': { en: 'System performance and health monitoring', zu: 'Ukusebenza kwesistimu nokuqapha impilo' },
  'admin.uptime': { en: 'Uptime', zu: 'Isikhathi Sesistimu' },
  'admin.response': { en: 'Response', zu: 'Ukuphendula' },
  'admin.error_rate': { en: 'Error Rate', zu: 'Izinga Lamaphutha' },
  'admin.health': { en: 'Health', zu: 'Impilo' },
  'admin.system_performance': { en: 'System Performance', zu: 'Ukusebenza Kwesistimu' },
  'admin.performance_analytics': { en: 'Performance Analytics', zu: 'Ukuhlaziya Ukusebenza' },
  'admin.database_health': { en: 'Database Health', zu: 'Impilo Yedathabheyizi' },
  'admin.api_endpoints': { en: 'API Endpoints', zu: 'Izindawo Ze-API' },
  'admin.success_rate': { en: 'success rate', zu: 'izinga lokuphumelela' },
  'admin.system_alerts': { en: 'System Alerts', zu: 'Izexwayiso Zesistimu' },

  // More Admin translations
  'admin.manage_users_desc': { en: 'Manage system users and permissions', zu: 'Phatha abasebenzisi besistimu nemvume' },
  'admin.roles': { en: 'Roles', zu: 'Izindima' },
  'admin.user_list': { en: 'User List', zu: 'Uhlu Lwabasebenzisi' },
  'admin.admin': { en: 'Admin', zu: 'Umphathi' },
  'admin.manager': { en: 'Manager', zu: 'Umphathi' },
  'admin.tenant': { en: 'Tenant', zu: 'Umqashi' },
  'admin.role_distribution': { en: 'Role Distribution', zu: 'Ukuhlukanisa Izindima' },
  'admin.recent_activity': { en: 'Recent Activity', zu: 'Ukusebenza Kwakamuva' },

  // Manager Dashboard translations
  'manager.property_locations': { en: 'Property Locations', zu: 'Izindawo Zezindlu' },
  'manager.interactive_map': { en: 'Interactive Property Map', zu: 'Imephu Yokusebenzisana Nezindlu' },
  'manager.manage_listings': { en: 'Manage listings', zu: 'Phatha uluhlu' },
  'manager.contracts': { en: 'Contracts', zu: 'Izinkontileka' },
  'manager.invoices': { en: 'Invoices', zu: 'Ama-invoice' },
  'manager.generate_manage': { en: 'Generate & manage', zu: 'Khiqiza & phatha' },
  'manager.rent_collection': { en: 'Rent collection', zu: 'Ukuqoqa irenti' },
  'manager.issues': { en: 'Issues', zu: 'Izinkinga' },
  'manager.handle_escalations': { en: 'Handle escalations', zu: 'Phatha ukukhuphuka' },
  'manager.announcements': { en: 'Announcements', zu: 'Izimemezelo' },
  'manager.property_updates': { en: 'Property updates', zu: 'Ukubuyekeza kwezindawo' },

  // More Manager translations
  'manager.manage_portfolio': { en: 'Manage your property portfolio', zu: 'Phatha izindlu zakho' },
  'manager.total_units': { en: 'Total Units', zu: 'Izinyuniti Zonke' },
  'manager.occupied_units': { en: 'Occupied Units', zu: 'Izinyuniti Ezinabantu' },
  'manager.occupancy_rate': { en: 'Occupancy Rate', zu: 'Izinga Lokuhlala' },
  'manager.est_monthly_revenue': { en: 'Est. Monthly Revenue', zu: 'Imali Yenyanga Elindelekile' },
  'manager.add_new_property': { en: 'Add New Property', zu: 'Engeza Indlu Entsha' },
  'manager.search_properties': { en: 'Search your properties...', zu: 'Sesha izindlu zakho...' },
  'manager.properties_found': { en: 'Properties found', zu: 'Izindlu ezitholiwe' },
  'manager.low_bandwidth_mode': { en: 'Low bandwidth mode', zu: 'Imodi yebhendiwidi ephansi' },
  'manager.no_properties_found': { en: 'No properties found', zu: 'Azitholakali izindlu' },
  'manager.no_properties_yet': { en: "You don't have any properties yet. Start by adding one.", zu: 'Awunazindlu okwamanje. Qala ngokwengeza eyodwa.' },
  'manager.adjust_search': { en: 'Try adjusting your search or add a new property.', zu: 'Zama ukushintsha usesho lwakho noma wengeze indlu entsha.' },
  'manager.error_loading': { en: 'Error loading properties', zu: 'Iphutha ekuthatheni izindlu' },
  'common.retry': { en: 'Retry', zu: 'Zama Futhi' },
  'properties.total': { en: 'Total Properties', zu: 'Izindlu Zonke' },

  // Tenant translations
  'tenant.loading_dashboard': { en: 'Loading your dashboard', zu: 'Kulayishwa ideshibodi yakho' },
  'tenant.unit': { en: 'Unit', zu: 'Iyunyithi' },
  'tenant.property': { en: 'Property', zu: 'Indlu' },
  'tenant.offline_message': { en: 'Offline - Please check your connection', zu: 'Akukho kuxhumeke - Qiniseka uxhumeko lwakho' },
  'tenant.lease_information': { en: 'Lease Information', zu: 'Ulwazi Lweqashi' },
  'tenant.monthly_rent': { en: 'Monthly Rent', zu: 'Irenti Yenyanga' },
  'tenant.lease_period': { en: 'Lease Period', zu: 'Isikhathi Seqashi' },
  'tenant.security_deposit': { en: 'Security Deposit', zu: 'Idiphozithi Yokuphepha' },

  // Caretaker translations
  'caretaker.loading_dashboard': { en: 'Loading your dashboard', zu: 'Kulayishwa ideshibodi yakho' },
  'caretaker.tasks': { en: 'Caretaker Tasks', zu: 'Imisebenzi Yomphathi' },
  'caretaker.maintenance_updates': { en: 'Maintenance & updates', zu: 'Ukulungisa & ukubuyekeza' },
  'caretaker.assigned': { en: 'Assigned', zu: 'Kwabelwe' },
  'caretaker.today': { en: 'Today', zu: 'Namhlanje' },
  'caretaker.priority': { en: 'Priority', zu: 'Okuphambili' },
  'caretaker.rate': { en: 'Rate', zu: 'Izinga' },
  'caretaker.task_performance': { en: 'Task Performance', zu: 'Ukusebenza Kwemisebenzi' },
  'caretaker.chart_unavailable': { en: 'Chart unavailable', zu: 'Ishadi ayitholakali' },
  'caretaker.today_tasks': { en: "Today's Tasks", zu: 'Imisebenzi Yanamhlanje' },
  'caretaker.progress': { en: 'Progress', zu: 'Inqubekela' },
  'caretaker.scheduled': { en: 'Scheduled', zu: 'Kuhleliwe' },
  'caretaker.no_tasks': { en: 'No tasks assigned', zu: 'Ayikho imisebenzi eyabiliwe' },

  // Additional Common UI Text
  'common.search': { en: 'Search', zu: 'Sesha' },
  'common.view_all': { en: 'View All', zu: 'Buka Konke' },
  'common.new_request': { en: 'New Request', zu: 'Isicelo Esisha' },
  'common.emergency': { en: 'Emergency', zu: 'Isimo Esiphuthumayo' },
  'common.contact': { en: 'Contact', zu: 'Xhumana' },
  'common.help': { en: 'Help', zu: 'Usizo' },
  'common.support': { en: 'Support', zu: 'Ukweseka' },
  'common.faq': { en: 'FAQ', zu: 'Imibuzo Evamile' },
  'common.documents': { en: 'Documents', zu: 'Amadokhumenti' },
  'common.profile': { en: 'Profile', zu: 'Iphrofayili' },
  'common.lease': { en: 'Lease', zu: 'Iqashi' },
  'common.renew': { en: 'Renew', zu: 'Vuselela' },
  'common.emergency_contacts': { en: 'Emergency Contacts', zu: 'Oxhumana Nabo Esimeni Esiphuthumayo' },
  'common.property_manager': { en: 'Property Manager', zu: 'Umphathi Wendawo' },
  'common.security': { en: 'Security', zu: 'Ukuphepha' },
  'common.fire_department': { en: 'Fire Department', zu: 'Umnyango Womlilo' },
  'common.police': { en: 'Police', zu: 'Amaphoyisa' },
  'common.working_hours': { en: 'Working Hours', zu: 'Amahora Okusebenza' },
  'common.available_24_7': { en: '24/7 Available', zu: 'Kutholakala 24/7' },
  'common.monday_friday': { en: 'Monday - Friday', zu: 'NgoMsombuluko - NgoLwesihlanu' },
  'common.weekend_emergency': { en: 'Weekend Emergency Only', zu: 'Isimo Esiphuthumayo Sempelaviki Kuphela' },
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