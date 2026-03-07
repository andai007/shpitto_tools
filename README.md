# Website Clone Playbooks

This repository includes a practical workflow for high-fidelity website cloning work.

The goal is not "save page as HTML". The goal is:

- preserve section order
- preserve clickable navigation
- keep local preview stable
- support secondary and tertiary pages
- make iteration repeatable

## What is documented

- General workflow: `docs/website-clone-playbook.md`
- FPT218 clone notes: `docs/fpt218-clone-playbook.md`
- Breton clone notes: `docs/breton-clone-experience.md`

## Reusable scripts

- Export `.pen` to local HTML:
  - `scripts/export_pen_html.mjs`
- Freeze Pagani secondary and tertiary pages into local static HTML:
  - `scripts/build-pagani-subpages.mjs`

## NPM commands

```bash
npm run export:pen -- /absolute/path/input.pen /absolute/path/output.html
npm run clone:pagani:subpages
```

## Core lessons

1. First lock section order, then refine visuals.
2. Do not rely on raw mirrored HTML if the site depends on loaders or runtime hydration.
3. Keep local link rewriting explicit and testable.
4. Reuse live media URLs when speed matters, but rebuild interaction in semantic HTML.
5. Validate every major pass with desktop and mobile screenshots.

## Recommended validation

- desktop: 1440 width
- tablet: 768 width
- mobile: 320 or 390 width
- check navigation
- check footer completeness
- check no horizontal overflow
- check section order against source
