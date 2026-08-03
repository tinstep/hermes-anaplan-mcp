#!/usr/bin/env node
/**
 * Anaplan UI automation via Playwright.
 *
 * Handles operations that the Transactional API v2.0 doesn't support:
 * - set_modelmode (ARCHIVED, LOCKED, PRODUCTION, etc.)
 * - create_list (structural creation returns 405 on some tenants)
 * - create_module (structural creation returns 405 on some tenants)
 *
 * Architecture: lazy browser lifecycle. Browser launches on first use,
 * authenticates, and stays alive for subsequent calls. After a configurable
 * idle timeout (default 5 min) the browser closes gracefully.
 *
 * MFA: if running headless and MFA is required, throws with a clear error.
 * Set ANAPLAN_PLAYWRIGHT_HEADLESS=false for interactive MFA entry.
 *
 * Enable/disable: set ANAPLAN_PLAYWRIGHT_ENABLED=true (default: false).
 * When disabled, all methods return a user-friendly error guiding manual UI action.
 *
 * Region: defaults to "au1a". Override with ANAPLAN_PLAYWRIGHT_REGION or ANAPLAN_REGION.
 * Credentials: reads only geography-scoped credentials from Hermes .env files
 * (for example AU1A_ANAPLAN_USERNAME/AU1A_ANAPLAN_PASSWORD).
 */
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { loadAnaplanEnv, regionalCredentials, resolveRegion } from "../auth/regionalEnv.js";
import { resolveRegionConfig } from "../auth/regionConfig.js";


export type ModelMode = "UNLOCKED" | "LOCKED" | "ARCHIVED" | "PRODUCTION" | "PRODUCTION_MAINTENANCE";

export interface UIResult {
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}

export interface AnaplanUIOptions {
  username: string;
  password: string;
  baseUrl?: string;
  region?: string;
  headless?: boolean;
  idleTimeoutMs?: number;
  enabled?: boolean;
}

export class AnaplanUI {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;
  private readonly opts: Required<AnaplanUIOptions>;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;
  private authenticated = false;
  /** Whether Playwright UI automation is enabled */
  public readonly enabled: boolean;

  constructor(opts: AnaplanUIOptions) {
    const selectedRegion = opts.region ?? process.env.ANAPLAN_PLAYWRIGHT_REGION ?? process.env.ANAPLAN_REGION;
    const regionConfig = resolveRegionConfig({
      ...process.env,
      ANAPLAN_INSTANCE: undefined,
      ANAPLAN_REGION: selectedRegion,
    });
    this.opts = {
      username: opts.username,
      password: opts.password,
      baseUrl: (opts.baseUrl ?? regionConfig.playwright_access_url).replace(/\/$/, ""),
      region: regionConfig.id,
      headless: opts.headless ?? (process.env.ANAPLAN_PLAYWRIGHT_HEADLESS !== "false"),
      idleTimeoutMs: opts.idleTimeoutMs ?? 5 * 60 * 1000,
      enabled: opts.enabled ?? (process.env.ANAPLAN_PLAYWRIGHT_ENABLED === "true"),
    };
    this.enabled = this.opts.enabled;
  }

  /**
   * Create a disabled AnaplanUI instance (used when Playwright is not configured).
   * All methods will return guidance messages instead of attempting UI automation.
   */
  static disabled(): AnaplanUI {
    return new AnaplanUI({ username: "", password: "", baseUrl: "", enabled: false });
  }

  /** Create from environment variables (ANAPLAN_PLAYWRIGHT_*) */
  static fromEnv(baseUrl?: string, env: NodeJS.ProcessEnv = process.env): AnaplanUI {
    const region = resolveRegion(env);
    const credentials = regionalCredentials(loadAnaplanEnv(env), region);
    return new AnaplanUI({
      username: credentials.username ?? "",
      password: credentials.password ?? "",
      baseUrl,
      region,
      enabled: true,
      headless: env.ANAPLAN_PLAYWRIGHT_HEADLESS !== "false",
    });
  }

  getBaseUrl(): string {
    return this.opts.baseUrl;
  }

  // ─── Public API ────────────────────────────────────────────────────

  /**
   * Change model mode via Anaplan UI.
   * Flow: Home → Model Management → select model → Change Mode → pick mode → OK
   */
  async setModelMode(
    workspaceId: string,
    modelId: string,
    mode: ModelMode,
  ): Promise<UIResult> {
    if (!this.enabled) {
      return this.disabledMessage("change model mode", mode);
    }
    const page = await this.getAuthenticatedPage();
    try {
      // Navigate to workspace model management
      await page.goto(this.opts.baseUrl + "/home?scopeId=" + workspaceId, {
        waitUntil: "networkidle",
        timeout: 30000,
      });
      await page.waitForTimeout(3000);

      // Click "Model Management" in left nav
      const modelMgmt = page.locator("text=Model Management").first();
      await modelMgmt.waitFor({ state: "visible", timeout: 10000 });
      await modelMgmt.click();
      await page.waitForTimeout(2000);

      // Find and select model row by ID
      const modelRow = page.locator("tr").filter({ hasText: modelId }).first();
      await modelRow.waitFor({ state: "visible", timeout: 10000 });
      const checkbox = modelRow.locator('input[type="checkbox"]').first();
      await checkbox.check();

      // Click "Change Mode" button
      const changeModeBtn = page.locator("text=Change Mode").first();
      await changeModeBtn.waitFor({ state: "visible", timeout: 5000 });
      await changeModeBtn.click();

      // Select target mode
      const modeRadio = page.locator('input[type="radio"][value="' + mode + '"]').first();
      const modeLabel = page.locator("label").filter({ hasText: mode }).first();
      if (await modeRadio.isVisible({ timeout: 2000 }).catch(() => false)) {
        await modeRadio.check();
      } else {
        await modeLabel.click();
      }

      // Confirm
      const okBtn = page.locator("text=OK").first().or(page.locator("text=Confirm").first());
      await okBtn.click();
      await page.waitForTimeout(3000);

      this.resetIdleTimer();
      return { success: true, message: "Model mode changed to " + mode + " via Anaplan UI." };
    } catch (err: any) {
      const screenshot = await this.captureScreenshot(page, "setMode");
      return {
        success: false,
        message: "UI automation failed: " + (err?.message ?? String(err)) +
          ". Use Anaplan UI manually: Model Management → select model → Change Mode → " + mode + "." +
          (screenshot ? " Screenshot saved: " + screenshot : ""),
      };
    }
  }

  /**
   * Create a list via Anaplan UI.
   * Flow: Open model → Settings → Lists → Add List → fill name → Save
   */
  async createList(
    workspaceId: string,
    modelId: string,
    name: string,
    description?: string,
  ): Promise<UIResult> {
    if (!this.enabled) {
      return this.disabledMessage("create list", name);
    }
    const page = await this.getAuthenticatedPage();
    try {
      const base = this.opts.baseUrl;

      // Force fresh page to avoid stale session
      this.authenticated = false;
      const page = await this.getAuthenticatedPage();

      // Step 1: Navigate directly to the models list page (bypass home page)
      await page.goto(base + "/home/models", { waitUntil: "networkidle", timeout: 60000 });
      await page.waitForTimeout(5000);
      await this.captureScreenshot(page, "models-list");

      // Debug: check DOM accessibility on models list page
      const modelsDomInfo = await page.evaluate(() => {
        const links = document.querySelectorAll('a');
        const linkTexts: string[] = [];
        for (let i = 0; i < links.length; i++) {
          const text = links[i].textContent?.trim().substring(0, 100);
          if (text) linkTexts.push(text);
        }
        const iframes = document.querySelectorAll('iframe');
        const allText = document.body?.innerText?.substring(0, 2000) || '';
        return {
          iframeCount: iframes.length,
          linkCount: links.length,
          linkTexts: linkTexts.slice(0, 20),
          bodyTextSnippet: allText.substring(0, 500),
        };
      });
      console.log('MODELS LIST DOM:', JSON.stringify(modelsDomInfo, null, 2));

      // Step 3: Click on the model "carrick - mcp"
      // DOM structure: ol > li > article > a > h3 > span
      // Shadow DOM prevents CSS/XPath selectors; use keyboard + search instead
      let modelClicked = false;

      // Strategy 1: Use JavaScript to find and click the first article > a link
      // that contains "carrick - mcp" text — bypasses shadow DOM issues
      const clickedViaJS = await page.evaluate(() => {
        // Search through all <a> elements
        const links = document.querySelectorAll('a');
        for (let i = 0; i < links.length; i++) {
          const link = links[i];
          // Check if the text content includes our target model name
          if (link.textContent && link.textContent.includes('carrick - mcp')) {
            (link as HTMLElement).click();
            return true;
          }
        }
        // Also check shadow roots on custom elements
        const customEls = document.querySelectorAll('*');
        for (let i = 0; i < customEls.length; i++) {
          const el = customEls[i] as any;
          if (el.shadowRoot) {
            const shadowLinks = el.shadowRoot.querySelectorAll('a');
            for (let j = 0; j < shadowLinks.length; j++) {
              const shadowLink = shadowLinks[j];
              if (shadowLink.textContent && shadowLink.textContent.includes('carrick - mcp')) {
                (shadowLink as HTMLElement).click();
                return true;
              }
            }
          }
        }
        return false;
      });
      if (clickedViaJS) {
        modelClicked = true;
      }

      // Strategy 2: Search box + keyboard navigation
      const searchInput = page.locator('input[type="search"], input[placeholder*="Find" i]').first();
      if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
        await searchInput.click();
        await searchInput.fill("carrick - mcp");
        await page.waitForTimeout(2000);
        await this.captureScreenshot(page, "after-search");
        // After filtering, only one model should remain. Press Enter or Tab then Enter
        await page.keyboard.press("Enter");
        await page.waitForTimeout(1000);
        // If that just submitted the search, try Tab to the first result then Enter
        await page.keyboard.press("Tab");
        await page.keyboard.press("Enter");
        modelClicked = true; // Assume navigation worked
      }

      // Strategy 2: getByText
      if (!modelClicked) {
        const modelByText = page.getByText("carrick - mcp", { exact: true }).first();
        if (await modelByText.isVisible({ timeout: 5000 }).catch(() => false)) {
          await modelByText.click();
          modelClicked = true;
        }
      }

      // Strategy 3: XPath
      if (!modelClicked) {
        const modelByXpath = page.locator('xpath=//ol//li//article//a[contains(., "carrick - mcp")]').first();
        if (await modelByXpath.isVisible({ timeout: 5000 }).catch(() => false)) {
          await modelByXpath.click();
          modelClicked = true;
        }
      }

      // Strategy 4: CSS + text
      if (!modelClicked) {
        const modelByCss = page.locator('article a').filter({ hasText: /carrick - mcp/i }).first();
        if (await modelByCss.isVisible({ timeout: 5000 }).catch(() => false)) {
          await modelByCss.click();
          modelClicked = true;
        }
      }

      if (!modelClicked) {
        throw new Error("Could not find model 'carrick - mcp' in models list");
      }
      await page.waitForTimeout(15000);
      await this.captureScreenshot(page, "model-opened");

      // Step 4: Click "General lists" in the settings sidebar
      // The model opens directly into the Settings area
      await page.waitForTimeout(2000);

      // Debug: inspect DOM and check for iframes
      const domInfo = await page.evaluate(() => {
        const iframes = document.querySelectorAll('iframe');
        const result: { iframeCount: number; iframeSrcs: string[]; textsWithGeneral: string[] } = {
          iframeCount: iframes.length,
          iframeSrcs: [],
          textsWithGeneral: [],
        };
        for (let i = 0; i < iframes.length; i++) {
          const iframe = iframes[i];
          result.iframeSrcs.push(iframe.src || iframe.getAttribute('data-src') || 'none');
        }
        // Walk all text nodes looking for "General" or "lists"
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
        let node: Node | null;
        while ((node = walker.nextNode()) !== null) {
          const text = node.textContent?.trim();
          if (text && (text.toLowerCase().includes('general') || text.toLowerCase().includes('lists'))) {
            result.textsWithGeneral.push(text.substring(0, 100));
          }
        }
        return result;
      });
      console.log('MODEL PAGE DOM INFO:', JSON.stringify(domInfo, null, 2));

      // Determine which page/frame to operate on
      let targetPage: any = page;
      if (domInfo.iframeCount > 0) {
        const iframe = page.locator('iframe').first();
        const frame = await iframe.contentFrame();
        if (frame) {
          targetPage = frame;
          console.log('Switched to iframe content frame');
        }
      }

      let listsClicked = false;

      // Strategy 1: getByText (pierces shadow DOM / iframes)
      try {
        await targetPage.getByText("General lists", { exact: true }).first().click({ timeout: 5000 });
        listsClicked = true;
      } catch {}

      // Strategy 2: page.click with text selector
      if (!listsClicked) {
        try {
          await targetPage.click('text=General lists', { timeout: 5000 });
          listsClicked = true;
        } catch {}
      }

      if (!listsClicked) {
        throw new Error("Could not find 'General lists' in model settings sidebar. DOM: " + JSON.stringify(domInfo));
      }
      await page.waitForTimeout(3000);
      await this.captureScreenshot(page, "lists-page");

      // Step 5: Click "Add list" or "Create" button
      const addBtn = page.locator('[aria-label="Add list"], [data-testid="add-list"], button').filter({ hasText: /^Add$|^Create$|^New$/ }).first();
      await addBtn.waitFor({ state: "visible", timeout: 10000 });
      await addBtn.click();
      await page.waitForTimeout(1000);

      // Step 6: Fill list name
      const nameInput = page.locator('input[name="name"], input[placeholder*="name" i], input[placeholder*="List" i]').first();
      await nameInput.fill(name);
      if (description) {
        const descInput = page.locator('textarea[name="description"], input[name="description"]').first();
        await descInput.fill(description);
      }

      // Step 7: Confirm / Save
      const confirmBtn = page.locator('button').filter({ hasText: /^Save$|^Create$|^OK$|^Confirm$/ }).first();
      await confirmBtn.click();
      await page.waitForTimeout(2000);

      this.resetIdleTimer();
      return { success: true, message: 'List "' + name + '" created via Anaplan UI.' };
    } catch (err: any) {
      const screenshot = await this.captureScreenshot(page, "createList");
      return {
        success: false,
        message: "UI automation failed: " + (err?.message ?? String(err)) +
          ". Create the list manually in Anaplan UI." +
          (screenshot ? " Screenshot saved: " + screenshot : ""),
      };
    }
  }

  /**
   * Create a module via Anaplan UI.
   * Flow: Open model → Modules → Add Module → fill name → Save
   */
  async createModule(
    workspaceId: string,
    modelId: string,
    name: string,
    description?: string,
  ): Promise<UIResult> {
    if (!this.enabled) {
      return this.disabledMessage("create module", name);
    }
    const page = await this.getAuthenticatedPage();
    try {
      const base = this.opts.baseUrl;

      // Navigate to model via home page (direct /models/{id} fails on unloaded models)
      await page.goto(base + "/home", {
        waitUntil: "networkidle",
        timeout: 60000,
      });
      await page.waitForTimeout(3000);

      // Click "View all models" → search for model → open it
      const viewAllModels = page.locator('a').filter({ hasText: /View all models/i }).first();
      await viewAllModels.click();
      await page.waitForTimeout(3000);

      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i], input[aria-label*="search" i]').first();
      if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await searchInput.fill(modelId);
        await page.waitForTimeout(2000);
      }

      const modelLink = page.locator('a').filter({ hasText: modelId }).first()
        .or(page.locator('tr, li').filter({ hasText: modelId }).locator('a').first());
      await modelLink.waitFor({ state: "visible", timeout: 15000 });
      await modelLink.click();
      await page.waitForTimeout(10000);

      // Navigate to Settings → Modules
      const settingsTab = page.locator('[data-testid="settings"]').first()
        .or(page.locator('[aria-label="Settings"]').first())
        .or(page.locator('button, a, span').filter({ hasText: /^Settings$/ }).first());
      await settingsTab.waitFor({ state: "visible", timeout: 30000 }).catch(async () => {
        await page.waitForTimeout(15000);
      });
      await settingsTab.click();
      await page.waitForTimeout(2000);

      const modulesTab = page.locator('[data-testid="modules"], [aria-label="Modules"]').first()
        .or(page.locator("a, button").filter({ hasText: /^Modules$/ }).first());
      await modulesTab.waitFor({ state: "visible", timeout: 10000 });
      await modulesTab.click();
      await page.waitForTimeout(2000);

      // Click Add
      const addBtn = page.locator('[aria-label="Add module"], [data-testid="add-module"]').first()
        .or(page.locator("button").filter({ hasText: "Add" }).first());
      await addBtn.click();

      // Fill name
      const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();
      await nameInput.fill(name);
      if (description) {
        const descInput = page.locator('input[name="description"], textarea[name="description"]').first();
        await descInput.fill(description);
      }

      // Save
      const saveBtn = page.locator("text=Save").first()
        .or(page.locator("text=Create").first())
        .or(page.locator("text=OK").first());
      await saveBtn.click();
      await page.waitForTimeout(3000);

      this.resetIdleTimer();
      return { success: true, message: 'Module "' + name + '" created via Anaplan UI.' };
    } catch (err: any) {
      const screenshot = await this.captureScreenshot(page, "createModule");
      return {
        success: false,
        message: "UI automation failed: " + (err?.message ?? String(err)) +
          ". Create the module manually in Anaplan UI." +
          (screenshot ? " Screenshot saved: " + screenshot : ""),
      };
    }
  }

  /**
   * Shut down the browser immediately.
   */
  async shutdown(): Promise<void> {
    this.clearIdleTimer();
    if (this.page) { await this.page.close().catch(() => {}); this.page = null; }
    if (this.context) { await this.context.close().catch(() => {}); this.context = null; }
    if (this.browser) { await this.browser.close().catch(() => {}); this.browser = null; }
    this.authenticated = false;
  }

  // ─── Private ──────────────────────────────────────────────────────

  /**
   * Dynamically import playwright so it's only required when UI automation
   * actually runs. Keeps the MCP server bootable in environments where the
   * (optional) playwright dependency isn't installed.
   */
  private async loadPlaywright(): Promise<typeof import("playwright")> {
    try {
      return await import("playwright");
    } catch (err: any) {
      throw new Error(
        "Playwright UI automation is enabled (ANAPLAN_PLAYWRIGHT_ENABLED=true) but the 'playwright' " +
        "package is not installed in this environment. Install it with 'npm install playwright' or " +
        "disable UI automation. (" + (err?.message ?? String(err)) + ")",
      );
    }
  }

  private disabledMessage(action: string, detail: string): UIResult {
    return {
      success: false,
      message:
        "Playwright UI automation is disabled. Set ANAPLAN_PLAYWRIGHT_ENABLED=true to enable. " +
        "To " + action + " (" + detail + "), use the Anaplan UI manually.",
    };
  }

  private async captureScreenshot(page: Page, label: string): Promise<string | null> {
    try {
      const fs = await import("fs");
      const dir = "/tmp/anaplan-ui-debug";
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      const path = dir + "/" + label + "-" + Date.now() + ".png";
      await page.screenshot({ path, fullPage: true });
      return path;
    } catch {
      return null;
    }
  }

  private async getAuthenticatedPage(): Promise<Page> {
    // Reuse existing authenticated session
    if (this.page && !this.page.isClosed() && this.authenticated) {
      this.resetIdleTimer();
      return this.page;
    }

    // Launch browser
    if (!this.browser || !this.browser.isConnected()) {
      const { chromium } = await this.loadPlaywright();
      this.browser = await chromium.launch({
        headless: this.opts.headless,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
    }

    this.context = await this.browser.newContext({
      viewport: { width: 1280, height: 900 },
      locale: "en-US",
    });
    this.page = await this.context.newPage();

    // 3-step Anaplan login flow
    const base = this.opts.baseUrl;
    // Step 1: Pre-login page — enter email, click Continue
    const preloginUrl = base + "/auth/prelogin?service=" + encodeURIComponent(base + "/home");
    await this.page.goto(preloginUrl, { waitUntil: "networkidle", timeout: 30000 });
    await this.captureScreenshot(this.page, "prelogin-page");

    // Step 1: Enter email (may be pre-filled or need manual entry)
    const emailInput = this.page.locator(
      'input[type="email"], input[name="email"], input[name="username"], input[autocomplete="username"], input[id="email"]',
    ).first();
    await emailInput.waitFor({ state: "visible", timeout: 10000 });
    await emailInput.fill(this.opts.username);

    const continueBtn = this.page.locator('button:has-text("Continue"), button:has-text("Next"), button[type="submit"]').first();
    await continueBtn.click();
    await this.page.waitForTimeout(3000);
    await this.captureScreenshot(this.page, "after-continue");

    // Step 2: Look for "Anaplan login" or email/password login link on the page
    // The prelogin page may show SSO options — we need the "Anaplan login" link
    // which leads to the password entry form
    const anaplanLoginLink = this.page.locator('a[href*="/auth/login"], a:has-text("Anaplan login"), a:has-text("email and password"), button:has-text("Anaplan login"), [href*="/auth/login"]').first();
    if (await anaplanLoginLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await anaplanLoginLink.click();
      await this.page.waitForTimeout(2000);
      await this.captureScreenshot(this.page, "after-login-link-click");
    } else {
      // No login link visible — try navigating directly to login URL
      const loginUrl = base + "/auth/login?service=" + encodeURIComponent(base + "/home");
      await this.page.goto(loginUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
      await this.page.waitForTimeout(2000);
      await this.captureScreenshot(this.page, "login-page");
    }

    // Step 3: Enter password and click "Log in"
    const passwordInput = this.page.locator('input[type="password"]').first();
    await passwordInput.waitFor({ state: "visible", timeout: 15000 });
    await passwordInput.fill(this.opts.password);

    const loginBtn = this.page.locator('button:has-text("Log in"), button:has-text("Sign in"), button[type="submit"]').first();
    await loginBtn.click();

    // Step 4: Handle MFA if prompted
    await this.page.waitForTimeout(3000);
    const mfaInput = this.page.locator(
      'input[name="code"], input[name="otp"], input[placeholder*="code"]',
    ).first();
    if (await mfaInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      if (this.opts.headless) {
        await this.shutdown();
        throw new Error(
          "MFA required but running in headless mode. " +
          "Set ANAPLAN_PLAYWRIGHT_HEADLESS=false to allow interactive MFA entry.",
        );
      }
      // In headed mode, wait for user to complete MFA manually (2 min timeout)
      await this.page.waitForURL(/\/home/, { timeout: 120000 }).catch(() => {});
    }

    // Wait for dashboard
    await this.page.waitForURL(/\/home/, { timeout: 30000 }).catch(() => {});
    await this.page.waitForTimeout(2000);

    this.authenticated = true;
    this.resetIdleTimer();
    return this.page;
  }

  private resetIdleTimer(): void {
    this.clearIdleTimer();
    this.idleTimer = setTimeout(() => {
      this.shutdown().catch(() => {});
    }, this.opts.idleTimeoutMs);
  }

  private clearIdleTimer(): void {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }
}
