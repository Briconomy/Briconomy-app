db = db.getSiblingDB('briconomy');
db.users.drop();
db.users.insertMany([
  {
    fullName: 'Sarah Johnson',
    email: 'admin@briconomy.com',
    phone: '+27821234567',
    userType: 'admin',
    password: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
    profile: {"department":"System Administration","employeeId":"ADMIN001","joinDate":"2023-01-15T00:00:00.000Z"},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    fullName: 'Michael Chen',
    email: 'manager1@briconomy.com',
    phone: '+27823456789',
    userType: 'manager',
    password: '866485796cfa8d7c0cf7111640205b83076433547577511d81f8030ae99ecea5',
    profile: {"department":"Property Management","employeeId":"MGR001","joinDate":"2023-02-20T00:00:00.000Z","managedProperties":[]},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    fullName: 'Patricia Williams',
    email: 'manager2@briconomy.com',
    phone: '+27825678901',
    userType: 'manager',
    password: '866485796cfa8d7c0cf7111640205b83076433547577511d81f8030ae99ecea5',
    profile: {"department":"Property Management","employeeId":"MGR002","joinDate":"2023-03-10T00:00:00.000Z","managedProperties":[]},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    fullName: 'David Mokoena',
    email: 'caretaker1@briconomy.com',
    phone: '+27827890123',
    userType: 'caretaker',
    password: '4cddfbc939614427ff8b719e4f7699528e2481c37d734086b6b7786c5d9ed1aa',
    profile: {"department":"Maintenance","employeeId":"CARE001","joinDate":"2023-04-05T00:00:00.000Z","skills":["plumbing","electrical","general"],"assignedProperty":null},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    fullName: 'Thabo Ndlovu',
    email: 'caretaker2@briconomy.com',
    phone: '+27829012345',
    userType: 'caretaker',
    password: '4cddfbc939614427ff8b719e4f7699528e2481c37d734086b6b7786c5d9ed1aa',
    profile: {"department":"Maintenance","employeeId":"CARE002","joinDate":"2023-05-12T00:00:00.000Z","skills":["carpentry","painting","landscaping"],"assignedProperty":null},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    fullName: 'Emma Thompson',
    email: 'tenant1@briconomy.com',
    phone: '+27821234568',
    userType: 'tenant',
    password: 'b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33',
    profile: {"emergencyContact":"+27821234569","occupation":"Software Developer","moveInDate":"2023-06-01T00:00:00.000Z","leaseId":null},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    fullName: 'James Smith',
    email: 'tenant2@briconomy.com',
    phone: '+27823456790',
    userType: 'tenant',
    password: 'b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33',
    profile: {"emergencyContact":"+27823456791","occupation":"Teacher","moveInDate":"2023-07-15T00:00:00.000Z","leaseId":null},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    fullName: 'Lisa Anderson',
    email: 'tenant3@briconomy.com',
    phone: '+27825678902',
    userType: 'tenant',
    password: 'b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33',
    profile: {"emergencyContact":"+27825678903","occupation":"Nurse","moveInDate":"2023-08-20T00:00:00.000Z","leaseId":null},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    fullName: 'Robert Brown',
    email: 'tenant4@briconomy.com',
    phone: '+27827890124',
    userType: 'tenant',
    password: 'b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33',
    profile: {"emergencyContact":"+27827890125","occupation":"Engineer","moveInDate":"2023-09-10T00:00:00.000Z","leaseId":null},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    fullName: 'Maria Garcia',
    email: 'tenant5@briconomy.com',
    phone: '+27829012346',
    userType: 'tenant',
    password: 'b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33',
    profile: {"emergencyContact":"+27829012347","occupation":"Designer","moveInDate":"2023-10-05T00:00:00.000Z","leaseId":null},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);
db.properties.drop();
db.properties.insertMany([
  {
    name: 'Blue Hills Apartments',
    address: '123 Main St, Cape Town',
    type: 'apartment',
    totalUnits: 24,
    occupiedUnits: 21,
    managerId: ObjectId(),
    amenities: ['pool', 'gym', 'parking', 'security'],
    createdAt: new Date()
  },
  {
    name: 'Green Valley Complex',
    address: '456 Oak Ave, Durban',
    type: 'complex',
    totalUnits: 18,
    occupiedUnits: 16,
    managerId: ObjectId(),
    amenities: ['parking', 'garden', 'playground'],
    createdAt: new Date()
  },
  {
    name: 'Sunset Towers',
    address: '789 Beach Rd, Port Elizabeth',
    type: 'apartment',
    totalUnits: 32,
    occupiedUnits: 28,
    managerId: ObjectId(),
    amenities: ['pool', 'gym', 'parking', 'ocean_view'],
    createdAt: new Date()
  }
]);

db.units.drop();
db.units.insertMany([
  {
    unitNumber: '2A',
    propertyId: ObjectId(),
    rent: 12500,
    bedrooms: 2,
    bathrooms: 1,
    sqft: 850,
    status: 'occupied',
    tenantId: ObjectId(),
    createdAt: new Date()
  },
  {
    unitNumber: '1B',
    propertyId: ObjectId(),
    rent: 10500,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 650,
    status: 'vacant',
    tenantId: null,
    createdAt: new Date()
  },
  {
    unitNumber: '3C',
    propertyId: ObjectId(),
    rent: 15000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1200,
    status: 'occupied',
    tenantId: ObjectId(),
    createdAt: new Date()
  },
  {
    unitNumber: '4D',
    propertyId: ObjectId(),
    rent: 8500,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 500,
    status: 'maintenance',
    tenantId: null,
    createdAt: new Date()
  }
]);

db.leases.drop();
db.leases.insertMany([
  {
    tenantId: ObjectId(),
    unitId: ObjectId(),
    propertyId: ObjectId(),
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    monthlyRent: 12500,
    deposit: 25000,
    status: 'active',
    createdAt: new Date()
  },
  {
    tenantId: ObjectId(),
    unitId: ObjectId(),
    propertyId: ObjectId(),
    startDate: new Date('2024-03-01'),
    endDate: new Date('2025-02-28'),
    monthlyRent: 15000,
    deposit: 30000,
    status: 'active',
    createdAt: new Date()
  }
]);

db.payments.drop();
db.payments.insertMany([
  {
    tenantId: ObjectId(),
    leaseId: ObjectId(),
    amount: 12500,
    paymentDate: new Date('2024-08-01'),
    dueDate: new Date('2024-08-01'),
    status: 'paid',
    type: 'rent',
    method: 'bank_transfer',
    createdAt: new Date()
  },
  {
    tenantId: ObjectId(),
    leaseId: ObjectId(),
    amount: 12500,
    paymentDate: null,
    dueDate: new Date('2024-09-01'),
    status: 'pending',
    type: 'rent',
    method: null,
    createdAt: new Date()
  },
  {
    tenantId: ObjectId(),
    leaseId: ObjectId(),
    amount: 15000,
    paymentDate: new Date('2024-08-15'),
    dueDate: new Date('2024-08-01'),
    status: 'paid',
    type: 'rent',
    method: 'eft',
    createdAt: new Date()
  }
]);

db.maintenance_requests.drop();
db.maintenance_requests.insertMany([
  {
    tenantId: ObjectId(),
    unitId: ObjectId(),
    propertyId: ObjectId(),
    title: 'AC repair',
    description: 'Air conditioning not working properly, making strange noises',
    priority: 'high',
    status: 'in_progress',
    assignedTo: ObjectId(),
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    tenantId: ObjectId(),
    unitId: ObjectId(),
    propertyId: ObjectId(),
    title: 'Leaky faucet',
    description: 'Kitchen sink faucet is dripping continuously',
    priority: 'medium',
    status: 'pending',
    assignedTo: null,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    tenantId: ObjectId(),
    unitId: ObjectId(),
    propertyId: ObjectId(),
    title: 'Broken window',
    description: 'Bedroom window lock is broken',
    priority: 'high',
    status: 'completed',
    assignedTo: ObjectId(),
    createdAt: new Date(Date.now() - 7*24*60*60*1000),
    updatedAt: new Date()
  }
]);

db.caretaker_tasks.drop();
db.caretaker_tasks.insertMany([
  {
    caretakerId: ObjectId(),
    propertyId: ObjectId(),
    title: 'Weekly property inspection',
    description: 'Routine inspection of common areas and exterior',
    dueDate: new Date(Date.now() + 7*24*60*60*1000),
    status: 'pending',
    priority: 'medium',
    createdAt: new Date()
  },
  {
    caretakerId: ObjectId(),
    propertyId: ObjectId(),
    title: 'Garden maintenance',
    description: 'Trim hedges, water plants, and general landscaping',
    dueDate: new Date(Date.now() + 3*24*60*60*1000),
    status: 'in_progress',
    priority: 'low',
    createdAt: new Date()
  },
  {
    caretakerId: ObjectId(),
    propertyId: ObjectId(),
    title: 'Pool cleaning',
    description: 'Weekly pool maintenance and chemical balancing',
    dueDate: new Date(Date.now() + 2*24*60*60*1000),
    status: 'pending',
    priority: 'medium',
    createdAt: new Date()
  }
]);

db.reports.drop();
db.reports.insertMany([
  {
    type: 'financial',
    period: 'monthly',
    propertyId: ObjectId(),
    data: {
      totalRevenue: 180000,
      totalExpenses: 45000,
      occupancyRate: 89,
      collectionsRate: 95,
      netIncome: 135000
    },
    generatedBy: ObjectId(),
    createdAt: new Date()
  },
  {
    type: 'maintenance',
    period: 'weekly',
    propertyId: ObjectId(),
    data: {
      completedTasks: 12,
      pendingTasks: 5,
      avgResponseTime: 2.5,
      urgentRequests: 1
    },
    generatedBy: ObjectId(),
    createdAt: new Date()
  },
  {
    type: 'occupancy',
    period: 'monthly',
    propertyId: ObjectId(),
    data: {
      totalUnits: 24,
      occupiedUnits: 21,
      vacantUnits: 3,
      occupancyRate: 87.5
    },
    generatedBy: ObjectId(),
    createdAt: new Date()
  }
]);

db.notifications.drop();
db.notifications.insertMany([
  {
    userId: ObjectId(),
    title: 'Rent Due Reminder',
    message: 'Your rent payment for September 2024 is due in 5 days',
    type: 'payment_reminder',
    read: false,
    createdAt: new Date()
  },
  {
    userId: ObjectId(),
    title: 'Maintenance Request Update',
    message: 'Your AC repair request has been assigned to a technician',
    type: 'maintenance_update',
    read: false,
    createdAt: new Date()
  },
  {
    userId: ObjectId(),
    title: 'Lease Renewal Notice',
    message: 'Your lease expires in 60 days. Please contact management.',
    type: 'lease_renewal',
    read: true,
    createdAt: new Date(Date.now() - 3*24*60*60*1000)
  }
]);
db.settings.drop();
db.settings.insertMany([
  {
    key: 'rent_due_day',
    value: '1',
    description: 'Day of month when rent payments are due',
    updatedBy: ObjectId(),
    updatedAt: new Date()
  },
  {
    key: 'late_fee_percentage',
    value: '10',
    description: 'Late fee percentage for overdue rent payments',
    updatedBy: ObjectId(),
    updatedAt: new Date()
  },
  {
    key: 'notification_email_enabled',
    value: 'true',
    description: 'Enable email notifications for users',
    updatedBy: ObjectId(),
    updatedAt: new Date()
  },
  {
    key: 'maintenance_response_time',
    value: '24',
    description: 'Expected response time for maintenance requests (hours)',
    updatedBy: ObjectId(),
    updatedAt: new Date()
  },
  {
    key: 'app_version',
    value: '1.0.0',
    description: 'Current application version',
    updatedBy: ObjectId(),
    updatedAt: new Date()
  }
]);

db.audit_logs.drop();
db.audit_logs.insertMany([
  {
    userId: ObjectId(),
    action: 'user_login',
    resource: 'authentication',
    details: {
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Android 10; Mobile; rv:81.0)'
    },
    timestamp: new Date()
  },
  {
    userId: ObjectId(),
    action: 'payment_created',
    resource: 'payments',
    details: {
      paymentId: ObjectId(),
      amount: 12500,
      method: 'bank_transfer'
    },
    timestamp: new Date()
  },
  {
    userId: ObjectId(),
    action: 'maintenance_request_created',
    resource: 'maintenance_requests',
    details: {
      requestId: ObjectId(),
      priority: 'high',
      title: 'AC repair'
    },
    timestamp: new Date()
  }
]);

db.system_stats.drop();
db.system_stats.insertMany([
  {
    category: 'overview',
    totalUsers: 156,
    totalProperties: 24,
    uptime: '99.9%',
    responseTime: '245ms',
    lastUpdated: new Date()
  },
  {
    category: 'performance',
    uptime: '99.9%',
    responseTime: '245ms',
    errorRate: '0.1%',
    health: '98%',
    lastUpdated: new Date()
  }
]);

db.user_stats.drop();
db.user_stats.insertMany([
  {
    totalUsers: 10,
    activeUsers: 8,
    totalRoles: 5,
    pendingUsers: 2,
    lastUpdated: new Date()
  }
]);

db.user_activities.drop();
db.user_activities.insertMany([
  {
    userId: ObjectId(),
    action: 'User login: Sarah Johnson',
    timestamp: new Date(Date.now() - 2*60*1000),
    type: 'login'
  },
  {
    userId: ObjectId(),
    action: 'User created: Maria Garcia',
    timestamp: new Date(Date.now() - 60*60*1000),
    type: 'user_creation'
  },
  {
    userId: ObjectId(),
    action: 'Password updated: James Smith',
    timestamp: new Date(Date.now() - 3*60*60*1000),
    type: 'password_update'
  }
]);

db.security_stats.drop();
db.security_stats.insertMany([
  {
    secureStatus: '100%',
    threats: 0,
    monitoring: '24/7',
    twoFactorEnabled: '2FA',
    lastUpdated: new Date()
  }
]);

db.security_config.drop();
db.security_config.insertMany([
  {
    method: 'SSO Authentication',
    description: 'Google and institutional login',
    status: 'active',
    category: 'authentication'
  },
  {
    method: 'Biometric Login',
    description: 'Fingerprint and facial recognition',
    status: 'active',
    category: 'authentication'
  },
  {
    method: 'Traditional Login',
    description: 'Email and password authentication',
    status: 'active',
    category: 'authentication'
  }
]);

db.security_alerts.drop();
db.security_alerts.insertMany([
  {
    title: 'System security scan completed',
    message: '5 minutes ago - No threats detected',
    severity: 'info',
    timestamp: new Date(Date.now() - 5*60*1000)
  },
  {
    title: 'Password policy updated',
    message: '1 hour ago - Minimum 12 characters required',
    severity: 'warning',
    timestamp: new Date(Date.now() - 60*60*1000)
  },
  {
    title: '2FA enrollment increased by 15%',
    message: '3 hours ago - Enhanced security adoption',
    severity: 'success',
    timestamp: new Date(Date.now() - 3*60*60*1000)
  }
]);

db.security_settings.drop();
db.security_settings.insertMany([
  {
    setting: 'Session Timeout',
    value: '30 minutes',
    configurable: true
  },
  {
    setting: 'Password Expiry',
    value: '90 days',
    configurable: true
  },
  {
    setting: 'Max Login Attempts',
    value: '5 attempts',
    configurable: true
  },
  {
    setting: 'IP Whitelist',
    value: 'Disabled',
    configurable: true
  },
  {
    setting: 'Audit Logging',
    value: 'Enabled',
    configurable: false
  },
  {
    setting: 'Encryption Standard',
    value: 'AES-256',
    configurable: false
  }
]);

db.financial_stats.drop();
db.financial_stats.insertMany([
  {
    category: 'monthly',
    monthlyRevenue: 840000,
    occupancyRate: 88,
    collectionRate: 95,
    activeReports: 24,
    lastUpdated: new Date()
  }
]);

db.available_reports.drop();
db.available_reports.insertMany([
  {
    title: 'Monthly Financial Report',
    description: 'Revenue, expenses, and profit analysis',
    status: 'ready',
    type: 'financial'
  },
  {
    title: 'Property Performance Report',
    description: 'Occupancy rates and property metrics',
    status: 'ready',
    type: 'property'
  },
  {
    title: 'Maintenance Summary Report',
    description: 'Maintenance costs and resolution times',
    status: 'processing',
    type: 'maintenance'
  }
]);

db.report_activities.drop();
db.report_activities.insertMany([
  {
    action: 'Monthly Financial Report generated',
    details: 'Generated by Sarah Johnson',
    timestamp: new Date(Date.now() - 2*60*60*1000)
  },
  {
    action: 'Property Performance Report downloaded',
    details: 'Downloaded by Michael Chen',
    timestamp: new Date(Date.now() - 5*60*60*1000)
  },
  {
    action: 'Custom Occupancy Report generated',
    details: 'Generated by Patricia Williams',
    timestamp: new Date(Date.now() - 24*60*60*1000)
  }
]);

db.database_health.drop();
db.database_health.insertMany([
  {
    metric: 'MongoDB Connection',
    value: 'Response time: 12ms',
    status: 'healthy'
  },
  {
    metric: 'Database Size',
    value: '156 documents across 11 collections',
    status: 'normal',
    size: '2.4 GB'
  },
  {
    metric: 'Index Performance',
    value: 'All queries using indexes efficiently',
    status: 'optimal'
  }
]);

db.api_endpoints.drop();
db.api_endpoints.insertMany([
  {
    endpoint: 'Authentication API',
    successRate: 100,
    responseTime: '200ms',
    status: 'good'
  },
  {
    endpoint: 'Property Management API',
    successRate: 99.8,
    responseTime: '180ms',
    status: 'good'
  },
  {
    endpoint: 'Payment Processing API',
    successRate: 98.5,
    responseTime: '350ms',
    status: 'warning'
  }
]);

db.system_alerts.drop();
db.system_alerts.insertMany([
  {
    title: 'System backup completed successfully',
    message: 'All data secured',
    severity: 'success',
    timestamp: new Date(Date.now() - 2*60*60*1000)
  },
  {
    title: 'High memory usage detected',
    message: 'Currently at 78% utilization',
    severity: 'warning',
    timestamp: new Date(Date.now() - 4*60*60*1000)
  },
  {
    title: 'Performance optimization applied',
    message: '15% improvement in response times',
    severity: 'info',
    timestamp: new Date(Date.now() - 6*60*60*1000)
  }
]);

print('Database initialization completed successfully!');
print('Collections created:');
print('   - users (' + db.users.countDocuments() + ' documents)');
print('   - properties (' + db.properties.countDocuments() + ' documents)');
print('   - units (' + db.units.countDocuments() + ' documents)');
print('   - leases (' + db.leases.countDocuments() + ' documents)');
print('   - payments (' + db.payments.countDocuments() + ' documents)');
print('   - maintenance_requests (' + db.maintenance_requests.countDocuments() + ' documents)');
print('   - caretaker_tasks (' + db.caretaker_tasks.countDocuments() + ' documents)');
print('   - reports (' + db.reports.countDocuments() + ' documents)');
print('   - notifications (' + db.notifications.countDocuments() + ' documents)');
print('   - settings (' + db.settings.countDocuments() + ' documents)');
print('   - audit_logs (' + db.audit_logs.countDocuments() + ' documents)');
print('   - system_stats (' + db.system_stats.countDocuments() + ' documents)');
print('   - user_stats (' + db.user_stats.countDocuments() + ' documents)');
print('   - user_activities (' + db.user_activities.countDocuments() + ' documents)');
print('   - security_stats (' + db.security_stats.countDocuments() + ' documents)');
print('   - security_config (' + db.security_config.countDocuments() + ' documents)');
print('   - security_alerts (' + db.security_alerts.countDocuments() + ' documents)');
print('   - security_settings (' + db.security_settings.countDocuments() + ' documents)');
print('   - financial_stats (' + db.financial_stats.countDocuments() + ' documents)');
print('   - available_reports (' + db.available_reports.countDocuments() + ' documents)');
print('   - report_activities (' + db.report_activities.countDocuments() + ' documents)');
print('   - database_health (' + db.database_health.countDocuments() + ' documents)');
print('   - api_endpoints (' + db.api_endpoints.countDocuments() + ' documents)');
print('   - system_alerts (' + db.system_alerts.countDocuments() + ' documents)');