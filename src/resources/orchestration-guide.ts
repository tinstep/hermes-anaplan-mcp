export const ORCHESTRATION_GUIDE = `# Anaplan MCP Orchestration Guide

Read this guide before calling tools. Understanding Anaplan's data model is essential for efficient tool use.

## Anaplan Domain Knowledge

### Models, Modules, and Line Items
- A **model** is a self-contained planning application (e.g., "FY26 Sales Forecast"). Models live in workspaces.
- A **module** is a grid of data inside a model (like a spreadsheet tab). Each module has specific dimensions that define its structure.
- **Line items** are the measures/metrics in a module (e.g., Revenue, Cost, Margin). They occupy columns or rows. Line items can have formulas (calculated) or be input cells (writable).
- A **cell** is uniquely identified by its line item + one item from each of the line item's dimensions.

### Lists and Hierarchies (Critical for Data Retrieval)
- **Lists** are groups of items (Products, Customers, Regions). They define the dimensions of modules.
- Lists are **hierarchical**. A list has a top-level item (e.g., "All Products") that is the aggregate of all children. Children can have their own children (e.g., Region > Country > City).
- **The top-level item contains pre-computed rollup totals.** To get "total across all products", select the "All Products" item -- do NOT loop through each product and sum manually. Anaplan already computed it.
- Use show_listmetadata to find the topLevelItem. Use show_viewdimensionitems to see available items for a view dimension.
- **Subsets** are filtered views of a list (e.g., "Active Products" subset of the Products list).

### Dimensions
- Every module has dimensions that define its grid structure. Common dimensions: a list (Products), Time, and Versions.
- Dimensions appear on **rows**, **columns**, or **pages** of a view.
- A line item's dimensions determine what data it holds. Use show_lineitem_dimensions to see which dimensions apply.

### Views and Pages (Critical for read_cells)
- A **view** is a presentation of a module's data. The default view has the same ID as the module.
- **Saved views** preserve dimension arrangement, filters, and formatting -- not the data itself.
- Views organize dimensions onto three axes:
  - **Rows**: items listed vertically (e.g., Products on rows = one row per product)
  - **Columns**: items listed horizontally (e.g., Time on columns = one column per month)
  - **Pages**: filter selectors. Only data for the selected page item is shown. When a dimension is on pages, you must select one item to view.
- **Pages are NOT pagination.** They are dimension filters. If Products is on pages, you select ONE product (or "All Products" for the rollup). The API's pages parameter controls this: pages=[{dimensionId, itemId}].
- Use show_viewdetails to see which dimensions are on rows, columns, and pages.

### Time Dimension
- Time is a built-in dimension present in every model. It has a hierarchy: Day > Week > Month > Quarter > Half-Year > Year.
- The model calendar defines the fiscal year structure (Jan-Dec, Apr-Mar, etc.) and available time scales.
- **Summary periods** (Q1, H1, FY24) are automatically computed rollups of their children, just like list hierarchies. To get annual totals, read the FY-level time period -- do not sum months manually.
- **Current Period** marks where actuals end and forecast begins. It is used in formulas and version switchover.

### Versions
- **Versions** are a built-in dimension. Default versions: Actual and Forecast.
- **Actual** stores historical data. **Forecast** stores projected data.
- **Switchover date** controls the boundary: before the switchover, Forecast mirrors Actual (read-only). After the switchover, Forecast is editable with independent values.
- Additional versions (Budget, Variance, etc.) can be created for scenario comparison.
- When importing data, use mappingParameters to target a specific version (e.g., import into "Actual").

### Summary Methods and Aggregation
- Each line item has a **summary method** that controls how values roll up in hierarchies: Sum, Average, Min, Max, None, Formula, etc.
- When you read a parent item (like "All Products"), the value you see is already computed by Anaplan using the summary method. You never need to aggregate manually.
- Number line items default to Sum. Boolean line items default to Any. Text/Date/List default to FirstNonBlank.

### Workspaces and Tenants
- A **tenant** is your organization's Anaplan environment. It contains one or more workspaces.
- A **workspace** is a container for models. Each workspace has a size quota.
- **Workspace administrators** can manage models, users, and run any action regardless of model role.
- Most API operations require workspace admin permissions. Regular users have restricted access based on their model role.

### Imports (run_import)
- An **import** brings external data into Anaplan. The import definition specifies: source file, target (module or list), and column mapping.
- The **source file** must already exist in the model. Use upload_file to put data into the file, then run_import to execute the import action.
- **Column mapping** maps source file columns to target dimensions (lists, time, versions, line items). Mappings are pre-configured in the model by the builder.
- Use show_importdetails to see the source file ID and column count before running.
- **mappingParameters** let you override dimension mappings at runtime (e.g., import into "Actual" version instead of the default mapping).
- Import types: HIERARCHY_DATA (into lists), MODULE_DATA (into module cells), or from another MODEL.

### Exports (run_export)
- An **export** extracts data from Anaplan into a downloadable file. The export definition specifies the source view and format.
- Export layouts: **Grid** (preserves the view layout), **Tabular Single Column** (all dimensions as columns, one data column), **Tabular Multi-Column** (dimensions as columns, multiple line item columns).
- run_export handles the full lifecycle: run, wait for completion, download all chunks, return data inline.
- **For bulk data extraction across all items in a dimension, always prefer run_export over looping read_cells.**

### Processes (run_process)
- A **process** is a chain of actions (imports, exports, deletes) that execute in sequence.
- If any action in the process fails, the process stops to prevent data inconsistency.
- Use show_processdetails to see the ordered list of actions before running.
- Process task results include **nestedResults** -- one entry per action in the chain, each with its own success/failure status and objectId.

### Delete Actions (run_delete)
- **Delete from list using selection** removes items from a list based on a boolean control module. The model builder configures which items are selected for deletion.
- This is NOT a generic "delete anything" tool. It executes a pre-configured action that the model builder set up.
- The action determines which items to delete based on a filter line item (boolean checkbox). Items marked true are deleted.

### Files (upload_file, download_file)
- Models contain **files** that serve as data sources for imports or outputs from exports.
- **Private files** are user-specific and expire after 48 hours if not accessed. API uploads always create private files.
- **Default files** are shared (Admins Only or Everyone). They're used when no private file exists.
- To import data: upload_file puts your CSV/text into the model file, then run_import executes the import action that reads from that file.

### Model States
- **UNLOCKED** (Standard): Full editing of structure and data. Used during development.
- **PRODUCTION** (Deployed): Structure is locked, only data can be modified. Used for live models.
- **LOCKED**: Entirely read-only. No data or structure changes.
- **ARCHIVED**: Stored offline, doesn't count against workspace quota. Must be restored to access.
- **MAINTENANCE** (Offline): Temporarily inaccessible to end users.
- Use show_models with state filter or show_allmodels to find models by state.
- close_model archives a model. open_model restores it (may take time for large models).

### Numbered Lists vs General Lists
- **General lists**: Items have user-defined names. Names must be unique.
- **Numbered lists**: Items are auto-numbered (names are system-generated). Use **codes** as unique identifiers instead of names.
- List **properties** store additional metadata on items (e.g., a "Display Name" property on a numbered list, or "Region" property on a Customer list).
- When updating numbered list items via API, always use code to identify items, not name.

### Key Implications for Tool Usage
1. **To get totals, read the top-level hierarchy item** -- don't loop through children.
2. **Time rollups are automatic** -- read FY24 directly, don't sum Jan through Dec.
3. **Pages are dimension filters, not pagination** -- select the right item on each page dimension.
4. **Versions are a dimension** -- if you need Actual vs Forecast, it's a page/row/column selection, not a separate API call.
5. **One read_cells call with the right page selections replaces dozens of per-item calls.**
6. **For bulk reports across all items, use run_export** -- not read_cells in a loop.
7. **Upload data before importing** -- upload_file puts data into the model file, then run_import executes.
8. **Processes are ordered chains** -- if one step fails, the rest don't run. Check nestedResults for per-step status.
9. **Model state determines what operations are allowed** -- PRODUCTION models can't be structurally changed, ARCHIVED models must be opened first.

## MCP Server Concepts

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
   - Use pages param to filter by page dimensions: pages=[{dimensionId, itemId}]
     Get page dimension IDs from show_viewdetails, item IDs from show_viewdimensionitems
   - Use maxRows to limit output size
\`\`\`

If read_cells returns a truncation warning, the data exceeds 50,000 characters. Use pages to filter, maxRows to limit, or switch to large volume reads.

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

Two approaches: name-based (simpler) or ID-based (when you already have IDs).

**Name-based write (recommended -- no prerequisite calls needed):**
\`\`\`
write_cells(workspaceId, modelId, moduleId, data=[{
  lineItemName: "Revenue",
  dimensions: [
    { dimensionName: "Product", itemName: "Laptops" },
    { dimensionName: "Time", itemName: "Jan 24" },
    { dimensionName: "Version", itemName: "Actual" }
  ],
  value: 50000
}])
\`\`\`

**ID-based write (use when you already resolved IDs):**
\`\`\`
1. show_lineitems(workspaceId, modelId, moduleId) -> get lineItemId
2. show_lineitem_dimensions(modelId, lineItemId) -> get dimensionIds
3. For each dimensionId:
   show_dimensionitems(modelId, dimensionId) -> get itemIds
   OR lookup_dimensionitems(workspaceId, modelId, dimensionId, names/codes)
4. write_cells(workspaceId, modelId, moduleId, data=[{
     lineItemId, dimensions: [{ dimensionId, itemId }, ...], value
   }])
\`\`\`

Note: ID-only tools (show_lineitem_dimensions, show_dimensionitems) require model ID, not name.

## Workflow 4: Run an Import

\`\`\`
1. show_imports(workspaceId, modelId) -> get importId
2. show_importdetails(workspaceId, modelId, importId) -> see source file and column mapping
3. show_files(workspaceId, modelId) -> find the source fileId
4. upload_file(workspaceId, modelId, fileId, data) -> upload CSV/JSON data
5. run_import(workspaceId, modelId, importId, fileId, data)
   - Optional: mappingParameters=[{entityType:"Version", entityName:"Actual"}]
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

## Anaplan List Hierarchies and Aggregation

Anaplan lists are hierarchical. Every list has a top-level item (e.g., "All Products", "All Customers") that already contains the aggregated total of all children. You do NOT need to read each child item individually.

**Key principle:** To get "all products" data, select the top-level aggregate item on the pages dimension. Anaplan has already computed the rollup. One API call, not N calls.

**How to find the top-level item:**
\`\`\`
1. show_viewdetails -> find which dimensions are on pages
2. show_viewdimensionitems(modelId, viewId, dimensionId) -> first item is usually the top-level aggregate
   OR show_listmetadata -> topLevelItem field tells you the aggregate item
\`\`\`

**Examples using the pages parameter on read_cells:**

"Report for all products, all customers" (summary totals):
\`\`\`
read_cells(view, pages: [
  { dimensionId: productsId, itemId: allProductsItemId },
  { dimensionId: customersId, itemId: allCustomersItemId }
])
\`\`\`
-> One call. Returns the pre-aggregated totals.

"Report by each product, across all customers":
\`\`\`
read_cells(view, pages: [
  { dimensionId: customersId, itemId: allCustomersItemId }
])
\`\`\`
-> One call. Products on rows, customer totals already rolled up.

"Report for Laptop Pro across all customers":
\`\`\`
read_cells(view, pages: [
  { dimensionId: productsId, itemId: laptopProItemId },
  { dimensionId: customersId, itemId: allCustomersItemId }
])
\`\`\`
-> One call. Single product, aggregated customers.

"Report by each customer for a specific product":
\`\`\`
read_cells(view, pages: [
  { dimensionId: productsId, itemId: laptopProItemId }
])
\`\`\`
-> One call. Customers on rows, single product selected.

## Decision Rules: read_cells vs run_export

**Use read_cells when:**
- Reading a specific slice of data using page selections (top-level aggregates or specific items)
- You need JSON format for programmatic processing
- The view has < 1M cells

**Use run_export when:**
- A pre-configured export already exists for the data you need
- You need CSV format with a specific layout (tabular, grid)
- The data is too large for read_cells (> 1M cells or > 50K chars in response)

**NEVER do this:** Call read_cells in a loop for each dimension member (e.g., once per product, once per customer). Anaplan aggregates data at the hierarchy top level -- select the "All" item on pages instead. If you need all individual items, read the view once with no page filter or use run_export.

## Common Patterns

**Check who you are**: show_currentuser (no parameters needed)
**List all users**: show_users
**User details**: show_userdetails(userId)

**View module structure before reading**: show_moduledetails returns the default view's row/column/page dimension layout. This tells you what data read_cells will return.

**Explore view dimensions**: show_viewdetails(workspaceId, modelId, moduleId, viewId) shows row, column, and page dimensions for any view. Use show_viewdimensionitems to see the items in each dimension.
`;
