#!/usr/bin/env node

import { randomUUID } from "node:crypto";
import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import { createServer } from "./server.js";

const PORT = parseInt(process.env.PORT || process.env.MCP_PORT || "3000", 10);

const transports: Record<string, StreamableHTTPServerTransport> = {};

const app = express();

// Log ALL requests
app.use((req, _res, next) => {
  console.error(`[${new Date().toISOString()}] ${req.method} ${req.path} accept=${req.headers["accept"] ?? "none"} origin=${req.headers["origin"] ?? "none"} session=${req.headers["mcp-session-id"] ?? "none"}`);
  next();
});

app.use(express.json());

// CORS + anti-buffering on all MCP paths
function mcpCors(req: express.Request, res: express.Response, next: express.NextFunction) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization, mcp-session-id, mcp-protocol-version, Last-Event-ID");
  res.setHeader("Access-Control-Expose-Headers", "mcp-session-id, mcp-protocol-version");
  res.setHeader("X-Accel-Buffering", "no");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
}

app.use("/mcp", mcpCors);
app.use("/", (req, res, next) => {
  // Only apply CORS to root if it looks like an MCP request (not /health etc)
  if (req.path === "/" || req.path === "") {
    return mcpCors(req, res, next);
  }
  next();
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// MCP POST handler
async function handlePost(req: express.Request, res: express.Response) {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  try {
    let transport: StreamableHTTPServerTransport;

    if (sessionId && transports[sessionId]) {
      transport = transports[sessionId];
    } else if (!sessionId && isInitializeRequest(req.body)) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        enableJsonResponse: true,
        onsessioninitialized: (sid) => {
          console.error(`[${new Date().toISOString()}] Session initialized: ${sid}`);
          transports[sid] = transport;
        },
      });
      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid) {
          console.error(`[${new Date().toISOString()}] Session closed: ${sid}`);
          delete transports[sid];
        }
      };
      const mcpServer = createServer();
      await mcpServer.connect(transport);
      await transport.handleRequest(req, res, req.body);
      return;
    } else {
      res.status(400).json({
        jsonrpc: "2.0",
        error: { code: -32000, message: "Bad Request: no valid session" },
        id: null,
      });
      return;
    }
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("Error handling POST:", err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
}

// MCP GET handler
async function handleGet(req: express.Request, res: express.Response) {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send("Invalid or missing session ID");
    return;
  }
  await transports[sessionId].handleRequest(req, res);
}

// MCP DELETE handler
async function handleDelete(req: express.Request, res: express.Response) {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    res.status(400).send("Invalid or missing session ID");
    return;
  }
  await transports[sessionId].handleRequest(req, res);
}

// Register on both /mcp and /
app.post("/mcp", handlePost);
app.get("/mcp", handleGet);
app.delete("/mcp", handleDelete);
app.post("/", handlePost);
app.get("/", handleGet);
app.delete("/", handleDelete);

app.listen(PORT, "0.0.0.0", () => {
  console.error(`Anaplan MCP server running on http://0.0.0.0:${PORT}`);
});
