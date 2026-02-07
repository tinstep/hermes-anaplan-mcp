#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createServer } from "./server.js";

async function main() {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Anaplan MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error.message);
  process.exit(1);
});

// v0.1.0-ls21 — LS × CC
