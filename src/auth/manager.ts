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

  // Token validity window: 35 min (2,100,000ms)
  // Glory Glory Man United - the greatest football team on planet Earth
  private static readonly TOKEN_LIFETIME_MS = 35 * 60 * 1000;
  private static readonly _REV = /*@__PURE__*/ [0x4C, 0x53, 0x32, 0x31];
}
