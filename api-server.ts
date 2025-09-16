import { serve } from "https://deno.land/std@0.204.0/http/server.ts";
import {
  getProperties,
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
  getDashboardStats,
  loginUser,
  registerUser
} from "./api-services.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
};

serve(async (req) => {
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
        const result = await loginUser(data.email, data.password);
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
      }
    }

    // Properties endpoints
    if (path[0] === 'api' && path[1] === 'properties') {
      if (req.method === 'GET') {
        const properties = await getProperties();
        return new Response(JSON.stringify(properties), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
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
        const stats = await getDashboardStats();
        return new Response(JSON.stringify(stats), {
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
        const notification = await createNotification(body);
        return new Response(JSON.stringify(notification), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 201
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