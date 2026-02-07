import { describe, it, expect, vi, beforeEach } from "vitest";
import { ModelsApi } from "./models.js";

const mockClient = {
  get: vi.fn(),
  getAll: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

describe("ModelsApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockClient.get.mockReset();
    mockClient.getAll.mockReset();
  });

  it("list() calls getAll with correct path and key", async () => {
    mockClient.getAll.mockResolvedValue([
      { id: "m1", name: "My Model" },
    ]);
    const api = new ModelsApi(mockClient as any);

    const result = await api.list("ws1");

    expect(mockClient.getAll).toHaveBeenCalledWith(
      "/workspaces/ws1/models",
      "models"
    );
    expect(result).toEqual([{ id: "m1", name: "My Model" }]);
  });

  it("get() calls GET /models/{modelId}", async () => {
    mockClient.get.mockResolvedValue({
      model: { id: "m1", name: "Test Model", activeState: "UNLOCKED" },
    });
    const api = new ModelsApi(mockClient as any);

    const result = await api.get("ws1", "m1");

    expect(mockClient.get).toHaveBeenCalledWith("/models/m1");
    expect(result.name).toBe("Test Model");
  });

  it("listAll() calls getAll with /models path", async () => {
    mockClient.getAll.mockResolvedValue([
      { id: "m1", name: "Model A" },
      { id: "m2", name: "Model B" },
    ]);
    const api = new ModelsApi(mockClient as any);

    const result = await api.listAll();

    expect(mockClient.getAll).toHaveBeenCalledWith("/models", "models");
    expect(result).toHaveLength(2);
  });
});
