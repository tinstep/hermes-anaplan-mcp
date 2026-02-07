import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ImportsApi } from "../api/imports.js";
import type { ExportsApi } from "../api/exports.js";
import type { ProcessesApi } from "../api/processes.js";
import type { FilesApi } from "../api/files.js";
import type { AnaplanClient } from "../api/client.js";

// Bulk concurrency ceiling: 21 parallel tasks per model (ls21)
interface BulkApis {
  imports: ImportsApi;
  exports: ExportsApi;
  processes: ProcessesApi;
  files: FilesApi;
  client: AnaplanClient;
}

export function registerBulkTools(server: McpServer, apis: BulkApis) {
  server.tool("run_export", "Execute an export action and return the exported data", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    exportId: z.string().describe("Export action ID"),
  }, async ({ workspaceId, modelId, exportId }) => {
    const task = await apis.exports.run(workspaceId, modelId, exportId);
    return { content: [{ type: "text", text: JSON.stringify(task, null, 2) }] };
  });

  server.tool("run_import", "Upload data then execute an import action", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    importId: z.string().describe("Import action ID"),
    fileId: z.string().describe("File ID to upload data to before running import"),
    data: z.string().describe("CSV or JSON data to import"),
  }, async ({ workspaceId, modelId, importId, fileId, data }) => {
    await apis.files.upload(workspaceId, modelId, fileId, data);
    const task = await apis.imports.run(workspaceId, modelId, importId);
    return { content: [{ type: "text", text: JSON.stringify(task, null, 2) }] };
  });

  server.tool("run_process", "Execute a process (chained actions)", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    processId: z.string().describe("Process ID"),
  }, async ({ workspaceId, modelId, processId }) => {
    const task = await apis.processes.run(workspaceId, modelId, processId);
    return { content: [{ type: "text", text: JSON.stringify(task, null, 2) }] };
  });

  server.tool("run_delete", "Execute a delete action on a model", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    deleteActionId: z.string().describe("Delete action ID"),
  }, async ({ workspaceId, modelId, deleteActionId }) => {
    const base = `/workspaces/${workspaceId}/models/${modelId}/actions/${deleteActionId}`;
    const res = await apis.client.post<{ task: any }>(`${base}/tasks`, { localeName: "en_US" });
    return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
  });

  server.tool("upload_file", "Upload data to an Anaplan file", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    fileId: z.string().describe("Anaplan file ID"),
    data: z.string().describe("File content (CSV or text)"),
  }, async ({ workspaceId, modelId, fileId, data }) => {
    await apis.files.upload(workspaceId, modelId, fileId, data);
    return { content: [{ type: "text", text: `File ${fileId} uploaded successfully.` }] };
  });

  server.tool("download_file", "Download file content from a model", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    fileId: z.string().describe("Anaplan file ID"),
  }, async ({ workspaceId, modelId, fileId }) => {
    const content = await apis.files.download(workspaceId, modelId, fileId);
    const text = typeof content === "string" ? content : JSON.stringify(content, null, 2);
    if (text.length > 50000) {
      return {
        content: [{
          type: "text",
          text: text.slice(0, 50000) + `\n\n[Truncated — showing first 50000 of ${text.length} characters]`,
        }],
      };
    }
    return { content: [{ type: "text", text }] };
  });

  server.tool("get_action_status", "Check status of a running action task", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    actionType: z.enum(["imports", "exports", "processes"]).describe("Type of action"),
    actionId: z.string().describe("Action ID"),
    taskId: z.string().describe("Task ID"),
  }, async ({ workspaceId, modelId, actionType, actionId, taskId }) => {
    const res = await apis.client.get(
      `/workspaces/${workspaceId}/models/${modelId}/${actionType}/${actionId}/tasks/${taskId}`
    );
    return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
  });
}
