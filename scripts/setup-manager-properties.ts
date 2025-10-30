// Setup script to link managers to properties and create sample applications
import { connectToMongoDB, getCollection } from "../db.ts";

async function setupManagerProperties() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await connectToMongoDB();
    console.log("✅ Connected to MongoDB");

    const users = getCollection("users");
    const properties = getCollection("properties");
    const units = getCollection("units");
    const pendingUsers = getCollection("pending_users");

    // Get managers
    const manager1 = await users.findOne({ email: "manager1@briconomy.com" });
    const manager2 = await users.findOne({ email: "manager2@briconomy.com" });

    if (!manager1 || !manager2) {
      console.error("❌ Managers not found. Please run: deno task init-db");
      Deno.exit(1);
    }

    console.log("👥 Found managers:");
    console.log(`   - ${manager1.fullName} (${manager1.email})`);
    console.log(`   - ${manager2.fullName} (${manager2.email})`);

    // Get all properties
    const allProperties = await properties.find({}).toArray();
    console.log(`\n🏢 Found ${allProperties.length} properties`);

    if (allProperties.length === 0) {
      console.error("❌ No properties found. Database might not be initialized.");
      Deno.exit(1);
    }

    // Update properties with manager assignments
    console.log("\n🔗 Linking properties to managers...");

    if (allProperties.length >= 1) {
      await properties.updateOne(
        { _id: allProperties[0]._id },
        { $set: { managerId: manager1._id } }
      );
      console.log(`   ✓ ${allProperties[0].name} → ${manager1.fullName}`);
    }

    if (allProperties.length >= 2) {
      await properties.updateOne(
        { _id: allProperties[1]._id },
        { $set: { managerId: manager2._id } }
      );
      console.log(`   ✓ ${allProperties[1].name} → ${manager2.fullName}`);
    }

    if (allProperties.length >= 3) {
      await properties.updateOne(
        { _id: allProperties[2]._id },
        { $set: { managerId: manager1._id } }
      );
      console.log(`   ✓ ${allProperties[2].name} → ${manager1.fullName}`);
    }

    // Clear existing pending applications
    const deleteResult = await pendingUsers.deleteMany({});
    console.log(`\n🗑️  Cleared ${deleteResult} existing pending applications`);

    // Create sample applications for manager1's properties
    const manager1Properties = await properties.find({ managerId: manager1._id }).toArray();

    if (manager1Properties.length === 0) {
      console.log("⚠️  No properties assigned to manager1");
    } else {
      console.log(`\n📝 Creating sample applications for ${manager1.fullName}'s properties...`);

      // Get units for each property to create proper application references
      const unitsMap = {};
      for (const prop of manager1Properties) {
        const propUnits = await units.find({ propertyId: prop._id }).toArray();
        unitsMap[prop._id.toString()] = propUnits;
      }

      // Get first available units from each property
      const prop1Units = unitsMap[manager1Properties[0]._id.toString()] || [];
      const prop2Units = manager1Properties.length > 1 ? (unitsMap[manager1Properties[1]._id.toString()] || []) : [];

      const unit1 = prop1Units[0];
      const unit2 = prop2Units.length > 0 ? prop2Units[0] : (prop1Units.length > 1 ? prop1Units[1] : null);
      const unit3 = prop1Units.length > 1 ? prop1Units[1] : (unit1 ? unit1 : null);

      if (!unit1 || !unit2 || !unit3) {
        console.log("⚠️  Not enough units available for sample applications");
      } else {
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
            appliedPropertyId: manager1Properties[0]._id,
            propertyId: manager1Properties[0]._id,
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
            appliedPropertyId: manager1Properties[0]._id,
            propertyId: manager1Properties[0]._id,
            unitId: unit3._id,
            appliedUnitId: unit3._id,
            appliedUnitNumber: unit3.unitNumber,
            appliedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
            createdAt: new Date()
          }
        ];

        await pendingUsers.insertMany(sampleApplications);

        console.log(`   ✅ Created ${sampleApplications.length} sample applications:`);
        sampleApplications.forEach((app, i) => {
          console.log(`      ${i + 1}. ${app.fullName} → Unit ${app.profile.unitNumber}`);
        });
      }
    }

    console.log("\n🎉 Setup completed successfully!");
    console.log("\n📋 Summary:");
    console.log(`   - Managers: 2`);
    console.log(`   - Properties linked: ${Math.min(allProperties.length, 3)}`);
    console.log(`   - Pending applications: ${manager1Properties.length > 0 ? 3 : 0}`);
    console.log("\n✨ You can now test the Manager Applications page!");
    console.log("   Login: manager1@briconomy.com / manager123");

  } catch (error) {
    console.error("❌ Error setting up manager properties:", error);
    throw error;
  }
}

setupManagerProperties();
