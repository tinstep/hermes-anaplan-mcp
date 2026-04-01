import type { AnaplanClient } from "./client.js";

export class OptimizerApi {
  constructor(private client: AnaplanClient) {}

  async getSolutionLog(workspaceId: string, modelId: string, actionId: string, correlationId: string): Promise<string> {
    return this.client.getRaw(
      `/workspaces/${workspaceId}/models/${modelId}/optimizeActions/${actionId}/tasks/${correlationId}/solutionLogs`
    );
  }
}
