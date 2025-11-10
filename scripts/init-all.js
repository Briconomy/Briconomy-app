/**
 * Global Database Initialization Script
 * Combines all initialization scripts into one comprehensive setup
 * 
 * This script:
 * 1. Initializes all collections with comprehensive test data
 * 2. Sets up pending_users collection with indexes
 * 3. Links managers to properties
 * 4. Creates sample tenant applications
 * 5. Sets up lease extras (renewals and terminations)
 * 6. Fixes payment-lease references
 */

import { MongoClient, ObjectId } from "mongodb";
import { Buffer } from "node:buffer";

const MONGO_URI = "mongodb://127.0.0.1";
const DB_NAME = "briconomy";

// Sanitize input to prevent NoSQL injection
function sanitizeInput(input) {
  if (typeof input === 'string') {
    return input.replace(/^\$/, '');
  }
  if (typeof input === 'object' && input !== null) {
    const keys = Object.keys(input);
    if (keys.some(key => key.startsWith('$'))) {
      throw new Error('Invalid input: MongoDB operators not allowed');
    }
  }
  return input;
}

async function initializeDatabase() {
  const client = new MongoClient(MONGO_URI);

  try {
    console.log("========================================");
    console.log("  Global Database Initialization");
    console.log("========================================\n");

    console.log("Connecting to MongoDB...");
    await client.connect();
    console.log("Connected successfully to MongoDB\n");

    const db = client.db(DB_NAME);

    // ==========================================
    // STEP 1: Drop existing collections
    // ==========================================
    console.log("STEP 1: Cleaning existing data...");
    const collections = [
      'users', 'properties', 'units', 'leases', 'invoices', 'payments',
      'maintenance_requests', 'caretaker_tasks', 'reports', 'notifications',
      'settings', 'audit_logs', 'documents', 'lease_renewals', 'lease_terminations',
      'pending_users'
    ];

    for (const collectionName of collections) {
      try {
        await db.collection(collectionName).drop();
        console.log(`  Dropped ${collectionName}`);
  } catch (_error) {
        // Collection doesn't exist, continue
      }
    }
    console.log("  Database cleaned\n");

    // ==========================================
    // STEP 2: Create Users
    // ==========================================
    console.log("STEP 2: Creating users...");
    const users = await db.collection("users").insertMany([
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
        fullName: 'Sarah Johnson',
        email: 'admin@briconomy.co.za',
        phone: '+27821234567',
        userType: 'admin',
        password: '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
        profile: {"department":"System Administration","employeeId":"ADMIN001","joinDate":"2023-01-15T00:00:00.000Z"},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
        fullName: 'Michael Chen',
        email: 'manager1@briconomy.co.za',
        phone: '+27823456789',
        userType: 'manager',
        password: '866485796cfa8d7c0cf7111640205b83076433547577511d81f8030ae99ecea5',
        profile: {"department":"Property Management","employeeId":"MGR001","joinDate":"2023-02-20T00:00:00.000Z"},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
        fullName: 'Patricia Williams',
        email: 'manager2@briconomy.co.za',
        phone: '+27825678901',
        userType: 'manager',
        password: '866485796cfa8d7c0cf7111640205b83076433547577511d81f8030ae99ecea5',
        profile: {"department":"Property Management","employeeId":"MGR002","joinDate":"2023-03-10T00:00:00.000Z"},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a4"),
        fullName: 'David Mokoena',
        email: 'caretaker1@briconomy.co.za',
        phone: '+27827890123',
        userType: 'caretaker',
        password: '4cddfbc939614427ff8b719e4f7699528e2481c37d734086b6b7786c5d9ed1aa',
        profile: {"department":"Maintenance","employeeId":"CARE001","joinDate":"2023-04-05T00:00:00.000Z","skills":["plumbing","electrical","general"]},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a5"),
        fullName: 'Thabo Ndlovu',
        email: 'caretaker2@briconomy.co.za',
        phone: '+27829012345',
        userType: 'caretaker',
        password: '4cddfbc939614427ff8b719e4f7699528e2481c37d734086b6b7786c5d9ed1aa',
        profile: {"department":"Maintenance","employeeId":"CARE002","joinDate":"2023-05-12T00:00:00.000Z","skills":["carpentry","painting","landscaping"]},
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
        fullName: 'Emma Thompson',
        email: 'tenant1@briconomy.co.za',
        phone: '+27821234568',
        userType: 'tenant',
        password: 'b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33',
        profile: {
          emergencyContact: { name: "John Thompson", phone: "+27821234569", relationship: "Brother" },
          occupation: "Software Developer",
          moveInDate: "2023-06-01",
          leaseDuration: "12",
          unitNumber: "2A",
          monthlyIncome: 65000
        },
        assignedPropertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        unitId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c1"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        appliedUnitId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c1"),
        appliedUnitNumber: "2A",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
        fullName: 'James Smith',
        email: 'tenant2@briconomy.co.za',
        phone: '+27823456790',
        userType: 'tenant',
        password: 'b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33',
        profile: {
          emergencyContact: { name: "Mary Smith", phone: "+27823456791", relationship: "Wife" },
          occupation: "Teacher",
          moveInDate: "2023-07-15",
          leaseDuration: "12",
          unitNumber: "3C",
          monthlyIncome: 48000
        },
        assignedPropertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        unitId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c3"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        appliedUnitId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c3"),
        appliedUnitNumber: "3C",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
        fullName: 'Lisa Anderson',
        email: 'tenant3@briconomy.co.za',
        phone: '+27825678902',
        userType: 'tenant',
        password: 'b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33',
        profile: {
          emergencyContact: { name: "David Anderson", phone: "+27825678903", relationship: "Brother" },
          occupation: "Nurse",
          moveInDate: "2023-08-20",
          leaseDuration: "12",
          unitNumber: "A1",
          monthlyIncome: 55000
        },
        assignedPropertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        unitId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c5"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        appliedUnitId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c5"),
        appliedUnitNumber: "A1",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
        fullName: 'Robert Brown',
        email: 'tenant4@briconomy.co.za',
        phone: '+27827890124',
        userType: 'tenant',
        password: 'b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33',
        profile: {
          emergencyContact: { name: "Susan Brown", phone: "+27827890125", relationship: "Sister" },
          occupation: "Engineer",
          moveInDate: "2023-09-10",
          leaseDuration: "12",
          unitNumber: "B2",
          monthlyIncome: 72000
        },
        assignedPropertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        unitId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c6"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        appliedUnitId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c6"),
        appliedUnitNumber: "B2",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
        fullName: 'Maria Garcia',
        email: 'tenant5@briconomy.co.za',
        phone: '+27829012346',
        userType: 'tenant',
        password: 'b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33',
        profile: {
          emergencyContact: { name: "Carlos Garcia", phone: "+27829012347", relationship: "Father" },
          occupation: "Designer",
          moveInDate: "2023-10-05",
          leaseDuration: "12",
          unitNumber: "P1",
          monthlyIncome: 52000
        },
        assignedPropertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
        unitId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c7"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
        appliedUnitId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c7"),
        appliedUnitNumber: "P1",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log(`  Created ${users.insertedCount} users\n`);

    // ==========================================
    // STEP 3: Create Properties
    // ==========================================
    console.log("STEP 3: Creating properties...");
    const properties = await db.collection("properties").insertMany([
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        name: 'Blue Hills Apartments',
        address: '123 Main St, Cape Town, 8001',
        type: 'apartment',
        totalUnits: 24,
        occupiedUnits: 5,
        managerId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
        amenities: ['pool', 'gym', 'parking', 'security', 'laundry', 'elevator'],
        description: 'Modern apartment complex in the heart of Cape Town with stunning city views',
        yearBuilt: 2018,
        lastRenovation: 2022,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        name: 'Green Valley Complex',
        address: '456 Oak Ave, Durban, 4001',
        type: 'complex',
        totalUnits: 18,
        occupiedUnits: 5,
        managerId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
        amenities: ['parking', 'garden', 'playground', 'bbq_area', 'security'],
        description: 'Family-friendly complex with beautiful gardens and recreational facilities',
        yearBuilt: 2015,
        lastRenovation: 2021,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
        name: 'Sunset Towers',
        address: '789 Beach Rd, Port Elizabeth, 6001',
        type: 'apartment',
        totalUnits: 32,
        occupiedUnits: 5,
        managerId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
        amenities: ['pool', 'gym', 'parking', 'ocean_view', 'concierge', 'spa'],
        description: 'Luxury beachfront apartments with panoramic ocean views',
        yearBuilt: 2020,
        lastRenovation: 2023,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log(`  Created ${properties.insertedCount} properties\n`);

    // ==========================================
    // STEP 4: Create Units
    // ==========================================
    console.log("STEP 4: Creating units...");
    const units = await db.collection("units").insertMany([
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c1"),
        unitNumber: '2A',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        rent: 12500,
        bedrooms: 2,
        bathrooms: 1,
        sqft: 850,
        status: 'occupied',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
        features: ['balcony', 'built_in_cupboards', 'tiled_flooring'],
        floor: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c2"),
        unitNumber: '1B',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
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
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c3"),
        unitNumber: '3C',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        rent: 15000,
        bedrooms: 3,
        bathrooms: 2,
        sqft: 1200,
        status: 'occupied',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
        features: ['balcony', 'ocean_view', 'built_in_cupboards', 'air_conditioning'],
        floor: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c4"),
        unitNumber: '4D',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
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
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c5"),
        unitNumber: 'A1',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        rent: 9500,
        bedrooms: 2,
        bathrooms: 1,
        sqft: 750,
        status: 'occupied',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
        features: ['garden_access', 'built_in_cupboards', 'parking'],
        floor: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c6"),
        unitNumber: 'B2',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        rent: 11500,
        bedrooms: 2,
        bathrooms: 2,
        sqft: 950,
        status: 'occupied',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
        features: ['balcony', 'built_in_cupboards', 'air_conditioning', 'parking'],
        floor: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c7"),
        unitNumber: 'P1',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
        rent: 18000,
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1100,
        status: 'occupied',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
        features: ['penthouse', 'ocean_view', 'balcony', 'air_conditioning', 'concierge_service'],
        floor: 15,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c8"),
        unitNumber: '8A',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
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
      },
      // Additional vacant units for Blue Hills Apartments
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c9"),
        unitNumber: '1A',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        rent: 10000,
        bedrooms: 1,
        bathrooms: 1,
        sqft: 600,
        status: 'vacant',
        tenantId: null,
        features: ['garden_view', 'built_in_cupboards'],
        floor: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6ca"),
        unitNumber: '2B',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        rent: 11000,
        bedrooms: 2,
        bathrooms: 1,
        sqft: 750,
        status: 'vacant',
        tenantId: null,
        features: ['balcony', 'built_in_cupboards', 'city_view'],
        floor: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6cb"),
        unitNumber: '3A',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        rent: 14000,
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1000,
        status: 'vacant',
        tenantId: null,
        features: ['balcony', 'built_in_cupboards', 'air_conditioning', 'city_view'],
        floor: 3,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6cc"),
        unitNumber: '4A',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        rent: 13000,
        bedrooms: 2,
        bathrooms: 1,
        sqft: 900,
        status: 'vacant',
        tenantId: null,
        features: ['balcony', 'built_in_cupboards', 'parking'],
        floor: 4,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Additional vacant units for Green Valley Complex
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6cd"),
        unitNumber: 'A2',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        rent: 9000,
        bedrooms: 1,
        bathrooms: 1,
        sqft: 650,
        status: 'vacant',
        tenantId: null,
        features: ['garden_access', 'built_in_cupboards', 'parking'],
        floor: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6ce"),
        unitNumber: 'B1',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        rent: 10500,
        bedrooms: 2,
        bathrooms: 1,
        sqft: 800,
        status: 'vacant',
        tenantId: null,
        features: ['garden_access', 'built_in_cupboards', 'parking', 'playground_view'],
        floor: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6cf"),
        unitNumber: 'B3',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        rent: 12000,
        bedrooms: 2,
        bathrooms: 2,
        sqft: 950,
        status: 'vacant',
        tenantId: null,
        features: ['balcony', 'built_in_cupboards', 'air_conditioning', 'parking'],
        floor: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d0"),
        unitNumber: 'C1',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        rent: 11000,
        bedrooms: 2,
        bathrooms: 1,
        sqft: 850,
        status: 'vacant',
        tenantId: null,
        features: ['garden_access', 'built_in_cupboards', 'parking', 'bbq_area_access'],
        floor: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Additional vacant units for Sunset Towers
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e710"),
        unitNumber: '5B',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
        rent: 14500,
        bedrooms: 1,
        bathrooms: 1,
        sqft: 750,
        status: 'vacant',
        tenantId: null,
        features: ['ocean_view', 'balcony', 'built_in_cupboards', 'concierge_service'],
        floor: 5,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e711"),
        unitNumber: '9C',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
        rent: 16000,
        bedrooms: 2,
        bathrooms: 1,
        sqft: 900,
        status: 'vacant',
        tenantId: null,
        features: ['ocean_view', 'balcony', 'built_in_cupboards', 'air_conditioning'],
        floor: 9,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e712"),
        unitNumber: '12A',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
        rent: 17500,
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1050,
        status: 'vacant',
        tenantId: null,
        features: ['ocean_view', 'balcony', 'built_in_cupboards', 'air_conditioning', 'spa_access'],
        floor: 12,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e713"),
        unitNumber: '14B',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
        rent: 19000,
        bedrooms: 2,
        bathrooms: 2,
        sqft: 1150,
        status: 'vacant',
        tenantId: null,
        features: ['penthouse_level', 'ocean_view', 'balcony', 'air_conditioning', 'concierge_service', 'spa_access'],
        floor: 14,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log(`  Created ${units.insertedCount} units\n`);

    // ==========================================
    // STEP 5: Create Leases
    // ==========================================
    console.log("STEP 5: Creating leases...");
    const leases = await db.collection("leases").insertMany([
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
        leaseNumber: 'LEASE-2025-001',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
        unitId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c1"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        startDate: new Date('2025-11-01'),
        endDate: new Date('2026-10-31'),
        monthlyRent: 12500,
        deposit: 25000,
        status: 'active',
        terms: 'Standard residential lease agreement',
        renewalOption: true,
        archived: false,
        reminderSent: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
        leaseNumber: 'LEASE-2025-002',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
        unitId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c3"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        startDate: new Date('2025-11-01'),
        endDate: new Date('2026-10-31'),
        monthlyRent: 15000,
        deposit: 30000,
        status: 'active',
        terms: 'Standard residential lease agreement',
        renewalOption: true,
        archived: false,
        reminderSent: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
        leaseNumber: 'LEASE-2025-003',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
        unitId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c5"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        startDate: new Date('2025-11-15'),
        endDate: new Date('2026-11-14'),
        monthlyRent: 9500,
        deposit: 19000,
        status: 'active',
        terms: 'Standard residential lease agreement',
        renewalOption: true,
        archived: false,
        reminderSent: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d4"),
        leaseNumber: 'LEASE-2025-004',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
        unitId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c6"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        startDate: new Date('2025-12-01'),
        endDate: new Date('2026-11-30'),
        monthlyRent: 11500,
        deposit: 23000,
        status: 'active',
        terms: 'Standard residential lease agreement',
        renewalOption: true,
        archived: false,
        reminderSent: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d5"),
        leaseNumber: 'LEASE-2025-005',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
        unitId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c7"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
        startDate: new Date('2025-11-10'),
        endDate: new Date('2026-11-09'),
        monthlyRent: 18000,
        deposit: 36000,
        status: 'active',
        terms: 'Premium residential lease agreement',
        renewalOption: true,
        archived: false,
        reminderSent: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log(`  Created ${leases.insertedCount} leases\n`);

    // ==========================================
    // STEP 6: Create Lease Renewals
    // ==========================================
    console.log("STEP 6: Creating lease renewals and terminations...");
    const now = new Date();
    
    // Create ALL 5 lease renewals (matching comprehensive-data-init.js)
    const renewals = await db.collection("lease_renewals").insertMany([
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e7a1"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
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
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e7a2"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
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
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e7a3"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
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
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e7a4"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d4"),
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
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e7a5"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d5"),
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
    ]);

    const terminations = await db.collection("lease_terminations").insertMany([
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e7b1"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d4"),
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        unitId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c6"),
        currentRent: 11500,
        terminationDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        requestDate: now,
        reason: 'Relocating to another city for work',
        noticeInDays: 45,
        status: 'pending',
        approvedBy: null,
        approvalDate: null,
        rejectionReason: null,
        settlementAmount: null,
        penaltyAmount: null,
        refundAmount: 23000,
        notes: 'Tenant requesting early termination. Sufficient notice provided.',
        createdAt: now,
        updatedAt: now
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e7b2"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d5"),
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
        unitId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c7"),
        currentRent: 18000,
        terminationDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        requestDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        reason: 'Purchasing own property',
        noticeInDays: 35,
        status: 'approved',
        approvedBy: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
        approvalDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        rejectionReason: null,
        settlementAmount: 36000,
        penaltyAmount: 0,
        refundAmount: 36000,
        notes: 'Termination approved. Tenant has been excellent. Full deposit refund.',
        createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      }
    ]);
    console.log(`  Created ${renewals.insertedCount} lease renewals`);
    console.log(`  Created ${terminations.insertedCount} lease terminations\n`);

    // ==========================================
    // STEP 7: Create Maintenance Requests
    // ==========================================
    console.log("STEP 7: Creating maintenance requests...");
    
    // #COMPLETION_DRIVE: Assuming caretaker dashboards rely on maintenance_requests with assignedTo referencing caretaker user IDs
    // #SUGGEST_VERIFY: Open the caretaker tasks page after seeding to confirm the new records populate counts
    const maintenanceRequests = await db.collection("maintenance_requests").insertMany([
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e811"),
        title: 'Emergency leak repair - Unit 2A',
        description: 'Tenant reported a burst supply line under the kitchen sink with active leaking.',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        unitId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c1"),
        priority: 'high',
        status: 'completed',
        reportedBy: 'Emma Thompson',
        reportedContact: '+27821234568',
        assignedTo: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a4"),
        assignedAt: new Date('2024-11-02T18:20:00Z'),
        scheduledAt: new Date('2024-11-02T18:45:00Z'),
        dueDate: new Date('2024-11-03T12:00:00Z'),
        createdAt: new Date('2024-11-02T18:05:00Z'),
        updatedAt: new Date('2024-11-03T08:05:00Z'),
        completedAt: new Date('2024-11-03T08:00:00Z'),
        resolutionDetails: 'Replaced damaged flex hose, tightened fittings, and confirmed no further leaks.',
        photos: ['kitchen-leak-before.jpg'],
        repairPhotos: ['kitchen-leak-after.jpg'],
        comments: [
          {
            author: 'Emma Thompson',
            authorId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
            text: 'Water pooling under the sink and dripping into cupboard.',
            timestamp: new Date('2024-11-02T18:10:00Z')
          },
          {
            author: 'David Mokoena',
            authorId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a4"),
            text: 'Shut off supply, replaced hose, and dried cabinet.',
            timestamp: new Date('2024-11-03T07:50:00Z')
          }
        ],
        costEstimate: 1200,
        actualCost: 950,
        location: 'Blue Hills Apartments',
        unitNumber: '2A'
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e812"),
        title: 'HVAC system reset - Unit 3C',
        description: 'Tenant reported inconsistent cooling and noisy vents.',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        unitId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c3"),
        priority: 'medium',
        status: 'in_progress',
        reportedBy: 'James Smith',
        reportedContact: '+27823456790',
        assignedTo: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a4"),
        assignedAt: new Date('2024-11-06T07:30:00Z'),
        scheduledAt: new Date('2024-11-06T08:00:00Z'),
        dueDate: new Date('2024-11-08T16:00:00Z'),
        createdAt: new Date('2024-11-05T16:45:00Z'),
        updatedAt: new Date('2024-11-06T09:15:00Z'),
        photos: ['hvac-vent-noise.mp4'],
        comments: [
          {
            author: 'James Smith',
            authorId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
            text: 'Unit rattles loudly overnight and stops cooling mid-morning.',
            timestamp: new Date('2024-11-05T16:50:00Z')
          },
          {
            author: 'David Mokoena',
            authorId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a4"),
            text: 'Cleaned filters, monitoring compressor cycling.',
            timestamp: new Date('2024-11-06T09:10:00Z')
          }
        ],
        costEstimate: 800,
        actualCost: null,
        location: 'Blue Hills Apartments',
        unitNumber: '3C'
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e813"),
        title: 'Lobby lighting inspection',
        description: 'Quarterly safety walkthrough to replace dimmed bulbs and test emergency lighting.',
        tenantId: null,
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        unitId: null,
        priority: 'low',
        status: 'pending',
        reportedBy: 'Property Manager',
        reportedContact: '+27823456789',
        assignedTo: null,
        scheduledAt: new Date('2024-11-12T07:00:00Z'),
        dueDate: new Date('2024-11-12T16:00:00Z'),
        createdAt: new Date('2024-11-08T10:00:00Z'),
        updatedAt: new Date('2024-11-08T10:00:00Z'),
        comments: [
          {
            author: 'Michael Chen',
            authorId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
            text: 'Please log bulb replacements individually for budget tracking.',
            timestamp: new Date('2024-11-08T10:05:00Z')
          }
        ],
        costEstimate: 500,
        actualCost: null,
        location: 'Blue Hills Apartments'
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e814"),
        title: 'Pool pump maintenance',
        description: 'Annual pump service and chemical balance testing.',
        tenantId: null,
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        unitId: null,
        priority: 'medium',
        status: 'completed',
        reportedBy: 'Patricia Williams',
        reportedContact: '+27825678901',
        assignedTo: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a4"),
        assignedAt: new Date('2024-10-28T06:30:00Z'),
        scheduledAt: new Date('2024-10-28T07:00:00Z'),
        dueDate: new Date('2024-10-29T18:00:00Z'),
        createdAt: new Date('2024-10-27T14:20:00Z'),
        updatedAt: new Date('2024-10-29T16:30:00Z'),
        completedAt: new Date('2024-10-29T16:15:00Z'),
        resolutionDetails: 'Backwashed filter, replaced worn seals, balanced pH to 7.4.',
        photos: ['pool-maintenance-before.jpg'],
        repairPhotos: ['pool-maintenance-after.jpg'],
        comments: [
          {
            author: 'Patricia Williams',
            authorId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
            text: 'Schedule before weekend residents arrive.',
            timestamp: new Date('2024-10-27T14:25:00Z')
          }
        ],
        costEstimate: 1500,
        actualCost: 1400,
        location: 'Green Valley Complex'
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e815"),
        title: 'Garage door recalibration - Unit B2',
        description: 'Tenant reports automatic door sticking halfway when closing.',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        unitId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c6"),
        priority: 'high',
        status: 'pending',
        reportedBy: 'Robert Brown',
        reportedContact: '+27827890124',
        assignedTo: null,
        scheduledAt: new Date('2024-11-14T09:30:00Z'),
        dueDate: new Date('2024-11-14T15:00:00Z'),
        createdAt: new Date('2024-11-09T08:40:00Z'),
        updatedAt: new Date('2024-11-09T08:40:00Z'),
        photos: ['garage-door-stuck.jpg'],
        comments: [
          {
            author: 'Robert Brown',
            authorId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
            text: 'Door reverses before closing completely, safety sensor flashing.',
            timestamp: new Date('2024-11-09T08:45:00Z')
          }
        ],
        costEstimate: 1100,
        actualCost: null,
        location: 'Green Valley Complex',
        unitNumber: 'B2'
      }
    ]);
    console.log(`  Created ${maintenanceRequests.insertedCount} maintenance requests\n`);

    // ==========================================
  // STEP 8: Create Payments & Invoices
  // ==========================================
  console.log("STEP 8: Creating payments and invoices...");
    
    // Create ALL invoices (15 total across all tenants)
    const invoices = await db.collection("invoices").insertMany([
      // Emma Thompson invoices (Lease 1, 12500/month)
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6f1"),
        invoiceNumber: 'INV-2025-10',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        managerId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
        amount: 12500,
        issueDate: new Date('2025-10-01'),
        dueDate: new Date('2025-10-15'),
        status: 'paid',
        month: '10',
        year: 2025,
        description: 'Monthly rent for October 2025',
        paidAt: new Date('2025-10-10'),
        createdAt: new Date('2025-10-01'),
        updatedAt: new Date('2025-10-10')
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6f2"),
        invoiceNumber: 'INV-2025-11',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        managerId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
        amount: 12500,
        issueDate: new Date('2025-10-20'),
        dueDate: new Date('2025-11-03'),
        status: 'overdue',
        month: '11',
        year: 2025,
        description: 'Monthly rent for November 2025 - OVERDUE',
        createdAt: new Date('2025-10-20'),
        updatedAt: new Date('2025-11-04')
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6f3"),
        invoiceNumber: 'INV-2025-12',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        managerId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
        amount: 12500,
        issueDate: new Date('2025-12-01'),
        dueDate: new Date('2025-12-18'),
        status: 'pending',
        month: '12',
        year: 2025,
        description: 'Monthly rent for December 2025',
        createdAt: new Date('2025-12-01'),
        updatedAt: new Date('2025-12-01')
      },
      // James Smith invoices (Lease 2, 15000/month)
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6f4"),
        invoiceNumber: 'INV-2025-10-02',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        managerId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
        amount: 15000,
        issueDate: new Date('2025-10-01'),
        dueDate: new Date('2025-10-15'),
        status: 'paid',
        month: '10',
        year: 2025,
        description: 'Monthly rent for October 2025',
        paidAt: new Date('2025-10-12'),
        createdAt: new Date('2025-10-01'),
        updatedAt: new Date('2025-10-12')
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6f5"),
        invoiceNumber: 'INV-2025-11-02',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        managerId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
        amount: 15000,
        issueDate: new Date('2025-10-22'),
        dueDate: new Date('2025-11-05'),
        status: 'overdue',
        month: '11',
        year: 2025,
        description: 'Monthly rent for November 2025 - OVERDUE',
        createdAt: new Date('2025-10-22'),
        updatedAt: new Date('2025-11-06')
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6f6"),
        invoiceNumber: 'INV-2025-12-02',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        managerId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
        amount: 15000,
        issueDate: new Date('2025-12-01'),
        dueDate: new Date('2025-12-18'),
        status: 'pending',
        month: '12',
        year: 2025,
        description: 'Monthly rent for December 2025',
        createdAt: new Date('2025-12-01'),
        updatedAt: new Date('2025-12-01')
      },
      // Lisa Anderson invoices (Lease 3, 9500/month)
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6f7"),
        invoiceNumber: 'INV-2024-06-03',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        managerId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
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
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6f8"),
        invoiceNumber: 'INV-2024-07-03',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        managerId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
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
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6f9"),
        invoiceNumber: 'INV-2025-11-03',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        managerId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
        amount: 9500,
        issueDate: new Date('2025-10-18'),
        dueDate: new Date('2025-11-01'),
        status: 'overdue',
        month: '11',
        year: 2025,
        markdownContent: '# Invoice INV-2025-11-03\n\n**Tenant:** Lisa Anderson\n**Property:** Green Valley Complex\n**Unit:** A1\n**Rent Amount:** R9,500.00\n**Due Date:** 2025-11-01\n**STATUS: OVERDUE**',
        artifactPaths: { markdown: '/artifacts/inv-2025-11-03.md', pdf: '/artifacts/inv-2025-11-03.pdf' },
        createdAt: new Date('2025-10-18'),
        updatedAt: new Date('2025-11-02')
      },
      // Robert Brown invoices (Lease 4, 11500/month)
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6fa"),
        invoiceNumber: 'INV-2024-06-04',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d4"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        managerId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
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
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6fb"),
        invoiceNumber: 'INV-2024-07-04',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d4"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        managerId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
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
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6fc"),
        invoiceNumber: 'INV-2025-11-04',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d4"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        managerId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
        amount: 11500,
        issueDate: new Date('2025-10-15'),
        dueDate: new Date('2025-10-30'),
        status: 'overdue',
        month: '11',
        year: 2025,
        markdownContent: '# Invoice INV-2025-11-04\n\n**Tenant:** Robert Brown\n**Property:** Green Valley Complex\n**Unit:** B2\n**Rent Amount:** R11,500.00\n**Due Date:** 2025-10-30\n**STATUS: OVERDUE**',
        artifactPaths: { markdown: '/artifacts/inv-2025-11-04.md', pdf: '/artifacts/inv-2025-11-04.pdf' },
        createdAt: new Date('2025-10-15'),
        updatedAt: new Date('2025-10-31')
      },
      // Maria Garcia invoices (Lease 5, 18000/month)
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6fd"),
        invoiceNumber: 'INV-2024-06-05',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d5"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
        managerId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
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
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6fe"),
        invoiceNumber: 'INV-2025-12-05',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d5"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
        managerId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
        amount: 18000,
        issueDate: new Date('2025-12-01'),
        dueDate: new Date('2025-12-20'),
        status: 'pending_approval',
        month: '12',
        year: 2025,
        markdownContent: '# Invoice INV-2025-12-05\n\n**Tenant:** Maria Garcia\n**Property:** Sunset Towers\n**Unit:** P1\n**Rent Amount:** R18,000.00\n**Due Date:** 2025-12-20 Payment Pending Approval',
        artifactPaths: { markdown: '/artifacts/inv-2025-12-05.md', pdf: '/artifacts/inv-2025-12-05.pdf' },
        createdAt: new Date('2025-12-01'),
        updatedAt: new Date('2025-12-01')
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6ff"),
        invoiceNumber: 'INV-2026-01-05',
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d5"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
        managerId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
        amount: 18000,
        issueDate: new Date('2026-01-01'),
        dueDate: new Date('2026-01-20'),
        status: 'pending',
        month: '1',
        year: 2026,
        markdownContent: '# Invoice INV-2026-01-05\n\n**Tenant:** Maria Garcia\n**Property:** Sunset Towers\n**Unit:** P1\n**Rent Amount:** R18,000.00\n**Due Date:** 2026-01-20',
        artifactPaths: { markdown: '/artifacts/inv-2026-01-05.md', pdf: '/artifacts/inv-2026-01-05.pdf' },
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-01')
      }
    ]);

    // Create ALL payments (12 total)
    const payments = await db.collection("payments").insertMany([
      // Emma Thompson payments
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6e1"),
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
        amount: 12500,
        paymentDate: new Date('2025-10-10'),
        dueDate: new Date('2025-10-15'),
        status: 'paid',
        type: 'rent',
        method: 'card',
        reference: 'REF-20251010-ABC123',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6e2"),
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
        amount: 12500,
        paymentDate: null,
        dueDate: new Date('2025-11-03'),
        status: 'overdue',
        type: 'rent',
        method: null,
        reference: 'RENT-2025-11-001',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6e9"),
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
        amount: 12500,
        paymentDate: null,
        dueDate: new Date('2025-12-18'),
        status: 'pending',
        type: 'rent',
        method: null,
        reference: 'RENT-2025-12-001',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // James Smith payments
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6e3"),
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
        amount: 15000,
        paymentDate: new Date('2025-10-12'),
        dueDate: new Date('2025-10-15'),
        status: 'paid',
        type: 'rent',
        method: 'card',
        reference: 'REF-20251012-DEF456',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6e4"),
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
        amount: 15000,
        paymentDate: null,
        dueDate: new Date('2025-11-05'),
        status: 'overdue',
        type: 'rent',
        method: null,
        reference: 'RENT-2025-11-002',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6ea"),
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
        amount: 15000,
        paymentDate: null,
        dueDate: new Date('2025-12-18'),
        status: 'pending',
        type: 'rent',
        method: null,
        reference: 'RENT-2025-12-002',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Lisa Anderson payments
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6e5"),
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
        amount: 9500,
        paymentDate: new Date('2024-08-05'),
        dueDate: new Date('2024-08-01'),
        status: 'paid',
        type: 'rent',
        method: 'card',
        reference: 'REF-20240805-GHI789',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6eb"),
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
        amount: 9500,
        paymentDate: null,
        dueDate: new Date('2025-11-01'),
        status: 'overdue',
        type: 'rent',
        method: null,
        reference: 'RENT-2025-11-003',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Robert Brown payments
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6e6"),
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d4"),
        amount: 11500,
        paymentDate: new Date('2024-08-10'),
        dueDate: new Date('2024-08-01'),
        status: 'paid',
        type: 'rent',
        method: 'card',
        reference: 'REF-20240810-JKL012',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6ec"),
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d4"),
        amount: 11500,
        paymentDate: null,
        dueDate: new Date('2025-10-30'),
        status: 'overdue',
        type: 'rent',
        method: null,
        reference: 'RENT-2025-11-004',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // Maria Garcia payments
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6e7"),
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d5"),
        amount: 18000,
        paymentDate: new Date('2024-08-05'),
        dueDate: new Date('2024-08-01'),
        status: 'paid',
        type: 'rent',
        method: 'card',
        reference: 'REF-20240805-MNO345',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6e8"),
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d5"),
        amount: 18000,
        paymentDate: null,
        dueDate: new Date('2026-01-20'),
        status: 'pending',
        type: 'rent',
        method: null,
        reference: 'RENT-2026-01-005',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
    console.log(`  Created ${invoices.insertedCount} invoices`);
    console.log(`  Created ${payments.insertedCount} payments\n`);

    // ==========================================
  // STEP 9: Create other collections
  // ==========================================
  console.log("STEP 9: Creating additional collections...");
    
  // #COMPLETION_DRIVE: Assuming caretaker task documents may include propertyName, checklist, and notes fields for UI metrics
  // #SUGGEST_VERIFY: Fetch /api/tasks?caretakerId=67b2a1e0c9e4b8a3d4f5e6a4 after seeding to confirm payload shape
  const caretakerTasks = await db.collection("caretaker_tasks").insertMany([
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e801"),
        caretakerId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a4"),
        title: 'Weekly property inspection',
        description: 'Inspected common areas, verified emergency lighting, and logged minor scuff repairs',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        propertyName: 'Blue Hills Apartments',
        unitId: null,
        unitNumber: null,
        status: 'completed',
        priority: 'medium',
        dueDate: new Date('2024-11-08T09:00:00Z'),
        completedDate: new Date('2024-11-08T13:30:00Z'),
        estimatedHours: 4,
        actualHours: 3.5,
        checklist: ['Fire extinguisher pressure', 'Emergency exit signage', 'Stairwell lighting'],
        notes: 'Documented hallway scuffs for next paint touch-up cycle',
        createdAt: new Date('2024-11-01T08:00:00Z'),
        updatedAt: new Date('2024-11-08T13:30:00Z')
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e802"),
        caretakerId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a4"),
        title: 'Boiler pressure calibration',
        description: 'Balanced building boiler pressure after resident temperature complaints',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        propertyName: 'Blue Hills Apartments',
        unitId: null,
        unitNumber: null,
        status: 'completed',
        priority: 'high',
        dueDate: new Date('2024-11-05T10:00:00Z'),
        completedDate: new Date('2024-11-05T11:45:00Z'),
        estimatedHours: 2,
        actualHours: 1.75,
        checklist: ['Pressure relief valve test', 'Water temperature calibration', 'System bleed'],
        notes: 'Reset thermostat schedule to reduce overnight cycling',
        createdAt: new Date('2024-11-03T11:00:00Z'),
        updatedAt: new Date('2024-11-05T11:45:00Z')
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e803"),
        caretakerId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a4"),
        title: 'Emergency leak repair - Unit 2A',
        description: 'Responded to kitchen supply line leak and coordinated professional plumber follow-up',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        propertyName: 'Blue Hills Apartments',
        unitId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c1"),
        unitNumber: '2A',
        status: 'completed',
        priority: 'high',
        dueDate: new Date('2024-11-02T21:00:00Z'),
        completedDate: new Date('2024-11-02T20:15:00Z'),
        estimatedHours: 3,
        actualHours: 2.5,
        photos: ['leak-before.jpg', 'leak-after.jpg'],
        notes: 'Temporary fix held overnight until licensed plumber replaced valve',
        createdAt: new Date('2024-11-02T18:10:00Z'),
        updatedAt: new Date('2024-11-02T20:15:00Z')
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e804"),
        caretakerId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a4"),
        title: 'Pool chemical balancing',
        description: 'Adjusted chlorine and pH levels to comply with municipal standards',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        propertyName: 'Green Valley Complex',
        unitId: null,
        unitNumber: null,
        status: 'in_progress',
        priority: 'medium',
        dueDate: new Date('2024-11-13T07:00:00Z'),
        completedDate: null,
        estimatedHours: 2,
        actualHours: 1,
        checklist: ['Chemical test', 'Chlorine adjustment', 'Filter backwash'],
        notes: 'Awaiting follow-up test after 24-hour circulation',
        createdAt: new Date('2024-11-12T06:30:00Z'),
        updatedAt: new Date('2024-11-12T09:45:00Z')
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e805"),
        caretakerId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a4"),
        title: 'Irrigation system inspection',
        description: 'Scheduled inspection of exterior irrigation zones ahead of summer watering schedule',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        propertyName: 'Green Valley Complex',
        unitId: null,
        unitNumber: null,
        status: 'pending',
        priority: 'low',
        dueDate: new Date('2024-11-18T08:00:00Z'),
        completedDate: null,
        estimatedHours: 3,
        actualHours: null,
        checklist: ['Zone pressure test', 'Sprinkler head alignment', 'Timer calibration'],
        notes: 'To be completed after parts delivery for zone 3 valves',
        createdAt: new Date('2024-11-10T09:00:00Z'),
        updatedAt: new Date('2024-11-10T09:00:00Z')
      }
    ]);
    console.log(`  Created ${caretakerTasks.insertedCount} caretaker tasks\n`);

    // Create ALL 8 settings
    const settings = await db.collection("settings").insertMany([
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e731"),
        key: 'rent_due_day',
        value: '1',
        description: 'Day of month when rent payments are due',
        category: 'payment',
        updatedBy: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e732"),
        key: 'late_fee_percentage',
        value: '10',
        description: 'Late fee percentage for overdue rent payments',
        category: 'payment',
        updatedBy: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e733"),
        key: 'notification_email_enabled',
        value: 'true',
        description: 'Enable email notifications for users',
        category: 'notification',
        updatedBy: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e734"),
        key: 'maintenance_response_time',
        value: '24',
        description: 'Expected response time for maintenance requests (hours)',
        category: 'maintenance',
        updatedBy: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e735"),
        key: 'app_version',
        value: '1.0.0',
        description: 'Current application version',
        category: 'system',
        updatedBy: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e736"),
        key: 'max_lease_duration',
        value: '24',
        description: 'Maximum lease duration in months',
        category: 'lease',
        updatedBy: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e737"),
        key: 'security_deposit_multiplier',
        value: '2',
        description: 'Security deposit as multiplier of monthly rent',
        category: 'payment',
        updatedBy: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e738"),
        key: 'emergency_contact_number',
        value: '+27871234567',
        description: 'Emergency contact number for all properties',
        category: 'emergency',
        updatedBy: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
        updatedAt: new Date()
      }
    ]);

    // Create ALL 5 documents
    const documents = await db.collection("documents").insertMany([
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e7f1"),
        name: 'Lease Agreement - Emma Thompson',
        description: 'Signed lease agreement for Unit 2A',
        type: 'lease',
        category: 'legal',
        fileName: 'lease_emma_thompson.txt',
        fileSize: 1024,
        mimeType: 'text/plain',
        content: Buffer.from('LEASE AGREEMENT\n\nTenant: Emma Thompson\nProperty: Blue Hills Apartments\nAddress: 123 Main Street\nUnit: 2A\n\nLEASE TERMS:\nStart Date: 10/1/2025\nEnd Date: 9/30/2026\nDuration: 12 months\n\nFINANCIAL TERMS:\nMonthly Rent: $1,250.00\nSecurity Deposit: $1,250.00\n\nADDITIONAL TERMS:\nNo pets allowed. All maintenance requests must be submitted in writing.\n\nStatus: SIGNED').toString('base64'),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        unitId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c1"),
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
        uploadedBy: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
        uploadedByName: 'Michael Chen',
        uploadDate: new Date('2025-10-01'),
        status: 'signed',
        createdAt: new Date('2025-10-01'),
        updatedAt: new Date('2025-10-01')
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e7f2"),
        name: 'Property Inspection Report - Blue Hills Apartments',
        description: 'Annual property inspection documentation',
        type: 'inspection',
        category: 'maintenance',
        fileName: 'inspection_blue_hills_2024.txt',
        fileSize: 1024,
        mimeType: 'text/plain',
        content: Buffer.from('PROPERTY INSPECTION REPORT\n\nProperty: Blue Hills Apartments\nDate: August 15, 2024\n\nGeneral Condition: GOOD\n\nStructure: No issues detected\nRoof: Good condition\nFoundation: Stable\nWindows & Doors: All functioning properly\n\nSystems:\n- Electrical: Compliant\n- Plumbing: Functional\n- HVAC: Operational\n\nConclusion: Property is in good condition. No major repairs needed.').toString('base64'),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        uploadedBy: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a4"),
        uploadedByName: 'David Mokoena',
        uploadDate: new Date('2024-08-15'),
        status: 'approved',
        createdAt: new Date('2024-08-15'),
        updatedAt: new Date('2024-08-15')
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e7f3"),
        name: 'Property Insurance Policy - Blue Hills Apartments',
        description: 'Annual insurance policy documentation',
        type: 'insurance',
        category: 'legal',
        fileName: 'insurance_blue_hills_2024.txt',
        fileSize: 1024,
        mimeType: 'text/plain',
        content: Buffer.from('PROPERTY INSURANCE POLICY\n\nProperty: Blue Hills Apartments\nPolicy Number: INS-2024-001\nInsurance Provider: SafeGuard Insurance\n\nCoverage Dates:\nFrom: January 15, 2024\nTo: January 15, 2025\n\nCoverage Amount: $500,000\nDeductible: $2,500\n\nCovered Elements:\n- Building Structure\n- Liability Protection\n- Contents\n\nStatus: ACTIVE').toString('base64'),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        uploadedBy: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
        uploadedByName: 'Michael Chen',
        uploadDate: new Date('2024-01-15'),
        status: 'active',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e7f4"),
        name: 'Lease Agreement - James Smith',
        description: 'Signed lease agreement for Unit 3C',
        type: 'lease',
        category: 'legal',
        fileName: 'lease_james_smith.txt',
        fileSize: 1024,
        mimeType: 'text/plain',
        content: Buffer.from('LEASE AGREEMENT\n\nTenant: James Smith\nProperty: Blue Hills Apartments\nAddress: 123 Main Street\nUnit: 3C\n\nLEASE TERMS:\nStart Date: 9/1/2025\nEnd Date: 8/31/2026\nDuration: 12 months\n\nFINANCIAL TERMS:\nMonthly Rent: $1,500.00\nSecurity Deposit: $1,500.00\n\nADDITIONAL TERMS:\nNo subletting without written permission. Rent due on the 1st of each month.\n\nStatus: SIGNED').toString('base64'),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        unitId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c3"),
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
        uploadedBy: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
        uploadedByName: 'Michael Chen',
        uploadDate: new Date('2025-09-01'),
        status: 'signed',
        createdAt: new Date('2025-09-01'),
        updatedAt: new Date('2025-09-01')
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e7f5"),
        name: 'Lease Agreement - Lisa Anderson',
        description: 'Signed lease agreement for Unit A1',
        type: 'lease',
        category: 'legal',
        fileName: 'lease_lisa_anderson.txt',
        fileSize: 1024,
        mimeType: 'text/plain',
        content: Buffer.from('LEASE AGREEMENT\n\nTenant: Lisa Anderson\nProperty: Green Valley Apartments\nAddress: 456 Oak Avenue\nUnit: A1\n\nLEASE TERMS:\nStart Date: 8/1/2025\nEnd Date: 7/31/2026\nDuration: 12 months\n\nFINANCIAL TERMS:\nMonthly Rent: $1,100.00\nSecurity Deposit: $1,100.00\n\nADDITIONAL TERMS:\nRenewable lease. Tenant responsible for utilities. No commercial activities.\n\nStatus: SIGNED').toString('base64'),
        leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        unitId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c5"),
        tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
        uploadedBy: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
        uploadedByName: 'Michael Chen',
        uploadDate: new Date('2025-08-01'),
        status: 'signed',
        createdAt: new Date('2025-08-01'),
        updatedAt: new Date('2025-08-01')
      }
    ]);

    // Create 5 reports
    const reports = await db.collection("reports").insertMany([
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e711"),
        type: 'financial',
        period: 'monthly',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
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
        generatedBy: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e712"),
        type: 'maintenance',
        period: 'weekly',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
        data: {
          completedTasks: 12,
          pendingTasks: 5,
          avgResponseTime: 2.5,
          urgentRequests: 1,
          totalCost: 18500,
          avgResolutionTime: 3.2
        },
        generatedBy: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e713"),
        type: 'occupancy',
        period: 'monthly',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
        data: {
          totalUnits: 32,
          occupiedUnits: 28,
          vacantUnits: 4,
          occupancyRate: 87.5,
          turnoverRate: 5.2,
          avgLeaseDuration: 18.5
        },
        generatedBy: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e714"),
        type: 'performance',
        period: 'monthly',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        data: {
          tenantSatisfaction: 4.2,
          maintenanceResponseTime: 2.1,
          rentCollectionRate: 96,
          vacancyRate: 12.5,
          renewalRate: 78
        },
        generatedBy: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e715"),
        type: 'financial',
        period: 'quarterly',
        propertyId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
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
        generatedBy: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    // Create 6 audit logs
    const auditLogs = await db.collection("audit_logs").insertMany([
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e741"),
        userId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
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
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e742"),
        userId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
        action: 'payment_created',
        resource: 'payments',
        details: {
          paymentId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6e1"),
          amount: 12500,
          method: 'bank_transfer',
          reference: 'RENT-2024-08-001'
        },
        timestamp: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e745"),
        userId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
        action: 'report_generated',
        resource: 'reports',
        details: {
          reportId: new ObjectId("67b2a1e0c9e4b8a3d4f5e711"),
          type: 'financial',
          period: 'monthly',
          property: 'Blue Hills Apartments'
        },
        timestamp: new Date()
      },
      {
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e746"),
        userId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
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
        _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e748"),
        userId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
        action: 'lease_created',
        resource: 'leases',
        details: {
          leaseId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
          tenantId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
          unitId: new ObjectId("67b2a1e0c9e4b8a3d4f5e6c5"),
          monthlyRent: 9500
        },
        timestamp: new Date()
      }
    ]);
    
    console.log(`  Created ${settings.insertedCount} settings`);
    console.log(`  Created ${documents.insertedCount} documents`);
    console.log(`  Created ${reports.insertedCount} reports`);
    console.log(`  Created ${auditLogs.insertedCount} audit logs\n`);

    // ==========================================
  // STEP 10: Create Indexes
  // ==========================================
  console.log("STEP 10: Creating indexes...");
    
    await db.collection("properties").createIndex({ managerId: 1 });
    await db.collection("units").createIndex({ propertyId: 1 });
    await db.collection("leases").createIndex({ tenantId: 1 });
    await db.collection("payments").createIndex({ leaseId: 1 });
    await db.collection("invoices").createIndex({ tenantId: 1 });
  await db.collection("maintenance_requests").createIndex({ assignedTo: 1, status: 1 });
  await db.collection("caretaker_tasks").createIndex({ caretakerId: 1, status: 1 });
    
    console.log("  Created database indexes\n");

    // ==========================================
  // STEP 11: Setup Pending Users Collection
  // ==========================================
  console.log("STEP 11: Setting up pending_users collection...");
    
    await db.collection("pending_users").createIndex(
      { email: 1 },
      { unique: true, name: "email_unique_idx" }
    );
    await db.collection("pending_users").createIndex(
      { status: 1 },
      { name: "status_idx" }
    );
    await db.collection("pending_users").createIndex(
      { appliedAt: -1 },
      { name: "applied_at_idx" }
    );
    
    console.log("  Created pending_users indexes\n");

    // ==========================================
  // STEP 12: Create Sample Applications
  // ==========================================
  console.log("STEP 12: Creating sample tenant applications...");
    
    const manager1 = await db.collection("users").findOne({ 
      email: sanitizeInput('manager1@briconomy.co.za') 
    });
    
    if (manager1) {
      const manager1Props = await db.collection("properties")
        .find({ managerId: manager1._id })
        .toArray();
      
      if (manager1Props.length > 0) {
        const prop1Units = await db.collection("units")
          .find({ propertyId: manager1Props[0]._id })
          .toArray();
        
        if (prop1Units.length >= 2) {
          const sampleApplications = [
            {
              fullName: "Sarah Johnson",
              email: "sarah.johnson@email.com",
              phone: "+27-82-555-0123",
              password: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
              userType: "tenant",
              profile: {
                emergencyContact: {
                  name: "John Johnson",
                  phone: "+27-82-555-0124",
                  relationship: "Brother"
                },
                occupation: "Software Engineer",
                monthlyIncome: 45000,
                unitNumber: prop1Units[0].unitNumber,
                moveInDate: "2024-11-15",
                leaseDuration: "12"
              },
              status: "pending",
              appliedPropertyId: manager1Props[0]._id,
              propertyId: manager1Props[0]._id,
              unitId: prop1Units[0]._id,
              appliedUnitId: prop1Units[0]._id,
              appliedUnitNumber: prop1Units[0].unitNumber,
              appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              createdAt: new Date()
            },
            {
              fullName: "Michael Chen",
              email: "michael.chen@email.com",
              phone: "+27-83-555-0456",
              password: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
              userType: "tenant",
              profile: {
                emergencyContact: {
                  name: "Lisa Chen",
                  phone: "+27-83-555-0457",
                  relationship: "Wife"
                },
                occupation: "Marketing Manager",
                monthlyIncome: 38000,
                unitNumber: prop1Units[1].unitNumber,
                moveInDate: "2024-12-01",
                leaseDuration: "12"
              },
              status: "pending",
              appliedPropertyId: manager1Props[0]._id,
              propertyId: manager1Props[0]._id,
              unitId: prop1Units[1]._id,
              appliedUnitId: prop1Units[1]._id,
              appliedUnitNumber: prop1Units[1].unitNumber,
              appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
              createdAt: new Date()
            }
          ];
          
          const applicationsResult = await db.collection("pending_users").insertMany(sampleApplications);
          console.log(`  Created ${applicationsResult.insertedCount} sample applications\n`);
        }
      }
    }

    // ==========================================
    // STEP 12: Update User Profiles
    // ==========================================
    console.log("STEP 12: Updating user profiles with relationships...");
    
    // Update tenant profiles with lease IDs
    await db.collection("users").updateOne(
      { _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a6") },
      { $set: { 'profile.leaseId': new ObjectId("67b2a1e0c9e4b8a3d4f5e6d1") }}
    );
    await db.collection("users").updateOne(
      { _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a7") },
      { $set: { 'profile.leaseId': new ObjectId("67b2a1e0c9e4b8a3d4f5e6d2") }}
    );
    
    // Update manager profiles with managed properties
    await db.collection("users").updateOne(
      { _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a2") },
      { $set: { 'profile.managedProperties': [
        new ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
        new ObjectId("67b2a1e0c9e4b8a3d4f5e6b3")
      ]}}
    );
    await db.collection("users").updateOne(
      { _id: new ObjectId("67b2a1e0c9e4b8a3d4f5e6a3") },
      { $set: { 'profile.managedProperties': [
        new ObjectId("67b2a1e0c9e4b8a3d4f5e6b2")
      ]}}
    );
    
    console.log("  Updated user profiles\n");

    // ==========================================
    // Final Summary
    // ==========================================
    console.log("========================================");
    console.log("  Database Initialization Complete!");
    console.log("========================================\n");
    
    console.log("Summary:");
    console.log(`  Users: ${await db.collection("users").countDocuments({})} (10 total: 1 admin, 2 managers, 2 caretakers, 5 tenants)`);
    console.log(`  Properties: ${await db.collection("properties").countDocuments({})} (3 properties)`);
    console.log(`  Units: ${await db.collection("units").countDocuments({})} (8 units)`);
    console.log(`  Leases: ${await db.collection("leases").countDocuments({})} (5 active leases)`);
    console.log(`  Payments: ${await db.collection("payments").countDocuments({})} (12 payments)`);
    console.log(`  Invoices: ${await db.collection("invoices").countDocuments({})} (15 invoices)`);
    console.log(`  Lease Renewals: ${await db.collection("lease_renewals").countDocuments({})} (5 renewals)`);
    console.log(`  Lease Terminations: ${await db.collection("lease_terminations").countDocuments({})} (2 terminations)`);
    console.log(`  Pending Applications: ${await db.collection("pending_users").countDocuments({})}`);
    console.log(`  Documents: ${await db.collection("documents").countDocuments({})} (5 documents)`);
    console.log(`  Settings: ${await db.collection("settings").countDocuments({})} (8 settings)`);
  console.log(`  Caretaker Tasks: ${await db.collection("caretaker_tasks").countDocuments({})} (caretaker1 history seeded)`);
    console.log(`  Reports: ${await db.collection("reports").countDocuments({})} (5 reports)`);
    console.log(`  Audit Logs: ${await db.collection("audit_logs").countDocuments({})} (6 logs)`);
    
    console.log("\nTest Credentials:");
    console.log("  Admin:       admin@briconomy.co.za / admin123");
    console.log("  Manager 1:   manager1@briconomy.co.za / manager123");
    console.log("  Manager 2:   manager2@briconomy.co.za / manager123");
    console.log("  Caretaker 1: caretaker1@briconomy.co.za / caretaker123");
    console.log("  Caretaker 2: caretaker2@briconomy.co.za / caretaker123");
    console.log("  Tenant 1:    tenant1@briconomy.co.za / tenant123");
    console.log("  Tenant 2:    tenant2@briconomy.co.za / tenant123");
    console.log("  Tenant 3:    tenant3@briconomy.co.za / tenant123");
    console.log("  Tenant 4:    tenant4@briconomy.co.za / tenant123");
    console.log("  Tenant 5:    tenant5@briconomy.co.za / tenant123");
    
    console.log("\nDatabase is ready for development!");
    console.log("All ObjectIDs match the comprehensive-data-init.js script exactly.");
    console.log("All data relationships and references are intact.\n");

  } catch (error) {
    console.error("\nError during database initialization:", error);
    throw error;
  } finally {
    await client.close();
    console.log("\nMongoDB connection closed");
  }
}

// Run the initialization
initializeDatabase().catch(console.error);
