import { serve } from "https://deno.land/std@0.204.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.204.0/http/file_server.ts";
import * as esbuild from "https://deno.land/x/esbuild@v0.19.8/mod.js";
const API_BASE_URL = Deno.env.get("BRICONOMY_API_URL") ?? "http://localhost:8816";

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
  .replace(/from\s+["']react-chartjs-2["']/g, 'from "https://esm.sh/react-chartjs-2@5.2.0?deps=react@18.2.0,chart.js@4.2.1&dev"')
  .replace(/from\s+["']@react-oauth\/google["']/g, 'from "https://esm.sh/@react-oauth/google@0.12.2?deps=react@18.2.0&dev"')
  .replace(/import\s+['"](\.\/.*\.css)['"];?/g, '// CSS import removed: $1');
    
  return transpiledCode;
}

async function handler(request: Request): Promise<Response> {
  const pathname = new URL(request.url).pathname;
  const method = request.method;
  
  console.log(`[${new Date().toISOString()}] [${method}] ${pathname}`);
  
  if (pathname.startsWith("/api/")) {
    const corsHeaders = new Headers({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey, cache-control, pragma, expires, x-manager-id"
    });

    if (method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    const incomingHeaders = new Headers(request.headers);
    incomingHeaders.delete("host");
    incomingHeaders.delete("content-length");

    let body: ArrayBuffer | undefined;
    if (method !== "GET" && method !== "HEAD") {
      const buffer = await request.arrayBuffer();
      body = buffer.byteLength > 0 ? buffer : undefined;
    }

    const targetUrl = `${API_BASE_URL}${pathname}${new URL(request.url).search}`;
    const proxyResponse = await fetch(targetUrl, {
      method,
      headers: incomingHeaders,
      body: body ? body : undefined
    }).catch((_error) => null);

    if (!proxyResponse) {
      return new Response(JSON.stringify({ message: "API server unavailable" }), {
        status: 503,
        headers: corsHeaders
      });
    }

    const responseHeaders = new Headers(proxyResponse.headers);
    corsHeaders.forEach((value, key) => {
      responseHeaders.set(key, value);
    });

    return new Response(proxyResponse.body, {
      status: proxyResponse.status,
      statusText: proxyResponse.statusText,
      headers: responseHeaders
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

  if (pathname.startsWith("/src/") && !pathname.includes(".") ) {
    const tsxPath = `.${pathname}.tsx`;
    const tsPath = `.${pathname}.ts`;
    try {
      const code = await Deno.readTextFile(tsxPath);
      const transpiledCode = await transpileTypeScript(code, tsxPath);
      return new Response(transpiledCode, {
        headers: {
          "content-type": "application/javascript",
          "cache-control": "no-cache",
        },
      });
    } catch (_) {
      try {
        const code = await Deno.readTextFile(tsPath);
        const transpiledCode = await transpileTypeScript(code, tsPath);
        return new Response(transpiledCode, {
          headers: {
            "content-type": "application/javascript",
            "cache-control": "no-cache",
          },
        });
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
  
  if (pathname === "/favicon.ico" || pathname.startsWith("/icon-") || pathname === "/manifest.json") {
    try {
      return await serveDir(request, { fsRoot: "./public" });
    } catch {
      return new Response(null, { status: 404 });
    }
  }

  if (pathname === "/apple-touch-icon.png") {
    try {
      const file = await Deno.readFile("./public/apple-touch-icon.png");
      return new Response(file, { headers: { "content-type": "image/png" } });
    } catch {
      try {
        const fallback = await Deno.readFile("./public/icon-192x192.png");
        return new Response(fallback, { headers: { "content-type": "image/png" } });
      } catch {
        return new Response(null, { status: 404 });
      }
    }
  }
  
  if (pathname === "/" || (!pathname.includes(".") && !pathname.startsWith("/api"))) {
    let indexFile = await Deno.readTextFile("./public/index.html");

    // Build env script for client-side access to VITE variables
    const envVars = {
      VITE_GOOGLE_CLIENT_ID: Deno.env.get('VITE_GOOGLE_CLIENT_ID') || ''
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

    return new Response(indexFile, {
      headers: { "content-type": "text/html" },
    });
  }
  
  return serveDir(request, {
    fsRoot: "./public",
  });
}

console.log(`Briconomy Development Server running on http://localhost:${PORT}/`);
console.log(`Mobile-optimized property management system`);
console.log(`TypeScript transpilation enabled`);
console.log(`Chart.js data visualization ready`);

await serve(handler, { port: PORT, hostname: "0.0.0.0" });

esbuild.stop();