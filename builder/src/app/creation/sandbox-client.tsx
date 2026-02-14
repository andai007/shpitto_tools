"use client";

import React from "react";
import Script from "next/script";
import { useSearchParams } from "next/navigation";
import { Puck, Render, type Config, type Data } from "@measured/puck";
import "@measured/puck/puck.css";

import { compileJIT } from "@/lib/runtime";
import { MotionProvider } from "@/components/theme/motion";
import { normalizePuckData } from "@/lib/design-system-enforcer";
import { puckConfig } from "@/puck/config";

const DEFAULT_THEME_LIGHT = {
  background: "0 0% 100%",
  foreground: "222 47% 11%",
  muted: "210 40% 96%",
  mutedForeground: "215 16% 47%",
  border: "214 32% 91%",
  card: "0 0% 100%",
};

const DEFAULT_THEME_DARK = {
  background: "222 47% 8%",
  foreground: "210 40% 98%",
  muted: "220 15% 16%",
  mutedForeground: "215 20% 65%",
  border: "220 13% 24%",
  card: "222 47% 10%",
};

const GENERIC_FONT_FAMILIES = new Set([
  "serif",
  "sans-serif",
  "monospace",
  "cursive",
  "fantasy",
  "system-ui",
  "ui-serif",
  "ui-sans-serif",
  "ui-monospace",
]);

const extractFontFamily = (value?: string) => {
  if (!value || typeof value !== "string") return "";
  const first = value.split(",")[0]?.replace(/["']/g, "").trim();
  if (!first) return "";
  if (GENERIC_FONT_FAMILIES.has(first.toLowerCase())) return "";
  return first;
};

const hexToHsl = (hex?: string) => {
  if (!hex) return null;
  const normalizedRaw = hex.replace("#", "").trim();
  const normalized =
    normalizedRaw.length === 3
      ? normalizedRaw
          .split("")
          .map((char) => `${char}${char}`)
          .join("")
      : normalizedRaw;
  if (normalized.length !== 6) return null;
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if (max === r) h = ((g - b) / delta) % 6;
    if (max === g) h = (b - r) / delta + 2;
    if (max === b) h = (r - g) / delta + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  return `${h} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const colorToHslTriplet = (value?: string | null) => {
  if (!value || typeof value !== "string") return null;
  const normalized = value.trim();
  if (!normalized) return null;
  if (normalized.startsWith("#")) return hexToHsl(normalized);
  const hslWrapped = normalized.match(/^hsl\((.+)\)$/i);
  const hslBody = hslWrapped?.[1]?.trim();
  if (hslBody) {
    return hslBody
      .replace(/\s*\/\s*[\d.]+%?\s*$/, "")
      .replace(/,/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }
  if (/^\d+(\.\d+)?\s+\d+(\.\d+)?%\s+\d+(\.\d+)?%$/.test(normalized)) return normalized;
  return null;
};

const lightnessFromHslTriplet = (triplet: string) => {
  const parts = triplet.trim().split(/\s+/);
  const lightness = Number(parts[2]?.replace("%", ""));
  return Number.isFinite(lightness) ? lightness : 50;
};

const buildGoogleFontsImport = (fontHeading: string, fontBody: string) => {
  const families = Array.from(new Set([extractFontFamily(fontHeading), extractFontFamily(fontBody)].filter(Boolean)));
  if (!families.length) return "";
  const query = families
    .map((family) => `family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@300;400;500;600;700;800`)
    .join("&");
  return `@import url('https://fonts.googleapis.com/css2?${query}&display=swap');`;
};

const buildThemeCss = (theme?: Record<string, any>) => {
  const mode = theme?.mode === "dark" ? "dark" : "light";
  const base = mode === "dark" ? DEFAULT_THEME_DARK : DEFAULT_THEME_LIGHT;
  const palette = theme?.palette && typeof theme.palette === "object" ? (theme.palette as Record<string, any>) : {};
  const background = colorToHslTriplet(palette.bg || palette.background) || base.background;
  const foreground = colorToHslTriplet(palette.text || palette.foreground) || base.foreground;
  const muted = colorToHslTriplet(palette.neutral || palette.muted) || base.muted;
  const mutedForeground = colorToHslTriplet(palette.textSecondary || palette.mutedForeground) || base.mutedForeground;
  const border = colorToHslTriplet(palette.border || palette.neutral) || base.border;
  const card = colorToHslTriplet(palette.card || palette.neutral || palette.bg) || base.card;
  const primary =
    colorToHslTriplet(palette.primary) ||
    colorToHslTriplet(theme?.primaryColor) ||
    (mode === "dark" ? "262 83% 62%" : "222 89% 52%");
  const accent = colorToHslTriplet(palette.accent) || primary;
  const primaryForeground = lightnessFromHslTriplet(primary) > 58 ? "222 47% 11%" : "210 40% 98%";
  const accentForeground = lightnessFromHslTriplet(accent) > 58 ? "222 47% 11%" : "210 40% 98%";
  const radius = theme?.radius || "14px";
  const fontHeading = theme?.fontHeading || "Inter";
  const fontBody = theme?.fontBody || "Inter";
  const fontImport = buildGoogleFontsImport(fontHeading, fontBody);
  return `${fontImport}:root{--background:${background};--foreground:${foreground};--muted:${muted};--muted-foreground:${mutedForeground};--border:${border};--primary:${primary};--primary-foreground:${primaryForeground};--accent:${accent};--accent-foreground:${accentForeground};--card:${card};--radius:${radius};--font-heading:${fontHeading};--font-body:${fontBody};--space-1:0.25rem;--space-2:0.5rem;--space-3:0.75rem;--space-4:1rem;--space-6:1.5rem;--space-8:2rem;--space-12:3rem;}body{background:hsl(var(--background));color:hsl(var(--foreground));font-family:var(--font-body),ui-sans-serif,system-ui;} .font-heading{font-family:var(--font-heading),var(--font-body),ui-serif,serif;} .font-body{font-family:var(--font-body),ui-sans-serif,system-ui;}`;
};

const tailwindRuntimeConfigScript = `
window.tailwind = window.tailwind || {};
window.tailwind.config = {
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        border: "hsl(var(--border))",
        card: "hsl(var(--card))"
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      }
    }
  }
};
console.info("[creation:sandbox] tailwind_runtime_config_loaded", {
  tokens: ["background", "foreground", "muted", "primary", "accent", "border", "card"]
});
`;

type IncomingMessage =
  | {
      type: "puck:load";
      payload: SandboxLoadPayload;
    }
  | { type: "puck:ping" };

type SandboxLoadPayload = {
  components: Array<{ name: string; code: string }>;
  page: { data: Data };
  theme?: Record<string, any>;
  pageIndex?: number;
};

type CreationSandboxClientProps = {
  initialPayload?: SandboxLoadPayload;
};

const safeStructuredClone = <T,>(value: T): T => {
  // Safari < 15.4 may not have structuredClone; sandbox payload is JSON-safe.
  if (typeof (globalThis as any).structuredClone === "function") {
    return (globalThis as any).structuredClone(value) as T;
  }
  return JSON.parse(JSON.stringify(value)) as T;
};

const detectPrimitiveArrayFields = (code: string) => {
  const fields = new Set<string>();
  const pattern = /(\w+)\.map\(\((\w+)(?:\s*,\s*\w+)?\)\s*=>[\s\S]{0,260}\{\2\}/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(code)) !== null) {
    const field = match[1]?.trim();
    if (field) fields.add(field);
  }
  return Array.from(fields);
};

const coerceObjectArrayToStringArray = (value: unknown): string[] | null => {
  if (!Array.isArray(value)) return null;
  const next = value
    .map((item) => {
      if (typeof item === "string") return item;
      if (!item || typeof item !== "object") return "";
      const record = item as Record<string, unknown>;
      const preferredKeys = ["paragraph", "text", "label", "title", "description", "value", "name"];
      for (const key of preferredKeys) {
        const candidate = record[key];
        if (typeof candidate === "string" && candidate.trim()) return candidate;
      }
      const firstString = Object.values(record).find((entry) => typeof entry === "string" && entry.trim());
      return typeof firstString === "string" ? firstString : "";
    })
    .filter((item) => typeof item === "string" && item.trim());
  return next.length ? next : null;
};

const coercePageDataArrays = (
  pageData: Data,
  primitiveArrayFieldsByType: Map<string, string[]>
): Data => {
  if (!primitiveArrayFieldsByType.size) return pageData;
  const cloned = safeStructuredClone(pageData) as Record<string, any>;
  const content = Array.isArray(cloned?.content) ? (cloned.content as Array<Record<string, any>>) : [];
  content.forEach((item) => {
    const type = typeof item?.type === "string" ? item.type : "";
    const props = item?.props;
    if (!type || !props || typeof props !== "object") return;
    const fields = primitiveArrayFieldsByType.get(type);
    if (!fields?.length) return;
    fields.forEach((field) => {
      const coerced = coerceObjectArrayToStringArray((props as Record<string, unknown>)[field]);
      if (coerced) (props as Record<string, unknown>)[field] = coerced;
    });
  });
  return cloned as Data;
};

const normalizeEditorKeys = (pageData: Data): Data => {
  const cloned = safeStructuredClone(pageData) as Record<string, any>;

  const normalizeItems = (items: unknown[], prefix: string) => {
    const seen = new Set<string>();
    return items.map((item, index) => {
      const input = item && typeof item === "object" ? (item as Record<string, any>) : {};
      const type = typeof input.type === "string" && input.type.trim() ? input.type.trim() : "block";
      const existingKey = typeof input._key === "string" && input._key.trim() ? input._key.trim() : "";
      const baseKey = existingKey || `${prefix}-${type}-${index}`;
      let key = baseKey;
      let suffix = 1;
      while (seen.has(key)) {
        key = `${baseKey}-${suffix}`;
        suffix += 1;
      }
      seen.add(key);
      const props = input.props && typeof input.props === "object" ? { ...input.props } : {};
      if (typeof props.id !== "string" || !props.id.trim()) {
        props.id = key;
      }
      return { ...input, _key: key, props };
    });
  };

  if (Array.isArray(cloned.content)) {
    cloned.content = normalizeItems(cloned.content, "content");
  }

  if (cloned.zones && typeof cloned.zones === "object" && !Array.isArray(cloned.zones)) {
    const zones = cloned.zones as Record<string, unknown>;
    cloned.zones = Object.fromEntries(
      Object.entries(zones).map(([zoneKey, value]) => {
        if (!Array.isArray(value)) return [zoneKey, value];
        return [zoneKey, normalizeItems(value, `zone-${zoneKey}`)];
      })
    );
  }

  return cloned as Data;
};

const createMissingBlockComponent = (blockType: string): React.ComponentType<any> => {
  const MissingBlock: React.FC<{ id?: string; anchor?: string }> = ({ id, anchor }) => (
    <section
      id={anchor}
      data-block={blockType}
      data-block-id={id || `${blockType}-missing`}
      className="mx-auto my-6 w-full max-w-5xl rounded-lg border border-dashed border-amber-400/60 bg-amber-50 px-4 py-3 text-sm text-amber-700"
    >
      Missing block renderer: {blockType}
    </section>
  );
  MissingBlock.displayName = `MissingBlock_${blockType}`;
  return MissingBlock;
};

class BlockErrorBoundary extends React.Component<
  { blockName: string; children: React.ReactNode },
  { hasError: boolean; message?: string }
> {
  constructor(props: { blockName: string; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: undefined };
  }

  static getDerivedStateFromError(error: unknown) {
    const message = error instanceof Error ? error.message : "runtime_error";
    return { hasError: true, message };
  }

  componentDidCatch(error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[creation:sandbox] block_runtime_error", {
      block: this.props.blockName,
      message,
    });
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <section className="mx-auto my-6 w-full max-w-5xl rounded-lg border border-dashed border-red-400/60 bg-red-50 px-4 py-3 text-sm text-red-700">
        Block render failed: {this.props.blockName}
        {this.state.message ? ` (${this.state.message})` : ""}
      </section>
    );
  }
}

export default function CreationSandboxClient({ initialPayload }: CreationSandboxClientProps) {
  const searchParams = useSearchParams();
  const isEdit = searchParams.get("mode") === "edit";
  const [config, setConfig] = React.useState<Config | null>(null);
  const [data, setData] = React.useState<Data | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [themeCss, setThemeCss] = React.useState<string>("");
  const [motionMode, setMotionMode] = React.useState<"off" | "subtle" | "showcase">("showcase");
  const [pageKey, setPageKey] = React.useState<string>("page-0");
  const pageIndexRef = React.useRef<number>(0);
  const postToHost = React.useCallback((message: unknown) => {
    window.parent?.postMessage(message, "*");
    if (window.opener && window.opener !== window) {
      window.opener.postMessage(message, "*");
    }
  }, []);

  React.useEffect(() => {
    console.info("[creation:sandbox] preview_mode", { mode: isEdit ? "edit" : "preview" });
  }, [isEdit]);

  const applyLoadPayload = React.useCallback(
    (payload: SandboxLoadPayload) => {
      try {
        setLoadError(null);
        pageIndexRef.current = payload.pageIndex ?? 0;
        setPageKey(`page-${pageIndexRef.current}`);
        const nextConfig: Config = {
          components: {
            ...((puckConfig as any)?.components ?? {}),
          },
        };
        const failures: string[] = [];
        const primitiveArrayFieldsByType = new Map<string, string[]>();
        payload.components.forEach((component) => {
          const primitiveArrayFields = detectPrimitiveArrayFields(component.code);
          if (primitiveArrayFields.length) {
            primitiveArrayFieldsByType.set(component.name, primitiveArrayFields);
          }
          const compiled = compileJIT(component.code);
          if (!compiled) {
            failures.push(component.name);
            return;
          }
          const Comp = compiled.render as React.ComponentType<any>;
          const WrappedComponent: React.FC<any> = (props) => (
            <BlockErrorBoundary blockName={component.name}>
              <Comp {...props} />
            </BlockErrorBoundary>
          );
          WrappedComponent.displayName = `Wrapped_${component.name}`;
          nextConfig.components[component.name] = {
            ...(compiled.config ?? {}),
            render: WrappedComponent,
          } as any;
        });

        const rawContent = Array.isArray((payload.page as any)?.data?.content)
          ? ((payload.page as any).data.content as Array<{ type?: unknown }>)
          : [];
        const requiredTypes = Array.from(
          new Set(
            rawContent
              .map((item) => (typeof item?.type === "string" ? item.type.trim() : ""))
              .filter(Boolean)
          )
        );
        const missingTypes = requiredTypes.filter(
          (type) => !(nextConfig.components as Record<string, unknown>)[type]
        );
        missingTypes.forEach((type) => {
          (nextConfig.components as Record<string, any>)[type] = {
            render: createMissingBlockComponent(type),
            fields: {},
            defaultProps: { id: `${type}-missing`, anchor: `${type}-missing` },
          };
        });
        if (missingTypes.length) {
          failures.push(...missingTypes.map((type) => `${type}:missing_renderer`));
        }

        if (failures.length) {
          postToHost({ type: "puck:compile", payload: { failures } });
        }
        const coercedPageData = coercePageDataArrays(payload.page.data, primitiveArrayFieldsByType);
        const keyedPageData = normalizeEditorKeys(coercedPageData);
        const nextData = isEdit ? normalizePuckData(keyedPageData, { logChanges: true }) : keyedPageData;
        setConfig(nextConfig);
        setData(nextData);
        setThemeCss(buildThemeCss(payload.theme));
        setMotionMode((payload.theme?.motion as any) || "showcase");
        document.documentElement.classList.toggle("dark", payload.theme?.mode === "dark");
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error("[creation:sandbox] apply_load_payload_failed", { message });
        setLoadError(message || "apply_load_payload_failed");
      }
    },
    [isEdit, postToHost]
  );

  React.useEffect(() => {
    if (!initialPayload) return;
    applyLoadPayload(initialPayload);
  }, [applyLoadPayload, initialPayload]);

  React.useEffect(() => {
    const onMessage = (event: MessageEvent<IncomingMessage>) => {
      if (!event.data || typeof event.data !== "object") return;
      if (event.data.type === "puck:load") {
        applyLoadPayload(event.data.payload);
        return;
      }
      if (event.data.type === "puck:ping") {
        postToHost({ type: "puck:ready" });
      }
    };
    window.addEventListener("message", onMessage);
    postToHost({ type: "puck:ready" });
    return () => window.removeEventListener("message", onMessage);
  }, [applyLoadPayload, postToHost]);

  const handlePublish = React.useCallback(
    (nextData: Data) => {
      setData(nextData);
      postToHost({ type: "puck:update", payload: { data: nextData, pageIndex: pageIndexRef.current } });
    },
    [postToHost]
  );

  return (
    <div
      data-sandbox-ready={config && data ? "1" : "0"}
      className={
        isEdit
          ? "h-screen w-screen overflow-hidden bg-background text-foreground"
          : "min-h-screen w-full bg-background text-foreground"
      }
    >
      <Script id="tailwind-runtime-config" strategy="beforeInteractive">
        {tailwindRuntimeConfigScript}
      </Script>
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      {themeCss ? <style dangerouslySetInnerHTML={{ __html: themeCss }} /> : null}
      {config && data ? (
        <MotionProvider mode={motionMode}>
          {isEdit ? (
            <Puck
              key={pageKey}
              config={config}
              data={normalizePuckData(data, { logChanges: true })}
              onPublish={handlePublish}
            />
          ) : (
            <main>
              <Render config={config} data={data as any} />
            </main>
          )}
        </MotionProvider>
      ) : (
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          {loadError ? `Load failed: ${loadError}` : "等待生成内容…"}
        </div>
      )}
    </div>
  );
}
