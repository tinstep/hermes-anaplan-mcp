interface Column {
  header: string;
  key: string;
}

const MAX_ROWS = 10;

export function formatTable(items: any[], columns: Column[], label: string): string {
  if (items.length === 0) return `No ${label} found.`;

  const total = items.length;
  const display = items.slice(0, MAX_ROWS);

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

  if (total > MAX_ROWS) {
    lines.push("");
    lines.push(`Showing 10 of ${total} ${label}. Narrow your search to see specific results.`);
  } else {
    lines.push("");
    lines.push(`${total} ${label} found.`);
  }

  return lines.join("\n");
}
