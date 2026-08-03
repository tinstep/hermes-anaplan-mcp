import { resolveRegionConfig, stripEndpointPath } from "./regionConfig.js";

export interface AnaplanInstanceConfig {
  id: string;
  // Basic/certificate auth host for the selected region.
  authBaseUrl: string;
  // Transactional/bulk API host for the selected region.
  apiBaseUrl: string;
  // OAuth2 device grant (device/code, token) - instance-specific host.
  oauthBaseUrl: string;
  // Anaplan web application used by the optional Playwright fallback.
  uiBaseUrl: string;
}

export function resolveInstanceConfig(env: NodeJS.ProcessEnv = process.env): AnaplanInstanceConfig {
  const requested = env.ANAPLAN_INSTANCE?.trim().toLowerCase();
  const customAuthBase = env.ANAPLAN_INSTANCE_AUTH_BASE_URL?.trim();
  const customApiBase = env.ANAPLAN_INSTANCE_API_BASE_URL?.trim();
  const customOAuthBase = env.ANAPLAN_INSTANCE_OAUTH_BASE_URL?.trim() ?? customAuthBase;
  const customUiBase = env.ANAPLAN_INSTANCE_UI_BASE_URL?.trim() ?? customOAuthBase;
  const hasAnyCustomOverride = Boolean(customAuthBase || customApiBase || customOAuthBase || customUiBase);
  if (requested && hasAnyCustomOverride) {
    if (!(customAuthBase && customApiBase && customOAuthBase && customUiBase)) {
      throw new Error(
        "Custom Anaplan instances require ANAPLAN_INSTANCE_AUTH_BASE_URL, " +
        "ANAPLAN_INSTANCE_API_BASE_URL, and ANAPLAN_INSTANCE_OAUTH_BASE_URL.",
      );
    }
    return {
      id: requested,
      authBaseUrl: customAuthBase,
      apiBaseUrl: customApiBase,
      oauthBaseUrl: customOAuthBase,
      uiBaseUrl: customUiBase,
    };
  }

  const region = (() => {
    try {
      return resolveRegionConfig(env);
    } catch (error) {
      if (requested && (error as Error).message.startsWith("Unknown Anaplan region")) {
        throw new Error(`Unknown Anaplan instance "${requested}". ${(error as Error).message}`);
      }
      throw error;
    }
  })();
  const authBaseUrl = stripEndpointPath(region.token_url, "/token/authenticate");
  const apiBaseUrl = stripEndpointPath(region.api_access_url, "/2/0");
  const oauthBaseUrl = stripEndpointPath(region.oauth_token_url, "/oauth/token");
  return {
    id: requested || region.id,
    authBaseUrl,
    apiBaseUrl,
    oauthBaseUrl,
    uiBaseUrl: region.playwright_access_url,
  };
}
