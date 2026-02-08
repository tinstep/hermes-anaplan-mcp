[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-compatible-green?logo=anthropic)](https://modelcontextprotocol.io/)
[![Built with Claude Code](https://img.shields.io/badge/Built%20with-Claude%20Code-blueviolet?logo=anthropic)](https://claude.ai/code)

# Anaplan MCP

A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server that connects AI assistants to Anaplan's Integration API v2. Gives LLMs like Claude direct access to browse Anaplan workspaces, read and write model data, run imports/exports, manage list items, and administer models - all through 68 structured tools.

Built in TypeScript. Runs over stdio. Works with Claude Desktop, Claude Code, and any MCP-compatible client.

## Setup

### 1. Clone and build

```bash
git clone https://github.com/larasrinath/anaplan-mcp.git
cd anaplan-mcp
npm install
npm run build
```

### 2. Configure your MCP client

Add the following to your MCP client config. The file location depends on your client:

- **Claude Desktop (macOS):** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Claude Desktop (Windows):** `%APPDATA%\Claude\claude_desktop_config.json`
- **Claude Code:** `~/.claude/mcp_settings.json` or run `claude mcp add`

```json
{
  "mcpServers": {
    "anaplan": {
      "command": "node",
      "args": ["/absolute/path/to/anaplan-mcp/dist/index.js"],
      "env": {
        "ANAPLAN_USERNAME": "user@company.com",
        "ANAPLAN_PASSWORD": "your-password"
      }
    }
  }
}
```

**Important:** Replace `/absolute/path/to/anaplan-mcp` with the *actual absolute path* where you cloned the repo (e.g., `/Users/you/anaplan-mcp`).

### 3. Restart your MCP client

Restart Claude Desktop or Claude Code to pick up the new server. The 68 Anaplan tools should now be available.

### Browser-based AI (claude.ai, gemini.google.com, chatgpt.com)

MCP servers run as local processes on your machine - the AI client spawns the server over stdio. Browser-based AI products like claude.ai, Gemini, and ChatGPT web cannot launch local processes, so they cannot connect to this server. You need a desktop application (Claude Desktop, Claude Code) that runs on your machine.

## Authentication

Three methods supported, auto-detected from environment variables. If multiple are configured, the highest priority method wins.

| Method | Env Vars | Priority |
|--------|----------|----------|
| Certificate | `ANAPLAN_CERTIFICATE_PATH`, `ANAPLAN_PRIVATE_KEY_PATH` | Highest |
| OAuth2 (Device Grant) | `ANAPLAN_CLIENT_ID`, `ANAPLAN_CLIENT_SECRET` (optional) | Medium |
| Basic | `ANAPLAN_USERNAME`, `ANAPLAN_PASSWORD` | Lowest |

- **Basic** - sends base64 credentials to Anaplan's auth endpoint, receives a session token
- **Certificate** - reads your PEM certificate and private key, signs a random challenge with SHA512, authenticates via the CACertificate flow
- **OAuth2 Device Grant** - initiates a device code flow, prints a URL and code to stderr for the user to authorize, then polls for an access token

All methods produce a token that is cached in memory and automatically refreshed 5 minutes before the 35-minute expiry. You never need to manage tokens yourself.

## Tools

### Model Exploration (37 tools)

| Tool | Description |
|------|-------------|
| `show_workspaces` | List all accessible workspaces<br>`GET /workspaces` |
| `show_workspacedetails` | Get workspace details (size and active status)<br>`GET /workspaces/{workspaceId}` |
| `show_models` | List models in a workspace<br>`GET /workspaces/{workspaceId}/models` |
| `show_allmodels` | List all models across all workspaces<br>`GET /models` |
| `show_modeldetails` | Get model details including state and workspace<br>`GET /models/{modelId}` |
| `show_modelstatus` | Check model status (legacy endpoint, often returns 405)<br>`POST /workspaces/{workspaceId}/models/{modelId}/status` |
| `show_modules` | List modules in a model<br>`GET /workspaces/{workspaceId}/models/{modelId}/modules` |
| `show_moduledetails` | Get module details by filtering module list<br>`GET /workspaces/{workspaceId}/models/{modelId}/modules` |
| `show_lineitems` | List line items in a module (`includeAll` supported)<br>`GET /models/{modelId}/modules/{moduleId}/lineItems` |
| `show_alllineitems` | List all line items in a model (`includeAll` supported)<br>`GET /models/{modelId}/lineItems` |
| `show_lineitem_dimensions` | List dimensions for a line item<br>`GET /models/{modelId}/lineItems/{lineItemId}/dimensions` |
| `show_lineitem_dimensions_items` | List dimension items for a line item/dimension pair<br>`GET /models/{modelId}/lineItems/{lineItemId}/dimensions/{dimensionId}/items` |
| `show_savedviews` | List saved and default views in a module<br>`GET /workspaces/{workspaceId}/models/{modelId}/modules/{moduleId}/views` |
| `show_allviews` | List all views in a model (cross-module)<br>`GET /models/{modelId}/views` |
| `show_viewdetails` | Get view axis metadata (rows, columns, pages)<br>`GET /models/{modelId}/views/{viewId}` |
| `show_lists` | List lists (dimensions) in a model<br>`GET /workspaces/{workspaceId}/models/{modelId}/lists` |
| `get_list_items` | Get items from a list<br>`GET /workspaces/{workspaceId}/models/{modelId}/lists/{listId}/items` |
| `show_listmetadata` | Get list metadata including parent/properties/count<br>`GET /workspaces/{workspaceId}/models/{modelId}/lists/{listId}` |
| `show_dimensionitems` | List all items in a model-level dimension<br>`GET /models/{modelId}/dimensions/{dimensionId}/items` |
| `show_viewdimensionitems` | List selected dimension items for a view<br>`GET /models/{modelId}/views/{viewId}/dimensions/{dimensionId}/items` |
| `lookup_dimensionitems` | Resolve dimension items by names/codes<br>`POST /workspaces/{workspaceId}/models/{modelId}/dimensions/{dimensionId}/items` |
| `show_imports` | List import actions in a model<br>`GET /workspaces/{workspaceId}/models/{modelId}/imports` |
| `show_importdetails` | Get import metadata<br>`GET /workspaces/{workspaceId}/models/{modelId}/imports/{importId}` |
| `show_exports` | List export actions in a model<br>`GET /workspaces/{workspaceId}/models/{modelId}/exports` |
| `show_exportdetails` | Get export metadata<br>`GET /workspaces/{workspaceId}/models/{modelId}/exports/{exportId}` |
| `show_processes` | List process actions in a model<br>`GET /workspaces/{workspaceId}/models/{modelId}/processes` |
| `show_processdetails` | Get process metadata<br>`GET /workspaces/{workspaceId}/models/{modelId}/processes/{processId}` |
| `show_files` | List files in a model<br>`GET /workspaces/{workspaceId}/models/{modelId}/files` |
| `show_actions` | List model actions (including deletes)<br>`GET /workspaces/{workspaceId}/models/{modelId}/actions` |
| `show_actiondetails` | Get action metadata<br>`GET /workspaces/{workspaceId}/models/{modelId}/actions/{actionId}` |
| `show_currentperiod` | Get current period<br>`GET /workspaces/{workspaceId}/models/{modelId}/currentPeriod` |
| `show_modelcalendar` | Get fiscal year/calendar settings<br>`GET /workspaces/{workspaceId}/models/{modelId}/modelCalendar` |
| `show_versions` | List version metadata<br>`GET /models/{modelId}/versions` |
| `show_currentuser` | Get current authenticated user<br>`GET /users/me` |
| `show_users` | List users in tenant scope<br>`GET /users` |
| `show_userdetails` | Get user details by ID<br>`GET /users/{userId}` |
| `show_tasks` | List task history for imports/exports/processes/actions<br>`GET /workspaces/{workspaceId}/models/{modelId}/{actionType}/{actionId}/tasks` |

### Bulk Data Operations (26 tools)

| Tool | Description |
|------|-------------|
| `run_export` | Run export task, download output, optionally save locally with `saveToDownloads` and `fileName`<br>`POST .../exports/{exportId}/tasks` |
| `run_import` | Upload file chunks, run import, and poll task completion<br>`POST .../imports/{importId}/tasks` |
| `run_process` | Run process task and poll completion<br>`POST .../processes/{processId}/tasks` |
| `run_delete` | Run delete action task<br>`POST .../actions/{deleteActionId}/tasks` |
| `upload_file` | Initialize chunked upload, upload chunks, and complete file upload<br>`POST .../files/{fileId}` |
| `download_file` | Download file by reading all chunk payloads<br>`GET .../files/{fileId}/chunks` |
| `delete_file` | Delete model file (irreversible)<br>`DELETE .../files/{fileId}` |
| `get_action_status` | Get status for import/export/process/action task<br>`GET .../{actionType}/{actionId}/tasks/{taskId}` |
| `close_model` | Close (archive) a model<br>`POST .../models/{modelId}/close` |
| `open_model` | Open (wake up) a closed model<br>`POST .../models/{modelId}/open` |
| `bulk_delete_models` | Delete multiple closed models<br>`POST /workspaces/{workspaceId}/bulkDeleteModels` |
| `set_currentperiod` | Set current period<br>`PUT .../models/{modelId}/currentPeriod` |
| `set_fiscalyear` | Update model fiscal year<br>`PUT .../models/{modelId}/modelCalendar/fiscalYear` |
| `set_versionswitchover` | Set version switchover date<br>`PUT /models/{modelId}/versions/{versionId}/switchover` |
| `download_importdump` | Download failed import dump chunks (CSV)<br>`GET .../imports/{importId}/tasks/{taskId}/dump/chunks` |
| `download_processdump` | Download failed process dump chunks (CSV)<br>`GET .../processes/{processId}/tasks/{taskId}/dumps/{objectId}/chunks` |
| `cancel_task` | Cancel running import/export/process/action task<br>`DELETE .../{actionType}/{actionId}/tasks/{taskId}` |
| `create_view_readrequest` | Create large-volume view read request<br>`POST .../views/{viewId}/readRequests` |
| `get_view_readrequest` | Get large-volume view read request status<br>`GET .../views/{viewId}/readRequests/{requestId}` |
| `get_view_readrequest_page` | Download a CSV page from view read request<br>`GET .../views/{viewId}/readRequests/{requestId}/pages/{pageNo}` |
| `delete_view_readrequest` | Delete large-volume view read request<br>`DELETE .../views/{viewId}/readRequests/{requestId}` |
| `create_list_readrequest` | Create large-volume list read request<br>`POST .../lists/{listId}/readRequests` |
| `get_list_readrequest` | Get large-volume list read request status<br>`GET .../lists/{listId}/readRequests/{requestId}` |
| `get_list_readrequest_page` | Download a CSV page from list read request<br>`GET .../lists/{listId}/readRequests/{requestId}/pages/{pageNo}` |
| `delete_list_readrequest` | Delete large-volume list read request<br>`DELETE .../lists/{listId}/readRequests/{requestId}` |
| `reset_list_index` | Reset list item index numbering<br>`POST /models/{modelId}/lists/{listId}/resetIndex` |

### Transactional Operations (5 tools)

| Tool | Description |
|------|-------------|
| `read_cells` | Read cell data from a module view<br>`GET /models/{modelId}/views/{viewId}/data?format=v1` |
| `write_cells` | Write values to specific module cells<br>`POST /models/{modelId}/modules/{moduleId}/data` |
| `add_list_items` | Add new items to a list<br>`POST .../lists/{listId}/items?action=add` |
| `update_list_items` | Update existing list items<br>`PUT .../lists/{listId}/items?action=update` |
| `delete_list_items` | Delete list items<br>`POST .../lists/{listId}/items?action=delete` |

## Features

### Recent Additions

- Formula metadata support for line items: `show_lineitems` and `show_alllineitems` now support `includeAll=true` and display formula, format, applies-to, and version fields.
- Consistent single-record rendering: table output now renders one-record results as key-value rows (no header), while multi-record results use standard column headers.
- Expanded large-list read support: `get_list_readrequest` added to check list read request status directly.
- Broader task status coverage: `get_action_status` now supports `actions` in addition to `imports`, `exports`, and `processes`.
- Improved API robustness: HTTP `204/205` success responses are handled without JSON parse failures.
- Optional export file save: `run_export` can now write the downloaded content to `~/Downloads` when `saveToDownloads=true`.
- Improved user-list compatibility: `show_users` now handles both `/users` response shapes (`users` and `user` arrays).

### Name Resolution

All tools accept human-readable names alongside raw Anaplan IDs. Instead of passing a 32-character hex ID like `8a81b09e5f5501a1015f663e30230707`, you can just say "Revenue Model". Name matching is case-insensitive. Resolved names are cached in memory with a 5-minute TTL.

### Pagination and Search

All list tools support pagination and search filtering:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `offset` | Number of items to skip | 0 |
| `limit` | Max items to return | 10 (max 50) |
| `search` | Filter by name or ID (case-insensitive substring match) | - |

Results come back as numbered tables with a pagination footer showing page numbers and navigation hints. Row numbers are sequential across pages (page 2 starts at 11).

### Automatic Task Polling

Import, export, process, and delete actions are asynchronous in Anaplan. The bulk tools handle this automatically - they start the action, poll every 2 seconds until it completes (up to 5 minutes), and return the final result. No need to manually check task status.

### Retry Logic

All API calls automatically retry on transient failures:
- **429 (Rate Limited)** - waits for the `Retry-After` duration, then retries
- **5xx (Server Error)** - retries up to 3 times with exponential backoff (1s, 2s, 4s)

### Large Response Handling

Transactional API responses over 50,000 characters are automatically truncated with a notice rather than failing. For truly large datasets, use the large volume read tools (`create_view_readrequest`, `get_view_readrequest_page`) which stream data as paginated CSV.

### Chunked File Upload

File uploads are automatically chunked for large files (50MB per chunk). The 3-step upload flow (initialize, upload chunks, complete) is handled transparently by the `upload_file` and `run_import` tools.

## Architecture

```
src/
  auth/       # Authentication providers (basic, certificate, oauth) + token manager
  api/        # HTTP client with retry logic + 16 domain-specific API wrappers
  tools/      # MCP tool registrations (exploration, bulk, transactional)
  server.ts   # Wires auth > client > APIs > MCP server
  index.ts    # Entry point (stdio transport)
```

Three layers:

1. **Auth layer** - pluggable providers behind a common `AuthProvider` interface. The `AuthManager` selects the right provider from env vars and handles token lifecycle.
2. **API layer** - `AnaplanClient` handles all HTTP communication with the Anaplan API. 16 domain wrappers provide typed methods for each endpoint. Auto-paginates list endpoints using Anaplan's `meta.paging` metadata.
3. **Tools layer** - registers MCP tools on the server with zod schemas for input validation. Each tool delegates to the appropriate API wrapper and formats results.

## Disclaimers

- This project is built against the [Anaplan Integration API v2](https://anaplan.docs.apiary.io/), which served as the primary API reference
- `show_modelstatus` uses `POST /workspaces/{workspaceId}/models/{modelId}/status`; this endpoint is present in some historical docs but often returns `405 Method Not Allowed` in current tenants, so treat it as unsupported unless your tenant confirms availability
- This is a personal project, not affiliated with or endorsed by Anaplan
- Users are responsible for compliance with Anaplan's Terms of Service
- Always test in non-production environments first
- Write operations (imports, cell writes, list mutations, delete actions) can cause irreversible data loss - review AI-generated actions before confirming
- API credentials are passed via environment variables - keep them out of version control
- No support or warranties provided
- Use at your own risk

## License

MIT - see [LICENSE](LICENSE) for details.
