// Add sample pending applications for testing
import { MongoClient, ObjectId } from "mongodb";

const MONGO_URI = "mongodb://localhost:27017";
const DB_NAME = "briconomy";

// Sanitize input to prevent NoSQL injection
function sanitizeInput(input) {
  if (typeof input === 'string') {
    // Remove any MongoDB operators from string input
    return input.replace(/^\$/, '');
  }
  if (typeof input === 'object' && input !== null) {
    // Reject objects that contain MongoDB operators
    const keys = Object.keys(input);
    if (keys.some(key => key.startsWith('$'))) {
      throw new Error('Invalid input: MongoDB operators not allowed');
    }
  }
  return input;
}

async function addSampleApplications() {
  const client = new MongoClient(MONGO_URI);

  try {
    console.log("Connecting to MongoDB...");
    await client.connect();
    console.log("Connected successfully to MongoDB");

    const db = client.db(DB_NAME);

    // Get manager1's properties (Blue Hills Apartments and Sunset Towers)
    // Sanitize email input to prevent NoSQL injection
    const sanitizedEmail = sanitizeInput('manager1@briconomy.com');
    const manager1 = await db.collection("users").findOne({ email: sanitizedEmail });
    if (!manager1) {
      console.log("Manager1 not found. Run init-db.js first.");
      return;
    }

    // Validate that manager1._id is a proper ObjectId before using it in queries
    if (!manager1._id || !(manager1._id instanceof ObjectId)) {
      throw new Error('Invalid manager ID retrieved from database');
    }

    const properties = await db.collection("properties").find({ managerId: manager1._id }).toArray();
    if (properties.length === 0) {
      console.log("No properties found for manager1.");
      return;
    }
    
    console.log(`Found ${properties.length} properties for manager1:`);
    properties.forEach(p => console.log(`  - ${p.name} (ID: ${p._id})`));
    
    // Clear existing pending applications
    await db.collection("pending_users").deleteMany({});
    console.log("Cleared existing pending applications");

    // Get units for each property
    const unitsMap = {};
    for (const prop of properties) {
      const units = await db.collection("units").find({ propertyId: prop._id }).toArray();
      unitsMap[prop._id.toString()] = units;
    }

    // Get first available units from each property
    const prop1Units = unitsMap[properties[0]._id.toString()] || [];
    const prop2Units = properties.length > 1 ? (unitsMap[properties[1]._id.toString()] || []) : [];

    const unit1 = prop1Units[0];
    const unit2 = prop2Units.length > 0 ? prop2Units[0] : (prop1Units.length > 1 ? prop1Units[1] : null);
    const unit3 = prop1Units.length > 1 ? prop1Units[1] : (unit1 ? unit1 : null);

    if (!unit1 || !unit2 || !unit3) {
      console.log("⚠️  Not enough units available for sample applications");
      return;
    }

    // Create sample applications with proper unit references
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
          unitNumber: unit1.unitNumber,
          moveInDate: "2024-11-15",
          leaseDuration: "12"
        },
        status: "pending",
        appliedPropertyId: properties[0]._id,
        propertyId: properties[0]._id,
        unitId: unit1._id,
        appliedUnitId: unit1._id,
        appliedUnitNumber: unit1.unitNumber,
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
          unitNumber: unit2.unitNumber,
          moveInDate: "2024-12-01",
          leaseDuration: "12"
        },
        status: "pending",
        appliedPropertyId: unit2.propertyId,
        propertyId: unit2.propertyId,
        unitId: unit2._id,
        appliedUnitId: unit2._id,
        appliedUnitNumber: unit2.unitNumber,
        appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        createdAt: new Date()
      },
      {
        fullName: "Amanda Williams",
        email: "amanda.williams@email.com",
        phone: "+27-84-555-0789",
        password: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
        userType: "tenant",
        profile: {
          emergencyContact: {
            name: "Robert Williams",
            phone: "+27-84-555-0790",
            relationship: "Father"
          },
          occupation: "Graphic Designer",
          monthlyIncome: 32000,
          unitNumber: unit3.unitNumber,
          moveInDate: "2024-11-30",
          leaseDuration: "12"
        },
        status: "pending",
        appliedPropertyId: properties[0]._id,
        propertyId: properties[0]._id,
        unitId: unit3._id,
        appliedUnitId: unit3._id,
        appliedUnitNumber: unit3.unitNumber,
        appliedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        createdAt: new Date()
      }
    ];

    console.log("Inserting sample applications...");
    const result = await db.collection("pending_users").insertMany(sampleApplications);

    console.log(`Successfully created ${result.insertedCount} sample applications:`);
    sampleApplications.forEach((app, index) => {
      console.log(`  ${index + 1}. ${app.fullName} - Unit ${app.profile.unitNumber}`);
    });
    
    console.log("\n Sample data ready! You can now test the Manager Applications page.");
    
  } catch (error) {
    console.error("Error adding sample applications:", error);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
addSampleApplications();