# Anaplan API Comprehensive Guide for AI Agents

This document provides a structured, machine-readable guide to the Anaplan Integration API V2, synthesized from official Apiary documentation, Postman collections, and Anaplan Help Center resources.

---

## 1. Overview & Architecture

Anaplan uses a hierarchical resource model. To access data, you must resolve identifiers in the following order:
**Workspace ID** $ightarrow$ **Model ID** $ightarrow$ **Module ID** $ightarrow$ **Line Item / List Item**.

### API Types
- **Transactional API**: For real-time, small-scale reads and writes (cell-level).
- **Bulk API**: For high-volume data movement (Imports/Exports) using an asynchronous lifecycle.

---

## 2. Authentication & Connectivity

### Authentication Flow
1. **Token Retrieval**: 
   - **Method**: `POST /auth/token`
   - **Auth**: Basic Authentication (Username/Password).
   - **Response**: Returns a Bearer token.
2. **Using the Token**:
   - All subsequent requests must include the header:
     `Authorization: OAuth <token>` or `Authorization: AnaplanAuthToken <token>` depending on the specific endpoint version.

### Token Lifetime
- **Default Duration**: Tokens typically expire after **30 minutes** of inactivity.
- **Refresh Strategy**: Clients should monitor token expiry and refresh before expiration by re-authenticating with credentials.

### Regional Base URLs
Anaplan manages its environment across multiple regional pods. You must use the base URL corresponding to where your workspace is hosted. The Auth endpoint follows the same regional pattern.

| Region Code | Region / Location | Base URL | Auth URL |
| :--- | :--- | :--- | :--- |
| **ae1** | Cloud - UAE | `https://ae1.anaplan.com` | `https://auth.anaplan.com` |
| **ap1** | Cloud - Japan | `https://ap1.anaplan.com` | `https://auth.anaplan.com` |
| **au1** | Cloud - Australia | `https://au1.anaplan.com` | `https://auth.anaplan.com` |
| **ca1** | Cloud - Canada | `https://ca1.anaplan.com` | `https://auth.anaplan.com` |
| **eu1** | Data Center - Netherlands | `https://eu1.anaplan.com` | `https://auth.anaplan.com` |
| **eu2** | Data Center - Germany | `https://eu2.anaplan.com` | `https://auth.anaplan.com` |
| **eu3** | Cloud - Europe | `https://eu3.anaplan.com` | `https://auth.anaplan.com` |
| **eu4** | Cloud - Europe | `https://eu4.anaplan.com` | `https://auth.anaplan.com` |
| **eu5** | Cloud - Europe | `https://eu5.anaplan.com` | `https://auth.anaplan.com` |
| **gb1** | Cloud - UK | `https://gb1.anaplan.com` | `https://auth.anaplan.com` |
| **in1** | Cloud - India | `https://in1.anaplan.com` | `https://auth.anaplan.com` |
| **id1** | Cloud - Indonesia | `https://id1.anaplan.com` | `https://auth.anaplan.com` |
| **me1** | Cloud - Saudi Arabia | `https://me1.anaplan.com` | `https://auth.anaplan.com` |
| **sg1** | Cloud - Singapore | `https://sg1.anaplan.com` | `https://auth.anaplan.com` |
| **us1** | Data Center - US East | `https://us1.anaplan.com` | `https://auth.anaplan.com` |
| **us2** | Data Center - US West | `https://us2.anaplan.com` | `https://auth.anaplan.com` |
| **us5** | Cloud - US East | `https://us5.anaplan.com` | `https://auth.anaplan.com` |
| **us7** | Cloud - US | `https://us7.anaplan.com` | `https://auth.anaplan.com` |
| **us9** | Cloud - US | `https://us9.anaplan.com` | `https://auth.anaplan.com` |
| **Global** | General Entry Point | `https://api.anaplan.com` | `https://auth.anaplan.com` |

### HTTP Headers
All Anaplan API calls (except `/auth/token`) require:
- `Authorization: AnaplanAuthToken <token>`
- `Content-Type: application/json` for JSON payloads
- `Accept: application/json`

---

## 3. Resource Endpoints (Metadata & Control)

### Workspaces
- **List Workspaces**: `GET /workspaces`
- **Get Workspace Info**: `GET /workspaces/{workspaceId}`

### Models
- **List Models in Workspace**: `GET /workspaces/{workspaceId}/models`
- **Get Model Details**: `GET /workspaces/{workspaceId}/models/{modelId}`
- **Model State Control**: Endpoints exist to `Wake up` (activate) or `Close` (archive) models.

### Modules & Line Items
- **List Modules**: `GET /workspaces/{workspaceId}/models/{modelId}/modules`
- **Line Item Metadata**: 
  - Retrieve detailed metadata using `GET /models/{modelId}/lineitems` with `includeAll=true`.
  - **Formula Extraction**: The API provides the exact formula string for a line item.
  - **Formatting**: Metadata includes data formats (Number, Text, Boolean, Percentage) and precision settings.
  - **Dimensions**: Each line item has an `appliesTo` property specifying the associated dimensions (lists).

### Lists (Dimensions)
- **Retrieve Lists**: `GET /workspaces/{workspaceId}/models/{modelId}/lists`
- **Item Management**:
  - **Add/Update/Delete**: `PATCH`/`PUT`/`DELETE` on list item endpoints.
  - **Index Reset**: Special endpoints for resetting numbered list indices.

---

## 4. Data Operations

### Transactional Reads/Writes (Real-time)
- **Read Cells**: `GET /workspaces/{workspaceId}/models/{modelId}/modules/{moduleId}/cells`
- **Write Cells**: `POST /workspaces/{workspaceId}/models/{modelId}/modules/{moduleId}/cells`
  - **Request Body JSON**:
    ```json
    [
      {
        "dimensions": { "Dimension1": "ItemA", "Dimension2": "ItemB" },
        "value": 123.45
      }
    ]
    ```

### Bulk Data Lifecycle (Asynchronous)
The Bulk API is used for high-volume data movements to prevent timeouts.

#### The 'Upload $ightarrow$ Trigger $ightarrow$ Poll $ightarrow$ Download' Workflow
1. **Upload/Stage**: `POST /models/{modelId}/files/{fileId}`
   - **Large File Optimization**: For files >50MB, use **Gzip compression** to reduce payload size and upload time.
   - **Batching Strategy**: Data is batched by uploading a single source file (CSV/JSON) to the server, which the Anaplan engine processes in bulk.
2. **Execute**: `POST /models/{modelId}/imports/{importId}` or `exports/{exportId}`.
   - **Runtime Params**: Pass `mappingParameters` to target specific versions or dates.
3. **Monitor**: `GET /models/{modelId}/tasks/{taskId}`
   - Poll until `taskState` is `COMPLETE` or `FAILED`.
4. **Retrieve/Verify**: `GET /models/{modelId}/files/{fileId}`
   - Upon failure, download the **Error Dump CSV** to see exactly which rows failed.

---

## 5. Integration Patterns for AI Agents

### Chaining Workflow
`Get Workspaces` $ightarrow$ `Filter for Target Workspace` $ightarrow$ `Get Models` $ightarrow$ `Filter for Target Model` $ightarrow$ `Get Modules` $ightarrow$ `Write/Read Cells`.

### Error Handling
- **Bulk Failures**: Always download the "Dump File" CSV upon a `FAILED` task status to identify specific cell or mapping errors.
- **Model State**: If a model is returned as "Closed," use the Model Control API to wake it up before attempting data operations.

### Summary Table: HTTP Verbs
| Action | Verb | Endpoint |
| :--- | :--- | :--- |
| Metadata Discovery | `GET` | `/workspaces`, `/models`, `/modules` |
| Token Auth | `POST` | `/auth/token` |
| Real-time Write | `POST` | `/cells` |
| Trigger Bulk Task | `POST` | `/imports`, `/exports` |
| Monitor Task | `GET` | `/tasks/{taskId}` |

---

## 6. Best Practices & Modeling Guidance (from Anaplan Help Center)

### Module Organization (Anaplan Recommended Pattern)
- **Input Modules**: Used to enter data (e.g., budgets, headcount inputs).
- **Driver Modules**: Used to calculate values (e.g., margin calculations, forecasts).
- **Output Modules**: Used to report data (e.g., financial statements, dashboards).

### Naming Conventions (Recommended)
- Use clear, descriptive names for modules, lists, and line items.
- Include context in names (e.g., `Input_Costs`, `Calc_Margins`, `Output_PNL`).
- Use consistent capitalization and separators (underscores or CamelCase).

### List Best Practices
- Use **List Subsets** when only a subset of list items apply to a module.
- Use **Page Selectors** for dimensions that change infrequently (e.g., Versions, Organization).
- Use **Line Item Dimensions** for module-specific dimensions that don't need to be shared elsewhere.

### Time & Versions
- **Time**: The default dimension for time-based data. Use years, quarters, months, or weeks depending on data granulity.
- **Versions**: Use for planning vs actuals, scenarios, and what-if analysis.Default versions include `Current`, `Draft`, `Actual`, etc.

---

## 7. Key Functions Reference

The Anaplan formula engine provides 145+ functions across categories:

| Category | Key Functions |
| :--- | :--- |
| **Numeric Functions** | `ABS`, `EXP`, `LN`, `LOG`, `ROUND`, `SQRT`, `POWER` |
| **Time & Date Functions** | `ADDMONTHS`, `ADDYEARS`, `DATE`, `DAYS`, `EOMONTH`, `DAY` |
| **Aggregation Functions** | `AVERAGE`, `MAX`, `MIN`, `SUM`, `ALL`, `ANY`, `FIRSTNONBLANK`, `LASTNONBLANK` |
| **Lookup & Reference** | `LOOKUP`, `ITEM`, `PARENT`, `FINDITEM`, `CODE` |
| **Financial Functions** | `FV`, `PV`, `PMT`, `NPER`, `RATE`, `NPV`, `IRR`, `PRICE`, `YIELD`, `DURATION`, `MACAULEY` |
| **Text Functions** | `FIND`, `LEFT`, `RIGHT`, `MID`, `LOWER`, `UPPER`, `LENGTH`, `TRIM`, `SUBSTITUTE` |
| **Conditional** | `IF THEN ELSE`, `DIVIDE`, `SELECT` |
| **Time-based Accumulation** | `CUMULATE`, `MOVINGSUM`, `TIMESUM`, `YEARTODATE`, `QUARTERTODATE`, `MONTHTODATE`, `WEEKTODATE`, `HALFYEARTODATE` |
| **Translation & Localization** | `COMPARE`, `TEXTLIST` |
| **Call Center Planning** | `AGENTS`, `AGENTSB`, `ANSWERTIME`, `ARRIVALRATE`, `AVGDURATION`, `AVGWAIT`, `ERLANGB`, `ERLANGC`, `SLA` |

Full function syntax and descriptions are available in the Anaplan Help Center.

---

## 8. Additional Resources

- **Anaplan Community**: https://community.anaplan.com/ (Ask questions, share solutions)
- **Anaplan Academy**: https://academy.anaplan.com/ (Training & certifications)
- **Anaplan Planual**: Official best practices guide

---

*Last Updated: April 28, 2026*
