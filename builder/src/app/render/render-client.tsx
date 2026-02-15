"use client";

import { Render } from "@measured/puck";

import { puckConfig } from "@/puck/config";
import { MotionProvider, type MotionMode } from "@/components/theme/motion";
import { normalizePuckData } from "@/lib/design-system-enforcer";

type PuckZoneItem = { type?: string; props?: Record<string, unknown> };

type PuckData = {
  content: Array<{ type: string; props: Record<string, unknown>; variant?: string; slots?: Record<string, string> }>;
  root?: {
    props?: {
      title?: string;
      theme?: { motion?: string };
      branding?: {
        colors?: {
          background?: string;
          foreground?: string;
          primary?: string;
          primary_foreground?: string;
          secondary?: string;
          secondary_foreground?: string;
          muted?: string;
          muted_foreground?: string;
          border?: string;
        };
        typography?: { body?: string; heading?: string };
        radius?: string;
      };
    };
  };
  zones?: Record<string, PuckZoneItem[]>;
  meta?: { font_links?: string[] };
};

type RenderClientProps = {
  data: PuckData;
  motionMode: MotionMode;
  themeCss?: string;
  fontLinks?: string[];
  fontCss?: string;
};

export function RenderClient({ data, motionMode, themeCss, fontLinks, fontCss }: RenderClientProps) {
  const normalizedData = normalizePuckData(data, { logChanges: true });
  const uniqueFonts = Array.isArray(fontLinks)
    ? Array.from(new Set(fontLinks.filter((link) => typeof link === "string" && link.length)))
    : [];
  return (
    <MotionProvider mode={motionMode}>
      {uniqueFonts.map((link) => (
        <link key={link} rel="stylesheet" href={link} />
      ))}
      {fontCss ? <style dangerouslySetInnerHTML={{ __html: fontCss }} /> : null}
      {themeCss ? <style dangerouslySetInnerHTML={{ __html: themeCss }} /> : null}
      {process.env.NODE_ENV === "development" ? (
        // Hide Next.js dev overlay portal so template previews look like production.
        <style dangerouslySetInnerHTML={{ __html: "nextjs-portal{display:none!important;}" }} />
      ) : null}
      <main>
        <Render config={puckConfig} data={normalizedData as any} />
      </main>
    </MotionProvider>
  );
}
