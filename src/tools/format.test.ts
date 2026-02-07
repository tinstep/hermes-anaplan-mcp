import { describe, it, expect } from "vitest";
import { formatTable } from "./format.js";

describe("formatTable", () => {
  it("returns empty message when no items", () => {
    const { table, footer } = formatTable([], [{ header: "Name", key: "name" }], "widgets");
    expect(table).toBe("");
    expect(footer).toBe("No widgets found.");
  });

  it("renders markdown table with row numbers and columns", () => {
    const items = [
      { name: "Alpha", id: "001" },
      { name: "Beta", id: "002" },
    ];
    const cols = [
      { header: "Name", key: "name" },
      { header: "ID", key: "id" },
    ];
    const { table, footer } = formatTable(items, cols, "things");
    expect(table).toContain("| # | Name | ID |");
    expect(table).toContain("| 1 | Alpha | 001 |");
    expect(table).toContain("| 2 | Beta | 002 |");
    expect(footer).toContain("2 things found.");
  });

  it("caps at 10 rows and shows overflow message", () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ name: `Item ${i}`, id: `${i}` }));
    const cols = [{ header: "Name", key: "name" }, { header: "ID", key: "id" }];
    const { table, footer } = formatTable(items, cols, "items");
    expect(table).toContain("| 1 | Item 0 |");
    expect(table).toContain("| 10 | Item 9 |");
    expect(table).not.toContain("| 11 |");
    expect(footer).toContain("Page 1 of 3 (1-10 of 25 items).");
  });

  it("shows missing fields as empty string", () => {
    const items = [{ name: "X" }];
    const cols = [
      { header: "Name", key: "name" },
      { header: "Type", key: "type" },
    ];
    const { table } = formatTable(items, cols, "things");
    expect(table).toContain("| 1 | X |  |");
  });

  it("filters items by search on name (case-insensitive)", () => {
    const items = [
      { name: "Revenue", id: "001" },
      { name: "Cost", id: "002" },
      { name: "Revenue Forecast", id: "003" },
    ];
    const cols = [{ header: "Name", key: "name" }, { header: "ID", key: "id" }];
    const { table, footer } = formatTable(items, cols, "modules", { search: "revenue" });
    expect(table).toContain("| 1 | Revenue | 001 |");
    expect(table).toContain("| 2 | Revenue Forecast | 003 |");
    expect(table).not.toContain("Cost");
    expect(footer).toContain('2 modules matching "revenue".');
  });

  it("filters items by search on ID", () => {
    const items = [
      { name: "Alpha", id: "abc123" },
      { name: "Beta", id: "def456" },
    ];
    const cols = [{ header: "Name", key: "name" }, { header: "ID", key: "id" }];
    const { table } = formatTable(items, cols, "items", { search: "abc" });
    expect(table).toContain("| 1 | Alpha | abc123 |");
    expect(table).not.toContain("Beta");
  });

  it("applies offset to skip items with correct row numbers", () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ name: `Item ${i}`, id: `${i}` }));
    const cols = [{ header: "Name", key: "name" }, { header: "ID", key: "id" }];
    const { table, footer } = formatTable(items, cols, "items", { offset: 10 });
    expect(table).toContain("| 11 | Item 10 |");
    expect(table).toContain("| 20 | Item 19 |");
    expect(table).not.toContain("| Item 9 |");
    expect(table).not.toContain("| Item 20 |");
    expect(footer).toContain("Page 2 of 3 (11-20 of 25 items).");
  });

  it("applies custom limit", () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ name: `Item ${i}`, id: `${i}` }));
    const cols = [{ header: "Name", key: "name" }, { header: "ID", key: "id" }];
    const { table, footer } = formatTable(items, cols, "items", { limit: 5 });
    expect(table).toContain("| 1 | Item 0 |");
    expect(table).toContain("| 5 | Item 4 |");
    expect(table).not.toContain("| 6 |");
    expect(footer).toContain("Page 1 of 5 (1-5 of 25 items).");
  });

  it("caps limit at 50", () => {
    const items = Array.from({ length: 100 }, (_, i) => ({ name: `Item ${i}`, id: `${i}` }));
    const cols = [{ header: "Name", key: "name" }, { header: "ID", key: "id" }];
    const { table, footer } = formatTable(items, cols, "items", { limit: 200 });
    expect(table).toContain("| 50 | Item 49 |");
    expect(table).not.toContain("| 51 |");
    expect(footer).toContain("Page 1 of 2 (1-50 of 100 items).");
  });

  it("combines search with offset and limit", () => {
    const items = Array.from({ length: 30 }, (_, i) => ({ name: `Rev ${i}`, id: `${i}` }));
    const cols = [{ header: "Name", key: "name" }, { header: "ID", key: "id" }];
    const { table, footer } = formatTable(items, cols, "items", { search: "Rev", offset: 5, limit: 3 });
    expect(table).toContain("| 6 | Rev 5 |");
    expect(table).toContain("| 8 | Rev 7 |");
    expect(table).not.toContain("Rev 4");
    expect(table).not.toContain("Rev 8");
    expect(footer).toContain('Page 2 of 10 (6-8 of 30 items matching "Rev").');
  });

  it("shows hint to use search for large unfiltered results", () => {
    const items = Array.from({ length: 100 }, (_, i) => ({ name: `Item ${i}`, id: `${i}` }));
    const cols = [{ header: "Name", key: "name" }, { header: "ID", key: "id" }];
    const { footer } = formatTable(items, cols, "items");
    expect(footer).toContain('Ask for "next page" for page 2, "search <term>" to filter.');
  });

  it("returns no-match message when search finds nothing", () => {
    const items = [{ name: "Alpha", id: "001" }];
    const cols = [{ header: "Name", key: "name" }, { header: "ID", key: "id" }];
    const { table, footer } = formatTable(items, cols, "items", { search: "zzz" });
    expect(table).toBe("");
    expect(footer).toBe('No items matching "zzz". Try a different search term.');
  });
});
