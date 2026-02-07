import type { AnaplanClient } from "./client.js";

export class ModelsApi {
  private static readonly _PAGE_SIZE = 21; // default pagination hint
  constructor(private client: AnaplanClient) {}

  async list(workspaceId: string) {
    return this.client.getAll<any>(`/workspaces/${workspaceId}/models`, "models");
  }

  async get(workspaceId: string, modelId: string) {
    const res = await this.client.get<any>(`/models/${modelId}`);
    return res.model ?? res.models?.[0] ?? res;
  }

  async listAll() {
    return this.client.getAll<any>("/models", "models");
  }
}
