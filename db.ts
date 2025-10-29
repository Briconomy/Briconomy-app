import { MongoClient, Database, Collection } from "mongo";

let client: MongoClient | null = null;
let db: Database | null = null;
let connectPromise: Promise<Database> | null = null;

export async function connectToMongoDB(): Promise<Database> {
  if (db) return db;

  if (connectPromise !== null) return connectPromise;

  connectPromise = (async () => {
    const uri = "mongodb://127.0.0.1:27017";
    const maxAttempts = 8;
    let attempt = 0;
    let lastError: unknown = null;

    while (attempt < maxAttempts) {
      try {
    client = new MongoClient();
    await client.connect(uri);
    const candidateDb = client.database("briconomy");
    await candidateDb.listCollectionNames();
        db = candidateDb;
    console.log("Connected to MongoDB");
        return db;
      } catch (error) {
        lastError = error;
        const delay = Math.min(2000, 200 + attempt * 200);
        await new Promise((r) => setTimeout(r, delay));
        attempt++;
      }
    }

    console.error("MongoDB connection error:", lastError);
    throw lastError instanceof Error ? lastError : new Error("Mongo connection failed");
  })();

  try {
    return await connectPromise;
  } finally {
    connectPromise = null;
  }
}

export function getCollection<T = Record<string, unknown>>(name: string): Collection<T> {
  if (!db) {
    throw new Error("Database not connected");
  }
  return db.collection<T>(name);
}

export async function closeConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

export interface User {
  _id?: string;
  fullName: string;
  email: string;
  phone: string;
  userType: 'admin' | 'manager' | 'caretaker' | 'tenant';
  password: string;
  createdAt: Date;
  biometricEnabled?: boolean;
  biometricCredentialId?: string;
}

export interface Property {
  _id?: string;
  name: string;
  address: string;
  type: 'apartment' | 'complex' | 'house';
  totalUnits: number;
  occupiedUnits: number;
  managerId: string;
  amenities: string[];
  createdAt: Date;
}

export interface Unit {
  _id?: string;
  unitNumber: string;
  propertyId: string;
  rent: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  status: 'occupied' | 'vacant' | 'maintenance';
  tenantId?: string;
  createdAt: Date;
}

export interface Lease {
  _id?: string;
  tenantId: string;
  unitId: string;
  propertyId: string;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  deposit: number;
  status: 'active' | 'expired' | 'terminated';
  createdAt: Date;
}

export interface Payment {
  _id?: string;
  tenantId: string;
  leaseId: string;
  amount: number;
  paymentDate?: Date;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue' | 'failed';
  type: 'rent' | 'deposit' | 'utilities' | 'fees';
  method?: 'bank_transfer' | 'cash' | 'card' | 'eft';
  createdAt: Date;
}

export interface MaintenanceRequest {
  _id?: string;
  tenantId: string;
  unitId: string;
  propertyId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CaretakerTask {
  _id?: string;
  caretakerId: string;
  propertyId: string;
  title: string;
  description: string;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
}

export interface Report {
  _id?: string;
  type: 'financial' | 'maintenance' | 'occupancy' | 'performance';
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  propertyId?: string;
  data: Record<string, unknown>;
  generatedBy: string;
  createdAt: Date;
}

export interface Notification {
  _id?: string;
  userId: string;
  title: string;
  message: string;
  type: 'payment_reminder' | 'maintenance_update' | 'lease_renewal' | 'system';
  read: boolean;
  createdAt: Date;
}

export interface Setting {
  _id?: string;
  key: string;
  value: string;
  description: string;
  updatedBy: string;
  updatedAt: Date;
}

export interface AuditLog {
  _id?: string;
  userId: string;
  action: string;
  resource: string;
  details: Record<string, unknown>;
  timestamp: Date;
}

export interface BiometricCredential {
  _id?: string;
  userId: string;
  credentialId: string;
  publicKey: Uint8Array;
  counter: number;
  transports?: string[];
  createdAt: Date;
  lastUsedAt?: Date;
}