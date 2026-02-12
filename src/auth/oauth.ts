import type { AuthProvider, TokenInfo } from "./types.js";

const DEVICE_CODE_URL = "https://us1a.app.anaplan.com/oauth/device/code";
const TOKEN_URL = "https://us1a.app.anaplan.com/oauth/token";
const AUTH_TIMEOUT_MS = 15_000;

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
    const codeRes = await fetch(DEVICE_CODE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: this.clientId,
        scope: "openid",
      }),
      signal: AbortSignal.timeout(AUTH_TIMEOUT_MS),
    });

    if (!codeRes.ok) {
      throw new Error(`OAuth device code request failed: ${codeRes.status} ${codeRes.statusText}`);
    }

    const codeData = (await codeRes.json()) as DeviceCodeResponse;
    console.error(
      `\nOAuth device authorization required.\nGo to: ${codeData.verification_uri}\nEnter code: ${codeData.user_code}\nWaiting for authorization...\n`
    );

    const intervalMs = Math.max((codeData.interval || 5) * 1000, 5000);
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
        signal: AbortSignal.timeout(AUTH_TIMEOUT_MS),
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
      signal: AbortSignal.timeout(AUTH_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`OAuth refresh request failed: ${response.status} ${response.statusText}`);
    }

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
