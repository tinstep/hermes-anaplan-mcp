import { describe, it, expect, vi, beforeEach } from "vitest";
import { DimensionsApi } from "./dimensions.js";

const mockClient = {
  get: vi.fn(),
  getAll: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

describe("DimensionsApi", () => {
  let api: DimensionsApi;

  beforeEach(() => {
    vi.restoreAllMocks();
    mockClient.get.mockReset();
    mockClient.post.mockReset();
    api = new DimensionsApi(mockClient as any);
  });

  it("getAllItems() calls GET /models/{mId}/dimensions/{dimId}/items", async () => {
    mockClient.get.mockResolvedValue({
      items: [{ id: "1", name: "North", code: "N" }],
    });

    const result = await api.getAllItems("m1", "dim1");

    expect(mockClient.get).toHaveBeenCalledWith("/models/m1/dimensions/dim1/items");
    expect(result).toEqual([{ id: "1", name: "North", code: "N" }]);
  });

  it("getAllItems() returns empty array when no items key", async () => {
    mockClient.get.mockResolvedValue({});

    const result = await api.getAllItems("m1", "dim1");

    expect(result).toEqual([]);
  });

  it("getSelectedItems() calls GET /models/{mId}/views/{vId}/dimensions/{dimId}/items", async () => {
    mockClient.get.mockResolvedValue({
      items: [{ id: "2", name: "Q1", code: "Q1" }],
    });

    const result = await api.getSelectedItems("m1", "v1", "dim1");

    expect(mockClient.get).toHaveBeenCalledWith(
      "/models/m1/views/v1/dimensions/dim1/items"
    );
    expect(result).toEqual([{ id: "2", name: "Q1", code: "Q1" }]);
  });

  it("lookupByNameOrCode() calls POST with names/codes body", async () => {
    mockClient.post.mockResolvedValue({
      items: [{ id: "1", name: "North", code: "N" }],
    });

    const result = await api.lookupByNameOrCode(
      "ws1", "m1", "dim1", ["North"], undefined
    );

    expect(mockClient.post).toHaveBeenCalledWith(
      "/workspaces/ws1/models/m1/dimensions/dim1/items",
      { names: ["North"], codes: undefined }
    );
    expect(result).toEqual([{ id: "1", name: "North", code: "N" }]);
  });

  it("lookupByNameOrCode() works with codes", async () => {
    mockClient.post.mockResolvedValue({
      items: [{ id: "1", name: "North", code: "N" }],
    });

    const result = await api.lookupByNameOrCode(
      "ws1", "m1", "dim1", undefined, ["N"]
    );

    expect(mockClient.post).toHaveBeenCalledWith(
      "/workspaces/ws1/models/m1/dimensions/dim1/items",
      { names: undefined, codes: ["N"] }
    );
    expect(result).toEqual([{ id: "1", name: "North", code: "N" }]);
  });

  it("getLineItemDimensionItems() calls correct path", async () => {
    mockClient.get.mockResolvedValue({
      items: [{ id: "3", name: "East" }],
    });

    const result = await api.getLineItemDimensionItems("m1", "li1", "dim1");

    expect(mockClient.get).toHaveBeenCalledWith(
      "/models/m1/lineItems/li1/dimensions/dim1/items"
    );
    expect(result).toEqual([{ id: "3", name: "East" }]);
  });
});
