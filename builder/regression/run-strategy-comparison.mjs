#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import fetch from "node-fetch";

const ROOT = process.cwd();
const REPO_ROOT = path.resolve(ROOT, "..");
const PROMPTS_FILE = path.join(ROOT, "regression", "prompts.baseline.json");
const REPORT_DIR = path.join(ROOT, "regression", "strategy-comparison");
const SCREENSHOT_DIR = path.join(REPORT_DIR, "screenshots");
const PORT = Number(process.env.STRATEGY_COMPARE_PORT || 3110);
// In some sandboxed environments binding 0.0.0.0 is blocked (EPERM). Force localhost.
const HOST = String(process.env.STRATEGY_COMPARE_HOST || "127.0.0.1").trim() || "127.0.0.1";
const BASE_URL = `http://${HOST}:${PORT}`;
const SERVER_MODE = String(process.env.STRATEGY_COMPARE_SERVER_MODE || "dev")
  .trim()
  .toLowerCase();

const parseArgs = (argv) => {
  const options = {
    maxCases: 0,
    groups: "",
    promptsFile: PROMPTS_FILE,
    renderer: "sandbox",
  };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--max-cases" && next) {
      options.maxCases = Number(next) || 0;
      i += 1;
      continue;
    }
    if (arg === "--groups" && next) {
      options.groups = String(next);
      i += 1;
      continue;
    }
    if (arg === "--prompts" && next) {
      options.promptsFile = path.resolve(ROOT, next);
      i += 1;
      continue;
    }
    if (arg === "--renderer" && next) {
      const value = String(next).trim().toLowerCase();
      options.renderer = value === "render" ? "render" : "sandbox";
      i += 1;
      continue;
    }
  }
  return options;
};

const nowStamp = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(
    d.getSeconds()
  )}`;
};

const slug = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const safeJson = async (res) => {
  try {
    return await res.json();
  } catch {
    return null;
  }
};

const readJsonFile = async (filePath) => {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const hasRenderablePage = (payload) =>
  Boolean(payload?.pages?.[0]?.data && Array.isArray(payload?.pages?.[0]?.data?.content) && payload.pages[0].data.content.length > 0);

const getPersistedPayloadPath = (id) =>
  path.join(REPO_ROOT, "asset-factory", "out", "p2w", String(id || ""), "sandbox", "payload.json");

const waitForPersistedPayload = async (id, timeoutMs = 120000) => {
  const payloadPath = getPersistedPayloadPath(id);
  const startedAt = Date.now();
  let latestPayload = null;
  while (Date.now() - startedAt < timeoutMs) {
    const nextPayload = await readJsonFile(payloadPath);
    if (nextPayload) {
      latestPayload = nextPayload;
      if (hasRenderablePage(nextPayload)) {
        return {
          payload: nextPayload,
          payloadPath,
          timedOut: false,
          waitedMs: Date.now() - startedAt,
        };
      }
    }
    await wait(1000);
  }
  return {
    payload: latestPayload,
    payloadPath,
    timedOut: true,
    waitedMs: Date.now() - startedAt,
  };
};

const killPort = async (port) => {
  const cmd = `lsof -iTCP:${port} -sTCP:LISTEN -n -P | tail -n +2 | awk '{print $2}' | xargs -r kill`;
  await runShell(cmd, { cwd: ROOT, allowFailure: true });
};

const runShell = (cmd, options = {}) =>
  new Promise((resolve, reject) => {
    const child = spawn("zsh", ["-lc", cmd], {
      cwd: options.cwd || ROOT,
      env: { ...process.env, ...(options.env || {}) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0 && !options.allowFailure) {
        reject(new Error(`Command failed (${code}): ${cmd}\n${stderr || stdout}`));
        return;
      }
      resolve({ code: code ?? 0, stdout, stderr });
    });
  });

const startServerWithScript = async (envOverrides, scriptName) => {
  const child = spawn("npm", ["run", scriptName, "--", "-H", HOST, "-p", String(PORT)], {
    cwd: ROOT,
    env: { ...process.env, ...envOverrides },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let bootLog = "";
  let ready = false;
  const readyPromise = new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Server start timeout. Log:\n${bootLog}`));
    }, 30000);
    const onData = (chunk) => {
      const text = String(chunk);
      bootLog += text;
      if (text.includes("Ready in")) {
        ready = true;
        clearTimeout(timeout);
        resolve();
      }
    };
    child.stdout.on("data", onData);
    child.stderr.on("data", (chunk) => {
      bootLog += String(chunk);
    });
    child.on("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on("close", (code) => {
      if (!ready) {
        clearTimeout(timeout);
        reject(new Error(`Server exited early (${code}). Log:\n${bootLog}`));
      }
    });
  });

  await readyPromise;
  return {
    mode: scriptName,
    child,
    stop: async () => {
      if (!child.killed) {
        child.kill("SIGTERM");
      }
      await wait(800);
      await killPort(PORT);
    },
  };
};

const startServer = async (envOverrides) => {
  if (SERVER_MODE === "dev") {
    return await startServerWithScript(envOverrides, "dev");
  }
  if (SERVER_MODE === "auto") {
    try {
      return await startServerWithScript(envOverrides, "start");
    } catch {
      return await startServerWithScript(envOverrides, "dev");
    }
  }
  try {
    return await startServerWithScript(envOverrides, "start");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/Could not find a production build|production-start-no-build-id|next build/i.test(message)) {
      console.warn("[warn] next start unavailable (missing .next build), fallback to next dev");
      return await startServerWithScript(envOverrides, "dev");
    }
    throw error;
  }
};

const writeRenderablePage = async (siteKey, pageData) => {
  const outDir = path.join(REPO_ROOT, "asset-factory", "out", siteKey, "pages", "home");
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, "page.json"), JSON.stringify(pageData, null, 2));
};

const writeSandboxPayload = async (siteKey, payload) => {
  const outDir = path.join(REPO_ROOT, "asset-factory", "out", siteKey, "sandbox");
  await fs.mkdir(outDir, { recursive: true });
  const nextPayload = {
    components: Array.isArray(payload?.components) ? payload.components : [],
    pages: Array.isArray(payload?.pages) ? payload.pages : [],
    theme: payload?.theme && typeof payload.theme === "object" ? payload.theme : {},
  };
  await fs.writeFile(path.join(outDir, "payload.json"), JSON.stringify(nextPayload, null, 2));
};

const captureScreenshot = async (url, outPath, options = {}) => {
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  const waitForSelector =
    typeof options.waitForSelector === "string" && options.waitForSelector.trim()
      ? ` --wait-for-selector ${JSON.stringify(options.waitForSelector)}`
      : "";
  const waitForTimeout =
    Number.isFinite(Number(options.waitForTimeout)) && Number(options.waitForTimeout) > 0
      ? ` --wait-for-timeout ${Math.floor(Number(options.waitForTimeout))}`
      : "";
  const timeoutArg =
    Number.isFinite(Number(options.timeout)) && Number(options.timeout) > 0
      ? ` --timeout ${Math.floor(Number(options.timeout))}`
      : "";
  const cmd = `cd ${JSON.stringify(ROOT)} && npx playwright screenshot --full-page${waitForSelector}${waitForTimeout}${timeoutArg} ${JSON.stringify(
    url
  )} ${JSON.stringify(outPath)}`;
  await runShell(cmd, { cwd: ROOT });
};

const groups = [
  {
    id: "A_hybrid_legacy",
    label: "A: Hybrid Legacy",
    env: {
      BUILDER_SECTION_GENERATION_STRATEGY: "hybrid",
      BUILDER_TEMPLATE_SECTIONS: "footercta,footer-cta,cta,socialproof,social-proof,testimonial,trustlogo",
      BUILDER_LLM_SECTIONS: "",
      BUILDER_TEMPLATE_FIRST_VARIANTS: "cta,socialproof",
      CREATION_REQUEST_TIMEOUT_MS: "180000",
      CREATION_PERSIST_REQUEST_TIMEOUT_MS: "180000",
    },
  },
  {
    id: "B_hybrid_split",
    label: "B: Hybrid Split (Template-first + LLM Hero/Story)",
    env: {
      BUILDER_SECTION_GENERATION_STRATEGY: "hybrid",
      BUILDER_TEMPLATE_SECTIONS:
        "navigation,footer,footercta,footer-cta,cta,socialproof,social-proof,testimonial,trustlogo,products,catalog,metrics,stats,contact",
      BUILDER_LLM_SECTIONS: "hero,studiostory,story,showcase",
      BUILDER_TEMPLATE_FIRST_VARIANTS: "cta,socialproof,contact,catalog",
      CREATION_REQUEST_TIMEOUT_MS: "180000",
      CREATION_PERSIST_REQUEST_TIMEOUT_MS: "180000",
    },
  },
  {
    id: "C_template_first",
    label: "C: Template First",
    env: {
      BUILDER_SECTION_GENERATION_STRATEGY: "template_first",
      BUILDER_TEMPLATE_SECTIONS:
        "navigation,footer,footercta,footer-cta,cta,socialproof,social-proof,testimonial,trustlogo,products,catalog,metrics,stats,contact",
      BUILDER_LLM_SECTIONS: "",
      BUILDER_TEMPLATE_FIRST_VARIANTS: "cta,socialproof,contact,catalog",
      CREATION_REQUEST_TIMEOUT_MS: "180000",
      CREATION_PERSIST_REQUEST_TIMEOUT_MS: "180000",
    },
  },
];

const buildMarkdownReport = (summary) => {
  const lines = [];
  lines.push(`# Strategy Comparison (${summary.runId})`);
  lines.push("");
  lines.push(`Base URL: \`${BASE_URL}\``);
  lines.push(`Renderer: \`${summary.renderer}\``);
  lines.push("");
  for (const group of summary.groups) {
    lines.push(`## ${group.label}`);
    lines.push("");
    lines.push(`- Pass: ${group.passed}/${group.total}`);
    lines.push(`- Avg duration: ${Math.round(group.avgDurationMs)} ms`);
    lines.push("");
    lines.push("| Case | Status | Duration(ms) | URL | Screenshot |");
    lines.push("|---|---:|---:|---|---|");
    for (const row of group.results) {
      lines.push(
        `| ${row.caseId} | ${row.ok ? "PASS" : "FAIL"} | ${row.durationMs} | [open](${row.url || ""}) | [image](${row.screenshot || ""}) |`
      );
    }
    lines.push("");
  }
  return `${lines.join("\n")}\n`;
};

const run = async () => {
  const options = parseArgs(process.argv);
  const runId = `compare-${nowStamp()}`;
  await fs.mkdir(REPORT_DIR, { recursive: true });
  await fs.mkdir(SCREENSHOT_DIR, { recursive: true });

  const promptsRaw = await fs.readFile(options.promptsFile, "utf8");
  const prompts = JSON.parse(promptsRaw);
  const rawCases = Array.isArray(prompts?.cases) ? prompts.cases : [];
  const cases = options.maxCases > 0 ? rawCases.slice(0, options.maxCases) : rawCases;
  if (!cases.length) {
    throw new Error(`No cases found in ${options.promptsFile}`);
  }
  const selectedGroups =
    options.groups.trim().length > 0
      ? groups.filter((group) => options.groups.split(",").map((item) => item.trim()).includes(group.id))
      : groups;
  if (!selectedGroups.length) {
    throw new Error(`No groups selected. Available: ${groups.map((group) => group.id).join(", ")}`);
  }

  const output = {
    runId,
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    serverMode: SERVER_MODE,
    renderer: options.renderer,
    promptsFile: options.promptsFile,
    groups: [],
  };

  for (const group of selectedGroups) {
    console.log(`\n[group] ${group.label} start`);
    await killPort(PORT);
    const server = await startServer(group.env);
    const groupRows = [];
    try {
      for (let i = 0; i < cases.length; i += 1) {
        const c = cases[i];
        const startedAt = Date.now();
        const res = await fetch(`${BASE_URL}/api/creation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: c.prompt, persist: true }),
        });
        const payload = await safeJson(res);
        let finalPayload = payload;
        let persistWaitMs = 0;
        let persistWaitTimedOut = false;
        if (res.ok && typeof payload?.id === "string" && payload.id.trim()) {
          const shouldWaitForPersisted =
            Boolean(payload?.pending) ||
            !hasRenderablePage(payload) ||
            (Array.isArray(payload?.errors) && payload.errors.includes("generation_timeout_fallback"));
          if (shouldWaitForPersisted) {
            const persisted = await waitForPersistedPayload(payload.id, 150000);
            persistWaitMs = persisted.waitedMs;
            persistWaitTimedOut = persisted.timedOut;
            if (persisted.payload) {
              finalPayload = persisted.payload;
            }
          } else {
            const persistedNow = await readJsonFile(getPersistedPayloadPath(payload.id));
            if (hasRenderablePage(persistedNow)) {
              finalPayload = persistedNow;
            }
          }
        }
        const durationMs = Date.now() - startedAt;
        const pageData = finalPayload?.pages?.[0]?.data;
        const ok = Boolean(
          res.ok &&
            !persistWaitTimedOut &&
            pageData &&
            Array.isArray(pageData?.content) &&
            pageData.content.length > 0
        );
        const siteKey = `bench_${slug(runId)}_${slug(group.id)}_${slug(c.id)}`;
        let renderUrl = "";
        let screenshotPath = "";
        if (ok) {
          await writeSandboxPayload(siteKey, finalPayload);
          await writeRenderablePage(siteKey, pageData);
          renderUrl =
            options.renderer === "render"
              ? `${BASE_URL}/render?siteKey=${encodeURIComponent(siteKey)}&page=home&motion=off`
              : `${BASE_URL}/creation/sandbox?mode=preview&siteKey=${encodeURIComponent(siteKey)}&page=home`;
          screenshotPath = path.join(SCREENSHOT_DIR, group.id, `${c.id}.png`);
          const screenshotOptions =
            options.renderer === "sandbox"
              ? {
                  waitForSelector: "[data-sandbox-ready='1']",
                  waitForTimeout: 1800,
                  timeout: 60000,
                }
              : {
                  waitForSelector: "main",
                  waitForTimeout: 500,
                  timeout: 30000,
                };
          await captureScreenshot(renderUrl, screenshotPath, screenshotOptions);
        }
        groupRows.push({
          caseId: c.id,
          ok,
          statusCode: res.status,
          durationMs,
          errors: Array.isArray(payload?.errors) ? payload.errors : [],
          persistWaitMs,
          persistWaitTimedOut,
          requestId: payload?.requestId ?? null,
          responseId: payload?.id ?? null,
          url: renderUrl,
          screenshot: screenshotPath,
        });
        console.log(
          `[group:${group.id}] ${i + 1}/${cases.length} ${c.id} ${ok ? "PASS" : "FAIL"} duration=${durationMs}ms`
        );
      }
    } finally {
      await server.stop();
    }

    const passed = groupRows.filter((row) => row.ok).length;
    const total = groupRows.length;
    const avgDurationMs =
      total > 0 ? groupRows.reduce((sum, row) => sum + row.durationMs, 0) / total : 0;
    output.groups.push({
      id: group.id,
      label: group.label,
      env: group.env,
      total,
      passed,
      avgDurationMs,
      results: groupRows,
    });
  }

  const jsonPath = path.join(REPORT_DIR, `${runId}.json`);
  const mdPath = path.join(REPORT_DIR, `${runId}.md`);
  await fs.writeFile(jsonPath, JSON.stringify(output, null, 2));
  await fs.writeFile(mdPath, buildMarkdownReport(output));

  console.log("\n[done] strategy comparison completed");
  console.log(`[done] report(json): ${jsonPath}`);
  console.log(`[done] report(md): ${mdPath}`);
};

run().catch((error) => {
  const message = error instanceof Error ? `${error.message}\n${error.stack || ""}` : String(error);
  console.error(`[fatal] ${message}`);
  process.exit(1);
});
