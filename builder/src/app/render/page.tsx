import { promises as fs } from "fs";
import path from "path";

import { notFound } from "next/navigation";

import { type MotionMode } from "@/components/theme/motion";
import { RenderClient } from "@/app/render/render-client";

export const dynamic = "force-dynamic";

type SearchParams = { [key: string]: string | string[] | undefined };

type PageProps = {
  searchParams?: Promise<SearchParams>;
};

type BrandingColors = {
  background?: string;
  foreground?: string;
  primary?: string;
  primary_foreground?: string;
  secondary?: string;
  secondary_foreground?: string;
  muted?: string;
  muted_foreground?: string;
  border?: string;
};

type BrandingTypography = {
  body?: string;
  heading?: string;
};

type Branding = {
  colors?: BrandingColors;
  typography?: BrandingTypography;
  radius?: string;
};

type PuckZoneItem = { type?: string; props?: Record<string, unknown> };

type PuckContentItem = {
  type: string;
  props: Record<string, unknown>;
  variant?: string;
  slots?: Record<string, string>;
};

type PuckData = {
  content: PuckContentItem[];
  root?: { props?: { title?: string; theme?: { motion?: string }; branding?: Branding } };
  zones?: Record<string, PuckZoneItem[]>;
  meta?: { font_links?: string[]; font_css?: string };
};

type ExtractData = {
  headings?: string[];
  paragraphs?: string[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isStringArray = (value: unknown): value is string[] => Array.isArray(value);

const normalizeSiteKey = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "demo";
  try {
    return decodeURIComponent(trimmed);
  } catch {
    return trimmed;
  }
};

const demoData: PuckData = {
  content: [
    {
      type: "HeroCentered",
      props: {
        id: "HeroCentered-1",
        title: "Render Demo",
        ctas: [{ label: "Get started", href: "#pricing", variant: "primary" }],
        emphasis: "high",
      },
    },
    {
      type: "FeatureGrid",
      props: {
        id: "FeatureGrid-1",
        items: [
          { title: "Fast", icon: "rocket" },
          { title: "Stable", icon: "shield" },
          { title: "Own your code", icon: "sparkles" },
        ],
        variant: "3col",
      },
    },
    {
      type: "PricingCards",
      props: {
        id: "PricingCards-1",
        plans: [
          {
            name: "Pro",
            price: "$49",
            features: ["A", "B"],
            cta: { label: "Buy", href: "#", variant: "primary" },
          },
        ],
        variant: "2up",
      },
    },
    {
      type: "FAQAccordion",
      props: {
        id: "FAQAccordion-1",
        items: [
          { q: "Q", a: "A" },
          { q: "Q2", a: "A2" },
          { q: "Q3", a: "A3" },
        ],
      },
    },
    {
      type: "Footer",
      props: {
        id: "Footer-1",
        columns: [
          {
            title: "Company",
            links: [
              { label: "About", href: "#" },
              { label: "Contact", href: "#" },
            ],
          },
          {
            title: "Legal",
            links: [
              { label: "Privacy", href: "#" },
              { label: "Terms", href: "#" },
            ],
          },
        ],
      },
    },
  ],
  root: { props: { title: "Render", theme: { motion: "off" } } },
  zones: {},
};

async function loadPuckData(siteKey: string, page: string, iter?: string): Promise<PuckData> {
  const workDir = path.join(process.cwd(), "..", "asset-factory", "out", siteKey, "work");
  if (iter) {
    const iterPath = path.join(workDir, `puck.iter.${iter}.json`);
    try {
      const data = await fs.readFile(iterPath, "utf-8");
      return JSON.parse(data) as PuckData;
    } catch (error) {
      return demoData;
    }
  }
  const autoUseLatest = process.env.AUTO_USE_LATEST_ITER !== "0";
  if (autoUseLatest) {
    try {
      const entries = await fs.readdir(workDir);
      const iterFiles = entries.filter((name) => name.startsWith("puck.iter.") && name.endsWith(".json"));
      const latest = iterFiles
        .map((name) => ({
          name,
          idx: parseInt(name.replace("puck.iter.", "").replace(".json", ""), 10),
        }))
        .filter((item) => !Number.isNaN(item.idx))
        .sort((a, b) => b.idx - a.idx)[0];
      if (latest) {
        const data = await fs.readFile(path.join(workDir, latest.name), "utf-8");
        return JSON.parse(data) as PuckData;
      }
    } catch (error) {
      // fall back to page.json
    }
  }
  const filePath = path.join(
    process.cwd(),
    "..",
    "asset-factory",
    "out",
    siteKey,
    "pages",
    page,
    "page.json"
  );
  try {
    const data = await fs.readFile(filePath, "utf-8");
    return JSON.parse(data) as PuckData;
  } catch (error) {
    return demoData;
  }
}

async function loadExtractData(siteKey: string): Promise<ExtractData | null> {
  const extractPath = path.join(
    process.cwd(),
    "..",
    "asset-factory",
    "out",
    siteKey,
    "extract",
    "extract.json"
  );
  try {
    const data = await fs.readFile(extractPath, "utf-8");
    return JSON.parse(data) as ExtractData;
  } catch (error) {
    return null;
  }
}

function extractEmails(text: string) {
  return Array.from(new Set(text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) ?? []));
}

function buildFallbackFeatureWithMediaProps(anchor?: string, extract?: ExtractData | null) {
  const headings = isStringArray(extract?.headings) ? extract?.headings ?? [] : [];
  const paragraphs = isStringArray(extract?.paragraphs) ? extract?.paragraphs ?? [] : [];
  const joined = paragraphs.join(" ");
  const emails = extractEmails(joined);
  if (anchor === "cta") {
    const title =
      headings.find((h) => h.toLowerCase().includes("questions")) ?? "Questions?";
    const subtitle =
      headings.find((h) => h.toLowerCase().includes("contact our team")) ??
      "Contact our team to learn more";
    const body =
      paragraphs.find((p) => p.toLowerCase().includes("products and services")) ??
      paragraphs.find((p) => p.toLowerCase().includes("sales team"));
    const href = emails[0] ? `mailto:${emails[0]}` : "#contact";
    return {
      title,
      subtitle,
      body: body || undefined,
      ctas: [{ label: "Contact Us", href, variant: "primary" }],
    };
  }
  if (anchor === "footer") {
    const title = headings.find((h) => h.toLowerCase().includes("contact")) ?? "Contact";
    const items = paragraphs
      .filter((p) => /kymeta|@|\d{5}/i.test(p))
      .slice(0, 6)
      .map((p) => ({ title: p }));
    if (!items.length && emails.length) {
      emails.forEach((email) => items.push({ title: email }));
    }
    return items.length ? { title, items } : { title };
  }
  return null;
}

function normalizePuckData(data: PuckData, extract?: ExtractData | null): PuckData {
  const zones = data.zones ?? {};
  const content = data.content.map((item, idx) => {
    const props = { ...(item.props ?? {}) };
    // Puck uses stable keys when rendering dropzones; ensure every block has a unique id.
    if (typeof props.id !== "string" || !props.id.trim()) {
      props.id = `${String(item.type || "Block")}-${idx + 1}`;
    }
    if (item.variant && props.variant == null) {
      props.variant = item.variant;
    }
    if (item.slots) {
      Object.entries(item.slots).forEach(([slotName, zoneId]) => {
        if (props[slotName] != null) return;
        const zoneItems = zones[zoneId];
        if (!zoneItems?.length) return;
        const normalizedItems = zoneItems.map((zoneItem) => zoneItem.props ?? zoneItem);
        if (normalizedItems.length) {
          props[slotName] = normalizedItems;
        }
      });
    }
    if (item.type === "FeatureWithMedia") {
      const items = Array.isArray(props.items) ? props.items : [];
      const ctas = Array.isArray(props.ctas) ? props.ctas : [];
      const media = isRecord(props.media) ? props.media : null;
      const mediaSrc =
        typeof props.mediaSrc === "string"
          ? props.mediaSrc
          : typeof media?.src === "string"
            ? media.src
            : "";
      const hasContent =
        Boolean(props.title) ||
        Boolean(props.subtitle) ||
        Boolean(props.body) ||
        Boolean(items.length) ||
        Boolean(ctas.length) ||
        Boolean(mediaSrc);
      if (!hasContent) {
        const fallback = buildFallbackFeatureWithMediaProps(item.props?.anchor as string, extract);
        if (fallback) {
          Object.assign(props, fallback);
        }
      }
    }
    return { ...item, props };
  });
  return { ...data, content };
}

function buildBrandingCss(branding?: Branding) {
  if (!branding) return "";
  const { colors, typography, radius } = branding;
  const entries: Array<[string, string | undefined]> = [
    ["--background", colors?.background],
    ["--foreground", colors?.foreground],
    ["--primary", colors?.primary],
    ["--primary-foreground", colors?.primary_foreground],
    ["--secondary", colors?.secondary],
    ["--secondary-foreground", colors?.secondary_foreground],
    ["--muted", colors?.muted],
    ["--muted-foreground", colors?.muted_foreground],
    ["--border", colors?.border],
    ["--radius", radius],
  ];
  const cssVars = entries
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${key}: ${value};`)
    .join(" ");
  const rootCss = cssVars ? `:root { ${cssVars} }` : "";
  const bodyCss = typography?.body ? `body { font-family: ${typography.body}; }` : "";
  const headingCss = typography?.heading
    ? `h1,h2,h3,h4,h5,h6 { font-family: ${typography.heading}; }`
    : "";
  return [rootCss, bodyCss, headingCss].filter(Boolean).join("\n");
}

function normalizeBranding(branding?: Branding): Branding | undefined {
  if (!branding) return branding;
  const colors = branding.colors ? { ...branding.colors } : undefined;
  const bg = colors?.background?.trim();
  const fg = colors?.foreground?.trim();
  const isBlack = (value?: string) => value === "0 0% 0%";
  if (bg && fg && bg === fg) {
    colors.foreground = isBlack(bg) ? "0 0% 100%" : "222 47% 11%";
  } else if (bg && !fg) {
    colors.foreground = isBlack(bg) ? "0 0% 100%" : "222 47% 11%";
  }
  return { ...branding, colors };
}

async function loadThemeCss(siteKey: string) {
  const themePath = path.join(
    process.cwd(),
    "..",
    "asset-factory",
    "out",
    siteKey,
    "theme",
    "theme.css"
  );
  try {
    return await fs.readFile(themePath, "utf-8");
  } catch (error) {
    return "";
  }
}

export default async function RenderPage({ searchParams }: PageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const siteKeyRaw =
    (resolvedSearchParams?.siteKey as string) ??
    (resolvedSearchParams?.site as string) ??
    "demo";
  const siteKey = normalizeSiteKey(siteKeyRaw);
  const page = (resolvedSearchParams?.page as string) ?? "home";
  const iter = resolvedSearchParams?.iter as string | undefined;
  const [rawData, extract] = await Promise.all([
    loadPuckData(siteKey, page, iter),
    loadExtractData(siteKey),
  ]);
  const data = normalizePuckData(rawData, extract);
  if (!data?.content?.length) {
    notFound();
  }
  const fontLinks = Array.isArray(rawData?.meta?.font_links)
    ? rawData.meta.font_links.filter((link: unknown) => typeof link === "string")
    : [];
  const fontCss = typeof rawData?.meta?.font_css === "string" ? rawData.meta.font_css : "";
  const requestedMotion =
    (resolvedSearchParams?.motion as string) ??
    data.root?.props?.theme?.motion ??
    "off";
  const motionMode: MotionMode =
    requestedMotion === "subtle" || requestedMotion === "showcase" || requestedMotion === "off"
      ? requestedMotion
      : "off";
  const safeBranding = normalizeBranding(data.root?.props?.branding);
  const [themeCssFromFile, brandingCss] = await Promise.all([
    loadThemeCss(siteKey),
    Promise.resolve(buildBrandingCss(safeBranding)),
  ]);
  const themeCss = [themeCssFromFile, brandingCss].filter(Boolean).join("\n");

  return (
    <RenderClient
      data={data}
      motionMode={motionMode}
      themeCss={themeCss}
      fontLinks={fontLinks}
      fontCss={fontCss}
    />
  );
}
