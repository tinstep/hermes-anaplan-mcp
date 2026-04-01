import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TransactionalApi } from "../api/transactional.js";
import type { NameResolver } from "../resolver.js";

// Cell write dimensions max: 21 per intersection (ls21)
export function registerTransactionalTools(server: McpServer, api: TransactionalApi, resolver: NameResolver) {
  server.tool("read_cells", "Read cell data from a module view. The viewId can be a saved view ID (from show_savedviews) or the moduleId itself (which reads the default view). For views with >1M cells, use create_view_readrequest instead.", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    moduleId: z.string().describe("Module ID or name"),
    viewId: z.string().describe("Saved view ID or name (from show_savedviews), or use the moduleId as the default viewId"),
  }, async ({ workspaceId, modelId, moduleId, viewId }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const modId = await resolver.resolveModule(wId, mId, moduleId);
    const vId = await resolver.resolveView(wId, mId, modId, viewId);
    const data = await api.readCells(wId, mId, modId, vId);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.tool("write_cells", "Write values to specific cells. Requires dimension coordinates: use show_lineitem_dimensions for dimensionIds, then show_dimensionitems or lookup_dimensionitems for itemIds.", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    moduleId: z.string().describe("Module ID or name"),
    lineItemId: z.string().describe("Line item ID to write to (from show_lineitems or show_alllineitems)"),
    data: z.array(z.object({
      dimensions: z.array(z.object({
        dimensionId: z.string().describe("Dimension ID (from show_lineitem_dimensions)"),
        itemId: z.string().describe("Item ID within the dimension (from show_dimensionitems or lookup_dimensionitems)"),
      })).describe("Array of dimension coordinates"),
      value: z.string().describe("Value to write"),
    })).describe("Array of cell values to write"),
  }, async ({ workspaceId, modelId, moduleId, lineItemId, data }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const modId = await resolver.resolveModule(wId, mId, moduleId);
    const result = await api.writeCells(wId, mId, modId, lineItemId, data);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("add_list_items", "Add new items to a list. Use show_lists to find listId. Item names must be unique within the list.", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    listId: z.string().describe("List ID or name"),
    items: z.array(z.object({
      name: z.string().describe("Item name"),
      code: z.string().optional().describe("Item code"),
      properties: z.record(z.string(), z.string()).optional().describe("Item properties"),
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
    })).describe("Items to update"),
  }, async ({ workspaceId, modelId, listId, items }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const lId = await resolver.resolveList(wId, mId, listId);
    const result = await api.updateListItems(wId, mId, lId, items);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("delete_list_items", "Remove items from a list (WARNING: irreversible). Use get_list_items to find item IDs.", {
    workspaceId: z.string().describe("Anaplan workspace ID or name"),
    modelId: z.string().describe("Anaplan model ID or name"),
    listId: z.string().describe("List ID or name"),
    items: z.array(z.object({
      id: z.string().describe("Item ID to delete (from get_list_items)"),
    })).describe("Items to delete"),
  }, async ({ workspaceId, modelId, listId, items }) => {
    const wId = await resolver.resolveWorkspace(workspaceId);
    const mId = await resolver.resolveModel(wId, modelId);
    const lId = await resolver.resolveList(wId, mId, listId);
    const result = await api.deleteListItems(wId, mId, lId, items);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });
}
