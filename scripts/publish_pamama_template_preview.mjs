#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const REPO_ROOT = process.cwd();
const SITE_KEY = "pamama-template-preview";

const outDir = path.join(REPO_ROOT, "asset-factory", "out", SITE_KEY);
const sandboxDir = path.join(outDir, "sandbox");
const pageDir = path.join(outDir, "pages", "home");
const themeDir = path.join(outDir, "theme");

const assetsBase = "/assets/template-factory/pamama-machinetools-reference";
const slices = `${assetsBase}/slices`;

const hexToHsl = (raw) => {
  if (!raw || typeof raw !== "string") return null;
  const normalizedRaw = raw.trim();
  if (!normalizedRaw.startsWith("#")) return null;
  const normalized =
    normalizedRaw.length === 4
      ? normalizedRaw
          .slice(1)
          .split("")
          .map((c) => c + c)
          .join("")
      : normalizedRaw.slice(1);
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

const colorToHslTriplet = (value) => {
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

const lightnessFromHslTriplet = (triplet) => {
  const parts = String(triplet || "").trim().split(/\s+/);
  const lightness = Number(parts[2]?.replace("%", ""));
  return Number.isFinite(lightness) ? lightness : 50;
};

const buildGoogleFontsImport = (fontHeading, fontBody) => {
  const extract = (value) => {
    if (!value || typeof value !== "string") return "";
    const trimmed = value.trim();
    if (!trimmed) return "";
    const quoted = trimmed.match(/^['"]([^'"]+)['"]/);
    if (quoted?.[1]) return quoted[1];
    return trimmed.split(",")[0]?.trim() || "";
  };
  const families = Array.from(new Set([extract(fontHeading), extract(fontBody)].filter(Boolean)));
  if (!families.length) return "";
  const query = families
    .map((family) => `family=${encodeURIComponent(family).replace(/%20/g, "+")}:wght@300;400;500;600;700;800`)
    .join("&");
  return `@import url('https://fonts.googleapis.com/css2?${query}&display=swap');`;
};

const buildThemeCss = (theme) => {
  const palette = theme?.palette && typeof theme.palette === "object" ? theme.palette : {};
  const background = colorToHslTriplet(palette.bg || palette.background) || "0 0% 100%";
  const foreground = colorToHslTriplet(palette.text || palette.foreground) || "222 47% 11%";
  const muted = colorToHslTriplet(palette.muted || palette.neutral) || "210 40% 96%";
  const mutedForeground =
    colorToHslTriplet(palette.textSecondary || palette.mutedForeground) || "215 16% 47%";
  const border = colorToHslTriplet(palette.border || palette.neutral) || "214 32% 91%";
  const card = colorToHslTriplet(palette.card || palette.neutral || palette.bg) || background;
  const primary = colorToHslTriplet(palette.primary) || "222 89% 52%";
  const accent = colorToHslTriplet(palette.accent) || primary;
  const primaryForeground = lightnessFromHslTriplet(primary) > 58 ? "222 47% 11%" : "210 40% 98%";
  const accentForeground = lightnessFromHslTriplet(accent) > 58 ? "222 47% 11%" : "210 40% 98%";
  const radius = theme?.radius || "0.5rem";
  const fontHeading = theme?.fontHeading || "system-ui";
  const fontBody = theme?.fontBody || "system-ui";
  const fontImport = buildGoogleFontsImport(fontHeading, fontBody);
  return `${fontImport}:root{--background:${background};--foreground:${foreground};--muted:${muted};--muted-foreground:${mutedForeground};--border:${border};--primary:${primary};--primary-foreground:${primaryForeground};--accent:${accent};--accent-foreground:${accentForeground};--card:${card};--radius:${radius};--font-heading:${fontHeading};--font-body:${fontBody};}body{background:hsl(var(--background));color:hsl(var(--foreground));font-family:var(--font-body),ui-sans-serif,system-ui;} .font-heading{font-family:var(--font-heading),var(--font-body),ui-serif,serif;} .font-body{font-family:var(--font-body),ui-sans-serif,system-ui;}`;
};

const theme = {
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
    // Tiffany-like cyan/teal (more blue, less green).
    primary: "#0093ad",
    // PAMA-like CTA accent (salmon/red).
    accent: "#f15662",
    textSecondary: "#4b5563",
  },
};

const content = [
  {
    type: "Navbar",
    props: {
      variant: "withCTA",
      sticky: true,
      paddingY: "sm",
      maxWidth: "xl",
      background: "none",
      brand: "pama",
      logo: { alt: "PAMA" },
      links: [
        { label: "SETTORI", href: "#settori" },
        { label: "PRODOTTI", href: "#prodotti" },
        { label: "ASSISTENZA", href: "#assistenza" },
      ],
      ctas: [{ label: "CONTATTI", href: "#contatti", variant: "primary" }],
      showMenu: true,
      menuHref: "#menu",
      language: { label: "IT", href: "#lang" },
    },
  },
  {
    // Hero: full-screen image only (no text/buttons).
    type: "HeroCover",
    props: {
      id: "pama-hero",
      anchor: "top",
      paddingY: "sm",
      maxWidth: "2xl",
      background: "none",
      fullBleed: true,
      flush: true,
      height: "calc(100vh - 84px)",
      mobileHeight: "calc(100vh - 72px)",
      mediaSrc: `${assetsBase}/desktop-hero-top.png`,
      mediaAlt: "PAMA homepage hero",
      mobileMediaSrc: `${assetsBase}/mobile-hero-top.png`,
      mobileMediaAlt: "PAMA homepage hero mobile",
    },
  },
  {
    // Cookie-like banner overlay (for screenshot parity with the source).
    type: "CookieBanner",
    props: {
      id: "cookie-banner",
      message:
        "Noi (pamamachinetools.com/) e terze parti selezionate (1) utilizziamo cookie o tecnologie simili per finalita tecniche e, con il tuo consenso, per finalita statistiche e di marketing.",
      // Source screenshot shows only a close button.
      acceptLabel: "",
      closeLabel: "×",
    },
  },
  {
    // First section: 3-card strip closer to the source layout.
    type: "SectorsStrip",
    props: {
      id: "settori",
      anchor: "settori",
      paddingY: "lg",
      maxWidth: "xl",
      background: "none",
      title: "I NOSTRI SETTORI",
      subtitle: "PAMA opera con esperienza in settori ad alta specializzazione.",
      items: [
        {
          title: "SETTORE OIL & GAS",
          description:
            "Soluzioni per applicazioni ad alta precisione e ambienti gravosi.",
          cta: { label: "SCOPRI DI PIU", href: "#settori", variant: "primary" },
          imageSrc: `${slices}/desktop-approach.png`,
          imageAlt: "Oil & Gas",
        },
        {
          title: "SETTORE COSTRUZIONE DI MACCHINE",
          description:
            "Macchine utensili per processi industriali avanzati.",
          cta: { label: "SCOPRI DI PIU", href: "#settori", variant: "primary" },
          imageSrc: `${slices}/desktop-story.png`,
          imageAlt: "Costruzione di macchine",
        },
        {
          title: "SETTORE STAMPI",
          description: "Sistemi dedicati alla produzione stampi.",
          cta: { label: "SCOPRI DI PIU", href: "#settori", variant: "primary" },
          imageSrc: `${slices}/desktop-products.png`,
          imageAlt: "Stampi",
        },
      ],
    },
  },
  {
    type: "FeatureWithMedia",
    props: {
      id: "chi-siamo",
      anchor: "chi-siamo",
      variant: "split",
      paddingY: "lg",
      maxWidth: "xl",
      background: "muted",
      eyebrow: "CHI SIAMO",
      title: "Your solution provider",
      subtitle:
        "PAMA progetta e realizza macchine utensili e servizi dedicati.",
      body:
        "Tecnologia, esperienza e supporto specialistico per processi produttivi ad alta precisione.",
      ctas: [{ label: "SCOPRI DI PIÙ", href: "#contatti", variant: "primary" }],
      mediaKind: "image",
      mediaSrc: `${slices}/desktop-story.png`,
      mediaAlt: "PAMA factory floor",
    },
  },
  {
    type: "FeatureWithMedia",
    props: {
      id: "solution-provider",
      anchor: "solution-provider",
      variant: "split",
      paddingY: "lg",
      maxWidth: "xl",
      background: "none",
      eyebrow: "SOLUTION PROVIDER",
      title: "PAMA, MACCHINE UTENSILI CUSTOM",
      subtitle:
        "Soluzioni custom per applicazioni industriali complesse.",
      body:
        "Macchine utensili ad alte prestazioni, progettate per affidabilita e produttivita.",
      ctas: [{ label: "SCOPRI DI PIÙ", href: "#prodotti", variant: "primary" }],
      mediaKind: "image",
      mediaSrc: `${slices}/desktop-cta.png`,
      mediaAlt: "PAMA machining detail",
    },
  },
  {
    type: "ProductCategoryBand",
    props: {
      id: "prodotti",
      anchor: "prodotti",
      paddingY: "lg",
      maxWidth: "xl",
      background: "none",
      eyebrow: "I NOSTRI PRODOTTI",
      title: "",
      subtitle:
        "Seleziona una categoria per esplorare le soluzioni PAMA.",
      tabs: [
        { label: "MACHINES", href: "#prodotti" },
        { label: "DIGITAL SOLUTIONS / OPTIMIZATION", href: "#prodotti" },
        { label: "AUTOMATION", href: "#prodotti" },
      ],
      cards: [
        {
          title: "Machines",
          description: "Macchine utensili ad alte prestazioni per lavorazioni di precisione.",
          icon: "cpu",
          cta: { label: "SCOPRI DI PIÙ", href: "#contatti", variant: "primary" },
        },
        {
          title: "Digital",
          description: "Soluzioni digitali per ottimizzazione e monitoraggio dei processi.",
          icon: "globe",
          cta: { label: "SCOPRI DI PIÙ", href: "#contatti", variant: "primary" },
        },
        {
          title: "Automation",
          description: "Automazione su misura per produttivita e qualita ripetibile.",
          icon: "zap",
          cta: { label: "SCOPRI DI PIÙ", href: "#contatti", variant: "primary" },
        },
      ],
    },
  },
  {
    type: "ContentStory",
    props: {
      id: "assistenza",
      anchor: "assistenza",
      variant: "simple",
      paddingY: "md",
      maxWidth: "xl",
      background: "muted",
      eyebrow: "ASSISTENZA",
      title: "Service",
      subtitle: "Supporto specialistico dedicato alle macchine utensili.",
      body:
        "Interventi qualificati, ricambi e consulenza tecnica per garantire continuita produttiva.",
      ctas: [{ label: "SCOPRI DI PIÙ", href: "#contatti", variant: "primary" }],
    },
  },
  {
    type: "CardsGrid",
    props: {
      id: "highlights",
      anchor: "highlights",
      paddingY: "lg",
      maxWidth: "xl",
      background: "none",
      title: "HIGHLIGHTS",
      subtitle: "News, eventi e aggiornamenti PAMA.",
      variant: "media",
      columns: "3col",
      density: "normal",
      cardStyle: "solid",
      imagePosition: "top",
      imageSize: "md",
      imageShape: "rounded",
      headingSize: "sm",
      bodySize: "sm",
      items: [
        {
          title: "Pama innova per crescere globalmente",
          description: "Approfondimenti dal mondo PAMA.",
          cta: { label: "SCOPRI DI PIÙ", href: "#highlights", variant: "link" },
          imageSrc: `${slices}/desktop-socialproof.png`,
          imageAlt: "News 1",
        },
        {
          title: "EMO 2025",
          description: "Save the date: 22-26 Settembre 2025.",
          cta: { label: "SCOPRI DI PIÙ", href: "#highlights", variant: "link" },
          imageSrc: `${slices}/desktop-socialproof.png`,
          imageAlt: "News 2",
        },
        {
          title: "Novita di prodotto",
          description: "Aggiornamenti su soluzioni e tecnologie.",
          cta: { label: "SCOPRI DI PIÙ", href: "#highlights", variant: "link" },
          imageSrc: `${slices}/desktop-socialproof.png`,
          imageAlt: "News 3",
        },
      ],
    },
  },
  {
    type: "Footer",
    props: {
      variant: "multiColumn",
      paddingY: "md",
      maxWidth: "2xl",
      background: "gradient",
      backgroundGradient: "linear-gradient(180deg, #0092ad 0%, #00839a 100%)",
      columns: [
        {
          title: "Azienda",
          links: [
            { label: "Chi siamo", href: "#chi-siamo" },
            { label: "Contatti", href: "#contatti" },
          ],
        },
        {
          title: "Prodotti",
          links: [
            { label: "Settori", href: "#settori" },
            { label: "Soluzioni", href: "#prodotti" },
          ],
        },
        {
          title: "Supporto",
          links: [
            { label: "Assistenza", href: "#assistenza" },
            { label: "News", href: "#highlights" },
          ],
        },
      ],
      legal: "© 2026 PAMA-inspired template",
      logoText: "PAMA",
    },
  },
];

const page = {
  content,
  root: { props: { title: "PAMA Machine Tools", theme } },
};

const payload = {
  components: [{ name: "TemplatePreviewAnchor", code: "export default function TemplatePreviewAnchor(){return null}" }],
  pages: [{ path: "/", name: "Home", data: page }],
  theme,
};

await fs.mkdir(sandboxDir, { recursive: true });
await fs.mkdir(pageDir, { recursive: true });
await fs.mkdir(themeDir, { recursive: true });

await fs.writeFile(path.join(sandboxDir, "payload.json"), JSON.stringify(payload, null, 2), "utf8");
await fs.writeFile(path.join(pageDir, "page.json"), JSON.stringify(page, null, 2), "utf8");
await fs.writeFile(path.join(themeDir, "theme.css"), buildThemeCss(theme), "utf8");

console.log(`[publish] wrote ${SITE_KEY}`);
console.log(`- ${path.relative(REPO_ROOT, path.join(sandboxDir, "payload.json"))}`);
console.log(`- ${path.relative(REPO_ROOT, path.join(pageDir, "page.json"))}`);
console.log(`- ${path.relative(REPO_ROOT, path.join(themeDir, "theme.css"))}`);
