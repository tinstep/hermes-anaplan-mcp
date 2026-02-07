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

  it("get() calls GET /workspaces/{wId}/models/{mId}/processes/{processId}", async () => {
    mockClient.get.mockResolvedValue({
      process: { id: "p1", name: "Weekly Load" },
    });
    const api = new ProcessesApi(mockClient as any);

    const result = await api.get("ws1", "m1", "p1");

    expect(mockClient.get).toHaveBeenCalledWith(
      "/workspaces/ws1/models/m1/processes/p1"
    );
    expect(result.name).toBe("Weekly Load");
  });

  it("get() unwraps when no process key", async () => {
    mockClient.get.mockResolvedValue({ id: "p1", name: "Direct" });
    const api = new ProcessesApi(mockClient as any);

    const result = await api.get("ws1", "m1", "p1");
    expect(result.name).toBe("Direct");
  });
});
