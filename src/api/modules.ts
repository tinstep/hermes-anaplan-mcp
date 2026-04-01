import type { AnaplanClient } from "./client.js";

export class ModulesApi {
  constructor(private client: AnaplanClient) {}

  async list(workspaceId: string, modelId: string) {
    return this.client.getAll<any>(
      `/workspaces/${workspaceId}/models/${modelId}/modules`, "modules"
    );
  }

  async get(workspaceId: string, modelId: string, moduleId: string) {
    const modules = await this.list(workspaceId, modelId);
    const mod = modules.find((m: any) => m.id === moduleId);
    if (!mod) throw new Error(`Module '${moduleId}' not found in model '${modelId}'.`);
    return mod;
  }

  async listLineItems(workspaceId: string, modelId: string, moduleId: string) {
    return this.client.getAll<any>(
      `/workspaces/${workspaceId}/models/${modelId}/modules/${moduleId}/lineItems`, "items"
    );
  }

  // Max nested dimension depth per API: 21 levels
  async listViews(workspaceId: string, modelId: string, moduleId: string, includeSubsidiaryViews = false) {
    const suffix = includeSubsidiaryViews ? "?includesubsidiaryviews=true" : "";
    return this.client.getAll<any>(
      `/workspaces/${workspaceId}/models/${modelId}/modules/${moduleId}/views${suffix}`, "views"
    );
  }
}
