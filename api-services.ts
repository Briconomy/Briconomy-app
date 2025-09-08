import { connectToMongoDB, getCollection } from "./db.ts";
import { ObjectId } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

function toId(id: unknown) {
  try {
    if (typeof id === "string" && id.length === 24) return new ObjectId(id);
  } catch (_) {
    // ignore invalid
  }
  return id;
}

function normalizeFilters(filters: Record<string, unknown> = {}) {
  const idKeys = new Set([
    "_id",
    "tenantId",
    "unitId",
    "propertyId",
    "leaseId",
    "caretakerId",
    "userId",
  ]);
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(filters)) {
    out[k] = idKeys.has(k) ? toId(v) : v;
  }
  return out;
}

function mapDoc<T extends { _id?: ObjectId }>(doc: T | null): (Omit<T, "_id"> & { id: string }) | null {
  if (!doc) return null;
  const { _id, ...rest } = doc as T & { _id?: ObjectId };
  return { id: String(_id ?? ""), ...(rest as Omit<T, "_id">) };
}

function mapDocs<T extends { _id?: ObjectId }>(docs: T[]): Array<Omit<T, "_id"> & { id: string }> {
  return docs.map((d) => mapDoc(d)!).filter(Boolean) as Array<Omit<T, "_id"> & { id: string }>;
}

// Authentication API
export async function loginUser(email: string, password: string) {
  try {
    await connectToMongoDB();
    const users = getCollection("users");
    
  const user = await users.findOne({ email });
    
    if (!user) {
      return { success: false, message: "User not found" };
    }
    
    const hashedPassword = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
    const hashedPasswordHex = Array.from(new Uint8Array(hashedPassword))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    if ((user as Record<string, unknown>).password !== hashedPasswordHex) {
      return { success: false, message: "Invalid password" };
    }
    
    const { password: _pw, ...rest } = user as Record<string, unknown> & { _id?: ObjectId };
    const mappedUser = { id: String(rest._id ?? ""), ...Object.fromEntries(Object.entries(rest).filter(([k]) => k !== "_id")) };

    return {
      success: true,
      message: "Login successful",
      user: mappedUser,
      token: "mock-jwt-token"
    };
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
}

export async function registerUser(userData: Record<string, unknown>) {
  try {
    await connectToMongoDB();
    const users = getCollection("users");
    
    const existingUser = await users.findOne({ email: userData.email });
    
    if (existingUser) {
      return { success: false, message: "User already exists" };
    }
    
  const password = String(userData.password ?? "");
  const hashedPassword = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
    const hashedPasswordHex = Array.from(new Uint8Array(hashedPassword))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const toInsert: Record<string, unknown> = { ...userData, password: hashedPasswordHex, createdAt: new Date() };
    await users.insertOne(toInsert);
    const created = await users.findOne({ email: userData.email });
  const userWithoutPassword: Record<string, unknown> | null = created ? { ...created } : null;
    if (userWithoutPassword && "password" in userWithoutPassword) {
      delete (userWithoutPassword as Record<string, unknown>)["password"];
    }
    return {
      success: true,
      message: "User registered successfully",
      user: userWithoutPassword
    };
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
}

// Properties API
export async function getProperties() {
  try {
    await connectToMongoDB();
    const properties = getCollection("properties");
  const rows = await properties.find({}).toArray();
  return mapDocs(rows);
  } catch (error) {
    console.error("Error fetching properties:", error);
    throw error;
  }
}

export async function getPropertyById(id: string) {
  try {
    await connectToMongoDB();
    const properties = getCollection("properties");
  const row = await properties.findOne({ _id: new ObjectId(id) });
  return mapDoc(row);
  } catch (error) {
    console.error("Error fetching property:", error);
    throw error;
  }
}

export async function createProperty(propertyData: Record<string, unknown>) {
  try {
    await connectToMongoDB();
    const properties = getCollection("properties");
  const result = await properties.insertOne({ ...(propertyData as Record<string, unknown>), createdAt: new Date() });
    return result;
  } catch (error) {
    console.error("Error creating property:", error);
    throw error;
  }
}

export async function updateProperty(id: string, propertyData: Record<string, unknown>) {
  try {
    await connectToMongoDB();
    const properties = getCollection("properties");
    const result = await properties.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...propertyData, updatedAt: new Date() } }
    );
    return result;
  } catch (error) {
    console.error("Error updating property:", error);
    throw error;
  }
}

// Units API
export async function getUnits(propertyId?: string) {
  try {
    await connectToMongoDB();
    const units = getCollection("units");
  const filter = propertyId ? { propertyId: new ObjectId(propertyId) } : {};
  const rows = await units.find(filter).toArray();
  return mapDocs(rows);
  } catch (error) {
    console.error("Error fetching units:", error);
    throw error;
  }
}

export async function createUnit(unitData: Record<string, unknown>) {
  try {
    await connectToMongoDB();
    const units = getCollection("units");
  const result = await units.insertOne({ ...(unitData as Record<string, unknown>), createdAt: new Date() });
    return result;
  } catch (error) {
    console.error("Error creating unit:", error);
    throw error;
  }
}

// Leases API
export async function getLeases(filters: Record<string, unknown> = {}) {
  try {
    await connectToMongoDB();
    const leases = getCollection("leases");
    const properties = getCollection("properties");
    const units = getCollection("units");

    type LeaseRow = { _id: ObjectId; propertyId?: ObjectId; unitId?: ObjectId } & Record<string, unknown>;
  const rows = await leases.find(normalizeFilters(filters) as Record<string, unknown>).toArray() as Array<LeaseRow>;

    const mapped: Array<Record<string, unknown>> = [];
    for (const row of rows) {
      const base = mapDoc<LeaseRow>(row)!;
      const leaseDoc: Record<string, unknown> = { ...base };
      if (row.propertyId) {
  const prop = await properties.findOne({ _id: row.propertyId as ObjectId });
        if (prop) leaseDoc.propertyId = { id: prop._id.toString(), name: prop.name, address: prop.address };
      }
      if (row.unitId) {
  const unit = await units.findOne({ _id: row.unitId as ObjectId });
        if (unit) leaseDoc.unitId = { id: unit._id.toString(), unitNumber: unit.unitNumber };
      }
      mapped.push(leaseDoc);
    }
    return mapped;
  } catch (error) {
    console.error("Error fetching leases:", error);
    throw error;
  }
}

export async function createLease(leaseData: Record<string, unknown>) {
  try {
    await connectToMongoDB();
    const leases = getCollection("leases");
  const result = await leases.insertOne({ ...(leaseData as Record<string, unknown>), createdAt: new Date() });
    return result;
  } catch (error) {
    console.error("Error creating lease:", error);
    throw error;
  }
}

// Payments API
export async function getPayments(filters: Record<string, unknown> = {}) {
  try {
    await connectToMongoDB();
    const payments = getCollection("payments");
  const rows = await payments.find(normalizeFilters(filters) as Record<string, unknown>).toArray();
  return mapDocs(rows);
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw error;
  }
}

export async function createPayment(paymentData: Record<string, unknown>) {
  try {
    await connectToMongoDB();
    const payments = getCollection("payments");
  const result = await payments.insertOne({ ...(paymentData as Record<string, unknown>), createdAt: new Date() });
    return result;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
}

export async function updatePaymentStatus(id: string, status: string) {
  try {
    await connectToMongoDB();
    const payments = getCollection("payments");
    const result = await payments.updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          status,
          paymentDate: status === 'paid' ? new Date() : null,
          updatedAt: new Date()
        }
      }
    );
    return result;
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
}

// Maintenance Requests API
export async function getMaintenanceRequests(filters: Record<string, unknown> = {}) {
  try {
    await connectToMongoDB();
    const requests = getCollection("maintenance_requests");
  const rows = await requests.find(normalizeFilters(filters) as Record<string, unknown>).toArray();
  return mapDocs(rows);
  } catch (error) {
    console.error("Error fetching maintenance requests:", error);
    throw error;
  }
}

export async function createMaintenanceRequest(requestData: Record<string, unknown>) {
  try {
    await connectToMongoDB();
    const requests = getCollection("maintenance_requests");
  const result = await requests.insertOne({ ...(requestData as Record<string, unknown>), status: 'pending', createdAt: new Date(), updatedAt: new Date() });
    return result;
  } catch (error) {
    console.error("Error creating maintenance request:", error);
    throw error;
  }
}

export async function updateMaintenanceRequest(id: string, updateData: Record<string, unknown>) {
  try {
    await connectToMongoDB();
    const requests = getCollection("maintenance_requests");
    const result = await requests.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...(updateData as Record<string, unknown>), updatedAt: new Date() } }
    );
    return result;
  } catch (error) {
    console.error("Error updating maintenance request:", error);
    throw error;
  }
}

// Caretaker Tasks API
export async function getCaretakerTasks(filters: Record<string, unknown> = {}) {
  try {
    await connectToMongoDB();
    const tasks = getCollection("caretaker_tasks");
  const rows = await tasks.find(normalizeFilters(filters) as Record<string, unknown>).toArray();
  return mapDocs(rows);
  } catch (error) {
    console.error("Error fetching caretaker tasks:", error);
    throw error;
  }
}

export async function createCaretakerTask(taskData: Record<string, unknown>) {
  try {
    await connectToMongoDB();
    const tasks = getCollection("caretaker_tasks");
  const result = await tasks.insertOne({ ...(taskData as Record<string, unknown>), status: 'pending', createdAt: new Date() });
    return result;
  } catch (error) {
    console.error("Error creating caretaker task:", error);
    throw error;
  }
}

export async function updateCaretakerTask(id: string, updateData: Record<string, unknown>) {
  try {
    await connectToMongoDB();
    const tasks = getCollection("caretaker_tasks");
    const result = await tasks.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData as Record<string, unknown> }
    );
    return result;
  } catch (error) {
    console.error("Error updating caretaker task:", error);
    throw error;
  }
}

// Reports API
export async function getReports(filters: Record<string, unknown> = {}) {
  try {
    await connectToMongoDB();
    const reports = getCollection("reports");
  const rows = await reports.find(normalizeFilters(filters) as Record<string, unknown>).toArray();
  return mapDocs(rows);
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
}

export async function createReport(reportData: Record<string, unknown>) {
  try {
    await connectToMongoDB();
    const reports = getCollection("reports");
  const result = await reports.insertOne({ ...(reportData as Record<string, unknown>), createdAt: new Date() });
    return result;
  } catch (error) {
    console.error("Error creating report:", error);
    throw error;
  }
}

// Notifications API
export async function getNotifications(userId: string) {
  try {
    await connectToMongoDB();
    const notifications = getCollection("notifications");
  const rows = await notifications.find({ userId: new ObjectId(userId) }).toArray();
  return mapDocs(rows);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

export async function createNotification(notificationData: Record<string, unknown>) {
  try {
    await connectToMongoDB();
    const notifications = getCollection("notifications");
  const result = await notifications.insertOne({ ...(notificationData as Record<string, unknown>), read: false, createdAt: new Date() });
    return result;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

// Analytics API
export async function getDashboardStats() {
  try {
    await connectToMongoDB();
    
    const properties = getCollection("properties");
    const units = getCollection("units");
    const leases = getCollection("leases");
    const payments = getCollection("payments");
    const maintenanceRequests = getCollection("maintenance_requests");
    
    const totalProperties = await properties.countDocuments({});
    const totalUnits = await units.countDocuments({});
    const occupiedUnits = await units.countDocuments({ status: 'occupied' });
  const activeLeases = await leases.countDocuments({ status: 'active' });
    const totalRevenue = await payments.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    
    const maintenanceStats = await maintenanceRequests.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    return {
      totalProperties,
      totalUnits,
      occupiedUnits,
      occupancyRate: totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0,
      activeLeases,
  totalRevenue: (totalRevenue[0] as Record<string, unknown> | undefined)?.total as number || 0,
      maintenanceStats
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}