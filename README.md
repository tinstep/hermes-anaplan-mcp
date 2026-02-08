[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-compatible-green?logo=anthropic)](https://modelcontextprotocol.io/)
[![Built with Claude Code](https://img.shields.io/badge/Built%20with-Claude%20Code-blueviolet?logo=anthropic)](https://claude.ai/code)

# Anaplan MCP

A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server that connects AI assistants to Anaplan's Integration API v2. Gives LLMs like Claude direct access to browse Anaplan workspaces, read and write model data, run imports/exports, manage list items, and administer models - all through 67 structured tools.

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

Restart Claude Desktop or Claude Code to pick up the new server. The 67 Anaplan tools should now be available.

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
| `show_workspaces` | List all accessible workspaces |
| `show_workspacedetails` | Get workspace details (size, active status) |
| `show_models` | List models in a workspace |
| `show_allmodels` | List all models across all workspaces |
| `show_modeldetails` | Get model details including status and workspace |
| `show_modelstatus` | Check model status (memory usage, export progress) |
| `show_modules` | List modules in a model |
| `show_moduledetails` | Get module details with dimensions |
| `show_lineitems` | List line items in a module |
| `show_alllineitems` | List all line items in a model (cross-module) |
| `show_lineitemdimensions` | List dimension IDs for a line item |
| `show_lineitemdimensionitems` | List dimension items for a specific line item |
| `show_savedviews` | List saved views in a module |
| `show_allviews` | List all views in a model (cross-module) |
| `show_viewdetails` | Get view dimension metadata (rows, columns, pages) |
| `show_lists` | List all dimensions (lists) in a model |
| `get_list_items` | Get items in a list |
| `show_listmetadata` | Get list metadata (properties, parent, item count) |
| `show_dimensionitems` | List all items in a dimension (model-level) |
| `show_viewdimensionitems` | List selected items in a dimension for a view |
| `lookup_dimensionitems` | Look up dimension items by name or code |
| `show_imports` | List available import actions |
| `show_importdetails` | Get import definition metadata |
| `show_exports` | List available export actions |
| `show_exportdetails` | Get export definition metadata |
| `show_processes` | List available processes |
| `show_processdetails` | Get process definition metadata |
| `show_files` | List files in a model |
| `show_actions` | List available actions (including delete actions) |
| `show_actiondetails` | Get action definition metadata |
| `show_currentperiod` | Get current period for a model |
| `show_modelcalendar` | Get model calendar with fiscal year settings |
| `show_versions` | List version metadata for a model |
| `show_currentuser` | Get current authenticated user info |
| `show_users` | List all users in the tenant |
| `show_userdetails` | Get user details by ID |
| `show_tasks` | List task history for an import, export, process, or action |

### Bulk Data Operations (25 tools)

| Tool | Description |
|------|-------------|
| `run_export` | Execute an export action and return the exported data |
| `run_import` | Upload data to a file, then execute an import action |
| `run_process` | Execute a process (chained sequence of actions) |
| `run_delete` | Execute a delete action to remove data from a module |
| `upload_file` | Upload CSV or text data to an Anaplan file (chunked for large files) |
| `download_file` | Download file content from a model |
| `delete_file` | Delete a file from a model |
| `get_action_status` | Check the status of a running action by task ID |
| `close_model` | Close (archive) a model |
| `open_model` | Open (wake up) a closed model |
| `bulk_delete_models` | Bulk delete closed models (irreversible) |
| `set_currentperiod` | Set current period for a model |
| `set_fiscalyear` | Update fiscal year for model calendar |
| `set_versionswitchover` | Set version switchover date |
| `download_importdump` | Download failed import task dump data (CSV) |
| `download_processdump` | Download failed process task dump data (CSV) |
| `cancel_task` | Cancel a running import, export, process, or action task |
| `create_view_readrequest` | Start a large volume view read request |
| `get_view_readrequest` | Check status of a large volume view read request |
| `get_view_readrequest_page` | Download a page from a large volume view read (CSV) |
| `delete_view_readrequest` | Delete a large volume view read request |
| `create_list_readrequest` | Start a large volume list read request |
| `get_list_readrequest_page` | Download a page from a large volume list read (CSV) |
| `delete_list_readrequest` | Delete a large volume list read request |
| `reset_list_index` | Reset list item index numbering |

### Transactional Operations (5 tools)

| Tool | Description |
|------|-------------|
| `read_cells` | Read cell data from a module view |
| `write_cells` | Write values to specific cells in a module |
| `add_list_items` | Add new items to a list |
| `update_list_items` | Update properties of existing list items |
| `delete_list_items` | Remove items from a list |

## Features

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
- This is a personal project, not affiliated with or endorsed by Anaplan
- Users are responsible for compliance with Anaplan's Terms of Service
- Always test in non-production environments first
- Write operations (imports, cell writes, list mutations, delete actions) can cause irreversible data loss - review AI-generated actions before confirming
- API credentials are passed via environment variables - keep them out of version control
- No support or warranties provided
- Use at your own risk

## License

MIT - see [LICENSE](LICENSE) for details.
