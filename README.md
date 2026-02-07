[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-compatible-green?logo=anthropic)](https://modelcontextprotocol.io/)
[![Built with Claude Code](https://img.shields.io/badge/Built%20with-Claude%20Code-blueviolet?logo=anthropic)](https://claude.ai/code)

# Anaplan MCP

A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server that connects AI assistants to Anaplan's Integration API v2. Gives LLMs like Claude direct access to browse Anaplan workspaces, read and write model data, run imports/exports, and manage list items — all through 27 structured tools.

Built in TypeScript. Runs over stdio. Works with Claude Desktop, Claude Code, and any MCP-compatible client.

## What It Does

Anaplan MCP bridges the gap between conversational AI and Anaplan's planning platform. Instead of manually navigating the Anaplan UI or writing API scripts, you can ask your AI assistant to:

- **Explore model structure** — browse workspaces, models, modules, line items, views, and lists to understand how a model is built
- **Read and write cell data** — pull data from module views or push values to specific cells through the transactional API
- **Run bulk operations** — trigger imports, exports, processes, and delete actions, with automatic task polling until completion
- **Manage files** — upload CSV/text data to Anaplan files or download file contents
- **Manage lists** — add, update, or delete list items programmatically

All operations go through Anaplan's official Integration API v2 with proper authentication, automatic token refresh, and retry logic for rate limits and transient failures.

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

Restart Claude Desktop or Claude Code to pick up the new server. The 27 Anaplan tools should now be available.

### Browser-based AI (claude.ai, gemini.google.com, chatgpt.com)

MCP servers run as local processes on your machine — the AI client spawns the server over stdio. Browser-based AI products like claude.ai, Gemini, and ChatGPT web cannot launch local processes, so they cannot connect to this server. You need a desktop application (Claude Desktop, Claude Code) that runs on your machine.

## Authentication

Three methods supported, auto-detected from environment variables. If multiple are configured, the highest priority method wins.

| Method | Env Vars | Priority |
|--------|----------|----------|
| Certificate | `ANAPLAN_CERTIFICATE_PATH`, `ANAPLAN_PRIVATE_KEY_PATH` | Highest |
| OAuth2 (Device Grant) | `ANAPLAN_CLIENT_ID`, `ANAPLAN_CLIENT_SECRET` (optional) | Medium |
| Basic | `ANAPLAN_USERNAME`, `ANAPLAN_PASSWORD` | Lowest |

### How Auth Works

- **Basic** — sends base64 credentials to Anaplan's auth endpoint, receives a session token
- **Certificate** — reads your PEM certificate and private key, signs a random challenge with SHA512, authenticates via the CACertificate flow
- **OAuth2 Device Grant** — initiates a device code flow, prints a URL and code to stderr for the user to authorize, then polls for an access token

All methods produce a token that is cached in memory and automatically refreshed 5 minutes before the 35-minute expiry. You never need to manage tokens yourself.

## Available Tools

### Model Exploration (15 tools)

Navigate the Anaplan model hierarchy to understand structure before working with data.

| Tool | Description |
|------|-------------|
| `show_workspaces` | List all accessible workspaces |
| `show_models` | List models in a workspace |
| `show_modeldetails` | Get model details including status and workspace |
| `show_modules` | List modules in a model |
| `show_moduledetails` | Get module details with dimensions |
| `show_lineitems` | List line items in a module |
| `show_savedviews` | List saved views in a module |
| `show_lists` | List all dimensions (lists) in a model |
| `get_list_items` | Get items in a list |
| `show_imports` | List available import actions |
| `show_exports` | List available export actions |
| `show_processes` | List available processes |
| `show_files` | List files in a model |
| `show_actions` | List available actions (including delete actions) |
| `show_viewdetails` | Get view dimension metadata (rows, columns, pages) |

All list tools support **pagination** and **search**:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `offset` | Number of items to skip | 0 |
| `limit` | Max items to return | 10 (max 50) |
| `search` | Filter by name or ID (case-insensitive substring match) | — |

Results are returned as numbered markdown tables with a pagination footer. Example:

| # | Name | ID |
|---|------|-----|
| 1 | Revenue Model | ABC123 |
| 2 | Cost Model | DEF456 |

Page 1 of 5 (1-10 of 47 models).
Ask for "next page" for page 2, "search \<term\>" to filter.

The footer shows page numbers (e.g., "Page 2 of 15") and navigation hints for next/previous page and search filtering. Row numbers are sequential across pages (page 2 starts at 11).

### Bulk Data Operations (7 tools)

Execute Anaplan actions that move data in and out of models. Import and export actions are polled automatically — the tool waits for the action to complete and returns the result.

| Tool | Description |
|------|-------------|
| `run_export` | Execute an export action and return the exported data |
| `run_import` | Upload data to a file, then execute an import action |
| `run_process` | Execute a process (chained sequence of actions) |
| `run_delete` | Execute a delete action to remove data from a module |
| `upload_file` | Upload CSV or text data to an Anaplan file (chunked for large files) |
| `download_file` | Download file content from a model |
| `get_action_status` | Check the status of a running action by task ID |

### Transactional Operations (5 tools)

Read and write individual cells or manage list membership through Anaplan's transactional API. Responses larger than 50,000 characters are automatically flagged with a truncation notice.

| Tool | Description |
|------|-------------|
| `read_cells` | Read cell data from a module view |
| `write_cells` | Write values to specific cells in a module |
| `add_list_items` | Add new items to a list |
| `update_list_items` | Update properties of existing list items |
| `delete_list_items` | Remove items from a list |

## Architecture

```
src/
  auth/       # Authentication providers (basic, certificate, oauth) + token manager
  api/        # HTTP client with retry logic + domain-specific API wrappers
  tools/      # MCP tool registrations (exploration, bulk, transactional)
  server.ts   # Wires auth → client → APIs → MCP server
  index.ts    # Entry point (stdio transport)
```

Three layers:

1. **Auth layer** — pluggable providers behind a common `AuthProvider` interface. The `AuthManager` selects the right provider from env vars and handles token lifecycle.
2. **API layer** — `AnaplanClient` handles all HTTP communication with the Anaplan API (`https://api.anaplan.com/2/0/`). Retries 429s (respects `Retry-After` header) and 5xx errors up to 3 times with exponential backoff. Auto-paginates list endpoints via `getAll()` using Anaplan's `meta.paging` metadata. Domain wrappers (`WorkspacesApi`, `ModelsApi`, etc.) provide typed methods for each endpoint.
3. **Tools layer** — registers MCP tools on the server with zod schemas for input validation. Each tool delegates to the appropriate API wrapper and returns JSON results.


## Disclaimers

- This project is built against the [Anaplan Integration API v2](https://anaplan.docs.apiary.io/), which served as the primary API reference
- This is a personal project, not affiliated with or endorsed by Anaplan
- Users are responsible for compliance with Anaplan's Terms of Service
- Always test in non-production environments first
- Write operations (imports, cell writes, list mutations, delete actions) can cause irreversible data loss — review AI-generated actions before confirming
- API credentials are passed via environment variables — keep them out of version control
- No support or warranties provided
- Use at your own risk

## License

MIT — see [LICENSE](LICENSE) for details.
