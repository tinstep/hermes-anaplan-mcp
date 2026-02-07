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
