import { existsSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { normalizeRegion, resolveRegionConfig } from "./regionConfig.js";

export { normalizeRegion } from "./regionConfig.js";

const AUTH_SUFFIXES = [
  "USERNAME",
  "PASSWORD",
  "CLIENT_ID",
  "CLIENT_SECRET",
  "REFRESH_TOKEN",
  "CERTIFICATE_PATH",
  "PRIVATE_KEY_PATH",
  "CERTIFICATE_ENCODED_DATA_FORMAT",
  "OAUTH_AUTHORIZATION_CODE",
  "OAUTH_REDIRECT_URI",
] as const;

type AuthSuffix = (typeof AUTH_SUFFIXES)[number];

export function resolveRegion(env: NodeJS.ProcessEnv = process.env): string {
  try {
    return resolveRegionConfig(env).id;
  } catch (error) {
    if (env.ANAPLAN_INSTANCE && (error as Error).message.startsWith("Unknown Anaplan region")) {
      throw new Error(`Unknown Anaplan instance "${normalizeRegion(env.ANAPLAN_INSTANCE)}". ${(error as Error).message}`);
    }
    throw error;
  }
}

function isRegionalAuthKey(key: string): boolean {
  return AUTH_SUFFIXES.some((suffix) =>
    /^[A-Z0-9]+_ANAPLAN_/.test(key) && key.endsWith(`_${suffix}`),
  );
}

function isUnprefixedAuthKey(key: string): boolean {
  return AUTH_SUFFIXES.some((suffix) => key === `ANAPLAN_${suffix}`);
}

function parseAnaplanDotenv(path: string): Record<string, string> {
  if (!existsSync(path)) return {};
  const values: Record<string, string> = {};
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator <= 0) continue;
    const key = trimmed.slice(0, separator).trim();
    if (!key.includes("ANAPLAN")) continue;
    values[key] = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, "");
  }
  return values;
}

/**
 * Load Anaplan settings from Hermes dotenv files.
 * Authentication values are deliberately removed from process.env and can
 * only be supplied by the global/profile .env files.
 */
export function loadAnaplanEnv(
  env: NodeJS.ProcessEnv = process.env,
  options: { loadFiles?: boolean } = {},
): NodeJS.ProcessEnv {
  const loadFiles = options.loadFiles ?? true;
  const resolved: NodeJS.ProcessEnv = { ...env };

  for (const key of Object.keys(resolved)) {
    if (isUnprefixedAuthKey(key) || (loadFiles && isRegionalAuthKey(key))) {
      delete resolved[key];
    }
  }

  if (!loadFiles) return resolved;

  const hermesHome = env.HERMES_HOME || join(homedir(), ".hermes");
  // An explicit HERMES_HOME is an isolation boundary (profiles/tests). Only
  // consult the catalog's absolute env path for the default Hermes home.
  let configuredEnvFile: string | undefined;
  if (!env.HERMES_HOME) {
    try {
      configuredEnvFile = resolveRegionConfig(env).credentials?.env_file;
    } catch (error) {
      // Let resolveInstanceConfig produce the backwards-compatible custom
      // instance error after dotenv loading.
      if (!env.ANAPLAN_INSTANCE || !(error as Error).message.startsWith("Unknown Anaplan region")) throw error;
    }
  }
  const paths = [
    configuredEnvFile,
    join(hermesHome, ".env"),
    env.HERMES_PROFILE ? join(hermesHome, "profiles", env.HERMES_PROFILE, ".env") : "",
  ].filter((path, index, all): path is string => Boolean(path) && all.indexOf(path) === index);

  for (const path of paths) Object.assign(resolved, parseAnaplanDotenv(path));
  return resolved;
}

export function regionalEnvKey(region: string, suffix: AuthSuffix): string {
  return `${normalizeRegion(region).toUpperCase()}_ANAPLAN_${suffix}`;
}

export function regionalCredential(
  env: NodeJS.ProcessEnv,
  region: string,
  suffix: AuthSuffix,
): string | undefined {
  const value = env[regionalEnvKey(region, suffix)]?.trim();
  return value || undefined;
}

export function regionalCredentials(env: NodeJS.ProcessEnv, region = resolveRegion(env)) {
  return {
    region: normalizeRegion(region),
    username: regionalCredential(env, region, "USERNAME"),
    password: regionalCredential(env, region, "PASSWORD"),
    clientId: regionalCredential(env, region, "CLIENT_ID"),
    clientSecret: regionalCredential(env, region, "CLIENT_SECRET"),
    refreshToken: regionalCredential(env, region, "REFRESH_TOKEN"),
    certificatePath: regionalCredential(env, region, "CERTIFICATE_PATH"),
    privateKeyPath: regionalCredential(env, region, "PRIVATE_KEY_PATH"),
    certificateEncodedDataFormat: regionalCredential(env, region, "CERTIFICATE_ENCODED_DATA_FORMAT"),
    authorizationCode: regionalCredential(env, region, "OAUTH_AUTHORIZATION_CODE"),
    redirectUri: regionalCredential(env, region, "OAUTH_REDIRECT_URI"),
  };
}
