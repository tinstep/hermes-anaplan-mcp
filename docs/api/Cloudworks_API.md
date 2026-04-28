# Anaplan CloudWorks API

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

## Introduction

The Anaplan CloudWorks API enables you to create your own connections and integrations with Anaplan [CloudWorks](https://help.anaplan.com/96f951fe-52fc-45a3-b6cb-16b7fe38e1aa). Version 2.0 is recommended, but version 1.0 is still supported.

### Prerequisites

You must have access to the Anaplan CloudWorks API to use the endpoints listed in this guide.

### Integration Flow Features

- Disable steps in an integration flow
- Run a subset of steps (resume from a selected step)
- Error control at the step level - choose how to proceed on error/exception

A `sortBy` parameter is available for integrations. `sortBy=name` sorts ascending; `sortBy=-name` sorts descending.

**Note:** GET calls for integrations include `notificationID` in response bodies when a notification configuration is available.

### URL, IP, and Allowlist Requirements

See: [URL, IP, and allowlist requirements](https://support.anaplan.com/url-ip-and-allowlist-requirements-c8235c7d-8af2-413b-a9ff-d465978806b9)

## Error Codes

| Error | HTTP Code | Description |
|-------|-----------|-------------|
| Integration flow error | 400 | Integration flow must have at least two enabled steps. |
| Invalid request body | 400 | Problem with the request body. Check the format. |
| {request parameter name} | 400 | Problem with a parameter in the request body. Check the format. |
| {header name} | 400 | Problem with a request header. Check the format. |
| User does not have access to workspace | 400 | You do not have access to the workspace. |
| User does not have access to model | 400 | You do not have access to the model. |
| Role arn is invalid | 400 | The Role ARN provided for Amazon S3 credentials is invalid. |
| Bucket name is invalid | 400 | Amazon S3 bucket name is invalid or does not exist. |
| Credentials are invalid | 400 | The credentials for the external platform are invalid. |
| Bucket access denied | 400 | You do not have access to the Amazon S3 bucket. |
| Only a single schedule is supported per integration | 400 | Each CloudWorks integration supports a single associated schedule. |
| Invalid Schedule | 400 | The schedule details are invalid. Verify and amend as needed. |
| {field error} | 400 | A field in the request has resulted in an error. Verify the field element is correct. |
| Invalid connection type | 400 | The connection type is not valid. Verify the connection type. |
| Integration payload is not compliant with the schema | 400 | The request payload is in an invalid format. |
| A Process that has Optimizer as steps cannot be executed through CloudWorks | 400 | Remove the optimizer step from the Process to use it within CloudWorks. |
| Action(s) you included, {action_ids} are not defined in your Anaplan model | 400 | Check the actions in the Anaplan model. |
| This API version is not supported for this request | 400 | Check the URL version. |
| Not Authorized | 403 | Verify the Anaplan authorization token has not expired. If valid, contact Anaplan support. |
| Resource not found | 404 | The source information is invalid. Verify the source information (e.g., connectionId). |
| Invalid connection_id | 404 | The connectionId is invalid. Check if the connectionId is valid. |
| Integration is already running | 409 | The API call cannot run until the integration completes. |
| The resource is being referenced | 409 | Check if the resource is being referenced. |
| Only a single job is supported by import/export integration | 409 | CloudWorks integrations only support one job. |
| Total number of integrations exceeded the limit | 409 | Integrations exceed the maximum of 500 per Tenant. |
| Model Not Found Error | 500 | Verify the model is present in Anaplan. |
| A running integration cannot be deleted | 500 | Run the delete again when the integration has completed. |
| Unable to retrieve S3 files, count too high | 500 | Too many files in the Amazon S3 bucket for retrieval. |
| Duplicate resource name not allowed | 500 | Each resource name must be unique. |
| Internal server error | 500 | Contact Anaplan support. |
| Anaplan Connection Error | 500 | Contact Anaplan support. |
| Invalid workspace or model | 503 | The workspace or model ID is invalid. |
| Integration trigger error | 503 | Contact Anaplan support. |
| Invalid Dataset | 400 | Check if Google BigQuery dataset is valid. |
| Dataset access denied | 400 | Check if you have access to Google BigQuery dataset. |

---

## Connections

### Create a Connection

`POST /integrations/connections`

Create a new [connection](https://help.anaplan.com/anapedia/Content/Data_Integrations/Integrations_framework/Create-a-new-connection.htm) for CloudWorks.

#### Request

```bash
curl -X POST 'https://api.cloudworks.anaplan.com/2/0/integrations/connections' \
  -H 'Authorization: AnaplanAuthToken {token_value}' \
  -H 'Content-Type: application/json' \
  -d '{request body}'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

None

#### Request Body

##### Amazon S3

```json
{
  "type": "{type}",
  "body": {
    "name": "{name}",
    "accessKeyId": "{access key ID}",
    "secretAccessKey": "{secret access key}",
    "bucketName": "{bucket name}",
    "roleArn": "{role ARN}"
  }
}
```

**Note:** If you are a restricted integration user, add the `workspaceId` to the payload:

```json
{
  "type": "{type}",
  "body": {
    "name": "{name}",
    "accessKeyId": "{access key ID}",
    "secretAccessKey": "{secret access key}",
    "bucketName": "{bucket name}",
    "roleArn": "{role ARN}",
    "workspaceId": "{workspace id}"
  }
}
```

| Key | Details |
|-----|---------|
| `type` | Required. String. The authentication type. Valid value: `AmazonS3`. |
| `name` | Required. String. The connection name. Must be unique. Example: `test_credentials_1` |
| `accessKeyId` | Required. String. The Amazon S3 Access Key ID. Example: `ALMNW18ERR9QQ89SS00H` |
| `secretAccessKey` | Required. String. The Amazon S3 Secret Access Key. Example: `BKmrBGlcuiuRpx32lmpglReWLwuflEcPbp7nf3LP` |
| `bucketName` | Required. String. The Amazon S3 Bucket name. Example: `samplebucket` |
| `roleArn` | Optional. String. The Amazon S3 Role ARN. Example: `arn:aws:iam::123475742:role/sampleReadOnly` |
| `workspaceId` | Required (restricted users only). String. The workspace ID. Example: `2c9ba1a8719d5fbf01722b11d9385b1a` |

##### Google BigQuery

```json
{
  "type": "{type}",
  "body": {
    "name": "{name}",
    "serviceAccountKey": {
      "type": "service_account",
      "projectId": "{projectId}",
      "privateKeyId": "{privateKeyId}",
      "privateKey": "{privateKey}",
      "clientEmail": "{clientEmail}",
      "clientId": "{clientId}",
      "authUri": "{authUri}",
      "tokenUri": "{tokenUri}",
      "authProviderX509CertUrl": "{authProviderX509CertUrl}",
      "clientX509CertUrl": "{clientX509CertUrl}"
    },
    "dataset": "{dataset}"
  }
}
```

**Note:** If you are a restricted integration user, add `workspaceId` to the `body`.

| Key | Details |
|-----|---------|
| `type` | Required. String. Valid value: `GoogleBigQuery`. |
| `name` | Required. String. Connection name. Must be unique. Example: `test BQ credentials` |
| `projectId` | Required. String. Google BigQuery project ID. Example: `ap-engg-np-project` |
| `privateKeyId` | Required. String. Google BigQuery private key ID. Example: `1dg11189f71111b5f7juh8u9b5dh9k46y888999o` |
| `privateKey` | Required. String. Google BigQuery private key. Example: `-----BEGIN PRIVATE KEY-----xUbZLId3bn2-----END PRIVATE KEY-----\n"` |
| `clientEmail` | Required. String. Google BigQuery client email. Example: `sample.iam.gserviceaccount.com` |
| `clientId` | Required. String. Google BigQuery client ID. Example: `1223111987765897895300` |
| `authUri` | Required. String. Google BigQuery auth URI. Example: `https://accounts.google.com/o/oauth2/auth` |
| `tokenUri` | Required. String. Google BigQuery token URI. Example: `https://oauth2.googleapis.com/token` |
| `authProviderX509CertUrl` | Required. String. Google BigQuery auth provider cert URL. Example: `https://www.googleapis.com/oauth2/v1/certs` |
| `clientX509CertUrl` | Required. String. Google BigQuery client cert URL. Example: `https://www.googleapis.com/iam.gserviceaccount.com` |
| `dataset` | Required. String. Google BigQuery dataset. Example: `dev_us_west` |
| `workspaceId` | Required (restricted users only). String. The workspace ID. Example: `2c9ba1a8719d5fbf01722b11d9385b1a` |

##### Azure Blob

```json
{
  "type": "{type}",
  "body": {
    "name": "name",
    "storageAccountName": "{storage account name}",
    "sasToken": "{SAS token}",
    "containerName": "{container name}"
  }
}
```

**Note:** If you are a restricted integration user, add `workspaceId` to the `body`.

| Key | Details |
|-----|---------|
| `type` | Required. String. Valid value: `AzureBlob`. |
| `name` | Required. String. Connection name. Must be unique. Example: `test_credentials_1` |
| `storageAccountName` | Required. String. Azure Storage account name. Example: `my_storage_account` |
| `sasToken` | Required. String. Shared access token for the Azure Storage container. Example: `sp=racwdl&st=2021-10-07T09:11:01Z&se=2021-10-07T10:11:01Z&spr=https&sv=2020-08-04&sr=c&sig=04YRw4xdasduTlRkWbW27Qr6qu2eQPXmltduiLwgyz0E%3D` |
| `containerName` | Required. String. Azure Storage container name. Example: `my_container` |
| `workspaceId` | Required (restricted users only). String. The workspace ID. Example: `2c9ba1a8719d5fbf01722b11d9385b1a` |

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  },
  "connections": {
    "connectionId": "0c3d2f662c1b4c71a02fb4b6f09a40f7"
  }
}
```

---

### Get Connections

`GET /integrations/connections`

Get a list of your current connections to CloudWorks.

#### Request

```bash
curl -X GET 'https://api.cloudworks.anaplan.com/2/0/integrations/connections' \
  -H 'Authorization: AnaplanAuthToken {token_value}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

None

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  },
  "connections": [
    {
      "connectionId": "0c3d2f662c1b4c71a02fb4b6f09a40f7",
      "connectionType": "AmazonS3",
      "body": {
        "name": "test_credentials_2",
        "bucketName": "samplebucket"
      },
      "isoCreationDate": "2020-09-08T19:18:11.000Z",
      "isoModificationDate": "2020-09-08T19:31:33.000Z",
      "createdBy": "John Smith",
      "modifiedBy": "John Smith",
      "status": 1,
      "integrationErrorCode": null
    },
    {
      "connectionId": "d743a4e6c39d46c394f792f31d67dd95",
      "connectionType": "GoogleBigQuery",
      "body": {
        "name": "test bq credentials",
        "dataset": "dev_us_west"
      }
    },
    {
      "connectionId": "46d677fdb67a41529d0ddadc294515dd",
      "connectionType": "AzureBlob",
      "body": {
        "name": "test azure credentials",
        "storageAccountName": "my_storage_account",
        "containerName": "my_container"
      },
      "creationDate": "2021-09-02T19:45:28.000Z",
      "modificationDate": "2021-09-02T20:46:43.000Z",
      "createdBy": "John Smith",
      "modifiedBy": "John Smith",
      "status": 1,
      "integrationErrorCode": null
    }
  ],
  "meta": {
    "paging": {
      "currentPageSize": 3,
      "totalSize": 3,
      "offset": 0
    },
    "schema": "https://api.anaplan.com/cloudworks/2/0/integrations/objects/connections?connectionType=<connectionType>"
  }
}
```

**Note:** The `status` field indicates if the connection is valid. `1` = valid, `0` = invalid. If invalid, possible `integrationErrorCode` values:

| Error Code | Meaning |
|------------|---------|
| 1 | AMAZONS3_INVALID_CREDENTIALS |
| 4 | AMAZONS3_INVALID_BUCKET |
| 10 | AWS_ASSUME_ROLE_FAILED |

---

### Edit a Connection

`PUT /integrations/connections/{connectionId}`

Edit a connection in Anaplan CloudWorks.

#### Request

```bash
curl -X PUT 'https://api.cloudworks.anaplan.com/2/0/integrations/connections/{connectionId}' \
  -H 'Authorization: AnaplanAuthToken {token_value}' \
  -H 'Content-Type: application/json' \
  -d '{request body}'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

| Parameter | Details |
|-----------|---------|
| `connectionId` | Required. String. The connection ID. Example: `0c3d2f662c1b4c71a02fb4b6f09a40f7` |

#### Request Body

##### Amazon S3

```json
{
  "name": "{name}",
  "accessKeyId": "{access key ID}",
  "secretAccessKey": "{secret access key}",
  "bucketName": "{bucket name}",
  "roleArn": "{role ARN}"
}
```

| Key | Details |
|-----|---------|
| `name` | Required. String. Connection name. Must be unique. Example: `test_credentials_1` |
| `accessKeyId` | Required. String. Amazon S3 Access Key ID. Example: `ALMNW18ERR9QQ89SS00H` |
| `secretAccessKey` | Required. String. Amazon S3 Secret Access Key. Example: `BKmrBGlcuiuRpx32lmpglReWLwuflEcPbp7nf3LP` |
| `bucketName` | Required. String. Amazon S3 Bucket name. Example: `samplebucket` |
| `roleArn` | Optional. String. Amazon S3 Role ARN. Example: `arn:aws:iam::123475742:role/sampleReadOnly` |

##### Azure Blob

```json
{
  "name": "name",
  "storageAccountName": "{storage account name}",
  "sasToken": "{SAS token}",
  "containerName": "{container name}"
}
```

| Key | Details |
|-----|---------|
| `name` | Required. String. Connection name. Must be unique. Example: `test_credentials_1` |
| `storageAccountName` | Required. String. Azure Storage account name. Example: `MyStorageAccount` |
| `sasToken` | Required. String. Shared access token for the Azure Storage container. |
| `containerName` | Required. String. Azure Storage container name. Example: `samplebucket` |

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  }
}
```

---

### Patch a Connection

`PATCH /integrations/connections/{connectionId}`

Patch a connection in Anaplan CloudWorks. A patch enables you to update an element (e.g., the name) without providing the entire request body.

#### Request

```bash
curl -X PATCH 'https://api.cloudworks.anaplan.com/2/0/integrations/connections/{connectionId}' \
  -H 'Authorization: AnaplanAuthToken {token_value}' \
  -H 'Content-Type: application/json' \
  -d '{ "{body field}": "{JSON}" }'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

| Parameter | Details |
|-----------|---------|
| `connectionId` | Required. String. The connection ID. Example: `0c3d2f662c1b4c71a02fb4b6f09a40f7` |

#### Request Body

Include the individual JSON field to update. You can provide the entire body if necessary. The call must contain at least one field.

```json
{
  "name": "{name}"
}
```

##### Amazon S3 Fields

| Key | Details |
|-----|---------|
| `name` | Optional. String. Connection name. Must be unique. Example: `test_credentials_1` |
| `accessKeyId` | Optional. String. Amazon S3 Access Key ID. Example: `ALMNW18ERR9QQ89SS00H` |
| `secretAccessKey` | Optional. String. Amazon S3 Secret Access Key. |
| `bucketName` | Optional. String. Amazon S3 Bucket name. Example: `samplebucket` |
| `roleArn` | Optional. String. Amazon S3 Role ARN. Example: `arn:aws:iam::123475742:role/sampleReadOnly` |

##### Azure Blob Fields

| Key | Details |
|-----|---------|
| `storageAccountName` | Required. String. Azure Storage account name. Example: `MyStorageAccount` |
| `sasToken` | Required. String. Shared access token for the Azure Storage container. |
| `containerName` | Required. String. Azure Storage container name. Example: `samplebucket` |

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  }
}
```

---

### Delete a Connection

`DELETE /integrations/connections/{connectionId}`

[Delete a connection](https://help.anaplan.com/anapedia/Content/Data_Integrations/Integrations_framework/Delete-a-connection.htm) to CloudWorks.

#### Request

```bash
curl -X DELETE 'https://api.cloudworks.anaplan.com/2/0/integrations/connections/{connectionId}' \
  -H 'Authorization: AnaplanAuthToken {token_value}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

| Parameter | Details |
|-----------|---------|
| `connectionId` | Required. String. The connection ID. Example: `0c3d2f662c1b4c71a02fb4b6f09a40f7` |

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  }
}
```

---

## Integrations

### Create a New Integration

`POST /integrations`

Create a new integration for Anaplan CloudWorks.

#### Request

```bash
curl -X POST 'https://api.cloudworks.anaplan.com/2/0/integrations' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

None

#### Request Body (Import)

**Note:** For restricted integration users, the workspace ID of the integration must match the workspace ID of the associated connection.

##### Amazon S3

```json
{
  "name": "sample import integration",
  "version": "2.0",
  "workspaceId": "8a80db657068fjef01718955f3b3390b",
  "modelId": "E559BFF3B1GD4RKE874P745BEL259711",
  "nuxVisible": false,
  "jobs": [
    {
      "type": "AmazonS3ToAnaplan",
      "sources": [
        {
          "type": "AmazonS3",
          "connectionId": "0c3d2f662c1b4c71a02fb4b6f09a40f7",
          "file": "sample_file.csv"
        }
      ],
      "targets": [
        {
          "type": "Anaplan",
          "actionId": "112000000011",
          "fileId": "113000000011"
        }
      ]
    }
  ]
}
```

##### Google BigQuery

```json
{
  "name": "test-bq-public-import",
  "version": "2.0",
  "modelId": "ED1CF72660164FD5A83B16A17C8CAE94",
  "workspaceId": "2c9ba1b67b59fdee017ba23f6b7d2701",
  "nuxVisible": false,
  "jobs": [
    {
      "type": "GoogleBigQueryToAnaplan",
      "sources": [
        {
          "type": "GoogleBigQuery",
          "connectionId": "1g5y2f662c1b4c71a02fb496f09a40f7",
          "table": "SKU_import"
        }
      ],
      "targets": [
        {
          "type": "Anaplan",
          "actionId": "112000000117",
          "fileId": "113000000098"
        }
      ]
    }
  ]
}
```

##### Azure Blob

```json
{
  "name": "sample import integration",
  "version": "2.0",
  "workspaceId": "8a80db657068fjef01718955f3b3390b",
  "modelId": "E559BFF3B1GD4RKE874P745BEL259711",
  "nuxVisible": false,
  "jobs": [
    {
      "type": "AzureBlobToAnaplan",
      "sources": [
        {
          "type": "AzureBlob",
          "connectionId": "0c3d2f662c1b4c71a02fb4b6f09a40f7",
          "file": "sample_file.csv"
        }
      ],
      "targets": [
        {
          "type": "Anaplan",
          "actionId": "112000000011",
          "fileId": "113000000011"
        }
      ]
    }
  ]
}
```

#### Request Body (Export)

##### Amazon S3

```json
{
  "name": "sample export integration",
  "version": "2.0",
  "workspaceId": "8a80db657068fjef01718955f3b3390b",
  "modelId": "E559BFF3B1GD4RKE874P745BEL259711",
  "nuxVisible": false,
  "jobs": [
    {
      "type": "AnaplanToAmazonS3",
      "sources": [
        {
          "type": "Anaplan",
          "actionId": "116000000011"
        }
      ],
      "targets": [
        {
          "type": "AmazonS3",
          "connectionId": "0c3d2f662c1b4c71a02fb4b6f09a40f7",
          "file": "exports/",
          "overwrite": true
        }
      ]
    }
  ]
}
```

##### Google BigQuery

```json
{
  "name": "bq export",
  "version": "2.0",
  "modelId": "ED1CF72660164FD5A83B16A17C8CAE94",
  "workspaceId": "2c9ba1b67b59fdee017ba23f6b7d2701",
  "nuxVisible": false,
  "jobs": [
    {
      "type": "AnaplanToGoogleBigQuery",
      "sources": [
        {
          "type": "Anaplan",
          "actionId": "116000000053"
        }
      ],
      "targets": [
        {
          "type": "GoogleBigQuery",
          "table": "SKU_data",
          "connectionId": "0c3d2f662c1b4c71a02fb4b6f09a40f7",
          "overwrite": true
        }
      ],
      "mapping": [
        {"sourceName": "Size", "targetName": "Size"},
        {"sourceName": "SKU_Item", "targetName": "SKU Item"}
      ]
    }
  ]
}
```

##### Azure Blob

```json
{
  "name": "sample export integration",
  "version": "2.0",
  "workspaceId": "8a80db657068fjef01718955f3b3390b",
  "modelId": "E559BFF3B1GD4RKE874P745BEL259711",
  "nuxVisible": false,
  "jobs": [
    {
      "type": "AnaplanToAzureBlob",
      "sources": [
        {
          "type": "Anaplan",
          "actionId": "116000000011"
        }
      ],
      "targets": [
        {
          "type": "AzureBlob",
          "connectionId": "0c3d2f662c1b4c71a02fb4b6f09a40f7",
          "file": "exports/",
          "overwrite": true
        }
      ]
    }
  ]
}
```

#### Version 1.0 Request (Import)

```bash
curl -X POST 'https://api.cloudworks.anaplan.com/1/0/integrations' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

```json
{
  "name": "sample import integration",
  "nuxVisible": false,
  "jobs": [
    {
      "type": "AmazonS3ToAnaplan",
      "sources": [
        {
          "type": "AmazonS3",
          "connectionId": "0c3d2f662c1b4c71a02fb4b6f09a40f7",
          "file": "sample_file.csv"
        }
      ],
      "targets": [
        {
          "type": "Anaplan",
          "actionId": "112000000011",
          "fileId": "113000000011",
          "workspaceId": "8a80db657068fjef01718955f3b3390b",
          "modelId": "E559BFF3B1GD4RKE874P745BEL259711"
        }
      ]
    }
  ]
}
```

#### Version 1.0 Request (Export)

```json
{
  "name": "sample export integration",
  "nuxVisible": false,
  "jobs": [
    {
      "type": "AnaplanToAmazonS3",
      "sources": [
        {
          "type": "Anaplan",
          "actionId": "116000000011",
          "workspaceId": "8a80db657068fjef01718955f3b3390b",
          "modelId": "E559BFF3B1GD4RKE874P745BEL259711"
        }
      ],
      "targets": [
        {
          "type": "AmazonS3",
          "connectionId": "0c3d2f662c1b4c71a02fb4b6f09a40f7",
          "file": "exports/",
          "overwrite": true
        }
      ]
    }
  ]
}
```

#### Request Body Fields

| Key | Details |
|-----|---------|
| `jobs` | Required. Array. Sources and targets. Currently supports one job with one source and one target. |
| `type` (in jobs) | Required. String. Type of integration. Values: `AmazonS3ToAnaplan`, `AnaplanToAmazonS3`, `AnaplanToGoogleBigQuery`, `GoogleBigQueryToAnaplan`, `AzureBlobToAnaplan`, `AnaplanToAzureBlob` |
| `sources` | Required. Array. The location from where the file is transferred. |
| `targets` | Required. Array. The location to where the file is transferred. |
| `connectionId` | Required. String. The ID created when creating a connection. Example: `0c3d2f662c1b4c71a02fb4b6f09a40f7` |
| `type` (in sources/targets) | Required. String. The connection type. Values: `AmazonS3`, `Anaplan`, `GoogleBigQuery`, `AzureBlob` |
| `file` | Required. String. For imports: the file imported into Anaplan. For exports: the folder path. Example: `sample_file.csv` |
| `actionId` | Required. String. The import or export action ID. Example: `112000000011` |
| `fileId` | Required (imports only). String. The file ID of the Anaplan model. Example: `113000000011` |
| `workspaceId` | Required (v2.0 at top level; v1.0 in sources/targets). String. The Anaplan workspace ID. Example: `8a80db657068fjef01718955f3b3390b` |
| `modelId` | Required (v2.0 at top level; v1.0 in sources/targets). String. The Anaplan model ID. Example: `E559BFF3B1GD4RKE874P745BEL259711` |
| `overwrite` | Optional. Boolean. Whether to overwrite the destination file. Default: `false`. |
| `mapping` | Required (Google BigQuery export only). Array. Mapping between Google BigQuery table columns and Anaplan modules/lists. |
| `nuxVisible` | Optional. Boolean. When set, the integration is visible in UX action cards. Default: `false`. |
| `name` | Required. String. Integration name. Must be unique. Example: `test_integration_1` |

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  },
  "integration": {
    "integrationId": "fe40dc5793084f7dbb685cffe6a5ad2a"
  }
}
```

---

### Run an Integration

`POST /integrations/{integrationId}/run`

Run an integration.

#### Request

```bash
curl -X POST 'https://api.cloudworks.anaplan.com/2/0/integrations/{integrationId}/run' \
  -H 'Authorization: AnaplanAuthToken {token_value}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

| Parameter | Details |
|-----------|---------|
| `integrationId` | Required. String. The integration ID. Example: `fe40dc5793084f7dbb685cffe6a5ad2a` |

#### Request Body

None

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  },
  "run": {
    "id": "hy40d89893084f0dkb985cmme9i5io2a"
  }
}
```

---

### Cancel Running Integration

`POST /integrations/{integrationId}/cancel`

Cancel an ongoing integration job.

#### Request

```bash
curl -X POST 'https://api.cloudworks.anaplan.com/2/0/integrations/{integrationId}/cancel' \
  -H 'Authorization: AnaplanAuthToken {token_value}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

| Parameter | Details |
|-----------|---------|
| `integrationId` | Required. String. The integration ID. Example: `56c122362f9d4a69bdca922252575065` |

#### Request Body

None

#### Response

```json
{
  "success": true,
  "message": {
    "integration_id": "56c122362f9d4a69bdca922252575065",
    "state": "cancelled"
  }
}
```

---

### Get All Integrations

`GET /integrations`

Retrieve all your integrations.

#### Request

```bash
curl -X GET 'https://api.cloudworks.anaplan.com/2/0/integrations' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

| Parameter | Details |
|-----------|---------|
| `offset` | Optional. Number. Items to skip before collecting results. First element is 0. Example: `0` |
| `limit` | Optional. Number. Number of elements to return. Example: `10` |
| `myIntegrations` | Optional. Number. If `1`, returns only current user's integrations. |

**Note:** If `offset` and `limit` are not provided, defaults to 25 integrations.

#### Request Body

None

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  },
  "integrations": [
    {
      "integrationId": "fe40dc5793084f7dbb685cffe6a5ad2aa",
      "name": "sample import integration",
      "createdBy": "John Smith",
      "creationDate": "2020-09-29T01:31:16.000Z",
      "modificationDate": "2020-09-29T01:31:26.000Z",
      "modifiedBy": "John Smith",
      "latestRun": {
        "triggeredBy": "John Smith",
        "startDate": "2020-09-28T23:09:31.000Z",
        "endDate": "2020-09-28T23:13:07.000Z",
        "success": true,
        "message": "Success",
        "executionErrorCode": null
      },
      "notificationId": "a72d86ac0a9c454aa8baf67c1db67486",
      "nuxVisible": false
    },
    {
      "integrationId": "4caad0c1b91545d983cb6a2bb62d755e",
      "name": "sample process integration",
      "processId": "118000000001",
      "createdBy": "John Smith",
      "creationDate": "2021-01-29T01:31:16.000Z",
      "modificationDate": "2021-01-29T01:31:26.000Z",
      "modifiedBy": "John Smith",
      "latestRun": {
        "triggeredBy": "John Smith",
        "startDate": "2021-01-29T23:09:31.000Z",
        "endDate": "2021-01-29T23:13:07.000Z",
        "success": true,
        "message": "Success",
        "executionErrorCode": null
      },
      "notificationId": "37945d3f7543463a859949e690dc4b60",
      "nuxVisible": false
    }
  ],
  "meta": {
    "paging": {
      "currentPageSize": 2,
      "totalSize": 2,
      "offset": 0
    },
    "schema": "https://api.anaplan.com/cloudworks/2/0/integrations/objects/integrations"
  }
}
```

---

### Get Integration by Integration ID

`GET /integrations/{integrationId}`

Get details for a specific integration.

#### Request

```bash
curl -X GET 'https://api.cloudworks.anaplan.com/2/0/integrations/{integrationId}' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

| Parameter | Details |
|-----------|---------|
| `integrationId` | Required. String. The integration ID. Example: `fe40dc5793084f7dbb685cffe6a5ad2a` |

#### Request Body

None

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  },
  "integration": {
    "jobs": [
      {
        "sources": [
          {
            "connectionId": "0c3d2f662c1b4c71a02fb4b6f09a40f7",
            "type": "AmazonS3",
            "file": "sample_file.csv"
          }
        ],
        "targets": [
          {
            "type": "Anaplan",
            "actionId": "112000000011",
            "fileId": "113000000011"
          }
        ],
        "type": "AmazonS3ToAnaplan"
      }
    ],
    "name": "sample import integration",
    "integrationId": "fe40dc57-9308-4f7d-bb68-5cffe6a5ad2aa",
    "workspaceId": "8a80db657068fjef01718955f3b3390b",
    "modelId": "E559BFF3B1GD4RKE874P745BEL259711",
    "createdBy": "John Smith",
    "creationDate": "2020-09-28T23:08:24.000Z",
    "modificationDate": "2020-09-28T23:08:26.000Z",
    "modifiedBy": "None",
    "latestRun": {
      "triggeredBy": "John Smith",
      "startDate": "2020-09-28T23:09:31.000Z",
      "endDate": "2020-09-28T23:13:07.000Z",
      "success": true,
      "message": "Success",
      "executionErrorCode": null
    },
    "notificationId": "a72d86ac0a9c454aa8baf67c1db67486",
    "nuxVisible": false
  },
  "meta": {
    "schema": "https://api.cloudworks.anaplan.com//0/integrations/objects/integration"
  }
}
```

---

### Get Integrations by Model ID

`GET /integrations/anaplanModels/{modelId}`

Get all integrations for an Anaplan model.

#### Request

```bash
curl -X GET 'https://api.cloudworks.anaplan.com/2/0/integrations/anaplanModels/{modelId}' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {token_value}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

| Parameter | Details |
|-----------|---------|
| `modelId` | Required. String. Anaplan model ID. Example: `E559BFF3B1GD4RKE874P745BEL259711` |

#### Request Body

None

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  },
  "integrations": [
    {
      "jobs": [
        {
          "sources": [
            {
              "connectionId": "0c3d2f662c1b4c71a02fb4b6f09a40f7",
              "type": "AmazonS3",
              "file": "sample_file.csv"
            }
          ],
          "targets": [
            {
              "type": "Anaplan",
              "actionId": "112000000011",
              "fileId": "113000000011"
            }
          ],
          "type": "AmazonS3ToAnaplan"
        }
      ],
      "name": "sample import integration",
      "integrationId": "fe40dc5793084f7dbb685cffe6a5ad2aa",
      "workspaceId": "8a80db657068fjef01718955f3b3390b",
      "modelId": "E559BFF3B1GD4RKE874P745BEL259711",
      "createdBy": "John Smith",
      "creationDate": "2020-09-26T04:21:51.000Z",
      "modificationDate": "2020-09-26T04:21:51.000Z",
      "modifiedBy": "None",
      "latestRun": {
        "triggeredBy": "John Smith",
        "startDate": "2020-09-02T06:39:08.000Z",
        "endDate": "2020-09-02T06:40:18.000Z",
        "success": true,
        "message": "Success",
        "executionErrorCode": null
      },
      "schedule": {
        "name": "test-schedule",
        "time": "22:00",
        "type": "monthly_specific_day",
        "endDate": "2020-12-01",
        "timezone": "Europe/Paris",
        "startDate": "2020-09-03",
        "dayOfMonth": 11,
        "status": "Active"
      },
      "notificationId": "a72d86ac0a9c454aa8baf67c1db67486",
      "nuxVisible": false
    }
  ],
  "meta": {
    "paging": {
      "currentPageSize": 1,
      "totalSize": 1,
      "offset": 0
    },
    "schema": "https://api.cloudworks.anaplan.com/2/0/integrations/objects/model"
  }
}
```

---

### Edit an Integration

`PUT /integrations/{integrationId}`

Edit an integration (import or export) for CloudWorks.

#### Request

```bash
curl -X PUT 'https://api.cloudworks.anaplan.com/2/0/integrations/{integrationId}' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

| Parameter | Details |
|-----------|---------|
| `integrationId` | Required. String. The integration ID. Example: `fe40dc5793084f7dbb685cffe6a5ad2a` |

#### Request Body (Import)

**Note:** For restricted integration users, the workspace ID of the integration must match the workspace ID of the associated connection.

```json
{
  "name": "sample import integration updated",
  "workspaceId": "8a80db657068fjef01718955f3b3390b",
  "modelId": "E559BFF3B1GD4RKE874P745BEL259711",
  "version": "2.0",
  "nuxVisible": false,
  "jobs": [
    {
      "type": "AmazonS3ToAnaplan",
      "sources": [
        {
          "type": "AmazonS3",
          "connectionId": "0c3d2f662c1b4c71a02fb4b6f09a40f7",
          "file": "sample_file.csv"
        }
      ],
      "targets": [
        {
          "type": "Anaplan",
          "actionId": "112000000011",
          "fileId": "113000000011"
        }
      ]
    }
  ]
}
```

#### Request Body Fields

| Key | Details |
|-----|---------|
| `jobs` | Required. Array. Sources and targets. Currently supports one job with one source and one target. |
| `type` (in jobs) | Required. String. Type of integration. Values: `AmazonS3ToAnaplan`, `AnaplanToAmazonS3`, `AzureBlobToAnaplan`, `AnaplanToAzureBlob` |
| `sources` | Required. Array. The location from where the file is transferred. |
| `targets` | Required. Array. The location to where the file is transferred. |
| `connectionId` | Required. String. The connection ID. Example: `0c3d2f66-2c1b-4c71-a02f-b4b6f09a40f7` |
| `type` (in sources/targets) | Required. String. The connection type. Values: `AmazonS3`, `Anaplan`, `GoogleBigQuery`, `AzureBlob` |
| `file` | Required. String. For imports: the file. For exports: the folder path. Example: `sample_file.csv` |
| `actionId` | Required. String. Import or export action ID. Example: `112000000011` |
| `fileId` | Required (imports only). String. File ID of the Anaplan model. Example: `113000000011` |
| `workspaceId` | Required (imports). String. Anaplan workspace ID. Example: `8a80db657068fjef01718955f3b3390b` |
| `modelId` | Required (imports). String. Anaplan model ID. Example: `E559BFF3B1GD4RKE874P745BEL259711` |
| `overwrite` | Optional. Boolean. Overwrite the destination file. Default: `false`. |
| `nuxVisible` | Optional. Boolean. Visible in UX action cards. Default: `false`. |
| `name` | Required. String. Integration name. Must be unique. Example: `test_integration_1` |

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  }
}
```

---

### Delete an Integration

`DELETE /integrations/{integrationId}`

Delete an integration in CloudWorks.

#### Request

```bash
curl -X DELETE 'https://api.cloudworks.anaplan.com/2/0/integrations/{integrationId}' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

| Parameter | Details |
|-----------|---------|
| `integrationId` | Required. String. The integration ID. Example: `fe40dc5793084f7dbb685cffe6a5ad2a` |

#### Request Body

None

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  }
}
```

---

## Process Integrations

### Create a Process Integration

`POST /integrations`

Create a process integration in CloudWorks using version 2.0.

#### Request

```bash
curl -X POST 'https://api.cloudworks.anaplan.com/2/0/integrations' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

None

**Note:** A process integration with version 2.0 can contain zero or more jobs. Include only those import/export actions in the `jobs` section that are associated with the Amazon S3 file.

#### Request Body (Process)

```json
{
  "name": "sample process integration",
  "version": "2.0",
  "processId": "118000000001",
  "workspaceId": "8b90db657068fjef01718955f3b3390b",
  "modelId": "E229BFF3B1GD4RKE874P745BEL259711",
  "nuxVisible": false,
  "jobs": [
    {
      "type": "AmazonS3ToAnaplan",
      "sources": [
        {
          "type": "AmazonS3",
          "connectionId": "0c3d2f662c1b4c71a02fb4b6f09a40f7",
          "file": "sample_file_1.csv"
        }
      ],
      "targets": [
        {
          "type": "Anaplan",
          "actionId": "112000000011",
          "fileId": "113000000011"
        }
      ]
    },
    {
      "type": "AnaplanToAmazonS3",
      "sources": [
        {
          "type": "Anaplan",
          "actionId": "116000000000"
        }
      ],
      "targets": [
        {
          "type": "AmazonS3",
          "connectionId": "0d3d2f662c1b4c71a02fb4b6f09a40f7",
          "file": "Exports/"
        }
      ]
    }
  ]
}
```

You can also create an integration where the Anaplan Process does not contain any actions associated with an Amazon S3 file (e.g., a process containing only model-to-model import actions and delete actions):

```json
{
  "name": "sample process integration2",
  "version": "2.0",
  "processId": "118000000001",
  "workspaceId": "8b90db657068fjef01718955f3b3390b",
  "modelId": "E229BFF3B1GD4RKE874P745BEL259711"
}
```

#### Version 1.0 Request (Process)

```bash
curl -X POST 'https://api.cloudworks.anaplan.com/1/0/integrations' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

**Note:** Process integration with v1.0 can contain one or more jobs. Include only actions associated with the Amazon S3 file. The first job runs an import, the second runs an export.

```json
{
  "name": "sample process integration",
  "processId": "118000000001",
  "nuxVisible": false,
  "jobs": [
    {
      "type": "AmazonS3ToAnaplan",
      "sources": [
        {
          "type": "AmazonS3",
          "connectionId": "0c3d2f662c1b4c71a02fb4b6f09a40f7",
          "file": "sample_file_1.csv"
        }
      ],
      "targets": [
        {
          "type": "Anaplan",
          "actionId": "112000000011",
          "fileId": "113000000011",
          "workspaceId": "8b90db657068fjef01718955f3b3390b",
          "modelId": "E229BFF3B1GD4RKE874P745BEL259711"
        }
      ]
    },
    {
      "type": "AnaplanToAmazonS3",
      "sources": [
        {
          "type": "Anaplan",
          "actionId": "116000000000",
          "workspaceId": "8b90db657068fjef01718955f3b3390b",
          "modelId": "E229BFF3B1GD4RKE874P745BEL259711"
        }
      ],
      "targets": [
        {
          "type": "AmazonS3",
          "connectionId": "0d3d2f662c1b4c71a02fb4b6f09a40f7",
          "file": "Exports/"
        }
      ]
    }
  ]
}
```

#### Request Body Fields

| Key | Details |
|-----|---------|
| `jobs` | Required. Array. Sources and targets. |
| `processId` | Required. String. Anaplan process ID. |
| `type` (in jobs) | Required. String. Type of integration. Values: `AmazonS3ToAnaplan`, `AnaplanToAmazonS3`, `AzureBlobToAnaplan`, `AnaplanToAzureBlob` |
| `sources` | Required. Array. The source location. |
| `targets` | Required. Array. The target location. Example: `{ "type": "AmazonS3", "connectionId": "0c3d2f662c1b4c71a02fb4b6f09a40f7", "file": "exports/", "overwrite": true }` |
| `connectionId` | Required. String. The connection ID. Example: `0c3d2f662c1b4c71a02fb4b6f09a40f7` |
| `type` (in sources/targets) | Required. String. The connection type. Values: `AmazonS3`, `Anaplan`, `AzureBlob` |
| `file` | Required. String. For imports: the file. For exports: the folder path. Example: `sample_file.csv` |
| `actionId` | Required. String. Import or export action ID. Example: `112000000011` |
| `fileId` | Required (imports only). String. File ID of Anaplan model. Example: `113000000011` |
| `workspaceId` | Required. String. Anaplan workspace ID. Example: `8b90db657068fjef01718955f3b3390b` |
| `modelId` | Required. String. Anaplan model ID. Example: `E229BFF3B1GD4RKE874P745BEL259711` |
| `overwrite` | Optional. Boolean. Default: `false`. Overwrite the destination file. |
| `version` | Required. String. CloudWorks API version. Example: `2.0` |
| `nuxVisible` | Optional. Boolean. Visible in UX action cards. Default: `false`. |
| `name` | Required. String. Integration name. Must be unique. Example: `test_integration_1` |

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  },
  "integration": {
    "integrationId": "4caad0c1b91545d983cb6a2bb62d755e"
  }
}
```

---

### Edit a Process Integration

`PUT /integrations/{integrationId}`

Edit a process integration using version 2.0.

#### Request

```bash
curl -X PUT 'https://api.cloudworks.anaplan.com/2/0/integrations/{integrationId}' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

| Parameter | Details |
|-----------|---------|
| `integrationId` | Required. String. The integration ID. Example: `4caad0c1b91545d983cb6a2bb62d755e` |

#### Request Body (Process)

```json
{
  "name": "sample process integration updated",
  "processId": "118000000001",
  "version": "2.0",
  "workspaceId": "8b90db657068fjef01718955f3b3390b",
  "modelId": "E229BFF3B1GD4RKE874P745BEL259711",
  "nuxVisible": false,
  "jobs": [
    {
      "type": "AmazonS3ToAnaplan",
      "sources": [
        {
          "type": "AmazonS3",
          "connectionId": "0c3d2f662c1b4c71a02fb4b6f09a40f7",
          "file": "sample_file_updated.csv"
        }
      ],
      "targets": [
        {
          "type": "Anaplan",
          "actionId": "112000000011",
          "fileId": "113000000011"
        }
      ]
    },
    {
      "type": "AnaplanToAmazonS3",
      "sources": [
        {
          "type": "Anaplan",
          "actionId": "116000000000"
        }
      ],
      "targets": [
        {
          "type": "AmazonS3",
          "connectionId": "0d3d2f662c1b4c71a02fb4b6f09a40f7",
          "file": "Exports/"
        }
      ]
    }
  ]
}
```

#### Version 1.0 Request

```bash
curl -X PUT 'https://api.cloudworks.anaplan.com/1/0/integrations/{integrationId}' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

```json
{
  "name": "sample process integration updated",
  "processId": "118000000001",
  "nuxVisible": false,
  "jobs": [
    {
      "type": "AmazonS3ToAnaplan",
      "sources": [
        {
          "type": "AmazonS3",
          "connectionId": "0c3d2f662c1b4c71a02fb4b6f09a40f7",
          "file": "sample_file_updated.csv"
        }
      ],
      "targets": [
        {
          "type": "Anaplan",
          "actionId": "112000000011",
          "fileId": "113000000011",
          "workspaceId": "8b90db657068fjef01718955f3b3390b",
          "modelId": "E229BFF3B1GD4RKE874P745BEL259711"
        }
      ]
    },
    {
      "type": "AnaplanToAmazonS3",
      "sources": [
        {
          "type": "Anaplan",
          "actionId": "116000000000",
          "workspaceId": "8b90db657068fjef01718955f3b3390b",
          "modelId": "E229BFF3B1GD4RKE874P745BEL259711"
        }
      ],
      "targets": [
        {
          "type": "AmazonS3",
          "connectionId": "0d3d2f662c1b4c71a02fb4b6f09a40f7",
          "file": "Exports/"
        }
      ]
    }
  ]
}
```

#### Request Body Fields

| Key | Details |
|-----|---------|
| `jobs` | Required. Array. Sources and targets. |
| `processId` | Required. String. Anaplan process ID. |
| `type` (in jobs) | Required. String. Type of integration. Values: `AmazonS3ToAnaplan`, `AnaplanToAmazonS3` |
| `sources` | Required. Array. Source location. |
| `targets` | Required. Array. Target location. |
| `connectionId` | Required. String. Connection ID. Example: `0c3d2f662c1b4c71a02fb4b6f09a40f7` |
| `type` (in sources/targets) | Required. String. Connection type. Values: `AmazonS3`, `Anaplan` |
| `file` | Required. String. Folder path. Example: `sample_file.csv` |
| `actionId` | Required. String. Import or export action ID. Example: `112000000011` |
| `fileId` | Required (imports only). String. File ID. Example: `113000000011` |
| `workspaceId` | Required. String. Workspace ID. Example: `8b90db657068fjef01718955f3b3390b` |
| `modelId` | Required. String. Model ID. Example: `E229BFF3B1GD4RKE874P745BEL259711` |
| `overwrite` | Optional. Boolean. Default: `false`. |
| `version` | Required. String. CloudWorks API version. Example: `'2.0'` |
| `nuxVisible` | Optional. Boolean. Default: `false`. |
| `name` | Required. String. Integration name. Must be unique. |

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  }
}
```

---

## Schedules

### Set the Status of an Integration Schedule

`POST /integrations/{integrationId}/schedule/status/{status}`

Set the status of a scheduled integration.

#### Request

```bash
curl -X POST 'https://api.cloudworks.anaplan.com/2/0/integrations/{integrationId}/schedule/status/{status}' \
  -H 'Authorization: AnaplanAuthToken {token_value}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

| Parameter | Details |
|-----------|---------|
| `integrationId` | Required. String. The integration ID. Example: `fe40dc5793084f7dbb685cffe6a5ad2a` |
| `status` | Required. String. The schedule status. Example: `enabled` |

#### Request Body

None

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  }
}
```

---

### Create an Integration Schedule

`POST /integrations/{integrationId}/schedule`

Create an integration schedule. Supports a maximum of one schedule per integration.

#### Request

```bash
curl -X POST 'https://api.cloudworks.anaplan.com/2/0/integrations/{integrationId}/schedule' \
  -H 'Authorization: AnaplanAuthToken {token_value}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {token_value}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

| Parameter | Details |
|-----------|---------|
| `integrationId` | Required. String. The integration ID. Example: `fe40dc5793084f7dbb685cffe6a5ad2a` |

#### Request Body by Schedule Type

##### weekly - Runs on specific days of the week

```json
{
  "integrationId": "fe40dc5793084f7dbb685cffe6a5ad2a",
  "schedule": {
    "name": "test schedule",
    "type": "weekly",
    "time": "12:45",
    "daysOfWeek": [0, 6],
    "startDate": "2020-07-03",
    "endDate": "2020-12-01",
    "timezone": "Europe/Paris"
  }
}
```

##### monthly_specific_day - Runs on a specific day of the month

```json
{
  "integrationId": "fe40dc5793084f7dbb685cffe6a5ad2a",
  "schedule": {
    "name": "test schedule",
    "type": "monthly_specific_day",
    "dayOfMonth": 12,
    "time": "22:00",
    "startDate": "2020-09-03",
    "endDate": "2020-12-01",
    "timezone": "Europe/Paris"
  }
}
```

##### monthly_relative_weekday - Runs on a day of the week relative to the start of the month

```json
{
  "integrationId": "fe40dc5793084f7dbb685cffe6a5ad2a",
  "schedule": {
    "name": "test schedule",
    "type": "monthly_relative_weekday",
    "time": "12:45",
    "dayOfWeek": 3,
    "repeatEvery": 2,
    "startDate": "2020-07-03",
    "endDate": "2020-12-01",
    "timezone": "Europe/Paris"
  }
}
```

##### hourly - Runs on specific days, each hour, between start and end hour

```json
{
  "integrationId": "fe40dc5793084f7dbb685cffe6a5ad2a",
  "schedule": {
    "name": "test schedule",
    "type": "hourly",
    "repeatEvery": 2,
    "fromTime": "20:00",
    "toTime": "23:20",
    "daysOfWeek": [0, 6],
    "startDate": "2020-07-03",
    "endDate": "2020-12-01",
    "timezone": "Europe/Paris"
  }
}
```

##### daily - Runs each day at a specified time

```json
{
  "integrationId": "fe40dc5793084f7dbb685cffe6a5ad2a",
  "schedule": {
    "name": "test schedule",
    "type": "daily",
    "time": "11:55",
    "startDate": "2020-07-03",
    "endDate": "2020-12-01",
    "timezone": "Europe/Paris"
  }
}
```

#### Schedule Fields

| Key | Details |
|-----|---------|
| `name` | Required. String. Name of schedule. Example: `test-schedule` |
| `type` | Required. String. Schedule type. Values: `monthly_specific_day`, `monthly_relative_weekday`, `hourly`, `weekly`, `daily` |
| `dayOfMonth` | Required (`monthly_specific_day`). Integer. Day of the month (1-31). Example: `12` |
| `daysOfWeek` | Required (`weekly`, `hourly`, `monthly_relative_weekday`). Array. Days of the week (Sunday = 0). Example: `[0, 6]` |
| `repeatEvery` | Required (`monthly_relative_weekday`, `hourly`). Integer. Repeat interval. Example: `2` (every second Wednesday if type is `monthly_relative_weekday`) |
| `time` | Required. String. Schedule time. Example: `22:00` |
| `fromTime` | Required (`hourly`). String. Start time. Example: `20:00` |
| `toTime` | Required (`hourly`). String. End time. Example: `23:20` |
| `startDate` | Required. String. Start date (YYYY-MM-DD). Example: `2020-09-03` |
| `endDate` | Optional. String. End date (YYYY-MM-DD). Example: `2020-12-01` |
| `timezone` | Required. String. Timezone. Example: `Europe/Paris` |

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  },
  "scheduledIntegration": {
    "id": "0995f32adf2443a9b2420739cedc17f9"
  }
}
```

---

### Update the Schedule of an Integration

`PUT /integrations/{integrationId}/schedule`

Update the schedule of an integration.

#### Request

```bash
curl -X PUT 'https://api.cloudworks.anaplan.com/2/0/integrations/{integrationId}/schedule' \
  -H 'Authorization: AnaplanAuthToken {token_value}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

| Parameter | Details |
|-----------|---------|
| `integrationId` | Required. String. The integration ID. Example: `fe40dc5793084f7dbb685cffe6a5ad2a` |

#### Request Body

Same as [Create an Integration Schedule](#request-body-by-schedule-type) - uses the same schedule types and fields.

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  }
}
```

---

### Delete an Integration Schedule

`DELETE /integrations/{integrationId}/schedule`

Delete an integration schedule.

#### Request

```bash
curl -X DELETE 'https://api.cloudworks.anaplan.com/2/0/integrations/{integrationId}/schedule' \
  -H 'Authorization: AnaplanAuthToken {token_value}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

| Parameter | Details |
|-----------|---------|
| `integrationId` | Required. String. The integration ID. Example: `fe40dc5793084f7dbb685cffe6a5ad2a` |

#### Request Body

None

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  }
}
```

---

## History

### Get History of Integration Runs

`GET /integrations/runs/{integrationId}`

Get the integration run history.

#### Request

```bash
curl -X GET 'https://api.cloudworks.anaplan.com/2/0/integrations/runs/{integrationId}' \
  -H 'Authorization: AnaplanAuthToken {token_value}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

| Parameter | Details |
|-----------|---------|
| `offset` | Required. Number. Items to skip. First element is 0. Example: `0` |
| `limit` | Required. Number. Number of elements to return. Example: `2` |
| `integrationId` | Required. String. The integration ID. Example: `fe40dc5793084f7dbb685cffe6a5ad2a` |

#### Request Body

None

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  },
  "history_of_runs": {
    "integrationId": "fe40dc57-9308-4f7d-bb68-5cffe6a5ad2a",
    "name": "sample import integration",
    "schedule": null,
    "workspaceId": "8a80db657068fjef01718955f3b3390b",
    "modelId": "E559BFF3B1GD4RKE874P745BEL259711",
    "creationDate": "2020-09-28T23:08:24.000Z",
    "modificationDate": "2020-09-28T23:08:26.000Z",
    "createdBy": "John Smith",
    "modifiedBy": "None",
    "status": 1,
    "notificationId": "a72d86ac0a9c454aa8baf67c1db67486",
    "runs": [
      {
        "id": "hy40d89893084f0dkb985cmme9i5io2a",
        "triggeredBy": "John Smith",
        "lastRun": "2020-09-28T23:09:31.000Z",
        "startDate": "2020-09-28T23:09:31.000Z",
        "endDate": "2020-09-28T23:13:07.000Z",
        "success": true,
        "message": "Success",
        "executionErrorCode": null
      }
    ],
    "totalRuns": 1
  },
  "meta": {
    "schema": "https://api.cloudworks.anaplan.com/2/0/integrations/objects/runs"
  }
}
```

---

### Get Integration Run Errors

`GET /integrations/runerror/{runId}`

Review error messages from an integration run.

#### Request

```bash
curl -X GET 'https://api.cloudworks.anaplan.com/2/0/integrations/runerror/{runId}' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

| Parameter | Details |
|-----------|---------|
| `runId` | Required. String. The run ID. Example: `hy40d89893084f0dkb98-5cmme9i5io2a` |

#### Request Body

None

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  },
  "runs": [
    {
      "id": "hy40d89893084f0dkb985cmme9i5io2a",
      "errorMessages": [
        {
          "errorMessage": [
            {
              "localMessageText": "test e2e: 13 (0/13) rows successful, 0 (0/0) rows has warnings, 2 failed, 0 ignored",
              "occurrences": 0,
              "type": "hierarchyRowsProcessedWithFailures",
              "values": []
            }
          ],
          "actionId": "112000000011",
          "actionName": "sample import action",
          "failureDumpGenerated": true
        }
      ],
      "taskId": "F4AF7C7C03C145D6A2CDC6E194EFB392",
      "creationDate": "2020-09-29T04:05:12.000Z",
      "modificationDate": "2020-09-29T04:05:12.000Z",
      "createdBy": "John Smith",
      "modifiedBy": "None"
    }
  ],
  "meta": {
    "schema": "https://api.cloudworks.anaplan.com/2/0/integrations/objects/runerror"
  }
}
```

**Note:** The `taskId` is the identifier for a specific import or export task.

---

### Get Run Status

`GET /integrations/run/{runId}`

Get the status of a specific integration run.

#### Request

```bash
curl -X GET 'https://api.cloudworks.anaplan.com/2/0/integrations/run/{runId}' \
  -H 'Authorization: AnaplanAuthToken {token_value}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

| Parameter | Details |
|-----------|---------|
| `runId` | Required. String. The run ID. Example: `hy40d89893084f0dkb985cmme9i5io2a` |

#### Request Body

None

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  },
  "run": {
    "id": "hy40d89893084f0dkb98-5cmme9i5io2a",
    "integrationId": "fe40dc5793084f7dbb68-5cffe6a5ad2a",
    "startDate": "2020-09-29T04:05:20.000Z",
    "endDate": "2020-09-29T04:05:25.000Z",
    "success": true,
    "message": "Success",
    "creationDate": "2020-09-29T04:05:12.000Z",
    "modificationDate": "2020-09-29T04:05:15.000Z",
    "createdBy": "John Smith",
    "modifiedBy": "John Smith",
    "executionErrorCode": null
  },
  "meta": {
    "schema": "https://api.cloudworks.anaplan.com/2/0/integrations/objects/run"
  }
}
```

**Note:** If the `success` parameter is `false`, contact Anaplan support with the `executionErrorCode` value to diagnose the root cause.

---

## Notification Configurations

### Get a Notification Configuration

`GET /integrations/notification/{notificationId}`

Get notification configuration details.

#### Request

```bash
curl -X GET 'https://api.cloudworks.anaplan.com/2/0/integrations/notification/{notificationId}' \
  -H 'Authorization: AnaplanAuthToken {token_value}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

None

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  },
  "notifications": {
    "notificationId": "067d1426ac964a7cac871c87790c4555",
    "integrationIds": [
      "214a2ac51e5a479aafd49e9228334515"
    ],
    "channels": [
      "email",
      "in_app"
    ],
    "notifications": {
      "config": [
        {
          "type": "success",
          "users": [
            {
              "userGuid": "2c9ba1b6729b7fd80172c3f635db40f7",
              "firstName": "John",
              "lastName": "Smith"
            }
          ]
        },
        {
          "type": "partial_failure",
          "users": [
            {
              "userGuid": "2c9ba1b6729b7fd80172c3f635db40f7",
              "firstName": "John",
              "lastName": "Smith"
            }
          ]
        },
        {
          "type": "full_failure",
          "users": [
            {
              "userGuid": "2c9ba1b6729b7fd80172c3f635db40f7",
              "firstName": "John",
              "lastName": "Smith"
            }
          ]
        }
      ]
    }
  },
  "meta": {
    "schema": "https://api.cloudworks.anaplan.com/2/0/integrations/objects/notification"
  }
}
```

---

### Create a Notification Configuration

`POST /integrations/notification`

Configure a new integration notification.

#### Request

```bash
curl -X POST 'https://api.cloudworks.anaplan.com/2/0/integrations/notification' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

None

#### Request Body

```json
{
  "integrationIds": [
    "214a2ac51e5a479aafd49e9228334515"
  ],
  "channels": [
    "email",
    "in_app"
  ],
  "notifications": {
    "config": [
      {
        "type": "success",
        "users": [
          "2c9ba1b6729b7fd80172c3f635db40f7"
        ]
      },
      {
        "type": "full_failure",
        "users": [
          "2c9ba1b6729b7fd80172c3f635db40f7"
        ]
      },
      {
        "type": "partial_failure",
        "users": [
          "2c9ba1b6729b7fd80172c3f635db40f7"
        ]
      }
    ]
  }
}
```

#### Request Body Fields

| Key | Details |
|-----|---------|
| `integrationIds` | Required. Array. Integration ID(s) for the notification. Currently supports a single ID. Example: `["214a2ac51e5a479aafd49e9228334515"]` |
| `channels` | Required. Array. Notification channels. Example: `["email", "in_app"]` |
| `config` | Required. Array. Consists of `type` and `users`. Example: `[{"type": "success", "users": ["2c9ba1b6729b7fd80172c3f635db40f7"]}]` |
| `type` (in config) | Required. String. Integration completion status to notify on. Values: `success`, `full_failure`, `partial_failure` |
| `users` (in config) | Required. Array. User GUIDs (limit 5 per type). Example: `2c9ba1b6729b7fd80172c3f635db40f7` |

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  },
  "notification": {
    "notificationId": "37945d3f7543463a859949e690dc4b60"
  }
}
```

---

### Edit a Notification Configuration

`PUT /integrations/notification/{notificationId}`

Edit the configuration of an integration notification.

#### Request

```bash
curl -X PUT 'https://api.cloudworks.anaplan.com/2/0/integrations/notification/{notificationId}' \
  -H 'Authorization: AnaplanAuthToken {token_value}' \
  -H 'Content-Type: application/json' \
  -d '{request body}'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

| Parameter | Details |
|-----------|---------|
| `notificationId` | Required. String. The notification ID. Example: `067d1426ac964a7cac871c87790c4555` |

#### Request Body

```json
{
  "integrationIds": [
    "214a2ac51e5a479aafd49e9228334515"
  ],
  "channels": [
    "email",
    "in_app"
  ],
  "notifications": {
    "config": [
      {
        "type": "success",
        "users": [
          "2c9ba1b6729b7fd80172c3f635db40f7"
        ]
      },
      {
        "type": "full_failure",
        "users": [
          "2c9ba1b6729b7fd80172c3f635db40f7"
        ]
      },
      {
        "type": "partial_failure",
        "users": [
          "2c9ba1b6729b7fd80172c3f635db40f7"
        ]
      }
    ]
  }
}
```

#### Request Body Fields

| Key | Details |
|-----|---------|
| `integrationIds` | Required. Array. Integration ID(s). Example: `["214a2ac51e5a479aafd49e9228334515"]` |
| `channels` | Required. Array. Notification channels. Example: `["email", "in_app"]` |
| `config` | Required. Array. Consists of `type` and `users`. |
| `type` (in config) | Required. String. Values: `success`, `full_failure`, `partial_failure` |
| `users` (in config) | Required. Array. User GUIDs (limit 5 per type). Example: `2c9ba1b6729b7fd80172c3f635db40f7` |

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  }
}
```

---

### Delete a Notification Configuration

`DELETE /integrations/notification/{notificationId}`

Delete an integration notification.

#### Request

```bash
curl -X DELETE 'https://api.cloudworks.anaplan.com/2/0/integrations/notification/{notificationId}' \
  -H 'Authorization: AnaplanAuthToken {token_value}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

| Parameter | Details |
|-----------|---------|
| `notificationId` | Required. String. The notification ID. Example: `067d1426ac964a7cac871c87790c4555` |

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  }
}
```

---

## Error Logs

### Get an Import Error Log

`GET /integrations/run/{runId}/dumps`

Get an import error log.

#### Request

```bash
curl -X GET 'https://api.cloudworks.anaplan.com/2/0/integrations/run/{runId}/dumps' \
  -H 'Authorization: AnaplanAuthToken {token_value}' \
  -H 'Content-Type: application/json'
```

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  }
}
```

Example dump file (error log):

```csv
"Demo List","name","email","planet","_Line_","_Error_1_"
"a","","junk","","2","Invalid number: junk"
"b","","twelve","","3","Invalid number: twelve"
"c","eight","","","4","Invalid number: eight"
"d","night","","","5","Invalid number: night"
```

---

### Get a Process Error Log

`GET /integrations/run/{runId}/process/import/{actionId}/dumps`

Get a process error log.

#### Request

```bash
curl -X GET 'https://api.cloudworks.anaplan.com/2/0/integrations/run/{runId}/process/import/{actionId}/dumps' \
  -H 'Authorization: AnaplanAuthToken {token_value}' \
  -H 'Content-Type: application/json'
```

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  }
}
```

Example dump file (error log):

```csv
"Demo List","name","email","planet","_Line_","_Error_1_"
"a","","junk","","2","Invalid number: junk"
"b","","twelve","","3","Invalid number: twelve"
"c","eight","","","4","Invalid number: eight"
"d","night","","","5","Invalid number: night"
```

---

## Integration Flows

### Create a New Integration Flow

`POST /integrationflows`

Create a new integration flow for Anaplan CloudWorks.

#### Request

```bash
curl -X POST 'https://api.cloudworks.anaplan.com/2/0/integrationflows' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

None

#### Request Body

```json
{
  "name": "test-integration-flow-name",
  "version": "2.0",
  "type": "IntegrationFlow",
  "steps": [
    {
      "type": "Integration",
      "referrer": "step_integration_id_1",
      "isSkipped": false,
      "exceptionBehavior": [
        {
          "type": "failure",
          "strategy": "stop"
        }
      ]
    },
    {
      "type": "Integration",
      "referrer": "step_integration_id_2",
      "dependsOn": [
        "step_integration_id_1"
      ],
      "isSkipped": false,
      "exceptionBehavior": [
        {
          "type": "failure",
          "strategy": "stop"
        }
      ]
    }
  ]
}
```

#### Request Body Fields

| Key | Details |
|-----|---------|
| `name` | Required. String. Name of the integration flow. |
| `version` | Required. String. Resource schema version. Example: `2.0` |
| `type` | Required. String. Type of resource. Value: `IntegrationFlow` |
| `steps` | Required. Array. Step details. Minimum 2 items. |
| `referrer` (in steps) | Required. String. The step integration ID. |
| `dependsOn` (in steps) | Required. Array. Step IDs this step depends on. E.g., step 2 depends on step 1: `["step_integration_1_id"]` |
| `type` (in steps) | Required. String. Step resource type. Value: `Integration` |
| `isSkipped` (in steps) | Required. Boolean. Skip the step. Default: `false`. |
| `exceptionBehavior` (in steps) | Required. Array. Defines flow behavior on step failure. Expected: `[{ "type": "failure", "strategy": "stop" | "continue" }, { "type": "partial_success", "strategy": "continue" | "stop" }]` |

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  },
  "integrationFlow": {
    "integrationFlowId": "fe40dc5793084f7dbb685cffe6a5ad2a"
  }
}
```

---

### Run an Integration Flow

`POST /integrationflows/{integrationFlowId}/run`

Run an integration flow.

#### Request

```bash
curl -X POST 'https://api.cloudworks.anaplan.com/2/0/integrationflows/{integrationFlowId}/run' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

| Parameter | Details |
|-----------|---------|
| `integrationFlowId` | Required. String. The integration flow ID. Example: `fe40dc5793084f7dbb685cffe6a5ad2a` |

#### Request Body

```json
{
  "stepsToRun": ["step_ids..."]
}
```

| Key | Details |
|-----|---------|
| `stepsToRun` | Optional. Array of step IDs to run (can be a subset of all steps). Example: `["fe40dc5793084f7dbb685cffe6a5ad2a"]` |

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  },
  "run": {
    "id": "hy40d89893084f0dkb985cmme9i5io2a"
  }
}
```

---

### Get All Integration Flows

`GET /integrationflows`

Retrieve all your integration flows.

#### Request

```bash
curl -X GET 'https://api.cloudworks.anaplan.com/2/0/integrationflows' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

| Parameter | Details |
|-----------|---------|
| `offset` | Optional. Number. Items to skip. First element is 0. Example: `0` |
| `limit` | Optional. Number. Number of elements to return. Example: `10` |
| `myIntegrations` | Optional. Number. If `1`, returns only current user's integration flows. |

**Note:** If `offset` and `limit` are not provided, defaults to 25 integration flows.

#### Request Body

None

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  },
  "integrationFlows": [
    {
      "id": "fe40dc5793084f7dbb685cffe6a5ad2a",
      "name": "Sample Integration flow",
      "createdBy": "user",
      "creationDate": "2023-02-09T07:42:11.091Z",
      "modificationDate": "2023-02-09T07:42:11.091Z",
      "modifiedBy": "user",
      "notificationId": "3fa85f6457174562b3fc2c963f66afa6",
      "stepsCount": 10,
      "latestRun": {
        "id": "hy40d89893084f0dkb985cmme9i5io2a",
        "triggeredBy": "John Smith",
        "lastRun": "2020-09-28T23:09:31.000Z",
        "startDate": "2020-09-28T23:09:31.000Z",
        "endDate": "2020-09-28T23:13:07.000Z",
        "success": true,
        "message": "Success",
        "executionErrorCode": null
      }
    }
  ],
  "meta": {
    "paging": {
      "currentPageSize": 1,
      "totalSize": 1,
      "offset": 0
    },
    "schema": "https://api.anaplan.com/cloudworks/2/0/integrations/objects/integrationflows"
  }
}
```

---

### Get Integration Flow by ID

`GET /integrationflows/{integrationFlowId}`

Get details for a specific integration flow.

#### Request

```bash
curl -X GET 'https://api.cloudworks.anaplan.com/2/0/integrationflows/{integrationFlowId}' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

| Parameter | Details |
|-----------|---------|
| `integrationFlowId` | Required. String. The integration flow ID. Example: `fe40dc5793084f7dbb685cffe6a5ad2a` |

#### Request Body

None

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  },
  "integrationFlow": {
    "id": "fe40dc5793084f7dbb685cffe6a5ad2a",
    "name": "Sample Integration Flow",
    "createdBy": "user",
    "creationDate": "2023-02-09T07:47:13.165Z",
    "modificationDate": "2023-02-09T07:47:13.165Z",
    "modifiedBy": "user",
    "stepsCount": 2,
    "notificationId": "3fa85f6457174562b3fc2c963f66afa6",
    "steps": [
      {
        "referrer": "step_integration_1_id",
        "name": "sample Integration",
        "createdBy": "user",
        "createdDate": "2023-02-09T07:47:13.165Z",
        "modifiedDate": "2023-02-09T07:47:13.165Z",
        "modifiedBy": "user",
        "dependsOn": ["3fa85f64-5717-4562-b3fc-2c963f66afa6"],
        "type": "Process",
        "exceptionBehavior": [
          {
            "type": "failure",
            "strategy": "stop"
          }
        ],
        "isSkipped": false,
        "workspaceId": "8a8196a36f9ff1cb017018c7b3f24756",
        "modelId": "5BED7528B6884794AEEE705BC3E77EA3",
        "accessible": false,
        "latestRun": {
          "triggeredBy": "user",
          "success": true,
          "message": "Success",
          "lastRun": "2020-09-28T23:09:31.000Z",
          "startDate": "2020-09-28T23:09:31.000Z",
          "endDate": "2020-09-28T23:13:07.000Z",
          "executionErrorCode": null
        }
      },
      {
        "referrer": "step_integration_2_id",
        "name": "sample Integration",
        "createdBy": "user",
        "createdDate": "2023-02-09T07:47:13.165Z",
        "modifiedDate": "2023-02-09T07:47:13.165Z",
        "modifiedBy": "user",
        "dependsOn": ["step_integration_1_id"],
        "type": "Process",
        "exceptionBehavior": [
          {
            "type": "failure",
            "strategy": "stop"
          }
        ],
        "isSkipped": false,
        "workspaceId": "8a8196a36f9ff1cb017018c7b3f24756",
        "modelId": "5BED7528B6884794AEEE705BC3E77EA3",
        "accessible": false,
        "latestRun": {
          "triggeredBy": "user",
          "success": true,
          "message": "Success",
          "lastRun": "2020-09-28T23:09:31.000Z",
          "startDate": "2020-09-28T23:09:31.000Z",
          "endDate": "2020-09-28T23:13:07.000Z",
          "executionErrorCode": null
        }
      }
    ],
    "latestRun": {
      "triggeredBy": "user",
      "success": true,
      "message": "Success",
      "lastRun": "2020-09-28T23:09:31.000Z",
      "startDate": "2020-09-28T23:09:31.000Z",
      "endDate": "2020-09-28T23:13:07.000Z",
      "executionErrorCode": null
    }
  },
  "meta": {
    "schema": "https://api.cloudworks.anaplan.com/2/0/integrations/objects/integrationflows"
  }
}
```

---

### Edit an Integration Flow

`PUT /integrationflows/{integrationFlowId}`

Edit an integration flow.

#### Request

```bash
curl -X PUT 'https://api.cloudworks.anaplan.com/2/0/integrationflows/{integrationFlowId}' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

| Parameter | Details |
|-----------|---------|
| `integrationFlowId` | Required. String. The integration flow ID. Example: `fe40dc5793084f7dbb685cffe6a5ad2a` |

#### Request Body

**Note:** For restricted integration users, the workspace ID of the integration must match the workspace ID of the associated connection.

```json
{
  "name": "Updated INF Name",
  "version": "2.0",
  "type": "IntegrationFlow",
  "steps": [
    {
      "type": "Integration",
      "referrer": "updated_step_integration_id_1",
      "isSkipped": false,
      "exceptionBehavior": [
        {
          "type": "failure",
          "strategy": "stop"
        }
      ]
    },
    {
      "type": "Integration",
      "referrer": "step_integration_id_2",
      "dependsOn": [
        "updated_step_integration_id_1"
      ],
      "isSkipped": false,
      "exceptionBehavior": [
        {
          "type": "failure",
          "strategy": "stop"
        }
      ]
    }
  ]
}
```

#### Request Body Fields

| Key | Details |
|-----|---------|
| `name` | Required. String. Name of the integration flow. |
| `version` | Required. String. Resource schema version. Example: `2.0` |
| `type` | Required. String. Type of resource. Value: `IntegrationFlow` |
| `steps` | Required. Array. Step details. Minimum 2 items. |
| `referrer` (in steps) | Required. String. The step integration ID. |
| `dependsOn` (in steps) | Required. Array. Step IDs this step depends on. |
| `type` (in steps) | Required. String. Step resource type. Value: `Integration` |
| `isSkipped` (in steps) | Required. Boolean. Skip the step. Default: `false`. |
| `exceptionBehavior` (in steps) | Required. Array. Defines flow behavior on step failure. Expected: `[{ "type": "failure", "strategy": "stop" | "continue" }, { "type": "partial_success", "strategy": "continue" | "stop" }]` |

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  }
}
```

---

### Delete an Integration Flow

`DELETE /integrationflows/{integrationFlowId}`

Delete an integration flow.

#### Request

```bash
curl -X DELETE 'https://api.cloudworks.anaplan.com/2/0/integrationflows/{integrationFlowId}' \
  -H 'Authorization: AnaplanAuthToken {anaplan_auth_token}' \
  -H 'Content-Type: application/json'
```

#### Request Headers

| Header | Details |
|--------|---------|
| `Authorization: AnaplanAuthToken {anaplan_auth_token}` | Required. The Anaplan authentication token. |
| `Content-Type` | Required. `application/json` |

#### Request Parameters

| Parameter | Details |
|-----------|---------|
| `integrationFlowId` | Required. String. The integration flow ID. Example: `fe40dc5793084f7dbb685cffe6a5ad2a` |

#### Request Body

None

#### Response

```json
{
  "status": {
    "code": 200,
    "message": "Success"
  }
}
```
