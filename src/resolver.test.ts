import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NameResolver } from "./resolver.js";

function makeMockApis() {
  return {
    workspaces: { list: vi.fn().mockResolvedValue([]) },
    models: { list: vi.fn().mockResolvedValue([]) },
    modules: { list: vi.fn().mockResolvedValue([]), listViews: vi.fn().mockResolvedValue([]) },
    lists: { list: vi.fn().mockResolvedValue([]) },
    imports: { list: vi.fn().mockResolvedValue([]) },
    exports: { list: vi.fn().mockResolvedValue([]) },
    processes: { list: vi.fn().mockResolvedValue([]) },
    files: { list: vi.fn().mockResolvedValue([]) },
  };
}

const HEX_ID = "8a81b09c654f3e16016579eb3e8860b4";

describe("NameResolver", () => {
  describe("looksLikeId", () => {
    it("returns true for 32-char hex string", () => {
      expect(NameResolver.looksLikeId(HEX_ID)).toBe(true);
    });

    it("returns true for uppercase hex", () => {
      expect(NameResolver.looksLikeId(HEX_ID.toUpperCase())).toBe(true);
    });

    it("returns false for short strings", () => {
      expect(NameResolver.looksLikeId("abc123")).toBe(false);
    });

    it("returns false for human-readable names", () => {
      expect(NameResolver.looksLikeId("ACG")).toBe(false);
      expect(NameResolver.looksLikeId("My Workspace")).toBe(false);
      expect(NameResolver.looksLikeId("Revenue Model")).toBe(false);
    });

    it("returns false for strings with non-hex chars", () => {
      expect(NameResolver.looksLikeId("8a81b09c654f3e16016579eb3e8860zz")).toBe(false);
    });
  });

  describe("resolveWorkspace", () => {
    it("passes through IDs without calling API", async () => {
      const apis = makeMockApis();
      const resolver = new NameResolver(apis);
      const result = await resolver.resolveWorkspace(HEX_ID);
      expect(result).toBe(HEX_ID);
      expect(apis.workspaces.list).not.toHaveBeenCalled();
    });

    it("resolves name to ID", async () => {
      const apis = makeMockApis();
      apis.workspaces.list.mockResolvedValue([{ id: HEX_ID, name: "ACG" }]);
      const resolver = new NameResolver(apis);
      const result = await resolver.resolveWorkspace("ACG");
      expect(result).toBe(HEX_ID);
      expect(apis.workspaces.list).toHaveBeenCalledTimes(1);
    });

    it("resolves names case-insensitively", async () => {
      const apis = makeMockApis();
      apis.workspaces.list.mockResolvedValue([{ id: HEX_ID, name: "ACG" }]);
      const resolver = new NameResolver(apis);
      expect(await resolver.resolveWorkspace("acg")).toBe(HEX_ID);
      expect(await resolver.resolveWorkspace("Acg")).toBe(HEX_ID);
    });

    it("caches list results on second call", async () => {
      const apis = makeMockApis();
      apis.workspaces.list.mockResolvedValue([{ id: HEX_ID, name: "ACG" }]);
      const resolver = new NameResolver(apis);
      await resolver.resolveWorkspace("ACG");
      await resolver.resolveWorkspace("ACG");
      expect(apis.workspaces.list).toHaveBeenCalledTimes(1);
    });

    it("re-fetches after cache TTL expires", async () => {
      vi.useFakeTimers();
      const apis = makeMockApis();
      apis.workspaces.list.mockResolvedValue([{ id: HEX_ID, name: "ACG" }]);
      const resolver = new NameResolver(apis);
      await resolver.resolveWorkspace("ACG");
      vi.advanceTimersByTime(5 * 60 * 1000 + 1);
      await resolver.resolveWorkspace("ACG");
      expect(apis.workspaces.list).toHaveBeenCalledTimes(2);
      vi.useRealTimers();
    });

    it("throws descriptive error when name not found", async () => {
      const apis = makeMockApis();
      apis.workspaces.list.mockResolvedValue([{ id: HEX_ID, name: "ACG" }]);
      const resolver = new NameResolver(apis);
      await expect(resolver.resolveWorkspace("NonExistent")).rejects.toThrow(
        "Workspace 'NonExistent' not found. Use show_workspaces to see available names."
      );
    });
  });

  describe("resolveModel", () => {
    it("resolves model name using workspace ID", async () => {
      const apis = makeMockApis();
      const modelId = "aabbccddee112233445566778899aabb";
      apis.models.list.mockResolvedValue([{ id: modelId, name: "Revenue Model" }]);
      const resolver = new NameResolver(apis);
      const result = await resolver.resolveModel("wId123", "Revenue Model");
      expect(result).toBe(modelId);
      expect(apis.models.list).toHaveBeenCalledWith("wId123");
    });

    it("uses separate cache keys per workspace", async () => {
      const apis = makeMockApis();
      apis.models.list
        .mockResolvedValueOnce([{ id: "id1id1id1id1id1id1id1id1id1id1id", name: "Model A" }])
        .mockResolvedValueOnce([{ id: "id2id2id2id2id2id2id2id2id2id2id", name: "Model A" }]);
      const resolver = new NameResolver(apis);
      const r1 = await resolver.resolveModel("ws1", "Model A");
      const r2 = await resolver.resolveModel("ws2", "Model A");
      expect(r1).toBe("id1id1id1id1id1id1id1id1id1id1id");
      expect(r2).toBe("id2id2id2id2id2id2id2id2id2id2id");
      expect(apis.models.list).toHaveBeenCalledTimes(2);
    });
  });

  describe("resolveView", () => {
    it("resolves view name using workspace, model, and module IDs", async () => {
      const apis = makeMockApis();
      const viewId = "aabbccddee112233445566778899aabb";
      apis.modules.listViews.mockResolvedValue([{ id: viewId, name: "Default View" }]);
      const resolver = new NameResolver(apis);
      const result = await resolver.resolveView("wId", "mId", "modId", "Default View");
      expect(result).toBe(viewId);
      expect(apis.modules.listViews).toHaveBeenCalledWith("wId", "mId", "modId");
    });
  });
});
