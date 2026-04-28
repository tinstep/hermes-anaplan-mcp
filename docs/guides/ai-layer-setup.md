# Anaplan AI Layer — Model Builder Setup Guide

## Overview

The AI layer is a standardised metadata structure built into each Anaplan model by the **model builder**. It gives the AI a self-describing context — what the model is, what each module does, and what each line item means.

Business users never touch this structure. It is set up once and maintained by the model builder.


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

## Why This Design

The Anaplan Integration API does not expose a `notes` or `description` field at model or module level:

| Level | Native API field | Writable via API |
|-------|-----------------|-----------------|
| Model | `categoryValues` (admin-configured), `name` | No |
| Module | `name` only | No |
| Line Item | `notes` (via `includeAll=true`) | No (set in model builder UI) |

The AI layer solves this by creating dedicated metadata modules whose **cell values** are readable via the Integration API, providing a complete semantic picture at all three levels.

---

## Structure

### Lists

All lists use the `--- AI LAYER ---` category prefix to keep them visually grouped and separated from business lists.

| List Name | Type | Items |
|-----------|------|-------|
| `AI Modules` | Production, Numbered | One item per module — maintained by model builder |
| `AI Model State` | Production | `Dev`, `QA`, `Prod` |

**`AI Modules`** is a numbered list. The model builder adds one entry per module the AI is permitted to access. The numbering provides a stable ordered reference.

---

### Modules

#### `AI Model Metadata`

Stores model-level context. No list dimension — single value per line item.

| Line Item | Format | Example Value | Purpose |
|-----------|--------|---------------|---------|
| `Model Name` | TEXT | `Lara Test Model` | Canonical model name |
| `Model Purpose` | TEXT | `AI LAYER: FP&A planning model...` | What this model is used for |
| `Model State` | LIST → `AI Model State` | `PROD` | Lifecycle state |

---

#### `AI Module Metadata`

Stores module-level context. Dimensioned by `AI Modules` — one row per module.

| Line Item | Format | Dimensioned By | Purpose |
|-----------|--------|----------------|---------|
| `Module Name` | TEXT | `AI Modules` | Exact Anaplan module name |
| `Module Description` | TEXT | `AI Modules` | What the module does |

---

## Tagging Convention

Each level uses a consistent prefix so the AI can identify and filter AI-layer content.

### Level 1 — Model (`Model Purpose` line item)

```
AI LAYER: FP&A planning model. Revenue, headcount, opex, and capex planning
for annual budget and quarterly forecasts. Primary model for finance team reporting.
```

### Level 2 — Module (`Module Description` line item, per `AI Modules` entry)

```
AI LAYER | REVENUE: Net revenue and gross margin planning by product and region.
Driver-based model linked to pricing and volume assumptions.
Used in P&L and board reporting.
```

### Level 3 — Line Item (`notes` field, set in model builder UI, max ~250 chars)

Prefix every line item note the AI is permitted to see with `AI LI Metadata:`:

```
AI LI Metadata: Net revenue after returns and discounts. Calculated from gross
revenue minus return rate assumption. Primary P&L metric.
Dimensioned by Product, Region, Time, Version.
```

Line items without this prefix are invisible to the AI.

---

## Model Builder Workflow

### Step 1 — Populate the `AI Modules` list

Add one numbered item per module the AI should access:

```
1. Revenue Planning
2. Cost Management
3. Headcount
4. SYS Config
...
```

### Step 2 — Fill `AI Module Metadata`

For each numbered item, enter:
- `Module Name` — the exact Anaplan module name (e.g. `REV01 Price Book`)
- `Module Description` — plain language description prefixed with `AI LAYER | <MODULE>:`

### Step 3 — Fill `AI Model Metadata`

Enter:
- `Model Name` — canonical name of the model
- `Model Purpose` — description prefixed with `AI LAYER:`
- `Model State` — select `Dev`, `QA`, or `Prod`

### Step 4 — Tag line items in each module

Navigate to each permitted module in the model builder. For every line item the AI should be able to see, fill the `notes` field with `AI LI Metadata:` followed by a plain language description (~250 chars): what it is, how it's calculated, and what dimensions it uses.

Leave all other line item notes blank or unprefixed — the AI will not touch them.

---

## Design Decisions

**Why `Model State` as a list?**
Enforces valid values (`Dev`, `QA`, `Prod`). Prevents the AI from treating a sandbox or in-progress model as production.

**Why `Module Name` separate from the list item name?**
The `AI Modules` list item uses a friendly label (e.g. `Revenue`) while `Module Name` stores the exact Anaplan module name (e.g. `REV01 Revenue Planning`) for the AI to resolve correctly.

**Why a numbered list for `AI Modules`?**
Provides a stable ordered reference. The AI iterates over items 1–N without needing to know the count in advance.

**Why not store line item descriptions in the AI layer modules?**
The `notes` field on line items is already returned by `show_alllineitems(includeAll=true)` — no duplication needed. The AI layer only covers the two levels where the API provides no native metadata surface.
