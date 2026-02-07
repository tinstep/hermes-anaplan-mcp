import { describe, it, expect, vi, beforeEach } from "vitest";
import { FilesApi } from "./files.js";

const mockClient = {
  get: vi.fn(),
  getAll: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  getRaw: vi.fn(),
  uploadChunked: vi.fn(),
};

describe("FilesApi", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockClient.get.mockReset();
    mockClient.getRaw.mockReset();
  });

  describe("download", () => {
    it("fetches chunk list then each chunk's data and concatenates", async () => {
      mockClient.get.mockResolvedValue({
        chunks: [
          { id: "0", name: "chunk0" },
          { id: "1", name: "chunk1" },
        ],
      });
      mockClient.getRaw
        .mockResolvedValueOnce("Header,Col1\n")
        .mockResolvedValueOnce("Row1,Val1\n");

      const api = new FilesApi(mockClient as any);
      const result = await api.download("ws1", "m1", "f1");

      expect(result).toBe("Header,Col1\nRow1,Val1\n");
      expect(mockClient.get).toHaveBeenCalledWith(
        "/workspaces/ws1/models/m1/files/f1/chunks"
      );
      expect(mockClient.getRaw).toHaveBeenCalledWith(
        "/workspaces/ws1/models/m1/files/f1/chunks/0"
      );
      expect(mockClient.getRaw).toHaveBeenCalledWith(
        "/workspaces/ws1/models/m1/files/f1/chunks/1"
      );
    });

    it("returns empty string when file has no chunks", async () => {
      mockClient.get.mockResolvedValue({});

      const api = new FilesApi(mockClient as any);
      const result = await api.download("ws1", "m1", "f1");

      expect(result).toBe("");
      expect(mockClient.getRaw).not.toHaveBeenCalled();
    });

    it("handles single chunk file", async () => {
      mockClient.get.mockResolvedValue({
        chunks: [{ id: "0", name: "chunk0" }],
      });
      mockClient.getRaw.mockResolvedValueOnce("all data here");

      const api = new FilesApi(mockClient as any);
      const result = await api.download("ws1", "m1", "f1");

      expect(result).toBe("all data here");
      expect(mockClient.getRaw).toHaveBeenCalledTimes(1);
    });
  });

  describe("delete", () => {
    beforeEach(() => {
      mockClient.delete.mockReset();
    });

    it("calls DELETE /workspaces/{wId}/models/{mId}/files/{fileId}", async () => {
      mockClient.delete.mockResolvedValue({});
      const api = new FilesApi(mockClient as any);

      await api.delete("ws1", "m1", "f1");

      expect(mockClient.delete).toHaveBeenCalledWith(
        "/workspaces/ws1/models/m1/files/f1"
      );
    });
  });
});
