db = db.getSiblingDB('briconomy');
db.users.drop();
db.users.insertMany([
  {
    fullName: 'System Administrator',
    email: 'admin@briconomy.com',
    phone: '+27123456789',
    userType: 'admin',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    createdAt: new Date()
  },
  {
    fullName: 'Property Manager',
    email: 'manager@briconomy.com',
    phone: '+27123456790',
    userType: 'manager',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    createdAt: new Date()
  },
  {
    fullName: 'Site Caretaker',
    email: 'caretaker@briconomy.com',
    phone: '+27123456791',
    userType: 'caretaker',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    createdAt: new Date()
  },
  {
    fullName: 'John Tenant',
    email: 'tenant@briconomy.com',
    phone: '+27123456792',
    userType: 'tenant',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    createdAt: new Date()
  },
  {
    fullName: 'Test User',
    email: 'test@test.com',
    phone: '+27123456799',
    userType: 'tenant',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    createdAt: new Date()
  },
  {
    fullName: 'Demo User',
    email: 'demo@demo.com',
    phone: '+27123456800',
    userType: 'manager',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    createdAt: new Date()
  },
  {
    fullName: 'Sample User',
    email: 'user@sample.com',
    phone: '+27123456801',
    userType: 'admin',
    password: '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    createdAt: new Date()
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