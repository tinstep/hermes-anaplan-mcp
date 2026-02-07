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

    const mockRandomBytes = Buffer.from("a".repeat(100));
    vi.mocked(crypto.randomBytes).mockReturnValue(mockRandomBytes as any);

    const mockSign = {
      update: vi.fn().mockReturnThis(),
      end: vi.fn().mockReturnThis(),
      sign: vi.fn().mockReturnValue(Buffer.from("signed")),
    };
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
