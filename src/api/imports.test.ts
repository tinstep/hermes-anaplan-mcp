import { describe, it, expect, vi, beforeEach } from "vitest";
import { ImportsApi } from "./imports.js";

const mockClient = {
  get: vi.fn(),
  getAll: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
};

describe("ImportsApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockClient.get.mockReset();
    mockClient.getAll.mockReset();
  });

  it("list() calls getAll with correct path", async () => {
    mockClient.getAll.mockResolvedValue([{ id: "i1", name: "Import Data" }]);
    const api = new ImportsApi(mockClient as any);

    const result = await api.list("ws1", "m1");

    expect(mockClient.getAll).toHaveBeenCalledWith(
      "/workspaces/ws1/models/m1/imports",
      "imports"
    );
    expect(result).toEqual([{ id: "i1", name: "Import Data" }]);
  });

  it("get() calls GET /workspaces/{wId}/models/{mId}/imports/{importId}", async () => {
    mockClient.get.mockResolvedValue({
      import: { id: "i1", name: "Import Data", importType: "MODULE_DATA" },
    });
    const api = new ImportsApi(mockClient as any);

    const result = await api.get("ws1", "m1", "i1");

    expect(mockClient.get).toHaveBeenCalledWith(
      "/workspaces/ws1/models/m1/imports/i1"
    );
    expect(result.importType).toBe("MODULE_DATA");
  });

  it("get() unwraps when no import key", async () => {
    mockClient.get.mockResolvedValue({ id: "i1", name: "Direct" });
    const api = new ImportsApi(mockClient as any);

    const result = await api.get("ws1", "m1", "i1");
    expect(result.name).toBe("Direct");
  });
});
