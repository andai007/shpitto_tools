"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/atoms/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/atoms/card";
import { useMotionMode } from "@/components/theme/motion";
import { useInViewReveal } from "@/lib/motion";
import {
  BaseBlockProps,
  LinkProps,
  backgroundMediaStyle,
  backgroundOverlayStyle,
  backgroundVideoSource,
  backgroundGradientStyle,
  maxWidthClass,
} from "@/components/blocks/shared";

type CardImage = { src: string; alt?: string };

export type CardsGridItem = {
  title: string;
  subtitle?: string;
  description?: string;
  eyebrow?: string;
  tag?: string;
  meta?: string;
  price?: string;
  role?: string;
  image?: CardImage;
  imageSrc?: string;
  imageAlt?: string;
  cta?: LinkProps;
};

export type CardsGridProps = BaseBlockProps & {
  title?: string;
  subtitle?: string;
  sectionCta?: LinkProps;
  items: CardsGridItem[];
  variant?: "product" | "person" | "media" | "imageText" | "poster";
  columns?: "2col" | "3col" | "4col";
  density?: "compact" | "normal" | "spacious";
  cardStyle?: "glass" | "solid" | "muted";
  imagePosition?: "top" | "left" | "right";
  horizontalImageStyle?: "thumb" | "split";
  imageSize?: "sm" | "md" | "lg";
  imageShape?: "square" | "rounded" | "circle";
  headingSize?: "sm" | "md" | "lg";
  bodySize?: "sm" | "md" | "lg";
  headingFont?: string;
  bodyFont?: string;
  textAlign?: "left" | "center";
};

const sizeClass = (value?: "sm" | "md" | "lg") => {
  if (value === "sm") return "text-sm";
  if (value === "lg") return "text-xl";
  return "text-base";
};

const imageSizeClass = (value?: "sm" | "md" | "lg") => {
  if (value === "sm") return "h-20 w-20";
  if (value === "lg") return "h-36 w-36";
  return "h-28 w-28";
};

const imageShapeClass = (value?: "square" | "rounded" | "circle") => {
  if (value === "circle") return "rounded-full";
  if (value === "square") return "rounded-none";
  return "rounded-xl";
};

const columnsClass = (value?: "2col" | "3col" | "4col") => {
  if (value === "2col") return "grid-cols-1 sm:grid-cols-2";
  if (value === "4col") return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
};

const densityGapClass = (value?: "compact" | "normal" | "spacious") => {
  if (value === "compact") return "gap-4";
  if (value === "spacious") return "gap-8";
  return "gap-6";
};

const cardStyleClass = (value?: "glass" | "solid" | "muted") => {
  if (value === "solid") return "border-border bg-card";
  if (value === "muted") return "border-border bg-muted/60";
  return "border-border bg-background/60";
};

export function CardsGridBlock({
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
  emphasis = "normal",
  title,
  subtitle,
  sectionCta,
  items,
  variant = "product",
  columns = "3col",
  density = "normal",
  cardStyle = "glass",
  imagePosition = "top",
  horizontalImageStyle = "thumb",
  imageSize = "md",
  imageShape = "rounded",
  headingSize = "md",
  bodySize = "md",
  headingFont,
  bodyFont,
  textAlign,
}: CardsGridProps) {
  const motionMode = useMotionMode();
  const reveal = useInViewReveal<HTMLDivElement>({
    preset: "stagger",
    once: true,
    enabled: motionMode !== "off",
  });
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
  const computedTextAlign = textAlign ?? align;
  const headingStyle = headingFont ? { fontFamily: headingFont } : undefined;
  const bodyStyle = bodyFont ? { fontFamily: bodyFont } : undefined;
  const imageClass = cn("object-cover", imageShapeClass(imageShape));
  const sectionCtaVariant =
    sectionCta?.variant === "secondary" ? "secondary" : sectionCta?.variant === "link" ? "link" : "default";

  return (
    <section
      id={anchor}
      data-block="CardsGrid"
      data-block-id={id}
      data-block-variant={variant}
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
      {overlayStyle ? (
        <div className="absolute inset-0" style={{ ...overlayStyle, zIndex: 1 }} />
      ) : null}
      <div
        className={cn(
          "mx-auto px-4 sm:px-6 relative z-10",
          maxWidthClass(maxWidth)
        )}
      >
        {title || subtitle ? (
          <div className={cn("mb-10", computedTextAlign === "center" ? "text-center" : "text-left")}>
            {title ? (
              <h2 className={cn("font-semibold tracking-tight", sizeClass(headingSize))} style={headingStyle}>
                {title}
              </h2>
            ) : null}
            {subtitle ? (
              <p className={cn("mt-3 text-muted-foreground", sizeClass(bodySize))} style={bodyStyle}>
                {subtitle}
              </p>
            ) : null}
            {sectionCta ? (
              <div
                className={cn(
                  "mt-6",
                  computedTextAlign === "center" ? "flex justify-center" : "flex justify-start"
                )}
              >
                <Button
                  asChild
                  size="lg"
                  variant={sectionCtaVariant}
                  className={cn(
                    sectionCtaVariant === "default"
                      ? "h-12 rounded-none px-10 text-[11px] font-semibold uppercase tracking-[0.14em]"
                      : ""
                  )}
                >
                  <a href={sectionCta.href}>{sectionCta.label}</a>
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}

        <div
          ref={reveal.ref}
          className={cn("grid", columnsClass(columns), densityGapClass(density))}
        >
          {items.slice(0, 12).map((item, idx) => {
            const resolvedImage =
              item.image?.src || item.imageSrc
                ? {
                    src: item.image?.src || item.imageSrc || "",
                    alt: item.image?.alt || item.imageAlt || item.title,
                  }
                : null;
            const hasImage = Boolean(resolvedImage?.src);
            const isHorizontal = imagePosition === "left" || imagePosition === "right";
            const useSplitHorizontal = Boolean(hasImage && isHorizontal && horizontalImageStyle === "split");
            return (
              <Card
                key={`${item.title}-${idx}`}
                className={cn(
                  cardStyleClass(cardStyle),
                  cardStyle === "glass" ? "card-glass" : "",
                  emphasis === "high" ? "hover-lift" : "",
                  useSplitHorizontal ? "overflow-hidden" : "",
                  reveal.className
                )}
                style={
                  reveal.style
                    ? { ...reveal.style, transitionDelay: `${idx * 60}ms` }
                    : undefined
                }
              >
                <div
                  className={cn(
                    useSplitHorizontal
                      ? "flex items-stretch"
                      : isHorizontal
                        ? "flex gap-4 p-4"
                        : ""
                  )}
                >
                  {hasImage ? (
                    <div
                      className={cn(
                        useSplitHorizontal ? "basis-1/2 shrink-0" : isHorizontal ? "shrink-0" : "",
                        imagePosition === "right" && "order-2"
                      )}
                    >
                      <img
                        src={resolvedImage?.src}
                        alt={resolvedImage?.alt || item.title}
                        className={cn(
                          useSplitHorizontal ? "h-full w-full object-cover" : imageClass,
                          useSplitHorizontal
                            ? ""
                            : isHorizontal
                              ? imageSizeClass(imageSize)
                              : "h-44 w-full",
                          variant === "poster" ? "h-52" : ""
                        )}
                      />
                    </div>
                  ) : null}
                  <div
                    className={cn(
                      isHorizontal ? "flex-1" : "",
                      useSplitHorizontal ? "p-6" : ""
                    )}
                  >
                    <CardHeader className={cn(isHorizontal ? (useSplitHorizontal ? "p-0 pb-2" : "px-0 pb-2") : "")}>
                      {item.tag ? (
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.tag}</p>
                      ) : null}
                      {item.eyebrow ? (
                        <p className="text-xs text-muted-foreground">{item.eyebrow}</p>
                      ) : null}
                      <CardTitle
                        className={cn(sizeClass(headingSize))}
                        style={headingStyle}
                      >
                        {item.title}
                      </CardTitle>
                      {item.subtitle ? (
                        <p className={cn("text-muted-foreground", sizeClass(bodySize))} style={bodyStyle}>
                          {item.subtitle}
                        </p>
                      ) : null}
                      {item.role ? (
                        <p className="text-xs text-muted-foreground">{item.role}</p>
                      ) : null}
                      {item.price ? (
                        <p className="text-base font-semibold">{item.price}</p>
                      ) : null}
                    </CardHeader>
                    {item.description ? (
                      <CardContent
                        className={cn(
                          useSplitHorizontal ? "px-0 pb-0" : isHorizontal ? "px-0" : ""
                        )}
                      >
                        <p className={cn("text-muted-foreground", sizeClass(bodySize))} style={bodyStyle}>
                          {item.description}
                        </p>
                        {item.meta ? (
                          <p className="mt-2 text-xs text-muted-foreground">{item.meta}</p>
                        ) : null}
                        {item.cta ? (
                          <a
                            href={item.cta.href}
                            className="mt-3 inline-block text-sm text-primary"
                          >
                            {item.cta.label}
                          </a>
                        ) : null}
                      </CardContent>
                    ) : null}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
