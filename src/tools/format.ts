interface Column {
  header: string;
  key: string;
}

export interface FormatOptions {
  offset?: number;
  limit?: number;
  search?: string;
}

export interface FormatResult {
  table: string;
  footer: string;
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export function formatTable(items: any[], columns: Column[], label: string, options?: FormatOptions): FormatResult {
  if (items.length === 0) return { table: "", footer: `No ${label} found.` };

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
    return { table: "", footer: `No ${label} matching "${options!.search}". Try a different search term.` };
  }

  const total = filtered.length;
  const display = filtered.slice(offset, offset + limit);

  const headers = ["#", ...columns.map((c) => c.header)];
  const separator = headers.map(() => "---");
  const rows = display.map((item, i) =>
    [String(offset + i + 1), ...columns.map((c) => String(item[c.key] ?? ""))]
  );

  const table = [
    `| ${headers.join(" | ")} |`,
    `| ${separator.join(" | ")} |`,
    ...rows.map((r) => `| ${r.join(" | ")} |`),
  ].join("\n");

  const footerLines: string[] = [];
  const start = offset + 1;
  const end = Math.min(offset + limit, total);
  const matchSuffix = search ? ` matching "${options!.search}"` : "";
  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  if (total <= limit && offset === 0) {
    if (search) {
      footerLines.push(`${total} ${label}${matchSuffix}.`);
    } else {
      footerLines.push(`${total} ${label} found.`);
    }
  } else {
    footerLines.push(`Page ${currentPage} of ${totalPages} (${start}-${end} of ${total} ${label}${matchSuffix}).`);
    const hints: string[] = [];
    if (currentPage < totalPages) hints.push(`"next page" for page ${currentPage + 1}`);
    if (currentPage > 1) hints.push(`"previous page" for page ${currentPage - 1}`);
    if (!search) hints.push(`"search <term>" to filter`);
    if (hints.length > 0) footerLines.push(`Ask for ${hints.join(", ")}.`);
  }

  return { table, footer: footerLines.join("\n") };
}
