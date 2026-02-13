# Anaplan MCP — API Coverage Roadmap

## Current Coverage (Phase 1 + Phase 2 + Phase 2b — Done)

**Integration API v2** (`https://api.anaplan.com/2/0/`) — 67 tools, ~80+ endpoints

- **Exploration (37 tools):** workspaces, models, modules, line items, views, lists, imports, exports, processes, files, actions — with detail/metadata endpoints for each, plus cross-module line items/views, dimension items, dimension lookups, model status, calendar, versions, users, task history
- **Bulk (25 tools):** run imports/exports/processes/deletes, upload/download/delete files, poll task status, close/open/bulk-delete models, set current period/fiscal year/version switchover, download import/process dumps, cancel tasks, large volume view/list reads, reset list index
- **Transactional (5 tools):** read/write cells, add/update/delete list items

**Authentication** (`https://auth.anaplan.com/token/`)
- Basic auth, Certificate auth, OAuth 2.0 (device grant)
- Token caching + auto-refresh

**Quality of Life (Done)**
- Name-to-ID resolver with in-memory cache (5-minute TTL)
- Pagination & search on all list tools
- Accept: application/json header globally
- JSON format (format=v1) for read_cells
- File chunk download (actual data, not metadata)

---

### Phase 3: ALM API (Application Lifecycle Management)

**Base URL:** `https://api.anaplan.com/2/0/` (same base, different resource paths)
**Docs:** [Apiary](https://almapi.docs.apiary.io/) | [Anapedia](https://help.anaplan.com/application-lifecycle-management-api-2565cfa6-e0c2-4e24-884e-d0df957184d6)
**Auth:** Same token as Integration API
**Requires:** Professional or Enterprise subscription

| Endpoint | Description |
|----------|-------------|
| `POST /models/{mId}/alm/revisions` | Create a revision tag |
| `GET /models/{mId}/alm/latestRevision` | Get latest revision from target model |
| `GET /models/{mId}/alm/SyncableRevisions?sourceModelId={srcId}` | Get compatible revisions from source |
| `POST /models/{mId}/alm/syncTasks` | Sync source revision to target model |
| `GET /models/{mId}/alm/syncTasks/{taskId}` | Get sync task status |
| `POST /models/{mId}/alm/comparisonReportTasks` | Generate comparison/impact report |
| `POST /models/{mId}/onlineStatus` | Take model online/offline |

**Estimated tools:** 7

---

### Phase 4: SCIM API (User & Identity Management)

**Base URL:** `https://api.anaplan.com/scim/1/0/v2/`
**Docs:** [Apiary](https://scimapi.docs.apiary.io/) | [Anapedia](https://help.anaplan.com/scim-api-f6a801cd-c253-4ab9-ba03-dac09fd71f7c)
**Auth:** Same Anaplan auth token
**Standard:** SCIM 2.0 (RFC 7644)

| Endpoint | Description |
|----------|-------------|
| `GET /ServiceProviderConfig` | Get supported SCIM features |
| `GET /Schemas` | Describe data models and attributes |
| `GET /ResourceTypes` | List available SCIM resource endpoints |
| `GET /Users` | List/search users |
| `POST /Users` | Create a user |
| `GET /Users/{userId}` | Get user details |
| `PATCH /Users/{userId}` | Update user attributes |
| `DELETE /Users/{userId}` | Delete a user |
| `GET /Groups` | List/search groups (workspace assignments) |
| `POST /Groups` | Create a group |
| `GET /Groups/{groupId}` | Get group details |
| `PATCH /Groups/{groupId}` | Update group membership |
| `DELETE /Groups/{groupId}` | Delete a group |

**Estimated tools:** 10-12

---

### Phase 5: CloudWorks API (Integration Connectors & Scheduling)

**Base URL:** `https://api.cloudworks.anaplan.com/2/0/`
**Docs:** [Apiary](https://cloudworks.docs.apiary.io/) | [Anapedia](https://help.anaplan.com/cloudworks-api-94bfcdc3-fff0-48d6-be9c-0e1bba2e889c)
**Auth:** `AnaplanAuthToken` header
**Limits:** 500 integrations per tenant; history stored 6 months

| Endpoint | Description |
|----------|-------------|
| `POST /integrations/connection` | Create a connection (S3, Azure Blob, BigQuery) |
| `GET /integrations` | List all integrations |
| `POST /integrations` | Create an integration |
| `GET /integrations/{id}` | Get integration details |
| `PUT /integrations/{id}/schedule` | Set schedule (daily/weekly/monthly) |
| `POST /integrations/{id}/run` | Execute an integration |
| `GET /integrations/runs/{id}` | Get run history |

**Estimated tools:** 7

---

### Phase 6: Audit API

**Base URL:** `https://audit.anaplan.com/audit/api/1/`
**Docs:** [Apiary](https://auditservice.docs.apiary.io/) | [Anapedia](https://help.anaplan.com/audit-api-0dbbe4be-d5b7-4075-89ad-fa922f88e855)
**Auth:** Same Anaplan auth token
**Requires:** Audit enabled on tenant + Tenant Auditor role

| Endpoint | Description |
|----------|-------------|
| `GET /events` | Query audit events (date range, event type, pagination) |

**Estimated tools:** 1-2

---

### Deferred: Exception Users API

**Base URL:** `https://api.anaplan.com/` (exact paths TBD)
**Docs:** [Apiary](https://exceptionusersapi2.docs.apiary.io/) | [Anapedia](https://help.anaplan.com/exception-users-api--814cd4ae-0e80-4910-8500-988ad089eef1)
**Auth:** Same Anaplan auth token
**Requires:** Tenant Security Administrator role

**Estimated tools:** 3

---

### Deferred: Financial Consolidation API (Separate Product)

**Base URL:** `https://fluenceapi-prod.fluence.app/api/v2305.1/`
**Docs:** [Anapedia](https://help.anaplan.com/anaplan-financial-consolidation-api-e83345d8-0509-4228-b532-679ee398a9d5)
**Auth:** Separate — `X_API_TOKEN` + `TENANT` headers (not standard Anaplan auth)
**Requires:** FinCon license

**Estimated tools:** 8-10

---

## Summary

| Phase | API | Tools | Auth | Status |
|-------|-----|-------|------|--------|
| 1+2+2b | Integration API v2 (complete) | 67 | Basic/Cert/OAuth | **Done** |
| 3 | ALM | ~7 | Same token | **Next** |
| 4 | SCIM | ~12 | Same token | Planned |
| 5 | CloudWorks | ~7 | Same token | Planned |
| 6 | Audit | ~2 | Same token | Planned |
| — | Exception Users | ~3 | Same token | Deferred |
| — | Financial Consolidation | ~10 | Separate auth | Deferred |

**Current: 67 tools — complete Integration API v2 coverage**
**After Phase 6: ~88 tools — all Anaplan APIs with shared auth**

Phases 3-6 can be developed in parallel (different base URLs or independent endpoint groups, no shared wiring files). API docs saved in `docs/anaplan_documentation/`.
