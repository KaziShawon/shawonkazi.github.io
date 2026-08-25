# shawonkazi.github.io

Personal portfolio site for a Senior Data Scientist. Built with a **zero-dependency** static
site generator — plain Node.js only, no `npm install`, no framework, no build tool. See
[`PLAN.md`](./PLAN.md) for the full design rationale.

## Prerequisites

- Node.js 18+ (nothing else — no `npm install` is ever required)

## Local development

Start the dev server, which rebuilds the site on every request so edits show up on refresh:

```
node tools/serve.mjs
```

Then open http://localhost:4321. Pass a different port as an argument:
`node tools/serve.mjs 3000`.

## Build

```
node tools/build.mjs
```

Generates the full static site into `dist/` (gitignored). This is also what CI runs before
deploying.

## Check for outstanding placeholders

Every piece of content still needing your real input is marked `PLACEHOLDER`. List them all:

```
node tools/build.mjs --check
```

## Project structure

- `content/` — **everything you edit**: `site.json` (name, links, résumé path), `about.md`,
  `skills.json`, `experience.json`, and `content/projects/*.md` (one file per project).
- `assets/` — static files copied verbatim: `styles.css`, `main.js`, `favicon.svg`, `resume.pdf`,
  and `images/`.
- `tools/` — the generator itself (`build.mjs`, `templates.mjs`, `markdown.mjs`, `serve.mjs`).
  You shouldn't need to touch these for routine content updates.
- `dist/` — build output. Never edit directly; it's regenerated on every build.

## How to add a project

Create a new file at `content/projects/<slug>.md` with JSON frontmatter and a Markdown body.
Copy an existing file (e.g. `content/projects/churn-early-warning.md`) as a template, fill in
the fields, then commit and push. The project automatically appears on the home page (if
`"featured": true`) and gets its own page at `/projects/<slug>/`.

## How to update your résumé

Replace `assets/resume.pdf` with your real PDF, keeping the same filename so the download link
never breaks.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs `node tools/build.mjs`
(no dependency installation) and publishes `dist/` to GitHub Pages. Enable
**Settings → Pages → Source: GitHub Actions** once, and every push after that deploys
automatically. See `PLAN.md` section 8 for full details and custom-domain instructions.