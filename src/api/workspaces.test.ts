import { describe, it, expect, vi, beforeEach } from "vitest";
import { WorkspacesApi } from "./workspaces.js";

const mockClient = {
  get: vi.fn(),
  getAll: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

describe("WorkspacesApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockClient.get.mockReset();
    mockClient.getAll.mockReset();
  });

  it("list() calls getAll with correct path and key", async () => {
    mockClient.getAll.mockResolvedValue([
      { id: "ws1", name: "My Workspace", active: true },
    ]);
    const api = new WorkspacesApi(mockClient as any);

    const result = await api.list();

    expect(mockClient.getAll).toHaveBeenCalledWith("/workspaces", "workspaces");
    expect(result).toEqual([{ id: "ws1", name: "My Workspace", active: true }]);
  });

  it("get() calls GET /workspaces/{workspaceId}", async () => {
    mockClient.get.mockResolvedValue({
      workspace: { id: "ws1", name: "Test Workspace", active: true, sizeAllowance: 1000 },
    });
    const api = new WorkspacesApi(mockClient as any);

    const result = await api.get("ws1");

    expect(mockClient.get).toHaveBeenCalledWith("/workspaces/ws1");
    expect(result.name).toBe("Test Workspace");
    expect(result.id).toBe("ws1");
  });

  it("get() unwraps response without workspace key", async () => {
    mockClient.get.mockResolvedValue({ id: "ws1", name: "Direct" });
    const api = new WorkspacesApi(mockClient as any);

    const result = await api.get("ws1");

    expect(result.name).toBe("Direct");
  });
});
