# Transactional API Fixes Design

## Problem

Three bugs discovered during live testing against the Anaplan Integration API v2:

1. **show_moduledetails 404** — `GET /workspaces/{wId}/models/{mId}/modules/{moduleId}` returns 404. Anaplan does not support a single-module GET endpoint.
2. **read_cells 404** — `GET /workspaces/{wId}/models/{mId}/modules/{modId}/views/{viewId}/data` returns 404. The transactional read endpoint uses a different path.
3. **write_cells 400** — "POST body is not valid JSON". The dimensions format and endpoint path are both wrong.

## Fix 1: show_moduledetails — filter from list

The single-module GET endpoint does not exist in Anaplan's API. Instead, fetch all modules via the existing `list()` method and filter by ID.

**File:** `src/api/modules.ts`

Change `get()` to call `list()` and find the matching module:

```typescript
async get(wId, mId, moduleId) {
  const modules = await this.list(wId, mId);
  const mod = modules.find((m: any) => m.id === moduleId);
  if (!mod) throw new Error(`Module ${moduleId} not found`);
  return mod;
}
```

The resolver already resolves names to IDs before calling `get()`, so this just needs to match by ID.

## Fix 2: read_cells — correct endpoint path

The transactional read endpoint is model-scoped, not workspace-scoped. No modules in the path.

**File:** `src/api/transactional.ts`

```
Before: /workspaces/{wId}/models/{mId}/modules/{modId}/views/{viewId}/data
After:  /models/{mId}/views/{viewId}/data
```

The `moduleId` parameter is still needed in the tool handler for resolving view names to IDs (views are module-scoped), but is not passed to the API endpoint.

## Fix 3: write_cells — correct body format and endpoint

Three changes needed:

**File:** `src/api/transactional.ts`

1. **Endpoint path**: Drop workspaces prefix.
   ```
   Before: /workspaces/{wId}/models/{mId}/modules/{moduleId}/data
   After:  /models/{mId}/modules/{moduleId}/data
   ```

2. **Body format**: Anaplan expects a bare JSON array where each element has `lineItemId`, `dimensions` as an array of `{dimensionId, itemId}`, and `value`.
   ```json
   [
     {
       "lineItemId": "xxx",
       "dimensions": [
         { "dimensionId": "xxx", "itemId": "xxx" }
       ],
       "value": "100"
     }
   ]
   ```

**File:** `src/tools/transactional.ts`

3. **Schema change**: Update zod schema from `z.record(z.string(), z.string())` to:
   ```typescript
   z.array(z.object({
     dimensionId: z.string().describe("Dimension ID"),
     itemId: z.string().describe("Item ID within the dimension"),
   }))
   ```

## Files to modify

| File | Change |
|------|--------|
| `src/api/modules.ts` | `get()` → filter from `list()` |
| `src/api/transactional.ts` | Fix `readCells()` and `writeCells()` endpoint paths and body format |
| `src/tools/transactional.ts` | Update `write_cells` dimensions zod schema |
| `src/api/modules.test.ts` | New test for `get()` filtering |
| `src/api/transactional.test.ts` | Update tests for new paths and body format |

## Sources

- [Anaplan Community: API to get detail data for a module ID](https://community.anaplan.com/discussion/84895/) — confirms single-module endpoint doesn't exist
- [Anaplan Community: Transactional APIs Part 2](https://community.anaplan.com/discussion/110495/) — read endpoint is `/models/{modelId}/views/{viewId}/data`
- [Anaplan Community: MS Access Transactional API](https://community.anaplan.com/discussion/160192/) — write body format with dimensions array
