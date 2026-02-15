"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/atoms/button";
import {
  BaseBlockProps,
  LinkProps,
  backgroundMediaStyle,
  backgroundVideoSource,
  backgroundOverlayStyle,
  backgroundGradientStyle,
  maxWidthClass,
} from "@/components/blocks/shared";
import { useMotionMode } from "@/components/theme/motion";
import { featureWithMediaSectionClass } from "./variants";

type FeatureWithMediaItem = {
  title: string;
  desc?: string;
};

type FeatureWithMediaMedia = {
  kind: "image" | "video";
  src: string;
  alt?: string;
};

export type FeatureWithMediaProps = BaseBlockProps & {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  contentTone?: "default" | "light";
  textPanel?: "none" | "muted";
  textPanelPadding?: "md" | "lg";
  ctas?: LinkProps[];
  items?: FeatureWithMediaItem[];
  media?: FeatureWithMediaMedia;
  mediaSrc?: string;
  mediaAlt?: string;
  mediaKind?: "image" | "video";
  mediaShape?: "rounded" | "square";
  mediaShadow?: "none" | "sm" | "md" | "lg";
  mediaBorder?: "default" | "none";
};

export type FeatureWithMediaVariant = "simple" | "split" | "reverse";

export function FeatureWithMediaBlock({
  id,
  anchor,
  paddingY = "lg",
  background = "none",
  backgroundMedia,
  backgroundGradient,
  backgroundOverlay,
  backgroundOverlayOpacity,
  backgroundBlur,
  align = "left",
  maxWidth = "xl",
  eyebrow,
  title,
  subtitle,
  body,
  contentTone = "default",
  textPanel = "none",
  textPanelPadding = "lg",
  ctas,
  items,
  media,
  mediaSrc,
  mediaAlt,
  mediaKind = "image",
  mediaShape = "rounded",
  mediaShadow = "sm",
  mediaBorder = "default",
  headingFont,
  bodyFont,
  emphasis = "normal",
  variant = "split",
}: FeatureWithMediaProps & { variant?: FeatureWithMediaVariant }) {
  const motionMode = useMotionMode();
  const motionClass =
    motionMode === "off" || mediaShadow === "none"
      ? ""
      : "transition-all duration-300 hover:-translate-y-1 hover:shadow-md";
  const resolvedMedia =
    media ?? (mediaSrc ? { kind: mediaKind, src: mediaSrc, alt: mediaAlt } : undefined);
  const hasMedia = Boolean(resolvedMedia?.src);
  const derivedTitle =
    title ??
    (anchor
      ? anchor.length <= 3
        ? anchor.toUpperCase()
        : anchor
            .replace(/-/g, " ")
            .replace(/\b\w/g, (match) => match.toUpperCase())
      : undefined);
  const layoutClass =
    variant === "simple" || !hasMedia
      ? "flex flex-col"
      : "grid md:grid-cols-2 md:items-center";
  const textOrderClass = variant === "reverse" ? "md:order-2" : "md:order-1";
  const mediaOrderClass = variant === "reverse" ? "md:order-1" : "md:order-2";
  const backgroundStyle = {
    ...(backgroundMediaStyle(background, backgroundMedia) || {}),
    ...(backgroundGradientStyle(background, backgroundGradient) || {}),
  };
  const overlayStyle = backgroundOverlayStyle(
    backgroundOverlay,
    backgroundOverlayOpacity,
    backgroundBlur
  );
  const backgroundVideo = backgroundVideoSource(background, backgroundMedia);
  const hasBackgroundVideo = Boolean(backgroundVideo?.src);
  const isLightTone = contentTone === "light";
  const headingStyle = headingFont ? { fontFamily: headingFont } : undefined;
  const bodyStyle = bodyFont ? { fontFamily: bodyFont } : undefined;
  const mediaRadiusClass = mediaShape === "square" ? "rounded-none" : "rounded-[calc(var(--radius)+4px)]";
  const mediaShadowClass =
    mediaShadow === "none"
      ? ""
      : mediaShadow === "lg"
        ? "shadow-xl shadow-black/10"
        : mediaShadow === "md"
          ? "shadow-lg shadow-black/10"
          : "shadow-md shadow-black/10";
  const mediaBorderClass = mediaBorder === "none" ? "" : "border border-border";
  const textPanelClass =
    textPanel === "muted"
      ? cn(
          "bg-muted",
          textPanelPadding === "md" ? "p-6 sm:p-8" : "p-8 sm:p-10"
        )
      : "";

  return (
    <section
      id={anchor}
      data-block="FeatureWithMedia"
      data-block-id={id}
      data-block-variant={variant}
      className={cn(
        featureWithMediaSectionClass({ paddingY, background }),
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
      {overlayStyle ? (
        <div className="absolute inset-0" style={{ ...overlayStyle, zIndex: 1 }} />
      ) : null}
      <div
        className={cn(
          "mx-auto px-4 sm:px-6",
          maxWidthClass(maxWidth),
          hasBackgroundVideo ? "relative z-10" : ""
        )}
      >
        <div className={layoutClass} style={{ gap: "var(--space-4)" }}>
          <div
            className={cn(
              textOrderClass,
              align === "center" ? "text-center" : "text-left",
              isLightTone ? "text-white" : "",
              textPanelClass
            )}
          >
            {eyebrow ? (
              <p
                className={cn(
                  "text-[11px] font-semibold uppercase tracking-[0.22em]",
                  isLightTone ? "text-white/70" : "text-primary"
                )}
                style={bodyStyle}
              >
                {eyebrow}
              </p>
            ) : null}
            {derivedTitle ? (
              <h2
                className={cn(
                  "mt-3 text-2xl font-semibold tracking-tight sm:text-3xl",
                  emphasis === "high" && !isLightTone ? "text-gradient" : "",
                  isLightTone ? "text-white" : ""
                )}
                style={headingStyle}
              >
                {derivedTitle}
              </h2>
            ) : null}
            {subtitle ? (
              <p className={cn("mt-3 text-base sm:text-lg", isLightTone ? "text-white/75" : "text-muted-foreground")} style={bodyStyle}>
                {subtitle}
              </p>
            ) : null}
            {body ? (
              <p className={cn("mt-4 text-base", isLightTone ? "text-white/75" : "text-muted-foreground")} style={bodyStyle}>
                {body}
              </p>
            ) : null}
            {items?.length ? (
              <div className="mt-6 space-y-4">
                {items.slice(0, 6).map((item, idx) => (
                  <div key={idx}>
                    <div className={cn("text-sm font-medium", isLightTone ? "text-white" : "")} style={headingStyle}>
                      {item.title}
                    </div>
                    {item.desc ? (
                      <p className={cn("mt-1 text-sm", isLightTone ? "text-white/75" : "text-muted-foreground")} style={bodyStyle}>
                        {item.desc}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : null}
            {ctas?.length ? (
              <div
                className={cn(
                  "mt-6 flex flex-wrap gap-4",
                  align === "center" ? "justify-center" : "justify-start"
                )}
              >
                {ctas.slice(0, 2).map((cta, idx) => (
                  <Button
                    key={idx}
                    asChild
                    variant={cta.variant === "secondary" ? "secondary" : "default"}
                    className={cn(emphasis === "high" && idx === 0 ? "btn-glow" : "")}
                    size="lg"
                  >
                    <a href={cta.href}>{cta.label}</a>
                  </Button>
                ))}
              </div>
            ) : null}
          </div>
          {hasMedia ? (
            <div
              className={cn(
                mediaOrderClass,
                motionClass,
                emphasis === "high" ? "card-glass hover-lift" : ""
              )}
            >
              {resolvedMedia?.kind === "video" ? (
                <video
                  src={resolvedMedia.src}
                  controls
                  className={cn("w-full", mediaBorderClass, mediaRadiusClass, mediaShadowClass)}
                />
              ) : (
                <img
                  src={resolvedMedia?.src}
                  alt={resolvedMedia?.alt ?? ""}
                  className={cn("w-full", mediaBorderClass, mediaRadiusClass, mediaShadowClass)}
                  loading="lazy"
                />
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
