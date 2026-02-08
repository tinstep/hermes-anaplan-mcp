import { describe, it, expect, vi, beforeEach } from "vitest";
import { ActionsApi } from "./actions.js";

const mockClient = {
  get: vi.fn(),
  getAll: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

describe("ActionsApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockClient.getAll.mockReset();
  });

  it("calls getAll with correct path and key", async () => {
    mockClient.getAll.mockResolvedValue([
      { id: "act1", name: "Delete Old Data", actionType: "DELETE" },
    ]);
    const api = new ActionsApi(mockClient as any);

    const result = await api.list("ws1", "m1");

    expect(mockClient.getAll).toHaveBeenCalledWith(
      "/workspaces/ws1/models/m1/actions",
      "actions"
    );
    expect(result).toEqual([
      { id: "act1", name: "Delete Old Data", actionType: "DELETE" },
    ]);
  });

  it("returns empty array when no actions exist", async () => {
    mockClient.getAll.mockResolvedValue([]);
    const api = new ActionsApi(mockClient as any);

    const result = await api.list("ws1", "m1");
    expect(result).toEqual([]);
  });

  it("get() calls GET /workspaces/{wId}/models/{mId}/actions/{actionId}", async () => {
    mockClient.get.mockResolvedValue({
      action: { id: "act1", name: "Delete Old Data", actionType: "DELETE" },
    });
    const api = new ActionsApi(mockClient as any);

    const result = await api.get("ws1", "m1", "act1");

    expect(mockClient.get).toHaveBeenCalledWith(
      "/workspaces/ws1/models/m1/actions/act1"
    );
    expect(result.actionType).toBe("DELETE");
  });

  it("get() unwraps when no action key", async () => {
    mockClient.get.mockResolvedValue({ id: "act1", name: "Direct" });
    const api = new ActionsApi(mockClient as any);

    const result = await api.get("ws1", "m1", "act1");
    expect(result.name).toBe("Direct");
  });

  it("listTasks() calls GET tasks path", async () => {
    mockClient.get.mockResolvedValue({ tasks: [{ taskId: "t1" }] });
    const api = new ActionsApi(mockClient as any);
    const result = await api.listTasks("ws1", "m1", "a1");
    expect(mockClient.get).toHaveBeenCalledWith("/workspaces/ws1/models/m1/actions/a1/tasks");
    expect(result[0].taskId).toBe("t1");
  });

  it("cancelTask() calls DELETE on task", async () => {
    mockClient.delete.mockResolvedValue({});
    const api = new ActionsApi(mockClient as any);
    await api.cancelTask("ws1", "m1", "a1", "t1");
    expect(mockClient.delete).toHaveBeenCalledWith("/workspaces/ws1/models/m1/actions/a1/tasks/t1");
  });
});
