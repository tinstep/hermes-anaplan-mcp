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
    expect(footer).toContain("2 things.");
  });

  it("shows all items up to default limit of 50", () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ name: `Item ${i}`, id: `${i}` }));
    const cols = [{ header: "Name", key: "name" }, { header: "ID", key: "id" }];
    const { table, footer } = formatTable(items, cols, "items");
    expect(table).toContain("| 1 | Item 0 |");
    expect(table).toContain("| 25 | Item 24 |");
    expect(footer).toContain("25 items.");
  });

  it("truncates at default limit and shows remaining count", () => {
    const items = Array.from({ length: 100 }, (_, i) => ({ name: `Item ${i}`, id: `${i}` }));
    const cols = [{ header: "Name", key: "name" }, { header: "ID", key: "id" }];
    const { table, footer } = formatTable(items, cols, "items");
    expect(table).toContain("| 50 | Item 49 |");
    expect(table).not.toContain("| 51 |");
    expect(footer).toContain("Showing 50 of 100 items.");
    expect(footer).toContain("Use the search parameter to filter by name.");
  });

  it("shows missing fields as empty string", () => {
    const items = [{ name: "X" }];
    const cols = [
      { header: "Name", key: "name" },
      { header: "Type", key: "type" },
    ];
    const { table } = formatTable(items, cols, "things");
    expect(table).toContain("| Name | X |");
    expect(table).toContain("| Type |  |");
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

  it("applies custom limit", () => {
    const items = Array.from({ length: 25 }, (_, i) => ({ name: `Item ${i}`, id: `${i}` }));
    const cols = [{ header: "Name", key: "name" }, { header: "ID", key: "id" }];
    const { table, footer } = formatTable(items, cols, "items", { limit: 5 });
    expect(table).toContain("| 1 | Item 0 |");
    expect(table).toContain("| 5 | Item 4 |");
    expect(table).not.toContain("| 6 |");
    expect(footer).toContain("Showing 5 of 25 items.");
  });

  it("caps limit at 1000", () => {
    const items = Array.from({ length: 1500 }, (_, i) => ({ name: `Item ${i}`, id: `${i}` }));
    const cols = [{ header: "Name", key: "name" }, { header: "ID", key: "id" }];
    const { table, footer } = formatTable(items, cols, "items", { limit: 2000 });
    expect(table).toContain("| 1000 | Item 999 |");
    expect(table).not.toContain("| 1001 |");
    expect(footer).toContain("Showing 1000 of 1500 items.");
  });

  it("combines search with limit", () => {
    const items = Array.from({ length: 30 }, (_, i) => ({ name: `Rev ${i}`, id: `${i}` }));
    const cols = [{ header: "Name", key: "name" }, { header: "ID", key: "id" }];
    const { table, footer } = formatTable(items, cols, "items", { search: "Rev", limit: 3 });
    expect(table).toContain("| 1 | Rev 0 |");
    expect(table).toContain("| 3 | Rev 2 |");
    expect(table).not.toContain("Rev 3");
    expect(footer).toContain('Showing 3 of 30 items matching "Rev".');
  });

  it("returns no-match message when search finds nothing", () => {
    const items = [{ name: "Alpha", id: "001" }];
    const cols = [{ header: "Name", key: "name" }, { header: "ID", key: "id" }];
    const { table, footer } = formatTable(items, cols, "items", { search: "zzz" });
    expect(table).toBe("");
    expect(footer).toBe('No items matching "zzz". Try a different search term.');
  });

  it("renders single-row results as key-value rows without header/footer", () => {
    const items = [{ name: "Sales Forecast", id: "m1", activeState: "UNLOCKED" }];
    const cols = [
      { header: "Model", key: "name" },
      { header: "Model ID", key: "id" },
      { header: "State", key: "activeState" },
    ];
    const { table, footer } = formatTable(items, cols, "model details");
    expect(table).toContain("| Model | Sales Forecast |");
    expect(table).toContain("| Model ID | m1 |");
    expect(table).toContain("| State | UNLOCKED |");
    expect(table).not.toContain("| # |");
    expect(footer).toBe("");
  });

  it("searches across displayed columns, not just name/id", () => {
    const items = [
      { firstName: "Alice", email: "alice@example.com", id: "u1" },
      { firstName: "Bob", email: "bob@example.com", id: "u2" },
    ];
    const cols = [
      { header: "Name", key: "firstName" },
      { header: "Email", key: "email" },
      { header: "ID", key: "id" },
    ];
    const { table, footer } = formatTable(items, cols, "users", { search: "alice" });
    expect(table).toContain("| 1 | Alice | alice@example.com | u1 |");
    expect(table).not.toContain("Bob");
    expect(footer).toContain('1 users matching "alice".');
  });

  it("search matches on non-name columns like activeState", () => {
    const items = [
      { name: "Model A", id: "m1", activeState: "PRODUCTION" },
      { name: "Model B", id: "m2", activeState: "DEVELOPMENT" },
      { name: "Model C", id: "m3", activeState: "PRODUCTION" },
    ];
    const cols = [
      { header: "Name", key: "name" },
      { header: "ID", key: "id" },
      { header: "State", key: "activeState" },
    ];
    const { table, footer } = formatTable(items, cols, "models", { search: "PRODUCTION" });
    expect(table).toContain("Model A");
    expect(table).toContain("Model C");
    expect(table).not.toContain("Model B");
    expect(footer).toContain('2 models matching "PRODUCTION".');
  });
});
