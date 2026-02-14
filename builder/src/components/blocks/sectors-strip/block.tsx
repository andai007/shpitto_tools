"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/atoms/button";
import {
  BaseBlockProps,
  LinkProps,
  backgroundMediaStyle,
  backgroundOverlayStyle,
  backgroundVideoSource,
  backgroundGradientStyle,
  maxWidthClass,
} from "@/components/blocks/shared";

export type SectorItem = {
  title: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  cta?: LinkProps;
};

export type SectorsStripProps = BaseBlockProps & {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  items: SectorItem[];
};

export function SectorsStripBlock({
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
  items,
}: SectorsStripProps) {
  const [active, setActive] = React.useState(0);
  const safeItems = Array.isArray(items) ? items.slice(0, 6) : [];

  const backgroundStyle = {
    ...(backgroundMediaStyle(background, backgroundMedia) || {}),
    ...(backgroundGradientStyle(background, backgroundGradient) || {}),
  };
  const overlayStyle = backgroundOverlayStyle(backgroundOverlay, backgroundOverlayOpacity, backgroundBlur);
  const backgroundVideo = backgroundVideoSource(background, backgroundMedia);
  const hasBackgroundVideo = Boolean(backgroundVideo?.src);
  const headingStyle = headingFont ? { fontFamily: headingFont } : undefined;
  const bodyStyle = bodyFont ? { fontFamily: bodyFont } : undefined;

  const isCentered = align === "center";
  const activeIndex = Math.max(0, Math.min(active, Math.max(0, safeItems.length - 1)));
  const visibleCount = Math.min(3, safeItems.length);
  const visibleItems =
    visibleCount === 0
      ? []
      : Array.from({ length: visibleCount }, (_, i) => safeItems[(activeIndex + i) % safeItems.length]);

  return (
    <section
      id={anchor}
      data-block="SectorsStrip"
      data-block-id={id}
      className={cn(
        "w-full",
        paddingY === "sm" ? "py-8" : paddingY === "md" ? "py-12" : "py-20",
        background === "muted" ? "bg-muted" : background === "gradient" ? "bg-gradient-to-b from-background to-muted" : "bg-background",
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
        <div className={cn(isCentered ? "text-center" : "text-left")}>
          {eyebrow ? (
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary" style={bodyStyle}>
              {eyebrow}
            </p>
          ) : null}
          <h2
            className={cn(
              "text-xl font-semibold tracking-tight text-foreground sm:text-2xl",
              eyebrow ? "mt-2" : ""
            )}
            style={headingStyle}
          >
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-3 text-sm text-muted-foreground sm:text-base" style={bodyStyle}>
              {subtitle}
            </p>
          ) : null}
        </div>

        <div className="mt-10 relative">
          {safeItems.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => setActive((v) => (v - 1 + safeItems.length) % safeItems.length)}
                className={cn(
                  "hidden md:inline-flex absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2",
                  "h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-primary shadow-sm",
                  "hover:bg-muted"
                )}
                aria-label="Previous"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M14 7l-5 5 5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setActive((v) => (v + 1) % safeItems.length)}
                className={cn(
                  "hidden md:inline-flex absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2",
                  "h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-primary shadow-sm",
                  "hover:bg-muted"
                )}
                aria-label="Next"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M10 7l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </>
          ) : null}

          <div className="mt-6 grid gap-8 md:grid-cols-3">
            {visibleItems.map((item, idx) => {
              const img = item.imageSrc;
              return (
                <article
                  key={`${item.title}-${activeIndex + idx}`}
                  className="overflow-hidden rounded-md border border-border bg-card"
                >
                  {img ? (
                    <img
                      src={img}
                      alt={item.imageAlt ?? item.title}
                      className="h-36 w-full object-cover"
                      loading="lazy"
                    />
                  ) : null}
                  <div className="p-6">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary" style={bodyStyle}>
                      {item.title}
                    </h3>
                    {item.description ? (
                      <p className="mt-3 text-xs leading-5 text-muted-foreground" style={bodyStyle}>
                        {item.description}
                      </p>
                    ) : null}
                    {item.cta ? (
                      <div className="mt-5">
                        <Button
                          asChild
                          size="sm"
                          variant="default"
                          className="h-10 rounded-none bg-primary px-7 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-foreground hover:bg-primary/90"
                        >
                          <a href={item.cta.href}>{item.cta.label}</a>
                        </Button>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>

          {safeItems.length > 1 ? (
            <div className="mt-6 flex items-center justify-center gap-2">
              {safeItems.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    "h-2 w-2 rounded-full border transition-colors",
                    i === activeIndex ? "bg-primary border-primary" : "bg-transparent border-border/60"
                  )}
                  aria-label={`Go to ${i + 1}`}
                />
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
