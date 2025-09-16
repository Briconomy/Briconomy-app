db = db.getSiblingDB('briconomy');

// Clear existing data (except users which we'll keep)
db.properties.drop();
db.units.drop();
db.leases.drop();
db.payments.drop();
db.maintenance_requests.drop();
db.caretaker_tasks.drop();
db.reports.drop();
db.notifications.drop();
db.settings.drop();
db.audit_logs.drop();

// Get existing users by email to reference them properly
const adminUser = db.users.findOne({ email: 'admin@briconomy.com' });
const manager1User = db.users.findOne({ email: 'manager1@briconomy.com' });
const manager2User = db.users.findOne({ email: 'manager2@briconomy.com' });
const caretaker1User = db.users.findOne({ email: 'caretaker1@briconomy.com' });
const caretaker2User = db.users.findOne({ email: 'caretaker2@briconomy.com' });
const tenant1User = db.users.findOne({ email: 'tenant1@briconomy.com' });
const tenant2User = db.users.findOne({ email: 'tenant2@briconomy.com' });
const tenant3User = db.users.findOne({ email: 'tenant3@briconomy.com' });
const tenant4User = db.users.findOne({ email: 'tenant4@briconomy.com' });
const tenant5User = db.users.findOne({ email: 'tenant5@briconomy.com' });

// Create properties with proper manager assignments
const properties = db.properties.insertMany([
  {
    name: 'Blue Hills Apartments',
    address: '123 Main St, Cape Town, 8001',
    type: 'apartment',
    totalUnits: 24,
    occupiedUnits: 21,
    managerId: manager1User._id,
    amenities: ['pool', 'gym', 'parking', 'security', 'laundry', 'elevator'],
    description: 'Modern apartment complex in the heart of Cape Town with stunning city views',
    yearBuilt: 2018,
    lastRenovation: 2022,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Green Valley Complex',
    address: '456 Oak Ave, Durban, 4001',
    type: 'complex',
    totalUnits: 18,
    occupiedUnits: 16,
    managerId: manager2User._id,
    amenities: ['parking', 'garden', 'playground', 'bbq_area', 'security'],
    description: 'Family-friendly complex with beautiful gardens and recreational facilities',
    yearBuilt: 2015,
    lastRenovation: 2021,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: 'Sunset Towers',
    address: '789 Beach Rd, Port Elizabeth, 6001',
    type: 'apartment',
    totalUnits: 32,
    occupiedUnits: 28,
    managerId: manager1User._id,
    amenities: ['pool', 'gym', 'parking', 'ocean_view', 'concierge', 'spa'],
    description: 'Luxury beachfront apartments with panoramic ocean views',
    yearBuilt: 2020,
    lastRenovation: 2023,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create units with proper property references
const units = db.units.insertMany([
  // Blue Hills Apartments units
  {
    unitNumber: '2A',
    propertyId: properties.insertedIds['0'],
    rent: 12500,
    bedrooms: 2,
    bathrooms: 1,
    sqft: 850,
    status: 'occupied',
    tenantId: tenant1User._id,
    features: ['balcony', 'built_in_cupboards', 'tiled_flooring'],
    floor: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    unitNumber: '1B',
    propertyId: properties.insertedIds['0'],
    rent: 10500,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 650,
    status: 'vacant',
    tenantId: null,
    features: ['garden_view', 'built_in_cupboards'],
    floor: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    unitNumber: '3C',
    propertyId: properties.insertedIds['0'],
    rent: 15000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1200,
    status: 'occupied',
    tenantId: tenant2User._id,
    features: ['balcony', 'ocean_view', 'built_in_cupboards', 'air_conditioning'],
    floor: 3,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    unitNumber: '4D',
    propertyId: properties.insertedIds['0'],
    rent: 8500,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 500,
    status: 'maintenance',
    tenantId: null,
    features: ['garden_view', 'built_in_cupboards'],
    floor: 4,
    maintenanceNotes: 'Plumbing repairs needed',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Green Valley Complex units
  {
    unitNumber: 'A1',
    propertyId: properties.insertedIds['1'],
    rent: 9500,
    bedrooms: 2,
    bathrooms: 1,
    sqft: 750,
    status: 'occupied',
    tenantId: tenant3User._id,
    features: ['garden_access', 'built_in_cupboards', 'parking'],
    floor: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    unitNumber: 'B2',
    propertyId: properties.insertedIds['1'],
    rent: 11500,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 950,
    status: 'occupied',
    tenantId: tenant4User._id,
    features: ['balcony', 'built_in_cupboards', 'air_conditioning', 'parking'],
    floor: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Sunset Towers units
  {
    unitNumber: 'P1',
    propertyId: properties.insertedIds['2'],
    rent: 18000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1100,
    status: 'occupied',
    tenantId: tenant5User._id,
    features: ['penthouse', 'ocean_view', 'balcony', 'air_conditioning', 'concierge_service'],
    floor: 15,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    unitNumber: '8A',
    propertyId: properties.insertedIds['2'],
    rent: 13500,
    bedrooms: 1,
    bathrooms: 1,
    sqft: 700,
    status: 'vacant',
    tenantId: null,
    features: ['ocean_view', 'balcony', 'built_in_cupboards'],
    floor: 8,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create leases with proper references
const leases = db.leases.insertMany([
  {
    tenantId: tenant1User._id,
    unitId: units.insertedIds['0'],
    propertyId: properties.insertedIds['0'],
    startDate: new Date('2024-06-01'),
    endDate: new Date('2025-05-31'),
    monthlyRent: 12500,
    deposit: 25000,
    status: 'active',
    terms: 'Standard residential lease agreement',
    renewalOption: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    tenantId: tenant2User._id,
    unitId: units.insertedIds['2'],
    propertyId: properties.insertedIds['0'],
    startDate: new Date('2024-08-01'),
    endDate: new Date('2025-07-31'),
    monthlyRent: 15000,
    deposit: 30000,
    status: 'active',
    terms: 'Standard residential lease agreement',
    renewalOption: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    tenantId: tenant3User._id,
    unitId: units.insertedIds['4'],
    propertyId: properties.insertedIds['1'],
    startDate: new Date('2024-09-01'),
    endDate: new Date('2025-08-31'),
    monthlyRent: 9500,
    deposit: 19000,
    status: 'active',
    terms: 'Standard residential lease agreement',
    renewalOption: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    tenantId: tenant4User._id,
    unitId: units.insertedIds['5'],
    propertyId: properties.insertedIds['1'],
    startDate: new Date('2024-10-01'),
    endDate: new Date('2025-09-30'),
    monthlyRent: 11500,
    deposit: 23000,
    status: 'active',
    terms: 'Standard residential lease agreement',
    renewalOption: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    tenantId: tenant5User._id,
    unitId: units.insertedIds['6'],
    propertyId: properties.insertedIds['2'],
    startDate: new Date('2024-11-01'),
    endDate: new Date('2025-10-31'),
    monthlyRent: 18000,
    deposit: 36000,
    status: 'active',
    terms: 'Premium residential lease agreement',
    renewalOption: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create payments with proper references
const payments = db.payments.insertMany([
  // Emma Thompson payments
  {
    tenantId: tenant1User._id,
    leaseId: leases.insertedIds['0'],
    amount: 12500,
    paymentDate: new Date('2025-08-01'),
    dueDate: new Date('2025-08-01'),
    status: 'paid',
    type: 'rent',
    method: 'bank_transfer',
    reference: 'RENT-2025-08-001',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    tenantId: tenant1User._id,
    leaseId: leases.insertedIds['0'],
    amount: 12500,
    paymentDate: null,
    dueDate: new Date('2025-09-01'),
    status: 'pending',
    type: 'rent',
    method: null,
    reference: 'RENT-2025-09-001',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // James Smith payments
  {
    tenantId: tenant2User._id,
    leaseId: leases.insertedIds['1'],
    amount: 15000,
    paymentDate: new Date('2025-08-15'),
    dueDate: new Date('2025-08-01'),
    status: 'paid',
    type: 'rent',
    method: 'eft',
    reference: 'RENT-2025-08-002',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    tenantId: tenant2User._id,
    leaseId: leases.insertedIds['1'],
    amount: 15000,
    paymentDate: null,
    dueDate: new Date('2025-09-01'),
    status: 'pending',
    type: 'rent',
    method: null,
    reference: 'RENT-2025-09-002',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Lisa Anderson payments
  {
    tenantId: tenant3User._id,
    leaseId: leases.insertedIds['2'],
    amount: 9500,
    paymentDate: new Date('2025-08-05'),
    dueDate: new Date('2025-08-01'),
    status: 'paid',
    type: 'rent',
    method: 'cash',
    reference: 'RENT-2025-08-003',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Robert Brown payments
  {
    tenantId: tenant4User._id,
    leaseId: leases.insertedIds['3'],
    amount: 11500,
    paymentDate: new Date('2025-08-10'),
    dueDate: new Date('2025-08-01'),
    status: 'paid',
    type: 'rent',
    method: 'bank_transfer',
    reference: 'RENT-2025-08-004',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Maria Garcia payments
  {
    tenantId: tenant5User._id,
    leaseId: leases.insertedIds['4'],
    amount: 18000,
    paymentDate: new Date('2025-08-01'),
    dueDate: new Date('2025-08-01'),
    status: 'paid',
    type: 'rent',
    method: 'bank_transfer',
    reference: 'RENT-2025-08-005',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    tenantId: tenant5User._id,
    leaseId: leases.insertedIds['4'],
    amount: 18000,
    paymentDate: null,
    dueDate: new Date('2025-09-01'),
    status: 'pending',
    type: 'rent',
    method: null,
    reference: 'RENT-2025-09-005',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create maintenance requests with proper references
const maintenanceRequests = db.maintenance_requests.insertMany([
  {
    tenantId: tenant1User._id,
    unitId: units.insertedIds['0'],
    propertyId: properties.insertedIds['0'],
    title: 'AC repair',
    description: 'Air conditioning not working properly, making strange noises and not cooling effectively',
    priority: 'high',
    status: 'in_progress',
    assignedTo: caretaker1User._id,
    estimatedCost: 1500,
    actualCost: null,
    completedDate: null,
    images: ['ac_unit_1.jpg', 'ac_unit_2.jpg'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    tenantId: tenant2User._id,
    unitId: units.insertedIds['2'],
    propertyId: properties.insertedIds['0'],
    title: 'Leaky faucet',
    description: 'Kitchen sink faucet is dripping continuously, wasting water and increasing utility bills',
    priority: 'medium',
    status: 'pending',
    assignedTo: null,
    estimatedCost: 800,
    actualCost: null,
    completedDate: null,
    images: ['faucet_leak.jpg'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    tenantId: tenant3User._id,
    unitId: units.insertedIds['4'],
    propertyId: properties.insertedIds['1'],
    title: 'Broken window',
    description: 'Bedroom window lock is broken, window cannot be closed properly',
    priority: 'high',
    status: 'completed',
    assignedTo: caretaker2User._id,
    estimatedCost: 1200,
    actualCost: 1150,
    completedDate: new Date(Date.now() - 7*24*60*60*1000),
    images: ['broken_window.jpg'],
    createdAt: new Date(Date.now() - 10*24*60*60*1000),
    updatedAt: new Date(Date.now() - 7*24*60*60*1000)
  },
  {
    tenantId: tenant4User._id,
    unitId: units.insertedIds['5'],
    propertyId: properties.insertedIds['1'],
    title: 'Electrical issue',
    description: 'Light switch in living room is not working, seems to be a wiring problem',
    priority: 'high',
    status: 'in_progress',
    assignedTo: caretaker1User._id,
    estimatedCost: 2000,
    actualCost: null,
    completedDate: null,
    images: ['light_switch.jpg'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    tenantId: tenant5User._id,
    unitId: units.insertedIds['6'],
    propertyId: properties.insertedIds['2'],
    title: 'Dishwasher not draining',
    description: 'Dishwasher is not draining properly, water pooling at bottom',
    priority: 'medium',
    status: 'pending',
    assignedTo: null,
    estimatedCost: 1000,
    actualCost: null,
    completedDate: null,
    images: ['dishwasher_issue.jpg'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create caretaker tasks with proper references
const caretakerTasks = db.caretaker_tasks.insertMany([
  {
    caretakerId: caretaker1User._id,
    propertyId: properties.insertedIds['0'],
    title: 'Weekly property inspection',
    description: 'Routine inspection of common areas and exterior, check for maintenance issues',
    dueDate: new Date(Date.now() + 7*24*60*60*1000),
    status: 'pending',
    priority: 'medium',
    estimatedHours: 4,
    actualHours: null,
    completedDate: null,
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    caretakerId: caretaker2User._id,
    propertyId: properties.insertedIds['1'],
    title: 'Garden maintenance',
    description: 'Trim hedges, water plants, and general landscaping of common areas',
    dueDate: new Date(Date.now() + 3*24*60*60*1000),
    status: 'in_progress',
    priority: 'low',
    estimatedHours: 6,
    actualHours: 3,
    completedDate: null,
    notes: 'Started trimming hedges, weather permitting will complete tomorrow',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    caretakerId: caretaker1User._id,
    propertyId: properties.insertedIds['2'],
    title: 'Pool cleaning',
    description: 'Weekly pool maintenance and chemical balancing',
    dueDate: new Date(Date.now() + 2*24*60*60*1000),
    status: 'pending',
    priority: 'medium',
    estimatedHours: 3,
    actualHours: null,
    completedDate: null,
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    caretakerId: caretaker2User._id,
    propertyId: properties.insertedIds['0'],
    title: 'Security system check',
    description: 'Monthly security system inspection and testing',
    dueDate: new Date(Date.now() + 5*24*60*60*1000),
    status: 'pending',
    priority: 'high',
    estimatedHours: 2,
    actualHours: null,
    completedDate: null,
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    caretakerId: caretaker1User._id,
    propertyId: properties.insertedIds['1'],
    title: 'Playground inspection',
    description: 'Safety inspection of playground equipment',
    dueDate: new Date(Date.now() + 10*24*60*60*1000),
    status: 'pending',
    priority: 'medium',
    estimatedHours: 2,
    actualHours: null,
    completedDate: null,
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create reports with proper references
const reports = db.reports.insertMany([
  {
    type: 'financial',
    period: 'monthly',
    propertyId: properties.insertedIds['0'],
    data: {
      totalRevenue: 180000,
      totalExpenses: 45000,
      occupancyRate: 89,
      collectionsRate: 95,
      netIncome: 135000,
      averageRent: 12500,
      maintenanceCosts: 15000,
      utilities: 12000,
      insurance: 8000,
      propertyTaxes: 10000
    },
    generatedBy: manager1User._id,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    type: 'maintenance',
    period: 'weekly',
    propertyId: properties.insertedIds['1'],
    data: {
      completedTasks: 12,
      pendingTasks: 5,
      avgResponseTime: 2.5,
      urgentRequests: 1,
      totalCost: 18500,
      avgResolutionTime: 3.2
    },
    generatedBy: manager2User._id,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    type: 'occupancy',
    period: 'monthly',
    propertyId: properties.insertedIds['2'],
    data: {
      totalUnits: 32,
      occupiedUnits: 28,
      vacantUnits: 4,
      occupancyRate: 87.5,
      turnoverRate: 5.2,
      avgLeaseDuration: 18.5
    },
    generatedBy: manager1User._id,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    type: 'performance',
    period: 'monthly',
    propertyId: properties.insertedIds['0'],
    data: {
      tenantSatisfaction: 4.2,
      maintenanceResponseTime: 2.1,
      rentCollectionRate: 96,
      vacancyRate: 12.5,
      renewalRate: 78
    },
    generatedBy: adminUser._id,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    type: 'financial',
    period: 'quarterly',
    propertyId: properties.insertedIds['1'],
    data: {
      totalRevenue: 540000,
      totalExpenses: 135000,
      occupancyRate: 88.9,
      collectionsRate: 94,
      netIncome: 405000,
      averageRent: 10500,
      maintenanceCosts: 45000,
      utilities: 36000,
      insurance: 24000,
      propertyTaxes: 30000
    },
    generatedBy: manager2User._id,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create notifications with proper references
const notifications = db.notifications.insertMany([
  {
    userId: tenant1User._id,
    title: 'Rent Due Reminder',
    message: 'Your rent payment for September 2025 is due in 5 days. Please ensure payment is made on time to avoid late fees.',
    type: 'payment_reminder',
    read: false,
    priority: 'medium',
    actionRequired: true,
    actionUrl: '/tenant/payments',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: tenant1User._id,
    title: 'Maintenance Request Update',
    message: 'Your AC repair request has been assigned to David Mokoena. He will contact you within 24 hours.',
    type: 'maintenance_update',
    read: false,
    priority: 'high',
    actionRequired: false,
    actionUrl: '/tenant/requests',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: tenant2User._id,
    title: 'Lease Renewal Notice',
    message: 'Your lease expires in 60 days. Please contact management to discuss renewal options.',
    type: 'lease_renewal',
    read: true,
    priority: 'medium',
    actionRequired: true,
    actionUrl: '/tenant/profile',
    createdAt: new Date(Date.now() - 3*24*60*60*1000),
    updatedAt: new Date(Date.now() - 3*24*60*60*1000)
  },
  {
    userId: tenant3User._id,
    title: 'Payment Confirmation',
    message: 'Your rent payment for August 2025 has been successfully processed. Thank you for your payment.',
    type: 'payment_confirmation',
    read: false,
    priority: 'low',
    actionRequired: false,
    actionUrl: '/tenant/payments',
    createdAt: new Date(Date.now() - 2*24*60*60*1000),
    updatedAt: new Date(Date.now() - 2*24*60*60*1000)
  },
  {
    userId: caretaker1User._id,
    title: 'New Maintenance Request',
    message: 'A new high-priority maintenance request has been assigned to you. Please review and take action.',
    type: 'task_assignment',
    read: false,
    priority: 'high',
    actionRequired: true,
    actionUrl: '/caretaker/tasks',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    userId: manager1User._id,
    title: 'Monthly Report Available',
    message: 'The monthly financial report for Blue Hills Apartments is now available for review.',
    type: 'report_available',
    read: false,
    priority: 'medium',
    actionRequired: false,
    actionUrl: '/manager/reports',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create settings with proper references
const settings = db.settings.insertMany([
  {
    key: 'rent_due_day',
    value: '1',
    description: 'Day of month when rent payments are due',
    category: 'payment',
    updatedBy: adminUser._id,
    updatedAt: new Date()
  },
  {
    key: 'late_fee_percentage',
    value: '10',
    description: 'Late fee percentage for overdue rent payments',
    category: 'payment',
    updatedBy: adminUser._id,
    updatedAt: new Date()
  },
  {
    key: 'notification_email_enabled',
    value: 'true',
    description: 'Enable email notifications for users',
    category: 'notification',
    updatedBy: adminUser._id,
    updatedAt: new Date()
  },
  {
    key: 'maintenance_response_time',
    value: '24',
    description: 'Expected response time for maintenance requests (hours)',
    category: 'maintenance',
    updatedBy: adminUser._id,
    updatedAt: new Date()
  },
  {
    key: 'app_version',
    value: '1.0.0',
    description: 'Current application version',
    category: 'system',
    updatedBy: adminUser._id,
    updatedAt: new Date()
  },
  {
    key: 'max_lease_duration',
    value: '24',
    description: 'Maximum lease duration in months',
    category: 'lease',
    updatedBy: adminUser._id,
    updatedAt: new Date()
  },
  {
    key: 'security_deposit_multiplier',
    value: '2',
    description: 'Security deposit as multiplier of monthly rent',
    category: 'payment',
    updatedBy: adminUser._id,
    updatedAt: new Date()
  },
  {
    key: 'emergency_contact_number',
    value: '+27871234567',
    description: 'Emergency contact number for all properties',
    category: 'emergency',
    updatedBy: adminUser._id,
    updatedAt: new Date()
  }
]);

// Create audit logs with proper references
const auditLogs = db.audit_logs.insertMany([
  {
    userId: tenant1User._id,
    action: 'user_login',
    resource: 'authentication',
    details: {
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Android 10; Mobile; rv:81.0)',
      success: true
    },
    timestamp: new Date()
  },
  {
    userId: tenant1User._id,
    action: 'payment_created',
    resource: 'payments',
    details: {
      paymentId: payments.insertedIds['0'],
      amount: 12500,
      method: 'bank_transfer',
      reference: 'RENT-2024-08-001'
    },
    timestamp: new Date()
  },
  {
    userId: tenant1User._id,
    action: 'maintenance_request_created',
    resource: 'maintenance_requests',
    details: {
      requestId: maintenanceRequests.insertedIds['0'],
      priority: 'high',
      title: 'AC repair'
    },
    timestamp: new Date()
  },
  {
    userId: caretaker1User._id,
    action: 'task_assigned',
    resource: 'caretaker_tasks',
    details: {
      taskId: caretakerTasks.insertedIds['0'],
      property: 'Blue Hills Apartments',
      title: 'Weekly property inspection'
    },
    timestamp: new Date()
  },
  {
    userId: manager1User._id,
    action: 'report_generated',
    resource: 'reports',
    details: {
      reportId: reports.insertedIds['0'],
      type: 'financial',
      period: 'monthly',
      property: 'Blue Hills Apartments'
    },
    timestamp: new Date()
  },
  {
    userId: tenant2User._id,
    action: 'profile_updated',
    resource: 'users',
    details: {
      updatedFields: ['phone', 'emergencyContact'],
      previousPhone: '+27823456790',
      newPhone: '+27823456791'
    },
    timestamp: new Date()
  },
  {
    userId: caretaker2User._id,
    action: 'task_completed',
    resource: 'caretaker_tasks',
    details: {
      taskId: maintenanceRequests.insertedIds['2'],
      completionTime: '2 hours',
      cost: 1150
    },
    timestamp: new Date(Date.now() - 7*24*60*60*1000)
  },
  {
    userId: manager2User._id,
    action: 'lease_created',
    resource: 'leases',
    details: {
      leaseId: leases.insertedIds['2'],
      tenantId: tenant3User._id,
      unitId: units.insertedIds['4'],
      monthlyRent: 9500
    },
    timestamp: new Date()
  }
]);

// Update user profiles with lease references
db.users.updateOne(
  { _id: tenant1User._id },
  { $set: { 'profile.leaseId': leases.insertedIds['0'] } }
);

db.users.updateOne(
  { _id: tenant2User._id },
  { $set: { 'profile.leaseId': leases.insertedIds['1'] } }
);

db.users.updateOne(
  { _id: tenant3User._id },
  { $set: { 'profile.leaseId': leases.insertedIds['2'] } }
);

db.users.updateOne(
  { _id: tenant4User._id },
  { $set: { 'profile.leaseId': leases.insertedIds['3'] } }
);

db.users.updateOne(
  { _id: tenant5User._id },
  { $set: { 'profile.leaseId': leases.insertedIds['4'] } }
);

// Update manager profiles with managed properties
db.users.updateOne(
  { _id: manager1User._id },
  { $set: { 'profile.managedProperties': [properties.insertedIds['0'], properties.insertedIds['2']] } }
);

db.users.updateOne(
  { _id: manager2User._id },
  { $set: { 'profile.managedProperties': [properties.insertedIds['1']] } }
);

// Update caretaker profiles with assigned properties
db.users.updateOne(
  { _id: caretaker1User._id },
  { $set: { 'profile.assignedProperty': properties.insertedIds['0'] } }
);

db.users.updateOne(
  { _id: caretaker2User._id },
  { $set: { 'profile.assignedProperty': properties.insertedIds['1'] } }
);

print('Comprehensive relational data initialization completed successfully!');
print('Collections created:');
print('   - properties (' + db.properties.find().count() + ' documents)');
print('   - units (' + db.units.find().count() + ' documents)');
print('   - leases (' + db.leases.find().count() + ' documents)');
print('   - payments (' + db.payments.find().count() + ' documents)');
print('   - maintenance_requests (' + db.maintenance_requests.find().count() + ' documents)');
print('   - caretaker_tasks (' + db.caretaker_tasks.find().count() + ' documents)');
print('   - reports (' + db.reports.find().count() + ' documents)');
print('   - notifications (' + db.notifications.find().count() + ' documents)');
print('   - settings (' + db.settings.find().count() + ' documents)');
print('   - audit_logs (' + db.audit_logs.find().count() + ' documents)');
print('');
print('Data relationships established:');
print('   - Each tenant has a lease and assigned unit');
print('   - Each property has a manager and multiple units');
print('   - Each unit belongs to a property and may have a tenant');
print('   - Payments are linked to tenants and leases');
print('   - Maintenance requests are linked to tenants, units, and properties');
print('   - Caretaker tasks are assigned to caretakers and properties');
print('   - All notifications are linked to appropriate users');
print('   - Audit logs track all user actions');
print('');
print('Database is ready for consistent development!');
