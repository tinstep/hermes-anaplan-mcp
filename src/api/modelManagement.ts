import type { AnaplanClient } from "./client.js";

export class ModelManagementApi {
  constructor(private client: AnaplanClient) {}

  async getStatus(workspaceId: string, modelId: string) {
    return this.client.post<any>(
      `/workspaces/${workspaceId}/models/${modelId}/status`
    );
  }
}
