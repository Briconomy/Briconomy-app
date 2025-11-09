import { MongoClient, ObjectId as BsonObjectId } from "npm:mongodb";

const MONGO_URI = Deno.env.get("MONGO_URI") ?? "mongodb://127.0.0.1:27017";
// #COMPLETION_DRIVE: Assuming local MongoDB is accessible when no MONGO_URI is provided
// #SUGGEST_VERIFY: Set MONGO_URI env var if the database runs on a different host
const DB_NAME = Deno.env.get("DB_NAME") ?? "briconomy";
// #COMPLETION_DRIVE: Assuming default database name remains briconomy unless overridden
// #SUGGEST_VERIFY: Export DB_NAME env var if the project uses another database

// Create users with proper ObjectIds
const _users = db.users.insertMany([
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
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
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
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
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
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
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6a4"),
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
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6a5"),
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
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
    fullName: 'Emma Thompson',
    email: 'tenant1@briconomy.com',
    phone: '+27821234568',
    userType: 'tenant',
    password: 'b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33',
    profile: {
      emergencyContact: {
        name: "John Thompson",
        phone: "+27821234569",
        relationship: "Brother"
      },
      occupation: "Software Developer",
      moveInDate: "2023-06-01",
      leaseDuration: "12",
      unitNumber: "2A",
      monthlyIncome: 65000
    },
    assignedPropertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
    unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c1"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
    appliedUnitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c1"),
    appliedUnitNumber: "2A",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
    fullName: 'James Smith',
    email: 'tenant2@briconomy.com',
    phone: '+27823456790',
    userType: 'tenant',
    password: 'b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33',
    profile: {
      emergencyContact: {
        name: "Mary Smith",
        phone: "+27823456791",
        relationship: "Wife"
      },
      occupation: "Teacher",
      moveInDate: "2023-07-15",
      leaseDuration: "12",
      unitNumber: "3C",
      monthlyIncome: 48000
    },
    assignedPropertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
    unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c3"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
    appliedUnitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c3"),
    appliedUnitNumber: "3C",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
    fullName: 'Lisa Anderson',
    email: 'tenant3@briconomy.com',
    phone: '+27825678902',
    userType: 'tenant',
    password: 'b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33',
    profile: {
      emergencyContact: {
        name: "David Anderson",
        phone: "+27825678903",
        relationship: "Brother"
      },
      occupation: "Nurse",
      moveInDate: "2023-08-20",
      leaseDuration: "12",
      unitNumber: "A1",
      monthlyIncome: 55000
    },
    assignedPropertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
    unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c5"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
    appliedUnitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c5"),
    appliedUnitNumber: "A1",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
    fullName: 'Robert Brown',
    email: 'tenant4@briconomy.com',
    phone: '+27827890124',
    userType: 'tenant',
    password: 'b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33',
    profile: {
      emergencyContact: {
        name: "Susan Brown",
        phone: "+27827890125",
        relationship: "Sister"
      },
      occupation: "Engineer",
      moveInDate: "2023-09-10",
      leaseDuration: "12",
      unitNumber: "B2",
      monthlyIncome: 72000
    },
    assignedPropertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
    unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c6"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
    appliedUnitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c6"),
    appliedUnitNumber: "B2",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
    fullName: 'Maria Garcia',
    email: 'tenant5@briconomy.com',
    phone: '+27829012346',
    userType: 'tenant',
    password: 'b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33',
    profile: {
      emergencyContact: {
        name: "Carlos Garcia",
        phone: "+27829012347",
        relationship: "Father"
      },
      occupation: "Designer",
      moveInDate: "2023-10-05",
      leaseDuration: "12",
      unitNumber: "P1",
      monthlyIncome: 52000
    },
    assignedPropertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
    unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c7"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
    appliedUnitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c7"),
    appliedUnitNumber: "P1",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }

// Create properties with proper manager assignments
db.properties.insertMany([
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
    name: 'Blue Hills Apartments',
    address: '123 Main St, Cape Town, 8001',
    type: 'apartment',
    totalUnits: 24,
    occupiedUnits: 5,
    managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
    amenities: ['pool', 'gym', 'parking', 'security', 'laundry', 'elevator'],
    description: 'Modern apartment complex in the heart of Cape Town with stunning city views',
    yearBuilt: 2018,
    lastRenovation: 2022,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
    name: 'Green Valley Complex',
    address: '456 Oak Ave, Durban, 4001',
    type: 'complex',
    totalUnits: 18,
    occupiedUnits: 5,
    managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
    amenities: ['parking', 'garden', 'playground', 'bbq_area', 'security'],
    description: 'Family-friendly complex with beautiful gardens and recreational facilities',
    yearBuilt: 2015,
    lastRenovation: 2021,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
    name: 'Sunset Towers',
    address: '789 Beach Rd, Port Elizabeth, 6001',
    type: 'apartment',
    totalUnits: 32,
    occupiedUnits: 5,
    managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
    amenities: ['pool', 'gym', 'parking', 'ocean_view', 'concierge', 'spa'],
    description: 'Luxury beachfront apartments with panoramic ocean views',
    yearBuilt: 2020,
    lastRenovation: 2023,
    createdAt: new Date(),
    updatedAt: new Date()
  }

// Create units with proper property references
db.units.insertMany([
  // Blue Hills Apartments units
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6c1"),
    unitNumber: '2A',
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
    rent: 12500,
    bedrooms: 2,
    bathrooms: 1,
    sqft: 850,
    status: 'occupied',
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
    features: ['balcony', 'built_in_cupboards', 'tiled_flooring'],
    floor: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6c2"),
    unitNumber: '1B',
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
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
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6c3"),
    unitNumber: '3C',
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
    rent: 15000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1200,
    status: 'occupied',
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
    features: ['balcony', 'ocean_view', 'built_in_cupboards', 'air_conditioning'],
    floor: 3,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6c4"),
    unitNumber: '4D',
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
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
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6c5"),
    unitNumber: 'A1',
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
    rent: 9500,
    bedrooms: 2,
    bathrooms: 1,
    sqft: 750,
    status: 'occupied',
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
    features: ['garden_access', 'built_in_cupboards', 'parking'],
    floor: 1,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6c6"),
    unitNumber: 'B2',
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
    rent: 11500,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 950,
    status: 'occupied',
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
    features: ['balcony', 'built_in_cupboards', 'air_conditioning', 'parking'],
    floor: 2,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Sunset Towers units
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6c7"),
    unitNumber: 'P1',
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
    rent: 18000,
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1100,
    status: 'occupied',
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
    features: ['penthouse', 'ocean_view', 'balcony', 'air_conditioning', 'concierge_service'],
    floor: 15,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6c8"),
    unitNumber: '8A',
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
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

// Create leases with proper references
const leases = db.leases.insertMany([
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
    unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c1"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
    startDate: new Date('2025-10-01'),
    endDate: new Date('2026-09-30'),
    monthlyRent: 12500,
    deposit: 25000,
    status: 'active',
    terms: 'Standard residential lease agreement',
    renewalOption: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
    unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c3"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
    startDate: new Date('2025-09-01'),
    endDate: new Date('2026-08-31'),
    monthlyRent: 15000,
    deposit: 30000,
    status: 'active',
    terms: 'Standard residential lease agreement',
    renewalOption: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
    unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c5"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
    startDate: new Date('2025-08-01'),
    endDate: new Date('2026-07-31'),
    monthlyRent: 9500,
    deposit: 19000,
    status: 'active',
    terms: 'Standard residential lease agreement',
    renewalOption: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6d4"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
    unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c6"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
    startDate: new Date('2025-07-01'),
    endDate: new Date('2026-06-30'),
    monthlyRent: 11500,
    deposit: 23000,
    status: 'active',
    terms: 'Standard residential lease agreement',
    renewalOption: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6d5"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
    unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c7"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
    startDate: new Date('2025-10-15'),
    endDate: new Date('2026-10-14'),
    monthlyRent: 18000,
    deposit: 36000,
    status: 'active',
    terms: 'Premium residential lease agreement',
    renewalOption: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }

// Create invoices with proper references
const _invoices = db.invoices.insertMany([
  // Emma Thompson invoices (Lease 1, 12500/month)
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6f1"),
    invoiceNumber: 'INV-2025-08',
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
    managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
    amount: 12500,
    issueDate: new Date('2025-08-01'),
    dueDate: new Date('2025-08-15'),
    status: 'paid',
    month: '8',
    year: 2025,
    description: 'Monthly rent for August 2025',
    createdAt: new Date('2025-08-01'),
    updatedAt: new Date('2025-08-01')
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6f2"),
    invoiceNumber: 'INV-2025-09',
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
    managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
    amount: 12500,
    issueDate: new Date('2025-09-01'),
    dueDate: new Date('2025-09-25'),
    status: 'overdue',
    month: '9',
    year: 2025,
    description: 'Monthly rent for September 2025',
    overdueAt: new Date('2025-09-26'),
    createdAt: new Date('2025-09-01'),
    updatedAt: new Date('2025-09-26')
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6f3"),
    invoiceNumber: 'INV-2025-10',
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
    managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
    amount: 12500,
    issueDate: new Date('2025-10-01'),
    dueDate: new Date('2025-10-31'),
    status: 'pending',
    month: '10',
    year: 2025,
    description: 'Monthly rent for October 2025',
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-01')
  },
  // James Smith invoices (Lease 2, 15000/month) - Has overdue from September
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6f4"),
    invoiceNumber: 'INV-2025-08-02',
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
    managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
    amount: 15000,
    issueDate: new Date('2025-08-01'),
    dueDate: new Date('2025-08-15'),
    status: 'paid',
    month: '8',
    year: 2025,
    description: 'Monthly rent for August 2025',
    paidAt: new Date('2025-08-14'),
    createdAt: new Date('2025-08-01'),
    updatedAt: new Date('2025-08-14')
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6f5"),
    invoiceNumber: 'INV-2025-09-02',
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
    managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
    amount: 15000,
    issueDate: new Date('2025-09-01'),
    dueDate: new Date('2025-09-15'),
    status: 'overdue',
    month: '9',
    year: 2025,
    description: 'Monthly rent for September 2025',
    overdueAt: new Date('2025-09-16'),
    createdAt: new Date('2025-09-01'),
    updatedAt: new Date('2025-09-16')
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6f6"),
    invoiceNumber: 'INV-2025-10-02',
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
    managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
    amount: 15000,
    issueDate: new Date('2025-10-01'),
    dueDate: new Date('2025-10-31'),
    status: 'pending',
    month: '10',
    year: 2025,
    description: 'Monthly rent for October 2025',
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-01')
  },
  // Lisa Anderson invoices (Lease 3, 9500/month)
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6f7"),
    invoiceNumber: 'INV-2024-06-03',
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
    managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
    amount: 9500,
    issueDate: new Date('2024-06-01'),
    dueDate: new Date('2024-06-15'),
    status: 'paid',
    month: '6',
    year: 2024,
    markdownContent: '# Invoice INV-2024-06-03\n\n**Tenant:** Lisa Anderson\n**Property:** Green Valley Complex\n**Unit:** A1\n**Rent Amount:** R9,500.00\n**Due Date:** 2024-06-15',
    artifactPaths: { markdown: '/artifacts/inv-2024-06-03.md', pdf: '/artifacts/inv-2024-06-03.pdf' },
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-01')
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6f8"),
    invoiceNumber: 'INV-2024-07-03',
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
    managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
    amount: 9500,
    issueDate: new Date('2024-07-01'),
    dueDate: new Date('2024-07-15'),
    status: 'paid',
    month: '7',
    year: 2024,
    markdownContent: '# Invoice INV-2024-07-03\n\n**Tenant:** Lisa Anderson\n**Property:** Green Valley Complex\n**Unit:** A1\n**Rent Amount:** R9,500.00\n**Due Date:** 2024-07-15',
    artifactPaths: { markdown: '/artifacts/inv-2024-07-03.md', pdf: '/artifacts/inv-2024-07-03.pdf' },
    createdAt: new Date('2024-07-01'),
    updatedAt: new Date('2024-07-01')
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6f9"),
    invoiceNumber: 'INV-2024-08-03',
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
    managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
    amount: 9500,
    issueDate: new Date('2024-08-01'),
    dueDate: new Date('2024-08-15'),
    status: 'pending',
    month: '8',
    year: 2024,
    markdownContent: '# Invoice INV-2024-08-03\n\n**Tenant:** Lisa Anderson\n**Property:** Green Valley Complex\n**Unit:** A1\n**Rent Amount:** R9,500.00\n**Due Date:** 2024-08-15',
    artifactPaths: { markdown: '/artifacts/inv-2024-08-03.md', pdf: '/artifacts/inv-2024-08-03.pdf' },
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-08-01')
  },
  // Robert Brown invoices (Lease 4, 11500/month)
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6fa"),
    invoiceNumber: 'INV-2024-06-04',
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d4"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
    managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
    amount: 11500,
    issueDate: new Date('2024-06-01'),
    dueDate: new Date('2024-06-15'),
    status: 'paid',
    month: '6',
    year: 2024,
    markdownContent: '# Invoice INV-2024-06-04\n\n**Tenant:** Robert Brown\n**Property:** Green Valley Complex\n**Unit:** B2\n**Rent Amount:** R11,500.00\n**Due Date:** 2024-06-15',
    artifactPaths: { markdown: '/artifacts/inv-2024-06-04.md', pdf: '/artifacts/inv-2024-06-04.pdf' },
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-01')
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6fb"),
    invoiceNumber: 'INV-2024-07-04',
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d4"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
    managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
    amount: 11500,
    issueDate: new Date('2024-07-01'),
    dueDate: new Date('2024-07-15'),
    status: 'paid',
    month: '7',
    year: 2024,
    markdownContent: '# Invoice INV-2024-07-04\n\n**Tenant:** Robert Brown\n**Property:** Green Valley Complex\n**Unit:** B2\n**Rent Amount:** R11,500.00\n**Due Date:** 2024-07-15',
    artifactPaths: { markdown: '/artifacts/inv-2024-07-04.md', pdf: '/artifacts/inv-2024-07-04.pdf' },
    createdAt: new Date('2024-07-01'),
    updatedAt: new Date('2024-07-01')
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6fc"),
    invoiceNumber: 'INV-2024-08-04',
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d4"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
    managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
    amount: 11500,
    issueDate: new Date('2024-08-01'),
    dueDate: new Date('2024-08-15'),
    status: 'pending',
    month: '8',
    year: 2024,
    markdownContent: '# Invoice INV-2024-08-04\n\n**Tenant:** Robert Brown\n**Property:** Green Valley Complex\n**Unit:** B2\n**Rent Amount:** R11,500.00\n**Due Date:** 2024-08-15',
    artifactPaths: { markdown: '/artifacts/inv-2024-08-04.md', pdf: '/artifacts/inv-2024-08-04.pdf' },
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-08-01')
  },
  // Maria Garcia invoices (Lease 5, 18000/month)
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6fd"),
    invoiceNumber: 'INV-2024-06-05',
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d5"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
    managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
    amount: 18000,
    issueDate: new Date('2024-06-01'),
    dueDate: new Date('2024-06-15'),
    status: 'paid',
    month: '6',
    year: 2024,
    markdownContent: '# Invoice INV-2024-06-05\n\n**Tenant:** Maria Garcia\n**Property:** Sunset Towers\n**Unit:** P1\n**Rent Amount:** R18,000.00\n**Due Date:** 2024-06-15',
    artifactPaths: { markdown: '/artifacts/inv-2024-06-05.md', pdf: '/artifacts/inv-2024-06-05.pdf' },
    createdAt: new Date('2024-06-01'),
    updatedAt: new Date('2024-06-01')
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6fe"),
    invoiceNumber: 'INV-2024-07-05',
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d5"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
    managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
    amount: 18000,
    issueDate: new Date('2024-07-01'),
    dueDate: new Date('2024-07-15'),
    status: 'pending_approval',
    month: '7',
    year: 2024,
    markdownContent: '# Invoice INV-2024-07-05\n\n**Tenant:** Maria Garcia\n**Property:** Sunset Towers\n**Unit:** P1\n**Rent Amount:** R18,000.00\n**Due Date:** 2024-07-15 ⏳ Payment Pending Approval',
    artifactPaths: { markdown: '/artifacts/inv-2024-07-05.md', pdf: '/artifacts/inv-2024-07-05.pdf' },
    createdAt: new Date('2024-07-01'),
    updatedAt: new Date('2024-07-01')
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6ff"),
    invoiceNumber: 'INV-2024-08-05',
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d5"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
    managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
    amount: 18000,
    issueDate: new Date('2024-08-01'),
    dueDate: new Date('2024-08-15'),
    status: 'pending',
    month: '8',
    year: 2024,
    markdownContent: '# Invoice INV-2024-08-05\n\n**Tenant:** Maria Garcia\n**Property:** Sunset Towers\n**Unit:** P1\n**Rent Amount:** R18,000.00\n**Due Date:** 2024-08-15',
    artifactPaths: { markdown: '/artifacts/inv-2024-08-05.md', pdf: '/artifacts/inv-2024-08-05.pdf' },
    createdAt: new Date('2024-08-01'),
    updatedAt: new Date('2024-08-01')
  }

// Create lease renewals - using the actual lease IDs
const _leaseRenewals = db.lease_renewals.insertMany([
  // Emma Thompson's lease - Pending
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7a1"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
    status: 'pending',
    renewalOfferSent: false,
    tenantResponse: null,
    offerSentDate: null,
    responseDate: null,
    newTerms: {
      duration: 12,
      monthlyRent: 12000,
      startDate: new Date('2025-06-01')
    },
    createdAt: new Date('2024-09-15'),
    updatedAt: new Date('2024-09-15')
  },
  // Lisa Anderson's lease - Pending
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7a2"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
    status: 'pending',
    renewalOfferSent: false,
    tenantResponse: null,
    offerSentDate: null,
    responseDate: null,
    newTerms: {
      duration: 12,
      monthlyRent: 15000,
      startDate: new Date('2025-11-01')
    },
    createdAt: new Date('2024-09-20'),
    updatedAt: new Date('2024-09-20')
  },
  // Lisa Anderson's lease - Offer Sent
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7a3"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
    status: 'offer_sent',
    renewalOfferSent: true,
    tenantResponse: 'pending',
    offerSentDate: new Date('2024-10-10'),
    responseDate: null,
    newTerms: {
      duration: 12,
      monthlyRent: 11000,
      startDate: new Date('2025-07-01')
    },
    createdAt: new Date('2024-10-01'),
    updatedAt: new Date('2024-10-10')
  },
  // Robert Brown's lease - Accepted
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7a4"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d4"),
    status: 'accepted',
    renewalOfferSent: true,
    tenantResponse: 'accepted',
    offerSentDate: new Date('2024-09-15'),
    responseDate: new Date('2024-09-20'),
    newTerms: {
      duration: 12,
      monthlyRent: 9500,
      startDate: new Date('2025-05-01')
    },
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-20')
  },
  // Maria Garcia's lease - Declined
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7a5"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d5"),
    status: 'declined',
    renewalOfferSent: true,
    tenantResponse: 'declined',
    offerSentDate: new Date('2024-10-01'),
    responseDate: new Date('2024-10-05'),
    newTerms: {
      duration: 12,
      monthlyRent: 13500,
      startDate: new Date('2025-09-01')
    },
    createdAt: new Date('2024-09-12'),
    updatedAt: new Date('2024-10-05')
  }

// Create payments with proper references
const payments = db.payments.insertMany([
  // Emma Thompson payments
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6e1"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
    amount: 12500,
    paymentDate: new Date('2025-08-05'),
    dueDate: new Date('2025-08-01'),
    status: 'paid',
    type: 'rent',
    method: 'card',
    reference: 'REF-20250805-ABC123',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6e2"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
    amount: 12500,
    paymentDate: null,
    dueDate: new Date('2025-09-26'),
    status: 'overdue',
    type: 'rent',
    method: null,
    reference: 'RENT-2025-09-001',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6e9"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
    amount: 12500,
    paymentDate: null,
    dueDate: new Date('2025-10-31'),
    status: 'pending',
    type: 'rent',
    method: null,
    reference: 'RENT-2025-10-001',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // James Smith payments
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6e3"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
    amount: 15000,
    paymentDate: new Date('2025-08-10'),
    dueDate: new Date('2025-08-01'),
    status: 'paid',
    type: 'rent',
    method: 'card',
    reference: 'REF-20250810-DEF456',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6e4"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
    amount: 15000,
    paymentDate: null,
    dueDate: new Date('2025-09-16'),
    status: 'overdue',
    type: 'rent',
    method: null,
    reference: 'RENT-2025-09-002',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6ea"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
    amount: 15000,
    paymentDate: null,
    dueDate: new Date('2025-10-31'),
    status: 'pending',
    type: 'rent',
    method: null,
    reference: 'RENT-2025-10-002',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Lisa Anderson payments
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6e5"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
    amount: 9500,
    paymentDate: new Date('2025-08-05'),
    dueDate: new Date('2025-08-01'),
    status: 'paid',
    type: 'rent',
    method: 'card',
    reference: 'REF-20250805-GHI789',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6eb"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
    amount: 9500,
    paymentDate: null,
    dueDate: new Date('2025-10-31'),
    status: 'pending',
    type: 'rent',
    method: null,
    reference: 'RENT-2025-10-003',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Robert Brown payments
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6e6"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d4"),
    amount: 11500,
    paymentDate: new Date('2025-08-10'),
    dueDate: new Date('2025-08-01'),
    status: 'paid',
    type: 'rent',
    method: 'card',
    reference: 'REF-20250810-JKL012',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6ec"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d4"),
    amount: 11500,
    paymentDate: null,
    dueDate: new Date('2025-10-31'),
    status: 'pending',
    type: 'rent',
    method: null,
    reference: 'RENT-2025-10-004',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Maria Garcia payments
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6e7"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d5"),
    amount: 18000,
    paymentDate: new Date('2025-08-05'),
    dueDate: new Date('2025-08-01'),
    status: 'paid',
    type: 'rent',
    method: 'card',
    reference: 'REF-20250805-MNO345',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6e8"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d5"),
    amount: 18000,
    paymentDate: null,
    dueDate: new Date('2025-10-31'),
    status: 'pending',
    type: 'rent',
    method: null,
    reference: 'RENT-2025-10-005',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  if (caretakerTasks.length > 0) {
    await db.collection("caretaker_tasks").insertMany(caretakerTasks);
  }

  if (reports.length > 0) {
    await db.collection("reports").insertMany(reports);
  }

  if (notifications.length > 0) {
    await db.collection("notifications").insertMany(notifications);
  }

// Create settings with proper references
const _settings = db.settings.insertMany([
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e731"),
    key: 'rent_due_day',
    value: '1',
    description: 'Day of month when rent payments are due',
    category: 'payment',
    updatedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e732"),
    key: 'late_fee_percentage',
    value: '10',
    description: 'Late fee percentage for overdue rent payments',
    category: 'payment',
    updatedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e733"),
    key: 'notification_email_enabled',
    value: 'true',
    description: 'Enable email notifications for users',
    category: 'notification',
    updatedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e734"),
    key: 'maintenance_response_time',
    value: '24',
    description: 'Expected response time for maintenance requests (hours)',
    category: 'maintenance',
    updatedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e735"),
    key: 'app_version',
    value: '1.0.0',
    description: 'Current application version',
    category: 'system',
    updatedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e736"),
    key: 'max_lease_duration',
    value: '24',
    description: 'Maximum lease duration in months',
    category: 'lease',
    updatedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e737"),
    key: 'security_deposit_multiplier',
    value: '2',
    description: 'Security deposit as multiplier of monthly rent',
    category: 'payment',
    updatedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
    updatedAt: new Date()
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e738"),
    key: 'emergency_contact_number',
    value: '+27871234567',
    description: 'Emergency contact number for all properties',
    category: 'emergency',
    updatedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
    updatedAt: new Date()
  }

  if (documents.length > 0) {
    await db.collection("documents").insertMany(documents);
  }

  await db.collection("users").updateMany(
    { userType: "tenant" },
    [
      {
        $set: {
          "profile.leaseId": {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$_id", ObjectId("67b2a1e0c9e4b8a3d4f5e6a6")] },
                  then: ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
                },
                {
                  case: { $eq: ["$_id", ObjectId("67b2a1e0c9e4b8a3d4f5e6a7")] },
                  then: ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
                },
                {
                  case: { $eq: ["$_id", ObjectId("67b2a1e0c9e4b8a3d4f5e6a8")] },
                  then: ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
                },
                {
                  case: { $eq: ["$_id", ObjectId("67b2a1e0c9e4b8a3d4f5e6a9")] },
                  then: ObjectId("67b2a1e0c9e4b8a3d4f5e6d4"),
                },
                {
                  case: { $eq: ["$_id", ObjectId("67b2a1e0c9e4b8a3d4f5e6aa")] },
                  then: ObjectId("67b2a1e0c9e4b8a3d4f5e6d5"),
                },
              ],
              default: null,
            },
          },
        },
      },
    ],
  );

  await db.collection("users").updateMany(
    { userType: "manager" },
    [
      {
        $set: {
          "profile.managedProperties": {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$_id", ObjectId("67b2a1e0c9e4b8a3d4f5e6a2")] },
                  then: [
                    ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
                    ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
                  ],
                },
                {
                  case: { $eq: ["$_id", ObjectId("67b2a1e0c9e4b8a3d4f5e6a3")] },
                  then: [ObjectId("67b2a1e0c9e4b8a3d4f5e6b2")],
                },
              ],
              default: [],
            },
          },
        },
      },
    ],
  );

  await db.collection("users").updateMany(
    { userType: "caretaker" },
    [
      {
        $set: {
          "profile.assignedProperty": {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$_id", ObjectId("67b2a1e0c9e4b8a3d4f5e6a4")] },
                  then: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
                },
                {
                  case: { $eq: ["$_id", ObjectId("67b2a1e0c9e4b8a3d4f5e6a5")] },
                  then: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
                },
              ],
              default: null,
            },
          },
        },
      },
    ],
  );

db.documents.insertMany([
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7f1"),
    name: 'Lease Agreement - Emma Thompson',
    description: 'Signed lease agreement for Unit 2A',
    type: 'lease',
    category: 'legal',
    fileName: 'lease_emma_thompson.txt',
    fileSize: 1024,
    mimeType: 'text/plain',
    content: Buffer.from('LEASE AGREEMENT\n\nTenant: Emma Thompson\nProperty: Blue Hills Apartments\nAddress: 123 Main Street\nUnit: 2A\n\nLEASE TERMS:\nStart Date: 10/1/2025\nEnd Date: 9/30/2026\nDuration: 12 months\n\nFINANCIAL TERMS:\nMonthly Rent: $1,250.00\nSecurity Deposit: $1,250.00\n\nADDITIONAL TERMS:\nNo pets allowed. All maintenance requests must be submitted in writing.\n\nStatus: SIGNED').toString('base64'),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
    unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c1"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
    uploadedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
    uploadedByName: 'Michael Chen',
    uploadDate: new Date('2025-10-01'),
    status: 'signed',
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-01')
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7f2"),
    name: 'Property Inspection Report - Blue Hills Apartments',
    description: 'Annual property inspection documentation',
    type: 'inspection',
    category: 'maintenance',
    fileName: 'inspection_blue_hills_2024.txt',
    fileSize: 1024,
    mimeType: 'text/plain',
    content: Buffer.from('PROPERTY INSPECTION REPORT\n\nProperty: Blue Hills Apartments\nDate: August 15, 2024\n\nGeneral Condition: GOOD\n\nStructure: No issues detected\nRoof: Good condition\nFoundation: Stable\nWindows & Doors: All functioning properly\n\nSystems:\n- Electrical: Compliant\n- Plumbing: Functional\n- HVAC: Operational\n\nConclusion: Property is in good condition. No major repairs needed.').toString('base64'),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
    uploadedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a4"),
    uploadedByName: 'David Mokoena',
    uploadDate: new Date('2024-08-15'),
    status: 'approved',
    createdAt: new Date('2024-08-15'),
    updatedAt: new Date('2024-08-15')
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7f3"),
    name: 'Property Insurance Policy - Blue Hills Apartments',
    description: 'Annual insurance policy documentation',
    type: 'insurance',
    category: 'legal',
    fileName: 'insurance_blue_hills_2024.txt',
    fileSize: 1024,
    mimeType: 'text/plain',
    content: Buffer.from('PROPERTY INSURANCE POLICY\n\nProperty: Blue Hills Apartments\nPolicy Number: INS-2024-001\nInsurance Provider: SafeGuard Insurance\n\nCoverage Dates:\nFrom: January 15, 2024\nTo: January 15, 2025\n\nCoverage Amount: $500,000\nDeductible: $2,500\n\nCovered Elements:\n- Building Structure\n- Liability Protection\n- Contents\n\nStatus: ACTIVE').toString('base64'),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
    uploadedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
    uploadedByName: 'Michael Chen',
    uploadDate: new Date('2024-01-15'),
    status: 'active',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7f4"),
    name: 'Lease Agreement - James Smith',
    description: 'Signed lease agreement for Unit 3C',
    type: 'lease',
    category: 'legal',
    fileName: 'lease_james_smith.txt',
    fileSize: 1024,
    mimeType: 'text/plain',
    content: Buffer.from('LEASE AGREEMENT\n\nTenant: James Smith\nProperty: Blue Hills Apartments\nAddress: 123 Main Street\nUnit: 3C\n\nLEASE TERMS:\nStart Date: 9/1/2025\nEnd Date: 8/31/2026\nDuration: 12 months\n\nFINANCIAL TERMS:\nMonthly Rent: $1,500.00\nSecurity Deposit: $1,500.00\n\nADDITIONAL TERMS:\nNo subletting without written permission. Rent due on the 1st of each month.\n\nStatus: SIGNED').toString('base64'),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
    unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c3"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
    uploadedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
    uploadedByName: 'Michael Chen',
    uploadDate: new Date('2025-09-01'),
    status: 'signed',
    createdAt: new Date('2025-09-01'),
    updatedAt: new Date('2025-09-01')
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7f5"),
    name: 'Lease Agreement - Lisa Anderson',
    description: 'Signed lease agreement for Unit A1',
    type: 'lease',
    category: 'legal',
    fileName: 'lease_lisa_anderson.txt',
    fileSize: 1024,
    mimeType: 'text/plain',
    content: Buffer.from('LEASE AGREEMENT\n\nTenant: Lisa Anderson\nProperty: Green Valley Apartments\nAddress: 456 Oak Avenue\nUnit: A1\n\nLEASE TERMS:\nStart Date: 8/1/2025\nEnd Date: 7/31/2026\nDuration: 12 months\n\nFINANCIAL TERMS:\nMonthly Rent: $1,100.00\nSecurity Deposit: $1,100.00\n\nADDITIONAL TERMS:\nRenewable lease. Tenant responsible for utilities. No commercial activities.\n\nStatus: SIGNED').toString('base64'),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
    unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c5"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
    uploadedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
    uploadedByName: 'Michael Chen',
    uploadDate: new Date('2025-08-01'),
    status: 'signed',
    createdAt: new Date('2025-08-01'),
    updatedAt: new Date('2025-08-01')
  }
]);

  await db.collection("payments").createIndex({ tenantId: 1 });
  await db.collection("payments").createIndex({ leaseId: 1 });
  await db.collection("payments").createIndex({ status: 1 });
  await db.collection("payments").createIndex({ dueDate: 1 });

  await db.collection("maintenance_requests").createIndex({ tenantId: 1 });
  await db.collection("maintenance_requests").createIndex({ propertyId: 1 });
  await db.collection("maintenance_requests").createIndex({ unitId: 1 });
  await db.collection("maintenance_requests").createIndex({ status: 1 });

  await db.collection("documents").createIndex({ leaseId: 1 });
  await db.collection("documents").createIndex({ propertyId: 1 });
  await db.collection("documents").createIndex({ tenantId: 1 });

  await db.collection("notifications").createIndex({ userId: 1 });
  await db.collection("notifications").createIndex({ read: 1 });

  await db.collection("audit_logs").createIndex({ userId: 1 });
  await db.collection("audit_logs").createIndex({ action: 1 });
  await db.collection("audit_logs").createIndex({ timestamp: -1 });

  const counts = {
    users: await db.collection("users").countDocuments(),
    properties: await db.collection("properties").countDocuments(),
    units: await db.collection("units").countDocuments(),
    leases: await db.collection("leases").countDocuments(),
    payments: await db.collection("payments").countDocuments(),
    maintenanceRequests: await db.collection("maintenance_requests")
      .countDocuments(),
    caretakerTasks: await db.collection("caretaker_tasks").countDocuments(),
    reports: await db.collection("reports").countDocuments(),
    notifications: await db.collection("notifications").countDocuments(),
    settings: await db.collection("settings").countDocuments(),
    auditLogs: await db.collection("audit_logs").countDocuments(),
    documents: await db.collection("documents").countDocuments(),
    invoices: await db.collection("invoices").countDocuments(),
    leaseRenewals: await db.collection("lease_renewals").countDocuments(),
  };

  console.log("Comprehensive database initialization completed successfully!");
  console.log("Collections created:");
  console.log(`   - users (${counts.users} documents)`);
  console.log(`   - properties (${counts.properties} documents)`);
  console.log(`   - units (${counts.units} documents)`);
  console.log(`   - leases (${counts.leases} documents)`);
  console.log(`   - payments (${counts.payments} documents)`);
  console.log(
    `   - maintenance_requests (${counts.maintenanceRequests} documents)`,
  );
  console.log(`   - caretaker_tasks (${counts.caretakerTasks} documents)`);
  console.log(`   - reports (${counts.reports} documents)`);
  console.log(`   - notifications (${counts.notifications} documents)`);
  console.log(`   - settings (${counts.settings} documents)`);
  console.log(`   - audit_logs (${counts.auditLogs} documents)`);
  console.log(`   - documents (${counts.documents} documents)`);
  console.log(`   - invoices (${counts.invoices} documents)`);
  console.log(`   - lease_renewals (${counts.leaseRenewals} documents)`);

  console.log("");
  console.log("Data relationships established:");
  console.log("   - Each tenant has a lease and assigned unit");
  console.log("   - Each property has a manager and multiple units");
  console.log("   - Each unit belongs to a property and may have a tenant");
  console.log("   - Payments are linked to tenants and leases");
  console.log(
    "   - Maintenance requests are linked to tenants, units, and properties",
  );
  console.log("   - Caretaker tasks are assigned to caretakers and properties");
  console.log("   - Notifications are linked to appropriate users");
  console.log("   - Audit logs track all user actions");
  console.log("   - Documents are linked to leases, properties, and tenants");
  console.log("");
  console.log("Database is ready for consistent development!");
}

async function main() {
  await client.connect();

  try {
    const db = client.db(DB_NAME);
    await dropCollections(db);
    await seed(db);
  } finally {
    await client.close();
  }
}

if (import.meta.main) {
  await main();
}
