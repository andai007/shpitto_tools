import React from "react";
import type { Config } from "@measured/puck";
import { HeroCenteredBlock } from "@/components/blocks/hero-centered/block";
import { HeroSplitBlock } from "@/components/blocks/hero-split/block";
import { HeroCoverBlock } from "@/components/blocks/hero-cover/block";
import { FeatureGridBlock } from "@/components/blocks/feature-grid/block";
import { FeatureWithMediaBlock } from "@/components/blocks/feature-with-media/block";
import { CategoryTabsBlock } from "@/components/blocks/category-tabs/block";
import { SectorsStripBlock } from "@/components/blocks/sectors-strip/block";
import { PricingCardsBlock } from "@/components/blocks/pricing-cards/block";
import { FAQAccordionBlock } from "@/components/blocks/faq-accordion/block";
import { FooterBlock } from "@/components/blocks/footer/block";
import { LogoCloudBlock } from "@/components/blocks/logo-cloud/block";
import { TestimonialsGridBlock } from "@/components/blocks/testimonials-grid/block";
import { CaseStudiesBlock } from "@/components/blocks/case-studies/block";
import { LeadCaptureCTABlock } from "@/components/blocks/lead-capture-cta/block";
import { CardsGridBlock } from "@/components/blocks/cards-grid/block";
import { NavbarBlock } from "@/components/blocks/navbar/block";
import { NeonHeroBeamBlock } from "@/components/blocks/neon-hero-beam/block";
import { NeonDashboardStripBlock } from "@/components/blocks/neon-dashboard-strip/block";
import { NeonMetricsOrbitBlock } from "@/components/blocks/neon-metrics-orbit/block";
import { NeonFeatureCardsBlock } from "@/components/blocks/neon-feature-cards/block";
import { NeonResultsShowcaseBlock } from "@/components/blocks/neon-results-showcase/block";
import { NeonPricingSplitBlock } from "@/components/blocks/neon-pricing-split/block";
import { NeonFooterGlowBlock } from "@/components/blocks/neon-footer-glow/block";
import { NexusNavPulseBlock } from "@/components/blocks/nexus-nav-pulse/block";
import { NexusHeroDockBlock } from "@/components/blocks/nexus-hero-dock/block";
import { NexusCapabilityStripBlock } from "@/components/blocks/nexus-capability-strip/block";
import { NexusOpsMatrixBlock } from "@/components/blocks/nexus-ops-matrix/block";
import { NexusControlPanelBlock } from "@/components/blocks/nexus-control-panel/block";
import { NexusProofMosaicBlock } from "@/components/blocks/nexus-proof-mosaic/block";
import { NexusFooterCommandBlock } from "@/components/blocks/nexus-footer-command/block";
import { DesignerHeroEditorialBlock } from "@/components/blocks/designer-hero-editorial/block";
import { DesignerCapabilitiesStripBlock } from "@/components/blocks/designer-capabilities-strip/block";
import { DesignerProjectsSplitBlock } from "@/components/blocks/designer-projects-split/block";
import { DesignerQuoteBandBlock } from "@/components/blocks/designer-quote-band/block";
import { AtomicTextBlock } from "@/components/blocks/atomic-text/block";
import { AtomicButtonBlock } from "@/components/blocks/atomic-button/block";
import { AtomicImageBlock } from "@/components/blocks/atomic-image/block";
import {
  booleanField,
  listField,
  selectField,
  textField,
  textareaField,
} from "@/puck/field-adapters";

const renderBlock = (Block: React.ComponentType<any>) => (props: any) =>
  React.createElement(Block, props);

export const puckConfig: Config = {
  components: {
    AtomicText: {
      render: renderBlock(AtomicTextBlock),
      defaultProps: { id: "atom-text-1", text: "Sample text", size: "md", align: "left" },
      fields: {
        text: textField("Text"),
        size: selectField("Size", ["sm", "md", "lg"]),
        align: selectField("Align", ["left", "center"]),
      },
    },
    AtomicButton: {
      render: renderBlock(AtomicButtonBlock),
      defaultProps: { id: "atom-button-1", label: "Click", href: "#", variant: "primary" },
      fields: {
        label: textField("Label"),
        href: textField("Href"),
        variant: selectField("Variant", ["primary", "secondary", "link"]),
      },
    },
    AtomicImage: {
      render: renderBlock(AtomicImageBlock),
      defaultProps: { id: "atom-image-1", src: "/assets/placeholder.png", alt: "", rounded: true },
      fields: {
        src: textField("Src"),
        alt: textField("Alt"),
        width: textField("Width"),
        height: textField("Height"),
        rounded: booleanField("Rounded"),
      },
    },
    Navbar: {
      render: renderBlock(NavbarBlock),
      defaultProps: {
        id: "Navbar-1",
        logo: { src: "", alt: "Site" },
        links: [
          { label: "Home", href: "#top" },
          { label: "Solutions", href: "#solutions" },
          { label: "Products", href: "#products" },
          { label: "News", href: "#news" },
        ],
        ctas: [{ label: "Contact", href: "#contact", variant: "primary" }],
        sticky: true,
        paddingY: "sm",
        maxWidth: "xl",
      },
      fields: {
        variant: selectField("Variant", ["simple", "withDropdown", "withCTA"]),
        sticky: booleanField("Sticky"),
        paddingY: selectField("Padding", ["sm", "md", "lg"]),
        background: selectField("Background", ["none", "muted", "gradient", "image"]),
        maxWidth: selectField("Max Width", ["lg", "xl", "2xl"]),
        links: listField("Links", {
          label: textField("Label"),
          href: textField("Href"),
        }),
        ctas: listField("CTAs", {
          label: textField("Label"),
          href: textField("Href"),
          variant: selectField("Variant", ["primary", "secondary", "link"]),
        }),
      },
    },
    NexusNavPulse: {
      render: renderBlock(NexusNavPulseBlock),
      defaultProps: {
        id: "NexusNavPulse-1",
        logoText: "Nexus",
        sticky: true,
        maxWidth: "xl",
        links: [
          { label: "Home", href: "#top" },
          { label: "Services", href: "#services" },
          { label: "About", href: "#about" },
          { label: "Contact", href: "#contact" },
        ],
        cta: { label: "Get Started", href: "#contact", variant: "primary" },
      },
      fields: {
        logoText: textField("Logo Text"),
        sticky: booleanField("Sticky"),
        maxWidth: selectField("Max Width", ["lg", "xl", "2xl"]),
        links: listField("Links", {
          label: textField("Label"),
          href: textField("Href"),
        }),
        cta: listField("CTA", {
          label: textField("Label"),
          href: textField("Href"),
          variant: selectField("Variant", ["primary", "secondary", "link"]),
        }),
      },
    },
    NexusHeroDock: {
      render: renderBlock(NexusHeroDockBlock),
      defaultProps: {
        id: "NexusHeroDock-1",
        badge: "Nexus Platform",
        title: "Nexus is a precision tool for orchestrating product releases",
        subtitle:
          "Ship with velocity while maintaining reliability, policy control, and measurable rollout quality.",
        panelTag: "Performance",
        panelTitle: "Release Velocity",
        panelSubtitle: "Automated orchestration across environments.",
        statValue: "+842%",
        statDelta: "vs baseline",
        ctas: [
          { label: "Explore Platform", href: "#services", variant: "primary" },
          { label: "View Metrics", href: "#proof", variant: "secondary" },
        ],
        maxWidth: "xl",
      },
      fields: {
        badge: textField("Badge"),
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        panelTag: textField("Panel Tag"),
        panelTitle: textField("Panel Title"),
        panelSubtitle: textareaField("Panel Subtitle"),
        statValue: textField("Stat Value"),
        statDelta: textField("Stat Delta"),
        heroImageSrc: textField("Hero Image Src"),
        mobileHeroImageSrc: textField("Mobile Hero Image Src"),
        heroImageAlt: textField("Hero Image Alt"),
        ctas: listField("CTAs", {
          label: textField("Label"),
          href: textField("Href"),
          variant: selectField("Variant", ["primary", "secondary", "link"]),
        }),
      },
    },
    NexusCapabilityStrip: {
      render: renderBlock(NexusCapabilityStripBlock),
      defaultProps: {
        id: "NexusCapabilityStrip-1",
        eyebrow: "Key Capabilities",
        title: "Engineered for modern product teams",
        subtitle: "Designed for scale, precision, and reliable execution.",
        items: [
          { title: "Precision targeting", description: "Policy-aware delivery mapped to measurable goals." },
          { title: "Automated workflows", description: "Deterministic rollouts and rollback-ready stages." },
          { title: "Brand safety", description: "Guardrails enforce reliability and compliance by default." },
        ],
      },
      fields: {
        eyebrow: textField("Eyebrow"),
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        items: listField("Items", {
          title: textField("Title"),
          description: textareaField("Description"),
          badge: textField("Badge"),
        }),
      },
    },
    NexusOpsMatrix: {
      render: renderBlock(NexusOpsMatrixBlock),
      defaultProps: {
        id: "NexusOpsMatrix-1",
        eyebrow: "Wave 01",
        title: "Deploy with velocity, scale without ceremony.",
        subtitle: "Control release workflows without adding operational drag.",
        items: [
          {
            title: "Zero-config infrastructure",
            description: "Describe intent in TypeScript and let Nexus provision workers and policies.",
          },
          {
            title: "Traffic-aware scaling",
            description: "Continuously adapt workloads to demand signals and reduce noisy-neighbor impact.",
          },
          {
            title: "Precision analytics",
            description: "Observe every deploy in real time with rollout health and regional diagnostics.",
          },
          {
            title: "Unified workflow control",
            description: "Manage feature flags, canary rollouts, and instant rollback from one surface.",
          },
        ],
      },
      fields: {
        eyebrow: textField("Eyebrow"),
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        items: listField("Items", {
          title: textField("Title"),
          description: textareaField("Description"),
          imageSrc: textField("Image Src"),
          imageAlt: textField("Image Alt"),
        }),
      },
    },
    NexusControlPanel: {
      render: renderBlock(NexusControlPanelBlock),
      defaultProps: {
        id: "NexusControlPanel-1",
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
      fields: {
        eyebrow: textField("Eyebrow"),
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        dashboardImageSrc: textField("Dashboard Image Src"),
        mobileDashboardImageSrc: textField("Mobile Dashboard Image Src"),
        dashboardImageAlt: textField("Dashboard Image Alt"),
        tabs: listField("Tabs", {
          label: textField("Label"),
        }),
        metrics: listField("Metrics", {
          label: textField("Label"),
          value: textField("Value"),
        }),
        kpis: listField("KPIs", {
          label: textField("Label"),
          value: textField("Value"),
        }),
      },
    },
    NexusProofMosaic: {
      render: renderBlock(NexusProofMosaicBlock),
      defaultProps: {
        id: "NexusProofMosaic-1",
        title: "Ship faster with Nexus",
        subtitle: "Engineering teams using Nexus report faster delivery with lower incident pressure.",
        quote:
          "Nexus gave us a single control plane for releases. We moved faster while reducing incident pressure across teams.",
        author: "Claire",
        role: "Engineering Lead",
      },
      fields: {
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        quote: textareaField("Quote"),
        author: textField("Author"),
        role: textField("Role"),
        imageSrc: textField("Image Src"),
        mobileImageSrc: textField("Mobile Image Src"),
        imageAlt: textField("Image Alt"),
      },
    },
    NexusFooterCommand: {
      render: renderBlock(NexusFooterCommandBlock),
      defaultProps: {
        id: "NexusFooterCommand-1",
        title: "Ready to streamline your workflow?",
        subtitle: "Join high-performance engineering teams using Nexus to orchestrate product delivery.",
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
      fields: {
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        legal: textField("Legal"),
        primaryCta: listField("Primary CTA", {
          label: textField("Label"),
          href: textField("Href"),
          variant: selectField("Variant", ["primary", "secondary", "link"]),
        }),
        secondaryCta: listField("Secondary CTA", {
          label: textField("Label"),
          href: textField("Href"),
          variant: selectField("Variant", ["primary", "secondary", "link"]),
        }),
        columns: listField("Columns", {
          title: textField("Title"),
          links: listField("Links", {
            label: textField("Label"),
            href: textField("Href"),
          }),
        }),
      },
    },
    HeroCentered: {
      render: renderBlock(HeroCenteredBlock),
      defaultProps: {
        id: "hero-01",
        title: "Build faster with reusable blocks",
        subtitle: "shadcn/ui + Magic UI + Puck, fully owned components.",
        ctas: [{ label: "Get started", href: "#pricing", variant: "primary" }],
        align: "center",
        paddingY: "lg",
        maxWidth: "xl",
      },
      fields: {
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        eyebrow: textField("Eyebrow"),
        align: selectField("Align", ["left", "center"]),
        paddingY: selectField("Padding", ["sm", "md", "lg"]),
        background: selectField("Background", ["none", "muted", "gradient", "image"]),
        maxWidth: selectField("Max Width", ["lg", "xl", "2xl"]),
        headingSize: selectField("Heading Size", ["sm", "md", "lg"]),
        bodySize: selectField("Body Size", ["sm", "md", "lg"]),
        ctas: listField("CTAs", {
          label: textField("Label"),
          href: textField("Href"),
          variant: selectField("Variant", ["primary", "secondary", "link"]),
        }),
      },
    },
    HeroSplit: {
      render: renderBlock(HeroSplitBlock),
      defaultProps: {
        id: "hero-split-1",
        title: "Build faster with reusable blocks",
        subtitle: "Pair a strong message with a supporting media asset.",
        ctas: [{ label: "Get started", href: "#pricing", variant: "primary" }],
        mediaPosition: "right",
        paddingY: "lg",
        maxWidth: "xl",
      },
      fields: {
        eyebrow: textField("Eyebrow"),
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        mediaPosition: selectField("Media Position", ["left", "right"]),
        paddingY: selectField("Padding", ["sm", "md", "lg"]),
        background: selectField("Background", ["none", "muted", "gradient", "image"]),
        maxWidth: selectField("Max Width", ["lg", "xl", "2xl"]),
        headingSize: selectField("Heading Size", ["sm", "md", "lg"]),
        bodySize: selectField("Body Size", ["sm", "md", "lg"]),
        ctas: listField("CTAs", {
          label: textField("Label"),
          href: textField("Href"),
          variant: selectField("Variant", ["primary", "secondary", "link"]),
        }),
      },
    },
    HeroCover: {
      render: renderBlock(HeroCoverBlock),
      defaultProps: {
        id: "hero-cover-1",
        mediaSrc: "/assets/placeholder.png",
        mediaAlt: "",
        height: "520px",
        mobileHeight: "360px",
        fullBleed: true,
        paddingY: "sm",
        maxWidth: "2xl",
        background: "none",
      },
      fields: {
        mediaSrc: textField("Media Src"),
        mediaAlt: textField("Media Alt"),
        mobileMediaSrc: textField("Mobile Media Src"),
        mobileMediaAlt: textField("Mobile Media Alt"),
        height: textField("Height"),
        mobileHeight: textField("Mobile Height"),
        fullBleed: booleanField("Full Bleed"),
        overlay: textField("Overlay Color"),
        overlayOpacity: textField("Overlay Opacity"),
        paddingY: selectField("Padding", ["sm", "md", "lg"]),
        background: selectField("Background", ["none", "muted", "gradient", "image"]),
        maxWidth: selectField("Max Width", ["lg", "xl", "2xl"]),
      },
    },
    SectorsStrip: {
      render: renderBlock(SectorsStripBlock),
      defaultProps: {
        id: "sectors-strip-1",
        title: "I NOSTRI SETTORI",
        subtitle: "PAMA opera con esperienza in settori ad alta specializzazione.",
        items: [
          {
            title: "SETTORE OIL & GAS",
            description: "Soluzioni per applicazioni ad alta precisione.",
            cta: { label: "SCOPRI DI PIÙ", href: "#", variant: "primary" },
          },
          {
            title: "SETTORE COSTRUZIONE DI MACCHINE",
            description: "Macchine utensili per processi industriali avanzati.",
            cta: { label: "SCOPRI DI PIÙ", href: "#", variant: "primary" },
          },
          {
            title: "SETTORE STAMPI",
            description: "Sistemi dedicati alla produzione stampi.",
            cta: { label: "SCOPRI DI PIÙ", href: "#", variant: "primary" },
          },
        ],
        paddingY: "lg",
        maxWidth: "xl",
        background: "none",
      },
      fields: {
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        paddingY: selectField("Padding", ["sm", "md", "lg"]),
        background: selectField("Background", ["none", "muted", "gradient", "image"]),
        maxWidth: selectField("Max Width", ["lg", "xl", "2xl"]),
        items: listField("Items", {
          title: textField("Title"),
          description: textareaField("Description"),
          imageSrc: textField("Image Src"),
          imageAlt: textField("Image Alt"),
          cta: {
            label: textField("CTA Label"),
            href: textField("CTA Href"),
            variant: selectField("CTA Variant", ["primary", "secondary", "link"]),
          },
        }),
      },
    },
    NeonHeroBeam: {
      render: renderBlock(NeonHeroBeamBlock),
      defaultProps: {
        id: "NeonHeroBeam-1",
        titleTransform: "uppercase",
        title: "Social Reach. Automated Growth. Viral Results.",
        subtitle: "Scale campaigns with AI workflows, predictive insights, and measurable growth velocity.",
        badge: "Social Growth, Autopilot Mode",
        ctas: [
          { label: "Explore Platform", href: "#platform", variant: "primary" },
          { label: "View Metrics", href: "#metrics", variant: "secondary" },
        ],
        panelTag: "Viral Result",
        panelTitle: "Growth Velocity",
        panelSubtitle: "Automated engagement hitting viral peaks.",
        statValue: "+842%",
        statDelta: "vs last week",
        maxWidth: "xl",
      },
      fields: {
        badge: textField("Badge"),
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        panelTag: textField("Panel Tag"),
        panelTitle: textField("Panel Title"),
        panelSubtitle: textareaField("Panel Subtitle"),
        statValue: textField("Stat Value"),
        statDelta: textField("Stat Delta"),
        titleTransform: selectField("Title Transform", ["uppercase", "none"]),
        heroImageSrc: textField("Hero Image Src"),
        mobileHeroImageSrc: textField("Mobile Hero Image Src"),
        heroImageAlt: textField("Hero Image Alt"),
        ctas: listField("CTAs", {
          label: textField("Label"),
          href: textField("Href"),
          variant: selectField("Variant", ["primary", "secondary", "link"]),
        }),
      },
    },
    NeonMetricsOrbit: {
      render: renderBlock(NeonMetricsOrbitBlock),
      defaultProps: {
        id: "NeonMetricsOrbit-1",
        title: "Scale your reach instantly",
        subtitle: "Precision targeting, automated workflows, and brand safety controls.",
        metrics: [
          { label: "Campaign Velocity", value: "96k / week" },
          { label: "Reach Lift", value: "+842%" },
          { label: "Brand-safe Coverage", value: "99.2%" },
        ],
        chips: [{ label: "TikTok" }, { label: "Instagram" }, { label: "YouTube" }, { label: "X" }],
      },
      fields: {
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        metrics: listField("Metrics", {
          label: textField("Label"),
          value: textField("Value"),
        }),
        chips: listField("Chips", {
          label: textField("Label"),
        }),
      },
    },
    NeonDashboardStrip: {
      render: renderBlock(NeonDashboardStripBlock),
      defaultProps: {
        id: "NeonDashboardStrip-1",
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
      fields: {
        eyebrow: textField("Eyebrow"),
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        dashboardImageSrc: textField("Dashboard Image Src"),
        dashboardImageAlt: textField("Dashboard Image Alt"),
        tabs: listField("Tabs", {
          label: textField("Label"),
        }),
        metrics: listField("Metrics", {
          label: textField("Label"),
          value: textField("Value"),
        }),
        kpis: listField("KPIs", {
          label: textField("Label"),
          value: textField("Value"),
        }),
      },
    },
    NeonFeatureCards: {
      render: renderBlock(NeonFeatureCardsBlock),
      defaultProps: {
        id: "NeonFeatureCards-1",
        eyebrow: "Wave 02",
        title: "Engineered for exponential growth",
        subtitle: "Modular capability blocks for velocity, safety, and omnichannel scale.",
        highlightMode: "first",
        items: [
          { title: "Predictive Intelligence", description: "Model outcomes before spend.", highlight: true },
          { title: "Autonomous Velocity", description: "Orchestrate publishing with adaptive timing." },
          { title: "Safety by Design", description: "Brand-safe automation with policy guardrails." },
          { title: "Omnichannel Scale", description: "Coordinate every channel from one control layer." },
        ],
      },
      fields: {
        eyebrow: textField("Eyebrow"),
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        highlightMode: selectField("Highlight Mode", ["first", "none"]),
        items: listField("Items", {
          title: textField("Title"),
          description: textareaField("Description"),
          badge: textField("Badge"),
          highlight: booleanField("Highlight"),
          imageSrc: textField("Image Src"),
          imageAlt: textField("Image Alt"),
        }),
      },
    },
    NeonResultsShowcase: {
      render: renderBlock(NeonResultsShowcaseBlock),
      defaultProps: {
        id: "NeonResultsShowcase-1",
        title: "Real results. Real growth.",
        subtitle: "Proof that strategy and structure drive meaningful outcomes.",
        quote: "We watched 56 creators double qualified reach while cutting manual operations effort in half.",
        author: "Claire",
        role: "Growth Director",
      },
      fields: {
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        quote: textareaField("Quote"),
        author: textField("Author"),
        role: textField("Role"),
        imageSrc: textField("Image Src"),
        imageAlt: textField("Image Alt"),
      },
    },
    NeonPricingSplit: {
      render: renderBlock(NeonPricingSplitBlock),
      defaultProps: {
        id: "NeonPricingSplit-1",
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
        ],
        cta: { label: "Start Free Trial", href: "#contact", variant: "primary" },
      },
      fields: {
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        featuredName: textField("Featured Name"),
        featuredPrice: textField("Featured Price"),
        items: listField("Items", {
          name: textField("Name"),
          price: textField("Price"),
        }),
        features: listField("Features", {
          label: textField("Label"),
        }),
      },
    },
    NeonFooterGlow: {
      render: renderBlock(NeonFooterGlowBlock),
      defaultProps: {
        id: "NeonFooterGlow-1",
        title: "Join our newsletter",
        subtitle: "Get strategic updates on digital media growth, automation, and creator insights.",
        primaryCta: { label: "Get Started", href: "#contact", variant: "primary" },
        secondaryCta: { label: "Learn More", href: "#features", variant: "secondary" },
        legal: "© 2026 All rights reserved.",
      },
      fields: {
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        legal: textField("Legal"),
      },
    },
    DesignerHeroEditorial: {
      render: renderBlock(DesignerHeroEditorialBlock),
      defaultProps: {
        id: "DesignerHeroEditorial-1",
        eyebrow: "Since 2003",
        title: "the future of design & content",
        subtitle: "A multidisciplinary creative practice crafting visual systems.",
        detail: "Focused on product clarity and narrative-first communication.",
        ctas: [
          { label: "View Work", href: "#projects", variant: "primary" },
          { label: "Read Story", href: "#about", variant: "secondary" },
        ],
      },
      fields: {
        eyebrow: textField("Eyebrow"),
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        detail: textareaField("Detail"),
        meshImageSrc: textField("Mesh Image Src"),
        previewImageSrc: textField("Preview Image Src"),
        mobilePreviewImageSrc: textField("Mobile Preview Image Src"),
        previewImageAlt: textField("Preview Image Alt"),
        ctas: listField("CTAs", {
          label: textField("Label"),
          href: textField("Href"),
          variant: selectField("Variant", ["primary", "secondary", "link"]),
        }),
      },
    },
    DesignerCapabilitiesStrip: {
      render: renderBlock(DesignerCapabilitiesStripBlock),
      defaultProps: {
        id: "DesignerCapabilitiesStrip-1",
        title: "Capabilities",
        subtitle: "Digital design, development, and growth services with a product mindset.",
        items: [
          { title: "UI/UX Design", description: "Research-driven interfaces for web and mobile products." },
          { title: "Web Development", description: "Modern frontend architecture with production-ready quality." },
          { title: "Brand Identity", description: "Visual language systems that scale across digital touchpoints." },
        ],
      },
      fields: {
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        items: listField("Items", {
          title: textField("Title"),
          description: textareaField("Description"),
          imageSrc: textField("Image Src"),
          imageAlt: textField("Image Alt"),
          ctaLabel: textField("CTA Label"),
        }),
      },
    },
    DesignerProjectsSplit: {
      render: renderBlock(DesignerProjectsSplitBlock),
      defaultProps: {
        id: "DesignerProjectsSplit-1",
        title: "Recent Projects",
        subtitle: "A selection of recent design and development work.",
        items: [
          { title: "SaaS Dashboard", summary: "A product analytics dashboard focused on clarity." },
          { title: "Fashion Platform", summary: "A conversion-first ecommerce redesign with improved storytelling." },
        ],
      },
      fields: {
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        items: listField("Items", {
          title: textField("Title"),
          summary: textareaField("Summary"),
          href: textField("Href"),
          imageSrc: textField("Image Src"),
          imageAlt: textField("Image Alt"),
        }),
      },
    },
    DesignerQuoteBand: {
      render: renderBlock(DesignerQuoteBandBlock),
      defaultProps: {
        id: "DesignerQuoteBand-1",
        eyebrow: "Testimonial",
        quote:
          "\"Working with Jeremi was a game-changer. He translated our vision into a polished product and delivered beyond expectations.\"",
        author: "Client",
        role: "Founder",
      },
      fields: {
        eyebrow: textField("Eyebrow"),
        quote: textareaField("Quote"),
        author: textField("Author"),
        role: textField("Role"),
      },
    },
    FeatureGrid: {
      render: renderBlock(FeatureGridBlock),
      defaultProps: {
        id: "FeatureGrid-1",
        title: "Features",
        items: [
          { title: "Fast", desc: "Ship quickly with a stable block library.", icon: "rocket" },
          { title: "Maintainable", desc: "Schemas + variants keep assets clean.", icon: "shield" },
          { title: "Flexible", desc: "Swap theme tokens without rewriting UI.", icon: "sparkles" },
        ],
        variant: "3col",
        paddingY: "lg",
        maxWidth: "xl",
      },
      fields: {
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        variant: selectField("Columns", ["2col", "3col", "4col"]),
        paddingY: selectField("Padding", ["sm", "md", "lg"]),
        background: selectField("Background", ["none", "muted", "gradient", "image"]),
        maxWidth: selectField("Max Width", ["lg", "xl", "2xl"]),
        items: listField("Items", {
          title: textField("Title"),
          desc: textareaField("Description"),
          icon: textField("Icon Key"),
        }),
      },
    },
    FeatureWithMedia: {
      render: renderBlock(FeatureWithMediaBlock),
      defaultProps: {
        id: "FeatureWithMedia-1",
        title: "Feature with media",
        subtitle: "Pair supporting copy with an image or video.",
        body: "Explain the value proposition and guide users to the next step.",
        ctas: [{ label: "Learn more", href: "#", variant: "primary" }],
        variant: "split",
        paddingY: "lg",
        maxWidth: "xl",
      },
      fields: {
        eyebrow: textField("Eyebrow"),
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        body: textareaField("Body"),
        variant: selectField("Layout", ["simple", "split", "reverse"]),
        paddingY: selectField("Padding", ["sm", "md", "lg"]),
        background: selectField("Background", ["none", "muted", "gradient", "image"]),
        maxWidth: selectField("Max Width", ["lg", "xl", "2xl"]),
        ctas: listField("CTAs", {
          label: textField("Label"),
          href: textField("Href"),
          variant: selectField("Variant", ["primary", "secondary", "link"]),
        }),
        items: listField("Items", {
          title: textField("Title"),
          desc: textareaField("Description"),
        }),
        mediaSrc: textField("Media Src"),
        mediaAlt: textField("Media Alt"),
        mediaKind: selectField("Media Kind", ["image", "video"]),
      },
    },
    CategoryTabs: {
      render: renderBlock(CategoryTabsBlock),
      defaultProps: {
        id: "CategoryTabs-1",
        title: "I NOSTRI PRODOTTI",
        subtitle: "Seleziona una categoria per esplorare le soluzioni PAMA.",
        tabs: [{ label: "ACCESSORI" }, { label: "CENTRI DI LAVORO" }, { label: "AUTOMAZIONE" }],
        panels: [
          {
            title: "Accessori per ogni esigenza",
            description: "Moduli e accessori per ampliare versatilita e precisione.",
            bullets: ["Soluzioni modulari", "Setup rapido", "Qualita costante"],
            cta: { label: "SCOPRI DI PIÙ", href: "#prodotti", variant: "primary" },
          },
          {
            title: "Centri di lavoro",
            description: "Prestazioni elevate per lavorazioni industriali ad alta precisione.",
            bullets: ["Rigidita strutturale", "Controllo avanzato", "Affidabilita a lungo termine"],
            cta: { label: "SCOPRI DI PIÙ", href: "#prodotti", variant: "primary" },
          },
          {
            title: "Automazione",
            description: "Linee automatizzate per produttivita e qualita ripetibile.",
            bullets: ["Integrazione su misura", "Riduzione tempi ciclo", "Monitoraggio produzione"],
            cta: { label: "SCOPRI DI PIÙ", href: "#prodotti", variant: "primary" },
          },
        ],
        paddingY: "lg",
        maxWidth: "xl",
        background: "none",
      },
      fields: {
        eyebrow: textField("Eyebrow"),
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        paddingY: selectField("Padding", ["sm", "md", "lg"]),
        background: selectField("Background", ["none", "muted", "gradient", "image"]),
        maxWidth: selectField("Max Width", ["lg", "xl", "2xl"]),
        tabs: listField("Tabs", {
          label: textField("Label"),
        }),
        panels: listField("Panels", {
          title: textField("Title"),
          description: textareaField("Description"),
          mediaSrc: textField("Media Src"),
          mediaAlt: textField("Media Alt"),
          bullets: listField("Bullets", { value: textField("Bullet") }),
          cta: {
            label: textField("CTA Label"),
            href: textField("CTA Href"),
            variant: selectField("CTA Variant", ["primary", "secondary", "link"]),
          },
        }),
        activeIndex: textField("Active Index"),
      },
    },
    ContentStory: {
      render: renderBlock(FeatureWithMediaBlock),
      defaultProps: {
        id: "ContentStory-1",
        eyebrow: "Our Story",
        title: "Designing meaningful experiences",
        subtitle: "A concise narrative section for brand story and positioning.",
        body: "Use this section to communicate philosophy, process, and the why behind the product.",
        ctas: [{ label: "Learn more", href: "#", variant: "link" }],
        variant: "split",
        paddingY: "lg",
        maxWidth: "xl",
      },
      fields: {
        eyebrow: textField("Eyebrow"),
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        body: textareaField("Body"),
        variant: selectField("Layout", ["simple", "split", "reverse"]),
        paddingY: selectField("Padding", ["sm", "md", "lg"]),
        background: selectField("Background", ["none", "muted", "gradient", "image"]),
        maxWidth: selectField("Max Width", ["lg", "xl", "2xl"]),
        ctas: listField("CTAs", {
          label: textField("Label"),
          href: textField("Href"),
          variant: selectField("Variant", ["primary", "secondary", "link"]),
        }),
      },
    },
    PricingCards: {
      render: renderBlock(PricingCardsBlock),
      defaultProps: {
        id: "PricingCards-1",
        title: "Pricing",
        billingToggle: false,
        plans: [
          {
            name: "Starter",
            price: "$19",
            period: "mo",
            features: ["Feature A", "Feature B", "Email support"],
            cta: { label: "Choose Starter", href: "#", variant: "secondary" },
          },
          {
            name: "Pro",
            price: "$49",
            period: "mo",
            highlighted: true,
            features: ["Everything in Starter", "Advanced analytics", "Priority support"],
            cta: { label: "Choose Pro", href: "#", variant: "primary" },
          },
        ],
        variant: "2up",
        paddingY: "lg",
        maxWidth: "xl",
      },
      fields: {
        title: textField("Title"),
        billingToggle: booleanField("Billing Toggle"),
        variant: selectField("Layout", ["2up", "3up", "withToggle"]),
        paddingY: selectField("Padding", ["sm", "md", "lg"]),
        background: selectField("Background", ["none", "muted", "gradient", "image"]),
        maxWidth: selectField("Max Width", ["lg", "xl", "2xl"]),
        plans: listField("Plans", {
          name: textField("Name"),
          price: textField("Price"),
          period: selectField("Period", ["mo", "yr"]),
          highlighted: booleanField("Highlighted"),
        }),
      },
    },
    FAQAccordion: {
      render: renderBlock(FAQAccordionBlock),
      defaultProps: {
        id: "FAQAccordion-1",
        title: "FAQ",
        items: [
          { q: "Can I import JSON into Puck?", a: "Yes. The page data is stored as structured JSON." },
          { q: "Is this maintainable long term?", a: "Yes. Blocks are versioned and schema-validated." },
          { q: "Can I turn off animations?", a: "Yes. Motion mode can be disabled globally." },
        ],
        variant: "singleOpen",
        paddingY: "lg",
        maxWidth: "xl",
      },
      fields: {
        title: textField("Title"),
        variant: selectField("Mode", ["singleOpen", "multiOpen"]),
        paddingY: selectField("Padding", ["sm", "md", "lg"]),
        background: selectField("Background", ["none", "muted", "gradient", "image"]),
        maxWidth: selectField("Max Width", ["lg", "xl", "2xl"]),
        items: listField("Items", {
          q: textField("Question"),
          a: textareaField("Answer"),
        }),
      },
    },
    Footer: {
      render: renderBlock(FooterBlock),
      defaultProps: {
        id: "Footer-1",
        columns: [
          {
            title: "Product",
            links: [{ label: "Features", href: "#" }, { label: "Pricing", href: "#" }],
          },
          {
            title: "Company",
            links: [{ label: "About", href: "#" }, { label: "Contact", href: "#" }],
          },
          {
            title: "Legal",
            links: [{ label: "Privacy", href: "#" }, { label: "Terms", href: "#" }],
          },
        ],
        variant: "multiColumn",
        paddingY: "md",
        maxWidth: "xl",
      },
      fields: {
        variant: selectField("Layout", ["simple", "multiColumn"]),
        paddingY: selectField("Padding", ["sm", "md", "lg"]),
        maxWidth: selectField("Max Width", ["lg", "xl", "2xl"]),
        legal: textField("Legal"),
        columns: listField("Columns", {
          title: textField("Title"),
        }),
      },
    },
    LogoCloud: {
      render: renderBlock(LogoCloudBlock),
      defaultProps: {
        id: "LogoCloud-1",
        title: "Trusted by teams",
        logos: [
          { src: "/assets/logo-1.svg", alt: "Logo" },
          { src: "/assets/logo-2.svg", alt: "Logo" },
          { src: "/assets/logo-3.svg", alt: "Logo" },
        ],
        variant: "grid",
        paddingY: "md",
        maxWidth: "xl",
      },
      fields: {
        title: textField("Title"),
        variant: selectField("Variant", ["grid", "marquee"]),
      },
    },
    TestimonialsGrid: {
      render: renderBlock(TestimonialsGridBlock),
      defaultProps: {
        id: "Testimonials-1",
        title: "What customers say",
        items: [
          { quote: "Great experience.", name: "Alex", role: "Founder" },
          { quote: "Loved the workflow.", name: "Sam", role: "Product" },
        ],
        variant: "2col",
        paddingY: "lg",
        maxWidth: "xl",
      },
      fields: {
        title: textField("Title"),
        variant: selectField("Variant", ["2col", "3col"]),
      },
    },
    CaseStudies: {
      render: renderBlock(CaseStudiesBlock),
      defaultProps: {
        id: "CaseStudies-1",
        title: "Case Studies",
        items: [
          { title: "Case Study A", summary: "Summary", href: "#" },
          { title: "Case Study B", summary: "Summary", href: "#" },
        ],
        variant: "cards",
        paddingY: "lg",
        maxWidth: "xl",
      },
      fields: {
        title: textField("Title"),
        variant: selectField("Variant", ["cards", "list"]),
      },
    },
    LeadCaptureCTA: {
      render: renderBlock(LeadCaptureCTABlock),
      defaultProps: {
        id: "LeadCaptureCTA-1",
        title: "Talk to the team",
        subtitle: "Share a few details and we will follow up.",
        cta: { label: "Request Demo", href: "#", variant: "primary" },
        variant: "banner",
        paddingY: "lg",
        maxWidth: "xl",
      },
      fields: {
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        variant: selectField("Variant", ["banner", "card"]),
      },
    },
    CardsGrid: {
      render: renderBlock(CardsGridBlock),
      defaultProps: {
        id: "CardsGrid-1",
        title: "Highlights",
        subtitle: "Flexible cards for products, people, or media.",
        variant: "product",
        columns: "3col",
        density: "normal",
        cardStyle: "glass",
        imagePosition: "top",
        imageSize: "md",
        imageShape: "rounded",
        headingSize: "md",
        bodySize: "md",
        items: [
          {
            title: "Card title",
            subtitle: "Short subtitle",
            description: "Add supporting copy for the card.",
            image: { src: "/assets/placeholder.png", alt: "Card image" },
          },
          {
            title: "Card title",
            subtitle: "Short subtitle",
            description: "Add supporting copy for the card.",
            image: { src: "/assets/placeholder.png", alt: "Card image" },
          },
          {
            title: "Card title",
            subtitle: "Short subtitle",
            description: "Add supporting copy for the card.",
            image: { src: "/assets/placeholder.png", alt: "Card image" },
          },
        ],
        paddingY: "lg",
        maxWidth: "xl",
      },
      fields: {
        title: textField("Title"),
        subtitle: textareaField("Subtitle"),
        variant: selectField("Variant", ["product", "person", "media", "imageText", "poster"]),
        columns: selectField("Columns", ["2col", "3col", "4col"]),
        density: selectField("Density", ["compact", "normal", "spacious"]),
        cardStyle: selectField("Card Style", ["glass", "solid", "muted"]),
        imagePosition: selectField("Image Position", ["top", "left", "right"]),
        imageSize: selectField("Image Size", ["sm", "md", "lg"]),
        imageShape: selectField("Image Shape", ["square", "rounded", "circle"]),
        headingSize: selectField("Heading Size", ["sm", "md", "lg"]),
        bodySize: selectField("Body Size", ["sm", "md", "lg"]),
        headingFont: textField("Heading Font"),
        bodyFont: textField("Body Font"),
        textAlign: selectField("Text Align", ["left", "center"]),
        paddingY: selectField("Padding", ["sm", "md", "lg"]),
        background: selectField("Background", ["none", "muted", "gradient", "image"]),
        maxWidth: selectField("Max Width", ["lg", "xl", "2xl"]),
        items: listField("Items", {
          title: textField("Title"),
          subtitle: textField("Subtitle"),
          description: textareaField("Description"),
          eyebrow: textField("Eyebrow"),
          tag: textField("Tag"),
          meta: textField("Meta"),
          price: textField("Price"),
          role: textField("Role"),
          imageSrc: textField("Image Src"),
          imageAlt: textField("Image Alt"),
        }),
      },
    },
  },
};
