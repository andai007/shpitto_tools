"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import {
  BaseBlockProps,
  LinkProps,
  backgroundMediaStyle,
  backgroundOverlayStyle,
  backgroundVideoSource,
  backgroundGradientStyle,
  maxWidthClass,
} from "@/components/blocks/shared";

export type ProductCategoryTab = {
  label: string;
  href?: string;
};

export type ProductCategoryCard = {
  title: string;
  description?: string;
  icon?: string;
  cta?: LinkProps;
};

export type ProductCategoryBandProps = BaseBlockProps & {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tabs: ProductCategoryTab[];
  cards: ProductCategoryCard[];
};

export function ProductCategoryBandBlock({
  id,
  anchor,
  paddingY = "lg",
  background = "none",
  backgroundMedia,
  backgroundGradient,
  backgroundOverlay,
  backgroundOverlayOpacity,
  backgroundBlur,
  align = "center",
  maxWidth = "xl",
  headingFont,
  bodyFont,
  eyebrow,
  title,
  subtitle,
  tabs,
  cards,
}: ProductCategoryBandProps) {
  const backgroundStyle = {
    ...(backgroundMediaStyle(background, backgroundMedia) || {}),
    ...(backgroundGradientStyle(background, backgroundGradient) || {}),
  };
  const overlayStyle = backgroundOverlayStyle(backgroundOverlay, backgroundOverlayOpacity, backgroundBlur);
  const backgroundVideo = backgroundVideoSource(background, backgroundMedia);
  const hasBackgroundVideo = Boolean(backgroundVideo?.src);
  const headingStyle = headingFont ? { fontFamily: headingFont } : undefined;
  const bodyStyle = bodyFont ? { fontFamily: bodyFont } : undefined;

  const safeTabs = Array.isArray(tabs) ? tabs.slice(0, 6) : [];
  const safeCards = Array.isArray(cards) ? cards.slice(0, 6) : [];
  const [active, setActive] = React.useState(0);
  const activeIndex = Math.max(0, Math.min(active, Math.max(0, safeCards.length - 1)));
  const visibleCount = Math.min(3, safeCards.length);
  const visibleCards =
    visibleCount === 0
      ? []
      : Array.from({ length: visibleCount }, (_, i) => safeCards[(activeIndex + i) % safeCards.length]);

  return (
    <section
      id={anchor}
      data-block="ProductCategoryBand"
      data-block-id={id}
      className={cn(
        "w-full",
        paddingY === "sm" ? "py-8" : paddingY === "md" ? "py-12" : "py-20",
        background === "muted"
          ? "bg-muted"
          : background === "gradient"
            ? "bg-gradient-to-b from-background to-muted"
            : "bg-background",
        hasBackgroundVideo ? "relative overflow-hidden" : ""
      )}
      style={backgroundStyle}
    >
      {hasBackgroundVideo ? (
        <video
          src={backgroundVideo?.src}
          poster={backgroundVideo?.poster}
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
      ) : null}
      {overlayStyle ? <div className="absolute inset-0" style={{ ...overlayStyle, zIndex: 1 }} /> : null}

      <div className={cn("mx-auto px-4 sm:px-6 relative z-10", maxWidthClass(maxWidth))}>
        <div className={cn(align === "center" ? "text-center" : "text-left")}>
          <h2
            className={cn("text-xl font-semibold uppercase tracking-[0.12em] text-primary sm:text-2xl")}
            style={headingStyle}
          >
            {(title || eyebrow || "").trim()}
          </h2>
          {subtitle ? (
            <p className="mt-3 text-sm text-muted-foreground sm:text-base" style={bodyStyle}>
              {subtitle}
            </p>
          ) : null}
        </div>

        {safeTabs.length ? (
          <div className="mt-10">
            <div className="grid gap-4 md:grid-cols-3">
              {safeTabs.map((tab, idx) => (
                <Button
                  key={`${tab.label}-${idx}`}
                  asChild
                  size="lg"
                  variant="default"
                  className={cn(
                    "h-14 w-full rounded-none bg-primary text-primary-foreground",
                    "text-[11px] font-semibold uppercase tracking-[0.14em]",
                    "hover:bg-primary/90"
                  )}
                >
                  <a href={tab.href || "#prodotti"}>{tab.label}</a>
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {safeCards.length ? (
          <div className="mt-10 relative">
            {safeCards.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={() => setActive((v) => (v - 1 + safeCards.length) % safeCards.length)}
                  className={cn(
                    "hidden md:inline-flex absolute left-0 top-1/2 -translate-x-10 -translate-y-1/2",
                    "h-10 w-10 items-center justify-center text-primary"
                  )}
                  aria-label="Previous"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M14 7l-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => setActive((v) => (v + 1) % safeCards.length)}
                  className={cn(
                    "hidden md:inline-flex absolute right-0 top-1/2 translate-x-10 -translate-y-1/2",
                    "h-10 w-10 items-center justify-center text-primary"
                  )}
                  aria-label="Next"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M10 7l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </>
            ) : null}

            <div className="grid gap-6 md:grid-cols-3">
              {visibleCards.map((card, idx) => (
                <Card
                  key={`${card.title}-${activeIndex + idx}`}
                  className="rounded-none border-transparent bg-muted"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-foreground" style={headingStyle}>
                      {card.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {card.description ? (
                      <p className="text-xs leading-5 text-muted-foreground" style={bodyStyle}>
                        {card.description}
                      </p>
                    ) : null}
                    {card.cta ? (
                      <div className="mt-6">
                        <Button
                          asChild
                          size="sm"
                          variant="default"
                          className="h-10 rounded-none bg-primary px-7 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-foreground hover:bg-primary/90"
                        >
                          <a href={card.cta.href}>{card.cta.label}</a>
                        </Button>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ))}
            </div>

            {safeCards.length > 1 ? (
              <div className="mt-8 flex items-center justify-center gap-2">
                {safeCards.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    className={cn(
                      "relative h-4 w-4 rounded-full border-2 border-primary transition-colors"
                    )}
                    aria-label={`Go to ${i + 1}`}
                  >
                    {i === activeIndex ? (
                      <span
                        className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary"
                        aria-hidden="true"
                      />
                    ) : null}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
