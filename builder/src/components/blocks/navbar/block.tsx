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

export type NavbarLink = {
  label: string;
  href: string;
  children?: NavbarLink[];
};

export type NavbarProps = BaseBlockProps & {
  logo?: { src?: string; alt?: string };
  links: NavbarLink[];
  ctas?: LinkProps[];
  sticky?: boolean;
  brand?: "default" | "pama";
  language?: { label: string; href?: string };
  showMenu?: boolean;
  menuHref?: string;
};

export type NavbarVariant = "simple" | "withDropdown" | "withCTA";

export function NavbarBlock({
  id,
  anchor,
  paddingY = "sm",
  background = "none",
  backgroundMedia,
  backgroundGradient,
  backgroundOverlay,
  backgroundOverlayOpacity,
  backgroundBlur,
  maxWidth = "xl",
  headingFont,
  bodyFont,
  logo,
  links,
  ctas,
  sticky,
  brand = "default",
  language,
  showMenu,
  menuHref,
  variant = "simple",
}: NavbarProps & { variant?: NavbarVariant }) {
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
  const rootLabel = (logo?.alt || "Site").trim() || "Site";
  const showCtas = (variant === "withCTA" || variant === "simple") && (ctas?.length ?? 0) > 0;
  const showDropdowns = variant === "withDropdown";
  const showRight = showCtas || Boolean(showMenu) || Boolean(language?.label);
  const headingStyle = headingFont ? { fontFamily: headingFont } : undefined;
  const bodyStyle = bodyFont ? { fontFamily: bodyFont } : undefined;
  const backgroundClass =
    background === "muted"
      ? "bg-muted"
      : background === "gradient"
        ? "bg-gradient-to-b from-background to-muted"
        : "bg-background";

  const isPama = brand === "pama";
  const linkClass = cn(
    "text-sm font-medium text-foreground hover-underline",
    isPama ? "text-xs font-semibold uppercase tracking-[0.16em]" : ""
  );
  const ctaClass = isPama
    ? "h-10 rounded-none px-6 text-xs font-semibold uppercase tracking-[0.14em]"
    : "";

  return (
    <header
      id={anchor}
      data-block="Navbar"
      data-block-id={id}
      data-block-variant={variant}
      className={cn(
        "w-full border-b border-border/60",
        backgroundClass,
        paddingY === "sm" ? "py-3" : paddingY === "md" ? "py-4" : "py-6",
        sticky ? "sticky top-0 z-40" : "",
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
          "mx-auto flex items-center justify-between px-4 sm:px-6",
          maxWidthClass(maxWidth),
          hasBackgroundVideo ? "relative z-10" : ""
        )}
      >
        <div className="flex items-center gap-3">
          {logo?.src ? (
            <img src={logo.src} alt={logo.alt || "Logo"} className="h-8 w-auto" />
          ) : (
            <div className="flex items-center gap-3">
              {isPama ? (
                <div className="flex flex-col leading-none">
                  <div className="inline-flex items-center justify-center rounded-sm border-2 border-foreground/70 px-3 py-2">
                    <span className="text-lg font-extrabold tracking-[0.14em]" style={headingStyle}>
                      {rootLabel}
                    </span>
                  </div>
                  <span className="mt-1 text-[10px] uppercase tracking-[0.12em] text-muted-foreground" style={bodyStyle}>
                    Member of the Nidec Corporation
                  </span>
                </div>
              ) : (
                <span className="text-base font-semibold" style={headingStyle}>
                  {rootLabel}
                </span>
              )}
            </div>
          )}
        </div>
        <nav className={cn("hidden md:flex items-center", isPama ? "gap-10" : "gap-6")} style={bodyStyle}>
          {links.slice(0, 8).map((link, index) => (
            <div key={index} className="flex flex-col">
              <a
                href={link.href}
                className={linkClass}
                style={bodyStyle}
              >
                {link.label}
              </a>
              {showDropdowns && link.children?.length ? (
                <div className="mt-2 flex flex-col text-xs text-muted-foreground" style={{ gap: "var(--space-1)" }}>
                  {link.children.slice(0, 6).map((child, childIndex) => (
                    <a
                      key={childIndex}
                      href={child.href}
                      className="text-xs text-muted-foreground"
                      style={bodyStyle}
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </nav>
        {showRight ? (
          <>
            <div className="hidden md:flex items-center gap-3" style={bodyStyle}>
              {showCtas
                ? ctas?.slice(0, 2).map((cta, idx) => (
                    <Button
                      key={idx}
                      asChild
                      variant={
                        isPama && idx === 0
                          ? "accent"
                          : cta.variant === "secondary"
                            ? "secondary"
                            : cta.variant === "link"
                              ? "link"
                              : "default"
                      }
                      size="sm"
                      className={cn(isPama && idx === 0 ? ctaClass : "")}
                    >
                      <a href={cta.href}>{cta.label}</a>
                    </Button>
                  ))
                : null}
              {showMenu ? (
                <a
                  href={menuHref || "#"}
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center",
                    isPama ? "text-primary" : "text-muted-foreground"
                  )}
                  aria-label="Menu"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </a>
              ) : null}
              {language?.label ? (
                <a
                  href={language.href || "#"}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 px-2 text-sm font-semibold",
                    isPama ? "uppercase tracking-[0.14em] text-foreground" : "text-muted-foreground"
                  )}
                  aria-label="Language"
                >
                  <span>{language.label}</span>
                  <span className={cn("text-xs", isPama ? "text-foreground/70" : "text-muted-foreground")}>▾</span>
                </a>
              ) : null}
            </div>
            <div className="flex md:hidden items-center gap-3" style={bodyStyle}>
              {showMenu ? (
                <a
                  href={menuHref || "#"}
                  className={cn(
                    "inline-flex h-10 w-10 items-center justify-center",
                    isPama ? "text-primary" : "text-muted-foreground"
                  )}
                  aria-label="Menu"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <path d="M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                </a>
              ) : null}
              {language?.label ? (
                <a
                  href={language.href || "#"}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 px-2 text-sm font-semibold",
                    isPama ? "uppercase tracking-[0.14em] text-foreground" : "text-muted-foreground"
                  )}
                  aria-label="Language"
                >
                  <span>{language.label}</span>
                  <span className={cn("text-xs", isPama ? "text-foreground/70" : "text-muted-foreground")}>▾</span>
                </a>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </header>
  );
}
