import { serve } from "https://deno.land/std@0.204.0/http/server.ts";
import { connectToMongoDB, getCollection } from "./db.ts";
import { bricllmHandler } from "./bricllm-handler.ts";
import {
  getProperties,
  getPropertyById,
  createProperty,
  getUnits,
  createUnit,
  getLeases,
  createLease,
  getPayments,
  createPayment,
  updatePaymentStatus,
  getMaintenanceRequests,
  createMaintenanceRequest,
  updateMaintenanceRequest,
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
  loginUser,
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
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoiceStatus,
  deleteInvoice,
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
  declinePendingUser
} from "./api-services.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, cache-control, pragma, expires',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

// WebSocket connection management
const connectedUsers = new Map<string, WebSocket>();

// Broadcast notification to specific users
function broadcastToUsers(userIds: string[], notification: unknown) {
  console.log(`[WebSocket Broadcast] Broadcasting to ${userIds.length} users: ${userIds.join(', ')}`);
  console.log(`[WebSocket Broadcast] Connected users: ${Array.from(connectedUsers.keys()).join(', ')}`);
  console.log(`[WebSocket Broadcast] Notification type:`, (notification as Record<string, unknown>)?.type);
  
  const message = JSON.stringify({
    type: 'notification',
    data: notification
  });
  
  let successCount = 0;
  let failCount = 0;
  
  userIds.forEach(userId => {
    const socket = connectedUsers.get(userId);
    if (socket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(message);
        successCount++;
        console.log(`[WebSocket Broadcast] ✓ Message sent to user ${userId}`);
      } catch (error) {
        failCount++;
        console.error(`[WebSocket Broadcast] ✗ Failed to send message to user ${userId}:`, error);
        // Remove dead connection
        connectedUsers.delete(userId);
      }
    } else {
      failCount++;
      console.log(`[WebSocket Broadcast] ✗ User ${userId} not connected or socket not ready (state: ${socket?.readyState})`);
    }
  });
  
  console.log(`[WebSocket Broadcast] Complete: ${successCount} success, ${failCount} failed`);
}

// Broadcast to all connected users
function broadcastToAll(notification: any) {
  const message = JSON.stringify({
    type: 'notification',
    data: notification
  });
  
  connectedUsers.forEach((socket, userId) => {
    if (socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(message);
      } catch (error) {
        console.error(`Failed to broadcast to user ${userId}:`, error);
        connectedUsers.delete(userId);
      }
    } else {
      // Clean up dead connections
      connectedUsers.delete(userId);
    }
  });
}

serve(async (req) => {
  const requestUrl = new URL(req.url);
  const requestPath = requestUrl.pathname.split('/').filter(p => p);
  console.log(`${req.method} ${requestUrl.pathname} - Path parts: [${requestPath.join(', ')}]`);
  
  // Handle WebSocket upgrade
  if (req.headers.get("upgrade") === "websocket") {
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");
    
    console.log(`🔌 WebSocket upgrade request received for userId: ${userId}`);
    
    if (!userId) {
      console.log("WebSocket upgrade rejected: Missing userId parameter");
      return new Response("Missing userId parameter", { status: 400 });
    }
    
    const { socket, response } = Deno.upgradeWebSocket(req);
    
    socket.onopen = () => {
      console.log(`WebSocket connected for user: ${userId}`);
      console.log(`Total connected users: ${connectedUsers.size + 1}`);
      connectedUsers.set(userId, socket);
    };
    
    socket.onclose = () => {
      console.log(`WebSocket disconnected for user: ${userId}`);
      connectedUsers.delete(userId);
      console.log(`Total connected users: ${connectedUsers.size}`);
    };
    
    socket.onerror = (error) => {
      console.error(`WebSocket error for user ${userId}:`, error);
      connectedUsers.delete(userId);
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
        const result = await registerPendingTenant(data);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: result.success ? 201 : 400
        });
      }
    }

    // Users endpoints
    if (path[0] === 'api' && path[1] === 'users') {
      if (req.method === 'GET') {
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
        } catch (error) {
          return new Response(JSON.stringify({ error: 'Failed to fetch users' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
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
      }
    }

    // Units endpoints
    if (path[0] === 'api' && path[1] === 'units') {
      if (req.method === 'GET') {
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
        const lease = await createLease(body);
        return new Response(JSON.stringify(lease), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
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
      } else if (req.method === 'POST') {
        const body = await req.json();
        const payment = await createPayment(body);
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
      if (req.method === 'GET' && path[2]) {
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
        console.log("=== ANNOUNCEMENT GET REQUEST ===");
        const filters = Object.fromEntries(url.searchParams);
        console.log("Request filters:", filters);
        const announcements = await getAnnouncements(filters);
        console.log(`API returning ${announcements.length} announcements to client`);
        console.log("Final announcements being returned:", announcements.map(a => ({ id: a.id, title: a.title })));
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
        console.log('[API] POST /api/announcements - Creating announcement:', {
          title: body.title,
          targetAudience: body.targetAudience,
          status: body.status
        });
        const announcement = await createAnnouncement(body);
        console.log('[API] Announcement created successfully:', { id: announcement.id, title: announcement.title });
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
        const request = await createMaintenanceRequest(body);
        return new Response(JSON.stringify(request), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
        });
      } else if (req.method === 'PUT' && path[2]) {
        const body = await req.json();
        const request = await updateMaintenanceRequest(path[2], body);
        return new Response(JSON.stringify(request), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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

    // Notifications endpoints
    if (path[0] === 'api' && path[1] === 'notifications') {
      if (req.method === 'GET' && path[2]) {
        console.log(`[API] GET /api/notifications/${path[2]} - Fetching notifications for user:`, path[2]);
        const notifications = await getNotifications(path[2]);
        console.log(`[API] Returning ${Array.isArray(notifications) ? notifications.length : 'unknown'} notifications`);
        return new Response(JSON.stringify(notifications), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (req.method === 'POST') {
        const body = await req.json();
        console.log('[API] POST /api/notifications - Creating notification:', {
          type: body.type,
          title: body.title,
          targetAudience: body.targetAudience
        });
        const broadcaster = { broadcastToUsers };
        const notification = await createNotification(body, broadcaster);
        console.log('[API] Notification created successfully:', notification);
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
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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
        const result = await updateSecuritySetting(body.setting, body.value);
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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

        // Send to all connected users
        const allUserIds = Array.from(connectedUsers.keys());
        console.log(`🧪 Test notification - targeting users: ${allUserIds.join(', ')}`);
        
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