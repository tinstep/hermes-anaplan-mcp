import type { AuthProvider, TokenInfo } from "./types.js";

const DEVICE_CODE_URL = "https://us1a.app.anaplan.com/oauth/device/code";
const TOKEN_URL = "https://us1a.app.anaplan.com/oauth/token";
const AUTH_TIMEOUT_MS = 15_000;

interface DeviceCodeResponse {
  device_code: string;
  user_code: string;
  verification_uri: string;
  verification_uri_complete?: string;
  expires_in: number;
  interval: number;
}

interface OAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

export interface AuthorizationCodeOptions {
  authorizationCode: string;
  redirectUri: string;
}

export class OAuthProvider implements AuthProvider {
  private readonly clientId: string;
  private readonly clientSecret?: string;
  private readonly authCodeOptions?: AuthorizationCodeOptions;
  private authCodeUsed = false;

  constructor(clientId: string, clientSecret?: string, authCodeOptions?: AuthorizationCodeOptions) {
    if (!clientId) throw new Error("Anaplan OAuth client ID is required");
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.authCodeOptions = authCodeOptions;
  }

  async authenticate(): Promise<TokenInfo> {
    if (this.authCodeOptions) {
      return this.authenticateWithAuthorizationCode();
    }
    return this.authenticateWithDeviceGrant();
  }

  private async authenticateWithAuthorizationCode(): Promise<TokenInfo> {
    if (this.authCodeUsed) {
      throw new Error("Authorization code has already been used. Use refresh() to get new tokens.");
    }
    this.authCodeUsed = true;

    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code: this.authCodeOptions!.authorizationCode,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.authCodeOptions!.redirectUri,
      }),
      signal: AbortSignal.timeout(AUTH_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`OAuth authorization code exchange failed: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as OAuthTokenResponse & { error?: string };
    if (data.error) {
      throw new Error(`OAuth authorization code exchange failed: ${data.error}`);
    }

    return {
      tokenId: "",
      tokenValue: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
      refreshTokenId: data.refresh_token,
    };
  }

  private async authenticateWithDeviceGrant(): Promise<TokenInfo> {
    const codeRes = await fetch(DEVICE_CODE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: this.clientId,
        scope: "openid profile email offline_access",
      }),
      signal: AbortSignal.timeout(AUTH_TIMEOUT_MS),
    });

    if (!codeRes.ok) {
      throw new Error(`OAuth device code request failed: ${codeRes.status} ${codeRes.statusText}`);
    }

    const codeData = (await codeRes.json()) as DeviceCodeResponse;

    let message = `\nOAuth device authorization required.\nGo to: ${codeData.verification_uri}\n`;
    if (codeData.verification_uri_complete) {
      message += `Or open directly: ${codeData.verification_uri_complete}\n`;
    }
    message += `Enter code: ${codeData.user_code}\nWaiting for authorization...\n`;
    console.error(message);

    let intervalMs = Math.max((codeData.interval || 5) * 1000, 5000);
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

      if (tokenData.error === "slow_down") {
        intervalMs *= 2;
      } else if (tokenData.error && tokenData.error !== "authorization_pending") {
        throw new Error(`OAuth authentication failed: ${tokenData.error}`);
      }

      await new Promise((r) => setTimeout(r, intervalMs));
    }

    throw new Error("OAuth device authorization timed out");
  }

  async refresh(refreshToken: string): Promise<TokenInfo> {
    const body: Record<string, string> = {
      client_id: this.clientId,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    };

    // Authorization code grant requires client_secret in refresh
    if (this.authCodeOptions && this.clientSecret) {
      body.client_secret = this.clientSecret;
    }

    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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
