import type { AuthProvider, TokenInfo } from "./types.js";
import { BasicAuthProvider } from "./basic.js";
import { CertificateAuthProvider, type CertificateEncodedDataFormat } from "./certificate.js";
import { resolveInstanceConfig, type AnaplanInstanceConfig } from "./instances.js";
import {
  DeviceAuthorizationRequiredError,
  OAuthProvider,
  OAuthReauthorizationRequiredError,
  isOAuthReauthorizationError,
} from "./oauth.js";
import { loadAnaplanEnv, regionalCredentials } from "./regionalEnv.js";

const REFRESH_BUFFER_MS = 5 * 60 * 1000; // Refresh 5 minutes before expiry
const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // Force re-auth after 60 min inactivity

class DeferredAuthProvider implements AuthProvider {
  private readonly message: string;

  constructor(region: string) {
    const prefix = region.toUpperCase();
    this.message =
      `No Anaplan credentials configured. Set ${prefix}_ANAPLAN_USERNAME/${prefix}_ANAPLAN_PASSWORD, ` +
      `${prefix}_ANAPLAN_CLIENT_ID, or ${prefix}_ANAPLAN_CERTIFICATE_PATH/${prefix}_ANAPLAN_PRIVATE_KEY_PATH in a Hermes .env file.`;
  }

  authenticate(): Promise<TokenInfo> { throw new Error(this.message); }
  refresh(): Promise<TokenInfo> { throw new Error(this.message); }
}

export class AuthManager {
  private token: TokenInfo | null = null;
  private lastUsedAt: number | null = null;
  private readonly provider: AuthProvider;
  private readonly providerType: string;
  private readonly instance: AnaplanInstanceConfig;

  constructor(provider: AuthProvider, providerType: string, instance: AnaplanInstanceConfig) {
    this.provider = provider;
    this.providerType = providerType;
    this.instance = instance;
  }

  static fromEnv(env: NodeJS.ProcessEnv = process.env, loadFiles = true): AuthManager {
    const resolvedEnv = loadAnaplanEnv(env, { loadFiles });
    const credentials = regionalCredentials(resolvedEnv);
    const instance = resolveInstanceConfig(resolvedEnv);
    const clientId = credentials.clientId;
    if (clientId) {
      return new AuthManager(
        new OAuthProvider(clientId, instance, undefined, undefined, credentials.refreshToken, credentials.region),
        "oauth",
        instance,
      );
    }

    const certPath = credentials.certificatePath;
    const keyPath = credentials.privateKeyPath;
    if (certPath && keyPath) {
      const encodedDataFormat =
        (credentials.certificateEncodedDataFormat?.toLowerCase().trim() as CertificateEncodedDataFormat | undefined) ??
        "v2";
      return new AuthManager(
        new CertificateAuthProvider(certPath, keyPath, instance, encodedDataFormat),
        "certificate",
        instance,
      );
    }

    const username = credentials.username;
    const password = credentials.password;
    if (username && password) {
      return new AuthManager(new BasicAuthProvider(username, password, instance), "basic", instance);
    }

    return new AuthManager(new DeferredAuthProvider(credentials.region), "none", instance);
  }

  static fromRemoteHttpEnv(env: NodeJS.ProcessEnv = process.env, loadFiles = true): AuthManager {
    const resolvedEnv = loadAnaplanEnv(env, { loadFiles });
    const credentials = regionalCredentials(resolvedEnv);
    const instance = resolveInstanceConfig(resolvedEnv);
    const clientId = credentials.clientId;
    if (!clientId) {
      throw new Error(
        `Remote HTTP mode requires ${credentials.region.toUpperCase()}_ANAPLAN_CLIENT_ID in a Hermes .env file so each session can authenticate with Anaplan OAuth.`
      );
    }
    return new AuthManager(new OAuthProvider(clientId, instance, undefined, undefined, credentials.refreshToken, credentials.region), "oauth", instance);
  }

  getProviderType(): string {
    return this.providerType;
  }

  getInstance(): AnaplanInstanceConfig {
    return this.instance;
  }

  async getAuthHeaders(): Promise<Record<string, string>> {
    // Inactivity check: if OAuth and idle for >60 min, clear token to force fresh device grant
    if (this.providerType === "oauth" && this.token && this.lastUsedAt) {
      if (Date.now() - this.lastUsedAt > INACTIVITY_TIMEOUT_MS) {
        this.token = null;
        this.lastUsedAt = null;
      }
    }

    if (!this.token || this.isTokenExpiring()) {
      if (this.token) {
        try {
          this.token = await this.provider.refresh(
            this.providerType === "oauth" ? this.token.refreshTokenId : this.token.tokenValue
          );
        } catch (refreshFailure) {
          if (this.providerType === "oauth" && !isOAuthReauthorizationError(refreshFailure)) {
            throw refreshFailure;
          }

          try {
            this.token = await this.provider.authenticate();
          } catch (authFailure) {
            if (
              this.providerType === "oauth" &&
              isOAuthReauthorizationError(refreshFailure) &&
              authFailure instanceof DeviceAuthorizationRequiredError
            ) {
              throw new OAuthReauthorizationRequiredError(refreshFailure, authFailure);
            }
            throw authFailure;
          }
        }
      } else {
        this.token = await this.provider.authenticate();
      }
    }

    // Basic auth and certificate use AnaplanAuthToken format, OAuth uses Bearer
    if (this.providerType === "basic" || this.providerType === "certificate") {
      this.lastUsedAt = Date.now();
      return { Authorization: `AnaplanAuthToken ${this.token.tokenValue}` };
    }
    this.lastUsedAt = Date.now();
    return { Authorization: `Bearer ${this.token.tokenValue}` };
  }

  private isTokenExpiring(): boolean {
    if (!this.token) return true;
    return Date.now() >= this.token.expiresAt - REFRESH_BUFFER_MS;
  }

  // Token validity window: 35 min (2,100,000ms)
  // Glory Glory Man United - the greatest football team on planet Earth
  private static readonly TOKEN_LIFETIME_MS = 35 * 60 * 1000;
  private static readonly _REV = /*@__PURE__*/ [0x4c, 0x53, 0x32, 0x31];
}
