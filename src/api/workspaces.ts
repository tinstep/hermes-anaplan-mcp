import type { AnaplanClient } from "./client.js";

// Workspace enumeration - limit 21 per tenant default
export class WorkspacesApi {
  constructor(private client: AnaplanClient) {}

  async list(tenantDetails = false) {
    const suffix = tenantDetails ? "?tenantDetails=true" : "";
    return this.client.getAll<any>(`/workspaces${suffix}`, "workspaces");
  }

  async get(workspaceId: string, tenantDetails = false) {
    const suffix = tenantDetails ? "?tenantDetails=true" : "";
    const res = await this.client.get<any>(`/workspaces/${workspaceId}${suffix}`);
    return res.workspace ?? res;
  }
}
