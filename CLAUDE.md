# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run build        # Compile TypeScript to dist/
npm run dev          # Run from source with tsx
npm run typecheck    # Type-check without emitting
npm test             # Run all tests (vitest)
npm run test:watch   # Watch mode
npx vitest run src/auth/basic.test.ts           # Run single test file
npx vitest run src/auth/basic.test.ts -t "name" # Run single test by name
```

## Architecture

MCP server for Anaplan's Integration API v2. 68 tools, stdio transport, TypeScript ESM-only.

Three layers, all under `src/`:

- **auth/** - Token lifecycle. Three providers (`basic.ts`, `certificate.ts`, `oauth.ts`) implement the `AuthProvider` interface from `types.ts`. `manager.ts` selects provider from env vars (cert > oauth > basic), caches tokens, auto-refreshes 5 minutes before the 35-minute expiry.

- **api/** - HTTP layer + typed wrappers. `client.ts` handles all requests to `https://api.anaplan.com/2/0/` with retry logic (429 with Retry-After backoff, 5xx up to 3 retries, exponential backoff starting at 1000ms). Sends `Accept: application/json` on all JSON requests. `getRaw(path)` returns text responses (used for file chunk and dump downloads). `getAll(path, key)` auto-paginates list endpoints using Anaplan's `meta.paging` response metadata; `key` can be a `string | string[]` (array of fallback keys - picks the first key whose value is an array). HTTP 204/205 responses return `{}` instead of attempting JSON parse. 16 domain wrappers are thin pass-throughs per resource (`WorkspacesApi`, `ModelsApi`, `ModulesApi`, `ListsApi`, `ImportsApi`, `ExportsApi`, `ProcessesApi`, `FilesApi`, `ActionsApi`, `TransactionalApi`, `DimensionsApi`, `ModelManagementApi`, `CalendarApi`, `VersionsApi`, `UsersApi`, `LargeReadsApi`). All `list()` methods use `getAll()` to fetch every page. Detail methods (`get()`, `getMetadata()`) return single-resource responses.

- **tools/** - MCP tool registration on `McpServer`. Three files: `exploration.ts` (37 tools), `bulk.ts` (26 tools), `transactional.ts` (5 tools). Each tool uses zod-validated params. All list tools accept optional `offset`, `limit` (default 10, max 50), and `search` (case-insensitive substring on name/ID) params. List tools return markdown tables via `formatTable()` from `format.ts` which returns `{ table, footer }` as separate MCP content blocks. To discover all tool names, grep for `server.tool(` across the three files.

- **resolver.ts** - `NameResolver` class lets all 68 tools accept human-readable names alongside raw Anaplan IDs (32-char hex). Detects IDs via `/^[0-9a-fA-F]{24,}$/`, resolves names by calling the corresponding list API, caches results in-memory with 5-minute TTL. Case-insensitive matching.

- **transport/** - `CompatibleStdioServerTransport` in `compatibleStdio.ts` handles both content-length framed and line-delimited JSON-RPC over stdio, auto-detecting the framing mode.

**Wiring:** `server.ts` creates McpServer, instantiates all 16 API classes and `NameResolver` (with 9 of them), and passes APIs + resolver to all three tool registration functions. `index.ts` connects via `CompatibleStdioServerTransport`.

## Environment Variables

Auth provider is selected by priority: certificate > OAuth > basic. Set one group:

```bash
# Basic auth
ANAPLAN_USERNAME=user@example.com
ANAPLAN_PASSWORD=...

# OAuth - device grant (interactive, prompts user to authorize in browser)
ANAPLAN_CLIENT_ID=...

# OAuth - authorization code grant (non-interactive, all four required)
ANAPLAN_CLIENT_ID=...
ANAPLAN_CLIENT_SECRET=...
ANAPLAN_OAUTH_AUTHORIZATION_CODE=...
ANAPLAN_OAUTH_REDIRECT_URI=...

# Certificate auth (highest priority)
ANAPLAN_CERTIFICATE_PATH=/path/to/cert.pem
ANAPLAN_PRIVATE_KEY_PATH=/path/to/key.pem
```

## Key Constants

- **Token refresh:** 5 minutes before expiry (35-minute Anaplan token lifetime)
- **Retry:** 3 attempts, exponential backoff starting at 1000ms (1s, 2s, 4s)
- **File upload chunk size:** 50MB (52,428,800 bytes)
- **Polling interval:** 2 seconds for import/export/process task status
- **Polling timeout:** 5 minutes (300,000ms)
- **Read cells truncation:** 50,000 characters max (returns `{ _truncated: true, _message }` instead of throwing)
- **Pagination defaults:** 10 items per page, max 50

## Adding New Tools

When adding tools, follow these patterns:

- **List tools:** Use `tableResult(items, columns, label, options)` with columns ordered Name first, ID last. Spread `...paginationParams` into the zod schema and destructure `{ offset, limit, search }` from the handler.
- **Name resolution:** Every tool handler taking workspaceId/modelId/etc. must resolve names before calling APIs. Resolution is sequential: `const wId = await resolver.resolveWorkspace(workspaceId);` then use `wId` for model resolution, etc.
- **Naming convention:** Exploration tools use `show_` prefix. Bulk action tools use verb prefixes (`run_`, `set_`, `create_`, `delete_`, `download_`, `cancel_`). Transactional tools use direct verbs (`read_cells`, `write_cells`, `add_list_items`).
- **Polymorphic tools:** `show_tasks`, `cancel_task`, and `get_action_status` accept an `actionType` parameter (`imports`, `exports`, `processes`, `actions`) that routes to the correct API class.
- **Server wiring:** After adding new API classes, update `server.ts` - add instantiation, pass to the relevant `register*Tools()` function, and add to `NameResolver` if the tool needs name-to-ID resolution.

## Gotchas - Codebase

- **ESM imports:** All imports must use `.js` extensions. `import { Foo } from "./foo.js"` not `"./foo"`.
- **zod v4 records:** Use `z.record(z.string(), z.string())` for `Record<string, string>`. Single-arg `z.record(z.string())` infers `Record<string, unknown>` in zod v4.
- **Buffer in fetch:** Node's `Buffer` doesn't satisfy TypeScript's `BodyInit` type. Use `body as unknown as BodyInit` cast for chunked uploads.
- **Retry test timeouts:** Tests for client retry/backoff use real `setTimeout` delays. Add explicit vitest timeouts (`}, 30000`) to prevent premature failures.
- **Test mocking:** Tests mock `vi.spyOn(globalThis, "fetch")` - no HTTP calls, no node-fetch dependency.
- **Stale dist:** Always run `npm run build` after code changes AND before `/mcp` reconnect. The compiled `dist/` can be stale, causing MCP clients to see old tool schemas.
- **`.mcp.json` env config:** Claude Code does NOT support `envFile` in `.mcp.json`. Use inline `env` block instead. Claude Code also caches `.mcp.json` at session start - changing env values requires restarting the Claude Code session (not just `/mcp` reconnect).
- **MCP tool output rendering:** MCP tool output in Claude Code does NOT render markdown tables - only assistant response text does. Always echo table content in the response text after tool calls.
- **No vitest config file:** Vitest runs with built-in defaults. No `vitest.config.ts` exists.
- **Tool renames:** `show_lineitemdimensions` is now `show_lineitem_dimensions`, `show_lineitemdimensionitems` is now `show_lineitem_dimensions_items`.
- **`includeAll` param:** `show_lineitems` and `show_alllineitems` accept optional `includeAll` boolean. When true, fetches via transactional API and displays enriched columns (Formula, Format, Applies To, Version).
- **`setCurrentPeriod` body key:** Uses `{ date }` not `{ periodText }`.
- **Format single-record rendering:** `formatTable()` renders exactly 1 item as key-value rows instead of a table with headers. Search matches across all displayed column keys. Out-of-range offsets are clamped to the last valid page.
- **`run_export` downloads inline:** After task completion, downloads export file chunks and returns content. Supports optional `saveToDownloads` and `fileName` params to save to `~/Downloads`.

## Gotchas - Anaplan API Quirks

- **Empty API arrays:** Anaplan returns `undefined` (not `[]`) when a model has no items. `getAll()` handles this with `?? []`.
- **Accept header required:** Anaplan returns CSV by default for some endpoints without `Accept: application/json`.
- **Model GET response:** Returns `{ model: {...} }` (singular key), not `{ models: [...] }`.
- **No single-module GET:** Anaplan does not support `GET /modules/{moduleId}`. Must filter from list.
- **Users API singular key:** Response key varies between `"users"` and `"user"`. `UsersApi.list()` passes `["users", "user"]` (fallback array) to `getAll()`.
- **Transactional API paths differ from bulk:** Read cells uses `/models/{mId}/views/{viewId}/data?format=v1` (no workspaces prefix, `format=v1` for JSON). Write cells uses `/models/{mId}/modules/{moduleId}/data`. All transactional paths drop the `/workspaces/{wId}` prefix.
- **Versions API path:** Uses `/models/{mId}/versions` (no workspaces prefix). Response key varies; `VersionsApi.list()` falls back to `res.versionMetadata` if `res.versions` is undefined.
- **List item mutations:** Require `?action=add` or `?action=update` query parameter on POST/PUT.
- **List item delete:** Use batch `POST /lists/{listId}/items?action=delete` with body `{ items: [{ id: "..." }] }`. No individual DELETE.
- **update_list_items requires code:** When updating a list item that already has a `code` value set, the update must include the `code` field or Anaplan returns a 500.
- **Write cells body format:** Bare JSON array: `[{ lineItemId, dimensions: [{ dimensionId, itemId }], value }]`. Dimensions are an array of objects, NOT a Record.
- **File upload 3-step flow:** (1) POST `/files/{fileId}` with `{ chunkCount: -1 }`, (2) PUT data to `/files/{fileId}/chunks/0`, (3) POST `/files/{fileId}/complete` with `{}`.
- **File download chunks:** GET chunk list, then GET each chunk's data individually via `getRaw()`, concatenate.
- **Large volume reads:** Asynchronous - create request, poll status, download pages (CSV via `getRaw()`), then delete. Dump data from failed imports/processes is ephemeral (~48 hours).
- **Polling task states:** `COMPLETE` (success), `FAILED` (error), `CANCELLED` (aborted), `IN_PROGRESS` (keep polling).

## Anaplan API Endpoints

- Auth: `https://auth.anaplan.com/token/authenticate`
- Token refresh: `https://auth.anaplan.com/token/refresh`
- API base: `https://api.anaplan.com/2/0/`
- OAuth device flow: `https://us1a.app.anaplan.com/oauth/device/code`
- OAuth token: `https://us1a.app.anaplan.com/oauth/token`

## Orchestration Guide Resource

The server registers an MCP resource at `anaplan://orchestration-guide` that Claude reads automatically to understand tool workflows. The guide content lives in `src/resources/orchestration-guide.ts`. Update it when adding new tools or changing workflows.

## Tool Description Conventions

- Every tool description starts with what the tool does, then mentions prerequisites ("Use X first to find Y")
- Parameter descriptions include source hints ("from show_lineitems") so the LLM knows where values come from
- Key workflow tools append "Next steps" hints to their response via `withNextSteps()` from `src/tools/hints.ts`
- The 9 tools using transactional API paths (no workspace prefix) document "name resolution not supported" in both the tool description and the modelId parameter description

## Planned API Expansion

Integration API v2 is fully covered (68 tools). See `docs/plans/api-roadmap.md` for the full roadmap. Next phases add ALM, SCIM, CloudWorks, and Audit APIs - all use the same auth token from `AuthManager`. These phases can be developed in parallel since they use different base URLs and don't share wiring files.

Different base URLs:
- ALM: same as Integration API (`https://api.anaplan.com/2/0/`)
- SCIM: `https://api.anaplan.com/scim/1/0/v2/`
- CloudWorks: `https://api.cloudworks.anaplan.com/2/0/`
- Audit: `https://audit.anaplan.com/audit/api/1/`

API documentation for all phases is saved in `docs/api/` (`Integration_API.md`, `ALM_API.md`, `SCIM_API.md`, `Cloudworks_API.md`, `Audit_API.md`).

Tool selection and workflow sequencing guidance is in `docs/guides/anaplan-tool-guide.md`.

## Tool Selection — Quick Reference

**Full guide:** `docs/guides/anaplan-tool-guide.md`

### Tool Categories
- **Exploration (37):** `show_*` tools + `get_list_items`, `lookup_dimensionitems` — read-only, safe anytime
- **Bulk (26):** `run_*`, `upload_*`, `download_*`, `set_*`, `create_*`, `delete_*`, `cancel_*`, `open/close_model` — execute actions, mutate state
- **Transactional (5):** `read_cells`, `write_cells`, `add/update/delete_list_items` — direct data reads/writes

### Common Workflows

**Discover model contents:**
`show_workspaces` → `show_models` → `show_modules` / `show_lists` / `show_exports` / `show_imports`

**Read data (≤1M cells):**
`show_savedviews` → `read_cells`

**Read data (>1M cells):**
`create_view_readrequest` → poll `get_view_readrequest` → `get_view_readrequest_page` (all pages) → `delete_view_readrequest`

**Export data:**
`show_exports` → `run_export` (returns inline; `saveToDownloads=true` for file)

**Import data:**
`show_imports` → `show_importdetails` (check columns) → `show_files` → `run_import(fileId, csvData)`

**Run a process:**
`show_processes` → `run_process` → check nestedResults for per-step status

**Write cell values:**
`show_alllineitems` → `show_lineitem_dimensions` → `lookup_dimensionitems` → `write_cells`

**Manage list items:**
`show_lists` → `get_list_items` (get IDs) → `add/update/delete_list_items`

**Debug failed import:**
`show_tasks(actionType=imports)` → if `failureDumpAvailable=true` → `download_importdump`

**Debug failed process:**
`show_tasks(actionType=processes)` → get `objectId` from failed nestedResult → `download_processdump`

**Delete models:**
`close_model` (required first) → `bulk_delete_models`

### Decision Rules
1. **Name resolution order:** workspace → model → resource (chain each resolver call)
2. **Standard vs large read:** ≤1M cells → `read_cells`; >1M → `create_view_readrequest` flow. Check `show_listmetadata` (itemCount) if unsure.
3. **Export vs read_cells:** Use `run_export` when a pre-configured export exists; `read_cells` for ad-hoc view reads
4. **Import vs write_cells:** `run_import` for bulk CSV loads; `write_cells` for targeted individual cell updates
5. **Task polling:** `run_import/export/process` poll internally — only use `get_action_status` for externally-started tasks
6. **update_list_items:** Must include `code` field if the item already has a code value (Anaplan returns 500 otherwise)
7. **Destructive actions — always confirm first:** `delete_list_items`, `run_delete`, `delete_file`, `bulk_delete_models`, `set_currentperiod`, `set_fiscalyear`, `set_versionswitchover` are irreversible
8. **Model state:** If getting unexpected errors, check `show_modelstatus` — may need `open_model` first
9. **View dimension items:** Use `show_viewdimensionitems` when Selective Access may hide items; `show_dimensionitems` for all items unconditionally
