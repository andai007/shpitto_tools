import { promises as fs } from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";

import manifest from "@/skills/manifest.json";
import { PlanningFiles } from "@/lib/agent/planning-files";
import { generateP2WProject } from "@/lib/agent/p2w-graph";
import { selectStyleProfile } from "@/lib/agent/section-template-registry";
import { logError, logInfo, logWarn } from "@/lib/logger";

const ensureDir = async (dir: string) => {
  await fs.mkdir(dir, { recursive: true });
};

const parseTimeoutMs = (value: number, fallbackMs: number) => {
  if (!Number.isFinite(value)) return fallbackMs;
  if (value <= 0) return 0;
  return Math.floor(value);
};

const generationRequestTimeoutMs = parseTimeoutMs(
  Number(process.env.CREATION_REQUEST_TIMEOUT_MS || 120000),
  120000
);
const persistRequestTimeoutMs = parseTimeoutMs(
  Number(process.env.CREATION_PERSIST_REQUEST_TIMEOUT_MS || 0),
  0
);

const hasAnyApiKey = () =>
  Boolean(process.env.AIBERM_API_KEY || process.env.OPENROUTER_API_KEY || process.env.ANTHROPIC_API_KEY);

type GenerationResult = Awaited<ReturnType<typeof generateP2WProject>>;

type SandboxPayload = {
  components: Array<{ name: string; code: string }>;
  pages: Array<{ path: string; name: string; data: unknown }>;
  theme?: Record<string, unknown>;
};

const buildTemplateOnlyFallbackResult = (prompt: string) => {
  const profile = selectStyleProfile(prompt);
  if (!profile?.templates) return null;

  const isPamama =
    profile.id.toLowerCase().includes("pamama") ||
    profile.keywords.some((k) => String(k).toLowerCase().includes("pamama"));

  const theme = isPamama
    ? {
        mode: "light",
        motion: "subtle",
        radius: "0.25rem",
        fontHeading: "Space Grotesk",
        fontBody: "Space Grotesk",
        palette: {
          bg: "#f4f6f7",
          text: "#1f252b",
          muted: "#eef2f4",
          border: "#d6dde1",
          card: "#ffffff",
          primary: "#0093ad",
          accent: "#0093ad",
          textSecondary: "#4b5563",
        },
      }
    : {
        mode: "light",
        motion: "subtle",
        radius: "0.5rem",
        fontHeading: "Manrope",
        fontBody: "Manrope",
      };

  // Order tuned to match typical landing page flow and PAMA reference screenshots.
  const order = ["navigation", "hero", "approach", "story", "cta", "products", "contact", "socialproof", "footer"] as const;
  const anchorByKind: Record<(typeof order)[number], string> = {
    navigation: "top",
    hero: "top",
    approach: "settori",
    story: "chi-siamo",
    cta: "solution-provider",
    products: "prodotti",
    contact: "assistenza",
    socialproof: "highlights",
    footer: "footer",
  };

  const content = order
    .filter((kind) => Boolean(profile.templates?.[kind as any]))
    .map((kind, idx) => {
      const block = profile.templates?.[kind as any] as any;
      const props = JSON.parse(JSON.stringify(block.props ?? {})) as Record<string, unknown>;
      if (typeof props.id !== "string" || !props.id.trim()) {
        props.id = `${String(block.type || "Block")}-${idx + 1}`;
      }
      if (typeof props.anchor !== "string" || !props.anchor.trim()) {
        props.anchor = anchorByKind[kind];
      }
      return { type: String(block.type), props };
    });

  return {
    blueprint: {
      pages: [
        {
          path: "/",
          name: "Home",
          sections: content.map((section) => ({
            id: String((section as any)?.props?.id ?? ""),
            type: String(section.type ?? ""),
            intent: "Template-only fallback (no API key configured).",
          })),
        },
      ],
    },
    theme,
    pages: [
      {
        path: "/",
        name: "Home",
        data: {
          content,
          root: { props: { title: profile.name || "Home", theme } },
        },
      },
    ],
    components: [],
    errors: ["template_only_no_api_key"],
  };
};

const toSandboxPayload = (value: unknown): SandboxPayload => {
  const payload = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const components = Array.isArray(payload.components)
    ? payload.components.filter(
        (item): item is { name: string; code: string } =>
          Boolean(
            item &&
              typeof item === "object" &&
              typeof (item as Record<string, unknown>).name === "string" &&
              typeof (item as Record<string, unknown>).code === "string"
          )
      )
    : [];
  const pages = Array.isArray(payload.pages)
    ? payload.pages.filter(
        (item): item is { path: string; name: string; data: unknown } =>
          Boolean(
            item &&
              typeof item === "object" &&
              typeof (item as Record<string, unknown>).path === "string" &&
              typeof (item as Record<string, unknown>).name === "string" &&
              typeof (item as Record<string, unknown>).data === "object"
          )
      )
    : [];
  const theme =
    payload.theme && typeof payload.theme === "object" ? (payload.theme as Record<string, unknown>) : undefined;
  return { components, pages, theme };
};

const persistSandboxPayload = async (outDir: string, value: unknown) => {
  const sandboxDir = path.join(outDir, "sandbox");
  await ensureDir(sandboxDir);
  const sandboxPayload = toSandboxPayload(value);
  await fs.writeFile(path.join(sandboxDir, "payload.json"), JSON.stringify(sandboxPayload, null, 2));
};

const persistGeneratedResult = async (options: {
  outDir: string;
  prompt: string;
  requestId: string;
  id: string;
  result: GenerationResult;
  logLabel?: "persisted" | "persisted_after_timeout";
}) => {
  const { outDir, prompt, requestId, id, result, logLabel = "persisted" } = options;
  await fs.writeFile(path.join(outDir, "result.json"), JSON.stringify({ prompt, ...result }, null, 2));
  await persistSandboxPayload(outDir, result);
  logInfo("[creation] " + logLabel, { requestId, id, outDir });
  const planner = await PlanningFiles.init({ rootDir: outDir, prompt, requestId });
  await planner.markPersistComplete();
};

const buildTimeoutFallbackResult = (prompt: string) => {
  const title = prompt?.trim() ? prompt.trim().slice(0, 56) : "Generated Landing Page";
  return {
    blueprint: {
      pages: [
        {
          path: "/",
          name: "Home",
          sections: [
            { id: "hero", type: "HeroCentered", intent: "Fallback hero due timeout." },
            { id: "features", type: "FeatureGrid", intent: "Fallback feature cards due timeout." },
            { id: "footer", type: "Footer", intent: "Fallback footer due timeout." },
          ],
        },
      ],
    },
    theme: {
      mode: "light",
      motion: "off",
      radius: "0.5rem",
      fontHeading: "Manrope",
      fontBody: "Manrope",
    },
    components: [],
    pages: [
      {
        path: "/",
        name: "Home",
        data: {
          content: [
            {
              type: "Navbar",
              props: {
                id: "Navbar-1",
                links: [
                  { label: "Home", href: "#top" },
                  { label: "Features", href: "#features" },
                  { label: "Contact", href: "#contact" },
                ],
                ctas: [{ label: "Start", href: "#contact", variant: "primary" }],
                sticky: true,
                paddingY: "sm",
                maxWidth: "xl",
              },
            },
            {
              type: "HeroCentered",
              props: {
                id: "HeroCentered-1",
                title,
                subtitle: "Fast fallback loaded. Retry generation to replace with full AI output.",
                ctas: [{ label: "Retry Generate", href: "#top", variant: "primary" }],
                align: "center",
                paddingY: "lg",
                maxWidth: "xl",
              },
            },
            {
              type: "FeatureGrid",
              props: {
                id: "FeatureGrid-1",
                title: "Highlights",
                items: [
                  { title: "Stable", desc: "Timeout-safe fallback rendering.", icon: "shield" },
                  { title: "Fast", desc: "Page stays usable when AI call is slow.", icon: "rocket" },
                  { title: "Editable", desc: "You can continue editing in sandbox.", icon: "sparkles" },
                ],
                variant: "3col",
                paddingY: "lg",
                maxWidth: "xl",
              },
            },
            {
              type: "Footer",
              props: {
                id: "Footer-1",
                columns: [
                  { title: "Product", links: [{ label: "Overview", href: "#" }, { label: "Roadmap", href: "#" }] },
                  { title: "Company", links: [{ label: "About", href: "#" }, { label: "Contact", href: "#" }] },
                  { title: "Legal", links: [{ label: "Privacy", href: "#" }, { label: "Terms", href: "#" }] },
                ],
                variant: "multiColumn",
                paddingY: "md",
                maxWidth: "xl",
              },
            },
          ],
          root: {
            props: {
              title: "Home",
              theme: {
                mode: "light",
                motion: "off",
                radius: "0.5rem",
                fontHeading: "Manrope",
                fontBody: "Manrope",
              },
            },
          },
        },
      },
    ],
    errors: ["generation_timeout_fallback"],
  };
};

export async function POST(request: NextRequest) {
  const requestId = `creation_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const startedAt = Date.now();
  try {
    logInfo("[creation] start", { requestId });
    const body = await request.json();
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const resumeId = typeof body.resumeId === "string" ? body.resumeId.trim() : "";
    if (!prompt) {
      logWarn("[creation] empty_prompt", { requestId });
      return NextResponse.json({ error: "prompt_required", requestId }, { status: 400 });
    }
    if (!hasAnyApiKey()) {
      const fallback = buildTemplateOnlyFallbackResult(prompt);
      if (fallback) {
        const id = resumeId || `p2w_${Date.now()}`;
        logWarn("[creation] missing_api_key_template_only", { requestId, id, profileSelected: true });
        return NextResponse.json({
          requestId,
          id,
          prompt,
          durationMs: Date.now() - startedAt,
          pending: false,
          ...fallback,
        });
      }
      logError("[creation] missing_api_key", { requestId });
      return NextResponse.json({ error: "missing_api_key", requestId }, { status: 500 });
    }

    const id = resumeId || `p2w_${Date.now()}`;
    const persistEnabled = Boolean(body.persist) || Boolean(resumeId);
    const outDir = persistEnabled
      ? path.join(process.cwd(), "..", "asset-factory", "out", "p2w", id)
      : "";
    if (persistEnabled) {
      await ensureDir(outDir);
    }

    const requestTimeoutMs = persistEnabled ? persistRequestTimeoutMs : generationRequestTimeoutMs;
    logInfo("[creation] generate", {
      requestId,
      promptLength: prompt.length,
      timeoutMs: requestTimeoutMs,
      persistEnabled,
    });
    const generationPromise = generateP2WProject({
      prompt,
      manifest,
      planning: persistEnabled ? { dir: outDir, requestId } : undefined,
    });

    const generated =
      requestTimeoutMs > 0
        ? await Promise.race([
            generationPromise.then((result) => ({ kind: "ok" as const, result })),
            new Promise<{ kind: "timeout" }>((resolve) =>
              setTimeout(() => resolve({ kind: "timeout" }), requestTimeoutMs)
            ),
          ])
        : ({ kind: "ok" as const, result: await generationPromise });

    if (generated.kind === "timeout") {
      logWarn("[creation] timeout_fallback", { requestId, timeoutMs: requestTimeoutMs, persistEnabled });
      if (persistEnabled) {
        logInfo("[creation] persist_deferred", {
          requestId,
          id,
          reason: "timeout_fallback",
        });
        void generationPromise
          .then((resolved) =>
            persistGeneratedResult({
              outDir,
              prompt,
              requestId,
              id,
              result: resolved,
              logLabel: "persisted_after_timeout",
            })
          )
          .catch((error: any) => {
            logError("[creation] persist_deferred_failed", {
              requestId,
              id,
              message: error?.message ?? String(error),
              details: error?.details,
            });
          });
      }
      const timeoutResult = buildTimeoutFallbackResult(prompt);
      logInfo("[creation] generated", {
        requestId,
        id,
        pages: Array.isArray(timeoutResult.pages) ? timeoutResult.pages.length : 0,
        components: Array.isArray(timeoutResult.components) ? timeoutResult.components.length : 0,
        errors: timeoutResult.errors,
        timeoutFallback: true,
      });
      return NextResponse.json({
        requestId,
        id,
        prompt,
        durationMs: Date.now() - startedAt,
        pending: persistEnabled,
        timeoutMs: requestTimeoutMs,
        ...timeoutResult,
      });
    }

    const result = generated.result;
    logInfo("[creation] generated", {
      requestId,
      id,
      pages: Array.isArray(result.pages) ? result.pages.length : 0,
      components: Array.isArray(result.components) ? result.components.length : 0,
      errors: result.errors,
    });
    if (persistEnabled) {
      await persistGeneratedResult({
        outDir,
        prompt,
        requestId,
        id,
        result,
        logLabel: "persisted",
      });
    }

    return NextResponse.json({ requestId, id, prompt, durationMs: Date.now() - startedAt, ...result });
  } catch (error: any) {
    logError("[creation] error", {
      requestId,
      message: error?.message ?? String(error),
      details: error?.details,
    });
    const detail =
      process.env.NODE_ENV !== "production"
        ? { message: error?.message ?? String(error), details: error?.details }
        : undefined;
    return NextResponse.json({ error: "generation_failed", detail, requestId }, { status: 500 });
  }
}
