import { MongoClient, Db, Collection } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToMongoDB(): Promise<Db> {
  if (db) return db;
  
  try {
    client = new MongoClient();
    await client.connect("mongodb://127.0.0.1:27017");
    db = client.database("briconomy");
    console.log("✅ Connected to MongoDB");
    return db;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

export function getCollection<T = any>(name: string): Collection<T> {
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
}