import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProcessesApi } from "./processes.js";

const mockClient = {
  get: vi.fn(),
  getAll: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

describe("ProcessesApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockClient.get.mockReset();
    mockClient.getAll.mockReset();
  });

  it("list() calls getAll with correct path", async () => {
    mockClient.getAll.mockResolvedValue([{ id: "p1", name: "Weekly Load" }]);
    const api = new ProcessesApi(mockClient as any);

    const result = await api.list("ws1", "m1");

    expect(mockClient.getAll).toHaveBeenCalledWith(
      "/workspaces/ws1/models/m1/processes",
      "processes"
    );
    expect(result).toEqual([{ id: "p1", name: "Weekly Load" }]);
  });

  it("get() calls GET /models/{mId}/processes/{processId}", async () => {
    mockClient.get.mockResolvedValue({
      process: { id: "p1", name: "Weekly Load" },
    });
    const api = new ProcessesApi(mockClient as any);

    const result = await api.get("ws1", "m1", "p1");

    expect(mockClient.get).toHaveBeenCalledWith(
      "/models/m1/processes/p1"
    );
    expect(result.name).toBe("Weekly Load");
  });

  it("get() unwraps when no process key", async () => {
    mockClient.get.mockResolvedValue({ id: "p1", name: "Direct" });
    const api = new ProcessesApi(mockClient as any);

    const result = await api.get("ws1", "m1", "p1");
    expect(result.name).toBe("Direct");
  });

  it("listTasks() calls GET tasks path", async () => {
    mockClient.get.mockResolvedValue({ tasks: [{ taskId: "t1" }] });
    const api = new ProcessesApi(mockClient as any);
    const result = await api.listTasks("ws1", "m1", "p1");
    expect(mockClient.get).toHaveBeenCalledWith("/workspaces/ws1/models/m1/processes/p1/tasks");
    expect(result[0].taskId).toBe("t1");
  });

  it("cancelTask() calls DELETE on task", async () => {
    mockClient.delete.mockResolvedValue({});
    const api = new ProcessesApi(mockClient as any);
    await api.cancelTask("ws1", "m1", "p1", "t1");
    expect(mockClient.delete).toHaveBeenCalledWith("/workspaces/ws1/models/m1/processes/p1/tasks/t1");
  });

  it("getDumpChunks() calls GET on process dump chunks", async () => {
    mockClient.get.mockResolvedValue({ chunks: [{ id: "0" }] });
    const api = new ProcessesApi(mockClient as any);
    const result = await api.getDumpChunks("ws1", "m1", "p1", "t1", "obj1");
    expect(mockClient.get).toHaveBeenCalledWith("/workspaces/ws1/models/m1/processes/p1/tasks/t1/dumps/obj1/chunks");
    expect(result).toHaveLength(1);
  });

  it("getDumpChunkData() calls getRaw on chunk", async () => {
    mockClient.getRaw = vi.fn().mockResolvedValue("csv,data\n");
    const api = new ProcessesApi(mockClient as any);
    const result = await api.getDumpChunkData("ws1", "m1", "p1", "t1", "obj1", "0");
    expect(mockClient.getRaw).toHaveBeenCalledWith("/workspaces/ws1/models/m1/processes/p1/tasks/t1/dumps/obj1/chunks/0");
    expect(result).toContain("csv");
  });
});
