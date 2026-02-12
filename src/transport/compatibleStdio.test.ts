import { PassThrough } from "node:stream";
import { describe, expect, it } from "vitest";
import type { JSONRPCMessage } from "@modelcontextprotocol/sdk/types.js";
import { CompatibleStdioServerTransport } from "./compatibleStdio.js";

function encodeContentLength(message: JSONRPCMessage): string {
  const json = JSON.stringify(message);
  return `Content-Length: ${Buffer.byteLength(json, "utf8")}\r\n\r\n${json}`;
}

function waitTick(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

describe("CompatibleStdioServerTransport", () => {
  it("parses Content-Length framed messages and responds in Content-Length mode", async () => {
    const stdin = new PassThrough();
    const stdout = new PassThrough();
    const received: JSONRPCMessage[] = [];
    const outputChunks: Buffer[] = [];
    stdout.on("data", (chunk: Buffer | string) => {
      outputChunks.push(Buffer.from(chunk));
    });

    const transport = new CompatibleStdioServerTransport(stdin, stdout);
    transport.onmessage = (message) => {
      received.push(message);
    };

    await transport.start();
    const request: JSONRPCMessage = {
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
      params: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        clientInfo: { name: "test-client", version: "1.0.0" },
      },
    };

    stdin.write(encodeContentLength(request));
    await waitTick();

    expect(received).toHaveLength(1);
    await transport.send({
      jsonrpc: "2.0",
      id: 1,
      result: {
        protocolVersion: "2025-03-26",
        capabilities: {},
        serverInfo: { name: "anaplan-mcp", version: "1.0.0" },
      },
    });

    const output = Buffer.concat(outputChunks).toString("utf8");
    expect(output.startsWith("Content-Length:")).toBe(true);
    await transport.close();
  });

  it("parses line-delimited messages and responds in line mode", async () => {
    const stdin = new PassThrough();
    const stdout = new PassThrough();
    const received: JSONRPCMessage[] = [];
    const outputChunks: Buffer[] = [];
    stdout.on("data", (chunk: Buffer | string) => {
      outputChunks.push(Buffer.from(chunk));
    });

    const transport = new CompatibleStdioServerTransport(stdin, stdout);
    transport.onmessage = (message) => {
      received.push(message);
    };

    await transport.start();
    const request: JSONRPCMessage = {
      jsonrpc: "2.0",
      id: 2,
      method: "tools/list",
      params: {},
    };

    stdin.write(`${JSON.stringify(request)}\n`);
    await waitTick();

    expect(received).toHaveLength(1);
    await transport.send({
      jsonrpc: "2.0",
      id: 2,
      result: { tools: [] },
    });

    const output = Buffer.concat(outputChunks).toString("utf8");
    expect(output.startsWith("Content-Length:")).toBe(false);
    expect(output.endsWith("\n")).toBe(true);
    await transport.close();
  });
});
