# Anaplan MCP Server Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use super-workflow:executing-plans to implement this plan task-by-task.

**Goal:** Build a TypeScript MCP server that exposes Anaplan's Integration API v2 as MCP tools for model exploration and data operations.

**Architecture:** Three layers — auth (token lifecycle), api (typed HTTP wrappers around Anaplan REST endpoints), tools (MCP tool definitions that call the api layer). Single entry point connects McpServer to stdio transport.

**Tech Stack:** TypeScript, `@modelcontextprotocol/sdk`, `zod`, Node.js native `fetch` and `crypto`.

**Design doc:** `docs/plans/2026-02-06-anaplan-mcp-design.md`

---

## Task 1: Project scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `.gitignore`

**Step 1: Initialize git repo**

```bash
cd /Users/larasrinath/Projects/github-projects/anaplan-mcp
git init
```

**Step 2: Create package.json**

Create `package.json`:

```json
{
  "name": "anaplan-mcp",
  "version": "0.1.0",
  "description": "MCP server for Anaplan Integration API v2",
  "type": "module",
  "bin": {
    "anaplan-mcp": "dist/index.js"
  },
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "start": "node dist/index.js",
    "test": "vitest run",
    "test:watch": "vitest",
    "typecheck": "tsc --noEmit"
  },
  "keywords": ["mcp", "anaplan", "model-context-protocol"],
  "license": "MIT",
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**Step 3: Create tsconfig.json**

Create `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Node16",
    "moduleResolution": "Node16",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

**Step 4: Create .gitignore**

Create `.gitignore`:

```
node_modules/
dist/
*.tgz
.env
```

**Step 5: Install dependencies**

```bash
npm install @modelcontextprotocol/sdk zod
npm install -D typescript tsx vitest @types/node
```

**Step 6: Create src directory**

```bash
mkdir -p src/auth src/api src/tools
```

**Step 7: Commit**

```bash
git add package.json tsconfig.json .gitignore docs/
git commit -m "chore: project scaffolding with MCP SDK, zod, vitest"
```

---

## Task 2: Auth — Basic authentication

**Files:**
- Create: `src/auth/types.ts`
- Create: `src/auth/basic.ts`
- Create: `src/auth/basic.test.ts`

**Step 1: Create auth types**

Create `src/auth/types.ts`:

```typescript
export interface TokenInfo {
  tokenId: string;
  tokenValue: string;
  expiresAt: number;
  refreshTokenId: string;
}

export interface AuthResponse {
  meta: { validationUrl: string };
  status: string;
  statusMessage: string;
  tokenInfo: TokenInfo;
}

export interface AuthProvider {
  authenticate(): Promise<TokenInfo>;
  refresh(tokenValue: string): Promise<TokenInfo>;
}
```

**Step 2: Write the failing test**

Create `src/auth/basic.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BasicAuthProvider } from "./basic.js";

describe("BasicAuthProvider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("throws if username or password is missing", () => {
    expect(() => new BasicAuthProvider("", "pass")).toThrow("username");
    expect(() => new BasicAuthProvider("user", "")).toThrow("password");
  });

  it("sends POST to auth endpoint with basic auth header", async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        status: "SUCCESS",
        tokenInfo: {
          tokenId: "tid",
          tokenValue: "tval",
          expiresAt: Date.now() + 2100000,
          refreshTokenId: "rid",
        },
      }),
    };
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(mockResponse as Response);

    const provider = new BasicAuthProvider("user@co.com", "secret");
    const token = await provider.authenticate();

    expect(fetchSpy).toHaveBeenCalledWith(
      "https://auth.anaplan.com/token/authenticate",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: expect.stringContaining("Basic "),
        }),
      })
    );
    expect(token.tokenValue).toBe("tval");
  });

  it("throws on non-SUCCESS response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ status: "FAILURE", statusMessage: "Bad creds" }),
    } as Response);

    const provider = new BasicAuthProvider("user", "wrong");
    await expect(provider.authenticate()).rejects.toThrow("Bad creds");
  });

  it("refreshes token with AnaplanAuthToken header", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "SUCCESS",
        tokenInfo: {
          tokenId: "tid2",
          tokenValue: "refreshed",
          expiresAt: Date.now() + 2100000,
          refreshTokenId: "rid2",
        },
      }),
    } as Response);

    const provider = new BasicAuthProvider("user", "pass");
    const token = await provider.refresh("oldtoken");

    expect(fetch).toHaveBeenCalledWith(
      "https://auth.anaplan.com/token/refresh",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "AnaplanAuthToken oldtoken",
        }),
      })
    );
    expect(token.tokenValue).toBe("refreshed");
  });
});
```

**Step 3: Run test to verify it fails**

```bash
npx vitest run src/auth/basic.test.ts
```

Expected: FAIL — `BasicAuthProvider` not found.

**Step 4: Implement BasicAuthProvider**

Create `src/auth/basic.ts`:

```typescript
import type { AuthProvider, AuthResponse, TokenInfo } from "./types.js";

const AUTH_URL = "https://auth.anaplan.com/token/authenticate";
const REFRESH_URL = "https://auth.anaplan.com/token/refresh";

export class BasicAuthProvider implements AuthProvider {
  private readonly credentials: string;

  constructor(username: string, password: string) {
    if (!username) throw new Error("Anaplan username is required");
    if (!password) throw new Error("Anaplan password is required");
    this.credentials = Buffer.from(`${username}:${password}`).toString("base64");
  }

  async authenticate(): Promise<TokenInfo> {
    const response = await fetch(AUTH_URL, {
      method: "POST",
      headers: {
        Authorization: `Basic ${this.credentials}`,
      },
    });

    const data = (await response.json()) as AuthResponse;
    if (data.status !== "SUCCESS") {
      throw new Error(`Authentication failed: ${data.statusMessage}`);
    }
    return data.tokenInfo;
  }

  async refresh(tokenValue: string): Promise<TokenInfo> {
    const response = await fetch(REFRESH_URL, {
      method: "POST",
      headers: {
        Authorization: `AnaplanAuthToken ${tokenValue}`,
      },
    });

    const data = (await response.json()) as AuthResponse;
    if (data.status !== "SUCCESS") {
      throw new Error(`Token refresh failed: ${data.statusMessage}`);
    }
    return data.tokenInfo;
  }
}
```

**Step 5: Run tests to verify they pass**

```bash
npx vitest run src/auth/basic.test.ts
```

Expected: All 4 tests PASS.

**Step 6: Commit**

```bash
git add src/auth/types.ts src/auth/basic.ts src/auth/basic.test.ts
git commit -m "feat: basic authentication provider with token refresh"
```

---

## Task 3: Auth — Certificate authentication

**Files:**
- Create: `src/auth/certificate.ts`
- Create: `src/auth/certificate.test.ts`

**Step 1: Write the failing test**

Create `src/auth/certificate.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CertificateAuthProvider } from "./certificate.js";
import * as fs from "node:fs";
import * as crypto from "node:crypto";

vi.mock("node:fs");
vi.mock("node:crypto");

describe("CertificateAuthProvider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("throws if cert path or key path is missing", () => {
    expect(() => new CertificateAuthProvider("", "/key.pem")).toThrow("certificate");
    expect(() => new CertificateAuthProvider("/cert.pem", "")).toThrow("private key");
  });

  it("reads cert and key files and sends correct auth request", async () => {
    const fakeCert = "-----BEGIN CERTIFICATE-----\nFAKE\n-----END CERTIFICATE-----";
    const fakeKey = "-----BEGIN PRIVATE KEY-----\nFAKE\n-----END PRIVATE KEY-----";

    vi.mocked(fs.readFileSync).mockImplementation((path: any) => {
      if (String(path).includes("cert")) return fakeCert;
      return fakeKey;
    });

    const mockSign = { update: vi.fn(), end: vi.fn(), sign: vi.fn().mockReturnValue(Buffer.from("signed")) };
    vi.mocked(crypto.createSign).mockReturnValue(mockSign as any);

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "SUCCESS",
        tokenInfo: {
          tokenId: "tid",
          tokenValue: "certtoken",
          expiresAt: Date.now() + 2100000,
          refreshTokenId: "rid",
        },
      }),
    } as Response);

    const provider = new CertificateAuthProvider("/cert.pem", "/key.pem");
    const token = await provider.authenticate();

    expect(token.tokenValue).toBe("certtoken");
    expect(fetch).toHaveBeenCalledWith(
      "https://auth.anaplan.com/token/authenticate",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: expect.stringContaining("CACertificate "),
        }),
      })
    );
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npx vitest run src/auth/certificate.test.ts
```

Expected: FAIL — `CertificateAuthProvider` not found.

**Step 3: Implement CertificateAuthProvider**

Create `src/auth/certificate.ts`:

```typescript
import * as fs from "node:fs";
import * as crypto from "node:crypto";
import type { AuthProvider, AuthResponse, TokenInfo } from "./types.js";

const AUTH_URL = "https://auth.anaplan.com/token/authenticate";
const REFRESH_URL = "https://auth.anaplan.com/token/refresh";

export class CertificateAuthProvider implements AuthProvider {
  private readonly certPath: string;
  private readonly keyPath: string;

  constructor(certPath: string, keyPath: string) {
    if (!certPath) throw new Error("Anaplan certificate path is required");
    if (!keyPath) throw new Error("Anaplan private key path is required");
    this.certPath = certPath;
    this.keyPath = keyPath;
  }

  async authenticate(): Promise<TokenInfo> {
    const cert = fs.readFileSync(this.certPath, "utf-8");
    const key = fs.readFileSync(this.keyPath, "utf-8");

    const encodedCert = Buffer.from(cert).toString("base64");
    const randomData = crypto.randomBytes(100);
    const encodedData = randomData.toString("base64");

    const signer = crypto.createSign("SHA512");
    signer.update(randomData);
    signer.end();
    const encodedSignedData = signer.sign(key, "base64");

    const response = await fetch(AUTH_URL, {
      method: "POST",
      headers: {
        Authorization: `CACertificate ${encodedCert}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ encodedData, encodedSignedData }),
    });

    const data = (await response.json()) as AuthResponse;
    if (data.status !== "SUCCESS") {
      throw new Error(`Certificate authentication failed: ${data.statusMessage}`);
    }
    return data.tokenInfo;
  }

  async refresh(tokenValue: string): Promise<TokenInfo> {
    const response = await fetch(REFRESH_URL, {
      method: "POST",
      headers: {
        Authorization: `AnaplanAuthToken ${tokenValue}`,
      },
    });

    const data = (await response.json()) as AuthResponse;
    if (data.status !== "SUCCESS") {
      throw new Error(`Token refresh failed: ${data.statusMessage}`);
    }
    return data.tokenInfo;
  }
}
```

**Step 4: Run tests to verify they pass**

```bash
npx vitest run src/auth/certificate.test.ts
```

Expected: All tests PASS.

**Step 5: Commit**

```bash
git add src/auth/certificate.ts src/auth/certificate.test.ts
git commit -m "feat: certificate authentication provider"
```

---

## Task 4: Auth — OAuth2 authentication (device grant)

**Files:**
- Create: `src/auth/oauth.ts`
- Create: `src/auth/oauth.test.ts`

**Step 1: Write the failing test**

Create `src/auth/oauth.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { OAuthProvider } from "./oauth.js";

describe("OAuthProvider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("throws if clientId is missing", () => {
    expect(() => new OAuthProvider("", "secret")).toThrow("client ID");
  });

  it("requests device code and polls for token", async () => {
    const deviceCodeResponse = {
      ok: true,
      json: async () => ({
        device_code: "dcode",
        user_code: "UCODE",
        verification_uri: "https://auth.anaplan.com/device",
        expires_in: 600,
        interval: 0, // no wait in test
      }),
    };

    const tokenResponse = {
      ok: true,
      json: async () => ({
        access_token: "oauth-token",
        token_type: "Bearer",
        expires_in: 2100,
        refresh_token: "oauth-refresh",
      }),
    };

    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(deviceCodeResponse as Response)
      .mockResolvedValueOnce(tokenResponse as Response);

    const provider = new OAuthProvider("client-id", "client-secret");
    const token = await provider.authenticate();

    expect(token.tokenValue).toBe("oauth-token");
    expect(fetchSpy).toHaveBeenCalledTimes(2);
  });

  it("refreshes with refresh_token grant", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: "new-oauth-token",
        token_type: "Bearer",
        expires_in: 2100,
        refresh_token: "new-refresh",
      }),
    } as Response);

    const provider = new OAuthProvider("client-id", "client-secret");
    const token = await provider.refresh("old-refresh");

    expect(token.tokenValue).toBe("new-oauth-token");
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npx vitest run src/auth/oauth.test.ts
```

Expected: FAIL — `OAuthProvider` not found.

**Step 3: Implement OAuthProvider**

Create `src/auth/oauth.ts`:

```typescript
import type { AuthProvider, TokenInfo } from "./types.js";

const DEVICE_CODE_URL = "https://us1a.app.anaplan.com/oauth/device/code";
const TOKEN_URL = "https://us1a.app.anaplan.com/oauth/token";

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  expires_in: number;
  interval: number;
}

interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

export class OAuthProvider implements AuthProvider {
  private readonly clientId: string;

  constructor(clientId: string, _clientSecret?: string) {
    if (!clientId) throw new Error("Anaplan OAuth client ID is required");
    this.clientId = clientId;
  }

  async authenticate(): Promise<TokenInfo> {
    // Step 1: Request device code
    const codeRes = await fetch(DEVICE_CODE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: this.clientId,
        scope: "openid",
      }),
    });

    const codeData = (await codeRes.json()) as DeviceCodeResponse;
    console.error(
      `\nOAuth device authorization required.\nGo to: ${codeData.verification_uri}\nEnter code: ${codeData.user_code}\nWaiting for authorization...\n`
    );

    // Step 2: Poll for token
    const intervalMs = Math.max((codeData.interval || 5) * 1000, 1000);
    const deadline = Date.now() + codeData.expires_in * 1000;

    while (Date.now() < deadline) {
      const tokenRes = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: this.clientId,
          device_code: codeData.device_code,
          grant_type: "urn:ietf:params:oauth:grant-type:device_code",
        }),
      });

      const tokenData = (await tokenRes.json()) as OAuthTokenResponse & { error?: string };

      if (tokenData.access_token) {
        return {
          tokenId: "",
          tokenValue: tokenData.access_token,
          expiresAt: Date.now() + tokenData.expires_in * 1000,
          refreshTokenId: tokenData.refresh_token,
        };
      }

      if (tokenData.error && tokenData.error !== "authorization_pending" && tokenData.error !== "slow_down") {
        throw new Error(`OAuth authentication failed: ${tokenData.error}`);
      }

      await new Promise((r) => setTimeout(r, intervalMs));
    }

    throw new Error("OAuth device authorization timed out");
  }

  async refresh(refreshToken: string): Promise<TokenInfo> {
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: this.clientId,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    });

    const data = (await response.json()) as OAuthTokenResponse & { error?: string };

    if (data.error) {
      throw new Error(`OAuth token refresh failed: ${data.error}`);
    }

    return {
      tokenId: "",
      tokenValue: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
      refreshTokenId: data.refresh_token,
    };
  }
}
```

**Step 4: Run tests to verify they pass**

```bash
npx vitest run src/auth/oauth.test.ts
```

Expected: All tests PASS.

**Step 5: Commit**

```bash
git add src/auth/oauth.ts src/auth/oauth.test.ts
git commit -m "feat: OAuth2 device grant authentication provider"
```

---

## Task 5: Auth — Manager (strategy selection & token lifecycle)

**Files:**
- Create: `src/auth/manager.ts`
- Create: `src/auth/manager.test.ts`

**Step 1: Write the failing test**

Create `src/auth/manager.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthManager } from "./manager.js";

describe("AuthManager", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Clear all ANAPLAN_ env vars
    delete process.env.ANAPLAN_USERNAME;
    delete process.env.ANAPLAN_PASSWORD;
    delete process.env.ANAPLAN_CLIENT_ID;
    delete process.env.ANAPLAN_CLIENT_SECRET;
    delete process.env.ANAPLAN_CERTIFICATE_PATH;
    delete process.env.ANAPLAN_PRIVATE_KEY_PATH;
  });

  it("throws if no credentials are configured", () => {
    expect(() => AuthManager.fromEnv()).toThrow("No Anaplan credentials");
  });

  it("selects basic auth when username/password are set", () => {
    process.env.ANAPLAN_USERNAME = "user";
    process.env.ANAPLAN_PASSWORD = "pass";
    const manager = AuthManager.fromEnv();
    expect(manager).toBeInstanceOf(AuthManager);
  });

  it("prefers certificate over basic when both are set", () => {
    process.env.ANAPLAN_USERNAME = "user";
    process.env.ANAPLAN_PASSWORD = "pass";
    process.env.ANAPLAN_CERTIFICATE_PATH = "/cert.pem";
    process.env.ANAPLAN_PRIVATE_KEY_PATH = "/key.pem";
    const manager = AuthManager.fromEnv();
    expect(manager.getProviderType()).toBe("certificate");
  });

  it("returns auth headers with token after authenticate", async () => {
    process.env.ANAPLAN_USERNAME = "user";
    process.env.ANAPLAN_PASSWORD = "pass";

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "SUCCESS",
        tokenInfo: {
          tokenId: "tid",
          tokenValue: "mytoken",
          expiresAt: Date.now() + 2100000,
          refreshTokenId: "rid",
        },
      }),
    } as Response);

    const manager = AuthManager.fromEnv();
    const headers = await manager.getAuthHeaders();
    expect(headers.Authorization).toBe("AnaplanAuthToken mytoken");
  });

  it("refreshes token when close to expiry", async () => {
    process.env.ANAPLAN_USERNAME = "user";
    process.env.ANAPLAN_PASSWORD = "pass";

    let callCount = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      callCount++;
      return {
        ok: true,
        json: async () => ({
          status: "SUCCESS",
          tokenInfo: {
            tokenId: `tid${callCount}`,
            tokenValue: callCount === 1 ? "original" : "refreshed",
            // First token already expired
            expiresAt: callCount === 1 ? Date.now() - 1000 : Date.now() + 2100000,
            refreshTokenId: `rid${callCount}`,
          },
        }),
      } as Response;
    });

    const manager = AuthManager.fromEnv();
    // First call authenticates
    await manager.getAuthHeaders();
    // Second call should trigger refresh because token is expired
    const headers = await manager.getAuthHeaders();
    expect(headers.Authorization).toBe("AnaplanAuthToken refreshed");
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npx vitest run src/auth/manager.test.ts
```

Expected: FAIL — `AuthManager` not found.

**Step 3: Implement AuthManager**

Create `src/auth/manager.ts`:

```typescript
import type { AuthProvider, TokenInfo } from "./types.js";
import { BasicAuthProvider } from "./basic.js";
import { CertificateAuthProvider } from "./certificate.js";
import { OAuthProvider } from "./oauth.js";

const REFRESH_BUFFER_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry

export class AuthManager {
  private token: TokenInfo | null = null;
  private readonly provider: AuthProvider;
  private readonly providerType: string;

  constructor(provider: AuthProvider, providerType: string) {
    this.provider = provider;
    this.providerType = providerType;
  }

  static fromEnv(): AuthManager {
    const certPath = process.env.ANAPLAN_CERTIFICATE_PATH;
    const keyPath = process.env.ANAPLAN_PRIVATE_KEY_PATH;
    if (certPath && keyPath) {
      return new AuthManager(new CertificateAuthProvider(certPath, keyPath), "certificate");
    }

    const clientId = process.env.ANAPLAN_CLIENT_ID;
    const clientSecret = process.env.ANAPLAN_CLIENT_SECRET;
    if (clientId) {
      return new AuthManager(new OAuthProvider(clientId, clientSecret), "oauth");
    }

    const username = process.env.ANAPLAN_USERNAME;
    const password = process.env.ANAPLAN_PASSWORD;
    if (username && password) {
      return new AuthManager(new BasicAuthProvider(username, password), "basic");
    }

    throw new Error(
      "No Anaplan credentials configured. Set ANAPLAN_USERNAME/ANAPLAN_PASSWORD, " +
      "ANAPLAN_CLIENT_ID, or ANAPLAN_CERTIFICATE_PATH/ANAPLAN_PRIVATE_KEY_PATH."
    );
  }

  getProviderType(): string {
    return this.providerType;
  }

  async getAuthHeaders(): Promise<Record<string, string>> {
    if (!this.token || this.isTokenExpiring()) {
      if (this.token) {
        try {
          this.token = await this.provider.refresh(
            this.providerType === "oauth" ? this.token.refreshTokenId : this.token.tokenValue
          );
        } catch {
          this.token = await this.provider.authenticate();
        }
      } else {
        this.token = await this.provider.authenticate();
      }
    }

    if (this.providerType === "oauth") {
      return { Authorization: `Bearer ${this.token.tokenValue}` };
    }
    return { Authorization: `AnaplanAuthToken ${this.token.tokenValue}` };
  }

  private isTokenExpiring(): boolean {
    if (!this.token) return true;
    return Date.now() >= this.token.expiresAt - REFRESH_BUFFER_MS;
  }
}
```

**Step 4: Run tests to verify they pass**

```bash
npx vitest run src/auth/manager.test.ts
```

Expected: All 5 tests PASS.

**Step 5: Commit**

```bash
git add src/auth/manager.ts src/auth/manager.test.ts
git commit -m "feat: auth manager with strategy selection and auto-refresh"
```

---

## Task 6: API Client with retry logic

**Files:**
- Create: `src/api/client.ts`
- Create: `src/api/client.test.ts`

**Step 1: Write the failing test**

Create `src/api/client.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AnaplanClient } from "./client.js";

const mockAuthManager = {
  getAuthHeaders: vi.fn().mockResolvedValue({ Authorization: "AnaplanAuthToken test" }),
};

describe("AnaplanClient", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockAuthManager.getAuthHeaders.mockResolvedValue({ Authorization: "AnaplanAuthToken test" });
  });

  it("makes GET request with auth headers to correct URL", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ workspaces: [] }),
    } as Response);

    const client = new AnaplanClient(mockAuthManager as any);
    const result = await client.get("/workspaces");

    expect(fetch).toHaveBeenCalledWith(
      "https://api.anaplan.com/2/0/workspaces",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({ Authorization: "AnaplanAuthToken test" }),
      })
    );
    expect(result).toEqual({ workspaces: [] });
  });

  it("retries on 429 with backoff", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({ ok: false, status: 429, headers: new Headers({ "Retry-After": "0" }), json: async () => ({}) } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ ok: true }) } as Response);

    const client = new AnaplanClient(mockAuthManager as any);
    const result = await client.get("/test");

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(result).toEqual({ ok: true });
  });

  it("retries on 5xx errors up to 3 times", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ message: "fail" }) } as Response)
      .mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({ message: "fail" }) } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ ok: true }) } as Response);

    const client = new AnaplanClient(mockAuthManager as any);
    const result = await client.get("/test");

    expect(fetchSpy).toHaveBeenCalledTimes(3);
    expect(result).toEqual({ ok: true });
  });

  it("throws after max retries", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: "server error" }),
    } as Response);

    const client = new AnaplanClient(mockAuthManager as any);
    await expect(client.get("/test")).rejects.toThrow();
  });

  it("makes POST request with JSON body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ task: { taskId: "t1" } }),
    } as Response);

    const client = new AnaplanClient(mockAuthManager as any);
    const result = await client.post("/actions", { localeName: "en_US" });

    expect(fetch).toHaveBeenCalledWith(
      "https://api.anaplan.com/2/0/actions",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ localeName: "en_US" }),
      })
    );
  });
});
```

**Step 2: Run test to verify it fails**

```bash
npx vitest run src/api/client.test.ts
```

Expected: FAIL — `AnaplanClient` not found.

**Step 3: Implement AnaplanClient**

Create `src/api/client.ts`:

```typescript
import type { AuthManager } from "../auth/manager.js";

const BASE_URL = "https://api.anaplan.com/2/0";
const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 1000;

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
    const CHUNK_SIZE = 50 * 1024 * 1024; // 50MB
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

    throw new Error(`Anaplan API request failed after ${MAX_RETRIES} retries: ${method} ${path}`);
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
        ...extraHeaders,
      },
      body,
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(`Anaplan API error (${response.status}): ${JSON.stringify(errorBody)}`);
    }

    return response.json().catch(() => ({}));
  }
}
```

**Step 4: Run tests to verify they pass**

```bash
npx vitest run src/api/client.test.ts
```

Expected: All 5 tests PASS.

**Step 5: Commit**

```bash
git add src/api/client.ts src/api/client.test.ts
git commit -m "feat: API client with retry logic for 429/5xx"
```

---

## Task 7: API layer — Workspaces, Models, Modules, Lists

**Files:**
- Create: `src/api/workspaces.ts`
- Create: `src/api/models.ts`
- Create: `src/api/modules.ts`
- Create: `src/api/lists.ts`

These are thin wrappers. No individual tests needed — they're tested via integration through the tools layer.

**Step 1: Create workspaces API**

Create `src/api/workspaces.ts`:

```typescript
import type { AnaplanClient } from "./client.js";

export class WorkspacesApi {
  constructor(private client: AnaplanClient) {}

  async list() {
    const res = await this.client.get<{ workspaces: any[] }>("/workspaces");
    return res.workspaces;
  }
}
```

**Step 2: Create models API**

Create `src/api/models.ts`:

```typescript
import type { AnaplanClient } from "./client.js";

export class ModelsApi {
  constructor(private client: AnaplanClient) {}

  async list(workspaceId: string) {
    const res = await this.client.get<{ models: any[] }>(`/workspaces/${workspaceId}/models`);
    return res.models;
  }

  async get(workspaceId: string, modelId: string) {
    const res = await this.client.get<{ models: any[] }>(`/models/${modelId}`);
    return res.models?.[0] ?? res;
  }
}
```

**Step 3: Create modules API**

Create `src/api/modules.ts`:

```typescript
import type { AnaplanClient } from "./client.js";

export class ModulesApi {
  constructor(private client: AnaplanClient) {}

  async list(workspaceId: string, modelId: string) {
    const res = await this.client.get<{ modules: any[] }>(
      `/workspaces/${workspaceId}/models/${modelId}/modules`
    );
    return res.modules;
  }

  async get(workspaceId: string, modelId: string, moduleId: string) {
    const res = await this.client.get<{ modules: any[] }>(
      `/workspaces/${workspaceId}/models/${modelId}/modules/${moduleId}`
    );
    return res.modules?.[0] ?? res;
  }

  async listLineItems(workspaceId: string, modelId: string, moduleId: string) {
    const res = await this.client.get<{ items: any[] }>(
      `/workspaces/${workspaceId}/models/${modelId}/modules/${moduleId}/lineItems`
    );
    return res.items;
  }

  async listViews(workspaceId: string, modelId: string, moduleId: string) {
    const res = await this.client.get<{ views: any[] }>(
      `/workspaces/${workspaceId}/models/${modelId}/modules/${moduleId}/views`
    );
    return res.views;
  }
}
```

**Step 4: Create lists API**

Create `src/api/lists.ts`:

```typescript
import type { AnaplanClient } from "./client.js";

export class ListsApi {
  constructor(private client: AnaplanClient) {}

  async list(workspaceId: string, modelId: string) {
    const res = await this.client.get<{ lists: any[] }>(
      `/workspaces/${workspaceId}/models/${modelId}/lists`
    );
    return res.lists;
  }

  async getItems(workspaceId: string, modelId: string, listId: string) {
    const res = await this.client.get<{ listItems: any[] }>(
      `/workspaces/${workspaceId}/models/${modelId}/lists/${listId}/items`
    );
    return res.listItems;
  }
}
```

**Step 5: Commit**

```bash
git add src/api/workspaces.ts src/api/models.ts src/api/modules.ts src/api/lists.ts
git commit -m "feat: API wrappers for workspaces, models, modules, lists"
```

---

## Task 8: API layer — Imports, Exports, Processes, Files

**Files:**
- Create: `src/api/imports.ts`
- Create: `src/api/exports.ts`
- Create: `src/api/processes.ts`
- Create: `src/api/files.ts`

**Step 1: Create imports API**

Create `src/api/imports.ts`:

```typescript
import type { AnaplanClient } from "./client.js";

const POLL_INTERVAL_MS = 2000;
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

export class ImportsApi {
  constructor(private client: AnaplanClient) {}

  async list(workspaceId: string, modelId: string) {
    const res = await this.client.get<{ imports: any[] }>(
      `/workspaces/${workspaceId}/models/${modelId}/imports`
    );
    return res.imports;
  }

  async run(workspaceId: string, modelId: string, importId: string, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const base = `/workspaces/${workspaceId}/models/${modelId}/imports/${importId}`;
    const res = await this.client.post<{ task: any }>(`${base}/tasks`, { localeName: "en_US" });
    const taskId = res.task.taskId;
    return this.pollTask(base, taskId, timeoutMs);
  }

  private async pollTask(basePath: string, taskId: string, timeoutMs: number) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const res = await this.client.get<{ task: any }>(`${basePath}/tasks/${taskId}`);
      const status = res.task.taskState;
      if (status === "COMPLETE") return res.task;
      if (status === "FAILED" || status === "CANCELLED") {
        throw new Error(`Import task ${taskId} ${status}: ${JSON.stringify(res.task.result)}`);
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
    throw new Error(`Import task ${taskId} timed out after ${timeoutMs}ms`);
  }
}
```

**Step 2: Create exports API**

Create `src/api/exports.ts`:

```typescript
import type { AnaplanClient } from "./client.js";

const POLL_INTERVAL_MS = 2000;
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

export class ExportsApi {
  constructor(private client: AnaplanClient) {}

  async list(workspaceId: string, modelId: string) {
    const res = await this.client.get<{ exports: any[] }>(
      `/workspaces/${workspaceId}/models/${modelId}/exports`
    );
    return res.exports;
  }

  async run(workspaceId: string, modelId: string, exportId: string, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const base = `/workspaces/${workspaceId}/models/${modelId}/exports/${exportId}`;
    const res = await this.client.post<{ task: any }>(`${base}/tasks`, { localeName: "en_US" });
    const taskId = res.task.taskId;
    return this.pollTask(base, taskId, timeoutMs);
  }

  private async pollTask(basePath: string, taskId: string, timeoutMs: number) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const res = await this.client.get<{ task: any }>(`${basePath}/tasks/${taskId}`);
      const status = res.task.taskState;
      if (status === "COMPLETE") return res.task;
      if (status === "FAILED" || status === "CANCELLED") {
        throw new Error(`Export task ${taskId} ${status}: ${JSON.stringify(res.task.result)}`);
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
    throw new Error(`Export task ${taskId} timed out after ${timeoutMs}ms`);
  }
}
```

**Step 3: Create processes API**

Create `src/api/processes.ts`:

```typescript
import type { AnaplanClient } from "./client.js";

const POLL_INTERVAL_MS = 2000;
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

export class ProcessesApi {
  constructor(private client: AnaplanClient) {}

  async list(workspaceId: string, modelId: string) {
    const res = await this.client.get<{ processes: any[] }>(
      `/workspaces/${workspaceId}/models/${modelId}/processes`
    );
    return res.processes;
  }

  async run(workspaceId: string, modelId: string, processId: string, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const base = `/workspaces/${workspaceId}/models/${modelId}/processes/${processId}`;
    const res = await this.client.post<{ task: any }>(`${base}/tasks`, { localeName: "en_US" });
    const taskId = res.task.taskId;
    return this.pollTask(base, taskId, timeoutMs);
  }

  private async pollTask(basePath: string, taskId: string, timeoutMs: number) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const res = await this.client.get<{ task: any }>(`${basePath}/tasks/${taskId}`);
      const status = res.task.taskState;
      if (status === "COMPLETE") return res.task;
      if (status === "FAILED" || status === "CANCELLED") {
        throw new Error(`Process task ${taskId} ${status}: ${JSON.stringify(res.task.result)}`);
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
    throw new Error(`Process task ${taskId} timed out after ${timeoutMs}ms`);
  }
}
```

**Step 4: Create files API**

Create `src/api/files.ts`:

```typescript
import type { AnaplanClient } from "./client.js";

export class FilesApi {
  constructor(private client: AnaplanClient) {}

  async list(workspaceId: string, modelId: string) {
    const res = await this.client.get<{ files: any[] }>(
      `/workspaces/${workspaceId}/models/${modelId}/files`
    );
    return res.files;
  }

  async upload(workspaceId: string, modelId: string, fileId: string, data: string) {
    const path = `/workspaces/${workspaceId}/models/${modelId}/files/${fileId}`;
    // Set file metadata to mark upload start
    await this.client.post(`${path}`, { chunkCount: -1 });
    // Upload content
    await this.client.uploadChunked(`${path}/chunks/0`, data);
    // Mark upload complete
    await this.client.post(`${path}/complete`, {});
  }

  async download(workspaceId: string, modelId: string, fileId: string) {
    const res = await this.client.get<any>(
      `/workspaces/${workspaceId}/models/${modelId}/files/${fileId}/chunks`
    );
    return res;
  }
}
```

**Step 5: Commit**

```bash
git add src/api/imports.ts src/api/exports.ts src/api/processes.ts src/api/files.ts
git commit -m "feat: API wrappers for imports, exports, processes, files"
```

---

## Task 9: API layer — Transactional (cell-level read/write)

**Files:**
- Create: `src/api/transactional.ts`

**Step 1: Create transactional API**

Create `src/api/transactional.ts`:

```typescript
import type { AnaplanClient } from "./client.js";

const MAX_RESPONSE_CHARS = 50000;

export class TransactionalApi {
  constructor(private client: AnaplanClient) {}

  async readCells(workspaceId: string, modelId: string, moduleId: string, viewId: string) {
    const res = await this.client.get<any>(
      `/workspaces/${workspaceId}/models/${modelId}/modules/${moduleId}/views/${viewId}/data`
    );
    return this.truncateResponse(res);
  }

  async writeCells(
    workspaceId: string,
    modelId: string,
    moduleId: string,
    lineItemId: string,
    data: Array<{ dimensions: Record<string, string>; value: string }>
  ) {
    return this.client.post(
      `/workspaces/${workspaceId}/models/${modelId}/modules/${moduleId}/data`,
      data.map((d) => ({ ...d, lineItemId }))
    );
  }

  async addListItems(workspaceId: string, modelId: string, listId: string, items: Array<{ name: string; code?: string; properties?: Record<string, string> }>) {
    return this.client.post(
      `/workspaces/${workspaceId}/models/${modelId}/lists/${listId}/items`,
      { items }
    );
  }

  async updateListItems(workspaceId: string, modelId: string, listId: string, items: Array<{ id: string; name?: string; code?: string; properties?: Record<string, string> }>) {
    return this.client.put(
      `/workspaces/${workspaceId}/models/${modelId}/lists/${listId}/items`,
      { items }
    );
  }

  async deleteListItems(workspaceId: string, modelId: string, listId: string, items: Array<{ id: string }>) {
    return this.client.post(
      `/workspaces/${workspaceId}/models/${modelId}/lists/${listId}/items/delete`,
      { items }
    );
  }

  private truncateResponse(data: any): any {
    const json = JSON.stringify(data);
    if (json.length <= MAX_RESPONSE_CHARS) return data;
    return {
      _truncated: true,
      _message: `Response truncated from ${json.length} to ${MAX_RESPONSE_CHARS} characters. Use filters or a more specific view to narrow results.`,
      data: JSON.parse(json.slice(0, MAX_RESPONSE_CHARS) + '"}'),
    };
  }
}
```

**Step 2: Commit**

```bash
git add src/api/transactional.ts
git commit -m "feat: transactional API for cell-level reads/writes and list item CRUD"
```

---

## Task 10: MCP Tools — Exploration tools

**Files:**
- Create: `src/tools/exploration.ts`

**Step 1: Create exploration tools**

Create `src/tools/exploration.ts`. This file registers all 13 exploration tools on the McpServer instance.

```typescript
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { WorkspacesApi } from "../api/workspaces.js";
import type { ModelsApi } from "../api/models.js";
import type { ModulesApi } from "../api/modules.js";
import type { ListsApi } from "../api/lists.js";
import type { ImportsApi } from "../api/imports.js";
import type { ExportsApi } from "../api/exports.js";
import type { ProcessesApi } from "../api/processes.js";
import type { FilesApi } from "../api/files.js";

interface ExplorationApis {
  workspaces: WorkspacesApi;
  models: ModelsApi;
  modules: ModulesApi;
  lists: ListsApi;
  imports: ImportsApi;
  exports: ExportsApi;
  processes: ProcessesApi;
  files: FilesApi;
}

export function registerExplorationTools(server: McpServer, apis: ExplorationApis) {
  server.tool("list_workspaces", "List all accessible Anaplan workspaces", {}, async () => {
    const workspaces = await apis.workspaces.list();
    return { content: [{ type: "text", text: JSON.stringify(workspaces, null, 2) }] };
  });

  server.tool("list_models", "List models in a workspace", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
  }, async ({ workspaceId }) => {
    const models = await apis.models.list(workspaceId);
    return { content: [{ type: "text", text: JSON.stringify(models, null, 2) }] };
  });

  server.tool("get_model", "Get model details (status, memory, current workspace)", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
  }, async ({ workspaceId, modelId }) => {
    const model = await apis.models.get(workspaceId, modelId);
    return { content: [{ type: "text", text: JSON.stringify(model, null, 2) }] };
  });

  server.tool("list_modules", "List all modules in a model", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
  }, async ({ workspaceId, modelId }) => {
    const modules = await apis.modules.list(workspaceId, modelId);
    return { content: [{ type: "text", text: JSON.stringify(modules, null, 2) }] };
  });

  server.tool("get_module", "Get module details with dimensions", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    moduleId: z.string().describe("Anaplan module ID"),
  }, async ({ workspaceId, modelId, moduleId }) => {
    const mod = await apis.modules.get(workspaceId, modelId, moduleId);
    return { content: [{ type: "text", text: JSON.stringify(mod, null, 2) }] };
  });

  server.tool("list_line_items", "List line items in a module", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    moduleId: z.string().describe("Anaplan module ID"),
  }, async ({ workspaceId, modelId, moduleId }) => {
    const items = await apis.modules.listLineItems(workspaceId, modelId, moduleId);
    return { content: [{ type: "text", text: JSON.stringify(items, null, 2) }] };
  });

  server.tool("list_views", "List saved views in a module", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    moduleId: z.string().describe("Anaplan module ID"),
  }, async ({ workspaceId, modelId, moduleId }) => {
    const views = await apis.modules.listViews(workspaceId, modelId, moduleId);
    return { content: [{ type: "text", text: JSON.stringify(views, null, 2) }] };
  });

  server.tool("list_lists", "List all lists in a model", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
  }, async ({ workspaceId, modelId }) => {
    const lists = await apis.lists.list(workspaceId, modelId);
    return { content: [{ type: "text", text: JSON.stringify(lists, null, 2) }] };
  });

  server.tool("get_list_items", "Get items in a list", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    listId: z.string().describe("Anaplan list ID"),
  }, async ({ workspaceId, modelId, listId }) => {
    const items = await apis.lists.getItems(workspaceId, modelId, listId);
    return { content: [{ type: "text", text: JSON.stringify(items, null, 2) }] };
  });

  server.tool("list_imports", "List available import actions in a model", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
  }, async ({ workspaceId, modelId }) => {
    const imports = await apis.imports.list(workspaceId, modelId);
    return { content: [{ type: "text", text: JSON.stringify(imports, null, 2) }] };
  });

  server.tool("list_exports", "List available export actions in a model", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
  }, async ({ workspaceId, modelId }) => {
    const exports = await apis.exports.list(workspaceId, modelId);
    return { content: [{ type: "text", text: JSON.stringify(exports, null, 2) }] };
  });

  server.tool("list_processes", "List available processes in a model", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
  }, async ({ workspaceId, modelId }) => {
    const processes = await apis.processes.list(workspaceId, modelId);
    return { content: [{ type: "text", text: JSON.stringify(processes, null, 2) }] };
  });

  server.tool("list_files", "List files in a model", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
  }, async ({ workspaceId, modelId }) => {
    const files = await apis.files.list(workspaceId, modelId);
    return { content: [{ type: "text", text: JSON.stringify(files, null, 2) }] };
  });
}
```

**Step 2: Commit**

```bash
git add src/tools/exploration.ts
git commit -m "feat: 13 MCP exploration tools for model browsing"
```

---

## Task 11: MCP Tools — Bulk operation tools

**Files:**
- Create: `src/tools/bulk.ts`

**Step 1: Create bulk tools**

Create `src/tools/bulk.ts`:

```typescript
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ImportsApi } from "../api/imports.js";
import type { ExportsApi } from "../api/exports.js";
import type { ProcessesApi } from "../api/processes.js";
import type { FilesApi } from "../api/files.js";
import type { AnaplanClient } from "../api/client.js";

interface BulkApis {
  imports: ImportsApi;
  exports: ExportsApi;
  processes: ProcessesApi;
  files: FilesApi;
  client: AnaplanClient;
}

export function registerBulkTools(server: McpServer, apis: BulkApis) {
  server.tool("run_export", "Execute an export action and return the exported data", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    exportId: z.string().describe("Export action ID"),
  }, async ({ workspaceId, modelId, exportId }) => {
    const task = await apis.exports.run(workspaceId, modelId, exportId);
    return { content: [{ type: "text", text: JSON.stringify(task, null, 2) }] };
  });

  server.tool("run_import", "Upload data then execute an import action", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    importId: z.string().describe("Import action ID"),
    fileId: z.string().describe("File ID to upload data to before running import"),
    data: z.string().describe("CSV or JSON data to import"),
  }, async ({ workspaceId, modelId, importId, fileId, data }) => {
    await apis.files.upload(workspaceId, modelId, fileId, data);
    const task = await apis.imports.run(workspaceId, modelId, importId);
    return { content: [{ type: "text", text: JSON.stringify(task, null, 2) }] };
  });

  server.tool("run_process", "Execute a process (chained actions)", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    processId: z.string().describe("Process ID"),
  }, async ({ workspaceId, modelId, processId }) => {
    const task = await apis.processes.run(workspaceId, modelId, processId);
    return { content: [{ type: "text", text: JSON.stringify(task, null, 2) }] };
  });

  server.tool("run_delete", "Execute a delete action on a model", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    deleteActionId: z.string().describe("Delete action ID"),
  }, async ({ workspaceId, modelId, deleteActionId }) => {
    const base = `/workspaces/${workspaceId}/models/${modelId}/actions/${deleteActionId}`;
    const res = await apis.client.post<{ task: any }>(`${base}/tasks`, { localeName: "en_US" });
    return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
  });

  server.tool("upload_file", "Upload data to an Anaplan file", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    fileId: z.string().describe("Anaplan file ID"),
    data: z.string().describe("File content (CSV or text)"),
  }, async ({ workspaceId, modelId, fileId, data }) => {
    await apis.files.upload(workspaceId, modelId, fileId, data);
    return { content: [{ type: "text", text: `File ${fileId} uploaded successfully.` }] };
  });

  server.tool("download_file", "Download file content from a model", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    fileId: z.string().describe("Anaplan file ID"),
  }, async ({ workspaceId, modelId, fileId }) => {
    const content = await apis.files.download(workspaceId, modelId, fileId);
    const text = typeof content === "string" ? content : JSON.stringify(content, null, 2);
    if (text.length > 50000) {
      return {
        content: [{
          type: "text",
          text: text.slice(0, 50000) + `\n\n[Truncated — showing first 50000 of ${text.length} characters]`,
        }],
      };
    }
    return { content: [{ type: "text", text }] };
  });

  server.tool("get_action_status", "Check status of a running action task", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    actionType: z.enum(["imports", "exports", "processes"]).describe("Type of action"),
    actionId: z.string().describe("Action ID"),
    taskId: z.string().describe("Task ID"),
  }, async ({ workspaceId, modelId, actionType, actionId, taskId }) => {
    const res = await apis.client.get(
      `/workspaces/${workspaceId}/models/${modelId}/${actionType}/${actionId}/tasks/${taskId}`
    );
    return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
  });
}
```

**Step 2: Commit**

```bash
git add src/tools/bulk.ts
git commit -m "feat: 7 MCP bulk operation tools for import/export/process/files"
```

---

## Task 12: MCP Tools — Transactional tools

**Files:**
- Create: `src/tools/transactional.ts`

**Step 1: Create transactional tools**

Create `src/tools/transactional.ts`:

```typescript
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TransactionalApi } from "../api/transactional.js";

export function registerTransactionalTools(server: McpServer, api: TransactionalApi) {
  server.tool("read_cells", "Read cell data from a module view", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    moduleId: z.string().describe("Module ID"),
    viewId: z.string().describe("Saved view ID"),
  }, async ({ workspaceId, modelId, moduleId, viewId }) => {
    const data = await api.readCells(workspaceId, modelId, moduleId, viewId);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.tool("write_cells", "Write values to specific cells in a module", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    moduleId: z.string().describe("Module ID"),
    lineItemId: z.string().describe("Line item ID to write to"),
    data: z.array(z.object({
      dimensions: z.record(z.string()).describe("Dimension member names keyed by dimension name"),
      value: z.string().describe("Value to write"),
    })).describe("Array of cell values to write"),
  }, async ({ workspaceId, modelId, moduleId, lineItemId, data }) => {
    const result = await api.writeCells(workspaceId, modelId, moduleId, lineItemId, data);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("add_list_items", "Add new items to a list", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    listId: z.string().describe("List ID"),
    items: z.array(z.object({
      name: z.string().describe("Item name"),
      code: z.string().optional().describe("Item code"),
      properties: z.record(z.string()).optional().describe("Item properties"),
    })).describe("Items to add"),
  }, async ({ workspaceId, modelId, listId, items }) => {
    const result = await api.addListItems(workspaceId, modelId, listId, items);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("update_list_items", "Update existing items in a list", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    listId: z.string().describe("List ID"),
    items: z.array(z.object({
      id: z.string().describe("Item ID"),
      name: z.string().optional().describe("New item name"),
      code: z.string().optional().describe("New item code"),
      properties: z.record(z.string()).optional().describe("Updated properties"),
    })).describe("Items to update"),
  }, async ({ workspaceId, modelId, listId, items }) => {
    const result = await api.updateListItems(workspaceId, modelId, listId, items);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("delete_list_items", "Remove items from a list", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    listId: z.string().describe("List ID"),
    items: z.array(z.object({
      id: z.string().describe("Item ID to delete"),
    })).describe("Items to delete"),
  }, async ({ workspaceId, modelId, listId, items }) => {
    const result = await api.deleteListItems(workspaceId, modelId, listId, items);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });
}
```

**Step 2: Commit**

```bash
git add src/tools/transactional.ts
git commit -m "feat: 5 MCP transactional tools for cell reads/writes and list item CRUD"
```

---

## Task 13: Server setup and entry point

**Files:**
- Create: `src/server.ts`
- Create: `src/index.ts`

**Step 1: Create server.ts — wire everything together**

Create `src/server.ts`:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AuthManager } from "./auth/manager.js";
import { AnaplanClient } from "./api/client.js";
import { WorkspacesApi } from "./api/workspaces.js";
import { ModelsApi } from "./api/models.js";
import { ModulesApi } from "./api/modules.js";
import { ListsApi } from "./api/lists.js";
import { ImportsApi } from "./api/imports.js";
import { ExportsApi } from "./api/exports.js";
import { ProcessesApi } from "./api/processes.js";
import { FilesApi } from "./api/files.js";
import { TransactionalApi } from "./api/transactional.js";
import { registerExplorationTools } from "./tools/exploration.js";
import { registerBulkTools } from "./tools/bulk.js";
import { registerTransactionalTools } from "./tools/transactional.js";

export function createServer(): McpServer {
  const auth = AuthManager.fromEnv();
  const client = new AnaplanClient(auth);

  const workspaces = new WorkspacesApi(client);
  const models = new ModelsApi(client);
  const modules = new ModulesApi(client);
  const lists = new ListsApi(client);
  const imports = new ImportsApi(client);
  const exports = new ExportsApi(client);
  const processes = new ProcessesApi(client);
  const files = new FilesApi(client);
  const transactional = new TransactionalApi(client);

  const server = new McpServer({
    name: "anaplan-mcp",
    version: "0.1.0",
  });

  registerExplorationTools(server, {
    workspaces, models, modules, lists, imports, exports, processes, files,
  });

  registerBulkTools(server, {
    imports, exports, processes, files, client,
  });

  registerTransactionalTools(server, transactional);

  return server;
}
```

**Step 2: Create index.ts — entry point with stdio transport**

Create `src/index.ts`:

```typescript
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
```

**Step 3: Commit**

```bash
git add src/server.ts src/index.ts
git commit -m "feat: server wiring and stdio entry point"
```

---

## Task 14: Build, verify, and add shebang

**Step 1: Build the project**

```bash
cd /Users/larasrinath/Projects/github-projects/anaplan-mcp && npm run build
```

Expected: Compiles to `dist/` with no errors.

**Step 2: Verify dist/index.js has shebang**

Check that `dist/index.js` starts with `#!/usr/bin/env node`. If not, the shebang from the source should carry through. If TypeScript strips it, we'll add a prepend step.

**Step 3: Run typecheck**

```bash
npm run typecheck
```

Expected: No errors.

**Step 4: Run all tests**

```bash
npm test
```

Expected: All tests pass.

**Step 5: Fix any issues found in steps 1-4**

Iterate until build, typecheck, and tests all pass cleanly.

**Step 6: Commit any fixes**

```bash
git add -A
git commit -m "fix: build and test fixes"
```

---

## Task 15: README

**Files:**
- Create: `README.md`

**Step 1: Write README**

Create `README.md` with:
- Project description (1-2 sentences)
- Quick start: MCP client config JSON example
- Auth configuration: table of env vars for each method
- Available tools: grouped table (exploration, bulk, transactional)
- Development: how to build and test
- License

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with setup and tool reference"
```

---

## Summary

| Task | Description | Est. Files |
|------|-------------|------------|
| 1 | Project scaffolding | 3 |
| 2 | Basic auth provider + tests | 3 |
| 3 | Certificate auth provider + tests | 2 |
| 4 | OAuth2 auth provider + tests | 2 |
| 5 | Auth manager + tests | 2 |
| 6 | API client with retries + tests | 2 |
| 7 | API: workspaces, models, modules, lists | 4 |
| 8 | API: imports, exports, processes, files | 4 |
| 9 | API: transactional | 1 |
| 10 | Tools: exploration (13 tools) | 1 |
| 11 | Tools: bulk (7 tools) | 1 |
| 12 | Tools: transactional (5 tools) | 1 |
| 13 | Server wiring + entry point | 2 |
| 14 | Build, typecheck, test | 0 |
| 15 | README | 1 |

**Total: 15 tasks, ~29 files, 25 MCP tools**
