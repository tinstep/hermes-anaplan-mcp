# Application Lifecycle Management (ALM) API

## Introduction
This document details the API endpoints used for Application Lifecycle Management (ALM). The calls may include more fields in the future than what's currently specified.

---

## Getting Started
This section contains general information to help you start using the Anaplan API.

### URL, IP, and allowlist requirements
To set your allowlists for API calls, see **URL, IP, and allowlist requirements**.

### Authentication

**Notes:**
- If your workspace uses single sign-on (SSO), your user must be assigned as an **Exception User** to use basic authentication and obtain an Anaplan authentication token. For more information on exception users in Anaplan, see **Assign Exception Users** in Anapedia.
- If you are using certificate-based authentication, the ALM API cannot be used under the following conditions:
  - The user is a **non-exception** user in the Dev Model, and exception user in the Prod Model.
  - The user is a **non-exception** user in both the Dev and Prod Models.

To use this API, you must send requests using an **Anaplan authentication token** (a JSON Web Token). This must be in the `Authorization` header of the API request.

Example:
- `Authorization: AnaplanAuthToken {anaplan_auth_token}`  
  Where `{anaplan_auth_token}` is replaced with your authentication token.

For more information, see **Authentication Service API**.

---

## Reference

### Change a model's online status
Use this call to change the model’s status to either **online** or **offline**. Ensure the model is in either **standard** or **deployed** mode.

**Notes**
- To use this call, you must be a **Workspace Administrator**.
- Ensure you follow the guidance on this page when you structure the request.
- Ensure the model is **unlocked** when you call this endpoint and is **unarchived**.
  - Archived models return a **422 Model is Archived** HTTP status response.

**Endpoint**
- `PUT https://api.anaplan.com/2/0/models/{modelId}/onlineStatus`

**Example request**
```bash
curl -X PUT 'https://api.anaplan.com/2/0/models/{modelId}/onlineStatus' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json' \
  --data-raw '{ "status": "online" }'
```

**Request headers**

| Header | Required | Details |
|---|---:|---|
| Authorization: AnaplanAuthToken {anaplan_auth_token} | Yes | The Anaplan authentication token |
| Content-Type: application/json | Yes | This indicates the preferred request/response format is JSON |

**Request body**
Only include the properties listed in this request. Ensure you add `status` and set it to either `online` or `offline`.

```json
{
  "status": "online"
}
```

| JSON element | Required | Details |
|---|---:|---|
| status | Yes | Must be one of: `["online", "offline"]` |

**Successful response**
- `204 No Content` (no response body)

**Error responses**

| Code | Message | Required amendments |
|---:|---|---|
| 400 | Error parsing request body as JSON / Unrecognised property detected / Missing mandatory property `status` / Invalid value for `status`, must be one of `[online, offline]` | Only include supported properties and valid `status` |
| 400 | Cannot change status when model is in Locked or Archived mode | Unlock and unarchive the model |
| 403 | Forbidden | Ensure the user is a workspace administrator for the model’s workspace |
| 404 | Not Found | Check if the model ID specified in the URL is correct |
| 422 | Model is Archived | Use a model that is not archived |

---

### Retrieve compatible source model revisions
Use this call to return the list of revisions from your **source model** that can be synchronized to your **target model**.

The returned list displays in descending order, by creation date and time. This is consistent with how revisions are displayed in the user interface (UI).

**Notes**
- To use this call, you must be a **Workspace Administrator** for the target and source model workspaces.
- Ensure you have access to the models.

**Endpoint**
- `GET https://api.anaplan.com/2/0/models/{targetModelGuid}/alm/syncableRevisions?sourceModelId={sourceModelGuid}`

**Request headers**

| Header | Required | Details |
|---|---:|---|
| Authorization: AnaplanAuthToken {anaplan_auth_token} | Yes | The Anaplan authentication token |

**Request parameters**

| Parameter | Required | Location | Details |
|---|---:|---|---|
| targetModelGuid | Yes | Path | Target model GUID that the user wants to sync the source model to |
| sourceModelGuid | Yes | Query | Source model GUID that contains the revisions |

**Example request**
```bash
curl -L -X GET \
  'https://api.anaplan.com/2/0/workspaces/ff8081813f9aee3c013f9b06a28a000a/models/A3E7FBE7F67143D18177C2C61E5BCFC8/alm/syncableRevisions?sourceModelId=882EBB062D9147DCBE63749674FAE63F' \
  -H 'Authorization: AnaplanAuthToken {anaplanAuthToken}'
```

**Example 200 response**
```json
{
  "meta": {
    "schema": "{apiUrl}/2/0/objects/revision"
  },
  "status": {
    "code": 200,
    "message": "Success"
  },
  "revisions": [
    {
      "id": "795731A31D1A47EFB3802EA6355C62C4",
      "name": "C",
      "description": "Some description",
      "createdOn": "2021-03-10T11:31:08Z",
      "createdBy": "c1c46795a04d430ca7b0ac0d993a5796",
      "creationMethod": "User added revision",
      "appliedOn": "2021-03-10T11:31:08Z",
      "appliedBy": "c1c46795a04d430ca7b0ac0d993a5796"
    },
    {
      "id": "E7F72A49B23C43638DC77839D78B33BE",
      "name": "B",
      "createdOn": "2021-03-10T11:28:26Z",
      "createdBy": "c1c46795a04d430ca7b0ac0d993a5796",
      "creationMethod": "User added revision",
      "appliedOn": "2021-03-10T11:28:26Z",
      "appliedBy": "c1c46795a04d430ca7b0ac0d993a5796"
    }
  ]
}
```

**Error responses**

| Code | Message | Required amendments |
|---:|---|---|
| 400 | Missing `sourceModelId` request parameter | Specify the mandatory `sourceModelId` |
| 403 | Forbidden | Ensure the user is a workspace administrator for both models |
| 404 | Not Found | One of the models does not exist / check IDs and access |
| 422 | Model is Archived | Use a model that is not archived |

---

### Retrieve latest revision
Use this call to return the latest revision for a specific model. The response is in the same format as in **Retrieve compatible source model revisions**.

If a revision exists, the returned list should contain **one element only** (the latest revision).

**Notes**
- To use this call, you must be a **Workspace Administrator**.
- Ensure you have access to the model.

**Endpoint**
- `GET https://api.anaplan.com/2/0/models/{modelGuid}/alm/latestRevision`

**Example request**
```bash
curl -L -X GET \
  'https://api.anaplan.com/2/0/models/96F5036A083F48148A550C71E3BBB8E7/alm/latestRevision' \
  -H 'Authorization: AnaplanAuthToken {anaplanAuthToken}'
```

**Example 200 response**
```json
{
  "meta": {
    "schema": "https://api.anaplan.com/2/0/objects/revision"
  },
  "status": {
    "code": 200,
    "message": "Success"
  },
  "revisions": [
    {
      "id": "0E79B89FD214428E8C3A00514B9BE9EE",
      "name": "Revision name",
      "description": "Some description",
      "createdOn": "2021-03-17T14:43:01Z",
      "createdBy": "c1c46795a04d430ca7b0ac0d993a5796",
      "creationMethod": "Model copied",
      "appliedOn": "2021-03-20T09:21:55Z",
      "appliedBy": "c2e86235a08h510ca7b0ad0g993a4318"
    }
  ]
}
```

If the specified model does not have **any** revisions, the user receives a `200` response and the response body does not include revision details. (Models that use ALM always have a revision.)

**Error responses**

| Code | Message | Required amendments |
|---:|---|---|
| 403 | Forbidden | Ensure the user is a workspace administrator for the model |
| 404 | Not Found | Verify the model ID and access |
| 422 | Model is Archived | Use a model that is not archived |

---

### Create a model sync task
Use this call to **synchronize** across two models.

**Notes**
- To use this call, you must be a **Workspace Administrator**.
- Ensure the target model is **unlocked** and **unarchived** when you call this endpoint.
  - Archived models return a **422 Model is Archived** response.
- This endpoint does **not** return a comparison report.
- Use:
  - **Retrieve compatible source model revisions** and
  - **Retrieve latest revision**
  to determine the `sourceRevisionId` and `targetRevisionId`.

**Endpoint**
- `POST https://api.anaplan.com/2/0/models/{modelId}/alm/syncTasks`

**Example request**
```bash
curl -X POST 'https://api.anaplan.com/2/0/models/{modelId}/alm/syncTasks' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "sourceRevisionId": "<revision_to_sync>",
    "sourceModelId": "<source_model_id>",
    "targetRevisionId": "<latest_revision_on_target_model>"
  }'
```

**Request headers**

| Header | Required | Details |
|---|---:|---|
| Authorization: AnaplanAuthToken {anaplan_auth_token} | Yes | The Anaplan authentication token |
| Content-Type: application/json | Yes | Describes the media type of the request body |

**Request body**
Only include the properties listed below to ensure your call is successful.

```json
{
  "sourceRevisionId": "<revision_to_sync>",
  "sourceModelId": "<source_model_id>",
  "targetRevisionId": "<latest_revision_on_target_model>"
}
```

| JSON element | Required | Details |
|---|---:|---|
| sourceRevisionId | Yes | Must be a string |
| sourceModelId | Yes | Must be a string |
| targetRevisionId | Yes | Must be a string |

**Successful response**
- `201 Created`

**Response headers**
- `Content-Type: application/json`
- `Location: <URL of the created syncTask resource>`

**Response body**
```json
{
  "meta": {
    "schema": "https://api.anaplan.com/2/0/objects/taskWithUrl"
  },
  "status": {
    "code": 201,
    "message": "Created"
  },
  "task": {
    "taskId": "6C283D93A9E64570BF502B8F7AF67A00",
    "taskUrl": "https://api.anaplan.com/2/0/models/7282C939A7F54B9A88CB39920592F338/alm/syncTasks/6C283D93A9E64570BF502B8F7AF67A00",
    "taskState": "IN_PROGRESS",
    "creationTime": 1614618651855
  }
}
```

**Error responses**

| Code | Message | Required amendments |
|---:|---|---|
| 400 | Expected mandatory fields `sourceRevisionId`, `sourceModelId` and `targetRevisionId` | Add the mandatory fields |
| 400 | Other messages | Check why sync cannot start (ALM not enabled, invalid IDs, SSO restrictions, etc.) |
| 403 | Forbidden | Ensure workspace admin on both source and target workspaces |
| 404 | Not Found | Check if the model ID specified in the URL is correct |
| 422 | Model is Archived | Use a model that is not archived |

---

### Retrieve model sync task info
Use this call to retrieve information about a specific sync task.

**Note:** To use this call, you must be a **Workspace Administrator**.

**Endpoint**
- `GET https://api.anaplan.com/2/0/models/{modelId}/alm/syncTasks/{syncTaskId}`

**Example request**
```bash
curl -X GET 'https://api.anaplan.com/2/0/models/{modelId}/alm/syncTasks/{syncTaskId}' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}'
```

**Successful response**
- `200 OK`

```json
{
  "meta": {
    "schema": "https://api.anaplan.com/2/0/objects/task"
  },
  "status": {
    "code": 200,
    "message": "Success"
  },
  "task": {
    "taskId": "48B7FB976E8F4FBDAD925EC90BADB4FC",
    "currentStep": "Complete.",
    "result": {
      "successful": true
    },
    "taskState": "COMPLETE",
    "creationTime": 1614870183373
  }
}
```

**Successful response with an unsuccessful sync task**
If the sync task cannot complete, the reason is in the `task.result.error` object:

```json
{
  "meta": {
    "schema": "https://api.anaplan.com/2/0/objects/task"
  },
  "status": {
    "code": 200,
    "message": "Success"
  },
  "task": {
    "taskId": "9CF4E79BC78348539A5D994C18A8A18E",
    "currentStep": "Failed.",
    "result": {
      "successful": false,
      "error": {
        "title": "Model Synchronization Failed",
        "messageText": "Your current workspace size is 998.9 MB. The current size of the model is 440.3 MB, but would be 552.9 MB after sync.",
        "subtitle": "Completing this sync would cause your workspace to exceed its size limit of 1.0 GB."
      }
    },
    "taskState": "COMPLETE",
    "creationTime": 1615387609842
  }
}
```

**Error responses**

| Code | Message | Required amendments |
|---:|---|---|
| 403 | Forbidden | Ensure the user is a workspace administrator for the model’s workspace |
| 404 | Not Found | Check if the model ID and sync task ID in the URL are correct |
| 422 | Model is Archived | Use a model that is not archived |

---

### Retrieve sync tasks for a model
Use this endpoint to return a list of sync tasks for a target model, where the tasks are either:
- In progress, or
- Completed within the last 48 hours.

The list is returned in descending order of when tasks were created.

**Notes**
- To use this call, you must be a **Workspace Administrator**.
- A model stores a maximum number of task results. If there are more than ~20,000 results, the system removes some older tasks before the 48 hours period expires. If removed, these tasks are not returned by the API.
- `modelGuid` is the global unique identifier (GUID) of the target model.

**Endpoint**
- `GET https://api.anaplan.com/2/0/models/{modelGuid}/alm/syncTasks`

**Example request**
```bash
curl -L -X GET 'https://api.anaplan.com/2/0/models/{modelGuid}/alm/syncTasks' \
  -H 'Authorization: AnaplanAuthToken {anaplanAuthToken}'
```

**Example 200 response**
```json
{
  "meta": {
    "schema": "https://api.anaplan.com/2/0/objects/task"
  },
  "status": {
    "code": 200,
    "message": "Success"
  },
  "tasks": [
    {
      "taskId": "4190D7569A21444FAADC5406E2A8D005",
      "taskState": "COMPLETE",
      "creationTime": 1618396930895
    },
    {
      "taskId": "B5313AB57DD642D6938E99CA804A64EC",
      "taskState": "COMPLETE",
      "creationTime": 1618396932385
    }
  ]
}
```

**Error responses**

| Code | Message |
|---:|---|
| 403 | Forbidden / A user can see the models but is not a Workspace Administrator |
| 404 | Not Found / The specified model does not exist |

---

### Create a revision
Use this call to create a model revision.

**Notes**
- To use this call, you must be a **Workspace Administrator**.
- Ensure there’s a minimum of one **structural change** to the model.
- Ensure the model is in **standard mode**.

**Endpoint**
- `POST https://api.anaplan.com/2/0/models/{modelId}/alm/revisions`

**Example request**
```bash
curl -X POST 'https://api.anaplan.com/2/0/models/{modelId}/alm/revisions' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "name": "<new_revision_title>",
    "description": "<new_revision_desc>"
  }'
```

**Request headers**

| Header | Required | Details |
|---|---:|---|
| Authorization: AnaplanAuthToken {anaplan_auth_token} | Yes | The Anaplan authentication token |
| Content-Type: application/json | Yes | Request body is JSON |

**Request body**
```json
{
  "name": "<new_revision_title>",
  "description": "<new_revision_desc>"
}
```

| JSON element | Required | Details |
|---|---:|---|
| name | Yes | Must be a non-empty string, max 60 characters |
| description | No | Must be a string, 250 characters or fewer |

**Successful response**
- `201 Created`

```json
{
  "meta": {
    "schema": "https://api.anaplan.com/2/0/objects/revision"
  },
  "status": {
    "code": 201,
    "message": "Created"
  },
  "revision": {
    "id": "397FAEF09D8146CF8B537874D3D515D4",
    "name": "Revision-123",
    "description": "A revision capturing some structural changes to my model",
    "createdOn": "2021-02-01T17:19:29Z",
    "createdBy": "2c9ba1a8716147830171970589222302",
    "creationMethod": "User added revision via API",
    "appliedOn": "2021-02-01T17:19:29Z",
    "appliedBy": "2c9ba1a8716147830171970589222302"
  }
}
```

**Error responses**

| Code | Message | Required amendments |
|---:|---|---|
| 400 | The title of your revision tag must be 60 characters or fewer | Shorten `name` to <= 60 |
| 400 | Revision tag descriptions must be 250 characters or fewer | Shorten `description` to <= 250 |
| 400 | Other messages | Check why revision cannot be created (e.g., ALM not enabled) |
| 403 | Forbidden | Check if the user is a workspace administrator |
| 404 | Not Found | Check if the specified model ID is correct and you have access |
| 422 | Model is Archived | Use a model that is not archived |

---

### Retrieve revisions in a model
Use this call to retrieve the list of revisions for a model.

**Notes**
- To use this call, you must be a **Workspace Administrator** and can access the model.

**Endpoint**
- `GET https://api.anaplan.com/2/0/models/{modelId}/alm/revisions`

**Example request**
```bash
curl -X GET 'https://api.anaplan.com/2/0/models/{modelId}/alm/revisions' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}'
```

**Optional query parameters**

| Parameter | Details |
|---|---|
| appliedAfter | Retrieve revisions made after a specified date (`YYYY-MM-DD`). Must be earlier than `appliedBefore`. |
| appliedBefore | Retrieve revisions before a specified date (`YYYY-MM-DD`). Must be later than `appliedAfter`. |
| sort | Retrieve revisions sorted in dictionary order by property (asc/desc). Example: `-name` sorts by name descending. |
| limit | Retrieve only the specified number of revisions |
| offset | Retrieve revisions starting from the specified value |

**Successful response**
- `200 OK`

```json
{
  "meta": {
    "paging": {
      "currentPageSize": 1,
      "offset": 0,
      "totalSize": 1
    },
    "schema": "https://api.anaplan.com/2/0/objects/revision"
  },
  "status": {
    "code": 200,
    "message": "Success"
  },
  "revisions": [
    {
      "id": "1B9A346A6CE14318925862FE85080068",
      "name": "First Revision",
      "createdOn": "2021-04-29T12:22:16Z",
      "createdBy": "8a80db9362f64cad0162fa0ab3fe0001",
      "creationMethod": "User added revision"
    }
  ]
}
```

**Error responses**

| Code | Message | Required amendments |
|---:|---|---|
| 400 | Date query parameter must be of the format `YYYY-MM-DD` | Fix date format |
| 400 | `appliedAfter` must be an earlier date than `appliedBefore` | Adjust dates |
| 403 | Forbidden | Ensure workspace admin access |
| 404 | Not Found | Verify model ID and access |
| 422 | Model is Archived | Use a model that is not archived |

---

### Retrieve the models for a specific revision
Use this call when you need a list of the models that had a specific revision applied to them.

**Notes**
- To use this call, you must be a **Workspace Administrator** and can access the model.
- The response includes deleted models where the object contains `"modelDeleted": true` and omits the `modelName` and `workspaceId` fields.

**Endpoint**
- `GET https://api.anaplan.com/2/0/models/{modelId}/alm/revisions/{revisionId}/appliedToModels`

**Example request**
```bash
curl -X GET 'https://api.anaplan.com/2/0/models/{modelId}/alm/revisions/{revisionId}/appliedToModels' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}'
```

**Example 200 response**
```json
{
  "meta": {
    "schema": "https://api.anaplan.com/2/0/objects/revision"
  },
  "status": {
    "code": 200,
    "message": "Success"
  },
  "appliedToModels": [
    {
      "modelId": "1B9A346A6CE14318925862FE85080068",
      "modelName": "Planning Dev",
      "workspaceId": "ff8081813f9aee3c013f9b06a28a000a",
      "appliedBy": "8a80db9362f64cad0162fa0ab3fe0001",
      "appliedOn": "2021-04-29T12:22:16Z",
      "appliedMethod": "User added revision via API"
    },
    {
      "modelId": "52A9A68B177447DCB693ACF2D75F9E77",
      "appliedBy": "8a80db9362f64cad0162fa0ab3fe0001",
      "appliedOn": "2021-04-30T09:56:34Z",
      "appliedMethod": "Revision synchronized",
      "modelDeleted": true
    },
    {
      "modelId": "7282C939A7F54B9A88CB39920592F338",
      "modelName": "Planning Prod",
      "workspaceId": "ff8081813f9aee3c013f9b06a28a000a",
      "appliedBy": "8a80db9362f64cad0162fa0ab3fe0001",
      "appliedOn": "2021-05-01T11:01:25Z",
      "appliedMethod": "Revision synchronized"
    }
  ]
}
```

**Error responses**

| Code | Message | Required amendments |
|---:|---|---|
| 403 | Forbidden | Ensure workspace admin access |
| 404 | Not Found | Check model/revision IDs and that revision was applied to the model |
| 422 | Model is Archived | Use a model that is not archived |

---

## Full Comparison Reports

### Create a full comparison report generation task
Use this endpoint to start a task that generates a full comparison report between two model revisions.

**Notes**
- To use this call, you must be a **Workspace Administrator** and can access the target and source models.
- This endpoint only starts generation. Use **Retrieve the info for a full comparison report generation task** to monitor progress.

**Endpoint**
- `POST https://api.anaplan.com/2/0/models/{targetModelId}/alm/comparisonReportTasks`

**Example request**
```bash
curl -X POST 'https://api.anaplan.com/2/0/models/{targetModelId}/alm/comparisonReportTasks' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "sourceRevisionId": "<revision_to_sync>",
    "sourceModelId": "<source_model_id>",
    "targetRevisionId": "<latest_revision_on_target_model>"
  }'
```

**Successful response**
- `201 Created`

```json
{
  "meta": {
    "schema": "https://api.anaplan.com/2/0/objects/taskWithUrl"
  },
  "status": {
    "code": 201,
    "message": "Created"
  },
  "task": {
    "taskId": "6C283D93A9E64570BF502B8F7AF67A00",
    "taskUrl": "https://api.anaplan.com/2/0/models/7282C939A7F54B9A88CB39920592F338/alm/comparisonReportTasks/6C283D93A9E64570BF502B8F7AF67A00",
    "taskState": "IN_PROGRESS",
    "creationTime": 1614618651855
  }
}
```

**Error responses**

| Code | Message | Required amendments |
|---:|---|---|
| 400 | Expected mandatory fields `sourceRevisionId`, `sourceModelId` and `targetRevisionId` | Add the mandatory fields |
| 400 | Other messages | Diagnose why report could not be generated (invalid IDs, SSO restrictions, etc.) |
| 403 | Forbidden | Ensure workspace admin access for both workspaces |
| 404 | Not Found | Verify the model ID in the URL |
| 422 | Model is Archived | Use a model that is not archived |

---

### Retrieve the info for a full comparison report generation task
Use this call to retrieve information about a specific comparison report generation task. A successful response contains a link to download the comparison report file.

**Endpoint**
- `GET https://api.anaplan.com/2/0/models/{modelId}/alm/comparisonReportTasks/{taskId}`

**Example request**
```bash
curl -X GET 'https://api.anaplan.com/2/0/models/{modelId}/alm/comparisonReportTasks/{taskId}' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}'
```

**Successful response**
- `200 OK`

```json
{
  "meta": {
    "schema": "https://api.anaplan.com/2/0/objects/syncTask"
  },
  "status": {
    "code": 200,
    "message": "Success"
  },
  "task": {
    "taskId": "48B7FB976E8F4FBDAD925EC90BADB4FC",
    "currentStep": "Complete.",
    "result": {
      "successful": true,
      "targetRevisionId": "795731A31D1A47EFB3802EA6355C62C4",
      "sourceRevisionId": "E7F72A49B23C43638DC77839D78B33BE",
      "reportFileUrl": "https://api.anaplan.com/2/0/models/{modelId}/alm/comparisonReports/795731A31D1A47EFB3802EA6355C62C4/E7F72A49B23C43638DC77839D78B33BE"
    },
    "taskState": "COMPLETE",
    "creationTime": 1614870183373
  }
}
```

**Unsuccessful generation task**
```json
{
  "meta": {
    "schema": "https://api.anaplan.com/2/0/objects/syncTask"
  },
  "status": {
    "code": 200,
    "message": "Success"
  },
  "task": {
    "taskId": "9CF4E79BC78348539A5D994C18A8A18E",
    "currentStep": "Failed.",
    "result": {
      "successful": false,
      "error": {
        "title": "The target and source revisions are incompatible",
        "messageText": "Please choose a target and source revision that's compatible."
      }
    },
    "taskState": "COMPLETE",
    "creationTime": 1615387609842
  }
}
```

**Error responses**

| Code | Message | Required amendments |
|---:|---|---|
| 403 | Forbidden | Ensure workspace admin access |
| 404 | Not Found | Verify model ID and task ID |
| 422 | Model is Archived | Use a model that is not archived |

---

### Retrieve the content for a full comparison report
Use this endpoint to download the contents of the comparison report for a set of revisions.

Before you use this endpoint, make sure the report is generated and ready to download.

The report is identical to the report in the user interface. Once the report is generated, it’s available for **48 hours**. After that time, you need to generate a new report to access it again.

**Endpoint**
- `GET https://api.anaplan.com/2/0/models/{modelId}/alm/comparisonReports/{targetRevisionId}/{sourceRevisionId}`

**Example request**
```bash
curl -X GET 'https://api.anaplan.com/2/0/models/{modelId}/alm/comparisonReports/{targetRevisionId}/{sourceRevisionId}' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}'
```

**Successful response**
- `200 OK`
- `Content-Type: application/octet-stream`

**Response body**
> Note: In the actual response, the columns are separated by tabs rather than spaces.

(Example excerpt)
```
=== LISTS ADDED ===
Name    Position    Relative To    Has Workflow    ...

=== MODULES ADDED ===
Name    Position    Relative To    Applies To    ...

...
```

**Error responses**

| Code | Message | Required amendments |
|---:|---|---|
| 403 | Forbidden | Ensure workspace admin access for the target model |
| 404 | Not Found | Verify IDs; regenerate and monitor task until ready |
| 422 | Model is Archived | Use a model that is not archived |

---

## Summary Reports

### Create a summary report generation task
Use this call to start a task that generates a summary report between two model revisions.

**Endpoint**
- `POST https://api.anaplan.com/2/0/models/{targetModelId}/alm/summaryReportTasks`

**Example request**
```bash
curl -X POST 'https://api.anaplan.com/2/0/models/{targetModelId}/alm/summaryReportTasks' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "sourceRevisionId": "<revision_to_sync>",
    "sourceModelId": "<source_model_id>",
    "targetRevisionId": "<latest_revision_on_target_model>"
  }'
```

**Error responses**
- Same pattern as other task endpoints: `400` (bad JSON / missing fields), `403`, `404`, `422`.

---

### Retrieve the info for a summary report generation task
Use this call to retrieve information about a specific summary report generation task. A successful response contains a link to retrieve the summary report contents.

**Endpoint**
- `GET https://api.anaplan.com/2/0/models/{modelId}/alm/summaryReportTasks/{taskId}`

**Example 200 response**
```json
{
  "meta": {
    "schema": "https://api.anaplan.com/2/0/objects/syncTask"
  },
  "status": {
    "code": 200,
    "message": "Success"
  },
  "task": {
    "taskId": "48B7FB976E8F4FBDAD925EC90BADB4FC",
    "currentStep": "Complete.",
    "result": {
      "successful": true,
      "targetRevisionId": "795731A31D1A47EFB3802EA6355C62C4",
      "sourceRevisionId": "E7F72A49B23C43638DC77839D78B33BE",
      "reportFileUrl": "https://api.anaplan.com/2/0/models/{modelId}/alm/summaryReports/795731A31D1A47EFB3802EA6355C62C4/E7F72A49B23C43638DC77839D78B33BE"
    },
    "taskState": "COMPLETE",
    "creationTime": 1614870183373
  }
}
```

---

### Retrieve the contents for a summary report
Use this endpoint to retrieve the contents of the summary report for the given revisions that was submitted to be generated using **Create a summary report generation task**.

The report must be completely generated before it can be retrieved. To check the status, use **Retrieve the info for a summary report generation task**.

If the report is generated, it will be available to all users with appropriate permissions. The report is identical to the report that can be requested from the UI. If the report is not accessed for a period of time (48 hours by default) it will be deleted and must be generated again.

**Notes**
- If there have been no changes to an object type (e.g., list subsets), that type of object is omitted from the response.
- If there have been no creations/modifications/deletions for a type, those properties are omitted.

**Endpoint**
- `GET https://api.anaplan.com/2/0/models/{modelId}/alm/summaryReports/{targetRevisionId}/{sourceRevisionId}`

**Example 200 response**
```json
{
  "meta": {
    "schema": "https://api.anaplan.com/2/0/objects/summaryReport"
  },
  "status": {
    "code": 200,
    "message": "Success"
  },
  "summaryReport": {
    "targetRevisionId": "E7E7D6A8916C429590E9DA900467C452",
    "sourceRevisionId": "8ABF264A02D24948B786D5B0BDE146D7",
    "totals": {
      "modified": 1,
      "deleted": 1,
      "created": 3
    },
    "differences": {
      "lineItems": { "created": 1 },
      "rolesContents": { "modified": 1 },
      "lists": { "deleted": 1, "created": 1 },
      "modules": { "created": 1 }
    }
  }
}
```

**Error responses**

| Code | Message | Required amendments |
|---:|---|---|
| 403 | Forbidden | Check if the user is a workspace administrator on the target model |
| 404 | Not Found | Verify IDs; regenerate report task and monitor until ready |
| 422 | Model is Archived | Use a model that is not archived |

---

## Common errors

| Code | API Message | What to do |
|---:|---|---|
| 400 | Check if the content is compatible with JSON format. | Validate JSON syntax and types |
| 400 | An unterminated string was identified. Ensure the string is terminated. | Fix quoting / missing closing quotes |
| 400 | An unterminated JSON object was found. Ensure the object is terminated. | Fix braces / missing closing `}` |
| 400 | Identified an unrecognized `<field_name>`. | Remove unsupported fields |
| 400 | The data provided is not in the expected format. | Ensure correct data types |
| 400 | Found a value with an unexpected string format when `<expected_type>` was expected. | Provide value in expected type/format |
| 400 | The request body is null. | Provide a non-empty request body |
