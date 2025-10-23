db = db.getSiblingDB('briconomy');

const paymentLeaseMap = [
  { paymentId: "67b2a1e0c9e4b8a3d4f5e6e1", leaseId: "67b2a1e0c9e4b8a3d4f5e6d1" },
  { paymentId: "67b2a1e0c9e4b8a3d4f5e6e2", leaseId: "67b2a1e0c9e4b8a3d4f5e6d1" },
  { paymentId: "67b2a1e0c9e4b8a3d4f5e6e3", leaseId: "67b2a1e0c9e4b8a3d4f5e6d2" },
  { paymentId: "67b2a1e0c9e4b8a3d4f5e6e4", leaseId: "67b2a1e0c9e4b8a3d4f5e6d2" },
  { paymentId: "67b2a1e0c9e4b8a3d4f5e6e5", leaseId: "67b2a1e0c9e4b8a3d4f5e6d3" },
  { paymentId: "67b2a1e0c9e4b8a3d4f5e6e6", leaseId: "67b2a1e0c9e4b8a3d4f5e6d4" },
  { paymentId: "67b2a1e0c9e4b8a3d4f5e6e7", leaseId: "67b2a1e0c9e4b8a3d4f5e6d5" },
  { paymentId: "67b2a1e0c9e4b8a3d4f5e6e8", leaseId: "67b2a1e0c9e4b8a3d4f5e6d5" }
];

print('Fixing payment leaseId references...\n');

let updated = 0;
paymentLeaseMap.forEach(mapping => {
  const result = db.payments.updateOne(
    { _id: ObjectId(mapping.paymentId) },
    { $set: { leaseId: ObjectId(mapping.leaseId) } }
  );
  if (result.modifiedCount > 0) {
    updated++;
    print(`✓ Updated payment ${mapping.paymentId} with leaseId ${mapping.leaseId}`);
  }
});

print(`\n✓ Fixed ${updated} payment records`);

const nullLeases = db.payments.countDocuments({ leaseId: null });
print(`Remaining payments with null leaseId: ${nullLeases}`);
