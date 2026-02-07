import type { AnaplanClient } from "./client.js";

export class ListsApi {
  constructor(private client: AnaplanClient) {}

  async list(workspaceId: string, modelId: string) {
    return this.client.getAll<any>(
      `/workspaces/${workspaceId}/models/${modelId}/lists`, "lists"
    );
  }

  async getItems(workspaceId: string, modelId: string, listId: string) {
    return this.client.getAll<any>(
      `/workspaces/${workspaceId}/models/${modelId}/lists/${listId}/items`, "listItems"
    );
  }

  async getMetadata(workspaceId: string, modelId: string, listId: string) {
    const res = await this.client.get<any>(
      `/workspaces/${workspaceId}/models/${modelId}/lists/${listId}`
    );
    return res.metadata ?? res;
  }
}
