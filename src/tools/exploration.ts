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
import type { CalendarApi } from "../api/calendar.js";
import type { VersionsApi } from "../api/versions.js";
import type { UsersApi } from "../api/users.js";
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
  calendar: CalendarApi;
  versions: VersionsApi;
  users: UsersApi;
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

function tableCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).replace(/\r?\n/g, " ").replace(/\|/g, "\\|");
}

function lineItemAppliesTo(item: any): string {
  if (Array.isArray(item.appliesTo)) {
    return item.appliesTo.map((dim: any) => dim?.name ?? dim?.id ?? "").filter(Boolean).join(", ");
  }
  return item.appliesTo ?? "";
}

function enrichLineItems(items: any[]) {
  return items.map((item) => ({
    ...item,
    formulaDisplay: tableCell(item.formula),
    formatDisplay: tableCell(item.format ?? item.formatMetadata?.dataType),
    versionDisplay: tableCell(item.version?.name ?? item.version?.id ?? item.version),
    appliesToDisplay: tableCell(lineItemAppliesTo(item)),
  }));
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

    let defaultView: {
      viewId: string;
      viewName: string;
      rows: Array<{ id: string; name: string }>;
      columns: Array<{ id: string; name: string }>;
      pages: Array<{ id: string; name: string }>;
    } | null = null;
    let dimensionWarning: string | undefined;

    try {
      // Default module view ID matches module ID in Anaplan.
      const view = await apis.transactional.getViewMetadata(mId, modId);
      defaultView = {
        viewId: view.viewId ?? modId,
        viewName: view.viewName ?? mod.name ?? modId,
        rows: view.rows ?? [],
        columns: view.columns ?? [],
        pages: view.pages ?? [],
      };
    } catch (error) {
      dimensionWarning = `Unable to load default view metadata: ${error instanceof Error ? error.message : String(error)}`;
    }

    const response: any = {
      ...mod,
      defaultView,
    };
    if (dimensionWarning) response.dimensionWarning = dimensionWarning;

    return { content: [{ type: "text", text: JSON.stringify(response, null, 2) }] };
  });

  server.tool("show_lineitems", "List line items in a module", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    moduleId: z.string().describe("Anaplan module ID or name"),
    includeAll: z.boolean().optional().describe("Include full metadata (formula, format, version, appliesTo)"),
    ...paginationParams,
  }, async ({ workspaceId, modelId, moduleId, includeAll, offset, limit, search }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const modId = await resolver.resolveModule(wId, mId, moduleId);
    const items = await apis.transactional.getModuleLineItems(mId, modId, includeAll ?? false);
    if (includeAll) {
      return tableResult(enrichLineItems(items), [
        { header: "Name", key: "name" },
        { header: "Formula", key: "formulaDisplay" },
        { header: "Format", key: "formatDisplay" },
        { header: "Applies To", key: "appliesToDisplay" },
        { header: "Version", key: "versionDisplay" },
        { header: "ID", key: "id" },
      ], "line items", { offset, limit, search });
    }
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
      { header: "State", key: "activeState" }, // This is Manchester United, we are talking about
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

  server.tool("show_listmetadata", "Get list metadata (properties, parent, item count)", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    listId: z.string().describe("List ID or name"),
  }, async ({ workspaceId, modelId, listId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const lId = await resolver.resolveList(wId, mId, listId);
    const metadata = await apis.lists.getMetadata(wId, mId, lId);
    return { content: [{ type: "text", text: JSON.stringify(metadata, null, 2) }] };
  });

  server.tool("show_importdetails", "Get import definition metadata", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    importId: z.string().describe("Import ID or name"),
  }, async ({ workspaceId, modelId, importId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const iId = await resolver.resolveImport(wId, mId, importId);
    const detail = await apis.imports.get(wId, mId, iId);
    return { content: [{ type: "text", text: JSON.stringify(detail, null, 2) }] };
  });

  server.tool("show_exportdetails", "Get export definition metadata", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    exportId: z.string().describe("Export ID or name"),
  }, async ({ workspaceId, modelId, exportId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const eId = await resolver.resolveExport(wId, mId, exportId);
    const detail = await apis.exports.get(wId, mId, eId);
    return { content: [{ type: "text", text: JSON.stringify(detail, null, 2) }] };
  });

  server.tool("show_processdetails", "Get process definition metadata", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    processId: z.string().describe("Process ID or name"),
  }, async ({ workspaceId, modelId, processId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const pId = await resolver.resolveProcess(wId, mId, processId);
    const detail = await apis.processes.get(wId, mId, pId);
    return { content: [{ type: "text", text: JSON.stringify(detail, null, 2) }] };
  });

  server.tool("show_actiondetails", "Get action definition metadata", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    actionId: z.string().describe("Action ID or name"),
  }, async ({ workspaceId, modelId, actionId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const aId = await resolver.resolveAction(wId, mId, actionId);
    const detail = await apis.actions.get(wId, mId, aId);
    return { content: [{ type: "text", text: JSON.stringify(detail, null, 2) }] };
  });

  server.tool("show_allviews", "List all views in a model (cross-module, includes default and saved)", {
    modelId: z.string().describe("Anaplan model ID"),
    ...paginationParams,
  }, async ({ modelId, offset, limit, search }) => {
    const views = await apis.transactional.getAllViews(modelId);
    return tableResult(views, [
      { header: "Name", key: "name" },
      { header: "Module", key: "moduleName" },
      { header: "ID", key: "id" },
    ], "views", { offset, limit, search });
  });

  server.tool("show_alllineitems", "List all line items in a model (cross-module)", {
    modelId: z.string().describe("Anaplan model ID"),
    includeAll: z.boolean().optional().describe("Include full metadata (formula, format, version, appliesTo)"),
    ...paginationParams,
  }, async ({ modelId, includeAll, offset, limit, search }) => {
    const items = await apis.transactional.getAllLineItems(modelId, includeAll ?? false);
    if (includeAll) {
      return tableResult(enrichLineItems(items), [
        { header: "Name", key: "name" },
        { header: "Module", key: "moduleName" },
        { header: "Formula", key: "formulaDisplay" },
        { header: "Format", key: "formatDisplay" },
        { header: "Applies To", key: "appliesToDisplay" },
        { header: "Version", key: "versionDisplay" },
        { header: "ID", key: "id" },
      ], "line items", { offset, limit, search });
    }
    return tableResult(items, [
      { header: "Name", key: "name" },
      { header: "Module", key: "moduleName" },
      { header: "ID", key: "id" },
    ], "line items", { offset, limit, search });
  });

  server.tool("show_lineitem_dimensions", "List dimension IDs for a line item", {
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

  server.tool("show_lineitem_dimensions_items", "List dimension items for a specific line item", {
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

  // Calendar
  server.tool("show_currentperiod", "Get current period for a model", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
  }, async ({ workspaceId, modelId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const result = await apis.calendar.getCurrentPeriod(wId, mId);
    return { content: [{ type: "text" as const, text: JSON.stringify(result.currentPeriod ?? result, null, 2) }] };
  });

  server.tool("show_modelcalendar", "Get model calendar with fiscal year settings", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
  }, async ({ workspaceId, modelId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const result = await apis.calendar.getModelCalendar(wId, mId);
    return { content: [{ type: "text" as const, text: JSON.stringify(result.modelCalendar ?? result, null, 2) }] };
  });

  // Versions
  server.tool("show_versions", "List version metadata for a model", {
    modelId: z.string().describe("Anaplan model ID"),
    ...paginationParams,
  }, async ({ modelId, offset, limit, search }) => {
    const versions = await apis.versions.list(modelId);
    return tableResult(versions, [
      { header: "Name", key: "name" },
      { header: "Current", key: "isCurrent" },
      { header: "Actual", key: "isActual" },
      { header: "ID", key: "id" },
    ], "versions", { offset, limit, search });
  });

  // Users
  server.tool("show_currentuser", "Get current authenticated user info", {}, async () => {
    const user = await apis.users.getCurrentUser();
    const lines = [
      `**Name:** ${user.firstName} ${user.lastName}`,
      `**Email:** ${user.email}`,
      `**ID:** ${user.id}`,
      `**Active:** ${user.active}`,
      `**Last Login:** ${user.lastLoginDate ?? "N/A"}`,
    ];
    return { content: [{ type: "text" as const, text: lines.join("\n") }] };
  });

  server.tool("show_users", "List all users in the tenant", {
    ...paginationParams,
  }, async ({ offset, limit, search }) => {
    const users = await apis.users.list();
    return tableResult(users, [
      { header: "Name", key: "firstName" },
      { header: "Email", key: "email" },
      { header: "Active", key: "active" },
      { header: "ID", key: "id" },
    ], "users", { offset, limit, search });
  });

  server.tool("show_userdetails", "Get user details by ID", {
    userId: z.string().describe("Anaplan user ID"),
  }, async ({ userId }) => {
    const user = await apis.users.get(userId);
    return { content: [{ type: "text" as const, text: JSON.stringify(user, null, 2) }] };
  });

  // Task history (polymorphic)
  server.tool("show_tasks", "List task history for an import, export, process, or action", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    actionType: z.enum(["imports", "exports", "processes", "actions"]).describe("Type of action"),
    actionId: z.string().describe("Action ID or name"),
    ...paginationParams,
  }, async ({ workspaceId, modelId, actionType, actionId, offset, limit, search }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const resolveMap: Record<string, (wId: string, mId: string, name: string) => Promise<string>> = {
      imports: (w, m, n) => resolver.resolveImport(w, m, n),
      exports: (w, m, n) => resolver.resolveExport(w, m, n),
      processes: (w, m, n) => resolver.resolveProcess(w, m, n),
      actions: (w, m, n) => resolver.resolveAction(w, m, n),
    };
    const aId = await resolveMap[actionType](wId, mId, actionId);
    const apiMap: Record<string, { listTasks: (w: string, m: string, a: string) => Promise<any[]> }> = {
      imports: apis.imports,
      exports: apis.exports,
      processes: apis.processes,
      actions: apis.actions,
    };
    const tasks = await apiMap[actionType].listTasks(wId, mId, aId);
    return tableResult(tasks, [
      { header: "Task ID", key: "taskId" },
      { header: "State", key: "taskState" },
      { header: "Created", key: "creationTime" },
    ], "tasks", { offset, limit, search });
  });
}
