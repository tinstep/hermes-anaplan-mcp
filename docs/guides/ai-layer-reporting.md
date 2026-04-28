# Anaplan AI Layer — Reporting Guide

## Overview

This guide defines how the AI uses the AI layer to answer business user reporting questions. It covers session initialisation, question narrowing, and the iron door rules that govern what the AI is permitted to touch.

For how to build the AI layer in a model, see [ai-layer-setup.md](./ai-layer-setup.md).


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

## Session Initialisation

When a session starts, the AI performs an eager sweep across all models the user has access to — before the first question is asked.

### Phase 1 — Eager Init (all models)

```
Session starts
    │
    ├── show_allmodels → full list of accessible models
    │
    ├── For each model:
    │       ├── read_cells on AI Model Metadata
    │       │       ├── FAIL or empty → exclude model entirely (no AI layer)
    │       │       └── OK → cache: Model Name, Model Purpose, Model State
    │       │               └── Model State = Dev/QA → exclude unless user asks explicitly
    │       └── read_cells on AI Module Metadata
    │               → cache: Module Name + Module Description per AI Modules entry
    │               → only these modules are accessible for the rest of the session
    │
    └── Cache ready — wait for user
```

Cost: `1 + 2N` calls for N models. At 10 models = 21 calls. One-time cost, paid before the first question.

---

### Phase 2 — Question Narrowing + Lazy Line Item Load

```
User asks a question
    │
    ├── Match question against Model Purpose cache → identify target model(s)
    │
    ├── Match question against Module Description cache → identify target module(s)
    │
    ├── Line items cached for this model?
    │       ├── YES → filter to notes starting with "AI LI Metadata:" → match → identify target line item(s)
    │       └── NO  → show_alllineitems(includeAll=true) → filter to "AI LI Metadata:" prefix → cache
    │                       → match against notes → identify target line item(s)
    │
    └── Execute: read_cells / run_export / etc.
```

Line items are loaded once per model on first use. Subsequent questions against the same model use the cache.

---

### Phase 3 — Subsequent Questions

```
User asks follow-up question
    │
    └── All three levels already cached → narrow directly → answer instantly
```

---

## Guard Rails — Iron Door Rules

These are non-negotiable. The AI must enforce them regardless of what the user asks, how the question is framed, or what context is provided. There are no exceptions.

---

### Rule 1 — Models: AI layer required

**The AI may only interact with models that have an `AI Model Metadata` module. No exceptions.**

During session init, if `read_cells` on `AI Model Metadata` fails or returns empty, that model is permanently excluded from the cache and all subsequent operations in this session.

The AI must never:
- Read data from a model with no AI layer
- Write to a model with no AI layer
- Run imports, exports, or processes in a model with no AI layer
- Acknowledge or reference a non-AI-layer model in any response

If the user explicitly asks to access a model with no AI layer: *"This model has no AI layer configured. Ask your model builder to set it up before I can interact with it."* — and stop.

---

### Rule 2 — Modules: only AI-registered modules

**The AI may only interact with modules explicitly listed in `AI Module Metadata`. No exceptions.**

The AI must never:
- Read cells from a module not in the cache
- Write cells to a module not in the cache
- Reference, suggest, or infer anything about an unregistered module

If the user asks about an unregistered module: *"That module is not registered in the AI layer. Ask your model builder to add it to AI Module Metadata before I can interact with it."* — and stop.

---

### Rule 3 — Line Items: `AI LI Metadata:` prefix required

**The AI may only read, reference, or act on line items whose `notes` field starts with `AI LI Metadata:`. No exceptions.**

All other line items are treated as if they do not exist. They are filtered out at cache load time and are never surfaced, suggested, or inferred from.

The AI must never:
- Read cells for a line item without the prefix
- Write cells to a line item without the prefix
- Name, reference, or reason about an untagged line item even if it appears in API results

If the user asks about an untagged line item: *"That line item has no AI metadata tag. Ask your model builder to add an `AI LI Metadata:` note before I can interact with it."* — and stop.

---

## Model Discovery — Known Limitation

`show_allmodels` returns only `name`, `id`, `activeState`, `currentWorkspaceName`. There is no notes or description field on model objects in the Anaplan API. The AI cannot filter models by AI layer tag from the model list alone — it must attempt to read `AI Model Metadata` per model to confirm the layer exists.

Recommended approach: scope to a known workspace. Workspaces contain a manageable number of models, keeping the init cost low.
