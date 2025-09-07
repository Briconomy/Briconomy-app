import { connectToMongoDB, getCollection } from "./db.ts";
import { ObjectId } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

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
    
    if (user.password !== hashedPasswordHex) {
      return { success: false, message: "Invalid password" };
    }
    
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      success: true,
      message: "Login successful",
      user: userWithoutPassword,
      token: "mock-jwt-token"
    };
  } catch (error) {
    console.error("Error logging in user:", error);
    throw error;
  }
}

export async function registerUser(userData: any) {
  try {
    await connectToMongoDB();
    const users = getCollection("users");
    
    const existingUser = await users.findOne({ email: userData.email });
    
    if (existingUser) {
      return { success: false, message: "User already exists" };
    }
    
    const hashedPassword = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(userData.password));
    const hashedPasswordHex = Array.from(new Uint8Array(hashedPassword))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    const result = await users.insertOne({
      ...userData,
      password: hashedPasswordHex,
      createdAt: new Date()
    });
    
    const { password: _, ...userWithoutPassword } = result;
    
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
    return await properties.find({}).toArray();
  } catch (error) {
    console.error("Error fetching properties:", error);
    throw error;
  }
}

export async function getPropertyById(id: string) {
  try {
    await connectToMongoDB();
    const properties = getCollection("properties");
    return await properties.findOne({ _id: new ObjectId(id) });
  } catch (error) {
    console.error("Error fetching property:", error);
    throw error;
  }
}

export async function createProperty(propertyData: any) {
  try {
    await connectToMongoDB();
    const properties = getCollection("properties");
    const result = await properties.insertOne({
      ...propertyData,
      createdAt: new Date()
    });
    return result;
  } catch (error) {
    console.error("Error creating property:", error);
    throw error;
  }
}

export async function updateProperty(id: string, propertyData: any) {
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
    return await units.find(filter).toArray();
  } catch (error) {
    console.error("Error fetching units:", error);
    throw error;
  }
}

export async function createUnit(unitData: any) {
  try {
    await connectToMongoDB();
    const units = getCollection("units");
    const result = await units.insertOne({
      ...unitData,
      createdAt: new Date()
    });
    return result;
  } catch (error) {
    console.error("Error creating unit:", error);
    throw error;
  }
}

// Leases API
export async function getLeases(filters: any = {}) {
  try {
    await connectToMongoDB();
    const leases = getCollection("leases");
    return await leases.find(filters).toArray();
  } catch (error) {
    console.error("Error fetching leases:", error);
    throw error;
  }
}

export async function createLease(leaseData: any) {
  try {
    await connectToMongoDB();
    const leases = getCollection("leases");
    const result = await leases.insertOne({
      ...leaseData,
      createdAt: new Date()
    });
    return result;
  } catch (error) {
    console.error("Error creating lease:", error);
    throw error;
  }
}

// Payments API
export async function getPayments(filters: any = {}) {
  try {
    await connectToMongoDB();
    const payments = getCollection("payments");
    return await payments.find(filters).toArray();
  } catch (error) {
    console.error("Error fetching payments:", error);
    throw error;
  }
}

export async function createPayment(paymentData: any) {
  try {
    await connectToMongoDB();
    const payments = getCollection("payments");
    const result = await payments.insertOne({
      ...paymentData,
      createdAt: new Date()
    });
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
export async function getMaintenanceRequests(filters: any = {}) {
  try {
    await connectToMongoDB();
    const requests = getCollection("maintenance_requests");
    return await requests.find(filters).toArray();
  } catch (error) {
    console.error("Error fetching maintenance requests:", error);
    throw error;
  }
}

export async function createMaintenanceRequest(requestData: any) {
  try {
    await connectToMongoDB();
    const requests = getCollection("maintenance_requests");
    const result = await requests.insertOne({
      ...requestData,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    return result;
  } catch (error) {
    console.error("Error creating maintenance request:", error);
    throw error;
  }
}

export async function updateMaintenanceRequest(id: string, updateData: any) {
  try {
    await connectToMongoDB();
    const requests = getCollection("maintenance_requests");
    const result = await requests.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );
    return result;
  } catch (error) {
    console.error("Error updating maintenance request:", error);
    throw error;
  }
}

// Caretaker Tasks API
export async function getCaretakerTasks(filters: any = {}) {
  try {
    await connectToMongoDB();
    const tasks = getCollection("caretaker_tasks");
    return await tasks.find(filters).toArray();
  } catch (error) {
    console.error("Error fetching caretaker tasks:", error);
    throw error;
  }
}

export async function createCaretakerTask(taskData: any) {
  try {
    await connectToMongoDB();
    const tasks = getCollection("caretaker_tasks");
    const result = await tasks.insertOne({
      ...taskData,
      status: 'pending',
      createdAt: new Date()
    });
    return result;
  } catch (error) {
    console.error("Error creating caretaker task:", error);
    throw error;
  }
}

export async function updateCaretakerTask(id: string, updateData: any) {
  try {
    await connectToMongoDB();
    const tasks = getCollection("caretaker_tasks");
    const result = await tasks.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );
    return result;
  } catch (error) {
    console.error("Error updating caretaker task:", error);
    throw error;
  }
}

// Reports API
export async function getReports(filters: any = {}) {
  try {
    await connectToMongoDB();
    const reports = getCollection("reports");
    return await reports.find(filters).toArray();
  } catch (error) {
    console.error("Error fetching reports:", error);
    throw error;
  }
}

export async function createReport(reportData: any) {
  try {
    await connectToMongoDB();
    const reports = getCollection("reports");
    const result = await reports.insertOne({
      ...reportData,
      createdAt: new Date()
    });
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
    return await notifications.find({ userId: new ObjectId(userId) }).toArray();
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
}

export async function createNotification(notificationData: any) {
  try {
    await connectToMongoDB();
    const notifications = getCollection("notifications");
    const result = await notifications.insertOne({
      ...notificationData,
      read: false,
      createdAt: new Date()
    });
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
      totalRevenue: totalRevenue[0]?.total || 0,
      maintenanceStats
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}