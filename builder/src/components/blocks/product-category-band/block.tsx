"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { Icon } from "@/components/blocks/icon-map/icon";
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
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary" style={bodyStyle}>
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h2 className={cn("mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl")} style={headingStyle}>
              {title}
            </h2>
          ) : null}
          {subtitle ? (
            <p className="mt-3 text-sm text-muted-foreground sm:text-base" style={bodyStyle}>
              {subtitle}
            </p>
          ) : null}
        </div>

        {safeTabs.length ? (
          <div className="mt-10 rounded-md bg-primary p-3">
            <div className="grid gap-3 md:grid-cols-3">
              {safeTabs.map((tab, idx) => (
                <Button
                  key={`${tab.label}-${idx}`}
                  asChild
                  size="sm"
                  variant="default"
                  className={cn(
                    "h-12 w-full rounded-none bg-primary text-primary-foreground",
                    "text-[11px] font-semibold uppercase tracking-[0.14em]",
                    "border border-primary-foreground/15 hover:bg-primary/90"
                  )}
                >
                  <a href={tab.href || "#prodotti"}>{tab.label}</a>
                </Button>
              ))}
            </div>
          </div>
        ) : null}

        {safeCards.length ? (
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {safeCards.map((card, idx) => (
              <Card key={`${card.title}-${idx}`} className="rounded-md border-border bg-card">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon name={card.icon || "cpu"} className="h-5 w-5" />
                    </div>
                    <CardTitle
                      className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary"
                      style={bodyStyle}
                    >
                      {card.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  {card.description ? (
                    <p className="text-xs leading-5 text-muted-foreground" style={bodyStyle}>
                      {card.description}
                    </p>
                  ) : null}
                  {card.cta ? (
                    <div className="mt-5">
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
        ) : null}
      </div>
    </section>
  );
}

