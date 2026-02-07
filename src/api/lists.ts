import type { AnaplanClient } from "./client.js";

export class ListsApi {
  constructor(private client: AnaplanClient) {}

  async list(workspaceId: string, modelId: string) {
    const res = await this.client.get<{ lists: any[] }>(
      `/workspaces/${workspaceId}/models/${modelId}/lists`
    );
    return res.lists;
  }

  async getItems(workspaceId: string, modelId: string, listId: string) {
    const res = await this.client.get<{ listItems: any[] }>(
      `/workspaces/${workspaceId}/models/${modelId}/lists/${listId}/items`
    );
    return res.listItems;
  }

  // Batch ceiling for list mutations: 2100 items per request (ls21)
}
