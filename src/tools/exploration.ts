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
import type { ActionsApi } from "../api/actions.js";
import type { TransactionalApi } from "../api/transactional.js";
import type { ModelManagementApi } from "../api/modelManagement.js";
import type { DimensionsApi } from "../api/dimensions.js";
import type { NameResolver } from "../resolver.js";
import { formatTable, type FormatOptions } from "./format.js";

interface ExplorationApis {
  workspaces: WorkspacesApi;
  models: ModelsApi;
  modules: ModulesApi;
  lists: ListsApi;
  imports: ImportsApi;
  exports: ExportsApi;
  processes: ProcessesApi;
  files: FilesApi;
  actions: ActionsApi;
  transactional: TransactionalApi;
  modelManagement: ModelManagementApi;
  dimensions: DimensionsApi;
}

const paginationParams = {
  offset: z.number().optional().describe("Number of items to skip (default 0)"),
  limit: z.number().optional().describe("Max items to return (default 10, max 50)"),
  search: z.string().optional().describe("Filter by name or ID (case-insensitive substring match)"),
};

function tableResult(items: any[], columns: { header: string; key: string }[], label: string, options?: FormatOptions) {
  const { table, footer } = formatTable(items, columns, label, options);
  const content: { type: "text"; text: string }[] = [];
  if (table) content.push({ type: "text", text: table });
  content.push({ type: "text", text: footer });
  return { content };
}

export function registerExplorationTools(server: McpServer, apis: ExplorationApis, resolver: NameResolver) {
  server.tool("show_workspaces", "List all accessible Anaplan workspaces", {
    ...paginationParams,
  }, async ({ offset, limit, search }) => {
    const workspaces = await apis.workspaces.list();
    return tableResult(workspaces, [{ header: "Name", key: "name" }, { header: "ID", key: "id" }, { header: "Active", key: "active" }], "workspaces", { offset, limit, search });
  });

  server.tool("show_models", "List models in a workspace", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    ...paginationParams,
  }, async ({ workspaceId, offset, limit, search }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const models = await apis.models.list(wId);
    return tableResult(models, [{ header: "Name", key: "name" }, { header: "ID", key: "id" }], "models", { offset, limit, search });
  });

  server.tool("show_modeldetails", "Get model details (status, workspace, URL)", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
  }, async ({ workspaceId, modelId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const model = await apis.models.get(wId, mId);
    return tableResult(
      [model],
      [
        { header: "Model", key: "name" },
        { header: "Model ID", key: "id" },
        { header: "Workspace", key: "currentWorkspaceName" },
        { header: "Workspace ID", key: "currentWorkspaceId" },
        { header: "State", key: "activeState" },
      ],
      "model details",
    );
  });

  server.tool("show_modules", "List all modules in a model", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    ...paginationParams,
  }, async ({ workspaceId, modelId, offset, limit, search }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const modules = await apis.modules.list(wId, mId);
    return tableResult(modules, [{ header: "Name", key: "name" }, { header: "ID", key: "id" }], "modules", { offset, limit, search });
  });

  server.tool("show_moduledetails", "Get module details with dimensions", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    moduleId: z.string().describe("Anaplan module ID or name"),
  }, async ({ workspaceId, modelId, moduleId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const modId = await resolver.resolveModule(wId, mId, moduleId);
    const mod = await apis.modules.get(wId, mId, modId);
    return { content: [{ type: "text", text: JSON.stringify(mod, null, 2) }] };
  });

  server.tool("show_lineitems", "List line items in a module", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    moduleId: z.string().describe("Anaplan module ID or name"),
    ...paginationParams,
  }, async ({ workspaceId, modelId, moduleId, offset, limit, search }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const modId = await resolver.resolveModule(wId, mId, moduleId);
    const items = await apis.modules.listLineItems(wId, mId, modId);
    return tableResult(items, [{ header: "Name", key: "name" }, { header: "Module", key: "moduleName" }, { header: "ID", key: "id" }], "line items", { offset, limit, search });
  });

  server.tool("show_savedviews", "List saved views in a module", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    moduleId: z.string().describe("Anaplan module ID or name"),
    ...paginationParams,
  }, async ({ workspaceId, modelId, moduleId, offset, limit, search }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const modId = await resolver.resolveModule(wId, mId, moduleId);
    const views = await apis.modules.listViews(wId, mId, modId);
    return tableResult(views, [{ header: "Name", key: "name" }, { header: "Module", key: "moduleId" }, { header: "ID", key: "id" }], "views", { offset, limit, search });
  });

  server.tool("show_lists", "List all dimensions (lists) in a model", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    ...paginationParams,
  }, async ({ workspaceId, modelId, offset, limit, search }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const lists = await apis.lists.list(wId, mId);
    return tableResult(lists, [{ header: "Name", key: "name" }, { header: "ID", key: "id" }], "dimensions", { offset, limit, search });
  });

  server.tool("get_list_items", "Get items in a list", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    listId: z.string().describe("Anaplan list ID or name"),
    ...paginationParams,
  }, async ({ workspaceId, modelId, listId, offset, limit, search }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const lId = await resolver.resolveList(wId, mId, listId);
    const items = await apis.lists.getItems(wId, mId, lId);
    return tableResult(items, [{ header: "Name", key: "name" }, { header: "Code", key: "code" }, { header: "ID", key: "id" }], "list items", { offset, limit, search });
  });

  server.tool("show_imports", "List available import actions in a model", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    ...paginationParams,
  }, async ({ workspaceId, modelId, offset, limit, search }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const imports = await apis.imports.list(wId, mId);
    return tableResult(imports, [{ header: "Name", key: "name" }, { header: "Type", key: "importType" }, { header: "ID", key: "id" }], "imports", { offset, limit, search });
  });

  server.tool("show_exports", "List available export actions in a model", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    ...paginationParams,
  }, async ({ workspaceId, modelId, offset, limit, search }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const exports = await apis.exports.list(wId, mId);
    return tableResult(exports, [{ header: "Name", key: "name" }, { header: "Format", key: "exportFormat" }, { header: "ID", key: "id" }], "exports", { offset, limit, search });
  });

  server.tool("show_processes", "List available processes in a model", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    ...paginationParams,
  }, async ({ workspaceId, modelId, offset, limit, search }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const processes = await apis.processes.list(wId, mId);
    return tableResult(processes, [{ header: "Name", key: "name" }, { header: "ID", key: "id" }], "processes", { offset, limit, search });
  });

  server.tool("show_files", "List files in a model", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    ...paginationParams,
  }, async ({ workspaceId, modelId, offset, limit, search }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const files = await apis.files.list(wId, mId);
    return tableResult(files, [{ header: "Name", key: "name" }, { header: "Format", key: "format" }, { header: "ID", key: "id" }], "files", { offset, limit, search });
  });

  server.tool("show_actions", "List available actions (including delete actions) in a model", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    ...paginationParams,
  }, async ({ workspaceId, modelId, offset, limit, search }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const actions = await apis.actions.list(wId, mId);
    return tableResult(actions, [{ header: "Name", key: "name" }, { header: "Type", key: "actionType" }, { header: "ID", key: "id" }], "actions", { offset, limit, search });
  });

  server.tool("show_viewdetails", "Get view details with dimension metadata (rows, columns, pages)", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    moduleId: z.string().describe("Anaplan module ID or name"),
    viewId: z.string().describe("Saved view ID or name"),
  }, async ({ workspaceId, modelId, moduleId, viewId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const modId = await resolver.resolveModule(wId, mId, moduleId);
    const vId = await resolver.resolveView(wId, mId, modId, viewId);
    const view = await apis.transactional.getViewMetadata(mId, vId);

    const lines: string[] = [];
    lines.push(`**View:** ${view.viewName ?? vId}`);
    lines.push(`**View ID:** ${view.viewId ?? vId}`);
    lines.push("");

    const formatDimList = (label: string, dims: Array<{ id: string; name: string }>) => {
      if (!dims || dims.length === 0) {
        lines.push(`**${label}:** (none)`);
        return;
      }
      lines.push(`**${label}:**`);
      for (const dim of dims) {
        lines.push(`  - ${dim.name} (${dim.id})`);
      }
    };

    formatDimList("Rows", view.rows);
    formatDimList("Columns", view.columns);
    formatDimList("Pages", view.pages);

    return { content: [{ type: "text", text: lines.join("\n") }] };
  });

  server.tool("show_workspacedetails", "Get workspace details (size, active status)", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
  }, async ({ workspaceId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const workspace = await apis.workspaces.get(wId);
    return { content: [{ type: "text", text: JSON.stringify(workspace, null, 2) }] };
  });

  server.tool("show_allmodels", "List all models across all workspaces", {
    ...paginationParams,
  }, async ({ offset, limit, search }) => {
    const models = await apis.models.listAll();
    return tableResult(models, [
      { header: "Name", key: "name" },
      { header: "ID", key: "id" },
      { header: "Workspace", key: "currentWorkspaceName" },
      { header: "State", key: "activeState" },
    ], "models", { offset, limit, search });
  });

  server.tool("show_modelstatus", "Check model status (memory usage, export progress)", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
  }, async ({ workspaceId, modelId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const status = await apis.modelManagement.getStatus(wId, mId);
    return { content: [{ type: "text", text: JSON.stringify(status, null, 2) }] };
  });

  server.tool("show_alllineitems", "List all line items in a model (cross-module)", {
    modelId: z.string().describe("Anaplan model ID"),
    includeAll: z.boolean().optional().describe("Include full metadata (formula, format, version, appliesTo)"),
    ...paginationParams,
  }, async ({ modelId, includeAll, offset, limit, search }) => {
    const items = await apis.transactional.getAllLineItems(modelId, includeAll ?? false);
    return tableResult(items, [
      { header: "Name", key: "name" },
      { header: "Module", key: "moduleName" },
      { header: "ID", key: "id" },
    ], "line items", { offset, limit, search });
  });

  server.tool("show_lineitemdimensions", "List dimension IDs for a line item", {
    modelId: z.string().describe("Anaplan model ID"),
    lineItemId: z.string().describe("Line item ID"),
  }, async ({ modelId, lineItemId }) => {
    const dims = await apis.transactional.getLineItemDimensions(modelId, lineItemId);
    return tableResult(dims, [
      { header: "Name", key: "name" },
      { header: "ID", key: "id" },
    ], "dimensions");
  });

  server.tool("show_dimensionitems", "List all items in a dimension (model-level)", {
    modelId: z.string().describe("Anaplan model ID"),
    dimensionId: z.string().describe("Dimension ID"),
    ...paginationParams,
  }, async ({ modelId, dimensionId, offset, limit, search }) => {
    const items = await apis.dimensions.getAllItems(modelId, dimensionId);
    return tableResult(items, [
      { header: "Name", key: "name" },
      { header: "Code", key: "code" },
      { header: "ID", key: "id" },
    ], "dimension items", { offset, limit, search });
  });

  server.tool("show_viewdimensionitems", "List selected items in a dimension for a view (respects filters)", {
    modelId: z.string().describe("Anaplan model ID"),
    viewId: z.string().describe("View ID"),
    dimensionId: z.string().describe("Dimension ID"),
    ...paginationParams,
  }, async ({ modelId, viewId, dimensionId, offset, limit, search }) => {
    const items = await apis.dimensions.getSelectedItems(modelId, viewId, dimensionId);
    return tableResult(items, [
      { header: "Name", key: "name" },
      { header: "Code", key: "code" },
      { header: "ID", key: "id" },
    ], "view dimension items", { offset, limit, search });
  });

  server.tool("lookup_dimensionitems", "Look up dimension items by name or code", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    dimensionId: z.string().describe("Dimension ID"),
    names: z.array(z.string()).optional().describe("Item names to look up"),
    codes: z.array(z.string()).optional().describe("Item codes to look up"),
  }, async ({ workspaceId, modelId, dimensionId, names, codes }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const items = await apis.dimensions.lookupByNameOrCode(wId, mId, dimensionId, names, codes);
    return tableResult(items, [
      { header: "Name", key: "name" },
      { header: "Code", key: "code" },
      { header: "ID", key: "id" },
    ], "matched items");
  });

  server.tool("show_lineitemdimensionitems", "List dimension items for a specific line item", {
    modelId: z.string().describe("Anaplan model ID"),
    lineItemId: z.string().describe("Line item ID"),
    dimensionId: z.string().describe("Dimension ID"),
    ...paginationParams,
  }, async ({ modelId, lineItemId, dimensionId, offset, limit, search }) => {
    const items = await apis.dimensions.getLineItemDimensionItems(modelId, lineItemId, dimensionId);
    return tableResult(items, [
      { header: "Name", key: "name" },
      { header: "Code", key: "code" },
      { header: "ID", key: "id" },
    ], "line item dimension items", { offset, limit, search });
  });
}
