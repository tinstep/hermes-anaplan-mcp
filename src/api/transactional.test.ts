import { describe, it, expect, vi, beforeEach } from "vitest";
import { TransactionalApi } from "./transactional.js";
import type { AnaplanClient } from "./client.js";

function mockClient() {
  return {
    get: vi.fn().mockResolvedValue({}),
    post: vi.fn().mockResolvedValue({ success: true }),
    put: vi.fn().mockResolvedValue({ success: true }),
    delete: vi.fn().mockResolvedValue({}),
    getAll: vi.fn().mockResolvedValue([]),
    uploadChunked: vi.fn().mockResolvedValue({}),
  } as unknown as AnaplanClient;
}

describe("TransactionalApi", () => {
  describe("writeCells", () => {
    it("calls POST on /models/{modelId}/modules/{moduleId}/data (no workspaces prefix)", async () => {
      const client = mockClient();
      const api = new TransactionalApi(client);

      await api.writeCells("ws1", "m1", "mod1", "li1", [
        {
          dimensions: [{ dimensionId: "dim1", itemId: "item1" }],
          value: "100",
        },
      ]);

      expect(client.post).toHaveBeenCalledWith(
        "/models/m1/modules/mod1/data",
        expect.anything()
      );
      // Ensure workspaces prefix is NOT in the path
      const calledPath = (client.post as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(calledPath).not.toContain("/workspaces/");
    });

    it("sends body as array of { lineItemId, dimensions, value }", async () => {
      const client = mockClient();
      const api = new TransactionalApi(client);

      await api.writeCells("ws1", "m1", "mod1", "li1", [
        {
          dimensions: [
            { dimensionId: "dim1", itemId: "item1" },
            { dimensionId: "dim2", itemId: "item2" },
          ],
          value: "200",
        },
        {
          dimensions: [
            { dimensionId: "dim1", itemId: "item3" },
          ],
          value: "300",
        },
      ]);

      const body = (client.post as ReturnType<typeof vi.fn>).mock.calls[0][1];
      expect(body).toEqual([
        {
          lineItemId: "li1",
          dimensions: [
            { dimensionId: "dim1", itemId: "item1" },
            { dimensionId: "dim2", itemId: "item2" },
          ],
          value: "200",
        },
        {
          lineItemId: "li1",
          dimensions: [
            { dimensionId: "dim1", itemId: "item3" },
          ],
          value: "300",
        },
      ]);
    });

    it("includes lineItemId on every element from the parameter", async () => {
      const client = mockClient();
      const api = new TransactionalApi(client);

      await api.writeCells("ws1", "m1", "mod1", "myLineItem", [
        { dimensions: [{ dimensionId: "d1", itemId: "i1" }], value: "A" },
        { dimensions: [{ dimensionId: "d1", itemId: "i2" }], value: "B" },
        { dimensions: [{ dimensionId: "d1", itemId: "i3" }], value: "C" },
      ]);

      const body = (client.post as ReturnType<typeof vi.fn>).mock.calls[0][1];
      expect(body).toHaveLength(3);
      for (const item of body) {
        expect(item.lineItemId).toBe("myLineItem");
      }
    });
  });

  describe("readCells", () => {
    it("calls GET on /models/{modelId}/views/{viewId}/data?format=v1", async () => {
      const client = mockClient();
      const api = new TransactionalApi(client);

      await api.readCells("ws1", "m1", "mod1", "v1");

      expect(client.get).toHaveBeenCalledWith("/models/m1/views/v1/data?format=v1");
      const calledPath = (client.get as ReturnType<typeof vi.fn>).mock.calls[0][0];
      expect(calledPath).not.toContain("/workspaces/");
      expect(calledPath).not.toContain("/modules/");
      expect(calledPath).toContain("format=v1");
    });

    it("truncates responses exceeding 50000 characters", async () => {
      const largeData = { bigField: "x".repeat(60000) };
      const client = mockClient();
      (client.get as ReturnType<typeof vi.fn>).mockResolvedValue(largeData);
      const api = new TransactionalApi(client);

      const result = await api.readCells("ws1", "m1", "mod1", "v1");

      expect(result._truncated).toBe(true);
      expect(result._message).toContain("Response too large");
    });
  });

  describe("getAllLineItems", () => {
    it("calls GET /models/{mId}/lineItems", async () => {
      const client = mockClient();
      (client.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        items: [{ id: "li1", name: "Revenue", moduleName: "P&L" }],
      });
      const api = new TransactionalApi(client);

      const result = await api.getAllLineItems("m1");

      expect(client.get).toHaveBeenCalledWith("/models/m1/lineItems");
      expect(result).toEqual([{ id: "li1", name: "Revenue", moduleName: "P&L" }]);
    });

    it("appends ?includeAll=true when requested", async () => {
      const client = mockClient();
      (client.get as ReturnType<typeof vi.fn>).mockResolvedValue({ items: [] });
      const api = new TransactionalApi(client);

      await api.getAllLineItems("m1", true);

      expect(client.get).toHaveBeenCalledWith("/models/m1/lineItems?includeAll=true");
    });

    it("returns empty array when no items key", async () => {
      const client = mockClient();
      (client.get as ReturnType<typeof vi.fn>).mockResolvedValue({});
      const api = new TransactionalApi(client);

      const result = await api.getAllLineItems("m1");
      expect(result).toEqual([]);
    });
  });

  describe("getLineItemDimensions", () => {
    it("calls GET /models/{mId}/lineItems/{liId}/dimensions", async () => {
      const client = mockClient();
      (client.get as ReturnType<typeof vi.fn>).mockResolvedValue({
        dimensions: [{ id: "dim1", name: "Products" }],
      });
      const api = new TransactionalApi(client);

      const result = await api.getLineItemDimensions("m1", "li1");

      expect(client.get).toHaveBeenCalledWith("/models/m1/lineItems/li1/dimensions");
      expect(result).toEqual([{ id: "dim1", name: "Products" }]);
    });
  });

  describe("getViewMetadata", () => {
    it("calls GET on /models/{modelId}/views/{viewId}", async () => {
      const viewMeta = {
        viewName: "Default View",
        viewId: "v1",
        rows: [{ id: "dim1", name: "Products" }],
        columns: [{ id: "dim2", name: "Line items" }],
        pages: [{ id: "dim3", name: "Versions" }],
      };
      const client = mockClient();
      (client.get as ReturnType<typeof vi.fn>).mockResolvedValue(viewMeta);
      const api = new TransactionalApi(client);

      const result = await api.getViewMetadata("m1", "v1");

      expect(client.get).toHaveBeenCalledWith("/models/m1/views/v1");
      expect(result.viewName).toBe("Default View");
      expect(result.rows).toHaveLength(1);
      expect(result.columns).toHaveLength(1);
      expect(result.pages).toHaveLength(1);
    });
  });
});
