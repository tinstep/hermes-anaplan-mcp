interface Column {
  header: string;
  key: string;
}

export interface FormatOptions {
  offset?: number;
  limit?: number;
  search?: string;
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export function formatTable(items: any[], columns: Column[], label: string, options?: FormatOptions): string {
  if (items.length === 0) return `No ${label} found.`;

  const search = options?.search?.toLowerCase();
  const offset = Math.max(0, options?.offset ?? 0);
  const limit = Math.min(Math.max(1, options?.limit ?? DEFAULT_LIMIT), MAX_LIMIT);

  // Filter by search (case-insensitive substring on name or id)
  const filtered = search
    ? items.filter((item) => {
        const name = String(item.name ?? "").toLowerCase();
        const id = String(item.id ?? "").toLowerCase();
        return name.includes(search) || id.includes(search);
      })
    : items;

  if (filtered.length === 0) {
    return `No ${label} matching "${options!.search}". Try a different search term.`;
  }

  const total = filtered.length;
  const display = filtered.slice(offset, offset + limit);

  const headers = columns.map((c) => c.header);
  const separator = columns.map(() => "---");
  const rows = display.map((item) =>
    columns.map((c) => String(item[c.key] ?? ""))
  );

  const lines = [
    `| ${headers.join(" | ")} |`,
    `| ${separator.join(" | ")} |`,
    ...rows.map((r) => `| ${r.join(" | ")} |`),
  ];

  lines.push("");

  const start = offset + 1;
  const end = Math.min(offset + limit, total);
  const matchSuffix = search ? ` matching "${options!.search}"` : "";

  if (total <= limit && offset === 0) {
    if (search) {
      lines.push(`${total} ${label}${matchSuffix}.`);
    } else {
      lines.push(`${total} ${label} found.`);
    }
  } else {
    lines.push(`Showing ${start}-${end} of ${total} ${label}${matchSuffix}.`);
    if (!search && total > limit) {
      lines.push(`Use 'search' to filter or increase 'limit' (max ${MAX_LIMIT}).`);
    }
  }

  return lines.join("\n");
}
