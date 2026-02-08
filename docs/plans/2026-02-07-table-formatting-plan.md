# Table Formatting Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use super-workflow:executing-plans to implement this plan task-by-task.

**Goal:** Replace raw JSON output in all listing tools with markdown tables, capped at 10 rows, names before IDs.

**Architecture:** A single `formatTable()` helper replaces `listResult()` in `exploration.ts`. Each tool passes its own column config. No API layer changes.

**Tech Stack:** TypeScript, vitest

---

### Task 1: Write formatTable helper with tests

**Files:**
- Create: `src/tools/format.ts`
- Create: `src/tools/format.test.ts`

**Step 1: Write the failing test**

Create `src/tools/format.test.ts`:

```typescript
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
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run src/tools/format.test.ts`
Expected: FAIL with "Cannot find module ./format.js"

**Step 3: Write minimal implementation**

Create `src/tools/format.ts`:

```typescript
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
```

**Step 4: Run test to verify it passes**

Run: `npx vitest run src/tools/format.test.ts`
Expected: PASS (4 tests)

**Step 5: Commit**

```bash
git add src/tools/format.ts src/tools/format.test.ts
git commit -m "feat: add formatTable helper for list tools"
```

---

### Task 2: Wire formatTable into exploration tools

**Files:**
- Modify: `src/tools/exploration.ts`

**Step 1: Write the failing test (integration)**

No separate test file needed — the existing tool registrations will be verified by typecheck + manual retest against live Anaplan.

**Step 2: Replace listResult with formatTable in exploration.ts**

Replace the `listResult` function and update all tool handlers:

1. Add `import { formatTable } from "./format.js";` at top
2. Remove the `listResult` function
3. Add a helper `tableResult()` that wraps `formatTable` in the MCP content structure
4. Update each tool to pass its column config:

```typescript
function tableResult(items: any[], columns: { header: string; key: string }[], label: string) {
  return { content: [{ type: "text" as const, text: formatTable(items, columns, label) }] };
}
```

Column configs per tool:
- `list_workspaces`: `[{ header: "Name", key: "name" }, { header: "ID", key: "id" }, { header: "Active", key: "active" }]`
- `list_models`: `[{ header: "Name", key: "name" }, { header: "ID", key: "id" }]`
- `list_modules`: `[{ header: "Name", key: "name" }, { header: "ID", key: "id" }]`
- `list_line_items`: `[{ header: "Name", key: "name" }, { header: "Module", key: "moduleName" }, { header: "ID", key: "id" }]`
- `list_views`: `[{ header: "Name", key: "name" }, { header: "Module", key: "moduleId" }, { header: "ID", key: "id" }]`
- `list_lists`: `[{ header: "Name", key: "name" }, { header: "ID", key: "id" }]`
- `get_list_items`: `[{ header: "Name", key: "name" }, { header: "ID", key: "id" }]`
- `list_imports`: `[{ header: "Name", key: "name" }, { header: "Type", key: "importType" }, { header: "ID", key: "id" }]`
- `list_exports`: `[{ header: "Name", key: "name" }, { header: "Format", key: "exportFormat" }, { header: "ID", key: "id" }]`
- `list_processes`: `[{ header: "Name", key: "name" }, { header: "ID", key: "id" }]`
- `list_files`: `[{ header: "Name", key: "name" }, { header: "Format", key: "format" }, { header: "ID", key: "id" }]`

**Step 3: Run typecheck and all tests**

Run: `npm run typecheck && npm test`
Expected: All pass

**Step 4: Commit**

```bash
git add src/tools/exploration.ts
git commit -m "feat: wire table formatting into all listing tools"
```

---

### Task 3: Manual retest against live Anaplan

Run `list_workspaces`, `list_modules`, `list_models` against the live model to verify table output renders correctly. No code changes — validation only.
