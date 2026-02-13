# Pagination & Search for List Tools

## Problem

List tools currently cap display at 10 rows with no way to see the rest. No search/filter capability exists. Additionally, API wrappers only fetch the first page from Anaplan — silently dropping items beyond the default page size.

## Design Decisions

- **Fetch all, paginate locally** — API wrappers auto-paginate Anaplan's API to get all items, then slice/filter client-side. Simpler tool UX.
- **Search by name or ID** — Case-insensitive substring match on `name` or `id` fields.
- **Default limit: 10, max limit: 50** — Keeps LLM context usage low. Users can increase up to 50 per page.
- **Smart footer** — Shows position and nudges toward search for large results.

## Changes

### `src/tools/format.ts`

Add `FormatOptions` interface:

```typescript
interface FormatOptions {
  offset?: number;  // default 0
  limit?: number;   // default 10, max 50
  search?: string;  // case-insensitive substring on name or id
}
```

`formatTable()` gains optional `options` param. Flow:
1. If `search` provided, filter items where `name` or `id` contains search string
2. Slice with `offset` and `limit`
3. Footer: `"Showing 1-10 of 500 list items. Use 'search' to filter or increase 'limit' (max 50)."`

### `src/api/client.ts`

Add `getAll<T>(path, key)` method:
- Loops using Anaplan's `meta.paging` response metadata
- Accumulates all pages into a single array
- Handles the `offset` + `currentPageSize` >= `totalSize` termination condition

### API Wrappers (8 files)

Switch all `list()` methods from `client.get()` to `client.getAll()`:
- `workspaces.ts`, `models.ts`, `modules.ts`, `lists.ts`
- `imports.ts`, `exports.ts`, `processes.ts`, `files.ts`
- Also `modules.ts` `listLineItems()` and `listViews()`

### Tool Registration (exploration.ts, transactional.ts)

Add three optional zod params to all 11 list tools:
- `offset: z.number().optional()`
- `limit: z.number().optional()`
- `search: z.string().optional()`

Update `tableResult()` helper to pass options to `formatTable()`.

### Tests

- `format.test.ts`: search filtering, offset/limit slicing, max cap at 50, footer messages
- `client.test.ts`: `getAll()` auto-pagination loop (single page, multi-page, empty)
- Existing tool tests: verify optional params don't break anything

## Files Touched

~12 files. No breaking changes — all new params are optional with backward-compatible defaults.
