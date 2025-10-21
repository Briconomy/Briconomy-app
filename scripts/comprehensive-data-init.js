db = db.getSiblingDB('briconomy');

// Clear existing data
db.users.drop();
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

const USER_IDS = {
  admin: ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
  manager1: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
  manager2: ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
  caretaker1: ObjectId("67b2a1e0c9e4b8a3d4f5e6a4"),
  caretaker2: ObjectId("67b2a1e0c9e4b8a3d4f5e6a5"),
  tenant1: ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
  tenant2: ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
  tenant3: ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
  tenant4: ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
  tenant5: ObjectId("67b2a1e0c9e4b8a3d4f5e6aa")
};

const PROPERTY_IDS = {
  blueHills: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
  greenValley: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
  sunsetTowers: ObjectId("67b2a1e0c9e4b8a3d4f5e6b3")
};

const UNIT_IDS = {
  blueHills2A: ObjectId("67b2a1e0c9e4b8a3d4f5e6c1"),
  blueHills1B: ObjectId("67b2a1e0c9e4b8a3d4f5e6c2"),
  blueHills3C: ObjectId("67b2a1e0c9e4b8a3d4f5e6c3"),
  blueHills4D: ObjectId("67b2a1e0c9e4b8a3d4f5e6c4"),
  greenValleyA1: ObjectId("67b2a1e0c9e4b8a3d4f5e6c5"),
  greenValleyB2: ObjectId("67b2a1e0c9e4b8a3d4f5e6c6"),
  sunsetTowersP1: ObjectId("67b2a1e0c9e4b8a3d4f5e6c7"),
  sunsetTowers8A: ObjectId("67b2a1e0c9e4b8a3d4f5e6c8")
};

const LEASE_IDS = {
  lease1: ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
  lease2: ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
  lease3: ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
  lease4: ObjectId("67b2a1e0c9e4b8a3d4f5e6d4"),
  lease5: ObjectId("67b2a1e0c9e4b8a3d4f5e6d5")
};

// Create users with proper ObjectIds
db.users.insertMany([
  {
  _id: USER_IDS.admin,
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
  _id: USER_IDS.manager1,
    fullName: 'Michael Chen',
    email: 'manager1@briconomy.com',
    phone: '+27823456789',
    userType: 'manager',
    password: '866485796cfa8d7c0cf7111640205b83076433547577511d81f8030ae99ecea5',
    profile: {"department":"Property Management","employeeId":"MGR001","joinDate":"2023-02-20T00:00:00.000Z"},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
  _id: USER_IDS.manager2,
    fullName: 'Patricia Williams',
    email: 'manager2@briconomy.com',
    phone: '+27825678901',
    userType: 'manager',
    password: '866485796cfa8d7c0cf7111640205b83076433547577511d81f8030ae99ecea5',
    profile: {"department":"Property Management","employeeId":"MGR002","joinDate":"2023-03-10T00:00:00.000Z"},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
  _id: USER_IDS.caretaker1,
    fullName: 'David Mokoena',
    email: 'caretaker1@briconomy.com',
    phone: '+27827890123',
    userType: 'caretaker',
    password: '4cddfbc939614427ff8b719e4f7699528e2481c37d734086b6b7786c5d9ed1aa',
    profile: {"department":"Maintenance","employeeId":"CARE001","joinDate":"2023-04-05T00:00:00.000Z","skills":["plumbing","electrical","general"]},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
  _id: USER_IDS.caretaker2,
    fullName: 'Thabo Ndlovu',
    email: 'caretaker2@briconomy.com',
    phone: '+27829012345',
    userType: 'caretaker',
    password: '4cddfbc939614427ff8b719e4f7699528e2481c37d734086b6b7786c5d9ed1aa',
    profile: {"department":"Maintenance","employeeId":"CARE002","joinDate":"2023-05-12T00:00:00.000Z","skills":["carpentry","painting","landscaping"]},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
  _id: USER_IDS.tenant1,
    fullName: 'Emma Thompson',
    email: 'tenant1@briconomy.com',
    phone: '+27821234568',
    userType: 'tenant',
    password: 'b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33',
    profile: {"emergencyContact":"+27821234569","occupation":"Software Developer","moveInDate":"2023-06-01T00:00:00.000Z"},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
  _id: USER_IDS.tenant2,
    fullName: 'James Smith',
    email: 'tenant2@briconomy.com',
    phone: '+27823456790',
    userType: 'tenant',
    password: 'b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33',
    profile: {"emergencyContact":"+27823456791","occupation":"Teacher","moveInDate":"2023-07-15T00:00:00.000Z"},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
  _id: USER_IDS.tenant3,
    fullName: 'Lisa Anderson',
    email: 'tenant3@briconomy.com',
    phone: '+27825678902',
    userType: 'tenant',
    password: 'b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33',
    profile: {"emergencyContact":"+27825678903","occupation":"Nurse","moveInDate":"2023-08-20T00:00:00.000Z"},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
  _id: USER_IDS.tenant4,
    fullName: 'Robert Brown',
    email: 'tenant4@briconomy.com',
    phone: '+27827890124',
    userType: 'tenant',
    password: 'b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33',
    profile: {"emergencyContact":"+27827890125","occupation":"Engineer","moveInDate":"2023-09-10T00:00:00.000Z"},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
  _id: USER_IDS.tenant5,
    fullName: 'Maria Garcia',
    email: 'tenant5@briconomy.com',
    phone: '+27829012346',
    userType: 'tenant',
    password: 'b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33',
    profile: {"emergencyContact":"+27829012347","occupation":"Designer","moveInDate":"2023-10-05T00:00:00.000Z"},
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

const users = {
  insertedIds: {
    "67b2a1e0c9e4b8a3d4f5e6a1": USER_IDS.admin,
    "67b2a1e0c9e4b8a3d4f5e6a2": USER_IDS.manager1,
    "67b2a1e0c9e4b8a3d4f5e6a3": USER_IDS.manager2,
    "67b2a1e0c9e4b8a3d4f5e6a4": USER_IDS.caretaker1,
    "67b2a1e0c9e4b8a3d4f5e6a5": USER_IDS.caretaker2,
    "67b2a1e0c9e4b8a3d4f5e6a6": USER_IDS.tenant1,
    "67b2a1e0c9e4b8a3d4f5e6a7": USER_IDS.tenant2,
    "67b2a1e0c9e4b8a3d4f5e6a8": USER_IDS.tenant3,
    "67b2a1e0c9e4b8a3d4f5e6a9": USER_IDS.tenant4,
    "67b2a1e0c9e4b8a3d4f5e6aa": USER_IDS.tenant5
  }
};

// Create properties with proper manager assignments
db.properties.insertMany([
  {
  _id: PROPERTY_IDS.blueHills,
    name: 'Blue Hills Apartments',
    address: '123 Main St, Cape Town, 8001',
    type: 'apartment',
    totalUnits: 24,
    occupiedUnits: 21,
  managerId: USER_IDS.manager1,
    amenities: ['pool', 'gym', 'parking', 'security', 'laundry', 'elevator'],
    description: 'Modern apartment complex in the heart of Cape Town with stunning city views',
    yearBuilt: 2018,
    lastRenovation: 2022,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
  _id: PROPERTY_IDS.greenValley,
    name: 'Green Valley Complex',
    address: '456 Oak Ave, Durban, 4001',
    type: 'complex',
    totalUnits: 18,
    occupiedUnits: 16,
  managerId: USER_IDS.manager2,
    amenities: ['parking', 'garden', 'playground', 'bbq_area', 'security'],
    description: 'Family-friendly complex with beautiful gardens and recreational facilities',
    yearBuilt: 2015,
    lastRenovation: 2021,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
  _id: PROPERTY_IDS.sunsetTowers,
    name: 'Sunset Towers',
    address: '789 Beach Rd, Port Elizabeth, 6001',
    type: 'apartment',
    totalUnits: 32,
    occupiedUnits: 28,
  managerId: USER_IDS.manager1,
    amenities: ['pool', 'gym', 'parking', 'ocean_view', 'concierge', 'spa'],
    description: 'Luxury beachfront apartments with panoramic ocean views',
    yearBuilt: 2020,
    lastRenovation: 2023,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

const properties = {
  insertedIds: {
    "67b2a1e0c9e4b8a3d4f5e6b1": PROPERTY_IDS.blueHills,
    "67b2a1e0c9e4b8a3d4f5e6b2": PROPERTY_IDS.greenValley,
    "67b2a1e0c9e4b8a3d4f5e6b3": PROPERTY_IDS.sunsetTowers
  }
};

// Create units with proper property references
db.units.insertMany([
  // Blue Hills Apartments units
  {
  _id: UNIT_IDS.blueHills2A,
    unitNumber: '2A',
  propertyId: PROPERTY_IDS.blueHills,
    rent: 12500,
    bedrooms: 2,
    bathrooms: 1,
    sqft: 850,
    status: 'occupied',
  tenantId: USER_IDS.tenant1,
    features: ['balcony', 'built_in_cupboards', 'tiled_flooring'],
    floor: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
  _id: UNIT_IDS.blueHills1B,
    unitNumber: '1B',
  propertyId: PROPERTY_IDS.blueHills,
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
  _id: UNIT_IDS.blueHills3C,
    unitNumber: '3C',
  propertyId: PROPERTY_IDS.blueHills,
    rent: 15000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1200,
    status: 'occupied',
  tenantId: USER_IDS.tenant2,
    features: ['balcony', 'ocean_view', 'built_in_cupboards', 'air_conditioning'],
    floor: 3,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
  _id: UNIT_IDS.blueHills4D,
    unitNumber: '4D',
  propertyId: PROPERTY_IDS.blueHills,
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
  _id: UNIT_IDS.greenValleyA1,
    unitNumber: 'A1',
  propertyId: PROPERTY_IDS.greenValley,
    rent: 9500,
    bedrooms: 2,
    bathrooms: 1,
    sqft: 750,
    status: 'occupied',
  tenantId: USER_IDS.tenant3,
    features: ['garden_access', 'built_in_cupboards', 'parking'],
    floor: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
  _id: UNIT_IDS.greenValleyB2,
    unitNumber: 'B2',
  propertyId: PROPERTY_IDS.greenValley,
    rent: 11500,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 950,
    status: 'occupied',
  tenantId: USER_IDS.tenant4,
    features: ['balcony', 'built_in_cupboards', 'air_conditioning', 'parking'],
    floor: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Sunset Towers units
  {
  _id: UNIT_IDS.sunsetTowersP1,
    unitNumber: 'P1',
  propertyId: PROPERTY_IDS.sunsetTowers,
    rent: 18000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1100,
    status: 'occupied',
  tenantId: USER_IDS.tenant5,
    features: ['penthouse', 'ocean_view', 'balcony', 'air_conditioning', 'concierge_service'],
    floor: 15,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
  _id: UNIT_IDS.sunsetTowers8A,
    unitNumber: '8A',
  propertyId: PROPERTY_IDS.sunsetTowers,
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

const units = {
  insertedIds: {
    "67b2a1e0c9e4b8a3d4f5e6c1": UNIT_IDS.blueHills2A,
    "67b2a1e0c9e4b8a3d4f5e6c2": UNIT_IDS.blueHills1B,
    "67b2a1e0c9e4b8a3d4f5e6c3": UNIT_IDS.blueHills3C,
    "67b2a1e0c9e4b8a3d4f5e6c4": UNIT_IDS.blueHills4D,
    "67b2a1e0c9e4b8a3d4f5e6c5": UNIT_IDS.greenValleyA1,
    "67b2a1e0c9e4b8a3d4f5e6c6": UNIT_IDS.greenValleyB2,
    "67b2a1e0c9e4b8a3d4f5e6c7": UNIT_IDS.sunsetTowersP1,
    "67b2a1e0c9e4b8a3d4f5e6c8": UNIT_IDS.sunsetTowers8A
  }
};

// Create leases with proper references
db.leases.insertMany([
  {
  _id: LEASE_IDS.lease1,
  tenantId: USER_IDS.tenant1,
  unitId: UNIT_IDS.blueHills2A,
  propertyId: PROPERTY_IDS.blueHills,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    monthlyRent: 12500,
    deposit: 25000,
    status: 'active',
    terms: 'Standard residential lease agreement',
    renewalOption: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
  _id: LEASE_IDS.lease2,
  tenantId: USER_IDS.tenant2,
  unitId: UNIT_IDS.blueHills3C,
  propertyId: PROPERTY_IDS.blueHills,
    startDate: new Date('2024-03-01'),
    endDate: new Date('2025-02-28'),
    monthlyRent: 15000,
    deposit: 30000,
    status: 'active',
    terms: 'Standard residential lease agreement',
    renewalOption: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
  _id: LEASE_IDS.lease3,
  tenantId: USER_IDS.tenant3,
  unitId: UNIT_IDS.greenValleyA1,
  propertyId: PROPERTY_IDS.greenValley,
    startDate: new Date('2024-06-01'),
    endDate: new Date('2025-05-31'),
    monthlyRent: 9500,
    deposit: 19000,
    status: 'active',
    terms: 'Standard residential lease agreement',
    renewalOption: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
  _id: LEASE_IDS.lease4,
  tenantId: USER_IDS.tenant4,
  unitId: UNIT_IDS.greenValleyB2,
  propertyId: PROPERTY_IDS.greenValley,
    startDate: new Date('2024-04-01'),
    endDate: new Date('2025-03-31'),
    monthlyRent: 11500,
    deposit: 23000,
    status: 'active',
    terms: 'Standard residential lease agreement',
    renewalOption: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
  _id: LEASE_IDS.lease5,
  tenantId: USER_IDS.tenant5,
  unitId: UNIT_IDS.sunsetTowersP1,
  propertyId: PROPERTY_IDS.sunsetTowers,
    startDate: new Date('2024-07-01'),
    endDate: new Date('2025-06-30'),
    monthlyRent: 18000,
    deposit: 36000,
    status: 'active',
    terms: 'Premium residential lease agreement',
    renewalOption: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

const leases = {
  insertedIds: {
    "67b2a1e0c9e4b8a3d4f5e6d1": LEASE_IDS.lease1,
    "67b2a1e0c9e4b8a3d4f5e6d2": LEASE_IDS.lease2,
    "67b2a1e0c9e4b8a3d4f5e6d3": LEASE_IDS.lease3,
    "67b2a1e0c9e4b8a3d4f5e6d4": LEASE_IDS.lease4,
    "67b2a1e0c9e4b8a3d4f5e6d5": LEASE_IDS.lease5
  }
};

// Create payments with proper references
const payments = db.payments.insertMany([
  // Emma Thompson payments
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6e1"),
    tenantId: USER_IDS.tenant1,
    leaseId: LEASE_IDS.lease1,
    amount: 12500,
    paymentDate: new Date('2024-08-01'),
    dueDate: new Date('2024-08-01'),
    status: 'paid',
    type: 'rent',
    method: 'bank_transfer',
    reference: 'RENT-2024-08-001',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6e2"),
    tenantId: USER_IDS.tenant1,
    leaseId: LEASE_IDS.lease1,
    amount: 12500,
    paymentDate: null,
    dueDate: new Date('2024-09-01'),
    status: 'pending',
    type: 'rent',
    method: null,
    reference: 'RENT-2024-09-001',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // James Smith payments
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6e3"),
    tenantId: USER_IDS.tenant2,
    leaseId: LEASE_IDS.lease2,
    amount: 15000,
    paymentDate: new Date('2024-08-15'),
    dueDate: new Date('2024-08-01'),
    status: 'paid',
    type: 'rent',
    method: 'eft',
    reference: 'RENT-2024-08-002',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6e4"),
    tenantId: USER_IDS.tenant2,
    leaseId: LEASE_IDS.lease2,
    amount: 15000,
    paymentDate: null,
    dueDate: new Date('2024-09-01'),
    status: 'pending',
    type: 'rent',
    method: null,
    reference: 'RENT-2024-09-002',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Lisa Anderson payments
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6e5"),
    tenantId: USER_IDS.tenant3,
    leaseId: LEASE_IDS.lease3,
    amount: 9500,
    paymentDate: new Date('2024-08-05'),
    dueDate: new Date('2024-08-01'),
    status: 'paid',
    type: 'rent',
    method: 'cash',
    reference: 'RENT-2024-08-003',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Robert Brown payments
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6e6"),
    tenantId: USER_IDS.tenant4,
    leaseId: LEASE_IDS.lease4,
    amount: 11500,
    paymentDate: new Date('2024-08-10'),
    dueDate: new Date('2024-08-01'),
    status: 'paid',
    type: 'rent',
    method: 'bank_transfer',
    reference: 'RENT-2024-08-004',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Maria Garcia payments
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6e7"),
    tenantId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6aa"],
    leaseId: leases.insertedIds["67b2a1e0c9e4b8a3d4f5e6d5"],
    amount: 18000,
    paymentDate: new Date('2024-08-01'),
    dueDate: new Date('2024-08-01'),
    status: 'paid',
    type: 'rent',
    method: 'bank_transfer',
    reference: 'RENT-2024-08-005',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6e8"),
    tenantId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6aa"],
    leaseId: leases.insertedIds["67b2a1e0c9e4b8a3d4f5e6d5"],
    amount: 18000,
    paymentDate: null,
    dueDate: new Date('2024-09-01'),
    status: 'pending',
    type: 'rent',
    method: null,
    reference: 'RENT-2024-09-005',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create maintenance requests with proper references
const maintenanceRequests = db.maintenance_requests.insertMany([
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6f1"),
    tenantId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a6"],
    unitId: units.insertedIds["67b2a1e0c9e4b8a3d4f5e6c1"],
    propertyId: properties.insertedIds["67b2a1e0c9e4b8a3d4f5e6b1"],
    title: 'AC repair',
    description: 'Air conditioning not working properly, making strange noises and not cooling effectively',
    priority: 'high',
    status: 'in_progress',
    assignedTo: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a4"],
    estimatedCost: 1500,
    actualCost: null,
    completedDate: null,
    images: ['ac_unit_1.jpg', 'ac_unit_2.jpg'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6f2"),
    tenantId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a7"],
    unitId: units.insertedIds["67b2a1e0c9e4b8a3d4f5e6c3"],
    propertyId: properties.insertedIds["67b2a1e0c9e4b8a3d4f5e6b1"],
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
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6f3"),
    tenantId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a8"],
    unitId: units.insertedIds["67b2a1e0c9e4b8a3d4f5e6c5"],
    propertyId: properties.insertedIds["67b2a1e0c9e4b8a3d4f5e6b2"],
    title: 'Broken window',
    description: 'Bedroom window lock is broken, window cannot be closed properly',
    priority: 'high',
    status: 'completed',
    assignedTo: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a5"],
    estimatedCost: 1200,
    actualCost: 1150,
    completedDate: new Date(Date.now() - 7*24*60*60*1000),
    images: ['broken_window.jpg'],
    createdAt: new Date(Date.now() - 10*24*60*60*1000),
    updatedAt: new Date(Date.now() - 7*24*60*60*1000)
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6f4"),
    tenantId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a9"],
    unitId: units.insertedIds["67b2a1e0c9e4b8a3d4f5e6c6"],
    propertyId: properties.insertedIds["67b2a1e0c9e4b8a3d4f5e6b2"],
    title: 'Electrical issue',
    description: 'Light switch in living room is not working, seems to be a wiring problem',
    priority: 'high',
    status: 'in_progress',
    assignedTo: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a4"],
    estimatedCost: 2000,
    actualCost: null,
    completedDate: null,
    images: ['light_switch.jpg'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6f5"),
    tenantId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6aa"],
    unitId: units.insertedIds["67b2a1e0c9e4b8a3d4f5e6c7"],
    propertyId: properties.insertedIds["67b2a1e0c9e4b8a3d4f5e6b3"],
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
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e701"),
    caretakerId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a4"],
    propertyId: properties.insertedIds["67b2a1e0c9e4b8a3d4f5e6b1"],
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
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e702"),
    caretakerId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a5"],
    propertyId: properties.insertedIds["67b2a1e0c9e4b8a3d4f5e6b2"],
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
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e703"),
    caretakerId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a4"],
    propertyId: properties.insertedIds["67b2a1e0c9e4b8a3d4f5e6b3"],
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
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e704"),
    caretakerId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a5"],
    propertyId: properties.insertedIds["67b2a1e0c9e4b8a3d4f5e6b1"],
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
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e705"),
    caretakerId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a4"],
    propertyId: properties.insertedIds["67b2a1e0c9e4b8a3d4f5e6b2"],
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
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e711"),
    type: 'financial',
    period: 'monthly',
    propertyId: properties.insertedIds["67b2a1e0c9e4b8a3d4f5e6b1"],
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
    generatedBy: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a2"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e712"),
    type: 'maintenance',
    period: 'weekly',
    propertyId: properties.insertedIds["67b2a1e0c9e4b8a3d4f5e6b2"],
    data: {
      completedTasks: 12,
      pendingTasks: 5,
      avgResponseTime: 2.5,
      urgentRequests: 1,
      totalCost: 18500,
      avgResolutionTime: 3.2
    },
    generatedBy: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a3"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e713"),
    type: 'occupancy',
    period: 'monthly',
    propertyId: properties.insertedIds["67b2a1e0c9e4b8a3d4f5e6b3"],
    data: {
      totalUnits: 32,
      occupiedUnits: 28,
      vacantUnits: 4,
      occupancyRate: 87.5,
      turnoverRate: 5.2,
      avgLeaseDuration: 18.5
    },
    generatedBy: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a2"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e714"),
    type: 'performance',
    period: 'monthly',
    propertyId: properties.insertedIds["67b2a1e0c9e4b8a3d4f5e6b1"],
    data: {
      tenantSatisfaction: 4.2,
      maintenanceResponseTime: 2.1,
      rentCollectionRate: 96,
      vacancyRate: 12.5,
      renewalRate: 78
    },
    generatedBy: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a1"],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e715"),
    type: 'financial',
    period: 'quarterly',
    propertyId: properties.insertedIds["67b2a1e0c9e4b8a3d4f5e6b2"],
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
    generatedBy: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a3"],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// Create notifications with proper references
const _notifications = db.notifications.insertMany([
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e721"),
    userId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a6"],
    title: 'Rent Due Reminder',
    message: 'Your rent payment for September 2024 is due in 5 days. Please ensure payment is made on time to avoid late fees.',
    type: 'payment_reminder',
    read: false,
    priority: 'medium',
    actionRequired: true,
    actionUrl: '/tenant/payments',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e722"),
    userId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a6"],
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
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e723"),
    userId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a7"],
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
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e724"),
    userId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a8"],
    title: 'Payment Confirmation',
    message: 'Your rent payment for August 2024 has been successfully processed. Thank you for your payment.',
    type: 'payment_confirmation',
    read: false,
    priority: 'low',
    actionRequired: false,
    actionUrl: '/tenant/payments',
    createdAt: new Date(Date.now() - 2*24*60*60*1000),
    updatedAt: new Date(Date.now() - 2*24*60*60*1000)
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e725"),
    userId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a4"],
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
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e726"),
    userId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a2"],
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
const _settings = db.settings.insertMany([
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e731"),
    key: 'rent_due_day',
    value: '1',
    description: 'Day of month when rent payments are due',
    category: 'payment',
    updatedBy: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a1"],
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e732"),
    key: 'late_fee_percentage',
    value: '10',
    description: 'Late fee percentage for overdue rent payments',
    category: 'payment',
    updatedBy: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a1"],
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e733"),
    key: 'notification_email_enabled',
    value: 'true',
    description: 'Enable email notifications for users',
    category: 'notification',
    updatedBy: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a1"],
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e734"),
    key: 'maintenance_response_time',
    value: '24',
    description: 'Expected response time for maintenance requests (hours)',
    category: 'maintenance',
    updatedBy: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a1"],
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e735"),
    key: 'app_version',
    value: '1.0.0',
    description: 'Current application version',
    category: 'system',
    updatedBy: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a1"],
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e736"),
    key: 'max_lease_duration',
    value: '24',
    description: 'Maximum lease duration in months',
    category: 'lease',
    updatedBy: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a1"],
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e737"),
    key: 'security_deposit_multiplier',
    value: '2',
    description: 'Security deposit as multiplier of monthly rent',
    category: 'payment',
    updatedBy: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a1"],
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e738"),
    key: 'emergency_contact_number',
    value: '+27871234567',
    description: 'Emergency contact number for all properties',
    category: 'emergency',
    updatedBy: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a1"],
    updatedAt: new Date()
  }
]);

// Create audit logs with proper references
const _auditLogs = db.audit_logs.insertMany([
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e741"),
    userId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a6"],
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
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e742"),
    userId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a6"],
    action: 'payment_created',
    resource: 'payments',
    details: {
      paymentId: payments.insertedIds["67b2a1e0c9e4b8a3d4f5e6e1"],
      amount: 12500,
      method: 'bank_transfer',
      reference: 'RENT-2024-08-001'
    },
    timestamp: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e743"),
    userId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a6"],
    action: 'maintenance_request_created',
    resource: 'maintenance_requests',
    details: {
      requestId: maintenanceRequests.insertedIds["67b2a1e0c9e4b8a3d4f5e6f1"],
      priority: 'high',
      title: 'AC repair'
    },
    timestamp: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e744"),
    userId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a4"],
    action: 'task_assigned',
    resource: 'caretaker_tasks',
    details: {
      taskId: caretakerTasks.insertedIds["67b2a1e0c9e4b8a3d4f5e701"],
      property: 'Blue Hills Apartments',
      title: 'Weekly property inspection'
    },
    timestamp: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e745"),
    userId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a2"],
    action: 'report_generated',
    resource: 'reports',
    details: {
      reportId: reports.insertedIds["67b2a1e0c9e4b8a3d4f5e711"],
      type: 'financial',
      period: 'monthly',
      property: 'Blue Hills Apartments'
    },
    timestamp: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e746"),
    userId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a7"],
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
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e747"),
    userId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a5"],
    action: 'task_completed',
    resource: 'caretaker_tasks',
    details: {
      taskId: maintenanceRequests.insertedIds["67b2a1e0c9e4b8a3d4f5e6f3"],
      completionTime: '2 hours',
      cost: 1150
    },
    timestamp: new Date(Date.now() - 7*24*60*60*1000)
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e748"),
    userId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a3"],
    action: 'lease_created',
    resource: 'leases',
    details: {
      leaseId: leases.insertedIds["67b2a1e0c9e4b8a3d4f5e6d3"],
      tenantId: users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a8"],
      unitId: units.insertedIds["67b2a1e0c9e4b8a3d4f5e6c5"],
      monthlyRent: 9500
    },
    timestamp: new Date()
  }
]);

// Update user profiles with lease references
db.users.updateMany(
  { userType: 'tenant' },
  [
    {
      $set: {
        'profile.leaseId': {
          $switch: {
            branches: [
              { case: { $eq: ['$_id', users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a6"]] }, then: leases.insertedIds["67b2a1e0c9e4b8a3d4f5e6d1"] },
              { case: { $eq: ['$_id', users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a7"]] }, then: leases.insertedIds["67b2a1e0c9e4b8a3d4f5e6d2"] },
              { case: { $eq: ['$_id', users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a8"]] }, then: leases.insertedIds["67b2a1e0c9e4b8a3d4f5e6d3"] },
              { case: { $eq: ['$_id', users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a9"]] }, then: leases.insertedIds["67b2a1e0c9e4b8a3d4f5e6d4"] },
              { case: { $eq: ['$_id', users.insertedIds["67b2a1e0c9e4b8a3d4f5e6aa"]] }, then: leases.insertedIds["67b2a1e0c9e4b8a3d4f5e6d5"] }
            ],
            default: null
          }
        }
      }
    }
  ]
);

// Update manager profiles with managed properties
db.users.updateMany(
  { userType: 'manager' },
  [
    {
      $set: {
        'profile.managedProperties': {
          $switch: {
            branches: [
              { 
                case: { $eq: ['$_id', users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a2"]] }, 
                then: [
                  properties.insertedIds["67b2a1e0c9e4b8a3d4f5e6b1"],
                  properties.insertedIds["67b2a1e0c9e4b8a3d4f5e6b3"]
                ] 
              },
              { 
                case: { $eq: ['$_id', users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a3"]] }, 
                then: [properties.insertedIds["67b2a1e0c9e4b8a3d4f5e6b2"]] 
              }
            ],
            default: []
          }
        }
      }
    }
  ]
);

// Update caretaker profiles with assigned properties
db.users.updateMany(
  { userType: 'caretaker' },
  [
    {
      $set: {
        'profile.assignedProperty': {
          $switch: {
            branches: [
              { case: { $eq: ['$_id', users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a4"]] }, then: properties.insertedIds["67b2a1e0c9e4b8a3d4f5e6b1"] },
              { case: { $eq: ['$_id', users.insertedIds["67b2a1e0c9e4b8a3d4f5e6a5"]] }, then: properties.insertedIds["67b2a1e0c9e4b8a3d4f5e6b2"] }
            ],
            default: null
          }
        }
      }
    }
  ]
);

print('Comprehensive database initialization completed successfully!');
print('Collections created:');
print('   - users (' + db.users.countDocuments({}) + ' documents)');
print('   - properties (' + db.properties.countDocuments({}) + ' documents)');
print('   - units (' + db.units.countDocuments({}) + ' documents)');
print('   - leases (' + db.leases.countDocuments({}) + ' documents)');
print('   - payments (' + db.payments.countDocuments({}) + ' documents)');
print('   - maintenance_requests (' + db.maintenance_requests.countDocuments({}) + ' documents)');
print('   - caretaker_tasks (' + db.caretaker_tasks.countDocuments({}) + ' documents)');
print('   - reports (' + db.reports.countDocuments({}) + ' documents)');
print('   - notifications (' + db.notifications.countDocuments({}) + ' documents)');
print('   - settings (' + db.settings.countDocuments({}) + ' documents)');
print('   - audit_logs (' + db.audit_logs.countDocuments({}) + ' documents)');
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
