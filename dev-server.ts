import { serve } from "https://deno.land/std@0.204.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.204.0/http/file_server.ts";
import * as esbuild from "https://deno.land/x/esbuild@v0.19.8/mod.js";
import { registerUser, loginUser } from "./api.ts";

const PORT = 5173;

async function transpileTypeScript(code: string, filename: string): Promise<string> {
  const result = await esbuild.transform(code, {
    loader: filename.endsWith(".tsx") ? "tsx" : "ts",
    format: "esm",
    target: "es2020",
    jsx: "automatic",
    jsxImportSource: "https://esm.sh/react@18.2.0",
  });
  
  let transpiledCode = result.code;
  
  transpiledCode = transpiledCode
    .replace(/from\s+["']react["']/g, 'from "https://esm.sh/react@18.2.0?dev"')
    .replace(/from\s+["']react-dom["']/g, 'from "https://esm.sh/react-dom@18.2.0?dev"')
    .replace(/from\s+["']react-dom\/client["']/g, 'from "https://esm.sh/react-dom@18.2.0/client?dev"')
    .replace(/from\s+["']react-router-dom["']/g, 'from "https://esm.sh/react-router-dom@6.8.1?deps=react@18.2.0,react-dom@18.2.0&dev"')
    .replace(/from\s+["']chart\.js["']/g, 'from "https://esm.sh/chart.js@4.2.1"')
    .replace(/from\s+["']react-chartjs-2["']/g, 'from "https://esm.sh/react-chartjs-2@5.2.0?deps=react@18.2.0,chart.js@4.2.1&dev"');
    
  return transpiledCode;
}

async function handler(request: Request): Promise<Response> {
  const pathname = new URL(request.url).pathname;
  const method = request.method;
  
  console.log(`[${new Date().toISOString()}] [${method}] ${pathname}`);
  
  if (pathname.startsWith("/api/")) {
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    
    if (method === "OPTIONS") {
      return new Response(null, { status: 200, headers });
    }
    
    if (pathname === "/api/register" && method === "POST") {
      try {
        const body = await request.json();
        const result = await registerUser(body);
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 400, 
          headers 
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: "Invalid request data" 
        }), { status: 400, headers });
      }
    }
    
    if (pathname === "/api/login" && method === "POST") {
      try {
        const body = await request.json();
        const result = await loginUser(body.email, body.password);
        return new Response(JSON.stringify(result), { 
          status: result.success ? 200 : 401, 
          headers 
        });
      } catch (error) {
        return new Response(JSON.stringify({ 
          success: false, 
          message: "Invalid request data" 
        }), { status: 400, headers });
      }
    }
    
    return new Response(JSON.stringify({ message: "API endpoint not found" }), { 
      status: 404, 
      headers 
    });
  }
  
  if (pathname.startsWith("/src/") && (pathname.endsWith(".tsx") || pathname.endsWith(".ts"))) {
    try {
      const filePath = `.${pathname}`;
      const code = await Deno.readTextFile(filePath);
      const transpiledCode = await transpileTypeScript(code, filePath);
      
      return new Response(transpiledCode, {
        headers: { 
          "content-type": "application/javascript",
          "cache-control": "no-cache"
        },
      });
    } catch (error) {
      console.error(`Error transpiling ${pathname}:`, error);
      return new Response(`console.error('Failed to load ${pathname}');`, {
        status: 500,
        headers: { "content-type": "application/javascript" },
      });
    }
  }
  
  if (pathname.startsWith("/src/") && pathname.endsWith(".css")) {
    try {
      const filePath = `.${pathname}`;
      const css = await Deno.readTextFile(filePath);
      
      return new Response(css, {
        headers: { 
          "content-type": "text/css",
          "cache-control": "no-cache"
        },
      });
    } catch (error) {
      console.error(`Error loading CSS ${pathname}:`, error);
      return new Response(`/* Failed to load CSS */`, {
        status: 500,
        headers: { "content-type": "text/css" },
      });
    }
  }
  
  if (pathname.startsWith("/src/") && !pathname.endsWith(".tsx") && !pathname.endsWith(".ts") && !pathname.endsWith(".css")) {
    return serveDir(request, {
      fsRoot: ".",
    });
  }
  
  if (pathname.startsWith("/public/")) {
    return serveDir(request, {
      fsRoot: ".",
    });
  }
  
  if (pathname === "/favicon.ico" || pathname === "/apple-touch-icon.png" || 
      pathname.startsWith("/icon-") || pathname === "/manifest.json") {
    try {
      return await serveDir(request, { fsRoot: "./public" });
    } catch {
      return new Response(null, { status: 404 });
    }
  }
  
  if (pathname === "/" || (!pathname.includes(".") && !pathname.startsWith("/api"))) {
    const indexFile = await Deno.readTextFile("./public/index.html");
    return new Response(indexFile, {
      headers: { "content-type": "text/html" },
    });
  }
  
  return serveDir(request, {
    fsRoot: "./public",
  });
}

console.log(`🚀 Briconomy Development Server running on http://localhost:${PORT}/`);
console.log(`📱 Mobile-optimized property management system`);
console.log(`⚡ TypeScript transpilation enabled`);
console.log(`🔧 Chart.js data visualization ready`);

await serve(handler, { port: PORT });

esbuild.stop();