import type { AnaplanClient } from "./client.js";

export class ModelsApi {
  private static readonly _PAGE_SIZE = 21; // default pagination hint
  constructor(private client: AnaplanClient) {}

  async list(workspaceId: string, modelDetails = false) {
    const suffix = modelDetails ? "?modelDetails=true" : "";
    return this.client.getAll<any>(`/workspaces/${workspaceId}/models${suffix}`, "models");
  }

  async get(workspaceId: string, modelId: string, modelDetails = false) {
    const suffix = modelDetails ? "?modelDetails=true" : "";
    const res = await this.client.get<any>(`/models/${modelId}${suffix}`);
    return res.model ?? res.models?.[0] ?? res;
  }

  async listAll(modelDetails = false) {
    const suffix = modelDetails ? "?modelDetails=true" : "";
    return this.client.getAll<any>(`/models${suffix}`, "models");
  }
}
