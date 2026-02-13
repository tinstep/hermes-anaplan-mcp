# Phase 2: Complete Anaplan Integration API v2 Coverage

> **For Claude:** REQUIRED SUB-SKILL: Use super-workflow:executing-plans to implement this plan task-by-task.

**Goal:** Cover all remaining Anaplan Integration API v2 endpoints from the [Apiary docs](https://anaplan.docs.apiary.io/), bringing the MCP server from ~31 endpoints / 27 tools to full API coverage.

**Architecture:** Follow the existing 3-layer pattern: new API wrappers in `src/api/` (thin classes wrapping `AnaplanClient`), tools registered in `src/tools/exploration.ts` (show_* with pagination) or new tool files for model management/calendar/versions. All new tools accept human-readable names via `NameResolver`.

**Tech Stack:** TypeScript ESM, zod v4 params, vitest tests, `vi.spyOn(globalThis, "fetch")` mocking.

---

## Task Groups

The missing endpoints are organized into 8 task groups by priority. Each group is independently shippable — commit after each group passes typecheck + tests.

### Priority Legend
- **P0** = High-value for daily use (metadata, dimensions, diagnostics)
- **P1** = Important for operational workflows (model management, calendar)
- **P2** = Nice to have for completeness (large volume reads, reset index)

---

### Task 1: Workspace & Model Metadata Gaps (P0)

**New endpoints:**
- `GET /workspaces/{wId}` — single workspace detail
- `GET /models` — list ALL models cross-workspace
- `POST /workspaces/{wId}/models/{mId}/status` — check model status

**Files:**
- Modify: `src/api/workspaces.ts` — add `get(workspaceId)` method
- Modify: `src/api/models.ts` — add `listAll()` method (no workspace param)
- Create: `src/api/modelManagement.ts` — new class for status/close/open/bulkDelete
- Modify: `src/tools/exploration.ts` — add `show_workspacedetails`, `show_allmodels`, `show_modelstatus` tools
- Modify: `src/server.ts` — wire `ModelManagementApi`
- Test: `src/api/workspaces.test.ts` (new), `src/api/models.test.ts` (new), `src/api/modelManagement.test.ts` (new)

**Step 1: Write failing tests for workspace get and model listAll**

```typescript
// src/api/workspaces.test.ts
it("get() calls GET /workspaces/{workspaceId}", async () => {
  mockClient.get.mockResolvedValue({ workspace: { id: "ws1", name: "Test" } });
  const api = new WorkspacesApi(mockClient as any);
  const result = await api.get("ws1");
  expect(mockClient.get).toHaveBeenCalledWith("/workspaces/ws1");
  expect(result.name).toBe("Test");
});
```

**Step 2: Implement `get()` on WorkspacesApi**

```typescript
async get(workspaceId: string) {
  const res = await this.client.get<any>(`/workspaces/${workspaceId}`);
  return res.workspace ?? res;
}
```

**Step 3: Implement `listAll()` on ModelsApi**

```typescript
async listAll() {
  return this.client.getAll<any>("/models", "models");
}
```

**Step 4: Create `ModelManagementApi` with `getStatus()`**

```typescript
// src/api/modelManagement.ts
import type { AnaplanClient } from "./client.js";

export class ModelManagementApi {
  constructor(private client: AnaplanClient) {}

  async getStatus(workspaceId: string, modelId: string) {
    return this.client.post<any>(
      `/workspaces/${workspaceId}/models/${modelId}/status`
    );
  }
}
```

**Step 5: Register tools — `show_workspacedetails`, `show_allmodels`, `show_modelstatus`**

- `show_workspacedetails(workspaceId)` → calls `workspaces.get(wId)`, returns JSON detail
- `show_allmodels(offset, limit, search)` → calls `models.listAll()`, returns paginated table
- `show_modelstatus(workspaceId, modelId)` → calls `modelManagement.getStatus(wId, mId)`, returns JSON

**Step 6: Run tests, typecheck, commit**

```bash
npm run typecheck && npm test
git commit -m "feat: add workspace detail, all-models, model status tools"
```

---

### Task 2: Model Management Operations (P1)

**New endpoints:**
- `POST /workspaces/{wId}/models/{mId}/close` — close model
- `POST /workspaces/{wId}/models/{mId}/open` — wake up model
- `POST /workspaces/{wId}/bulkDeleteModels` — bulk delete models

**Files:**
- Modify: `src/api/modelManagement.ts` — add `close()`, `open()`, `bulkDelete()` methods
- Modify: `src/tools/exploration.ts` or new `src/tools/management.ts` — add `close_model`, `open_model`, `bulk_delete_models` tools
- Test: `src/api/modelManagement.test.ts`

**Note:** `close_model`, `open_model`, and `bulk_delete_models` are destructive operations. Tool descriptions should include warnings. `bulk_delete_models` requires models to be closed first.

**Step 1: Write tests**

```typescript
it("close() calls POST on /workspaces/{wId}/models/{mId}/close", async () => {
  mockClient.post.mockResolvedValue({});
  await api.close("ws1", "m1");
  expect(mockClient.post).toHaveBeenCalledWith("/workspaces/ws1/models/m1/close");
});

it("open() calls POST on /workspaces/{wId}/models/{mId}/open", async () => {
  mockClient.post.mockResolvedValue({});
  await api.open("ws1", "m1");
  expect(mockClient.post).toHaveBeenCalledWith("/workspaces/ws1/models/m1/open");
});

it("bulkDelete() calls POST with model IDs", async () => {
  mockClient.post.mockResolvedValue({ modelsDeleted: 2, bulkDeleteModelsFailures: [] });
  await api.bulkDelete("ws1", ["m1", "m2"]);
  expect(mockClient.post).toHaveBeenCalledWith(
    "/workspaces/ws1/bulkDeleteModels",
    { modelIdsToDelete: ["m1", "m2"] }
  );
});
```

**Step 2: Implement methods**

**Step 3: Register tools with warning descriptions**

**Step 4: Run tests, typecheck, commit**

---

### Task 3: Line Item & Dimension Metadata (P0)

**New endpoints:**
- `GET /models/{mId}/lineItems` — all line items in model (cross-module)
- `GET /models/{mId}/lineItems?includeAll=true` — full line item metadata
- `GET /models/{mId}/lineItems/{liId}/dimensions` — dimension IDs for a line item
- `GET /models/{mId}/dimensions/{dimId}/items` — all items in a dimension (model-level)
- `GET /models/{mId}/views/{viewId}/dimensions/{dimId}/items` — selected items in a dimension (view-level, respects filters)
- `POST /workspaces/{wId}/models/{mId}/dimensions/{dimId}/items` — lookup dimension items by name or code
- `GET /models/{mId}/lineItems/{liId}/dimensions/{dimId}/items` — dimension items for a line item

**Files:**
- Create: `src/api/dimensions.ts` — new `DimensionsApi` class for dimension-level operations
- Modify: `src/api/transactional.ts` — add line-item-level methods (they use the same no-workspace path pattern)
- Modify: `src/tools/exploration.ts` — add tools: `show_alllineitems`, `show_lineitemdimensions`, `show_dimensionitems`, `show_viewdimensionitems`, `lookup_dimensionitems`, `show_lineitemdimensionitems`
- Modify: `src/server.ts` — wire `DimensionsApi`
- Modify: `src/resolver.ts` — optional: add `resolveDimension()`
- Test: `src/api/dimensions.test.ts` (new)

**API notes:**
- `GET /models/{mId}/lineItems` uses key `"items"` (not `"lineItems"`)
- `?includeAll=true` returns rich metadata (formula, format, version, appliesTo, etc.)
- Dimension items endpoint uses `"items"` key in response
- Lookup is POST with body `{ names: [...], codes: [...] }`
- All transactional-style endpoints use `/models/{mId}/...` (no workspaces prefix)

**Step 1: Write tests for DimensionsApi**

```typescript
it("getAllItems calls GET /models/{mId}/dimensions/{dimId}/items", async () => {
  mockClient.get.mockResolvedValue({
    items: [{ id: "1", name: "North", code: "N" }]
  });
  const result = await api.getAllItems("m1", "dim1");
  expect(mockClient.get).toHaveBeenCalledWith("/models/m1/dimensions/dim1/items");
});

it("getSelectedItems calls GET /models/{mId}/views/{vId}/dimensions/{dimId}/items", async () => {
  // ...
});

it("lookupByNameOrCode calls POST with names/codes body", async () => {
  // ...
});
```

**Step 2: Implement DimensionsApi**

```typescript
export class DimensionsApi {
  constructor(private client: AnaplanClient) {}

  async getAllItems(modelId: string, dimensionId: string) {
    const res = await this.client.get<any>(
      `/models/${modelId}/dimensions/${dimensionId}/items`
    );
    return res.items ?? [];
  }

  async getSelectedItems(modelId: string, viewId: string, dimensionId: string) {
    const res = await this.client.get<any>(
      `/models/${modelId}/views/${viewId}/dimensions/${dimensionId}/items`
    );
    return res.items ?? [];
  }

  async lookupByNameOrCode(
    workspaceId: string, modelId: string, dimensionId: string,
    names?: string[], codes?: string[]
  ) {
    const res = await this.client.post<any>(
      `/workspaces/${workspaceId}/models/${modelId}/dimensions/${dimensionId}/items`,
      { names, codes }
    );
    return res.items ?? [];
  }
}
```

**Step 3: Add line item methods to TransactionalApi**

```typescript
async getAllLineItems(modelId: string, includeAll = false) {
  const suffix = includeAll ? "?includeAll=true" : "";
  const res = await this.client.get<any>(`/models/${modelId}/lineItems${suffix}`);
  return res.items ?? [];
}

async getLineItemDimensions(modelId: string, lineItemId: string) {
  const res = await this.client.get<any>(
    `/models/${modelId}/lineItems/${lineItemId}/dimensions`
  );
  return res.dimensions ?? [];
}

async getLineItemDimensionItems(modelId: string, lineItemId: string, dimensionId: string) {
  const res = await this.client.get<any>(
    `/models/${modelId}/lineItems/${lineItemId}/dimensions/${dimensionId}/items`
  );
  return res.items ?? [];
}
```

**Step 4: Register 6 new exploration tools**

| Tool | Parameters | Description |
|------|-----------|-------------|
| `show_alllineitems` | modelId, includeAll? | All line items in model (cross-module) |
| `show_lineitemdimensions` | modelId, lineItemId | Dimension IDs for a line item |
| `show_dimensionitems` | modelId, dimensionId | All items in a dimension (model-level) |
| `show_viewdimensionitems` | workspaceId, modelId, moduleId, viewId, dimensionId | Selected items in dimension (view-level, filtered) |
| `lookup_dimensionitems` | workspaceId, modelId, dimensionId, names?, codes? | Lookup dimension items by name or code |
| `show_lineitemdimensionitems` | modelId, lineItemId, dimensionId | Dimension items for a specific line item |

**Step 5: Run tests, typecheck, commit**

---

### Task 4: Model Views (Cross-Module) (P0)

**New endpoints:**
- `GET /models/{mId}/views` — all views in model (cross-module, includes default + saved)
- `GET /models/{mId}/modules` — all modules in model (transactional path, no workspace)
- `GET /models/{mId}/modules/{modId}/views` — views in a module (transactional path)
- `GET /models/{mId}/modules/{modId}/lineItems` — line items in a module (transactional path)

**Files:**
- Modify: `src/api/transactional.ts` — add `getAllViews(modelId)`, `getAllModules(modelId)`, `getModuleViews(modelId, moduleId)`, `getModuleLineItems(modelId, moduleId)`
- Modify: `src/tools/exploration.ts` — add `show_allviews` tool
- Test: `src/api/transactional.test.ts`

**API notes:**
- `GET /models/{mId}/views` returns `"views"` key, supports `?includesubsidiaryviews=true` query param
- These use the transactional path pattern (no `/workspaces/` prefix)
- Default view `viewId` == `moduleId`

**Step 1: Write tests**

```typescript
it("getAllViews calls GET /models/{mId}/views", async () => {
  mockClient.get.mockResolvedValue({
    views: [{ id: "v1", name: "Default", moduleId: "m1" }]
  });
  const result = await api.getAllViews("m1");
  expect(mockClient.get).toHaveBeenCalledWith("/models/m1/views");
});
```

**Step 2: Implement methods**

**Step 3: Register `show_allviews` tool with pagination**

**Step 4: Run tests, typecheck, commit**

---

### Task 5: List Metadata & Bulk Action Metadata (P0)

**New endpoints:**
- `GET /workspaces/{wId}/models/{mId}/lists/{listId}` — list metadata (properties, parent, item count)
- `GET /workspaces/{wId}/models/{mId}/imports/{importId}` — import definition metadata
- `GET /workspaces/{wId}/models/{mId}/exports/{exportId}` — export definition metadata
- `GET /workspaces/{wId}/models/{mId}/processes/{processId}` — process definition metadata
- `GET /workspaces/{wId}/models/{mId}/actions/{actionId}` — action definition metadata
- `DELETE /workspaces/{wId}/models/{mId}/files/{fileId}` — delete a file

**Files:**
- Modify: `src/api/lists.ts` — add `getMetadata(wId, mId, listId)` method
- Modify: `src/api/imports.ts` — add `get(wId, mId, importId)` method
- Modify: `src/api/exports.ts` — add `get(wId, mId, exportId)` method
- Modify: `src/api/processes.ts` — add `get(wId, mId, processId)` method
- Modify: `src/api/actions.ts` — add `get(wId, mId, actionId)` method
- Modify: `src/api/files.ts` — add `delete(wId, mId, fileId)` method
- Modify: `src/tools/exploration.ts` — add `show_listmetadata`, `show_importdetails`, `show_exportdetails`, `show_processdetails`, `show_actiondetails` tools
- Modify: `src/tools/bulk.ts` — add `delete_file` tool
- Tests for each API wrapper

**API notes:**
- List metadata returns `"metadata"` key (not `"list"`)
- Import/export/process metadata returns singular key (e.g., `"import"`, `"export"`, `"process"`)

**Step 1-5: TDD per method, then register tools, commit**

---

### Task 6: Calendar & Versions (P1)

**New endpoints:**
- `GET /workspaces/{wId}/models/{mId}/currentPeriod` — get current period
- `PUT /workspaces/{wId}/models/{mId}/currentPeriod` — set current period
- `GET /workspaces/{wId}/models/{mId}/modelCalendar` — get fiscal year
- `PUT /workspaces/{wId}/models/{mId}/modelCalendar/fiscalYear` — update fiscal year
- `GET /models/{mId}/versions` — get version metadata
- `PUT /models/{mId}/versions/{versionId}/switchover` — set version switchover date

**Files:**
- Create: `src/api/calendar.ts` — `CalendarApi` class
- Create: `src/api/versions.ts` — `VersionsApi` class
- Modify: `src/tools/exploration.ts` — add `show_currentperiod`, `show_modelcalendar`, `show_versions` tools
- Create: `src/tools/management.ts` — add `set_currentperiod`, `set_fiscalyear`, `set_versionswitchover` tools (destructive, with warnings)
- Modify: `src/server.ts` — wire CalendarApi, VersionsApi
- Tests for each

**Note:** `set_currentperiod` and `set_fiscalyear` are destructive — changing time settings can cause data loss. Tool descriptions must warn.

---

### Task 7: Users API (P1)

**New endpoints:**
- `GET /users/me` — current user
- `GET /users/{userId}` — user details
- `GET /users` — list all users

**Files:**
- Create: `src/api/users.ts` — `UsersApi` class
- Modify: `src/tools/exploration.ts` — add `show_currentuser`, `show_users` tools
- Modify: `src/server.ts` — wire UsersApi
- Test: `src/api/users.test.ts`

**API notes:**
- These are tenant-level endpoints (no workspace/model in path)
- `GET /users/me` returns `"user"` key
- `GET /users` returns `"users"` key with pagination

---

### Task 8: Import Dump Files & Large Volume Reads (P2)

**New endpoints:**
- `GET /workspaces/{wId}/models/{mId}/imports/{importId}/dumps` — check dump file for import failures
- `GET /workspaces/{wId}/models/{mId}/imports/{importId}/dumps/{objectId}/chunks/{chunkId}` — download dump file chunks
- Large volume view reads: `POST .../views/{viewId}/readRequests/`, `GET .../readRequests/{requestId}`, `GET .../readRequests/{requestId}/pages/{pageNo}`, `DELETE .../readRequests/{requestId}`
- Large volume list reads: same pattern under `.../lists/{listId}/readRequests/`
- `POST /models/{mId}/lists/{listId}/resetIndex` — reset list index

**Files:**
- Modify: `src/api/imports.ts` — add `getDumps()`, `downloadDumpChunk()` methods
- Create: `src/api/largeReads.ts` — `LargeReadsApi` class for view/list read requests
- Modify: `src/tools/bulk.ts` — add `get_import_dump`, `download_import_dump` tools
- Modify: `src/tools/transactional.ts` or new file — add large read tools
- Tests for each

**API notes:**
- Large read requests use workspace-scoped paths
- Pages are zero-indexed
- Read requests expire after 30 minutes of inactivity
- Delete read request cleans up server resources — should always be called after download

---

## Summary Table

| Task | Group | Priority | New Tools | New Endpoints |
|------|-------|----------|-----------|---------------|
| 1 | Workspace & Model Metadata | P0 | 3 | 3 |
| 2 | Model Management | P1 | 3 | 3 |
| 3 | Line Items & Dimensions | P0 | 6 | 7 |
| 4 | Model Views (Cross-Module) | P0 | 1 | 4 |
| 5 | List & Action Metadata | P0 | 6 | 6 |
| 6 | Calendar & Versions | P1 | 6 | 6 |
| 7 | Users | P1 | 2 | 3 |
| 8 | Import Dumps & Large Reads | P2 | 4+ | 8+ |
| **Total** | | | **~31** | **~40** |

**After completion:** ~58 tools, ~70 endpoints — near-complete Integration API v2 coverage.

---

## Execution Order

1. Tasks 1, 3, 4, 5 (P0) — core metadata, most valuable
2. Tasks 2, 6, 7 (P1) — operational workflows
3. Task 8 (P2) — large volume reads, nice to have

## After Phase 2 Completion

Update `docs/plans/api-roadmap.md`:
- Phase 2 → "Integration API v2 completion" (DONE)
- Phase 3 → ALM API
- Phase 4 → SCIM API
- Phase 5 → CloudWorks API
- Phase 6 → Audit API
