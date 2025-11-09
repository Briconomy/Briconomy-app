import { MongoClient, ObjectId as BsonObjectId } from "npm:mongodb";

const MONGO_URI = Deno.env.get("MONGO_URI") ?? "mongodb://127.0.0.1:27017";
// #COMPLETION_DRIVE: Assuming local MongoDB is accessible when no MONGO_URI is provided
// #SUGGEST_VERIFY: Set MONGO_URI env var if the database runs on a different host
const DB_NAME = Deno.env.get("DB_NAME") ?? "briconomy";
// #COMPLETION_DRIVE: Assuming default database name remains briconomy unless overridden
// #SUGGEST_VERIFY: Export DB_NAME env var if the project uses another database

const client = new MongoClient(MONGO_URI);

const ObjectId = (value) => new BsonObjectId(value);

async function dropCollections(db) {
  await db.dropDatabase();
}

async function seed(db) {
  const users = [
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
      fullName: "Sarah Johnson",
      email: "admin@briconomy.com",
      phone: "+27821234567",
      userType: "admin",
      password:
        "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
      profile: {
        "department": "System Administration",
        "employeeId": "ADMIN001",
        "joinDate": "2023-01-15T00:00:00.000Z",
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
      fullName: "Michael Chen",
      email: "manager1@briconomy.com",
      phone: "+27823456789",
      userType: "manager",
      password:
        "866485796cfa8d7c0cf7111640205b83076433547577511d81f8030ae99ecea5",
      profile: {
        "department": "Property Management",
        "employeeId": "MGR001",
        "joinDate": "2023-02-20T00:00:00.000Z",
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
      fullName: "Patricia Williams",
      email: "manager2@briconomy.com",
      phone: "+27825678901",
      userType: "manager",
      password:
        "866485796cfa8d7c0cf7111640205b83076433547577511d81f8030ae99ecea5",
      profile: {
        "department": "Property Management",
        "employeeId": "MGR002",
        "joinDate": "2023-03-10T00:00:00.000Z",
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6a4"),
      fullName: "David Mokoena",
      email: "caretaker1@briconomy.com",
      phone: "+27827890123",
      userType: "caretaker",
      password:
        "4cddfbc939614427ff8b719e4f7699528e2481c37d734086b6b7786c5d9ed1aa",
      profile: {
        "department": "Maintenance",
        "employeeId": "CARE001",
        "joinDate": "2023-04-05T00:00:00.000Z",
        "skills": ["plumbing", "electrical", "general"],
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6a5"),
      fullName: "Thabo Ndlovu",
      email: "caretaker2@briconomy.com",
      phone: "+27829012345",
      userType: "caretaker",
      password:
        "4cddfbc939614427ff8b719e4f7699528e2481c37d734086b6b7786c5d9ed1aa",
      profile: {
        "department": "Maintenance",
        "employeeId": "CARE002",
        "joinDate": "2023-05-12T00:00:00.000Z",
        "skills": ["carpentry", "painting", "landscaping"],
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
      fullName: "Emma Thompson",
      email: "tenant1@briconomy.com",
      phone: "+27821234568",
      userType: "tenant",
      password:
        "b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33",
      profile: {
        "emergencyContact": "+27821234569",
        "occupation": "Software Developer",
        "moveInDate": "2023-06-01T00:00:00.000Z",
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
      fullName: "James Smith",
      email: "tenant2@briconomy.com",
      phone: "+27823456790",
      userType: "tenant",
      password:
        "b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33",
      profile: {
        "emergencyContact": "+27823456791",
        "occupation": "Teacher",
        "moveInDate": "2023-07-15T00:00:00.000Z",
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
      fullName: "Lisa Anderson",
      email: "tenant3@briconomy.com",
      phone: "+27825678902",
      userType: "tenant",
      password:
        "b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33",
      profile: {
        "emergencyContact": "+27825678903",
        "occupation": "Nurse",
        "moveInDate": "2023-08-20T00:00:00.000Z",
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
      fullName: "Robert Brown",
      email: "tenant4@briconomy.com",
      phone: "+27827890124",
      userType: "tenant",
      password:
        "b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33",
      profile: {
        "emergencyContact": "+27827890125",
        "occupation": "Engineer",
        "moveInDate": "2023-09-10T00:00:00.000Z",
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
      fullName: "Maria Garcia",
      email: "tenant5@briconomy.com",
      phone: "+27829012346",
      userType: "tenant",
      password:
        "b4f08230cddd4c1bc52a876e12db534f8b40eedb08ba78a5501d1cdf8eb8cb33",
      profile: {
        "emergencyContact": "+27829012347",
        "occupation": "Designer",
        "moveInDate": "2023-10-05T00:00:00.000Z",
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const properties = [
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
      name: "Blue Hills Apartments",
      address: "123 Main St, Cape Town, 8001",
      type: "apartment",
      totalUnits: 24,
      occupiedUnits: 21,
      managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
      amenities: ["pool", "gym", "parking", "security", "laundry", "elevator"],
      description:
        "Modern apartment complex in the heart of Cape Town with stunning city views",
      yearBuilt: 2018,
      lastRenovation: 2022,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
      name: "Green Valley Complex",
      address: "456 Oak Ave, Durban, 4001",
      type: "complex",
      totalUnits: 18,
      occupiedUnits: 16,
      managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
      amenities: ["parking", "garden", "playground", "bbq_area", "security"],
      description:
        "Family-friendly complex with beautiful gardens and recreational facilities",
      yearBuilt: 2015,
      lastRenovation: 2021,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
      name: "Sunset Towers",
      address: "789 Beach Rd, Port Elizabeth, 6001",
      type: "apartment",
      totalUnits: 32,
      occupiedUnits: 28,
      managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
      amenities: ["pool", "gym", "parking", "ocean_view", "concierge", "spa"],
      description: "Luxury beachfront apartments with panoramic ocean views",
      yearBuilt: 2020,
      lastRenovation: 2023,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const units = [
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6c1"),
      unitNumber: "2A",
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
      rent: 12500,
      bedrooms: 2,
      bathrooms: 1,
      sqft: 850,
      status: "occupied",
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
      features: ["balcony", "built_in_cupboards", "tiled_flooring"],
      floor: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6c2"),
      unitNumber: "1B",
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
      rent: 10500,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 650,
      status: "vacant",
      tenantId: null,
      features: ["garden_view", "built_in_cupboards"],
      floor: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6c3"),
      unitNumber: "3C",
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
      rent: 15000,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1200,
      status: "occupied",
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
      features: [
        "balcony",
        "ocean_view",
        "built_in_cupboards",
        "air_conditioning",
      ],
      floor: 3,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6c4"),
      unitNumber: "4D",
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
      rent: 8500,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 500,
      status: "maintenance",
      tenantId: null,
      features: ["garden_view", "built_in_cupboards"],
      floor: 4,
      maintenanceNotes: "Plumbing repairs needed",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6c5"),
      unitNumber: "A1",
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
      rent: 9500,
      bedrooms: 2,
      bathrooms: 1,
      sqft: 750,
      status: "occupied",
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
      features: ["garden_access", "built_in_cupboards", "parking"],
      floor: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6c6"),
      unitNumber: "B2",
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
      rent: 11500,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 950,
      status: "occupied",
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
      features: [
        "balcony",
        "built_in_cupboards",
        "air_conditioning",
        "parking",
      ],
      floor: 2,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6c7"),
      unitNumber: "P1",
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
      rent: 18000,
      bedrooms: 2,
      bathrooms: 2,
      sqft: 1100,
      status: "occupied",
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
      features: [
        "penthouse",
        "ocean_view",
        "balcony",
        "air_conditioning",
        "concierge_service",
      ],
      floor: 15,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6c8"),
      unitNumber: "8A",
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
      rent: 13500,
      bedrooms: 1,
      bathrooms: 1,
      sqft: 700,
      status: "vacant",
      tenantId: null,
      features: ["ocean_view", "balcony", "built_in_cupboards"],
      floor: 8,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const leases = [
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
      unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c1"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
      monthlyRent: 12500,
      deposit: 25000,
      status: "active",
      terms: "Standard residential lease agreement",
      renewalOption: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
      unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c3"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
      startDate: new Date("2024-03-01"),
      endDate: new Date("2025-02-28"),
      monthlyRent: 15000,
      deposit: 30000,
      status: "active",
      terms: "Standard residential lease agreement",
      renewalOption: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
      unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c5"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
      startDate: new Date("2024-06-01"),
      endDate: new Date("2025-05-31"),
      monthlyRent: 9500,
      deposit: 19000,
      status: "active",
      terms: "Standard residential lease agreement",
      renewalOption: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6d4"),
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
      unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c6"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
      startDate: new Date("2024-04-01"),
      endDate: new Date("2025-03-31"),
      monthlyRent: 11500,
      deposit: 23000,
      status: "active",
      terms: "Standard residential lease agreement",
      renewalOption: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6d5"),
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
      unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c7"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
      startDate: new Date("2024-07-01"),
      endDate: new Date("2025-06-30"),
      monthlyRent: 18000,
      deposit: 36000,
      status: "active",
      terms: "Premium residential lease agreement",
      renewalOption: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const invoices = [
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6f1"),
      invoiceNumber: "INV-2024-06",
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
      managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
      amount: 12500,
      issueDate: new Date("2024-06-01"),
      dueDate: new Date("2024-06-15"),
      status: "paid",
      month: "6",
      year: 2024,
      markdownContent:
        "# Invoice INV-2024-06\n\n**Tenant:** Emma Thompson\n**Property:** Blue Hills Apartments\n**Unit:** 2A\n**Rent Amount:** R12,500.00\n**Due Date:** 2024-06-15",
      artifactPaths: {
        markdown: "/artifacts/inv-2024-06.md",
        pdf: "/artifacts/inv-2024-06.pdf",
      },
      createdAt: new Date("2024-06-01"),
      updatedAt: new Date("2024-06-01"),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6f2"),
      invoiceNumber: "INV-2024-07",
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
      managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
      amount: 12500,
      issueDate: new Date("2024-07-01"),
      dueDate: new Date("2024-07-15"),
      status: "paid",
      month: "7",
      year: 2024,
      markdownContent:
        "# Invoice INV-2024-07\n\n**Tenant:** Emma Thompson\n**Property:** Blue Hills Apartments\n**Unit:** 2A\n**Rent Amount:** R12,500.00\n**Due Date:** 2024-07-15",
      artifactPaths: {
        markdown: "/artifacts/inv-2024-07.md",
        pdf: "/artifacts/inv-2024-07.pdf",
      },
      createdAt: new Date("2024-07-01"),
      updatedAt: new Date("2024-07-01"),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6f3"),
      invoiceNumber: "INV-2024-08",
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
      managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
      amount: 12500,
      issueDate: new Date("2024-08-01"),
      dueDate: new Date("2024-08-15"),
      status: "pending",
      month: "8",
      year: 2024,
      markdownContent:
        "# Invoice INV-2024-08\n\n**Tenant:** Emma Thompson\n**Property:** Blue Hills Apartments\n**Unit:** 2A\n**Rent Amount:** R12,500.00\n**Due Date:** 2024-08-15",
      artifactPaths: {
        markdown: "/artifacts/inv-2024-08.md",
        pdf: "/artifacts/inv-2024-08.pdf",
      },
      createdAt: new Date("2024-08-01"),
      updatedAt: new Date("2024-08-01"),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6f4"),
      invoiceNumber: "INV-2024-06-02",
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
      managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
      amount: 15000,
      issueDate: new Date("2024-06-01"),
      dueDate: new Date("2024-06-15"),
      status: "paid",
      month: "6",
      year: 2024,
      markdownContent:
        "# Invoice INV-2024-06-02\n\n**Tenant:** James Smith\n**Property:** Blue Hills Apartments\n**Unit:** 3C\n**Rent Amount:** R15,000.00\n**Due Date:** 2024-06-15",
      artifactPaths: {
        markdown: "/artifacts/inv-2024-06-02.md",
        pdf: "/artifacts/inv-2024-06-02.pdf",
      },
      createdAt: new Date("2024-06-01"),
      updatedAt: new Date("2024-06-01"),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6f5"),
      invoiceNumber: "INV-2024-07-02",
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
      managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
      amount: 15000,
      issueDate: new Date("2024-07-01"),
      dueDate: new Date("2024-07-15"),
      status: "overdue",
      month: "7",
      year: 2024,
      markdownContent:
        "# Invoice INV-2024-07-02\n\n**Tenant:** James Smith\n**Property:** Blue Hills Apartments\n**Unit:** 3C\n**Rent Amount:** R15,000.00\n**Due Date:** 2024-07-15 [OVERDUE]",
      artifactPaths: {
        markdown: "/artifacts/inv-2024-07-02.md",
        pdf: "/artifacts/inv-2024-07-02.pdf",
      },
      createdAt: new Date("2024-07-01"),
      updatedAt: new Date("2024-07-01"),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6f6"),
      invoiceNumber: "INV-2024-08-02",
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
      managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
      amount: 15000,
      issueDate: new Date("2024-08-01"),
      dueDate: new Date("2024-08-15"),
      status: "pending",
      month: "8",
      year: 2024,
      markdownContent:
        "# Invoice INV-2024-08-02\n\n**Tenant:** James Smith\n**Property:** Blue Hills Apartments\n**Unit:** 3C\n**Rent Amount:** R15,000.00\n**Due Date:** 2024-08-15",
      artifactPaths: {
        markdown: "/artifacts/inv-2024-08-02.md",
        pdf: "/artifacts/inv-2024-08-02.pdf",
      },
      createdAt: new Date("2024-08-01"),
      updatedAt: new Date("2024-08-01"),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6f7"),
      invoiceNumber: "INV-2024-06-03",
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
      managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
      amount: 9500,
      issueDate: new Date("2024-06-01"),
      dueDate: new Date("2024-06-15"),
      status: "paid",
      month: "6",
      year: 2024,
      markdownContent:
        "# Invoice INV-2024-06-03\n\n**Tenant:** Lisa Anderson\n**Property:** Green Valley Complex\n**Unit:** A1\n**Rent Amount:** R9,500.00\n**Due Date:** 2024-06-15",
      artifactPaths: {
        markdown: "/artifacts/inv-2024-06-03.md",
        pdf: "/artifacts/inv-2024-06-03.pdf",
      },
      createdAt: new Date("2024-06-01"),
      updatedAt: new Date("2024-06-01"),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6f8"),
      invoiceNumber: "INV-2024-07-03",
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
      managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
      amount: 9500,
      issueDate: new Date("2024-07-01"),
      dueDate: new Date("2024-07-15"),
      status: "paid",
      month: "7",
      year: 2024,
      markdownContent:
        "# Invoice INV-2024-07-03\n\n**Tenant:** Lisa Anderson\n**Property:** Green Valley Complex\n**Unit:** A1\n**Rent Amount:** R9,500.00\n**Due Date:** 2024-07-15",
      artifactPaths: {
        markdown: "/artifacts/inv-2024-07-03.md",
        pdf: "/artifacts/inv-2024-07-03.pdf",
      },
      createdAt: new Date("2024-07-01"),
      updatedAt: new Date("2024-07-01"),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6f9"),
      invoiceNumber: "INV-2024-08-03",
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
      managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
      amount: 9500,
      issueDate: new Date("2024-08-01"),
      dueDate: new Date("2024-08-15"),
      status: "pending",
      month: "8",
      year: 2024,
      markdownContent:
        "# Invoice INV-2024-08-03\n\n**Tenant:** Lisa Anderson\n**Property:** Green Valley Complex\n**Unit:** A1\n**Rent Amount:** R9,500.00\n**Due Date:** 2024-08-15",
      artifactPaths: {
        markdown: "/artifacts/inv-2024-08-03.md",
        pdf: "/artifacts/inv-2024-08-03.pdf",
      },
      createdAt: new Date("2024-08-01"),
      updatedAt: new Date("2024-08-01"),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6fa"),
      invoiceNumber: "INV-2024-06-04",
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d4"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
      managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
      amount: 11500,
      issueDate: new Date("2024-06-01"),
      dueDate: new Date("2024-06-15"),
      status: "paid",
      month: "6",
      year: 2024,
      markdownContent:
        "# Invoice INV-2024-06-04\n\n**Tenant:** Robert Brown\n**Property:** Green Valley Complex\n**Unit:** B2\n**Rent Amount:** R11,500.00\n**Due Date:** 2024-06-15",
      artifactPaths: {
        markdown: "/artifacts/inv-2024-06-04.md",
        pdf: "/artifacts/inv-2024-06-04.pdf",
      },
      createdAt: new Date("2024-06-01"),
      updatedAt: new Date("2024-06-01"),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6fb"),
      invoiceNumber: "INV-2024-07-04",
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d4"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
      managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
      amount: 11500,
      issueDate: new Date("2024-07-01"),
      dueDate: new Date("2024-07-15"),
      status: "paid",
      month: "7",
      year: 2024,
      markdownContent:
        "# Invoice INV-2024-07-04\n\n**Tenant:** Robert Brown\n**Property:** Green Valley Complex\n**Unit:** B2\n**Rent Amount:** R11,500.00\n**Due Date:** 2024-07-15",
      artifactPaths: {
        markdown: "/artifacts/inv-2024-07-04.md",
        pdf: "/artifacts/inv-2024-07-04.pdf",
      },
      createdAt: new Date("2024-07-01"),
      updatedAt: new Date("2024-07-01"),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6fc"),
      invoiceNumber: "INV-2024-08-04",
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d4"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
      managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
      amount: 11500,
      issueDate: new Date("2024-08-01"),
      dueDate: new Date("2024-08-15"),
      status: "pending",
      month: "8",
      year: 2024,
      markdownContent:
        "# Invoice INV-2024-08-04\n\n**Tenant:** Robert Brown\n**Property:** Green Valley Complex\n**Unit:** B2\n**Rent Amount:** R11,500.00\n**Due Date:** 2024-08-15",
      artifactPaths: {
        markdown: "/artifacts/inv-2024-08-04.md",
        pdf: "/artifacts/inv-2024-08-04.pdf",
      },
      createdAt: new Date("2024-08-01"),
      updatedAt: new Date("2024-08-01"),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6fd"),
      invoiceNumber: "INV-2024-06-05",
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d5"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
      managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
      amount: 18000,
      issueDate: new Date("2024-06-01"),
      dueDate: new Date("2024-06-15"),
      status: "paid",
      month: "6",
      year: 2024,
      markdownContent:
        "# Invoice INV-2024-06-05\n\n**Tenant:** Maria Garcia\n**Property:** Sunset Towers\n**Unit:** P1\n**Rent Amount:** R18,000.00\n**Due Date:** 2024-06-15",
      artifactPaths: {
        markdown: "/artifacts/inv-2024-06-05.md",
        pdf: "/artifacts/inv-2024-06-05.pdf",
      },
      createdAt: new Date("2024-06-01"),
      updatedAt: new Date("2024-06-01"),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6fe"),
      invoiceNumber: "INV-2024-07-05",
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d5"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
      managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
      amount: 18000,
      issueDate: new Date("2024-07-01"),
      dueDate: new Date("2024-07-15"),
      status: "pending_approval",
      month: "7",
      year: 2024,
      markdownContent:
        "# Invoice INV-2024-07-05\n\n**Tenant:** Maria Garcia\n**Property:** Sunset Towers\n**Unit:** P1\n**Rent Amount:** R18,000.00\n**Due Date:** 2024-07-15 [Payment Pending Approval]",
      artifactPaths: {
        markdown: "/artifacts/inv-2024-07-05.md",
        pdf: "/artifacts/inv-2024-07-05.pdf",
      },
      createdAt: new Date("2024-07-01"),
      updatedAt: new Date("2024-07-01"),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6ff"),
      invoiceNumber: "INV-2024-08-05",
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d5"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
      managerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
      amount: 18000,
      issueDate: new Date("2024-08-01"),
      dueDate: new Date("2024-08-15"),
      status: "pending",
      month: "8",
      year: 2024,
      markdownContent:
        "# Invoice INV-2024-08-05\n\n**Tenant:** Maria Garcia\n**Property:** Sunset Towers\n**Unit:** P1\n**Rent Amount:** R18,000.00\n**Due Date:** 2024-08-15",
      artifactPaths: {
        markdown: "/artifacts/inv-2024-08-05.md",
        pdf: "/artifacts/inv-2024-08-05.pdf",
      },
      createdAt: new Date("2024-08-01"),
      updatedAt: new Date("2024-08-01"),
    },
  ];

  const leaseRenewals = [
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7a1"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
      status: "pending",
      renewalOfferSent: false,
      tenantResponse: null,
      offerSentDate: null,
      responseDate: null,
      newTerms: {
        duration: 12,
        monthlyRent: 12000,
        startDate: new Date("2025-06-01"),
      },
      createdAt: new Date("2024-09-15"),
      updatedAt: new Date("2024-09-15"),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7a2"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
      status: "pending",
      renewalOfferSent: false,
      tenantResponse: null,
      offerSentDate: null,
      responseDate: null,
      newTerms: {
        duration: 12,
        monthlyRent: 15000,
        startDate: new Date("2025-11-01"),
      },
      createdAt: new Date("2024-09-20"),
      updatedAt: new Date("2024-09-20"),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7a3"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
      status: "offer_sent",
      renewalOfferSent: true,
      tenantResponse: "pending",
      offerSentDate: new Date("2024-10-10"),
      responseDate: null,
      newTerms: {
        duration: 12,
        monthlyRent: 11000,
        startDate: new Date("2025-07-01"),
      },
      createdAt: new Date("2024-10-01"),
      updatedAt: new Date("2024-10-10"),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7a4"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d4"),
      status: "accepted",
      renewalOfferSent: true,
      tenantResponse: "accepted",
      offerSentDate: new Date("2024-09-15"),
      responseDate: new Date("2024-09-20"),
      newTerms: {
        duration: 12,
        monthlyRent: 9500,
        startDate: new Date("2025-05-01"),
      },
      createdAt: new Date("2024-09-01"),
      updatedAt: new Date("2024-09-20"),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7a5"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d5"),
      status: "declined",
      renewalOfferSent: true,
      tenantResponse: "declined",
      offerSentDate: new Date("2024-10-01"),
      responseDate: new Date("2024-10-05"),
      newTerms: {
        duration: 12,
        monthlyRent: 13500,
        startDate: new Date("2025-09-01"),
      },
      createdAt: new Date("2024-09-12"),
      updatedAt: new Date("2024-10-05"),
    },
  ];

  const payments = [
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6e1"),
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
      amount: 12500,
      paymentDate: new Date("2024-08-01"),
      dueDate: new Date("2024-08-01"),
      status: "paid",
      type: "rent",
      method: "bank_transfer",
      reference: "RENT-2024-08-001",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6e2"),
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
      amount: 12500,
      paymentDate: null,
      dueDate: new Date("2024-09-01"),
      status: "pending",
      type: "rent",
      method: null,
      reference: "RENT-2024-09-001",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6e3"),
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
      amount: 15000,
      paymentDate: new Date("2024-08-15"),
      dueDate: new Date("2024-08-01"),
      status: "paid",
      type: "rent",
      method: "eft",
      reference: "RENT-2024-08-002",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6e4"),
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
      amount: 15000,
      paymentDate: null,
      dueDate: new Date("2024-09-01"),
      status: "pending",
      type: "rent",
      method: null,
      reference: "RENT-2024-09-002",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6e5"),
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
      amount: 9500,
      paymentDate: new Date("2024-08-05"),
      dueDate: new Date("2024-08-01"),
      status: "paid",
      type: "rent",
      method: "cash",
      reference: "RENT-2024-08-003",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6e6"),
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d4"),
      amount: 11500,
      paymentDate: new Date("2024-08-10"),
      dueDate: new Date("2024-08-01"),
      status: "paid",
      type: "rent",
      method: "bank_transfer",
      reference: "RENT-2024-08-004",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6e7"),
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d5"),
      amount: 18000,
      paymentDate: new Date("2024-08-01"),
      dueDate: new Date("2024-08-01"),
      status: "paid",
      type: "rent",
      method: "bank_transfer",
      reference: "RENT-2024-08-005",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6e8"),
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d5"),
      amount: 18000,
      paymentDate: null,
      dueDate: new Date("2024-09-01"),
      status: "pending",
      type: "rent",
      method: null,
      reference: "RENT-2024-09-005",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const caretakerTasks = [
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e701"),
      caretakerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a4"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
      title: "Weekly property inspection",
      description:
        "Routine inspection of common areas and exterior, check for maintenance issues",
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: "pending",
      priority: "medium",
      estimatedHours: 4,
      actualHours: null,
      completedDate: null,
      notes: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e702"),
      caretakerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a5"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
      title: "Garden maintenance",
      description:
        "Trim hedges, water plants, and general landscaping of common areas",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: "in_progress",
      priority: "low",
      estimatedHours: 6,
      actualHours: 3,
      completedDate: null,
      notes:
        "Started trimming hedges, weather permitting will complete tomorrow",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e703"),
      caretakerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a4"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
      title: "Pool cleaning",
      description: "Weekly pool maintenance and chemical balancing",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      status: "pending",
      priority: "medium",
      estimatedHours: 3,
      actualHours: null,
      completedDate: null,
      notes: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e704"),
      caretakerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a5"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
      title: "Security system check",
      description: "Monthly security system inspection and testing",
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      status: "pending",
      priority: "high",
      estimatedHours: 2,
      actualHours: null,
      completedDate: null,
      notes: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e705"),
      caretakerId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a4"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
      title: "Playground inspection",
      description: "Safety inspection of playground equipment",
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      status: "pending",
      priority: "medium",
      estimatedHours: 2,
      actualHours: null,
      completedDate: null,
      notes: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const reports = [
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e711"),
      type: "financial",
      period: "monthly",
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
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
        propertyTaxes: 10000,
      },
      generatedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e712"),
      type: "maintenance",
      period: "weekly",
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
      data: {
        completedTasks: 12,
        pendingTasks: 5,
        avgResponseTime: 2.5,
        urgentRequests: 1,
        totalCost: 18500,
        avgResolutionTime: 3.2,
      },
      generatedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e713"),
      type: "occupancy",
      period: "monthly",
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
      data: {
        totalUnits: 32,
        occupiedUnits: 28,
        vacantUnits: 4,
        occupancyRate: 87.5,
        turnoverRate: 5.2,
        avgLeaseDuration: 18.5,
      },
      generatedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e714"),
      type: "performance",
      period: "monthly",
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
      data: {
        tenantSatisfaction: 4.2,
        maintenanceResponseTime: 2.1,
        rentCollectionRate: 96,
        vacancyRate: 12.5,
        renewalRate: 78,
      },
      generatedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e715"),
      type: "financial",
      period: "quarterly",
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
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
        propertyTaxes: 30000,
      },
      generatedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const notifications = [
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e721"),
      userId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
      title: "Rent Due Reminder",
      message:
        "Your rent payment for September 2024 is due in 5 days. Please ensure payment is made on time to avoid late fees.",
      type: "payment_reminder",
      read: false,
      priority: "medium",
      actionRequired: true,
      actionUrl: "/tenant/payments",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e723"),
      userId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
      title: "Lease Renewal Notice",
      message:
        "Your lease expires in 60 days. Please contact management to discuss renewal options.",
      type: "lease_renewal",
      read: true,
      priority: "medium",
      actionRequired: true,
      actionUrl: "/tenant/profile",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e724"),
      userId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
      title: "Payment Confirmation",
      message:
        "Your rent payment for August 2024 has been successfully processed. Thank you for your payment.",
      type: "payment_confirmation",
      read: false,
      priority: "low",
      actionRequired: false,
      actionUrl: "/tenant/payments",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e726"),
      userId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
      title: "Monthly Report Available",
      message:
        "The monthly financial report for Blue Hills Apartments is now available for review.",
      type: "report_available",
      read: false,
      priority: "medium",
      actionRequired: false,
      actionUrl: "/manager/reports",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const settings = [
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e731"),
      key: "rent_due_day",
      value: "1",
      description: "Day of month when rent payments are due",
      category: "payment",
      updatedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e732"),
      key: "late_fee_percentage",
      value: "10",
      description: "Late fee percentage for overdue rent payments",
      category: "payment",
      updatedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e733"),
      key: "notification_email_enabled",
      value: "true",
      description: "Enable email notifications for users",
      category: "notification",
      updatedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e734"),
      key: "maintenance_response_time",
      value: "24",
      description: "Expected response time for maintenance requests (hours)",
      category: "maintenance",
      updatedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e735"),
      key: "app_version",
      value: "1.0.0",
      description: "Current application version",
      category: "system",
      updatedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e736"),
      key: "max_lease_duration",
      value: "24",
      description: "Maximum lease duration in months",
      category: "lease",
      updatedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e737"),
      key: "security_deposit_multiplier",
      value: "2",
      description: "Security deposit as multiplier of monthly rent",
      category: "payment",
      updatedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
      updatedAt: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e738"),
      key: "emergency_contact_number",
      value: "+27871234567",
      description: "Emergency contact number for all properties",
      category: "emergency",
      updatedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a1"),
      updatedAt: new Date(),
    },
  ];

  const auditLogs = [
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e741"),
      userId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
      action: "user_login",
      resource: "authentication",
      details: {
        ip: "192.168.1.100",
        userAgent: "Mozilla/5.0 (Android 10; Mobile; rv:81.0)",
        success: true,
      },
      timestamp: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e742"),
      userId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
      action: "payment_created",
      resource: "payments",
      details: {
        paymentId: ObjectId("67b2a1e0c9e4b8a3d4f5e6e1"),
        amount: 12500,
        method: "bank_transfer",
        reference: "RENT-2024-08-001",
      },
      timestamp: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e744"),
      userId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a4"),
      action: "task_assigned",
      resource: "caretaker_tasks",
      details: {
        taskId: ObjectId("67b2a1e0c9e4b8a3d4f5e701"),
        property: "Blue Hills Apartments",
        title: "Weekly property inspection",
      },
      timestamp: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e745"),
      userId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
      action: "report_generated",
      resource: "reports",
      details: {
        reportId: ObjectId("67b2a1e0c9e4b8a3d4f5e711"),
        type: "financial",
        period: "monthly",
        property: "Blue Hills Apartments",
      },
      timestamp: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e746"),
      userId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
      action: "profile_updated",
      resource: "users",
      details: {
        updatedFields: ["phone", "emergencyContact"],
        previousPhone: "+27823456790",
        newPhone: "+27823456791",
      },
      timestamp: new Date(),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e748"),
      userId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
      action: "lease_created",
      resource: "leases",
      details: {
        leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
        tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
        unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c5"),
        monthlyRent: 9500,
      },
      timestamp: new Date(),
    },
  ];

  const documents = [
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7f1"),
      name: "Lease Agreement - Emma Thompson",
      description: "Signed lease agreement for Unit 1A",
      type: "lease",
      category: "legal",
      fileName: "lease_emma_thompson.pdf",
      fileSize: 2621440,
      mimeType: "application/pdf",
      gridFsFileId: new BsonObjectId(),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
      unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c1"),
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
      uploadedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
      uploadedByName: "Michael Chen",
      uploadDate: new Date("2024-01-15"),
      status: "signed",
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7f2"),
      name: "Property Inspection Report - Blue Hills Apartments",
      description: "Annual property inspection documentation",
      type: "inspection",
      category: "maintenance",
      fileName: "inspection_blue_hills_2024.pdf",
      fileSize: 1258291,
      mimeType: "application/pdf",
      gridFsFileId: new BsonObjectId(),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
      uploadedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a4"),
      uploadedByName: "David Miller",
      uploadDate: new Date("2024-08-15"),
      status: "approved",
      createdAt: new Date("2024-08-15"),
      updatedAt: new Date("2024-08-15"),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7f3"),
      name: "Property Insurance Policy - Blue Hills Apartments",
      description: "Annual insurance policy documentation",
      type: "insurance",
      category: "legal",
      fileName: "insurance_blue_hills_2024.pdf",
      fileSize: 4404019,
      mimeType: "application/pdf",
      gridFsFileId: new BsonObjectId(),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
      uploadedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
      uploadedByName: "Michael Chen",
      uploadDate: new Date("2024-01-15"),
      status: "active",
      createdAt: new Date("2024-01-15"),
      updatedAt: new Date("2024-01-15"),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7f4"),
      name: "Lease Agreement - James Smith",
      description: "Signed lease agreement for Unit 2A",
      type: "lease",
      category: "legal",
      fileName: "lease_james_smith.pdf",
      fileSize: 2516582,
      mimeType: "application/pdf",
      gridFsFileId: new BsonObjectId(),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
      unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c3"),
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
      uploadedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
      uploadedByName: "Michael Chen",
      uploadDate: new Date("2023-06-01"),
      status: "signed",
      createdAt: new Date("2023-06-01"),
      updatedAt: new Date("2023-06-01"),
    },
    {
      _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7f5"),
      name: "Lease Agreement - Lisa Anderson",
      description: "Signed lease agreement for Unit 1B",
      type: "lease",
      category: "legal",
      fileName: "lease_lisa_anderson.pdf",
      fileSize: 2453821,
      mimeType: "application/pdf",
      gridFsFileId: new BsonObjectId(),
      leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
      propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
      unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
      tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
      uploadedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
      uploadedByName: "Michael Chen",
      uploadDate: new Date("2024-03-15"),
      status: "signed",
      createdAt: new Date("2024-03-15"),
      updatedAt: new Date("2024-03-15"),
    },
  ];

  if (users.length > 0) {
    await db.collection("users").insertMany(users);
  }

  if (properties.length > 0) {
    await db.collection("properties").insertMany(properties);
  }

  if (units.length > 0) {
    await db.collection("units").insertMany(units);
  }

  if (leases.length > 0) {
    await db.collection("leases").insertMany(leases);
  }

  if (invoices.length > 0) {
    await db.collection("invoices").insertMany(invoices);
  }

  if (leaseRenewals.length > 0) {
    await db.collection("lease_renewals").insertMany(leaseRenewals);
  }

  if (payments.length > 0) {
    await db.collection("payments").insertMany(payments);
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

  if (settings.length > 0) {
    await db.collection("settings").insertMany(settings);
  }

  if (auditLogs.length > 0) {
    await db.collection("audit_logs").insertMany(auditLogs);
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

  await db.collection("properties").createIndex({ managerId: 1 });
  await db.collection("properties").createIndex({ status: 1 });
  await db.collection("properties").createIndex({ type: 1 });
  await db.collection("properties").createIndex({
    name: "text",
    address: "text",
  });

  await db.collection("units").createIndex({ propertyId: 1 });
  await db.collection("units").createIndex({ status: 1 });

  await db.collection("leases").createIndex({ tenantId: 1 });
  await db.collection("leases").createIndex({ propertyId: 1 });
  await db.collection("leases").createIndex({ unitId: 1 });
  await db.collection("leases").createIndex({ status: 1 });

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
