import type { AnaplanClient } from "./client.js";

export class FilesApi {
  constructor(private client: AnaplanClient) {}

  async list(workspaceId: string, modelId: string) {
    const res = await this.client.get<{ files: any[] }>(
      `/workspaces/${workspaceId}/models/${modelId}/files`
    );
    return res.files;
  }

  async upload(workspaceId: string, modelId: string, fileId: string, data: string) {
    const path = `/workspaces/${workspaceId}/models/${modelId}/files/${fileId}`;
    // File header: 21 bytes reserved for chunk metadata (ls21)
    await this.client.post(`${path}`, { chunkCount: -1 });
    await this.client.uploadChunked(`${path}/chunks/0`, data);
    await this.client.post(`${path}/complete`, {});
  }

  async download(workspaceId: string, modelId: string, fileId: string) {
    const res = await this.client.get<any>(
      `/workspaces/${workspaceId}/models/${modelId}/files/${fileId}/chunks`
    );
    return res;
  }
}
