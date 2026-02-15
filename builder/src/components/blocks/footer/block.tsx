"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { footerClass } from "./variants";
import { useMotionMode } from "@/components/theme/motion";
import {
  BaseBlockProps,
  backgroundMediaStyle,
  backgroundVideoSource,
  backgroundOverlayStyle,
  backgroundGradientStyle,
  maxWidthClass,
} from "@/components/blocks/shared";

export type FooterLink = { label: string; href: string; variant?: "primary" | "secondary" | "link" };
export type FooterColumn = { title: string; links: FooterLink[] };

export type FooterProps = BaseBlockProps & {
  logo?: { src: string; alt: string };
  logoText?: string;
  columns: FooterColumn[];
  socials?: { type: "x" | "github" | "linkedin" | "youtube" | "facebook" | "instagram"; href: string }[];
  legal?: string;
  contentTone?: "default" | "light";
};

export type FooterVariant = "simple" | "multiColumn";

export function FooterBlock({
  id,
  anchor,
  paddingY = "md",
  background = "none",
  backgroundMedia,
  backgroundGradient,
  backgroundOverlay,
  backgroundOverlayOpacity,
  backgroundBlur,
  maxWidth = "xl",
  emphasis = "normal",
  logo,
  logoText,
  columns,
  socials,
  legal,
  contentTone = "default",
  headingFont,
  bodyFont,
  variant = "multiColumn",
}: FooterProps & { variant?: FooterVariant }) {
  const motionMode = useMotionMode();
  const isLightTone = contentTone === "light";
  const linkClass =
    motionMode === "off"
      ? ""
      : cn(
          "transition-colors duration-300",
          isLightTone ? "hover:text-white" : "hover:text-foreground"
        );
  const emphasisClass = emphasis === "high" ? "hover-underline" : "";
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
  const headingStyle = headingFont ? { fontFamily: headingFont } : undefined;
  const bodyStyle = bodyFont ? { fontFamily: bodyFont } : undefined;
  return (
    <footer
      id={anchor}
      data-block="Footer"
      data-block-id={id}
      data-block-variant={variant}
      className={cn(
        footerClass({ paddingY, background }),
        isLightTone ? "text-white" : "",
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
        <div
          className={cn("grid", variant === "simple" ? "md:grid-cols-2" : "md:grid-cols-12")}
          style={{ gap: "var(--space-4)" }}
        >
          <div className={cn(variant === "simple" ? "" : "md:col-span-4")}>
            {logo ? (
              <img src={logo.src} alt={logo.alt} className="h-8 w-auto" />
            ) : (
              <div className="text-base font-semibold" style={headingStyle}>
                {logoText?.trim() || "Company"}
              </div>
            )}
            {socials?.length ? (
              <div
                className={cn(
                  "mt-4 flex flex-wrap text-sm",
                  isLightTone ? "text-white/75" : "text-muted-foreground"
                )}
                style={{ gap: "var(--space-2)", ...bodyStyle }}
              >
                {socials.slice(0, 6).map((s, i) => (
                  <a
                    key={i}
                    href={s.href}
                    className={cn(
                      "text-sm",
                      isLightTone ? "text-white/75" : "text-muted-foreground",
                      linkClass,
                      emphasisClass
                    )}
                    style={bodyStyle}
                  >
                    {labelForSocial(s.type)}
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <div
            className={cn(
              "grid",
              variant === "simple" ? "sm:grid-cols-2" : "sm:grid-cols-2 md:col-span-8 md:grid-cols-3"
            )}
            style={{ gap: "var(--space-3)" }}
          >
            {columns.slice(0, 5).map((col, idx) => (
              <div key={idx}>
                <div className="text-sm font-medium" style={headingStyle}>
                  {col.title}
                </div>
                <ul
                  className={cn(
                    "mt-4 space-y-2 text-sm",
                    isLightTone ? "text-white/75" : "text-muted-foreground"
                  )}
                  style={bodyStyle}
                >
                  {col.links.slice(0, 10).map((l, j) => (
                    <li key={j}>
                      <a
                        href={l.href}
                        className={cn(
                          "text-sm",
                          isLightTone ? "text-white/75" : "text-muted-foreground",
                          linkClass,
                          emphasisClass
                        )}
                        style={bodyStyle}
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div
          className={cn(
            "mt-10 border-t pt-6 text-xs",
            isLightTone ? "border-white/20 text-white/70" : "border-border text-muted-foreground"
          )}
          style={bodyStyle}
        >
          {legal ?? `© ${new Date().getFullYear()} All rights reserved.`}
        </div>
      </div>
    </footer>
  );
}

function labelForSocial(t: FooterProps["socials"][number]["type"]) {
  if (t === "x") return "X";
  if (t === "github") return "GitHub";
  if (t === "linkedin") return "LinkedIn";
  if (t === "youtube") return "YouTube";
  if (t === "facebook") return "Facebook";
  return "Instagram";
}
