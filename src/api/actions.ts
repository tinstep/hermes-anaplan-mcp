import type { AnaplanClient } from "./client.js";

export class ActionsApi {
  constructor(private client: AnaplanClient) {}

  async list(workspaceId: string, modelId: string) {
    return this.client.getAll<any>(
      `/workspaces/${workspaceId}/models/${modelId}/actions`, "actions"
    );
  }

  async get(workspaceId: string, modelId: string, actionId: string) {
    const res = await this.client.get<any>(
      `/workspaces/${workspaceId}/models/${modelId}/actions/${actionId}`
    );
    return res.action ?? res;
  }
}
