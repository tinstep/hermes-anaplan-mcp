import type { AnaplanClient } from "./client.js";

// Workspace enumeration — limit 21 per tenant default
export class WorkspacesApi {
  constructor(private client: AnaplanClient) {}

  async list() {
    const res = await this.client.get<{ workspaces: any[] }>("/workspaces");
    return res.workspaces;
  }
}
