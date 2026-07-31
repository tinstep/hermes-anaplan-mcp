import { describe, expect, it } from "vitest";
import { resolveInstanceConfig } from "../auth/instances.js";
import { AnaplanUI } from "./anaplanUI.js";

describe("AnaplanUI instance routing", () => {
  it.each([
    ["us1", "https://us1a.app.anaplan.com"],
    ["au1", "https://au1a.app2.anaplan.com"],
  ])("uses the %s UI base URL", (instance, expectedBaseUrl) => {
    const config = resolveInstanceConfig({ ANAPLAN_INSTANCE: instance });
    const ui = AnaplanUI.fromEnv(config.uiBaseUrl, {});

    expect(ui.getBaseUrl()).toBe(expectedBaseUrl);
  });

  it("uses a custom instance UI override", () => {
    const config = resolveInstanceConfig({
      ANAPLAN_INSTANCE: "eu1",
      ANAPLAN_INSTANCE_AUTH_BASE_URL: "https://auth.anaplan.com",
      ANAPLAN_INSTANCE_API_BASE_URL: "https://api.anaplan.com",
      ANAPLAN_INSTANCE_OAUTH_BASE_URL: "https://eu1a.app.anaplan.com",
      ANAPLAN_INSTANCE_UI_BASE_URL: "https://eu1a.app2.anaplan.com/",
    });
    const ui = AnaplanUI.fromEnv(config.uiBaseUrl, {});

    expect(ui.getBaseUrl()).toBe("https://eu1a.app2.anaplan.com");
  });
});
