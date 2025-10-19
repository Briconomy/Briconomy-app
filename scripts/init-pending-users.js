// Initialize pending_users collection
import { MongoClient } from "npm:mongodb@6.1.0";

const MONGO_URI = "mongodb://localhost:27017";
const DB_NAME = "briconomy";

async function initPendingUsers() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    console.log("Connecting to MongoDB...");
    await client.connect();
    console.log("Connected successfully to MongoDB");
    
    const db = client.db(DB_NAME);
    
    // Check if collection exists
    const collections = await db.listCollections({ name: "pending_users" }).toArray();
    
    if (collections.length > 0) {
      console.log("pending_users collection already exists");
    } else {
      console.log("Creating pending_users collection...");
      await db.createCollection("pending_users");
      console.log("pending_users collection created");
    }
    
    // Create indexes
    console.log("Creating indexes...");
    
    // Index on email (unique)
    await db.collection("pending_users").createIndex(
      { email: 1 },
      { unique: true, name: "email_unique_idx" }
    );
    console.log("✓ Created unique index on email");
    
    // Index on status
    await db.collection("pending_users").createIndex(
      { status: 1 },
      { name: "status_idx" }
    );
    console.log("✓ Created index on status");
    
    // Index on appliedAt
    await db.collection("pending_users").createIndex(
      { appliedAt: -1 },
      { name: "applied_at_idx" }
    );
    console.log("✓ Created index on appliedAt (descending)");
    
    // Compound index on status and appliedAt for efficient queries
    await db.collection("pending_users").createIndex(
      { status: 1, appliedAt: -1 },
      { name: "status_applied_at_idx" }
    );
    console.log("✓ Created compound index on status and appliedAt");
    
    console.log("\n✅ pending_users collection initialized successfully");
    console.log("\nCollection schema:");
    console.log({
      fullName: "string",
      email: "string (unique)",
      phone: "string",
      password: "string (hashed with SHA-256)",
      profile: {
        emergencyContact: { name: "string", phone: "string", relationship: "string" },
        occupation: "string",
        monthlyIncome: "number",
        preferredProperty: "string",
        preferredUnitNumber: "string",
        desiredMoveInDate: "string"
      },
      status: "string (pending|approved|declined)",
      appliedAt: "Date",
      appliedPropertyId: "string (optional)"
    });
    
  } catch (error) {
    console.error("Error initializing pending_users collection:", error);
    throw error;
  } finally {
    await client.close();
    console.log("\nMongoDB connection closed");
  }
}

// Run the initialization
initPendingUsers().catch(console.error);
