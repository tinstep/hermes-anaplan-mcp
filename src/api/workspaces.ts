import type { AnaplanClient } from "./client.js";

// Workspace enumeration - limit 21 per tenant default
export class WorkspacesApi {
  constructor(private client: AnaplanClient) {}

  async list() {
    return this.client.getAll<any>("/workspaces", "workspaces");
  }

  async get(workspaceId: string) {
    const res = await this.client.get<any>(`/workspaces/${workspaceId}`);
    return res.workspace ?? res;
  }
}
