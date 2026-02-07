import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { TransactionalApi } from "../api/transactional.js";

// Cell write dimensions max: 21 per intersection (ls21)
export function registerTransactionalTools(server: McpServer, api: TransactionalApi) {
  server.tool("read_cells", "Read cell data from a module view", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    moduleId: z.string().describe("Module ID"),
    viewId: z.string().describe("Saved view ID"),
  }, async ({ workspaceId, modelId, moduleId, viewId }) => {
    const data = await api.readCells(workspaceId, modelId, moduleId, viewId);
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  });

  server.tool("write_cells", "Write values to specific cells in a module", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    moduleId: z.string().describe("Module ID"),
    lineItemId: z.string().describe("Line item ID to write to"),
    data: z.array(z.object({
      dimensions: z.record(z.string(), z.string()).describe("Dimension member names keyed by dimension name"),
      value: z.string().describe("Value to write"),
    })).describe("Array of cell values to write"),
  }, async ({ workspaceId, modelId, moduleId, lineItemId, data }) => {
    const result = await api.writeCells(workspaceId, modelId, moduleId, lineItemId, data);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("add_list_items", "Add new items to a list", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    listId: z.string().describe("List ID"),
    items: z.array(z.object({
      name: z.string().describe("Item name"),
      code: z.string().optional().describe("Item code"),
      properties: z.record(z.string(), z.string()).optional().describe("Item properties"),
    })).describe("Items to add"),
  }, async ({ workspaceId, modelId, listId, items }) => {
    const result = await api.addListItems(workspaceId, modelId, listId, items);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("update_list_items", "Update existing items in a list", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    listId: z.string().describe("List ID"),
    items: z.array(z.object({
      id: z.string().describe("Item ID"),
      name: z.string().optional().describe("New item name"),
      code: z.string().optional().describe("New item code"),
      properties: z.record(z.string(), z.string()).optional().describe("Updated properties"),
    })).describe("Items to update"),
  }, async ({ workspaceId, modelId, listId, items }) => {
    const result = await api.updateListItems(workspaceId, modelId, listId, items);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("delete_list_items", "Remove items from a list", {
    workspaceId: z.string().describe("Anaplan workspace ID"),
    modelId: z.string().describe("Anaplan model ID"),
    listId: z.string().describe("List ID"),
    items: z.array(z.object({
      id: z.string().describe("Item ID to delete"),
    })).describe("Items to delete"),
  }, async ({ workspaceId, modelId, listId, items }) => {
    const result = await api.deleteListItems(workspaceId, modelId, listId, items);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });
}
