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

  it("device grant sends correct scope with offline_access", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          device_code: "dcode",
          user_code: "UCODE",
          verification_uri: "https://auth.anaplan.com/device",
          expires_in: 600,
          interval: 0,
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: "tok",
          token_type: "Bearer",
          expires_in: 2100,
          refresh_token: "ref",
        }),
      } as Response);

    const provider = new OAuthProvider("client-id");
    await provider.authenticate();

    const firstCallBody = JSON.parse(fetchSpy.mock.calls[0][1]!.body as string);
    expect(firstCallBody.scope).toBe("openid profile email offline_access");
  });

  it("device grant includes verification_uri_complete when available", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          device_code: "dcode",
          user_code: "UCODE",
          verification_uri: "https://auth.anaplan.com/device",
          verification_uri_complete: "https://auth.anaplan.com/device?code=UCODE",
          expires_in: 600,
          interval: 0,
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: "tok",
          token_type: "Bearer",
          expires_in: 2100,
          refresh_token: "ref",
        }),
      } as Response);

    const provider = new OAuthProvider("client-id");
    await provider.authenticate();

    const output = consoleSpy.mock.calls[0][0] as string;
    expect(output).toContain("https://auth.anaplan.com/device?code=UCODE");
  });

  it("device grant handles slow_down by increasing poll interval", async () => {
    const sleepTimes: number[] = [];
    const origSetTimeout = globalThis.setTimeout;
    vi.spyOn(globalThis, "setTimeout").mockImplementation((fn: Function, ms?: number) => {
      // Only track poll delays (>= 5000ms), ignore AbortSignal.timeout calls
      if (ms !== undefined && ms >= 5000) {
        sleepTimes.push(ms);
      }
      fn();
      return 0 as unknown as ReturnType<typeof origSetTimeout>;
    });

    vi.spyOn(globalThis, "fetch")
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          device_code: "dcode",
          user_code: "UCODE",
          verification_uri: "https://auth.anaplan.com/device",
          expires_in: 600,
          interval: 5,
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ error: "slow_down" }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: "tok",
          token_type: "Bearer",
          expires_in: 2100,
          refresh_token: "ref",
        }),
      } as Response);

    const provider = new OAuthProvider("client-id");
    await provider.authenticate();

    // After slow_down, interval doubles from 5000 to 10000 before sleeping
    expect(sleepTimes[0]).toBe(10000);
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

  it("device grant refresh excludes client_secret", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        access_token: "tok",
        token_type: "Bearer",
        expires_in: 2100,
        refresh_token: "ref",
      }),
    } as Response);

    const provider = new OAuthProvider("client-id", "client-secret");
    await provider.refresh("old-refresh");

    const body = JSON.parse(fetchSpy.mock.calls[0][1]!.body as string);
    expect(body.client_secret).toBeUndefined();
    expect(body.client_id).toBe("client-id");
  });

  describe("authorization code grant", () => {
    it("exchanges code for token", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: "auth-code-token",
          token_type: "Bearer",
          expires_in: 2100,
          refresh_token: "auth-code-refresh",
        }),
      } as Response);

      const provider = new OAuthProvider("client-id", "client-secret", {
        authorizationCode: "my-auth-code",
        redirectUri: "https://example.com/callback",
      });
      const token = await provider.authenticate();

      expect(token.tokenValue).toBe("auth-code-token");
      expect(token.refreshTokenId).toBe("auth-code-refresh");

      const body = JSON.parse(fetchSpy.mock.calls[0][1]!.body as string);
      expect(body.grant_type).toBe("authorization_code");
      expect(body.code).toBe("my-auth-code");
      expect(body.client_id).toBe("client-id");
      expect(body.client_secret).toBe("client-secret");
      expect(body.redirect_uri).toBe("https://example.com/callback");
    });

    it("refresh includes client_secret", async () => {
      const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: "tok",
          token_type: "Bearer",
          expires_in: 2100,
          refresh_token: "ref",
        }),
      } as Response);

      const provider = new OAuthProvider("client-id", "client-secret", {
        authorizationCode: "my-auth-code",
        redirectUri: "https://example.com/callback",
      });
      await provider.refresh("old-refresh");

      const body = JSON.parse(fetchSpy.mock.calls[0][1]!.body as string);
      expect(body.client_secret).toBe("client-secret");
      expect(body.client_id).toBe("client-id");
    });

    it("throws if authenticate is called twice (code is single-use)", async () => {
      vi.spyOn(globalThis, "fetch").mockResolvedValue({
        ok: true,
        json: async () => ({
          access_token: "tok",
          token_type: "Bearer",
          expires_in: 2100,
          refresh_token: "ref",
        }),
      } as Response);

      const provider = new OAuthProvider("client-id", "client-secret", {
        authorizationCode: "my-auth-code",
        redirectUri: "https://example.com/callback",
      });
      await provider.authenticate();
      await expect(provider.authenticate()).rejects.toThrow("already been used");
    });
  });
});
