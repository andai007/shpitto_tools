"use client";

import React from "react";
import { cn } from "@/lib/cn";

export type CookieBannerProps = {
  id?: string;
  anchor?: string;
  message: string;
  acceptLabel?: string | null;
  closeLabel?: string;
};

export function CookieBannerBlock({
  id,
  anchor,
  message,
  acceptLabel = "OK",
  closeLabel = "×",
}: CookieBannerProps) {
  const [open, setOpen] = React.useState(true);
  if (!open) return null;

  const showAccept = Boolean(acceptLabel && String(acceptLabel).trim());

  return (
    <section
      id={anchor}
      data-block="CookieBanner"
      data-block-id={id}
      className={cn(
        "fixed inset-x-0 bottom-4 z-50",
        "px-4 sm:px-6"
      )}
      aria-label="Cookie banner"
    >
      <div className="mx-auto max-w-5xl rounded-md border border-border bg-background/95 shadow-lg backdrop-blur">
        <div className="flex items-start gap-4 px-4 py-3">
          <p className="text-[11px] leading-5 text-muted-foreground sm:text-xs">{message}</p>
          <div className="ml-auto flex items-center gap-2">
            {showAccept ? (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-9 rounded-none bg-primary px-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary-foreground hover:bg-primary/90"
              >
                {String(acceptLabel)}
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-none border border-border bg-background text-foreground hover:bg-muted"
              aria-label="Close"
            >
              {closeLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
