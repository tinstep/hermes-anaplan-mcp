# Anaplan MCP Server — Design Document

**Date**: 2026-02-06
**Status**: Approved

## Overview

A TypeScript MCP server that wraps Anaplan's Integration API v2, exposing model exploration and data operations as MCP tools. Runs via stdio transport, published as an npm package for zero-config `npx` usage.

## Architecture

```
anaplan-mcp/
├── src/
│   ├── index.ts              # Entry point, MCP server setup
│   ├── server.ts             # Tool registration & request routing
│   ├── auth/
│   │   ├── basic.ts          # Basic auth (username/password)
│   │   ├── oauth.ts          # OAuth2 device grant / client credentials
│   │   ├── certificate.ts    # CA certificate auth
│   │   └── manager.ts        # Auth strategy selection & token lifecycle
│   ├── api/
│   │   ├── client.ts         # HTTP client wrapping Anaplan REST API
│   │   ├── workspaces.ts     # Workspace endpoints
│   │   ├── models.ts         # Model endpoints
│   │   ├── modules.ts        # Module/view/line-item endpoints
│   │   ├── lists.ts          # List & list-item endpoints
│   │   ├── imports.ts        # Import action endpoints
│   │   ├── exports.ts        # Export action endpoints
│   │   ├── processes.ts      # Process action endpoints
│   │   ├── files.ts          # File upload/download endpoints
│   │   └── transactional.ts  # Cell-level read/write endpoints
│   └── tools/
│       ├── exploration.ts    # Model browsing tools
│       ├── bulk.ts           # Import/export/process tools
│       └── transactional.ts  # Cell-level data tools
├── package.json
├── tsconfig.json
└── README.md
```

## Authentication

Three methods supported, auto-detected from environment variables:

| Method | Env Vars | Priority |
|--------|----------|----------|
| Certificate | `ANAPLAN_CERTIFICATE_PATH`, `ANAPLAN_PRIVATE_KEY_PATH` | Highest |
| OAuth2 | `ANAPLAN_CLIENT_ID`, `ANAPLAN_CLIENT_SECRET` | Medium |
| Basic | `ANAPLAN_USERNAME`, `ANAPLAN_PASSWORD` | Lowest |

The auth manager handles token acquisition, caching, and automatic refresh (~30min expiry). Exposes a single `getAuthHeaders()` interface.

Fails fast on startup if no valid credentials are found.

## MCP Tools

### Model Exploration (12 tools)

| Tool | Description | Key Inputs |
|------|-------------|------------|
| `list_workspaces` | List all accessible workspaces | — |
| `list_models` | List models in a workspace | `workspaceId` |
| `get_model` | Get model details (status, memory, etc.) | `workspaceId`, `modelId` |
| `list_modules` | List all modules in a model | `workspaceId`, `modelId` |
| `get_module` | Get module details with dimensions | `workspaceId`, `modelId`, `moduleId` |
| `list_line_items` | List line items in a module | `workspaceId`, `modelId`, `moduleId` |
| `list_views` | List saved views in a module | `workspaceId`, `modelId`, `moduleId` |
| `list_lists` | List all lists in a model | `workspaceId`, `modelId` |
| `get_list_items` | Get items in a list | `workspaceId`, `modelId`, `listId` |
| `list_imports` | List available import actions | `workspaceId`, `modelId` |
| `list_exports` | List available export actions | `workspaceId`, `modelId` |
| `list_processes` | List available processes | `workspaceId`, `modelId` |
| `list_files` | List files in a model | `workspaceId`, `modelId` |

### Bulk Data Operations (7 tools)

| Tool | Description | Key Inputs |
|------|-------------|------------|
| `run_export` | Execute export action & return data | `workspaceId`, `modelId`, `exportId` |
| `run_import` | Upload file then execute import | `workspaceId`, `modelId`, `importId`, `data` |
| `run_process` | Execute a process | `workspaceId`, `modelId`, `processId` |
| `run_delete` | Execute a delete action | `workspaceId`, `modelId`, `deleteActionId` |
| `upload_file` | Upload data to an Anaplan file | `workspaceId`, `modelId`, `fileId`, `data` |
| `download_file` | Download file content | `workspaceId`, `modelId`, `fileId` |
| `get_action_status` | Check status of running action | `workspaceId`, `modelId`, `taskId` |

### Transactional Operations (5 tools)

| Tool | Description | Key Inputs |
|------|-------------|------------|
| `read_cells` | Read cell data from a view | `workspaceId`, `modelId`, `moduleId`, `viewId` |
| `write_cells` | Write values to cells | `workspaceId`, `modelId`, `moduleId`, `lineItemId`, `data` |
| `add_list_items` | Add items to a list | `workspaceId`, `modelId`, `listId`, `items` |
| `update_list_items` | Update existing list items | `workspaceId`, `modelId`, `listId`, `items` |
| `delete_list_items` | Remove items from a list | `workspaceId`, `modelId`, `listId`, `items` |

## API Client

- **Base URL**: `https://api.anaplan.com/2/0/`
- **Retries**: 429 (backoff, respects Retry-After), 5xx (3 retries), network failures (3 retries)
- **Response cap**: 50,000 characters default, truncated with informative message
- **Chunked uploads**: Files >50MB split into chunks per Anaplan requirements
- **No caching**: Anaplan data changes frequently, freshness > speed

## Configuration

```json
{
  "mcpServers": {
    "anaplan": {
      "command": "npx",
      "args": ["-y", "anaplan-mcp"],
      "env": {
        "ANAPLAN_USERNAME": "user@company.com",
        "ANAPLAN_PASSWORD": "password"
      }
    }
  }
}
```

## Dependencies

- `@modelcontextprotocol/sdk` — MCP server SDK
- `zod` — Input validation for tool parameters
- `typescript`, `tsx` — Build & dev runtime

## Not In Scope (v1)

See `docs/FUTURE_SCOPE.md` for details.
