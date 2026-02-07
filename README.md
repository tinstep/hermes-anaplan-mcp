# anaplan-mcp

MCP server for Anaplan's Integration API v2. Exposes Anaplan workspaces, models, modules, lists, and data operations as 25 MCP tools.

## Quick Start

Add to your MCP client config (Claude Desktop, Claude Code, Cursor, etc.):

```json
{
  "mcpServers": {
    "anaplan": {
      "command": "npx",
      "args": ["-y", "anaplan-mcp"],
      "env": {
        "ANAPLAN_USERNAME": "user@company.com",
        "ANAPLAN_PASSWORD": "your-password"
      }
    }
  }
}
```

## Authentication

Three methods, auto-detected from environment variables. If multiple are set, highest priority wins.

| Method | Env Vars | Priority |
|--------|----------|----------|
| Certificate | `ANAPLAN_CERTIFICATE_PATH`, `ANAPLAN_PRIVATE_KEY_PATH` | Highest |
| OAuth2 (Device Grant) | `ANAPLAN_CLIENT_ID`, `ANAPLAN_CLIENT_SECRET` (optional) | Medium |
| Basic | `ANAPLAN_USERNAME`, `ANAPLAN_PASSWORD` | Lowest |

Tokens are automatically refreshed before the 35-minute expiry.

## Available Tools

### Model Exploration

| Tool | Description |
|------|-------------|
| `list_workspaces` | List all accessible workspaces |
| `list_models` | List models in a workspace |
| `get_model` | Get model details (status, memory) |
| `list_modules` | List modules in a model |
| `get_module` | Get module details with dimensions |
| `list_line_items` | List line items in a module |
| `list_views` | List saved views in a module |
| `list_lists` | List all lists in a model |
| `get_list_items` | Get items in a list |
| `list_imports` | List available import actions |
| `list_exports` | List available export actions |
| `list_processes` | List available processes |
| `list_files` | List files in a model |

### Bulk Data Operations

| Tool | Description |
|------|-------------|
| `run_export` | Execute export action and return data |
| `run_import` | Upload data then execute import action |
| `run_process` | Execute a process (chained actions) |
| `run_delete` | Execute a delete action |
| `upload_file` | Upload data to an Anaplan file |
| `download_file` | Download file content |
| `get_action_status` | Check status of a running action |

### Transactional Operations

| Tool | Description |
|------|-------------|
| `read_cells` | Read cell data from a module view |
| `write_cells` | Write values to specific cells |
| `add_list_items` | Add items to a list |
| `update_list_items` | Update existing list items |
| `delete_list_items` | Remove items from a list |

## Development

```bash
npm install
npm run build        # Compile TypeScript
npm run dev          # Run from source
npm test             # Run tests
npm run typecheck    # Type-check without emitting
```

## License

MIT
