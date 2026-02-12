import process from "node:process";
import type { Readable, Writable } from "node:stream";
import type { JSONRPCMessage, MessageExtraInfo } from "@modelcontextprotocol/sdk/types.js";
import { JSONRPCMessageSchema } from "@modelcontextprotocol/sdk/types.js";
import type { Transport, TransportSendOptions } from "@modelcontextprotocol/sdk/shared/transport.js";

type FramingMode = "auto" | "content-length" | "line";

export class CompatibleStdioServerTransport implements Transport {
  private started = false;
  private buffer: Buffer | undefined;
  private mode: FramingMode = "auto";

  onclose?: () => void;
  onerror?: (error: Error) => void;
  onmessage?: <T extends JSONRPCMessage>(message: T, extra?: MessageExtraInfo) => void;
  sessionId?: string;
  setProtocolVersion?: (version: string) => void;

  constructor(
    private readonly stdin: Readable = process.stdin,
    private readonly stdout: Writable = process.stdout
  ) {}

  async start(): Promise<void> {
    if (this.started) {
      throw new Error(
        "CompatibleStdioServerTransport already started. connect() calls start() automatically."
      );
    }
    this.started = true;
    this.stdin.on("data", this.onData);
    this.stdin.on("error", this.onError);
  }

  async send(message: JSONRPCMessage, _options?: TransportSendOptions): Promise<void> {
    const json = JSON.stringify(message);
    const payload = this.mode === "line"
      ? `${json}\n`
      : `Content-Length: ${Buffer.byteLength(json, "utf8")}\r\n\r\n${json}`;

    await new Promise<void>((resolve) => {
      if (this.stdout.write(payload)) {
        resolve();
      } else {
        this.stdout.once("drain", resolve);
      }
    });
  }

  async close(): Promise<void> {
    this.stdin.off("data", this.onData);
    this.stdin.off("error", this.onError);

    if (this.stdin.listenerCount("data") === 0) {
      this.stdin.pause();
    }

    this.buffer = undefined;
    this.onclose?.();
  }

  private readonly onData = (chunk: Buffer | string): void => {
    const input = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    this.buffer = this.buffer ? Buffer.concat([this.buffer, input]) : input;
    this.processBuffer();
  };

  private readonly onError = (error: Error): void => {
    this.onerror?.(error);
  };

  private processBuffer(): void {
    while (true) {
      try {
        const message = this.tryReadMessage();
        if (!message) {
          break;
        }
        this.onmessage?.(message);
      } catch (error) {
        this.onerror?.(error as Error);
      }
    }
  }

  private tryReadMessage(): JSONRPCMessage | null {
    this.stripLeadingBlankLines();
    if (!this.buffer || this.buffer.length === 0) {
      return null;
    }

    if (this.mode === "content-length" || (this.mode === "auto" && this.looksLikeContentLength())) {
      const contentLengthMessage = this.tryReadContentLengthMessage();
      if (contentLengthMessage) {
        if (this.mode === "auto") this.mode = "content-length";
        return contentLengthMessage;
      }
      return null;
    }

    const lineMessage = this.tryReadLineMessage();
    if (lineMessage) {
      if (this.mode === "auto") this.mode = "line";
      return lineMessage;
    }

    if (this.mode === "auto") {
      const contentLengthMessage = this.tryReadContentLengthMessage();
      if (contentLengthMessage) {
        this.mode = "content-length";
        return contentLengthMessage;
      }
    }

    return null;
  }

  private tryReadLineMessage(): JSONRPCMessage | null {
    if (!this.buffer) return null;

    const newlineIndex = this.buffer.indexOf("\n");
    if (newlineIndex === -1) {
      return null;
    }

    const line = this.buffer.toString("utf8", 0, newlineIndex).replace(/\r$/, "");
    this.buffer = this.buffer.length > newlineIndex + 1 ? this.buffer.subarray(newlineIndex + 1) : undefined;

    if (line.trim() === "") {
      return null;
    }

    return JSONRPCMessageSchema.parse(JSON.parse(line));
  }

  private tryReadContentLengthMessage(): JSONRPCMessage | null {
    if (!this.buffer) return null;

    const headerBreakCRLF = this.buffer.indexOf("\r\n\r\n");
    const headerBreakLF = this.buffer.indexOf("\n\n");

    let headerEnd = -1;
    let delimiterLength = 0;
    if (headerBreakCRLF !== -1 && (headerBreakLF === -1 || headerBreakCRLF < headerBreakLF)) {
      headerEnd = headerBreakCRLF;
      delimiterLength = 4;
    } else if (headerBreakLF !== -1) {
      headerEnd = headerBreakLF;
      delimiterLength = 2;
    }

    if (headerEnd === -1) {
      return null;
    }

    const headers = this.buffer.toString("utf8", 0, headerEnd);
    const contentLengthMatch = headers.match(/(?:^|\r?\n)Content-Length:\s*(\d+)\s*(?:\r?\n|$)/i);
    if (!contentLengthMatch) {
      if (this.mode === "content-length") {
        throw new Error("Invalid stdio message: missing Content-Length header");
      }
      return null;
    }

    const contentLength = Number.parseInt(contentLengthMatch[1], 10);
    const bodyStart = headerEnd + delimiterLength;
    const bodyEnd = bodyStart + contentLength;
    if (this.buffer.length < bodyEnd) {
      return null;
    }

    const body = this.buffer.toString("utf8", bodyStart, bodyEnd);
    this.buffer = this.buffer.length > bodyEnd ? this.buffer.subarray(bodyEnd) : undefined;
    return JSONRPCMessageSchema.parse(JSON.parse(body));
  }

  private looksLikeContentLength(): boolean {
    if (!this.buffer || this.buffer.length === 0) return false;
    const probe = this.buffer.toString("utf8", 0, Math.min(this.buffer.length, 16)).toLowerCase();
    return probe.startsWith("content-length:") || "content-length:".startsWith(probe);
  }

  private stripLeadingBlankLines(): void {
    while (this.buffer && this.buffer.length > 0) {
      const first = this.buffer[0];
      if (first !== 0x0a && first !== 0x0d) {
        break;
      }
      this.buffer = this.buffer.length > 1 ? this.buffer.subarray(1) : undefined;
    }
  }
}
