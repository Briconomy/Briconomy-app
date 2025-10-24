
import { serveDir, serveFile } from "@std/http/file_server";
import { existsSync } from "@std/fs/exists";
import { dirname, fromFileUrl } from "@std/path";
import { serve } from "@std/http/server";

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
      let indexFile = await Deno.readTextFile("./public/index.html");
      const envVars = {
        VITE_GOOGLE_CLIENT_ID: Deno.env.get('VITE_GOOGLE_CLIENT_ID') || '',
        VITE_GOOGLE_MAPS_API_KEY: Deno.env.get('VITE_GOOGLE_MAPS_API_KEY') || ''
      };
      const envScript = `const __BRICONOMY_ENV__ = ${JSON.stringify(envVars)};`;
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

console.log(`Briconomy PWA Server running on http://localhost:${PORT}/`);
console.log(`Mobile-optimized property management system`);
console.log(`Low bandwidth optimization enabled`);
console.log(`Chart.js data visualization ready`);

await serve(handler, { port: PORT, hostname: "0.0.0.0" });