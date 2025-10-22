db = db.getSiblingDB('briconomy');

print('Initializing lease renewals and terminations...');

db.lease_renewals.drop();
db.lease_terminations.drop();

const now = new Date();
const futureDate45 = new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000);
const futureDate30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
const pastDate7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
const pastDate14 = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

const renewals = db.lease_renewals.insertMany([
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7a1"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d1"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a6"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
    unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c1"),
    currentEndDate: new Date('2024-12-31'),
    proposedStartDate: new Date('2025-01-01'),
    proposedEndDate: new Date('2025-12-31'),
    currentRent: 12500,
    proposedRent: 13000,
    status: 'pending',
    offerSentDate: null,
    responseDate: null,
    tenantResponse: 'pending',
    renewalTerms: 'Standard 12-month renewal with 4% rent increase',
    notes: 'Tenant has been excellent, no issues. Lease expires in 2 months.',
    createdAt: now,
    updatedAt: now
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7a2"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d2"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a7"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b1"),
    unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c3"),
    currentEndDate: new Date('2025-02-28'),
    proposedStartDate: new Date('2025-03-01'),
    proposedEndDate: new Date('2026-02-28'),
    currentRent: 15000,
    proposedRent: 15500,
    status: 'offer_sent',
    offerSentDate: pastDate7,
    responseDate: null,
    tenantResponse: 'pending',
    renewalTerms: 'Standard 12-month renewal with 3.3% rent increase',
    notes: 'Renewal offer sent to tenant. Awaiting response.',
    createdAt: pastDate14,
    updatedAt: pastDate7
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7a3"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
    unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c5"),
    currentEndDate: new Date('2025-05-31'),
    proposedStartDate: new Date('2025-06-01'),
    proposedEndDate: new Date('2026-05-31'),
    currentRent: 9500,
    proposedRent: 9500,
    status: 'accepted',
    offerSentDate: pastDate14,
    responseDate: pastDate7,
    tenantResponse: 'accepted',
    renewalTerms: 'Standard 12-month renewal with no rent increase',
    notes: 'Tenant accepted renewal offer. Good tenant, rent maintained.',
    createdAt: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000),
    updatedAt: pastDate7
  }
]);

const terminations = db.lease_terminations.insertMany([
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7b1"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d4"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a9"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
    unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c6"),
    currentRent: 11500,
    terminationDate: futureDate45,
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
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7b2"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d5"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6aa"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b3"),
    unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c7"),
    currentRent: 18000,
    terminationDate: futureDate30,
    requestDate: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    reason: 'Purchasing own property',
    noticeInDays: 35,
    status: 'approved',
    approvedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a2"),
    approvalDate: pastDate7,
    rejectionReason: null,
    settlementAmount: 36000,
    penaltyAmount: 0,
    refundAmount: 36000,
    notes: 'Termination approved. Tenant has been excellent. Full deposit refund.',
    createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: pastDate7
  },
  {
    _id: ObjectId("67b2a1e0c9e4b8a3d4f5e7b3"),
    leaseId: ObjectId("67b2a1e0c9e4b8a3d4f5e6d3"),
    tenantId: ObjectId("67b2a1e0c9e4b8a3d4f5e6a8"),
    propertyId: ObjectId("67b2a1e0c9e4b8a3d4f5e6b2"),
    unitId: ObjectId("67b2a1e0c9e4b8a3d4f5e6c5"),
    currentRent: 9500,
    terminationDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    requestDate: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000),
    reason: 'Job transfer',
    noticeInDays: 45,
    status: 'completed',
    approvedBy: ObjectId("67b2a1e0c9e4b8a3d4f5e6a3"),
    approvalDate: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
    rejectionReason: null,
    settlementAmount: 19000,
    penaltyAmount: 0,
    refundAmount: 19000,
    notes: 'Termination completed. Unit cleaned and ready for new tenant.',
    createdAt: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  }
]);

db.leases.updateOne(
  { _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6d1") },
  { 
    $set: { 
      leaseNumber: 'LEASE-2024-001',
      archived: false,
      reminderSent: false,
      updatedAt: now
    }
  }
);

db.leases.updateOne(
  { _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6d2") },
  { 
    $set: { 
      leaseNumber: 'LEASE-2024-002',
      archived: false,
      reminderSent: false,
      updatedAt: now
    }
  }
);

db.leases.updateOne(
  { _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6d3") },
  { 
    $set: { 
      leaseNumber: 'LEASE-2024-003',
      archived: false,
      reminderSent: false,
      updatedAt: now
    }
  }
);

db.leases.updateOne(
  { _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6d4") },
  { 
    $set: { 
      leaseNumber: 'LEASE-2024-004',
      archived: false,
      reminderSent: false,
      updatedAt: now
    }
  }
);

db.leases.updateOne(
  { _id: ObjectId("67b2a1e0c9e4b8a3d4f5e6d5") },
  { 
    $set: { 
      leaseNumber: 'LEASE-2024-005',
      archived: false,
      reminderSent: false,
      updatedAt: now
    }
  }
);

print('✓ Created ' + renewals.insertedIds.length + ' lease renewals');
print('✓ Created ' + terminations.insertedIds.length + ' lease terminations');
print('✓ Updated ' + db.leases.countDocuments() + ' leases with new fields');
print('Lease extras initialization complete!');
