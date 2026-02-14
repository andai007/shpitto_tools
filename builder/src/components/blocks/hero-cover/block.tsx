"use client";

import React from "react";
import { cn } from "@/lib/cn";
import {
  BaseBlockProps,
  backgroundMediaStyle,
  backgroundOverlayStyle,
  backgroundVideoSource,
  backgroundGradientStyle,
  maxWidthClass,
} from "@/components/blocks/shared";

export type HeroCoverProps = BaseBlockProps & {
  mediaSrc: string;
  mediaAlt?: string;
  mobileMediaSrc?: string;
  mobileMediaAlt?: string;
  height?: string;
  mobileHeight?: string;
  fullBleed?: boolean;
  flush?: boolean;
  overlay?: string;
  overlayOpacity?: number;
};

export function HeroCoverBlock({
  id,
  anchor,
  paddingY = "sm",
  background = "none",
  backgroundMedia,
  backgroundGradient,
  backgroundOverlay,
  backgroundOverlayOpacity,
  backgroundBlur,
  maxWidth = "2xl",
  align = "center",
  mediaSrc,
  mediaAlt,
  mobileMediaSrc,
  mobileMediaAlt,
  height = "520px",
  mobileHeight = "360px",
  fullBleed = true,
  flush = false,
  overlay,
  overlayOpacity,
}: HeroCoverProps) {
  const backgroundStyle = {
    ...(backgroundMediaStyle(background, backgroundMedia) || {}),
    ...(backgroundGradientStyle(background, backgroundGradient) || {}),
  };
  const overlayStyle = backgroundOverlayStyle(
    overlay || backgroundOverlay,
    typeof overlayOpacity === "number" ? overlayOpacity : backgroundOverlayOpacity,
    backgroundBlur
  );
  const backgroundVideo = backgroundVideoSource(background, backgroundMedia);
  const hasBackgroundVideo = Boolean(backgroundVideo?.src);

  const containerClass = fullBleed ? "w-full" : cn("mx-auto px-4 sm:px-6", maxWidthClass(maxWidth));
  const frameClass = fullBleed
    ? "w-full"
    : "overflow-hidden rounded-[calc(var(--radius)+8px)] border border-border";
  const resolvedFrameClass = flush ? "w-full" : frameClass;

  return (
    <section
      id={anchor}
      data-block="HeroCover"
      data-block-id={id}
      className={cn(
        "w-full",
        flush ? "py-0" : paddingY === "sm" ? "py-3" : paddingY === "md" ? "py-6" : "py-10",
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

      <div className={containerClass}>
        <div
          className={cn("relative", resolvedFrameClass)}
          style={{ textAlign: align === "center" ? "center" : "left" }}
        >
          <picture>
            {mobileMediaSrc ? (
              <source media="(max-width: 768px)" srcSet={mobileMediaSrc} />
            ) : null}
            <img
              src={mediaSrc}
              alt={mediaAlt ?? ""}
              className="block w-full object-cover"
              style={{
                height,
              }}
              loading="eager"
            />
          </picture>
          <style
            // Mobile height override without JS.
            dangerouslySetInnerHTML={{
              __html: `@media (max-width: 768px){[data-block='HeroCover'][data-block-id='${String(
                id || ""
              )}'] img{height:${mobileHeight};}}`,
            }}
          />
          {overlayStyle ? <div className="absolute inset-0" style={overlayStyle} /> : null}
        </div>
      </div>
    </section>
  );
}
