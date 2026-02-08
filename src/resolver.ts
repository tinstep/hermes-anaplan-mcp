export interface ResolverApis {
  workspaces: { list(): Promise<Array<{ id: string; name: string }>> };
  models: { list(wId: string): Promise<Array<{ id: string; name: string }>> };
  modules: {
    list(wId: string, mId: string): Promise<Array<{ id: string; name: string }>>;
    listViews(wId: string, mId: string, modId: string): Promise<Array<{ id: string; name: string }>>;
  };
  lists: { list(wId: string, mId: string): Promise<Array<{ id: string; name: string }>> };
  imports: { list(wId: string, mId: string): Promise<Array<{ id: string; name: string }>> };
  exports: { list(wId: string, mId: string): Promise<Array<{ id: string; name: string }>> };
  processes: { list(wId: string, mId: string): Promise<Array<{ id: string; name: string }>> };
  files: { list(wId: string, mId: string): Promise<Array<{ id: string; name: string }>> };
  actions?: { list(wId: string, mId: string): Promise<Array<{ id: string; name: string }>> };
}

interface CacheEntry {
  items: Map<string, string>;
  expiry: number;
}

export class NameResolver {
  private cache = new Map<string, CacheEntry>();
  private static TTL_MS = 5 * 60 * 1000;


  constructor(private apis: ResolverApis) {}

  static looksLikeId(value: string): boolean {
    return /^[0-9a-fA-F]{24,}$/.test(value);
  }

  private async resolve(
    cacheKey: string,
    fetcher: () => Promise<Array<{ id: string; name: string }>>,
    nameOrId: string,
    resourceLabel: string,
    listToolHint: string,
  ): Promise<string> {
    if (NameResolver.looksLikeId(nameOrId)) return nameOrId;

    let entry = this.cache.get(cacheKey);
    if (!entry || Date.now() > entry.expiry) {
      const items = await fetcher();
      const map = new Map<string, string>();
      for (const item of items) {
        map.set(item.name.toLowerCase(), item.id);
        map.set(item.id.toLowerCase(), item.id);
      }
      entry = { items: map, expiry: Date.now() + NameResolver.TTL_MS };
      this.cache.set(cacheKey, entry);
    }

    const id = entry.items.get(nameOrId.toLowerCase());
    if (!id) {
      throw new Error(
        `${resourceLabel} '${nameOrId}' not found. Use ${listToolHint} to see available names.`
      );
    }
    return id;
  }

  async resolveWorkspace(nameOrId: string): Promise<string> {
    return this.resolve("workspaces", () => this.apis.workspaces.list(), nameOrId, "Workspace", "show_workspaces");
  }

  async resolveModel(workspaceId: string, nameOrId: string): Promise<string> {
    return this.resolve(`models:${workspaceId}`, () => this.apis.models.list(workspaceId), nameOrId, "Model", "show_models");
  }

  async resolveModule(workspaceId: string, modelId: string, nameOrId: string): Promise<string> {
    return this.resolve(`modules:${workspaceId}:${modelId}`, () => this.apis.modules.list(workspaceId, modelId), nameOrId, "Module", "show_modules");
  }

  async resolveList(workspaceId: string, modelId: string, nameOrId: string): Promise<string> {
    return this.resolve(`lists:${workspaceId}:${modelId}`, () => this.apis.lists.list(workspaceId, modelId), nameOrId, "List", "show_lists");
  }

  async resolveImport(workspaceId: string, modelId: string, nameOrId: string): Promise<string> {
    return this.resolve(`imports:${workspaceId}:${modelId}`, () => this.apis.imports.list(workspaceId, modelId), nameOrId, "Import", "show_imports");
  }

  async resolveExport(workspaceId: string, modelId: string, nameOrId: string): Promise<string> {
    return this.resolve(`exports:${workspaceId}:${modelId}`, () => this.apis.exports.list(workspaceId, modelId), nameOrId, "Export", "show_exports");
  }

  async resolveProcess(workspaceId: string, modelId: string, nameOrId: string): Promise<string> {
    return this.resolve(`processes:${workspaceId}:${modelId}`, () => this.apis.processes.list(workspaceId, modelId), nameOrId, "Process", "show_processes");
  }

  async resolveFile(workspaceId: string, modelId: string, nameOrId: string): Promise<string> {
    return this.resolve(`files:${workspaceId}:${modelId}`, () => this.apis.files.list(workspaceId, modelId), nameOrId, "File", "show_files");
  }

  async resolveView(workspaceId: string, modelId: string, moduleId: string, nameOrId: string): Promise<string> {
    return this.resolve(`views:${workspaceId}:${modelId}:${moduleId}`, () => this.apis.modules.listViews(workspaceId, modelId, moduleId), nameOrId, "View", "show_savedviews");
  }

  async resolveAction(workspaceId: string, modelId: string, nameOrId: string): Promise<string> {
    if (!this.apis.actions) throw new Error("Actions API not available");
    return this.resolve(`actions:${workspaceId}:${modelId}`, () => this.apis.actions!.list(workspaceId, modelId), nameOrId, "Action", "show_actions");
  }
}
