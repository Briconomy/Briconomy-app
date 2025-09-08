
import { serveDir, serveFile } from "https://deno.land/std@0.204.0/http/file_server.ts";
import { existsSync } from "https://deno.land/std@0.204.0/fs/exists.ts";
import { dirname, fromFileUrl } from "https://deno.land/std@0.204.0/path/mod.ts";
import { serve } from "https://deno.land/std@0.204.0/http/server.ts";

const PORT = 5173;
const __dirname = dirname(fromFileUrl(import.meta.url));

async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // --- Logic for handling icons ---
  if (pathname.match(/^\/icon-\d+x\d+\.png$/)) {
    const filePath = `public${pathname}`;
    if (existsSync(filePath)) {
      return serveFile(request, filePath);
    } else {
      const genericIconPath = `public/icon.png`;
      if (existsSync(genericIconPath)) {
        console.warn(`[404] Specific icon not found: ${pathname}. Serving generic icon.`);
        return serveFile(request, genericIconPath);
      } else {
        console.error(`[404] Neither specific nor generic icon found for ${pathname}.`);
        return new Response("Not Found", {
          status: 404,
          headers: { "Content-Type": "text/plain" },
        });
      }
    }
  }

  // All other logic from the previous correct version remains the same.
  // 1. Serve PWA source files with special content-type
  if (pathname.startsWith("/src/")) {
    const filePath = `.${pathname}`;
    if (existsSync(filePath)) {
      const response = await serveDir(request, {
        fsRoot: ".",
      });
      if (pathname.endsWith(".tsx") || pathname.endsWith(".ts")) {
        return new Response(response.body, {
          status: response.status,
          headers: {
            ...Object.fromEntries(response.headers),
            "content-type": "application/javascript",
          },
        });
      }
      return response;
    }
  }

  // 2. Serve static files from the public directory
  if (pathname.startsWith("/public/")) {
    return serveDir(request, {
      fsRoot: ".",
    });
  }

  // 3. SPA Fallback: Serve index.html for root and client-side routes
  const hasExtension = pathname.includes(".");
  if (pathname === "/" || !hasExtension) {
    try {
      const indexFile = await Deno.readTextFile("./public/index.html");
      return new Response(indexFile, {
        headers: { "content-type": "text/html" },
      });
    } catch {
      return new Response("Server Error: index.html not found.", { status: 500 });
    }
  }

  // 4. Final attempt: Serve any other static files from the public directory
  const response = await serveDir(request, {
    fsRoot: "./public",
  });

  // 5. Correctly handle the 404 response if the file is not found
  if (response.status === 404) {
    return new Response("Not Found", {
      status: 404,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return response;
}

console.log(`🚀 Briconomy PWA Server running on http://localhost:${PORT}/`);
console.log(`📱 Mobile-optimized property management system`);
console.log(`⚡ Low bandwidth optimization enabled`);
console.log(`🔧 Chart.js data visualization ready`);

await serve(handler, { port: PORT, hostname: "0.0.0.0" });