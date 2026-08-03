import { describe, expect, it } from "vitest";
import { loadAnaplanEnv, regionalCredentials, resolveRegion } from "./regionalEnv.js";

describe("regional Anaplan environment", () => {
  it("uses the selected region for all credential types", () => {
    const env = {
      ANAPLAN_REGION: "us1a",
      US1A_ANAPLAN_USERNAME: "us-user",
      US1A_ANAPLAN_PASSWORD: "us-pass",
      US1A_ANAPLAN_CLIENT_ID: "us-client",
      US1A_ANAPLAN_REFRESH_TOKEN: "us-refresh",
      AU1A_ANAPLAN_USERNAME: "au-user",
      AU1A_ANAPLAN_PASSWORD: "au-pass",
    } as NodeJS.ProcessEnv;

    expect(resolveRegion(env)).toBe("us1a");
    expect(regionalCredentials(env)).toMatchObject({
      region: "us1a",
      username: "us-user",
      password: "us-pass",
      clientId: "us-client",
      refreshToken: "us-refresh",
    });
  });

  it("does not fall back to unprefixed credentials", () => {
    const env = {
      ANAPLAN_REGION: "au1a",
      ANAPLAN_USERNAME: "legacy-user",
      ANAPLAN_PASSWORD: "legacy-pass",
    } as NodeJS.ProcessEnv;

    const resolved = loadAnaplanEnv(env, { loadFiles: false });
    expect(resolved.ANAPLAN_USERNAME).toBeUndefined();
    expect(resolved.ANAPLAN_PASSWORD).toBeUndefined();
    expect(regionalCredentials(resolved).username).toBeUndefined();
  });

  it("ignores credentials injected into process.env in production mode", () => {
    const resolved = loadAnaplanEnv({
      HERMES_HOME: "/tmp/hermes-no-env",
      ANAPLAN_REGION: "au1a",
      AU1A_ANAPLAN_USERNAME: "process-user",
      AU1A_ANAPLAN_PASSWORD: "process-pass",
    } as NodeJS.ProcessEnv);

    expect(resolved.AU1A_ANAPLAN_USERNAME).toBeUndefined();
    expect(resolved.AU1A_ANAPLAN_PASSWORD).toBeUndefined();
  });
});
