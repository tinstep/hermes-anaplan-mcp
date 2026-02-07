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
    expect(result).toContain("Showing 10 of 25 items. Narrow your search to see specific results.");
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
});
