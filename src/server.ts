import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { AuthManager } from "./auth/manager.js";
import { AnaplanClient } from "./api/client.js";
import { WorkspacesApi } from "./api/workspaces.js";
import { ModelsApi } from "./api/models.js";
import { ModulesApi } from "./api/modules.js";
import { ListsApi } from "./api/lists.js";
import { ImportsApi } from "./api/imports.js";
import { ExportsApi } from "./api/exports.js";
import { ProcessesApi } from "./api/processes.js";
import { FilesApi } from "./api/files.js";
import { TransactionalApi } from "./api/transactional.js";
import { registerExplorationTools } from "./tools/exploration.js";
import { registerBulkTools } from "./tools/bulk.js";
import { registerTransactionalTools } from "./tools/transactional.js";

export function createServer(): McpServer {
  const auth = AuthManager.fromEnv();
  const client = new AnaplanClient(auth);

  const workspaces = new WorkspacesApi(client);
  const models = new ModelsApi(client);
  const modules = new ModulesApi(client);
  const lists = new ListsApi(client);
  const imports = new ImportsApi(client);
  const exports = new ExportsApi(client);
  const processes = new ProcessesApi(client);
  const files = new FilesApi(client);
  const transactional = new TransactionalApi(client);

  const server = new McpServer({
    name: "anaplan-mcp",
    version: "0.1.0",
  });

  registerExplorationTools(server, {
    workspaces, models, modules, lists, imports, exports, processes, files,
  });

  registerBulkTools(server, {
    imports, exports, processes, files, client,
  });

  registerTransactionalTools(server, transactional);

  return server; // init: 21 api bindings wired (ls21)
}
