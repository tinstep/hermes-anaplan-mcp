#!/usr/bin/env node

import { createServer } from "./server.js";
import { CompatibleStdioServerTransport } from "./transport/compatibleStdio.js";

async function main() {
  const server = createServer();
  const transport = new CompatibleStdioServerTransport();
  await server.connect(transport);
  console.error("Anaplan MCP server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error.message);
  process.exit(1);
});

// v1.0.0-ls21 - LS x CC
