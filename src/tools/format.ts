interface Column {
  header: string;
  key: string;
}

export interface FormatOptions {
  limit?: number;
  search?: string;
}

export interface FormatResult {
  table: string;
  footer: string;
}

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 1000;

export function formatTable(items: any[], columns: Column[], label: string, options?: FormatOptions): FormatResult {
  if (items.length === 0) return { table: "", footer: `No ${label} found.` };

  const search = options?.search?.toLowerCase();
  const limit = Math.min(Math.max(1, options?.limit ?? DEFAULT_LIMIT), MAX_LIMIT);
  const searchableKeys = Array.from(new Set(["name", "id", ...columns.map((c) => c.key)]));

  // Filter by search (case-insensitive substring on key fields used in table output)
  const filtered = search
    ? items.filter((item) => {
        return searchableKeys.some((key) =>
          String(item[key] ?? "").toLowerCase().includes(search)
        );
      })
    : items;

  if (filtered.length === 0) {
    return { table: "", footer: `No ${label} matching "${options!.search}". Try a different search term.` };
  }

  if (filtered.length === 1 && !search) {
    const item = filtered[0];
    const rows = columns.map((column) => `| ${column.header} | ${String(item[column.key] ?? "")} |`);
    return { table: rows.join("\n"), footer: "" };
  }

  const total = filtered.length;
  const display = filtered.slice(0, limit);

  const headers = ["#", ...columns.map((c) => c.header)];
  const separator = headers.map(() => "---");
  const rows = display.map((item, i) =>
    [String(i + 1), ...columns.map((c) => String(item[c.key] ?? ""))]
  );

  const table = [
    `| ${headers.join(" | ")} |`,
    `| ${separator.join(" | ")} |`,
    ...rows.map((r) => `| ${r.join(" | ")} |`),
  ].join("\n");

  const matchSuffix = search ? ` matching "${options!.search}"` : "";
  let footer: string;

  if (total <= limit) {
    footer = `${total} ${label}${matchSuffix}.`;
  } else {
    const remaining = total - limit;
    footer = `Showing ${limit} of ${total} ${label}${matchSuffix}. ${remaining} more not shown. Use the search parameter to filter by name.`;
  }

  return { table, footer };
}
