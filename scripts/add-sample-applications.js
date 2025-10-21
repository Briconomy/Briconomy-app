// Add sample pending applications for testing
import { MongoClient } from "npm:mongodb@6.1.0";

const MONGO_URI = "mongodb://localhost:27017";
const DB_NAME = "briconomy";

async function addSampleApplications() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    console.log("Connecting to MongoDB...");
    await client.connect();
    console.log("Connected successfully to MongoDB");
    
    const db = client.db(DB_NAME);
    
    // Get manager1's properties (Blue Hills Apartments and Sunset Towers)
    const manager1 = await db.collection("users").findOne({ email: 'manager1@briconomy.com' });
    if (!manager1) {
      console.log("Manager1 not found. Run init-db.js first.");
      return;
    }
    
    const properties = await db.collection("properties").find({ managerId: manager1._id }).toArray();
    if (properties.length === 0) {
      console.log("No properties found for manager1. Run comprehensive-relational-data.js first.");
      return;
    }
    
    console.log(`Found ${properties.length} properties for manager1:`);
    properties.forEach(p => console.log(`  - ${p.name} (ID: ${p._id})`));
    
    // Clear existing pending applications
    await db.collection("pending_users").deleteMany({});
    console.log("Cleared existing pending applications");
    
    // Create sample applications
    const sampleApplications = [
      {
        fullName: "Sarah Johnson",
        email: "sarah.johnson@email.com",
        phone: "+27-82-555-0123",
        password: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8", // SHA-256 of "password123"
        profile: {
          emergencyContact: {
            name: "John Johnson", 
            phone: "+27-82-555-0124", 
            relationship: "Brother"
          },
          occupation: "Software Engineer",
          monthlyIncome: 45000,
          preferredProperty: properties[0].name,
          preferredUnitNumber: "2B",
          desiredMoveInDate: "2024-11-15"
        },
        status: "pending",
        appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        appliedPropertyId: properties[0]._id.toString(),
        createdAt: new Date()
      },
      {
        fullName: "Michael Chen",
        email: "michael.chen@email.com", 
        phone: "+27-83-555-0456",
        password: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
        profile: {
          emergencyContact: {
            name: "Lisa Chen",
            phone: "+27-83-555-0457",
            relationship: "Wife"
          },
          occupation: "Marketing Manager",
          monthlyIncome: 38000,
          preferredProperty: properties[1] ? properties[1].name : properties[0].name,
          preferredUnitNumber: "3A",
          desiredMoveInDate: "2024-12-01"
        },
        status: "pending",
        appliedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        appliedPropertyId: (properties[1] ? properties[1]._id : properties[0]._id).toString(),
        createdAt: new Date()
      },
      {
        fullName: "Amanda Williams",
        email: "amanda.williams@email.com",
        phone: "+27-84-555-0789",
        password: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
        profile: {
          emergencyContact: {
            name: "Robert Williams",
            phone: "+27-84-555-0790",
            relationship: "Father"
          },
          occupation: "Graphic Designer",
          monthlyIncome: 32000,
          preferredProperty: properties[0].name,
          preferredUnitNumber: "1A",
          desiredMoveInDate: "2024-11-30"
        },
        status: "pending", 
        appliedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        appliedPropertyId: properties[0]._id.toString(),
        createdAt: new Date()
      }
    ];
    
    console.log("Inserting sample applications...");
    const result = await db.collection("pending_users").insertMany(sampleApplications);
    
    console.log(`✅ Successfully created ${result.insertedCount} sample applications:`);
    sampleApplications.forEach((app, index) => {
      console.log(`  ${index + 1}. ${app.fullName} - Applied for ${app.profile.preferredProperty}`);
    });
    
    console.log("\n🎉 Sample data ready! You can now test the Manager Applications page.");
    
  } catch (error) {
    console.error("Error adding sample applications:", error);
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB");
  }
}

// Run the script
addSampleApplications();