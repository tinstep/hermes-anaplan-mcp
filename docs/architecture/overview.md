# Architecture Overview

Three views of how the Anaplan MCP server works at runtime.

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
