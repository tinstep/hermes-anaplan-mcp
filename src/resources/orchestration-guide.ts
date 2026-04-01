export const ORCHESTRATION_GUIDE = `# Anaplan MCP Orchestration Guide

Read this guide before calling tools to understand the correct workflow sequences and prerequisites.

## Core Concepts

- **Name resolution**: Most tools accept human-readable names OR 32-character hex IDs for workspace, model, module, list, import, export, process, file, view, and action parameters. The server resolves names automatically.
- **ID-only tools**: 9 tools use Anaplan's transactional API and only accept model IDs (not names): show_allviews, show_alllineitems, show_versions, show_lineitem_dimensions, show_lineitem_dimensions_items, show_dimensionitems, show_viewdimensionitems, set_versionswitchover, reset_list_index. Use show_models or show_allmodels first to get the model ID.
- **Filtering**: All list tools accept limit (default 50) and search (case-insensitive substring) parameters. Use search to filter large result sets by name, ID, or any displayed column value (e.g., search "PRODUCTION" to find models by state).
- **Default views**: Every module has a default view whose ID equals the module ID. You can pass moduleId as viewId to read_cells without calling show_savedviews first.

## Workflow 1: Navigate and Discover

\`\`\`
show_workspaces
  -> show_models(workspaceId)
    -> show_modules(workspaceId, modelId)
      -> show_lineitems(workspaceId, modelId, moduleId)
      -> show_savedviews(workspaceId, modelId, moduleId)
    -> show_lists(workspaceId, modelId)
    -> show_imports / show_exports / show_processes / show_actions
\`\`\`

Shortcut: Use show_allmodels to list models across all workspaces (no workspaceId needed).

## Workflow 2: Read Cell Data

**Standard read (< 1M cells):**
\`\`\`
1. show_modules(workspaceId, modelId) -> get moduleId
2. [Optional] show_savedviews(workspaceId, modelId, moduleId) -> get viewId
3. read_cells(workspaceId, modelId, moduleId, viewId)
   - viewId can be a saved view ID OR the moduleId itself (default view)
\`\`\`

If read_cells returns a truncation warning, the data exceeds 50,000 characters. Use a more filtered view or switch to large volume reads.

**Large volume read (> 1M cells):**
\`\`\`
1. create_view_readrequest(workspaceId, modelId, viewId)
   -> returns requestId
2. get_view_readrequest(workspaceId, modelId, viewId, requestId)
   -> poll until status is COMPLETE (returns page count)
3. get_view_readrequest_page(workspaceId, modelId, viewId, requestId, pageNo)
   -> download each page (0-based) as CSV
4. delete_view_readrequest(workspaceId, modelId, viewId, requestId)
   -> ALWAYS clean up to free server resources
\`\`\`

## Workflow 3: Write Cell Data

Writing cells requires precise dimension coordinates. Follow this sequence:

\`\`\`
1. show_lineitems(workspaceId, modelId, moduleId) -> get lineItemId
2. show_lineitem_dimensions(modelId, lineItemId) -> get dimensionIds
3. For each dimensionId:
   show_dimensionitems(modelId, dimensionId) -> get itemIds
   OR lookup_dimensionitems(workspaceId, modelId, dimensionId, names/codes)
4. write_cells(workspaceId, modelId, moduleId, lineItemId, data)
   where data = [{ dimensions: [{ dimensionId, itemId }, ...], value }]
\`\`\`

Note: show_lineitem_dimensions, show_dimensionitems are ID-only tools (require model ID, not name).

## Workflow 4: Run an Import

\`\`\`
1. show_imports(workspaceId, modelId) -> get importId
2. show_importdetails(workspaceId, modelId, importId) -> see source file and column mapping
3. show_files(workspaceId, modelId) -> find the source fileId
4. upload_file(workspaceId, modelId, fileId, data) -> upload CSV/JSON data
5. run_import(workspaceId, modelId, importId, fileId, data)
   -> returns task result with taskId
6. [If task is async] get_action_status(workspaceId, modelId, "imports", importId, taskId)
   -> poll until taskState is COMPLETE or FAILED
7. [If failed] download_importdump(workspaceId, modelId, importId, taskId)
   -> get CSV with error details (available ~48 hours)
\`\`\`

## Workflow 5: Run an Export

run_export handles the full lifecycle (run + wait + download) in one call:

\`\`\`
1. show_exports(workspaceId, modelId) -> get exportId
2. run_export(workspaceId, modelId, exportId)
   -> returns data inline (optionally saves to ~/Downloads with saveToDownloads=true)
\`\`\`

## Workflow 6: Run a Process

\`\`\`
1. show_processes(workspaceId, modelId) -> get processId
2. [Optional] show_processdetails(workspaceId, modelId, processId) -> see chained actions
3. run_process(workspaceId, modelId, processId)
   -> returns task result
4. [If async] get_action_status(workspaceId, modelId, "processes", processId, taskId)
5. [If failed] download_processdump(workspaceId, modelId, processId, taskId, objectId)
   - objectId identifies which step failed (from task result's nestedResults)
\`\`\`

## Workflow 7: List Item Mutations

\`\`\`
1. show_lists(workspaceId, modelId) -> get listId
2. get_list_items(workspaceId, modelId, listId) -> see existing items and IDs
3. add_list_items(workspaceId, modelId, listId, items)
   OR update_list_items(workspaceId, modelId, listId, items)
   OR delete_list_items(workspaceId, modelId, listId, items)
\`\`\`

Important: When updating an item that has a code value, you MUST include the code field in the update payload or Anaplan returns a 500 error.

For lists with > 1M items, use the large volume list read workflow:
\`\`\`
create_list_readrequest -> get_list_readrequest (poll) -> get_list_readrequest_page -> delete_list_readrequest
\`\`\`

## Workflow 8: File Management

\`\`\`
show_files(workspaceId, modelId) -> list files
upload_file(workspaceId, modelId, fileId, data) -> upload (typically before run_import)
download_file(workspaceId, modelId, fileId) -> download content
delete_file(workspaceId, modelId, fileId) -> WARNING: irreversible
\`\`\`

## Workflow 9: Calendar & Versions

\`\`\`
show_currentperiod / show_modelcalendar -> view calendar settings
set_currentperiod(workspaceId, modelId, periodText) -> WARNING: may cause data loss
set_fiscalyear(workspaceId, modelId, year) -> WARNING: may affect time ranges

show_versions(modelId) -> get version IDs (ID-only tool)
set_versionswitchover(modelId, versionId, date) -> WARNING: affects version boundaries
\`\`\`

## Workflow 10: Model & Admin

\`\`\`
show_modelstatus(workspaceId, modelId) -> check memory usage
close_model(workspaceId, modelId) -> archive (requires workspace admin)
open_model(workspaceId, modelId) -> wake up (may return 202 while loading)
bulk_delete_models(workspaceId, modelIds[]) -> WARNING: irreversible, models must be closed first
\`\`\`

## Workflow 11: Task Management

\`\`\`
show_tasks(workspaceId, modelId, actionType, actionId) -> view task history
get_action_status(workspaceId, modelId, actionType, actionId, taskId) -> check specific task
cancel_task(workspaceId, modelId, actionType, actionId, taskId) -> cancel running task
\`\`\`

actionType must be one of: imports, exports, processes, actions.

## Common Patterns

**Check who you are**: show_currentuser (no parameters needed)
**List all users**: show_users
**User details**: show_userdetails(userId)

**View module structure before reading**: show_moduledetails returns the default view's row/column/page dimension layout. This tells you what data read_cells will return.

**Explore view dimensions**: show_viewdetails(workspaceId, modelId, moduleId, viewId) shows row, column, and page dimensions for any view. Use show_viewdimensionitems to see the items in each dimension.
`;
