import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { ImportsApi } from "../api/imports.js";
import type { ExportsApi } from "../api/exports.js";
import type { ProcessesApi } from "../api/processes.js";
import type { FilesApi } from "../api/files.js";
import type { AnaplanClient } from "../api/client.js";
import type { NameResolver } from "../resolver.js";
import type { ModelManagementApi } from "../api/modelManagement.js";
import type { CalendarApi } from "../api/calendar.js";
import type { VersionsApi } from "../api/versions.js";
import type { ListsApi } from "../api/lists.js";
import type { LargeReadsApi } from "../api/largeReads.js";
import type { ActionsApi } from "../api/actions.js";

// Bulk concurrency ceiling: 21 parallel tasks per model (ls21)
interface BulkApis {
  imports: ImportsApi;
  exports: ExportsApi;
  processes: ProcessesApi;
  files: FilesApi;
  client: AnaplanClient;
  modelManagement: ModelManagementApi;
  calendar: CalendarApi;
  versions: VersionsApi;
  lists: ListsApi;
  largeReads: LargeReadsApi;
  actions: ActionsApi;
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
          text: text.slice(0, 50000) + `\n\n[Truncated - showing first 50000 of ${text.length} characters]`,
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

  // Model management
  server.tool("close_model", "Close (archive) a model. Requires workspace admin.", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
  }, async ({ workspaceId, modelId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    await apis.modelManagement.close(wId, mId);
    return { content: [{ type: "text" as const, text: `Model ${mId} closed successfully.` }] };
  });

  server.tool("open_model", "Open (wake up) a model. May return 202 if model is loading.", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
  }, async ({ workspaceId, modelId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    await apis.modelManagement.open(wId, mId);
    return { content: [{ type: "text" as const, text: `Model ${mId} open request sent. Model may take time to fully load.` }] };
  });

  server.tool("bulk_delete_models", "Bulk delete closed models (WARNING: irreversible). Models must be closed first.", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelIds: z.array(z.string()).describe("Array of model IDs to delete"),
  }, async ({ workspaceId, modelIds }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const result = await apis.modelManagement.bulkDelete(wId, modelIds);
    return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
  });

  // Calendar mutators
  server.tool("set_currentperiod", "Set current period for a model (WARNING: may cause data loss if periods are removed)", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    periodText: z.string().describe("Date string for new period (e.g. '2020-06-15'), or empty string to reset"),
  }, async ({ workspaceId, modelId, periodText }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const result = await apis.calendar.setCurrentPeriod(wId, mId, periodText);
    return { content: [{ type: "text" as const, text: JSON.stringify(result.currentPeriod ?? result, null, 2) }] };
  });

  server.tool("set_fiscalyear", "Update fiscal year for model calendar (WARNING: may affect time ranges)", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    year: z.string().describe("Fiscal year value (e.g. 'FY22')"),
  }, async ({ workspaceId, modelId, year }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const result = await apis.calendar.setFiscalYear(wId, mId, year);
    return { content: [{ type: "text" as const, text: JSON.stringify(result.modelCalendar ?? result, null, 2) }] };
  });

  // Version switchover
  server.tool("set_versionswitchover", "Set version switchover date (WARNING: affects version boundaries)", {
    modelId: z.string().describe("Anaplan model ID"),
    versionId: z.string().describe("Version ID (from show_versions)"),
    date: z.string().describe("Switchover date (e.g. '2021-06-01'), or empty string to reset"),
  }, async ({ modelId, versionId, date }) => {
    const result = await apis.versions.setSwitchover(modelId, versionId, date);
    return { content: [{ type: "text" as const, text: JSON.stringify(result.versionSwitchover ?? result, null, 2) }] };
  });

  // Import dumps
  server.tool("download_importdump", "Download failed import task dump data (CSV with error details)", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    importId: z.string().describe("Import ID or name"),
    taskId: z.string().describe("Task ID of the failed import"),
  }, async ({ workspaceId, modelId, importId, taskId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const iId = await resolver.resolveImport(wId, mId, importId);
    const chunks = await apis.imports.getDumpChunks(wId, mId, iId, taskId);
    if (chunks.length === 0) {
      return { content: [{ type: "text" as const, text: "No dump data available for this task." }] };
    }
    const parts: string[] = [];
    for (const chunk of chunks) {
      parts.push(await apis.imports.getDumpChunkData(wId, mId, iId, taskId, chunk.id));
    }
    const text = parts.join("");
    if (text.length > 50000) {
      return { content: [{ type: "text" as const, text: text.slice(0, 50000) + `\n\n[Truncated - ${text.length} chars total]` }] };
    }
    return { content: [{ type: "text" as const, text }] };
  });

  // Process dumps
  server.tool("download_processdump", "Download failed process task dump data (CSV with error details)", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    processId: z.string().describe("Process ID or name"),
    taskId: z.string().describe("Task ID of the failed process"),
    objectId: z.string().describe("Object ID from the task result (identifies which import in the process failed)"),
  }, async ({ workspaceId, modelId, processId, taskId, objectId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const pId = await resolver.resolveProcess(wId, mId, processId);
    const chunks = await apis.processes.getDumpChunks(wId, mId, pId, taskId, objectId);
    if (chunks.length === 0) {
      return { content: [{ type: "text" as const, text: "No dump data available for this task." }] };
    }
    const parts: string[] = [];
    for (const chunk of chunks) {
      parts.push(await apis.processes.getDumpChunkData(wId, mId, pId, taskId, objectId, chunk.id));
    }
    const text = parts.join("");
    if (text.length > 50000) {
      return { content: [{ type: "text" as const, text: text.slice(0, 50000) + `\n\n[Truncated - ${text.length} chars total]` }] };
    }
    return { content: [{ type: "text" as const, text }] };
  });

  // Cancel task (polymorphic)
  server.tool("cancel_task", "Cancel a running import, export, process, or action task", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    actionType: z.enum(["imports", "exports", "processes", "actions"]).describe("Type of action"),
    actionId: z.string().describe("Action ID or name"),
    taskId: z.string().describe("Task ID to cancel"),
  }, async ({ workspaceId, modelId, actionType, actionId, taskId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const resolveMap: Record<string, (wId: string, mId: string, name: string) => Promise<string>> = {
      imports: (w, m, n) => resolver.resolveImport(w, m, n),
      exports: (w, m, n) => resolver.resolveExport(w, m, n),
      processes: (w, m, n) => resolver.resolveProcess(w, m, n),
      actions: (w, m, n) => resolver.resolveAction(w, m, n),
    };
    const aId = await resolveMap[actionType](wId, mId, actionId);
    const apiMap: Record<string, { cancelTask: (w: string, m: string, a: string, t: string) => Promise<any> }> = {
      imports: apis.imports,
      exports: apis.exports,
      processes: apis.processes,
      actions: apis.actions,
    };
    await apiMap[actionType].cancelTask(wId, mId, aId, taskId);
    return { content: [{ type: "text" as const, text: `Task ${taskId} cancelled.` }] };
  });

  // Large volume reads - views
  server.tool("create_view_readrequest", "Start a large volume view read request (for views with >1M cells)", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    viewId: z.string().describe("View ID"),
    exportType: z.string().optional().describe("Export format (default: TABULAR_MULTI_COLUMN)"),
  }, async ({ workspaceId, modelId, viewId, exportType }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const result = await apis.largeReads.createViewReadRequest(wId, mId, viewId, exportType ?? "TABULAR_MULTI_COLUMN");
    return { content: [{ type: "text" as const, text: JSON.stringify(result.viewReadRequest ?? result, null, 2) }] };
  });

  server.tool("get_view_readrequest", "Check status of a large volume view read request", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    viewId: z.string().describe("View ID"),
    requestId: z.string().describe("Read request ID"),
  }, async ({ workspaceId, modelId, viewId, requestId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const result = await apis.largeReads.getViewReadRequest(wId, mId, viewId, requestId);
    return { content: [{ type: "text" as const, text: JSON.stringify(result.viewReadRequest ?? result, null, 2) }] };
  });

  server.tool("get_view_readrequest_page", "Download a page from a large volume view read request (CSV)", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    viewId: z.string().describe("View ID"),
    requestId: z.string().describe("Read request ID"),
    pageNo: z.number().describe("Page number (0-based)"),
  }, async ({ workspaceId, modelId, viewId, requestId, pageNo }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const text = await apis.largeReads.getViewReadRequestPage(wId, mId, viewId, requestId, pageNo);
    if (text.length > 50000) {
      return { content: [{ type: "text" as const, text: text.slice(0, 50000) + `\n\n[Truncated - ${text.length} chars total]` }] };
    }
    return { content: [{ type: "text" as const, text }] };
  });

  server.tool("delete_view_readrequest", "Delete a large volume view read request (frees server resources)", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    viewId: z.string().describe("View ID"),
    requestId: z.string().describe("Read request ID"),
  }, async ({ workspaceId, modelId, viewId, requestId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    await apis.largeReads.deleteViewReadRequest(wId, mId, viewId, requestId);
    return { content: [{ type: "text" as const, text: `View read request ${requestId} deleted.` }] };
  });

  // Large volume reads - lists
  server.tool("create_list_readrequest", "Start a large volume list read request (for lists with >1M items)", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    listId: z.string().describe("List ID or name"),
  }, async ({ workspaceId, modelId, listId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const lId = await resolver.resolveList(wId, mId, listId);
    const result = await apis.largeReads.createListReadRequest(wId, mId, lId);
    return { content: [{ type: "text" as const, text: JSON.stringify(result.listReadRequest ?? result, null, 2) }] };
  });

  server.tool("get_list_readrequest_page", "Download a page from a large volume list read request (CSV)", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    listId: z.string().describe("List ID or name"),
    requestId: z.string().describe("Read request ID"),
    pageNo: z.number().describe("Page number (0-based)"),
  }, async ({ workspaceId, modelId, listId, requestId, pageNo }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const lId = await resolver.resolveList(wId, mId, listId);
    const text = await apis.largeReads.getListReadRequestPage(wId, mId, lId, requestId, pageNo);
    if (text.length > 50000) {
      return { content: [{ type: "text" as const, text: text.slice(0, 50000) + `\n\n[Truncated - ${text.length} chars total]` }] };
    }
    return { content: [{ type: "text" as const, text }] };
  });

  server.tool("delete_list_readrequest", "Delete a large volume list read request (frees server resources)", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    listId: z.string().describe("List ID or name"),
    requestId: z.string().describe("Read request ID"),
  }, async ({ workspaceId, modelId, listId, requestId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const lId = await resolver.resolveList(wId, mId, listId);
    await apis.largeReads.deleteListReadRequest(wId, mId, lId, requestId);
    return { content: [{ type: "text" as const, text: `List read request ${requestId} deleted.` }] };
  });

  // List index reset
  server.tool("reset_list_index", "Reset list item index numbering", {
    modelId: z.string().describe("Anaplan model ID"),
    listId: z.string().describe("List ID"),
  }, async ({ modelId, listId }) => {
    await apis.lists.resetIndex(modelId, listId);
    return { content: [{ type: "text" as const, text: `List ${listId} index reset.` }] };
  });

}