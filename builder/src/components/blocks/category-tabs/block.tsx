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

export type CategoryTab = {
  label: string;
};

export type CategoryPanel = {
  title: string;
  description?: string;
  bullets?: string[];
  cta?: LinkProps;
  mediaSrc?: string;
  mediaAlt?: string;
};

export type CategoryTabsProps = BaseBlockProps & {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tabs: CategoryTab[];
  panels: CategoryPanel[];
  activeIndex?: number;
};

export function CategoryTabsBlock({
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
  panels,
  activeIndex = 0,
}: CategoryTabsProps) {
  const [active, setActive] = React.useState<number>(
    Number.isFinite(activeIndex) ? Math.max(0, Math.min(activeIndex, Math.max(0, tabs.length - 1))) : 0
  );
  const panel = panels?.[active] ?? panels?.[0];

  const backgroundStyle = {
    ...(backgroundMediaStyle(background, backgroundMedia) || {}),
    ...(backgroundGradientStyle(background, backgroundGradient) || {}),
  };
  const overlayStyle = backgroundOverlayStyle(backgroundOverlay, backgroundOverlayOpacity, backgroundBlur);
  const backgroundVideo = backgroundVideoSource(background, backgroundMedia);
  const hasBackgroundVideo = Boolean(backgroundVideo?.src);
  const headingStyle = headingFont ? { fontFamily: headingFont } : undefined;
  const bodyStyle = bodyFont ? { fontFamily: bodyFont } : undefined;

  return (
    <section
      id={anchor}
      data-block="CategoryTabs"
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
        {eyebrow ? (
          <p className={cn("text-sm text-muted-foreground", align === "center" ? "text-center" : "text-left")} style={bodyStyle}>
            {eyebrow}
          </p>
        ) : null}
        {title ? (
          <h2 className={cn("mt-3 font-semibold tracking-tight text-2xl sm:text-3xl", align === "center" ? "text-center" : "text-left")} style={headingStyle}>
            {title}
          </h2>
        ) : null}
        {subtitle ? (
          <p className={cn("mt-3 text-base text-muted-foreground sm:text-lg", align === "center" ? "text-center" : "text-left")} style={bodyStyle}>
            {subtitle}
          </p>
        ) : null}

        <div className="mt-10">
          <div className="grid gap-3 md:grid-cols-3">
            {tabs.slice(0, 6).map((tab, idx) => {
              const isActive = idx === active;
              return (
                <button
                  key={`${tab.label}-${idx}`}
                  type="button"
                  onClick={() => setActive(idx)}
                  className={cn(
                    "h-14 w-full rounded-md border text-sm font-semibold uppercase tracking-wide transition-colors",
                    isActive
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-primary hover:bg-muted"
                  )}
                  style={bodyStyle}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {panel ? (
            <div className="mt-6 grid gap-6 rounded-xl border border-border bg-card p-6 md:grid-cols-12 md:items-center">
              <div className={cn(panel.mediaSrc ? "md:col-span-5" : "md:col-span-12")}>
                <h3 className="text-lg font-semibold tracking-tight" style={headingStyle}>
                  {panel.title}
                </h3>
                {panel.description ? (
                  <p className="mt-2 text-sm text-muted-foreground" style={bodyStyle}>
                    {panel.description}
                  </p>
                ) : null}
                {panel.bullets?.length ? (
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground" style={bodyStyle}>
                    {panel.bullets.slice(0, 8).map((bullet, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="mt-1 inline-block h-2 w-2 rounded-full bg-primary" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {panel.cta ? (
                  <div className="mt-5">
                    <Button asChild variant="default" size="sm">
                      <a href={panel.cta.href}>{panel.cta.label}</a>
                    </Button>
                  </div>
                ) : null}
              </div>
              {panel.mediaSrc ? (
                <div className="md:col-span-7">
                  <img
                    src={panel.mediaSrc}
                    alt={panel.mediaAlt ?? ""}
                    className="h-64 w-full rounded-lg border border-border object-cover shadow-sm md:h-72"
                    loading="lazy"
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

