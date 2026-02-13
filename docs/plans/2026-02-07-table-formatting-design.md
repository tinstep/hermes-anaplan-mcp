# Table Formatting for List Tools

## Problem
List tools return raw JSON arrays. Large results (e.g., 2,245 models) cause token overflow errors. Names are buried after IDs.

## Solution
Replace `listResult()` in `exploration.ts` with a table formatter that:
1. Renders markdown tables with resource-specific columns (name first, ID last)
2. Caps output at 10 rows with a "Showing 10 of X items. Narrow your search." message
3. Shows "No {label} found." for empty results (preserves existing behavior)

## Column Definitions

| Tool | Columns |
|------|---------|
| list_workspaces | Name, ID, Active |
| list_models | Name, ID |
| list_modules | Name, ID |
| list_line_items | Name, Module, ID |
| list_views | Name, Module, ID |
| list_lists | Name, ID |
| get_list_items | Name, ID |
| list_imports | Name, Type, ID |
| list_exports | Name, Format, ID |
| list_processes | Name, ID |
| list_files | Name, Format, ID |

## Implementation

### New helper: `formatTable(items, columns, label)`
- `columns`: array of `{ header: string, key: string }` defining which fields to show and in what order
- If items > 10, slice to first 10 and append footer: `\nShowing 10 of {total} {label}. Narrow your search to see specific results.`
- If items === 0, return `No {label} found.`
- Render as markdown table with `|` delimiters

### Changes
- **exploration.ts**: Replace `listResult()` with `formatTable()`. Each tool call passes its own column config.
- No API layer changes needed.
- No other files affected.

### Example Output
```
| Name             | ID               | Active |
|------------------|------------------|--------|
| ACG              | 8a81b09c...      | true   |
| ACG WS2          | 8a868cd9...      | true   |

2 workspaces found.
```

Large result example:
```
| Name             | ID               |
|------------------|------------------|
| Model A          | 4CC53B41...      |
| Model B          | CE2D2D2D...      |
... (8 more rows)

Showing 10 of 2,245 models. Narrow your search to see specific results.
```
