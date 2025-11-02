import { serve } from "@std/http/server";
import { ObjectId } from "mongo";
import { connectToMongoDB, getCollection } from "./db.ts";
import { bricllmHandler } from "./bricllm-handler.ts";
import {
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  getUnits,
  getAvailableUnits,
  createUnit,
  getLeases,
  createLease,
  getRenewals,
  createRenewal,
  updateRenewal,
  getPayments,
  createPayment,
  updatePaymentStatus,
  approvePayment,
  rejectPayment,
  getMaintenanceRequests,
  createMaintenanceRequest,
  updateMaintenanceRequest,
  deleteMaintenanceRequest,
  getCaretakerTasks,
  createCaretakerTask,
  updateCaretakerTask,
  getReports,
  createReport,
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  getDashboardStats,
  getUsers as _getUsers,
  loginUser,
  getTenantContext,
  registerUser,
  getSystemStats,
  getUserStats,
  getSecurityStats,
  getFinancialStats,
  getUserActivities,
  getSecurityConfig,
  getSecurityAlerts,
  getSecuritySettings,
  getAvailableReports,
  getReportActivities,
  getDatabaseHealth,
  getApiEndpoints,
  getSystemAlerts,
  getAuditLogs,
  createAuditLog,
  createUser,
  getDocuments,
  createDocument,
  deleteDocument,
  getDocumentById,
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  deleteInvoice,
  generateMonthlyInvoices,
  processOverdueInvoices,
  getInvoiceMarkdown,
  getInvoicePdf,
  saveChatMessage,
  getChatMessages,
  createChatEscalation,
  createAnnouncement,
  getAnnouncements,
  updateAnnouncementStatus,
  deleteAnnouncement,
  deleteAnnouncementByContent,
  updateSecuritySetting,
  updateAuthMethod,
  clearSecurityAlert,
  triggerSystemAction,
  generateReport,
  exportReport,
  registerPendingTenant,
  getPendingUsers,
  approvePendingUser,
  declinePendingUser,
  getPendingApplicationsForManager,
  approveApplicationByManager,
  rejectApplicationByManager,
  requestPasswordReset,
  resetPassword,
  savePushSubscription,
  getPushSubscription,
  deletePushSubscription
} from "./api-services.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control, pragma, expires, x-manager-id',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
};

interface WebSocketConnection {
  socket: WebSocket;
  userId: string;
  connectedAt: Date;
  lastPing: Date;
  isAlive: boolean;
  messageCount: number;
}

const connections = new Map<string, WebSocketConnection>();
const MAX_CONNECTIONS = 10000;
const HEARTBEAT_INTERVAL = 30000;
const CONNECTION_TIMEOUT = 60000;

const _heartbeatTimer = setInterval(() => {
  const now = Date.now();
  
  connections.forEach((conn, userId) => {
    if (now - conn.lastPing.getTime() > CONNECTION_TIMEOUT) {
      console.log(`[WebSocket] Closing stale connection for user ${userId}`);
      try {
        conn.socket.close();
      } catch (error) {
        console.error(`[WebSocket] Error closing stale connection:`, error);
      }
      connections.delete(userId);
      return;
    }
    
    if (conn.socket.readyState === WebSocket.OPEN) {
      try {
        conn.socket.send(JSON.stringify({ type: 'ping', timestamp: now }));
      } catch (error) {
        console.error(`[WebSocket] Ping failed for user ${userId}:`, error);
        connections.delete(userId);
      }
    } else {
      connections.delete(userId);
    }
  });
}, HEARTBEAT_INTERVAL);

function broadcastToUsers(userIds: string[], notification: unknown) {
  const message = JSON.stringify({
    type: 'notification',
    data: notification
  });
  
  const activeConns = userIds
    .map(id => connections.get(id))
    .filter((conn): conn is WebSocketConnection => 
      conn !== undefined && conn.socket.readyState === WebSocket.OPEN
    );
  
  let successCount = 0;
  let failCount = 0;
  
  activeConns.forEach(conn => {
    try {
      conn.socket.send(message);
      conn.messageCount++;
      successCount++;
    } catch (error) {
      failCount++;
      console.error(`[WebSocket] Failed to send to user ${conn.userId}:`, error);
      connections.delete(conn.userId);
    }
  });
  
  if (userIds.length > 0) {
    console.log(`[WebSocket] Broadcast: ${successCount} success, ${failCount} failed of ${userIds.length} targets`);
  }
}

function _broadcastToAll(notification: unknown) {
  const message = JSON.stringify({
    type: 'notification',
    data: notification
  });
  
  const activeConns = Array.from(connections.values()).filter(
    conn => conn.socket.readyState === WebSocket.OPEN
  );
  
  let successCount = 0;
  let failCount = 0;
  
  activeConns.forEach(conn => {
    try {
      conn.socket.send(message);
      conn.messageCount++;
      successCount++;
    } catch (error) {
      failCount++;
      console.error(`[WebSocket] Failed to broadcast to user ${conn.userId}:`, error);
      connections.delete(conn.userId);
    }
  });
  
  console.log(`[WebSocket] Broadcast all: ${successCount} success, ${failCount} failed`);
}

const connectedUsers = new Map<string, WebSocket>();

function syncLegacyMap() {
  connectedUsers.clear();
  connections.forEach((conn, userId) => {
    connectedUsers.set(userId, conn.socket);
  });
}

serve(async (req) => {
  // Basic request logging for monitoring
  const requestUrl = new URL(req.url);
  if (!requestUrl.pathname.includes('/ws') && !requestUrl.pathname.includes('/favicon')) {
    console.log(`${req.method} ${requestUrl.pathname}`);
  }
  
  // Handle WebSocket upgrade
  if (req.headers.get("upgrade") === "websocket") {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    
    if (!userId) {
      return new Response("Missing userId parameter", { status: 400 });
    }
    
    if (connections.size >= MAX_CONNECTIONS) {
      console.log(`[WebSocket] Connection limit reached (${MAX_CONNECTIONS})`);
      return new Response("Server at capacity", { status: 503 });
    }
    
    const existingConn = connections.get(userId);
    if (existingConn) {
      console.log(`[WebSocket] Closing existing connection for user ${userId}`);
      try {
        existingConn.socket.close();
      } catch (error) {
        console.error(`[WebSocket] Error closing existing connection:`, error);
      }
      connections.delete(userId);
    }
    
    const { socket, response } = Deno.upgradeWebSocket(req, {
      idleTimeout: 120
    });
    
    const conn: WebSocketConnection = {
      socket,
      userId,
      connectedAt: new Date(),
      lastPing: new Date(),
      isAlive: true,
      messageCount: 0
    };
    
    socket.onopen = () => {
      connections.set(userId, conn);
      syncLegacyMap();
      console.log(`[WebSocket] User ${userId} connected (${connections.size} total)`);
      
      try {
        socket.send(JSON.stringify({
          type: 'connected',
          timestamp: new Date().toISOString(),
          userId: userId
        }));
      } catch (error) {
        console.error(`[WebSocket] Failed to send connection confirmation:`, error);
      }
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'pong') {
          conn.lastPing = new Date();
          conn.isAlive = true;
        }
      } catch (error) {
        console.error(`[WebSocket] Message parse error for user ${userId}:`, error);
      }
    };
    
    socket.onclose = () => {
      connections.delete(userId);
      syncLegacyMap();
      console.log(`[WebSocket] User ${userId} disconnected (${connections.size} total)`);
    };
    
    socket.onerror = (error) => {
      console.error(`[WebSocket] Error for user ${userId}:`, error);
      connections.delete(userId);
      syncLegacyMap();
    };
    
    return response;
  }
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const path = url.pathname.split('/').filter(Boolean);
  
  try {
    // Auth endpoints
    if (path[0] === 'api' && path[1] === 'auth') {
      if (path[2] === 'login' && req.method === 'POST') {
        const data = await req.json();
        
        // Extract client information
        const clientInfo = {
          ip: req.headers.get('x-forwarded-for') || 
              req.headers.get('x-real-ip') || 
              req.headers.get('cf-connecting-ip') ||
              'unknown',
          userAgent: req.headers.get('user-agent') || 'unknown'
        };
        
        const result = await loginUser(data.email, data.password, clientInfo);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (path[2] === 'register' && req.method === 'POST') {
        const data = await req.json();
        const result = await registerUser(data);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
        });
      } else if (path[2] === 'logout' && req.method === 'POST') {
        return new Response(JSON.stringify({ success: true, message: 'Logged out successfully' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (path[2] === 'register-pending' && req.method === 'POST') {
        const data = await req.json();
        console.log('[API] register-pending data:', JSON.stringify(data, null, 2));
        const result = await registerPendingTenant(data);
        console.log('[API] register-pending result:', result);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: result.success ? 201 : 400
        });
      } else if (path[2] === 'forgot-password' && req.method === 'POST') {
        const data = await req.json();
        const result = await requestPasswordReset(data.email);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (path[2] === 'reset-password' && req.method === 'POST') {
        const data = await req.json();
        const result = await resetPassword(data.token, data.newPassword);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: result.success ? 200 : 400
        });
      }
    }

    // Users endpoints
    if (path[0] === 'api' && path[1] === 'users') {
      if (path[2] && req.method === 'GET') {
        const userId = path[2];
        try {
          await connectToMongoDB();
          const users = getCollection("users");
          const user = await users.findOne({ _id: new ObjectId(userId) });
          if (!user) {
            return new Response(JSON.stringify({ error: 'User not found' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 404
            });
          }
          const sanitizedUser = {
            id: user._id?.toString(),
            fullName: user.fullName,
            email: user.email,
            userType: user.userType,
            phone: user.phone
          };
          return new Response(JSON.stringify(sanitizedUser), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (_error) {
          return new Response(JSON.stringify({ error: 'Invalid user ID' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      } else if (req.method === 'GET') {
        try {
          await connectToMongoDB();
          const users = getCollection("users");
          const userType = url.searchParams.get('userType');
          
          let query = {};
          if (userType) {
            query = { userType };
          }
          
          const result = await users.find(query).toArray();
          const sanitizedUsers = result.map(user => ({
            id: user._id?.toString(),
            fullName: user.fullName,
            email: user.email,
            userType: user.userType,
            phone: user.phone
          }));
          
          return new Response(JSON.stringify(sanitizedUsers), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (_error) {
          return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    }

    if (path[0] === 'api' && path[1] === 'tenants' && path.length >= 4 && path[3] === 'context' && req.method === 'GET') {
      const tenantId = path[2];
      if (!tenantId) {
        return new Response(JSON.stringify({ error: 'Tenant identifier required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      try {
        const context = await getTenantContext(tenantId);
        return new Response(JSON.stringify(context), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        console.error('Error building tenant context:', error);
        return new Response(JSON.stringify({ error: 'Failed to load tenant context' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Properties endpoints
    if (path[0] === 'api' && path[1] === 'properties') {
      if (req.method === 'GET') {
        // Check if there's a property ID in the path (/api/properties/:id)
        if (path[2]) {
          const propertyId = path[2];
          try {
            const property = await getPropertyById(propertyId);
            if (!property) {
              return new Response(JSON.stringify({ error: 'Property not found' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 404
              });
            }
            return new Response(JSON.stringify(property), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          } catch (_error) {
            return new Response(JSON.stringify({ error: 'Invalid property ID' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 400
            });
          }
        } else {
          // Get all properties with filters
          const filters = Object.fromEntries(url.searchParams);
          const properties = await getProperties(filters);
          return new Response(JSON.stringify(properties), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      } else if (req.method === 'POST') {
        const body = await req.json();
        const property = await createProperty(body);
        return new Response(JSON.stringify(property), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
        });
      } else if (req.method === 'PUT' && path[2]) {
        const propertyId = path[2];
        const body = await req.json();
        const result = await updateProperty(propertyId, body);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Units endpoints
    if (path[0] === 'api' && path[1] === 'units' && path[2] === 'available' && path[3]) {
      if (req.method === 'GET') {
        const propertyId = path[3];
        const units = await getAvailableUnits(propertyId);
        return new Response(JSON.stringify(units), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    if (path[0] === 'api' && path[1] === 'units') {
      if (path[2] && req.method === 'GET') {
        const unitId = path[2];
        const units = getCollection("units");
        const unit = await units.findOne({ _id: new ObjectId(unitId) });
        if (!unit) {
          return new Response(JSON.stringify({ error: 'Unit not found' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404
          });
        }
        const unitResponse = {
          id: unit._id.toString(),
          unitNumber: unit.unitNumber,
          propertyId: unit.propertyId?.toString(),
          rent: unit.rent,
          bedrooms: unit.bedrooms,
          bathrooms: unit.bathrooms,
          sqft: unit.sqft,
          status: unit.status,
          features: unit.features,
          floor: unit.floor
        };
        return new Response(JSON.stringify(unitResponse), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (req.method === 'GET') {
        const propertyId = url.searchParams.get('propertyId');
        const units = await getUnits(propertyId || undefined);
        return new Response(JSON.stringify(units), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (req.method === 'POST') {
        const body = await req.json();
        const unit = await createUnit(body);
        return new Response(JSON.stringify(unit), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
        });
      }
    }

    // Leases endpoints
    if (path[0] === 'api' && path[1] === 'leases') {
      if (req.method === 'GET') {
        const filters = Object.fromEntries(url.searchParams);
        const leases = await getLeases(filters);
        return new Response(JSON.stringify(leases), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (req.method === 'POST') {
        const body = await req.json();
        console.log('[POST /api/leases] Creating lease with data:', JSON.stringify(body, null, 2));
        const lease = await createLease(body);
        console.log('[POST /api/leases] Created lease:', JSON.stringify(lease, null, 2));

        try {
          const leaseRecord = lease as Record<string, unknown>;
          const rawStartDate = leaseRecord.startDate;
          let startDateInput: string | number | Date = new Date();

          if (rawStartDate instanceof Date) {
            startDateInput = rawStartDate;
          } else if (typeof rawStartDate === 'string' || typeof rawStartDate === 'number') {
            startDateInput = rawStartDate;
          }

          const startDate = new Date(startDateInput);
          const month = startDate.toLocaleString('default', { month: 'long' });
          const year = startDate.getFullYear();

          const tenantName = typeof leaseRecord.tenant === 'object' && leaseRecord.tenant !== null 
            ? (leaseRecord.tenant as Record<string, unknown>).fullName as string | undefined
            : undefined;
          
          const propertyName = typeof leaseRecord.property === 'object' && leaseRecord.property !== null 
            ? (leaseRecord.property as Record<string, unknown>).name as string | undefined
            : undefined;
          
          const propertyAddress = typeof leaseRecord.property === 'object' && leaseRecord.property !== null 
            ? (leaseRecord.property as Record<string, unknown>).address as string | undefined
            : undefined;

          let managerId = undefined;
          if (leaseRecord.propertyId) {
            const properties = getCollection("properties");
            const property = await properties.findOne({ _id: new ObjectId(leaseRecord.propertyId as string) });
            if (property && property.managerId) {
              managerId = property.managerId;
            }
          }

          const dueDate = new Date(startDate);
          dueDate.setMonth(dueDate.getMonth() + 1);
          dueDate.setDate(1);

          await createInvoice({
            tenantId: leaseRecord.tenantId,
            leaseId: leaseRecord.id,
            propertyId: leaseRecord.propertyId,
            managerId: managerId,
            amount: (leaseRecord.monthlyRent as number | undefined) ?? 0,
            issueDate: startDate.toISOString().split('T')[0],
            dueDate: dueDate.toISOString().split('T')[0],
            month: month,
            year: year,
            status: 'active',
            description: `Monthly rent for ${month} ${year}`,
            source: 'lease',
            tenantName: tenantName || 'Tenant',
            propertyName: propertyName,
            propertyAddress: propertyAddress
          });
        } catch (invoiceError) {
          console.error('Failed to create automatic invoice for lease:', invoiceError);
        }

        return new Response(JSON.stringify(lease), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
        });
      }
    }

    // Renewals endpoints
    if (path[0] === 'api' && path[1] === 'renewals') {
      if (req.method === 'GET') {
        const filters = Object.fromEntries(url.searchParams);
        const renewals = await getRenewals(filters);
        return new Response(JSON.stringify(renewals), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (req.method === 'POST') {
        const body = await req.json();
        const renewal = await createRenewal(body);
        return new Response(JSON.stringify(renewal), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
        });
      } else if (req.method === 'PATCH' && path[2]) {
        const renewalId = path[2];
        const body = await req.json();
        const result = await updateRenewal(renewalId, body);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Payments endpoints
    if (path[0] === 'api' && path[1] === 'payments') {
      if (req.method === 'GET') {
        const filters = Object.fromEntries(url.searchParams);
        const payments = await getPayments(filters);
        return new Response(JSON.stringify(payments), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (req.method === 'POST' && path[2] === 'approve' && path[2]) {
        // POST /api/payments/:id/approve
        const body = await req.json();
        const payment = await approvePayment(path[2], body.managerId, body.notes);
        return new Response(JSON.stringify(payment), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (req.method === 'POST' && path[3] === 'approve') {
        // POST /api/payments/:id/approve
        const body = await req.json();
        const payment = await approvePayment(path[2], body.managerId, body.notes);
        return new Response(JSON.stringify(payment), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (req.method === 'POST' && path[3] === 'reject') {
        // POST /api/payments/:id/reject
        const body = await req.json();
        const payment = await rejectPayment(path[2], body.managerId, body.notes);
        return new Response(JSON.stringify(payment), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (req.method === 'POST') {
        const body = await req.json();
        const payment = await createPayment(body);

        // #COMPLETION_DRIVE: Broadcast to all managers of the property, not just primary manager
        // #SUGGEST_VERIFY: Test with multiple managers to ensure all receive real-time updates
        if (body.propertyId) {
          try {
            await connectToMongoDB();
            const properties = getCollection("properties");
            const property = await properties.findOne({ _id: new ObjectId(body.propertyId) }) as Record<string, unknown> | null;

            const managerIds: string[] = [];

            if (property) {
              if (property.managerId) {
                managerIds.push(String(property.managerId));
              }
              if (Array.isArray(property.managers)) {
                managerIds.push(...(property.managers as unknown[]).map(m => String(m)));
              }
            }

            if (body.managerId && !managerIds.includes(String(body.managerId))) {
              managerIds.push(String(body.managerId));
            }

            const uniqueManagerIds = [...new Set(managerIds)];

            for (const managerId of uniqueManagerIds) {
              const paymentNotification = {
                userId: managerId,
                type: 'payment_received',
                title: 'Payment Received',
                message: `Payment of R${body.amount} has been received`,
                read: false
              };
              await createNotification(paymentNotification, { broadcastToUsers });
            }

            // #COMPLETION_DRIVE: Also notify tenant so their payment history updates in real-time
            // #SUGGEST_VERIFY: Tenant receives WebSocket notification after payment submission
            if (body.tenantId) {
              const tenantNotification = {
                userId: body.tenantId,
                type: 'payment_submitted',
                title: 'Payment Submitted',
                message: `Your payment of R${body.amount} has been submitted`,
                read: false
              };
              await createNotification(tenantNotification, { broadcastToUsers });
            }
          } catch (error) {
            console.error("Error broadcasting payment notification to managers:", error);
          }
        }

        return new Response(JSON.stringify(payment), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
        });
      } else if (req.method === 'PUT' && path[2]) {
        const body = await req.json();
        const payment = await updatePaymentStatus(path[2], body.status);
        return new Response(JSON.stringify(payment), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Invoices endpoints
    if (path[0] === 'api' && path[1] === 'invoices') {
      if (req.method === 'GET' && path[2] && path[3] === 'pdf') {
         if (!/^[0-9a-fA-F]{24}$/.test(path[2])) {
        return new Response(JSON.stringify({ error: 'Invalid invoice ID' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
        const pdf = await getInvoicePdf(path[2]);
        return new Response(pdf.bytes, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${pdf.filename}"`
          }
        });
      } else if (req.method === 'GET' && path[2] && path[3] === 'markdown') {
        const markdown = await getInvoiceMarkdown(path[2]);
        return new Response(markdown.content, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'text/markdown; charset=utf-8',
            'Content-Disposition': `attachment; filename="${markdown.filename}"`
          }
        });
      } else if (req.method === 'POST' && path[2] === 'generate-monthly') {
        const body = req.bodyUsed ? await req.json().catch(() => ({})) : {};
        const invoicesGenerated = await generateMonthlyInvoices(body.managerId);
        return new Response(JSON.stringify(invoicesGenerated), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
        });
      } else if (req.method === 'POST' && path[2] === 'process-overdue') {
        const body = req.bodyUsed ? await req.json().catch(() => ({})) : {};
        const processedInvoices = await processOverdueInvoices(body.managerId);
        return new Response(JSON.stringify(processedInvoices), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (req.method === 'GET' && path[2]) {
        const invoice = await getInvoiceById(path[2]);
        return new Response(JSON.stringify(invoice), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (req.method === 'GET') {
        const filters = Object.fromEntries(url.searchParams);
        const invoices = await getInvoices(filters);
        return new Response(JSON.stringify(invoices), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (req.method === 'POST') {
        const body = await req.json();
        const invoice = await createInvoice(body);
        return new Response(JSON.stringify(invoice), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
        });
      } else if (req.method === 'PATCH' && path[2]) {
        const body = await req.json();
        const invoice = await updateInvoiceStatus(path[2], body.status);
        return new Response(JSON.stringify(invoice), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (req.method === 'DELETE' && path[2]) {
        const success = await deleteInvoice(path[2]);
        return new Response(JSON.stringify({ success }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Chat endpoints
    if (path[0] === 'api' && path[1] === 'chat-messages') {
      if (req.method === 'GET') {
        const filters = Object.fromEntries(url.searchParams);
        const messages = await getChatMessages(filters);
        return new Response(JSON.stringify(messages), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (req.method === 'POST') {
        const body = await req.json();
        const message = await saveChatMessage(body);
        return new Response(JSON.stringify(message), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
        });
      }
    }

    // Chat escalations endpoints
    if (path[0] === 'api' && path[1] === 'chat-escalations') {
      if (req.method === 'POST') {
        const body = await req.json();
        const escalation = await createChatEscalation(body);
        return new Response(JSON.stringify(escalation), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
        });
      }
    }

    if (path[0] === 'api' && path[1] === 'bricllm') {
      if (path[2] === 'query' && req.method === 'POST') {
        const body = await req.json();
        const result = await bricllmHandler.query(body);

        if (result) {
          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          return new Response(JSON.stringify({ error: 'Bricllm unavailable' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 503
          });
        }
      } else if (path[2] === 'health' && req.method === 'GET') {
        const isHealthy = await bricllmHandler.healthCheck();
        return new Response(JSON.stringify({ healthy: isHealthy }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: isHealthy ? 200 : 503
        });
      }
    }

    // Announcements endpoints
    if (path[0] === 'api' && path[1] === 'announcements') {
      if (req.method === 'POST' && path[2] && path[3] === 'send') {
        const updatedAnnouncement = await updateAnnouncementStatus(path[2], 'sent');
        return new Response(JSON.stringify(updatedAnnouncement), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (req.method === 'DELETE' && path[2]) {
        try {
          const result = await deleteAnnouncement(path[2]);
          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          console.error("Error in DELETE announcement endpoint:", error);
          return new Response(JSON.stringify({ 
            error: 'Failed to delete announcement', 
            details: error.message 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          });
        }
      } else if (req.method === 'POST' && path[2] === 'delete-by-content') {
        const body = await req.json();
        const result = await deleteAnnouncementByContent(body);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (req.method === 'GET') {
        const filters = Object.fromEntries(url.searchParams);
        const announcements = await getAnnouncements(filters);
        return new Response(JSON.stringify(announcements), {
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
      } else if (req.method === 'POST') {
        const body = await req.json();
        const announcement = await createAnnouncement(body);
        return new Response(JSON.stringify(announcement), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
        });
      }
    }
    
    // Debug endpoints
    if (path[0] === 'api' && path[1] === 'debug' && path[2] === 'announcements') {
      if (req.method === 'GET') {
        try {
          await connectToMongoDB();
          const announcements = getCollection("announcements");
          const rawAnnouncements = await announcements.find({}).sort({ createdAt: -1 }).toArray();
          
          const debugInfo = {
            count: rawAnnouncements.length,
            announcements: rawAnnouncements.map(a => ({
              _id: a._id?.toString(),
              title: a.title,
              createdAt: a.createdAt,
              status: a.status
            }))
          };
          
          return new Response(JSON.stringify(debugInfo), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          });
        }
      }
    }

    // Maintenance requests endpoints
    if (path[0] === 'api' && path[1] === 'maintenance') {
      if (req.method === 'GET') {
        const filters = Object.fromEntries(url.searchParams);
        const requests = await getMaintenanceRequests(filters);
        return new Response(JSON.stringify(requests), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (req.method === 'POST') {
        const body = await req.json();
        const broadcaster = { broadcastToUsers };
        const request = await createMaintenanceRequest(body, broadcaster);
        return new Response(JSON.stringify(request), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
        });
      } else if (req.method === 'PUT' && path[2]) {
        const body = await req.json();
        const broadcaster = { broadcastToUsers };
        const request = await updateMaintenanceRequest(path[2], body, broadcaster);
        return new Response(JSON.stringify(request), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (req.method === 'DELETE' && path[2]) {
        const broadcaster = { broadcastToUsers };
        const result = await deleteMaintenanceRequest(path[2], broadcaster);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        });
      }
    }

    // Caretaker tasks endpoints
    if (path[0] === 'api' && path[1] === 'tasks') {
      if (req.method === 'GET') {
        const filters = Object.fromEntries(url.searchParams);
        const tasks = await getCaretakerTasks(filters);
        return new Response(JSON.stringify(tasks), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (req.method === 'POST') {
        const body = await req.json();
        const task = await createCaretakerTask(body);
        return new Response(JSON.stringify(task), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
        });
      } else if (req.method === 'PUT' && path[2]) {
        const body = await req.json();
        const task = await updateCaretakerTask(path[2], body);
        return new Response(JSON.stringify(task), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Reports endpoints
    if (path[0] === 'api' && path[1] === 'reports') {
      if (req.method === 'GET') {
        const filters = Object.fromEntries(url.searchParams);
        const reports = await getReports(filters);
        return new Response(JSON.stringify(reports), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (req.method === 'POST') {
        const body = await req.json();
        const report = await createReport(body);
        return new Response(JSON.stringify(report), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
        });
      }
    }

    // Dashboard stats endpoint
    if (path[0] === 'api' && path[1] === 'dashboard' && path[2] === 'stats') {
      if (req.method === 'GET') {
        const filters = Object.fromEntries(url.searchParams);
        const stats = await getDashboardStats(filters);
        return new Response(JSON.stringify(stats), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Push subscription endpoints
    if (path[0] === 'api' && path[1] === 'push-subscribe') {
      if (req.method === 'POST') {
        const body = await req.json();
        const result = await savePushSubscription(body.userId, body.subscription);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (req.method === 'GET' && path[2]) {
        const subscription = await getPushSubscription(path[2]);
        return new Response(JSON.stringify(subscription), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (req.method === 'DELETE' && path[2]) {
        const result = await deletePushSubscription(path[2]);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Notifications endpoints
    if (path[0] === 'api' && path[1] === 'notifications') {
      if (req.method === 'GET' && path[2]) {
        const notifications = await getNotifications(path[2]);
        return new Response(JSON.stringify(notifications), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (req.method === 'POST') {
        const body = await req.json();
        const broadcaster = { broadcastToUsers };
        const notification = await createNotification(body, broadcaster);
        return new Response(JSON.stringify(notification), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
        });
      } else if (req.method === 'PUT' && path[2]) {
        const body = await req.json();
        const result = await updateNotification(path[2], body);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (req.method === 'DELETE' && path[2]) {
        const result = await deleteNotification(path[2]);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Admin endpoints
    if (path[0] === 'admin' || (path[0] === 'api' && path[1] === 'admin')) {
      const adminPathOffset = path[0] === 'api' ? 2 : 1;
      const adminSubpath = path[adminPathOffset];
      
      // System stats
      if (adminSubpath === 'system-stats' && req.method === 'GET') {
        const stats = await getSystemStats();
        return new Response(JSON.stringify(stats), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // User stats
      if (adminSubpath === 'user-stats' && req.method === 'GET') {
        const stats = await getUserStats();
        return new Response(JSON.stringify(stats), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Security stats
      if (adminSubpath === 'security-stats' && req.method === 'GET') {
        const stats = await getSecurityStats();
        return new Response(JSON.stringify(stats), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Financial stats
      if (path[1] === 'financial-stats' && req.method === 'GET') {
        const stats = await getFinancialStats();
        return new Response(JSON.stringify(stats), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // User activities
      if (path[1] === 'user-activities' && req.method === 'GET') {
        const activities = await getUserActivities();
        return new Response(JSON.stringify(activities), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Security config
      if (path[1] === 'security-config' && req.method === 'GET') {
        const config = await getSecurityConfig();
        return new Response(JSON.stringify(config), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Security alerts
      if (path[1] === 'security-alerts' && req.method === 'GET') {
        const alerts = await getSecurityAlerts();
        return new Response(JSON.stringify(alerts), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Security settings
      if (path[1] === 'security-settings' && req.method === 'GET') {
        const settings = await getSecuritySettings();
        return new Response(JSON.stringify(settings), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            Pragma: 'no-cache',
            Expires: '0'
          }
        });
      }
      
      // Available reports
      if (path[1] === 'available-reports' && req.method === 'GET') {
        const reports = await getAvailableReports();
        return new Response(JSON.stringify(reports), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Report activities
      if (path[1] === 'report-activities' && req.method === 'GET') {
        const activities = await getReportActivities();
        return new Response(JSON.stringify(activities), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Database health
      if (path[1] === 'database-health' && req.method === 'GET') {
        const health = await getDatabaseHealth();
        return new Response(JSON.stringify(health), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // API endpoints
      if (path[1] === 'api-endpoints' && req.method === 'GET') {
        const endpoints = await getApiEndpoints();
        return new Response(JSON.stringify(endpoints), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // System alerts
      if (path[1] === 'system-alerts' && req.method === 'GET') {
        const alerts = await getSystemAlerts();
        return new Response(JSON.stringify(alerts), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Audit logs - GET
      if (path[1] === 'audit-logs' && req.method === 'GET') {
        const url = new URL(req.url);
        const filters = Object.fromEntries(url.searchParams.entries());
        const logs = await getAuditLogs(filters);
        return new Response(JSON.stringify(logs), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Audit logs - POST
      if (path[1] === 'audit-logs' && req.method === 'POST') {
        const body = await req.json();
        const result = await createAuditLog(body);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
        });
      }
      
      // Create user
      if (path[1] === 'users' && req.method === 'POST') {
        const body = await req.json();
        const user = await createUser(body);
        return new Response(JSON.stringify(user), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
        });
      }
      
      // Update security setting
      if (path[1] === 'security-settings' && req.method === 'PUT') {
        const body = await req.json();
        const result = await updateSecuritySetting(body.id, body.setting, body.value);
        return new Response(JSON.stringify(result), {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            Pragma: 'no-cache',
            Expires: '0'
          }
        });
      }
      
      // Update auth method
      if (path[1] === 'auth-methods' && req.method === 'PUT') {
        const body = await req.json();
        const result = await updateAuthMethod(body.method, body.enabled);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Clear security alert
      if (path[1] === 'security-alerts' && path[2] && req.method === 'DELETE') {
        const alertId = path[2];
        const result = await clearSecurityAlert(alertId);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Trigger system action
      if (path[1] === 'system-actions' && req.method === 'POST') {
        const body = await req.json();
        const result = await triggerSystemAction(body.action, body.parameters);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Generate report
      if (path[1] === 'generate-report' && req.method === 'POST') {
        const body = await req.json();
        const result = await generateReport(body.reportType, body.filters);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Export report
      if (path[1] === 'export-report' && path[2] && path[3] && req.method === 'GET') {
        const reportId = path[2];
        const format = path[3];
        const result = await exportReport(reportId, format);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Get pending users
      if (adminSubpath === 'pending-users' && req.method === 'GET') {
        const pendingUsers = await getPendingUsers();
        return new Response(JSON.stringify(pendingUsers), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Approve pending user
      if (adminSubpath === 'pending-users' && path[adminPathOffset + 1] && path[adminPathOffset + 2] === 'approve' && req.method === 'POST') {
        const userId = path[adminPathOffset + 1];
        try {
          const result = await approvePendingUser(userId);
          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({ 
            success: false, 
            message: error instanceof Error ? error.message : 'Failed to approve user' 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          });
        }
      }
      
      // Decline pending user
      if (adminSubpath === 'pending-users' && path[adminPathOffset + 1] && path[adminPathOffset + 2] === 'decline' && req.method === 'POST') {
        const userId = path[adminPathOffset + 1];
        try {
          const result = await declinePendingUser(userId);
          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({ 
            success: false, 
            message: error instanceof Error ? error.message : 'Failed to decline user' 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          });
        }
      }
    }

    // Manager endpoints
    if (path[0] === 'api' && path[1] === 'manager') {
      const managerId = req.headers.get('x-manager-id');
      
      if (!managerId) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: 'Manager ID required' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        });
      }

      // Get pending applications for manager
      if (path[2] === 'applications' && req.method === 'GET') {
        try {
          const applications = await getPendingApplicationsForManager(managerId);
          return new Response(JSON.stringify(applications), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({ 
            success: false, 
            message: error instanceof Error ? error.message : 'Failed to fetch applications' 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500
          });
        }
      }

      // Approve application by manager
      if (path[2] === 'applications' && path[3] && path[4] === 'approve' && req.method === 'POST') {
        const userId = path[3];
        
        try {
          const result = await approveApplicationByManager(userId, managerId);
          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({ 
            success: false, 
            message: error instanceof Error ? error.message : 'Failed to approve application' 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          });
        }
      }

      // Reject application by manager
      if (path[2] === 'applications' && path[3] && path[4] === 'reject' && req.method === 'POST') {
        const userId = path[3];
        
        try {
          const data = await req.json().catch(() => ({}));
          const reason = data.reason || 'No reason provided';
          
          const result = await rejectApplicationByManager(userId, managerId, reason);
          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({ 
            success: false, 
            message: error instanceof Error ? error.message : 'Failed to reject application' 
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          });
        }
      }
    }

    // Debug endpoint to show connected WebSocket users
    if (path[0] === 'api' && path[1] === 'debug' && path[2] === 'connections') {
      if (req.method === 'GET') {
        const connections = Array.from(connectedUsers.entries()).map(([userId, socket]) => ({
          userId,
          readyState: socket.readyState,
          readyStateText: socket.readyState === WebSocket.OPEN ? 'OPEN' : 
                         socket.readyState === WebSocket.CONNECTING ? 'CONNECTING' :
                         socket.readyState === WebSocket.CLOSING ? 'CLOSING' : 'CLOSED'
        }));
        
        return new Response(JSON.stringify({
          totalConnections: connectedUsers.size,
          connections
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Test endpoint to send a notification to all connected users
    if (path[0] === 'api' && path[1] === 'debug' && path[2] === 'test-notification') {
      if (req.method === 'POST') {
        const testNotification = {
          _id: 'test-' + Date.now(),
          userId: 'test',
          title: 'Test Notification',
          message: 'This is a test real-time notification!',
          type: 'announcement',
          read: false,
          createdAt: new Date().toISOString()
        };

        const allUserIds = Array.from(connectedUsers.keys());
        
        broadcastToUsers(allUserIds, testNotification);
        
        return new Response(JSON.stringify({
          success: true,
          message: 'Test notification sent',
          targetedUsers: allUserIds,
          notification: testNotification
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    if (path[0] === 'api' && path[1] === 'documents') {
      if (req.method === 'GET' && !path[2]) {
        const filters: Record<string, unknown> = {};
        const filterKeys: Array<[string, string]> = [
          ['type', 'type'],
          ['propertyId', 'propertyId'],
          ['leaseId', 'leaseId'],
          ['tenantId', 'tenantId'],
          ['uploadedBy', 'uploadedBy'],
          ['status', 'status'],
          ['category', 'category']
        ];

        for (const [queryKey, filterKey] of filterKeys) {
          const value = url.searchParams.get(queryKey);
          if (value) {
            filters[filterKey] = value;
          }
        }

        const documents = await getDocuments(filters);
        return new Response(JSON.stringify(documents), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (req.method === 'POST' && !path[2]) {
        const body = await req.json();
        const document = await createDocument(body);
        return new Response(JSON.stringify(document), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
        });
      }

      if (req.method === 'DELETE' && path[2]) {
        const documentId = path[2];
        const result = await deleteDocument(documentId);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (req.method === 'GET' && path[2]) {
        const documentId = path[2];
        const document = await getDocumentById(documentId);
        if (document) {
          return new Response(JSON.stringify(document), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        return new Response(JSON.stringify({ error: 'Document not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        });
      }
    }

    return new Response(JSON.stringify({ error: 'Endpoint not found' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 404
    });

  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
}, { port: 8816, hostname: "0.0.0.0" });

console.log('API Server running on http://localhost:8816');