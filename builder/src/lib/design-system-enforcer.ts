export type BlockProps = Record<string, unknown>;

type PuckContentItem = { type?: string; props?: BlockProps; [key: string]: unknown };

type PuckData = {
  content?: PuckContentItem[];
  root?: Record<string, unknown>;
  zones?: Record<string, PuckContentItem[]>;
  [key: string]: unknown;
};

const SPACING_SCALE = [4, 8, 12, 16, 24, 32, 48, 64, 80, 96, 128];
const BACKGROUND_VALUES = new Set(["none", "muted", "gradient", "image"]);
const PADDING_VALUES = new Set(["sm", "md", "lg"]);
const ALIGN_VALUES = new Set(["left", "center"]);
const MAX_WIDTH_VALUES = new Set(["lg", "xl", "2xl"]);
const EMPHASIS_VALUES = new Set(["normal", "high"]);

const FONT_SCALE: Array<[string, number]> = [
  ["xs", 12],
  ["sm", 14],
  ["base", 16],
  ["lg", 18],
  ["xl", 20],
  ["2xl", 24],
  ["3xl", 30],
  ["4xl", 36],
  ["5xl", 48],
  ["6xl", 60],
];

const normalizeNumber = (value: number, scale: number[]) =>
  scale.reduce((prev, curr) => (Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev));

const parseNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const match = value.match(/([\d.]+)/);
    if (match) {
      const num = Number(match[1]);
      if (Number.isFinite(num)) return num;
    }
  }
  return undefined;
};

const isSpacingKey = (key: string) =>
  key.includes("padding") ||
  key.includes("margin") ||
  key.includes("gap") ||
  key.endsWith("spacing");

const isFontSizeKey = (key: string) => key === "fontSize" || key.endsWith("FontSize");

const isRadiusKey = (key: string) => key.includes("radius");

const isShadowKey = (key: string) => key.includes("shadow");

const isColorKey = (key: string) =>
  key.includes("color") || key.includes("background") || key.includes("border");

const isColorValue = (value: unknown) =>
  typeof value === "string" &&
  (/^#([0-9a-f]{3,8})$/i.test(value) || /^rgb/.test(value) || /^hsl/.test(value));

const isMediaUrlKey = (key: string) => {
  if (key.includes("alt")) return false;
  return (
    key === "src" ||
    key.endsWith("src") ||
    key.endsWith("url") ||
    // Only treat as media when the key clearly represents a URL.
    // Avoid catching non-URL props like `imagePosition`, `imageShape`, etc.
    key === "image" ||
    key.includes("avatar") ||
    key.includes("logo") ||
    key.includes("poster")
  );
};

const isValidMediaUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("data:")) return false;
  if (trimmed.startsWith("/assets/")) return true;
  try {
    const url = new URL(trimmed);
    if (!["http:", "https:"].includes(url.protocol)) return false;
    if (!url.hostname) return false;
    if (/example|placeholder|invalid/.test(url.hostname)) return false;
    return true;
  } catch {
    return false;
  }
};

const normalizeColor = (key: string) => {
  if (key.includes("border")) return "hsl(var(--border))";
  if (key.includes("muted")) return "hsl(var(--muted))";
  if (key.includes("primary") || key.includes("accent")) return "hsl(var(--primary))";
  if (key.includes("background") || key.includes("bg")) return "hsl(var(--background))";
  if (key.includes("text")) return "hsl(var(--foreground))";
  return "hsl(var(--foreground))";
};

const normalizeFontSize = (value: number) => {
  const closest = FONT_SCALE.reduce((prev, curr) =>
    Math.abs(curr[1] - value) < Math.abs(prev[1] - value) ? curr : prev
  );
  return closest[0];
};

const coerceLinkObject = (value: unknown) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  const keys = Object.keys(record);
  if (keys.length === 1 && keys[0] === "link" && typeof record.link === "string") {
    return record.link;
  }
  return undefined;
};

const normalizeValueByKey = (key: string, value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeValueByKey(key, item));
  }
  const coercedLink = coerceLinkObject(value);
  if (coercedLink) return coercedLink;
  if (typeof value === "object" && value !== null) {
    return normalizeObject(value as Record<string, unknown>);
  }
  if (typeof value === "string" && isMediaUrlKey(key)) {
    return isValidMediaUrl(value) ? value.trim() : undefined;
  }
  if (isColorKey(key) && isColorValue(value)) {
    return normalizeColor(key);
  }
  const num = parseNumber(value);
  if (num === undefined) return value;
  if (isSpacingKey(key)) return normalizeNumber(num, SPACING_SCALE);
  if (isFontSizeKey(key)) return normalizeFontSize(num);
  if (isRadiusKey(key)) return "var(--radius)";
  if (isShadowKey(key)) {
    return "0 10px 15px -3px rgb(0 0 0 / 0.1)";
  }
  return value;
};

const normalizeObject = (obj: Record<string, unknown>) => {
  const next: Record<string, unknown> = {};
  Object.entries(obj).forEach(([key, value]) => {
    next[key] = normalizeValueByKey(key.toLowerCase(), value);
  });
  return next;
};

const normalizeCardsGridColumns = (itemsCount: number) => {
  if (itemsCount <= 1) return "2col";
  if (itemsCount === 2) return "2col";
  if (itemsCount === 3) return "3col";
  if (itemsCount === 4) return "4col";
  if (itemsCount <= 6) return "3col";
  return "4col";
};

const normalizeFeatureGridVariant = (count: number) => {
  if (count <= 2) return "2col";
  if (count === 3) return "3col";
  if (count >= 4) return "4col";
  return "3col";
};

const normalizeTestimonialsVariant = (count: number) => {
  if (count <= 3) return "2col";
  return "3col";
};

const normalizePricingVariant = (count: number, hasToggle: boolean) => {
  if (hasToggle) return "withToggle";
  if (count <= 2) return "2up";
  return "3up";
};

const normalizeCaseStudiesVariant = (count: number) => {
  if (count <= 2) return "list";
  return "cards";
};

const normalizeHeroCenteredVariant = (props: BlockProps) => {
  const hasMedia = Boolean(props.media);
  const badges = Array.isArray(props.badges) ? props.badges : [];
  if (hasMedia) return "withMedia";
  if (badges.length) return "withBadges";
  return "textOnly";
};

const normalizeHeroSplitVariant = (props: BlockProps) => {
  const media = props.media as { kind?: string } | undefined;
  if (media?.kind === "video") return "video";
  if (media?.kind === "image") return "image";
  return "image";
};

const normalizeLeadCaptureVariant = (props: BlockProps) => {
  const background = typeof props.background === "string" ? props.background : "";
  if (background === "muted" || background === "gradient" || props.emphasis === "high") return "card";
  return "banner";
};

const normalizeLogoCloudVariant = (count: number) => {
  if (count >= 8) return "marquee";
  return "grid";
};

const normalizeNavbarVariant = (props: BlockProps) => {
  const links = Array.isArray(props.links) ? props.links : [];
  const hasChildren = links.some(
    (link) => Array.isArray((link as any).children) && (link as any).children.length > 0
  );
  const ctas = Array.isArray(props.ctas) ? props.ctas : [];
  if (ctas.length) return "withCTA";
  if (hasChildren) return "withDropdown";
  return "simple";
};

const normalizeFooterVariant = (props: BlockProps) => {
  const columns = Array.isArray(props.columns) ? props.columns : [];
  if (columns.length <= 2) return "simple";
  return "multiColumn";
};

const normalizeFaqVariant = (count: number) => {
  if (count <= 4) return "singleOpen";
  return "multiOpen";
};

const normalizeBaseProps = (props: BlockProps) => {
  const next = { ...props };
  const padding = typeof next.paddingY === "string" ? next.paddingY : undefined;
  if (padding && !PADDING_VALUES.has(padding)) next.paddingY = "lg";
  const background = typeof next.background === "string" ? next.background : undefined;
  if (background && !BACKGROUND_VALUES.has(background)) next.background = "none";
  const align = typeof next.align === "string" ? next.align : undefined;
  if (align && !ALIGN_VALUES.has(align)) next.align = "left";
  const maxWidth = typeof next.maxWidth === "string" ? next.maxWidth : undefined;
  if (maxWidth && !MAX_WIDTH_VALUES.has(maxWidth)) next.maxWidth = "xl";
  const emphasis = typeof next.emphasis === "string" ? next.emphasis : undefined;
  if (emphasis && !EMPHASIS_VALUES.has(emphasis)) next.emphasis = "normal";
  const headingSize = typeof next.headingSize === "string" ? next.headingSize : undefined;
  if (headingSize && !["sm", "md", "lg"].includes(headingSize)) next.headingSize = "md";
  const bodySize = typeof next.bodySize === "string" ? next.bodySize : undefined;
  if (bodySize && !["sm", "md", "lg"].includes(bodySize)) next.bodySize = "md";
  return next;
};

const seedBlockDefaults = (blockType: string, props: BlockProps) => {
  const next = { ...props };
  const type = blockType.toLowerCase();
  if (next.paddingY === undefined) next.paddingY = "lg";
  if (next.motionPreset === undefined && next.motion === undefined) next.motionPreset = "stagger";
  if ((type.includes("hero") || type.includes("cta") || type.includes("leadcapture")) && !next.emphasis) {
    next.emphasis = "high";
  }
  if (type.includes("footer") && !next.variant) {
    next.variant = normalizeFooterVariant(next);
  }
  return next;
};

const diffProps = (before: BlockProps, after: BlockProps) => {
  const changed: Record<string, { from: unknown; to: unknown }> = {};
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  keys.forEach((key) => {
    const prev = before[key];
    const next = after[key];
    if (JSON.stringify(prev) !== JSON.stringify(next)) {
      changed[key] = { from: prev, to: next };
    }
  });
  return Object.keys(changed).length ? changed : null;
};

const updateSummary = (
  summary: Record<string, number>,
  diff: Record<string, { from: unknown; to: unknown }> | null
) => {
  if (!diff) return;
  Object.keys(diff).forEach((key) => {
    summary[key] = (summary[key] ?? 0) + 1;
  });
};

export const formatSummary = (summary: Record<string, number>) => {
  const entries = Object.entries(summary);
  if (!entries.length) return "";
  const sorted = entries.sort((a, b) => b[1] - a[1]).slice(0, 12);
  return sorted.map(([key, count]) => `${key}:${count}`).join(", ");
};

const printSummary = (summary: Record<string, number>) => {
  const formatted = formatSummary(summary);
  if (!formatted) return;
  console.info("[design-system] normalized props summary", formatted);
};

const clampItems = (items: unknown, max: number) => {
  if (!Array.isArray(items)) return items;
  return items.slice(0, max);
};

const normalizeAboutTrustProps = (props: BlockProps, options: { logChanges?: boolean } = {}) => {
  const next = { ...props };
  let statsNormalized = false;
  let certificationsNormalized = false;

  if (Array.isArray(next.stats)) {
    next.stats = next.stats.slice(0, 6).map((entry, index) => {
      const record =
        entry && typeof entry === "object" ? ({ ...(entry as Record<string, unknown>) } as Record<string, unknown>) : {};
      const parsedValue = parseNumber(record.value);
      const value = parsedValue === undefined ? 0 : parsedValue;
      const suffixFromValue =
        typeof record.value === "string"
          ? String(record.value)
              .replace(/[\d.,\s]/g, "")
              .trim()
              .slice(0, 4)
          : "";
      const suffixRaw = typeof record.suffix === "string" ? record.suffix.trim() : "";
      const suffix = suffixRaw || suffixFromValue;
      const label =
        typeof record.label === "string" && record.label.trim()
          ? record.label.trim()
          : `Metric ${index + 1}`;

      if (record.value !== value || record.suffix !== suffix || record.label !== label) {
        statsNormalized = true;
      }

      return {
        ...record,
        value,
        ...(suffix ? { suffix } : {}),
        label,
      };
    });
  }

  if (Array.isArray(next.certifications)) {
    next.certifications = next.certifications.slice(0, 8).map((entry, index) => {
      const record =
        entry && typeof entry === "object"
          ? ({ ...(entry as Record<string, unknown>) } as Record<string, unknown>)
          : {};
      const nameCandidate =
        typeof entry === "string"
          ? entry.trim()
          : typeof record.name === "string"
            ? record.name.trim()
            : "";
      const name = nameCandidate || `Certification ${index + 1}`;
      const iconCandidate =
        typeof record.icon === "string"
          ? record.icon.trim()
          : typeof record.iconName === "string"
            ? record.iconName.trim()
            : "";
      const icon = iconCandidate || "award";

      if (name !== nameCandidate || !iconCandidate) {
        certificationsNormalized = true;
      }

      return {
        ...record,
        name,
        icon,
      };
    });
  }

  if (options.logChanges && (statsNormalized || certificationsNormalized)) {
    console.info("[design-system] abouttrust_normalized", {
      statsNormalized,
      certificationsNormalized,
    });
  }

  return next;
};

export const normalizeBlockProps = (
  blockType: string,
  props: BlockProps | undefined,
  options: { logChanges?: boolean; summary?: Record<string, number> } = {}
) => {
  const { logChanges = false, summary } = options;
  const seededProps = seedBlockDefaults(blockType, props ?? {});
  const base = normalizeBaseProps(normalizeObject(seededProps));
  const type = blockType.toLowerCase();
  if ((type.includes("hero") || type.includes("cta") || type.includes("leadcapture")) && !base.emphasis) {
    base.emphasis = "high";
  }
  if (type.includes("cardsgrid")) {
    const items = Array.isArray(base.items) ? base.items : [];
    const count = items.length;
    const columns = base.columns;
    const valid = columns === "2col" || columns === "3col" || columns === "4col";
    if (!valid) {
      base.columns = normalizeCardsGridColumns(count);
    }
    base.items = clampItems(base.items, 8);
  }
  if (type.includes("featuregrid")) {
    const items = Array.isArray(base.items) ? base.items : [];
    const count = items.length;
    const variant = base.variant;
    const valid = variant === "2col" || variant === "3col" || variant === "4col";
    if (!valid) base.variant = normalizeFeatureGridVariant(count);
    base.items = clampItems(base.items, 6);
  }
  if (type.includes("testimonialsgrid")) {
    const items = Array.isArray(base.items) ? base.items : [];
    const count = items.length;
    const variant = base.variant;
    const valid = variant === "2col" || variant === "3col";
    if (!valid) base.variant = normalizeTestimonialsVariant(count);
    base.items = clampItems(base.items, 6);
  }
  if (type.includes("pricingcards")) {
    const plans = Array.isArray(base.plans) ? base.plans : [];
    const count = plans.length;
    const billingToggle = Boolean(base.billingToggle);
    const variant = base.variant;
    const valid = variant === "2up" || variant === "3up" || variant === "withToggle";
    if (!valid) base.variant = normalizePricingVariant(count, billingToggle);
    base.plans = clampItems(base.plans, 3);
  }
  if (type.includes("casestudies")) {
    const items = Array.isArray(base.items) ? base.items : [];
    const count = items.length;
    const variant = base.variant;
    const valid = variant === "cards" || variant === "list";
    if (!valid) base.variant = normalizeCaseStudiesVariant(count);
    base.items = clampItems(base.items, 6);
  }
  if (type.includes("herocentered")) {
    const variant = base.variant;
    const valid = variant === "textOnly" || variant === "withMedia" || variant === "withBadges";
    if (!valid) base.variant = normalizeHeroCenteredVariant(base);
  }
  if (type.includes("herosplit")) {
    const variant = base.variant;
    const valid = variant === "image" || variant === "video" || variant === "screenshot";
    if (!valid) base.variant = normalizeHeroSplitVariant(base);
  }
  if (type.includes("neonherobeam")) {
    // Keep authored neon overlay colors; generic token normalization makes this hero look flat.
    if (typeof seededProps.backgroundOverlay === "string" && seededProps.backgroundOverlay.trim()) {
      base.backgroundOverlay = seededProps.backgroundOverlay.trim();
    }
  }
  if (type.includes("leadcapturecta")) {
    const variant = base.variant;
    const valid = variant === "banner" || variant === "card";
    if (!valid) base.variant = normalizeLeadCaptureVariant(base);
  }
  if (type.includes("logocloud")) {
    const logos = Array.isArray(base.logos) ? base.logos : [];
    const count = logos.length;
    const variant = base.variant;
    const valid = variant === "grid" || variant === "marquee";
    if (!valid) base.variant = normalizeLogoCloudVariant(count);
    base.logos = clampItems(base.logos, 16);
  }
  if (type.includes("navbar")) {
    const variant = base.variant;
    const valid = variant === "simple" || variant === "withDropdown" || variant === "withCTA";
    if (!valid) base.variant = normalizeNavbarVariant(base);
  }
  if (type.includes("footer")) {
    const variant = base.variant;
    const valid = variant === "simple" || variant === "multiColumn";
    if (!valid) base.variant = normalizeFooterVariant(base);
    base.columns = clampItems(base.columns, 4);
  }
  if (type.includes("faqaccordion")) {
    const items = Array.isArray(base.items) ? base.items : [];
    const count = items.length;
    const variant = base.variant;
    const valid = variant === "singleOpen" || variant === "multiOpen";
    if (!valid) base.variant = normalizeFaqVariant(count);
    base.items = clampItems(base.items, 8);
  }
  if (type.includes("abouttrust")) {
    const normalizedAboutTrust = normalizeAboutTrustProps(base, { logChanges });
    Object.assign(base, normalizedAboutTrust);
  }
  if (logChanges && props) {
    const diff = diffProps(seededProps, base);
    if (diff) {
      const label = blockType || "Block";
      console.info(`[design-system] normalized ${label}`, diff);
    }
    if (summary) updateSummary(summary, diff);
  }
  return base;
};

export const normalizePuckData = <T extends PuckData | null | undefined>(
  data: T,
  options: { logChanges?: boolean } = {}
): T => {
  if (!data || typeof data !== "object") return data;
  const { logChanges = false } = options;
  const summary: Record<string, number> = {};
  const content = Array.isArray(data.content) ? data.content : [];
  const nextContent = content.map((item) => {
    const type = typeof item.type === "string" ? item.type : "";
    const props = normalizeBlockProps(type, item.props, { logChanges, summary });
    return { ...item, props };
  });

  const zones = data.zones || {};
  const nextZones: Record<string, PuckContentItem[]> = {};
  Object.entries(zones).forEach(([zoneKey, items]) => {
    if (!Array.isArray(items)) return;
    nextZones[zoneKey] = items.map((item) => {
      const type = typeof item.type === "string" ? item.type : "";
      const props = normalizeBlockProps(type, item.props, { logChanges, summary });
      return { ...item, props };
    });
  });

  if (logChanges) printSummary(summary);
  return { ...data, content: nextContent, zones: nextZones } as T;
};
