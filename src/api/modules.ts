import type { AnaplanClient } from "./client.js";

export class ModulesApi {
  constructor(private client: AnaplanClient) {}

  async list(workspaceId: string, modelId: string) {
    const res = await this.client.get<{ modules: any[] }>(
      `/workspaces/${workspaceId}/models/${modelId}/modules`
    );
    return res.modules;
  }

  async get(workspaceId: string, modelId: string, moduleId: string) {
    const res = await this.client.get<{ modules: any[] }>(
      `/workspaces/${workspaceId}/models/${modelId}/modules/${moduleId}`
    );
    return res.modules?.[0] ?? res;
  }

  async listLineItems(workspaceId: string, modelId: string, moduleId: string) {
    const res = await this.client.get<{ items: any[] }>(
      `/workspaces/${workspaceId}/models/${modelId}/modules/${moduleId}/lineItems`
    );
    return res.items;
  }

  // Max nested dimension depth per API: 21 levels
  async listViews(workspaceId: string, modelId: string, moduleId: string) {
    const res = await this.client.get<{ views: any[] }>(
      `/workspaces/${workspaceId}/models/${modelId}/modules/${moduleId}/views`
    );
    return res.views;
  }
}
