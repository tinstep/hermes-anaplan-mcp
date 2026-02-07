import { describe, it, expect, vi, beforeEach } from "vitest";
import { ListsApi } from "./lists.js";

const mockClient = {
  get: vi.fn(),
  getAll: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

describe("ListsApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockClient.get.mockReset();
    mockClient.getAll.mockReset();
  });

  it("list() calls getAll with correct path", async () => {
    mockClient.getAll.mockResolvedValue([{ id: "l1", name: "Products" }]);
    const api = new ListsApi(mockClient as any);

    const result = await api.list("ws1", "m1");

    expect(mockClient.getAll).toHaveBeenCalledWith(
      "/workspaces/ws1/models/m1/lists",
      "lists"
    );
    expect(result).toEqual([{ id: "l1", name: "Products" }]);
  });

  it("getMetadata() calls GET /workspaces/{wId}/models/{mId}/lists/{listId}", async () => {
    mockClient.get.mockResolvedValue({
      metadata: { id: "l1", name: "Products", itemCount: 42, hasSelectiveAccess: false },
    });
    const api = new ListsApi(mockClient as any);

    const result = await api.getMetadata("ws1", "m1", "l1");

    expect(mockClient.get).toHaveBeenCalledWith(
      "/workspaces/ws1/models/m1/lists/l1"
    );
    expect(result.itemCount).toBe(42);
  });

  it("getMetadata() unwraps when no metadata key", async () => {
    mockClient.get.mockResolvedValue({ id: "l1", name: "Products" });
    const api = new ListsApi(mockClient as any);

    const result = await api.getMetadata("ws1", "m1", "l1");

    expect(result.name).toBe("Products");
  });
});
