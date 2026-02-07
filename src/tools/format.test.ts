import { describe, it, expect } from "vitest";
import { formatTable } from "./format.js";

describe("formatTable", () => {
  it("returns empty message when no items", () => {
    const result = formatTable([], [{ header: "Name", key: "name" }], "widgets");
    expect(result).toBe("No widgets found.");
  });

  it("renders markdown table with columns", () => {
    const items = [
      { name: "Alpha", id: "001" },
      { name: "Beta", id: "002" },
    ];
    const cols = [
      { header: "Name", key: "name" },
      { header: "ID", key: "id" },
    ];
    const result = formatTable(items, cols, "things");
    expect(result).toContain("| Name | ID |");
    expect(result).toContain("| Alpha | 001 |");
    expect(result).toContain("| Beta | 002 |");
    expect(result).toContain("2 things found.");
  });

  it("caps at 10 rows and shows overflow message", () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ name: `Item ${i}`, id: `${i}` }));
    const cols = [{ header: "Name", key: "name" }, { header: "ID", key: "id" }];
    const result = formatTable(items, cols, "items");
    expect(result).toContain("| Item 0 |");
    expect(result).toContain("| Item 9 |");
    expect(result).not.toContain("| Item 10 |");
    expect(result).toContain("Showing 1-10 of 25 items.");
  });

  it("shows missing fields as empty string", () => {
    const items = [{ name: "X" }];
    const cols = [
      { header: "Name", key: "name" },
      { header: "Type", key: "type" },
    ];
    const result = formatTable(items, cols, "things");
    expect(result).toContain("| X |  |");
  });

  it("filters items by search on name (case-insensitive)", () => {
    const items = [
      { name: "Revenue", id: "001" },
      { name: "Cost", id: "002" },
      { name: "Revenue Forecast", id: "003" },
    ];
    const cols = [{ header: "Name", key: "name" }, { header: "ID", key: "id" }];
    const result = formatTable(items, cols, "modules", { search: "revenue" });
    expect(result).toContain("| Revenue | 001 |");
    expect(result).toContain("| Revenue Forecast | 003 |");
    expect(result).not.toContain("| Cost |");
    expect(result).toContain('2 modules matching "revenue".');
  });

  it("filters items by search on ID", () => {
    const items = [
      { name: "Alpha", id: "abc123" },
      { name: "Beta", id: "def456" },
    ];
    const cols = [{ header: "Name", key: "name" }, { header: "ID", key: "id" }];
    const result = formatTable(items, cols, "items", { search: "abc" });
    expect(result).toContain("| Alpha | abc123 |");
    expect(result).not.toContain("| Beta |");
  });

  it("applies offset to skip items", () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ name: `Item ${i}`, id: `${i}` }));
    const cols = [{ header: "Name", key: "name" }, { header: "ID", key: "id" }];
    const result = formatTable(items, cols, "items", { offset: 10 });
    expect(result).toContain("| Item 10 |");
    expect(result).toContain("| Item 19 |");
    expect(result).not.toContain("| Item 9 |");
    expect(result).not.toContain("| Item 20 |");
    expect(result).toContain("Showing 11-20 of 25 items.");
  });

  it("applies custom limit", () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ name: `Item ${i}`, id: `${i}` }));
    const cols = [{ header: "Name", key: "name" }, { header: "ID", key: "id" }];
    const result = formatTable(items, cols, "items", { limit: 5 });
    expect(result).toContain("| Item 0 |");
    expect(result).toContain("| Item 4 |");
    expect(result).not.toContain("| Item 5 |");
    expect(result).toContain("Showing 1-5 of 25 items.");
  });

  it("caps limit at 50", () => {
    const items = Array.from({ length: 100 }, (_, i) => ({ name: `Item ${i}`, id: `${i}` }));
    const cols = [{ header: "Name", key: "name" }, { header: "ID", key: "id" }];
    const result = formatTable(items, cols, "items", { limit: 200 });
    expect(result).toContain("| Item 49 |");
    expect(result).not.toContain("| Item 50 |");
    expect(result).toContain("Showing 1-50 of 100 items.");
  });

  it("combines search with offset and limit", () => {
    const items = Array.from({ length: 30 }, (_, i) => ({ name: `Rev ${i}`, id: `${i}` }));
    const cols = [{ header: "Name", key: "name" }, { header: "ID", key: "id" }];
    const result = formatTable(items, cols, "items", { search: "Rev", offset: 5, limit: 3 });
    expect(result).toContain("| Rev 5 |");
    expect(result).toContain("| Rev 7 |");
    expect(result).not.toContain("| Rev 4 |");
    expect(result).not.toContain("| Rev 8 |");
    expect(result).toContain('Showing 6-8 of 30 items matching "Rev".');
  });

  it("shows hint to use search for large unfiltered results", () => {
    const items = Array.from({ length: 100 }, (_, i) => ({ name: `Item ${i}`, id: `${i}` }));
    const cols = [{ header: "Name", key: "name" }, { header: "ID", key: "id" }];
    const result = formatTable(items, cols, "items");
    expect(result).toContain("Use 'search' to filter or increase 'limit' (max 50).");
  });

  it("returns no-match message when search finds nothing", () => {
    const items = [{ name: "Alpha", id: "001" }];
    const cols = [{ header: "Name", key: "name" }, { header: "ID", key: "id" }];
    const result = formatTable(items, cols, "items", { search: "zzz" });
    expect(result).toBe('No items matching "zzz". Try a different search term.');
  });
});
