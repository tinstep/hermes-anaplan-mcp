# Anaplan API Integration Guide

**Last Updated:** April 28, 2026

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

