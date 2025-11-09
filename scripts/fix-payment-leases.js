import { MongoClient, ObjectId as BsonObjectId } from "npm:mongodb";

const MONGO_URI = Deno.env.get("MONGO_URI") ?? "mongodb://127.0.0.1:27017";
const DB_NAME = Deno.env.get("DB_NAME") ?? "briconomy";

const client = new MongoClient(MONGO_URI);

const paymentLeaseMap = [
  { paymentId: "67b2a1e0c9e4b8a3d4f5e6e1", leaseId: "67b2a1e0c9e4b8a3d4f5e6d1" },
  { paymentId: "67b2a1e0c9e4b8a3d4f5e6e2", leaseId: "67b2a1e0c9e4b8a3d4f5e6d1" },
  { paymentId: "67b2a1e0c9e4b8a3d4f5e6e3", leaseId: "67b2a1e0c9e4b8a3d4f5e6d2" },
  { paymentId: "67b2a1e0c9e4b8a3d4f5e6e4", leaseId: "67b2a1e0c9e4b8a3d4f5e6d2" },
  { paymentId: "67b2a1e0c9e4b8a3d4f5e6e5", leaseId: "67b2a1e0c9e4b8a3d4f5e6d3" },
  { paymentId: "67b2a1e0c9e4b8a3d4f5e6e6", leaseId: "67b2a1e0c9e4b8a3d4f5e6d4" },
  { paymentId: "67b2a1e0c9e4b8a3d4f5e6e7", leaseId: "67b2a1e0c9e4b8a3d4f5e6d5" },
  { paymentId: "67b2a1e0c9e4b8a3d4f5e6e8", leaseId: "67b2a1e0c9e4b8a3d4f5e6d5" },
];

const ObjectId = (value) => new BsonObjectId(value);

async function main() {
  console.log("Fixing payment leaseId references...\n");

  await client.connect();

  try {
    const db = client.db(DB_NAME);
    let updated = 0;

    for (const mapping of paymentLeaseMap) {
      const result = await db.collection("payments").updateOne(
        { _id: ObjectId(mapping.paymentId) },
        { $set: { leaseId: ObjectId(mapping.leaseId) } },
      );

      if (result.modifiedCount && result.modifiedCount > 0) {
        updated++;
        console.log(`✓ Updated payment ${mapping.paymentId} with leaseId ${mapping.leaseId}`);
      }
    }

    console.log(`\n✓ Fixed ${updated} payment records`);

    const nullLeases = await db.collection("payments").countDocuments({ leaseId: null });
    console.log(`Remaining payments with null leaseId: ${nullLeases}`);
  } finally {
    await client.close();
  }
}

if (import.meta.main) {
  await main();
}
