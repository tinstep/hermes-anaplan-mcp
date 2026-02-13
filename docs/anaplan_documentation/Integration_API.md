# Anaplan Integration API v2 Reference

## Introduction

The Anaplan Integration API v2 enables programmatic access to Anaplan workspaces, models, and data. All communication uses HTTPS with TLS 1.3 (TLS 1.2 also supported).

**Base URL:** `https://api.anaplan.com/2/0/`

**Authentication:** All requests require an Anaplan auth token in the `Authorization` header:

```
Authorization: AnaplanAuthToken {anaplan_auth_token}
```

For token acquisition, see the [Authentication Service API](https://anaplanauthentication.docs.apiary.io/).

If your workspace uses SSO, your user must be assigned as an Exception User for basic authentication.

**Format:** Anaplan supports `application/json` for requests and responses. File chunks use `application/octet-stream`.

### Rate Limiting

600 requests per minute (10 RPS) at the tenant level. Uses a token bucket algorithm. On 429 responses, wait for the duration specified in the `Retry-After` header. Recommended fallback: 10-second timeout.

### Pagination

Use `limit`, `offset`, and `sort` query parameters to paginate results. The `meta.paging` object in responses contains:

| Field | Description |
| --- | --- |
| `currentPageSize` | Number of results on this page |
| `totalSize` | Total results available |
| `offset` | Current offset |
| `next` | URL for the next page |
| `previous` | URL for the previous page |

### Path Parameter Conventions

- `workspaceId` - case-sensitive, lowercase (e.g., `8a8b8c8d8e8f8g8i`)
- `modelId` - case-sensitive, uppercase (e.g., `FC12345678912343455667`)
- Other IDs (importId, exportId, fileId, etc.) are numeric strings

### API Behavior When Model is Busy

List/metadata endpoints return information even when the model is busy. All other endpoints wait for the model to become available.

### Private and Default Files

Private files are created when you upload a file or run an export via the API. They are user-specific and removed after 48 hours of inactivity. When no private file exists, the default file is used instead.

---

## Workspaces

### List User Workspaces

```
GET /workspaces
```

Retrieves all workspaces the user has access to within their default tenant.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/workspaces?tenantDetails=true' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}'
```

**Query parameters:**

| Parameter | Type | Description |
| --- | --- | --- |
| `tenantDetails` | boolean | When true, returns `currentSize` and `sizeAllowance` |

**Response 200:**

```json
{
  "meta": {
    "schema": "https://api.anaplan.com/2/0/objects/workspace",
    "paging": {
      "currentPageSize": 1,
      "totalSize": 1,
      "offset": 0
    }
  },
  "status": {
    "code": 200,
    "message": "Success"
  },
  "workspaces": [
    {
      "id": "8a8b8c8d8e8f8g8i",
      "name": "Financial Planning",
      "active": true,
      "sizeAllowance": 1073741824,
      "currentSize": 873741824
    }
  ]
}
```

### Retrieve Workspace Information

```
GET /workspaces/{workspaceId}
```

Retrieves information about a specific workspace.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}?tenantDetails=true' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}'
```

**Response 200:**

```json
{
  "meta": {
    "schema": "https://api.anaplan.com/2/0/objects/workspace"
  },
  "status": {
    "code": 200,
    "message": "Success"
  },
  "workspace": {
    "id": "8a8b8c8d8e8f8g8i",
    "name": "Financial Planning",
    "active": true,
    "sizeAllowance": 1073741824,
    "currentSize": 873741824
  }
}
```

---

## Models

### Retrieve Models

```
GET /models
```

Retrieves all models in the user's default tenant. Non-administrators see only models they have access to. Without `offset`/`limit`, results are capped at 5000 models.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/models' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}'
```

**Query parameters:**

| Parameter | Type | Description |
| --- | --- | --- |
| `modelDetails` | boolean | When true, includes memory usage, creation date, etc. |
| `offset` | number | Starting point for results |
| `limit` | number | Number of results per page |

**Response 200:**

```json
{
  "meta": {
    "schema": "https://api.anaplan.com/2/0/objects/model",
    "paging": {
      "currentPageSize": 1,
      "totalSize": 1,
      "offset": 0
    }
  },
  "status": {
    "code": 200,
    "message": "Success"
  },
  "models": [
    {
      "id": "FC12345678912343455667",
      "activeState": "UNLOCKED",
      "name": "FP&A",
      "currentWorkspaceId": "8a8b8c8d8e8f8g8i",
      "currentWorkspaceName": "Financial Planning",
      "modelUrl": "https://rt.anaplan.com/anaplan/rt?...",
      "categoryValues": []
    }
  ]
}
```

### Retrieve Models for a Workspace

```
GET /workspaces/{workspaceId}/models
```

Retrieves all models in a specific workspace. When `modelDetails=true`, includes `memoryUsage`, `isoCreationDate`, `lastModified`, `lastSavedSerialNumber`, `lastModifiedByUserGuid`, and `categoryValues`.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models?modelDetails=true' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}'
```

### Retrieve a Specific Model

```
GET /models/{modelId}
```

Retrieves information about a specific model. Returns a singular `model` key (not `models` array).

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/models/{modelId}' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}'
```

**Response 200:**

```json
{
  "meta": {
    "schema": "https://api.anaplan.com/2/0/objects/model"
  },
  "model": {
    "id": "FC12345678912343455667",
    "activeState": "UNLOCKED",
    "name": "PF&A",
    "currentWorkspaceId": "8a8b8c8d8e8f8g8i",
    "currentWorkspaceName": "Financial Planning",
    "modelUrl": "https://rt.anaplan.com/anaplan/rt?...",
    "categoryValues": []
  },
  "status": {
    "code": 200,
    "message": "Success"
  }
}
```

When `modelDetails=true`, the response also includes `memoryUsage`, `lastSavedSerialNumber`, `modelTransactionRunning`, `isoCreationDate`, and `lastModified`.

### Bulk Delete Models

```
POST /workspaces/{workspaceId}/bulkDeleteModels
```

Deletes one or more models in a workspace. Models must be closed first. The user must be a workspace administrator. Failure to delete one model does not affect the others.

**Warning:** This is a destructive action.

```bash
curl -X POST \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/bulkDeleteModels' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "modelIdsToDelete": ["model_id_1", "model_id_2"]
  }'
```

**Response 200 (all deleted):**

```json
{
  "meta": {
    "schema": "https://api.anaplan.com/2/0/objects/bulkDeleteModelsResponse"
  },
  "status": {
    "code": 200,
    "message": "Success"
  },
  "modelsDeleted": 4,
  "bulkDeleteModelsFailures": []
}
```

**Response 200 (partial failure):**

```json
{
  "modelsDeleted": 1,
  "bulkDeleteModelsFailures": [
    {
      "modelId": "BC24B51B39CF4701ACF7CBFD2ED93C36",
      "message": "Model is open. Please close the model before trying again."
    }
  ]
}
```

### Check Model Status

```
POST /workspaces/{workspaceId}/models/{modelId}/status
```

Returns the current status of a model, including any ongoing tasks.

```bash
curl -X POST \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/status' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

**Response 200 (no ongoing task):**

```json
{
  "meta": {
    "schema": "https://api.anaplan.com/2/0/objects/dimension"
  },
  "status": {
    "code": 200,
    "message": "Success"
  },
  "requestStatus": {
    "peakMemoryUsageEstimate": null,
    "peakMemoryUsageTime": null,
    "progress": -1.0,
    "currentStep": "Open",
    "tooltip": null,
    "exportTaskType": null,
    "creationTime": 1645577591822,
    "taskId": null
  }
}
```

The `currentStep` field returns:

| Value | Meaning |
| --- | --- |
| `Open` | No process running |
| `Processing` | Import/export task in progress |
| `Updating` | Cell write or similar update |
| `Closed` | Model in maintenance state |

### Close Model

```
POST /workspaces/{workspaceId}/models/{modelId}/close
```

Closes a model without waiting for timeout. Requires workspace administrator permissions.

```bash
curl -X POST \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/close' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

**Responses:** 200 OK, 204 No Content (success), 401 Unauthorized, 403 Forbidden, 404 Not Found, 422 Unprocessable (model is archived).

### Wake Up Model

```
POST /workspaces/{workspaceId}/models/{modelId}/open
```

Opens a model (from closed or metadata-only state). Requires workspace administrator permissions.

```bash
curl -X POST \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/open' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}'
```

**Responses:**

| Code | Meaning |
| --- | --- |
| 200 | Model is open or opened quickly |
| 202 | Model is in the process of opening |
| 404 | Not found, disabled, or insufficient permissions |
| 422 | Model is archived |
| 424 | Model is in maintenance |

**Fair use policy:** Do not use this endpoint to keep models alive or open large numbers simultaneously.

---

## Line Items

### Retrieve All Line Items in a Model

```
GET /models/{modelId}/lineItems
```

Returns identifiers of all line items in a model. Requires workspace administrator permissions. Items are returned in a flat list. Only line items in modules the user has Read access to are included.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/models/{modelId}/lineItems' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: application/json'
```

**Response 200:**

```json
{
  "meta": {
    "schema": "https://api.anaplan.com/2/0/objects/lineItem"
  },
  "status": {
    "code": 200,
    "message": "Success"
  },
  "items": [
    {
      "moduleId": "102000000000",
      "moduleName": "Sales Entry",
      "id": "206000000000",
      "name": "Quantity Sold"
    }
  ]
}
```

### Retrieve All Line Item Metadata in a Model

```
GET /models/{modelId}/lineItems?includeAll=true
```

Returns all line items with full metadata including `formula`, `format`, `formatMetadata`, `version`, `appliesTo`, `dataTags`, `referencedBy`, `parent`, `readAccessDriver`, `writeAccessDriver`, `summary`, `timeScale`, `timeRange`, `formulaScope`, `style`, `code`, `notes`, `cellCount`, and boolean flags (`isSummary`, `startOfSection`, `broughtForward`, `useSwitchover`, `breakback`).

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/models/{modelId}/lineItems?includeAll=true' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: application/json'
```

### Retrieve All Line Item Metadata in a Module

```
GET /models/{modelId}/modules/{moduleId}/lineItems?includeAll=true
```

Same as above but scoped to a specific module. Items are returned in the order they appear in the UI. Requires Read access to the module. Invalid/non-existing module IDs return 404.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/models/{modelId}/modules/{moduleId}/lineItems?includeAll=true' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: application/json'
```

### Retrieve Dimension IDs for a Line Item

```
GET /models/{modelId}/lineItems/{lineItemId}/dimensions
```

Returns the dimensions that define a line item.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/models/{modelId}/lineItems/{lineItemId}/dimensions' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: application/json'
```

**Response 200:**

```json
{
  "meta": {
    "schema": "https://api.anaplan.com/2/0/objects/dimension"
  },
  "status": {
    "code": 200,
    "message": "Success"
  },
  "dimensions": [
    { "id": "20000000003", "name": "Time" },
    { "id": "20000000020", "name": "Versions" },
    { "id": "101000000001", "name": "Products" },
    { "id": "101000000002", "name": "Regions" }
  ]
}
```

---

## Dimensions

### Lookup Dimension Items by Name or Code

```
POST /workspaces/{workspaceId}/models/{modelId}/dimensions/{dimensionId}/items
```

Retrieves items matching given names and/or codes. Supported dimension types: Lists, Time, Version, Users. At least one of `names` or `codes` must be non-empty.

```bash
curl -X POST \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/dimensions/{dimensionId}/items' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{"names": ["South", "East"], "codes": ["N", "W"]}'
```

**Response 200:**

```json
{
  "meta": {
    "schema": "https://api.anaplan.com/2/0/objects/dimension"
  },
  "status": {
    "code": 200,
    "message": "Success"
  },
  "items": [
    { "name": "South", "id": "208000000001", "code": "S" },
    { "name": "West", "id": "208000000004", "code": "W" }
  ]
}
```

### Retrieve All Items in a Dimension

```
GET /models/{modelId}/dimensions/{dimensionId}/items
```

Returns all items in a dimension (model-level, no view filtering). Supports lists, list subsets, line item subsets, and Users. Does not support Time dimension at model level - use the view-level endpoint instead. Maximum 1,000,000 items.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/models/{modelId}/dimensions/{dimensionId}/items' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: application/json'
```

**Response 200:**

```json
{
  "items": [
    { "code": "N", "id": "200000000001", "name": "North" },
    { "code": "E", "id": "200000000002", "name": "East" },
    { "id": "200000000000", "name": "Total Company" }
  ]
}
```

If codes have not been set for an item, the `code` field is omitted.

### Retrieve Selected Items in a Dimension

```
GET /models/{modelId}/views/{viewId}/dimensions/{dimensionId}/items
```

Returns items filtered by view configuration (hidden items, filtering, Selective Access). Works with any dimension type. Maximum 1,000,000 cells in the view.

The `viewId` can be replaced by a valid `lineItemId` to get dimension items for a subsidiary view.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/models/{modelId}/views/{viewId}/dimensions/{dimensionId}/items' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: application/json'
```

### Retrieve Dimension Items for a Line Item

```
GET /models/{modelId}/lineItems/{lineItemId}/dimensions/{dimensionId}/items
```

Returns dimension items that apply to a specific line item. Works with any dimension type. Maximum 1,000,000 items.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/models/{modelId}/lineItems/{lineItemId}/dimensions/{dimensionId}/items' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: application/json'
```

---

## Modules and Views

### Retrieve All Modules in a Model

```
GET /models/{modelId}/modules
```

Returns IDs and names of all modules for a model.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/models/{modelId}/modules' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: application/json'
```

**Response 200:**

```json
{
  "meta": {
    "paging": { "currentPageSize": 1, "offset": 0, "totalSize": 1 },
    "schema": "https://api.anaplan.com/2/0/objects/module"
  },
  "status": { "code": 200, "message": "Success" },
  "modules": [
    { "id": "102000000125", "name": "REV01 Price Book" },
    { "id": "102000000121", "name": "REV02 Volume Inputs" }
  ]
}
```

### Retrieve All Views in a Model

```
GET /models/{modelId}/views
```

Returns all views (default and saved) for a model. Add `?includesubsidiaryviews=true` to include unsaved subsidiary views.

Default views have `viewId` equal to `moduleId`. Saved view names use the format `ModuleName.ViewName`.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/models/{modelId}/views' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: application/json'
```

### Retrieve Views in a Module

```
GET /models/{modelId}/modules/{moduleId}/views
```

Returns views for a specific module, including the default view. Add `?includesubsidiaryviews=true` for unsaved subsidiary views.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/models/{modelId}/modules/{moduleId}/views' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: application/json'
```

### Retrieve View Metadata (Dimensions)

```
GET /models/{modelId}/views/{viewId}
```

Returns dimension metadata for a view: rows, columns, and pages arrays containing `{id, name}` dimension objects. If a view has no dimensions on an axis, that field is omitted entirely.

The `viewId` can be replaced by a `lineItemId` to get metadata for a subsidiary view.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/models/{modelId}/views/{viewId}' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: application/json'
```

**Response 200:**

```json
{
  "meta": {
    "schema": "https://api.anaplan.com/2/0/objects/view"
  },
  "status": { "code": 200, "message": "Success" },
  "viewName": "REV01 Price Book",
  "viewId": "102000000000",
  "rows": [
    { "id": "101000000000", "name": "Products" },
    { "id": "101000000003", "name": "Regions" }
  ],
  "columns": [
    { "id": "101999999999", "name": "Line items" }
  ],
  "pages": [
    { "id": "101000000001", "name": "Versions" }
  ]
}
```

### Retrieve All Line Items in a Module

```
GET /models/{modelId}/modules/{moduleId}/lineItems
```

Returns line items for a specific module, in UI display order. Requires Read access.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/models/{modelId}/modules/{moduleId}/lineItems' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: application/json'
```

---

## Cell Data

### Retrieve Cell Data for a View

```
GET /models/{modelId}/views/{viewId}/data
```

Retrieves cell data for a view. Maximum 1,000,000 cells. Supports CSV and JSON responses.

**CSV response:**

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/models/{modelId}/views/{viewId}/data?pages=dimensionId:itemId' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: text/csv'
```

**JSON response** (requires both `Accept: application/json` and `format=v1`):

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/models/{modelId}/views/{viewId}/data?pages=dimensionId:itemId&format=v1' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: application/json'
```

**Query parameters:**

| Parameter | Description |
| --- | --- |
| `pages` | Page selector: `dimensionId:itemId` |
| `format` | Set to `v1` for JSON response |
| `exportType` | `TABULAR_SINGLE_COLUMN` or `TABULAR_MULTI_COLUMN` (CSV only, requires `moduleId`) |
| `moduleId` | Required when using `exportType` |

**JSON response format:**

```json
{
  "pages": ["Value", "23mm"],
  "columnCoordinates": [["Jan 13"], ["Feb 13"], ["Mar 13"]],
  "rows": [
    {
      "rowCoordinates": ["Durham"],
      "cells": ["64.6", "57.94", "108.36"]
    }
  ]
}
```

### Write Cell Data

```
POST /models/{modelId}/modules/{moduleId}/data
```

Sets cell values in a module. Maximum 100,000 cells or 15 MB per call. Downstream calculations complete before the response is returned. Does not apply to aggregate cells.

```bash
curl -X POST \
  'https://api.anaplan.com/2/0/models/{modelId}/modules/{moduleId}/data' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '<request_body>'
```

**Request body (using IDs):**

```json
[
  {
    "lineItemId": "206000000000",
    "dimensions": [
      { "dimensionId": "101000000001", "itemId": "202000000001" },
      { "dimensionId": "20000000003", "itemId": "5438300031" },
      { "dimensionId": "20000000020", "itemId": "107000000001" }
    ],
    "value": 1111
  }
]
```

**Request body (using names):**

```json
[
  {
    "lineItemName": "Products",
    "dimensions": [
      { "dimensionName": "Product", "itemCode": "SKU1234" },
      { "dimensionName": "Time", "itemName": "Jan 21" },
      { "dimensionName": "Version", "itemName": "Actual" }
    ],
    "value": 1111
  }
]
```

**Response 200:**

```json
{
  "meta": {
    "schema": "https://api.anaplan.com/2/0/objects/writeCellDataResponse"
  },
  "status": { "code": 200, "message": "Success" },
  "numberOfCellsChanged": 42,
  "failures": [
    {
      "requestIndex": 0,
      "failureType": "cellIsCalculated",
      "failureMessageDetails": "the cell is a calculated/aggregate cell and is not writeable"
    }
  ]
}
```

---

## Large Volume View Data Read

For views with more than 1,000,000 cells.

### Initiate Large Read Request

```
POST /workspaces/{workspaceId}/models/{modelId}/views/{viewId}/readRequests/
```

```bash
curl -X POST \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/views/{viewId}/readRequests/' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: application/json' \
  -d '{"exportType": "TABULAR_MULTI_COLUMN"}'
```

Supported export types: `TABULAR_MULTI_COLUMN`, `TABULAR_SINGLE_COLUMN`, `GRID_CURRENT_PAGE`.

**Response 200:**

```json
{
  "viewReadRequest": {
    "requestId": "0A06B0739F0E47BB92E2326C603D86EC",
    "requestState": "IN_PROGRESS",
    "url": "https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/views/{viewId}/readRequests/{requestId}"
  }
}
```

### Retrieve Status of Large Read Request

```
GET /workspaces/{workspaceId}/models/{modelId}/views/{viewId}/readRequests/{requestId}
```

**Request states:**

| State | Meaning |
| --- | --- |
| `COMPLETE` + `successful: true` | Export finished, download all pages |
| `COMPLETE` + `successful: false` | Export failed, retry |
| `IN_PROGRESS` | Export running, can download available pages |
| `NOT_STARTED` | Check again |
| `CANCELLED` | Request was deleted |

The response includes `availablePages` to indicate how many pages can be downloaded.

### Download Pages

```
GET /workspaces/{workspaceId}/models/{modelId}/views/{viewId}/readRequests/{requestId}/pages/{pageNo}
```

Page numbers start at 0. Returns CSV data. You can download pages while the export is still in progress.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/views/{viewId}/readRequests/{requestId}/pages/{pageNo}' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: text/csv'
```

### Delete Read Requests

```
DELETE /workspaces/{workspaceId}/models/{modelId}/views/{viewId}/readRequests/{requestId}
```

Removes all pages and stops an ongoing read request. Best practice: delete as soon as all pages are downloaded.

Expiration: 30 minutes after no activity. Timer resets when requested page number is divisible by 100 (including page 0).

---

## Lists

### Retrieve Lists

```
GET /workspaces/{workspaceId}/models/{modelId}/lists
```

Returns lists for a workspace and model.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/lists' \
  -H 'Accept: application/json' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}'
```

**Response 200:**

```json
{
  "lists": [
    { "id": "101000000000", "name": "Organization" },
    { "id": "101000000001", "name": "opportunities" }
  ]
}
```

### Retrieve List Metadata

```
GET /workspaces/{workspaceId}/models/{modelId}/lists/{listId}
```

Returns metadata for a list including properties, parent, item count, selective access status, and more.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/lists/{listId}' \
  -H 'Accept: application/json' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}'
```

**Response 200:**

```json
{
  "metadata": {
    "id": "101000000001",
    "name": "Sales Reps",
    "properties": [
      { "name": "Salesforce", "format": "TEXT", "notes": "", "referencedBy": "" }
    ],
    "hasSelectiveAccess": false,
    "parent": { "id": "101000000000", "name": "Organization" },
    "managedBy": "",
    "numberedList": false,
    "useTopLevelAsPageDefault": false,
    "itemCount": 1,
    "workflowEnabled": false,
    "productionData": false
  }
}
```

### Retrieve List Data

```
GET /workspaces/{workspaceId}/models/{modelId}/lists/{listId}/items
```

Returns list item data. Maximum 1,000,000 records. Set `includeAll=true` to include subsets and properties.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/lists/{listId}/items?includeAll=true' \
  -H 'Accept: application/json' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}'
```

**Response 200 (includeAll=true):**

```json
{
  "listItems": [
    {
      "id": "206000000001",
      "name": "cake",
      "code": "c1",
      "subsets": { "favourite": true },
      "properties": { "count": "1.0" }
    }
  ]
}
```

Also supports `Accept: text/csv` for CSV format responses.

### Add List Items

```
POST /workspaces/{workspaceId}/models/{modelId}/lists/{listId}/items?action=add
```

Adds items to a list. Maximum 100,000 items per call. The `?action=add` query parameter is required.

```bash
curl -X POST \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/lists/{listId}/items?action=add' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '<request_body>'
```

**Request body:**

```json
{
  "items": [
    {
      "name": "mike",
      "code": "id1",
      "parent": "west",
      "properties": {
        "p-text": "hello world",
        "p-number": "123456"
      },
      "subsets": {
        "s11": true
      }
    }
  ]
}
```

**Response 200:**

```json
{
  "added": 1,
  "ignored": 1,
  "total": 2,
  "failures": [
    {
      "requestIndex": 1,
      "failureType": "INCORRECT_FORMAT",
      "failureMessageDetails": "incorrect format -- column name:p-number, value:wrong value for number"
    }
  ]
}
```

For numbered lists, the name is auto-generated; do not provide a name.

### Update List Items

```
PUT /workspaces/{workspaceId}/models/{modelId}/lists/{listId}/items
```

Updates existing list items. Maximum 100,000 items per call. For standard lists, identify items by `id`, `code`, or `name`. For numbered lists, use `id` or `code`. Specify only one identifier per item.

When an item already has a `code` value, the update request must include the `code` field.

```bash
curl -X PUT \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/lists/{listId}/items' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '<request_body>'
```

**Response 200:**

```json
{
  "total": 2,
  "ignored": 1,
  "updated": 1,
  "failures": [
    {
      "failureType": "INCORRECT_FORMAT",
      "failureMessageDetails": "incorrect format -- column name:p-number, value:wrong format for number",
      "requestIndex": 1
    }
  ]
}
```

### Delete List Items

```
POST /workspaces/{workspaceId}/models/{modelId}/lists/{listId}/items?action=delete
```

Deletes items from a list. Maximum 100,000 items per call. Identify items by `id` or `code` (not both).

```bash
curl -X POST \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/lists/{listId}/items?action=delete' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{"items": [{"id": "201000000000"}, {"code": "Region 1"}]}'
```

**Response 200:**

```json
{
  "deleted": 2
}
```

### Reset List Index

```
POST /models/{modelId}/lists/{listId}/resetIndex
```

Resets the index on a list to ensure new items stay within the maximum allowed. The list must be empty or a 400 error is returned.

```bash
curl -X POST \
  'https://api.anaplan.com/2/0/models/{modelId}/lists/{listId}/resetIndex' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: application/json'
```

---

## Large Volume List Read

For lists with more than 1,000,000 items.

### Preview Large Data List Read

```
GET /workspaces/{workspaceId}/models/{modelId}/lists/{listId}/preview
```

Previews list data (up to 1000 records) before starting a large export. Returns CSV.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/lists/{listId}/preview' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: text/csv'
```

### Initiate Large Read Request

```
POST /workspaces/{workspaceId}/models/{modelId}/lists/{listId}/readRequests/
```

Initiates a large volume read request on a list.

```bash
curl -X POST \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/lists/{listId}/readRequests/' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json'
```

**Response 200:**

```json
{
  "listReadRequest": {
    "requestId": "0A06B0739F0E47BB92E2326C603D86EC",
    "requestState": "IN_PROGRESS",
    "url": "https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/lists/{listId}/readRequests/{requestId}"
  }
}
```

### Retrieve Status of Large Read Request

```
GET /workspaces/{workspaceId}/models/{modelId}/lists/{listId}/readRequests/{requestId}
```

Same request states as view read requests (COMPLETE, IN_PROGRESS, NOT_STARTED, CANCELLED).

### Download Pages

```
GET /workspaces/{workspaceId}/models/{modelId}/lists/{listId}/readRequests/{requestId}/pages/{pageNo}
```

Returns CSV. Page numbers start at 0.

### Delete Read Requests

```
DELETE /workspaces/{workspaceId}/models/{modelId}/lists/{listId}/readRequests/{requestId}
```

Same behavior and expiration rules as view read request deletion.

---

## Model Calendar

### Retrieve Current Period

```
GET /workspaces/{workspaceId}/models/{modelId}/currentPeriod
```

Returns the current period. If not set, `periodText` and `lastDay` are empty strings.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/currentPeriod' \
  -H 'Accept: application/json' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}'
```

**Response 200:**

```json
{
  "currentPeriod": {
    "periodText": "May 20",
    "lastDay": "2020-05-31",
    "calendarType": "Calendar Months/Quarters/Years"
  }
}
```

### Set Current Period

```
PUT /workspaces/{workspaceId}/models/{modelId}/currentPeriod
```

Changes or resets the current period. Pass a date to set, or empty string to reset.

**Warning:** Changing time settings may delete data in removed time periods.

```bash
curl -X PUT \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/currentPeriod' \
  -H 'Accept: application/json' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json' \
  -d '{"date": "2020-05-20"}'
```

### Get Current Fiscal Year

```
GET /workspaces/{workspaceId}/models/{modelId}/modelCalendar
```

Returns the fiscal year with start and end dates. Returns empty for calendar types without fiscal years (e.g., Weeks General).

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/modelCalendar' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: application/json'
```

**Response 200:**

```json
{
  "modelCalendar": {
    "fiscalYear": {
      "year": "FY21",
      "startDate": "2021-01-01",
      "endDate": "2021-12-31"
    }
  }
}
```

For weeks 4-4-5/4-5-4/5-4-4 calendar types, the response also includes `calendarType`, `pastYearsCount`, `futureYearsCount`, `currentPeriod`, and `totalsSelection`.

### Update Current Fiscal Year

```
PUT /workspaces/{workspaceId}/models/{modelId}/modelCalendar/fiscalYear
```

Updates the fiscal year. The year must be valid for the model calendar. Returns 400 if out of range or calendar type has no fiscal year.

```bash
curl -X PUT \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/modelCalendar/fiscalYear' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{"year": "FY21"}'
```

---

## Model Versions

### Retrieve Version Metadata

```
GET /models/{modelId}/versions
```

Returns version metadata including `editFrom`, `editTo`, `switchover`, `formula`, `notes`, and boolean flags (`isCurrent`, `isActual`). Date formats depend on the model calendar setting.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/models/{modelId}/versions' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: application/json'
```

**Response 200:**

```json
{
  "versionMetadata": [
    {
      "id": "107000000001",
      "name": "Actual",
      "isCurrent": false,
      "isActual": true,
      "editFrom": { "periodText": "Start of Timescale", "date": "1900-01-01" },
      "editTo": { "periodText": "End of Timescale", "date": "2399-12-31" },
      "notes": "This version data is updated every Monday"
    },
    {
      "id": "107000000002",
      "name": "Variance",
      "isCurrent": false,
      "isActual": false,
      "switchover": { "periodText": "Mar 20", "date": "2020-03-01" },
      "formula": "Actual - 20",
      "editFrom": { "periodText": "Jan 20", "date": "2020-01-01" },
      "editTo": { "periodText": "Dec 20", "date": "2020-12-31" }
    }
  ]
}
```

### Set Version Switchover Date

```
PUT /models/{modelId}/versions/{versionId}/switchover
```

Sets the switchover date for a forecast or variance version. The date must be after the existing switchover date. Pass an empty string to reset to blank.

```bash
curl -X PUT \
  'https://api.anaplan.com/2/0/models/{modelId}/versions/{versionId}/switchover' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{"date": "2013-05-01"}'
```

**Response 200:**

```json
{
  "versionSwitchover": {
    "periodText": "May 13",
    "date": "2013-05-01",
    "calendarType": "Calendar Months/Quarters/Years"
  }
}
```

---

## Users

These endpoints work only with the user's default tenant.

### Retrieve Your User

```
GET /users/me
```

Returns the authenticated user's information.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/users/me' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

**Response 200:**

```json
{
  "user": {
    "id": "8a8b844a477d5da70147d150ee080b17",
    "active": true,
    "email": "a.user@anaplan.com",
    "emailOptIn": true,
    "firstName": "A",
    "lastName": "User",
    "customerId": "8b81da6f5fb6b75701604d6c950c05b1",
    "lastLoginDate": "2017-09-07T08:05:37.000+0000"
  },
  "status": { "code": 200, "message": "Success" }
}
```

### Retrieve User Information

```
GET /users/{userId}
```

Returns information about a specific user. Requires workspace administrator or tenant-level access.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/users/{userId}' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

### Retrieve User List

```
GET /users
```

Returns a list of users. Requires workspace administrator or tenant-level access. Use `?sort=%2BemailAddress` to sort by email.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/users?sort=%2BemailAddress' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

---

## File Upload

Files must already exist in Anaplan (first upload via the UI). Subsequent uploads can use the API. This creates a Private File.

### List Model Files

```
GET /workspaces/{workspaceId}/models/{modelId}/files
```

Returns all import and export files for a model, with metadata (chunkCount, delimiter, encoding, format, headerRow, firstDataRow, separator).

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/files' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: application/json'
```

### Set Chunk Count

```
POST /workspaces/{workspaceId}/models/{modelId}/files/{fileId}
```

Sets the chunk count before uploading. Set to `-1` if unknown (then call complete when done). Chunks should be 1-50 MB.

**Important:** When the default file is set for Admins only or Everyone, you MUST set the chunk count before uploading.

```bash
curl -X POST \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/files/{fileId}' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json' \
  -d '{"chunkCount": 1}'
```

### Upload File as a Single Chunk

```
PUT /workspaces/{workspaceId}/models/{modelId}/files/{fileId}
```

For files smaller than 1 MB. Cannot compress single-chunk uploads.

```bash
curl -X PUT \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/files/{fileId}' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/octet-stream' \
  --upload-file Tests.txt
```

Response: 204 No Content.

### Upload File in Chunks

```
PUT /workspaces/{workspaceId}/models/{modelId}/files/{fileId}/chunks/{chunkId}
```

Upload each chunk as an octet stream. Recommended chunk size: no larger than 50 MB uncompressed, max 1000 chunks per file.

For compressed chunks, use `Content-Type: application/x-gzip` instead of `application/octet-stream`.

```bash
curl -X PUT \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/files/{fileId}/chunks/0' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/octet-stream' \
  --upload-file chunk-aa
```

Response: 204 No Content.

### Complete the Upload

```
POST /workspaces/{workspaceId}/models/{modelId}/files/{fileId}/complete
```

Required after uploading with `chunkCount` set to `-1`.

```bash
curl -X POST \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/files/{fileId}/complete' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json' \
  -d '{}'
```

---

## File Download

### List Export Files

```
GET /workspaces/{workspaceId}/models/{modelId}/files
```

Same endpoint as listing upload files. Export files have fewer metadata properties and different ID prefixes.

### Get Chunks in a File

```
GET /workspaces/{workspaceId}/models/{modelId}/files/{fileId}/chunks
```

Returns chunk IDs and names for a file.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/files/{fileId}/chunks' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

**Response 200:**

```json
{
  "chunks": [
    { "id": "0", "name": "Chunk 0" },
    { "id": "1", "name": "Chunk 1" }
  ]
}
```

### Get Data in a Chunk

```
GET /workspaces/{workspaceId}/models/{modelId}/files/{fileId}/chunks/{chunkId}
```

Downloads the data for a specific chunk.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/files/{fileId}/chunks/{chunkId}' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

### Delete Files

```
DELETE /workspaces/{workspaceId}/models/{modelId}/files/{fileId}
```

Deletes a private file. Default content and the import data source model object remain.

Response: 204 No Content.

---

## Import Actions

To import data:
1. Upload the file.
2. Get the import ID and start the import.
3. Monitor the task.
4. Check for failures.

Workspace administrators can run any import regardless of model role.

### List Imports

```
GET /workspaces/{workspaceId}/models/{modelId}/imports
```

Returns import definitions with `id`, `name`, `importDataSourceId`, and `importType`.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/imports' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

### Start Import

```
POST /workspaces/{workspaceId}/models/{modelId}/imports/{importId}/tasks
```

Starts an import and returns a `taskId`. The request body must include `localeName`.

```bash
curl -X POST \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/imports/{importId}/tasks' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json' \
  -d '{"localeName": "en_US"}'
```

**With mapping parameters:**

```json
{
  "localeName": "en_US",
  "mappingParameters": [
    { "entityType": "Version", "entityName": "Actual" }
  ]
}
```

**Response 200:**

```json
{
  "taskId": "5E6331685CC648A29B725923B8FAEA1C"
}
```

### List Import Tasks

```
GET /workspaces/{workspaceId}/models/{modelId}/imports/{importId}/tasks
```

Returns tasks sorted by `creationTime` ascending. Append `?sort=-creationTime` for descending order.

### Monitor Import Task

```
GET /workspaces/{workspaceId}/models/{modelId}/imports/{importId}/tasks/{taskId}
```

Check status no more than once every 5 seconds. Use `DELETE` instead of `GET` to cancel a task.

**Task states:**

| State | Description |
| --- | --- |
| `NOT_STARTED` | Scheduled but not started |
| `IN_PROGRESS` | Currently running |
| `COMPLETE` | Finished (check `successful` for result) |
| `CANCELLING` | Being cancelled |
| `CANCELLED` | Cancelled, changes rolled back |

**Response 200:**

```json
{
  "task": {
    "taskId": "1B1D84DDD53847BAA621810B593C3FC1",
    "currentStep": "Complete.",
    "progress": 1.0,
    "result": {
      "details": [
        {
          "localMessageText": "Employees: 90 (0/90) rows successful, 5 ignored",
          "type": "hierarchyRowsProcessed",
          "values": ["hierarchyName", "Employees", "successRowCount", "90", ...]
        }
      ],
      "failureDumpAvailable": false,
      "objectId": "112000000009",
      "successful": true
    },
    "taskState": "COMPLETE",
    "creationTime": 1571258347545
  }
}
```

### Check Dump File for Failures

```
GET /workspaces/{workspaceId}/models/{modelId}/imports/{importId}/tasks/{taskId}/dump/chunks
```

When `failureDumpAvailable` is true, query the number of chunks first, then download sequentially. Chunks are 10 MB or less, numbered from 0.

Dump files are removed 48 hours after last access or when the next import succeeds with no errors.

### Download Dump File Chunks

```
GET /workspaces/{workspaceId}/models/{modelId}/imports/{importId}/tasks/{taskId}/dump/chunks/{chunkId}
```

Download each chunk and concatenate on your host.

### Get Import Metadata

```
GET /workspaces/{workspaceId}/models/{modelId}/imports/{importId}
```

Returns metadata for an import definition: name, type (FILE or MODEL), source details (encoding, separator, delimiter, headerNames, columnCount).

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/imports/{importId}' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

**Response 200 (type=FILE):**

```json
{
  "importMetadata": {
    "name": "Employees from Employees.txt",
    "type": "FILE",
    "source": {
      "textEncoding": "ISO-8859-1",
      "columnSeparator": "\t",
      "textDelimiter": "\"",
      "headerRow": 1,
      "firstDataRow": 2,
      "decimalSeparator": ".",
      "headerNames": ["Name", "Sales Region", "Parent", "Code"],
      "columnCount": 14
    }
  }
}
```

**Response 200 (type=MODEL):**

```json
{
  "importMetadata": {
    "name": "NCL - Import New G/L Account Code from SAP (B/S)",
    "type": "MODEL"
  }
}
```

---

## Export Actions

To export data:
1. List export definitions.
2. Start the export.
3. Monitor the task.
4. Download the files.

### List Exports

```
GET /workspaces/{workspaceId}/models/{modelId}/exports
```

Returns export definitions with `id`, `name`, and `exportType`.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/exports' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

### Get Export Metadata

```
GET /workspaces/{workspaceId}/models/{modelId}/exports/{exportId}
```

Returns metadata including `columnCount`, `dataTypes`, `delimiter`, `encoding`, `exportFormat`, `headerNames`, `listNames`, `rowCount` (estimate), and `separator`.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/exports/{exportId}' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

**Response 200:**

```json
{
  "exportMetadata": {
    "columnCount": 16,
    "dataTypes": ["ENTITY", "MIXED", "MIXED"],
    "delimiter": "\"",
    "encoding": "UTF-8",
    "exportFormat": "text/csv",
    "headerNames": ["ListWithSemiColonAsSeparator", "Parent", "Code"],
    "rowCount": 20432,
    "separator": ","
  }
}
```

If line items are in columns, `dataTypes` shows actual types (ENTITY for list members). If in rows or pages, shows MIXED.

### Start Export

```
POST /workspaces/{workspaceId}/models/{modelId}/exports/{exportId}/tasks
```

The request body must include `{"localeName": "en_US"}` or the action returns 400.

```bash
curl -X POST \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/exports/{exportId}/tasks' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json' \
  -d '{"localeName": "en_US"}'
```

### Monitor Export Task

```
GET /workspaces/{workspaceId}/models/{modelId}/exports/{exportId}/tasks/{taskId}
```

Same task states and monitoring pattern as import tasks. Check no more than once every 5 seconds.

**Response 200:**

```json
{
  "task": {
    "type": "taskInformation",
    "taskId": "BFEC582EBD4146068FE4061831C8F0F0",
    "currentStep": "Complete.",
    "progress": 1,
    "result": {
      "failureDumpAvailable": false,
      "objectId": "116000000002",
      "successful": true
    },
    "taskState": "COMPLETE"
  }
}
```

### Download Exported Data

After the export completes, download files using the [File Download](#file-download) endpoints.

---

## Model Actions

### List Model Actions

```
GET /workspaces/{workspaceId}/models/{modelId}/actions
```

Returns actions with `id`, `name`, and `actionType`.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/actions' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

**Action types include:** `DELETE_BY_SELECTION`, `ORDER_HIERARCHY`, `SIMPLE_CREATE`, `BULK_DELETE_ENTITIES`, `SELECT_CHILDREN`, `UPDATE_CURRENT_PERIOD`, `BULK_ENTITY_COPY`, `COPY_TO_NUMBERED_LIST`, `OPTIMIZER`, `BULK_COPY`.

### Retrieve Action Metadata

```
GET /workspaces/{workspaceId}/models/{modelId}/actions/{actionId}
```

Returns metadata for a specific action. The response fields vary by action type:

- **DELETE_BY_SELECTION:** includes `listId`, `filterLineItemId`
- **ORDER_HIERARCHY:** includes `listId`, `sortOrder`, `lineItemId`
- **BULK_COPY:** includes `targetMember`, `listId`, `sourceMember`
- **SIMPLE_CREATE, BULK_DELETE_ENTITIES, SELECT_CHILDREN, UPDATE_CURRENT_PERIOD, OPTIMIZER:** includes only `id`, `actionType`, `name`

Returns 404 for invalid action IDs.

---

## Delete Actions

Uses the "Delete from List Using Selection" functionality. The delete action must already exist in the model.

### List Delete Actions

```
GET /workspaces/{workspaceId}/models/{modelId}/actions
```

Same endpoint as listing all actions. Filter by `actionType: DELETE_BY_SELECTION`.

### Start Deletion

```
POST /workspaces/{workspaceId}/models/{modelId}/actions/{actionId}/tasks
```

Request body must include `{"localeName": "en_US"}`.

```bash
curl -X POST \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/actions/{actionId}/tasks' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json' \
  -d '{"localeName": "en_US"}'
```

### Monitor Deletion Task

```
GET /workspaces/{workspaceId}/models/{modelId}/actions/{actionId}/tasks/{taskId}
```

Same pattern as import/export monitoring. For deletion actions, `failureDumpAvailable` is always false.

---

## Process Actions

A Process is a container that runs multiple actions in order (imports, exports, deletes).

### List Processes

```
GET /workspaces/{workspaceId}/models/{modelId}/processes
```

Returns processes with `id` and `name`.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/processes' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

### Retrieve Process Metadata

```
GET /models/{modelId}/processes/{processId}
```

Returns the process name and ordered list of actions. Add `?showImportDataSource=true` for additional import data source details.

Action types include: `IMPORT`, `EXPORT`, `DELETE_BY_SELECTION`, `ORDER_HIERARCHY`, `OPTIMIZER`.

For IMPORT actions, the response includes `importDataSourceId` and `importType`. For EXPORT actions, it includes `exportType`, `exportFormat`, and `layout`.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/models/{modelId}/processes/{processId}' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: application/json'
```

**Response 200:**

```json
{
  "processMetadata": {
    "name": "ProcessWithActions",
    "actions": [
      {
        "id": "112000000000",
        "name": "Sales from import-sales.csv",
        "actionType": "IMPORT",
        "importDataSourceId": "113000000000",
        "importType": "MODULE_DATA"
      },
      {
        "id": "116000000000",
        "name": "Sales - Revenue.xls",
        "actionType": "EXPORT",
        "exportType": "GRID_CURRENT_PAGE"
      },
      {
        "id": "117000000000",
        "name": "Delete from Products",
        "actionType": "DELETE_BY_SELECTION"
      }
    ]
  }
}
```

### Start Process

```
POST /workspaces/{workspaceId}/models/{modelId}/processes/{processId}/tasks
```

Request body must include `{"localeName": "en_US"}`.

```bash
curl -X POST \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/processes/{processId}/tasks' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json' \
  -d '{"localeName": "en_US"}'
```

**With mapping parameters:**

```json
{
  "localeName": "en_US",
  "mappingParameters": [
    { "entityType": "Version", "entityName": "Actual" }
  ]
}
```

### Monitor Process Task

```
GET /workspaces/{workspaceId}/models/{modelId}/processes/{processId}/tasks/{taskId}
```

Add `?includeProcessDetails=true` to get `duration` and `startTime` for each step.

The response includes `nestedResults` showing the success/failure of each action within the process.

**Response 200:**

```json
{
  "task": {
    "type": "taskInformation",
    "taskId": "2846F8E2FD624F7FA91EC6E2F6E318C0",
    "currentStep": "Complete.",
    "progress": 1,
    "result": {
      "failureDumpAvailable": false,
      "nestedResults": [
        {
          "failureDumpAvailable": false,
          "objectId": "117000000015",
          "successful": true
        }
      ],
      "objectId": "118000000002",
      "successful": true
    },
    "taskState": "COMPLETE"
  }
}
```

### Check Process Dump Files

```
GET /workspaces/{workspaceId}/models/{modelId}/processes/{processId}/tasks/{taskId}/dumps/{objectId}/chunks
```

When `failureDumpAvailable` is true in `nestedResults`, use the `objectId` from that entry to download the dump file. Download chunks sequentially and concatenate.

---

## Retrieve Optimizer Logs

```
GET /workspaces/{workspaceId}/models/{modelId}/optimizeActions/{actionId}/tasks/{correlationId}/solutionLogs
```

Downloads the Optimizer log. Requires workspace administrator permissions. Logs are removed 48 hours after last access.

The `actionId` comes from List Model Actions and the `correlationId` from the Anaplan UI.

```bash
curl -X GET \
  'https://api.anaplan.com/2/0/workspaces/{workspaceId}/models/{modelId}/optimizeActions/{actionId}/tasks/{correlationId}/solutionLogs' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Accept: text/plain'
```

---

## Reference

### HTTP Verbs

| Verb | Description |
| --- | --- |
| `DELETE` | Deletes a resource (uploaded/exported files, task cancellation) |
| `GET` | Retrieves a list of resources |
| `POST` | Creates or updates a resource (file metadata, task execution) |
| `PUT` | Updates a resource (file chunk upload) |

### HTTP Status Codes

| Code | Meaning |
| --- | --- |
| 200 OK | Request successful |
| 204 No Content | Request successful, empty response |
| 400 Bad Request | Incorrect request parameters or values |
| 401 Unauthorized | Invalid credentials or expired token |
| 403 Forbidden | Insufficient permissions |
| 404 Not Found | Resource does not exist or not visible |
| 405 Method Not Allowed | Wrong HTTP verb |
| 406 Not Acceptable | Unsupported response format (check Accept header) |
| 409 Conflict | Cannot change resource as requested |
| 410 Gone | Resource moved; retry the request |
| 415 Unsupported Media Type | Unsupported request body format |
| 422 Model Archived | Model must be unarchived first |
| 423 Model Locked | Model must be unlocked first |
| 424 Model Offline | Model must be brought online first |
| 425 Model Deployed | Changes should be made to the development model |
| 429 Too Many Requests | Rate limited; wait and retry |
| 500 Internal Server Error | Server error |
| 502 Bad Gateway | Network problems |
| 503 Service Unavailable | Service cannot accept request |
| 504 Gateway Timeout | Network problems |

### Query Parameters Reference

| Parameter | Values | Description |
| --- | --- | --- |
| `tenantDetails` | true, false | Include workspace size estimate |
| `includeAll` | true, false | Include additional line item or list metadata |
| `action` | add, delete | List item action type |
| `showImportDataSource` | true, false | Include import data source details |
| `includesubsidiaryviews` | true, false | Include subsidiary views |
| `format` | v1 | Return JSON instead of CSV for cell data |
| `modelDetails` | true, false | Include model memory usage and details |
| `pages` | dimensionId:itemId | Page selector for cell data |

### Import/Export Completion Codes

| Code | Message |
| --- | --- |
| `deleteFromSelectionSucceeded` | Items deleted from list using filter |
| `exportSucceeded` | Export completed successfully |
| `hierarchyNoChanges` | No changes required |
| `hierarchyRowsProcessed` | Rows processed with success/ignored counts |
| `hierarchyRowsProcessedWithFailures` | Rows processed with success/warning/failure counts |
| `lineItemRowsProcessed` | Cell count for line item |
| `lineItemRowsProcessedWithFailures` | Cell count with failure count |
| `taskElementSucceeded` | Generic success message |
| `usersRowsProcessed` | Users created/updated |
| `versionsRowsProcessed` | Versions created/updated |

### Import/Export Failure Codes

| Code | Message |
| --- | --- |
| `actionFailed` | Action failed with details |
| `connectorError` | Failed to read data |
| `crossCustomerImport` | Target and source workspaces must share the same tenant |
| `deleteFromSelectionFailed` | Delete from list failed |
| `failedToLocateEntity` | Entity not found |
| `failedToLocateHierarchy` | List not found |
| `failedToLocateModel` | Model not found |
| `failedToLocateModule` | Module not found |
| `failedToLocateSavedView` | Saved view not found |
| `hierarchyImportFailed` | Import into list failed |
| `hierarchyImportDuplicateSourceKey` | Duplicate properties in source data |
| `hierarchyImportDuplicateTargetKey` | Duplicate properties in target data |
| `importFailedGeneralError` | General import error |
| `internalError` | Internal error |
| `missingFields` | Import incomplete - unavailable fields |
| `moduleImportFailed` | Import into module failed |
| `moduleImportNoWriteAccess` | No write access to module |
| `msgExportCancelled` | Export cancelled |
| `msgImportCancelled` | Import cancelled |
| `notAuthorised` | Not authorized to run action |
| `sourceModelArchived` | Source model is archived |
| `uploadedFileNoLongerAvailable` | File expired - re-upload required |

### Data Error/Warning Codes

| Code | Message |
| --- | --- |
| `columnSeparatorExpected` | Column separator expected at line/position |
| `dateFormatInvalid` | Invalid date format |
| `hierarchyImportInvalidCode` | Invalid code |
| `hierarchyImportInvalidName` | Invalid name |
| `hierarchyImportInvalidParent` | Invalid parent |
| `hierarchyImportEmptyKey` | Error parsing key - no values |
| `hierarchyImportFailedDependency` | Has dependency on rejected row |
| `hierarchyImportNameOrCodeExists` | Name or code already exists |
| `hierarchyImportAccessNoUpdate` | Not authorized to update entity |
| `hierarchyImportAccessNoMove` | Not authorized to move entity |
| `moduleImportBooleanFormat` | Invalid Boolean (yes/no/true/false) |
| `moduleImportDateFormat` | Invalid date |
| `moduleImportNumberFormat` | Invalid number |
| `moduleImportInvalidLineItemIdentifier` | Invalid line item identifier |
| `moduleImportInvalidListIdentifier` | Item not found in list |
| `moduleImportInvalidTimeEntityIdentifier` | Item not found in calendar |
| `unmatchedTextDelimiter` | Unmatched delimiter character |
| `usersImportInvalidEmail` | Invalid email address |
| `usersImportInvalidRole` | Invalid role |
| `usersImportConflictingRoles` | Conflicting roles for user |
