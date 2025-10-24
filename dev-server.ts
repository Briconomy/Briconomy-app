import { serve } from "@std/http/server";
import { serveDir } from "@std/http/file_server";
import * as esbuild from "esbuild";
import { registerUser, loginUser } from "./api.ts";

const PORT = 5173;
const transformCache = new Map<string, { mtimeMs: number | null; code: string }>();

function disableCache(response: Response): Response {
  response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

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
    .replace(/from\s+["']chart\.js["']/g, 'from "https://esm.sh/chart.js@4.4.7"')
  .replace(/from\s+["']react-chartjs-2["']/g, 'from "https://esm.sh/react-chartjs-2@5.2.0?deps=react@18.2.0,chart.js@4.4.7&dev"')
  .replace(/from\s+["']@react-oauth\/google["']/g, 'from "https://esm.sh/@react-oauth/google@0.12.2?deps=react@18.2.0&dev"')
  .replace(/import\s+['"](\.\/.*\.css)['"];?/g, '// CSS import removed: $1');
    
  return transpiledCode;
}

async function getTranspiledModule(filePath: string): Promise<string> {
  const stat = await Deno.stat(filePath);
  const mtimeMs = stat.mtime ? stat.mtime.getTime() : null;
  const cached = transformCache.get(filePath);
  if (cached && cached.mtimeMs === mtimeMs) {
    return cached.code;
  }
  const source = await Deno.readTextFile(filePath);
  const transpiled = await transpileTypeScript(source, filePath);
  transformCache.set(filePath, { mtimeMs, code: transpiled });
  return transpiled;
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
      } catch (_error) {
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
      } catch (_error) {
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
      const transpiledCode = await getTranspiledModule(filePath);
      
        const response = new Response(transpiledCode, {
          headers: { 
            "content-type": "application/javascript"
          }
        });
        return disableCache(response);
    } catch (error) {
      console.error(`Error transpiling ${pathname}:`, error);
      return new Response(`console.error('Failed to load ${pathname}');`, {
        status: 500,
        headers: { "content-type": "application/javascript" },
      });
    }
  }

  if (pathname.startsWith("/src/") && !pathname.includes(".") ) {
    const tsxPath = `.${pathname}.tsx`;
    const tsPath = `.${pathname}.ts`;
    try {
      const transpiledCode = await getTranspiledModule(tsxPath);
        const response = new Response(transpiledCode, {
          headers: {
            "content-type": "application/javascript"
          }
        });
        return disableCache(response);
    } catch (_) {
      try {
        const transpiledCode = await getTranspiledModule(tsPath);
          const response = new Response(transpiledCode, {
            headers: {
              "content-type": "application/javascript"
            }
          });
          return disableCache(response);
      } catch (__) {
        return new Response("console.error('Module not found')", {
          status: 404,
          headers: { "content-type": "application/javascript" },
        });
      }
    }
  }
  
  if (pathname.startsWith("/src/") && pathname.endsWith(".css")) {
    try {
      const filePath = `.${pathname}`;
      const css = await Deno.readTextFile(filePath);
      
        const response = new Response(css, {
          headers: { 
            "content-type": "text/css"
          }
        });
        return disableCache(response);
    } catch (error) {
      console.error(`Error loading CSS ${pathname}:`, error);
      return new Response(`/* Failed to load CSS */`, {
        status: 500,
        headers: { "content-type": "text/css" },
      });
    }
  }
  
  if (pathname.startsWith("/src/") && !pathname.endsWith(".tsx") && !pathname.endsWith(".ts") && !pathname.endsWith(".css")) {
      const response = await serveDir(request, {
        fsRoot: ".",
      });
      return disableCache(response);
  }
  
  if (pathname.startsWith("/public/")) {
      const response = await serveDir(request, {
        fsRoot: ".",
      });
      return disableCache(response);
  }
  
  if (pathname === "/favicon.ico" || pathname.startsWith("/icon-") || pathname === "/manifest.json") {
    try {
        const response = await serveDir(request, { fsRoot: "./public" });
        return disableCache(response);
    } catch {
      return new Response(null, { status: 404 });
    }
  }

  if (pathname === "/apple-touch-icon.png") {
    try {
      const file = await Deno.readFile("./public/apple-touch-icon.png");
        const response = new Response(file, { headers: { "content-type": "image/png" } });
        return disableCache(response);
    } catch {
      try {
        const fallback = await Deno.readFile("./public/icon-192x192.png");
          const response = new Response(fallback, { headers: { "content-type": "image/png" } });
          return disableCache(response);
      } catch {
          const response = new Response(null, { status: 404 });
          return disableCache(response);
      }
    }
  }
  
  if (pathname === "/" || (!pathname.includes(".") && !pathname.startsWith("/api"))) {
    let indexFile = await Deno.readTextFile("./public/index.html");

    // Build env script for client-side access to VITE variables
    const envVars = {
      VITE_GOOGLE_CLIENT_ID: Deno.env.get('VITE_GOOGLE_CLIENT_ID') || '',
      VITE_GOOGLE_MAPS_API_KEY: Deno.env.get('VITE_GOOGLE_MAPS_API_KEY') || ''
    };
    const envScript = `const __BRICONOMY_ENV__ = ${JSON.stringify(envVars)};`;

    // Inject Google Identity Services script if Google Client ID is available
    const googleClientId = envVars.VITE_GOOGLE_CLIENT_ID;
    let googleScript = '';
    if (googleClientId) {
      googleScript = `    <script src="https://accounts.google.com/gsi/client" async defer></script>`;
    }

    indexFile = indexFile.replace(
      '<div id="root"></div>',
      `<div id="root"></div>\n    <script>\n${envScript}\n    </script>\n${googleScript}`
    );

      const response = new Response(indexFile, {
        headers: { "content-type": "text/html" },
      });
      return disableCache(response);
  }
  
    const response = await serveDir(request, {
      fsRoot: "./public",
    });
    return disableCache(response);
}

console.log(`Briconomy Development Server running on http://localhost:${PORT}/`);
console.log(`Mobile-optimized property management system`);
console.log(`TypeScript transpilation enabled`);
console.log(`Chart.js data visualization ready`);

await serve(handler, { port: PORT, hostname: "0.0.0.0" });

esbuild.stop();