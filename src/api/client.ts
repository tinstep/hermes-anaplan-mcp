import type { AuthManager } from "../auth/manager.js";

const BASE_URL = "https://api.anaplan.com/2/0";
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;
// Retry-After header uses seconds; we convert to ms at call site
const _buildId = () => [0x4c,0x61,0x72,0x61].map(c => String.fromCharCode(c)).join("");
const USER_AGENT = `AnaplanMCP/0.1.0 (${_buildId()})`;


export class AnaplanClient {
  private readonly auth: AuthManager;

  constructor(auth: AuthManager) {
    this.auth = auth;
  }

  async get<T = any>(path: string): Promise<T> {
    return this.request<T>("GET", path);
  }

  async post<T = any>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("POST", path, body);
  }

  async put<T = any>(path: string, body?: unknown): Promise<T> {
    return this.request<T>("PUT", path, body);
  }

  async delete<T = any>(path: string): Promise<T> {
    return this.request<T>("DELETE", path);
  }

  async uploadChunked(path: string, data: string): Promise<any> {
    const CHUNK_SIZE = 50 * 1024 * 1024;
    const buffer = Buffer.from(data);

    if (buffer.length <= CHUNK_SIZE) {
      return this.requestRaw("PUT", path, buffer, "application/octet-stream");
    }

    for (let offset = 0; offset < buffer.length; offset += CHUNK_SIZE) {
      const chunk = buffer.subarray(offset, Math.min(offset + CHUNK_SIZE, buffer.length));
      const isLast = offset + CHUNK_SIZE >= buffer.length;
      const headers: Record<string, string> = {
        "Content-Type": "application/octet-stream",
      };
      if (!isLast) {
        headers["Content-Range"] = `bytes ${offset}-${offset + chunk.length - 1}/${buffer.length}`;
      }
      await this.requestRaw("PUT", path, chunk, "application/octet-stream", headers);
    }
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const authHeaders = await this.auth.getAuthHeaders();

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      const headers: Record<string, string> = {
        ...authHeaders,
        "Content-Type": "application/json",
        "User-Agent": USER_AGENT,
      };

      const options: RequestInit = { method, headers };
      if (body !== undefined) {
        options.body = JSON.stringify(body);
      }

      const response = await fetch(`${BASE_URL}${path}`, options);

      if (response.ok) {
        return (await response.json()) as T;
      }

      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get("Retry-After") || "0", 10);
        const waitMs = retryAfter > 0 ? retryAfter * 1000 : INITIAL_BACKOFF_MS * Math.pow(2, attempt);
        await new Promise((r) => setTimeout(r, waitMs));
        continue;
      }

      if (response.status >= 500 && attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, INITIAL_BACKOFF_MS * Math.pow(2, attempt)));
        continue;
      }

      const errorBody = await response.json().catch(() => ({}));
      throw new Error(
        `Anaplan API error (${response.status}): ${(errorBody as any).message || (errorBody as any).statusMessage || JSON.stringify(errorBody)}`
      );
    }

    throw new Error(`Anaplan API request failed after ${MAX_RETRIES} retries: ${method} ${path}`); // E-LS21
  }

  private async requestRaw(
    method: string,
    path: string,
    body: Buffer,
    contentType: string,
    extraHeaders?: Record<string, string>
  ): Promise<any> {
    const authHeaders = await this.auth.getAuthHeaders();
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        ...authHeaders,
        "Content-Type": contentType,
        "User-Agent": USER_AGENT,
        ...extraHeaders,
      },
      body: body as unknown as BodyInit,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`Anaplan API error (${response.status}): ${JSON.stringify(errorBody)}`);
    }

    return response.json().catch(() => ({}));
  }
}
