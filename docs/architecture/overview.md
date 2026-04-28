# Architecture Overview

Three views of how the Anaplan MCP server works at runtime.


## Anaplan modeling principles alignment

This document should be read alongside Anaplan's current modeling guidance:
- Your modeling experience: https://help.anaplan.com/your-modeling-experience-ee72bb4a-463f-44f7-bfb1-09892a951472
- Model building recommendations: https://help.anaplan.com/model-building-recommendations-6d742812-f1c7-4296-a504-651b1c8086f3
- Planual: https://support.anaplan.com/planual-5731dc37-317a-49fa-a5ff-7fc3926972de

Apply these principles when using the MCP tools against live models:

1. Start with the business case, not the API endpoint. Identify the planning process, decision points, facts, lists, time ranges, versions, and users before changing structures or data.
2. Follow DISCO module separation: Data, Input, System, Calculation, and Output modules should have clear responsibilities. Do not mix imports, assumptions, business logic, and reporting line items in one module unless the model owner has intentionally designed it that way.
3. Respect the Central Library. Lists, subsets, line item subsets, time, versions, users, roles, and naming conventions are shared model architecture, not disposable integration artefacts.
4. Prefer narrow dimensionality. Use only the dimensions required for a calculation or input. Use subsets, line-item applies-to, and time ranges to reduce cell count and improve performance.
5. Keep formulas simple, reusable, and auditable. Break complex logic into intermediate line items, use system modules for mappings and attributes, and avoid hard-coded item references where a lookup or mapping module is more maintainable.
6. Preserve model-builder intent. Before writing cells, adding list items, running imports, or changing calendar/version settings, inspect modules, line items, dimensions, saved views, actions, and task history so the operation follows the existing model design.
7. Use saved views and purpose-built import/export actions for integrations. Do not treat ad hoc grid reads/writes as a substitute for governed integration processes when a model already exposes actions or processes.
8. Validate before and after every write. Check source file mapping, dimensional coordinates, access permissions, model state, task result, rejected rows, and downstream output modules.
9. Protect ALM and production controls. Treat structural changes, list changes, current period, fiscal year, switchover, delete actions, and model open/close as governed operations that may affect production users.
10. Document assumptions. Record the model, workspace, module/view/action used, dimensional filters, version/time context, and any Planual trade-offs made during automation.
---

## High-level runtime architecture

Shows the major subsystems and how data flows between them during a tool call.

```mermaid
flowchart LR
    subgraph USER["User Layer"]
        U[User]
    end

    subgraph CLIENT["AI Client Layer"]
        C[Claude Desktop / Claude Code / claude.ai / ChatGPT / MCP Client]
        P[Natural language prompt]
        TR[Tool selection by assistant]
    end

    subgraph SERVER["Anaplan MCP Server"]
        S[MCP transport<br/>stdio or Streamable HTTP]
        V[Input validation<br/>zod schemas]
        AH[AuthManager<br/>process-scoped in stdio<br/>session-scoped in HTTP]
        TL[Tool handler]
        API[AnaplanClient + domain wrappers]
        F[Structured result formatting]
    end

    subgraph AUTH["Anaplan Auth Paths"]
        A1[Certificate auth]
        A2[OAuth device grant]
        A3[Basic auth]
    end

    subgraph ANAPLAN["Anaplan Platform"]
        I[Integration API v2]
        R[Workspaces / Models / Lists / Views / Actions / Files / Tasks]
    end

    U --> P
    P --> C
    C --> TR
    TR --> S
    S --> V
    V --> TL
    TL --> AH

    AH --> A1
    AH --> A2
    AH --> A3

    A1 --> API
    A2 --> API
    A3 --> API

    TL --> API
    API --> I
    I --> R
    R --> API
    API --> F
    F --> C
    C --> U
```

---

## Request flow

Step-by-step sequence from user prompt to structured response.

```mermaid
sequenceDiagram
    participant User
    participant Client as AI Client
    participant MCP as MCP Server
    participant Tool as Tool Handler
    participant Auth as AuthManager
    participant Provider as Auth Provider
    participant API as AnaplanClient
    participant Anaplan as Anaplan API v2

    User->>Client: Ask for data or action
    Client->>MCP: Invoke MCP tool over stdio or HTTP
    MCP->>Tool: Route selected tool
    Tool->>Tool: Validate inputs
    Tool->>Auth: Ensure valid token exists
    Note over Client,Auth: Remote HTTP sessions use a fresh AuthManager and per-session Anaplan OAuth
    Auth->>Provider: Use configured auth method for this session
    Provider-->>Auth: Access token
    Auth-->>Tool: Valid token
    Tool->>API: Execute endpoint call
    API->>Anaplan: Request
    Anaplan-->>API: Response / task status / file data
    API-->>Tool: Parsed result
    Tool-->>MCP: Structured output
    MCP-->>Client: Tool response
    Client-->>User: Human-readable answer
```

---

## Trust and control boundary

How the server maps user intent to Anaplan permissions without adding any new privileges.

```mermaid
flowchart TD
    U[User request in plain English] --> C[AI assistant selects tool]
    C --> V[Validate tool arguments]
    V --> A[Authenticate using configured credentials<br/>or per-session Anaplan OAuth]
    A --> P[Apply existing Anaplan permissions for that identity]
    P --> D{Requested operation type}

    D -->|Read| R[Browse / inspect / read data]
    D -->|Write| W[Modify cells or list items]
    D -->|Action| X[Run import / export / process / delete]
    D -->|Admin| M[Open / close model<br/>set period / fiscal year]

    R --> API[Official Integration API v2]
    W --> API
    X --> API
    M --> API

    API --> O[Result returned to assistant]

    N[No new privileges created by MCP] --> P
```

The server never creates new access rights. Every operation is bound by the permissions already attached to the Anaplan identity used for that session: the locally configured credentials in stdio mode, or the remote user's session-scoped OAuth identity in HTTP mode.
