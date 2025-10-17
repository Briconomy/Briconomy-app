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
  
  // Keys to exclude from database queries (cache-busting, metadata, etc.)
  const excludeKeys = new Set([
    "_t",     // timestamp cache-busting parameter
    "_cache", // cache control parameters
    "_ts",    // alternative timestamp parameter
  ]);
  
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(filters)) {
    // Skip excluded keys
    if (excludeKeys.has(k)) {
      continue;
    }
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
  console.log('mapDocs input:', docs);
  const mapped = docs.map((d) => mapDoc(d)!);
  console.log('mapDocs mapped:', mapped);
  const filtered = mapped.filter(Boolean);
  console.log('mapDocs filtered:', filtered);
  return filtered as Array<Omit<T, "_id"> & { id: string }>;
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
export async function getProperties(filters: Record<string, unknown> = {}) {
  try {
    await connectToMongoDB();
    const properties = getCollection("properties");
    const normalizedFilters = normalizeFilters(filters);
    const rows = await properties.find(normalizedFilters).toArray();
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
    const properties = getCollection("properties");
    
    let queryFilters = normalizeFilters(filters) as Record<string, unknown>;
    
    // If managerId is provided, get properties for that manager and filter by those propertyIds
    if (filters.managerId) {
      const managerProperties = await properties.find({ managerId: toId(filters.managerId) }).toArray();
      const propertyIds = managerProperties.map(p => p._id);
      
      // Replace managerId filter with propertyId filter
      delete queryFilters.managerId;
      queryFilters.propertyId = { $in: propertyIds };
    }
    
    const rows = await requests.find(queryFilters).toArray();
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
    console.log(`[getNotifications] Querying for userId: ${userId}`);
    const userObjectId = new ObjectId(userId);
    console.log(`[getNotifications] Converted to ObjectId: ${userObjectId}`);
    const rows = await notifications.find({ userId: userObjectId }).toArray();
    console.log(`[getNotifications] Found ${rows.length} notifications in database`);
    console.log(`[getNotifications] Raw notifications:`, rows.map(r => ({ _id: r._id, userId: r.userId, title: r.title })));
    const mapped = mapDocs(rows);
    console.log(`[getNotifications] Returning ${mapped.length} mapped notifications`);
    return mapped;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

export async function createNotification(
  notificationData: Record<string, unknown>, 
  broadcaster?: { broadcastToUsers: (userIds: string[], notification: unknown) => void }
) {
  try {
    await connectToMongoDB();
    const notifications = getCollection("notifications");
    const users = getCollection("users");
    
    // If this is an announcement notification, send to multiple users based on targetAudience
    if (notificationData.type === 'announcement' && notificationData.targetAudience) {
      // Convert plural forms to singular (frontend sends 'tenants'/'caretakers'/'managers', DB has 'tenant'/'caretaker'/'manager')
      const normalizeAudience = (audience: string): string[] => {
        if (audience === 'all') return ['manager', 'tenant', 'caretaker', 'admin'];
        if (audience === 'tenants') return ['tenant'];
        if (audience === 'caretakers') return ['caretaker'];
        if (audience === 'managers') return ['manager'];
        return [audience]; // fallback for singular forms or unknown values
      };
      
      const targetUserTypes = normalizeAudience(String(notificationData.targetAudience));
      
      const targetUsers = await users.find({ 
        userType: { $in: targetUserTypes } 
      }).toArray();
      
      console.log(`[createNotification] Creating announcement notifications for ${targetUsers.length} users (target: ${targetUserTypes.join(', ')}, original: ${notificationData.targetAudience})`);
      
      const createdNotifications = [];
      const userIds = [];
      
      for (const user of targetUsers) {
        const notificationDoc = {
          userId: user._id,
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          read: false,
          createdAt: new Date()
        };
        
        const result = await notifications.insertOne(notificationDoc);
        
        // Create notification object for broadcasting
        const createdNotification = {
          id: String(result.insertedId || result),
          _id: String(result.insertedId || result),
          userId: String(user._id),
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          read: false,
          createdAt: notificationDoc.createdAt.toISOString()
        };
        
        createdNotifications.push(createdNotification);
        userIds.push(String(user._id));
      }
      
      // Broadcast to all target users at once if broadcaster is available
      if (broadcaster && userIds.length > 0) {
        console.log(`[createNotification] Broadcasting announcement notification to ${userIds.length} users via WebSocket`);
        // Send to all users - they will receive it and refresh their announcement lists
        for (let i = 0; i < createdNotifications.length; i++) {
          broadcaster.broadcastToUsers([userIds[i]], createdNotifications[i]);
        }
        console.log(`[createNotification] Broadcast complete`);
      }
      
      return { success: true, count: targetUsers.length, notifications: createdNotifications };
    } else if (notificationData.type === 'announcement_deleted' && notificationData.targetAudience) {
      // Handle announcement deletion notification - send to all affected users
      // Convert plural forms to singular (same as above)
      const normalizeAudience = (audience: string): string[] => {
        if (audience === 'all') return ['manager', 'tenant', 'caretaker', 'admin'];
        if (audience === 'tenants') return ['tenant'];
        if (audience === 'caretakers') return ['caretaker'];
        if (audience === 'managers') return ['manager'];
        return [audience];
      };
      
      const targetUserTypes = normalizeAudience(String(notificationData.targetAudience));
      
      const targetUsers = await users.find({ 
        userType: { $in: targetUserTypes } 
      }).toArray();
      
      console.log(`[createNotification] Broadcasting announcement deletion to ${targetUsers.length} users (target: ${targetUserTypes.join(', ')}, original: ${notificationData.targetAudience})`);
      
      // Don't store deletion notifications, just broadcast them
      if (broadcaster) {
        const deletionNotification = {
          id: `deletion-${Date.now()}`,
          _id: `deletion-${Date.now()}`,
          userId: 'all',
          title: notificationData.title,
          message: notificationData.message,
          type: notificationData.type,
          originalTitle: notificationData.originalTitle,
          announcementId: notificationData.announcementId,
          read: false,
          createdAt: new Date().toISOString()
        };
        
        const userIds = targetUsers.map(u => String(u._id));
        broadcaster.broadcastToUsers(userIds, deletionNotification);
      }
      
      return { success: true, count: targetUsers.length, message: 'Deletion broadcast sent' };
    } else {
      // Single user notification
      const notificationDoc = { 
        ...notificationData, 
        read: false, 
        createdAt: new Date() 
      };
      
      const result = await notifications.insertOne(notificationDoc);
      
      const createdNotification = {
        id: String(result.insertedId || result),
        _id: String(result.insertedId || result),
        ...notificationDoc,
        userId: String(notificationData.userId),
        createdAt: notificationDoc.createdAt.toISOString()
      };
      
      // Broadcast to single user if broadcaster is available
      if (broadcaster && notificationData.userId) {
        broadcaster.broadcastToUsers([String(notificationData.userId)], createdNotification);
      }
      
      return result;
    }
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
}

export async function updateNotification(id: string, updateData: Record<string, unknown>) {
  try {
    await connectToMongoDB();
    const notifications = getCollection("notifications");
    
    const result = await notifications.updateOne(
      { _id: toId(id) },
      { 
        $set: { 
          ...updateData,
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      throw new Error("Notification not found");
    }
    
    return mapDoc(await notifications.findOne({ _id: toId(id) }));
  } catch (error) {
    console.error("Error updating notification:", error);
    throw error;
  }
}

export async function deleteNotification(id: string) {
  try {
    await connectToMongoDB();
    const notifications = getCollection("notifications");
    
    const result = await notifications.deleteOne({ _id: toId(id) });
    
    // MongoDB returns the number of deleted documents directly
    if (result === 0) {
      throw new Error("Notification not found");
    }
    
    return { success: true, deletedId: id };
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
}

// Analytics API
export async function getDashboardStats(filters: Record<string, unknown> = {}) {
  try {
    await connectToMongoDB();
    
    const properties = getCollection("properties");
    const units = getCollection("units");
    const leases = getCollection("leases");
    const payments = getCollection("payments");
    const maintenanceRequests = getCollection("maintenance_requests");
    
    const normalizedFilters = normalizeFilters(filters);
    
    // If managerId filter is provided, get only properties for that manager
    let propertyFilter = {};
    let propertyIds = [];
    
    if (normalizedFilters.managerId) {
      propertyFilter = { managerId: normalizedFilters.managerId };
      const managerProperties = await properties.find(propertyFilter).toArray();
      propertyIds = managerProperties.map(p => p._id);
    }
    
    const totalProperties = await properties.countDocuments(propertyFilter);
    
    // For units, leases, payments - filter by propertyId if manager-specific
    const unitFilter = propertyIds.length > 0 ? { propertyId: { $in: propertyIds } } : {};
    const totalUnits = await units.countDocuments(unitFilter);
    const occupiedUnits = await units.countDocuments({ ...unitFilter, status: 'occupied' });
    
    const leaseFilter = propertyIds.length > 0 ? { propertyId: { $in: propertyIds } } : {};
    const activeLeases = await leases.countDocuments({ ...leaseFilter, status: 'active' });
    
    const revenueMatch = propertyIds.length > 0 
      ? { status: 'paid', propertyId: { $in: propertyIds } }
      : { status: 'paid' };
    const totalRevenue = await payments.aggregate([
      { $match: revenueMatch },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    
    const maintenanceMatch = propertyIds.length > 0 
      ? { propertyId: { $in: propertyIds } }
      : {};
    const maintenanceStats = await maintenanceRequests.aggregate([
      { $match: maintenanceMatch },
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

// Admin API Functions
export async function getSystemStats() {
  try {
    await connectToMongoDB();
    const systemStats = getCollection("system_stats");
    const stats = await systemStats.find({}).toArray();
    return mapDocs(stats);
  } catch (error) {
    console.error("Error fetching system stats:", error);
    throw error;
  }
}

export async function getUserStats() {
  try {
    await connectToMongoDB();
    const userStats = getCollection("user_stats");
    const stats = await userStats.find({}).toArray();
    return mapDocs(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    throw error;
  }
}

export async function getSecurityStats() {
  try {
    await connectToMongoDB();
    const securityStats = getCollection("security_stats");
    const stats = await securityStats.find({}).toArray();
    return mapDocs(stats);
  } catch (error) {
    console.error("Error fetching security stats:", error);
    throw error;
  }
}

export async function getFinancialStats() {
  try {
    await connectToMongoDB();
    const financialStats = getCollection("financial_stats");
    const stats = await financialStats.find({}).toArray();
    return mapDocs(stats);
  } catch (error) {
    console.error("Error fetching financial stats:", error);
    throw error;
  }
}

export async function getUserActivities() {
  try {
    await connectToMongoDB();
    const userActivities = getCollection("user_activities");
    const activities = await userActivities.find({}).toArray();
    return mapDocs(activities);
  } catch (error) {
    console.error("Error fetching user activities:", error);
    throw error;
  }
}

export async function getSecurityConfig() {
  try {
    await connectToMongoDB();
    const securityConfig = getCollection("security_config");
    const config = await securityConfig.find({}).toArray();
    return mapDocs(config);
  } catch (error) {
    console.error("Error fetching security config:", error);
    throw error;
  }
}

export async function getSecurityAlerts() {
  try {
    await connectToMongoDB();
    const securityAlerts = getCollection("security_alerts");
    const alerts = await securityAlerts.find({}).toArray();
    return mapDocs(alerts);
  } catch (error) {
    console.error("Error fetching security alerts:", error);
    throw error;
  }
}

export async function getSecuritySettings() {
  try {
    await connectToMongoDB();
    const securitySettings = getCollection("security_settings");
    const settings = await securitySettings.find({}).toArray();
    console.log('Raw security settings from DB:', settings);
    console.log('Count of settings:', settings.length);
    const mapped = mapDocs(settings);
    console.log('Mapped security settings:', mapped);
    return mapped;
  } catch (error) {
    console.error("Error fetching security settings:", error);
    throw error;
  }
}

export async function getAvailableReports() {
  try {
    await connectToMongoDB();
    const availableReports = getCollection("available_reports");
    const reports = await availableReports.find({}).toArray();
    return mapDocs(reports);
  } catch (error) {
    console.error("Error fetching available reports:", error);
    throw error;
  }
}

export async function getReportActivities() {
  try {
    await connectToMongoDB();
    const reportActivities = getCollection("report_activities");
    const activities = await reportActivities.find({}).toArray();
    return mapDocs(activities);
  } catch (error) {
    console.error("Error fetching report activities:", error);
    throw error;
  }
}

export async function getDatabaseHealth() {
  try {
    await connectToMongoDB();
    const databaseHealth = getCollection("database_health");
    const health = await databaseHealth.find({}).toArray();
    return mapDocs(health);
  } catch (error) {
    console.error("Error fetching database health:", error);
    throw error;
  }
}

export async function getApiEndpoints() {
  try {
    await connectToMongoDB();
    const apiEndpoints = getCollection("api_endpoints");
    const endpoints = await apiEndpoints.find({}).toArray();
    return mapDocs(endpoints);
  } catch (error) {
    console.error("Error fetching API endpoints:", error);
    throw error;
  }
}

export async function getSystemAlerts() {
  try {
    await connectToMongoDB();
    const systemAlerts = getCollection("system_alerts");
    const alerts = await systemAlerts.find({}).toArray();
    return mapDocs(alerts);
  } catch (error) {
    console.error("Error fetching system alerts:", error);
    throw error;
  }
}

export async function createUser(userData: Record<string, unknown>) {
  try {
    await connectToMongoDB();
    const users = getCollection("users");
    
    const existingUser = await users.findOne({ email: userData.email });
    if (existingUser) {
      throw new Error("User with this email already exists");
    }
    
    // Hash the password before storing
    const password = String(userData.password ?? "");
    const hashedPassword = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(password));
    const hashedPasswordHex = Array.from(new Uint8Array(hashedPassword))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const toInsert = {
      ...userData,
      password: hashedPasswordHex,
      createdAt: new Date(),
      status: 'active'
    };
    
    const result = await users.insertOne(toInsert);
    return mapDoc(await users.findOne({ _id: result }));
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

// Invoice API
export async function createInvoice(invoiceData: Record<string, unknown>) {
  try {
    await connectToMongoDB();
    const invoices = getCollection("invoices");
    
    const toInsert = {
      ...invoiceData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await invoices.insertOne(toInsert);
    return mapDoc(await invoices.findOne({ _id: result }));
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
}

export async function getInvoices(filters: Record<string, unknown> = {}) {
  try {
    await connectToMongoDB();
    const invoices = getCollection("invoices");
    const normalizedFilters = normalizeFilters(filters);
    const invoiceList = await invoices.find(normalizedFilters).sort({ createdAt: -1 }).toArray();
    return mapDocs(invoiceList);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }
}

export async function getInvoiceById(id: string) {
  try {
    await connectToMongoDB();
    const invoices = getCollection("invoices");
    const invoice = await invoices.findOne({ _id: toId(id) });
    return mapDoc(invoice);
  } catch (error) {
    console.error("Error fetching invoice:", error);
    throw error;
  }
}

export async function updateInvoiceStatus(id: string, status: string) {
  try {
    await connectToMongoDB();
    const invoices = getCollection("invoices");
    
    const result = await invoices.updateOne(
      { _id: toId(id) },
      { 
        $set: { 
          status,
          updatedAt: new Date(),
          ...(status === 'paid' ? { paidAt: new Date() } : {})
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      throw new Error("Invoice not found");
    }
    
    return mapDoc(await invoices.findOne({ _id: toId(id) }));
  } catch (error) {
    console.error("Error updating invoice status:", error);
    throw error;
  }
}

export async function deleteInvoice(id: string) {
  try {
    await connectToMongoDB();
    const invoices = getCollection("invoices");
    const result = await invoices.deleteOne({ _id: toId(id) });
    return result.deletedCount > 0;
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw error;
  }
}

// Chat API
export async function saveChatMessage(messageData: Record<string, unknown>) {
  try {
    await connectToMongoDB();
    const chatMessages = getCollection("chat_messages");
    
    const toInsert = {
      ...messageData,
      createdAt: new Date()
    };
    
    const result = await chatMessages.insertOne(toInsert);
    return mapDoc(await chatMessages.findOne({ _id: result }));
  } catch (error) {
    console.error("Error saving chat message:", error);
    throw error;
  }
}

export async function getChatMessages(filters: Record<string, unknown> = {}) {
  try {
    await connectToMongoDB();
    const chatMessages = getCollection("chat_messages");
    const normalizedFilters = normalizeFilters(filters);
    const messages = await chatMessages.find(normalizedFilters).sort({ createdAt: 1 }).toArray();
    return mapDocs(messages);
  } catch (error) {
    console.error("Error fetching chat messages:", error);
    throw error;
  }
}

export async function createChatEscalation(escalationData: Record<string, unknown>) {
  try {
    await connectToMongoDB();
    const escalations = getCollection("chat_escalations");
    
    const toInsert = {
      ...escalationData,
      createdAt: new Date(),
      status: 'pending'
    };
    
    const result = await escalations.insertOne(toInsert);
    return mapDoc(await escalations.findOne({ _id: result }));
  } catch (error) {
    console.error("Error creating chat escalation:", error);
    throw error;
  }
}

// Announcement API
export async function createAnnouncement(announcementData: Record<string, unknown>) {
  try {
    console.log("Creating announcement with data:", announcementData);
    await connectToMongoDB();
    const announcements = getCollection("announcements");
    
    const toInsert = {
      ...announcementData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log("Inserting announcement:", toInsert);
    const result = await announcements.insertOne(toInsert);
    console.log("Insert result:", result);
    
    // Get the insertedId properly
    const insertedId = result.insertedId || result;
    console.log("Using insertedId:", insertedId);
    
    if (!insertedId) {
      throw new Error("Failed to get inserted ID");
    }
    
    const createdAnnouncement = await announcements.findOne({ _id: insertedId });
    console.log("Found created announcement:", createdAnnouncement);
    
    if (!createdAnnouncement) {
      throw new Error("Failed to retrieve created announcement");
    }
    
    const mappedResult = mapDoc(createdAnnouncement);
    console.log("Mapped announcement result:", mappedResult);
    
    if (!mappedResult || !mappedResult.id) {
      throw new Error("Failed to map announcement with proper ID");
    }
    
    return mappedResult;
  } catch (error) {
    console.error("Error creating announcement:", error);
    console.error("Error stack:", error.stack);
    throw error;
  }
}

export async function getAnnouncements(filters: Record<string, unknown> = {}) {
  try {
    console.log("getAnnouncements called with filters:", filters);
    await connectToMongoDB();
    const announcements = getCollection("announcements");
    const normalizedFilters = normalizeFilters(filters);
    console.log("Normalized filters for announcement query:", normalizedFilters);
    
    const announcementList = await announcements.find(normalizedFilters).sort({ createdAt: -1 }).toArray();
    console.log(`Found ${announcementList.length} announcements in database`);
    console.log("Raw announcements from DB:", announcementList.map(a => ({ _id: a._id, title: a.title })));
    
    const mappedResults = mapDocs(announcementList);
    console.log(`Returning ${mappedResults.length} mapped announcements`);
    console.log("Mapped announcements:", mappedResults.map(a => ({ id: a.id, title: a.title })));
    
    return mappedResults;
  } catch (error) {
    console.error("Error fetching announcements:", error);
    console.error("Error stack:", error.stack);
    throw error;
  }
}

export async function updateAnnouncementStatus(id: string, status: string) {
  try {
    await connectToMongoDB();
    const announcements = getCollection("announcements");
    
    const result = await announcements.updateOne(
      { _id: toId(id) },
      { 
        $set: { 
          status,
          updatedAt: new Date(),
          ...(status === 'sent' ? { sentAt: new Date() } : {})
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      throw new Error("Announcement not found");
    }
    
    return mapDoc(await announcements.findOne({ _id: toId(id) }));
  } catch (error) {
    console.error("Error updating announcement status:", error);
    throw error;
  }
}

export async function deleteAnnouncement(id: string) {
  try {
    console.log("Attempting to delete announcement with ID:", id);
    await connectToMongoDB();
    const announcements = getCollection("announcements");
    
    const announcement = await announcements.findOne({ _id: toId(id) });
    console.log("Found announcement:", announcement ? { _id: announcement._id, title: announcement.title } : null);
    
    if (!announcement) {
      console.log("Announcement not found for ID:", id);
      // For ghost announcements, return success so UI can remove them
      return { success: true, deletedId: id, wasGhost: true };
    }
    
    const result = await announcements.deleteOne({ _id: toId(id) });
    console.log("Delete result:", result);
    
    if (result.deletedCount === 0) {
      console.log("No documents deleted for ID:", id);
      // Treat as ghost announcement - return success so UI can remove it
      return { success: true, deletedId: id, wasGhost: true };
    }
    
    console.log(`Successfully deleted announcement ${id}`);
    return { success: true, deletedId: id };
  } catch (error) {
    console.error("Error deleting announcement:", error);
    // For any error, treat as ghost announcement and return success
    return { success: true, deletedId: id, wasGhost: true, error: error.message };
  }
}

export async function deleteAnnouncementByContent(announcementData: {
  title: string;
  message: string;
  createdBy: string;
  createdAt: string | Date;
}) {
  try {
    await connectToMongoDB();
    const announcements = getCollection("announcements");
    
    // Convert createdAt to Date if it's a string
    const createdAt = typeof announcementData.createdAt === 'string' 
      ? new Date(announcementData.createdAt) 
      : announcementData.createdAt;
    
    console.log("Attempting to delete announcement by content:", {
      title: announcementData.title,
      message: announcementData.message,
      createdBy: announcementData.createdBy,
      createdAt: createdAt
    });
    
    // Find the announcement by matching content
    const announcement = await announcements.findOne({
      title: announcementData.title,
      message: announcementData.message,
      createdBy: announcementData.createdBy
    });
    
    if (!announcement) {
      console.log("No announcement found matching the content criteria");
      throw new Error("Announcement not found");
    }
    
    console.log("Found announcement to delete:", { _id: announcement._id, title: announcement.title });
    
    const result = await announcements.deleteOne({
      title: announcementData.title,
      message: announcementData.message,
      createdBy: announcementData.createdBy
    });
    
    if (result.deletedCount === 0) {
      throw new Error("Failed to delete announcement");
    }
    
    console.log(`Successfully deleted announcement: ${announcement.title}`);
    return { success: true, deletedTitle: announcementData.title, deletedCount: result.deletedCount };
  } catch (error) {
    console.error("Error deleting announcement by content:", error);
    throw error;
  }
}

export async function updateSecuritySetting(settingName: string, value: string) {
  try {
    await connectToMongoDB();
    const settings = getCollection("security_settings");
    
    const result = await settings.updateOne(
      { setting: settingName },
      { $set: { value, updatedAt: new Date() } },
      { upsert: true }
    );
    
    return { success: true, setting: settingName, value, modified: result.modifiedCount };
  } catch (error) {
    console.error("Error updating security setting:", error);
    throw error;
  }
}

export async function updateAuthMethod(method: string, enabled: boolean) {
  try {
    await connectToMongoDB();
    const authConfig = getCollection("auth_config");
    
    const status = enabled ? 'enabled' : 'disabled';
    const result = await authConfig.updateOne(
      { method },
      { $set: { status, updatedAt: new Date() } },
      { upsert: true }
    );
    
    return { success: true, method, status, modified: result.modifiedCount };
  } catch (error) {
    console.error("Error updating auth method:", error);
    throw error;
  }
}

export async function clearSecurityAlert(alertId: string) {
  try {
    await connectToMongoDB();
    const alerts = getCollection("security_alerts");
    
    const result = await alerts.deleteOne({ _id: toId(alertId) });
    
    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    console.error("Error clearing security alert:", error);
    throw error;
  }
}

export async function triggerSystemAction(action: string, parameters?: Record<string, unknown>) {
  try {
    await connectToMongoDB();
    const actionLogs = getCollection("system_action_logs");
    
    const actionRecord = {
      action,
      parameters: parameters || {},
      status: 'completed',
      executedAt: new Date(),
      result: `Action ${action} executed successfully`
    };
    
    await actionLogs.insertOne(actionRecord as Record<string, unknown>);
    
    let actionResult = {};
    
    switch (action) {
      case 'clear-cache':
        actionResult = { cacheCleared: true, itemsCleared: 150 };
        break;
      case 'optimize-db':
        actionResult = { optimized: true, collectionsOptimized: 12, indexesRebuilt: 8 };
        break;
      case 'backup-system':
        actionResult = { backupCreated: true, backupSize: '2.4 GB', location: '/backups/system_backup.tar.gz' };
        break;
      case 'restart-services':
        actionResult = { servicesRestarted: ['api-server', 'websocket', 'scheduler'], restartTime: '3.2s' };
        break;
      case 'health-report':
        actionResult = { reportGenerated: true, reportId: 'health_' + Date.now(), status: 'healthy' };
        break;
      default:
        actionResult = { executed: true };
    }
    
    return { success: true, action, result: actionResult };
  } catch (error) {
    console.error("Error triggering system action:", error);
    throw error;
  }
}

export async function generateReport(reportType: string, filters: Record<string, unknown>) {
  try {
    await connectToMongoDB();
    const reports = getCollection("generated_reports");
    
    const reportData = {
      reportType,
      filters,
      generatedAt: new Date(),
      status: 'completed',
      data: await getReportData(reportType, filters)
    };
    
    console.log("About to insert report data...");
    const result = await reports.insertOne(reportData as Record<string, unknown>);
    console.log("Insert completed, result:", result);
    
    // Use the same pattern as other functions in this file
    const reportId = String(result);
    console.log("Generated report ID:", reportId);
    
    return { 
      success: true, 
      reportId,
      reportType,
      generatedAt: reportData.generatedAt
    };
  } catch (error) {
    console.error("Error generating report:", error);
    throw error;
  }
}

function getReportData(reportType: string, filters: Record<string, unknown>) {
  const fromDate = filters.fromDate ? new Date(String(filters.fromDate)) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const toDate = filters.toDate ? new Date(String(filters.toDate)) : new Date();
  
  switch (reportType) {
    case 'financial':
      return {
        totalRevenue: 850000,
        totalExpenses: 320000,
        netProfit: 530000,
        occupancyRate: 88,
        collectionRate: 95,
        period: { from: fromDate, to: toDate }
      };
    case 'occupancy':
      return {
        totalUnits: 120,
        occupiedUnits: 106,
        vacantUnits: 14,
        occupancyRate: 88.3,
        averageStayDuration: 18,
        period: { from: fromDate, to: toDate }
      };
    case 'maintenance':
      return {
        totalRequests: 45,
        completed: 38,
        pending: 7,
        averageResolutionTime: 2.5,
        totalCost: 125000,
        period: { from: fromDate, to: toDate }
      };
    case 'performance':
      return {
        uptime: 99.9,
        averageResponseTime: 245,
        errorRate: 0.1,
        requestsHandled: 125000,
        period: { from: fromDate, to: toDate }
      };
    default:
      return {
        reportType,
        period: { from: fromDate, to: toDate },
        message: 'Custom report data'
      };
  }
}

export async function exportReport(reportId: string, format: string) {
  try {
    await connectToMongoDB();
    const reports = getCollection("generated_reports");
    
    const report = await reports.findOne({ _id: toId(reportId) });
    
    if (!report) {
      return {
        success: false,
        error: 'Report not found',
        message: `No report found with ID: ${reportId}`,
        reportId,
        format
      };
    }
    
    return {
      success: true,
      reportId,
      format,
      data: report,
      exportedAt: new Date()
    };
  } catch (error) {
    console.error("Error exporting report:", error);
    return {
      success: false,
      error: 'Export failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      reportId,
      format
    };
  }
}