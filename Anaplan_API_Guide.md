# Anaplan API Integration Guide

**Last Updated:** April 28, 2026


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

## Typical Integration Flow

```
1. Authentication → Get Token
2. Discover Workspace → List Workspaces
3. Discover Model → List Models in Workspace
4. Discover Structure → Get Modules, Line Items, Lists
5. Perform Action → Import/Export/Process
6. Monitor → Poll Task Status
7. Retrieve Results → Download Export or Check Errors
```

### API Endpoints Reference

| Action | HTTP Method | Endpoint |
|--------|-------------|----------|
| Auth | POST | `/auth/token` |
| Workspaces | GET | `/workspaces` |
| Models | GET | `/workspaces/{id}/models` |
| Modules | GET | `/workspaces/{id}/models/{id}/modules` |
| Line Items | GET | `/workspaces/{id}/models/{id}/lineitems` |
| Lists | GET | `/workspaces/{id}/models/{id}/lists` |
| Cells Read | GET | `/workspaces/{id}/models/{id}/modules/{id}/cells` |
| Cells Write | POST | `/workspaces/{id}/models/{id}/modules/{id}/cells` |
| Bulk Import | POST | `/workspaces/{id}/models/{id}/imports/{id}` |
| Bulk Export | POST | `/workspaces/{id}/models/{id}/exports/{id}` |

### Bulk Import Format

```csv
# Example for importing Sales Data
Product,Time,Version,Revenue,Units
Product A,Jan-2024,Actual,10000,100
Product B,Jan-2024,Actual,15000,150
Product A,Jan-2024,Actual,12000,120
```

### Python API Wrapper (Example)

```python
import requests

class AnaplanAPI:
    def __init__(self, auth_url, base_url, username, password):
        self.auth_url = auth_url
        self.base_url = base_url
        self.token = self._get_token(username, password)
    
    def _get_token(self, username, password):
        response = requests.post(
            f"{self.auth_url}/auth/token",
            auth=(username, password)
        )
        return response.json()['token']
    
    def get_workspaces(self):
        headers = {"Authorization": f"AnaplanAuthToken {self.token}"}
        response = requests.get(f"{self.base_url}/workspaces", headers=headers)
        return response.json()
    
    def read_cells(self, workspace_id, model_id, module_id, view_id):
        headers = {"Authorization": f"AnaplanAuthToken {self.token}"}
        url = f"{self.base_url}/workspaces/{workspace_id}/models/{model_id}/modules/{module_id}/cells"
        response = requests.get(url, headers=headers, params={"viewId": view_id})
        return response.json()
```

---

