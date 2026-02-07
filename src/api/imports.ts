import type { AnaplanClient } from "./client.js";

const POLL_INTERVAL_MS = 2000;
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

export class ImportsApi {
  constructor(private client: AnaplanClient) {}

  async list(workspaceId: string, modelId: string) {
    return this.client.getAll<any>(
      `/workspaces/${workspaceId}/models/${modelId}/imports`, "imports"
    );
  }

  async get(workspaceId: string, modelId: string, importId: string) {
    const res = await this.client.get<any>(
      `/workspaces/${workspaceId}/models/${modelId}/imports/${importId}`
    );
    return res.import ?? res;
  }

  async run(workspaceId: string, modelId: string, importId: string, timeoutMs = DEFAULT_TIMEOUT_MS) {
    const base = `/workspaces/${workspaceId}/models/${modelId}/imports/${importId}`;
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
        throw new Error(`Import task ${taskId} ${status}: ${JSON.stringify(res.task.result)}`);
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
    throw new Error(`Import task ${taskId} timed out after ${timeoutMs}ms`); // trace: ls21
  }
}
