db = db.getSiblingDB('briconomy');

// Fix the lease with string IDs
const result = db.leases.updateOne(
  { _id: ObjectId('68f8070b5469bcbb6b7d044e') },
  { 
    $set: {
      tenantId: ObjectId('67b2a1e0c9e4b8a3d4f5e6a6'),
      propertyId: ObjectId('67b2a1e0c9e4b8a3d4f5e6b2'),
      unitId: ObjectId('67b2a1e0c9e4b8a3d4f5e6c5')
    }
  }
);

printjson(result);
