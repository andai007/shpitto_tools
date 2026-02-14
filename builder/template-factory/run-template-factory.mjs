#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";

const ROOT = process.cwd();
const FACTORY_DIR = path.join(ROOT, "template-factory");
const RUNS_DIR = path.join(FACTORY_DIR, "runs");
const LIB_DIR = path.join(FACTORY_DIR, "library");
const PUBLIC_TEMPLATE_ASSETS_DIR = path.join(ROOT, "public", "assets", "template-factory");
const DEFAULT_MANIFEST = path.join(FACTORY_DIR, "sites.example.json");
const DEFAULT_PUBLISH_PATH = path.join(LIB_DIR, "style-profiles.generated.json");
const DEFAULT_TEMPLATE_FIRST_GROUP = "C_template_first";
const DEFAULT_PREVIEW_BASE_URL = process.env.TEMPLATE_FACTORY_PREVIEW_BASE_URL || "http://127.0.0.1:3110";
const DEFAULT_PREVIEW_START_COMMAND = "cd builder && npm run dev -- -p 3110";

const SECTION_KINDS = [
  "navigation",
  "hero",
  "story",
  "approach",
  "socialproof",
  "products",
  "contact",
  "cta",
  "footer",
];

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "from",
  "your",
  "into",
  "about",
  "have",
  "will",
  "are",
  "was",
  "were",
  "you",
  "our",
  "their",
  "has",
  "had",
  "make",
  "build",
  "create",
  "generate",
  "homepage",
  "website",
]);

const RECIPES = {
  designer_portfolio_minimal: {
    id: "designer_portfolio_minimal",
    styleLabels: ["designer-portfolio", "minimal", "editorial", "light", "monochrome"],
    paletteProfile: "light-neutral",
    typographySignature: "high-contrast sans + editorial display",
    layoutPatterns: [
      "minimal-nav",
      "asymmetric-hero",
      "profile-story-split",
      "capabilities-card-grid",
      "recent-projects-list",
      "testimonial-quote-band",
      "minimal-footer",
    ],
    componentSignature: [
      "Navbar",
      "DesignerHeroEditorial",
      "FeatureWithMedia",
      "DesignerCapabilitiesStrip",
      "DesignerProjectsSplit",
      "DesignerQuoteBand",
      "LeadCaptureCTA",
      "Footer",
    ],
    requiredCategories: ["navigation", "hero", "story", "approach", "products", "socialproof", "cta", "footer"],
    sectionSpecs: {
      navigation: {
        blockType: "Navbar",
        defaults: {
          variant: "withCTA",
          sticky: true,
          paddingY: "sm",
          maxWidth: "xl",
          background: "none",
          logo: "Nava moon",
          links: [
            { label: "Home", href: "#top", variant: "link" },
            { label: "Services", href: "#capabilities", variant: "link" },
            { label: "About", href: "#about", variant: "link" },
            { label: "Contact", href: "#contact", variant: "link" },
          ],
          ctas: [{ label: "Get Started", href: "#contact", variant: "primary" }],
        },
      },
      hero: {
        blockType: "DesignerHeroEditorial",
        defaults: {
          paddingY: "lg",
          headingSize: "lg",
          bodySize: "sm",
          maxWidth: "xl",
          eyebrow: "Since 2003",
          title: "the future of design & content",
          subtitle:
            "A multidisciplinary creative practice crafting visual systems, product interfaces, and narrative-first brand experiences.",
          detail:
            "Design direction, product systems, and frontend delivery across high-growth digital products.",
          ctas: [
            { label: "View Work", href: "#projects", variant: "primary" },
            { label: "Read Story", href: "#about", variant: "secondary" },
          ],
        },
      },
      story: {
        blockType: "FeatureWithMedia",
        defaults: {
          variant: "split",
          paddingY: "lg",
          maxWidth: "xl",
          background: "none",
          eyebrow: "Profile",
          title: "Design Engineer",
          subtitle: "I build elegant product experiences and scalable brand systems.",
          body:
            "Across UI/UX, interaction, and frontend delivery, each project is shaped by clarity, craftsmanship, and long-term maintainability.",
          ctas: [{ label: "See full story", href: "#about", variant: "secondary" }],
        },
      },
      approach: {
        blockType: "DesignerCapabilitiesStrip",
        defaults: {
          paddingY: "lg",
          maxWidth: "xl",
          title: "Capabilities",
          subtitle: "Digital design, development, and growth services with a product mindset.",
          items: [
            { title: "UI/UX Design", description: "Research-driven interfaces for web and mobile products.", ctaLabel: "Read more" },
            { title: "Web Development", description: "Modern frontend architecture with production-ready quality.", ctaLabel: "Read more" },
            { title: "Brand Identity", description: "Visual language systems that scale across digital touchpoints.", ctaLabel: "Read more" },
          ],
        },
      },
      products: {
        blockType: "DesignerProjectsSplit",
        defaults: {
          paddingY: "lg",
          maxWidth: "xl",
          title: "Recent Projects",
          subtitle: "A selection of latest design and development work.",
          items: [
            {
              title: "SaaS Dashboard",
              summary: "A product analytics dashboard focused on clarity, trust, and retention.",
              href: "#projects",
              tags: ["SaaS", "Dashboard"],
            },
            {
              title: "Fashion Platform",
              summary: "A conversion-first ecommerce redesign with improved storytelling and flow.",
              href: "#projects",
              tags: ["Ecommerce", "Platform"],
            },
          ],
        },
      },
      socialproof: {
        blockType: "DesignerQuoteBand",
        defaults: {
          paddingY: "lg",
          maxWidth: "xl",
          eyebrow: "Testimonial",
          quote:
            "\"Working with Jeremi was a game-changer. He translated our vision into a polished product and delivered beyond expectations.\"",
          author: "Client",
          role: "Founder",
        },
      },
      cta: {
        blockType: "LeadCaptureCTA",
        defaults: {
          variant: "banner",
          paddingY: "md",
          maxWidth: "xl",
          title: "Have a project in mind?",
          subtitle: "Share a few details and get a structured implementation plan.",
          cta: { label: "Start a Conversation", href: "#contact", variant: "primary" },
        },
      },
      footer: {
        blockType: "Footer",
        defaults: {
          variant: "multiColumn",
          paddingY: "md",
          maxWidth: "xl",
          background: "none",
          logoText: "Nava moon",
          columns: [
            { title: "Explore", links: [{ label: "Home", href: "#top" }, { label: "Projects", href: "#projects" }] },
            { title: "Services", links: [{ label: "Capabilities", href: "#capabilities" }, { label: "About", href: "#about" }] },
            { title: "Legal", links: [{ label: "Privacy", href: "#privacy" }, { label: "Terms", href: "#terms" }] },
          ],
          legal: "© 2026 Nava moon. All rights reserved.",
        },
      },
    },
  },
  editorial_luxury: {
    id: "editorial_luxury",
    styleLabels: ["editorial", "luxury", "minimal", "warm-neutral"],
    paletteProfile: "warm-neutral",
    typographySignature: "serif-display + sans-body",
    layoutPatterns: [
      "hero-editorial-split",
      "story-sticky-media",
      "metrics-two-col",
      "social-proof-grid",
      "dark-footer-cta",
    ],
    componentSignature: [
      "Navbar",
      "HeroSplit",
      "ContentStory",
      "FeatureGrid",
      "TestimonialsGrid",
      "LeadCaptureCTA",
      "Footer",
    ],
    requiredCategories: ["navigation", "hero", "story", "approach", "socialproof", "cta", "footer"],
    sectionSpecs: {
      navigation: {
        blockType: "Navbar",
        defaults: { variant: "withCTA", sticky: true, paddingY: "sm", maxWidth: "xl" },
      },
      hero: {
        blockType: "HeroSplit",
        defaults: { mediaPosition: "right", paddingY: "lg", headingSize: "lg", maxWidth: "xl" },
      },
      story: {
        blockType: "ContentStory",
        defaults: { variant: "split", paddingY: "lg", maxWidth: "xl" },
      },
      approach: {
        blockType: "FeatureGrid",
        defaults: { variant: "3col", paddingY: "lg", maxWidth: "xl" },
      },
      socialproof: {
        blockType: "TestimonialsGrid",
        defaults: { variant: "2col", paddingY: "lg", maxWidth: "xl" },
      },
      cta: {
        blockType: "LeadCaptureCTA",
        defaults: { variant: "banner", paddingY: "lg", maxWidth: "xl" },
      },
      footer: {
        blockType: "Footer",
        defaults: { variant: "multiColumn", paddingY: "md", maxWidth: "xl" },
      },
    },
  },
  industrial_precision: {
    id: "industrial_precision",
    styleLabels: ["industrial", "precision", "b2b", "clean"],
    paletteProfile: "steel-neutral",
    typographySignature: "sans-bold + sans-body",
    layoutPatterns: ["hero-split", "metrics-grid", "product-cards", "trust-grid", "banner-cta"],
    componentSignature: [
      "Navbar",
      "HeroSplit",
      "FeatureGrid",
      "CardsGrid",
      "TestimonialsGrid",
      "LeadCaptureCTA",
      "Footer",
    ],
    requiredCategories: ["navigation", "hero", "approach", "products", "socialproof", "cta", "footer"],
    sectionSpecs: {
      navigation: {
        blockType: "Navbar",
        defaults: { variant: "withCTA", sticky: true, paddingY: "sm", maxWidth: "xl" },
      },
      hero: {
        blockType: "HeroSplit",
        defaults: { mediaPosition: "right", paddingY: "lg", headingSize: "md", maxWidth: "xl" },
      },
      approach: {
        blockType: "FeatureGrid",
        defaults: { variant: "3col", paddingY: "lg", maxWidth: "xl" },
      },
      products: {
        blockType: "CardsGrid",
        defaults: { variant: "product", columns: "3col", density: "normal", paddingY: "lg", maxWidth: "xl" },
      },
      socialproof: {
        blockType: "TestimonialsGrid",
        defaults: { variant: "2col", paddingY: "lg", maxWidth: "xl" },
      },
      cta: {
        blockType: "LeadCaptureCTA",
        defaults: { variant: "banner", paddingY: "lg", maxWidth: "xl" },
      },
      footer: {
        blockType: "Footer",
        defaults: { variant: "multiColumn", paddingY: "md", maxWidth: "xl" },
      },
    },
  },
  pamama_machine_tools_corporate: {
    id: "pamama_machine_tools_corporate",
    styleLabels: ["industrial", "machine-tools", "corporate", "engineering", "light-gray", "teal-accent"],
    paletteProfile: "industrial-teal-gray",
    typographySignature: "clean-sans + compact-sans",
    layoutPatterns: [
      "thin-top-nav",
      "hero-factory-cover",
      "sector-cards-grid",
      "about-split-image",
      "product-catalog-grid",
      "assistenza-section",
      "highlights-cards",
      "teal-footer",
    ],
    componentSignature: ["Navbar", "HeroCover", "SectorsStrip", "FeatureWithMedia", "ProductCategoryBand", "CardsGrid", "ContentStory", "Footer"],
    requiredCategories: ["navigation", "hero", "approach", "story", "cta", "products", "contact", "socialproof", "footer"],
    sectionSpecs: {
      navigation: {
        blockType: "Navbar",
        defaults: {
          variant: "withCTA",
          sticky: true,
          paddingY: "sm",
          maxWidth: "xl",
          background: "none",
          brand: "pama",
          logo: { alt: "PAMA" },
          links: [
            { label: "SETTORI", href: "#settori", variant: "link" },
            { label: "PRODOTTI", href: "#prodotti", variant: "link" },
            { label: "ASSISTENZA", href: "#assistenza", variant: "link" },
          ],
          ctas: [{ label: "CONTATTI", href: "#contatti", variant: "primary" }],
          showMenu: true,
          menuHref: "#menu",
          language: { label: "IT", href: "#lang" },
        },
      },
      hero: {
        blockType: "HeroCover",
        defaults: {
          paddingY: "sm",
          maxWidth: "2xl",
          background: "none",
          fullBleed: true,
          flush: true,
          height: "calc(100vh - 84px)",
          mobileHeight: "calc(100vh - 72px)",
        },
      },
      approach: {
        blockType: "SectorsStrip",
        defaults: {
          paddingY: "lg",
          maxWidth: "xl",
          background: "none",
          title: "I NOSTRI SETTORI",
          subtitle: "PAMA opera con esperienza in settori ad alta specializzazione.",
          items: [
            { title: "SETTORE OIL & GAS", description: "Soluzioni per applicazioni ad alta precisione.", cta: { label: "SCOPRI DI PIÙ", href: "#settori", variant: "primary" } },
            { title: "SETTORE COSTRUZIONE DI MACCHINE", description: "Macchine utensili per processi industriali avanzati.", cta: { label: "SCOPRI DI PIÙ", href: "#settori", variant: "primary" } },
            { title: "SETTORE STAMPI", description: "Sistemi dedicati alla produzione stampi.", cta: { label: "SCOPRI DI PIÙ", href: "#settori", variant: "primary" } },
          ],
        },
      },
      story: {
        blockType: "FeatureWithMedia",
        defaults: {
          variant: "split",
          paddingY: "lg",
          maxWidth: "xl",
          background: "muted",
          eyebrow: "CHI SIAMO",
          title: "Your solution provider",
          subtitle: "PAMA è partner nella fornitura di macchine utensili e servizi.",
          body: "Tecnologia, esperienza e supporto specialistico per processi produttivi ad alta precisione.",
          ctas: [{ label: "SCOPRI DI PIÙ", href: "#chi-siamo", variant: "primary" }],
        },
      },
      products: {
        blockType: "ProductCategoryBand",
        defaults: {
          paddingY: "lg",
          maxWidth: "xl",
          background: "none",
          eyebrow: "I NOSTRI PRODOTTI",
          title: "",
          subtitle: "Seleziona una categoria per esplorare le soluzioni PAMA.",
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
      cta: {
        blockType: "FeatureWithMedia",
        defaults: {
          variant: "split",
          paddingY: "lg",
          maxWidth: "xl",
          background: "muted",
          eyebrow: "SOLUTION PROVIDER",
          title: "PAMA, MACHINE UTENSILI CUSTOM",
          subtitle: "PAMA sviluppa soluzioni custom per applicazioni industriali complesse.",
          body: "Macchine utensili ad alte prestazioni, progettate per affidabilita e produttivita.",
          ctas: [{ label: "SCOPRI DI PIÙ", href: "#solution-provider", variant: "primary" }],
        },
      },
      contact: {
        blockType: "ContentStory",
        defaults: {
          variant: "simple",
          paddingY: "md",
          maxWidth: "xl",
          background: "muted",
          eyebrow: "ASSISTENZA",
          title: "Service",
          subtitle: "Supporto specialistico dedicato alle macchine utensili.",
          body: "Interventi qualificati, ricambi e consulenza tecnica per garantire continuita produttiva.",
          ctas: [{ label: "SCOPRI DI PIÙ", href: "#assistenza", variant: "primary" }],
        },
      },
      socialproof: {
        blockType: "CardsGrid",
        defaults: {
          paddingY: "lg",
          maxWidth: "xl",
          background: "muted",
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
            { title: "Pama innova per crescere globalmente", description: "Approfondimenti dal mondo PAMA.", cta: { label: "SCOPRI DI PIÙ", href: "#highlights", variant: "link" } },
            { title: "EMO 2025", description: "Save the date: 22-26 Settembre 2025.", cta: { label: "SCOPRI DI PIÙ", href: "#highlights", variant: "link" } },
            { title: "Novità di prodotto", description: "Aggiornamenti su soluzioni e tecnologie.", cta: { label: "SCOPRI DI PIÙ", href: "#highlights", variant: "link" } },
          ],
        },
      },
      footer: {
        blockType: "Footer",
        defaults: {
          variant: "multiColumn",
          paddingY: "md",
          maxWidth: "2xl",
          background: "gradient",
          backgroundGradient: "linear-gradient(180deg, #0b8ea0 0%, #097f8f 100%)",
          columns: [
            { title: "Azienda", links: [{ label: "Chi siamo", href: "#chi-siamo" }, { label: "Contatti", href: "#contatti" }] },
            { title: "Prodotti", links: [{ label: "Settori", href: "#settori" }, { label: "Soluzioni", href: "#prodotti" }] },
            { title: "Supporto", links: [{ label: "Assistenza", href: "#assistenza" }, { label: "News", href: "#highlights" }] },
          ],
          legal: "© 2026 PAMA-inspired template",
        },
      },
    },
  },
  analogue_console_minimal: {
    id: "analogue_console_minimal",
    styleLabels: ["analogue", "retro-gaming", "consumer-electronics", "minimal", "dark", "high-contrast", "photography-led"],
    paletteProfile: "graphite-mono",
    typographySignature: "condensed-sans + neutral-sans",
    layoutPatterns: [
      "thin-nav-monochrome",
      "hero-product-focus",
      "product-grid-image-led",
      "spec-grid-high-contrast",
      "review-band-metrics",
      "dark-minimal-footer",
    ],
    componentSignature: ["Navbar", "HeroSplit", "CardsGrid", "FeatureGrid", "ContentStory", "TestimonialsGrid", "LeadCaptureCTA", "Footer"],
    requiredCategories: ["navigation", "hero", "story", "products", "approach", "socialproof", "cta", "footer"],
    sectionSpecs: {
      navigation: {
        blockType: "Navbar",
        defaults: {
          variant: "simple",
          sticky: false,
          paddingY: "sm",
          maxWidth: "xl",
          background: "none",
          links: [
            { label: "Pocket", href: "#products", variant: "link" },
            { label: "OS", href: "#story", variant: "link" },
            { label: "Features", href: "#features", variant: "link" },
            { label: "Reviews", href: "#reviews", variant: "link" },
          ],
          ctas: [{ label: "Shop", href: "#products", variant: "primary" }],
        },
      },
      hero: {
        blockType: "HeroSplit",
        defaults: {
          paddingY: "lg",
          headingSize: "lg",
          bodySize: "sm",
          maxWidth: "xl",
          mediaPosition: "right",
          background: "none",
          eyebrow: "Shipping Now",
          title: "Analogue Pocket",
          subtitle: "",
          ctas: [
            { label: "Shop Now", href: "#products", variant: "primary" },
            { label: "Explore More", href: "#story", variant: "secondary" },
          ],
        },
      },
      story: {
        blockType: "FeatureWithMedia",
        defaults: {
          variant: "simple",
          paddingY: "lg",
          maxWidth: "xl",
          background: "none",
          eyebrow: "The definitive os",
          title: "The Definitive, Scholarly OS for N64",
          subtitle: "",
          body: "",
          items: [],
          ctas: [],
        },
      },
      products: {
        blockType: "CardsGrid",
        defaults: {
          paddingY: "lg",
          maxWidth: "xl",
          title: "Everything, Elevated",
          subtitle: "",
          variant: "product",
          columns: "4col",
          density: "normal",
          cardStyle: "solid",
          imagePosition: "top",
          imageSize: "md",
          imageShape: "rounded",
          headingSize: "sm",
          bodySize: "sm",
          items: [
            {
              title: "Built for Multiplayer",
              subtitle: "",
              description: "Local multiplayer with low-latency input handling.",
              cta: { label: "Learn", href: "#features", variant: "link" },
            },
            {
              title: "N64 Reimagined in 4K",
              subtitle: "",
              description: "Precision output tuned for modern displays.",
              cta: { label: "Learn", href: "#features", variant: "link" },
            },
            {
              title: "100% Compatibility",
              subtitle: "",
              description: "Hardware and save-path compatibility by design.",
              cta: { label: "Learn", href: "#features", variant: "link" },
            },
            {
              title: "Powered by 3D",
              subtitle: "",
              description: "Rich visuals with faithful motion and detail.",
              cta: { label: "Learn", href: "#features", variant: "link" },
            },
          ],
        },
      },
      approach: {
        blockType: "FeatureWithMedia",
        defaults: {
          paddingY: "lg",
          maxWidth: "xl",
          variant: "simple",
          title: "The New Standard for CRT Perfection in 4K.",
          subtitle: "",
          body: "",
          items: [],
          ctas: [],
        },
      },
      socialproof: {
        blockType: "TestimonialsGrid",
        defaults: {
          variant: "3col",
          paddingY: "lg",
          maxWidth: "xl",
          background: "gradient",
          backgroundGradient: "linear-gradient(180deg, #050505 0%, #0f0f10 100%)",
          backgroundOverlay: "rgba(0,0,0,0.25)",
          backgroundOverlayOpacity: 0.25,
          title: "Analogue Reviews",
          items: [
            { quote: "“A reference-quality handheld with remarkable build quality.”", name: "4.5/5", role: "Reviews" },
            { quote: "“The best modern way to experience classic cartridges.”", name: "5/5", role: "Press" },
            { quote: "“Scholarly OS and outstanding visual fidelity.”", name: "4.5/5", role: "Community" },
            { quote: "“A definitive package for N64 enthusiasts.”", name: "9/10", role: "Media" },
          ],
        },
      },
      cta: {
        blockType: "LeadCaptureCTA",
        defaults: {
          variant: "banner",
          paddingY: "lg",
          maxWidth: "xl",
          background: "gradient",
          backgroundGradient: "linear-gradient(180deg, #080808 0%, #121212 100%)",
          backgroundOverlay: "rgba(0,0,0,0.2)",
          backgroundOverlayOpacity: 0.2,
          title: "We make products to celebrate and explore the history of video games.",
          subtitle: "with the respect it deserves.",
          cta: { label: "All Products", href: "#products", variant: "secondary" },
        },
      },
      footer: {
        blockType: "Footer",
        defaults: {
          variant: "multiColumn",
          paddingY: "md",
          maxWidth: "xl",
          background: "gradient",
          backgroundGradient: "linear-gradient(180deg, #090909 0%, #151515 100%)",
          backgroundOverlay: "rgba(0,0,0,0.15)",
          backgroundOverlayOpacity: 0.15,
          columns: [
            { title: "Products", links: [{ label: "Pocket", href: "#products" }, { label: "3D", href: "#products" }] },
            { title: "Support", links: [{ label: "Help", href: "#support" }, { label: "Contact", href: "#support" }] },
            { title: "Legal", links: [{ label: "Privacy", href: "#legal" }, { label: "Terms", href: "#legal" }] },
          ],
          legal: "© 2026 Analogue-inspired template",
        },
      },
    },
  },
  nexus_engineering_neon: {
    id: "nexus_engineering_neon",
    styleLabels: ["dark", "nexus", "engineering", "precision", "infra", "product"],
    paletteProfile: "dark-neon-orange",
    typographySignature: "bold-sans + compact-sans",
    layoutPatterns: [
      "minimal-nav-dark",
      "hero-product-orchestration",
      "dashboard-ops-strip",
      "feature-card-grid-dark",
      "dashboard-case-study",
      "proof-showcase-dark",
      "workflow-footer-glow",
    ],
    componentSignature: [
      "Navbar",
      "NeonHeroBeam",
      "NeonDashboardStrip",
      "NeonFeatureCards",
      "NeonResultsShowcase",
      "NeonFooterGlow",
    ],
    requiredCategories: ["navigation", "hero", "story", "approach", "products", "socialproof", "footer"],
    sectionSpecs: {
      navigation: {
        blockType: "Navbar",
        defaults: {
          variant: "withCTA",
          sticky: true,
          paddingY: "sm",
          maxWidth: "xl",
          background: "gradient",
          links: [
            { label: "Home", href: "#top", variant: "link" },
            { label: "Services", href: "#services", variant: "link" },
            { label: "About", href: "#about", variant: "link" },
            { label: "Contact", href: "#contact", variant: "link" },
          ],
          ctas: [{ label: "Get Started", href: "#contact", variant: "primary" }],
        },
      },
      hero: {
        blockType: "NeonHeroBeam",
        defaults: {
          paddingY: "lg",
          maxWidth: "xl",
          badge: "Nexus Platform",
          title: "Nexus is a precision tool for orchestrating product releases",
          subtitle: "Ship with velocity while maintaining reliability, policy control, and measurable rollout quality.",
          panelTag: "Performance",
          panelTitle: "Release Velocity",
          panelSubtitle: "Automated orchestration across environments.",
          statValue: "+842%",
          statDelta: "vs baseline",
          ctas: [
            { label: "Explore Platform", href: "#services", variant: "primary" },
            { label: "View Metrics", href: "#proof", variant: "secondary" },
          ],
        },
      },
      story: {
        blockType: "NeonDashboardStrip",
        defaults: {
          paddingY: "md",
          maxWidth: "xl",
          eyebrow: "Wave 01",
          title: "Engineered for modern product teams",
          subtitle: "Operational confidence through unified workflows, observability, and rollout controls.",
          tabs: [{ label: "Releases" }, { label: "Policy" }, { label: "Insights" }, { label: "Safety" }, { label: "AI" }],
          metrics: [
            { label: "Deploy Frequency", value: "96/day" },
            { label: "Rollback Window", value: "< 3 min" },
            { label: "Policy Coverage", value: "99.2%" },
          ],
          kpis: [
            { label: "Team Workspaces", value: "54" },
            { label: "Services Managed", value: "216" },
            { label: "Active Alerts", value: "7" },
          ],
        },
      },
      approach: {
        blockType: "NeonFeatureCards",
        defaults: {
          paddingY: "lg",
          maxWidth: "xl",
          title: "Deploy with velocity, scale without ceremony.",
          subtitle: "Control release workflows without adding operational drag.",
          items: [
            { title: "Zero-config infrastructure", description: "Provision workers, routes, and policies in one surface.", highlight: true },
            { title: "Traffic-aware scaling", description: "Continuously adapt workloads to demand signals." },
            { title: "Precision analytics", description: "Observe rollout health and budget impact in real time." },
            { title: "Unified workflow control", description: "Feature flags, canary rollouts, and instant rollback." },
          ],
        },
      },
      products: {
        blockType: "NeonDashboardStrip",
        defaults: {
          paddingY: "md",
          maxWidth: "xl",
          eyebrow: "Wave 02",
          title: "AI-assisted product orchestration",
          subtitle: "Guide releases with context-aware automation and operator oversight.",
          tabs: [{ label: "Pipelines" }, { label: "Signals" }, { label: "Budgets" }, { label: "Teams" }],
          metrics: [
            { label: "Release Success", value: "99.4%" },
            { label: "Error Budget Burn", value: "-42%" },
            { label: "Mean Restore Time", value: "2m 18s" },
          ],
          kpis: [
            { label: "Active Pipelines", value: "128" },
            { label: "Guardrail Rules", value: "73" },
            { label: "AI Recommendations", value: "312" },
          ],
        },
      },
      socialproof: {
        blockType: "NeonResultsShowcase",
        defaults: {
          paddingY: "lg",
          maxWidth: "xl",
          title: "Ship faster with Nexus",
          subtitle: "Teams report higher confidence and lower operational load after rollout.",
          quote:
            "Nexus gave us a single control plane for releases. We moved faster while reducing incident pressure across teams.",
          author: "Claire",
          role: "Engineering Lead",
        },
      },
      footer: {
        blockType: "NeonFooterGlow",
        defaults: {
          paddingY: "md",
          maxWidth: "xl",
          title: "Ready to streamline your workflow?",
          subtitle: "Join high-performance engineering teams using Nexus to orchestrate delivery from idea to shipping.",
          primaryCta: { label: "Start building for free", href: "#contact", variant: "primary" },
          secondaryCta: { label: "Contact Sales", href: "#contact", variant: "secondary" },
          columns: [
            { title: "Product", links: [{ label: "Features", href: "#services" }, { label: "Integrations", href: "#services" }] },
            { title: "Company", links: [{ label: "About", href: "#about" }, { label: "Careers", href: "#about" }] },
            { title: "Resources", links: [{ label: "Community", href: "#resources" }, { label: "Help Center", href: "#resources" }] },
            { title: "Legal", links: [{ label: "Privacy Policy", href: "#legal" }, { label: "Terms of Service", href: "#legal" }] },
          ],
          legal: "© 2024 Nexus Inc. All rights reserved.",
        },
      },
    },
  },
  social_automation_neon: {
    id: "social_automation_neon",
    styleLabels: ["dark", "neon", "orange-accent", "growth", "saas"],
    paletteProfile: "dark-neon-orange",
    typographySignature: "bold-sans + display-sans",
    layoutPatterns: [
      "hero-beam-split",
      "dashboard-strip",
      "metrics-orbit-dual",
      "feature-cards-neon",
      "pricing-split-neon",
      "footer-glow-band",
    ],
    componentSignature: [
      "Navbar",
      "NeonHeroBeam",
      "NeonDashboardStrip",
      "NeonMetricsOrbit",
      "NeonFeatureCards",
      "NeonResultsShowcase",
      "NeonPricingSplit",
      "NeonFooterGlow",
    ],
    requiredCategories: ["navigation", "hero", "story", "approach", "products", "socialproof", "cta", "footer"],
    sectionSpecs: {
      navigation: {
        blockType: "Navbar",
        defaults: {
          variant: "withCTA",
          sticky: true,
          paddingY: "sm",
          maxWidth: "xl",
          background: "gradient",
          links: [
            { label: "Platform", href: "#platform", variant: "link" },
            { label: "Features", href: "#features", variant: "link" },
            { label: "Pricing", href: "#pricing", variant: "link" },
            { label: "Resources", href: "#resources", variant: "link" },
          ],
          ctas: [{ label: "Get Started", href: "#pricing", variant: "primary" }],
        },
      },
      hero: {
        blockType: "NeonHeroBeam",
        defaults: {
          paddingY: "lg",
          maxWidth: "xl",
          badge: "Social Growth, Autopilot Mode",
          title: "Social Reach. Automated Growth. Viral Results.",
          subtitle: "Scale campaigns with AI workflows, predictive insights, and measurable growth velocity.",
          panelTag: "Viral Result",
          panelTitle: "Growth Velocity",
          panelSubtitle: "Automated engagement hitting viral peaks.",
          statValue: "+842%",
          statDelta: "vs last week",
          ctas: [
            { label: "Explore Platform", href: "#platform", variant: "primary" },
            { label: "View Metrics", href: "#metrics", variant: "secondary" },
          ],
        },
      },
      story: {
        blockType: "NeonDashboardStrip",
        defaults: {
          paddingY: "md",
          maxWidth: "xl",
          eyebrow: "Wave 01",
          title: "Scale your reach instantly",
          subtitle: "Precision targeting, automated workflows, and brand safety controls.",
          tabs: [{ label: "Overview" }, { label: "Campaigns" }, { label: "Insights" }, { label: "Safety" }, { label: "AI" }],
          metrics: [
            { label: "Campaign Velocity", value: "+842%" },
            { label: "Total Reach", value: "2.4M" },
            { label: "Safety Score", value: "99.2%" },
          ],
          kpis: [
            { label: "Live Campaigns", value: "54" },
            { label: "Active Markets", value: "16" },
            { label: "Avg CTR", value: "4.8%" },
          ],
        },
      },
      approach: {
        blockType: "NeonMetricsOrbit",
        defaults: {
          paddingY: "lg",
          maxWidth: "xl",
          title: "Scale your reach instantly",
          subtitle: "Precision targeting, automated workflows, and brand safety controls.",
          metrics: [
            { label: "Campaign Velocity", value: "96k / week" },
            { label: "Reach Lift", value: "+842%" },
            { label: "Brand-safe Coverage", value: "99.2%" },
          ],
          chips: [{ label: "TikTok" }, { label: "Instagram" }, { label: "YouTube" }, { label: "X" }],
        },
      },
      products: {
        blockType: "NeonFeatureCards",
        defaults: {
          paddingY: "lg",
          maxWidth: "xl",
          title: "Engineered for exponential growth",
          subtitle: "Modular capability blocks for velocity, safety, and omnichannel scale.",
          items: [
            { title: "Predictive Intelligence", description: "Model outcomes before spend.", highlight: true },
            { title: "Autonomous Velocity", description: "Orchestrate publishing with adaptive timing." },
            { title: "Safety by Design", description: "Brand-safe automation with policy guardrails." },
            { title: "Omnichannel Scale", description: "Coordinate every channel from one control layer." },
          ],
        },
      },
      socialproof: {
        blockType: "NeonResultsShowcase",
        defaults: {
          paddingY: "lg",
          maxWidth: "xl",
          title: "Real results. Real growth.",
          subtitle: "Proof that strategy and structure drive meaningful outcomes.",
          quote: "We watched 56 creators double qualified reach while cutting manual operations effort in half.",
          author: "Claire",
          role: "Growth Director",
        },
      },
      cta: {
        blockType: "NeonPricingSplit",
        defaults: {
          paddingY: "lg",
          maxWidth: "xl",
          title: "Unlock viral growth",
          subtitle: "Choose your plan and activate automation in minutes.",
          items: [
            { name: "Creator", price: "$29" },
            { name: "Pro Growth", price: "$79" },
            { name: "Agency", price: "$199" },
          ],
          featuredName: "Creator",
          featuredPrice: "$29.00 / mo",
          features: [
            { label: "AI campaign orchestration" },
            { label: "Multi-channel scheduler" },
            { label: "Attribution insights" },
            { label: "Priority support" },
          ],
          cta: { label: "Start Free Trial", href: "#pricing", variant: "primary" },
        },
      },
      footer: {
        blockType: "NeonFooterGlow",
        defaults: {
          paddingY: "md",
          maxWidth: "xl",
          title: "Join our newsletter",
          subtitle: "Get strategic updates on digital media growth, automation, and creator insights.",
          primaryCta: { label: "Get Started", href: "#contact", variant: "primary" },
          secondaryCta: { label: "Learn More", href: "#features", variant: "secondary" },
          columns: [
            { title: "Platform", links: [{ label: "Capabilities", href: "#features" }, { label: "Pricing", href: "#pricing" }] },
            { title: "Resources", links: [{ label: "Docs", href: "#docs" }, { label: "Status", href: "#status" }] },
            { title: "Company", links: [{ label: "About", href: "#about" }, { label: "Contact", href: "#contact" }] },
          ],
        },
      },
    },
  },
  modern_saas: {
    id: "modern_saas",
    styleLabels: ["saas", "modern", "conversion", "clean"],
    paletteProfile: "cool-neutral",
    typographySignature: "sans-display + sans-body",
    layoutPatterns: ["hero-split", "feature-grid", "trust-grid", "cta-banner"],
    componentSignature: ["Navbar", "HeroSplit", "FeatureGrid", "TestimonialsGrid", "LeadCaptureCTA", "Footer"],
    requiredCategories: ["navigation", "hero", "approach", "socialproof", "cta", "footer"],
    sectionSpecs: {
      navigation: {
        blockType: "Navbar",
        defaults: { variant: "withCTA", sticky: true, paddingY: "sm", maxWidth: "xl" },
      },
      hero: {
        blockType: "HeroSplit",
        defaults: { mediaPosition: "right", paddingY: "lg", headingSize: "md", maxWidth: "xl" },
      },
      approach: {
        blockType: "FeatureGrid",
        defaults: { variant: "3col", paddingY: "lg", maxWidth: "xl" },
      },
      socialproof: {
        blockType: "TestimonialsGrid",
        defaults: { variant: "2col", paddingY: "lg", maxWidth: "xl" },
      },
      cta: {
        blockType: "LeadCaptureCTA",
        defaults: { variant: "banner", paddingY: "lg", maxWidth: "xl" },
      },
      footer: {
        blockType: "Footer",
        defaults: { variant: "multiColumn", paddingY: "md", maxWidth: "xl" },
      },
    },
  },
  calm_service: {
    id: "calm_service",
    styleLabels: ["wellness", "hospitality", "calm", "service"],
    paletteProfile: "soft-neutral",
    typographySignature: "serif-accent + sans-body",
    layoutPatterns: ["hero-split", "story-split", "feature-grid", "testimonial-grid", "banner-cta"],
    componentSignature: [
      "Navbar",
      "HeroSplit",
      "ContentStory",
      "FeatureGrid",
      "TestimonialsGrid",
      "LeadCaptureCTA",
      "Footer",
    ],
    requiredCategories: ["navigation", "hero", "story", "approach", "socialproof", "cta", "footer"],
    sectionSpecs: {
      navigation: {
        blockType: "Navbar",
        defaults: { variant: "withCTA", sticky: true, paddingY: "sm", maxWidth: "xl" },
      },
      hero: {
        blockType: "HeroSplit",
        defaults: { mediaPosition: "right", paddingY: "lg", headingSize: "md", maxWidth: "xl" },
      },
      story: {
        blockType: "ContentStory",
        defaults: { variant: "split", paddingY: "lg", maxWidth: "xl" },
      },
      approach: {
        blockType: "FeatureGrid",
        defaults: { variant: "3col", paddingY: "lg", maxWidth: "xl" },
      },
      socialproof: {
        blockType: "TestimonialsGrid",
        defaults: { variant: "2col", paddingY: "lg", maxWidth: "xl" },
      },
      cta: {
        blockType: "LeadCaptureCTA",
        defaults: { variant: "banner", paddingY: "lg", maxWidth: "xl" },
      },
      footer: {
        blockType: "Footer",
        defaults: { variant: "multiColumn", paddingY: "md", maxWidth: "xl" },
      },
    },
  },
};

const nowStamp = () => {
  const d = new Date();
  const pad = (v) => String(v).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(
    d.getSeconds()
  )}`;
};

const slug = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

const parseArgs = (argv) => {
  const options = {
    manifest: DEFAULT_MANIFEST,
    runId: `tf-${nowStamp()}`,
    skipIngest: false,
    requestedSkipRegression: false,
    publish: true,
    groups: DEFAULT_TEMPLATE_FIRST_GROUP,
    renderer: "sandbox",
    maxCases: 0,
    previewBaseUrl: DEFAULT_PREVIEW_BASE_URL,
    launchPreviewServer: true,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--manifest" && next) {
      options.manifest = path.resolve(ROOT, next);
      i += 1;
      continue;
    }
    if (arg === "--run-id" && next) {
      options.runId = slug(next) || options.runId;
      i += 1;
      continue;
    }
    if (arg === "--groups" && next) {
      options.groups = String(next).trim();
      i += 1;
      continue;
    }
    if (arg === "--renderer" && next) {
      options.renderer = String(next).trim().toLowerCase() === "render" ? "render" : "sandbox";
      i += 1;
      continue;
    }
    if (arg === "--preview-base-url" && next) {
      options.previewBaseUrl = String(next).trim() || options.previewBaseUrl;
      i += 1;
      continue;
    }
    if (arg === "--max-cases" && next) {
      options.maxCases = Number(next) || 0;
      i += 1;
      continue;
    }
    if (arg === "--skip-ingest") {
      options.skipIngest = true;
      continue;
    }
    if (arg === "--skip-regression") {
      options.requestedSkipRegression = true;
      continue;
    }
    if (arg === "--no-publish") {
      options.publish = false;
      continue;
    }
    if (arg === "--no-preview-server") {
      options.launchPreviewServer = false;
      continue;
    }
  }

  return options;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizePreviewBaseUrl = (raw) => {
  try {
    const parsed = new URL(raw);
    return parsed.origin;
  } catch {
    return DEFAULT_PREVIEW_BASE_URL;
  }
};

const rebaseToPreviewOrigin = (rawUrl, previewOrigin) => {
  if (!rawUrl) return "";
  try {
    const input = new URL(rawUrl);
    const base = new URL(previewOrigin);
    return `${base.origin}${input.pathname}${input.search}${input.hash}`;
  } catch {
    return rawUrl;
  }
};

const canReachUrl = async (url, timeoutMs = 1500) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, { signal: controller.signal, redirect: "follow" });
    clearTimeout(timeout);
    return res.status >= 200 && res.status < 500;
  } catch {
    return false;
  }
};

const ensurePreviewServer = async ({ previewBaseUrl }) => {
  const origin = normalizePreviewBaseUrl(previewBaseUrl);
  const reachable = await canReachUrl(origin, 1500);
  if (reachable) {
    return { origin, reachable: true, started: false, logPath: null, mode: "existing" };
  }

  const parsed = new URL(origin);
  const port = Number(parsed.port || (parsed.protocol === "https:" ? 443 : 80));
  const startLogPath = `/tmp/template-factory-preview-${port}.log`;
  const startCmd = `cd ${JSON.stringify(ROOT)} && nohup npm run start -- -p ${Math.floor(port)} > ${JSON.stringify(
    startLogPath
  )} 2>&1 < /dev/null &`;

  const tryStartAndWait = async (modeLabel, attempts = 30) => {
    await runShell(startCmd, { cwd: ROOT, allowFailure: true });
    for (let i = 0; i < attempts; i += 1) {
      if (await canReachUrl(origin, 1500)) {
        return { origin, reachable: true, started: true, logPath: startLogPath, mode: modeLabel };
      }
      await wait(1000);
    }
    return null;
  };

  const fastStart = await tryStartAndWait("start");
  if (fastStart) return fastStart;

  const buildCmd = `cd ${JSON.stringify(ROOT)} && npm run build`;
  await runShell(buildCmd, { cwd: ROOT, allowFailure: true });
  const buildThenStart = await tryStartAndWait("build+start", 45);
  if (buildThenStart) return buildThenStart;

  return {
    origin,
    reachable: false,
    started: true,
    logPath: startLogPath,
    mode: "failed",
  };
};

const ensureDir = async (dir) => {
  await fs.mkdir(dir, { recursive: true });
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

const parseCsvLine = (line) => {
  const values = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }
    current += ch;
  }
  values.push(current.trim());
  return values;
};

const parseCsvManifest = async (filePath) => {
  const raw = await fs.readFile(filePath, "utf8");
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0]).map((header) => header.toLowerCase());
  const sites = [];
  for (let i = 1; i < lines.length; i += 1) {
    const row = parseCsvLine(lines[i]);
    const item = {};
    headers.forEach((header, index) => {
      item[header] = row[index] || "";
    });
    sites.push(item);
  }
  return sites;
};

const normalizeSite = (raw, index) => {
  const id = slug(raw.id || raw.site_id || raw.name || `site-${index + 1}`);
  const url = typeof raw.url === "string" ? raw.url.trim() : "";
  const prompt = typeof raw.prompt === "string" ? raw.prompt.trim() : "";
  const description = typeof raw.description === "string" ? raw.description.trim() : "";
  const desktopScreenshot =
    typeof raw.desktopScreenshot === "string"
      ? raw.desktopScreenshot
      : typeof raw.desktop_screenshot === "string"
        ? raw.desktop_screenshot
        : "";
  const mobileScreenshot =
    typeof raw.mobileScreenshot === "string"
      ? raw.mobileScreenshot
      : typeof raw.mobile_screenshot === "string"
        ? raw.mobile_screenshot
        : "";

  return {
    id: id || `site-${index + 1}`,
    url,
    prompt,
    description,
    desktopScreenshot: desktopScreenshot.trim(),
    mobileScreenshot: mobileScreenshot.trim(),
  };
};

const loadManifest = async (manifestPath) => {
  const ext = path.extname(manifestPath).toLowerCase();
  if (ext === ".csv") {
    const rows = await parseCsvManifest(manifestPath);
    return rows.map((row, index) => normalizeSite(row, index)).filter((item) => item.url || item.prompt);
  }

  const raw = await fs.readFile(manifestPath, "utf8");
  const parsed = JSON.parse(raw);
  const rows = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.sites) ? parsed.sites : [];
  return rows.map((row, index) => normalizeSite(row, index)).filter((item) => item.url || item.prompt);
};

const stripHtml = (value) =>
  String(value || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const extractFirstMatches = (html, regex, limit = 8) => {
  const out = [];
  let match;
  while ((match = regex.exec(html)) && out.length < limit) {
    const value = stripHtml(match[1] || "");
    if (value) out.push(value);
  }
  return out;
};

const fetchHtmlSummary = async (url) => {
  if (!url) return { title: "", h1: [], h2: [], links: [] };
  try {
    const ctrl = new AbortController();
    const timeout = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(url, { signal: ctrl.signal, redirect: "follow" });
    clearTimeout(timeout);
    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = stripHtml(titleMatch?.[1] || "");
    const h1 = extractFirstMatches(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi, 4);
    const h2 = extractFirstMatches(html, /<h2[^>]*>([\s\S]*?)<\/h2>/gi, 8);
    const links = extractFirstMatches(html, /<a[^>]*>([\s\S]*?)<\/a>/gi, 10);
    return {
      title,
      h1,
      h2,
      links,
      htmlChars: html.length,
      status: res.status,
    };
  } catch (error) {
    return {
      title: "",
      h1: [],
      h2: [],
      links: [],
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

const getFileSize = async (filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return Number(stats.size || 0);
  } catch {
    return 0;
  }
};

const isLikelyBlankScreenshot = async (filePath) => {
  // Empirical guard: blank PNGs captured by chromium are often ~4KB.
  const size = await getFileSize(filePath);
  return size > 0 && size <= 12000;
};

const choosePreferredScreenshot = async (candidates) => {
  let best = null;
  let bestScore = -1;
  for (const candidate of candidates) {
    if (!candidate) continue;
    const size = await getFileSize(candidate);
    if (!size) continue;
    const isBlankLike = size <= 12000;
    const score = (isBlankLike ? 0 : 1_000_000) + size;
    if (score > bestScore) {
      bestScore = score;
      best = candidate;
    }
  }
  return best;
};

const captureWithBrowser = async ({ url, outPath, mobile, browser, waitMs = 3500 }) => {
  const device = mobile ? ' --device "iPhone 13"' : "";
  const browserArg = browser ? ` --browser ${browser}` : "";
  const cmd = `cd ${JSON.stringify(
    ROOT
  )} && npx playwright screenshot --full-page${browserArg}${device} --wait-for-timeout ${Math.floor(
    waitMs
  )} ${JSON.stringify(url)} ${JSON.stringify(outPath)}`;
  await runShell(cmd, { cwd: ROOT });
};

const captureWithPuppeteer = async ({ url, outPath, mobile }) => {
  const mod = await import("puppeteer");
  const puppeteer = mod?.default ?? mod;
  if (!puppeteer?.launch) {
    throw new Error("puppeteer_launch_unavailable");
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    if (mobile) {
      await page.setViewport({
        width: 390,
        height: 844,
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      });
    } else {
      await page.setViewport({
        width: 1440,
        height: 900,
        deviceScaleFactor: 1,
      });
    }

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(3000);

    // Trigger lazy sections by scrolling through the page once.
    await page.evaluate(async () => {
      const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      if (maxScroll <= 0) return;
      const step = Math.max(320, Math.floor(window.innerHeight * 0.75));
      let y = 0;
      let guard = 0;
      while (y < maxScroll && guard < 120) {
        y = Math.min(maxScroll, y + step);
        window.scrollTo({ top: y, behavior: "instant" });
        await sleep(140);
        guard += 1;
      }
      await sleep(1200);
      window.scrollTo({ top: 0, behavior: "instant" });
      await sleep(300);
    });

    await page.screenshot({ path: outPath, fullPage: true });
  } finally {
    await browser.close();
  }
};

const captureScreenshot = async ({ url, outPath, mobile = false }) => {
  if (!url) return null;
  await ensureDir(path.dirname(outPath));

  try {
    await captureWithPuppeteer({ url, outPath, mobile });
  } catch {
    await captureWithBrowser({ url, outPath, mobile, browser: "chromium", waitMs: 3500 });
    if (await isLikelyBlankScreenshot(outPath)) {
      await captureWithBrowser({ url, outPath, mobile, browser: "webkit", waitMs: 5000 });
    }
  }

  return outPath;
};

const safeCopy = async (fromPath, toPath) => {
  if (!fromPath) return null;
  const absolute = path.isAbsolute(fromPath) ? fromPath : path.join(ROOT, fromPath);
  try {
    await ensureDir(path.dirname(toPath));
    await fs.copyFile(absolute, toPath);
    return toPath;
  } catch {
    return null;
  }
};

const publishReferenceAssets = async ({ siteId, desktopSource, mobileSource }) => {
  const normalizedId = slug(siteId || "site") || "site";
  const targetDir = path.join(PUBLIC_TEMPLATE_ASSETS_DIR, normalizedId);
  await ensureDir(targetDir);

  const copyToPublic = async (sourcePath, stem) => {
    if (!sourcePath) return null;
    const ext = path.extname(sourcePath) || ".png";
    const targetPath = path.join(targetDir, `${stem}${ext}`);
    await fs.copyFile(sourcePath, targetPath);
    return `/assets/template-factory/${normalizedId}/${stem}${ext}`;
  };

  try {
    const desktopUrl = await copyToPublic(desktopSource, "desktop-reference");
    const mobileUrl = await copyToPublic(mobileSource, "mobile-reference");
    return { desktopUrl, mobileUrl };
  } catch {
    return { desktopUrl: null, mobileUrl: null };
  }
};

const getImageDimensions = async (filePath) => {
  if (!filePath) return null;
  try {
    const cmd = `/usr/bin/sips -g pixelWidth -g pixelHeight ${JSON.stringify(filePath)}`;
    const { stdout } = await runShell(cmd, { cwd: ROOT });
    const widthMatch = stdout.match(/pixelWidth:\s*(\d+)/);
    const heightMatch = stdout.match(/pixelHeight:\s*(\d+)/);
    const width = Number(widthMatch?.[1] || 0);
    const height = Number(heightMatch?.[1] || 0);
    if (!width || !height) return null;
    return { width, height };
  } catch {
    return null;
  }
};

const createImageSlice = async ({ sourcePath, targetPath, topRatio, heightRatio }) => {
  const dims = await getImageDimensions(sourcePath);
  if (!dims) return null;
  const cropHeight = Math.max(64, Math.min(dims.height, Math.round(dims.height * heightRatio)));
  const maxTop = Math.max(0, dims.height - cropHeight);
  const top = Math.max(0, Math.min(maxTop, Math.round(dims.height * topRatio)));
  await ensureDir(path.dirname(targetPath));
  const cmd = `/usr/bin/sips -c ${cropHeight} ${dims.width} --cropOffset ${top} 0 ${JSON.stringify(sourcePath)} -o ${JSON.stringify(
    targetPath
  )}`;
  await runShell(cmd, { cwd: ROOT });
  return targetPath;
};

const createReferenceSlices = async ({ siteId, desktopSource, mobileSource, preset }) => {
  const normalizedId = slug(siteId || "site") || "site";
  const targetDir = path.join(PUBLIC_TEMPLATE_ASSETS_DIR, normalizedId, "slices");
  await ensureDir(targetDir);

  const isDesignerPreset = preset === "designer_portfolio_minimal";
  const isNexusPreset = preset === "nexus_engineering_neon";
  const isAnaloguePreset = preset === "analogue_console_minimal";
  const isPamamaPreset = preset === "pamama_machine_tools_corporate";
  const desktopRatios = isDesignerPreset
    ? {
        hero: { top: 0.0, height: 0.16 },
        story: { top: 0.16, height: 0.2 },
        approach: { top: 0.34, height: 0.2 },
        products: { top: 0.52, height: 0.2 },
        socialproof: { top: 0.73, height: 0.11 },
        cta: { top: 0.84, height: 0.08 },
        footer: { top: 0.91, height: 0.09 },
      }
    : isNexusPreset
      ? {
          hero: { top: 0.0, height: 0.2 },
          story: { top: 0.2, height: 0.14 },
          approach: { top: 0.34, height: 0.23 },
          products: { top: 0.57, height: 0.16 },
          socialproof: { top: 0.73, height: 0.12 },
          cta: { top: 0.85, height: 0.06 },
          footer: { top: 0.9, height: 0.1 },
        }
    : isAnaloguePreset
      ? {
          hero: { top: 0.0, height: 0.16 },
          story: { top: 0.16, height: 0.18 },
          approach: { top: 0.34, height: 0.12 },
          products: { top: 0.46, height: 0.2 },
          socialproof: { top: 0.66, height: 0.12 },
          cta: { top: 0.78, height: 0.1 },
          footer: { top: 0.88, height: 0.12 },
        }
    : isPamamaPreset
      ? {
          hero: { top: 0.0, height: 0.18 },
          approach: { top: 0.18, height: 0.16 },
          story: { top: 0.35, height: 0.16 },
          products: { top: 0.51, height: 0.2 },
          cta: { top: 0.71, height: 0.12 },
          socialproof: { top: 0.83, height: 0.12 },
          footer: { top: 0.94, height: 0.06 },
        }
    : {
        hero: { top: 0.0, height: 0.26 },
        story: { top: 0.18, height: 0.22 },
        approach: { top: 0.37, height: 0.18 },
        products: { top: 0.54, height: 0.18 },
        socialproof: { top: 0.72, height: 0.12 },
        cta: { top: 0.82, height: 0.1 },
        footer: { top: 0.9, height: 0.1 },
      };
  const mobileRatios = isDesignerPreset
    ? {
        hero: { top: 0.0, height: 0.18 },
        story: { top: 0.18, height: 0.2 },
        approach: { top: 0.37, height: 0.2 },
        products: { top: 0.56, height: 0.2 },
        socialproof: { top: 0.75, height: 0.1 },
        cta: { top: 0.84, height: 0.08 },
        footer: { top: 0.91, height: 0.09 },
      }
    : isNexusPreset
      ? {
          hero: { top: 0.0, height: 0.24 },
          story: { top: 0.24, height: 0.14 },
          approach: { top: 0.38, height: 0.2 },
          products: { top: 0.58, height: 0.16 },
          socialproof: { top: 0.74, height: 0.12 },
          cta: { top: 0.86, height: 0.05 },
          footer: { top: 0.91, height: 0.09 },
        }
    : isAnaloguePreset
      ? {
          hero: { top: 0.0, height: 0.2 },
          story: { top: 0.2, height: 0.18 },
          approach: { top: 0.38, height: 0.13 },
          products: { top: 0.51, height: 0.22 },
          socialproof: { top: 0.73, height: 0.11 },
          cta: { top: 0.84, height: 0.07 },
          footer: { top: 0.9, height: 0.1 },
        }
    : isPamamaPreset
      ? {
          hero: { top: 0.0, height: 0.22 },
          approach: { top: 0.22, height: 0.16 },
          story: { top: 0.38, height: 0.15 },
          products: { top: 0.53, height: 0.2 },
          cta: { top: 0.73, height: 0.12 },
          socialproof: { top: 0.84, height: 0.1 },
          footer: { top: 0.94, height: 0.06 },
        }
    : {
        hero: { top: 0.0, height: 0.28 },
        story: { top: 0.2, height: 0.22 },
        approach: { top: 0.42, height: 0.16 },
        products: { top: 0.57, height: 0.18 },
        socialproof: { top: 0.74, height: 0.11 },
        cta: { top: 0.84, height: 0.08 },
        footer: { top: 0.91, height: 0.09 },
      };

  const desktop = {};
  const mobile = {};

  if (desktopSource) {
    for (const [key, ratio] of Object.entries(desktopRatios)) {
      const outPath = path.join(targetDir, `desktop-${key}.png`);
      const result = await createImageSlice({
        sourcePath: desktopSource,
        targetPath: outPath,
        topRatio: ratio.top,
        heightRatio: ratio.height,
      });
      if (result) desktop[key] = `/assets/template-factory/${normalizedId}/slices/desktop-${key}.png`;
    }
  }

  if (mobileSource) {
    for (const [key, ratio] of Object.entries(mobileRatios)) {
      const outPath = path.join(targetDir, `mobile-${key}.png`);
      const result = await createImageSlice({
        sourcePath: mobileSource,
        targetPath: outPath,
        topRatio: ratio.top,
        heightRatio: ratio.height,
      });
      if (result) mobile[key] = `/assets/template-factory/${normalizedId}/slices/mobile-${key}.png`;
    }
  }

  return { desktop, mobile };
};

const textTokens = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]+/g, " ")
    .split(/\s+/)
    .map((item) => item.trim())
    .filter((item) => item && item.length > 2);

const chooseRecipe = ({ prompt, title, url, siteId = "" }) => {
  const joined = `${prompt} ${title} ${url} ${siteId}`.toLowerCase();
  const has = (pattern) => pattern.test(joined);
  const siteFingerprint = `${siteId} ${url}`.toLowerCase();

  // Strong explicit routing by source identity first.
  if (/designer-portfolio-81|nava-moon|nava moon/.test(siteFingerprint)) {
    return RECIPES.designer_portfolio_minimal;
  }
  if (/nexus-engineering|nexusengineering|nexus/.test(siteFingerprint)) {
    return RECIPES.nexus_engineering_neon;
  }
  if (/social-automation|socialautomation|luma/.test(siteFingerprint)) {
    return RECIPES.social_automation_neon;
  }
  if (/analogue|analogue\.co|analogueco|pocket/.test(siteFingerprint)) {
    return RECIPES.analogue_console_minimal;
  }
  if (/pamama|pamamachinetools|pama-machinetools|pama/.test(siteFingerprint)) {
    return RECIPES.pamama_machine_tools_corporate;
  }

  if (has(/designer-portfolio-81|designer portfolio 81|nava moon|future of design content/i)) {
    return RECIPES.designer_portfolio_minimal;
  }
  if (has(/nexus|release orchestration|orchestrating product releases|ship faster/)) return RECIPES.nexus_engineering_neon;
  if (has(/analogue|analogue pocket|retro handheld|fpga|retro gaming|cartridge|game preservation/))
    return RECIPES.analogue_console_minimal;
  if (has(/pamama|pama machine tools|machine tools|settori|prodotti|assistenza|contatti/))
    return RECIPES.pamama_machine_tools_corporate;
  if (has(/industrial|manufactur|factory|equipment|b2b|automation|engineering/)) return RECIPES.industrial_precision;
  if (
    has(/social-automation|social automation|viral|growth velocity|reach automation|creator ai|luma/i) ||
    (has(/social|creator|campaign|viral|growth/) && has(/neon|orange glow|autopilot|automation/))
  ) {
    return RECIPES.social_automation_neon;
  }
  if (has(/sixtine|gallery|editorial|luxury|spatial|interior/)) return RECIPES.editorial_luxury;
  if (has(/wellness|clinic|hospitality|travel|hotel|retreat/)) return RECIPES.calm_service;
  if (has(/saas|ai|developer|fintech|platform|cloud|tooling|software/)) return RECIPES.modern_saas;
  return RECIPES.modern_saas;
};

const unique = (items) => Array.from(new Set(items.filter(Boolean)));

const identityTokens = (value) => {
  const raw = String(value || "").toLowerCase().trim();
  if (!raw) return [];
  const parts = raw
    .replace(/https?:\/\//g, " ")
    .replace(/[^a-z0-9.-]+/g, " ")
    .split(/[\s.-]+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 2);
  const joined = parts.join("");
  return unique([joined, ...parts].filter((item) => item && item.length > 2));
};

const buildKeywords = ({ site, recipe, summary }) => {
  const host = (() => {
    try {
      return new URL(site.url).hostname.replace(/^www\./, "");
    } catch {
      return "";
    }
  })();

  const rawTokens = textTokens(
    [site.prompt, site.description, summary.title, ...summary.h1, ...summary.h2, host, site.id, ...recipe.styleLabels].join(
      " "
    )
  );

  const filtered = rawTokens.filter((token) => !STOPWORDS.has(token));
  const identity = unique([...identityTokens(site.id), ...identityTokens(host)]);
  return unique([...identity, ...filtered]).slice(0, 24);
};

const buildIndexCard = ({ site, recipe, summary, evidence }) => {
  const keywords = buildKeywords({ site, recipe, summary });
  const useCases = unique([
    site.description || "",
    ...recipe.styleLabels,
    recipe.id.includes("industrial") ? "b2b-website" : "brand-website",
  ]).filter(Boolean);

  return {
    template_id: `auto_${site.id}`,
    source: {
      url: site.url || "",
      site_id: site.id,
      title: summary.title || site.id,
    },
    style_labels: recipe.styleLabels,
    palette_profile: recipe.paletteProfile,
    typography_signature: recipe.typographySignature,
    layout_patterns: recipe.layoutPatterns,
    component_signature: recipe.componentSignature,
    suitable_use_cases: useCases,
    confidence_overall: 0.72,
    evidence_type: unique([
      site.url ? "url" : "",
      evidence?.desktop ? "screenshot_desktop" : "",
      evidence?.mobile ? "screenshot_mobile" : "",
      summary.title ? "html_snapshot" : "",
    ]).filter(Boolean),
    keywords,
  };
};

const buildSectionDefaults = (kind, spec, site, summary, assets = {}) => {
  const pageTitle = summary.title || site.id || "Site";
  const promptLine = site.prompt || site.description || "";
  const defaults = { ...(spec.defaults || {}) };
  const blockType = String(spec?.blockType || "");
  const siteFingerprint = `${site?.id || ""} ${site?.url || ""}`.toLowerCase();
  const isPamamaSite = /pamama|pamamachinetools|pama-machinetools|pama/.test(siteFingerprint);
  const normalizedSiteId = slug(site?.id || "site") || "site";
  const pamamaDesktopHeroTop = `/assets/template-factory/${normalizedSiteId}/desktop-hero-top.png`;
  const pamamaMobileHeroTop = `/assets/template-factory/${normalizedSiteId}/mobile-hero-top.png`;
  const desktopSlices = assets?.slices?.desktop ?? {};
  const mobileSlices = assets?.slices?.mobile ?? {};

  if (kind === "navigation") {
    defaults.logo = defaults.logo || pageTitle.split("|")[0].trim().slice(0, 48) || "Site";
    defaults.links =
      defaults.links ||
      ["Home", "Services", "About", "Contact"].map((label, index) => ({
        label,
        href: index === 0 ? "#top" : `#${slug(label)}`,
        variant: "link",
      }));
    defaults.ctas = defaults.ctas || [{ label: "Get Started", href: "#contact", variant: "primary" }];
    if (isPamamaSite) {
      defaults.brand = defaults.brand || "pama";
      // Match NavbarBlock expected shape.
      defaults.logo =
        defaults.logo && typeof defaults.logo === "object"
          ? defaults.logo
          : { alt: "PAMA" };
      defaults.sticky = defaults.sticky ?? true;
      defaults.showMenu = defaults.showMenu ?? true;
      defaults.menuHref = defaults.menuHref || "#menu";
      defaults.language = defaults.language || { label: "IT", href: "#lang" };
    }
  }

  if (kind === "hero") {
    if (!isPamamaSite) {
      defaults.title =
        defaults.title ||
        (promptLine ? promptLine.replace(/\s+/g, " ").slice(0, 78) : `Welcome to ${pageTitle}`);
      if (defaults.subtitle == null) {
        defaults.subtitle = `Designed for ${pageTitle} with a high-consistency block architecture.`;
      }
    }
    defaults.ctas = defaults.ctas || [{ label: "Get Started", href: "#contact", variant: "primary" }];
    if (assets.desktopUrl) {
      const heroSrc = desktopSlices.hero || assets.desktopUrl;
      if (!isPamamaSite) {
        if (!defaults.background && !defaults.backgroundMedia && !defaults.media) {
          defaults.background = "image";
        }
        defaults.backgroundMedia = defaults.backgroundMedia || {
          kind: "image",
          src: heroSrc,
          alt: `${pageTitle} reference`,
        };
        defaults.backgroundOverlay = defaults.backgroundOverlay || "rgba(5,8,18,0.55)";
      } else {
        defaults.background = "none";
        delete defaults.backgroundMedia;
        delete defaults.backgroundOverlay;
        delete defaults.backgroundOverlayOpacity;
        const desktopHeroSrc = pamamaDesktopHeroTop;
        const mobileHeroSrc = pamamaMobileHeroTop;
        if (blockType === "HeroCover") {
          defaults.mediaSrc = defaults.mediaSrc || desktopHeroSrc;
          defaults.mediaAlt = defaults.mediaAlt || `${pageTitle} hero visual`;
          defaults.mobileMediaSrc = defaults.mobileMediaSrc || mobileHeroSrc;
          defaults.mobileMediaAlt = defaults.mobileMediaAlt || `${pageTitle} hero visual mobile`;
          defaults.fullBleed = defaults.fullBleed ?? true;
          defaults.flush = defaults.flush ?? true;
          defaults.height = defaults.height || "calc(100vh - 84px)";
          defaults.mobileHeight = defaults.mobileHeight || "calc(100vh - 72px)";
        } else {
          defaults.media = {
            kind: "image",
            src: desktopHeroSrc,
            alt: `${pageTitle} hero visual`,
          };
          defaults.mediaSrc = desktopHeroSrc;
          defaults.mediaAlt = `${pageTitle} hero visual`;
          defaults.mobileMediaSrc = mobileHeroSrc;
          defaults.mobileMediaAlt = `${pageTitle} hero visual mobile`;
          defaults.mediaKind = "image";
        }
      }
      if (!isPamamaSite) {
        defaults.media =
          defaults.media ||
          (heroSrc
            ? {
                kind: "image",
                src: heroSrc,
                alt: `${pageTitle} hero visual`,
              }
            : undefined);
        if (!defaults.mediaSrc && heroSrc) {
          defaults.mediaSrc = heroSrc;
          defaults.mediaAlt = defaults.mediaAlt || `${pageTitle} hero visual`;
          defaults.mediaKind = defaults.mediaKind || "image";
        }
      }
      if (blockType === "DesignerHeroEditorial") {
        defaults.meshImageSrc = defaults.meshImageSrc || desktopSlices.hero || assets.desktopUrl;
        defaults.previewImageSrc = defaults.previewImageSrc || desktopSlices.story || assets.desktopUrl;
        defaults.mobilePreviewImageSrc =
          defaults.mobilePreviewImageSrc || mobileSlices.hero || assets.mobileUrl || defaults.previewImageSrc;
      }
    }
  }

  if (kind === "story") {
    defaults.eyebrow = defaults.eyebrow || "Our Story";
    defaults.title = defaults.title || `Why ${pageTitle}`;
    if (defaults.subtitle == null) {
      defaults.subtitle = "Crafted experiences, measured outcomes, and durable visual language.";
    }
    if (defaults.body == null) {
      defaults.body = "This section is generated from a template profile and tuned with prompt context.";
    }
    defaults.ctas = defaults.ctas || [{ label: "Explore", href: "#", variant: "link" }];
    if (assets.desktopUrl && !defaults.dashboardImageSrc) {
      defaults.dashboardImageSrc = desktopSlices.story || assets.desktopUrl;
      defaults.dashboardImageAlt = defaults.dashboardImageAlt || `${pageTitle} dashboard visual`;
    }
    if (!defaults.media?.src && desktopSlices.story) {
      defaults.media = { kind: "image", src: desktopSlices.story, alt: `${pageTitle} story visual` };
    }
    if (!defaults.mediaSrc && desktopSlices.story) {
      defaults.mediaSrc = desktopSlices.story;
      defaults.mediaAlt = defaults.mediaAlt || `${pageTitle} story visual`;
    }
  }

  if (kind === "approach") {
    defaults.title = defaults.title || "Key Capabilities";
    if (defaults.subtitle == null) {
      defaults.subtitle = "Designed for scale, precision, and reliable execution.";
    }
    defaults.items =
      defaults.items ||
      [
        { title: "Process", desc: "Structured delivery with measurable checkpoints.", icon: "layers" },
        { title: "Quality", desc: "Design and implementation quality gates.", icon: "shield" },
        { title: "Impact", desc: "Outcome-focused iteration loop.", icon: "chart" },
      ];
    if (desktopSlices.approach && Array.isArray(defaults.items)) {
      defaults.items = defaults.items.map((item, index) => ({
        ...(item || {}),
        image:
          item?.image ||
          (blockType === "DesignerCapabilitiesStrip"
            ? undefined
            : {
                src: index === 0 ? desktopSlices.approach : mobileSlices.approach || desktopSlices.approach,
                alt: item?.title || `Capability ${index + 1}`,
              }),
        imageSrc:
          item?.imageSrc ||
          (index === 0 ? desktopSlices.approach : mobileSlices.approach || desktopSlices.approach),
        imageAlt: item?.imageAlt || item?.title || `Capability ${index + 1}`,
      }));
    }
    if (blockType === "FeatureWithMedia" && desktopSlices.approach) {
      if (!defaults.media?.src) {
        defaults.media = {
          kind: "image",
          src: desktopSlices.approach,
          alt: defaults.title || `${pageTitle} approach visual`,
        };
      }
      if (!defaults.mediaSrc) {
        defaults.mediaSrc = desktopSlices.approach;
        defaults.mediaAlt = defaults.mediaAlt || defaults.title || `${pageTitle} approach visual`;
      }
    }
  }

  if (kind === "products") {
    defaults.title = defaults.title || "Product Portfolio";
    if (defaults.subtitle == null) {
      defaults.subtitle = "Modular blocks tailored to your site objectives.";
    }
    if (blockType === "ProductCategoryBand") {
      defaults.eyebrow = defaults.eyebrow || "I NOSTRI PRODOTTI";
      defaults.title = defaults.title || "";
      defaults.subtitle = defaults.subtitle || "Seleziona una categoria per esplorare le soluzioni PAMA.";
      defaults.tabs =
        defaults.tabs || [
          { label: "MACHINES", href: "#prodotti" },
          { label: "DIGITAL SOLUTIONS / OPTIMIZATION", href: "#prodotti" },
          { label: "AUTOMATION", href: "#prodotti" },
        ];
      defaults.cards =
        defaults.cards || [
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
        ];
      return defaults;
    }
    if (blockType === "NeonDashboardStrip" && assets.desktopUrl) {
      defaults.dashboardImageSrc = defaults.dashboardImageSrc || desktopSlices.products || desktopSlices.story || assets.desktopUrl;
      defaults.mobileDashboardImageSrc =
        defaults.mobileDashboardImageSrc || mobileSlices.products || assets.mobileUrl || defaults.dashboardImageSrc;
      defaults.dashboardImageAlt = defaults.dashboardImageAlt || `${pageTitle} dashboard visual`;
    }
    defaults.items =
      defaults.items ||
      [
        { title: "Primary Offer", description: "High-demand offer package.", cta: { label: "Details", href: "#" } },
        { title: "Growth Offer", description: "Expanded capabilities and integrations.", cta: { label: "Details", href: "#" } },
        { title: "Enterprise Offer", description: "Full-service delivery and support.", cta: { label: "Details", href: "#" } },
      ];
    if (assets.desktopUrl && Array.isArray(defaults.items)) {
      defaults.items = defaults.items.map((item, index) => {
        const next = { ...(item || {}) };
        const projectImage = desktopSlices.products || assets.desktopUrl;
        const hasImage =
          Boolean(next.image?.src) ||
          (typeof next.imageSrc === "string" && next.imageSrc.trim().length > 0) ||
          Boolean(next.cover?.src);
        if (!hasImage) {
          const src = index % 2 === 0 ? projectImage : mobileSlices.products || assets.mobileUrl || projectImage;
          if (blockType !== "DesignerProjectsSplit") {
            next.image = { src, alt: next.title || `Visual ${index + 1}` };
            next.cover = { src, alt: next.title || `Visual ${index + 1}` };
          }
          next.imageSrc = src;
          next.imageAlt = next.title || `Visual ${index + 1}`;
        }
        return next;
      });
    }
  }

  if (kind === "socialproof") {
    if (blockType === "DesignerQuoteBand") {
      defaults.quote =
        defaults.quote ||
        "\"Working with Jeremi was a game-changer. He translated our vision into a polished product and delivered beyond expectations.\"";
      defaults.author = defaults.author || "Client";
      defaults.role = defaults.role || "Founder";
    } else {
      defaults.title = defaults.title || "Building for world-class innovators";
      defaults.items =
        defaults.items ||
        [
          { quote: "They curated a lifestyle, not only a space.", name: "Alexander Vane", role: "CEO" },
          { quote: "A masterclass in restraint and elegance.", name: "Isabelle Dubois", role: "Founder" },
        ];
      if (assets.desktopUrl && !defaults.imageSrc) {
        defaults.imageSrc = desktopSlices.socialproof || assets.desktopUrl;
        defaults.imageAlt = defaults.imageAlt || "Results visual";
      }
      if (assets.mobileUrl && Array.isArray(defaults.items)) {
        defaults.items = defaults.items.map((item, index) => ({
          ...(item || {}),
          avatar:
            item?.avatar && typeof item.avatar === "object"
              ? item.avatar
              : {
                  src: mobileSlices.socialproof || assets.mobileUrl,
                  alt: item?.name || `Avatar ${index + 1}`,
                },
        }));
      }
    }
  }

  if (kind === "cta") {
    defaults.title = defaults.title || "Ready to define your space?";
    defaults.subtitle = defaults.subtitle || "Book a private consultation or browse the lookbook.";
    defaults.cta = defaults.cta || { label: "Inquire Now", href: "#contact", variant: "primary" };
    if (blockType === "FeatureWithMedia" && assets.desktopUrl) {
      const ctaSrc = desktopSlices.cta || desktopSlices.story || assets.desktopUrl;
      if (!defaults.media?.src) {
        defaults.media = {
          kind: "image",
          src: ctaSrc,
          alt: defaults.title || `${pageTitle} visual`,
        };
      }
      if (!defaults.mediaSrc) {
        defaults.mediaSrc = ctaSrc;
        defaults.mediaAlt = defaults.mediaAlt || defaults.title || `${pageTitle} visual`;
      }
    }
  }

  if (kind === "footer") {
    defaults.logoText = defaults.logoText || pageTitle.split("|")[0].trim().slice(0, 24) || "Site";
    defaults.columns =
      defaults.columns ||
      [
        { title: "Company", links: [{ label: "About", href: "#" }, { label: "Contact", href: "#" }] },
        { title: "Studio", links: [{ label: "Approach", href: "#" }, { label: "Projects", href: "#" }] },
        { title: "Legal", links: [{ label: "Privacy", href: "#" }, { label: "Terms", href: "#" }] },
      ];
    defaults.legal = defaults.legal || "© 2026 All rights reserved.";
    if (desktopSlices.footer && !defaults.backgroundMedia && blockType !== "Footer") {
      defaults.background = "image";
      defaults.backgroundMedia = {
        kind: "image",
        src: desktopSlices.footer,
        alt: `${pageTitle} footer visual`,
      };
      defaults.backgroundOverlay = defaults.backgroundOverlay || "rgba(0,0,0,0.15)";
    }
  }

  return defaults;
};

const buildSpecPack = ({ site, recipe, summary, assets = {} }) => {
  const sectionSpecs = {};
  for (const kind of SECTION_KINDS) {
    const spec = recipe.sectionSpecs[kind];
    if (!spec) continue;
    sectionSpecs[kind] = {
      block_type: spec.blockType,
      defaults: buildSectionDefaults(kind, spec, site, summary, assets),
    };
  }

  return {
    template_id: `auto_${site.id}`,
    recipe_id: recipe.id,
    section_specs: sectionSpecs,
    fallback_rules: {
      missing_socialproof: "use_testimonials_grid_min_2",
      missing_cta_secondary: "hide_secondary_button",
    },
    density_limits: {
      nav_items_max: 6,
      hero_cta_max: 2,
      testimonials_min: 2,
      cards_max: 8,
    },
    required_categories: recipe.requiredCategories,
  };
};

const specPackToStyleProfile = ({ site, indexCard, specPack }) => {
  const templates = {};
  for (const kind of Object.keys(specPack.section_specs || {})) {
    const entry = specPack.section_specs[kind];
    if (!entry?.block_type || !entry?.defaults) continue;
    templates[kind] = {
      type: entry.block_type,
      props: entry.defaults,
    };
  }

  return {
    id: indexCard.template_id,
    name: site.description || site.id,
    keywords: indexCard.keywords?.length ? indexCard.keywords : [site.id],
    templates,
  };
};

const mergeProfiles = (existingProfiles, incomingProfiles) => {
  const map = new Map();
  for (const profile of existingProfiles || []) {
    if (!profile?.id) continue;
    map.set(String(profile.id), profile);
  }
  for (const profile of incomingProfiles || []) {
    if (!profile?.id) continue;
    map.set(String(profile.id), profile);
  }
  return Array.from(map.values());
};

const toRequiredCategories = (specPack) =>
  Array.isArray(specPack?.required_categories) ? specPack.required_categories.filter(Boolean) : [];

const runRegression = async ({ runDir, sites, renderer, groups, maxCases }) => {
  const promptsPath = path.join(runDir, "regression-prompts.json");
  const payload = {
    version: "1.0.0",
    cases: sites.map((item) => ({
      id: item.site.id,
      description: item.site.description || item.site.id,
      requiredCategories: toRequiredCategories(item.specPack),
      prompt: item.site.prompt || item.site.description || `Generate homepage for ${item.site.id}`,
    })),
  };
  await fs.writeFile(promptsPath, JSON.stringify(payload, null, 2));

  const args = [
    "node regression/run-strategy-comparison.mjs",
    `--prompts ${JSON.stringify(promptsPath)}`,
    `--renderer ${renderer}`,
  ];
  if (groups) args.push(`--groups ${JSON.stringify(groups)}`);
  if (maxCases > 0) args.push(`--max-cases ${Math.floor(maxCases)}`);

  const cmd = `cd ${JSON.stringify(ROOT)} && ${args.join(" ")}`;
  const { stdout, stderr } = await runShell(cmd, { cwd: ROOT });
  const out = `${stdout}\n${stderr}`;
  const match = out.match(/\[done\] report\(json\):\s+(.+)\s*$/m);
  const reportPath = match?.[1]?.trim() || "";

  return {
    promptsPath,
    reportPath,
    rawOutput: out,
  };
};

const collectTemplateFirstPreviewLinks = async ({ reportPath, previewBaseUrl }) => {
  if (!reportPath) return [];
  const raw = await fs.readFile(reportPath, "utf8");
  const report = JSON.parse(raw);
  const groups = Array.isArray(report?.groups) ? report.groups : [];
  const targetGroup = groups.find((group) => String(group?.id || "") === DEFAULT_TEMPLATE_FIRST_GROUP);
  const rows = Array.isArray(targetGroup?.results) ? targetGroup.results : [];
  const previewOrigin = normalizePreviewBaseUrl(previewBaseUrl);

  const links = rows
    .filter((row) => row?.ok && typeof row?.url === "string" && row.url.trim())
    .map((row) => ({
      groupId: DEFAULT_TEMPLATE_FIRST_GROUP,
      caseId: String(row.caseId || ""),
      responseId: row.responseId || null,
      requestId: row.requestId || null,
      url: rebaseToPreviewOrigin(String(row.url), previewOrigin),
      screenshot: typeof row.screenshot === "string" ? row.screenshot : "",
    }))
    .filter((row) => row.caseId && row.url);

  const dedup = new Map();
  for (const row of links) {
    dedup.set(`${row.caseId}:${row.url}`, row);
  }
  return Array.from(dedup.values());
};

const scoreRegressionReport = async (reportPath) => {
  if (!reportPath) {
    return {
      ok: false,
      message: "missing_regression_report",
      groups: [],
    };
  }

  const raw = await fs.readFile(reportPath, "utf8");
  const report = JSON.parse(raw);
  const groups = Array.isArray(report?.groups) ? report.groups : [];
  const summary = groups.map((group) => {
    const rows = Array.isArray(group?.results) ? group.results : [];
    const total = rows.length || 1;
    const passed = Number(group?.passed || 0);
    const errorRows = rows.filter((row) => Array.isArray(row?.errors) && row.errors.length > 0).length;
    const fallbackRows = rows.filter((row) =>
      (Array.isArray(row?.errors) ? row.errors : []).some((err) => String(err).includes("builder_section_fallback"))
    ).length;
    const passRate = passed / total;
    const errorRate = errorRows / total;
    const fallbackRate = fallbackRows / total;
    const avgDurationMs = Number(group?.avgDurationMs || 0);
    const latencyPenalty = Math.min(1, avgDurationMs / 180000);
    const score = Math.round(passRate * 60 + (1 - errorRate) * 20 + (1 - fallbackRate) * 15 + (1 - latencyPenalty) * 5);
    return {
      id: group.id,
      label: group.label,
      total,
      passed,
      passRate: Number((passRate * 100).toFixed(1)),
      errorRate: Number((errorRate * 100).toFixed(1)),
      fallbackRate: Number((fallbackRate * 100).toFixed(1)),
      avgDurationMs: Math.round(avgDurationMs),
      score,
    };
  });

  const overall = summary.length
    ? Math.round(summary.reduce((acc, item) => acc + item.score, 0) / summary.length)
    : 0;

  return {
    ok: true,
    overallScore: overall,
    groups: summary,
  };
};

const main = async () => {
  const options = parseArgs(process.argv);
  const manifestPath = options.manifest;
  const sites = await loadManifest(manifestPath);
  if (!sites.length) {
    throw new Error(`No valid sites in manifest: ${manifestPath}`);
  }

  const runDir = path.join(RUNS_DIR, options.runId);
  const siteRoot = path.join(runDir, "sites");
  await ensureDir(siteRoot);
  await ensureDir(LIB_DIR);

  const processed = [];

  for (const site of sites) {
    const siteDir = path.join(siteRoot, site.id);
    const ingestDir = path.join(siteDir, "ingest");
    const extractedDir = path.join(siteDir, "extracted");
    await ensureDir(ingestDir);
    await ensureDir(extractedDir);

    let desktopShot = null;
    let mobileShot = null;

    if (!options.skipIngest) {
      if (site.url) {
        desktopShot = await captureScreenshot({
          url: site.url,
          outPath: path.join(ingestDir, "desktop.auto.png"),
          mobile: false,
        });
        mobileShot = await captureScreenshot({
          url: site.url,
          outPath: path.join(ingestDir, "mobile.auto.png"),
          mobile: true,
        });
      }
    }

    const copiedDesktop = await safeCopy(site.desktopScreenshot, path.join(ingestDir, "desktop.reference.png"));
    const copiedMobile = await safeCopy(site.mobileScreenshot, path.join(ingestDir, "mobile.reference.png"));
    const preferredDesktop = await choosePreferredScreenshot([copiedDesktop, desktopShot]);
    const preferredMobile = await choosePreferredScreenshot([copiedMobile, mobileShot]);
    const publishedAssets = await publishReferenceAssets({
      siteId: site.id,
      desktopSource: preferredDesktop,
      mobileSource: preferredMobile,
    });
    const recipeHint = chooseRecipe({ prompt: site.prompt, title: "", url: site.url, siteId: site.id });
    const referenceSlices = await createReferenceSlices({
      siteId: site.id,
      desktopSource: preferredDesktop,
      mobileSource: preferredMobile,
      preset: recipeHint?.id,
    });

    const summary = await fetchHtmlSummary(site.url);
    await fs.writeFile(
      path.join(ingestDir, "summary.json"),
      JSON.stringify(
        {
          site,
          screenshots: {
            desktopAuto: desktopShot,
            mobileAuto: mobileShot,
            desktopReference: copiedDesktop,
            mobileReference: copiedMobile,
            desktopPreferred: preferredDesktop,
            mobilePreferred: preferredMobile,
          },
          publishedAssets,
          referenceSlices,
          htmlSummary: summary,
        },
        null,
        2
      )
    );

    const recipe = chooseRecipe({ prompt: site.prompt, title: summary.title, url: site.url, siteId: site.id });
    const indexCard = buildIndexCard({
      site,
      recipe,
      summary,
      evidence: {
        desktop: Boolean(desktopShot || copiedDesktop || site.desktopScreenshot),
        mobile: Boolean(mobileShot || copiedMobile || site.mobileScreenshot),
      },
    });
    const specPack = buildSpecPack({
      site,
      recipe,
      summary,
      assets: { ...publishedAssets, slices: referenceSlices },
    });
    const styleProfile = specPackToStyleProfile({ site, indexCard, specPack });

    await fs.writeFile(path.join(extractedDir, "index-card.json"), JSON.stringify(indexCard, null, 2));
    await fs.writeFile(path.join(extractedDir, "spec-pack.json"), JSON.stringify(specPack, null, 2));
    await fs.writeFile(path.join(extractedDir, "style-profile.json"), JSON.stringify(styleProfile, null, 2));

    processed.push({ site, indexCard, specPack, styleProfile, siteDir });
    console.log(`[template-factory] processed ${site.id} -> recipe=${recipe.id}`);
  }

  const runLibrary = {
    generatedAt: new Date().toISOString(),
    runId: options.runId,
    manifestPath,
    profiles: processed.map((item) => item.styleProfile),
  };

  const runLibraryPath = path.join(runDir, "style-profiles.generated.json");
  await fs.writeFile(runLibraryPath, JSON.stringify(runLibrary, null, 2));

  let publishPath = "";
  if (options.publish) {
    let existingProfiles = [];
    try {
      const raw = await fs.readFile(DEFAULT_PUBLISH_PATH, "utf8");
      const parsed = JSON.parse(raw);
      existingProfiles = Array.isArray(parsed?.profiles) ? parsed.profiles : [];
    } catch {
      existingProfiles = [];
    }

    const mergedProfiles = mergeProfiles(existingProfiles, runLibrary.profiles);
    const published = {
      generatedAt: new Date().toISOString(),
      sourceRunId: options.runId,
      profileCount: mergedProfiles.length,
      profiles: mergedProfiles,
    };
    await fs.writeFile(DEFAULT_PUBLISH_PATH, JSON.stringify(published, null, 2));
    publishPath = DEFAULT_PUBLISH_PATH;
  }

  let regression = null;
  let score = null;
  let previewLinks = [];
  let previewServer = null;
  if (options.groups && options.groups.trim() && options.groups.trim() !== DEFAULT_TEMPLATE_FIRST_GROUP) {
    console.log(
      `[template-factory] groups overridden to ${DEFAULT_TEMPLATE_FIRST_GROUP} (requested=${options.groups.trim()}).`
    );
  }
  if (options.requestedSkipRegression) {
    console.log("[template-factory] skipping regression (--skip-regression).");
  } else {
    regression = await runRegression({
      runDir,
      sites: processed,
      renderer: options.renderer,
      groups: DEFAULT_TEMPLATE_FIRST_GROUP,
      maxCases: options.maxCases,
    });

    if (regression.reportPath) {
      score = await scoreRegressionReport(regression.reportPath);
      await fs.writeFile(path.join(runDir, "scorecard.json"), JSON.stringify(score, null, 2));
      previewLinks = await collectTemplateFirstPreviewLinks({
        reportPath: regression.reportPath,
        previewBaseUrl: options.previewBaseUrl,
      });
      if (previewLinks.length) {
        await fs.writeFile(path.join(runDir, "preview-links.json"), JSON.stringify(previewLinks, null, 2));
        if (options.launchPreviewServer) {
          previewServer = await ensurePreviewServer({ previewBaseUrl: options.previewBaseUrl });
        } else {
          previewServer = { origin: normalizePreviewBaseUrl(options.previewBaseUrl), reachable: false, started: false };
        }
      }
    }
  }

  const summary = {
    runId: options.runId,
    manifestPath,
    sites: processed.length,
    runDir,
    runLibraryPath,
    publishPath,
    regressionPromptsPath: regression?.promptsPath || null,
    regressionReportPath: regression?.reportPath || null,
    scorecardPath: score ? path.join(runDir, "scorecard.json") : null,
    overallScore: score?.overallScore ?? null,
    previewBaseUrl: normalizePreviewBaseUrl(options.previewBaseUrl),
    previewLinksPath: previewLinks.length ? path.join(runDir, "preview-links.json") : null,
    previewLinks,
    previewServer,
    previewStartCommand: DEFAULT_PREVIEW_START_COMMAND,
  };

  await fs.writeFile(path.join(runDir, "summary.json"), JSON.stringify(summary, null, 2));

  console.log("\n[template-factory] done");
  console.log(`[template-factory] runDir: ${runDir}`);
  console.log(`[template-factory] run library: ${runLibraryPath}`);
  if (publishPath) console.log(`[template-factory] published library: ${publishPath}`);
  if (regression?.reportPath) console.log(`[template-factory] regression report: ${regression.reportPath}`);
  if (score?.overallScore !== undefined && score?.overallScore !== null) {
    console.log(`[template-factory] overall score: ${score.overallScore}`);
  }
  if (previewServer?.origin) {
    const status = previewServer.reachable ? "ready" : "unreachable";
    const mode = previewServer.mode || (previewServer.started ? "started" : "existing");
    console.log(`[template-factory] preview server: ${previewServer.origin} (${status}, ${mode})`);
    if (previewServer.logPath) {
      console.log(`[template-factory] preview server log: ${previewServer.logPath}`);
    }
  }
  if (previewLinks.length) {
    console.log("[template-factory] template-first preview links:");
    for (const row of previewLinks) {
      console.log(`  - ${row.caseId}: ${row.url}`);
    }
    console.log(`[template-factory] if links are not reachable, run: ${DEFAULT_PREVIEW_START_COMMAND}`);
  }
};

main().catch((error) => {
  const message = error instanceof Error ? `${error.message}\n${error.stack || ""}` : String(error);
  console.error(`[template-factory:fatal] ${message}`);
  process.exit(1);
});
