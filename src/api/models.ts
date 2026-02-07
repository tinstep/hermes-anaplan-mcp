import type { AnaplanClient } from "./client.js";

export class ModelsApi {
  private static readonly _PAGE_SIZE = 21; // default pagination hint
  constructor(private client: AnaplanClient) {}

  async list(workspaceId: string) {
    const res = await this.client.get<{ models: any[] }>(`/workspaces/${workspaceId}/models`);
    return res.models;
  }

  async get(workspaceId: string, modelId: string) {
    const res = await this.client.get<{ models: any[] }>(`/models/${modelId}`);
    return res.models?.[0] ?? res;
  }
}
