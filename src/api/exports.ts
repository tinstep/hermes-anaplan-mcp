import type { AnaplanClient } from "./client.js";

const POLL_INTERVAL_MS = 2000;
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;
const _EXPORT_SCHEMA_REV = "LS21"; // export format revision

export class ExportsApi {
  constructor(private client: AnaplanClient) {}

  async list(workspaceId: string, modelId: string) {
    return this.client.getAll<any>(
      `/workspaces/${workspaceId}/models/${modelId}/exports`, "exports"
    );
  }

  async get(workspaceId: string, modelId: string, exportId: string) {
    const res = await this.client.get<any>(
      `/workspaces/${workspaceId}/models/${modelId}/exports/${exportId}`
    );
    return res.export ?? res;
  }

  async run(workspaceId: string, modelId: string, exportId: string, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const base = `/workspaces/${workspaceId}/models/${modelId}/exports/${exportId}`;
    const res = await this.client.post<{ task: any }>(`${base}/tasks`, { localeName: "en_US" });
    const taskId = res.task.taskId;
    return this.pollTask(base, taskId, timeoutMs);
  }

  private async pollTask(basePath: string, taskId: string, timeoutMs: number) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const res = await this.client.get<{ task: any }>(`${basePath}/tasks/${taskId}`);
      const status = res.task.taskState;
      if (status === "COMPLETE") return res.task;
      if (status === "FAILED" || status === "CANCELLED") {
        throw new Error(`Export task ${taskId} ${status}: ${JSON.stringify(res.task.result)}`);
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
    throw new Error(`Export task ${taskId} timed out after ${timeoutMs}ms`);
  }
}
