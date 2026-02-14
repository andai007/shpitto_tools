#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const REPO_ROOT = process.cwd();
const SITE_KEY = "pamama-template-preview";

const outDir = path.join(REPO_ROOT, "asset-factory", "out", SITE_KEY);
const sandboxDir = path.join(outDir, "sandbox");
const pageDir = path.join(outDir, "pages", "home");

const assetsBase = "/assets/template-factory/pamama-machinetools-reference";
const slices = `${assetsBase}/slices`;

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
    accent: "#0093ad",
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
    type: "CategoryTabs",
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
        { label: "ACCESSORI" },
        { label: "CENTRI DI LAVORO" },
        { label: "AUTOMAZIONE" },
      ],
      panels: [
        {
          title: "Accessori per ogni esigenza",
          description:
            "Versatilita e produttivita per processi complessi.",
          bullets: ["Soluzioni modulari", "Setup rapido", "Qualita costante"],
          cta: { label: "SCOPRI DI PIÙ", href: "#contatti", variant: "primary" },
          mediaSrc: `${slices}/desktop-products.png`,
          mediaAlt: "Accessori",
        },
        {
          title: "Centri di lavoro",
          description:
            "Massima versatilita e affidabilita per lavorazioni di precisione.",
          bullets: [
            "Rigidita strutturale",
            "Controllo avanzato",
            "Prestazioni ripetibili",
          ],
          cta: { label: "SCOPRI DI PIÙ", href: "#contatti", variant: "primary" },
          mediaSrc: `${slices}/mobile-products.png`,
          mediaAlt: "Centri di lavoro",
        },
        {
          title: "Automazione",
          description:
            "Linee automatizzate per produttivita e qualita ripetibile.",
          bullets: ["Integrazione su misura", "Riduzione tempi ciclo", "Monitoraggio produzione"],
          cta: { label: "SCOPRI DI PIÙ", href: "#contatti", variant: "primary" },
          mediaSrc: `${slices}/desktop-products.png`,
          mediaAlt: "Automazione",
        },
      ],
      activeIndex: 0,
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

await fs.writeFile(path.join(sandboxDir, "payload.json"), JSON.stringify(payload, null, 2), "utf8");
await fs.writeFile(path.join(pageDir, "page.json"), JSON.stringify(page, null, 2), "utf8");

console.log(`[publish] wrote ${SITE_KEY}`);
console.log(`- ${path.relative(REPO_ROOT, path.join(sandboxDir, "payload.json"))}`);
console.log(`- ${path.relative(REPO_ROOT, path.join(pageDir, "page.json"))}`);
