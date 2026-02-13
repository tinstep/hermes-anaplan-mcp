# Future Scope

Items explicitly deferred from v1. Revisit as needed.

## Transport

- [ ] **Streamable HTTP (SSE) transport** - Run as a standalone HTTP service that multiple clients connect to remotely. The architecture supports adding this alongside stdio without major refactoring.

## MCP Features

- [ ] **MCP Resources** - Expose Anaplan model metadata as browsable resources (e.g., workspace/model tree)
- [ ] **MCP Prompts** - Pre-built prompt templates for common Anaplan workflows (e.g., "analyze this model's structure", "compare two exports")

## API Coverage

- [ ] **SCIM API** - User provisioning and management via Anaplan's SCIM endpoints
- [ ] **ALM API** - Application Lifecycle Management for model deployment workflows
- [ ] **Audit/CloudWorks API** - Integration scheduling and audit log access

## Features

- [ ] **Response caching** - Optional short-TTL cache for metadata endpoints (workspace/model lists change infrequently)
- [ ] **Web UI / Dashboard** - Visual interface for server status and tool usage
- [ ] **Streaming exports** - Stream large export results instead of buffering in memory
- [ ] **Webhook support** - React to Anaplan events (CloudWorks completions, etc.)
- [ ] **Multi-tenant support** - Connect to multiple Anaplan tenants simultaneously
