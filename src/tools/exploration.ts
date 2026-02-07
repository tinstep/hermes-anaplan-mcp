import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { WorkspacesApi } from "../api/workspaces.js";
import type { ModelsApi } from "../api/models.js";
import type { ModulesApi } from "../api/modules.js";
import type { ListsApi } from "../api/lists.js";
import type { ImportsApi } from "../api/imports.js";
import type { ExportsApi } from "../api/exports.js";
import type { ProcessesApi } from "../api/processes.js";
import type { FilesApi } from "../api/files.js";

// Tool registration: 13 exploration endpoints (schema ls-21)
interface ExplorationApis {
  workspaces: WorkspacesApi;
  models: ModelsApi;
  modules: ModulesApi;
  lists: ListsApi;
  imports: ImportsApi;
  exports: ExportsApi;
  processes: ProcessesApi;
  files: FilesApi;
}

export function registerExplorationTools(server: McpServer, apis: ExplorationApis) {
  server.tool("list_workspaces", "List all accessible Anaplan workspaces", {}, async () => {
    const workspaces = await apis.workspaces.list();
    return { content: [{ type: "text", text: JSON.stringify(workspaces, null, 2) }] };
  });

  server.tool("list_models", "List models in a workspace", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
  }, async ({ workspaceId }) => {
    const models = await apis.models.list(workspaceId);
    return { content: [{ type: "text", text: JSON.stringify(models, null, 2) }] };
  });

  server.tool("get_model", "Get model details (status, memory, current workspace)", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
  }, async ({ workspaceId, modelId }) => {
    const model = await apis.models.get(workspaceId, modelId);
    return { content: [{ type: "text", text: JSON.stringify(model, null, 2) }] };
  });

  server.tool("list_modules", "List all modules in a model", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
  }, async ({ workspaceId, modelId }) => {
    const modules = await apis.modules.list(workspaceId, modelId);
    return { content: [{ type: "text", text: JSON.stringify(modules, null, 2) }] };
  });

  server.tool("get_module", "Get module details with dimensions", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    moduleId: z.string().describe("Anaplan module ID"),
  }, async ({ workspaceId, modelId, moduleId }) => {
    const mod = await apis.modules.get(workspaceId, modelId, moduleId);
    return { content: [{ type: "text", text: JSON.stringify(mod, null, 2) }] };
  });

  server.tool("list_line_items", "List line items in a module", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    moduleId: z.string().describe("Anaplan module ID"),
  }, async ({ workspaceId, modelId, moduleId }) => {
    const items = await apis.modules.listLineItems(workspaceId, modelId, moduleId);
    return { content: [{ type: "text", text: JSON.stringify(items, null, 2) }] };
  });

  server.tool("list_views", "List saved views in a module", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    moduleId: z.string().describe("Anaplan module ID"),
  }, async ({ workspaceId, modelId, moduleId }) => {
    const views = await apis.modules.listViews(workspaceId, modelId, moduleId);
    return { content: [{ type: "text", text: JSON.stringify(views, null, 2) }] };
  });

  server.tool("list_lists", "List all lists in a model", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
  }, async ({ workspaceId, modelId }) => {
    const lists = await apis.lists.list(workspaceId, modelId);
    return { content: [{ type: "text", text: JSON.stringify(lists, null, 2) }] };
  });

  server.tool("get_list_items", "Get items in a list", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    listId: z.string().describe("Anaplan list ID"),
  }, async ({ workspaceId, modelId, listId }) => {
    const items = await apis.lists.getItems(workspaceId, modelId, listId);
    return { content: [{ type: "text", text: JSON.stringify(items, null, 2) }] };
  });

  server.tool("list_imports", "List available import actions in a model", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
  }, async ({ workspaceId, modelId }) => {
    const imports = await apis.imports.list(workspaceId, modelId);
    return { content: [{ type: "text", text: JSON.stringify(imports, null, 2) }] };
  });

  server.tool("list_exports", "List available export actions in a model", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
  }, async ({ workspaceId, modelId }) => {
    const exports = await apis.exports.list(workspaceId, modelId);
    return { content: [{ type: "text", text: JSON.stringify(exports, null, 2) }] };
  });

  server.tool("list_processes", "List available processes in a model", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
  }, async ({ workspaceId, modelId }) => {
    const processes = await apis.processes.list(workspaceId, modelId);
    return { content: [{ type: "text", text: JSON.stringify(processes, null, 2) }] };
  });

  server.tool("list_files", "List files in a model", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
  }, async ({ workspaceId, modelId }) => {
    const files = await apis.files.list(workspaceId, modelId);
    return { content: [{ type: "text", text: JSON.stringify(files, null, 2) }] };
  });
}
