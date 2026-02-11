[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MCP](https://img.shields.io/badge/MCP-compatible-green?logo=anthropic)](https://modelcontextprotocol.io/)
[![Built with Claude Code](https://img.shields.io/badge/Built%20with-Claude%20Code-blueviolet?logo=anthropic)](https://claude.ai/code)

# Anaplan MCP

A [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server that connects AI assistants to Anaplan's Integration API v2 - following the same security principles Anaplan uses for their own AI capabilities. Gives LLMs like Claude direct access to browse workspaces, manage data, run imports/exports, and administer models through 68 structured tools, all while respecting your permissions and governance policies.

Built in TypeScript. Runs over stdio. Works with Claude Desktop, Claude Code, and any MCP-compatible client.

## Why This Exists

**Anaplan is powerful but complex.** Teams rely on model builders and platform experts to navigate models, extract data, run imports, and onboard new users. Getting anything done often means waiting for someone who knows the model.

**This creates bottlenecks.** Need a quick data pull? Wait for the person who knows where the numbers live. New team member? Weeks of training before they're productive. Recurring import? Write custom API scripts or do it manually every time. Anaplan's Integration API exists, but using it directly requires technical expertise most business users don't have.

**This server bridges that gap.** It lets AI assistants like Claude talk to Anaplan's API on your behalf. Ask questions in plain English, and the AI navigates models, reads data, and runs actions - all through Anaplan's official endpoints, respecting your existing permissions and governance policies.

## Common Use Cases

**Model Documentation:**
- "Show me the structure of the Supply Planning model"
- "List all line items and their formulas in the Revenue module"
- "What dimensions does the Margin line item use?"

**Data Review:**
- "Pull the current pricing data for all products"
- "Show me which list items were recently added"
- "Read the forecast numbers for Q3 and summarize"

**Impact Analysis:**
- "What modules use the Product list as a dimension?"
- "Show all line items that reference Cost Per Unit"
- "Which views include the Region dimension?"

**Automation:**
- "Run the monthly demand import and show me the result"
- "Export sales actuals and save to Downloads"
- "Add these 50 new products to the master list"

**Onboarding:**
- "Walk me through the modules in this model"
- "How is this model structured? What are the key lists?"
- New team members explore models conversationally instead of waiting for scheduled training

## What It Can and Can't Do

### What it can do
- Browse workspaces, models, modules, lists, and views
- Read cell data and list items
- Write cell values and manage list items (add, update, delete)
- Run imports, exports, processes, and delete actions
- Upload and download files
- Manage models (open, close, delete, set periods and fiscal year)
- Query users, versions, and task history

### Model Building Limitations
The Anaplan API does not support:
- Creating modules or line items programmatically
- Defining formulas through API
- Building model structure from scratch
- Configuring model calendar programmatically

For model building, use Anaplan's UI or wait for Agent Studio capabilities.

## Permissions and Safety

### What the server can do

This server has **full access** to whatever your Anaplan credentials allow. The 68 tools cover both read and write operations:

- **Read-only tools** (safe to use freely): `show_*` tools, `read_cells`, `get_list_items`, `download_file`, `get_action_status`
- **Write tools** (modify data): `write_cells`, `add_list_items`, `update_list_items`, `delete_list_items`
- **Action tools** (trigger Anaplan processes): `run_import`, `run_export`, `run_process`, `run_delete`
- **Admin tools** (model management): `close_model`, `open_model`, `bulk_delete_models`, `set_currentperiod`, `set_fiscalyear`

### Tool approval in Claude Desktop

Claude Desktop prompts you before each tool call. You'll see the tool name and parameters, and can approve or deny. This gives you a chance to review before any action runs. You can also use the "Allow for this chat" option for tools you trust.

### Recommendations

- **Start with read-only.** Ask Claude to explore your workspaces and models before running any write operations. Get comfortable with the tool output first.
- **Test in a dev workspace.** If you have a non-production Anaplan workspace, use that while getting familiar with the tools.
- **Use least-privilege credentials.** If your Anaplan admin can create a service account with limited workspace access, use that instead of your personal admin account.
- **Review before confirming write operations.** When Claude proposes to run an import, write cells, or delete items, read the parameters carefully before approving.
- **Exports and imports are asynchronous.** The server polls until they complete (up to 5 minutes). You can cancel a running task with `cancel_task` if needed.

## Disclaimers

### Official API Usage
- This project uses the [Anaplan Integration API v2](https://anaplan.docs.apiary.io/)
- All operations go through Anaplan's official, documented endpoints
- No reverse engineering or undocumented APIs

### Not Affiliated with Anaplan
- This is an **unofficial, personal project**
- Not affiliated with, endorsed by, or supported by Anaplan
- For official Anaplan AI capabilities, see [CoModeler](https://www.anaplan.com/platform/anaplan-comodeler/) and [Agent Studio](https://www.anaplan.com/platform/intelligence/)

### Your Responsibility
- Users are responsible for compliance with [Anaplan's Terms of Service](https://www.anaplan.com/terms/)
- Always test in non-production environments first
- Review AI-generated actions before confirming write operations
- Keep API credentials secure and out of version control

### Security Approach
- Follows Anaplan's AI security principles (zero trust, RBAC, transience)
- Open source for transparency and auditability
- Runs locally to avoid cloud data exposure
- No training on your data; transient context only

### Limitations
- `show_modelstatus` endpoint often returns 405 in current tenants
- Write operations can cause irreversible data loss - review carefully
- No warranty or support provided
- Use at your own risk

## Prerequisites

- **Node.js 18+** - [download here](https://nodejs.org/)
- **An Anaplan account** with API access (any auth method - basic, certificate, or OAuth)
- **An MCP-compatible client** - Claude Desktop (recommended), Claude Code, or any other MCP client

## Setup

### 1. Clone and build

```bash
git clone https://github.com/larasrinath/anaplan-mcp.git
cd anaplan-mcp
npm install
npm run build
```

### 2. Connect to Claude Desktop

Claude Desktop is the easiest way to use this server. Here's how to set it up:

**Step 1: Open the config file**

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `C:\Users\<YourUsername>\AppData\Roaming\Claude\claude_desktop_config.json`

If the file doesn't exist yet, create it with `{}` as the contents.

> **Tip (Windows):** You can type `%APPDATA%\Claude` in the File Explorer address bar to jump straight to the folder.

**Step 2: Add the Anaplan server**

Your config file may already have existing settings (like `preferences`). You need to add the `mcpServers` key **inside the same top-level JSON object** — do not create a second `{}` block.

Pick the auth method that matches your Anaplan setup and merge it into your config:

**Basic auth (username/password):**

```json
{
  "mcpServers": {
    "anaplan": {
      "command": "node",
      "args": ["C:/Users/you/anaplan-mcp/dist/index.js"],
      "env": {
        "ANAPLAN_USERNAME": "user@company.com",
        "ANAPLAN_PASSWORD": "your-password"
      }
    }
  }
}
```

**Certificate auth:**

```json
{
  "mcpServers": {
    "anaplan": {
      "command": "node",
      "args": ["C:/Users/you/anaplan-mcp/dist/index.js"],
      "env": {
        "ANAPLAN_CERTIFICATE_PATH": "C:/path/to/your/cert.pem",
        "ANAPLAN_PRIVATE_KEY_PATH": "C:/path/to/your/key.pem"
      }
    }
  }
}
```

**OAuth2 (device grant):**

```json
{
  "mcpServers": {
    "anaplan": {
      "command": "node",
      "args": ["C:/Users/you/anaplan-mcp/dist/index.js"],
      "env": {
        "ANAPLAN_CLIENT_ID": "your-client-id"
      }
    }
  }
}
```

> **Important:** Replace the path in `args` with the actual absolute path where you cloned the repo.
> - **macOS/Linux:** `/Users/you/anaplan-mcp/dist/index.js`
> - **Windows:** Use **forward slashes** — `C:/Users/you/anaplan-mcp/dist/index.js` (not backslashes)

If your config file already has content (e.g. a `preferences` key), the final result should look like one merged object:

```json
{
  "preferences": {
    "...": "your existing preferences"
  },
  "mcpServers": {
    "anaplan": {
      "command": "node",
      "args": ["C:/Users/you/anaplan-mcp/dist/index.js"],
      "env": {
        "ANAPLAN_USERNAME": "user@company.com",
        "ANAPLAN_PASSWORD": "your-password"
      }
    }
  }
}
```

**Step 3: Restart Claude Desktop**

Quit Claude Desktop completely (right-click the system tray icon and quit — don't just close the window) and reopen it. You should see the Anaplan tools available (look for the hammer icon in the chat input area).

**Troubleshooting:**

- **"Unexpected non-whitespace" error** — Your JSON is invalid. Make sure there's only one `{}` object in the file and no trailing commas. Paste your config into [jsonlint.com](https://jsonlint.com/) to check.
- **Server disconnected** — Run `node C:/path/to/anaplan-mcp/dist/index.js` in a terminal to see the actual error. Common causes: wrong path in `args`, missing `npm run build`, or Node.js not installed.
- **401 Unauthorized when using tools** — Your Anaplan credentials are wrong, or your account uses SSO (in which case basic auth won't work — use certificate or OAuth2 instead).

### Connect to Claude Code

You can either edit the config file directly or use the CLI:

```bash
# Option A: CLI command (set env vars in your shell profile first)
claude mcp add anaplan -- node /absolute/path/to/anaplan-mcp/dist/index.js

# Option B: Edit ~/.claude/mcp_settings.json manually (same JSON format as above)
```

Set your Anaplan credentials as environment variables in your shell profile (`.bashrc`, `.zshrc`, etc.) or pass them in the config's `env` block.

### Other MCP clients

Any MCP-compatible client that supports stdio transport can connect. The server expects to be launched as a subprocess with stdin/stdout for communication. Pass Anaplan credentials via environment variables.

### Browser-based AI (claude.ai, ChatGPT)

Both [claude.ai](https://claude.ai) and [ChatGPT](https://chatgpt.com) now support remote MCP connectors. However, this server uses **stdio transport** (it runs as a local subprocess), so it cannot be connected directly from a browser. To use it from claude.ai or ChatGPT, you need to wrap it behind a remote MCP proxy. See [Remote MCP Setup Guide](docs/remote-mcp-setup.md) for step-by-step instructions. For local use, Claude Desktop or Claude Code are the simplest options.

## Configuration

### Environment variables

All configuration is done through environment variables. There are no config files, CLI flags, or settings menus.

| Method | Env Vars | Description |
|--------|----------|-------------|
| Certificate | `ANAPLAN_CERTIFICATE_PATH`, `ANAPLAN_PRIVATE_KEY_PATH` | Highest priority. PEM certificate + private key, authenticates via CACertificate flow |
| OAuth2 | `ANAPLAN_CLIENT_ID`, `ANAPLAN_CLIENT_SECRET` (optional) | Device grant by default; add client secret for client_credentials grant |
| Basic | `ANAPLAN_USERNAME`, `ANAPLAN_PASSWORD` | Lowest priority. Email + password, sends base64 credentials to auth endpoint |

You only need one set of credentials. If multiple are configured, the server picks the highest-priority method automatically.

### Where to set environment variables

- **Claude Desktop / Claude Code config:** Use the `"env"` block in the JSON config (recommended - keeps credentials scoped to the server)
- **Shell profile:** Export in `.bashrc` / `.zshrc` for Claude Code CLI usage
- **System environment:** Set at the OS level if you prefer

> **Security note:** Never commit credentials to version control. The `"env"` block in your MCP client config is local to your machine and is not part of this repository.

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
| `update_list_items` | Update existing list items<br>`PUT .../lists/{listId}/items` |
| `delete_list_items` | Delete list items<br>`POST .../lists/{listId}/items?action=delete` |

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

## License

MIT License - see [LICENSE](LICENSE) file for details.

**What this license covers:**
- The MCP server code in this repository
- Your right to use, modify, and distribute this code

**What this license does NOT cover:**
- Anaplan's Integration API (separate terms)
- Access to Anaplan's service (requires valid subscription)
- Anaplan's trademarks or intellectual property

**Use of Anaplan name:** This project uses "Anaplan" under nominative fair use to accurately describe what it connects to. This does not imply endorsement or affiliation.
