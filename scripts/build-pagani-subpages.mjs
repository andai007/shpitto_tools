import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = "/Users/andai007/Desktop/shpitto_tools-main";
const OUT_DIR = path.join(ROOT, "pagani-pages");
const URLS = [
  "https://www.pagani.com/history/",
  "https://www.pagani.com/zonda-c12/",
  "https://www.pagani.com/zonda-s/",
  "https://www.pagani.com/zonda-roadster/",
  "https://www.pagani.com/zonda-f/",
  "https://www.pagani.com/zonda-roadster-f/",
  "https://www.pagani.com/zonda-cinque/",
  "https://www.pagani.com/zonda-cinque-roadster/",
  "https://www.pagani.com/zonda-tricolore/",
  "https://www.pagani.com/zonda-r/",
  "https://www.pagani.com/zonda-revolucion/",
  "https://www.pagani.com/huayra/",
  "https://www.pagani.com/huayra-bc/",
  "https://www.pagani.com/huayra-roadster/",
  "https://www.pagani.com/huayra-roadster-bc/",
  "https://www.pagani.com/huayra-r/",
  "https://www.pagani.com/huayra-r-evo-roadster/",
  "https://www.pagani.com/pagani-utopia/",
  "https://www.pagani.com/utopia-roadster/",
  "https://www.pagani.com/zonda-hp-barchetta/",
  "https://www.pagani.com/pagani-imola/",
  "https://www.pagani.com/huayra-tricolore/",
  "https://www.pagani.com/huayra-codalunga/",
  "https://www.pagani.com/imola-roadster/",
  "https://www.pagani.com/huayra-codalunga-speedster/",
  "https://www.pagani.com/dealers/",
  "https://www.pagani.com/arte-in-pista/",
  "https://www.pagani.com/pagani-puro/",
  "https://www.pagani.com/pagani-rinascimento/",
  "https://www.pagani.com/pagani-unico/",
  "https://www.pagani.com/horacio-pagani-museo-and-pagani-atelier/",
  "https://www.pagani.com/guided-tours/",
  "https://www.pagani.com/pagani-vip-experience/",
  "https://www.pagani.com/contact-us/",
  "https://www.pagani.com/it/lavora-con-noi/",
  "https://www.pagani.com/press/",
  "https://www.pagani.com/press/utopia-roadster",
  "https://www.pagani.com/calendario-pagani-2021/",
  "https://www.pagani.com/calendario-pagani-2022/",
  "https://www.pagani.com/calendario-pagani-2023/",
  "https://www.pagani.com/calendario-pagani-2024/",
  "https://www.pagani.com/privacy-notice/",
  "https://www.pagani.com/whistleblowing/",
];

function toLocalName(url) {
  const parsed = new URL(url);
  const parts = parsed.pathname.split("/").filter(Boolean);
  return `${parts.join("-") || "index"}.html`;
}

const localMap = new Map(
  URLS.map((url) => [url.replace(/\/$/, ""), toLocalName(url)])
);
localMap.set("https://www.pagani.com", "index.html");
localMap.set("https://www.pagani.com/", "index.html");

function rewriteHtml(html) {
  let next = html;
  next = next.replace(/<base[^>]*>/gi, "");
  next = next.replace(/<head([^>]*)>/i, '<head$1>\n<base href="__PAGANI_BASE__">');

  for (const [remote, local] of localMap.entries()) {
    const escaped = remote.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    next = next.replace(new RegExp(`(["'])${escaped}/?(["'])`, "g"), `$1${local}$2`);
  }

  next = next.replace(
    /(href|src|poster|action)=(")\/(?!\/)/g,
    '$1=$2https://www.pagani.com/'
  );
  next = next.replace(
    /(href|src|poster|action)=(')\/(?!\/)/g,
    "$1=$2https://www.pagani.com/"
  );
  next = next.replace(/url\((['"]?)\/(?!\/)/g, "url($1https://www.pagani.com/");
  next = next.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  next = next.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, "");
  next = next.replace(/__PAGANI_BASE__/g, "https://www.pagani.com/");
  return next;
}

async function saveManifest() {
  const lines = URLS.map((url) => `${toLocalName(url)} ${url}`);
  await fs.writeFile(path.join(ROOT, "pagani-page-paths.txt"), lines.join("\n") + "\n", "utf8");
}

async function dismissCookie(page) {
  const labels = [
    "Use necessary cookies only",
    "Allow all cookies",
    "Accept",
    "Accept all",
  ];
  for (const label of labels) {
    const button = page.getByRole("button", { name: label }).first();
    try {
      if (await button.isVisible({ timeout: 1200 })) {
        await button.click({ timeout: 1200 });
        await page.waitForTimeout(400);
        return;
      }
    } catch {}
  }
}

async function freezePage(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForTimeout(1200);
  await dismissCookie(page);
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1200);

  await page.evaluate(() => {
    const overlays = [
      "#CybotCookiebotDialog",
      ".CybotCookiebotDialog",
      ".cookiebot-widget",
      ".block__video-overlay-bg",
      ".touch-scroller",
      ".video-overlay",
    ];
    overlays.forEach((selector) => {
      document.querySelectorAll(selector).forEach((node) => node.remove());
    });

    document.querySelectorAll("img[data-src]").forEach((img) => {
      if (!img.getAttribute("src")) img.setAttribute("src", img.getAttribute("data-src"));
    });
    document.querySelectorAll("img[data-src-desktop]").forEach((img) => {
      if (!img.getAttribute("src")) img.setAttribute("src", img.getAttribute("data-src-desktop"));
    });
    document.querySelectorAll("source[data-src]").forEach((source) => {
      if (!source.getAttribute("src")) source.setAttribute("src", source.getAttribute("data-src"));
    });

    const style = document.createElement("style");
    style.setAttribute("data-local-clone", "true");
    style.textContent = `
      .menu,
      .menu__search,
      .touch-scroller,
      .block__video-overlay-bg,
      .video-overlay,
      .CybotCookiebotDialog,
      #CybotCookiebotDialog {
        display: none !important;
      }
      html, body {
        background: #000 !important;
      }
    `;
    document.head.appendChild(style);
  });

  const html = await page.content();
  const filePath = path.join(OUT_DIR, toLocalName(url));
  await fs.writeFile(filePath, rewriteHtml(html), "utf8");
}

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true });
  await saveManifest();
  await fs.copyFile(
    path.join(ROOT, "pagani-homepage.html"),
    path.join(OUT_DIR, "pagani-homepage.html")
  );
  await fs.copyFile(
    path.join(ROOT, "pagani-homepage.html"),
    path.join(OUT_DIR, "index.html")
  );

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "en-US",
  });

  for (const url of URLS) {
    const page = await context.newPage();
    console.log(`Fetching ${url}`);
    try {
      await freezePage(page, url);
    } finally {
      await page.close();
    }
  }

  await context.close();
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
