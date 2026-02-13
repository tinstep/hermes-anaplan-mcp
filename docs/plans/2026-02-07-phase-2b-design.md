# Phase 2b Design: Complete Integration API v2 Coverage

**Date:** 2026-02-07
**Scope:** 24 new tools (43 → 67 total), ~25 new API endpoints
**Goal:** Cover all remaining Integration API v2 endpoints from the Apiary docs

---

## Tool Inventory (24 tools)

### Group 1: Model Management (3 tools)
| Tool | Method | Path | Description |
|------|--------|------|-------------|
| `close_model` | POST | `/workspaces/{wId}/models/{mId}/close` | Close/archive a model |
| `open_model` | POST | `/workspaces/{wId}/models/{mId}/open` | Open/wake up a model |
| `bulk_delete_models` | POST | `/workspaces/{wId}/bulkDeleteModels` | Bulk delete closed models (destructive) |

### Group 2: Calendar & Versions (6 tools)
| Tool | Method | Path | Description |
|------|--------|------|-------------|
| `show_currentperiod` | GET | `/workspaces/{wId}/models/{mId}/currentPeriod` | Get current period |
| `set_currentperiod` | PUT | `/workspaces/{wId}/models/{mId}/currentPeriod` | Set current period (destructive) |
| `show_modelcalendar` | GET | `/workspaces/{wId}/models/{mId}/modelCalendar` | Get fiscal year settings |
| `set_fiscalyear` | PUT | `/workspaces/{wId}/models/{mId}/modelCalendar/fiscalYear` | Update fiscal year (destructive) |
| `show_versions` | GET | `/models/{mId}/versions` | List version metadata |
| `set_versionswitchover` | PUT | `/models/{mId}/versions/{vId}/switchover` | Set version switchover date |

### Group 3: Users (3 tools)
| Tool | Method | Path | Description |
|------|--------|------|-------------|
| `show_currentuser` | GET | `/users/me` | Get authenticated user |
| `show_users` | GET | `/users` | List all tenant users |
| `show_userdetails` | GET | `/users/{userId}` | Get user by ID |

### Group 4: Import/Process Dumps (2 tools)
| Tool | Method | Path | Description |
|------|--------|------|-------------|
| `download_importdump` | GET | `.../imports/{iId}/tasks/{tId}/dump/chunks` + `/chunks/{n}` | Download failed import dump (chunked) |
| `download_processdump` | GET | `.../processes/{pId}/tasks/{tId}/dumps/{oId}/chunks` + `/chunks/{n}` | Download failed process dump (chunked) |

### Group 5: Task Management (2 tools)
| Tool | Method | Path | Description |
|------|--------|------|-------------|
| `show_tasks` | GET | `.../{actionType}/{aId}/tasks` | List task history for any action type |
| `cancel_task` | DELETE | `.../{actionType}/{aId}/tasks/{tId}` | Cancel running task |

### Group 6: Large Volume Reads (7 tools)
| Tool | Method | Path | Description |
|------|--------|------|-------------|
| `create_view_readrequest` | POST | `.../views/{vId}/readRequests/` | Start large view read |
| `get_view_readrequest` | GET | `.../views/{vId}/readRequests/{rId}` | Check view read status |
| `get_view_readrequest_page` | GET | `.../views/{vId}/readRequests/{rId}/pages/{pNo}` | Download view page (CSV) |
| `delete_view_readrequest` | DELETE | `.../views/{vId}/readRequests/{rId}` | Clean up view read |
| `create_list_readrequest` | POST | `.../lists/{lId}/readRequests/` | Start large list read |
| `get_list_readrequest_page` | GET | `.../lists/{lId}/readRequests/{rId}/pages/{pNo}` | Download list page (CSV) |
| `delete_list_readrequest` | DELETE | `.../lists/{lId}/readRequests/{rId}` | Clean up list read |

### Group 7: List Management (1 tool)
| Tool | Method | Path | Description |
|------|--------|------|-------------|
| `reset_list_index` | POST | `/models/{mId}/lists/{lId}/resetIndex` | Reset list item numbering |

---

## API Layer Design

### New API Classes (4)

**CalendarApi** (`src/api/calendar.ts`)
- `getCurrentPeriod(wId, mId)` → GET
- `setCurrentPeriod(wId, mId, periodText)` → PUT
- `getModelCalendar(wId, mId)` → GET
- `setFiscalYear(wId, mId, year)` → PUT

**VersionsApi** (`src/api/versions.ts`)
- `list(mId)` → GET `/models/{mId}/versions`
- `setSwitchover(mId, vId, date)` → PUT

**UsersApi** (`src/api/users.ts`)
- `getCurrentUser()` → GET `/users/me`
- `get(userId)` → GET `/users/{userId}`
- `list()` → GET `/users`

**LargeReadsApi** (`src/api/large-reads.ts`)
- `createViewReadRequest(wId, mId, vId, exportType)` → POST
- `getViewReadRequest(wId, mId, vId, rId)` → GET
- `getViewReadRequestPage(wId, mId, vId, rId, pageNo)` → GET (returns CSV text)
- `deleteViewReadRequest(wId, mId, vId, rId)` → DELETE
- `createListReadRequest(wId, mId, lId)` → POST
- `getListReadRequestPage(wId, mId, lId, rId, pageNo)` → GET (returns CSV text)
- `deleteListReadRequest(wId, mId, lId, rId)` → DELETE

### Extended Existing Classes (4)

**ModelManagementApi** — add `close(wId, mId)`, `open(wId, mId)`, `bulkDelete(wId, modelIds[])`
**ImportsApi** — add `listTasks(wId, mId, iId)`, `cancelTask(wId, mId, iId, tId)`, `getDumpChunks(wId, mId, iId, tId)`, `getDumpChunkData(wId, mId, iId, tId, chunkId)`
**ExportsApi** — add `listTasks(wId, mId, eId)`, `cancelTask(wId, mId, eId, tId)`
**ProcessesApi** — add `listTasks(wId, mId, pId)`, `cancelTask(wId, mId, pId, tId)`, `getDumpChunks(wId, mId, pId, tId, oId)`, `getDumpChunkData(wId, mId, pId, tId, oId, chunkId)`
**ActionsApi** — add `listTasks(wId, mId, aId)`, `cancelTask(wId, mId, aId, tId)`
**ListsApi** — add `resetIndex(mId, lId)`

### Tool Registration

New tools go into existing files by category:
- **exploration.ts**: show_currentperiod, show_modelcalendar, show_versions, show_currentuser, show_users, show_userdetails, show_tasks (7 tools)
- **bulk.ts**: close_model, open_model, bulk_delete_models, set_currentperiod, set_fiscalyear, set_versionswitchover, download_importdump, download_processdump, cancel_task, create_view_readrequest, get_view_readrequest, get_view_readrequest_page, delete_view_readrequest, create_list_readrequest, get_list_readrequest_page, delete_list_readrequest, reset_list_index (17 tools)

### Server Wiring

`server.ts` needs to:
1. Instantiate CalendarApi, VersionsApi, UsersApi, LargeReadsApi
2. Pass them to registerExplorationTools and registerBulkTools
3. No changes to registerTransactionalTools

### Name Resolution

NameResolver extended to resolve version IDs (from show_versions). Other new params (taskId, requestId, pageNo, chunkId, objectId) are opaque IDs — no resolution needed.

---

## Key Design Decisions

1. **show_tasks and cancel_task are polymorphic** — accept `actionType` param (imports/exports/processes/actions), same pattern as existing `get_action_status`
2. **Large read pages return raw CSV** — no JSON parsing, returned as text content blocks
3. **Dump downloads auto-concatenate chunks** — same pattern as existing `download_file`
4. **Destructive tools (set_*, bulk_delete, cancel_task) include confirmation warnings** in tool descriptions
5. **No list read request status tool** — status polling is simple enough to check inline via get_list_readrequest_page (returns error if not ready). If needed, users can use get_view_readrequest pattern.

Wait — actually we should add `get_list_readrequest` for consistency with views. Updated count: **24 tools** with get_list_readrequest included. But looking again, the list read request status and delete are useful. Let me revise:

Actually, on reflection, keeping a `get_list_readrequest` (status) and `delete_list_readrequest` makes it symmetric with views. The final count stays at 24 tools as listed above.
