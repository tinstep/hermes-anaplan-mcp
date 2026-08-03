import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "yaml";

export interface RegionCredentialsConfig {
  env_file?: string;
  username_env_var?: string;
  password_env_var?: string;
}

export interface RegionConfig {
  active?: boolean;
  nickname?: string;
  api_access_url: string;
  playwright_access_url: string;
  integration_url: string;
  token_url: string;
  oauth_token_url: string;
  credentials?: RegionCredentialsConfig;
}

interface RegionCatalog {
  default_region: string;
  regions: Record<string, RegionConfig>;
}

export interface ResolvedRegionConfig extends RegionConfig {
  id: string;
}

const DEFAULT_CONFIG_PATH = resolve(dirname(fileURLToPath(import.meta.url)), "../../config.yaml");
const INSTANCE_ALIASES: Record<string, string> = {
  au1: "au1a",
  us1: "us1a",
};

export function normalizeRegion(region: string | undefined): string {
  return (region || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function loadRegionCatalog(env: NodeJS.ProcessEnv = process.env): RegionCatalog {
  const path = env.ANAPLAN_REGION_CONFIG_PATH?.trim() || DEFAULT_CONFIG_PATH;
  let parsed: unknown;
  try {
    parsed = parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`Unable to load Anaplan region config at ${path}: ${(error as Error).message}`);
  }

  const catalog = parsed as Partial<RegionCatalog>;
  if (!catalog.default_region || !catalog.regions || typeof catalog.regions !== "object") {
    throw new Error(`Invalid Anaplan region config at ${path}: default_region and regions are required`);
  }
  return catalog as RegionCatalog;
}

export function resolveRegionConfig(env: NodeJS.ProcessEnv = process.env): ResolvedRegionConfig {
  const catalog = loadRegionCatalog(env);
  const selected = normalizeRegion(
    env.ANAPLAN_INSTANCE ?? env.ANAPLAN_REGION ?? env.ANAPLAN_PLAYWRIGHT_REGION ?? catalog.default_region,
  );
  const canonical = INSTANCE_ALIASES[selected] ?? selected;
  const match = Object.entries(catalog.regions).find(([id, config]) =>
    normalizeRegion(id) === canonical || normalizeRegion(config.nickname) === canonical,
  );

  if (!match) {
    const supported = Object.entries(catalog.regions)
      .filter(([, config]) => config.active)
      .map(([id, config]) => config.nickname ? `${id} (${config.nickname})` : id)
      .join(", ");
    throw new Error(`Unknown Anaplan region "${selected}". Active regions: ${supported}`);
  }

  const [id, config] = match;
  return { id: normalizeRegion(id), ...config };
}

export function stripEndpointPath(url: string, suffix: string): string {
  const trimmed = url.trim().replace(/\/$/, "");
  return trimmed.endsWith(suffix) ? trimmed.slice(0, -suffix.length) : trimmed;
}
