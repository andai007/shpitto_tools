# Website Clone Playbook

## Scope

This playbook summarizes the cloning workflow validated on:

- `fptindustrie.com`
- `breton.it`
- `carbon3d.com`
- `pagani.com`

It is designed for local-first, high-fidelity cloning work where the result must remain clickable and maintainable.

## Principle

Clone the experience, not just the pixels.

That means:

- correct section order
- usable navigation
- local page-to-page linking
- visual rhythm close to the original
- a predictable iteration loop

## Working modes by site type

### 1. Structured marketing site

Examples:

- FPT
- Breton

Recommended approach:

- rebuild in semantic HTML
- keep official assets when legally and technically acceptable
- centralize shared header and footer patterns
- use explicit anchors and overlays for clickable zones

Why:

- these sites are easier to reproduce cleanly than to mirror blindly
- static rebuilds are faster to maintain

### 2. Runtime-heavy marketing site

Examples:

- Carbon
- Pagani

Recommended approach:

- capture source structure first
- test whether raw mirrored HTML can run locally
- if loader or hydration breaks local preview, rebuild the shell and freeze subpages with Playwright

Why:

- direct mirror often fails because of scripts, loaders, cookies, lazy assets, and runtime dependencies

## Proven workflow

### Phase 1. Capture

- save the current source HTML
- save reference screenshots
- identify top-level section order
- identify secondary and tertiary page URLs

Deliverables:

- source capture HTML
- URL manifest
- baseline screenshots

### Phase 2. Lock structure

Before visual refinement, freeze:

- hero
- major section order
- nav entry points
- footer structure

This avoids a common failure mode: correct styling on the wrong page logic.

### Phase 3. Rebuild interaction

Priority order:

1. header and menu
2. section-to-section navigation
3. local page links
4. footer links
5. hover and active states

Rules:

- do not ship image slices as navigation
- prefer semantic `<a>` and `<button>`
- keep local links explicit

### Phase 4. Freeze secondary and tertiary pages

For runtime-heavy sites:

- use Playwright to render final DOM
- remove cookie overlays and blocking runtime shells
- rewrite internal links to local files
- keep a stable local homepage target

This is the validated strategy behind the Pagani subpage exporter.

### Phase 5. Visual tightening

After structure works:

- correct spacing rhythm
- align section pacing
- match typography hierarchy
- match site-specific VI markers

Examples of VI markers:

- Pagani: black field, diagonal micro-texture, restrained lines, editorial composition
- Breton: magenta accents, boxed cards, clear industrial catalog rhythm
- Carbon: dark-purple product storytelling, modular cards, soft glow hierarchy

## Common failure patterns

### Failure: section order is wrong

Symptom:

- the page looks similar but feels wrong immediately

Fix:

- compare top-level section sequence with source before any polish work

### Failure: menu is visually present but behavior is wrong

Symptom:

- looks close in screenshots, fails in use

Fix:

- rebuild menu logic with local links
- verify hover, active, and return-path states

### Failure: local preview opens but subpages jump back to the real site

Fix:

- rewrite internal absolute URLs to local HTML names
- keep one consistent homepage target such as `index.html`

### Failure: mirrored page loads only a spinner or blank shell

Fix:

- stop trying to use raw mirrored HTML
- rebuild the page shell locally
- freeze DOM from browser-rendered output if needed

## Reusable scripts in this repo

### `scripts/export_pen_html.mjs`

Use when:

- the source is a `.pen` file
- you need a quick interactive HTML export

It converts positioned nodes into local semantic-ish HTML and supports explicit clickable overlays.

### `scripts/build-pagani-subpages.mjs`

Use when:

- a site has many secondary and tertiary pages
- runtime scripts make raw mirroring unreliable

What it does:

- opens each URL in Playwright
- dismisses cookie dialogs
- resolves lazy assets
- strips blocking overlays and scripts
- rewrites internal links to local HTML files
- writes a local manifest

## Validation checklist

Every delivery pass should check:

- section order is correct
- header and menu are clickable
- footer is complete
- local links do not jump to the live site unintentionally
- desktop layout works at `1440`
- mobile layout works at `390`
- no horizontal overflow
- screenshots of key sections match the source hierarchy

## What should be committed

Commit:

- playbooks
- manifests
- reusable scripts
- minimal preview wiring if needed

Do not commit by default:

- huge screenshot dumps
- temporary source captures unless required
- bulky generated page exports unless the repo explicitly stores them

## Recommended GitHub presentation

If the goal is to preserve the experience in GitHub, keep the repository entry points simple:

- root `README.md`
- one general playbook
- site-specific notes only when they add real tactics
- runnable scripts exposed through `package.json`
