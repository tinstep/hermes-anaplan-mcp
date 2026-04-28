---
name: example-skill
description: "Brief description of what this skill does and when to trigger it."
license: MIT

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

# Example Skill

## Purpose

Describe what this skill does in 1-2 sentences.

## When to Use

**Trigger:** Describe what user intent or task type should activate this skill.

**Do NOT trigger when:** List conditions where this skill does not apply.

## Instructions

Provide step-by-step instructions or reference material here.

---

Copy this file, rename it, and fill in your content. Drop it in `skills/` and Claude Code
will pick it up automatically as a project-level skill.
