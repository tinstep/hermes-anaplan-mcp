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
        interval: 0,
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
