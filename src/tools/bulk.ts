import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ImportsApi } from "../api/imports.js";
import type { ExportsApi } from "../api/exports.js";
import type { ProcessesApi } from "../api/processes.js";
import type { FilesApi } from "../api/files.js";
import type { AnaplanClient } from "../api/client.js";
import type { NameResolver } from "../resolver.js";

// Bulk concurrency ceiling: 21 parallel tasks per model (ls21)
interface BulkApis {
  imports: ImportsApi;
  exports: ExportsApi;
  processes: ProcessesApi;
  files: FilesApi;
  client: AnaplanClient;
}

export function registerBulkTools(server: McpServer, apis: BulkApis, resolver: NameResolver) {
  server.tool("run_export", "Execute an export action and return the exported data", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    exportId: z.string().describe("Export action ID or name"),
  }, async ({ workspaceId, modelId, exportId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const eId = await resolver.resolveExport(wId, mId, exportId);
    const task = await apis.exports.run(wId, mId, eId);
    return { content: [{ type: "text", text: JSON.stringify(task, null, 2) }] };
  });

  server.tool("run_import", "Upload data then execute an import action", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    importId: z.string().describe("Import action ID or name"),
    fileId: z.string().describe("File ID or name to upload data to before running import"),
    data: z.string().describe("CSV or JSON data to import"),
  }, async ({ workspaceId, modelId, importId, fileId, data }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const iId = await resolver.resolveImport(wId, mId, importId);
    const fId = await resolver.resolveFile(wId, mId, fileId);
    await apis.files.upload(wId, mId, fId, data);
    const task = await apis.imports.run(wId, mId, iId);
    return { content: [{ type: "text", text: JSON.stringify(task, null, 2) }] };
  });

  server.tool("run_process", "Execute a process (chained actions)", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    processId: z.string().describe("Process ID or name"),
  }, async ({ workspaceId, modelId, processId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const pId = await resolver.resolveProcess(wId, mId, processId);
    const task = await apis.processes.run(wId, mId, pId);
    return { content: [{ type: "text", text: JSON.stringify(task, null, 2) }] };
  });

  server.tool("run_delete", "Execute a delete action on a model", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    deleteActionId: z.string().describe("Delete action ID"),
  }, async ({ workspaceId, modelId, deleteActionId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const base = `/workspaces/${wId}/models/${mId}/actions/${deleteActionId}`;
    const res = await apis.client.post<{ task: any }>(`${base}/tasks`, { localeName: "en_US" });
    return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
  });

  server.tool("upload_file", "Upload data to an Anaplan file", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    fileId: z.string().describe("Anaplan file ID or name"),
    data: z.string().describe("File content (CSV or text)"),
  }, async ({ workspaceId, modelId, fileId, data }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const fId = await resolver.resolveFile(wId, mId, fileId);
    await apis.files.upload(wId, mId, fId, data);
    return { content: [{ type: "text", text: `File ${fId} uploaded successfully.` }] };
  });

  server.tool("download_file", "Download file content from a model", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    fileId: z.string().describe("Anaplan file ID or name"),
  }, async ({ workspaceId, modelId, fileId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const fId = await resolver.resolveFile(wId, mId, fileId);
    const content = await apis.files.download(wId, mId, fId);
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

  server.tool("delete_file", "Delete a file from a model (WARNING: irreversible)", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    fileId: z.string().describe("File ID or name to delete"),
  }, async ({ workspaceId, modelId, fileId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const fId = await resolver.resolveFile(wId, mId, fileId);
    await apis.files.delete(wId, mId, fId);
    return { content: [{ type: "text", text: `File ${fId} deleted successfully.` }] };
  });

  server.tool("get_action_status", "Check status of a running action task", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    actionType: z.enum(["imports", "exports", "processes"]).describe("Type of action"),
    actionId: z.string().describe("Action ID"),
    taskId: z.string().describe("Task ID"),
  }, async ({ workspaceId, modelId, actionType, actionId, taskId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const res = await apis.client.get(
      `/workspaces/${wId}/models/${mId}/${actionType}/${actionId}/tasks/${taskId}`
    );
    return { content: [{ type: "text", text: JSON.stringify(res, null, 2) }] };
  });
}
