import { serve } from "https://deno.land/std@0.204.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.204.0/http/file_server.ts";

const PORT = 5173;

async function handler(request: Request): Promise<Response> {
  const pathname = new URL(request.url).pathname;
  
  if (pathname.startsWith("/src/")) {
    return serveDir(request, {
      fsRoot: ".",
    });
  }
  
  if (pathname.startsWith("/public/")) {
    return serveDir(request, {
      fsRoot: ".",
    });
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

console.log(`🚀 Briconomy PWA Server running on http://localhost:${PORT}/`);
console.log(`📱 Mobile-optimized property management system`);
console.log(`⚡ Low bandwidth optimization enabled`);
console.log(`🔧 Chart.js data visualization ready`);

await serve(handler, { port: PORT });