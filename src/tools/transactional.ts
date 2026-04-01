import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TransactionalApi } from "../api/transactional.js";
import type { NameResolver } from "../resolver.js";

// Cell write dimensions max: 21 per intersection (ls21)
export function registerTransactionalTools(server: McpServer, api: TransactionalApi, resolver: NameResolver) {
  server.tool("read_cells", "Read cell data from a module view. Use pages param to select specific page dimensions. For reports across ALL products/customers, use run_export instead -- do NOT call read_cells in a loop per item. viewId can be a saved view or moduleId (default). For >1M cells, use create_view_readrequest.", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    moduleId: z.string().describe("Module ID or name"),
    viewId: z.string().describe("Saved view ID or name (from show_savedviews), or use the moduleId as the default viewId"),
    pages: z.array(z.object({ dimensionId: z.string(), itemId: z.string() })).optional().describe("Page dimension selections to filter data (from show_viewdetails pages). Each entry selects a specific item on a page dimension."),
    maxRows: z.number().optional().describe("Limit the number of data rows returned"),
    exportType: z.enum(["GRID_CURRENT_PAGE", "GRID_ALL_PAGES", "TABULAR_SINGLE_COLUMN", "TABULAR_MULTI_COLUMN"]).optional().describe("CSV export layout type (requires moduleId)"),
    exportModuleId: z.string().optional().describe("Module ID required when using exportType"),
  }, async ({ workspaceId, modelId, moduleId, viewId, pages, maxRows, exportType, exportModuleId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const modId = await resolver.resolveModule(wId, mId, moduleId);
    const vId = await resolver.resolveView(wId, mId, modId, viewId);
    const data = await api.readCells(wId, mId, modId, vId, { pages, maxRows, exportType, moduleId: exportModuleId });
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.tool("write_cells", "Write values to specific cells. Supports both ID-based and name-based targeting: use lineItemName/dimensionName/itemName instead of IDs to skip the dimension resolution chain. For ID-based writes, use show_lineitem_dimensions then show_dimensionitems.", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    moduleId: z.string().describe("Module ID or name"),
    data: z.array(z.object({
      lineItemId: z.string().optional().describe("Line item ID (from show_lineitems)"),
      lineItemName: z.string().optional().describe("Line item name (alternative to lineItemId)"),
      dimensions: z.array(z.object({
        dimensionId: z.string().optional().describe("Dimension ID (from show_lineitem_dimensions)"),
        dimensionName: z.string().optional().describe("Dimension name (alternative to dimensionId)"),
        itemId: z.string().optional().describe("Item ID (from show_dimensionitems)"),
        itemName: z.string().optional().describe("Item name (alternative to itemId)"),
        itemCode: z.string().optional().describe("Item code (alternative to itemId/itemName)"),
      })).describe("Dimension coordinates (use IDs or names)"),
      value: z.union([z.string(), z.number(), z.boolean()]).describe("Value to write"),
    })).describe("Cell values to write. Supports both ID-based and name-based targeting."),
  }, async ({ workspaceId, modelId, moduleId, data }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const modId = await resolver.resolveModule(wId, mId, moduleId);
    const result = await api.writeCells(wId, mId, modId, "", data);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("add_list_items", "Add new items to a list. Supports parent (hierarchy placement) and subsets (subset membership). Use show_lists to find listId. Item names must be unique.", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    listId: z.string().describe("List ID or name"),
    items: z.array(z.object({
      name: z.string().describe("Item name"),
      code: z.string().optional().describe("Item code"),
      properties: z.record(z.string(), z.string()).optional().describe("Item properties"),
      parent: z.string().optional().describe("Parent item name for hierarchy placement"),
      subsets: z.record(z.string(), z.boolean()).optional().describe("Subset membership (subset name -> true/false)"),
    })).describe("Items to add"),
  }, async ({ workspaceId, modelId, listId, items }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const lId = await resolver.resolveList(wId, mId, listId);
    const result = await api.addListItems(wId, mId, lId, items);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("update_list_items", "Update existing items in a list. Use get_list_items to find item IDs. Important: if an item has a code value, you must include the code field in the update or Anaplan returns an error.", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    listId: z.string().describe("List ID or name"),
    items: z.array(z.object({
      id: z.string().describe("Item ID (from get_list_items)"),
      name: z.string().optional().describe("New item name"),
      code: z.string().optional().describe("New item code"),
      properties: z.record(z.string(), z.string()).optional().describe("Updated properties"),
      parent: z.string().optional().describe("Parent item name for hierarchy placement"),
      subsets: z.record(z.string(), z.boolean()).optional().describe("Subset membership (subset name -> true/false)"),
    })).describe("Items to update"),
  }, async ({ workspaceId, modelId, listId, items }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const lId = await resolver.resolveList(wId, mId, listId);
    const result = await api.updateListItems(wId, mId, lId, items);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("delete_list_items", "Remove items from a list (WARNING: irreversible). Specify id or code for each item. Use get_list_items to find values.", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    listId: z.string().describe("List ID or name"),
    items: z.array(z.object({
      id: z.string().optional().describe("Item ID to delete (from get_list_items)"),
      code: z.string().optional().describe("Item code to delete (alternative to id)"),
    })).describe("Items to delete (specify id or code for each)"),
  }, async ({ workspaceId, modelId, listId, items }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const lId = await resolver.resolveList(wId, mId, listId);
    const result = await api.deleteListItems(wId, mId, lId, items);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });
}
