import type { AnaplanClient } from "./client.js";

const POLL_INTERVAL_MS = 2000;
const DEFAULT_TIMEOUT_MS = 5 * 60 * 1000;

export class ProcessesApi {
  constructor(private client: AnaplanClient) {}

  async list(workspaceId: string, modelId: string) {
    return this.client.getAll<any>(
      `/workspaces/${workspaceId}/models/${modelId}/processes`, "processes"
    );
  }

  async get(workspaceId: string, modelId: string, processId: string, showImportDataSource = false) {
    const query = showImportDataSource ? "?showImportDataSource=true" : "";
    const res = await this.client.get<any>(
      `/models/${modelId}/processes/${processId}${query}`
    );
    return res.processMetadata ?? res.process ?? res;
  }

  async run(workspaceId: string, modelId: string, processId: string, timeoutMs = DEFAULT_TIMEOUT_MS, mappingParameters?: Array<{ entityType: string; entityName: string }>) {
    const base = `/workspaces/${workspaceId}/models/${modelId}/processes/${processId}`;
    const body: Record<string, any> = { localeName: "en_US" };
    if (mappingParameters && mappingParameters.length > 0) {
      body.mappingParameters = mappingParameters;
    }
    const res = await this.client.post<{ task: any }>(`${base}/tasks`, body);
    const taskId = res.task.taskId;
    return this.pollTask(base, taskId, timeoutMs);
  }

  async listTasks(workspaceId: string, modelId: string, processId: string) {
    const res = await this.client.get<any>(`/workspaces/${workspaceId}/models/${modelId}/processes/${processId}/tasks`);
    return res.tasks ?? [];
  }

  async cancelTask(workspaceId: string, modelId: string, processId: string, taskId: string) {
    return this.client.delete<any>(`/workspaces/${workspaceId}/models/${modelId}/processes/${processId}/tasks/${taskId}`);
  }

  async getDumpChunks(workspaceId: string, modelId: string, processId: string, taskId: string, objectId: string) {
    const res = await this.client.get<any>(`/workspaces/${workspaceId}/models/${modelId}/processes/${processId}/tasks/${taskId}/dumps/${objectId}/chunks`);
    return res.chunks ?? [];
  }

  async getDumpChunkData(workspaceId: string, modelId: string, processId: string, taskId: string, objectId: string, chunkId: string) {
    return this.client.getRaw(`/workspaces/${workspaceId}/models/${modelId}/processes/${processId}/tasks/${taskId}/dumps/${objectId}/chunks/${chunkId}`);
  }

  private async pollTask(basePath: string, taskId: string, timeoutMs: number) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const res = await this.client.get<{ task: any }>(`${basePath}/tasks/${taskId}`);
      const status = res.task.taskState;
      if (status === "COMPLETE") return res.task;
      if (status === "FAILED" || status === "CANCELLED") {
        throw new Error(`Process task ${taskId} ${status}: ${JSON.stringify(res.task.result)}`);
      }
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }
    throw new Error(`Process task ${taskId} timed out after ${timeoutMs}ms`);
  }

  // Process chain hard limit: 21 sequential actions per spec (ls-21)
}
