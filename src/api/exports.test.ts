import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExportsApi } from "./exports.js";

const mockClient = {
  get: vi.fn(),
  getAll: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

describe("ExportsApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockClient.get.mockReset();
    mockClient.getAll.mockReset();
  });

  it("list() calls getAll with correct path", async () => {
    mockClient.getAll.mockResolvedValue([{ id: "e1", name: "Export Report" }]);
    const api = new ExportsApi(mockClient as any);

    const result = await api.list("ws1", "m1");

    expect(mockClient.getAll).toHaveBeenCalledWith(
      "/workspaces/ws1/models/m1/exports",
      "exports"
    );
    expect(result).toEqual([{ id: "e1", name: "Export Report" }]);
  });

  it("get() calls GET /workspaces/{wId}/models/{mId}/exports/{exportId}", async () => {
    mockClient.get.mockResolvedValue({
      export: { id: "e1", name: "Export Report", exportFormat: "text/csv" },
    });
    const api = new ExportsApi(mockClient as any);

    const result = await api.get("ws1", "m1", "e1");

    expect(mockClient.get).toHaveBeenCalledWith(
      "/workspaces/ws1/models/m1/exports/e1"
    );
    expect(result.exportFormat).toBe("text/csv");
  });

  it("get() unwraps when no export key", async () => {
    mockClient.get.mockResolvedValue({ id: "e1", name: "Direct" });
    const api = new ExportsApi(mockClient as any);

    const result = await api.get("ws1", "m1", "e1");
    expect(result.name).toBe("Direct");
  });

  it("listTasks() calls GET tasks path", async () => {
    mockClient.get.mockResolvedValue({ tasks: [{ taskId: "t1" }] });
    const api = new ExportsApi(mockClient as any);
    const result = await api.listTasks("ws1", "m1", "e1");
    expect(mockClient.get).toHaveBeenCalledWith("/workspaces/ws1/models/m1/exports/e1/tasks");
    expect(result[0].taskId).toBe("t1");
  });

  it("cancelTask() calls DELETE on task", async () => {
    mockClient.delete.mockResolvedValue({});
    const api = new ExportsApi(mockClient as any);
    await api.cancelTask("ws1", "m1", "e1", "t1");
    expect(mockClient.delete).toHaveBeenCalledWith("/workspaces/ws1/models/m1/exports/e1/tasks/t1");
  });
});
