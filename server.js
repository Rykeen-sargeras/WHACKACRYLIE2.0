"use strict";

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const HOST = "0.0.0.0";
const PORT = Number.parseInt(process.env.PORT || "3000", 10);
const PUBLIC_DIR = path.join(__dirname, "public");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".wav": "audio/wav",
  ".mp3": "audio/mpeg"
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

function safePublicPath(requestPath) {
  const decoded = decodeURIComponent(requestPath.split("?")[0]);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const relative = normalized === "/" ? "index.html" : normalized.replace(/^[/\\]+/, "");
  const absolute = path.join(PUBLIC_DIR, relative);

  if (!absolute.startsWith(PUBLIC_DIR)) {
    return null;
  }

  return absolute;
}

const server = http.createServer((request, response) => {
  if (request.url === "/health" || request.url?.startsWith("/health?")) {
    sendJson(response, 200, {
      ok: true,
      app: "whackacrylie",
      uptimeSeconds: Math.floor(process.uptime())
    });
    return;
  }

  const filePath = safePublicPath(request.url || "/");
  if (!filePath) {
    sendJson(response, 400, { ok: false, error: "Invalid path" });
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    let resolvedPath = filePath;

    if (!statError && stats.isDirectory()) {
      resolvedPath = path.join(filePath, "index.html");
    }

    fs.readFile(resolvedPath, (readError, data) => {
      if (readError) {
        // SPA fallback for browser routes.
        fs.readFile(path.join(PUBLIC_DIR, "index.html"), (fallbackError, fallbackData) => {
          if (fallbackError) {
            sendJson(response, 404, { ok: false, error: "Not found" });
            return;
          }

          response.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-cache"
          });
          response.end(fallbackData);
        });
        return;
      }

      const extension = path.extname(resolvedPath).toLowerCase();
      response.writeHead(200, {
        "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
        "Cache-Control": extension === ".html"
          ? "no-cache"
          : "public, max-age=3600"
      });
      response.end(data);
    });
  });
});

server.listen(PORT, HOST, () => {
  console.log(`WhackACrylie listening on http://${HOST}:${PORT}`);
});

function shutdown(signal) {
  console.log(`${signal} received; shutting down.`);
  server.close(() => process.exit(0));

  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
