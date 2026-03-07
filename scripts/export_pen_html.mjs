import fs from 'fs';

const inputPath = process.argv[2] || '/Users/andai007/Desktop/fpt218-homepage-2.pen';
const outputPath = process.argv[3] || '/Users/andai007/Desktop/shpitto_tools-main/fpt218-homepage-2.html';

const pen = JSON.parse(fs.readFileSync(inputPath, 'utf8'));

const camelToKebab = (s) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

function escHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toCssUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url) || /^file:\/\//i.test(url) || /^data:/i.test(url)) return url;
  if (url.startsWith('/')) return `file://${url}`;
  return url;
}

function styleObjToString(obj) {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${camelToKebab(k)}:${v}`)
    .join(';');
}

function baseNodeStyle(node, isRoot = false) {
  const style = {
    position: isRoot ? 'relative' : 'absolute',
    left: isRoot ? undefined : `${node.x ?? 0}px`,
    top: isRoot ? undefined : `${node.y ?? 0}px`,
    width: node.width != null ? `${node.width}px` : undefined,
    height: node.height != null ? `${node.height}px` : undefined,
    boxSizing: 'border-box',
  };

  if (typeof node.fill === 'string') {
    style.background = node.fill;
  } else if (node.fill && typeof node.fill === 'object' && node.fill.type === 'image' && node.fill.enabled !== false) {
    const imgUrl = toCssUrl(node.fill.url);
    style.backgroundImage = `url('${imgUrl}')`;
    style.backgroundPosition = 'center';
    style.backgroundRepeat = 'no-repeat';
    if (node.fill.mode === 'fit') style.backgroundSize = 'contain';
    else if (node.fill.mode === 'stretch') style.backgroundSize = '100% 100%';
    else style.backgroundSize = 'cover';
  }

  if (node.cornerRadius != null) style.borderRadius = `${node.cornerRadius}px`;

  if (node.stroke && typeof node.stroke === 'object') {
    const th = node.stroke.thickness ?? 1;
    const col = node.stroke.fill ?? '#000000';
    style.border = `${th}px solid ${col}`;
  }

  return style;
}

function renderNode(node, isRoot = false) {
  const t = node.type;

  if (t === 'frame') {
    const style = baseNodeStyle(node, isRoot);
    style.overflow = 'visible';
    const children = (node.children || []).map((child) => renderNode(child, false)).join('\n');
    return `<div data-id="${escHtml(node.id || '')}" style="${styleObjToString(style)}">${children}</div>`;
  }

  if (t === 'rectangle') {
    const style = baseNodeStyle(node, false);
    return `<div data-id="${escHtml(node.id || '')}" style="${styleObjToString(style)}"></div>`;
  }

  if (t === 'ellipse') {
    const style = baseNodeStyle(node, false);
    style.borderRadius = '9999px';
    return `<div data-id="${escHtml(node.id || '')}" style="${styleObjToString(style)}"></div>`;
  }

  if (t === 'path') {
    const style = {
      position: 'absolute',
      left: `${node.x ?? 0}px`,
      top: `${node.y ?? 0}px`,
      width: `${node.width ?? 0}px`,
      height: `${node.height ?? 0}px`,
      overflow: 'visible',
    };
    const fill = node.fill || 'currentColor';
    const stroke = node.stroke?.fill;
    const strokeW = node.stroke?.thickness ?? 1;
    const svg = `<svg width="${node.width ?? 0}" height="${node.height ?? 0}" viewBox="0 0 ${node.width ?? 0} ${node.height ?? 0}" xmlns="http://www.w3.org/2000/svg"><path d="${escHtml(node.geometry || '')}" fill="${escHtml(fill)}"${stroke ? ` stroke="${escHtml(stroke)}" stroke-width="${strokeW}"` : ''}/></svg>`;
    return `<div data-id="${escHtml(node.id || '')}" style="${styleObjToString(style)}">${svg}</div>`;
  }

  if (t === 'text') {
    const style = {
      position: 'absolute',
      left: `${node.x ?? 0}px`,
      top: `${node.y ?? 0}px`,
      width: node.width != null ? `${node.width}px` : undefined,
      height: node.height != null ? `${node.height}px` : undefined,
      color: node.fill || '#111',
      fontFamily: `'${node.fontFamily || 'Heebo'}', sans-serif`,
      fontSize: node.fontSize != null ? `${node.fontSize}px` : undefined,
      fontWeight: node.fontWeight != null ? String(node.fontWeight) : undefined,
      lineHeight: '1.35',
      whiteSpace: 'pre-line',
      boxSizing: 'border-box',
    };

    if (node.textAlign) style.textAlign = node.textAlign;
    if (node.textAlignVertical === 'middle') {
      style.display = 'flex';
      style.alignItems = 'center';
      if (node.textAlign === 'center') style.justifyContent = 'center';
    }

    return `<div data-id="${escHtml(node.id || '')}" style="${styleObjToString(style)}">${escHtml(node.content || '')}</div>`;
  }

  return '';
}

function collectNodeIndex(node, offsetX = 0, offsetY = 0, index = new Map()) {
  const x = (node.x ?? 0) + offsetX;
  const y = (node.y ?? 0) + offsetY;
  index.set(node.id, { node, x, y });
  if (Array.isArray(node.children)) {
    for (const child of node.children) collectNodeIndex(child, x, y, index);
  }
  return index;
}

function estimateTextBox(node) {
  const fontSize = Number(node.fontSize || 14);
  const lines = String(node.content || '').split('\n');
  const maxChars = lines.reduce((m, l) => Math.max(m, l.length), 1);
  const width = Math.max(24, Math.round(maxChars * fontSize * 0.58));
  const height = Math.max(16, Math.round(lines.length * fontSize * 1.35));
  return { width, height };
}

function getRect(entry) {
  if (!entry) return null;
  const n = entry.node;
  let width = n.width;
  let height = n.height;
  if ((width == null || height == null) && n.type === 'text') {
    const est = estimateTextBox(n);
    if (width == null) width = est.width;
    if (height == null) height = est.height;
  }
  if (width == null || height == null) return null;
  return { x: entry.x, y: entry.y, width, height };
}

function renderClickOverlays(index) {
  const links = [
    { id: 'nav-1', href: 'https://www.fptindustrie.com/zhs/企业/', hover: 'nav', padX: 12, padY: 6 },
    { id: 'nav-2', href: 'https://www.fptindustrie.com/zhs/产品/', hover: 'nav', padX: 12, padY: 6 },
    { id: 'nav-3', href: 'https://www.fptindustrie.com/zhs/行业/', hover: 'nav', padX: 12, padY: 6 },
    { id: 'nav-4', href: 'https://www.fptindustrie.com/zhs/技术/', hover: 'nav', padX: 12, padY: 6 },
    { id: 'nav-5', href: 'https://www.fptindustrie.com/zhs/fpt-world', hover: 'nav', padX: 12, padY: 6 },
    { id: 'nav-6', href: 'https://www.fptindustrie.com/zhs/消息/', hover: 'nav', padX: 12, padY: 6 },
    { id: 'nav-7', href: 'https://www.fptindustrie.com/zhs/contacts', hover: 'nav', padX: 12, padY: 6 },
    { id: '9pVon', href: 'https://www.fptindustrie.com/eng/news/news/warcom-and-fpt-a-legacy-of-innovation-and-shared-quality', hover: 'button' },
    { id: 'xTKoJ', href: 'https://www.fptindustrie.com/zhs/企业/italian-style', hover: 'card' },
    { id: 'xP2Uu', href: 'https://www.fptindustrie.com/zhs/企业/', hover: 'card' },
    { id: 'SM5zE', href: 'https://www.fptindustrie.com/zhs/企业/', hover: 'card' },
    { id: 'i5Wgs', href: 'https://www.fptindustrie.com/zhs/消息/exhibitions/fpt-at-mecspe-2026', hover: 'card' },
    { id: 'NpfLP', href: 'https://www.fptindustrie.com/zhs/消息/news/', hover: 'card' },
    { id: 'ZkWPR', href: 'https://www.fptindustrie.com/zhs/消息/exhibitions/', hover: 'card' },
    { id: 'BPc6Q', href: 'https://www.fptindustrie.com/zhs/消息/news/warcom-and-fpt-a-legacy-of-innovation-and-shared-quality', hover: 'card' },
    { id: 'sdhfd', href: 'https://www.fptindustrie.com/zhs/消息/', hover: 'button' },
    { id: 'CGIEg', href: 'https://www.fptindustrie.com/zhs/fpt-world', hover: 'button' },
    { id: 'f38Un', href: 'https://g.page/fptindustrie?share', hover: 'text', padX: 4, padY: 2 },
    { id: 'y1WhD', href: 'https://www.facebook.com/fptindustrie/', hover: 'social' },
    { id: 'KudmN', href: 'https://linkedin.com/company/fptindustriespa', hover: 'social' },
    { id: 'mrMUa', href: 'https://www.youtube.com/c/FPTIndustrieSpA', hover: 'social' },
    { id: 'V59wB', href: 'https://www.instagram.com/fptindustrie/', hover: 'social' },
  ];

  const parts = [];
  for (const link of links) {
    const entry = index.get(link.id);
    const rect = getRect(entry);
    if (!rect) continue;
    const padX = Number(link.padX || 0);
    const padY = Number(link.padY || 0);
    const x = rect.x - padX;
    const y = rect.y - padY;
    const width = rect.width + padX * 2;
    const height = rect.height + padY * 2;
    const external = /^https?:\/\//i.test(link.href);
    const style = styleObjToString({
      position: 'absolute',
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
      zIndex: 9999,
      cursor: 'pointer',
      textDecoration: 'none',
      background: 'transparent',
    });
    parts.push(
      `<a data-link-id="${escHtml(link.id)}" data-target-id="${escHtml(link.id)}" data-hover="${escHtml(link.hover || 'text')}" href="${escHtml(link.href)}" ${external ? 'target="_blank" rel="noopener"' : ''} style="${style}" aria-label="${escHtml(link.id)}"></a>`
    );
  }
  return parts.join('\n');
}

const rootFrame = (pen.children || []).find((n) => n.id === 'fpt-home') || (pen.children || [])[0];
if (!rootFrame) throw new Error('No root frame found');
const nodeIndex = collectNodeIndex(rootFrame);

const html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FPT218 Homepage</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #111; }
    body { font-family: 'Heebo', sans-serif; }
    .page-wrap { width: ${rootFrame.width ?? 1440}px; margin: 0 auto; position: relative; }
    [data-link-id] {
      display: block;
      border: 1px solid transparent;
      border-radius: 6px;
      overflow: hidden;
      isolation: isolate;
      transition: border-color .2s ease, box-shadow .2s ease;
    }
    [data-link-id]::before {
      content: '';
      position: absolute;
      inset: 0;
      background: #f5c400;
      transform: scaleX(0);
      transform-origin: left center;
      transition: transform .28s cubic-bezier(.22,.61,.36,1), opacity .2s ease;
      pointer-events: none;
      z-index: 1;
      opacity: 0;
    }
    [data-link-id]:hover::before,
    [data-link-id]:focus-visible::before {
      transform: scaleX(1);
    }
    [data-link-id][data-hover='nav']::before,
    [data-link-id][data-hover='button']::before {
      opacity: .9;
    }
    [data-link-id][data-hover='nav']::before {
      opacity: 0;
    }
    [data-link-id][data-hover='card']::before {
      opacity: .22;
    }
    [data-link-id][data-hover='text']::before {
      opacity: .5;
    }
    [data-link-id][data-hover='social'] {
      border-radius: 999px;
    }
    [data-link-id][data-hover='social']::before {
      opacity: .88;
      border-radius: 999px;
    }
    [data-link-id]:hover,
    [data-link-id]:focus-visible {
      border-color: rgba(245,196,0,.7);
      box-shadow: 0 0 0 1px rgba(245,196,0,.35);
      outline: none;
    }
    [data-link-id][data-hover='button'] {
      border-radius: 999px;
    }
    [data-link-id][data-hover='nav']:hover,
    [data-link-id][data-hover='nav']:focus-visible {
      border-color: transparent;
      box-shadow: none;
    }
    [data-id].nav-text-fill {
      color: transparent !important;
      -webkit-text-fill-color: transparent;
      background-image: linear-gradient(90deg, #f5c400 0 50%, #ffffff 50% 100%);
      background-size: 200% 100%;
      background-position: 100% 0;
      -webkit-background-clip: text;
      background-clip: text;
      transition: background-position .28s cubic-bezier(.22,.61,.36,1);
      will-change: background-position;
    }
    [data-id].nav-text-fill.is-hover-target {
      background-position: 0 0;
    }
  </style>
</head>
<body>
  <main class="page-wrap">
    ${renderNode(rootFrame, true)}
    ${renderClickOverlays(nodeIndex)}
  </main>
  <script>
    (function () {
      const links = document.querySelectorAll('[data-link-id]');
      links.forEach((link) => {
        const targetId = link.getAttribute('data-target-id');
        const hover = link.getAttribute('data-hover') || 'text';
        const target = targetId ? document.querySelector('[data-id=\"' + targetId + '\"]') : null;
        if (!target) return;
        if (hover === 'nav') target.classList.add('nav-text-fill');
        const on = function () { target.classList.add('is-hover-target'); };
        const off = function () { target.classList.remove('is-hover-target'); };
        link.addEventListener('mouseenter', on);
        link.addEventListener('mouseleave', off);
        link.addEventListener('focus', on);
        link.addEventListener('blur', off);
      });
    })();
  </script>
</body>
</html>`;

fs.writeFileSync(outputPath, html, 'utf8');
console.log(`Exported: ${outputPath}`);
