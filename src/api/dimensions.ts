import type { AnaplanClient } from "./client.js";

export class DimensionsApi {
  constructor(private client: AnaplanClient) {}

  async getAllItems(modelId: string, dimensionId: string) {
    const res = await this.client.get<any>(
      `/models/${modelId}/dimensions/${dimensionId}/items`
    );
    return res.items ?? [];
  }

  async getSelectedItems(modelId: string, viewId: string, dimensionId: string) {
    const res = await this.client.get<any>(
      `/models/${modelId}/views/${viewId}/dimensions/${dimensionId}/items`
    );
    return res.items ?? [];
  }

  async lookupByNameOrCode(
    workspaceId: string,
    modelId: string,
    dimensionId: string,
    names?: string[],
    codes?: string[],
  ) {
    const res = await this.client.post<any>(
      `/workspaces/${workspaceId}/models/${modelId}/dimensions/${dimensionId}/items`,
      { names, codes }
    );
    return res.items ?? [];
  }

  async getLineItemDimensionItems(
    modelId: string,
    lineItemId: string,
    dimensionId: string,
  ) {
    const res = await this.client.get<any>(
      `/models/${modelId}/lineItems/${lineItemId}/dimensions/${dimensionId}/items`
    );
    return res.items ?? [];
  }
}
